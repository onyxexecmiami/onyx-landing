// Sections whose background differs from the section above but start with (almost) no top padding.
import { launch } from './browser.mjs';
const b = await launch();
const [root, ...paths] = process.argv.slice(2);
for (const w of [1440, 390]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  let n = 0;
  for (const path of paths) {
    await p.goto(root + path);
    const bad = await p.evaluate(() => {
      const secs = [...document.querySelectorAll('main > section, main > div > section')];
      const out = [];
      for (let i = 1; i < secs.length; i++) {
        const a = getComputedStyle(secs[i - 1]).backgroundColor, bgc = getComputedStyle(secs[i]).backgroundColor;
        const pt = parseFloat(getComputedStyle(secs[i]).paddingTop);
        if (a !== bgc && pt < 30) out.push(`${(secs[i].querySelector('h2,h3,.eyebrow')?.textContent || '').trim().slice(0, 30)} (pt=${pt})`);
      }
      return out;
    });
    if (bad.length) { n++; console.log(w, path, bad.join(' | ')); }
  }
  console.log(w, 'pages with tight joins:', n);
  await p.close();
}
await b.close();
