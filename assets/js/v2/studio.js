// Tvorba – sprievodca v 4 krokoch: začiatok → výber návrhu → úpravy → objednávka
import { SIZES, FONTS, PALETTES, ART, newDesign, contrast, slugify, tr, CZ, DEFAULT_FIELDS } from './model.js';
import { TEMPLATES, BACK_KEYS, templateDefaults } from './templates.js';
import { snapshot, exportPDF, loadImg } from './render.js';
import { createEditor } from './editor.js';
import { askAI, makeMark, API } from './ai.js';
import { ICONS, iconSVG } from '../icons.js';
import { analyzeLogo, fileToDataURL } from '../logo.js';
import * as store from './store.js';
import { toast } from './site.js';
import { money, printPrice, itemPrice, addWorkdays, fmtDay, debounce, session } from '../util.js';

const VK = window.VK;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const params = new URLSearchParams(location.search);
const SAVE = 'studio-v2';
const qrFor = (slug) => `https://vizitkomat.eu/v/${slug || 'vase-meno'}/`;

const st = {
  step: 'start', reached: new Set(['start']), mode: 'ai',
  cfg: { kind: 'bundle', size: '90x50', paper: 'matny', finish: 'none', corners: 'straight', qty: 250, express: false },
  ai: [], lastPrompt: '', slugTouched: false, touched: new Set(), saved: null, logoPals: [], loaded: false,
};
let ed = null;

/* =========================================================
   KROKY
   ========================================================= */
function go(step) {
  st.step = step; st.reached.add(step);
  $('[data-wz]').dataset.step = step;
  $$('[data-go]').forEach((li) => { const s = li.dataset.go; li.classList.toggle('on', s === step); li.classList.toggle('ok', s !== step && st.reached.has(s)); });
  window.scrollTo(0, 0);
  if (step === 'edit') ensureEditor().then(() => { ed.fit(); openTab($('[data-tab][aria-selected=true]')?.dataset.tab || 'udaje'); });
  if (step === 'order') enterOrder();
}
$$('[data-go]').forEach((li) => li.addEventListener('click', () => { const s = li.dataset.go; if (!st.reached.has(s)) return; if ((s === 'edit' || s === 'order') && !st.loaded) return; go(s); }));

/* =========================================================
   EDITOR
   ========================================================= */
async function ensureEditor() {
  if (ed) return ed;
  ed = createEditor($('[data-canvas]'), $('[data-host]'), { pad: 40 });
  ed.on('selection', paintCtx);
  ed.on('fields', ({ k }) => { syncFields(); if (k === 'name' && !st.slugTouched) setSlug(slugify(ed.design.f.name)); });
  ed.on('restore', () => { syncFields(); paintSides(); });
  ed.on('side', paintSides);
  ed.on('history', ({ undo, redo }) => { $('[data-undo]').disabled = !undo; $('[data-redo]').disabled = !redo; });
  ed.on('change', () => persist());
  return ed;
}
async function loadDesign(d, sides, custom) {
  await ensureEditor();
  d.size = st.cfg.size; d.corners = st.cfg.corners;
  if (!d.slug || !st.slugTouched) d.slug = slugify(d.f.name);
  d.qrUrl = qrFor(d.slug);
  $('[data-wz]').dataset.step = 'edit'; // plátno musí byť viditeľné kvôli rozmerom
  await document.fonts.ready;
  await ed.load(d, sides, custom);
  st.loaded = true;
  syncFields(); paintSides();
}

/* =========================================================
   1. ZAČIATOK
   ========================================================= */
function paintStart() {
  const ids = ['znak', 'prechod', 'noirgold'];
  const imgs = $$('[data-way-thumbs] img');
  ids.forEach(async (id, i) => { imgs[i].src = await thumb(newDesign({ tpl: id, ...templateDefaults(id) }), 'front', 420); });
  if (st.saved?.d) {
    $('[data-resume]').hidden = false;
    const s = st.saved;
    thumb({ ...s.d, sides: s.custom?.front ? { front: s.sides?.front, back: null } : null }, 'front', 300).then((u) => { $('[data-resume-img]').src = u; });
  }
}
$('[data-resume-go]').addEventListener('click', async () => {
  const s = st.saved; st.cfg = { ...st.cfg, ...s.cfg }; st.slugTouched = !!s.slugTouched; (s.touched || []).forEach((k) => st.touched.add(k));
  st.reached.add('choose');
  await loadDesign(s.d, s.sides, s.custom); go('edit');
});
$('[data-ask-start]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-ask-start-in]').value.trim(); if (v.length < 3) { $('[data-ask-start-in]').focus(); return; } runAI(v); });
$('[data-ask-start-in]').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('[data-ask-start]').requestSubmit(); } });
$$('[data-chips] button').forEach((b) => b.addEventListener('click', () => runAI(b.dataset.p)));
$('[data-start-tpl]').addEventListener('click', () => showTemplates());

