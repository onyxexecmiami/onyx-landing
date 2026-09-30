// @ts-check
import { defineConfig } from 'astro/config';

// URLs are the ones Google already indexes: /faq.html, /es/, /ru/.
// build.format 'preserve': faq.astro -> faq.html, es/index.astro -> es/index.html.
// Do not change it: every URL on the live site depends on this.
export default defineConfig({
  site: 'https://onyxexecmiami.com',
  build: { format: 'preserve' },
});
