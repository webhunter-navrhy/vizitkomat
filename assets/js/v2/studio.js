// Studio v2 – prepojenie panelov s editorom
import { SIZES, BLEED, FONTS, PALETTES, ART, newDesign, contrast, mix, slugify, tr, CZ, DEFAULT_FIELDS } from './model.js';
import { TEMPLATES, BACK_KEYS, templateDefaults } from './templates.js';
import { snapshot, exportPDF, loadImg } from './render.js';
import { createEditor } from './editor.js';
import { askAI, API } from './ai.js';
import { renderDigital } from './digital.js';
import { ICONS, iconSVG } from '../icons.js';
import { analyzeLogo, fileToDataURL } from '../logo.js';
import * as store from './store.js';
import { toast } from './site.js';
import { money, printPrice, itemPrice, addWorkdays, fmtDay, qrSVG, debounce, session } from '../util.js';

const VK = window.VK;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const SAVE = 'studio-v2';
const qrFor = (slug) => `https://vizitkomat.eu/v/${slug || 'vase-meno'}/`;

const st = {
  cfg: { kind: 'bundle', size: '90x50', paper: 'matny', finish: 'none', corners: 'straight', qty: 250, express: false },
  view: 'edit', logoPals: [], aiDesigns: [], lastAI: null, slugTouched: false, touched: new Set(),
};

/* =========================================================
   ŠTART
   ========================================================= */
const host = $('[data-host]');
const ed = createEditor($('[data-canvas]'), host, { pad: 56 });

async function boot() {
  const saved = await store.get(SAVE);
  const draft = session('vk2-draft');
  let d, sides, custom;
  if (draft && draft.f) { d = draft; session('vk2-draft', null); if (saved?.cfg) st.cfg = { ...st.cfg, ...saved.cfg }; }
  else if (saved?.d) { d = saved.d; sides = saved.sides; custom = saved.custom; st.cfg = { ...st.cfg, ...saved.cfg }; st.slugTouched = !!saved.slugTouched; (saved.touched || []).forEach((k) => st.touched.add(k)); }
  else d = newDesign({ tpl: 'atelier', ...templateDefaults('atelier') });
  const meno = params.get('meno');
  if (meno) { d = { ...d, f: { ...d.f, name: meno } }; sides = null; custom = null; st.touched.add('name'); }
  for (const [p, k] of Object.entries({ papier: 'paper', povrch: 'finish', rohy: 'corners', ks: 'qty' })) if (params.get(p)) st.cfg[k] = k === 'qty' ? +params.get(p) : params.get(p);
  if (['bundle', 'print', 'digital'].includes(params.get('druh'))) st.cfg.kind = params.get('druh');
  d.size = st.cfg.size; d.corners = st.cfg.corners;
  if (!d.slug || !st.slugTouched) d.slug = slugify(d.f.name);
  d.qrUrl = qrFor(d.slug);
  await document.fonts.ready;
  await ed.load(d, sides, custom);
  syncFields();
  paintOrder();
  const tab = { ai: 'ai', sablony: 'sablony', logo: 'logo', subor: 'subor', texty: 'texty' }[params.get('rezim')] || (meno ? 'texty' : 'ai');
  openTab(tab);
  if (!$('[data-chat]').children.length) msg(tr('Ahoj! Som AI grafik. Napíšte mi, čím sa živíte, kde pôsobíte a aký štýl sa vám páči. Navrhnem tri vizitky.', 'Ahoj! Jsem AI grafik. Napište mi, čím se živíte, kde působíte a jaký styl se vám líbí. Navrhnu tři vizitky.'));
  const pr = params.get('prompt');
  if (pr) runAI(pr);
}

/* =========================================================
   PANELY
   ========================================================= */
const tabs = $$('[data-tab]'), panes = $$('[data-pane]');
function openTab(id) {
  tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === id));
  panes.forEach((p) => p.classList.toggle('on', p.dataset.pane === id));
  if (id === 'sablony') paintTemplates();
  if (id === 'styl') { paintPals(); paintFonts(); paintArts(); paintBacks(); }
  if (id === 'prvky') paintIcons();
  if (matchMedia('(max-width: 820px)').matches) {
    const top = $('.st-panels').getBoundingClientRect().top + scrollY - $('.st-stage').offsetHeight - $('.st-rail').offsetHeight - 64;
    if (scrollY > top + 10) scrollTo({ top, behavior: 'smooth' });
  }
}
tabs.forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab)));

