"""translations/<lang>/<page>.json + src/pages/<page>.astro -> src/pages/<lang>/<page>.astro

For every English page: put each segment's translation in place (see i18n_segments.py),
then point the page at its language: components get lang=, assets become root-relative,
"/" becomes "/<lang>/", og:url and JSON-LD page URLs move to the translated address.
Page links such as "faq.html" stay relative and resolve inside /<lang>/.

Usage: python3 scripts/i18n-build.py es ru      (missing translation files are reported, not built)
"""
import glob, json, os, re, sys
from urllib.parse import quote
sys.path.insert(0, os.path.dirname(__file__))
from i18n_segments import segments

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://onyxexecmiami.com'
PREFIX = {'html': 'h', 'attr': 'a', 'wa': 'w', 'js': 'j', 'ld': 'l'}
ASSET = re.compile(r'\.(?:css|js|webp|avif|jpe?g|png|svg|gif|ico|pdf)(?:[?#]|$)')
LOCALE = {'es': 'es_US', 'ru': 'ru_RU'}


def keyed(segs):
    """Give each segment the key i18n-extract.py assigned to its text."""
    seen, counters = {}, {}
    for s in segs:
        k = PREFIX[s['kind']]
        if (k, s['text']) not in seen:
            counters[k] = counters.get(k, 0) + 1
            seen[(k, s['text'])] = f'{k}{counters[k]}'
        s['key'] = seen[(k, s['text'])]
    return segs


def wa_encode(text):
    return quote(text, safe='').replace('%2C', '%2C')


def js_escape(text):
    return text.replace('\\', '\\\\').replace("'", "\\'")


def ld_set(data, path, value):
    for p in path[:-1]:
        data = data[p]
    data[path[-1]] = value


def local_url(url, lang, pages):
    """https://onyxexecmiami.com/faq.html#x -> https://onyxexecmiami.com/<lang>/faq.html#x (known pages only)."""
    if not url.startswith(SITE + '/'):
        return url
    path = url[len(SITE) + 1:]
    page, frag = (path.split('#', 1) + [''])[:2]
    if page == '' and frag == 'business':
        return url  # the one business entity shared by all languages
    if page == '' or page in pages:
        return f'{SITE}/{lang}/{page}' + (f'#{frag}' if frag else '')
    return url


def build_page(src, tr, lang, pages):
    segs = keyed(segments(src))
    missing = sorted({s['key'] for s in segs if s['key'] not in tr})
    if missing:
        raise KeyError(f'missing keys: {missing[:10]}')

    # nested attr/wa segments inside an html segment are applied inside its translation
    html = [s for s in segs if s['kind'] == 'html']
    def container(s):
        for h in html:
            if h['start'] <= s['start'] and s['end'] <= h['end'] and h is not s:
                return h
        return None

    edits = []  # (start, end, new)
    for h in html:
        new = tr[h['key']]
        for s in segs:
            if s['kind'] in ('attr', 'wa') and container(s) is h:
                if s['kind'] == 'attr':
                    new = new.replace(f'="{s["text"]}"', f'="{tr[s["key"]]}"')
                else:
                    new = new.replace(src[s['start']:s['end']], wa_encode(tr[s['key']]))
        edits.append((h['start'], h['end'], new))
    for s in segs:
        if s['kind'] in ('attr', 'wa') and container(s) is None:
            new = tr[s['key']] if s['kind'] == 'attr' else wa_encode(tr[s['key']])
            edits.append((s['start'], s['end'], new))
        elif s['kind'] == 'js':
            edits.append((s['start'], s['end'], js_escape(tr[s['key']])))

    # JSON-LD: one edit per script block
    blocks = {}
    for s in segs:
        if s['kind'] == 'ld':
            blocks.setdefault((s['start'], s['end']), []).append(s)
    for m in re.finditer(r'(<script is:inline type="application/ld\+json">)(.*?)(</script>)', src, re.S):
        data = json.loads(m.group(2))
        for s in blocks.get((m.start(2), m.end(2)), []):
            ld_set(data, s['path'], tr[s['key']])
        text = json.dumps(data, ensure_ascii=False, indent=2)
        text = re.sub(r'"(https://onyxexecmiami\.com/[^"]*)"', lambda u: '"' + local_url(u.group(1), lang, pages) + '"', text)
        text = re.sub(r'"inLanguage":\s*"en[^"]*"', f'"inLanguage": "{lang}"', text)
        edits.append((m.start(2), m.end(2), '\n' + text + '\n'))

    edits.sort()
    for a, b in zip(edits, edits[1:]):
        assert a[1] <= b[0], f'overlapping edits at {a[0]}..{a[1]} and {b[0]}'
    out = src
    for start, end, new in reversed(edits):
        out = out[:start] + new + out[end:]
    return out


def localize(out, lang):
    fm_end = out.index('\n---\n', 3) + 5
    fm, body = out[:fm_end], out[fm_end:]
    fm = fm.replace("from '../", "from '../../")
    body = body.replace('<Base lang="en"', f'<Base lang="{lang}"', 1)
    body = re.sub(r'<(SiteHeader|SiteFooter)\b', lambda m: f'<{m.group(1)} lang="{lang}"', body)

    def attr(m):
        name, val = m.group(1), m.group(2)
        if name in ('href', 'src', 'srcset', 'action'):
            if val == '/':
                val = f'/{lang}/'
            elif val.startswith('/#'):
                val = f'/{lang}/' + val[1:]
            parts = [p.strip() for p in val.split(',')] if name == 'srcset' else [val]
            fixed = []
            for p in parts:
                url = p.split(' ')[0]
                if not re.match(r'[a-z]+:|/|#', url) and ASSET.search(url):
                    p = '/' + p
                fixed.append(p)
            val = ', '.join(fixed) if name == 'srcset' else fixed[0]
        return f'{name}="{val}"'
    body = re.sub(r'\b(href|src|srcset|action)="([^"]*)"', attr, body)
    body = re.sub(r'(<meta property="og:url" content=")([^"]*)(")',
                  lambda m: m.group(1) + m.group(2).replace(SITE + '/', f'{SITE}/{lang}/', 1) + m.group(3), body)
    body = re.sub(r'(<meta property="og:locale" content=")[^"]*(")', lambda m: m.group(1) + LOCALE[lang] + m.group(2), body)
    return fm + body


def main(langs):
    pages = {os.path.basename(f)[:-6] + '.html' for f in glob.glob(os.path.join(ROOT, 'src/pages/*.astro'))}
    for lang in langs:
        os.makedirs(os.path.join(ROOT, 'src/pages', lang), exist_ok=True)
        built, skipped = 0, []
        for f in sorted(glob.glob(os.path.join(ROOT, 'src/pages/*.astro'))):
            name = os.path.basename(f)[:-6]
            if name == '404':
                continue
            tf = os.path.join(ROOT, 'translations', lang, name + '.json')
            if not os.path.exists(tf):
                skipped.append(name)
                continue
            out = build_page(open(f).read(), json.load(open(tf)), lang, pages)
            open(os.path.join(ROOT, 'src/pages', lang, name + '.astro'), 'w').write(localize(out, lang))
            built += 1
        print(f'{lang}: built {built}' + (f', no translation yet: {", ".join(skipped)}' if skipped else ''))


if __name__ == '__main__':
    main(sys.argv[1:] or ['es', 'ru'])
