// Inside every section: the left edges of its content blocks must line up (or the block is centred).
// Reports sections where visible blocks start at different x without being centred.
import { launch } from './browser.mjs';
const b = await launch();
const [root, ...paths] = process.argv.slice(2);
for (const w of [1920, 1280]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  for (const path of paths) {
    await p.goto(root + path);
    const bad = await p.evaluate(() => {
      const out = [];
      for (const sec of document.querySelectorAll('main section:not(.cta-band)')) {
        const wraps = [...sec.children].filter(c => c.classList.contains('wrap'));
        const lefts = wraps.map(wr => { const r = wr.getBoundingClientRect(), cs = getComputedStyle(wr); return Math.round(r.left + parseFloat(cs.paddingLeft)); });
        if (new Set(lefts).size > 1) out.push(`«${(sec.querySelector('h2,h1')?.textContent || '').trim().slice(0, 40)}» wraps start at ${[...new Set(lefts)].join('/')}`);
      }
      return out;
    });
    for (const x of bad) console.log(w, path, x);
  }
  await p.close();
}
await b.close();
