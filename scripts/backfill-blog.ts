import prisma from '../lib/prisma'
import { parseFeed } from '../lib/websub/parseFeed'
import type { Blog } from '@prisma/client'

// Fetches a blog's current feed and upserts its existing entries into
// blog_posts, so a newly onboarded blog isn't empty until its next publish.
// Uses the same upsert-by-url semantics as the webhook, so re-running is safe.
export async function backfillBlog(blog: Pick<Blog, 'id' | 'feedUrl'>): Promise<number> {
  if (!blog.feedUrl) throw new Error(`Blog ${blog.id} has no feedUrl to backfill from`)

  const res = await fetch(blog.feedUrl)
  if (!res.ok) throw new Error(`Failed to fetch feed ${blog.feedUrl}: ${res.status}`)

  const entries = parseFeed(await res.text())

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

  return entries.length
}

async function main() {
  const blogUrl = process.argv[2]
  if (!blogUrl) {
    console.error('Usage: pnpm backfill-blog <blog-url>')
    process.exit(1)
  }

  const blog = await prisma.blog.findUnique({ where: { url: blogUrl } })
  if (!blog) throw new Error(`No Blog row found for ${blogUrl}. Run add-blog first.`)

  const count = await backfillBlog(blog)
  console.log(`Backfilled ${count} posts for ${blogUrl}.`)
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}
