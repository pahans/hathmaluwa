import { XMLParser } from 'fast-xml-parser'

export interface ParsedFeedEntry {
  title: string
  url: string
  timestamp: Date
  summary: string | null
  thumbnail: string | null
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function textOf(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return textOf((value as Record<string, unknown>)['#text'])
  }
  return null
}

// Parses either an Atom feed (<feed><entry>) or an RSS 2.0 feed
// (<rss><channel><item>) into a normalized list of entries.
export function parseFeed(xml: string): ParsedFeedEntry[] {
  const doc = parser.parse(xml)

  if (doc.feed) {
    return toArray(doc.feed.entry)
      .map(parseAtomEntry)
      .filter((entry): entry is ParsedFeedEntry => entry !== null)
  }

  if (doc.rss?.channel) {
    return toArray(doc.rss.channel.item)
      .map(parseRssItem)
      .filter((entry): entry is ParsedFeedEntry => entry !== null)
  }

  return []
}

function parseAtomEntry(entry: Record<string, any>): ParsedFeedEntry | null {
  const links = toArray(entry.link)
  const altLink = links.find((link) => !link['@_rel'] || link['@_rel'] === 'alternate')
  const url = altLink?.['@_href'] ?? links[0]?.['@_href']
  const title = textOf(entry.title)
  const published = entry.published ?? entry.updated

  if (!url || !title || !published) return null

  return {
    title,
    url,
    timestamp: new Date(published),
    summary: textOf(entry.summary) ?? textOf(entry.content),
    thumbnail: atomThumbnail(entry, links),
  }
}

function atomThumbnail(entry: Record<string, any>, links: Record<string, any>[]): string | null {
  const mediaThumbnail = entry['media:thumbnail']
  if (mediaThumbnail?.['@_url']) return mediaThumbnail['@_url']

  const imageEnclosure = links.find(
    (link) => link['@_rel'] === 'enclosure' && String(link['@_type'] ?? '').startsWith('image/'),
  )
  return imageEnclosure?.['@_href'] ?? null
}

function parseRssItem(item: Record<string, any>): ParsedFeedEntry | null {
  const url = textOf(item.link) ?? textOf(item.guid)
  const title = textOf(item.title)
  const pubDate = item.pubDate

  if (!url || !title || !pubDate) return null

  return {
    title,
    url,
    timestamp: new Date(pubDate),
    summary: textOf(item.description),
    thumbnail: item.enclosure?.['@_url'] ?? item['media:thumbnail']?.['@_url'] ?? null,
  }
}
