import type { Metadata } from 'next'
import Link from 'next/link'
import Layout from '../components/layout'
import ErrorArt from '../components/error-art'
import { langOf } from '../lib/lang'
import prisma from '../lib/prisma'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default async function NotFound() {
  const recentPosts = await prisma.blogPost.findMany({
    where: { blog: { approved: true, banned: false } },
    include: { blog: true },
    orderBy: { timestamp: 'desc' },
    take: 3,
  })

  return (
    <Layout>
      <main className="hm-err">
        <div className="hm-err-grid">
          <div className="hm-err-copy">
            <p className="hm-err-eyebrow">Error 404</p>
            <h1>
              <span lang="si">මේ පිටුව හොයාගන්න බැරි වුණා</span>
              <span className="hm-err-sub">Page not found</span>
            </h1>
            <p className="hm-err-text">
              The link may be broken, or the post may have moved or been removed by its blog. Try searching, or start
              from the latest posts.
            </p>
            <div className="hm-err-actions">
              <Link className="hm-btn" href="/">
                Back to latest posts
              </Link>
              <Link className="hm-btn hm-btn-quiet" href="/">
                Search posts
              </Link>
            </div>

            {recentPosts.length > 0 && (
              <ul className="hm-err-list" aria-label="Recent posts">
                <li>
                  <h2>Recent posts</h2>
                </li>
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <span className="hm-who">{post.blog.name}</span>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" lang={langOf(post.postTitle)}>
                      {post.postTitle}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ErrorArt variant="404" />
        </div>
      </main>
    </Layout>
  )
}
