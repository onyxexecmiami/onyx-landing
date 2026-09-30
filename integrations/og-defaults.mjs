// After the build, give every page the Open Graph / Twitter tags it is missing, so a link shared in
// WhatsApp, Facebook or iMessage shows a title, description and picture. Values come from the page's own
// <title>, meta description and canonical; tags a page already has are left alone. 404 pages are skipped.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://onyxexecmiami.com';
const IMAGE = { url: `${SITE}/suburban-rooftop-skyline.jpg`, width: 1448, height: 1086 };
const LOCALE = { en: 'en_US', es: 'es_US', ru: 'ru_RU' };

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html') && e.name !== '404.html') yield p;
  }
}

const esc = (s) => s.replace(/"/g, '&quot;');

export function addMissingOg(html) {
  const has = (key) => new RegExp(`<meta (?:property|name)="${key}"`).test(html);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim();
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const lang = html.match(/<html lang="(\w+)"/)?.[1] || 'en';
  if (!title || !canonical) return html;
  const tags = [];
  const add = (attr, key, value) => { if (value !== undefined && !has(key)) tags.push(`<meta ${attr}="${key}" content="${esc(String(value))}">`); };
  add('property', 'og:type', 'website');
  add('property', 'og:site_name', 'Onyx Executive Miami');
  add('property', 'og:title', title);
  add('property', 'og:description', desc);
  add('property', 'og:url', canonical);
  add('property', 'og:locale', LOCALE[lang]);
  if (!has('og:image')) {
    add('property', 'og:image', IMAGE.url);
    add('property', 'og:image:width', IMAGE.width);
    add('property', 'og:image:height', IMAGE.height);
  }
  add('name', 'twitter:card', 'summary_large_image');
  return tags.length ? html.replace('</head>', tags.join('') + '</head>') : html;
}

export default function ogDefaults() {
  return {
    name: 'og-defaults',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        let n = 0;
        for await (const f of htmlFiles(fileURLToPath(dir))) {
          const html = await readFile(f, 'utf8');
          const out = addMissingOg(html);
          if (out !== html) { await writeFile(f, out); n++; }
        }
        logger.info(`added missing Open Graph tags to ${n} pages`);
      },
    },
  };
}
