// Site-wide brand copy and constants. See design/hathmaluwa/README.md (Voice) before changing the tagline.

// Fixed Sinhala tagline. Do not translate, shorten or reword it.
export const TAGLINE = 'අවුරුද්දේ දවස් 365ම ඉදෙන අපේ බ්ලොග් හත්මාළුව'

// Supporting line shown under the tagline. Update the count only when the real number changes.
export const SYNDICATED_COUNT = '2000+'

// Origin used in the badge embed code that blog owners paste into their sites.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hathmaluwa.org').replace(/\/$/, '')
