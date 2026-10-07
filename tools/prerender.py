#!/usr/bin/env python3
"""Predrenderuje náhľady vizitiek pre homepage (šablóny, hero, AI ukážky) do assets/pre/<lang>/.
Spúšťať pri zmene šablón: python3 tools/prerender.py  (potrebuje lokálny server na :8790)
"""
import asyncio, base64, json, pathlib, sys
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8790'

JS = r"""
async () => {
  const { newDesign, CZ } = await import('/assets/js/v2/model.js');
  const { TEMPLATES, templateDefaults } = await import('/assets/js/v2/templates.js');
  const { snapshot } = await import('/assets/js/v2/render.js');
  const { pickMark } = await import('/assets/js/v2/ai.js');
  const { PERSONAS, personaFields, TPL_PERSONA } = await import('/assets/js/v2/personas.js');
  await document.fonts.ready;
  const marks = {};
  const markOf = async (icon) => (marks[icon] ??= (await pickMark(icon, icon, null))?.src || null);
  const out = {};
  const shot = async (name, d, w) => {
    out[name + '-f'] = await snapshot(d, 'front', w, 'image/jpeg', 0.86);
    out[name + '-b'] = await snapshot(d, 'back', w, 'image/jpeg', 0.86);
  };
  // šablóny
  for (const id of Object.keys(TEMPLATES)) {
    const pk = TPL_PERSONA[id] || 'arch';
    const d = newDesign({ tpl: id, ...templateDefaults(id), f: personaFields(pk), mark: await markOf(PERSONAS[pk].icon) });
    await shot('tpl-' + id, d, 640);
  }
  // hero
  for (const [i, [id, pk]] of [['prechod', 'foto'], ['stuha', 'pekar'], ['noirgold', 'makler']].entries()) {
    const d = newDesign({ tpl: id, ...templateDefaults(id), f: personaFields(pk), mark: await markOf(PERSONAS[pk].icon) });
    out['hero-' + i] = await snapshot(d, 'front', 980, 'image/jpeg', 0.9);
  }
  // AI ukážky (skutočné výstupy AI zo showcase.json)
  const data = await fetch('/assets/ai/showcase.json').then((r) => r.json());
  const ICON = { kvety: 'flower', vino: 'grape', it: 'code' };
  const CZF = { kvety: { role: 'Květinářka', company: 'Levandule', tagline: 'Krásy z přírody', name: 'Marie Horváthová' }, vino: { role: 'Vinař', company: 'Vinařství Pod Pálavou', tagline: 'Poctivé víno s nádechem luxusu', name: 'Jiří Mrva', address: 'Mikulov' }, it: { tagline: 'Kód, který se dá číst', address: 'Ostrava' } };
  for (const s0 of data) {
    const s = CZ ? { ...s0, fields: { ...s0.fields, ...(CZF[s0.key] || {}) } } : s0;
    const tld = CZ ? 'cz' : 'sk';
    const plain = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const dom = plain(s.fields.company).replace(/^vinar(stvo|stvi)\s+/, '').replace(/[^a-z0-9]+/g, '');
    const first = plain(s.fields.name).split(' ')[0];
    const f = { ...s.fields, phone: CZ ? '+420 605 123 456' : '+421 905 123 456', email: `${first}@${dom}.${tld}`, web: `${dom}.${tld}` };
    for (const [i, c] of s.concepts.entries()) {
      const art = c.art.mode === 'file' ? location.origin + '/assets/ai/' + c.art.file : c.art.mode === 'library' ? c.art.key : null;
      const d = newDesign({ tpl: c.template, fonts: c.fonts || TEMPLATES[c.template].fonts, pal: { label: 'AI', ...c.palette }, art, f, mark: await markOf(ICON[s.key]) });
      await shot(`show-${s.key}-${i}`, d, 820);
    }
  }
  // krok 2
  const d = newDesign({ tpl: 'atelier', ...templateDefaults('atelier'), f: personaFields('arch') });
  out['step'] = await snapshot(d, 'front', 760, 'image/jpeg', 0.9);
  return out;
}
"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for lang, path in (('sk', '/tvorba/'), ('cz', '/cz/tvorba/')):
            pg = await b.new_page(viewport={'width': 1200, 'height': 800})
            pg.on('pageerror', lambda e: print('ERR', e))
            await pg.goto(BASE + path)
            await pg.wait_for_timeout(1500)
            out = await pg.evaluate(JS)
            d = ROOT / 'assets' / 'pre' / lang
            d.mkdir(parents=True, exist_ok=True)
            for old in d.glob('*.jpg'):
                old.unlink()
            for k, v in out.items():
                (d / f'{k}.jpg').write_bytes(base64.b64decode(v.split(',', 1)[1]))
            print(lang, len(out), 'obrázkov')
            await pg.close()
        await b.close()

asyncio.run(main())
