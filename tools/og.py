#!/usr/bin/env python3
"""Obrázky pre zdieľanie (og-sk.png, og-cz.png) a ikony. Potrebuje server :8790 a hotový prerender."""
import asyncio, pathlib
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
T = {'sk': ('Vizitka za <span>2 minúty.</span> Bez grafika.', 'AI grafik · editor ako Canva · tlač aj digitál'),
     'cz': ('Vizitka za <span>2 minuty.</span> Bez grafika.', 'AI grafik · editor jako Canva · tisk i digitál')}
HTML = """<!doctype html><meta charset=utf-8><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&display=swap" rel="stylesheet">
<style>body{margin:0;width:1200px;height:630px;background:radial-gradient(120% 120% at 20% 0%,#3B55F0,#2440E6 55%,#1E36C8);font-family:'Bricolage Grotesque';overflow:hidden;position:relative;color:#fff}
.b{position:absolute;left:64px;top:52px;font-weight:800;font-size:34px;letter-spacing:-.05em;display:flex;align-items:center;gap:10px}.b i{width:30px;height:30px;border-radius:50%;background:#FFD23F;display:block;position:relative}.b i::after{content:'';position:absolute;right:-5px;bottom:-2px;width:14px;height:14px;border-radius:50%;background:#FF6B4A}
h1{position:absolute;left:64px;top:118px;margin:0;font-size:112px;line-height:.86;letter-spacing:-.06em;font-weight:800;width:620px}h1 span{color:#FFD23F}
p{position:absolute;left:66px;bottom:56px;margin:0;font-size:27px;font-weight:600;opacity:.92}
img{position:absolute;width:440px;border-radius:10px;box-shadow:0 30px 50px -18px rgba(5,10,60,.75)}
.s{position:absolute;right:58px;top:36px;width:118px;height:118px;border-radius:50%;background:#FFD23F;color:#0F1440;display:grid;place-items:center;text-align:center;font-weight:800;font-size:20px;line-height:1;transform:rotate(-12deg);z-index:5}</style>
<div class=b><i></i>vizitkomat</div><h1>%H</h1><p>%P</p>
<img src="/assets/pre/%L/hero-0-f.jpg" style="right:40px;top:60px;transform:rotate(7deg)">
<img src="/assets/pre/%L/hero-1-f.jpg" style="right:200px;top:225px;transform:rotate(-6deg);z-index:2">
<img src="/assets/pre/%L/hero-2-f.jpg" style="right:30px;top:385px;transform:rotate(4deg)">
<div class=s>AI<br>grafik<br>24/7</div>"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1200, 'height': 630})
        await pg.goto('http://localhost:8790/robots.txt')
        for lang, (h, s) in T.items():
            await pg.set_content(HTML.replace('%H', h).replace('%P', s).replace('%L', lang), wait_until='networkidle')
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=str(ROOT / f'assets/img/og-{lang}.png'))
        svg = (ROOT / 'assets/img/favicon.svg').read_text()
        for size, name in ((32, 'favicon-32.png'), (180, 'apple-touch-icon.png'), (192, 'icon-192.png'), (512, 'icon-512.png')):
            await pg.set_viewport_size({'width': size, 'height': size})
            sv = svg.replace('rx="16"', 'rx="0"') if size >= 180 else svg  # iOS/Android si rohy zaoblia samy
            await pg.set_content(f'<style>body{{margin:0}}svg{{width:{size}px;height:{size}px;display:block}}</style>{sv}')
            await pg.screenshot(path=str(ROOT / 'assets/img' / name), omit_background=True)
        await b.close()
asyncio.run(main())
