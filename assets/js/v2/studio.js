// Tvorba – sprievodca v 4 krokoch: začiatok → výber návrhu → úpravy → objednávka
import { SIZES, FONTS, PALETTES, ART, newDesign, contrast, slugify, tr, CZ, DEFAULT_FIELDS } from './model.js';
import { TEMPLATES, BACK_KEYS, templateDefaults, layout } from './templates.js';
import { snapshot, loadImg, photo, mockup, inspect } from './render.js';
import { createEditor } from './editor.js';
import { initEdTools } from './edtools.js';
import { initEdPanels } from './edpanels.js';
import { askAI, makeMark, API } from './ai.js';
import { analyzeLogo, fileToDataURL } from '../logo.js';
import * as store from './store.js';
import { PERSONAS, personaFields, TPL_PERSONA } from './personas.js';
import { emblemFor } from './emblems.js';
import { ranked, badge as tplBadge, BY_IND } from './featured.js';
import { toast } from './site.js';
import { money, printPrice, itemPrice, addWorkdays, fmtDay, debounce, session, qrSVG, deliveryDays } from '../util.js';

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
let ed = null, tools = null, panels = null;

/* =========================================================
   KROKY
   ========================================================= */
function go(step) {
  if (st.step === 'edit' && step !== 'edit' && ed) ed.deselect();
  st.step = step; st.reached.add(step);
  $('[data-wz]').dataset.step = step;
  $$('[data-go]').forEach((li) => { const s = li.dataset.go; li.classList.toggle('on', s === step); li.classList.toggle('ok', s !== step && st.reached.has(s)); });
  window.scrollTo(0, 0);
  if (step === 'edit') { const c = st.cfg; $('[data-ed-price]').innerHTML = c.kind === 'digital' ? `<b>${money(VK.prices.digital)}</b>` : `${c.qty} ${tr('ks', 'ks')} <b>${money(itemPrice(c, VK.prices))}</b><small>${tr('doprava zadarmo', 'doprava zdarma')}</small>`; }
  if (step === 'edit') ensureEditor().then(() => { ed.fit(); const cur = $('[data-tab][aria-selected=true]')?.dataset.tab; if (isPhone()) { if (cur) openTab(cur); } else openTab(cur || 'udaje'); });
  if (step === 'order') enterOrder();
  if (step === 'edit') VK.ev?.('editor'); else if (step === 'order') VK.ev?.('order_step');
  document.dispatchEvent(new Event('vk:step'));
  $('[data-obar]').hidden = step !== 'order';
  // čítačky obrazovky: presun na nadpis kroku
  requestAnimationFrame(() => { const h = $(`[data-pane="${step}"] h1, [data-pane="${step}"] [data-focus]`); if (h && step !== 'edit') h.focus({ preventScroll: true }); });
}
$$('[data-go]').forEach((li) => li.addEventListener('click', () => { const s = li.dataset.go; if (!st.reached.has(s)) return; if ((s === 'edit' || s === 'order') && !st.loaded) return; go(s); }));

/* =========================================================
   EDITOR
   ========================================================= */
async function ensureEditor() {
  if (ed) return ed;
  ed = createEditor($('[data-canvas]'), $('[data-host]'), { pad: 40 });
  tools = initEdTools({ ed, stage: $('[data-stage]'), getStep: () => st.step, curPal, brandColors: () => st.logoColors, shrink, onStyleChange: () => { paintPals(); paintFonts(); } });
  panels = initEdPanels({ ed, tools, stage: $('[data-stage]'), getStep: () => st.step, curPal, openTab, paintSides, onStyleChange: () => { paintPals(); paintFonts(); } });
  if (/[?&]edtest\b/.test(location.search)) window.__vkEd = ed;
  ed.on('fields', ({ k }) => { syncFields(); if (k === 'name' && !st.slugTouched) setSlug(slugify(ed.design.f.name)); });
  ed.on('restore', () => { syncFields(); paintSides(); });
  ed.on('side', paintSides);
  ed.on('history', ({ undo, redo }) => { $('[data-undo]').disabled = !undo; $('[data-redo]').disabled = !redo; });
  ed.on('change', () => { savedState('saving'); persist(); });
  ed.on('zoom', (z) => { $('[data-zoom-v]').textContent = Math.round(z * 100) + ' %'; $('[data-zoom-fit]').classList.toggle('on', Math.abs(z - 1) > 0.02); $('[data-stage]').classList.toggle('is-zoomed', Math.abs(z - 1) > 0.02); });
  ed.on('interact', () => { coachDone('interact'); if (isPhone() && edx.classList.contains('is-sheet')) closePanel(); });
  // mobil: po pridaní prvku plachtu zavrieme, nech je nový prvok vidieť
  ed.on('added', () => { if (isPhone() && edx.classList.contains('is-sheet')) closePanel(); });
  ed.on('selection', (o) => { if (o) coachDone('interact'); });
  ed.on('zoom', () => requestAnimationFrame(tourPlace));
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
  setTimeout(coachShow, 900);
}

/* =========================================================
   1. ZAČIATOK
   ========================================================= */
