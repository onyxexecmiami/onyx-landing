// The list of pages that exist, per language. One source for sitemap.xml and the human sitemap page.
import { LANGS, pageUrl, type Lang } from './ui';

const files = Object.keys(import.meta.glob('../pages/**/*.astro'));

export function pagesOf(lang: Lang): Set<string> {
  const dir = lang === 'en' ? '../pages/' : `../pages/${lang}/`;
  return new Set(
    files
      .filter((f) => f.startsWith(dir) && !f.slice(dir.length).includes('/'))
      .map((f) => f.slice(dir.length).replace(/\.astro$/, '.html'))
      .filter((p) => p !== '404.html'),
  );
}

export const byLang = (): Record<Lang, Set<string>> =>
  Object.fromEntries(LANGS.map((l) => [l, pagesOf(l)])) as Record<Lang, Set<string>>;

export const sortPages = (set: Set<string>) =>
  [...set].sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));

export { LANGS, pageUrl };
