@AGENTS.md

## Design system

- Brand rules: design/hathmaluwa/README.md. Tokens: design/hathmaluwa/tokens.json (implemented in styles/tokens.css). Site styles: styles/site.css, every class prefixed `hm-`.
- Use tokens only (var(--navy), var(--surface), ...), never hard-coded colors. Light and dark themes come from :root plus [data-theme="dark"]; pages/_document.tsx applies the saved theme before paint.
- Logos are used exactly as supplied (public/badges). Never redraw, recolor or rebuild the mark. In dark theme they sit on a white panel (var(--logo-ground)).
- The Sinhala tagline is fixed copy in lib/site.ts. Sinhala text keeps line-height 1.75 (`lang="si"`, see lib/lang.ts).
- design/hathmaluwa/sample-page.html is the visual reference for layout, not code to copy.
