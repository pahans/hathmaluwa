import prisma from '../lib/prisma'
import { safeFetch } from '../lib/websub/safeFetch'
import { authorOf } from '../lib/websub/feedAuthor'

// One-off repair for blogs onboarded by the old bulk-add-blogs.ts, which
// passed the feed's own title as both name AND author when it had nothing
// else to go on - so the admin panel's "author" column showed the blog's
// title as if it were a person's name. Candidates are rows where
// author === name, the signature that bug leaves behind. Re-fetches each
// one's feed and extracts a real byline (see feedAuthor.ts); falls back to
// "Unknown" when the feed genuinely carries no author, which is still more
// honest than repeating the title.
async function main() {
  const dryRun = !process.argv.includes('--apply')

  const blogs = await prisma.blog.findMany({ where: { feedUrl: { not: null } } })
  const candidates = blogs.filter((blog) => blog.author === blog.name)

  if (candidates.length === 0) {
    console.log('No blogs found with author === name.')
    return
  }

  let fixed = 0
  for (const blog of candidates) {
    try {
      const res = await safeFetch(blog.feedUrl as string)
      if (!res.ok) {
        console.log(`ERROR ${blog.name}: failed to fetch ${blog.feedUrl}: ${res.status}`)
        continue
      }

      const xml = await res.text()
      const author = (await authorOf(xml)) ?? 'Unknown'

      if (author === blog.author) {
        console.log(`SKIP  ${blog.name}: no better author found in feed`)
        continue
      }

      console.log(`${dryRun ? 'WOULD FIX' : 'FIX'}  ${blog.name}: "${blog.author}" -> "${author}"`)
      fixed++
      if (!dryRun) {
        await prisma.blog.update({ where: { id: blog.id }, data: { author } })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`ERROR ${blog.name}: ${message}`)
    }
  }

  console.log(`\n${fixed} row(s) ${dryRun ? 'would be' : 'were'} fixed out of ${candidates.length} candidates.`)
  if (dryRun) {
    console.log('Dry run only - rerun with --apply to write these changes.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
