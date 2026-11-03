// sitemap.xml built from the pages that exist, with hreflang links between language versions.
import type { APIRoute } from 'astro';
import { LANGS, byLang as getByLang, pageUrl, sortPages } from '../i18n/pages';

export const GET: APIRoute = () => {
  const byLang = getByLang();
  const urls: string[] = [];
  for (const lang of LANGS) {
    for (const page of sortPages(byLang[lang])) {
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