/* =========================================================
   2. VÝBER
   ========================================================= */
const thumbs = new Map();
function thumb(d, side = 'front', w = 420) {
  const key = JSON.stringify([side, w, d.tpl, d.fonts, d.pal, d.f, d.art && String(d.art).slice(-60), d.logo && d.logo.length, d.mark && d.mark.length, d.size, d.back, !!d.sides]);
  if (thumbs.has(key)) return thumbs.get(key);
  const p = snapshot(d.sides ? d : { ...d, sides: null }, side, w, 'image/jpeg', 0.88);
  thumbs.set(key, p); if (thumbs.size > 160) thumbs.delete(thumbs.keys().next().value);
  return p;
}
const STEPS = [tr('Čítam vaše zadanie…', 'Čtu vaše zadání…'), tr('Vymýšľam tri smery…', 'Vymýšlím tři směry…'), tr('Ladím farby a písmo…', 'Ladím barvy a písmo…'), tr('Kreslím znak na mieru…', 'Kreslím znak na míru…'), tr('Skladám vizitky…', 'Skládám vizitky…')];
let stepT;
async function runAI(prompt, previous) {
  st.mode = 'ai'; st.lastPrompt = prompt;
  $('[data-ai-box]').hidden = false; $('[data-tpl-box]').hidden = true;
  $('[data-ai-me]').textContent = '„' + prompt + '“';
  $('[data-ai-grid]').innerHTML = ''; $('[data-ai-intro]').textContent = '';
  $('[data-ai-more]').hidden = true; $('[data-ask-re]').hidden = true;
  $('[data-ai-load]').hidden = false;
  let i = 0; $('[data-ai-step]').textContent = STEPS[0];
  clearInterval(stepT); stepT = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); $('[data-ai-step]').textContent = STEPS[i]; }, 1400);
  go('choose');
  const base = {};
  if (ed && st.loaded) for (const [k, v] of Object.entries(ed.design.f)) if (st.touched.has(k) && v) base[k] = v;
  const r = await askAI(prompt, base, { previous, onArt: (idx, d) => refreshMock(idx, d) });
  clearInterval(stepT);
  st.ai = r.designs;
  $('[data-ai-load]').hidden = true;
  $('[data-ai-intro]').textContent = r.intro;
  paintMocks();
  $('[data-ai-more]').hidden = false;
}
const SCENES = ['#E9E2D6', '#DCE3EC', '#E6DED8'];
function sceneFor(d, i) { return d.pal && contrast(d.pal.bg, '#FFFFFF') > 6 ? ['#E9E2D6', '#DDE1EA', '#E7E0DA'][i % 3] : SCENES[i % 3]; }
function dirLabel(dir, i) { return { classic: tr('Klasický', 'Klasický'), modern: tr('Moderný', 'Moderní'), creative: tr('Kreatívny', 'Kreativní') }[dir] || `${tr('Návrh', 'Návrh')} ${i + 1}`; }
function paintMocks() {
  const grid = $('[data-ai-grid]'); grid.innerHTML = '';
  st.ai.forEach((d, i) => {
    const el = document.createElement('article'); el.className = 'mock'; el.dataset.i = i;
    el.innerHTML = `<div class="mock__scene" style="--scene:${sceneFor(d, i)}"><img class="mock__back" alt=""><img class="mock__front" alt="">${d.markPending || d.artPending ? `<span class="mock__pend"><span class="dots"><i></i><i></i><i></i></span>${tr('kreslím znak', 'kreslím znak')}</span>` : ''}<span class="mock__dir">${dirLabel(d.direction, i)}</span></div>
      <div class="mock__info"><small>${esc(d.why || '')}</small><button class="btn btn--sm" data-pick="${i}">${tr('Vybrať', 'Vybrat')} <span class="ar">→</span></button></div>`;
    grid.append(el);
    paintMockImgs(i);
  });
}
async function paintMockImgs(i) {
  const el = $(`.mock[data-i="${i}"]`); if (!el) return;
  const d = st.ai[i];
  const [f, b] = await Promise.all([thumb(d, 'front', 760), thumb(d, 'back', 600)]);
  el.querySelector('.mock__front').src = f; el.querySelector('.mock__back').src = b;
}
function refreshMock(i, d) {
  const sd = st.ai[i]; if (!sd) return;
  Object.assign(sd, { mark: d.mark, art: d.art, why: d.why, markPending: d.markPending, artPending: d.artPending });
  const el = $(`.mock[data-i="${i}"]`); if (!el) return;
  if (!sd.markPending && !sd.artPending) el.querySelector('.mock__pend')?.remove();
  el.querySelector('small').textContent = sd.why;
  paintMockImgs(i);
}
$('[data-ai-grid]').addEventListener('click', async (e) => {
  const mock = e.target.closest('.mock'); if (!mock) return;
  const d = st.ai[+mock.dataset.i];
  const prev = st.loaded ? ed.design : null;
  await loadDesign(newDesign({ tpl: d.tpl, fonts: d.fonts, pal: d.pal, art: d.art, mark: d.mark, f: { ...d.f }, direction: d.direction, ai: d.ai, logo: prev?.logo || null, photo: prev?.photo || null, socials: prev?.socials || {} }));
  go('edit');
});
$$('[data-ai-more] [data-r]').forEach((b) => b.addEventListener('click', () => {
  const d = st.ai[0];
  runAI(`${st.lastPrompt} – ${b.dataset.r}`, d ? { template: d.tpl, palette: d.pal } : undefined);
}));
$('[data-ai-change]').addEventListener('click', () => { const f = $('[data-ask-re]'); f.hidden = !f.hidden; $('[data-ask-re-in]').value = st.lastPrompt; $('[data-ask-re-in]').focus(); });
$('[data-ask-re]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-ask-re-in]').value.trim(); if (v.length > 2) runAI(v); });

