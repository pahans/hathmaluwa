function textOf(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (value && typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return textOf((value as Record<string, unknown>)['#text'])
  }
  return null
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

// Derives a blog's homepage from its parsed feed document. Atom feeds
// advertise it as <link rel="alternate">; RSS channels use a plain <link>
// element. Falls back to the feed URL itself when neither is present.
export function homepageUrlOf(doc: Record<string, unknown>, feedUrl: string): string {
  const feed = doc.feed as Record<string, unknown> | undefined
  const channel = (doc.rss as Record<string, unknown> | undefined)?.channel as
    | Record<string, unknown>
    | undefined

  const atomLinks = toArray(feed?.link as unknown) as Record<string, unknown>[]
  const atomHomepage = atomLinks.find(
    (link) => (!link?.['@_rel'] || link['@_rel'] === 'alternate') && link?.['@_href'],
  )?.['@_href'] as string | undefined

  const rssHomepage = textOf(channel?.link)

  const href = atomHomepage ?? rssHomepage
  if (!href) return feedUrl

  try {
    return new URL(href, feedUrl).toString()
  } catch {
    return feedUrl
  }
}
