import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { buildGoogleAuthUrl } from '../../../../../lib/googleOAuth'

export const OAUTH_STATE_COOKIE = 'hm_admin_oauth_state'

// Starts the Google sign-in flow: stashes a random state value in a
// short-lived cookie (checked in ../callback/route.ts) to guard against CSRF
// on the callback, then sends the browser to Google's consent screen.
//
// The redirect_uri is derived from the incoming request's own origin (not a
// fixed SITE_URL) so this works unmodified in local dev, preview deploys,
// and production - each origin just needs to be added as an Authorized
// redirect URI in the Google Cloud Console OAuth client.
export async function GET(request: Request) {
  const state = randomBytes(16).toString('hex')
  const redirectUri = new URL('/api/admin/auth/google/callback', request.url).toString()

  const res = NextResponse.redirect(buildGoogleAuthUrl(redirectUri, state))
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
