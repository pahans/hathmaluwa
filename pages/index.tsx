import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import type { Blog, BlogPost } from '@prisma/client'
import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PostCard from '../components/post-card'
import Tagline from '../components/tagline'
import prisma from '../lib/prisma'

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
}

export default function Home({ posts, recentPosts, lastWeekPosts, query }: HomeProps) {
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
        </section>

        <Sidebar recentPosts={recentPosts} lastWeekPosts={lastWeekPosts} />
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ query }) => {
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''

  const latest = await prisma.blogPost.findMany({
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    take: 30,
  })

  // A search replaces the feed only. The popular-posts sidebar always draws from the latest posts.
  const matches = q
    ? await prisma.blogPost.findMany({
        where: {
          OR: [
            { postTitle: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { blog: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: { blog: true },
        orderBy: { timestamp: 'desc' },
        take: 30,
      })
    : latest

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
    },
  }
}
