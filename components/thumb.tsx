'use client'

import { useState } from 'react'
import { hashIndex } from '../lib/brand'

// Abstract brand-colour fallbacks for posts without a thumbnail. Chosen by a stable hash of the seed.
const SHAPES = [
  <>
    <rect className="hm-f-leaf" x="16" y="-8" width="36" height="84" rx="12" />
    <rect className="hm-f-sun" x="60" y="-8" width="36" height="56" rx="12" />
    <circle className="hm-f-coral" cx="78" cy="84" r="20" />
  </>,
  <>
    <circle className="hm-f-coral" cx="42" cy="44" r="28" />
    <circle className="hm-f-amber" cx="78" cy="70" r="22" />
    <rect className="hm-f-navy" x="16" y="92" width="80" height="12" rx="6" />
  </>,
  <>
    <circle className="hm-f-leaf" cx="24" cy="24" r="10" />
    <circle className="hm-f-sun" cx="56" cy="24" r="10" />
    <circle className="hm-f-coral" cx="88" cy="24" r="10" />
    <circle className="hm-f-sun" cx="24" cy="56" r="10" />
    <circle className="hm-f-coral" cx="56" cy="56" r="10" />
    <circle className="hm-f-leaf" cx="88" cy="56" r="10" />
    <circle className="hm-f-coral" cx="24" cy="88" r="10" />
    <circle className="hm-f-leaf" cx="56" cy="88" r="10" />
    <circle className="hm-f-sun" cx="88" cy="88" r="10" />
  </>,
  <>
    <path className="hm-f-sun" d="M112 112 L112 36 A76 76 0 0 0 36 112 Z" />
    <circle className="hm-f-leaf" cx="34" cy="34" r="18" />
  </>,
  <>
    <rect className="hm-f-leaf" x="14" y="60" width="24" height="70" rx="12" />
    <rect className="hm-f-sun" x="44" y="38" width="24" height="90" rx="12" />
    <rect className="hm-f-coral" x="74" y="16" width="24" height="110" rx="12" />
  </>,
  <>
    <circle className="hm-f-navy" cx="52" cy="60" r="34" />
    <circle className="hm-f-amber" cx="88" cy="24" r="12" />
    <rect className="hm-f-leaf" x="12" y="12" width="32" height="14" rx="7" />
  </>,
  <>
    <rect className="hm-f-amber" x="12" y="12" width="64" height="88" rx="16" />
    <circle className="hm-f-leaf" cx="82" cy="78" r="22" />
  </>,
]

export default function Thumb({ src, seed }: { src: string | null; seed: string }) {
  const [broken, setBroken] = useState(false)

  if (src && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="hm-thumb"
        src={src}
        alt=""
        width={112}
        height={112}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <svg className="hm-thumb" viewBox="0 0 112 112" aria-hidden="true">
      {SHAPES[hashIndex(seed, SHAPES.length)]}
    </svg>
  )
}
