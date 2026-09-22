import { getLatestPosts } from '../../lib/posts'
import { SITE_URL, TAGLINE } from '../../lib/site'

const FEED_ITEM_LIMIT = 50

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = await getLatestPosts(FEED_ITEM_LIMIT)

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.postTitle)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <pubDate>${post.timestamp.toUTCString()}</pubDate>
      <source url="${escapeXml(post.blog.url)}">${escapeXml(post.blog.name)}</source>${
        post.summary ? `\n      <description>${escapeXml(post.summary)}</description>` : ''
      }
    </item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hathmaluwa</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed" rel="self" type="application/rss+xml" />
    <description>${escapeXml(TAGLINE)}</description>
    <language>si</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  })
}
