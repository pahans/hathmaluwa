import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from './lib/adminAuth'

// Optimistic check only (cookie presence, not signature/allowlist
// verification - that needs `jwtVerify`, which needs a Node crypto API this
// edge-ish runtime may not have). Every admin page/action still calls
// getAdminSession() server-side for the real check, per Next.js's own
// guidance that Proxy/Middleware must not be the only line of defense.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE)
  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