// ---------- texty ----------
function syncFields() {
  const d = ed.design;
  $$('[data-f]').forEach((i) => { if (document.activeElement !== i) i.value = d.f[i.dataset.f] || ''; });
  $('[data-slug]').value = d.slug || '';
  $$('[data-soc]').forEach((i) => { i.value = (d.socials || {})[i.dataset.soc] || ''; });
  const ph = $('[data-photo-img]');
  if (d.photo) { ph.src = d.photo; $('[data-photo-del]').hidden = false; } else { ph.removeAttribute('src'); $('[data-photo-del]').hidden = true; }
}
const setFieldDebounced = debounce((k, v) => ed.setField(k, v), 90);
$$('[data-f]').forEach((i) => i.addEventListener('input', () => {
  const k = i.dataset.f; st.touched.add(k);
  if (k === 'name' && !st.slugTouched) { ed.design.slug = slugify(i.value); $('[data-slug]').value = ed.design.slug; updateQR(); }
  ed.design.f[k] = i.value;
  setFieldDebounced(k, i.value);
}));
ed.on('fields', ({ k }) => { syncFields(); if (k === 'name' && !st.slugTouched) { ed.design.slug = slugify(ed.design.f.name); $('[data-slug]').value = ed.design.slug; updateQR(); } });
$('[data-slug]').addEventListener('input', (e) => { st.slugTouched = true; ed.design.slug = slugify(e.target.value); updateQR(); persist(); });
const updateQR = debounce(() => { ed.setQR(qrFor(ed.design.slug)); paintPhone(); }, 500);
$$('[data-soc]').forEach((i) => i.addEventListener('input', () => { ed.design.socials = { ...(ed.design.socials || {}), [i.dataset.soc]: i.value.trim() }; paintPhone(); persist(); }));
$('[data-photo-pick]').addEventListener('click', () => $('[data-photo-file]').click());
$('[data-photo-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; ed.design.photo = await shrink(f, 520); syncFields(); paintPhone(); persist(); e.target.value = ''; if (st.view === 'edit') setView('phone'); });
$('[data-photo-del]').addEventListener('click', () => { ed.design.photo = null; syncFields(); paintPhone(); persist(); });

async function shrink(file, max, type = 'image/jpeg') {
  const src = await fileToDataURL(file); const im = await loadImg(src);
  const sc = Math.min(1, max / Math.max(im.width, im.height));
  const c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(type, 0.88);
}

// ---------- šablóny ----------
const thumbs = new Map();
async function thumb(d, side = 'front', w = 360) {
  const key = JSON.stringify([side, w, d.tpl, d.fonts, d.pal, d.f, d.art && d.art.slice(0, 60), d.logo && d.logo.length, d.size, d.back]);
  if (thumbs.has(key)) return thumbs.get(key);
  const p = snapshot({ ...d, sides: null }, side, w, 'image/jpeg', 0.85);
  thumbs.set(key, p);
  if (thumbs.size > 160) thumbs.delete(thumbs.keys().next().value);
  return p;
}
let tplToken = 0;
async function paintTemplates() {
  const box = $('[data-tpls]');
  const filt = $('[data-filt] .on')?.dataset.f || '';
  const keep = $('[data-keep]').checked;
  const tok = ++tplToken;
  const ids = Object.keys(TEMPLATES).filter((id) => !filt || TEMPLATES[id].tags.includes(filt));
  box.innerHTML = ids.map((id) => `<button data-tpl="${id}"${ed.design.tpl === id ? ' class="on"' : ''}><img alt=""><span>${TEMPLATES[id].name}</span></button>`).join('');
  for (const id of ids) {
    if (tok !== tplToken) return;
    const d = { ...ed.design, tpl: id, back: 'auto', ...(keep ? {} : templateDefaults(id)) };
    const url = await thumb(d);
    const img = $(`[data-tpl="${id}"] img`, box); if (img) img.src = url;
  }
}
$('[data-tpls]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-tpl]'); if (!b) return;
  const had = ed.custom.front || ed.custom.back;
  await ed.setTemplate(b.dataset.tpl, $('[data-keep]').checked);
  $$('[data-tpl]').forEach((x) => x.classList.toggle('on', x === b));
  if (had) toast(tr('Šablóna zmenená, vaše ručné úpravy sa prepísali.', 'Šablona změněna, vaše ruční úpravy se přepsaly.'), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() });
});
$('[data-filt]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('[data-filt] button').forEach((x) => x.classList.toggle('on', x === b)); paintTemplates(); });
$('[data-keep]').addEventListener('change', paintTemplates);

// ---------- AI ----------
const chat = $('[data-chat]');
function msg(html, who = 'bot') {
  const m = document.createElement('div'); m.className = `msg msg--${who}`; m.innerHTML = html; chat.append(m);
  m.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return m;
}
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const STEPS = [tr('Čítam vaše zadanie…', 'Čtu vaše zadání…'), tr('Vyberám rozloženie…', 'Vybírám rozložení…'), tr('Ladím farby a písmo…', 'Ladím barvy a písmo…'), tr('Píšem slogan…', 'Píšu slogan…'), tr('Kreslím grafiku na mieru…', 'Kreslím grafiku na míru…')];
let stepT;
function aiLoading(on) {
  const box = $('[data-ai-stage]');
  box.hidden = !on && !st.aiDesigns.length;
  $('[data-ai-load]').hidden = !on; $('[data-ai-res]').hidden = on;
  clearInterval(stepT);
  if (on) { box.hidden = false; let i = 0; $('[data-ai-step]').textContent = STEPS[0]; stepT = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); $('[data-ai-step]').textContent = STEPS[i]; }, 1300); }
}
async function runAI(prompt, previous) {
  msg(esc(prompt), 'me');
  const wait = msg('<span class="dots"><i></i><i></i><i></i></span>');
  aiLoading(true);
  const base = { ...ed.design.f };
  // nevyplnené ukážkové údaje AI neposielame ako „známe“
  for (const k of Object.keys(base)) if (!st.touched.has(k) && base[k] === DEFAULT_FIELDS[k]) delete base[k];
  const r = await askAI(prompt, base, { previous, onArt: (i, d) => refreshAICard(i, d) });
  st.aiDesigns = r.designs.map((d) => ({ ...d, logo: ed.design.logo, size: ed.design.size, slug: ed.design.slug, qrUrl: ed.design.qrUrl, photo: ed.design.photo, socials: ed.design.socials }));
  st.lastAI = prompt;
  wait.innerHTML = esc(r.intro) + (r.remote ? '' : `<br><small style="opacity:.7">${tr('(AI je teraz preťažená, návrhy vybral záložný režim.)', '(AI je teď přetížená, návrhy vybral záložní režim.)')}</small>`);
  aiLoading(false);
  await paintAIResults(r.intro);
  $('[data-refine]').hidden = false;
}
async function paintAIResults(intro) {
  $('[data-ai-intro]').textContent = intro || '';
  const grid = $('[data-ai-grid]'); grid.innerHTML = '';
  st.aiDesigns.forEach((d, i) => {
    const b = document.createElement('button'); b.dataset.ai = i;
    b.innerHTML = `<div class="st-ai__card"><img alt="">${d.artPending ? `<span class="pending"><span class="dots"><i></i><i></i><i></i></span> ${tr('kreslím grafiku', 'kreslím grafiku')}</span>` : ''}</div><b>${tr('Návrh', 'Návrh')} ${i + 1}</b><small>${esc(d.why || '')}</small>`;
    grid.append(b);
    thumb(d, 'front', 720).then((u) => { const im = b.querySelector('img'); if (im) im.src = u; });
  });
  $('[data-ai-stage]').hidden = false; $('[data-ai-res]').hidden = false; $('[data-ai-load]').hidden = true;
}
function refreshAICard(i, d) {
  const sd = st.aiDesigns[i]; if (!sd) return;
  sd.art = d.art; sd.why = d.why; sd.artPending = false;
  const b = $(`[data-ai-grid] [data-ai="${i}"]`); if (!b) return;
  b.querySelector('.pending')?.remove();
  b.querySelector('small').textContent = sd.why;
  thumb(sd, 'front', 720).then((u) => { b.querySelector('img').src = u; });
}
$('[data-ai-grid]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-ai]'); if (!b) return;
  const d = st.aiDesigns[+b.dataset.ai];
  await ed.applyDesign({ tpl: d.tpl, fonts: d.fonts, pal: d.pal, art: d.art, f: d.f, back: 'auto' });
  syncFields();
  $('[data-ai-stage]').hidden = true;
  msg(tr('Hotovo, návrh je vo vizitke. Kliknite do textu a upravte ho, alebo ma požiadajte o zmenu.', 'Hotovo, návrh je ve vizitce. Klikněte do textu a upravte ho, nebo mě požádejte o změnu.'));
});
$('[data-ai-close]').addEventListener('click', () => { $('[data-ai-stage]').hidden = true; });
$('[data-ask]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-ask-in]').value.trim(); if (v.length < 3) return; $('[data-ask-in]').value = ''; runAI(v); });
$('[data-ask-in]').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('[data-ask]').requestSubmit(); } });
$$('[data-chips] button').forEach((b) => b.addEventListener('click', () => runAI(b.dataset.p)));
$$('[data-refine] button').forEach((b) => b.addEventListener('click', () => {
  const d = ed.design;
  runAI(`${st.lastAI || ''} – ${b.dataset.r}`.trim(), { template: d.tpl, fonts: d.fonts, palette: d.pal });
}));

