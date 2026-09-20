import prisma from '../../../../lib/prisma'
import { parseFeed } from '../../../../lib/websub/parseFeed'
import { verifySignature } from '../../../../lib/websub/verifySignature'

// GET: hub verification challenge, sent when we subscribe/unsubscribe or a
// lease is about to expire. We must echo back hub.challenge if the topic
// matches the blog this callback URL was registered for.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const blogId = searchParams.get('blogId')
  const mode = searchParams.get('hub.mode')
  const topic = searchParams.get('hub.topic')
  const challenge = searchParams.get('hub.challenge')
  const leaseSeconds = searchParams.get('hub.lease_seconds')

  if (!blogId || !challenge) {
    return new Response('Bad request', { status: 400 })
  }

  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  if (!blog || !topic || blog.feedUrl !== topic) {
    return new Response('Not found', { status: 404 })
  }

  if (mode === 'unsubscribe') {
    await prisma.blog.update({
      where: { id: blogId },
      data: { subscriptionStatus: 'failed', leaseExpiresAt: null },
    })
  } else {
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        subscriptionStatus: 'active',
        lastVerifiedAt: new Date(),
        leaseExpiresAt: leaseSeconds
          ? new Date(Date.now() + Number(leaseSeconds) * 1000)
          : blog.leaseExpiresAt,
      },
    })
  }

  return new Response(challenge, { status: 200 })
}

// POST: content distribution. Body is the updated feed; verify it was really
// sent by the hub we subscribed to before trusting any of it.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const blogId = searchParams.get('blogId')
  if (!blogId) return new Response('Bad request', { status: 400 })

  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  if (!blog || !blog.subscriptionSecret) return new Response('Not found', { status: 404 })

  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature')

  if (!verifySignature(rawBody, signature, blog.subscriptionSecret)) {
    return new Response('Invalid signature', { status: 403 })
  }

  let entries
  try {
    entries = parseFeed(rawBody)
  } catch {
    return new Response('Unparseable feed', { status: 400 })
  }

  await Promise.all(
    entries.map((entry) =>
      prisma.blogPost.upsert({
        where: { url: entry.url },
        create: {
          blogId: blog.id,
          postTitle: entry.title,
          url: entry.url,
          timestamp: entry.timestamp,
          summary: entry.summary,
          thumbnail: entry.thumbnail,
        },
        update: {
          postTitle: entry.title,
          timestamp: entry.timestamp,
          summary: entry.summary,
          thumbnail: entry.thumbnail,
        },
      }),
    ),
  )

  return new Response(null, { status: 204 })
}
