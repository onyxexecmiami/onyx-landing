import { launch } from './browser.mjs';
const b = await launch();
const R = process.env.BASE || 'http://127.0.0.1:8799';
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
await ctx.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const ok = (name, cond, extra = '') => console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : ''));
const p = await ctx.newPage();

// 1. mobile menu
await p.goto(R + '/faq.html');
const menuOpen = () => p.evaluate(() => document.querySelector('.mobile-menu').classList.contains('open'));
ok('menu closed at start', !(await menuOpen()));
await p.tap('.nav-toggle'); await p.waitForTimeout(400);
ok('menu opens on tap', await menuOpen());
ok('page scroll locked while open', await p.evaluate(() => document.body.style.overflow === 'hidden'));
const inView = await p.evaluate(() => { const r = document.querySelector('.mobile-menu').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; });
ok('menu slides fully on screen', inView);
await p.tap('.menu-backdrop', { position: { x: 20, y: 400 } }); await p.waitForTimeout(400);
ok('tap outside closes menu', !(await menuOpen()));
ok('page scroll unlocked after close', await p.evaluate(() => document.body.style.overflow === ''));
await p.tap('.nav-toggle'); await p.waitForTimeout(400);
await Promise.all([p.waitForNavigation(), p.tap('.mobile-menu a[href$="fleet.html"]')]);
ok('menu link navigates', p.url().endsWith('/fleet.html'), p.url());

// 2. language switch on the same page
await Promise.all([p.waitForNavigation(), p.tap('.util-lang a[hreflang="ru"]')]);
ok('language switch keeps the page', p.url().endsWith('/ru/fleet.html'), p.url());
ok('russian page has lang=ru', (await p.getAttribute('html', 'lang')) === 'ru');

// 3. persona tabs + carousel on home
for (const lang of ['', 'es/', 'ru/']) {
  await p.goto(R + '/' + lang);
  const tabs = await p.$$('.persona-tab');
  if (tabs.length > 1) {
    await tabs[1].tap(); await p.waitForTimeout(200);
    const active = await p.evaluate(() => [...document.querySelectorAll('.persona-panel')].findIndex(x => x.classList.contains('active')));
    ok(`/${lang} persona tab switches panel`, active === 1);
  }
  const sc = await p.evaluate(() => { const c = document.querySelector('#reviews .cards'); if (!c) return null; c.scrollLeft = 300; return c.scrollLeft; });
  ok(`/${lang} reviews carousel scrolls sideways`, sc > 0, 'scrollLeft=' + sc);
}

// 4. FAQ details
await p.goto(R + '/es/faq.html');
await p.tap('details summary');
ok('FAQ answer opens on tap', await p.evaluate(() => document.querySelector('details').open));

// 5. booking forms -> WhatsApp message
for (const path of ['/contact.html', '/es/contact.html', '/ru/contact.html', '/', '/ru/']) {
  await p.goto(R + path);
  await p.evaluate(() => { window.__opened = null; window.open = (u) => { window.__opened = u; return null; }; });
  const has = await p.$('#sendBtn');
  if (!has) { ok(path + ' has booking form', false); continue; }
  await p.fill('#f-name', 'Test Name').catch(() => {});
  await p.fill('#f-phone', '+1 305 000 0000').catch(() => {});
  await p.fill('#f-from', 'MIA').catch(() => {});
  await p.fill('#f-to', 'Brickell').catch(() => {});
  await p.tap('#sendBtn'); await p.waitForTimeout(200);
  const url = await p.evaluate(() => window.__opened);
  const text = url ? decodeURIComponent(url.split('text=')[1] || '') : '';
  ok(path + ' form opens WhatsApp with the details', !!url && url.startsWith('https://wa.me/17869316699') && text.includes('Test Name') && text.includes('MIA'), text.split('\n').slice(0, 3).join(' | '));
}

// 6. sticky call bar
await p.goto(R + '/ru/mia-airport.html');
const bar = await p.evaluate(() => { const m = document.querySelector('.mbar'); const r = m.getBoundingClientRect(); return { vis: getComputedStyle(m).display, bottom: Math.round(r.bottom), links: [...m.querySelectorAll('a')].map(a => a.getAttribute('href').slice(0, 30) + ' ' + a.textContent) }; });
ok('call/WhatsApp bar pinned to bottom', bar.vis !== 'none' && bar.bottom === 844, JSON.stringify(bar.links));
await b.close();