let tplTok = 0;
async function showTemplates() {
  st.mode = 'tpl';
  $('[data-ai-box]').hidden = true; $('[data-tpl-box]').hidden = false;
  go('choose');
  const filt = $('[data-filt] .on')?.dataset.f || '';
  const prev = st.loaded ? ed.design : null;
  const f = prev ? { ...prev.f } : { ...DEFAULT_FIELDS };
  const ids = Object.keys(TEMPLATES).filter((id) => !filt || TEMPLATES[id].tags.includes(filt));
  const box = $('[data-tpls]'); const tok = ++tplTok;
  box.innerHTML = ids.map((id) => `<button data-tpl="${id}"><img alt=""><span>${TEMPLATES[id].name}</span></button>`).join('');
  for (const id of ids) {
    if (tok !== tplTok) return;
    const u = await thumb(newDesign({ tpl: id, ...templateDefaults(id), f, logo: prev?.logo || null, mark: prev?.mark || null }), 'front', 520);
    const im = $(`[data-tpl="${id}"] img`, box); if (im) im.src = u;
  }
}
$('[data-filt]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('[data-filt] button').forEach((x) => x.classList.toggle('on', x === b)); showTemplates(); });
$('[data-tpls]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-tpl]'); if (!b) return;
  const id = b.dataset.tpl, prev = st.loaded ? ed.design : null;
  await loadDesign(newDesign({ tpl: id, ...templateDefaults(id), f: prev ? { ...prev.f } : { ...DEFAULT_FIELDS }, logo: prev?.logo || null, mark: prev?.mark || null, photo: prev?.photo || null, socials: prev?.socials || {} }));
  go('edit');
});

/* =========================================================
   3. ÚPRAVY
   ========================================================= */
const tabs = $$('[data-tab]'), panes = $$('[data-pp]');
function openTab(id) {
  tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === id));
  panes.forEach((p) => p.classList.toggle('on', p.dataset.pp === id));
  if (!ed || !st.loaded) return;
  if (id === 'styl') { paintPals(); paintFonts(); paintBacks(); }
  if (id === 'viac') { paintIcons(); paintArts(); }
  if (id === 'logo') paintMark();
}
tabs.forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab)));
$('[data-back-choose]').addEventListener('click', () => { if (st.ai.length) { st.mode = 'ai'; $('[data-ai-box]').hidden = false; $('[data-tpl-box]').hidden = true; go('choose'); } else showTemplates(); });
$('[data-to-order]').addEventListener('click', () => go('order'));

