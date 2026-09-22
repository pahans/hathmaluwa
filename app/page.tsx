import { Suspense } from 'react'
import { connection } from 'next/server'
import Layout from '../components/layout'
import Sidebar, { SidebarSkeleton } from '../components/sidebar'
import PostCard, { PostCardSkeleton } from '../components/post-card'
import Pagination from '../components/pagination'
import Tagline from '../components/tagline'
import { getLatestPosts, searchPosts } from '../lib/posts'

const POSTS_PER_PAGE = 10
const FEED_SKELETON_ROWS = 6

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  return (
    <Layout>
      <main className="hm-page">
        <Suspense fallback={<FeedFallback />}>
          <FeedSection searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarSection />
        </Suspense>
      </main>
    </Layout>
  )
}

function FeedFallback() {
  return (
    <section className="hm-feed" aria-labelledby="hm-feed-title">
      <div className="hm-feed-head">
        <h1 id="hm-feed-title">Latest posts</h1>
        <Tagline />
      </div>

      <div className="hm-posts">
        {Array.from({ length: FEED_SKELETON_ROWS }, (_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}

async function FeedSection({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : ''
  const requestedPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1

  // A search replaces the feed only. The popular-posts sidebar always draws from the latest posts.
  // Unapproved blogs (pending /signup review) and banned blogs never show up here or in search.
  const { matches, totalPages, currentPage } = await searchPosts(q, requestedPage, POSTS_PER_PAGE)

  return (
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
  )
}

async function SidebarSection() {
  const latest = await getLatestPosts(30)

  // Bucketing by "now" needs to run per-request rather than being baked into
  // the cached post list, so defer to request time before reading it.
  await connection()
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const recentPosts = latest.filter((post) => now - post.timestamp.getTime() <= 2 * oneDayMs).slice(0, 10)
  const lastWeekPosts = latest
    .filter((post) => {
      const age = now - post.timestamp.getTime()
      return age > 2 * oneDayMs && age <= 7 * oneDayMs
    })
    .slice(0, 10)

  return <Sidebar recentPosts={recentPosts} lastWeekPosts={lastWeekPosts} />
}
