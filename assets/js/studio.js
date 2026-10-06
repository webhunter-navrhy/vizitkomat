// Studio – editor vizitiek
import * as E from './card-engine.js';
import { suggest, PRESETS } from './ai-engine.js';
import { analyzeLogo, fileToDataURL } from './logo.js';
import { renderDigital } from './digital-card.js';
import { addItem } from './cart.js';
import { $, $$, T, VK, money, itemPrice, printPrice, addWorkdays, fmtDay, session, store, debounce, qrSVG, toast } from './util.js';

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const SAVE_KEY = 'vk-studio-v1';
const params = new URLSearchParams(location.search);
const slugify = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const digitalUrl = (slug) => `https://vizitkomat.eu/v/${slug || 'vase-meno'}/`;

/* ---------- stav ---------- */
const S = {
  d: null, side: 'front', view: 'paper', marks: false,
  cfg: { kind: 'bundle', size: '90x50', paper: 'matny', finish: 'none', corners: 'straight', qty: 250, express: false },
  custom: null, touched: new Set(), slugTouched: false, logoPalettes: [], history: [],
};

function ensureDigital(d) {
  d.digital = d.digital || {};
  d.digital.socials = d.digital.socials || {};
  if (!d.digital.slug) d.digital.slug = slugify(d.f.name);
  d.qrUrl = digitalUrl(d.digital.slug);
  return d;
}

(function load() {
  const saved = store(SAVE_KEY);
  const draft = session('vk-draft');
  if (draft && draft.f) {
    S.d = E.newDesign({ ...draft });
    session('vk-draft', null);
    if (saved?.cfg) S.cfg = { ...S.cfg, ...saved.cfg };
  } else if (saved?.d) {
    S.d = E.newDesign({ ...saved.d });
    S.cfg = { ...S.cfg, ...saved.cfg };
    (saved.touched || []).forEach((k) => S.touched.add(k));
    S.slugTouched = !!saved.slugTouched;
  } else {
    S.d = E.newDesign({ tpl: 'editorial', ...E.templateDefaults('editorial') });
  }
  const meno = params.get('meno');
  if (meno) { S.d.f.name = meno; S.touched.add('name'); S.d.digital && (S.d.digital.slug = ''); }
  const map = { papier: 'paper', povrch: 'finish', rohy: 'corners', ks: 'qty' };
  for (const [p, k] of Object.entries(map)) if (params.get(p)) S.cfg[k] = k === 'qty' ? +params.get(p) : params.get(p);
  if (['bundle', 'print', 'digital'].includes(params.get('druh'))) S.cfg.kind = params.get('druh');
  S.d.size = S.cfg.size;
  S.d.corners = S.cfg.corners;
  ensureDigital(S.d);
})();

const persist = debounce(() => {
  try { store(SAVE_KEY, { d: S.d, cfg: S.cfg, touched: [...S.touched], slugTouched: S.slugTouched }); }
  catch (e) { /* plné úložisko */ }
}, 500);

let lastSnap = JSON.stringify(S.d);
const pushHistory = debounce(() => {
  const snap = JSON.stringify(S.d);
  if (snap === lastSnap) return;
  S.history.push(lastSnap); if (S.history.length > 40) S.history.shift();
  lastSnap = snap;
  $('[data-undo]').disabled = !S.history.length;
}, 450);
function undo() {
  const prev = S.history.pop();
  if (!prev) return;
  S.d = JSON.parse(prev); lastSnap = prev;
  $('[data-undo]').disabled = !S.history.length;
  syncFields(); update({ noHistory: true });
}

/* ---------- vykreslenie ---------- */
const faces = { front: $('[data-face="front"]'), back: $('[data-face="back"]') };
const cardWrap = $('[data-card-wrap]'), cardIn = $('[data-card-in]');
let renderToken = 0;