function paintStart() {
  const ids = ['glow', 'saloon', 'cafe'];
  const imgs = $$('[data-way-thumbs] img');
  ids.forEach(async (id, i) => { if (!imgs[i].getAttribute('src')) imgs[i].src = await thumb(newDesign({ tpl: id, ...templateDefaults(id) }), 'front', 420); });
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
$('[data-start-tpl2]').addEventListener('click', () => showTemplates());
// obľúbené šablóny priamo na začiatku: jedno kliknutie a ste v editore
$('[data-insp]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-insp-t]'); if (!b) return;
  VK.ev?.('quick_start');
  const id = b.dataset.inspT; if (!TEMPLATES[id]) return;
  b.classList.add('is-going');
  const pf = personaFor(id); st.mode = 'tpl';
  await loadDesign(newDesign({ tpl: id, ...templateDefaults(id), f: pf.f, emblem: pf.emblem }));
  st.reached.add('choose'); go('edit');
  toast(tr('Prepíšte ukážkové údaje na svoje, stačí kliknúť do vizitky.', 'Přepište ukázkové údaje na své, stačí kliknout do vizitky.'));
});
// okamžitá spätná väzba: čo AI zo zadania pochopí
const SENSE = {
  city: /\b(v|vo|z|zo|ve|u|pri|pod|nad)\s+[A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ][a-zá-ž]{2,}|bratislav|košic|kosic|prešov|presov|žilin|zilin|nitr|trnav|trenčín|trencin|bystric|praha|praze|brn|ostrav|plzeň|plzen|olomouc|liberec|budějovic|budejovic|hradec|pardubic|zlín|zlin|jihlav/i,
  style: /jemn|elegan|luxus|modern|minimal|hrav|tradi|prírod|prirod|přírod|tmav|svetl|světl|farebn|barev|výrazn|vyrazn|klasick|retro|vintage|zlat|čist|cist|pastel|odváž|odvaz|seriózn|serioz|dôveryh|důvěryh|svež|svěž|prémi|premi|decent|jednoduch|kreat|útuln|utuln|hrav|veselé|vesel|ženstv|žensk|zensk|pánsk|pansk|industri|rustik|boho|art.?deco|noir|čiern|čern|biel|bíl/i,
};
function paintSense() {
  const v = $('[data-ask-start-in]').value.trim();
  const words = v.split(/\s+/).filter((w) => w.length > 2);
  const has = { job: words.length >= 2 || (words.length === 1 && v.length > 6), city: SENSE.city.test(v), style: SENSE.style.test(v) };
  $$('[data-sense-k]').forEach((x) => x.classList.toggle('on', !!has[x.dataset.senseK]));
  const tip = $('[data-sense-tip]');
  if (!v) tip.textContent = tr('Stačí jedna veta. Čím viac toho napíšete, tým presnejšie návrhy.', 'Stačí jedna věta. Čím víc toho napíšete, tím přesnější návrhy.');
  else if (!has.job) tip.textContent = tr('Napíšte, čím sa živíte, napr. kaderníčka alebo stolár.', 'Napište, čím se živíte, např. kadeřnice nebo truhlář.');
  else if (!has.style) tip.textContent = tr('Tip: pridajte štýl, napr. jemne, luxusne alebo moderne.', 'Tip: přidejte styl, např. jemně, luxusně nebo moderně.');
  else if (!has.city) tip.textContent = tr('Výborne. Mesto pomôže, ale nie je nutné.', 'Výborně. Město pomůže, ale není nutné.');
  else tip.textContent = tr('Perfektné zadanie, stlačte Navrhni.', 'Perfektní zadání, stiskněte Navrhni.');
  $('[data-sense]').classList.toggle('is-ready', has.job && has.style);
}
$('[data-ask-start-in]').addEventListener('input', paintSense);

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
function paintLoadSteps(i, done) {
  $('[data-ai-steps]').innerHTML = STEPS.map((t, k) => `<li class="${done || k < i ? 'ok' : k === i ? 'now' : ''}"><i aria-hidden="true"></i>${esc(t.replace('…', ''))}</li>`).join('');
  $('[data-ai-bar]').style.width = done ? '100%' : Math.min(92, 12 + i * 19) + '%';
}
async function runAI(prompt, previous) {
  st.mode = 'ai'; st.lastPrompt = prompt;
  $('[data-ai-box]').hidden = false; $('[data-tpl-box]').hidden = true;
  $('[data-ai-me]').textContent = '„' + prompt + '“';
  $('[data-ai-grid]').innerHTML = ''; $('[data-ai-intro]').textContent = '';
  $('[data-ai-more]').hidden = true; $('[data-ask-re]').hidden = true;
  $('[data-ai-load]').hidden = false;
  let i = 0; $('[data-ai-step]').textContent = STEPS[0]; paintLoadSteps(0);
  clearInterval(stepT); stepT = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); $('[data-ai-step]').textContent = STEPS[i]; paintLoadSteps(i); }, 1400);
  go('choose');
  const base = {};
  if (ed && st.loaded) for (const [k, v] of Object.entries(ed.design.f)) if (st.touched.has(k) && v) base[k] = v;
  VK.ev?.('ai_submit');
  const r = await askAI(prompt, base, { previous, onArt: (idx, d) => refreshMock(idx, d) });
  clearInterval(stepT); paintLoadSteps(STEPS.length, true);
  await new Promise((res) => setTimeout(res, 260));
  st.ai = r.designs;
  $('[data-ai-load]').hidden = true;
  $('[data-ai-intro]').textContent = r.intro;
  paintMine();
  paintMocks();
  $('[data-ai-more]').hidden = false;
}
// vlastné údaje priamo vo výbere návrhov (živo sa prepíšu do všetkých troch)
const MINE_K = ['name', 'phone', 'email', 'web'];
function paintMine() {
  const box = $('[data-mine]'); box.hidden = !st.ai.length;
  const f = st.ai[0]?.f || {};
  $$('[data-m]', box).forEach((i) => { const k = i.dataset.m; if (document.activeElement !== i) i.value = f[k] && f[k] !== DEFAULT_FIELDS[k] ? f[k] : ''; });
}
const remock = debounce(() => st.ai.forEach((_, i) => paintMockImgs(i)), 650);
$('[data-mine]').addEventListener('input', (e) => {
  const i = e.target.closest('[data-m]'); if (!i) return;
  const k = i.dataset.m, v = i.value.trim();
  st.touched.add(k);
  const FREE = /^(gmail|seznam|email|centrum|post|azet|zoznam|outlook|hotmail|icloud|yahoo|atlas|volny|tiscali)\./i;
  st.ai.forEach((d) => {
    d.f[k] = v;
    // web podľa domény e-mailu (vymyslený web od AI nahradíme)
    if (k === 'email' && !st.touched.has('web') && v.includes('@')) { const dom = v.split('@')[1] || ''; d.f.web = dom.includes('.') && !FREE.test(dom) ? dom : ''; }
  });
  if (k === 'email' && !st.touched.has('web')) $('[data-m="web"]').value = st.ai[0]?.f.web || '';
  remock();
});
$('[data-mine]').addEventListener('submit', (e) => e.preventDefault());
const SCENES = ['#E9E2D6', '#DCE3EC', '#E6DED8'];
function sceneFor(d, i) { return d.pal && contrast(d.pal.bg, '#FFFFFF') > 6 ? ['#E9E2D6', '#DDE1EA', '#E7E0DA'][i % 3] : SCENES[i % 3]; }
function dirLabel(dir, i) { return { classic: tr('Klasický', 'Klasický'), modern: tr('Moderný', 'Moderní'), creative: tr('Kreatívny', 'Kreativní') }[dir] || `${tr('Návrh', 'Návrh')} ${i + 1}`; }
function paintMocks() {
  const grid = $('[data-ai-grid]'); grid.innerHTML = '';
  st.ai.forEach((d, i) => {
    const el = document.createElement('article'); el.className = 'mock'; el.dataset.i = i;
    el.innerHTML = `<div class="mock__scene" style="--scene:${sceneFor(d, i)}"><img class="mock__back" alt=""><img class="mock__front" alt="">${d.markPending || d.artPending ? `<span class="mock__pend"><span class="dots"><i></i><i></i><i></i></span>${tr('kreslím znak', 'kreslím znak')}</span>` : ''}<span class="mock__dir">${dirLabel(d.direction, i)}</span><button class="mock__zoom" type="button" data-mzoom="${i}" aria-label="${tr('Zväčšiť návrh', 'Zvětšit návrh')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/></svg>${tr('Zväčšiť', 'Zvětšit')}</button></div>
      <div class="mock__info"><small>${esc(d.why || '')}</small><button class="btn btn--sm" data-pick="${i}">${tr('Vybrať', 'Vybrat')} <span class="ar">→</span></button></div>`;
    grid.append(el);
    paintMockImgs(i);
  });
}
const mockTok = [];
async function paintMockImgs(i) {
  const el = $(`.mock[data-i="${i}"]`); if (!el) return;
  const d = st.ai[i], tok = (mockTok[i] = (mockTok[i] || 0) + 1);
  el.classList.add('is-busy');
  const [f, b] = await Promise.all([thumb(d, 'front', 900).then((u) => photo(u)), thumb(d, 'back', 900).then((u) => photo(u))]);
  const m = await mockup(f, b, { width: 1000, seed: i });
  if (mockTok[i] !== tok) return;
  el.classList.remove('is-busy');
  el.querySelector('.mock__scene').classList.add('is-photo');
  el.querySelector('.mock__front').src = m; el.querySelector('.mock__back').removeAttribute('src');
}
function refreshMock(i, d) {
  const sd = st.ai[i]; if (!sd) return;
  Object.assign(sd, { mark: d.mark, art: d.art, why: d.why, markPending: d.markPending, artPending: d.artPending });
  const el = $(`.mock[data-i="${i}"]`); if (!el) return;
  if (!sd.markPending && !sd.artPending) el.querySelector('.mock__pend')?.remove();
  el.querySelector('small').textContent = sd.why;
  paintMockImgs(i);
}
async function pickAI(i) {
  const d = st.ai[i]; if (!d) return;
  const prev = st.loaded ? ed.design : null;
  await loadDesign(newDesign({ tpl: d.tpl, fonts: d.fonts, pal: d.pal, art: d.art, mark: d.mark, f: { ...d.f }, direction: d.direction, ai: d.ai, logo: prev?.logo || null, photo: prev?.photo || null, socials: prev?.socials || {}, digital: prev?.digital || {} }));
  go('edit');
}
$('[data-ai-grid]').addEventListener('click', (e) => {
  const z = e.target.closest('[data-mzoom]'); if (z) { openAiPv(+z.dataset.mzoom); return; }
  const mock = e.target.closest('.mock'); if (mock) pickAI(+mock.dataset.i);
});
$$('[data-ai-more] [data-r]').forEach((b) => b.addEventListener('click', () => {
  const d = st.ai[0];
  runAI(`${st.lastPrompt} – ${b.dataset.r}`, d ? { template: d.tpl, palette: d.pal } : undefined);
}));
$('[data-ai-change]').addEventListener('click', () => { const f = $('[data-ask-re]'); f.hidden = !f.hidden; $('[data-ask-re-in]').value = st.lastPrompt; $('[data-ask-re-in]').focus(); });
$('[data-ask-re]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-ask-re-in]').value.trim(); if (v.length > 2) runAI(v); });

