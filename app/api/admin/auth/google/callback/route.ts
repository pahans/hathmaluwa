import { NextResponse } from 'next/server'
import { fetchGoogleAccountEmail } from '../../../../../../lib/googleOAuth'
import { ADMIN_SESSION_COOKIE, isAllowedAdminEmail, signAdminSessionToken } from '../../../../../../lib/adminAuth'
import { OAUTH_STATE_COOKIE } from '../route'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const loginError = (reason: string) =>
    NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(reason)}`, requestUrl))

  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const expectedState = request.headers
    .get('cookie')
    ?.split('; ')
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.split('=')[1]

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError('Sign-in failed - please try again.')
  }

  let email: string
  try {
    // Must match exactly what was sent to Google in ../route.ts's GET, which
    // is also derived from the request's own origin.
    const redirectUri = new URL('/api/admin/auth/google/callback', requestUrl).toString()
    email = await fetchGoogleAccountEmail(code, redirectUri)
  } catch (error) {
    console.error('Google OAuth callback failed:', error)
    return loginError('Sign-in failed - please try again.')
  }

  if (!isAllowedAdminEmail(email)) {
    return loginError('This Google account is not authorized for admin access.')
  }

  const { token, expires, cookieOptions } = await signAdminSessionToken(email)

  const res = NextResponse.redirect(new URL('/admin', requestUrl))
  res.cookies.set(ADMIN_SESSION_COOKIE, token, { ...cookieOptions, expires })
  res.cookies.delete(OAUTH_STATE_COOKIE)
  return res
}
