import Parser from 'rss-parser'
import prisma from '../lib/prisma'
import { safeFetch } from '../lib/websub/safeFetch'
import { homepageUrlFromFeed } from '../lib/websub/homepageUrl'

// One-off repair for blogs whose url column (meant to be the blog's
// homepage, per the admin panel and public site) actually holds a feed URL.
// This happens whenever a feed URL was passed straight into onboardBlog
// instead of the real homepage - not just when url === feedUrl (a blog can
// be re-subscribed and get a *different* feedUrl - e.g. Blogger's discovery
// rewriting it to a "self" link - while url keeps the original feed URL it
// was created with). So rather than trust feedUrl, this fetches each blog's
// own url and checks whether the response is itself a feed.
const parser = new Parser()

// Same "is this XML/a feed" heuristic discoverFeedUrl uses to decide
// whether a URL is already a feed rather than an HTML page.
function looksLikeFeed(contentType: string, body: string): boolean {
  return contentType.includes('xml') || /^\s*(<\?xml|<feed[\s>]|<rss[\s>])/i.test(body)
}

async function main() {
  const dryRun = !process.argv.includes('--apply')

  const blogs = await prisma.blog.findMany()

  let fixed = 0
  for (const blog of blogs) {
    try {
      const res = await safeFetch(blog.url)
      if (!res.ok) {
        console.log(`ERROR ${blog.name}: failed to fetch ${blog.url}: ${res.status}`)
        continue
      }

      const contentType = res.headers.get('content-type') ?? ''
      const body = await res.text()
      if (!looksLikeFeed(contentType, body)) continue // url is already a real homepage

      const feed = await parser.parseString(body)
      const homepageUrl = homepageUrlFromFeed(feed, blog.url)

      if (homepageUrl === blog.url) {
        console.log(`SKIP  ${blog.name}: url is a feed, but it has no homepage <link>`)
        continue
      }

      const clash = await prisma.blog.findUnique({ where: { url: homepageUrl } })
      if (clash && clash.id !== blog.id) {
        console.log(`SKIP  ${blog.name}: ${homepageUrl} already used by another blog row`)
        continue
      }

      console.log(`${dryRun ? 'WOULD FIX' : 'FIX'}  ${blog.name}: ${blog.url} -> ${homepageUrl}`)
      fixed++
      if (!dryRun) {
        await prisma.blog.update({ where: { id: blog.id }, data: { url: homepageUrl } })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`ERROR ${blog.name}: ${message}`)
    }
  }

  console.log(`\n${fixed} row(s) ${dryRun ? 'would be' : 'were'} fixed out of ${blogs.length} checked.`)
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
