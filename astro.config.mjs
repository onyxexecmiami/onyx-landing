// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import ogDefaults from './integrations/og-defaults.mjs';

// URLs are the ones Google already indexes: /faq.html, /es/, /ru/.
// build.format 'preserve': faq.astro -> faq.html, es/index.astro -> es/index.html.
// Do not change it: every URL on the live site depends on this.
export default defineConfig({
  site: 'https://onyxexecmiami.com',
  build: { format: 'preserve' },
  integrations: [ogDefaults()],
  // Fonts (Source Serif 4 headings, Plus Jakarta Sans text, Manrope for Cyrillic), downloaded at build time and served from the site itself (no request to Google).
  // Weights match what the site used from Google Fonts; cyrillic is for the Russian pages.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-display',
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    },
    {
      // Plus Jakarta Sans has no basic Cyrillic: the Russian pages fall through to Manrope, a close match.
      provider: fontProviders.google(),
      name: 'Manrope',
      cssVariable: '--font-body-cyr',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
      fallbacks: ['sans-serif'],
    },
  ],
});