// ---------- prvky ----------
$$('[data-add]').forEach((b) => b.addEventListener('click', () => ed.add(b.dataset.add, b.dataset.add === 'heading' ? { text: ed.design.f.company || tr('Nadpis', 'Nadpis') } : {})));
$('[data-add-img]').addEventListener('click', () => $('[data-img-file]').click());
$('[data-img-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; ed.add('image', { src: await shrink(f, 2000, f.type === 'image/png' ? 'image/png' : 'image/jpeg') }); e.target.value = ''; });
let iconsDone = false;
function paintIcons() {
  if (iconsDone) return; iconsDone = true;
  $('[data-icons]').innerHTML = Object.keys(ICONS).map((n) => `<button data-icon="${n}" title="${n}">${iconSVG(n, '#0F1440', 1.8)}</button>`).join('');
}
$('[data-icons]').addEventListener('click', (e) => { const b = e.target.closest('[data-icon]'); if (b) ed.add('icon', { name: b.dataset.icon }); });

// ---------- logo ----------
const drop = $('[data-drop]');
async function logoFlow(file) {
  const r = await analyzeLogo(file);
  st.logoPals = r.palettes.map((p, i) => ({ ...p, label: [tr('Logo', 'Logo'), tr('Logo výrazná', 'Logo výrazná'), tr('Logo tmavá', 'Logo tmavá')][i] }));
  await ed.setLogo(r.src);
  $('[data-drop-img]').src = r.src; drop.classList.add('has');
  const sw = $('[data-logo-sw]'); sw.hidden = false;
  sw.innerHTML = tr('Farby značky:', 'Barvy značky:') + ' ' + r.colors.slice(0, 5).map((c) => `<i style="--c:${c}" title="${c}"></i>`).join('');
  $('[data-logo-del]').hidden = false;
  const box = $('[data-logo-designs]'); box.innerHTML = '';
  const combos = [['firma', 0, 'geist'], ['atelier', 1, 'instrument'], ['noirgold', 2, 'bodoni'], ['monolit', 1, 'inter'], ['duo', 0, 'grotesk'], ['zlato', 2, 'playfair']];
  for (const [tpl, pi, fonts] of combos) {
    const pal = st.logoPals[pi];
    const d = { ...ed.design, tpl, fonts, pal, art: null, back: 'auto' };
    const b = document.createElement('button');
    b.innerHTML = `<img alt=""><span>${TEMPLATES[tpl].name} · ${pal.label}</span>`;
    box.append(b);
    thumb(d).then((u) => { b.querySelector('img').src = u; });
    b.addEventListener('click', async () => { await ed.applyDesign({ tpl, fonts, pal, art: null }); $$('button', box).forEach((x) => x.classList.toggle('on', x === b)); });
  }
}
$('[data-drop-file]').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) logoFlow(f); e.target.value = ''; });
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) logoFlow(f); });
$('[data-logo-del]').addEventListener('click', async () => { await ed.setLogo(null); drop.classList.remove('has'); $('[data-drop-img]').removeAttribute('src'); $('[data-logo-del]').hidden = true; });

