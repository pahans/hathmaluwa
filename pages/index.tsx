import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import type { Blog, BlogPost } from '@prisma/client'
import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PostCard from '../components/post-card'
import Pagination from '../components/pagination'
import Tagline from '../components/tagline'
import prisma from '../lib/prisma'

const POSTS_PER_PAGE = 10

type SerializedPost = Omit<BlogPost, 'timestamp' | 'createdAt' | 'updatedAt' | 'blog'> & {
  timestamp: string
  createdAt: string
  updatedAt: string
  blog: Omit<Blog, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }
}

type HomeProps = {
  posts: SerializedPost[]
  recentPosts: SerializedPost[]
  lastWeekPosts: SerializedPost[]
  query: string
  currentPage: number
  totalPages: number
}

export default function Home({ posts, recentPosts, lastWeekPosts, query, currentPage, totalPages }: HomeProps) {
  const posts_ = posts.map((post) => ({ ...post, timestamp: new Date(post.timestamp) }))

  return (
    <Layout>
      <Head>
        <title>Hathmaluwa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="hm-page">
        <section className="hm-feed" aria-labelledby="hm-feed-title">
          <div className="hm-feed-head">
            <h1 id="hm-feed-title">{query ? `Results for “${query}”` : 'Latest posts'}</h1>
            <Tagline />
          </div>

          {posts_.length > 0 ? (
            <div className="hm-posts">
              {posts_.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="hm-empty" role="status">
              {query ? 'No posts match your search. Try a shorter word.' : 'No posts yet.'}
            </p>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} query={query} />
        </section>

        <Sidebar recentPosts={recentPosts} lastWeekPosts={lastWeekPosts} />
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ query }) => {
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const requestedPage = typeof query.page === 'string' ? parseInt(query.page, 10) : 1

  const latest = await prisma.blogPost.findMany({
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    take: 30,
  })

  // A search replaces the feed only. The popular-posts sidebar always draws from the latest posts.
  const where = q
    ? {
        OR: [
          { postTitle: { contains: q, mode: 'insensitive' as const } },
          { summary: { contains: q, mode: 'insensitive' as const } },
          { blog: { name: { contains: q, mode: 'insensitive' as const } } },
        ],
      }
    : {}

  const matchCount = await prisma.blogPost.count({ where })
  const totalPages = Math.max(1, Math.ceil(matchCount / POSTS_PER_PAGE))
  const currentPage = Math.min(Math.max(requestedPage || 1, 1), totalPages)

  const matches = await prisma.blogPost.findMany({
    where,
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  })

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const recent = latest.filter((post) => now - post.timestamp.getTime() <= 2 * oneDayMs)
  const lastWeek = latest.filter((post) => {
    const age = now - post.timestamp.getTime()
    return age > 2 * oneDayMs && age <= 7 * oneDayMs
  })

  return {
    props: {
      posts: JSON.parse(JSON.stringify(matches)),
      recentPosts: JSON.parse(JSON.stringify(recent.slice(0, 10))),
      lastWeekPosts: JSON.parse(JSON.stringify(lastWeek.slice(0, 10))),
      query: q,
      currentPage,
      totalPages,
    },
  }
}
