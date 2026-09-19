import { relativeTime } from '../lib/relativeTime'

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
    <article className="mb-6">
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gray-600 text-white text-lg font-semibold px-4 py-3 rounded-t hover:bg-gray-700"
      >
        {post.postTitle}
      </a>
      <div className="border border-t-0 border-gray-200 rounded-b p-4">
        <div className="text-sm mb-3">
          <a href={post.blog.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
            {post.blog.name}
          </a>
          <span className="text-gray-400"> | {relativeTime(post.timestamp)}</span>
        </div>
        <div className="flex gap-3 items-start">
          {post.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.thumbnail}
              alt=""
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          )}
          {post.summary && (
            <p className="text-gray-700 text-sm leading-relaxed">{post.summary}</p>
          )}
        </div>
      </div>
    </article>
  )
}

export default PostCard
