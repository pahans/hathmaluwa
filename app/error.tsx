'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/layout'
import ErrorArt from '../components/error-art'

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  // error.tsx is a client boundary rendered inside the root layout, so it can't export
  // Next.js `metadata` - set the title directly instead.
  useEffect(() => {
    document.title = 'Something went wrong - Hathmaluwa'
  }, [])

  return (
    <Layout>
      <main className="hm-err">
        <div className="hm-err-grid">
          <div className="hm-err-copy">
            <p className="hm-err-eyebrow">Error 500</p>
            <h1>
              <span lang="si">අපේ පැත්තෙන් අවුලක් වුණා</span>
              <span className="hm-err-sub">Something went wrong on our side</span>
            </h1>
            <p className="hm-err-text">
              Hathmaluwa hit a problem while loading this page. Nothing you did caused it. Try again in a moment,
              and if it keeps happening, <Link href="/contact">let us know</Link>.
            </p>
            <div className="hm-err-actions">
              <button className="hm-btn" type="button" onClick={() => retry()}>
                Try again
              </button>
              <Link className="hm-btn hm-btn-quiet" href="/">
                Back to latest posts
              </Link>
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
    </Layout>
  )
}
