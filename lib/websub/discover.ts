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

// FeedBurner is a Google-run proxy in front of a blog's real feed. It's
// half-dead (many burned feeds 404 or never update) and never advertises the
// blog's own hub, so we always go to the blog's own feed instead.
export function isFeedBurnerUrl(url: string): boolean {
  const host = new URL(url).hostname.toLowerCase()
  return host === 'feedburner.com' || host.endsWith('.feedburner.com') || host === 'feedproxy.google.com'
}

// Blogger serves the same posts at several feed URLs (?alt=rss,
// ?redirect=false, the www.blogger.com/feeds/<id>/posts/default self link).
// Only the blog's own Atom /feeds/posts/default advertises a hub, and it's the
// topic Blogger pings the hub with, so every variant is collapsed onto it.
export function defaultBloggerFeedUrl(url: string): string | null {
  const parsed = new URL(url)
  if (parsed.pathname.replace(/\/+/g, '/').replace(/\/$/, '') !== '/feeds/posts/default') return null
  return `${parsed.origin}/feeds/posts/default`
}

// Blogger 302s /feeds/posts/default to FeedBurner for any blog that ever
// turned on FeedBurner redirection; ?redirect=false opts out of that. The
// stored feed URL (and WebSub topic) stays the plain default one - this is
// only for when we fetch the feed ourselves.
export function fetchableFeedUrl(feedUrl: string): string {
  const bloggerFeedUrl = defaultBloggerFeedUrl(feedUrl)
  return bloggerFeedUrl ? `${bloggerFeedUrl}?redirect=false` : feedUrl
}

// If `blogUrl` is already a feed, returns it as-is. Otherwise fetches the page
// and follows the first <link rel="alternate" type=".../rss|atom+xml"> tag
// that isn't a FeedBurner proxy, falling back to Blogger's default feed for
// Blogger blogs that only advertise a FeedBurner one.
export async function discoverFeedUrl(blogUrl: string): Promise<string> {
  const res = await safeFetch(blogUrl)
  if (!res.ok) throw new Error(`Failed to fetch ${blogUrl}: ${res.status}`)

  const contentType = res.headers.get('content-type') ?? ''
  const body = await res.text()

  if (contentType.includes('xml') || /^\s*(<\?xml|<feed[\s>]|<rss[\s>])/i.test(body)) {
    return defaultBloggerFeedUrl(blogUrl) ?? blogUrl
  }

  const feedLinks = [...body.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /rel=["']alternate["']/i.test(tag) && /type=["']application\/(?:rss|atom)\+xml["']/i.test(tag))
    .map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1])
    .filter((href): href is string => Boolean(href))
    .map((href) => new URL(href, blogUrl).toString())

  const ownFeed = feedLinks.find((href) => !isFeedBurnerUrl(href))
  if (ownFeed) return defaultBloggerFeedUrl(ownFeed) ?? ownFeed

  if (/<meta[^>]+content=["']blogger["'][^>]+name=["']generator["']|<meta[^>]+name=["']generator["'][^>]+content=["']blogger["']/i.test(body)) {
    return `${new URL(blogUrl).origin}/feeds/posts/default`
  }

  throw new Error(`No feed <link> found on ${blogUrl}`)
}

// Reads the feed's own <link rel="hub"> / <link rel="self"> tags, per the
// WebSub spec's discovery requirement.
export async function discoverHub(feedUrl: string): Promise<DiscoveredFeed> {
  const res = await safeFetch(fetchableFeedUrl(feedUrl))
  if (!res.ok) throw new Error(`Failed to fetch feed ${feedUrl}: ${res.status}`)

  const xml = await res.text()
  const doc = parser.parse(xml)

  // XMLParser doesn't fail on non-XML/garbage input, it just returns an
  // object with none of the expected shape - catch that here so callers
  // don't treat "not actually a feed" the same as "valid feed, no hub".
  if (!doc.feed && !doc.rss?.channel) {
    throw new Error(`${feedUrl} does not look like an RSS or Atom feed`)
  }

  const links = [...toArray(doc.feed?.link), ...toArray(doc.rss?.channel?.['atom:link'])]

  const hubLink = links.find((link) => link?.['@_rel'] === 'hub')
  if (!hubLink?.['@_href']) {
    throw new NoHubAdvertisedError(`Feed ${feedUrl} does not advertise a WebSub hub`)
  }

  // Blogger's rel="self" is the www.blogger.com/feeds/<id>/... alias, but it
  // pings the hub for the blog's own feed, which it lists as the #feed link.
  const bloggerFeedLink = links.find((link) => link?.['@_rel'] === 'http://schemas.google.com/g/2005#feed')
  const selfLink = links.find((link) => link?.['@_rel'] === 'self')

  return {
    feedUrl: bloggerFeedLink?.['@_href'] ?? selfLink?.['@_href'] ?? feedUrl,
    hubUrl: hubLink['@_href'],
  }
}
