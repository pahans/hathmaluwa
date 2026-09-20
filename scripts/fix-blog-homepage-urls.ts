import { XMLParser } from 'fast-xml-parser'
import prisma from '../lib/prisma'
import { safeFetch } from '../lib/websub/safeFetch'
import { homepageUrlOf } from '../lib/websub/homepageUrl'

// One-off repair for blogs onboarded by the old bulk-add-blogs.ts, which
// stored the feed URL in blog.url (the column meant to be the blog's
// homepage) instead of deriving the real homepage from the feed. Affected
// rows have url === feedUrl; this re-derives the homepage from each one's
// feed and updates url, leaving feedUrl untouched.
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

async function main() {
  const dryRun = !process.argv.includes('--apply')

  const affected = await prisma.blog.findMany({
    where: { feedUrl: { not: null } },
  })
  const candidates = affected.filter((blog) => blog.url === blog.feedUrl)

  if (candidates.length === 0) {
    console.log('No blogs found with url === feedUrl.')
    return
  }

  for (const blog of candidates) {
    try {
      const res = await safeFetch(blog.feedUrl as string)
      if (!res.ok) throw new Error(`Failed to fetch ${blog.feedUrl}: ${res.status}`)
      const doc = parser.parse(await res.text())
      const homepageUrl = homepageUrlOf(doc, blog.feedUrl as string)

      if (homepageUrl === blog.url) {
        console.log(`SKIP  ${blog.name}: no homepage <link> found in feed, leaving as-is`)
        continue
      }

      const clash = await prisma.blog.findUnique({ where: { url: homepageUrl } })
      if (clash && clash.id !== blog.id) {
        console.log(`SKIP  ${blog.name}: ${homepageUrl} already used by another blog row`)
        continue
      }

      console.log(`${dryRun ? 'WOULD FIX' : 'FIX'}  ${blog.name}: ${blog.url} -> ${homepageUrl}`)
      if (!dryRun) {
        await prisma.blog.update({ where: { id: blog.id }, data: { url: homepageUrl } })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`ERROR ${blog.name}: ${message}`)
    }
  }

  if (dryRun) {
    console.log('\nDry run only - rerun with --apply to write these changes.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