function syncFields() {
  if (!ed || !st.loaded) return;
  const d = ed.design;
  $$('[data-f]').forEach((i) => { if (document.activeElement !== i) i.value = d.f[i.dataset.f] || ''; });
  $('[data-slug]').value = d.slug || '';
  $$('[data-soc]').forEach((i) => { i.value = (d.socials || {})[i.dataset.soc] || ''; });
  const ph = $('[data-photo-img]');
  if (d.photo) { ph.src = d.photo; $('[data-photo-del]').hidden = false; } else { ph.removeAttribute('src'); $('[data-photo-del]').hidden = true; }
}
const setFieldD = debounce((k, v) => ed.setField(k, v), 90);
$$('[data-f]').forEach((i) => i.addEventListener('input', () => {
  const k = i.dataset.f; st.touched.add(k);
  ed.design.f[k] = i.value;
  if (k === 'name' && !st.slugTouched) setSlug(slugify(i.value));
  setFieldD(k, i.value);
}));
function setSlug(v) { ed.design.slug = v; $('[data-slug]').value = v; updateQR(); }
const updateQR = debounce(() => ed && ed.setQR(qrFor(ed.design.slug)), 500);
$('[data-slug]').addEventListener('input', (e) => { st.slugTouched = true; ed.design.slug = slugify(e.target.value); updateQR(); persist(); });
$$('[data-soc]').forEach((i) => i.addEventListener('input', () => { ed.design.socials = { ...(ed.design.socials || {}), [i.dataset.soc]: i.value.trim() }; persist(); }));
$('[data-photo-pick]').addEventListener('click', () => $('[data-photo-file]').click());
$('[data-photo-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; ed.design.photo = await shrink(f, 520); syncFields(); persist(); e.target.value = ''; });
$('[data-photo-del]').addEventListener('click', () => { ed.design.photo = null; syncFields(); persist(); });
async function shrink(file, max, type = 'image/jpeg') {
  const src = await fileToDataURL(file); const im = await loadImg(src);
  const sc = Math.min(1, max / Math.max(im.width, im.height));
  const c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(type, 0.88);
}

function curPal() { return ed.design.pal || PALETTES[TEMPLATES[ed.design.tpl].pal]; }
function paintPals() {
  const list = [...st.logoPals.map((p, i) => ['logo' + i, p]), ...Object.entries(PALETTES)];
  const cur = curPal();
  $('[data-pals]').innerHTML = list.map(([k, p]) => `<button class="pal${p.bg === cur.bg && p.accent === cur.accent ? ' on' : ''}" data-pal="${k}" title="${p.label}"><i><b style="background:${p.bg}"></b><b style="background:${p.accent}"></b><b style="background:${p.ink}"></b></i>${p.label}</button>`).join('');
  $$('[data-c]').forEach((i) => { i.value = cur[i.dataset.c] || '#000000'; });
  $('[data-contrast]').hidden = contrast(cur.bg, cur.ink) >= 4;
}
$('[data-pals]').addEventListener('click', async (e) => { const b = e.target.closest('[data-pal]'); if (!b) return; const k = b.dataset.pal; await ed.setPalette(k.startsWith('logo') ? st.logoPals[+k.slice(4)] : PALETTES[k]); paintPals(); });
$$('[data-c]').forEach((i) => i.addEventListener('change', async () => { await ed.setPalette({ ...curPal(), [i.dataset.c]: i.value, label: tr('Vlastná', 'Vlastní') }); paintPals(); }));
function paintFonts() {
  const cur = ed.design.fonts || TEMPLATES[ed.design.tpl].fonts;
  $('[data-fonts]').innerHTML = Object.entries(FONTS).map(([k, f]) => `<button class="font${k === cur ? ' on' : ''}" data-font="${k}"><b style="font-family:'${f.display}';font-weight:${f.dw}">Ľubica Šť</b><small>${f.label}</small></button>`).join('');
}
$('[data-fonts]').addEventListener('click', async (e) => { const b = e.target.closest('[data-font]'); if (!b) return; await ed.setFonts(b.dataset.font); paintFonts(); });
const BACK_L = { auto: tr('Podľa šablóny', 'Podle šablony'), qr: tr('QR kód', 'QR kód'), logo: tr('Logo / firma', 'Logo / firma'), details: tr('Kontakty', 'Kontakty'), blank: tr('Jednofarebná', 'Jednobarevná') };
function paintBacks() {
  const box = $('[data-backs]');
  box.innerHTML = BACK_KEYS.map((k) => `<button data-back="${k}"${(ed.design.back || 'auto') === k ? ' class="on"' : ''}><img alt="">${BACK_L[k]}</button>`).join('');
  BACK_KEYS.forEach((k) => thumb({ ...ed.design, back: k }, 'back', 300).then((u) => { const im = $(`[data-back="${k}"] img`, box); if (im) im.src = u; }));
}
$('[data-backs]').addEventListener('click', async (e) => { const b = e.target.closest('[data-back]'); if (!b) return; await ed.setBack(b.dataset.back); paintSides(); paintBacks(); });

const drop = $('[data-drop]');
async function logoFlow(file) {
  const r = await analyzeLogo(file);
  st.logoPals = r.palettes.map((p, i) => ({ ...p, label: [tr('Z loga', 'Z loga'), tr('Z loga 2', 'Z loga 2'), tr('Z loga tmavá', 'Z loga tmavá')][i] }));
  await ed.setLogo(r.src);
  await ed.setPalette(st.logoPals[0]);
  $('[data-drop-img]').src = r.src; drop.classList.add('has');
  const sw = $('[data-logo-sw]'); sw.hidden = false;
  sw.innerHTML = tr('Farby značky:', 'Barvy značky:') + ' ' + r.colors.slice(0, 5).map((c) => `<i style="--c:${c}"></i>`).join('');
  $('[data-logo-del]').hidden = false;
  toast(tr('Logo je vo vizitke a farby sme prispôsobili značke.', 'Logo je ve vizitce a barvy jsme přizpůsobili značce.'));
}
$('[data-drop-file]').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) logoFlow(f); e.target.value = ''; });
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) logoFlow(f); });
$('[data-logo-del]').addEventListener('click', async () => { await ed.setLogo(null); drop.classList.remove('has'); $('[data-drop-img]').removeAttribute('src'); $('[data-logo-del]').hidden = true; });
function paintMark() {
  const m = ed.design.mark, img = $('[data-mark-img]');
  if (m) { img.src = m; $('[data-mark-del]').hidden = false; } else { img.removeAttribute('src'); $('[data-mark-del]').hidden = true; }
  if (!$('[data-mark-in]').value && ed.design.ai?.mark) $('[data-mark-in]').value = ed.design.ai.mark;
}
$('[data-mark-form]').addEventListener('submit', async (e) => {
  e.preventDefault(); const v = $('[data-mark-in]').value.trim(); if (v.length < 2) return;
  const b = e.currentTarget.querySelector('button'); b.disabled = true; b.textContent = tr('Kreslím…', 'Kreslím…');
  const m = await makeMark(v, null);
  b.disabled = false; b.textContent = tr('Nakresli', 'Nakresli');
  if (m) { await ed.applyDesign({ mark: m.src }); paintMark(); if (!m.ai) toast(tr('Použili sme čistú ikonu, kreslenie na mieru je teraz vyťažené.', 'Použili jsme čistou ikonu, kreslení na míru je teď vytížené.')); }
});
$('[data-mark-del]').addEventListener('click', async () => { await ed.applyDesign({ mark: null }); paintMark(); });

