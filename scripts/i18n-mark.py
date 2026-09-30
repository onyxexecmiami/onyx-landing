"""Record which English text each translation was made from.

After translating (or re-translating) pages, run:  python3 scripts/i18n-mark.py es [page ...]
It copies translations/en/<page>.json to translations/<lang>/_source/<page>.json. i18n-check.py then
reports a key as STALE when its English text no longer matches that snapshot.
"""
import glob, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lang, pages = sys.argv[1], sys.argv[2:]
if not pages:
    pages = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'translations/en/*.json')))
dst = os.path.join(ROOT, 'translations', lang, '_source')
os.makedirs(dst, exist_ok=True)
for page in pages:
    shutil.copy(os.path.join(ROOT, 'translations/en', page + '.json'), os.path.join(dst, page + '.json'))
print(f'{lang}: marked {len(pages)} page(s) as translated from the current English')