async function drawCustom(canvas, side, width) {
  const f = S.custom[side];
  const Sz = E.SIZES[S.cfg.size];
  const pad = S.marks ? 7 : 0;
  const k = width / (Sz.w + 2 * pad);
  canvas.width = Math.round((Sz.w + 2 * pad) * k); canvas.height = Math.round((Sz.h + 2 * pad) * k);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!f) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(pad * k, pad * k, Sz.w * k, Sz.h * k); return; }
  const im = await E.loadImage(f.src);
  if (!im) return;
  // ak má súbor spadávku, orežeme ju (v náhľade so značkami ju ukážeme)
  const withBleed = f.hasBleed;
  const b = E.BLEED;
  if (S.marks) {
    const x = (pad - (withBleed ? b : 0)) * k, y = (pad - (withBleed ? b : 0)) * k;
    const w = (Sz.w + (withBleed ? 2 * b : 0)) * k, h = (Sz.h + (withBleed ? 2 * b : 0)) * k;
    ctx.drawImage(im, x, y, w, h);
    // jednoduché značky
    ctx.strokeStyle = '#E8462B'; ctx.lineWidth = Math.max(1, 0.15 * k);
    ctx.strokeRect(pad * k, pad * k, Sz.w * k, Sz.h * k);
    ctx.setLineDash([0.8 * k, 0.6 * k]); ctx.strokeStyle = 'rgba(30,120,200,.8)';
    ctx.strokeRect((pad + E.SAFE) * k, (pad + E.SAFE) * k, (Sz.w - 2 * E.SAFE) * k, (Sz.h - 2 * E.SAFE) * k);
    ctx.setLineDash([]);
  } else {
    const sx = withBleed ? im.width * (b / (Sz.w + 2 * b)) : 0;
    const sy = withBleed ? im.height * (b / (Sz.h + 2 * b)) : 0;
    ctx.drawImage(im, sx, sy, im.width - 2 * sx, im.height - 2 * sy, 0, 0, canvas.width, canvas.height);
  }
}

async function renderCard() {
  const token = ++renderToken;
  const w = Math.round((cardWrap.clientWidth || 600) * DPR);
  if (!S.custom) await E.prepare(S.d);
  if (token !== renderToken) return;
  for (const side of ['front', 'back']) {
    if (S.custom) await drawCustom(faces[side], side, w);
    else E.render(faces[side], S.d, side, { width: w, marks: S.marks });
  }
  cardWrap.classList.toggle('round', S.cfg.corners === 'round' && !S.marks);
  cardWrap.classList.toggle('marks', S.marks);
  cardWrap.classList.toggle('custom', !!S.custom);
  cardWrap.dataset.shape = S.cfg.size;
}

function renderPhone() {
  if (S.view === 'paper') return;
  renderDigital($('[data-dhost]'), S.d, { url: digitalUrl(S.d.digital.slug), qr: (u) => qrSVG(u) });
}

const softUpdate = debounce(() => { renderTplThumbs(); renderBackThumbs(); }, 600);
function update(o = {}) {
  S.d.size = S.cfg.size; S.d.corners = S.cfg.corners;
  ensureDigital(S.d);
  renderCard();
  renderPhone();
  paintPrice();
  persist();
  if (!o.noHistory) pushHistory();
  if (!o.noThumbs) softUpdate();
  paintActive();
}

/* ---------- panely ---------- */
const tabs = $$('[data-tab]'), panes = $$('[data-pane]');
function openTab(id) {
  tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === id));
  panes.forEach((p) => p.classList.toggle('is-on', p.dataset.pane === id));
  if (id === 'sablony') renderTplThumbs();
  if (id === 'zadna') renderBackThumbs();
  if (id === 'farby') { renderPals(); renderFonts(); }
  if (matchMedia('(max-width: 760px)').matches) {
    const r = $('.st-rail').getBoundingClientRect();
    if (r.top < 0 || window.scrollY > 0) window.scrollTo({ top: $('.st-side').offsetTop - $('.st-stage').offsetHeight - 60, behavior: 'smooth' });
  }
}
tabs.forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab)));