let tplTok = 0, tplIO = null, tplIds = [];
const IND = {
  beauty: ['beauty', 'kozmetika', 'salon', 'kader', 'nechty', 'barber', 'masaz', 'tetovanie', 'tattoo'],
  gastro: ['kaviaren', 'gastro', 'restauracia', 'bistro', 'pekaren', 'cukraren', 'bar', 'vino', 'vinarstvo', 'pivovar', 'caj'],
  reality: ['reality', 'architekt', 'stavba', 'developer', 'interier'],
  zdravie: ['lekar', 'zubar', 'terapeut', 'wellness', 'joga', 'psycholog', 'fyzioterapia', 'ambulancia', 'spa', 'fitness', 'trener', 'sport'],
  remeslo: ['remeslo', 'stolar', 'stavba', 'auto', 'zahrady', 'farma', 'tradicne', 'elektro', 'elektrikar', 'instalater', 'upratovanie', 'cistenie'],
  pravo: ['pravnik', 'advokat', 'financie', 'uctovnictvo', 'poistenie', 'konzultant', 'poradenstvo', 'dane', 'mzdy'],
  kreativ: ['foto', 'dizajn', 'kreativ', 'it', 'marketing', 'agentura', 'hudba', 'umelec', 'startup'],
};
// odznak na karte v galérii (výber grafika / novinka / ilustrovaná)
const BADGE_CSS = { top: 'background:var(--ink);color:#fff', new: 'background:var(--coral);color:#fff', ill: '' };
const badgeHTML = (id) => { const b = tplBadge(id, tr); return b ? `<em${BADGE_CSS[b.k] ? ` style="${BADGE_CSS[b.k]}"` : ''}>${b.k === 'top' ? '✦ ' : ''}${b.t}</em>` : ''; };
// ukážkový obor šablóny, s menom zákazníka
function personaFor(id, nm) {
  const pk = TPL_PERSONA[id] || 'arch', p = PERSONAS[pk], f = personaFields(pk);
  if (nm) {
    const old = p.name.split(' ')[0], neu = nm.split(' ')[0];
    if (f.company && f.company.includes(old)) f.company = f.company.replace(old, neu);
    if (f.email) f.email = slugify(neu).replace(/-/g, '') + '@' + f.email.split('@')[1];
    f.name = nm;
  }
  return { f, emblem: emblemFor(p.icon, p.role) };
}
const tplFields = (id) => {
  const prev = st.loaded ? ed.design : null, nm = $('[data-tpl-name]').value.trim();
  if (!prev && !nm) return null; // ukážkové firmy z predrenderu
  if (!prev) return personaFor(id, nm).f;
  const f = { ...prev.f };
  if (nm) f.name = nm;
  return f;
};
async function tplRender(id, box) {
  const f = tplFields(id); const prev = st.loaded ? ed.design : null;
  const im = $(`[data-tpl="${id}"] img`, box); if (!im) return;
  const key = JSON.stringify(f) + (prev?.logo ? 'L' : '');
  if (im.dataset.k === key) return;
  im.dataset.k = key;
  if (!f) { im.src = VK.pre['tpl-' + id + '-m'] || ''; return; }
  const dd = newDesign({ tpl: id, ...templateDefaults(id), f, logo: prev?.logo || null, mark: prev?.mark || null, emblem: prev?.emblem || personaFor(id).emblem });
  const u = await mockup(await photo(await thumb(dd, 'front', 720)), await photo(await thumb(dd, 'back', 720)), { width: 640, ratio: 0.72, seed: Object.keys(TEMPLATES).indexOf(id) });
  if (im.dataset.k === key) im.src = u;
}
// obor šablóny podľa jej ukážkovej osoby (štítky sú príliš široké) + výber grafika pre obor
const PERS_IND = {
  beauty: ['kader', 'nechty', 'barber', 'kozmeticka', 'tetovanie'],
  gastro: ['pekar', 'vino', 'kava', 'cukrar', 'pivo', 'restauracia', 'pizzeria', 'vinoteka', 'koktail', 'caj', 'penzion', 'farma'],
  reality: ['makler', 'luxreality', 'arch', 'stavba', 'murar'],
  zdravie: ['zubar', 'joga', 'terapeut', 'psycholog', 'veterinar', 'fyzio', 'lekaren', 'fitness'],
  remeslo: ['stolar', 'elektro', 'auto', 'stavba', 'upratovanie', 'zahradnik', 'murar', 'maliar', 'kominar', 'krajcirka', 'farma', 'keramika', 'autoskola'],
  pravo: ['advokat', 'uct', 'uctovnicka', 'itkonz'],
  kreativ: ['it', 'foto', 'svfoto', 'startup', 'produktfoto', 'dj', 'grafik', 'agentura', 'svadba', 'eventy', 'lektor', 'doucovanie', 'knihy', 'skolka'],
};
const inInd = (id, ind) => (BY_IND[ind] || []).includes(id) || (PERS_IND[ind] || []).includes(TPL_PERSONA[id]);
async function showTemplates() {
  st.mode = 'tpl';
  $('[data-ai-box]').hidden = true; $('[data-tpl-box]').hidden = false;
  go('choose');
  const filt = $('[data-filt] .on')?.dataset.f || '', ind = $('[data-ind] .on')?.dataset.i || '';
  if (st.loaded && !$('[data-tpl-name]').value) $('[data-tpl-name]').value = ed.design.f.name || '';
  const tags = (id) => TEMPLATES[id].tags;
  const pool = Object.keys(TEMPLATES)
    .filter((id) => (!filt || tags(id).includes(filt)) && (!ind || inInd(id, ind)));
  const ids = ranked(pool, ind);
  $('[data-tpl-count]').textContent = ids.length;
  const box = $('[data-tpls]'); ++tplTok;
  tplIds = ids;
  box.innerHTML = ids.length ? ids.map((id) => `<div class="tcell"><button data-tpl="${id}"><img alt="" loading="lazy">${badgeHTML(id)}<span>${TEMPLATES[id].name}</span></button><button class="tzoom" type="button" data-zoom="${id}" aria-label="${tr('Náhľad šablóny', 'Náhled šablony')} ${TEMPLATES[id].name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/></svg></button></div>`).join('')
    : `<p class="tgrid__none">${tr('Takú kombináciu nemáme. Skúste iný štýl.', 'Takovou kombinaci nemáme. Zkuste jiný styl.')}</p>`;
  tplIO?.disconnect();
  tplIO = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { tplIO.unobserve(e.target); tplRender(e.target.dataset.tpl, box); } }), { rootMargin: '300px' });
  $$('[data-tpl]', box).forEach((b) => tplIO.observe(b));
}
const reTpl = debounce(() => { const box = $('[data-tpls]'); $$('[data-tpl]', box).forEach((b) => { const r = b.getBoundingClientRect(); if (r.top < innerHeight + 300 && r.bottom > -300) tplRender(b.dataset.tpl, box); else { b.querySelector('img').dataset.k = ''; tplIO?.observe(b); } }); }, 450);
$('[data-tpl-name]').addEventListener('input', reTpl);
$('[data-filt]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('[data-filt] button').forEach((x) => x.classList.toggle('on', x === b)); showTemplates(); });
$('[data-ind]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('[data-ind] button').forEach((x) => x.classList.toggle('on', x === b)); showTemplates(); });
$('[data-tpls]').addEventListener('click', async (e) => {
  const z = e.target.closest('[data-zoom]'); if (z) { openTpv(z.dataset.zoom); return; }
  const b = e.target.closest('[data-tpl]'); if (!b) return;
  VK.ev?.('tpl_click');
  const id = b.dataset.tpl, prev = st.loaded ? ed.design : null;
  const nm = $('[data-tpl-name]').value.trim();
  const pf = personaFor(id, nm);
  const f0 = prev ? { ...prev.f } : pf.f; if (nm) { f0.name = nm; st.touched.add('name'); }
  await loadDesign(newDesign({ tpl: id, ...templateDefaults(id), f: f0, emblem: prev?.emblem || pf.emblem, logo: prev?.logo || null, mark: prev?.mark || null, photo: prev?.photo || null, socials: prev?.socials || {}, digital: prev?.digital || {} }));
  go('edit');
});

/* náhľad šablóny: predná a zadná strana vo veľkom, listovanie a „Použiť“ */
const tpv = { dlg: $('[data-tpv]'), id: null, tok: 0, mode: 'tpl', i: 0 };
// náhľad návrhu od AI vo veľkom (predná/zadná, listovanie medzi tromi smermi)
async function openAiPv(i) {
  const D = tpv.dlg, d = st.ai[i]; if (!D || !d) return;
  tpv.mode = 'ai'; tpv.i = i; const tok = ++tpv.tok;
  $('[data-tpv-name]', D).textContent = `${dirLabel(d.direction, i)} ${tr('smer', 'směr')} · ${TEMPLATES[d.tpl]?.name || ''}`;
  $('[data-tpv-tag]', D).textContent = d.why || '';
  $('[data-tpv-pos]', D).textContent = `${i + 1} / ${st.ai.length}`;
  $('[data-tpv-use]', D).firstChild.textContent = tr('Vybrať tento návrh ', 'Vybrat tento návrh ');
  tpvSide('f'); D.classList.add('is-busy');
  if (!D.open) D.showModal();
  const [a, b] = await Promise.all([thumb(d, 'front', 1000), thumb(d, 'back', 1000)]);
  if (tok !== tpv.tok) return;
  $('[data-tpv-f]', D).src = a; $('[data-tpv-b]', D).src = b;
  D.classList.remove('is-busy');
}
async function openTpv(id) {
  const D = tpv.dlg; if (!D || !TEMPLATES[id]) return;
  tpv.mode = 'tpl'; $('[data-tpv-use]', D).firstChild.textContent = tr('Použiť túto šablónu ', 'Použít tuto šablonu ');
  tpv.id = id; const tok = ++tpv.tok;
  const pk = TPL_PERSONA[id], role = PERSONAS[pk]?.role;
  $('[data-tpv-name]', D).textContent = TEMPLATES[id].name;
  $('[data-tpv-tag]', D).textContent = [tplBadge(id, tr)?.t, role && tr('ukážka: ', 'ukázka: ') + role.toLowerCase()].filter(Boolean).join(' · ');
  const i = tplIds.indexOf(id);
  $('[data-tpv-pos]', D).textContent = i >= 0 ? `${i + 1} / ${tplIds.length}` : '';
  tpvSide('f');
  const f = tplFields(id), [im1, im2] = [$('[data-tpv-f]', D), $('[data-tpv-b]', D)];
  D.classList.add('is-busy');
  if (!f && VK.pre['tpl-' + id + '-f']) { im1.src = VK.pre['tpl-' + id + '-f']; im2.src = VK.pre['tpl-' + id + '-b'] || ''; }
  if (!D.open) D.showModal();
  if (f) {
    const prev = st.loaded ? ed.design : null;
    const dd = newDesign({ tpl: id, ...templateDefaults(id), f, logo: prev?.logo || null, mark: prev?.mark || null, emblem: prev?.emblem || personaFor(id).emblem });
    const [a, b] = await Promise.all([thumb(dd, 'front', 1000), thumb(dd, 'back', 1000)]);
    if (tok !== tpv.tok) return;
    im1.src = a; im2.src = b;
  }
  D.classList.remove('is-busy');
}
function tpvSide(side) {
  const D = tpv.dlg;
  D.classList.toggle('is-back', side === 'b');
  $$('[data-tpv-side]', D).forEach((b) => b.setAttribute('aria-pressed', b.dataset.tpvSide === side));
}
function tpvStep(d) {
  if (tpv.mode === 'ai') { openAiPv((tpv.i + d + st.ai.length) % st.ai.length); return; }
  const i = tplIds.indexOf(tpv.id); if (i < 0 || !tplIds.length) return; openTpv(tplIds[(i + d + tplIds.length) % tplIds.length]);
}
if (tpv.dlg) {
  tpv.dlg.addEventListener('click', (e) => {
    if (e.target === tpv.dlg || e.target.closest('[data-tpv-x]')) { tpv.dlg.close(); return; }
    const sd = e.target.closest('[data-tpv-side]'); if (sd) { tpvSide(sd.dataset.tpvSide); return; }
    if (e.target.closest('[data-tpv-flip]')) { tpvSide(tpv.dlg.classList.contains('is-back') ? 'f' : 'b'); return; }
    if (e.target.closest('[data-tpv-prev]')) { tpvStep(-1); return; }
    if (e.target.closest('[data-tpv-next]')) { tpvStep(1); return; }
    if (e.target.closest('[data-tpv-use]')) { tpv.dlg.close(); if (tpv.mode === 'ai') { pickAI(tpv.i); return; } const id = tpv.id; $(`[data-tpls] [data-tpl="${id}"]`)?.click(); }
  });
  tpv.dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') tpvStep(1); if (e.key === 'ArrowLeft') tpvStep(-1); });
}

/* =========================================================
   3. ÚPRAVY
   ========================================================= */
const tabs = $$('[data-tab]'), panes = $$('[data-pp]');
const edx = $('.edx');
const isPhone = () => matchMedia('(max-width: 1023px)').matches;
// ľavý panel nástrojov (na mobile spodný panel); opätovný klik na aktívnu ikonu ho zbalí
function openTab(id, { toggle = false } = {}) {
  if (id === 'viac') id = 'prvky';
  const cur = $('[data-tab][aria-selected=true]')?.dataset.tab;
  const open = !edx.classList.contains('is-collapsed') && (!isPhone() || edx.classList.contains('is-sheet'));
  if (toggle && cur === id && open) { closePanel(); return; }
  tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === id));
  panes.forEach((p) => p.classList.toggle('on', p.dataset.pp === id));
  $('[data-panel-title]').textContent = $(`[data-tab="${id}"] span`)?.textContent || '';
  edx.classList.remove('is-collapsed');
  if (isPhone()) { edx.classList.add('is-sheet'); tools?.closePop(); }
  requestAnimationFrame(() => ed?.fit());
  if (!ed || !st.loaded) return;
  if (id === 'styl') { paintPals(); paintFonts(); }
  if (id === 'sablony') { paintBacks(); panels?.paintTemplates(); }
  if (id === 'prvky') tools?.showElements();
  if (id === 'pozadie') { paintArts(); panels?.paintBackground(); }
  if (id === 'text') panels?.paintText();
  if (id === 'qr') panels?.paintQR();
  if (id === 'logo') paintMark();
}
// mobil: editor na celú výšku pod hlavičkou a krokmi
function sizeEdx() { if (!edx) return; const top = edx.getBoundingClientRect().top + scrollY; edx.style.setProperty('--edx-top', Math.round(top) + 'px'); }
addEventListener('resize', () => { if (st.step === 'edit') { sizeEdx(); ed?.fit(); } });
document.addEventListener('vk:step', () => { if (st.step === 'edit') requestAnimationFrame(() => { sizeEdx(); ed?.fit(); }); });
function closePanel() {
  if (isPhone()) edx.classList.remove('is-sheet'); else edx.classList.add('is-collapsed');
  tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
  requestAnimationFrame(() => ed?.fit());
}
tabs.forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab, { toggle: true })));
$('[data-panel-x]').addEventListener('click', closePanel);
$$('[data-open]').forEach((b) => b.addEventListener('click', () => openTab(b.dataset.open)));
$('[data-img-pick]').addEventListener('click', () => $('[data-img-file]').click());
$('[data-goto-dig]').addEventListener('click', () => { openTab('udaje'); const d = $('[data-digital-fields]'); if (d) { d.open = true; d.scrollIntoView({ block: 'start', behavior: 'smooth' }); } });
$('[data-back-choose]').addEventListener('click', () => { if (st.ai.length) { st.mode = 'ai'; $('[data-ai-box]').hidden = false; $('[data-tpl-box]').hidden = true; go('choose'); } else showTemplates(); });
$('[data-to-order]').addEventListener('click', () => go('order'));

