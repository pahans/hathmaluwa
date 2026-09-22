import { relativeTime } from '../lib/relativeTime'
import { initialOf, toneFor } from '../lib/brand'
import { langOf } from '../lib/lang'
import Thumb from './thumb'

type PostWithBlog = {
  id: string
  url: string
  postTitle: string
  timestamp: Date
  summary: string | null
  thumbnail: string | null
  blog: { name: string; url: string }
}

function PostCard({ post }: { post: PostWithBlog }) {
  return (
    <article className="hm-post">
      <div>
        <div className="hm-byline">
          <span className={`hm-avatar hm-a-${toneFor(post.blog.name)}`} aria-hidden="true">
            {initialOf(post.blog.name)}
          </span>
          <a className="hm-blog" href={post.blog.url} target="_blank" rel="noopener noreferrer" lang={langOf(post.blog.name)}>
            {post.blog.name}
          </a>
          <span className="hm-when">
            ·{' '}
            <time dateTime={post.timestamp.toISOString()} suppressHydrationWarning>
              {relativeTime(post.timestamp)}
            </time>
          </span>
        </div>

        <h2 className="hm-title" lang={langOf(post.postTitle)}>
          <a href={post.url} target="_blank" rel="noopener noreferrer">
            {post.postTitle}
          </a>
        </h2>

        {post.summary && (
          <p className="hm-excerpt" lang={langOf(post.summary)}>
            {post.summary}
          </p>
        )}
      </div>

      <Thumb src={post.thumbnail} seed={post.blog.name} />
    </article>
  )
}

export function PostCardSkeleton() {
  return (
    <article className="hm-post" aria-hidden="true">
      <div>
        <div className="hm-byline">
          <span className="hm-avatar hm-skel" />
          <span className="hm-skel hm-skel-line" style={{ width: 120, height: 13 }} />
        </div>

        <div className="hm-skel hm-skel-line" style={{ width: '70%', height: 22, margin: 'var(--space-2) 0 var(--space-1)' }} />

        <div className="hm-skel hm-skel-line" style={{ width: '100%', height: 16, marginBottom: 6 }} />
        <div className="hm-skel hm-skel-line" style={{ width: '92%', height: 16, marginBottom: 6 }} />
        <div className="hm-skel hm-skel-line" style={{ width: '55%', height: 16 }} />
      </div>

      <div className="hm-thumb hm-skel" />
    </article>
  )
}

export default PostCard
