import Parser from 'rss-parser'

interface FeedCustomFields {
  author?: { name?: string[]; email?: string[] }
}

const parser = new Parser<FeedCustomFields>({ customFields: { feed: ['author'] } })

// Blogger sometimes puts the real name inside an "email (Name)" string
// rather than a separate field (e.g. "noreply@blogger.com (Real Name)") -
// unwrap that so the admin panel shows the name, not the email address.
function unwrapEmailWrappedName(raw: string): string {
  const match = raw.match(/^\S+@\S+\s*\((.+)\)$/)
  return match ? match[1].trim() : raw
}

// Derives a blog's real author from its feed, instead of repeating the
// blog's own title (bulk-add-blogs.ts used to pass the feed title as both
// name and author when it had no other author to go on, which the admin
// panel then showed as if the title were a person's name). Blogger's Atom
// feeds advertise <author><name>; WordPress's RSS feeds don't carry a
// channel-level author but do tag each <item> with <dc:creator>, so this
// falls back to the first item's byline. Returns null when neither is
// present, or the feed fails to parse.
export async function authorOf(xml: string): Promise<string | null> {
  try {
    const feed = await parser.parseString(xml)
    const atomName = feed.author?.name?.[0]?.trim()
    if (atomName) return unwrapEmailWrappedName(atomName)

    const itemCreator = feed.items.find((item) => item.creator?.trim())?.creator?.trim()
    return itemCreator ? unwrapEmailWrappedName(itemCreator) : null
  } catch {
    return null
  }
}