$$('[data-add]').forEach((b) => b.addEventListener('click', () => ed.add(b.dataset.add)));
$('[data-add-img]').addEventListener('click', () => $('[data-img-file]').click());
$('[data-img-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; ed.add('image', { src: await shrink(f, 2000, f.type === 'image/png' ? 'image/png' : 'image/jpeg') }); e.target.value = ''; });
let iconsDone = false;
function paintIcons() { if (iconsDone) return; iconsDone = true; $('[data-icons]').innerHTML = Object.keys(ICONS).map((n) => `<button data-icon="${n}" title="${n}">${iconSVG(n, '#0F1440', 1.8)}</button>`).join(''); }
$('[data-icons]').addEventListener('click', (e) => { const b = e.target.closest('[data-icon]'); if (b) ed.add('icon', { name: b.dataset.icon }); });
function paintArts() {
  const cur = ed.design.art;
  $('[data-arts]').innerHTML = `<button class="none${!cur ? ' on' : ''}" data-art="">${tr('Bez', 'Bez')}</button>` + Object.keys(ART).map((k) => `<button data-art="${k}" class="${cur === k ? 'on' : ''}" title="${ART[k].label}" style="background-image:url(${VK.root}assets/art/${k}.jpg)"></button>`).join('');
}
$('[data-arts]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-art]'); if (!b) return;
  const k = b.dataset.art || null;
  const artTpls = ['mramor', 'prechod', 'holo', 'botanika', 'linia', 'akvarel', 'terrazzo', 'retro', 'drevo', 'bauhaus', 'noirgold', 'podpis'];
  if (k && !artTpls.includes(ed.design.tpl)) await ed.setTemplate(({ botanika: 'botanika', 'liniove-listy': 'linia', 'akvarel-modry': 'akvarel' })[k] || 'mramor', true);
  await ed.setArt(k); paintArts();
});
$('[data-marks]').addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); ed.setMarks(on); });