// údaje
function syncFields() {
  $$('[data-f]').forEach((i) => { i.value = S.d.f[i.dataset.f] || ''; });
  $('[data-slug]').value = S.d.digital?.slug || '';
  $$('[data-soc]').forEach((i) => { i.value = S.d.digital?.socials?.[i.dataset.soc] || ''; });
  setPreview($('[data-logo-prev]'), S.d.logo, $('[data-logo-del]'));
  setPreview($('[data-photo-prev]'), S.d.digital?.photo, $('[data-photo-del]'));
}
function setPreview(img, src, del) {
  if (src) { img.src = src; del.hidden = false; } else { img.removeAttribute('src'); del.hidden = true; }
}
$$('[data-f]').forEach((i) => i.addEventListener('input', () => {
  const k = i.dataset.f;
  S.d.f[k] = i.value; S.touched.add(k);
  if (k === 'name' && !S.slugTouched) { S.d.digital.slug = slugify(i.value); $('[data-slug]').value = S.d.digital.slug; }
  update();
}));
$('[data-slug]').addEventListener('input', (e) => {
  const v = slugify(e.target.value); S.slugTouched = true; S.d.digital.slug = v;
  if (e.target.value !== v && !/-$/.test(e.target.value)) e.target.value = v;
  update({ noThumbs: true });
});
$$('[data-soc]').forEach((i) => i.addEventListener('input', () => { S.d.digital.socials[i.dataset.soc] = i.value.trim(); update({ noThumbs: true }); }));

async function setLogo(fileOrSrc) {
  const r = await analyzeLogo(fileOrSrc);
  S.d.logo = r.src;
  S.logoPalettes = r.palettes;
  syncFields();
  update();
  return r;
}
$('[data-logo-pick]').addEventListener('click', () => $('[data-logo-file]').click());
$('[data-logo-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) { await setLogo(f); toast(T('Logo je na vizitke. Farby z neho nájdete v záložke Štýl.', 'Logo je na vizitce. Barvy z něj najdete v záložce Styl.')); } e.target.value = ''; });
$('[data-logo-del]').addEventListener('click', () => { S.d.logo = null; syncFields(); update(); });
$('[data-photo-pick]').addEventListener('click', () => $('[data-photo-file]').click());
$('[data-photo-file]').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  S.d.digital.photo = await shrinkImage(f, 480, 'image/jpeg');
  syncFields(); update({ noThumbs: true });
  if (S.view === 'paper') setView('both');
  e.target.value = '';
});
$('[data-photo-del]').addEventListener('click', () => { S.d.digital.photo = null; syncFields(); update({ noThumbs: true }); });

async function shrinkImage(file, max, type = 'image/jpeg') {
  const src = await fileToDataURL(file);
  const im = await E.loadImage(src);
  const sc = Math.min(1, max / Math.max(im.width, im.height));
  const c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(type, 0.86);
}

// šablóny
const thumbCache = new Map();
async function thumb(d, side = 'front', w = 340) {
  const key = side + w + JSON.stringify([d.tpl, d.fonts, d.pal, d.f, d.back, d.size, d.logo ? d.logo.length : 0]);
  if (thumbCache.has(key)) return thumbCache.get(key);
  const url = await E.snapshot(d, side, w, 'image/jpeg');
  thumbCache.set(key, url);
  if (thumbCache.size > 200) thumbCache.delete(thumbCache.keys().next().value);
  return url;
}
let tplBuilt = false;
async function renderTplThumbs() {
  if (!$('[data-pane="sablony"]').classList.contains('is-on')) return;
  const box = $('[data-tpls]');
  const keep = $('[data-keep-style]').checked;
  if (!tplBuilt) {
    box.innerHTML = Object.entries(E.TEMPLATES).map(([id, t]) => `<button data-tpl="${id}"><img alt=""><span>${t.name}</span></button>`).join('');
    tplBuilt = true;
  }
  for (const b of $$('[data-tpl]', box)) {
    const id = b.dataset.tpl;
    const d = { ...S.d, tpl: id, back: 'auto', ...(keep ? {} : E.templateDefaults(id)) };
    b.querySelector('img').src = await thumb(d);
  }
  paintActive();
}
$('[data-tpls]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tpl]'); if (!b) return;
  const id = b.dataset.tpl;
  const keep = $('[data-keep-style]').checked;
  S.d = { ...S.d, tpl: id, ...(keep ? {} : E.templateDefaults(id)) };
  leaveCustom(); update({ noThumbs: true }); flash();
});
$('[data-keep-style]').addEventListener('change', renderTplThumbs);

