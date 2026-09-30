// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// URLs are the ones Google already indexes: /faq.html, /es/, /ru/.
// build.format 'preserve': faq.astro -> faq.html, es/index.astro -> es/index.html.
// Do not change it: every URL on the live site depends on this.
export default defineConfig({
  site: 'https://onyxexecmiami.com',
  build: { format: 'preserve' },
  // Brand fonts, downloaded at build time and served from the site itself (no request to Google).
  // Weights match what the site used from Google Fonts; cyrillic is for the Russian pages.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-display',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Montserrat',
      cssVariable: '--font-body',
      weights: [300, 400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
      fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    },
  ],
});