function syncFields() {
  if (!ed || !st.loaded) return;
  const d = ed.design;
  $$('[data-f]').forEach((i) => { if (document.activeElement !== i) i.value = d.f[i.dataset.f] || ''; });
  $('[data-slug]').value = d.slug || '';
  $$('[data-soc]').forEach((i) => { i.value = (d.socials || {})[i.dataset.soc] || ''; });
  $$('[data-dig]').forEach((i) => { i.value = (d.digital || {})[i.dataset.dig] || ''; });
  paintSamples();
  const ph = $('[data-photo-img]');
  if (d.photo) { ph.src = d.photo; $('[data-photo-del]').hidden = false; } else { ph.removeAttribute('src'); $('[data-photo-del]').hidden = true; }
}
// ukážkové údaje (zo šablóny) zvýraznime, nech ich zákazník prepíše
const SAMPLE_RE = /(605|905) 123 456|@hruskastudio\.|hruskastudio\.|@(levandula|domovreality|bitlab|lipovafoto|prana|salonjana|zuzka|podpezinkom|nailsbynika|barberrybar|hankovapartneri|simkouctovnictvo)\./;
function isSample(k, v) {
  if (!v) return false;
  if (DEFAULT_FIELDS[k] && v === DEFAULT_FIELDS[k]) return true;
  if (['phone', 'email', 'web'].includes(k) && SAMPLE_RE.test(v)) return true;
  if (st.touched.has(k)) return false;
  const d = ed?.design; if (!d) return false;
  const pk = TPL_PERSONA[d.tpl]; const pf = pk ? personaFields(pk) : null;
  return !!(pf && pf[k] && pf[k] === v && st.mode === 'tpl');
}
function paintSamples() {
  if (!ed || !st.loaded) return;
  let n = 0;
  $$('.fields [data-f]').forEach((i) => { const on = isSample(i.dataset.f, i.value); i.closest('.fld').classList.toggle('is-sample', on); n += on; });
  const tip = $('[data-pp="udaje"] .pn__tip');
  tip.classList.toggle('is-warn', n > 0);
  tip.textContent = n ? tr(`Zvýraznené polia sú ukážkové (${n}). Prepíšte ich na svoje, vizitka sa mení naživo.`, `Zvýrazněná pole jsou ukázková (${n}). Přepište je na svá, vizitka se mění živě.`) : tr('Text môžete upraviť aj priamo vo vizitke: kliknite naň a píšte.', 'Text můžete upravit i přímo ve vizitce: klikněte na něj a pište.');
}
$$('.fields [data-f]').forEach((i) => i.addEventListener('focus', () => { if (i.closest('.fld').classList.contains('is-sample')) requestAnimationFrame(() => i.select()); }));
// zvýraznenie poľa vo vizitke počas písania (ak je na tejto strane)
// ak pole na tejto strane nie je, ale je na druhej, povieme to a ponúkneme prepnutie
function onOtherSide(k) {
  try {
    const other = ed.side === 'front' ? 'back' : 'front';
    const d = ed.printable(), js = d.sides?.[other];
    const objs = js ? (js.objects || []).flatMap((o) => (o.objects ? [o, ...o.objects] : [o])) : layout(d, other).objs;
    return objs.some((o) => (o.data?.field || o.field) === k) ? other : null;
  } catch (e) { return null; }
}
$$('.fields [data-f]').forEach((i) => {
  i.addEventListener('focus', () => {
    $$('.fld__other').forEach((x) => x.remove());
    if (!ed || ed.focusField?.(i.dataset.f)) return;
    const other = onOtherSide(i.dataset.f); if (!other) return;
    const n = document.createElement('p'); n.className = 'fld__other';
    n.innerHTML = `${other === 'back' ? tr('Tento údaj je na zadnej strane.', 'Tento údaj je na zadní straně.') : tr('Tento údaj je na prednej strane.', 'Tento údaj je na přední straně.')} <button type="button">${tr('Ukázať', 'Ukázat')}</button>`;
    n.querySelector('button').addEventListener('mousedown', (e) => e.preventDefault());
    n.querySelector('button').addEventListener('click', async () => { $(`[data-side="${other}"]`)?.click(); setTimeout(() => { i.focus(); ed.focusField?.(i.dataset.f); }, 450); n.remove(); });
    i.closest('.fld').append(n);
  });
  i.addEventListener('blur', () => { ed?.focusField?.(null); setTimeout(() => { if (!i.closest('.fld').contains(document.activeElement)) i.closest('.fld').querySelector('.fld__other')?.remove(); }, 200); });
});
const setFieldD = debounce((k, v) => ed.setField(k, v), 120);
$$('[data-f]').forEach((i) => i.addEventListener('input', () => {
  const k = i.dataset.f; st.touched.add(k);
  ed.design.f[k] = i.value;
  if (k === 'name' && !st.slugTouched) setSlug(slugify(i.value));
  i.closest('.fld')?.classList.remove('is-sample');
  setFieldD(k, i.value);
}));
function setSlug(v) { ed.design.slug = v; $('[data-slug]').value = v; updateQR(); }
const updateQR = debounce(() => ed && ed.setQR(qrFor(ed.design.slug)), 500);
$('[data-slug]').addEventListener('input', (e) => { st.slugTouched = true; ed.design.slug = slugify(e.target.value); updateQR(); persist(); });
$$('[data-soc]').forEach((i) => i.addEventListener('input', () => { ed.design.socials = { ...(ed.design.socials || {}), [i.dataset.soc]: i.value.trim() }; persist(); }));
$$('[data-dig]').forEach((i) => i.addEventListener('input', () => { ed.design.digital = { ...(ed.design.digital || {}), [i.dataset.dig]: i.value }; persist(); }));
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
  st.logoColors = r.colors || [];
  await ed.setLogo(r.src);
  await ed.setPalette(st.logoPals[0]);
  if (isPhone() && edx.classList.contains('is-sheet')) closePanel();
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
$('[data-logo-del]').addEventListener('click', async () => { st.logoColors = []; await ed.setLogo(null); drop.classList.remove('has'); $('[data-drop-img]').removeAttribute('src'); $('[data-logo-del]').hidden = true; });
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

