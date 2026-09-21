import type { NextConfig } from 'next'

// Keep in sync with lib/thumbnail.ts's OPTIMIZABLE_THUMBNAIL_HOSTS - these are the feed
// thumbnail hosts common enough across blogs to be worth optimizing.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'blogger.googleusercontent.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '*.bp.blogspot.com' },
    ],
  },
}

export default nextConfig
