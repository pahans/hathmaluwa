import type { Metadata } from 'next'
import Layout from '../../components/layout'
import CopyCode from '../../components/copy-code'
import { SITE_URL } from '../../lib/site'

export const metadata: Metadata = {
  title: 'Badge',
  description: "Show your readers that your blog is on Hathmaluwa. Pick a badge and copy its embed code.",
}

// Files live in public/badges. Blog owners paste the snippet into their own site, so it uses absolute URLs.
const BADGES = [
  { id: 'stacked', title: 'Stacked', file: 'hathmaluwa-stacked.png', width: 170, height: 153 },
  { id: 'horizontal', title: 'Horizontal', file: 'hathmaluwa-horizontal.png', width: 210, height: 64 },
  { id: 'compact', title: 'Compact', file: 'hathmaluwa-compact.png', width: 213, height: 64 },
]

function embedCode(file: string): string {
  return `<a href="${SITE_URL}" title="hathmaluwa" target="_blank"><img src="${SITE_URL}/badges/${file}" alt="hathmaluwa" /></a>`
}

export default function Badge() {
  return (
    <Layout>
      <main className="hm-wrap">
        <div className="hm-badge-head">
          <h1>Badge</h1>
          <p>
            Show your readers that your blog is on Hathmaluwa. Pick a badge, copy its code and paste it into your
            blog&apos;s HTML.
          </p>
        </div>

        <div className="hm-badge-grid">
          {BADGES.map((badge) => (
            <section key={badge.id} className="hm-badge-card" aria-label={`${badge.title} badge`}>
              <div className="hm-badge-stage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/badges/${badge.file}`}
                  width={badge.width}
                  height={badge.height}
                  alt={`Hathmaluwa ${badge.title.toLowerCase()} badge preview`}
                />
              </div>
              <p className="hm-badge-label">
                <b>{badge.title}</b>
                <span>
                  {badge.width} × {badge.height}
                </span>
              </p>
              <CopyCode id={`code-${badge.id}`} label={`${badge.title} badge HTML code`} value={embedCode(badge.file)} />
            </section>
          ))}
        </div>

        <div className="hm-badge-steps">
          <h2>Add a badge to your blog</h2>
          <ol>
            <li>
              <b>Choose</b> the badge that fits your layout: stacked for a sidebar, horizontal or compact for a header
              or footer.
            </li>
            <li>
              <b>Copy</b> its code with the button under the badge.
            </li>
            <li>
              <b>Paste</b> it into an HTML or widget block on your blog, for example in the sidebar or footer template.
            </li>
          </ol>
        </div>
      </main>
    </Layout>
  )
}