$('[data-img-file]').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; ed.add('image', { src: await shrink(f, 2000, f.type === 'image/png' ? 'image/png' : 'image/jpeg') }); e.target.value = ''; });
function paintArts() {
  const cur = ed.design.art;
  $('[data-arts]').innerHTML = `<button class="none${!cur ? ' on' : ''}" data-art="">${tr('Bez', 'Bez')}</button>` + Object.keys(ART).map((k) => `<button data-art="${k}" class="${cur === k ? 'on' : ''}" title="${ART[k].label}" style="background-image:url(${VK.root}assets/art/${k}.jpg)"></button>`).join('');
}
$('[data-arts]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-art]'); if (!b) return;
  const k = b.dataset.art || null;
  const artTpls = ['mramor', 'prechod', 'botanika', 'linia', 'akvarel', 'bauhaus', 'noirgold', 'podpis'];
  if (k && !artTpls.includes(ed.design.tpl)) await ed.setTemplate(({ botanika: 'botanika', 'liniove-listy': 'linia', 'akvarel-modry': 'akvarel' })[k] || 'mramor', true);
  await ed.setArt(k); paintArts();
});
$('[data-marks]').addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); ed.setMarks(on); });

function paintSides() { if (ed) $$('[data-side]').forEach((b) => b.classList.toggle('on', b.dataset.side === ed.side)); }
$$('[data-side]').forEach((b) => b.addEventListener('click', async () => { await ed.setSide(b.dataset.side); paintSides(); }));
$('[data-undo]').addEventListener('click', () => ed.undo());
$('[data-redo]').addEventListener('click', () => ed.redo());
$('[data-zoom-in]').addEventListener('click', () => ed?.zoomIn());
$('[data-zoom-out]').addEventListener('click', () => ed?.zoomOut());
$('[data-zoom-fit]').addEventListener('click', () => ed?.zoomFit());
$('[data-keys]').addEventListener('click', (e) => { const p = $('[data-keys-pop]'); const on = !p.classList.contains('on'); p.classList.toggle('on', on); e.currentTarget.setAttribute('aria-expanded', on); });
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.ed-keys')) { $('[data-keys-pop]').classList.remove('on'); $('[data-keys]').setAttribute('aria-expanded', 'false'); } });
// automatické ukladanie: stav vpravo hore
let savedT;
function savedState(s) {
  const el = $('[data-saved]'); if (!el) return;
  el.classList.toggle('is-saving', s === 'saving');
  $('[data-saved-t]').textContent = s === 'saving' ? tr('Ukladám…', 'Ukládám…') : tr('Uložené v prehliadači', 'Uloženo v prohlížeči');
  if (s === 'saved') { el.classList.add('is-flash'); clearTimeout(savedT); savedT = setTimeout(() => el.classList.remove('is-flash'), 1200); }
}
// krátka prehliadka pri prvej návšteve editora: vizitka → nástroje → objednávka (dá sa preskočiť)
const COACH = 'vk2-coach';
const tour = { el: $('[data-tour]'), i: -1, steps: [] };
document.body.append(tour.el); // fixed pozícia voči oknu, nie voči ploche editora (tá má transform)
try { tour.steps = JSON.parse(tour.el.dataset.steps || '[]'); } catch (e) { tour.steps = []; }
function tourTarget(i) {
  if (i === 0) {
    const c = ed?.canvas, h = $('[data-host]'); if (!c || !h) return null;
    const r = h.getBoundingClientRect(), v = c.viewportTransform, sz = ed.design ? (SIZES[ed.design.size] || SIZES['90x50']) : SIZES['90x50'];
    const z = v[0], B = 2 * 10 * z;
    return { left: r.left + v[4] + B, top: r.top + v[5] + B, width: sz.w * 10 * z, height: sz.h * 10 * z };
  }
  if (i === 1) return $('.edx-rail')?.getBoundingClientRect();
  return $('[data-to-order]')?.getBoundingClientRect();
}
function tourPlace() {
  if (tour.i < 0) return;
  const el = tour.el; let t = tourTarget(tour.i); if (!t) return;
  if (!t.width) { const sr = $('[data-stage]')?.getBoundingClientRect(); if (sr) t = { left: sr.left, top: sr.top + 60, width: sr.width, height: 0 }; }
  const bw = el.offsetWidth, bh = el.offsetHeight, vw = innerWidth, vh = innerHeight, gap = 14;
  let x, y, side;
  if (tour.i === 1 && !isPhone()) { side = 'left'; x = t.left + t.width + gap; y = Math.min(vh - bh - 12, Math.max(12, t.top + 120)); }
  else if (tour.i === 0) {
    // pod vizitkou, nad ňou, alebo vedľa nej – bublina nesmie zakryť samotnú vizitku
    const sr = $('[data-stage]')?.getBoundingClientRect() || { top: 0, bottom: vh };
    side = 'top'; x = t.left + t.width / 2 - bw / 2; y = t.top + t.height + gap;
    if (y + bh > Math.min(vh, sr.bottom) - 8) { side = 'bottom'; y = t.top - bh - gap; }
    if (side === 'bottom' && y < sr.top + 8) {
      if (t.left - bw - gap >= 10) { side = 'right'; x = t.left - bw - gap; y = Math.max(sr.top + 8, t.top + t.height / 2 - bh / 2); }
      else { side = 'none'; y = Math.min(vh, sr.bottom) - bh - 8; x = t.left + 8; }
    }
  }
  else { side = 'bottom'; x = (tour.i === 1 ? vw / 2 : t.left + t.width / 2) - bw / 2; y = t.top - bh - gap; }
  x = Math.max(10, Math.min(vw - bw - 10, x)); y = Math.max(10, Math.min(vh - bh - 10, y));
  el.style.left = x + 'px'; el.style.top = y + 'px'; el.dataset.side = side;
  const ax = side === 'left' || side === 'right' || side === 'none' ? 0 : Math.max(18, Math.min(bw - 18, (tour.i === 1 && isPhone() ? vw / 2 : t.left + t.width / 2) - x));
  el.style.setProperty('--ax', ax + 'px');
}
function tourGo(i) {
  if (i >= tour.steps.length) { coachDone(); return; }
  tour.i = i; const [h, p] = tour.steps[i], el = tour.el;
  $('[data-tour-n]', el).textContent = `${i + 1} / ${tour.steps.length}`;
  $('[data-tour-h]', el).textContent = h; $('[data-tour-p]', el).textContent = p;
  const nx = $('[data-tour-next]', el); nx.textContent = i === tour.steps.length - 1 ? nx.dataset.lDone : nx.dataset.lNext;
  el.hidden = false; el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in');
  requestAnimationFrame(tourPlace);
}
function coachShow() {
  if (st.step !== 'edit' || !tour.steps.length) return;
  try { if (localStorage.getItem(COACH)) return; } catch (e) { return; }
  tourGo(0);
}
// interakcia s vizitkou počas 1. kroku = pochopené, ideme ďalej
function coachDone(adv) {
  if (tour.i < 0) return;
  if (adv === 'interact') { if (tour.i === 0) tourGo(1); return; }
  tour.i = -1; tour.el.hidden = true; try { localStorage.setItem(COACH, '1'); } catch (e) { /* nič */ }
}
$('[data-tour-next]').addEventListener('click', () => tourGo(tour.i + 1));
$('[data-tour-skip]').addEventListener('click', () => coachDone());
addEventListener('resize', () => requestAnimationFrame(tourPlace));
// mimo editora prehliadka zmizne; kto otvorí panel nástrojov, krok 2 už pochopil
document.addEventListener('vk:step', () => { if (st.step !== 'edit' && tour.i >= 0) coachDone(); });
tabs.forEach((t) => t.addEventListener('click', () => { if (tour.i < 0) return; if (isPhone()) coachDone(); else if (tour.i <= 1) tourGo(2); }));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tour.i >= 0) coachDone(); });


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
const SCENE_LIST = ['travertin', 'len', 'mramor', 'dub', 'beton', 'tien', 'saten', 'kraft', 'terakota'];
const v4 = { view: 'photo', scene: null, f: null, b: null, pf: null, pb: null, cache: new Map(), tok: 0, pf4: null };
async function enterOrder() {
  if (!st.loaded) return;
  paintOrder();
  const d = ed.printable();
  $('[data-view-busy]').hidden = false;
  const [f, b] = await Promise.all([snapshot(d, 'front', 1000, 'image/jpeg', 0.85), snapshot(d, 'back', 1000, 'image/jpeg', 0.85)]);
  Object.assign(v4, { f, b, pf: await photo(f), pb: await photo(b) }); v4.cache.clear();
  $('[data-thumb-front]').src = f; $('[data-thumb-back]').src = b;
  paintScenes();
  showView(v4.view);
  runPreflight(d);
  if (scene) { await scene.setTexture(0, 'front', f); await scene.setTexture(0, 'back', b); paint3D(); }
}
function paintScenes() {
  const box = $('[data-scenes]');
  box.innerHTML = `<span>${tr('Podklad', 'Podklad')}</span>` + SCENE_LIST.map((k) => `<button data-scene="${k}" class="${v4.scene === k ? 'on' : ''}" style="background-image:url(${VK.root}assets/scenes/${k}.jpg)" aria-label="${k}"></button>`).join('');
  box.hidden = v4.view === '3d';
}
async function viewImg(v) {
  const key = v + '|' + (v4.scene || '');
  if (!v4.cache.has(key)) {
    const o = { width: 1400, ratio: 0.75, scene: v4.scene || undefined, seed: 1, quality: 0.88 };
    v4.cache.set(key, v === 'photo' ? mockup(v4.pf, v4.pb, o) : mockup(v === 'front' ? v4.pf : v4.pb, null, { ...o, single: true, tiltF: -2 }));
  }
  return v4.cache.get(key);
}
async function showView(v) {
  v4.view = v; const tok = ++v4.tok;
  $$('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  const img = $('[data-view-img]'), box3 = $('[data-3d]');
  $('[data-scenes]').hidden = v === '3d';
  if (v === '3d') { img.hidden = true; box3.hidden = false; $('[data-view-busy]').hidden = true; await init3D(); return; }
  box3.hidden = true; img.hidden = false;
  if (!v4.pf) return;
  $('[data-view-busy]').hidden = false;
  const u = await viewImg(v);
  if (tok !== v4.tok) return;
  img.classList.remove('in'); img.src = u; void img.offsetWidth; img.classList.add('in');
  $('[data-view-busy]').hidden = true;
}
$('[data-views]').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) showView(b.dataset.view); });
$('[data-scenes]').addEventListener('click', (e) => { const b = e.target.closest('[data-scene]'); if (!b) return; v4.scene = v4.scene === b.dataset.scene ? null : b.dataset.scene; paintScenes(); showView(v4.view === '3d' ? 'photo' : v4.view); });
async function init3D() {
  const S = SIZES[st.cfg.size], key = S.w + 'x' + S.h;
  const { cardScene } = await import('./three-cards.js');
  if (!scene || sceneKey !== key) {
    scene?.dispose(); $('[data-3d]').querySelectorAll('canvas').forEach((c) => c.remove());
    scene = await cardScene($('[data-3d]'), [{ front: v4.f, back: v4.b, w: S.w, h: S.h, pos: [0, 0, 0], rot: [-0.25, -0.45, 0.05], finish: finishOf(), thick: st.cfg.paper === 'triplex' ? 2.2 : 0.7, edge: st.cfg.paper === 'triplex' ? '#FF6B4A' : '#EDE8DE' }], { camZ: 205, fov: 30, shadow: false, drag: true, float: false, parallaxAmt: 0.1, fit: 150 });
    sceneKey = key;
  }
}
// kontrola pred tlačou
async function runPreflight(d) {
  $('[data-pf-sum]').textContent = tr('kontrolujem…', 'kontroluji…'); $('[data-pf]').classList.remove('ok', 'warn');
  try { v4.pf4 = { r: await inspect(d), d }; } catch (e) { console.warn(e); v4.pf4 = null; }
  paintPreflight();
}
function paintPreflight() {
  if (!v4.pf4) { $('[data-pf]').hidden = true; return; }
  $('[data-pf]').hidden = false;
  const { r, d } = v4.pf4, f = d.f || {}, L = [];
  const ok = (t) => L.push({ ok: true, t }), warn = (t, fix, label) => L.push({ ok: false, t, fix, label });
  if (f.name && f.name.trim()) ok(tr('Meno je vyplnené', 'Jméno je vyplněné')); else warn(tr('Chýba meno', 'Chybí jméno'), 'field:name', tr('Doplniť', 'Doplnit'));
  const SAMPLE = /(605|905) 123 456|@hruskastudio\.|hruskastudio\./;
  const sample = ['phone', 'email', 'web'].filter((k) => SAMPLE.test(f[k] || ''));
  if (sample.length) warn(tr('Na vizitke sú ešte ukážkové kontakty (telefón alebo e-mail). Prepíšte ich na svoje.', 'Na vizitce jsou ještě ukázkové kontakty (telefon nebo e-mail). Přepište je na své.'), 'field:' + sample[0], tr('Prepísať', 'Přepsat'));
  if ((f.phone || '').trim() || (f.email || '').trim()) ok(tr('Je tam telefón alebo e-mail', 'Je tam telefon nebo e-mail')); else warn(tr('Nie je tam telefón ani e-mail', 'Není tam telefon ani e-mail'), 'field:phone', tr('Doplniť', 'Doplnit'));
  if (r.small.length) { const m = r.small.reduce((a, b) => (a.pt < b.pt ? a : b)); warn(tr(`Veľmi malé písmo (${m.pt.toFixed(1)} pt): „${m.text}“. Na papieri sa zle číta.`, `Velmi malé písmo (${m.pt.toFixed(1)} pt): „${m.text}“. Na papíře se špatně čte.`), 'obj:' + (m.side || '') + ':' + m.text, tr('Ukázať', 'Ukázat')); }
  else ok(tr('Písmo je dosť veľké na tlač', 'Písmo je dost velké pro tisk'));
  if (r.edge.length) warn(tr(`„${r.edge[0].text}“ je príliš blízko okraja, pri orezaní sa môže odrezať.`, `„${r.edge[0].text}“ je moc blízko okraje, při ořezu se může useknout.`), 'obj:' + (r.edge[0].side || '') + ':' + r.edge[0].text, tr('Ukázať', 'Ukázat'));
  else ok(tr('Texty sú v bezpečnej zóne', 'Texty jsou v bezpečné zóně'));
  if (r.lowres.length) warn(tr(`Logo alebo fotka má nízke rozlíšenie (${r.lowres[0].dpi} dpi), môže byť rozmazané.`, `Logo nebo fotka má nízké rozlišení (${r.lowres[0].dpi} dpi), může být rozmazané.`), 'tab:logo', tr('Vymeniť', 'Vyměnit'));
  const pal = d.pal || PALETTES[TEMPLATES[d.tpl]?.pal];
  if (pal && contrast(pal.bg, pal.ink) < 3) warn(tr('Text a pozadie majú slabý kontrast.', 'Text a pozadí mají slabý kontrast.'), 'tab:styl', tr('Zmeniť farby', 'Změnit barvy'));
  if (r.qr && st.cfg.kind === 'print') warn(tr('QR kód vedie na digitálnu vizitku, ktorá nie je v objednávke.', 'QR kód vede na digitální vizitku, která není v objednávce.'), 'bundle', tr('Pridať zadarmo', 'Přidat zdarma'));
  else if (r.qr) ok(tr(`QR vedie na vizitkomat.eu/v/${d.slug}`, `QR vede na vizitkomat.eu/v/${d.slug}`));
  ok(tr('Spadávka 2 mm, PDF 600 dpi', 'Spadávka 2 mm, PDF 600 dpi'));
  const bad = L.filter((x) => !x.ok).length;
  $('[data-pf]').classList.toggle('ok', !bad); $('[data-pf]').classList.toggle('warn', !!bad);
  $('[data-pf-sum]').textContent = bad ? tr(`${bad} na kontrolu`, `${bad} ke kontrole`) : tr('všetko v poriadku', 'vše v pořádku');
  $('[data-pf-list]').innerHTML = L.sort((a, b) => a.ok - b.ok).map((x) => `<li class="${x.ok ? 'ok' : 'warn'}"><i>${x.ok ? '✓' : '!'}</i><span>${esc(x.t)}</span>${x.fix ? `<button data-pf-fix="${x.fix}">${esc(x.label)}</button>` : ''}</li>`).join('');
}
$('[data-pf-list]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pf-fix]'); if (!b) return;
  const fx = b.dataset.pfFix;
  if (fx === 'bundle') { st.cfg.kind = 'bundle'; paintOrder(); persist(); paintPreflight(); toast(tr('Digitálna vizitka je pridaná zadarmo.', 'Digitální vizitka je přidaná zdarma.')); return; }
  go('edit');
  // oprava jedným klikom: rovno na správne pole, záložku alebo prvok vo vizitke
  const [kind, a, ...rest] = fx.split(':');
  setTimeout(async () => {
    if (kind === 'field') { openTab('udaje'); const i = $(`[data-f="${a}"]`); if (i) { i.closest('.fld').classList.add('is-sample'); i.scrollIntoView({ block: 'center', behavior: 'smooth' }); i.focus(); i.select(); } }
    else if (kind === 'tab') openTab(a);
    else if (kind === 'obj') { if (a && a !== ed.side) { await ed.setSide(a); paintSides(); } if (ed.selectByText(rest.join(':'))) toast(tr('Prvok je označený, zväčšite ho alebo posuňte.', 'Prvek je označený, zvětšete ho nebo posuňte.')); }
  }, 350);
});
function paint3D() { if (!scene) return; scene.setFinish(0, finishOf()); scene.setThickness(0, st.cfg.paper === 'triplex' ? 2.2 : 0.7, st.cfg.paper === 'triplex' ? '#FF6B4A' : '#EDE8DE'); }
function paintOrder() {
  const P = VK.prices, c = st.cfg, dig = c.kind === 'digital';
  $('[data-print-opts]').style.display = dig ? 'none' : '';
  $$('[data-kind] .kind').forEach((b) => b.classList.toggle('on', b.dataset.v === c.kind));
  const t = tier();
  // Triplex sa nevyrába so zaoblenými rohmi; formáty s príplatkom ukážeme pri tlačidle
  if (t === 'triplex' && c.corners === 'round') { c.corners = 'straight'; ed.setCorners('straight'); }
  const rb = $('[data-o="corners"] [data-v="round"]'); if (rb) { rb.disabled = t === 'triplex'; rb.title = t === 'triplex' ? tr('Triplex len s rovnými rohmi', 'Triplex jen s rovnými rohy') : ''; }
  $$('[data-o="size"] button').forEach((b) => { const add = P.sizes?.[b.dataset.v]?.[String(c.qty)] || 0; b.dataset.label ||= b.textContent; b.innerHTML = b.dataset.label + (add ? `<small> +${money(add)}</small>` : ''); });
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
  // rozpis ceny: všetko z cenníka, nič skryté
  const q = String(c.qty), L = [];
  if (dig) L.push([tr('Digitálna vizitka, jednorazovo', 'Digitální vizitka, jednorázově'), money(P.digital)]);
  else {
    const PN = { matny: tr('matný 350 g', 'matný 350 g'), triplex: 'Triplex 720 g' };
    L.push([`${c.qty} ${tr('ks', 'ks')} · ${SIZES[c.size]?.label || ''} · ${PN[c.paper] || ''}`, money(P.papers[c.paper]?.[q] ?? 0)]);
    const fin = c.paper !== 'triplex' ? P.finishes[c.finish || 'none']?.[q] || 0 : 0;
    if (fin) L.push([{ soft: tr('Soft-touch laminácia', 'Soft-touch laminace'), matna: tr('Matná laminácia', 'Matná laminace'), leskla: tr('Lesklá laminácia', 'Lesklá laminace') }[c.finish] || '', '+ ' + money(fin)]);
    const sz = P.sizes?.[c.size]?.[q] || 0; if (sz) L.push([tr('Formát ', 'Formát ') + (SIZES[c.size]?.label || ''), '+ ' + money(sz)]);
    if (c.corners === 'round') L.push([tr('Zaoblené rohy', 'Zaoblené rohy'), '+ ' + money(P.round[q] || 0)]);
    if (c.express) L.push([tr('Expresná výroba', 'Expresní výroba'), '+ ' + money(P.express)]);
    if (c.kind === 'bundle') L.push([tr('Digitálna vizitka', 'Digitální vizitka'), tr('zadarmo', 'zdarma'), 'free']);
    L.push([tr('Doprava kuriérom DPD', 'Doprava kurýrem DPD'), tr('zadarmo', 'zdarma'), 'free']);
  }
  $('[data-sum-lines]').innerHTML = L.map(([a, b, cl]) => `<li${cl ? ` class="${cl}"` : ''}><span>${esc(a)}</span><b>${esc(b)}</b></li>`).join('');
  $('[data-obar-p]').textContent = money(total);
  $('[data-obar-m]').textContent = dig ? tr('digitálna vizitka', 'digitální vizitka') : `${c.qty} ${tr('ks', 'ks')} · ${tr('doprava zadarmo', 'doprava zdarma')}`;
  $('[data-sum-m]').textContent = dig ? tr('jednorazovo, bez predplatného', 'jednorázově, bez předplatného') : `${c.qty} ${tr('ks', 'ks')} · ${money(total / c.qty, { decimals: 2 })} / ${tr('ks', 'ks')}${c.kind === 'bundle' ? ' · ' + tr('+ digitálna zadarmo', '+ digitální zdarma') : ''}`;
  const now = new Date();
  $('[data-sum-d]').textContent = dig ? tr('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.') : `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + deliveryDays(c.express)))}`;
}
$('[data-kind]').addEventListener('click', (e) => { const b = e.target.closest('.kind'); if (!b) return; st.cfg.kind = b.dataset.v; paintOrder(); persist(); paintPreflight(); });
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
// mobil: lišta s cenou a tlačidlom, kým nie je vidieť súhrn
$('[data-obar-go]').addEventListener('click', () => $('[data-add-cart]').click());
new IntersectionObserver((es) => { $('[data-obar]').classList.toggle('is-off', es[0].isIntersecting); }, { rootMargin: '0px 0px -40px 0px' }).observe($('.sum'));
// náhľady nechceme ponúkať na stiahnutie (tlačové dáta dostane len naša tlačiareň)
document.addEventListener('contextmenu', (e) => { if (e.target.closest('.st4, [data-save-dlg], .ed-canvas, canvas')) e.preventDefault(); });
document.addEventListener('dragstart', (e) => { if (e.target.tagName === 'IMG' && e.target.closest('.st4')) e.preventDefault(); });
$('[data-add-cart]').addEventListener('click', async (e) => {
  const b = e.currentTarget; b.disabled = true;
  const d = ed.printable();
  const [front, back] = await Promise.all([snapshot(d, 'front', 640, 'image/jpeg'), snapshot(d, 'back', 640, 'image/jpeg')]);
  await store.cartAdd({ kind: st.cfg.kind, config: { ...st.cfg }, design: d, thumb: front, thumbBack: back, title: d.f.name || tr('Vizitka', 'Vizitka') });
  VK.ev?.('add_cart', true);
  location.href = VK.links.kosik;
});

