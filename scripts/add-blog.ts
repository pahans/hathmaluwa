import prisma from '../lib/prisma'
import { discoverFeedUrl, discoverHub } from '../lib/websub/discover'
import { generateSubscriptionSecret } from '../lib/websub/secret'
import { sendSubscription } from '../lib/websub/subscribe'
import { backfillBlog } from './backfill-blog'

// Onboards a blog: discovers its feed + WebSub hub, subscribes our callback,
// and does a one-time backfill so the feed isn't empty until the next push.
async function addBlog(blogUrl: string, name: string, author: string, authorEmail: string) {
  const blog = await prisma.blog.upsert({
    where: { url: blogUrl },
    update: { name, author, authorEmail },
    create: { url: blogUrl, name, author, authorEmail },
  })

  const feedUrl = await discoverFeedUrl(blogUrl)
  const { feedUrl: topicUrl, hubUrl } = await discoverHub(feedUrl)
  const subscriptionSecret = generateSubscriptionSecret()

  await prisma.blog.update({
    where: { id: blog.id },
    data: { feedUrl: topicUrl, hubUrl, subscriptionSecret, subscriptionStatus: 'pending' },
  })

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
