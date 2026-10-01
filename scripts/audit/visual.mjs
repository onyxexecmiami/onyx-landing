// Visual defect checks per page (known, accepted: the hidden table caption .sr-only reports as clipped;
// a few long ES/RU buttons wrap to two lines on 360px phones): overlapping text, distorted images, clipped text, two-line buttons, big empty gaps.
import { launch } from './browser.mjs';
const b = await launch();
const [root, ...paths] = process.argv.slice(2);
const agg = {};
for (const w of (process.env.WIDTHS || '1440,390').split(',').map(Number)) {
  const ctx = await b.newContext(w < 600 ? { viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: 900 } });
  await ctx.route('**/*', r => ['127.0.0.1','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort());
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(root + path);
    await p.addStyleTag({ content: '*{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}' });
    await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(600);
    const found = await p.evaluate(() => {
      const out = [];
      const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && !el.closest('.mobile-menu,.menu-backdrop,.nav-drop-panel,.mbar,[hidden],details:not([open]) .ans'); };
      const main = document.querySelector('main');
      // 1. overlapping text blocks (leaf text elements whose boxes intersect)
      const leaves = [...main.querySelectorAll('h1,h2,h3,h4,p,li,a.btn,summary,td,th,label,span.nf-tile-label')].filter(vis);
      const boxes = leaves.map(e => [e, e.getBoundingClientRect()]);
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const [a, ra] = boxes[i], [c, rc] = boxes[j];
        if (a.contains(c) || c.contains(a)) continue;
        const ix = Math.min(ra.right, rc.right) - Math.max(ra.left, rc.left), iy = Math.min(ra.bottom, rc.bottom) - Math.max(ra.top, rc.top);
        if (ix > 6 && iy > 6) out.push(['overlap', `${a.tagName}«${a.textContent.trim().slice(0,25)}» × ${c.tagName}«${c.textContent.trim().slice(0,25)}»`]);
      }
      // 2. distorted images
      for (const img of main.querySelectorAll('img')) {
        if (!vis(img) || !img.naturalWidth) continue;
        const r = img.getBoundingClientRect(); const fit = getComputedStyle(img).objectFit;
        if (fit === 'cover' || fit === 'contain') continue;
        const d = (r.width / r.height) / (img.naturalWidth / img.naturalHeight);
        if (d > 1.04 || d < 0.96) out.push(['distorted image', `${img.currentSrc.split('/').pop()} ${Math.round(r.width)}x${Math.round(r.height)} vs ${img.naturalWidth}x${img.naturalHeight}`]);
      }
      // 3. clipped text
      for (const el of main.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (!vis(el) || !['hidden','clip'].includes(cs.overflow) && !['hidden','clip'].includes(cs.overflowY)) continue;
        if (el.matches('.nf-media,picture,.feat-img,.thumb,.hero-media') || !el.textContent.trim()) continue;
        if (el.scrollHeight > el.clientHeight + 3 || el.scrollWidth > el.clientWidth + 3) out.push(['clipped text', `${el.tagName}.${el.className} «${el.textContent.trim().slice(0,30)}»`]);
      }
      // 4. buttons wrapping to two lines
      for (const btn of main.querySelectorAll('.btn,.nav-cta')) {
        if (!vis(btn)) continue; const lh = parseFloat(getComputedStyle(btn).lineHeight) || 20; const r = btn.getBoundingClientRect();
        const pad = parseFloat(getComputedStyle(btn).paddingTop) + parseFloat(getComputedStyle(btn).paddingBottom);
        if (r.height - pad > lh * 1.6) out.push(['two-line button', `«${btn.textContent.trim().slice(0,40)}» ${Math.round(r.width)}px`]);
      }
      // 5. big empty vertical gaps inside a section (no content for > 260px)
      for (const sec of main.querySelectorAll('section')) {
        const r = sec.getBoundingClientRect(); if (r.height < 400) continue;
        if (sec.querySelector('input,select,textarea')) continue; // forms: field rows measure as gaps, checked by eye
        const items = [...sec.querySelectorAll('h1,h2,h3,p,li,img,picture,table,summary,.card,a.btn,.figure,.rule,input,select,textarea,button,label')].filter(vis).map(e => e.getBoundingClientRect()).filter(x => x.height > 0).sort((a, b) => a.top - b.top);
        let bottom = r.top + parseFloat(getComputedStyle(sec).paddingTop);
        for (const x of items) { if (x.top - bottom > 260) out.push(['empty gap', `${Math.round(x.top - bottom)}px in section «${(sec.querySelector('h2,h1')?.textContent || '').trim().slice(0,30)}»`]); bottom = Math.max(bottom, x.bottom); }
      }
      return out;
    });
    for (const [kind, what] of found) { const k = `${w} ${kind}: ${what}`; (agg[k] ??= []).push(path); }
  }
  await ctx.close();
}
const rows = Object.entries(agg);
for (const [k, v] of rows) console.log(v.length, k, '|', v.slice(0, 3).join(' '));
console.log('distinct findings:', rows.length);
await b.close();
