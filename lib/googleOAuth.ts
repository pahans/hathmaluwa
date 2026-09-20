import 'server-only'

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo'

function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.ADMIN_GOOGLE_CLIENT_ID
  const clientSecret = process.env.ADMIN_GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('ADMIN_GOOGLE_CLIENT_ID / ADMIN_GOOGLE_CLIENT_SECRET are not set')
  }
  return { clientId, clientSecret }
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const { clientId } = getClientCredentials()
  const url = new URL(GOOGLE_AUTH_ENDPOINT)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'select_account')
  return url.toString()
}

// Exchanges the authorization code for an access token, then fetches the
// signed-in Google account's email. We only need identity (who is this?),
// not any Google API access, so this stops at userinfo rather than storing
// tokens anywhere.
export async function fetchGoogleAccountEmail(code: string, redirectUri: string): Promise<string> {
  const { clientId, clientSecret } = getClientCredentials()

  const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`)
  }

  const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string }

  const userInfoRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userInfoRes.ok) {
    throw new Error(`Google userinfo request failed: ${userInfoRes.status}`)
  }

  const userInfo = (await userInfoRes.json()) as { email?: string; email_verified?: boolean }
  if (!userInfo.email || userInfo.email_verified === false) {
    throw new Error('Google account has no verified email')
  }

  return userInfo.email
}
