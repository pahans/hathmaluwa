import { XMLParser } from 'fast-xml-parser'
import { decode } from 'he'

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

// Some feeds (Blogger in particular) double-escape entities, so the XML
// parser's own decoding still leaves things like "&#39;" in the text -
// this handles both single- and double-escaped input (decoding plain text
// is a no-op).
function decodedTextOf(value: unknown): string | null {
  const text = textOf(value)
  return text === null ? null : decode(text)
}

const MAX_SUMMARY_LENGTH = 300

// WordPress (and some other) feeds put full HTML - images, links, styled
// paragraphs - in <description>/<summary>, and the UI renders summary as
// plain text, so raw tags would otherwise show up literally on the page.
function plainTextExcerpt(html: string, maxLength = MAX_SUMMARY_LENGTH): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

// Feeds that embed HTML content often carry their lead image inline instead
// of a separate <media:thumbnail>/enclosure - fall back to the first <img>.
function firstImageUrl(html: string): string | null {
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null
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
  const title = decodedTextOf(entry.title)
  const published = entry.published ?? entry.updated

  if (!url || !title || !published) return null

  const rawSummary = decodedTextOf(entry.summary) ?? decodedTextOf(entry.content)

  return {
    title,
    url,
    timestamp: new Date(published),
    summary: rawSummary ? plainTextExcerpt(rawSummary) : null,
    thumbnail: atomThumbnail(entry, links) ?? (rawSummary ? firstImageUrl(rawSummary) : null),
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
  const title = decodedTextOf(item.title)
  const pubDate = item.pubDate

  if (!url || !title || !pubDate) return null

  const rawSummary = decodedTextOf(item.description)

  return {
    title,
    url,
    timestamp: new Date(pubDate),
    summary: rawSummary ? plainTextExcerpt(rawSummary) : null,
    thumbnail:
      item.enclosure?.['@_url'] ?? item['media:thumbnail']?.['@_url'] ?? (rawSummary ? firstImageUrl(rawSummary) : null),
  }
}
