export const TONES = ['leaf', 'sun', 'amber', 'coral'] as const
export type Tone = (typeof TONES)[number]

// Stable index from a string, so a blog always gets the same avatar colour and fallback thumbnail.
export function hashIndex(seed: string, size: number): number {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return hash % size
}

export function toneFor(seed: string): Tone {
  return TONES[hashIndex(seed, TONES.length)]
}

export function initialOf(name: string): string {
  return Array.from(name.trim())[0]?.toUpperCase() ?? '?'
}
