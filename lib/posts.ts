import type { Blog, BlogPost } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import prisma from './prisma'

export type PostWithBlog = BlogPost & { blog: Blog }

// unstable_cache serializes its return value through JSON: a cache miss
// hands back the real Date from Prisma, but a cache hit hands back whatever
// survived that round trip, where Date becomes a string. Every exported
// function here re-hydrates timestamps via toPost() so callers always see a
// real Date regardless of hit or miss.
type SerializedPostWithBlog = Omit<PostWithBlog, 'timestamp'> & { timestamp: string | Date }

function toPost(post: SerializedPostWithBlog): PostWithBlog {
  return { ...post, timestamp: new Date(post.timestamp) }
}

// Shared tag for revalidateTag() - anything that changes which posts are
// visible (new posts landing, a blog being approved/banned/deleted) should
// invalidate this tag. 300s matches the /feed route's existing s-maxage.
export const POSTS_CACHE_TAG = 'posts'
const REVALIDATE_SECONDS = 300

const getLatestPostsCached = unstable_cache(
  async (limit: number): Promise<SerializedPostWithBlog[]> => {
    return prisma.blogPost.findMany({
      where: { blog: { approved: true, banned: false } },
      include: { blog: true },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  },
  ['latest-posts'],
  { tags: [POSTS_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
)

export async function getLatestPosts(limit: number): Promise<PostWithBlog[]> {
  const posts = await getLatestPostsCached(limit)
  return posts.map(toPost)
}

const searchPostsCached = unstable_cache(
  async (
    q: string,
    page: number,
    perPage: number,
  ): Promise<{ matches: SerializedPostWithBlog[]; totalPages: number; currentPage: number }> => {
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
  },
  ['search-posts'],
  { tags: [POSTS_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
)

export async function searchPosts(
  q: string,
  page: number,
  perPage: number,
): Promise<{ matches: PostWithBlog[]; totalPages: number; currentPage: number }> {
  const { matches, totalPages, currentPage } = await searchPostsCached(q, page, perPage)
  return { matches: matches.map(toPost), totalPages, currentPage }
}