// ---------- štýl ----------
function curPal() { return ed.design.pal || PALETTES[TEMPLATES[ed.design.tpl].pal]; }
function paintPals() {
  const list = [...st.logoPals.map((p, i) => ['logo' + i, p]), ...Object.entries(PALETTES)];
  const cur = curPal();
  $('[data-pals]').innerHTML = list.map(([k, p]) => `<button class="pal${p.bg === cur.bg && p.accent === cur.accent && p.ink === cur.ink ? ' on' : ''}" data-pal="${k}" title="${p.label}"><i><b style="background:${p.bg}"></b><b style="background:${p.accent}"></b><b style="background:${p.ink}"></b></i>${p.label}</button>`).join('');
  $$('[data-c]').forEach((i) => { i.value = cur[i.dataset.c] || '#000000'; });
  $('[data-contrast]').hidden = contrast(cur.bg, cur.ink) >= 4;
}
$('[data-pals]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-pal]'); if (!b) return;
  const k = b.dataset.pal;
  await ed.setPalette(k.startsWith('logo') ? st.logoPals[+k.slice(4)] : PALETTES[k]);
  paintPals();
});
$$('[data-c]').forEach((i) => i.addEventListener('change', async () => { await ed.setPalette({ ...curPal(), [i.dataset.c]: i.value, label: tr('Vlastná', 'Vlastní') }); paintPals(); }));
function paintFonts() {
  const cur = ed.design.fonts || TEMPLATES[ed.design.tpl].fonts;
  $('[data-fonts]').innerHTML = Object.entries(FONTS).map(([k, f]) => `<button class="font${k === cur ? ' on' : ''}" data-font="${k}"><b style="font-family:'${f.display}';font-weight:${f.dw}">Ľubica Šť</b><small>${f.label}</small></button>`).join('');
}
$('[data-fonts]').addEventListener('click', async (e) => { const b = e.target.closest('[data-font]'); if (!b) return; await ed.setFonts(b.dataset.font); paintFonts(); });
function paintArts() {
  const cur = ed.design.art;
  $('[data-arts]').innerHTML = `<button class="none${!cur ? ' on' : ''}" data-art="">${tr('Bez', 'Bez')}</button>` +
    Object.keys(ART).map((k) => `<button data-art="${k}" title="${ART[k].label}" class="${cur === k ? 'on' : ''}" style="background-image:url(${VK.root}assets/art/${k}.jpg)"></button>`).join('') +
    (cur && cur.startsWith('data:') ? `<button class="on" data-art="__ai" style="background-image:url(${cur})" title="AI"></button>` : '');
}
$('[data-arts]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-art]'); if (!b || b.dataset.art === '__ai') return;
  const k = b.dataset.art || null;
  if (k && !TEMPLATES[ed.design.tpl].art && !['mramor', 'prechod', 'holo', 'botanika', 'linia', 'akvarel', 'terrazzo', 'retro', 'drevo', 'bauhaus', 'noirgold', 'podpis'].includes(ed.design.tpl)) {
    const tpl = ART[k].tone === 'light' && ['botanika', 'liniove-listy', 'akvarel-modry'].includes(k) ? (k === 'botanika' ? 'botanika' : k === 'akvarel-modry' ? 'akvarel' : 'linia') : 'mramor';
    await ed.setTemplate(tpl, true);
  }
  await ed.setArt(k); paintArts();
});
$('[data-art-form]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = $('[data-art-in]').value.trim(); if (p.length < 3) return;
  const btn = e.currentTarget.querySelector('button'); btn.disabled = true; btn.textContent = tr('Kreslím…', 'Kreslím…');
  try {
    const r = await fetch(API + '/artwork', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: p, kind: TEMPLATES[ed.design.tpl].art ? 'full' : 'full' }) }).then((x) => x.json());
    if (r.src) {
      if (!['mramor', 'prechod', 'holo', 'botanika', 'linia', 'akvarel', 'terrazzo', 'retro', 'drevo', 'bauhaus', 'noirgold', 'podpis'].includes(ed.design.tpl)) await ed.setTemplate('prechod', true);
      await ed.setArt(r.src); paintArts();
    } else toast(tr('Grafiku sa nepodarilo nakresliť, skúste iný popis.', 'Grafiku se nepodařilo nakreslit, zkuste jiný popis.'));
  } catch (x) { toast(tr('AI je teraz nedostupná, skúste o chvíľu.', 'AI je teď nedostupná, zkuste za chvíli.')); }
  btn.disabled = false; btn.textContent = tr('Nakresli', 'Nakresli');
});
const BACK_L = { auto: tr('Podľa šablóny', 'Podle šablony'), qr: tr('QR na digitálnu', 'QR na digitální'), logo: tr('Logo alebo firma', 'Logo nebo firma'), details: tr('Kontakty', 'Kontakty'), blank: tr('Jednofarebná', 'Jednobarevná') };
function paintBacks() {
  const box = $('[data-backs]');
  box.innerHTML = BACK_KEYS.map((k) => `<button data-back="${k}"${(ed.design.back || 'auto') === k ? ' class="on"' : ''}><img alt=""><span>${BACK_L[k]}</span></button>`).join('');
  BACK_KEYS.forEach((k) => thumb({ ...ed.design, back: k }, 'back').then((u) => { const im = $(`[data-back="${k}"] img`, box); if (im) im.src = u; }));
}
$('[data-backs]').addEventListener('click', async (e) => { const b = e.target.closest('[data-back]'); if (!b) return; await ed.setBack(b.dataset.back); paintSides(); paintBacks(); });