// zadná strana
const BACK_LABELS = { auto: T('Podľa šablóny', 'Podle šablony'), qr: T('QR na digitálnu vizitku', 'QR na digitální vizitku'), logo: T('Logo alebo firma', 'Logo nebo firma'), details: T('Kontakty', 'Kontakty'), blank: T('Jednofarebná', 'Jednobarevná') };
async function renderBackThumbs() {
  if (!$('[data-pane="zadna"]').classList.contains('is-on')) return;
  const box = $('[data-backs]');
  if (!box.children.length) box.innerHTML = E.BACK_OPTIONS.map((k) => `<button data-back="${k}"><img alt=""><span>${BACK_LABELS[k]}</span></button>`).join('');
  for (const b of $$('[data-back]', box)) b.querySelector('img').src = await thumb({ ...S.d, back: b.dataset.back }, 'back');
  paintActive();
}
$('[data-backs]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-back]'); if (!b) return;
  S.d.back = b.dataset.back;
  setSide('back'); update({ noThumbs: true });
});

// štýl
function renderPals() {
  const all = [...S.logoPalettes.map((p, i) => ['logo' + i, p]), ...Object.entries(E.PALETTES)];
  $('[data-pals]').innerHTML = all.map(([k, p]) => `<button class="pal" data-pal="${k}" title="${p.label}"><i><b style="background:${p.bg}"></b><b style="background:${p.accent}"></b><b style="background:${p.ink}"></b></i>${p.label}</button>`).join('');
  syncColors(); paintActive();
}
$('[data-pals]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pal]'); if (!b) return;
  const k = b.dataset.pal;
  S.d.pal = { ...(k.startsWith('logo') ? S.logoPalettes[+k.slice(4)] : E.PALETTES[k]) };
  syncColors(); update(); flash();
});
function syncColors() {
  $$('[data-c]').forEach((i) => { i.value = S.d.pal[i.dataset.c]; });
  $('[data-contrast]').hidden = E.contrast(S.d.pal.bg, S.d.pal.ink) >= 4;
}
$$('[data-c]').forEach((i) => i.addEventListener('input', () => {
  S.d.pal = { ...S.d.pal, [i.dataset.c]: i.value, label: T('Vlastná', 'Vlastní') };
  $('[data-contrast]').hidden = E.contrast(S.d.pal.bg, S.d.pal.ink) >= 4;
  update();
}));
function renderFonts() {
  $('[data-fonts]').innerHTML = Object.entries(E.FONT_PAIRS).map(([k, f]) =>
    `<button class="font" data-font="${k}"><b style="font-family:'${f.display}';font-weight:${f.dw}">Ľubica Šť</b><small>${f.label} + ${f.text === f.display ? '' : f.text}</small></button>`).join('');
  paintActive();
}
$('[data-fonts]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-font]'); if (!b) return;
  S.d.fonts = b.dataset.font; update(); flash();
});

function paintActive() {
  $$('[data-tpl]').forEach((b) => b.classList.toggle('is-on', b.dataset.tpl === S.d.tpl));
  $$('[data-back]').forEach((b) => b.classList.toggle('is-on', b.dataset.back === (S.d.back || 'auto')));
  const fk = S.d.fonts || E.TEMPLATES[S.d.tpl].fonts;
  $$('[data-font]').forEach((b) => b.classList.toggle('is-on', b.dataset.font === fk));
  $$('[data-pal]').forEach((b) => {
    const p = b.dataset.pal.startsWith('logo') ? S.logoPalettes[+b.dataset.pal.slice(4)] : E.PALETTES[b.dataset.pal];
    b.classList.toggle('is-on', !!p && p.bg === S.d.pal.bg && p.accent === S.d.pal.accent && p.ink === S.d.pal.ink);
  });
}

