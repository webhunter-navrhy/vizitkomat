# Vizitkomat.eu

E-shop s vizitkami (SK v koreni, CZ v `/cz/`), štýl „Pop“. Statický web, tlač dropship cez Bizay.

- `python3 build.py` – vygeneruje stránky zo `src/*.html` (texty `L('sk', 'cz')`), sitemap a import mapu s verziami JS.
- Ceny: `_data/prices.json` (vrátane DPH). Nákupné ceny Bizay v poznámke.
- Jadro `assets/js/v2/`:
  - `templates.js` – 19 šablón ako objekty (mm), `model.js` – palety, písma, grafiky,
  - `render.js` – prevod na Fabric.js, náhľady, tlačové PDF 600 dpi so spadávkou 2 mm,
  - `editor.js` – editor ako Canva (posúvanie, úpravy textu, vodiace čiary, späť/vpred),
  - `ai.js` – AI grafik (backend ~/vizitkomat-api, Cloudflare Workers AI: Llama 3.3 70B + FLUX),
  - `three-cards.js` – 3D vizitky, `digital.js` – digitálna vizitka + vCard, `store.js` – IndexedDB (návrh, košík).
- Grafiky pre šablóny: `assets/art/` (vygenerované FLUX), ukážky AI: `assets/ai/`.
- Pred spustením: zrušiť `noindex` v `src/base.html`, nastaviť `orderEndpoint` + platobnú bránu, VOP, GDPR, údaje firmy.