/* =========================================================
   ULOŽIŤ NA NESKÔR (odkaz e-mailom)
   ========================================================= */
const sdlg = $('[data-save-dlg]'), sform = $('[data-save-form]');
// po ~2,5 min v editore jemne ponúkneme uloženie odkazu (raz za návštevu, dá sa zavrieť)
(() => {
  const el = $('[data-nudge]'); if (!el) return;
  let spent = 0, done = false;
  try { done = sessionStorage.getItem('vk2-nudge') === '1' || !!localStorage.getItem('vk2-draft-id'); } catch (x) { /* nič */ }
  const hide = () => { el.hidden = true; done = true; try { sessionStorage.setItem('vk2-nudge', '1'); } catch (x) { /* nič */ } };
  const t = setInterval(() => {
    if (done) { clearInterval(t); return; }
    if (st.step === 'edit' && !document.hidden && !$('[data-save-dlg]')?.open) spent += 5;
    if (spent >= 150) { el.hidden = false; clearInterval(t); }
  }, 5000);
  $('[data-nudge-x]').addEventListener('click', hide);
  el.querySelector('[data-save-open]').addEventListener('click', hide);
  document.addEventListener('vk:step', () => { if (st.step !== 'edit') el.hidden = true; });
})();
$$('[data-save-open]').forEach((b) => b.addEventListener('click', async () => {
  if (!st.loaded) return;
  sform.hidden = false; $('[data-save-ok]').hidden = true; $('[data-save-err]').hidden = true;
  try { const c = JSON.parse(localStorage.getItem('vk2-checkout') || 'null'); if (c?.email && !sform.email.value) sform.email.value = c.email; } catch (e) { /* nič */ }
  if (!sform.email.value && ed.design.f.email && ed.design.f.email !== DEFAULT_FIELDS.email) sform.email.value = ed.design.f.email;
  sdlg.showModal();
  $('[data-save-img]').src = await snapshot(ed.printable(), 'front', 720, 'image/jpeg', 0.86);
}));
$$('[data-save-x]').forEach((b) => b.addEventListener('click', () => sdlg.close()));
sdlg.addEventListener('click', (e) => { if (e.target === sdlg) sdlg.close(); });
sform.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = sform.email.value.trim(), err = $('[data-save-err]');
  if (!/^\S+@\S+\.\S+$/.test(email)) { err.hidden = false; err.textContent = tr('Skontrolujte e-mail.', 'Zkontrolujte e-mail.'); sform.email.focus(); return; }
  const go = $('[data-save-go]'); go.disabled = true;
  try {
    const state = { ...ed.export(), cfg: st.cfg, slugTouched: st.slugTouched, touched: [...st.touched] };
    const thumb = await snapshot(ed.printable(), 'front', 520, 'image/jpeg', 0.8);
    const r = await fetch(API + '/draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, lang: VK.lang, state, thumb }) });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    try { localStorage.setItem('vk2-draft-id', j.id); } catch (x) { /* nič */ }
    VK.ev?.('draft_saved', true);
    sform.hidden = true; $('[data-save-ok]').hidden = false;
    $('[data-save-to]').textContent = tr(`Poslali sme ho na ${email}. Ak nepríde do pár minút, pozrite sa do priečinka Hromadné alebo Spam.`, `Poslali jsme ho na ${email}. Pokud nepřijde do pár minut, podívejte se do složky Hromadné nebo Spam.`);
  } catch (x) { err.hidden = false; err.textContent = tr('Nepodarilo sa odoslať. Skúste to o chvíľu znova.', 'Nepodařilo se odeslat. Zkuste to za chvíli znovu.'); }
  finally { go.disabled = false; }
});

