import { SYNDICATED_COUNT, TAGLINE } from '../lib/site'

export default function Tagline() {
  return (
    <p className="hm-tagline">
      <span lang="si">{TAGLINE}</span>
      <span className="hm-tagline-2">
        Syndicating <b>{SYNDICATED_COUNT}</b> Blogs and counting
      </span>
    </p>
  )
}
