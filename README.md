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
CLOUDFLARE_API_TOKEN=... npm run deploy   # build and deploy; token scoped to the onyxexecmiami.com zone (account in wrangler.jsonc)
```

## Migration from hand-written HTML (30.09.2026)

`scripts/convert-html.py` produced `src/pages/` from the original HTML files (kept in git history on `main`
before the switch). `scripts/compare-with-original.py <git-ref>` compares every built page with the original
tag by tag; after the migration all 34 pages matched, except one stray `</div>` on the home page that browsers ignore.

## Languages (en, es, ru)

English pages in `src/pages/*.astro` are the source. Spanish and Russian pages under `src/pages/es/` and
`src/pages/ru/` are generated — do not edit them by hand:

```bash
python3 scripts/i18n-extract.py        # English pages -> translations/en/<page>.json
# translate translations/en/<page>.json -> translations/<lang>/<page>.json (same keys)
python3 scripts/i18n-check.py es       # keys, tags and attributes intact, nothing left in English
python3 scripts/i18n-build.py es ru    # -> src/pages/es/*.astro, src/pages/ru/*.astro
```

After editing an English page: extract, update the changed keys in `translations/es|ru`, check, build.
Header, footer, mobile menu and 404 strings live in `src/i18n/ui.ts`. `Base.astro` writes canonical and
hreflang for every page; `src/pages/sitemap.xml.ts` lists all pages in all languages.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: `npm ci`, tests, build, `wrangler deploy`.
It needs the repository secret `CLOUDFLARE_API_TOKEN`. Until it is enabled, the workflow waits in
`docs/deploy.yml` (see CLAUDE.md, first-time setup, step 0). Deploying by hand still works:
`CLOUDFLARE_API_TOKEN=... npm run deploy`.

## Hosting

Cloudflare Worker `onyx-landing` (account "Vik.ironman@gmail.com's Account"), custom domains
onyxexecmiami.com and www. DNS is on Cloudflare since 30.09.2026 (registrar: Network Solutions);
mail stays with Network Solutions (MX, and the imap/pop/smtp/mail/autodiscover records must stay DNS-only).
`docs/dns-backup-2026-09-30.json` is the zone before the switch from GitHub Pages.