/* ---------- AI grafik ---------- */
const chat = $('[data-chat]');
function msg(html, who = 'bot') {
  const m = document.createElement('div');
  m.className = `chat__msg chat__msg--${who}`;
  m.innerHTML = html; chat.append(m);
  m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return m;
}
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
let aiDesigns = [];
async function askAI(prompt) {
  msg(esc(prompt), 'me');
  const wait = msg('<span class="dots"><i></i><i></i><i></i></span>');
  const base = { ...S.d.f, roleLocked: S.touched.has('role'), companyLocked: S.touched.has('company'), taglineLocked: S.touched.has('tagline') };
  const r = await suggest(prompt, base, 6);
  aiDesigns = r.designs.map((d) => { d.logo = S.d.logo; d.digital = S.d.digital; d.size = S.cfg.size; return d; });
  wait.innerHTML = esc(r.intro);
  const picks = document.createElement('div'); picks.className = 'chat__picks';
  for (const [i, d] of aiDesigns.entries()) {
    const b = document.createElement('button'); b.dataset.ai = i; b.title = d.why || '';
    const im = new Image(); im.alt = d.why || ''; im.src = await thumb(d, 'front', 360);
    b.append(im); picks.append(b);
  }
  wait.append(picks);
  showAIStage(r.intro);
}
async function showAIStage(intro) {
  const box = $('[data-ai-results]'), grid = $('[data-ai-grid]');
  $('[data-ai-intro]').textContent = T('Vyberte návrh. Všetko sa dá ďalej upravovať.', 'Vyberte návrh. Všechno jde dál upravovat.');
  grid.innerHTML = '';
  for (const [i, d] of aiDesigns.entries()) {
    const b = document.createElement('button'); b.dataset.ai = i;
    const im = new Image(); im.alt = ''; im.src = await thumb(d, 'front', 640);
    const s = document.createElement('small'); s.textContent = d.why || '';
    b.append(im, s); grid.append(b);
  }
  box.hidden = false;
}
function applyAI(i) {
  const d = aiDesigns[i]; if (!d) return;
  const keep = { logo: S.d.logo, digital: S.d.digital };
  S.d = { ...E.newDesign(d), ...keep, f: { ...d.f } };
  delete S.d.why; delete S.d.meta;
  $$('[data-ai]').forEach((b) => b.classList.toggle('is-on', +b.dataset.ai === i));
  $('[data-ai-results]').hidden = true;
  leaveCustom(); syncFields(); update(); flash();
  hint(T('Návrh je vo vizitke. Texty upravíte v záložke Údaje.', 'Návrh je ve vizitce. Texty upravíte v záložce Údaje.'));
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-ai]'); if (b) applyAI(+b.dataset.ai); });
$('[data-ai-results]').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.hidden = true; });
$('[data-ai-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('[data-ai-in]').value.trim(); if (!v) return;
  $('[data-ai-in]').value = ''; askAI(v);
});
$('[data-ai-in]').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('[data-ai-form]').requestSubmit(); } });
$$('[data-ai-chips] button').forEach((b) => b.addEventListener('click', () => askAI(b.dataset.p)));

/* ---------- logo ---------- */
const drop = $('[data-drop]');
async function logoFlow(file) {
  const r = await setLogo(file);
  $('[data-drop-img]').src = r.src; drop.classList.add('has');
  const cb = $('[data-logo-colors]'); cb.hidden = false;
  cb.innerHTML = T('Farby značky:', 'Barvy značky:') + ' ' + r.colors.slice(0, 5).map((c) => `<i style="--c:${c}" title="${c}"></i>`).join('');
  const box = $('[data-logo-designs]'); box.innerHTML = '';
  const combos = [['corporate', 0, 'swiss'], ['split', 1, 'bricolage'], ['linea', 2, 'bodoni'], ['swiss', 1, 'swiss'], ['monogram', 0, 'playfair'], ['editorial', 0, 'editorial']];
  for (const [tpl, pi, fonts] of combos) {
    const d = { ...S.d, tpl, fonts, pal: { ...r.palettes[pi] }, back: 'auto' };
    const b = document.createElement('button');
    b.innerHTML = `<img alt=""><span>${E.TEMPLATES[tpl].name} · ${r.palettes[pi].label}</span>`;
    b.querySelector('img').src = await thumb(d);
    b.addEventListener('click', () => { S.d = { ...S.d, tpl, fonts, pal: { ...r.palettes[pi] } }; leaveCustom(); update(); flash(); });
    box.append(b);
  }
}
$('[data-drop-file]').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) logoFlow(f); e.target.value = ''; });
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) logoFlow(f); });

