"""One-time port of the hand-written HTML pages into src/pages/*.astro.

A shared block (analytics, fonts, header, footer, scripts) is replaced by its
component only when it matches the canonical copy with whitespace ignored;
anything else stays in the page untouched and is reported.
"""
import re, glob, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def norm(x):
    return re.sub(r'>\s+<', '><', re.sub(r'[ \t]*\n[ \t]*', '\n', x)).strip()

canon = open('faq.html').read()
RE_AN = re.compile(r'<!-- Google tag \(gtag\.js\) -->.*?event_category:\'contact\'.*?\}, true\);\n</script>\n', re.S)
RE_FONTS = re.compile(r'<link rel="preconnect" href="https://fonts\.googleapis\.com" />.*?<link rel="stylesheet" href="style\.css" />', re.S)
RE_HDR = re.compile(r'<header>.*?</header>\s*<div class="menu-backdrop"></div>\s*<nav class="mobile-menu">.*?</nav>', re.S)
RE_FTR = re.compile(r'<footer class="site">.*?</footer>', re.S)
RE_YR = re.compile(r'<script>document\.getElementById\(\'yr\'\)\.textContent=new Date\(\)\.getFullYear\(\);var io=.*?</script>', re.S)
RE_SCR = re.compile(r'<script>\s*\(function\(\)\{\s*var toggle=.*?</script>\s*<script>\s*window\["moovsAPI"\].*?</script>', re.S)

C_FONTS = norm(RE_FONTS.search(canon).group(0))
C_HDR = norm(RE_HDR.search(canon).group(0))
C_FTR = norm(RE_FTR.search(canon).group(0))
C_YR = norm(RE_YR.search(canon).group(0))
C_SCR = norm(RE_SCR.search(canon).group(0))

def strip_current(x):
    return re.sub(r' aria-current="page"', '', x)

def current_in(x, region_re=None):
    m = re.search(r'<a href="([^"]+)" aria-current="page"', x)
    return m.group(1) if m else None

def inline_scripts(x):
    # Page scripts and styles go out exactly as written: no bundling, no style scoping.
    x = re.sub(r'<script(?![^>]*is:inline)', '<script is:inline', x)
    return re.sub(r'<style(?![^>]*is:inline)', '<style is:inline', x)

# Stray end tags that browsers silently drop but the Astro compiler rejects.
STRAY = {
    'index.html': ('</div>\n</div>\n</div>\n</div>\n</section>\n<!-- HOW YOUR RIDE IS HANDLED -->',
                   '</div>\n</div>\n</div>\n</section>\n<!-- HOW YOUR RIDE IS HANDLED -->'),
}

report = []
def convert(path):
    s = open(path).read()
    if path in STRAY:
        old, new = STRAY[path]
        assert s.count(old) == 1, f'{path}: stray-tag fix no longer applies'
        s = s.replace(old, new)
    lang = re.search(r'<html lang="(\w+)">', s).group(1)
    head = s.split('<head>', 1)[1].split('</head>', 1)[0]
    body = s.split('<body>', 1)[1].split('</body>', 1)[0]
    depth = path.count('/')
    up = '../' * (depth + 1)
    imports = {'Base': f'{up}layouts/Base.astro'}
    notes = []

    m = RE_AN.search(head)
    assert m, f'{path}: analytics block not found'
    head = head[:m.start()] + head[m.end():]

    m = RE_FONTS.search(head)
    if m and norm(m.group(0)) == C_FONTS:
        head = head[:m.start()] + '<Fonts />' + head[m.end():]
        imports['Fonts'] = f'{up}components/Fonts.astro'
    else:
        notes.append('fonts raw')

    m = RE_HDR.search(body)
    if m and norm(strip_current(m.group(0))) == C_HDR:
        blk = m.group(0)
        nav, mm = blk.split('<nav class="mobile-menu">')
        props = ''
        cur = current_in(nav)
        if cur: props += f' current="{cur}"'
        mcur = current_in(mm)
        if mcur: props += f' mobileCurrent="{mcur}"'
        body = body[:m.start()] + f'<SiteHeader{props} />' + body[m.end():]
        imports['SiteHeader'] = f'{up}components/SiteHeader.astro'
    else:
        notes.append('header raw')

    m = RE_FTR.search(body)
    if m and norm(strip_current(m.group(0))) == C_FTR:
        cur = current_in(m.group(0))
        props = f' current="{cur}"' if cur else ''
        body = body[:m.start()] + f'<SiteFooter{props} />' + body[m.end():]
        imports['SiteFooter'] = f'{up}components/SiteFooter.astro'
    else:
        notes.append('footer raw')

    m = RE_YR.search(body)
    if m and norm(m.group(0)) == C_YR:
        body = body[:m.start()] + '<YearReveal />' + body[m.end():]
        imports['YearReveal'] = f'{up}components/YearReveal.astro'
    else:
        notes.append('year/reveal script raw')

    m = RE_SCR.search(body)
    if m and norm(m.group(0)) == C_SCR:
        body = body[:m.start()] + '<SiteScripts />' + body[m.end():]
        imports['SiteScripts'] = f'{up}components/SiteScripts.astro'
    else:
        notes.append('menu/moovs scripts raw')

    head = inline_scripts(head).strip('\n')
    body = inline_scripts(body).strip('\n')
    fm = '\n'.join(f"import {k} from '{v}';" for k, v in imports.items())
    out = f'---\n{fm}\n---\n<Base lang="{lang}">\n<Fragment slot="head">\n{head}\n</Fragment>\n{body}\n</Base>\n'
    dst = os.path.join('src/pages', path[:-5] + '.astro')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w').write(out)
    report.append(f'{path}: {", ".join(notes) or "all shared blocks as components"}')

for p in sorted(glob.glob('*.html')) + ['es/index.html', 'ru/index.html']:
    convert(p)
print('\n'.join(report))
