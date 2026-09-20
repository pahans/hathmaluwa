import prisma from '../lib/prisma'
import { discoverFeedUrl, discoverHub, NoHubAdvertisedError } from '../lib/websub/discover'
import { generateSubscriptionSecret } from '../lib/websub/secret'
import { sendSubscription } from '../lib/websub/subscribe'
import { backfillBlog } from './backfill-blog'

// Onboards a blog: discovers its feed, and either subscribes to its WebSub
// hub, or - if it doesn't advertise one - marks it 'unsupported' so
// scripts/poll-unsupported-blogs.ts picks it up instead. Either way, does a
// one-time backfill so the feed isn't empty until the next update.
async function addBlog(blogUrl: string, name: string, author: string, authorEmail: string) {
  const blog = await prisma.blog.upsert({
    where: { url: blogUrl },
    update: { name, author, authorEmail },
    create: { url: blogUrl, name, author, authorEmail },
  })

  const feedUrl = await discoverFeedUrl(blogUrl)

  let topicUrl = feedUrl
  let hubUrl: string | null = null
  let subscriptionSecret: string | null = null

  try {
    const discovered = await discoverHub(feedUrl)
    topicUrl = discovered.feedUrl
    hubUrl = discovered.hubUrl
    subscriptionSecret = generateSubscriptionSecret()
  } catch (error) {
    if (!(error instanceof NoHubAdvertisedError)) throw error
    console.log(`${blogUrl}: no WebSub hub advertised, falling back to polling.`)
  }

  await prisma.blog.update({
    where: { id: blog.id },
    data: {
      feedUrl: topicUrl,
      hubUrl,
      subscriptionSecret,
      subscriptionStatus: hubUrl ? 'pending' : 'unsupported',
    },
  })

  if (hubUrl && subscriptionSecret) {
    try {
      await sendSubscription({
        hubUrl,
        topicUrl,
        blogId: blog.id,
        secret: subscriptionSecret,
        mode: 'subscribe',
      })
      console.log(`Subscribe request sent to ${hubUrl} for ${topicUrl}. Awaiting hub verification.`)
    } catch (error) {
      await prisma.blog.update({ where: { id: blog.id }, data: { subscriptionStatus: 'failed' } })
      throw error
    }
  }

  const backfilled = await backfillBlog({ id: blog.id, feedUrl: topicUrl })
  console.log(`Backfilled ${backfilled} existing posts for ${blogUrl}.`)
}

async function main() {
  const [blogUrl, name, author, authorEmail] = process.argv.slice(2)
  if (!blogUrl || !name || !author || !authorEmail) {
    console.error('Usage: pnpm add-blog <blog-url> <name> <author> <author-email>')
    process.exit(1)
  }

  await addBlog(blogUrl, name, author, authorEmail)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
