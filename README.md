# Onyx Executive Miami — onyxexecmiami.com

Astro 7 static site, served by a Cloudflare Worker with static assets.

## Layout

- `src/pages/` — one `.astro` file per page. `faq.astro` builds to `/faq.html`, `es/index.astro` to `/es/`.
  URLs are the ones Google indexes; `build.format: 'preserve'` in `astro.config.mjs` keeps them. Do not rename pages.
- `src/layouts/Base.astro` — `<html>`, `<head>` with analytics, `<body>`.
- `src/components/` — blocks shared by the English pages:
  `SiteHeader` (top bar, nav, mobile menu), `SiteFooter`, `Fonts` (Google Fonts + `style.css`),
  `Analytics` (GA4 + call/WhatsApp/email click events), `YearReveal`, `SiteScripts` (mobile menu + Moovs booking widget).
  Edit the menu or footer here once, not per page. The ES and RU home pages carry their own translated header and footer.
- `public/` — `style.css`, images, `sitemap.xml`, `robots.txt`, served as is.
- `worker/index.js` — maps request paths to files so `/faq.html` stays `/faq.html`
  (plain Cloudflare Pages would redirect it to `/faq`), redirects `www` and `http` to `https://onyxexecmiami.com`,
  `/es` to `/es/`, and returns `404.html` for missing pages.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # build to dist/
npm test          # worker path-mapping tests
npm run preview   # serve dist/ through the worker locally (wrangler dev)
npm run deploy    # build and deploy to Cloudflare (needs `wrangler login` to the account holding the zone)
```

## Migration from hand-written HTML (30.09.2026)

`scripts/convert-html.py` produced `src/pages/` from the original HTML files (kept in git history on `main`
before the switch). `scripts/compare-with-original.py <git-ref>` compares every built page with the original
tag by tag; after the migration all 34 pages matched, except one stray `</div>` on the home page that browsers ignore.
