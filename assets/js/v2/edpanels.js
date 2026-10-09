// Vizitkomat v2 – panely editora ako v Canve: šablóny, text, pozadie, QR, strany s náhľadmi, kontrola pred tlačou
import { FONTS, PALETTES, K, tr } from './model.js';
import { TEMPLATES } from './templates.js';
import { ORDER, badge } from './featured.js';
import { snapshot, inspect } from './render.js';
import { qrSVG, debounce } from '../util.js';
import { toast } from './site.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const VK = window.VK;

// textúry papiera (assets/tex): svetlé sa násobia s farbou pozadia, tmavé ju nahradia
const TEX = [
  { key: 'papier', label: tr('Papier', 'Papír'), blend: 'multiply', opacity: 0.7 },
  { key: 'akvarel-bez', label: tr('Akvarel béžový', 'Akvarel béžový'), blend: 'multiply', opacity: 0.85 },
  { key: 'akvarel-ruza', label: tr('Akvarel ružový', 'Akvarel růžový'), blend: 'multiply', opacity: 0.85 },
  { key: 'akvarel-sivy', label: tr('Akvarel sivý', 'Akvarel šedý'), blend: 'multiply', opacity: 0.85 },
  { key: 'semis', label: tr('Jemná štruktúra', 'Jemná struktura'), blend: 'multiply', opacity: 0.6 },
  { key: 'samet', label: tr('Zamat', 'Samet'), blend: 'source-over', opacity: 1 },
  { key: 'cierna', label: tr('Čierny papier', 'Černý papír'), blend: 'source-over', opacity: 1 },
  { key: 'navy', label: tr('Tmavomodrý papier', 'Tmavomodrý papír'), blend: 'source-over', opacity: 1 },
];
const NEUTRALS = ['#FFFFFF', '#FAF6EE', '#F1EADF', '#E9E4DA', '#D9DDE3', '#111111', '#1C2333', '#0F3B2E', '#4A1D2C', '#2B2A28'];
const GRADS = [['#FDF6E3', '#F1D9A7', 135], ['#F7E1DA', '#E7B7A6', 135], ['#E7EEF7', '#B9C9E2', 135], ['#E8F1EA', '#B8D3BE', 135], ['#1C2333', '#3A4A6B', 135], ['#0F3B2E', '#2E6B55', 135], ['#2B1A2E', '#6B2E4F', 135], ['#111111', '#3B3B3B', 160]];

