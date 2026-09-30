"""Compare every built page in dist/ with its original hand-written HTML (from git ref ORIG).

Pages are reduced to a token stream (tags, sorted attributes, text with whitespace
collapsed), so formatting differences are ignored and anything else is reported.
Usage: python3 scripts/compare-with-original.py [git-ref]   (default: main)
"""
import re, subprocess, sys, glob, os
from html.parser import HTMLParser

ORIG = sys.argv[1] if len(sys.argv) > 1 else 'main'

class T(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.out = []
    def handle_starttag(s, t, a):
        s.out.append('<%s %s>' % (t, ' '.join('%s=%r' % kv for kv in sorted(a))))
    handle_startendtag = handle_starttag
    def handle_endtag(s, t):
        # Optional/stray end tags browsers fix up, and SVG <path/> written as <path></path>.
        if t not in ('p', 'li', 'div', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'):
            s.out.append('</%s>' % t)
    def handle_data(s, d):
        d = re.sub(r'\s+', ' ', d).strip()
        if d: s.out.append(d)
    def handle_comment(s, d): pass
    def handle_decl(s, d): s.out.append('<!%s>' % d.lower())

def toks(html):
    p = T(); p.feed(html); return p.out

bad = 0
for f in sorted(glob.glob('dist/**/*.html', recursive=True)):
    rel = f[len('dist/'):]
    orig = subprocess.run(['git', 'show', f'{ORIG}:{rel}'], capture_output=True, text=True).stdout
    if not orig:
        print(f'NEW   {rel}'); continue
    a, b = toks(orig), toks(open(f).read())
    if a == b:
        print(f'same  {rel}')
    else:
        bad += 1
        import difflib
        d = [l for l in difflib.unified_diff(a, b, lineterm='', n=0) if not l.startswith(('---', '+++', '@@'))]
        print(f'DIFF  {rel}: {len(d)} lines'); print('\n'.join(x[:200] for x in d[:12]))
print('pages with differences:', bad)
sys.exit(1 if bad else 0)
