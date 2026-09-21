import type { Metadata } from 'next'
import Layout from '../../components/layout'
import ErrorArt from '../../components/error-art'
import CheckAgainButton from '../../components/check-again-button'

export const metadata: Metadata = {
  title: "We'll be back shortly - Hathmaluwa",
}

export default function Maintenance() {
  return (
    <Layout>
      <main className="hm-err">
        <div className="hm-err-grid">
          <div className="hm-err-copy">
            <p className="hm-err-eyebrow">Back soon</p>
            <h1>
              <span lang="si">ටික වෙලාවකින් නැවත එන්න</span>
              <span className="hm-err-sub">We&apos;ll be back shortly</span>
            </h1>
            <p className="hm-err-text">
              We&apos;re doing some quick maintenance. Every blog and post is safe, and new posts will show up as
              soon as we&apos;re back. Please check again in a few minutes.
            </p>
            <div className="hm-err-actions">
              <CheckAgainButton />
            </div>
          </div>

          <ErrorArt variant="503" />
        </div>
      </main>
    </Layout>
  )
}
