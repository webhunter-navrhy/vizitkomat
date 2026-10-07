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
    ('objednavka.html', 'objednavka/', 'objednavka/'),
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

    # administrácia (mimo sitemap, noindex)
    out = ROOT / 'admin' / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(env.get_template('admin.html').render(R='../', A=lambda rel: f"../{rel}?v={versions.get(rel, '0')}"))
    written.append('admin/index.html')

    # digitálne vizitky: ukážka + zverejnené z administrácie (_data/cards/<adresa>.json)
    cards = [('demo', {'demo': True, 'lang': 'sk', 'tpl': 'noirgold', 'front': 'assets/pre/sk/tpl-noirgold-f.jpg', 'back': 'assets/pre/sk/tpl-noirgold-b.jpg',
                       'f': {'name': 'Martin Kováč', 'role': 'Realitný maklér', 'company': 'Domov Reality', 'phone': '+421 905 123 456', 'email': 'martin@domovreality.sk', 'web': 'domovreality.sk', 'address': 'Panská 14, Bratislava', 'tagline': 'Kľúče odovzdávam osobne.'},
                       'socials': {'instagram': 'https://instagram.com/', 'linkedin': 'https://linkedin.com/'},
                       'digital': {'bio': 'Pomáham rodinám predať byt za férovú cenu a bez stresu. 12 rokov v Bratislave, stovky odovzdaných kľúčov.', 'services': 'Predaj bytov a domov\nOcenenie nehnuteľnosti\nPrenájom\nHypotéka na kľúč', 'hours': 'Po – Pi: 8:00 – 18:00\nSo: po dohode'}})]
    for fp in sorted((ROOT / '_data' / 'cards').glob('*.json')) if (ROOT / '_data' / 'cards').exists() else []:
        c = json.loads(fp.read_text())
        if c.get('until') and c['until'] < __import__('datetime').date.today().isoformat() and not c.get('lifetime', True):
            continue
        cards.append((c['slug'], c))
    for slug, c in cards:
        out = ROOT / 'v' / slug / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        R = '../../'
        im = json.dumps({'imports': {**THREE, **{f'{R}{k}': f'{R}{k}?v={v}' for k, v in versions.items() if k.endswith('.js')}}})
        f = (c.get('design') or {}).get('f') or c.get('f') or {}
        lang = c.get('lang', 'sk')
        pal = (c.get('design') or {}).get('pal') or {}
        title = ' – '.join(x for x in [f.get('name'), f.get('company') if f.get('company') != f.get('name') else ''] if x) + (' · digitální vizitka' if lang == 'cz' else ' · digitálna vizitka')
        desc = ', '.join(x for x in [f.get('role'), f.get('company'), f.get('phone')] if x)
        html = env.get_template('v_card.html').render(
            R=R, importmap=im, A=lambda rel, R=R: f"{R}{rel}?v={versions.get(rel, '0')}", lang=lang, demo=c.get('demo'),
            title=title, desc=desc, theme=pal.get('bg', '#0E0E10'), og=(PUBLIC + c['front']) if c.get('front') else '',
            card_json=json.dumps(c, ensure_ascii=False).replace('</', '<\\/'))
        out.write_text(html)
        written.append(out.relative_to(ROOT).as_posix())

    # sitemap (s jazykovými verziami) a robots.txt
    import datetime
    today = datetime.date.today().isoformat()
    U = {lang: urls_for(lang) for lang in LANGS}
    rows = []
    for lang in LANGS:
        other = 'cz' if lang == 'sk' else 'sk'
        for name, p in U[lang].items():
            if name in ('404', 'kosik', 'objednavka'):
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
        ('User-agent: *\nDisallow: /kosik/\nDisallow: /cz/kosik/\nDisallow: /koncepty/\nDisallow: /v/\nDisallow: /admin/\n' if PRODUCTION else 'User-agent: *\nDisallow: /\n')
        + f'Sitemap: {SITE}sitemap.xml\n')
    print('\n'.join(written))


if __name__ == '__main__':
    main()
