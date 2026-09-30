# onyxexecmiami.com — instructions for AI assistants

Site of Onyx Executive Miami (private chauffeur service, South Florida). Astro 7 static site,
three languages, served by a Cloudflare Worker. The owner is not a programmer: explain in plain
words, do the technical work yourself, ask before anything that changes the live site's DNS or mail.

## How the site goes live

Push to `main` → GitHub Actions `.github/workflows/deploy.yml` (until set up: `docs/deploy.yml`, see step 0) → `npm ci`, `npm test`, `npm run build`,
`wrangler deploy` → Cloudflare Worker `onyx-landing` (custom domains onyxexecmiami.com and www).
The workflow needs the repository secret `CLOUDFLARE_API_TOKEN`. If a run fails, the old version stays
live; read the run log (`gh run view --log-failed`) before changing anything.

First-time setup, if not done yet:
0. If `.github/workflows/deploy.yml` does not exist yet, create it from the prepared copy and push
   (pushing workflow files needs a GitHub token with the `workflow` scope, e.g. `gh auth refresh -s workflow`):
   `mkdir -p .github/workflows && git mv docs/deploy.yml .github/workflows/deploy.yml && git commit -m "Enable deploy on push" && git push`.
1. The owner creates a Cloudflare API token in the dashboard (My Profile → API Tokens → template
   "Edit Cloudflare Workers", account resources: the owner's account, zone resources: onyxexecmiami.com,
   plus Zone → DNS → Edit). You cannot create it; ask the owner to paste it to you.
2. `gh secret set CLOUDFLARE_API_TOKEN -R onyxexecmiami/onyx-landing` (needs admin on the repo).
3. Disable the old GitHub Pages: `gh api -X DELETE repos/onyxexecmiami/onyx-landing/pages`.
4. Check: `gh workflow run Deploy -R onyxexecmiami/onyx-landing`, then `gh run watch`.

## Editing

- Page text: `src/pages/<page>.astro` (English). Spanish and Russian pages in `src/pages/es/` and
  `src/pages/ru/` are GENERATED — never edit them by hand. After changing English text:
  `python3 scripts/i18n-extract.py`, update the changed keys in `translations/es/<page>.json` and
  `translations/ru/<page>.json` (translate them yourself: usted in Spanish, «вы» in Russian, brand names,
  airport codes, addresses, prices unchanged), `python3 scripts/i18n-check.py es` / `ru` until "ok",
  `python3 scripts/i18n-build.py es ru`. Keys are assigned by text, so when an English text changes,
  compare the old and new `translations/en/<page>.json` to see which keys need a new translation.
- Menu, footer, 404 in all languages: `src/i18n/ui.ts`.
- Styles: `public/style.css`. Images: `public/` (serve AVIF with WebP fallback, see `scripts/make-avif.py`
  and `scripts/wrap-picture.py`).
- New page: add `src/pages/<name>.astro` (copy a similar page), then extract/translate/build as above.
  The sitemap and hreflang links update themselves.
- Before pushing: `npm test` and `npm run build` must pass.

## Never

- Rename or remove pages, or change `build.format` in `astro.config.mjs`: every URL (`/faq.html`,
  `/es/faq.html`) is indexed by Google. Moving to Cloudflare Pages would redirect `/faq.html` to `/faq`;
  that is why the site runs on a Worker (`worker/index.js`).
- Touch the mail DNS records: MX (Network Solutions), and `imap`, `pop`, `smtp`, `mail`, `autodiscover`
  must stay DNS only (grey cloud) or email clients stop working. Keep the `google-site-verification` TXT
  records. The zone as of the move: `docs/dns-backup-2026-09-30.json`.
- Change the brand look (black and gold, Cormorant Garamond + Montserrat) without the owner's OK.

## Facts

Domain registrar: Network Solutions, paid until 24.04.2027; nameservers on Cloudflare since 30.09.2026.
Mail info@onyxexecmiami.com: Network Solutions. Analytics: GA4 `G-0NQL5L01ZD`. Booking widget: Moovs.
Phone/WhatsApp +1 786 931 6699. More detail: `README.md`.
