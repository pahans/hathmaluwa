/**
 * Manual, self-cleaning integration check for the WebSub pipeline. Not part
 * of CI (it writes to the real database, briefly, then deletes what it
 * created) — run by hand with `pnpm test:websub-pipeline` after touching
 * lib/websub/* or the callback route.
 *
 * It spins up a tiny local HTTP server to play the role of "blog feed" and
 * "hub", then exercises: discoverHub -> sendSubscription (request shape) ->
 * the callback route's GET challenge -> the callback route's POST content
 * delivery (good + bad signature) -> DB state, calling the real route
 * handlers and Prisma client in-process.
 */
import http, { type IncomingMessage, type ServerResponse } from 'http'
import type { AddressInfo } from 'net'
import { createHmac, randomUUID } from 'crypto'
import prisma from '../lib/prisma'
import { discoverFeedUrl, discoverHub } from '../lib/websub/discover'
import { generateSubscriptionSecret } from '../lib/websub/secret'
import { sendSubscription, callbackUrl } from '../lib/websub/subscribe'
import { GET as callbackGet, POST as callbackPost } from '../app/api/websub/callback/route'

function feedXml(hubUrl: string, selfUrl: string, entries: { url: string; title: string; pubDate: string }[]) {
  return `<?xml version="1.0"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mock Blog</title>
    <atom:link rel="hub" href="${hubUrl}" />
    <atom:link rel="self" href="${selfUrl}" type="application/rss+xml" />
    ${entries
      .map(
        (e) => `<item>
      <title>${e.title}</title>
      <link>${e.url}</link>
      <pubDate>${e.pubDate}</pubDate>
      <description>${e.title} description</description>
    </item>`,
      )
      .join('\n')}
  </channel>
</rss>`
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`)
}

async function main() {
  const receivedHubRequests: URLSearchParams[] = []

  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'GET' && req.url?.startsWith('/feed')) {
      res.writeHead(200, { 'content-type': 'application/rss+xml' })
      res.end(currentFeedXml)
      return
    }
    if (req.method === 'POST' && req.url?.startsWith('/hub')) {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => {
        receivedHubRequests.push(new URLSearchParams(body))
        res.writeHead(202)
        res.end()
      })
      return
    }
    res.writeHead(404)
    res.end()
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port
  const origin = `http://127.0.0.1:${port}`
  const feedUrl = `${origin}/feed`
  const hubUrl = `${origin}/hub`
  const existingPostUrl = `${origin}/posts/existing`
  let currentFeedXml = feedXml(hubUrl, feedUrl, [
    { url: existingPostUrl, title: 'Existing post', pubDate: new Date(Date.now() - 3600_000).toUTCString() },
  ])

  const testBlogUrl = `${origin}/`
  let blog = await prisma.blog.create({
    data: {
      url: testBlogUrl,
      name: 'WebSub Pipeline Test Blog',
      author: 'Test Script',
      authorEmail: 'test@example.com',
    },
  })

  try {
    // 1. Discovery
    const discoveredFeedUrl = await discoverFeedUrl(feedUrl)
    assert(discoveredFeedUrl === feedUrl, `discoverFeedUrl should return ${feedUrl}, got ${discoveredFeedUrl}`)

    const discovered = await discoverHub(discoveredFeedUrl)
    assert(discovered.hubUrl === hubUrl, `discoverHub should find hub ${hubUrl}, got ${discovered.hubUrl}`)
    assert(discovered.feedUrl === feedUrl, `discoverHub should find self ${feedUrl}, got ${discovered.feedUrl}`)
    console.log('[ok] discoverFeedUrl / discoverHub')

    const secret = generateSubscriptionSecret()
    blog = await prisma.blog.update({
      where: { id: blog.id },
      data: { feedUrl: discovered.feedUrl, hubUrl: discovered.hubUrl, subscriptionSecret: secret },
    })

    // 2. Subscribe request shape
    await sendSubscription({ hubUrl, topicUrl: feedUrl, blogId: blog.id, secret, mode: 'subscribe' })
    assert(receivedHubRequests.length === 1, 'hub should have received exactly one subscribe request')
    const sub = receivedHubRequests[0]
    assert(sub.get('hub.mode') === 'subscribe', 'hub.mode should be subscribe')
    assert(sub.get('hub.topic') === feedUrl, 'hub.topic should match the feed url')
    assert(sub.get('hub.callback') === callbackUrl(blog.id), 'hub.callback should match our callback url')
    assert(sub.get('hub.secret') === secret, 'hub.secret should match the generated secret')
    console.log('[ok] sendSubscription request shape')

    // 3. GET verification challenge
    const challenge = randomUUID()
    const getUrl = `http://localhost/api/websub/callback?blogId=${blog.id}&hub.mode=subscribe&hub.topic=${encodeURIComponent(feedUrl)}&hub.challenge=${challenge}&hub.lease_seconds=864000`
    const getRes = await callbackGet(new Request(getUrl))
    assert(getRes.status === 200, `GET challenge should return 200, got ${getRes.status}`)
    const echoed = await getRes.text()
    assert(echoed === challenge, `GET challenge should echo ${challenge}, got ${echoed}`)

    const afterVerify = await prisma.blog.findUniqueOrThrow({ where: { id: blog.id } })
    assert(afterVerify.subscriptionStatus === 'active', 'subscriptionStatus should be active after verification')
    assert(afterVerify.leaseExpiresAt !== null, 'leaseExpiresAt should be set after verification')
    console.log('[ok] GET verification challenge')

    // 4. POST content delivery with a bad signature -> rejected, no writes
    const newPostUrl = `${origin}/posts/new`
    currentFeedXml = feedXml(hubUrl, feedUrl, [
      { url: newPostUrl, title: 'Brand new post', pubDate: new Date().toUTCString() },
    ])
    const badPostRes = await callbackPost(
      new Request(`http://localhost/api/websub/callback?blogId=${blog.id}`, {
        method: 'POST',
        headers: { 'x-hub-signature': 'sha1=deadbeef' },
        body: currentFeedXml,
      }),
    )
    assert(badPostRes.status === 403, `bad signature should be rejected with 403, got ${badPostRes.status}`)
    const noPost = await prisma.blogPost.findUnique({ where: { url: newPostUrl } })
    assert(noPost === null, 'a bad signature must not create a blog_posts row')
    console.log('[ok] POST with bad signature rejected')

    // 5. POST content delivery with a valid signature -> ingested
    const signature = 'sha1=' + createHmac('sha1', secret).update(currentFeedXml).digest('hex')
    const goodPostRes = await callbackPost(
      new Request(`http://localhost/api/websub/callback?blogId=${blog.id}`, {
        method: 'POST',
        headers: { 'x-hub-signature': signature },
        body: currentFeedXml,
      }),
    )
    assert(goodPostRes.status === 204, `valid signature should return 204, got ${goodPostRes.status}`)
    const ingested = await prisma.blogPost.findUnique({ where: { url: newPostUrl } })
    assert(ingested !== null, 'a valid signature must upsert the new post')
    assert(ingested!.postTitle === 'Brand new post', 'ingested post should have the right title')
    console.log('[ok] POST with valid signature ingests the new post')

    // 6. Replay the same delivery -> upsert, not a duplicate
    const replayRes = await callbackPost(
      new Request(`http://localhost/api/websub/callback?blogId=${blog.id}`, {
        method: 'POST',
        headers: { 'x-hub-signature': signature },
        body: currentFeedXml,
      }),
    )
    assert(replayRes.status === 204, 'replayed delivery should still return 204')
    const countAfterReplay = await prisma.blogPost.count({ where: { blogId: blog.id } })
    assert(countAfterReplay === 1, `replay must not duplicate rows, found ${countAfterReplay}`)
    console.log('[ok] replayed delivery does not duplicate')

    console.log('\nAll WebSub pipeline checks passed.')
  } finally {
    await prisma.blogPost.deleteMany({ where: { blogId: blog.id } })
    await prisma.blog.delete({ where: { id: blog.id } })
    server.close()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
