// sitemap.xml built from the pages that exist, with hreflang links between language versions.
import type { APIRoute } from 'astro';
import { LANGS, pageUrl, type Lang } from '../i18n/ui';

const files = Object.keys(import.meta.glob('./**/*.astro'));

function pagesOf(lang: Lang) {
  const dir = lang === 'en' ? './' : `./${lang}/`;
  return new Set(
    files
      .filter((f) => f.startsWith(dir) && !f.slice(dir.length).includes('/'))
      .map((f) => f.slice(dir.length).replace(/\.astro$/, '.html'))
      .filter((p) => p !== '404.html'),
  );
}

export const GET: APIRoute = () => {
  const byLang = Object.fromEntries(LANGS.map((l) => [l, pagesOf(l)])) as Record<Lang, Set<string>>;
  const urls: string[] = [];
  for (const lang of LANGS) {
    for (const page of [...byLang[lang]].sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)))) {
      const alts = LANGS.filter((l) => byLang[l].has(page))
        .map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(l, page)}"/>`)
        .concat(byLang.en.has(page) ? [`<xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}"/>`] : []);
      urls.push(`<url><loc>${pageUrl(lang, page)}</loc>${alts.join('')}</url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
