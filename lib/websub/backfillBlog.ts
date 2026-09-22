import type { Blog } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import prisma from '../prisma'
import { POSTS_CACHE_TAG } from '../posts'
import { parseFeed } from './parseFeed'
import { safeFetch } from './safeFetch'

// Fetches a blog's current feed and upserts its existing entries into
// blog_posts, so a newly onboarded blog isn't empty until its next publish.
// Uses the same upsert-by-url semantics as the webhook, so re-running is safe.
export async function backfillBlog(blog: Pick<Blog, 'id' | 'feedUrl'>): Promise<number> {
  if (!blog.feedUrl) throw new Error(`Blog ${blog.id} has no feedUrl to backfill from`)

  const res = await safeFetch(blog.feedUrl)
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

  if (entries.length > 0) revalidateTag(POSTS_CACHE_TAG, 'max')

  return entries.length
}
