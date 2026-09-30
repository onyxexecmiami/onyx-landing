"""English pages -> translations/en/<page>.json: every translatable segment under a stable key.

Keys: h<N> html, a<N> attribute, w<N> WhatsApp message, j<N> form label, l<N> JSON-LD string,
numbered in page order. Identical texts within a page share one key, so translators see each once.
"""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from i18n_segments import segments

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'translations', 'en')
os.makedirs(OUT, exist_ok=True)
PREFIX = {'html': 'h', 'attr': 'a', 'wa': 'w', 'js': 'j', 'ld': 'l'}

total = 0
for f in sorted(glob.glob(os.path.join(ROOT, 'src/pages/*.astro'))):
    name = os.path.basename(f)[:-6]
    if name == '404':
        continue
    segs = segments(open(f).read())
    out, seen, counters = {}, {}, {}
    for s in segs:
        k = PREFIX[s['kind']]
        if (k, s['text']) in seen:
            continue
        counters[k] = counters.get(k, 0) + 1
        key = f'{k}{counters[k]}'
        seen[(k, s['text'])] = key
        out[key] = s['text']
    json.dump(out, open(os.path.join(OUT, name + '.json'), 'w'), ensure_ascii=False, indent=1)
    chars = sum(len(v) for v in out.values())
    total += chars
    print(f'{name:42s} {len(out):4d} segments {chars:6d} chars')
print('total chars', total)