// ---------- vlastný súbor ----------
let pdfjs;
async function pdfLib() {
  if (pdfjs) return pdfjs;
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
  pdfjs = window.pdfjsLib; pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return pdfjs;
}
async function readFile(file) {
  const Sz = SIZES[st.cfg.size];
  if (file.type === 'application/pdf') {
    const lib = await pdfLib();
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const v1 = page.getViewport({ scale: 1 });
    const wmm = v1.width * 25.4 / 72, hmm = v1.height * 25.4 / 72;
    const vp = page.getViewport({ scale: 2400 / v1.width });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return { src: c.toDataURL('image/jpeg', 0.92), name: file.name, pdf: true, wmm, hmm, pages: pdf.numPages };
  }
  const src = await fileToDataURL(file); const im = await loadImg(src);
  const rB = (Sz.w + 2 * BLEED) / (Sz.h + 2 * BLEED), rT = Sz.w / Sz.h, ratio = im.width / im.height;
  const hasBleed = Math.abs(ratio - rB) < Math.abs(ratio - rT);
  return { src, name: file.name, w: im.width, h: im.height, dpi: Math.round(im.width / ((hasBleed ? Sz.w + 2 * BLEED : Sz.w) / 25.4)), hasBleed, ratioOk: Math.min(Math.abs(ratio - rB), Math.abs(ratio - rT)) < 0.04 };
}
const fileInfo = {};
function paintChecks() {
  const Sz = SIZES[st.cfg.size]; const out = [];
  for (const side of ['front', 'back']) {
    const f = fileInfo[side]; if (!f) continue;
    const lab = side === 'front' ? tr('Predná', 'Přední') : tr('Zadná', 'Zadní');
    if (f.pdf) {
      const okB = Math.abs(f.wmm - (Sz.w + 2 * BLEED)) < 1.2;
      out.push([okB || Math.abs(f.wmm - Sz.w) < 1.2 ? 'ok' : 'warn', `${lab}: PDF ${f.wmm.toFixed(1)} × ${f.hmm.toFixed(1)} mm`]);
      if (!okB) out.push(['warn', `${lab}: ${tr('bez spadávky 2 mm, pri kontrole ju doplníme', 'bez spadávky 2 mm, při kontrole ji doplníme')}`]);
    } else {
      out.push([f.dpi >= 300 ? 'ok' : 'warn', `${lab}: ${f.w} × ${f.h} px ≈ ${f.dpi} dpi${f.dpi < 300 ? ' – ' + tr('odporúčame aspoň 300 dpi', 'doporučujeme aspoň 300 dpi') : ''}`]);
      out.push([f.ratioOk ? (f.hasBleed ? 'ok' : 'warn') : 'warn', !f.ratioOk ? `${lab}: ${tr('pomer strán nesedí s formátom', 'poměr stran nesedí s formátem')} ${Sz.label}` : f.hasBleed ? `${lab}: ${tr('spadávka je v poriadku', 'spadávka je v pořádku')}` : `${lab}: ${tr('bez spadávky, pri kontrole ju doplníme', 'bez spadávky, při kontrole ji doplníme')}`]);
    }
  }
  if (out.length) out.push(['info', tr('Pred tlačou súbor skontroluje človek a farby prevedie do CMYK.', 'Před tiskem soubor zkontroluje člověk a barvy převede do CMYK.')]);
  $('[data-checks]').innerHTML = out.map(([c, t]) => `<li class="${c}">${esc(t)}</li>`).join('');
}
$$('[data-fdrop]').forEach((lab) => {
  const side = lab.dataset.fdrop, input = lab.querySelector('input');
  const go = async (file) => {
    try {
      const r = await readFile(file); fileInfo[side] = r;
      lab.querySelector('img').src = r.src; lab.classList.add('has');
      await ed.coverImage(r.src, side); paintSides(); paintChecks();
    } catch (x) { toast(tr('Súbor sa nepodarilo načítať. Skúste PNG, JPG alebo PDF.', 'Soubor se nepodařilo načíst. Zkuste PNG, JPG nebo PDF.')); }
  };
  input.addEventListener('change', (e) => { const f = e.target.files[0]; if (f) go(f); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => lab.addEventListener(ev, (e) => { e.preventDefault(); lab.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => lab.addEventListener(ev, (e) => { e.preventDefault(); lab.classList.remove('over'); }));
  lab.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) go(f); });
});

