import type { Blog, BlogPost } from '@prisma/client'
import { cacheLife, cacheTag } from 'next/cache'
import prisma from './prisma'

export type PostWithBlog = BlogPost & { blog: Blog }

// Shared tag for revalidateTag() - anything that changes which posts are
// visible (new posts landing, a blog being approved/banned/deleted) should
// invalidate this tag.
export const POSTS_CACHE_TAG = 'posts'

export async function getLatestPosts(limit: number): Promise<PostWithBlog[]> {
  'use cache'
  // expire must stay under 5 minutes so this is excluded from the build's
  // static shell (a "dynamic hole" resolved at request time instead) - at
  // next build there's no live DATABASE_URL, so it can't be prerendered.
  cacheLife({ revalidate: 60, expire: 240 })
  cacheTag(POSTS_CACHE_TAG)

  return prisma.blogPost.findMany({
    where: { blog: { approved: true, banned: false } },
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

// For app/not-found.tsx: prerendered at build time as part of the static
// 404 shell, so this needs a cacheLife long enough to be included in it
// (unlike getLatestPosts/searchPosts, which stay request-time). Missing or
// failing DB access degrades to an empty list rather than breaking the page.
export async function getFallbackRecentPosts(limit: number): Promise<PostWithBlog[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(POSTS_CACHE_TAG)

  if (!process.env.DATABASE_URL) return []

  try {
    return await prisma.blogPost.findMany({
      where: { blog: { approved: true, banned: false } },
      include: { blog: true },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  } catch {
    return []
  }
}

export async function searchPosts(
  q: string,
  page: number,
  perPage: number,
): Promise<{ matches: PostWithBlog[]; totalPages: number; currentPage: number }> {
  'use cache'
  // expire must stay under 5 minutes so this is excluded from the build's
  // static shell (a "dynamic hole" resolved at request time instead) - at
  // next build there's no live DATABASE_URL, so it can't be prerendered.
  cacheLife({ revalidate: 60, expire: 240 })
  cacheTag(POSTS_CACHE_TAG)

  const where = {
    blog: { approved: true, banned: false },
    ...(q
      ? {
          OR: [
            { postTitle: { contains: q, mode: 'insensitive' as const } },
            { summary: { contains: q, mode: 'insensitive' as const } },
            { blog: { name: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  }

  const matchCount = await prisma.blogPost.count({ where })
  const totalPages = Math.max(1, Math.ceil(matchCount / perPage))
  const currentPage = Math.min(Math.max(page || 1, 1), totalPages)

  const matches = await prisma.blogPost.findMany({
    where,
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    skip: (currentPage - 1) * perPage,
    take: perPage,
  })

  return { matches, totalPages, currentPage }
}
