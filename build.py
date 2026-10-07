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
    ('vlastny.html', 'vlastny-navrh/', 'vlastni-navrh/'),
    ('podmienky.html', 'obchodne-podmienky/', 'obchodni-podminky/'),
    ('gdpr.html', 'ochrana-osobnych-udajov/', 'ochrana-osobnich-udaju/'),
    ('kontakt.html', 'kontakt/', 'kontakt/'),
    ('404.html', '404.html', None),
]
LANGS = {'sk': '', 'cz': 'cz/'}
SITE = 'https://vizitkomat.eu/'
# False = testovacia verzia na webhunter-navrhy.github.io (noindex); True = ostrý web na vizitkomat.eu
PRODUCTION = False
PUBLIC = SITE if PRODUCTION else 'https://webhunter-navrhy.github.io/vizitkomat/'
THREE = {'three': 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js', 'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/'}


ORG = {
    '@context': 'https://schema.org', '@type': 'Organization', 'name': 'Vizitkomat', 'url': SITE,
    'logo': SITE + 'assets/img/icon-512.png', 'email': 'info@vizitkomat.eu',
    'legalName': 'webhunter s.r.o.', 'taxID': '29498511',
    'address': {'@type': 'PostalAddress', 'streetAddress': 'Na Provaznici 2691/7', 'postalCode': '150 00', 'addressLocality': 'Praha 5', 'addressCountry': 'CZ'},
    'areaServed': ['SK', 'CZ'],
}


def asset_hash(rel):
    p = ROOT / rel
    return hashlib.md5(p.read_bytes()).hexdigest()[:8] if p.exists() else '0'


def main():
    env = Environment(loader=FileSystemLoader(str(SRC)), autoescape=False, trim_blocks=True, lstrip_blocks=True)
    env.filters['faqld'] = lambda qa: {'@type': 'Question', 'name': qa[0], 'acceptedAnswer': {'@type': 'Answer', 'text': qa[1]}}
    env.policies['json.dumps_kwargs'] = {'ensure_ascii': False}
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

            pre = {f.stem: f"{R}assets/pre/{lang}/{f.name}?v={asset_hash(f.relative_to(ROOT))}" for f in sorted((ROOT / 'assets' / 'pre' / lang).glob('*.jpg'))}
            ctx = dict(
                pre=pre, pre_json=json.dumps(pre),
                lang=lang, L=L, A=A, R=R, link=link, page=key,
                prices=PRICES[lang], prices_json=json.dumps(PRICES[lang], ensure_ascii=False),
                alt_url=R + UO.get(key, UO['index']),
                canonical=SITE + out_rel.replace('index.html', ''),
                alt_canonical=SITE + UO.get(key, ''),
                site=SITE, public=PUBLIC, production=PRODUCTION, importmap=importmap,
                org_json=json.dumps(ORG, ensure_ascii=False),
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

    # sitemap (s jazykovými verziami) a robots.txt
    import datetime
    today = datetime.date.today().isoformat()
    U = {lang: urls_for(lang) for lang in LANGS}
    rows = []
    for lang in LANGS:
        other = 'cz' if lang == 'sk' else 'sk'
        for name, p in U[lang].items():
            if name in ('404', 'kosik'):
                continue
            alt = U[other].get(name)
            links = f'<xhtml:link rel="alternate" hreflang="{"sk" if lang == "sk" else "cs"}" href="{SITE + p}"/>'
            if alt is not None:
                links += f'<xhtml:link rel="alternate" hreflang="{"cs" if lang == "sk" else "sk"}" href="{SITE + alt}"/>'
            rows.append(f'  <url><loc>{SITE + p}</loc><lastmod>{today}</lastmod>{links}</url>\n')
    (ROOT / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + ''.join(rows) + '</urlset>\n')
    (ROOT / 'robots.txt').write_text(
        ('User-agent: *\nDisallow: /kosik/\nDisallow: /cz/kosik/\nDisallow: /koncepty/\nDisallow: /v/\n' if PRODUCTION else 'User-agent: *\nDisallow: /\n')
        + f'Sitemap: {SITE}sitemap.xml\n')
    print('\n'.join(written))


if __name__ == '__main__':
    main()
