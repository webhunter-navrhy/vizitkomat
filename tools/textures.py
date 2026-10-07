"""Textúra papiera a tiene listov pre fotografické náhľady vizitiek."""
import random, math
from PIL import Image, ImageFilter, ImageDraw, ImageChops
random.seed(7)
S = 512
base = Image.effect_noise((S, S), 22).convert('L').filter(ImageFilter.GaussianBlur(0.6))
fib = Image.new('L', (S, S), 128); d = ImageDraw.Draw(fib)
for _ in range(900):
    x, y = random.random() * S, random.random() * S; a = random.random() * math.pi; l = random.uniform(4, 16)
    d.line([(x, y), (x + math.cos(a) * l, y + math.sin(a) * l)], fill=int(random.choice([118, 122, 134, 138])), width=1)
fib = fib.filter(ImageFilter.GaussianBlur(0.5))
paper = ImageChops.blend(base, fib, 0.5).point(lambda v: int(max(0, min(255, 236 + (v - 128) * 0.55))))
off = ImageChops.offset(paper, S // 2, S // 2)
mask = Image.new('L', (S, S)); md = ImageDraw.Draw(mask)
for i in range(S // 2): md.rectangle([i, i, S - 1 - i, S - 1 - i], outline=int(255 * min(1, i / (S * 0.25))))
Image.composite(paper, off, mask).save('assets/img/paper.png', optimize=True)

def leaves(seed, W=1600, H=1100):
    random.seed(seed)
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    cx, cy = W * 0.12, -H * 0.1
    for frond in range(3):
        ang = math.radians(35 + frond * 18 + random.uniform(-6, 6)); L = W * random.uniform(0.55, 0.8)
        sx, sy = cx + random.uniform(-80, 80), cy
        ex, ey = sx + math.cos(ang) * L, sy + math.sin(ang) * L
        d.line([(sx, sy), (ex, ey)], fill=255, width=10)
        for k in range(2, 22):
            t = k / 22; px_, py_ = sx + (ex - sx) * t, sy + (ey - sy) * t
            for side in (-1, 1):
                la = ang + side * math.radians(55 + random.uniform(-8, 8)); ll = L * 0.22 * (1 - t * 0.6)
                tip = (px_ + math.cos(la) * ll, py_ + math.sin(la) * ll); w = ll * 0.12
                nx, ny = -math.sin(la) * w, math.cos(la) * w
                mx, my = px_ + (tip[0] - px_) * 0.5, py_ + (tip[1] - py_) * 0.5
                d.polygon([(px_, py_), (mx + nx, my + ny), tip, (mx - nx, my - ny)], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(14))
    out = Image.new('RGBA', (W, H), (40, 28, 18, 0)); out.putalpha(m.point(lambda v: int(v * 0.30)))
    return out
leaves(3).save('assets/img/shadow-leaf.png', optimize=True)
leaves(9).transpose(Image.FLIP_LEFT_RIGHT).save('assets/img/shadow-leaf-2.png', optimize=True)
print('ok')
