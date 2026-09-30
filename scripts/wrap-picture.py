"""Wrap every <img> that points at a .webp with an AVIF twin in <picture>.

<picture><source type="image/avif" srcset="x.avif" [sizes]><img src="x.webp" ...></picture>
Browsers without AVIF (iOS < 16) keep the WebP. style.css sets picture{display:contents}
so existing selectors like `.feat-img img` lay out exactly as before. Idempotent.
"""
import glob, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')

def has_avif(path):
    return os.path.exists(os.path.join(PUB, os.path.basename(path)[:-5] + '.avif'))

def wrap(m):
    img = m.group(0)
    src = re.search(r'\ssrc="([^"]+\.webp)"', img)
    if not src or not has_avif(src.group(1)):
        return img
    srcset = re.search(r'\ssrcset="([^"]+)"', img)
    if srcset:
        parts = [p.strip() for p in srcset.group(1).split(',')]
        if not all(has_avif(p.split()[0]) for p in parts):
            return img
        av = ', '.join(re.sub(r'\.webp\b', '.avif', p) for p in parts)
    else:
        av = src.group(1)[:-5] + '.avif'
    sizes = re.search(r'\ssizes="([^"]+)"', img)
    sz = f' sizes="{sizes.group(1)}"' if sizes else ''
    return f'<picture><source type="image/avif" srcset="{av}"{sz} />{img}</picture>'

total = 0
for f in glob.glob(os.path.join(ROOT, 'src/**/*.astro'), recursive=True):
    s = open(f).read()
    # skip imgs already inside <picture>
    parts = re.split(r'(<picture>.*?</picture>)', s, flags=re.S)
    out = []
    for p in parts:
        if p.startswith('<picture>'):
            out.append(p)
        else:
            new = re.sub(r'<img\b[^>]*>', wrap, p)
            total += new.count('<picture>')
            out.append(new)
    s2 = ''.join(out)
    if s2 != s:
        open(f, 'w').write(s2)
print('wrapped', total)
