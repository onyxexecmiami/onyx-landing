import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addMissingOg } from '../integrations/og-defaults.mjs';

const page = (head) => `<html lang="es"><head><title>Título "x"</title><meta name="description" content="Desc"><link rel="canonical" href="https://onyxexecmiami.com/es/faq.html">${head}</head><body></body></html>`;

test('adds all missing tags from the page itself', () => {
  const out = addMissingOg(page(''));
  assert.match(out, /og:title" content="Título &quot;x&quot;"/);
  assert.match(out, /og:url" content="https:\/\/onyxexecmiami.com\/es\/faq.html"/);
  assert.match(out, /og:locale" content="es_US"/);
  assert.match(out, /og:image" content="https:\/\/onyxexecmiami.com\/suburban-rooftop-skyline.jpg"/);
});

test('keeps tags the page already has', () => {
  const out = addMissingOg(page('<meta property="og:image" content="https://onyxexecmiami.com/a.webp"><meta property="og:title" content="Own">'));
  assert.equal((out.match(/og:image"/g) || []).length, 1);
  assert.equal((out.match(/og:title"/g) || []).length, 1);
  assert.match(out, /og:description" content="Desc"/);
});
