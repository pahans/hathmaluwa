import '@radix-ui/themes/styles.css'
import '../styles/tokens.css'
import '../styles/site.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import ThemeProvider from './theme-provider'
import { SITE_URL } from '../lib/site'

const DESCRIPTION = 'Hathmaluwa syndicates 2000+ Sinhala blogs, bringing the latest posts from Sri Lanka’s blogging community together in one feed.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hathmaluwa',
    template: '%s - Hathmaluwa',
  },
  description: DESCRIPTION,
  openGraph: {
    title: 'Hathmaluwa',
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Hathmaluwa',
    images: [{ url: '/og-image.png', width: 970, height: 230, alt: 'Hathmaluwa' }],
    locale: 'si_LK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hathmaluwa',
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
}

// Applies the saved (or system) theme before first paint so the page never flashes the wrong theme.
// Sets the "dark"/"light" class that Radix Themes (appearance="inherit") reads, and data-theme when
// the visitor made an explicit choice. Keep in sync with components/theme-toggle.tsx.
const themeInit = `(function(){try{var s=localStorage.getItem('hm-theme');var saved=s==='dark'||s==='light';var t=saved?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;r.classList.add(t);r.classList.remove(t==='dark'?'light':'dark');if(saved)r.setAttribute('data-theme',s)}catch(e){}})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title="Hathmaluwa" href="/feed" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
