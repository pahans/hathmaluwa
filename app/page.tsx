import type { Metadata } from 'next'
import type { Blog, BlogPost } from '@prisma/client'
import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PostCard from '../components/post-card'
import Pagination from '../components/pagination'
import Tagline from '../components/tagline'
import prisma from '../lib/prisma'

export const metadata: Metadata = {
  title: 'Hathmaluwa',
}

const POSTS_PER_PAGE = 10

type PostWithBlog = BlogPost & { blog: Blog }

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : ''
  const requestedPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1

  const latest = await prisma.blogPost.findMany({
    where: { blog: { approved: true } },
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    take: 30,
  })

  // A search replaces the feed only. The popular-posts sidebar always draws from the latest posts.
  // Unapproved blogs (pending /signup review) never show up here or in search.
  const where = {
    blog: { approved: true },
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
  const totalPages = Math.max(1, Math.ceil(matchCount / POSTS_PER_PAGE))
  const currentPage = Math.min(Math.max(requestedPage || 1, 1), totalPages)

  const matches: PostWithBlog[] = await prisma.blogPost.findMany({
    where,
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  })

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const recentPosts = latest.filter((post) => now - post.timestamp.getTime() <= 2 * oneDayMs).slice(0, 10)
  const lastWeekPosts = latest
    .filter((post) => {
      const age = now - post.timestamp.getTime()
      return age > 2 * oneDayMs && age <= 7 * oneDayMs
    })
    .slice(0, 10)

  return (
    <Layout>
      <main className="hm-page">
        <section className="hm-feed" aria-labelledby="hm-feed-title">
          <div className="hm-feed-head">
            <h1 id="hm-feed-title">{q ? `Results for “${q}”` : 'Latest posts'}</h1>
            <Tagline />
          </div>

          {matches.length > 0 ? (
            <div className="hm-posts">
              {matches.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="hm-empty" role="status">
              {q ? 'No posts match your search. Try a shorter word.' : 'No posts yet.'}
            </p>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} query={q} />
        </section>

        <Sidebar recentPosts={recentPosts} lastWeekPosts={lastWeekPosts} />
      </main>
    </Layout>
  )
}
