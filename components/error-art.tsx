type Variant = '404' | '500' | '503'

const LABELS: Record<Variant, string> = {
  '404': 'The number 404, with the zero drawn as a coral oval',
  '500': 'The number 500, with the zeros drawn as ovals',
  '503': 'A pause symbol made of two rounded bars and a disc',
}

export default function ErrorArt({ variant }: { variant: Variant }) {
  return (
    <svg className="hm-err-art" viewBox="0 0 400 240" role="img" aria-label={LABELS[variant]}>
      {variant === '404' && (
        <>
          <path
            fill="none"
            stroke="var(--leaf)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="22"
            transform="translate(25 50)"
            d="M68 132 V8 L14 94 H96"
          />
          <ellipse fill="var(--coral)" cx="200" cy="120" rx="52" ry="73" />
          <path
            fill="none"
            stroke="var(--amber)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="22"
            transform="translate(265 50)"
            d="M68 132 V8 L14 94 H96"
          />
        </>
      )}
      {variant === '500' && (
        <>
          <path
            fill="none"
            stroke="var(--leaf)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="22"
            transform="translate(21 50)"
            d="M88 12 H32 L24 66 C42 56 60 54 74 62 C96 74 96 106 76 120 C58 132 36 128 22 116"
          />
          <ellipse fill="var(--amber)" cx="196" cy="120" rx="52" ry="73" />
          <ellipse fill="var(--coral)" cx="316" cy="120" rx="52" ry="73" />
        </>
      )}
      {variant === '503' && (
        <>
          <rect fill="var(--leaf)" x="96" y="44" width="64" height="152" rx="24" />
          <rect fill="var(--sun)" x="184" y="44" width="64" height="152" rx="24" />
          <circle fill="var(--coral)" cx="316" cy="152" r="44" />
        </>
      )}
    </svg>
  )
}
