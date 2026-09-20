import { lookup } from 'dns/promises'
import { isIP } from 'net'

// The signup form lets any internet visitor hand us a URL that this server
// then fetches (feed discovery, hub subscribe). Without this, that's a
// textbook SSRF: someone submits "http://169.254.169.254/..." or an internal
// hostname and gets our server to make the request for them.
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false
  const [a, b] = parts
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase()
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80')
  )
}

function isPrivateIp(ip: string): boolean {
  return isIP(ip) === 6 ? isPrivateIPv6(ip) : isPrivateIPv4(ip)
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  const url = new URL(rawUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported URL scheme: ${url.protocol}`)
  }

  const hostname = url.hostname
  if (hostname.toLowerCase() === 'localhost') {
    throw new Error(`URL host is not allowed: ${hostname}`)
  }

  const ips = isIP(hostname) ? [hostname] : (await lookup(hostname, { all: true })).map((r) => r.address)

  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new Error(`URL resolves to a private address: ${hostname} -> ${ip}`)
    }
  }
}
