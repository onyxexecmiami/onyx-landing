"""Check translations/<lang>/<page>.json against translations/en/<page>.json.

Reports: missing or extra keys, HTML segments whose tags/attributes changed (translators must only
change text between tags), untranslated segments (identical to English with 4+ letter words),
line breaks in form labels. Exit code 1 on any error.
Usage: python3 scripts/i18n-check.py es [page ...]
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAG = re.compile(r'<[^>]+>')
KEEP = re.compile(r'^[\s\d\W]*$|^(?:WhatsApp|ONYX|Onyx Executive Miami|Zelle|FBO|MIA|FLL|PBI|DJT|OPF|SUV|COI|Instagram|Blog|Email|E-mail)[\s\W]*$', re.I)

def main():
    lang, pages = sys.argv[1], sys.argv[2:]
    if not pages:
        pages = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'translations/en/*.json')))
    errors = 0
    for page in pages:
        en = json.load(open(os.path.join(ROOT, 'translations/en', page + '.json')))
        path = os.path.join(ROOT, 'translations', lang, page + '.json')
        if not os.path.exists(path):
            print(f'{page}: MISSING FILE'); errors += 1; continue
        try:
            tr = json.load(open(path))
        except ValueError as e:
            print(f'{page}: BAD JSON {e}'); errors += 1; continue
        probs = []
        for k in en.keys() - tr.keys(): probs.append(f'missing key {k}')
        for k in tr.keys() - en.keys(): probs.append(f'extra key {k}')
        same = []
        for k, src in en.items():
            if k not in tr or not isinstance(tr[k], str):
                continue
            t = tr[k]
            if TAG.findall(src) != TAG.findall(t):
                probs.append(f'{k}: tags changed\n      en: {TAG.findall(src)[:6]}\n      {lang}: {TAG.findall(t)[:6]}')
            if k.startswith('j') and '\n' in t:
                probs.append(f'{k}: line break in form label')
            text = TAG.sub('', src)
            if k.startswith('j') and re.fullmatch(r'[a-z]+(?:-[a-z]+)+', src):
                continue  # element id, kept as is by i18n-build.py
            # names, addresses and codes stay as they are; only running text with lowercase words counts
            if t == src and re.search(r'\b[a-z]{4,}\b', text) and not KEEP.match(text):
                same.append(k)
        if len(same) > max(3, len(en) // 10):
            probs.append(f'{len(same)} segments identical to English (untranslated?): {same[:8]}')
        if probs:
            errors += 1
            print(f'{page}: ' + '\n  '.join([''] + probs))
        else:
            print(f'{page}: ok ({len(en)} keys)')
    sys.exit(1 if errors else 0)

main()
