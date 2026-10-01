// Every page: JS errors, console errors, failed local requests, axe-core (WCAG 2 A/AA) violations.
import { launch } from './browser.mjs';
import { readFileSync, writeFileSync } from 'fs';
const b = await launch();
const axe = readFileSync(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const [root, out, ...paths] = process.argv.slice(2);
const res = [];
const W = +(process.env.W || 1280);
const ctx = await b.newContext(W < 600 ? { viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: W, height: 900 } });
await ctx.route('**/*', r => { const h = new URL(r.request().url()).hostname; return ['127.0.0.1'].includes(h) ? r.continue() : r.abort('blockedbyclient'); });
for (const path of paths) {
  const p = await ctx.newPage();
  const errs = [], cons = [], failed = [];
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED/.test(m.text())) cons.push(m.text().slice(0, 160)); });
  p.on('requestfailed', r => { if (new URL(r.url()).hostname === '127.0.0.1') failed.push(r.url()); });
  p.on('response', r => { if (new URL(r.url()).hostname === '127.0.0.1' && r.status() >= 400 && !path.includes('404')) failed.push(r.status() + ' ' + r.url()); });
  await p.goto(root + path, { waitUntil: 'load' });
  await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  await p.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));
  await p.waitForTimeout(400);
  await p.addScriptTag({ content: axe });
  const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map(x => ({ id: x.id, impact: x.impact, n: x.nodes.length, help: x.help, t: x.nodes.slice(0, 2).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]) })));
  res.push({ path, errs, cons, failed, v });
  await p.close();
}
writeFileSync(out, JSON.stringify(res, null, 1));
await b.close();
