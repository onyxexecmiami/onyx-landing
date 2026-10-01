// Every grid / wrapping flex container: rows by actual position; report when the last row is shorter than the others
// and leaves a large empty space on the right (orphan cards).
import { launch } from './browser.mjs';
const b = await launch();
const [root, ...paths] = process.argv.slice(2);
for (const w of (process.env.WIDTHS || '1920,1440,1024,768').split(',').map(Number)) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  for (const path of paths) {
    await p.goto(root + path);
    const res = await p.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('main *')) {
        const cs = getComputedStyle(el);
        const isGrid = cs.display === 'grid' || cs.display === 'inline-grid';
        const isWrapFlex = cs.display === 'flex' && cs.flexWrap === 'wrap' && cs.flexDirection.startsWith('row');
        if (!isGrid && !isWrapFlex) continue;
        if (cs.overflowX === 'auto') continue;
        const kids = [...el.children].filter(k => { const r = k.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(k).position !== 'absolute'; });
        if (kids.length < 2) continue;
        const rows = [];
        for (const k of kids) { const t = Math.round(k.getBoundingClientRect().top); let r = rows.find(r => Math.abs(r.t - t) < 4); if (!r) rows.push(r = { t, items: [] }); r.items.push(k); }
        if (rows.length < 2) continue;
        const cols = Math.max(...rows.map(r => r.items.length));
        const last = rows[rows.length - 1];
        if (last.items.length >= cols) continue;
        const box = el.getBoundingClientRect();
        const lastRight = Math.max(...last.items.map(k => k.getBoundingClientRect().right));
        const empty = box.right - lastRight;
        if (empty < box.width * 0.25) continue;
        // skip button rows / small inline things
        if (Math.max(...kids.map(k => k.getBoundingClientRect().height)) < 60) continue;
        const head = el.closest('section')?.querySelector('h2')?.textContent.trim().slice(0, 45) || '';
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0] || '(inline)'} ${kids.length} items in rows of ${cols}, last row ${last.items.length} — «${head}»`);
      }
      return out;
    });
    for (const r of res) console.log(w, path, r);
  }
  await p.close();
}
await b.close();
