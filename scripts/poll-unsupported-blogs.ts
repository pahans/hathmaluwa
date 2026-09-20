import prisma from '../lib/prisma'
import { backfillBlog } from './backfill-blog'

// Blogs whose feed has no WebSub hub (subscriptionStatus 'unsupported') never
// get a push from the callback route or scripts/renew-subscriptions.ts, so
// this periodically re-fetches their feed and upserts whatever's new -
// reusing the same upsert-by-url logic as the webhook and backfill script.
async function main() {
  const blogs = await prisma.blog.findMany({
    where: { subscriptionStatus: 'unsupported', feedUrl: { not: null } },
  })

  console.log(`Polling ${blogs.length} unsupported blog(s).`)

  for (const blog of blogs) {
    try {
      const count = await backfillBlog({ id: blog.id, feedUrl: blog.feedUrl! })
      await prisma.blog.update({ where: { id: blog.id }, data: { lastPolledAt: new Date() } })
      console.log(`Polled ${blog.url}: upserted ${count} entries.`)
    } catch (error) {
      console.error(`Poll failed for ${blog.url}:`, error)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
