#!/usr/bin/env python3
"""Builds dist/llms-full.txt: the readable text of every English page of the built site, for AI assistants.
Runs after `astro build` (see package.json). Reads dist/sitemap.xml for the page list, so a new page appears here by itself.
Only the main content of each page is taken: no menu, footer, scripts, forms or markup."""
import re, html, sys, os
from html.parser import HTMLParser

DIST = os.path.join(os.path.dirname(__file__), '..', 'dist')
BASE = 'https://onyxexecmiami.com'
SKIP = {'script', 'style', 'svg', 'noscript', 'template', 'form', 'button', 'select', 'textarea', 'iframe', 'picture', 'figure'}
BLOCK = {'p', 'div', 'section', 'ul', 'ol', 'li', 'tr', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'summary', 'details', 'article', 'aside', 'blockquote', 'dl', 'dt', 'dd', 'header', 'footer', 'main', 'br'}

class Main(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False; self.depth_skip = 0; self.depth = 0; self.skip_tags = []
        self.out = []; self.cur = []; self.prefix = ''; self.in_cell = False; self.row = []
    def flush(self):
        t = re.sub(r'\s+', ' ', ''.join(self.cur)).strip()
        if t: self.out.append(self.prefix + t)
        self.cur = []; self.prefix = ''
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'main': self.in_main = True; return
        if not self.in_main: return
        if tag in SKIP or (tag == 'a' and 'btn' in (a.get('class') or '').split()): self.depth_skip += 1; self.skip_tags.append(tag); return
        if self.depth_skip: return
        if tag in ('td', 'th'): self.in_cell = True; self.cur = []; return
        if tag in ('em', 'i', 'b', 'strong', 'span', 'a'): self.cur.append(' ')
        if tag in BLOCK: self.flush()
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5'): self.prefix = '#' * (int(tag[1]) + 1) + ' '
        elif tag == 'li': self.prefix = '- '
    def handle_endtag(self, tag):
        if tag == 'main': self.flush(); self.in_main = False; return
        if not self.in_main: return
        if self.skip_tags and tag == self.skip_tags[-1]:
            self.skip_tags.pop(); self.depth_skip = max(0, self.depth_skip - 1); return
        if self.depth_skip: return
        if tag in ('td', 'th'):
            self.row.append(re.sub(r'\s+', ' ', ''.join(self.cur)).strip()); self.cur = []; self.in_cell = False; return
        if tag == 'tr':
            cells = [c for c in self.row if c]
            if cells: self.out.append(' | '.join(cells))
            self.row = []; return
        if tag in BLOCK: self.flush()
    def handle_data(self, data):
        if self.in_main and not self.depth_skip: self.cur.append(data)

def join_body(lines):
    out = ''
    for i, l in enumerate(lines):
        if i: out += '\n' if (l.startswith('- ') and lines[i - 1].startswith('- ')) else '\n\n'
        out += l
    return out

def page_text(path):
    raw = open(path, encoding='utf8').read()
    title = html.unescape((re.search(r'<title>(.*?)</title>', raw, re.S) or [0, ''])[1]).strip()
    desc = html.unescape((re.search(r'name="description" content="(.*?)"', raw, re.S) or [0, ''])[1]).strip()
    p = Main(); p.feed(raw); p.flush()
    body = []
    for line in p.out:
        if body and body[-1] == line: continue
        body.append(line)
    return title, desc, body

def main():
    sm = open(os.path.join(DIST, 'sitemap.xml'), encoding='utf8').read()
    urls = [u for u in re.findall(r'<loc>([^<]+)</loc>', sm) if '/es/' not in u and '/ru/' not in u]
    head = open(os.path.join(DIST, 'llms.txt'), encoding='utf8').read().split('\n## Services')[0].rstrip()
    parts = [head.replace('# Onyx Executive Miami', '# Onyx Executive Miami: full site text', 1),
             '\nThis file holds the text of every English page of onyxexecmiami.com. Spanish and Russian versions live under /es/ and /ru/. Short index: ' + BASE + '/llms.txt\n']
    n = 0
    for u in urls:
        rel = u[len(BASE):].lstrip('/') or 'index.html'
        f = os.path.join(DIST, rel if rel.endswith('.html') else rel + 'index.html')
        if not os.path.exists(f): print('missing', f, file=sys.stderr); continue
        title, desc, body = page_text(f)
        parts.append('\n---\n\n# PAGE: ' + title + '\nURL: ' + u + ('\nSummary: ' + desc if desc else '') + '\n\n' + join_body(body))
        n += 1
    out = '\n'.join(parts).rstrip() + '\n'
    open(os.path.join(DIST, 'llms-full.txt'), 'w', encoding='utf8').write(out)
    print(f'llms-full.txt: {n} pages, {len(out.split())} words')

main()
