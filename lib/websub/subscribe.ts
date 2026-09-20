import { SITE_URL } from '../site'

// Hubs may grant a shorter lease than requested; we ask for 10 days and rely
// on scripts/renew-subscriptions.ts to renew well before any lease expires.
const REQUESTED_LEASE_SECONDS = 10 * 24 * 60 * 60

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

  const res = await fetch(hubUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`Hub ${hubUrl} rejected ${mode} request: ${res.status} ${await res.text()}`)
  }
}
