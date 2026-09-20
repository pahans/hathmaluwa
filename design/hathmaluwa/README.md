Hathmaluwa is a blog. Its name is written "හත්මාළුව" in Sinhala and "Hathmaluwa" in Latin script; the horizontal lockup sets the Latin name in capitals as "HATHMALUWA". Use these spellings exactly and never respell the name.

## Voice

The tagline is "අවුරුද්දේ දවස් 365ම ඉදෙන අපේ බ්ලොග් හත්මාළුව". Set it in Sinhala exactly as written, in `body` or `body-sm` in `ink-muted`, under the wordmark or a logo. Do not translate, shorten or reword it. Where a second line is wanted, use the supporting line "Syndicating 2000+ Blogs and counting" in English beneath it, in the same style, with "2000+" in `ink` semibold. Never place it above or in place of the Sinhala tagline, and update the count only when the real number changes. The blog speaks as "අපේ" (our): write in the first person plural, in Sinhala first, and add other languages only as a second line. Leave Sinhala lines their full `line-height`; never tighten them.

## Logos

- Use `assets/Logos/hathmaluwa-horizontal.png` (mark, Sinhala name and Latin name on a grey rounded panel) where width is plentiful: headers, footers, banners.
- Use `assets/Logos/hathmaluwa-stacked.png` (mark above the "Hathmaluwa" wordmark, transparent background) where space is square or tall: avatars, covers, splash screens.
- Copy the files as given. Never redraw, recolor, invert, flatten, stretch or rebuild the mark from shapes; the mark has a soft gloss that flat fills lose.
- Keep clear space of at least `space-3` on every side of a logo.
- Both logos are made for white. In the light theme they sit on `surface`. In the dark theme, set them on a `logo-ground` panel (`radius-md`, `space-3` padding) and never straight on the dark `surface`, where the stacked wordmark's navy disappears and the horizontal file shows a white box.
- Both files are small rasters (210×64 and 170×153 px), and no vector or larger master exists yet. Show them at or below their pixel size and do not print them large.

## Color and themes

The mark is three figures in a Y: green (`leaf`) on the left, yellow (`sun`) on the right, and coral (`coral`) below with a round head. The horizontal lockup adds `amber`. The wordmark is `navy`. There are two themes, light and dark. The four brand fills keep the same value in both; `navy` lightens in dark, and `surface`, `plate`, `ink`, `ink-muted` and `border` swap.

- Set page backgrounds in `surface`; use `plate` for raised panels.
- Set body copy in `ink`, secondary copy in `ink-muted`, headings and links in `navy` or `ink`.
- Use `leaf`, `sun`, `amber` and `coral` as fills, marks and accents, one or two per view. Put `on-leaf`, `on-sun`, `on-amber` or `on-coral` on top; they are dark ink in both themes. Never set text in those hues on the light `surface`.
- Use `navy` fills with `on-navy` text for primary actions.
- Draw control borders and meaningful dividers in `border`.
- Draw the focus ring as 2px solid `navy` with a 2px `surface` gap, so it lands on `surface` in either theme.
- The dark theme uses soft dark slate surfaces with only a slight blue hint (not black, not navy), tuned at the owner's request; it is not in the supplied files. Only `navy` stays blue (lightened) for links, headings and primary actions. Check any new pairing in both themes.

## Type

No fonts were supplied and the brand has none yet. Display copy uses the serif stack (`display`, `heading-1`, `heading-2`), echoing the bold serif of the Latin wordmark. UI and body copy use the sans stack (`heading-3`, `body`, `body-sm`, `caption`). Sinhala text falls back to Noto Sans Sinhala or Sinhala MN; test it on the target device before shipping.

## Shape and spacing

Corners are round: `radius-md` for buttons and panels (the horizontal lockup's plate is a rounded rectangle), `radius-lg` for large cards, and full discs and pills for decoration, echoing the round head and rounded figures of the mark. Space with `space-1` to `space-5`; use `space-3` inside cards and `space-5` between page sections.

## Iconography and imagery

No icon set or photography was supplied. Do not add emoji as decoration. Use plain text labels until an icon set is chosen.
