import Parser from 'rss-parser'

const parser = new Parser()

// Derives a blog's homepage from its already-parsed feed (handles Atom
// <link rel="alternate">, RSS 2.0 <link>, and the many vendor-specific
// quirks - Blogger's multiple <link> tags, WordPress's absolute vs.
// relative hrefs, etc. - that a hand-rolled regex/XML-attribute reader kept
// getting wrong). Falls back to the feed URL itself when the feed doesn't
// advertise a link.
export function homepageUrlFromFeed(feed: Parser.Output<unknown>, feedUrl: string): string {
  if (!feed.link) return feedUrl
  try {
    return new URL(feed.link, feedUrl).toString()
  } catch {
    return feedUrl
  }
}

// Same, but parses the feed XML itself - for callers that haven't already
// parsed it. Falls back to the feed URL if the feed fails to parse, so a
// malformed feed doesn't block callers - it just leaves url == feedUrl for
// that one blog.
export async function homepageUrlOf(xml: string, feedUrl: string): Promise<string> {
  try {
    const feed = await parser.parseString(xml)
    return homepageUrlFromFeed(feed, feedUrl)
  } catch {
    return feedUrl
  }
}
