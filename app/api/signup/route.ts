import { onboardBlog } from '../../../lib/websub/onboardBlog'
import { withPublicUrlGuard } from '../../../lib/websub/ssrfContext'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function badRequest(error: string) {
  return Response.json({ ok: false, error }, { status: 400 })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid request body.')
  }

  const { blogUrl, feedUrl, blogName, name, email, agreed } = (body ?? {}) as Record<string, unknown>

  if (agreed !== true) {
    return badRequest('You must agree to the terms and conditions.')
  }
  if (typeof blogUrl !== 'string' || !isValidHttpUrl(blogUrl)) {
    return badRequest('Please provide a valid blog URL.')
  }
  if (feedUrl !== undefined && feedUrl !== '' && (typeof feedUrl !== 'string' || !isValidHttpUrl(feedUrl))) {
    return badRequest('Please provide a valid feed URL, or leave it blank.')
  }
  if (typeof blogName !== 'string' || !blogName.trim()) {
    return badRequest('Please provide the blog name.')
  }
  if (typeof name !== 'string' || !name.trim()) {
    return badRequest('Please provide your name.')
  }
  if (typeof email !== 'string' || !isValidEmail(email)) {
    return badRequest('Please provide a valid email address.')
  }

  try {
    // Every URL in this request came from an anonymous internet visitor, so
    // every fetch onboardBlog makes on its behalf (feed discovery, hub
    // subscribe) is guarded against targeting internal/private addresses.
    await withPublicUrlGuard(() =>
      onboardBlog(blogUrl, blogName.trim(), name.trim(), email.trim(), {
        approved: false,
        feedUrlOverride: typeof feedUrl === 'string' && feedUrl.trim() ? feedUrl.trim() : undefined,
      }),
    )
  } catch (error) {
    console.error('Signup onboarding failed:', error)
    return Response.json(
      {
        ok: false,
        error:
          "We couldn't read that blog's feed. Double-check the blog URL (and feed URL, if you gave one) and try again.",
      },
      { status: 422 },
    )
  }

  return Response.json({
    ok: true,
    message: "Thanks! We've picked up your blog and it'll appear on Hathmaluwa after a quick review.",
  })
}