function paintSides() { if (ed) $$('[data-side]').forEach((b) => b.classList.toggle('on', b.dataset.side === ed.side)); }
$$('[data-side]').forEach((b) => b.addEventListener('click', async () => { await ed.setSide(b.dataset.side); paintSides(); }));
$('[data-undo]').addEventListener('click', () => ed.undo());
$('[data-redo]').addEventListener('click', () => ed.redo());

const ctx = $('[data-ctx]');
const FAMS = [...new Set(Object.values(FONTS).flatMap((f) => [f.display, f.text]))];
$('[data-fontsel]').innerHTML = FAMS.map((f) => `<option value="${f}">${f}</option>`).join('');
const PT = 25.4 / 72 * 10;
function paintCtx(o) {
  if (!o || st.step !== 'edit') { ctx.hidden = true; $$('.pop').forEach((p) => p.classList.remove('on')); return; }
  ctx.hidden = false;
  const isText = /text/.test(o.type), isImg = o.type === 'image', isMark = isImg && o.data?.role === 'mark';
  $('[data-ctx-text]').hidden = !isText; $('[data-ctx-img]').hidden = !isImg || isMark; $('[data-ctx-colors]').hidden = isImg && !isMark;
  $('[data-upper]').hidden = !isText; $('[data-ls]').closest('label').hidden = !isText;
  if (isText) {
    const sel = $('[data-fontsel]'); if (!FAMS.includes(o.fontFamily)) sel.insertAdjacentHTML('beforeend', `<option>${o.fontFamily}</option>`); sel.value = o.fontFamily;
    $('[data-szv]').value = (o.fontSize * (o.scaleY || 1) / PT).toFixed(1).replace('.0', '');
    $('[data-bold]').classList.toggle('on', +o.fontWeight >= 600);
    $('[data-italic]').classList.toggle('on', o.fontStyle === 'italic');
    $('[data-ls]').value = o.charSpacing || 0;
  }
  const pal = curPal();
  const cur = (o.type === 'line' ? o.stroke : o.type === 'group' ? (o.getObjects()[0]?.stroke || o.getObjects()[0]?.fill) : o.fill) || '';
  const cols = [...new Set([pal.ink, pal.accent, pal.bg, pal.soft, '#FFFFFF', '#111111'].map((c) => c.toUpperCase()))];
  $('[data-ctx-colors]').innerHTML = cols.map((c) => `<button data-col="${c}" style="background:${c}"${String(cur).toUpperCase() === c ? ' class="on"' : ''} aria-label="${c}"></button>`).join('') + `<label title="${tr('Vlastná farba', 'Vlastní barva')}"><input type="color" data-colpick value="${/^#[0-9a-f]{6}$/i.test(cur) ? cur : '#000000'}"></label>`;
  $('[data-opacity]').value = Math.round((o.opacity ?? 1) * 100);
}
$('[data-fontsel]').addEventListener('change', (e) => ed.style({ fontFamily: e.target.value }));
$$('[data-sz]').forEach((b) => b.addEventListener('click', () => { const o = ed.active(); if (!o) return; const pt = o.fontSize * (o.scaleY || 1) / PT + (+b.dataset.sz); ed.style({ fontSize: Math.max(4, pt) * PT / (o.scaleY || 1) }); }));
$('[data-szv]').addEventListener('change', (e) => { const o = ed.active(); const pt = parseFloat(e.target.value.replace(',', '.')); if (o && pt > 2) ed.style({ fontSize: pt * PT / (o.scaleY || 1) }); });
$('[data-bold]').addEventListener('click', () => { const o = ed.active(); if (o) ed.style({ fontWeight: +o.fontWeight >= 600 ? 400 : 700 }); });
$('[data-italic]').addEventListener('click', () => { const o = ed.active(); if (o) ed.style({ fontStyle: o.fontStyle === 'italic' ? 'normal' : 'italic' }); });
$('[data-upper]').addEventListener('click', () => { const o = ed.active(); if (!o) return; const up = !(o.data && o.data.upper); if (!up && o.data?.field) ed.style({ upper: false, text: (o.data.prefix || '') + (ed.design.f[o.data.field] || o.text) }); else ed.style({ upper: up }); });
$('[data-ls]').addEventListener('input', (e) => ed.style({ charSpacing: +e.target.value }));
async function recolorMark(o, color) {
  const src = ed.design.mark; if (!src) return;
  const el = await loadImg(src); const c = document.createElement('canvas'); c.width = el.width; c.height = el.height;
  const x = c.getContext('2d'); x.drawImage(el, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  o.setElement(c); ed.canvas.requestRenderAll(); ed.canvas.fire('object:modified', { target: o });
}
ctx.addEventListener('click', (e) => {
  const c = e.target.closest('[data-col]');
  if (c) { const o = ed.active(); if (o && o.type === 'image' && o.data?.role === 'mark') recolorMark(o, c.dataset.col); else ed.style({ color: c.dataset.col }); }
  const p = e.target.closest('[data-pop]');
  if (p) { const box = $(`[data-popbox="${p.dataset.pop}"]`); const was = box.classList.contains('on'); $$('.pop').forEach((x) => x.classList.remove('on')); box.classList.toggle('on', !was); }
  const ord = e.target.closest('[data-order]'); if (ord) ed.order(ord.dataset.order);
  const al = e.target.closest('[data-alignc]'); if (al) ed.align(al.dataset.alignc);
});
ctx.addEventListener('input', (e) => { if (e.target.matches('[data-colpick]')) { const o = ed.active(); if (o?.data?.role === 'mark') recolorMark(o, e.target.value); else ed.style({ color: e.target.value }); } if (e.target.matches('[data-opacity]')) ed.style({ opacity: +e.target.value / 100 }); });
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.ctx__pop')) $$('.pop').forEach((x) => x.classList.remove('on')); });
$('[data-dup]').addEventListener('click', () => ed.duplicate());
$('[data-del]').addEventListener('click', () => ed.remove());
$('[data-replace]').addEventListener('click', () => $('[data-replace-file]').click());
$('[data-replace-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; const o = ed.active(); if (f && o) ed.replaceImage(o, await shrink(f, 2000, f.type === 'image/png' ? 'image/png' : 'image/jpeg')); e.target.value = ''; });

/* =========================================================
   4. OBJEDNÁVKA
   ========================================================= */
let scene = null, sceneKey = '';
function tier() { return st.cfg.paper === 'triplex' ? 'triplex' : st.cfg.finish === 'soft' ? 'soft' : 'std'; }
function cfgFor(t, c = st.cfg) {
  if (t === 'triplex') return { ...c, paper: 'triplex', finish: 'none' };
  if (t === 'soft') return { ...c, paper: 'matny', finish: 'soft' };
  return { ...c, paper: 'matny', finish: c.finish === 'leskla' ? 'leskla' : 'none' };
}
const finishOf = () => (st.cfg.paper === 'triplex' ? 'matte' : st.cfg.finish === 'leskla' ? 'gloss' : st.cfg.finish === 'soft' ? 'soft' : 'matte');
async function enterOrder() {
  if (!st.loaded) return;
  paintOrder();
  const d = ed.printable();
  const [f, b] = await Promise.all([snapshot(d, 'front', 1600, 'image/jpeg'), snapshot(d, 'back', 1600, 'image/jpeg')]);
  $('[data-thumb-front]').src = f; $('[data-thumb-back]').src = b;
  const S = SIZES[st.cfg.size], key = S.w + 'x' + S.h;
  const { cardScene } = await import('./three-cards.js');
  if (!scene || sceneKey !== key) {
    scene?.dispose(); $('[data-3d]').querySelectorAll('canvas').forEach((c) => c.remove());
    scene = await cardScene($('[data-3d]'), [{ front: f, back: b, w: S.w, h: S.h, pos: [0, 0, 0], rot: [-0.25, -0.45, 0.05], finish: finishOf(), thick: st.cfg.paper === 'triplex' ? 2.2 : 0.7, edge: st.cfg.paper === 'triplex' ? '#FF6B4A' : '#EDE8DE' }], { camZ: 205, fov: 30, shadow: false, drag: true, float: false, parallaxAmt: 0.1, fit: 150 });
    sceneKey = key;
  } else { await scene.setTexture(0, 'front', f); await scene.setTexture(0, 'back', b); paint3D(); }
}
function paint3D() { if (!scene) return; scene.setFinish(0, finishOf()); scene.setThickness(0, st.cfg.paper === 'triplex' ? 2.2 : 0.7, st.cfg.paper === 'triplex' ? '#FF6B4A' : '#EDE8DE'); }
function paintOrder() {
  const P = VK.prices, c = st.cfg, dig = c.kind === 'digital';
  $('[data-print-opts]').style.display = dig ? 'none' : '';
  $$('[data-kind] .kind').forEach((b) => b.classList.toggle('on', b.dataset.v === c.kind));
  const t = tier();
  $$('[data-paper] .paper').forEach((b) => b.classList.toggle('on', b.dataset.v === t));
  const stdP = printPrice(cfgFor('std', { ...c, finish: 'none' }), P);
  $$('[data-pp-price]').forEach((e) => { const k = e.dataset.ppPrice; e.textContent = k === 'std' ? money(stdP) : '+' + money(printPrice(cfgFor(k), P) - stdP); });
  $$('[data-qp]').forEach((s) => { s.textContent = money(printPrice({ ...c, qty: +s.dataset.qp }, P)); });
  $$('[data-qty] button').forEach((b) => b.classList.toggle('on', +b.dataset.v === c.qty));
  $$('[data-o]').forEach((seg) => { const k = seg.dataset.o; const val = k === 'gloss' ? (c.finish === 'leskla' ? '1' : '0') : String(c[k]); $$('button', seg).forEach((b) => b.classList.toggle('on', b.dataset.v === val)); });
  $('[data-o="gloss"]').closest('.opt').style.display = t === 'std' ? '' : 'none';
  $('[data-round-p]').textContent = '+' + money(P.round[String(c.qty)]);
  $('[data-express]').checked = !!c.express;
  const total = itemPrice(c, P);
  $('[data-sum]').textContent = money(total);
  $('[data-sum-m]').textContent = dig ? tr('na 12 mesiacov', 'na 12 měsíců') : `${c.qty} ${tr('ks', 'ks')} · ${money(total / c.qty, { decimals: 2 })} / ${tr('ks', 'ks')}${c.kind === 'bundle' ? ' · ' + tr('+ digitálna zadarmo', '+ digitální zdarma') : ''}`;
  const now = new Date();
  $('[data-sum-d]').textContent = dig ? tr('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.') : `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + (c.express ? 2 : 4)))}`;
  $('[data-pdf]').hidden = dig;
}
$('[data-kind]').addEventListener('click', (e) => { const b = e.target.closest('.kind'); if (!b) return; st.cfg.kind = b.dataset.v; paintOrder(); persist(); });
$('[data-paper]').addEventListener('click', (e) => { const b = e.target.closest('.paper'); if (!b) return; st.cfg = cfgFor(b.dataset.v); paintOrder(); paint3D(); persist(); });
$('[data-qty]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.cfg.qty = +b.dataset.v; paintOrder(); persist(); });
$$('[data-o]').forEach((seg) => seg.addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const k = seg.dataset.o;
  if (k === 'gloss') st.cfg.finish = b.dataset.v === '1' ? 'leskla' : 'none'; else st.cfg[k] = b.dataset.v;
  paintOrder(); persist();
  if (k === 'size') { thumbs.clear(); await ed.setSize(st.cfg.size); enterOrder(); }
  if (k === 'corners') ed.setCorners(st.cfg.corners);
  if (k === 'gloss') paint3D();
}));
$('[data-express]').addEventListener('change', (e) => { st.cfg.express = e.target.checked; paintOrder(); persist(); });
$('[data-back-edit]').addEventListener('click', () => go('edit'));
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
  toast(tr('Vizitka je v košíku.', 'Vizitka je v košíku.'), { href: VK.links.kosik, label: tr('Prejsť do košíka', 'Přejít do košíku') });
});

