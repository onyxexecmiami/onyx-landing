// Blocks inside .wrap that are much narrower than the wrap and hug its left edge (big empty space on the right).
import { launch } from './browser.mjs';
const b = await launch();
const [root, ...paths] = process.argv.slice(2);
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await p.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const agg = {};
for (const path of paths) {
  await p.goto(root + path);
  await p.addStyleTag({ content: '*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}' });
  const found = await p.evaluate(() => {
    const out = [];
    for (const w of document.querySelectorAll('main .wrap')) { if (w.matches('.split, .page-hero *, .hero *, .cta-band *')) continue;
      const wr = w.getBoundingClientRect(); const cs = getComputedStyle(w);
      const inner = wr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const left = wr.left + parseFloat(cs.paddingLeft);
      for (const c of w.children) {
        const r = c.getBoundingClientRect();
        if (r.height < 120 || r.width === 0) continue;
        const gapR = left + inner - r.right, gapL = r.left - left;
        if (gapR > inner * 0.18 && gapL < 8) {
          const cls = c.tagName.toLowerCase() + (c.className ? '.' + String(c.className).split(' ').filter(x => x !== 'reveal' && x !== 'in').join('.') : '');
          out.push({ cls, w: Math.round(r.width), inner: Math.round(inner), h: Math.round(r.height), style: (c.getAttribute('style') || '').slice(0, 60) });
        }
      }
    }
    return out;
  });
  for (const f of found) { const k = f.cls + (f.style ? ` [${f.style}]` : ''); (agg[k] ??= { n: 0, pages: [], w: f.w, inner: f.inner, h: f.h }).n++; if (agg[k].pages.length < 3) agg[k].pages.push(path); }
}
for (const [k, v] of Object.entries(agg).sort((a, b) => b[1].n - a[1].n)) console.log(v.n, k, `w=${v.w}/${v.inner} h=${v.h}`, v.pages.join(' '));
await b.close();
