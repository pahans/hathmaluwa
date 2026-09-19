import type { BlogPost } from '@prisma/client'

type SidebarPost = Pick<BlogPost, 'id' | 'postTitle' | 'url'>

function PostList({ posts }: { posts: SidebarPost[] }) {
  return (
    <ul className="space-y-3 mb-6">
      {posts.map((post) => (
        <li key={post.id}>
          <a href={post.url} className="text-sm text-gray-700 hover:text-teal-600" target="_blank" rel="noopener noreferrer">
            {post.postTitle}
          </a>
        </li>
      ))}
    </ul>
  )
}

function Sidebar({
  recentPosts,
  lastWeekPosts,
}: {
  recentPosts: SidebarPost[]
  lastWeekPosts: SidebarPost[]
}) {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="border border-gray-200 rounded p-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded bg-orange-500" />
          <span className="text-xl font-extrabold text-gray-800">
            hath<span className="text-orange-500">maluwa</span>
          </span>
        </div>
      </div>

      <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
        Popular Posts - Today/Yesterday
      </h2>
      <PostList posts={recentPosts} />

      <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
        Popular Posts - Last Week
      </h2>
      <PostList posts={lastWeekPosts} />
    </aside>
  )
}

export default Sidebar
