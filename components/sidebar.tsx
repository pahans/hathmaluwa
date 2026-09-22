import Link from 'next/link'
import type { BlogPost } from '@prisma/client'
import { langOf } from '../lib/lang'

type SidebarPost = Pick<BlogPost, 'id' | 'postTitle' | 'url'> & { blog?: { name: string } }

function PopularList({ heading, note, posts }: { heading: string; note: string; posts: SidebarPost[] }) {
  if (posts.length === 0) return null

  return (
    <section>
      <h2>
        {heading} <span className="hm-sub">· {note}</span>
      </h2>
      <ol className="hm-pop">
        {posts.map((post, index) => (
          <li key={post.id}>
            <span className="hm-rank">{index + 1}</span>
            <div>
              {post.blog && (
                <div className="hm-who">
                  <b>{post.blog.name}</b>
                </div>
              )}
              <a className="hm-t" lang={langOf(post.postTitle)} href={post.url} target="_blank" rel="noopener noreferrer">
                {post.postTitle}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Sidebar({ recentPosts, lastWeekPosts }: { recentPosts: SidebarPost[]; lastWeekPosts: SidebarPost[] }) {
  return (
    <aside className="hm-side" aria-label="Popular posts and links">
      <PopularList heading="Popular posts" note="today / yesterday" posts={recentPosts} />
      <PopularList heading="Popular posts" note="last week" posts={lastWeekPosts} />

      <section className="hm-card">
        <h3>Add Your Blog?</h3>
        <p>Submit your blog and readers can find every new post here.</p>
        <Link className="hm-btn" href="/signup">
          Add Your Blog
        </Link>
      </section>
    </aside>
  )
}

function PopularListSkeleton({ rows }: { rows: number }) {
  return (
    <section aria-hidden="true">
      <div className="hm-skel hm-skel-line" style={{ width: 150, height: 14, marginBottom: 'var(--space-3)' }} />
      <ol className="hm-pop">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i}>
            <span className="hm-skel" style={{ width: 22, height: 24, borderRadius: 'var(--radius-sm)' }} />
            <div>
              <div className="hm-skel hm-skel-line" style={{ width: '90%', height: 16 }} />
              <div className="hm-skel hm-skel-line" style={{ width: '65%', height: 16, marginTop: 6 }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function SidebarSkeleton() {
  return (
    <aside className="hm-side" aria-label="Popular posts and links">
      <PopularListSkeleton rows={4} />
      <PopularListSkeleton rows={4} />

      <section className="hm-card">
        <h3>Add Your Blog?</h3>
        <p>Submit your blog and readers can find every new post here.</p>
        <Link className="hm-btn" href="/signup">
          Add Your Blog
        </Link>
      </section>
    </aside>
  )
}

export default Sidebar
