import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidates, directoryRedirect } from '../worker/index.js';

test('pages keep their .html URLs', () => {
  assert.deepEqual(candidates('/faq.html'), ['/faq.html']);
  assert.deepEqual(candidates('/style.css'), ['/style.css']);
});

test('directories serve index.html', () => {
  assert.deepEqual(candidates('/'), ['/index.html']);
  assert.deepEqual(candidates('/es/'), ['/es/index.html']);
});

test('extensionless path serves the .html page, like GitHub Pages', () => {
  assert.deepEqual(candidates('/faq'), ['/faq.html']);
});

test('directory without trailing slash redirects', () => {
  assert.equal(directoryRedirect('/es'), '/es/');
  assert.equal(directoryRedirect('/es/'), null);
  assert.equal(directoryRedirect('/faq.html'), null);
});
