#!/usr/bin/env python3
"""Z predrenderovaných JPG (assets/pre/<lang>/*.jpg) urobí WebP vedľa nich (~55 % menšie).
Spúšťa sa automaticky z build.py; konvertuje len chýbajúce alebo zastarané súbory."""
import pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent


def convert(quality=80):
    n = 0
    for jpg in sorted((ROOT / 'assets' / 'pre').glob('*/*.jpg')):
        webp = jpg.with_suffix('.webp')
        if webp.exists() and webp.stat().st_mtime >= jpg.stat().st_mtime:
            continue
        with Image.open(jpg) as im:
            im.save(webp, 'WEBP', quality=quality, method=6)
        n += 1
    return n


if __name__ == '__main__':
    print(convert(), 'WebP')
