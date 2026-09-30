"""Keep translations when an English edit renumbers keys.

Keys are numbered in page order, so inserting or deleting a paragraph shifts every key after it.
Run BEFORE extracting:  python3 scripts/i18n-rekey.py save <page>     (remembers the current English)
edit the English page, then:  python3 scripts/i18n-extract.py && python3 scripts/i18n-rekey.py apply <page>
Every translation (and its _source snapshot) moves to the new key that holds the same English text.
Keys with new English text are left out; i18n-check.py then lists them as missing — translate those.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE = os.path.join(ROOT, '.i18n-rekey')
cmd, page = sys.argv[1], sys.argv[2]
en_path = os.path.join(ROOT, 'translations/en', page + '.json')
os.makedirs(SAVE, exist_ok=True)
saved = os.path.join(SAVE, page + '.json')

if cmd == 'save':
    json.dump(json.load(open(en_path)), open(saved, 'w'), ensure_ascii=False, indent=1)
    print(f'saved English keys of {page}')
    sys.exit(0)

old, new = json.load(open(saved)), json.load(open(en_path))
text_to_old = {}
for k, v in old.items():
    text_to_old.setdefault((k[0], v), k)
for lang in sorted(os.listdir(os.path.join(ROOT, 'translations'))):
    if lang == 'en':
        continue
    for sub in ('', '_source'):
        p = os.path.join(ROOT, 'translations', lang, sub, page + '.json')
        if not os.path.exists(p):
            continue
        tr = json.load(open(p))
        out = {}
        for k, v in new.items():
            ok = text_to_old.get((k[0], v))
            if ok and ok in tr:
                out[k] = tr[ok] if sub == '' else v
        json.dump(out, open(p, 'w'), ensure_ascii=False, indent=1)
        if sub == '':
            print(f'{lang}: kept {len(out)} of {len(new)} keys, to translate: {sorted(set(new) - set(out), key=lambda x: (x[0], int(x[1:])))}')
os.remove(saved)
