import { assertPublicHttpUrl } from './ssrfGuard'
import { isPublicUrlGuardActive } from './ssrfContext'

const MAX_REDIRECTS = 5

// A redirect (blog -> attacker-controlled 302 -> internal URL) would bypass a
// guard that only checks the original URL, so this validates and follows
// each hop manually instead of letting fetch's automatic redirect handling
// skip straight past our check. The guard itself only runs when
// withPublicUrlGuard (ssrfContext.ts) is active for the current call stack.
export async function safeFetch(inputUrl: string, init: RequestInit = {}): Promise<Response> {
  let url = inputUrl

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (isPublicUrlGuardActive()) await assertPublicHttpUrl(url)
    const res = await fetch(url, { ...init, redirect: 'manual' })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return res
      url = new URL(location, url).toString()
      continue
    }

    return res
  }

  throw new Error(`Too many redirects fetching ${inputUrl}`)
}