/* =========================================================
   UKLADANIE A ŠTART
   ========================================================= */
const persist = debounce(async () => {
  if (!ed || !st.loaded) return;
  try { await store.set(SAVE, { ...ed.export(), cfg: st.cfg, slugTouched: st.slugTouched, touched: [...st.touched] }); savedState('saved'); } catch (e) { savedState('saved'); }
}, 700);

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
  // návrat z e-mailu „uložiť na neskôr“
  const nid = params.get('navrh');
  if (nid && /^[a-z2-9]{9}$/.test(nid)) {
    try {
      const r = await fetch(`${API}/draft/${nid}`); if (!r.ok) throw new Error(r.status);
      const { state: s } = await r.json();
      st.cfg = { ...st.cfg, ...s.cfg }; st.slugTouched = !!s.slugTouched; (s.touched || []).forEach((k) => st.touched.add(k));
      st.reached.add('choose');
      await loadDesign(s.d, s.sides, s.custom); go('edit');
      toast(tr('Vitajte späť, vizitka je presne tak, ako ste ju nechali.', 'Vítejte zpět, vizitka je přesně tak, jak jste ji nechali.'));
      history.replaceState(null, '', location.pathname);
      return;
    } catch (e) { toast(tr('Uložený návrh sme nenašli, platí 90 dní.', 'Uložený návrh jsme nenašli, platí 90 dní.')); }
  }
  if (params.get('pokracovat') && st.saved?.d) { $('[data-resume-go]').click(); return; }
  const rez = params.get('rezim');
  // z odborových stránok: ?odbor=beauty predvyberie filter, ?sablona=kytice otvorí šablónu rovno v editore
  const odbor = params.get('odbor');
  if (odbor && IND[odbor]) $$('[data-ind] button').forEach((x) => x.classList.toggle('on', x.dataset.i === odbor));
  const sab = params.get('sablona');
  if (sab && TEMPLATES[sab]) {
    const pf = personaFor(sab); st.mode = 'tpl';
    await loadDesign(newDesign({ tpl: sab, ...templateDefaults(sab), f: pf.f, emblem: pf.emblem }));
    st.mode = 'tpl'; st.reached.add('choose'); go('edit');
    toast(tr('Prepíšte ukážkové údaje na svoje, stačí kliknúť do vizitky.', 'Přepište ukázkové údaje na své, stačí kliknout do vizitky.'));
    return;
  }
  if (rez === 'ai' && params.get('prompt')) runAI(params.get('prompt'));
  else if (rez === 'sablony') showTemplates();
  else if (rez === 'logo') { await loadDesign(newDesign({ tpl: 'swiss', ...templateDefaults('swiss') })); st.reached.add('choose'); openTab('logo'); go('edit'); toast(tr('Nahrajte logo, farby vizitky sa mu prispôsobia.', 'Nahrajte logo, barvy vizitky se mu přizpůsobí.')); }
  else if (meno) { st.touched.add('name'); await loadDesign(newDesign({ tpl: 'editorial', ...templateDefaults('editorial'), f: { ...DEFAULT_FIELDS, name: meno } })); st.reached.add('choose'); go('edit'); }
  else if (rez === 'ai') setTimeout(() => $('[data-ask-start-in]').focus(), 300);
})();

