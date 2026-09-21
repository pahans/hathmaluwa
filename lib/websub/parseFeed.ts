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

// Below this size (in either dimension), an image is treated as an icon/
// spacer/tracking-pixel rather than a genuine thumbnail candidate.
const MIN_THUMBNAIL_DIMENSION = 100

// Filenames/paths that give away a small decorative image regardless of
// any declared width/height (many themes don't bother declaring size).
const ICON_LIKE_PATTERN = /icon|avatar|gravatar|logo|emoji|smiley|badge|spacer|pixel|1x1/i

function isTooSmall(width: string | undefined, height: string | undefined): boolean {
  const w = width ? parseInt(width, 10) : NaN
  const h = height ? parseInt(height, 10) : NaN
  return (Number.isFinite(w) && w < MIN_THUMBNAIL_DIMENSION) || (Number.isFinite(h) && h < MIN_THUMBNAIL_DIMENSION)
}

// Blogger/Blogspot's feed thumbnails are served through its resizing proxy
// at the fixed default size ".../s72-c/image.jpg" - or, for non-square
// images, the compound form ".../s72-w400-h395-c/image.jpg". Google's newer
// image proxy host (blogger.googleusercontent.com/img/b/...) 400s if the
// size segment is removed outright - it requires *some* size token - so
// swap it for a large one instead of stripping it, which also works on the
// older bp.blogspot.com CDN. Matches only the fixed "s72" default (plain or
// compound) so other, already-large size segments (".../s320/",
// ".../s1600/") and unrelated numeric path segments in other images' URLs
// are left alone.
const BLOGGER_PATH_SIZE_SEGMENT = /\/s72(-w\d+-h\d+)?-c\//
const BLOGGER_LARGE_SIZE_SEGMENT = '/s1600/'

// The other Blogger image host (.../img/a/<token>) encodes the same fixed
// "72" default as a "=s72-c" or "=s72-wNN-hNN-c" suffix instead of a path
// segment - same fix, different syntax. Anchored to end-of-string since the
// size token is always the last thing on these URLs.
const BLOGGER_QUERY_SIZE_SUFFIX = /=s72(-w\d+-h\d+)?-c$/
const BLOGGER_LARGE_SIZE_SUFFIX = '=s1600'

// YouTube's default oEmbed/RSS thumbnail is a 120x90 crop; every video that
// has one also has the much larger hqdefault (480x360), so prefer that.
// Other sizes (mqdefault, hqdefault, sddefault, maxresdefault) are left
// alone - only the smallest one is worth upgrading.
const YOUTUBE_DEFAULT_THUMBNAIL = /\/default\.jpg$/
const YOUTUBE_LARGE_THUMBNAIL = '/hqdefault.jpg'

function normalizeThumbnailUrl(url: string | null): string | null {
  if (!url) return url

  if (url.includes('blogger.googleusercontent.com') || url.includes('bp.blogspot.com')) {
    return url
      .replace(BLOGGER_PATH_SIZE_SEGMENT, BLOGGER_LARGE_SIZE_SEGMENT)
      .replace(BLOGGER_QUERY_SIZE_SUFFIX, BLOGGER_LARGE_SIZE_SUFFIX)
  }

  if (url.includes('ytimg.com') || url.includes('img.youtube.com')) {
    return url.replace(YOUTUBE_DEFAULT_THUMBNAIL, YOUTUBE_LARGE_THUMBNAIL)
  }

  return url
}

// Feeds that embed HTML content often carry their lead image inline instead
// of a separate <media:thumbnail>/enclosure. Scan every <img> rather than
// just the first one, since posts often lead with a small icon/badge before
// the real hero image - skip anything that looks like an icon or declares
// itself smaller than MIN_THUMBNAIL_DIMENSION, preferring the largest
// declared size among what's left.
function firstImageUrl(html: string): string | null {
  const candidates: { src: string; area: number }[] = []
  const imgPattern = /<img\b([^>]*)>/gi
  let match: RegExpExecArray | null

  while ((match = imgPattern.exec(html))) {
    const attrs = match[1]
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1]
    if (!src) continue

    const width = attrs.match(/\bwidth=["']?(\d+)/i)?.[1]
    const height = attrs.match(/\bheight=["']?(\d+)/i)?.[1]

    if (ICON_LIKE_PATTERN.test(src) || isTooSmall(width, height)) continue

    const area = (width ? parseInt(width, 10) : 0) * (height ? parseInt(height, 10) : 0)
    candidates.push({ src, area })
  }

  if (candidates.length === 0) {
    // Nothing passed the filter - fall back to the very first <img>, since a
    // false-positive filter is worse than a possibly-small thumbnail.
    return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null
  }

  // Prefer the candidate with the largest declared area; undeclared sizes
  // (area 0) keep their original document order via a stable sort.
  return candidates.reduce((best, candidate) => (candidate.area > best.area ? candidate : best)).src
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
    thumbnail: normalizeThumbnailUrl(atomThumbnail(entry, links) ?? (rawSummary ? firstImageUrl(rawSummary) : null)),
  }
}

function atomThumbnail(entry: Record<string, any>, links: Record<string, any>[]): string | null {
  const mediaThumbnail = entry['media:thumbnail']
  if (mediaThumbnail?.['@_url'] && !isTooSmall(mediaThumbnail['@_width'], mediaThumbnail['@_height'])) {
    return mediaThumbnail['@_url']
  }

  const imageEnclosure = links.find(
    (link) => link['@_rel'] === 'enclosure' && String(link['@_type'] ?? '').startsWith('image/'),
  )
  return imageEnclosure?.['@_href'] ?? mediaThumbnail?.['@_url'] ?? null
}

function parseRssItem(item: Record<string, any>): ParsedFeedEntry | null {
  const url = textOf(item.link) ?? textOf(item.guid)
  const title = decodedTextOf(item.title)
  const pubDate = item.pubDate

  if (!url || !title || !pubDate) return null

  const rawSummary = decodedTextOf(item.description)
  const mediaThumbnail = item['media:thumbnail']
  const mediaThumbnailUrl =
    mediaThumbnail?.['@_url'] && !isTooSmall(mediaThumbnail['@_width'], mediaThumbnail['@_height'])
      ? mediaThumbnail['@_url']
      : null

  return {
    title,
    url,
    timestamp: new Date(pubDate),
    summary: rawSummary ? plainTextExcerpt(rawSummary) : null,
    thumbnail: normalizeThumbnailUrl(
      item.enclosure?.['@_url'] ??
        mediaThumbnailUrl ??
        (rawSummary ? firstImageUrl(rawSummary) : null) ??
        mediaThumbnail?.['@_url'] ??
        null,
    ),
  }
}
