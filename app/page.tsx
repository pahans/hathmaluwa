import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PostCard from '../components/post-card'
import Pagination from '../components/pagination'
import Tagline from '../components/tagline'
import { getLatestPosts, searchPosts } from '../lib/posts'

const POSTS_PER_PAGE = 10

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : ''
  const requestedPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1

  const latest = await getLatestPosts(30)

  // A search replaces the feed only. The popular-posts sidebar always draws from the latest posts.
  // Unapproved blogs (pending /signup review) and banned blogs never show up here or in search.
  const { matches, totalPages, currentPage } = await searchPosts(q, requestedPage, POSTS_PER_PAGE)

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