/* ---------- vlastný súbor ---------- */
let pdfjs;
async function loadPDFjs() {
  if (pdfjs) return pdfjs;
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
  pdfjs = window.pdfjsLib;
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return pdfjs;
}
async function readDesignFile(file) {
  const Sz = E.SIZES[S.cfg.size];
  if (file.type === 'application/pdf') {
    const lib = await loadPDFjs();
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const vp1 = page.getViewport({ scale: 1 });
    const wmm = vp1.width * 25.4 / 72, hmm = vp1.height * 25.4 / 72;
    const scale = 1400 / vp1.width;
    const vp = page.getViewport({ scale });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return { src: c.toDataURL('image/jpeg', 0.9), name: file.name, pdf: true, wmm, hmm, pages: pdf.numPages, hasBleed: Math.abs(wmm - (Sz.w + 2 * E.BLEED)) < 1.2 };
  }
  const src = await fileToDataURL(file);
  const im = await E.loadImage(src);
  const ratio = im.width / im.height;
  const rB = (Sz.w + 2 * E.BLEED) / (Sz.h + 2 * E.BLEED), rT = Sz.w / Sz.h;
  const hasBleed = Math.abs(ratio - rB) < Math.abs(ratio - rT);
  const dpi = Math.round(im.width / ((hasBleed ? Sz.w + 2 * E.BLEED : Sz.w) / 25.4));
  const preview = await shrinkImage(file, 1600, 'image/jpeg');
  return { src: preview, name: file.name, w: im.width, h: im.height, dpi, ratio, hasBleed, ratioOk: Math.min(Math.abs(ratio - rB), Math.abs(ratio - rT)) < 0.04 };
}
function paintChecks() {
  const ul = $('[data-fchecks]'); const out = [];
  const Sz = E.SIZES[S.cfg.size];
  for (const side of ['front', 'back']) {
    const f = S.custom?.[side]; if (!f) continue;
    const lab = side === 'front' ? T('Predná', 'Přední') : T('Zadná', 'Zadní');
    if (f.pdf) {
      out.push([Math.abs(f.wmm - (Sz.w + 2 * E.BLEED)) < 1.2 || Math.abs(f.wmm - Sz.w) < 1.2 ? 'ok' : 'warn', `${lab}: PDF ${f.wmm.toFixed(1)} × ${f.hmm.toFixed(1)} mm${f.pages > 1 ? ` · ${f.pages} ${T('strany', 'strany')}` : ''}`]);
      if (!f.hasBleed) out.push(['warn', `${lab}: ${T('chýba spadávka 2 mm, pri kontrole ju doplníme', 'chybí spadávka 2 mm, při kontrole ji doplníme')}`]);
      continue;
    }
    out.push([f.dpi >= 300 ? 'ok' : 'warn', `${lab}: ${f.w} × ${f.h} px ≈ ${f.dpi} dpi${f.dpi < 300 ? ' · ' + T('odporúčame aspoň 300 dpi', 'doporučujeme aspoň 300 dpi') : ''}`]);
    if (!f.ratioOk) out.push(['warn', `${lab}: ${T('pomer strán nesedí s formátom', 'poměr stran nesedí s formátem')} ${E.SIZES[S.cfg.size].label}`]);
    else out.push([f.hasBleed ? 'ok' : 'warn', `${lab}: ${f.hasBleed ? T('spadávka 2 mm je v poriadku', 'spadávka 2 mm je v pořádku') : T('bez spadávky, pri kontrole ju doplníme', 'bez spadávky, při kontrole ji doplníme')}`]);
  }
  if (out.length) {
    out.push(['info', T('Farby prevedieme do CMYK. Pred tlačou súbor skontroluje človek.', 'Barvy převedeme do CMYK. Před tiskem soubor zkontroluje člověk.')]);
  }
  ul.innerHTML = out.map(([c, t]) => `<li class="${c}">${t}</li>`).join('');
  $('[data-file-clear]').hidden = !S.custom;
}
$$('[data-fdrop]').forEach((lab) => {
  const input = lab.querySelector('input');
  const side = lab.dataset.fdrop;
  const handle = async (file) => {
    lab.classList.add('busy');
    try {
      const r = await readDesignFile(file);
      S.custom = S.custom || {};
      S.custom[side] = r;
      lab.querySelector('img').src = r.src; lab.classList.add('has');
      paintChecks(); setSide(side); update({ noThumbs: true });
      hint(T('Zobrazujete vlastný súbor. Tlačové značky ukážu spadávku a bezpečnú zónu.', 'Zobrazujete vlastní soubor. Tiskové značky ukážou spadávku a bezpečnou zónu.'));
    } catch (err) {
      toast(T('Súbor sa nepodarilo načítať. Skúste PNG, JPG alebo PDF.', 'Soubor se nepodařilo načíst. Zkuste PNG, JPG nebo PDF.'));
    }
    lab.classList.remove('busy');
  };
  input.addEventListener('change', (e) => { const f = e.target.files[0]; if (f) handle(f); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => lab.addEventListener(ev, (e) => { e.preventDefault(); lab.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => lab.addEventListener(ev, (e) => { e.preventDefault(); lab.classList.remove('over'); }));
  lab.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) handle(f); });
});
function leaveCustom() {
  if (!S.custom) return;
  S.custom = null;
  $$('[data-fdrop]').forEach((l) => { l.classList.remove('has'); l.querySelector('img').removeAttribute('src'); });
  paintChecks();
}
$('[data-file-clear]').addEventListener('click', () => { leaveCustom(); update(); });

