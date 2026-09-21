'use client'

import '../styles/tokens.css'
import '../styles/site.css'
import ErrorArt from '../components/error-art'

// global-error replaces the root layout when it fires, so it renders its own <html>/<body> and
// imports its own styles/theme init - none of app/layout.tsx runs here. Keep this self-contained
// and free of data fetching, since this is the last-resort boundary for the whole app.
const themeInit = `(function(){try{var s=localStorage.getItem('hm-theme');var saved=s==='dark'||s==='light';var t=saved?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;r.classList.add(t);r.classList.remove(t==='dark'?'light':'dark');if(saved)r.setAttribute('data-theme',s)}catch(e){}})()`

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong - Hathmaluwa</title>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <div className="hm">
          <main className="hm-err">
            <div className="hm-err-grid">
              <div className="hm-err-copy">
                <p className="hm-err-eyebrow">Error 500</p>
                <h1>
                  <span lang="si">අපේ පැත්තෙන් අවුලක් වුණා</span>
                  <span className="hm-err-sub">Something went wrong on our side</span>
                </h1>
                <p className="hm-err-text">
                  Hathmaluwa hit a problem while loading this page. Nothing you did caused it. Try again in a
                  moment, and if it keeps happening, <a href="/contact">let us know</a>.
                </p>
                <div className="hm-err-actions">
                  <button className="hm-btn" type="button" onClick={() => retry()}>
                    Try again
                  </button>
                  <a className="hm-btn hm-btn-quiet" href="/">
                    Back to latest posts
                  </a>
                </div>
                {error.digest && (
                  <p className="hm-err-ref">
                    Include this reference if you contact us: <code>{error.digest}</code>
                  </p>
                )}
              </div>

              <ErrorArt variant="500" />
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
