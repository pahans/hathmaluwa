import { readFileSync } from 'fs'
import { XMLParser } from 'fast-xml-parser'
import { decode } from 'he'
import prisma from '../lib/prisma'
import { addBlog } from './add-blog'

// Onboards many blogs at once from a plain text file of feed URLs (one per
// line, '#' comments allowed). We often only have the feed URL for a legacy
// list, not the blog's name/author/email, so this derives the name from the
// feed's own <title> and falls back to a placeholder author/email rather
// than guessing at real personal details we don't have.
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function textOf(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (value && typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return textOf((value as Record<string, unknown>)['#text'])
  }
  return null
}

async function fetchFeedTitle(feedUrl: string): Promise<string> {
  const res = await fetch(feedUrl, { redirect: 'follow' })
  if (!res.ok) throw new Error(`Failed to fetch ${feedUrl}: ${res.status}`)

  const doc = parser.parse(await res.text())
  const title = textOf(doc.feed?.title) ?? textOf(doc.rss?.channel?.title)
  if (!title) throw new Error(`No <title> found in feed ${feedUrl}`)

  return decode(title)
}

function readFeedUrls(filePath: string): string[] {
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: pnpm bulk-add-blogs <path-to-feed-url-list.txt>')
    process.exit(1)
  }

  const feedUrls = readFeedUrls(filePath)
  const results: { feedUrl: string; ok: boolean; error?: string }[] = []

  for (const feedUrl of feedUrls) {
    console.log(`\n=== ${feedUrl} ===`)
    try {
      const title = await fetchFeedTitle(feedUrl)
      const hostname = new URL(feedUrl).hostname
      await addBlog(feedUrl, title, title, `unknown@${hostname}`)
      results.push({ feedUrl, ok: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Failed: ${message}`)
      results.push({ feedUrl, ok: false, error: message })
    }
  }

  console.log('\n=== Summary ===')
  for (const r of results) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'}  ${r.feedUrl}${r.error ? `  (${r.error})` : ''}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
