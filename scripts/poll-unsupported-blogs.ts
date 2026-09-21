import prisma from '../lib/prisma'
import { backfillBlog } from '../lib/websub/backfillBlog'

// Blogs whose feed has no WebSub hub (subscriptionStatus 'unsupported') never
// get a push from the callback route or scripts/renew-subscriptions.ts, so
// this periodically re-fetches their feed and upserts whatever's new -
// reusing the same upsert-by-url logic as the webhook and backfill script.
//
// Each poll is a full network round trip (DNS + feed fetch), so running them
// one at a time makes total runtime scale linearly with blog count. These are
// independent per-blog operations, so a bounded pool of workers lets multiple
// fetches be in flight at once without hammering any single host too hard.
const CONCURRENCY = 10

// A blog whose feed keeps failing (dead domain, permanently broken feed) would
// otherwise be retried forever on every run. After this many consecutive
// failures it's marked 'inactive', which drops it out of the 'unsupported'
// query below so future runs stop wasting time on it.
const MAX_POLL_FAILURES = 3

async function main() {
  const blogs = await prisma.blog.findMany({
    where: { subscriptionStatus: 'unsupported', feedUrl: { not: null } },
  })

  console.log(`Polling ${blogs.length} unsupported blog(s).`)

  let next = 0
  async function worker() {
    while (next < blogs.length) {
      const blog = blogs[next++]
      try {
        const count = await backfillBlog({ id: blog.id, feedUrl: blog.feedUrl! })
        await prisma.blog.update({
          where: { id: blog.id },
          data: { lastPolledAt: new Date(), pollFailureCount: 0 },
        })
        console.log(`Polled ${blog.url}: upserted ${count} entries.`)
      } catch (error) {
        console.error(`Poll failed for ${blog.url}:`, error)
        const failureCount = blog.pollFailureCount + 1
        const giveUp = failureCount >= MAX_POLL_FAILURES
        await prisma.blog.update({
          where: { id: blog.id },
          data: {
            pollFailureCount: failureCount,
            ...(giveUp && { subscriptionStatus: 'inactive' }),
          },
        })
        if (giveUp) {
          console.error(`${blog.url} failed ${failureCount} times in a row, marking inactive.`)
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, blogs.length) }, worker))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
