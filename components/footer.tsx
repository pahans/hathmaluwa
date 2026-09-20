import { SYNDICATED_COUNT, TAGLINE } from '../lib/site'

export default function Footer() {
  return (
    <footer className="hm-site-footer">
      <div className="hm-footer-inner">
        <p>
          <span lang="si">{TAGLINE}</span>
          <br />
          Syndicating {SYNDICATED_COUNT} Blogs and counting
        </p>
      </div>
    </footer>
  )
}