/* ---------- plátno: strany, pohľad, značky ---------- */
function setSide(side) {
  S.side = side;
  $$('[data-side]').forEach((b) => b.classList.toggle('is-on', b.dataset.side === side));
  cardIn.classList.toggle('is-back', side === 'back');
}
$$('[data-side]').forEach((b) => b.addEventListener('click', () => setSide(b.dataset.side)));
$('[data-flip]').addEventListener('click', () => setSide(S.side === 'front' ? 'back' : 'front'));
cardWrap.addEventListener('click', () => { if (!S.marks) setSide(S.side === 'front' ? 'back' : 'front'); });
$('[data-marks]').addEventListener('click', (e) => {
  S.marks = !S.marks; e.currentTarget.setAttribute('aria-pressed', S.marks);
  hint(S.marks ? T('Červená: orez · modrá prerušovaná: bezpečná zóna · ružový okraj: spadávka 2 mm', 'Červená: ořez · modrá přerušovaná: bezpečná zóna · růžový okraj: spadávka 2 mm') : '');
  renderCard();
});
$('[data-undo]').addEventListener('click', undo);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); undo(); }
});
function setView(v) {
  S.view = v;
  $$('[data-view]').forEach((b) => b.classList.toggle('is-on', b.dataset.view === v));
  const cv = $('[data-canvas]');
  cv.classList.toggle('v-phone', v === 'phone'); cv.classList.toggle('v-both', v === 'both');
  $('[data-phone]').hidden = v === 'paper';
  renderPhone();
  requestAnimationFrame(renderCard);
}
$$('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

let hintT;
function hint(t) { const h = $('[data-hint]'); h.textContent = t || ''; clearTimeout(hintT); if (t && !S.marks) hintT = setTimeout(() => { h.textContent = ''; }, 6000); }
function flash() { cardIn.animate([{ transform: `${S.side === 'back' ? 'rotateY(180deg) ' : ''}scale(.985)`, opacity: 0.6 }, { transform: `${S.side === 'back' ? 'rotateY(180deg) ' : ''}scale(1)`, opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' }); }

/* ---------- objednávka ---------- */
function paintPrice() {
  const P = VK.prices;
  const c = S.cfg;
  const isDigital = c.kind === 'digital';
  $('[data-print-opts]').classList.toggle('off', isDigital);
  $$('[data-o="finish"] button').forEach((b) => { b.disabled = c.paper === 'triplex' && b.dataset.v !== 'none'; });
  $$('[data-qp]').forEach((s) => { s.textContent = money(printPrice({ ...c, qty: +s.dataset.qp }, P)); });
  const total = itemPrice(c, P);
  $('[data-sum]').textContent = money(total);
  $('[data-bar-price]').textContent = money(total);
  const meta = isDigital ? T('ročne · vrátane DPH', 'ročně · včetně DPH')
    : `${c.qty} ${T('ks', 'ks')} · ${money(total / c.qty, { decimals: 2 })} / ${T('ks', 'ks')}${c.kind === 'bundle' ? ' · ' + T('+ digitálna zadarmo', '+ digitální zdarma') : ''}`;
  $('[data-sum-meta]').textContent = meta;
  $('[data-bar-meta]').textContent = isDigital ? T('digitálna / rok', 'digitální / rok') : `${c.qty} ${T('ks', 'ks')}`;
  const now = new Date();
  const days = (now.getHours() >= 14 ? 1 : 0) + (c.express ? 2 : 4);
  $('[data-sum-date]').textContent = isDigital ? T('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.')
    : `${T('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(addWorkdays(now, days))}`;
  $('[data-pdf]').hidden = isDigital || !!S.custom;
  // ovládacie prvky podľa stavu
  $$('[data-o]').forEach((seg) => {
    const k = seg.dataset.o; if (k === 'express') return;
    $$('button', seg).forEach((b) => b.classList.toggle('is-on', String(c[k]) === b.dataset.v));
  });
  $$('[data-kind] .kind').forEach((b) => { const on = b.dataset.v === c.kind; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
  $('[data-o-express]').checked = !!c.express;
  $('[data-dim]').textContent = E.SIZES[c.size].label;
  $('[data-digital-fields]').style.display = c.kind === 'print' ? 'none' : '';
}
$$('[data-kind] .kind').forEach((b) => b.addEventListener('click', () => {
  S.cfg.kind = b.dataset.v;
  if (b.dataset.v === 'digital') setView('phone'); else if (S.view === 'phone') setView('paper');
  update({ noThumbs: true });
}));
$$('[data-o]').forEach((seg) => seg.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const k = seg.dataset.o;
  S.cfg[k] = k === 'qty' ? +b.dataset.v : b.dataset.v;
  if (S.cfg.paper === 'triplex') S.cfg.finish = 'none';
  if (k === 'size') { thumbCache.clear(); update(); if (S.custom) paintChecks(); }
  else update({ noThumbs: true, noHistory: true });
}));
$('[data-o-express]').addEventListener('change', (e) => { S.cfg.express = e.target.checked; update({ noThumbs: true, noHistory: true }); });

$('[data-pdf]').addEventListener('click', async (e) => {
  const btn = e.currentTarget; btn.textContent = T('Pripravujem PDF…', 'Připravuji PDF…');
  try { await E.exportPDF(S.d, `vizitka-${slugify(S.d.f.name) || 'vizitkomat'}.pdf`); }
  finally { btn.textContent = T('Stiahnuť tlačové PDF', 'Stáhnout tiskové PDF'); }
});

$('[data-add]').addEventListener('click', async () => {
  const c = { ...S.cfg };
  const d = JSON.parse(JSON.stringify(S.d));
  const front = S.custom ? (S.custom.front?.src || '') : await E.snapshot(d, 'front', 520, 'image/jpeg');
  const back = S.custom ? (S.custom.back?.src || '') : await E.snapshot(d, 'back', 520, 'image/jpeg');
  addItem({
    kind: c.kind, config: c, design: d, thumb: front, thumbBack: back,
    custom: S.custom ? { front: S.custom.front && { name: S.custom.front.name, src: S.custom.front.src }, back: S.custom.back && { name: S.custom.back.name, src: S.custom.back.src } } : null,
    title: S.d.f.name || T('Vizitka', 'Vizitka'),
  });
  $('[data-order]').classList.remove('open');
  toast(T('Vizitka je v košíku.', 'Vizitka je v košíku.'), { href: VK.links.kosik, label: T('Do košíka', 'Do košíku') });
});

// mobil
$('[data-bar-open]').addEventListener('click', () => $('[data-order]').classList.toggle('open'));
document.addEventListener('click', (e) => {
  const o = $('[data-order]');
  if (o.classList.contains('open') && !o.contains(e.target) && !e.target.closest('[data-bar]')) o.classList.remove('open');
});

/* ---------- štart ---------- */
(async function init() {
  syncFields();
  const rezim = params.get('rezim');
  const tab = { sablony: 'sablony', ai: 'ai', logo: 'logo', subor: 'subor' }[rezim] || (params.get('meno') ? 'udaje' : 'sablony');
  openTab(tab);
  setView(S.cfg.kind === 'digital' ? 'phone' : 'paper');
  await document.fonts.ready;
  update({ noHistory: true });
  const obor = params.get('obor');
  if (obor && PRESETS[obor]) askAI(PRESETS[obor][VK.lang === 'cz' ? 'cz' : 'sk']);
  window.addEventListener('resize', debounce(renderCard, 150));
  new ResizeObserver(debounce(renderCard, 100)).observe(cardWrap);
})();
