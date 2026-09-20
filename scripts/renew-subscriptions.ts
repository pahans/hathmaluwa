import prisma from '../lib/prisma'
import { sendSubscription } from '../lib/websub/subscribe'

// Renews any WebSub subscription whose lease expires within the next 48h.
// Re-sending 'subscribe' to the same hub/topic/callback renews the lease per
// the WebSub spec; the hub will re-verify via a GET challenge as usual.
const RENEWAL_WINDOW_MS = 48 * 60 * 60 * 1000

async function main() {
  const blogs = await prisma.blog.findMany({
    where: {
      hubUrl: { not: null },
      feedUrl: { not: null },
      subscriptionSecret: { not: null },
      leaseExpiresAt: { lt: new Date(Date.now() + RENEWAL_WINDOW_MS) },
    },
  })

  console.log(`Found ${blogs.length} subscription(s) due for renewal.`)

  for (const blog of blogs) {
    try {
      await sendSubscription({
        hubUrl: blog.hubUrl!,
        topicUrl: blog.feedUrl!,
        blogId: blog.id,
        secret: blog.subscriptionSecret!,
        mode: 'subscribe',
      })
      console.log(`Renewal requested for ${blog.url}.`)
    } catch (error) {
      console.error(`Renewal failed for ${blog.url}:`, error)
      await prisma.blog.update({ where: { id: blog.id }, data: { subscriptionStatus: 'expiring' } })
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
