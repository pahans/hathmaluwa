import { XMLParser } from 'fast-xml-parser'
import { safeFetch } from './safeFetch'

export interface DiscoveredFeed {
  feedUrl: string
  hubUrl: string
}

// Thrown when a feed simply has no <link rel="hub">, as opposed to a network
// or parse failure — callers use this to fall back to polling instead of
// treating the blog as failed.
export class NoHubAdvertisedError extends Error {}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

// If `blogUrl` is already a feed, returns it as-is. Otherwise fetches the page
// and follows the first <link rel="alternate" type=".../rss|atom+xml"> tag.
export async function discoverFeedUrl(blogUrl: string): Promise<string> {
  const res = await safeFetch(blogUrl)
  if (!res.ok) throw new Error(`Failed to fetch ${blogUrl}: ${res.status}`)

  const contentType = res.headers.get('content-type') ?? ''
  const body = await res.text()

  if (contentType.includes('xml') || /^\s*(<\?xml|<feed[\s>]|<rss[\s>])/i.test(body)) {
    return blogUrl
  }

  const linkTag = body.match(
    /<link[^>]+rel=["']alternate["'][^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]*>|<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+rel=["']alternate["'][^>]*>/i,
  )
  if (!linkTag) throw new Error(`No feed <link> found on ${blogUrl}`)

  const href = linkTag[0].match(/href=["']([^"']+)["']/i)?.[1]
  if (!href) throw new Error(`Feed <link> on ${blogUrl} has no href`)

  return new URL(href, blogUrl).toString()
}

// Reads the feed's own <link rel="hub"> / <link rel="self"> tags, per the
// WebSub spec's discovery requirement.
export async function discoverHub(feedUrl: string): Promise<DiscoveredFeed> {
  const res = await safeFetch(feedUrl)
  if (!res.ok) throw new Error(`Failed to fetch feed ${feedUrl}: ${res.status}`)

  const xml = await res.text()
  const doc = parser.parse(xml)

  const links = [...toArray(doc.feed?.link), ...toArray(doc.rss?.channel?.['atom:link'])]

  const hubLink = links.find((link) => link?.['@_rel'] === 'hub')
  if (!hubLink?.['@_href']) {
    throw new NoHubAdvertisedError(`Feed ${feedUrl} does not advertise a WebSub hub`)
  }

  const selfLink = links.find((link) => link?.['@_rel'] === 'self')

  return {
    feedUrl: selfLink?.['@_href'] ?? feedUrl,
    hubUrl: hubLink['@_href'],
  }
}
