// Feed thumbnails come from whatever host a blog's platform happens to use, so most
// are one-off domains. A handful of hosts (Blogger's image CDN, Blogspot's inline
// image CDN, and YouTube video thumbnails) account for the vast majority of posts and
// are allow-listed for optimization in next.config.ts. Anything else stays unoptimized
// rather than being blocked by next/image's remotePatterns check.
const OPTIMIZABLE_THUMBNAIL_HOSTS = /^(blogger\.googleusercontent\.com|img\.youtube\.com|[1-4]\.bp\.blogspot\.com)$/

export function isOptimizableThumbnailHost(src: string): boolean {
  try {
    return OPTIMIZABLE_THUMBNAIL_HOSTS.test(new URL(src).hostname)
  } catch {
    return false
  }
}
