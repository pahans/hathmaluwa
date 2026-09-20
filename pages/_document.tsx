import { Html, Head, Main, NextScript } from 'next/document'

// Applies the saved (or system) theme before first paint so the page never flashes the wrong theme.
// Sets the "dark"/"light" class that Radix Themes (appearance="inherit") reads, and data-theme when
// the visitor made an explicit choice. Keep in sync with components/theme-toggle.tsx.
const themeInit = `(function(){try{var s=localStorage.getItem('hm-theme');var saved=s==='dark'||s==='light';var t=saved?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;r.classList.add(t);r.classList.remove(t==='dark'?'light':'dark');if(saved)r.setAttribute('data-theme',s)}catch(e){}})()`

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