export function initEdPanels({ ed, tools, stage, getStep, curPal, openTab, paintSides, onStyleChange }) {
  const curFonts = () => FONTS[ed.design.fonts || TEMPLATES[ed.design.tpl]?.fonts] || Object.values(FONTS)[0];

  /* ---------------- šablóny (rozloženia) ---------------- */
  const grid = $('[data-tplgrid]'), q = $('[data-tplq]');
  function paintTemplates() {
    if (!grid) return;
    const qq = norm(q?.value);
    const ids = ORDER.filter((id) => TEMPLATES[id]).filter((id) => !qq || norm(TEMPLATES[id].name).includes(qq) || (TEMPLATES[id].tags || []).some((t) => norm(t).includes(qq)));
    grid.innerHTML = ids.length ? ids.map((id) => {
      const b = badge(id, tr);
      return `<button type="button" class="edx-tpl${id === ed.design.tpl ? ' on' : ''}" data-tpl="${id}" title="${esc(TEMPLATES[id].name)}"><img alt="" loading="lazy" decoding="async" src="${VK.pre['tpl-' + id + '-f'] || ''}">${b && b.k === 'top' ? `<i class="edx-tpl__b">${esc(b.t)}</i>` : ''}<span>${esc(TEMPLATES[id].name)}</span></button>`;
    }).join('') : `<p class="pn__tip">${tr('Nič sme nenašli. Skúste iné slovo.', 'Nic jsme nenašli. Zkuste jiné slovo.')}</p>`;
  }
  q?.addEventListener('input', debounce(paintTemplates, 120));
  grid?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-tpl]'); if (!b) return;
    const had = ed.custom.front || ed.custom.back;
    $$('.edx-tpl', grid).forEach((x) => x.classList.toggle('on', x === b));
    await ed.setTemplate(b.dataset.tpl, false);
    onStyleChange?.(); paintSides?.(); refreshThumbs();
    toast(had ? tr('Rozloženie je zmenené, vaše údaje ostali. Ručné úpravy vrátite cez Späť.', 'Rozložení je změněné, vaše údaje zůstaly. Ruční úpravy vrátíte přes Zpět.') : tr(`Rozloženie: ${TEMPLATES[b.dataset.tpl].name}`, `Rozložení: ${TEMPLATES[b.dataset.tpl].name}`), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() });
  });

  /* ---------------- text: štýly a dvojice písiem ---------------- */
  const TSTYLES = [
    { k: 'heading', label: tr('Nadpis', 'Nadpis'), font: 'd', size: 5, w: null },
    { k: 'subheading', label: tr('PODNADPIS', 'PODNADPIS'), font: 't', size: 2, w: 600, ls: 180, upper: true },
    { k: 'text', label: tr('Text odseku', 'Text odstavce'), font: 't', size: 2.2 },
    { k: 'quote', label: tr('Citát alebo slogan', 'Citát nebo slogan'), font: 'd', size: 2.8, it: true },
    { k: 'small', label: tr('Malý text', 'Malý text'), font: 't', size: 1.8 },
    { k: 'label', label: tr('ŠTÍTOK · KONTAKT', 'ŠTÍTEK · KONTAKT'), font: 't', size: 1.7, w: 700, ls: 120, upper: true },
  ];
  const tsBox = $('[data-tstyles]'), pairBox = $('[data-pairs]');
  function paintText() {
    const fp = curFonts();
    if (tsBox) tsBox.innerHTML = TSTYLES.map((t) => {
      const fam = t.font === 'd' ? fp.display : fp.text, w = t.w || (t.font === 'd' ? fp.dw : fp.tw);
      return `<button type="button" data-ts="${t.k}" style="font-family:'${esc(fam)}';font-weight:${w};${t.it ? 'font-style:italic;' : ''}font-size:${Math.min(1.9, 0.62 + t.size * 0.22)}rem;letter-spacing:${(t.ls || 0) / 1000}em">${esc(t.label)}</button>`;
    }).join('');
    const cur = ed.design.fonts || TEMPLATES[ed.design.tpl]?.fonts;
    if (pairBox) pairBox.innerHTML = Object.entries(FONTS).slice(0, 12).map(([k, f]) => `<button type="button" class="${k === cur ? 'on' : ''}" data-pair="${k}"><b style="font-family:'${esc(f.display)}';font-weight:${f.dw}">${esc(f.label)}</b><small style="font-family:'${esc(f.text)}'">${tr('Telo textu pre kontakty', 'Text pro kontakty')}</small></button>`).join('');
    const lead = $('[data-text-lead]'); const o = ed.active();
    if (lead) lead.classList.toggle('is-sel', !!(o && /text/.test(o.type)));
  }
  tsBox?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-ts]'); if (!b) return;
    const t = TSTYLES.find((x) => x.k === b.dataset.ts), fp = curFonts();
    const props = { fontFamily: t.font === 'd' ? fp.display : fp.text, fontWeight: t.w || (t.font === 'd' ? fp.dw : fp.tw), fontStyle: t.it ? 'italic' : 'normal', charSpacing: t.ls || 0 };
    const o = ed.active();
    if (o && /text/.test(o.type) && !o.isEditing) {
      await ed.style({ ...props, fontSize: t.size * K / (o.scaleY || 1) });
      if (!!t.upper !== !!o.data?.upper) await ed.style({ upper: !!t.upper });
      toast(tr('Štýl je použitý na vybraný text.', 'Styl je použitý na vybraný text.'));
    } else {
      const add = ['heading', 'subheading', 'text', 'small'].includes(t.k) ? t.k : 'text';
      const n = await ed.add(add, { text: t.k === 'quote' ? tr('Váš slogan', 'Váš slogan') : t.k === 'label' ? tr('Štítok', 'Štítek') : undefined });
      if (n && (t.k === 'quote' || t.k === 'label')) { await ed.style({ ...props, fontSize: t.size * K }); if (t.upper) await ed.style({ upper: true }); }
    }
    paintText();
  });
  pairBox?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-pair]'); if (!b) return;
    $$('[data-pair]', pairBox).forEach((x) => x.classList.toggle('on', x === b));
    await ed.setFonts(b.dataset.pair); onStyleChange?.(); paintText(); refreshThumbs();
  });
  ed.on('selection', () => { if ($('[data-pp="text"].on')) paintText(); });

  /* ---------------- pozadie ---------------- */
  const colBox = $('[data-bgcols]'), gradBox = $('[data-bggrads]'), texBox = $('[data-bgtex]');
  function paintBackground() {
    const pal = curPal(), cur = String(ed.bgColor() || '').toUpperCase();
    const cols = [...new Set([pal.bg, pal.soft, pal.accent, pal.ink, ...NEUTRALS].filter((c) => typeof c === 'string').map((c) => c.toUpperCase()))];
    if (colBox) colBox.innerHTML = cols.map((c) => `<button type="button" class="${c === cur ? 'on' : ''}" data-bgc="${c}" style="background:${c}" title="${c}" aria-label="${c}"></button>`).join('') + `<label class="edx-sw__own" title="${tr('Vlastná farba', 'Vlastní barva')}"><input type="color" data-bgown value="${/^#[0-9A-F]{6}$/.test(cur) ? cur : '#FFFFFF'}"></label>`;
    const grads = [[pal.bg, pal.soft, 135], [pal.soft, pal.bg, 180], [pal.accent, pal.ink, 135], ...GRADS].filter((g) => g[0] && g[1]);
    if (gradBox) gradBox.innerHTML = grads.slice(0, 10).map((g, i) => `<button type="button" data-bgg="${i}" style="background:linear-gradient(${g[2] - 90}deg, ${g[0]}, ${g[1]})"></button>`).join('');
    gradBox && (gradBox._grads = grads);
    const tex = ed.bgTexture();
    if (texBox) texBox.innerHTML = `<button type="button" class="none${!tex ? ' on' : ''}" data-tex=""><span>${tr('Bez textúry', 'Bez textury')}</span></button>` + TEX.map((t) => `<button type="button" class="${tex === t.key ? 'on' : ''}" data-tex="${t.key}" style="background-image:url(${VK.root}assets/tex/${t.key}.jpg)"><span>${esc(t.label)}</span></button>`).join('');
  }
  colBox?.addEventListener('click', (e) => { const b = e.target.closest('[data-bgc]'); if (!b) return; ed.setBg(b.dataset.bgc); paintBackground(); refreshThumbs(); });
  colBox?.addEventListener('input', debounce((e) => { if (e.target.matches('[data-bgown]')) { ed.setBg(e.target.value.toUpperCase()); refreshThumbs(); } }, 80));
  gradBox?.addEventListener('click', (e) => { const b = e.target.closest('[data-bgg]'); if (!b) return; const g = gradBox._grads[+b.dataset.bgg]; ed.setBg({ grad: [g[0], g[1]], angle: g[2] }); paintBackground(); refreshThumbs(); });
  texBox?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-tex]'); if (!b) return;
    const t = TEX.find((x) => x.key === b.dataset.tex);
    await ed.setBgTexture(t ? { key: t.key, src: `${VK.root}assets/tex/${t.key}.jpg`, blend: t.blend, opacity: t.opacity } : null);
    paintBackground(); refreshThumbs();
  });

  /* ---------------- QR ---------------- */
  function paintQR() {
    const url = ed.design.qrUrl || 'https://vizitkomat.eu';
    const p = $('[data-qr-prev]'); if (p) p.innerHTML = qrSVG(url);
    const u = $('[data-qr-url]'); if (u) u.textContent = url.replace(/^https?:\/\//, '');
    const n = ed.qrCount();
    const del = $('[data-qr-del]'); if (del) del.hidden = !n;
    const add = $('[data-qr-add]'); if (add) add.textContent = n ? tr('Pridať ďalší QR', 'Přidat další QR') : tr('Pridať QR na túto stranu', 'Přidat QR na tuto stranu');
  }
  $('[data-qr-add]')?.addEventListener('click', async () => { await ed.add('qr'); paintQR(); });
  $('[data-qr-back]')?.addEventListener('click', async () => { await ed.setBack('qr'); paintSides?.(); paintQR(); refreshThumbs(); toast(tr('Zadná strana má teraz QR kód na digitálnu vizitku.', 'Zadní strana má teď QR kód na digitální vizitku.')); });
  $('[data-qr-del]')?.addEventListener('click', () => { ed.removeQR(); paintQR(); refreshThumbs(); });

  /* ---------------- strany s náhľadmi ---------------- */
  let thumbTok = 0;
  async function refreshThumbsNow() {
    if (getStep() !== 'edit' || !ed.design) return;
    const tok = ++thumbTok, d = ed.printable();
    for (const side of ['front', 'back']) {
      try { const u = await snapshot(d, side, 220, 'image/jpeg', 0.8); if (tok !== thumbTok) return; const im = $(`[data-page-img="${side}"]`); if (im) im.src = u; } catch (e) { /* náhľad nevyšiel */ }
    }
  }
  const refreshThumbs = debounce(refreshThumbsNow, 700);
  ed.on('change', refreshThumbs);
  ed.on('side', refreshThumbs);
  document.addEventListener('vk:step', () => { if (getStep() === 'edit') refreshThumbs(); });

  /* ---------------- kontrola pred tlačou priamo v editore ---------------- */
  const chip = $('[data-pf-chip]'), pfPop = $('[data-pf-pop]');
  let pfItems = [];
  const runPf = debounce(async () => {
    if (getStep() !== 'edit' || !chip) return;
    let r; try { r = await inspect(ed.printable()); } catch (e) { return; }
    pfItems = [
      ...r.small.map((x) => ({ side: x.side, text: x.text, msg: tr(`Malé písmo (${x.pt.toFixed(1).replace('.', ',')} pt)`, `Malé písmo (${x.pt.toFixed(1).replace('.', ',')} pt)`) })),
      ...r.edge.map((x) => ({ side: x.side, text: x.text, msg: tr('Text je príliš blízko okraja', 'Text je příliš blízko okraje') })),
      ...r.lowres.map((x) => ({ side: x.side, text: null, msg: tr(`Obrázok má nízke rozlíšenie (${x.dpi} dpi)`, `Obrázek má nízké rozlišení (${x.dpi} dpi)`) })),
    ];
    chip.hidden = false;
    chip.classList.toggle('is-ok', !pfItems.length);
    $('[data-pf-t]').textContent = pfItems.length ? (pfItems.length === 1 ? tr('1 upozornenie', '1 upozornění') : tr(`${pfItems.length} upozornenia`, `${pfItems.length} upozornění`)) : tr('Pripravené na tlač', 'Připraveno k tisku');
    if (!pfPop.hidden) paintPf();
  }, 1400);
  function paintPf() {
    pfPop.innerHTML = pfItems.length ? `<b>${tr('Kontrola pred tlačou', 'Kontrola před tiskem')}</b>` + pfItems.map((x, i) => `<div class="edx-pfi"><span><b>${esc(x.msg)}</b>${x.text ? `<small>${x.side === 'back' ? tr('zadná', 'zadní') : tr('predná', 'přední')} · „${esc(x.text)}“</small>` : ''}</span>${x.text ? `<button type="button" data-pfi="${i}">${tr('Ukázať', 'Ukázat')}</button>` : ''}</div>`).join('') : `<b>${tr('Všetko v poriadku', 'Vše v pořádku')}</b><p>${tr('Písmo je dosť veľké, texty sú v bezpečnej zóne. Pred tlačou to ešte skontroluje človek.', 'Písmo je dost velké, texty jsou v bezpečné zóně. Před tiskem to ještě zkontroluje člověk.')}</p>`;
  }
  chip?.addEventListener('click', () => { pfPop.hidden = !pfPop.hidden; if (!pfPop.hidden) paintPf(); });
  pfPop?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-pfi]'); if (!b) return;
    const it = pfItems[+b.dataset.pfi];
    if (it.side !== ed.side) { await ed.setSide(it.side); paintSides?.(); }
    if (ed.selectByText(it.text)) toast(tr('Prvok je vybraný: zväčšite písmo alebo ho posuňte ďalej od okraja.', 'Prvek je vybraný: zvětšete písmo nebo ho posuňte dál od okraje.'));
    pfPop.hidden = true;
  });
  document.addEventListener('pointerdown', (e) => { if (pfPop && !pfPop.hidden && !e.target.closest('[data-pf-pop]') && !e.target.closest('[data-pf-chip]')) pfPop.hidden = true; });
  ed.on('change', runPf);
  document.addEventListener('vk:step', () => { if (getStep() === 'edit') runPf(); });

  /* ---------------- prázdna kontextová lišta ---------------- */
  const empty = $('[data-ctx-empty]');
  ed.on('selection', (o) => { if (empty) empty.hidden = !!o; if (o) paintQRIfOpen(); });
  const paintQRIfOpen = () => { if ($('[data-pp="qr"].on')) paintQR(); };
  ed.on('change', paintQRIfOpen);

  return { paintTemplates, paintText, paintBackground, paintQR, refreshThumbs };
}
