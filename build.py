#!/usr/bin/env python3
"""Vizitkomat – generátor statického webu (SK v koreni, CZ v /cz/).

Texty sú priamo v šablónach cez L('slovensky', 'česky').
Spustenie: python3 build.py
"""
import hashlib
import json
import pathlib
import shutil

from jinja2 import Environment, FileSystemLoader

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'
PRICES = json.loads((ROOT / '_data' / 'prices.json').read_text())

# stránka: (šablóna, SK cesta, CZ cesta)
PAGES = [
    ('index.html', '', ''),
    ('tvorba.html', 'tvorba/', 'tvorba/'),
    ('digitalna.html', 'digitalna-vizitka/', 'digitalni-vizitka/'),
    ('cennik.html', 'cennik/', 'cenik/'),
    ('kosik.html', 'kosik/', 'kosik/'),
    ('404.html', '404.html', None),
]
LANGS = {'sk': '', 'cz': 'cz/'}
SITE = 'https://vizitkomat.eu/'
THREE = {'three': 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js', 'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/'}


def asset_hash(rel):
    p = ROOT / rel
    return hashlib.md5(p.read_bytes()).hexdigest()[:8] if p.exists() else '0'


def main():
    env = Environment(loader=FileSystemLoader(str(SRC)), autoescape=False, trim_blocks=True, lstrip_blocks=True)
    versions = {}
    for p in (ROOT / 'assets').rglob('*'):
        if p.is_file() and p.suffix in ('.css', '.js'):
            versions[str(p.relative_to(ROOT))] = asset_hash(p.relative_to(ROOT))

    def urls_for(lang):
        out = {}
        for tpl, sk, cz in PAGES:
            path = sk if lang == 'sk' else cz
            if path is None:
                continue
            out[tpl.replace('.html', '')] = LANGS[lang] + path
        return out

    written = []
    for lang, prefix in LANGS.items():
        U = urls_for(lang)
        other = 'cz' if lang == 'sk' else 'sk'
        UO = urls_for(other)
        for tpl, sk, cz in PAGES:
            path = sk if lang == 'sk' else cz
            if path is None:
                continue
            out_rel = prefix + path
            out = ROOT / out_rel if out_rel.endswith('.html') else ROOT / out_rel / 'index.html'
            depth = out.relative_to(ROOT).as_posix().count('/')
            R = '../' * depth or './'
            key = tpl.replace('.html', '')

            def L(sk_text, cz_text=None, _lang=lang):
                return sk_text if _lang == 'sk' or cz_text is None else cz_text

            def A(rel):  # asset s verziou
                return f"{R}{rel}?v={versions.get(rel, '0')}"

            importmap = json.dumps({'imports': {**THREE, **{f'{R}{k}': f'{R}{k}?v={v}' for k, v in versions.items() if k.endswith('.js')}}})

            def link(name, _U=U):
                p = _U.get(name, '')
                return R + p if p else R

            ctx = dict(
                lang=lang, L=L, A=A, R=R, link=link, page=key,
                prices=PRICES[lang], prices_json=json.dumps(PRICES[lang], ensure_ascii=False),
                alt_url=R + UO.get(key, UO['index']),
                canonical=SITE + out_rel.replace('index.html', ''),
                alt_canonical=SITE + UO.get(key, ''),
                site=SITE, importmap=importmap,
            )
            html = env.get_template(tpl).render(**ctx)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(html)
            written.append(out.relative_to(ROOT).as_posix())

    # ukážka digitálnej vizitky (jedna, bez jazykových verzií)
    out = ROOT / 'v' / 'demo' / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    R = '../../'
    im = json.dumps({'imports': {**THREE, **{f'{R}{k}': f'{R}{k}?v={v}' for k, v in versions.items() if k.endswith('.js')}}})
    html = env.get_template('v_demo.html').render(R=R, importmap=im, A=lambda rel: f"{R}{rel}?v={versions.get(rel, '0')}")
    out.write_text(html)
    written.append('v/demo/index.html')

    # sitemap
    urls = []
    for lang in LANGS:
        for name, p in urls_for(lang).items():
            if name != '404':
                urls.append(SITE + p)
    urls.append(SITE + 'v/demo/')
    (ROOT / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n')
    print('\n'.join(written))


if __name__ == '__main__':
    main()