/* =========================================================
   KONTEXTOVÝ PANEL
   ========================================================= */
const ctx = $('[data-ctx]');
const FAMS = [...new Set(Object.values(FONTS).flatMap((f) => [f.display, f.text]))];
$('[data-fontsel]').innerHTML = FAMS.map((f) => `<option value="${f}" style="font-family:'${f}'">${f}</option>`).join('');
const PT = 25.4 / 72 * 10; // px na 1 pt (pri 10 px/mm)
function paintCtx(o) {
  if (!o || st.view !== 'edit') { ctx.hidden = true; $$('.pop').forEach((p) => p.classList.remove('on')); return; }
  ctx.hidden = false;
  const isText = o.type === 'i-text' || o.type === 'text' || o.type === 'textbox';
  const isImg = o.type === 'image';
  $('[data-ctx-text]').hidden = !isText;
  $('[data-ctx-img]').hidden = !isImg;
  $('[data-ctx-colors]').hidden = isImg;
  if (isText) {
    const sel = $('[data-fontsel]'); if (!FAMS.includes(o.fontFamily)) sel.insertAdjacentHTML('beforeend', `<option>${o.fontFamily}</option>`); sel.value = o.fontFamily;
    $('[data-szv]').value = (o.fontSize * (o.scaleY || 1) / PT).toFixed(1).replace('.0', '');
    $('[data-bold]').classList.toggle('on', +o.fontWeight >= 600);
    $('[data-italic]').classList.toggle('on', o.fontStyle === 'italic');
    $('[data-upper]').classList.toggle('on', !!(o.data && o.data.upper));
    $('[data-ls]').value = o.charSpacing || 0;
    $$('[data-align] button').forEach((b) => b.classList.toggle('on', b.dataset.a === o.textAlign));
  }
  const pal = curPal();
  const cur = (o.type === 'line' ? o.stroke : o.type === 'group' ? (o.getObjects()[0]?.stroke || o.getObjects()[0]?.fill) : o.fill) || '';
  const cols = [...new Set([pal.ink, pal.accent, pal.bg, pal.soft, '#FFFFFF', '#111111'].map((c) => c.toUpperCase()))];
  $('[data-ctx-colors]').innerHTML = cols.map((c) => `<button data-col="${c}" style="background:${c}"${String(cur).toUpperCase() === c ? ' class="on"' : ''} aria-label="${c}"></button>`).join('') + `<label title="${tr('Vlastná farba', 'Vlastní barva')}"><input type="color" data-colpick value="${/^#[0-9a-f]{6}$/i.test(cur) ? cur : '#000000'}"></label>`;
  $('[data-opacity]').value = Math.round((o.opacity ?? 1) * 100);
}
ed.on('selection', paintCtx);
ed.on('restore', () => { syncFields(); paintSides(); });
$('[data-fontsel]').addEventListener('change', (e) => ed.style({ fontFamily: e.target.value }));
$$('[data-sz]').forEach((b) => b.addEventListener('click', () => { const o = ed.active(); if (!o) return; const pt = o.fontSize * (o.scaleY || 1) / PT + (+b.dataset.sz); ed.style({ fontSize: Math.max(4, pt) * PT / (o.scaleY || 1) }); }));
$('[data-szv]').addEventListener('change', (e) => { const o = ed.active(); const pt = parseFloat(e.target.value.replace(',', '.')); if (o && pt > 2) ed.style({ fontSize: pt * PT / (o.scaleY || 1) }); });
$('[data-bold]').addEventListener('click', () => { const o = ed.active(); if (o) ed.style({ fontWeight: +o.fontWeight >= 600 ? 400 : 700 }); });
$('[data-italic]').addEventListener('click', () => { const o = ed.active(); if (o) ed.style({ fontStyle: o.fontStyle === 'italic' ? 'normal' : 'italic' }); });
$('[data-upper]').addEventListener('click', () => { const o = ed.active(); if (!o) return; const up = !(o.data && o.data.upper); if (!up && o.data?.field) ed.style({ upper: false, text: (o.data.prefix || '') + (ed.design.f[o.data.field] || o.text) }); else ed.style({ upper: up }); });
$('[data-ls]').addEventListener('input', (e) => ed.style({ charSpacing: +e.target.value }));
$$('[data-align] button').forEach((b) => b.addEventListener('click', () => ed.style({ textAlign: b.dataset.a })));
ctx.addEventListener('click', (e) => {
  const c = e.target.closest('[data-col]'); if (c) ed.style({ color: c.dataset.col });
  const p = e.target.closest('[data-pop]');
  if (p) { const box = $(`[data-popbox="${p.dataset.pop}"]`); const was = box.classList.contains('on'); $$('.pop').forEach((x) => x.classList.remove('on')); box.classList.toggle('on', !was); }
  const ord = e.target.closest('[data-order]'); if (ord) ed.order(ord.dataset.order);
  const al = e.target.closest('[data-alignc]'); if (al) ed.align(al.dataset.alignc);
});
ctx.addEventListener('input', (e) => { if (e.target.matches('[data-colpick]')) ed.style({ color: e.target.value }); if (e.target.matches('[data-opacity]')) ed.style({ opacity: +e.target.value / 100 }); });
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.ctx__pop')) $$('.pop').forEach((x) => x.classList.remove('on')); });
$('[data-dup]').addEventListener('click', () => ed.duplicate());
$('[data-del]').addEventListener('click', () => ed.remove());
$('[data-replace]').addEventListener('click', () => $('[data-replace-file]').click());
$('[data-replace-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; const o = ed.active(); if (f && o) ed.replaceImage(o, await shrink(f, 2000, f.type === 'image/png' ? 'image/png' : 'image/jpeg')); e.target.value = ''; });

/* =========================================================
   PLÁTNO: strany, pohľady, nástroje
   ========================================================= */
function paintSides() { $$('[data-side]').forEach((b) => b.classList.toggle('on', b.dataset.side === ed.side)); }
$$('[data-side]').forEach((b) => b.addEventListener('click', async () => { await ed.setSide(b.dataset.side); paintSides(); if (st.view === '3d') show3D(); }));
ed.on('side', paintSides);
$('[data-undo]').addEventListener('click', () => ed.undo());
$('[data-redo]').addEventListener('click', () => ed.redo());
ed.on('history', ({ undo, redo }) => { $('[data-undo]').disabled = !undo; $('[data-redo]').disabled = !redo; });
$('[data-marks]').addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); ed.setMarks(on); });
$('[data-reset]').addEventListener('click', async () => { await ed.resetSide(); toast(tr('Strana je obnovená podľa šablóny.', 'Strana je obnovena podle šablony.'), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() }); });

