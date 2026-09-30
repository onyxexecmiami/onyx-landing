"""Make an AVIF twin for every WebP image the pages use (public/<name>.avif).

Source is the original JPEG when one exists (better quality than the WebP),
resized to the WebP's dimensions, so layout and srcset widths stay the same.
Quality is raised in steps of 2 until PSNR against the source reaches the lower of
38 dB (threshold from the shifton/help image work) and the current WebP's own PSNR,
so the AVIF is never worse than what the site serves today. Encoded with Pillow, not sips:
sips writes grid AVIFs that some decoders reject.
"""
import glob, os, re, math
from PIL import Image, ImageChops, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
SKIP = {'gridd-badge'}  # 80x96 badge: AVIF comes out larger and worse than the 2 KB WebP
SOURCES = {'hero-640': 'hero.jpg', 'hero-937': 'hero.jpg'}

def psnr(a, b):
    diff = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
    mse = sum(v ** 2 for v in ImageStat.Stat(diff).rms) / 3
    return 99.0 if mse == 0 else 20 * math.log10(255 / math.sqrt(mse))

used = set()
for f in glob.glob(os.path.join(ROOT, 'src/**/*.astro'), recursive=True):
    used |= set(re.findall(r'([\w-]+)\.webp', open(f).read()))

for name in sorted(used - SKIP):
    webp = os.path.join(PUB, name + '.webp')
    target = Image.open(webp).size
    src_name = SOURCES.get(name) or next((name + e for e in ('.jpg', '.jpeg') if os.path.exists(os.path.join(PUB, name + e))), name + '.webp')
    ref = Image.open(os.path.join(PUB, src_name)).convert('RGBA' if name == 'gridd-badge' else 'RGB')
    if ref.size != target:
        ref = ref.resize(target, Image.LANCZOS)
    out = os.path.join(PUB, name + '.avif')
    goal = min(38.0, psnr(ref, Image.open(webp)))
    for q in range(30, 101, 2):
        ref.save(out, 'AVIF', quality=q, speed=4)
        score = psnr(ref, Image.open(out))
        if score >= goal:
            break
    print(f'{name:36s} {target[0]}x{target[1]} from {src_name:40s} q={q} psnr={score:.1f} (webp {goal:.1f}) '
          f'webp={os.path.getsize(webp)//1024}KB avif={os.path.getsize(out)//1024}KB')
