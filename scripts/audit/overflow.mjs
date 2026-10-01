// usage: node overflow.mjs <base> <paths...>  -> pages wider than the window, per width
import { launch } from './browser.mjs';
const browser = await launch();
const [root, ...paths] = process.argv.slice(2);
const widths = (process.env.WIDTHS || '360,390,768,1024,1280,1440,1920').split(',').map(Number);
let bad = 0;
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.route('**/*', r => ['127.0.0.1','localhost','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort());
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(root + path, { waitUntil: 'load' });
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.right > W + 1 && !e.closest('.mobile-menu,.menu-backdrop'); })
        .slice(0, 3).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '') + ':' + (e.textContent || '').trim().slice(0, 30));
      return { sw: document.documentElement.scrollWidth, W, over };
    });
    if (r.over.length) { bad++; console.log(`${w}px ${path}: sticks out ->`, r.over.join(' | ')); }
  }
  await ctx.close();
}
console.log('overflowing page/width pairs:', bad);
await browser.close();
