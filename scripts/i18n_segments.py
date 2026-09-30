"""Find the translatable pieces of an English page (src/pages/<name>.astro).

A segment is a (start, end, kind, text) range in the file:
  html  - innerHTML of the smallest block holding only inline markup (<p>, <li>, <h2>, a button...),
          or a run of text/inline elements sitting between blocks; inline tags stay inside the text
  attr  - alt / title / aria-label / placeholder, and meta description / og / twitter texts
  wa    - the ?text= message of a wa.me link (stored decoded)
  js    - a label in the WhatsApp message a contact form composes (var t=[...])
  ld    - a string in JSON-LD (name, text, description, headline...), key path in `path`

Used by i18n-extract.py (English -> translations/en/*.json) and i18n-build.py (translations -> pages).
"""
import json, re
from html.parser import HTMLParser
from urllib.parse import unquote

INLINE = {'a', 'b', 'strong', 'em', 'i', 'span', 'br', 'small', 'sup', 'sub', 'abbr', 'u', 'mark',
          'code', 'time', 'cite', 'q', 's', 'img', 'wbr'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
SKIP = {'script', 'style', 'svg', 'noscript'}
ATTRS = ('alt', 'title', 'aria-label', 'placeholder')
META_TEXT = {'description', 'og:title', 'og:description', 'og:image:alt', 'twitter:title',
             'twitter:description', 'twitter:image:alt'}
LD_KEYS = {'name', 'text', 'description', 'headline', 'alternativeHeadline', 'caption', 'reviewBody',
           'articleSection', 'serviceType', 'disambiguatingDescription', 'slogan', 'abstract'}
LETTERS = re.compile(r'[A-Za-z]')


class Node:
    def __init__(self, tag, start, inner_start, attrs, parent):
        self.tag, self.start, self.inner_start, self.attrs, self.parent = tag, start, inner_start, attrs, parent
        self.children = []  # Node or ('text', start, end)
        self.inner_end = self.end = None


class Tree(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src = src
        self.lines = [0]
        for m in re.finditer('\n', src):
            self.lines.append(m.end())
        self.root = Node('#root', 0, 0, [], None)
        self.cur = self.root

    def off(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        start = self.off()
        text = self.get_starttag_text()
        n = Node(tag, start, start + len(text), attrs, self.cur)
        self.cur.children.append(n)
        # Astro components (<SiteHeader ... />) and void/self-closing tags have no content
        if tag in VOID or text.endswith('/>'):
            n.inner_end = n.end = start + len(text)
        else:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        start = self.off()
        text = self.get_starttag_text()
        n = Node(tag, start, start + len(text), attrs, self.cur)
        n.inner_end = n.end = start + len(text)
        self.cur.children.append(n)

    def handle_endtag(self, tag):
        pos = self.off()
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is self.root:
            return  # stray end tag
        # close everything up to and including node
        c = self.cur
        while True:
            c.inner_end = pos
            c.end = self.src.index('>', pos) + 1
            if c is node:
                break
            c = c.parent
        self.cur = node.parent

    def handle_data(self, data):
        start = self.off()
        self.cur.children.append(('text', start, start + len(data)))

    def handle_comment(self, data):
        pass


def all_inline(n):
    if isinstance(n, tuple):
        return True
    if n.tag not in INLINE:
        return False
    return all(all_inline(c) for c in n.children)


def text_of(src, n):
    if isinstance(n, tuple):
        return src[n[1]:n[2]]
    return re.sub(r'<[^>]+>', '', src[n.inner_start:n.inner_end] if n.inner_end is not None else '')


def segments(src):
    """Return a list of dicts {start, end, kind, text[, path]} sorted by start."""
    body_start = src.index('\n---\n', 3) + 5 if src.startswith('---\n') else 0
    tree = Tree(src)
    tree.feed(src[:])
    tree.close()
    segs = []

    def add_run(run):
        if not run:
            return
        start = run[0][1] if isinstance(run[0], tuple) else run[0].start
        end = run[-1][2] if isinstance(run[-1], tuple) else run[-1].end
        raw = src[start:end]
        lead = len(raw) - len(raw.lstrip())
        trail = len(raw) - len(raw.rstrip())
        start, end = start + lead, end - trail
        if start < body_start:
            return
        if start < end and LETTERS.search(re.sub(r'<[^>]+>', '', src[start:end])):
            segs.append({'start': start, 'end': end, 'kind': 'html', 'text': src[start:end]})

    def walk(n):
        if isinstance(n, tuple):
            return
        if n.tag in SKIP or n.tag[:1].isupper():
            return
        if n.start < body_start and n is not tree.root:
            return
        if n is not tree.root and n.inner_end is not None and n.children and all(all_inline(c) for c in n.children) and n.tag not in INLINE:
            add_run(n.children)
            return
        run = []
        for c in n.children:
            if all_inline(c):
                run.append(c)
            else:
                add_run(run)
                run = []
                walk(c)
        add_run(run)

    walk(tree.root)

    # attributes, meta texts, wa.me messages
    for m in re.finditer(r'<([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|\'[^\']*\'))?)*)\s*/?>', src):
        if m.start() < body_start or re.match(r'<script', src[m.start():m.start() + 7]):
            continue
        tag, attrs = m.group(1), m.group(2)
        base = m.start() + 1 + len(tag)
        for am in re.finditer(r'\s([\w:-]+)="([^"]*)"', attrs):
            name, val = am.group(1), am.group(2)
            vs = base + am.start(2)
            ve = base + am.end(2)
            if name in ATTRS and LETTERS.search(val):
                segs.append({'start': vs, 'end': ve, 'kind': 'attr', 'text': val})
            elif tag == 'meta' and name == 'content':
                key = re.search(r'(?:name|property)="([^"]+)"', attrs)
                if key and key.group(1) in META_TEXT and LETTERS.search(val):
                    segs.append({'start': vs, 'end': ve, 'kind': 'attr', 'text': val})
            elif name == 'href' and 'wa.me/' in val and '?text=' in val:
                q = val.index('?text=') + 6
                end = val.find('&', q)
                end = len(val) if end < 0 else end
                segs.append({'start': vs + q, 'end': vs + end, 'kind': 'wa', 'text': unquote(val[q:end])})

    # JS form labels: string literals inside var t=[ ... ];
    for sm in re.finditer(r'<script is:inline>(.*?)</script>', src, re.S):
        tm = re.search(r'var t=\[(.*?)\];', sm.group(1), re.S)
        if not tm:
            continue
        off = sm.start(1) + tm.start(1)
        for lm in re.finditer(r"'((?:[^'\\]|\\.)*)'", tm.group(1)):
            if LETTERS.search(lm.group(1)):
                segs.append({'start': off + lm.start(1), 'end': off + lm.end(1), 'kind': 'js', 'text': lm.group(1)})

    # JSON-LD strings
    for sm in re.finditer(r'<script is:inline type="application/ld\+json">(.*?)</script>', src, re.S):
        data = json.loads(sm.group(1))
        found = []

        def walk_ld(v, path):
            if isinstance(v, dict):
                for k, x in v.items():
                    if k in LD_KEYS and isinstance(x, str) and LETTERS.search(x):
                        found.append((path + [k], x))
                    else:
                        walk_ld(x, path + [k])
            elif isinstance(v, list):
                for i, x in enumerate(v):
                    if isinstance(x, str) and path and path[-1] in LD_KEYS and LETTERS.search(x):
                        found.append((path + [i], x))
                    else:
                        walk_ld(x, path + [i])
        walk_ld(data, [])
        for p, x in found:
            segs.append({'start': sm.start(1), 'end': sm.end(1), 'kind': 'ld', 'text': x, 'path': p})

    segs.sort(key=lambda s: (s['start'], s['end']))
    return segs