/* =========================================================
   Digitálna vizitka: živý náhľad v telefóne pri vypĺňaní
   ========================================================= */
{
  const box = $('[data-dgp]'), host = $('[data-dgp-host]'), det = $('[data-digital-fields]');
  const wide = matchMedia('(min-width: 1100px)');
  document.body.append(box); // fixný panel mimo animovaných krokov sprievodcu
  let open = false, hooked = false, faces = null, facesKey = '', userClosed = false;
  const facesFor = async () => {
    const d = ed.printable(), key = JSON.stringify([d.tpl, d.pal, d.fonts, d.f, d.logo, d.size, d.sides && d.sides.length]);
    if (faces && key === facesKey) return faces;
    const [front, back] = await Promise.all([snapshot(d, 'front', 900, 'image/jpeg', 0.86), snapshot(d, 'back', 900, 'image/jpeg', 0.86)]);
    facesKey = key; faces = { front, back }; return faces;
  };
  let tok = 0;
  const paint = async () => {
    if (!open || !ed) return;
    const my = ++tok;
    const { renderDigital } = await import('./digital.js');
    let fc = faces;
    try { fc = await facesFor(); } catch (e) { /* náhľad aj bez obrázka vizitky */ }
    if (my !== tok || !open) return;
    const top = host.scrollTop;
    const d = { ...ed.design, digital: { ...(ed.design.digital || {}) } };
    renderDigital(host, d, { url: qrFor(d.slug), qr: (u) => qrSVG(u), front: fc?.front || null, back: fc?.back || null, static: false });
    host.scrollTop = top;
  };
  const schedule = debounce(paint, 380);
  const show = () => {
    if (!ed) return;
    if (!hooked) { ed.on('change', () => open && schedule()); ed.on('fields', () => open && schedule()); hooked = true; }
    open = true; box.hidden = false; requestAnimationFrame(() => box.classList.add('on'));
    document.documentElement.classList.toggle('dgp-lock', !wide.matches);
    paint();
  };
  const hide = () => { open = false; box.classList.remove('on'); document.documentElement.classList.remove('dgp-lock'); setTimeout(() => { if (!open) box.hidden = true; }, 260); };
  $('[data-dgp-open]').addEventListener('click', () => { userClosed = false; show(); });
  $('[data-dgp-close]').addEventListener('click', () => { userClosed = true; hide(); });
  // na širokej obrazovke sa náhľad otvorí sám s rozbalením časti „Digitálna vizitka“
  det.addEventListener('toggle', () => { if (det.open && wide.matches && !userClosed) show(); else if (!det.open) hide(); });
  // zmeny polí, paliet a písma
  $('.ed-side').addEventListener('input', () => open && schedule());
  $('.ed-side').addEventListener('click', (e) => { if (open && e.target.closest('[data-pal], [data-font], [data-photo-del]')) setTimeout(schedule, 250); });
  $('[data-photo-file]').addEventListener('change', () => open && setTimeout(schedule, 400));
  $$('[data-go]').forEach((li) => li.addEventListener('click', () => open && hide()));
  $('[data-to-order]').addEventListener('click', () => open && hide());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open && !wide.matches) hide(); });
}
