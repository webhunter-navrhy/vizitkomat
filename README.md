# Vizitkomat.eu

E-shop s vizitkami (SK v koreni, CZ v `/cz/`). Statický web, tlač dropship cez Bizay.

- `python3 build.py` – vygeneruje stránky zo `src/*.html` (texty cez `L('sk', 'cz')`), sitemap a import mapu s verziami JS.
- Ceny: `_data/prices.json` (vrátane DPH). Nákupné ceny Bizay sú v poznámke v tom istom súbore.
- Jadro: `assets/js/card-engine.js` (14 šablón, vykreslenie do canvasu, tlačové PDF 600 dpi so spadávkou 2 mm),
  `ai-engine.js` (AI grafik – lokálny engine, voliteľne server cez `VK.aiEndpoint`), `logo.js` (farby z loga),
  `digital-card.js` (digitálna vizitka + vCard), `studio.js` (/tvorba/), `kosik.js` (objednávka, `VK.orderEndpoint`).
- Pred spustením: zrušiť `noindex` v `src/base.html`, nastaviť `aiEndpoint`, `orderEndpoint`, platobnú bránu, VOP a GDPR.
