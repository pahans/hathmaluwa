import prisma from '../lib/prisma'
import { backfillBlog } from '../lib/websub/backfillBlog'

// One-off re-run after parseFeed.ts started filtering out icon/badge-sized
// thumbnails: re-fetches every blog's current feed and re-upserts its
// entries, which refreshes `thumbnail` (among other fields) using the new
// selection logic. Only touches posts still present in each blog's live
// feed - posts that have already scrolled off the feed keep whatever
// thumbnail they were stored with.
async function main() {
  const blogs = await prisma.blog.findMany({ where: { feedUrl: { not: null } } })

  let updated = 0
  let failed = 0

  for (const blog of blogs) {
    try {
      const count = await backfillBlog(blog)
      console.log(`OK    ${blog.name}: refreshed ${count} post(s)`)
      updated++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`ERROR ${blog.name}: ${message}`)
      failed++
    }
  }

  console.log(`\n${updated} blog(s) refreshed, ${failed} failed, out of ${blogs.length}.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
