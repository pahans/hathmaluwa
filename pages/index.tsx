import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import type { Blog, BlogPost } from '@prisma/client'
import NavBar from '../components/nav'
import Sidebar from '../components/sidebar'
import PostCard from '../components/post-card'
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
}

export default function Home({ posts, recentPosts, lastWeekPosts }: HomeProps) {
  const posts_ = posts.map((post) => ({ ...post, timestamp: new Date(post.timestamp) }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Hathmaluwa</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main className="container mx-auto flex flex-col lg:flex-row gap-6 px-4 py-6">
        <Sidebar recentPosts={recentPosts} lastWeekPosts={lastWeekPosts} />

        <section className="flex-grow max-w-3xl">
          {posts_.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts_.length === 0 && (
            <p className="text-gray-500">No posts yet.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const posts = await prisma.blogPost.findMany({
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    take: 30,
  })

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const recent = posts.filter((post) => now - post.timestamp.getTime() <= 2 * oneDayMs)
  const lastWeek = posts.filter((post) => {
    const age = now - post.timestamp.getTime()
    return age > 2 * oneDayMs && age <= 7 * oneDayMs
  })

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      recentPosts: JSON.parse(JSON.stringify(recent.slice(0, 10))),
      lastWeekPosts: JSON.parse(JSON.stringify(lastWeek.slice(0, 10))),
    },
  }
}
