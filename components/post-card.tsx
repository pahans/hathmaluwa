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

export default PostCard
