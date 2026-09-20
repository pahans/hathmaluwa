import { SITE_URL } from '../site'
import { safeFetch } from './safeFetch'

// Hubs may grant a shorter lease than requested; we ask for 10 days and rely
// on scripts/renew-subscriptions.ts to renew well before any lease expires.
const REQUESTED_LEASE_SECONDS = 10 * 24 * 60 * 60

// We subscribe through this hub for every blog, regardless of which hub (if
// any) its feed itself advertises. Most of our blogs are Blogger/Blogspot,
// which all declare Google's abandoned pubsubhubbub.appspot.com - it's still
// up but drops the large majority of subscribe requests (confirmed: ~4/5
// hang with no response). websubhub.com is a maintained, standards-compliant
// hub that explicitly supports subscribing to "any public publisher" - it
// polls the topic itself, so it works even though the feed names a different
// hub.
export const WEBSUB_HUB_URL = 'https://websubhub.com/hub'

export function callbackUrl(blogId: string): string {
  return `${SITE_URL}/api/websub/callback?blogId=${encodeURIComponent(blogId)}`
}

export async function sendSubscription({
  hubUrl,
  topicUrl,
  blogId,
  secret,
  mode,
}: {
  hubUrl: string
  topicUrl: string
  blogId: string
  secret: string
  mode: 'subscribe' | 'unsubscribe'
}): Promise<void> {
  const body = new URLSearchParams({
    'hub.mode': mode,
    'hub.topic': topicUrl,
    'hub.callback': callbackUrl(blogId),
    'hub.secret': secret,
    'hub.lease_seconds': String(REQUESTED_LEASE_SECONDS),
  })

  const res = await safeFetch(hubUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`Hub ${hubUrl} rejected ${mode} request: ${res.status} ${await res.text()}`)
  }
}
