import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'hm_admin_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedAdminEmail(email: string): boolean {
  return getAdminAllowlist().includes(email.toLowerCase())
}

export interface AdminSession {
  email: string
}

// Signs a session token plus the cookie options to set it with. Kept
// separate from any particular way of writing the cookie (NextResponse in a
// Route Handler vs. cookies() in a Server Component/Action) since both need
// to apply the exact same options.
export async function signAdminSessionToken(email: string): Promise<{
  token: string
  expires: Date
  cookieOptions: { httpOnly: true; secure: boolean; sameSite: 'lax'; path: '/' }
}> {
  const expires = new Date(Date.now() + SESSION_DURATION_MS)
  const token = await new SignJWT({ email } satisfies AdminSession)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(getSecretKey())

  return {
    token,
    expires,
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' },
  }
}

// Re-checks the allowlist on every read (not just at login), so removing
// someone from ADMIN_EMAILS revokes their access immediately without needing
// a session-revocation list. Safe to call from any server context (Route
// Handlers, Server Components, Server Actions) - cookies() only writes when
// the route handling it also returns/creates the response, which reads
// never do.
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'] })
    const email = payload.email
    if (typeof email !== 'string' || !isAllowedAdminEmail(email)) return null
    return { email }
  } catch {
    return null
  }
}