/* =========================================================
   UKLADANIE A ŠTART
   ========================================================= */
const persist = debounce(() => { if (ed && st.loaded) store.set(SAVE, { ...ed.export(), cfg: st.cfg, slugTouched: st.slugTouched, touched: [...st.touched] }); }, 700);

(async function boot() {
  for (const [p, k] of Object.entries({ papier: 'paper', povrch: 'finish', rohy: 'corners', ks: 'qty' })) if (params.get(p)) st.cfg[k] = k === 'qty' ? +params.get(p) : params.get(p);
  if (['bundle', 'print', 'digital'].includes(params.get('druh'))) st.cfg.kind = params.get('druh');
  st.saved = await store.get(SAVE);
  if (st.saved?.cfg && !params.get('ks')) st.cfg = { ...st.cfg, ...st.saved.cfg };
  const draft = session('vk2-draft');
  const meno = params.get('meno');
  go('start');
  paintStart();
  if (draft && draft.f) {
    session('vk2-draft', null);
    if (meno) draft.f.name = meno;
    st.reached.add('choose');
    await loadDesign(newDesign(draft)); go('edit');
    return;
  }
  const rez = params.get('rezim');
  if (rez === 'ai' && params.get('prompt')) runAI(params.get('prompt'));
  else if (rez === 'sablony') showTemplates();
  else if (meno) { st.touched.add('name'); await loadDesign(newDesign({ tpl: 'znak', ...templateDefaults('znak'), f: { ...DEFAULT_FIELDS, name: meno } })); st.reached.add('choose'); go('edit'); }
  else if (rez === 'ai') setTimeout(() => $('[data-ask-start-in]').focus(), 300);
})();
