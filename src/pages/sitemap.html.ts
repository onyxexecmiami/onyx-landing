// Human-readable sitemap, served at /sitemap.html and, for people opening /sitemap.xml in a browser, at /sitemap.xml.
// Built from the same page list as sitemap.xml, so a new page shows up here by itself.
import type { APIRoute } from 'astro';
import { LANGS, byLang as getByLang, pageUrl, sortPages } from '../i18n/pages';

const GROUPS: [string, string[]][] = [
  ['Airports and aviation', ['airport-transfers', 'mia-airport', 'fll-airport', 'pbi-airport', 'opa-locka-airport-opf', 'signature-aviation-mia', 'private-aviation', 'cruise-transportation']],
  ['Services', ['corporate', 'executive-chauffeur', 'event-transportation', 'event-art-basel', 'school-transportation', 'long-distance']],
  ['Prices and fleet', ['rates', 'fleet']],
  ['Areas served', ['service-area', 'aventura', 'sunny-isles', 'bal-harbour', 'brickell-downtown-miami', 'miami-beach', 'fort-lauderdale']],
  ['Company', ['the-onyx-standard', 'faq', 'contact']],
  ['Blog and guides', ['blog', 'blog-miami-airports-guide', 'blog-private-chauffeur-vs-rideshare', 'aventura-transportation-guide', 'blog-sunny-isles-restaurants']],
];
const UPPER = new Set(['mia', 'fll', 'pbi', 'opf', 'faq']);
const label = (slug: string) =>
  slug === 'index' ? 'Home' : slug.split('-').map((w) => (UPPER.has(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(' ');
const NAMES: Record<string, string> = { en: 'English', es: 'Español', ru: 'Русский' };

export const GET: APIRoute = () => {
  const byLang = getByLang();
  const slugs = sortPages(byLang.en).map((p) => p.replace(/\.html$/, ''));
  const known = new Set(GROUPS.flatMap(([, s]) => s));
  const groups: [string, string[]][] = [['Home', ['index']], ...GROUPS, ['More', slugs.filter((s) => s !== 'index' && !known.has(s))]];
  const total = LANGS.reduce((n, l) => n + byLang[l].size, 0);
  const rows = groups
    .map(([name, list]) => {
      const present = list.filter((s) => byLang.en.has(s + '.html'));
      if (!present.length) return '';
      const body = present
        .map((s) => {
          const links = LANGS.map((l) =>
            byLang[l].has(s + '.html') ? `<a href="${pageUrl(l, s + '.html').slice('https://onyxexecmiami.com'.length) || '/'}" hreflang="${l}">${l.toUpperCase()}</a>` : `<span class="na">${l.toUpperCase()}</span>`,
          ).join('');
          return `<tr><td class="p"><a href="${pageUrl('en', s + '.html').slice('https://onyxexecmiami.com'.length) || '/'}">${label(s)}</a><span class="u">/${s === 'index' ? '' : s + '.html'}</span></td><td class="l">${links}</td></tr>`;
        })
        .join('\n');
      return `<h2>${name}</h2>\n<table>${body}</table>`;
    })
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow"><title>Sitemap | Onyx Executive Miami</title>
<link rel="icon" href="/favicon.svg?v=5" type="image/svg+xml">
<style>
*{box-sizing:border-box}body{margin:0;background:#0A0A0A;color:#e7e7e2;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:48px 24px 72px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:30px;text-decoration:none}.brand img{width:40px;height:40px}
.brand b{display:block;font:600 20px Georgia,serif;letter-spacing:.3em;color:#fff}.brand i{display:block;font-style:normal;font-size:9px;letter-spacing:.4em;text-transform:uppercase;color:#D4AF37;margin-top:4px}
h1{font:400 clamp(30px,5vw,44px)/1.1 Georgia,serif;margin:0 0 10px;color:#fff}p.lead{color:#a9a9a2;margin:0 0 26px;max-width:62ch}
.stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px}.stat{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 16px;background:rgba(255,255,255,.03)}
.stat b{display:block;font:500 24px Georgia,serif;color:#E3C45F}.stat span{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#8f8f88}
h2{font:600 11px sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#D4AF37;margin:32px 0 10px}
table{width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,.1)}
td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:middle}tr:last-child td{border-bottom:0}tr:hover td{background:rgba(212,175,55,.06)}
td.p a{color:#fff;text-decoration:none;font-weight:500}td.p a:hover{color:#E3C45F}.u{display:block;font-size:12px;color:#a3a39c;word-break:break-all}
td.l{text-align:right;white-space:nowrap}td.l a,td.l .na{display:inline-block;min-width:34px;text-align:center;font-size:11px;letter-spacing:.08em;margin-left:6px;padding:3px 7px;border:1px solid rgba(212,175,55,.45);border-radius:4px;color:#D4AF37;text-decoration:none}
td.l a:hover{background:#D4AF37;color:#0A0A0A}td.l .na{opacity:.25}
.foot{margin-top:34px;color:#a3a39c;font-size:13px}.foot a{color:#a9a9a2}
</style></head><body><main class="wrap">
<a class="brand" href="/"><img src="/onyx-mark.svg?v=5" alt=""><span><b>ONYX</b><i>Executive Miami</i></span></a>
<h1>Sitemap</h1>
<p class="lead">Every page of onyxexecmiami.com, in English, Spanish and Russian. Search engines use the XML version of this list; this page is for people.</p>
<div class="stats"><div class="stat"><b>${total}</b><span>Pages in total</span></div>${LANGS.map((l) => `<div class="stat"><b>${byLang[l].size}</b><span>${NAMES[l]}</span></div>`).join('')}</div>
${rows}
<p class="foot">For search engines and AI assistants: <a href="/sitemap.xml?format=xml">sitemap.xml</a>, <a href="/llms.txt">llms.txt</a>, <a href="/llms-full.txt">llms-full.txt</a>, <a href="/robots.txt">robots.txt</a>.</p>
</main></body></html>
`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