let scene3d = null, scene3dKey = '';
async function show3D() {
  const box = $('[data-3d]');
  const [front, back] = await Promise.all([ed.snapshot('front', 1600, 'image/jpeg'), ed.snapshot('back', 1600, 'image/jpeg')]);
  const S = SIZES[st.cfg.size];
  const finish = st.cfg.paper === 'triplex' ? 'matte' : st.cfg.finish === 'leskla' ? 'gloss' : st.cfg.finish === 'soft' ? 'soft' : 'matte';
  const key = S.w + 'x' + S.h;
  const { cardScene } = await import('./three-cards.js');
  if (!scene3d || scene3dKey !== key) {
    scene3d?.dispose(); box.innerHTML = '';
    scene3d = await cardScene(box, [{ front, back, w: S.w, h: S.h, pos: [0, 0, 0], rot: [-0.2, ed.side === 'back' ? Math.PI - 0.4 : -0.4, 0.04], finish, thick: st.cfg.paper === 'triplex' ? 2 : 0.7, edge: st.cfg.paper === 'triplex' ? '#E8462B' : '#EDE8DE' }], { camZ: 210, fov: 30, shadow: false, drag: true, parallaxAmt: 0.1, float: false, fit: 160 });
    scene3dKey = key;
  } else {
    await scene3d.setTexture(0, 'front', front); await scene3d.setTexture(0, 'back', back);
    scene3d.setFinish(0, finish); scene3d.setThickness(0, st.cfg.paper === 'triplex' ? 2 : 0.7, st.cfg.paper === 'triplex' ? '#E8462B' : '#EDE8DE');
  }
}
function paintPhone() {
  if (st.view !== 'phone') return;
  const d = ed.design;
  renderDigital($('[data-dhost]'), { ...d, pal: curPal() }, { url: qrFor(d.slug), qr: (u) => qrSVG(u) });
}
function setView(v) {
  st.view = v;
  $$('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  $('[data-host]').style.visibility = v === 'edit' ? '' : 'hidden';
  $('[data-3d]').hidden = v !== '3d';
  $('[data-phone]').hidden = v !== 'phone';
  $('[data-sides]').style.visibility = v === 'phone' ? 'hidden' : '';
  if (v !== 'edit') { ed.deselect(); paintCtx(null); }
  if (v === '3d') show3D();
  if (v === 'phone') paintPhone();
}
$$('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

/* =========================================================
   OBJEDNÁVKA
   ========================================================= */
function paintOrder() {
  const P = VK.prices, c = st.cfg;
  const dig = c.kind === 'digital';
  $('[data-opts]').classList.toggle('off', dig);
  $$('[data-o="finish"] button').forEach((b) => { b.disabled = c.paper === 'triplex' && b.dataset.v !== 'none'; b.style.opacity = b.disabled ? 0.35 : ''; });
  $$('[data-qp]').forEach((s) => { s.textContent = money(printPrice({ ...c, qty: +s.dataset.qp }, P)); });
  const total = itemPrice(c, P);
  $('[data-sum]').textContent = money(total); $('[data-bar-p]').textContent = money(total);
  $('[data-sum-m]').textContent = dig ? tr('na 12 mesiacov', 'na 12 měsíců') : `${c.qty} ${tr('ks', 'ks')} · ${money(total / c.qty, { decimals: 2 })} / ${tr('ks', 'ks')}`;
  $('[data-bar-m]').textContent = dig ? tr('digitálna', 'digitální') : `${c.qty} ${tr('ks', 'ks')}`;
  const now = new Date();
  $('[data-sum-d]').textContent = dig ? tr('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.') : `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + (c.express ? 2 : 4)))}`;
  $$('[data-o]').forEach((seg) => $$('button', seg).forEach((b) => b.classList.toggle('on', String(c[seg.dataset.o]) === b.dataset.v)));
  $$('[data-kind] .kind').forEach((b) => b.classList.toggle('on', b.dataset.v === c.kind));
  $('[data-express]').checked = !!c.express;
  $('[data-dim]').textContent = SIZES[c.size].label;
  $('[data-spec]').textContent = `${SIZES[c.size].w + 4} × ${SIZES[c.size].h + 4} mm`;
  $('[data-digital-fields]').style.display = c.kind === 'print' ? 'none' : '';
  $('[data-pdf]').hidden = dig;
}
$$('[data-kind] .kind').forEach((b) => b.addEventListener('click', () => { st.cfg.kind = b.dataset.v; paintOrder(); persist(); if (b.dataset.v === 'digital') setView('phone'); }));
$$('[data-o]').forEach((seg) => seg.addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  const k = seg.dataset.o; st.cfg[k] = k === 'qty' ? +b.dataset.v : b.dataset.v;
  if (st.cfg.paper === 'triplex') st.cfg.finish = 'none';
  paintOrder(); persist();
  if (k === 'size') { thumbs.clear(); await ed.setSize(st.cfg.size); if ($('[data-pane="sablony"]').classList.contains('on')) paintTemplates(); paintChecks(); }
  if (k === 'corners') ed.setCorners(st.cfg.corners);
  if (st.view === '3d' && ['paper', 'finish', 'size'].includes(k)) show3D();
}));
$('[data-express]').addEventListener('change', (e) => { st.cfg.express = e.target.checked; paintOrder(); persist(); });
$('[data-pdf]').addEventListener('click', async (e) => {
  const b = e.currentTarget, t = b.textContent; b.textContent = tr('Pripravujem PDF…', 'Připravuji PDF…');
  try { await exportPDF(ed.printable(), `vizitka-${slugify(ed.design.f.name) || 'vizitkomat'}.pdf`); } finally { b.textContent = t; }
});
$('[data-add-cart]').addEventListener('click', async (e) => {
  const b = e.currentTarget; b.disabled = true;
  const d = ed.printable();
  const [front, back] = await Promise.all([snapshot(d, 'front', 640, 'image/jpeg'), snapshot(d, 'back', 640, 'image/jpeg')]);
  await store.cartAdd({ kind: st.cfg.kind, config: { ...st.cfg }, design: d, thumb: front, thumbBack: back, title: d.f.name || tr('Vizitka', 'Vizitka') });
  b.disabled = false;
  $('[data-orderpanel]').classList.remove('open');
  toast(tr('Vizitka je v košíku.', 'Vizitka je v košíku.'), { href: VK.links.kosik, label: tr('Do košíka', 'Do košíku') });
});
$('[data-bar-open]').addEventListener('click', () => $('[data-orderpanel]').classList.toggle('open'));
$('[data-order-close]').addEventListener('click', () => $('[data-orderpanel]').classList.remove('open'));

/* =========================================================
   UKLADANIE
   ========================================================= */
const persist = debounce(() => {
  store.set(SAVE, { ...ed.export(), cfg: st.cfg, slugTouched: st.slugTouched, touched: [...st.touched] });
}, 700);
ed.on('change', () => { persist(); if (st.view === 'phone') paintPhone(); });

boot();
