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

export default Sidebar
