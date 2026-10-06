// Homepage – automat, štyri cesty, papier + telefón, materiály, kalkulačka
import * as E from './card-engine.js';
import { suggest, suggestLocal, PRESETS } from './ai-engine.js';
import { analyzeLogo, demoLogoSVG } from './logo.js';
import { renderDigital } from './digital-card.js';
import { $, $$, T, VK, money, printPrice, addWorkdays, fmtDay, session, qrSVG, absUrl, debounce } from './util.js';

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const DEMO_URL = absUrl(VK.links.demo || 'v/demo/');
const base = E.newDesign({ qrUrl: DEMO_URL });

function sizeCanvas(c) { return Math.round((c.clientWidth || 600) * DPR); }
async function draw(c, d, side = 'front', opts = {}) {
  await E.prepare(d);
  E.render(c, d, side, { width: sizeCanvas(c), ...opts });
}
const fresh = (over = {}) => {
  const d = E.newDesign({ ...over, qrUrl: DEMO_URL });
  d.f = { ...base.f, ...(over.f || {}) };
  return d;
};

/* =========================================================
   AUTOMAT
   ========================================================= */
const machine = $('[data-machine]');
const mCard = $('[data-m-card]');
const read = $('[data-m-read]');
const led = $('[data-led]');
const nameInput = $('#hero-name');
const TPL_ORDER = ['editorial', 'linea', 'bigtype', 'monogram', 'swiss', 'arch', 'terminal', 'split', 'stamp', 'diagonal', 'signature', 'gradient', 'blueprint', 'corporate'];
let tplIdx = 0;
let hero = fresh({ tpl: 'editorial', ...E.templateDefaults('editorial') });
let heroSide = 'front';
let typer;

function say(text, instant = false) {
  clearInterval(typer);
  if (instant) { read.textContent = text; return; }
  let i = 0; read.textContent = '';
  typer = setInterval(() => { read.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(typer); }, 16);
}
function busy(ms = 600) { led.classList.add('busy'); setTimeout(() => led.classList.remove('busy'), ms); }
async function paintHero(anim = 'swap') {
  await draw(mCard, hero, heroSide);
  if (anim) { mCard.classList.remove('swap', 'flip'); void mCard.offsetWidth; mCard.classList.add(anim); }
}
function pressKey(btn) { btn.classList.add('press'); setTimeout(() => btn.classList.remove('press'), 140); }

const heroName = () => nameInput.value.trim();
nameInput?.addEventListener('input', debounce(() => {
  const n = heroName();
  hero.f.name = n || base.f.name;
  if (n) { hero.f.email = ''; hero.f.web = ''; }
  else { hero.f.email = base.f.email; hero.f.web = base.f.web; }
  heroSide = 'front';
  paintHero(null);
  say(n ? T('SADZÍM: ', 'SÁZÍM: ') + n.toLocaleUpperCase(VK.lang === 'cz' ? 'cs' : 'sk') : T('PRIPRAVENÝ · NAPÍŠTE SVOJE MENO', 'PŘIPRAVEN · NAPIŠTE SVÉ JMÉNO'), true);
}, 40));

$$('[data-key]').forEach((btn) => btn.addEventListener('click', async () => {
  pressKey(btn); busy();
  const k = btn.dataset.key;
  if (k !== 'side') { $$('[data-key]').forEach((b) => b.classList.toggle('is-on', b === btn)); }
  if (k === 'tpl') {
    tplIdx = (tplIdx + 1) % TPL_ORDER.length;
    const id = TPL_ORDER[tplIdx];
    hero = { ...hero, tpl: id, ...E.templateDefaults(id), back: 'auto' };
    heroSide = 'front';
    say(`${T('ŠABLÓNA', 'ŠABLONA')} ${String(tplIdx + 1).padStart(2, '0')}/${TPL_ORDER.length} · ${E.TEMPLATES[id].name.toLocaleUpperCase('sk')}`);
    paintHero();
  } else if (k === 'ai') {
    const keys = Object.keys(PRESETS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const prompt = PRESETS[key][VK.lang === 'cz' ? 'cz' : 'sk'];
    say('„' + prompt.replace(/^(Som|Jsem) [^,]+, /, '') + '“');
    const r = suggestLocal(prompt, {}, 3);
    const pickD = r.designs[0];
    const n = heroName();
    hero = { ...pickD, qrUrl: DEMO_URL, f: { ...pickD.f, ...(n ? { name: n } : {}) } };
    heroSide = 'front';
    setTimeout(() => paintHero(), 700);
  } else if (k === 'logo') {
    $('[data-logo-input]').click();
  } else if (k === 'side') {
    heroSide = heroSide === 'front' ? 'back' : 'front';
    say(heroSide === 'back' ? T('ZADNÁ STRANA', 'ZADNÍ STRANA') : T('PREDNÁ STRANA', 'PŘEDNÍ STRANA'));
    mCard.classList.remove('swap', 'flip'); void mCard.offsetWidth; mCard.classList.add('flip');
    setTimeout(() => draw(mCard, hero, heroSide), 330);
  }
}));

$('[data-logo-input]')?.addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  say(T('ČÍTAM FARBY Z LOGA…', 'ČTU BARVY Z LOGA…')); busy(1200);
  const r = await analyzeLogo(file);
  hero = { ...hero, logo: r.src, pal: { ...r.palette }, tpl: 'corporate', ...{ fonts: 'swiss' } };
  heroSide = 'front';
  say(T('FARBY ZNAČKY: ', 'BARVY ZNAČKY: ') + r.colors.slice(0, 3).join(' '));
  paintHero();
});

$('[data-print]')?.addEventListener('click', async (e) => {
  pressKey(e.currentTarget); busy(2200);
  const out = $('[data-out]'), img = $('[data-out-img]');
  img.src = await E.snapshot(hero, 'front', 900);
  $('.hero__machine').classList.add('has-out');
  $('[data-m-next]').hidden = false;
  out.classList.remove('printing'); void out.offsetWidth; out.classList.add('printing');
  say(T('TLAČÍM… 350 g/m² · CMYK', 'TISKNU… 350 g/m² · CMYK'));
  setTimeout(() => say(T('HOTOVO · DOTVORTE SI JU', 'HOTOVO · DOTVOŘTE SI JI')), 2300);
  session('vk-draft', hero);
});
$('[data-m-next]')?.addEventListener('click', () => session('vk-draft', hero));

// meno z formulárov → generátor
$$('[data-namebox]').forEach((form) => form.addEventListener('submit', (e) => {
  e.preventDefault();
  const n = form.querySelector('input').value.trim();
  const d = form.closest('.hero') ? hero : fresh();
  if (n) { d.f.name = n; }
  session('vk-draft', d);
  location.href = form.action + (n ? '?meno=' + encodeURIComponent(n) : '');
}));

/* =========================================================
   ŠTYRI CESTY
   ========================================================= */
const panels = $$('[data-panel]');
const ways = $$('[data-way]');
let activeWay = -1;
const started = new Set();
function setWay(i) {
  if (i === activeWay) return;
  activeWay = i;
  panels.forEach((p) => p.classList.toggle('is-on', +p.dataset.panel === i));
  ways.forEach((w) => w.classList.toggle('is-on', +w.dataset.way === i));
  $('[data-stage-num]').textContent = String(i + 1).padStart(2, '0');
  $('[data-stage-bar]').style.width = ((i + 1) / 4) * 100 + '%';
  if (!started.has(i)) { started.add(i); [startGen, startAI, startLogo, startFile][i](); }
}
const wayIO = new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) setWay(+e.target.dataset.way); });
}, { rootMargin: '-45% 0px -45% 0px' });
ways.forEach((w) => wayIO.observe(w));
ways.forEach((w) => w.addEventListener('mouseenter', () => { if (matchMedia('(min-width: 901px)').matches) setWay(+w.dataset.way); }));
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { setWay(0); o.disconnect(); } }, { rootMargin: '0px 0px -30% 0px' }).observe($('.ways'));

// 01 generátor
let genD = fresh({ tpl: 'editorial', ...E.templateDefaults('editorial') });
async function startGen() {
  const c = $('[data-gen-card]'), box = $('[data-gen-thumbs]');
  await draw(c, genD);
  const ids = ['editorial', 'linea', 'arch', 'bigtype', 'swiss', 'stamp', 'terminal'];
  for (const id of ids) {
    const d = fresh({ tpl: id, ...E.templateDefaults(id) });
    const b = document.createElement('button');
    b.setAttribute('aria-label', E.TEMPLATES[id].name);
    if (id === genD.tpl) b.classList.add('is-on');
    const im = new Image(); im.alt = ''; im.src = await E.snapshot(d, 'front', 260);
    b.append(im); box.append(b);
    b.addEventListener('click', async () => {
      $$('button', box).forEach((x) => x.classList.toggle('is-on', x === b));
      genD = d; await draw(c, genD);
      c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap');
    });
  }
  // automatické prepínanie, kým sa používateľ nedotkne
  let auto = 0, touched = false;
  box.addEventListener('pointerdown', () => { touched = true; }, { once: true });
  const timer = setInterval(() => {
    if (touched || activeWay !== 0) return;
    auto = (auto + 1) % ids.length; box.children[auto]?.click();
  }, 2600);
  window.addEventListener('pagehide', () => clearInterval(timer));
}

// 02 AI
const aiTyped = $('[data-ai-typed]'), aiReply = $('[data-ai-reply]'), aiFan = $('[data-ai-fan]');
async function runAI(prompt, typed = true) {
  aiFan.classList.remove('show');
  aiReply.hidden = true;
  if (typed) {
    aiTyped.textContent = '';
    for (const ch of prompt) { aiTyped.textContent += ch; await new Promise((r) => setTimeout(r, 22 + Math.random() * 30)); }
  } else aiTyped.textContent = prompt;
  aiReply.hidden = false;
  aiReply.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
  const r = await suggest(prompt, {}, 3);
  aiReply.innerHTML = `<b>AI grafik:</b> ${r.intro}`;
  aiFan.innerHTML = '';
  for (const d of r.designs.slice(0, 3)) {
    d.qrUrl = DEMO_URL;
    const b = document.createElement('button');
    b.title = d.why || '';
    const im = new Image(); im.alt = d.why || ''; im.src = await E.snapshot(d, 'front', 520);
    b.append(im); aiFan.append(b);
    b.addEventListener('click', () => { session('vk-draft', d); location.href = VK.links.tvorba + '?rezim=ai'; });
  }
  requestAnimationFrame(() => aiFan.classList.add('show'));
}
function startAI() {
  runAI(T('Mám kvetinárstvo v Žiline, chcem niečo jemné a prírodné.', 'Mám květinářství v Brně, chci něco jemného a přírodního.'));
}
$('[data-ai-form]')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('[data-ai-input]').value.trim();
  if (v) runAI(v, false);
});

// 03 logo
const lgDrop = $('[data-lg-drop]');
async function useLogo(src) {
  const r = await analyzeLogo(src);
  const img = $('[data-lg-img]'); img.src = r.src; lgDrop.classList.add('has');
  $('[data-lg-sw]').innerHTML = r.colors.slice(0, 4).map((c) => `<i style="--c:${c}" title="${c}"></i>`).join('');
  const box = $('[data-lg-cards]'); box.innerHTML = '';
  const combos = [['corporate', 0, 'swiss'], ['split', 1, 'bricolage'], ['linea', 2, 'bodoni']];
  for (const [tpl, pi, fonts] of combos) {
    const d = fresh({ tpl, fonts, pal: { ...r.palettes[pi] }, logo: r.src });
    const im = new Image(); im.alt = ''; im.src = await E.snapshot(d, 'front', 420);
    im.style.cursor = 'pointer';
    im.addEventListener('click', () => { session('vk-draft', d); location.href = VK.links.tvorba + '?rezim=logo'; });
    box.append(im);
  }
}
function startLogo() { useLogo(demoLogoSVG(VK.lang)); }
$('[data-lg-input]')?.addEventListener('change', (e) => { const f = e.target.files[0]; if (f) useLogo(f); });
['dragenter', 'dragover'].forEach((ev) => lgDrop?.addEventListener(ev, (e) => { e.preventDefault(); lgDrop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => lgDrop?.addEventListener(ev, (e) => { e.preventDefault(); lgDrop.classList.remove('over'); }));
lgDrop?.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) useLogo(f); });

// 04 súbor
async function startFile() {
  const c = $('[data-fl-card]');
  const d = fresh({ tpl: 'split', ...E.templateDefaults('split') });
  await E.prepare(d);
  E.render(c, d, 'front', { width: sizeCanvas(c), marks: true });
  $$('[data-fl-checks] li').forEach((li, i) => setTimeout(() => li.classList.add('ok'), 500 + i * 420));
}

/* =========================================================
   PAPIER + TELEFÓN
   ========================================================= */
let twinDone = false;
async function startTwin() {
  if (twinDone) return; twinDone = true;
  const d = fresh({ tpl: 'linea', ...E.templateDefaults('linea'), back: 'qr' });
  d.f = { ...d.f, name: 'Martin Kováč', role: T('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: T('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.') };
  await draw($('[data-twin-card]'), d, 'back');
  renderDigital($('[data-twin-phone]'), d, { url: DEMO_URL, qr: (u) => qrSVG(u) });
  $('[data-twin-qr]').innerHTML = qrSVG(DEMO_URL);
}
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { startTwin(); o.disconnect(); } }, { rootMargin: '300px' }).observe($('.twin'));

/* =========================================================
   MATERIÁLY – 3D karta
   ========================================================= */
const slab = $('[data-slab]'), slabCard = $('[data-slab-card]');
let slabDesign = fresh({ tpl: 'monogram', ...E.templateDefaults('monogram') });
async function paintSlab() {
  $('[data-slab-front]').src = await E.snapshot(slabDesign, 'front', 1100);
  $('[data-slab-back]').src = await E.snapshot(slabDesign, 'back', 1100);
}
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { paintSlab(); o.disconnect(); } }, { rootMargin: '400px' }).observe($('.paper'));

const SCALE = () => (slab.clientWidth / 90) * 2.4; // hrúbka zveličená, aby bola vidieť
function setMat(btn) {
  $$('[data-mat]').forEach((b) => { b.classList.toggle('is-on', b === btn); b.setAttribute('aria-selected', b === btn); });
  const mm = parseFloat(btn.dataset.thick);
  slab.style.setProperty('--t', Math.max(2, mm * SCALE()) + 'px');
  slab.style.setProperty('--core', btn.dataset.core || '#E9E2D3');
  slab.dataset.sheen = btn.dataset.sheen || '';
  const id = btn.dataset.mat;
  const pal = id === 'soft' ? E.PALETTES.noc : id === 'leskla' ? E.PALETTES.kobalt : id === 'triplex' ? E.PALETTES.papier : E.PALETTES.papier;
  const tpl = id === 'soft' ? 'linea' : id === 'leskla' ? 'diagonal' : id === 'triplex' ? 'editorial' : 'monogram';
  slabDesign = fresh({ tpl, fonts: E.TEMPLATES[tpl].fonts, pal: { ...pal } });
  paintSlab();
  const cap = $('[data-slab-caption]');
  cap.textContent = `${T('Hrúbka', 'Tloušťka')} ${String(mm).replace('.', ',')} mm · ${T('ťahom otočíte', 'tahem otočíte')}`;
  // malé natočenie, aby bolo vidieť hranu
  slabCard.style.setProperty('--rz', '-24deg');
  slabCard.style.setProperty('--ry', '0deg');
}
$$('[data-mat]').forEach((b) => b.addEventListener('click', () => setMat(b)));
if (slab) {
  slab.style.setProperty('--t', Math.max(2, 0.42 * SCALE()) + 'px');
  let sx = 0, sy = 0, ry = 0, rx = 56, drag = false;
  slab.addEventListener('pointerdown', (e) => { drag = true; sx = e.clientX; sy = e.clientY; slab.classList.add('dragging'); slab.setPointerCapture(e.pointerId); });
  slab.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    slabCard.style.setProperty('--ry', ry + dx * 0.5 + 'deg');
    slabCard.style.setProperty('--rx', Math.max(0, Math.min(80, rx - dy * 0.3)) + 'deg');
  });
  const end = (e) => {
    if (!drag) return; drag = false; slab.classList.remove('dragging');
    ry += (e.clientX - sx) * 0.5; rx = Math.max(0, Math.min(80, rx - (e.clientY - sy) * 0.3));
  };
  slab.addEventListener('pointerup', end); slab.addEventListener('pointercancel', end);
}

/* =========================================================
   PRE KOHO – plávajúci náhľad
   ========================================================= */
const float = $('[data-who-float]'), fc = float?.querySelector('canvas');
const whoCache = {};
let fx = 0, fy = 0, tx = 0, ty = 0, floatRAF = 0;
function floatLoop() {
  fx += (tx - fx) * 0.18; fy += (ty - fy) * 0.18;
  float.style.left = fx + 'px'; float.style.top = fy + 'px';
  if (Math.abs(tx - fx) > 0.5 || Math.abs(ty - fy) > 0.5) floatRAF = requestAnimationFrame(floatLoop); else floatRAF = 0;
}
$$('[data-who-key]').forEach((row) => {
  row.addEventListener('mouseenter', async (e) => {
    const key = row.dataset.whoKey;
    if (!whoCache[key]) {
      const r = suggestLocal(PRESETS[key][VK.lang === 'cz' ? 'cz' : 'sk'], {}, 1);
      whoCache[key] = r.designs[0];
    }
    tx = fx = e.clientX + 200; ty = fy = e.clientY;
    float.classList.add('on');
    await E.prepare(whoCache[key]);
    E.render(fc, whoCache[key], 'front', { width: 720 });
  });
  row.addEventListener('mousemove', (e) => { tx = e.clientX + 210; ty = e.clientY; if (!floatRAF) floatRAF = requestAnimationFrame(floatLoop); });
  row.addEventListener('mouseleave', () => float.classList.remove('on'));
  row.addEventListener('click', () => {
    const key = row.dataset.whoKey;
    const d = whoCache[key] || suggestLocal(PRESETS[key][VK.lang === 'cz' ? 'cz' : 'sk'], {}, 1).designs[0];
    session('vk-draft', d);
  });
});

/* =========================================================
   KALKULAČKA
   ========================================================= */
const calc = { paper: 'matny', finish: 'none', corners: 'straight', qty: 250 };
function paintCalc() {
  const P = VK.prices;
  const total = printPrice(calc, P);
  $('[data-c-price]').textContent = money(total);
  $('[data-c-per]').textContent = `${money(total / calc.qty, { decimals: 2 })} ${T('za kus', 'za kus')} · ${calc.qty} ${T('ks', 'ks')}`;
  $$('[data-c="finish"] button').forEach((b) => { b.disabled = calc.paper === 'triplex' && b.dataset.v !== 'none'; });
  const go = $('[data-c-go]');
  go.href = `${VK.links.tvorba}?papier=${calc.paper}&povrch=${calc.finish}&rohy=${calc.corners}&ks=${calc.qty}`;
}
$$('[data-c]').forEach((seg) => seg.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('button', seg).forEach((x) => x.classList.toggle('is-on', x === b));
  calc[seg.dataset.c] = seg.dataset.c === 'qty' ? +b.dataset.v : b.dataset.v;
  if (calc.paper === 'triplex' && calc.finish !== 'none') {
    calc.finish = 'none';
    $$('[data-c="finish"] button').forEach((x) => x.classList.toggle('is-on', x.dataset.v === 'none'));
  }
  paintCalc();
}));
paintCalc();

/* =========================================================
   PRIEBEH – dátumy
   ========================================================= */
(function flowDates() {
  const now = new Date();
  const late = now.getHours() >= 14;
  const check = addWorkdays(now, late ? 1 : 0);
  const printD = addWorkdays(check, 2);
  const arrive = addWorkdays(printD, 2);
  const els = $$('[data-flow]');
  if (els[1]) els[1].textContent = late ? fmtDay(check) : T('Dnes', 'Dnes');
  if (els[2]) els[2].textContent = fmtDay(printD);
  if (els[3]) els[3].textContent = fmtDay(arrive);
  const a = $('[data-flow-arrive]');
  const wdSk = ['v nedeľu', 'v pondelok', 'v utorok', 'v stredu', 'vo štvrtok', 'v piatok', 'v sobotu'];
  const wdCz = ['v neděli', 'v pondělí', 'v úterý', 've středu', 've čtvrtek', 'v pátek', 'v sobotu'];
  if (a) a.textContent = T(`${wdSk[arrive.getDay()]} sú u vás.`, `${wdCz[arrive.getDay()]} jsou u vás.`);
})();

/* =========================================================
   ZÁVEREČNÉ KARTY
   ========================================================= */
new IntersectionObserver(async (es, o) => {
  if (!es[0].isIntersecting) return; o.disconnect();
  const host = $('[data-final-cards]');
  const sets = [['bigtype', 'marhula', '8%', '14%', -14], ['linea', 'atrament', '34%', '30%', 6], ['arch', 'piesok', '4%', '56%', -4]];
  for (const [tpl, pal, l, t, r] of sets) {
    const d = fresh({ tpl, fonts: E.TEMPLATES[tpl].fonts, pal: { ...E.PALETTES[pal] } });
    const im = new Image(); im.alt = ''; im.src = await E.snapshot(d, 'front', 700);
    Object.assign(im.style, { left: l, top: t, transform: `rotate(${r}deg)` });
    host.append(im);
  }
}, { rootMargin: '300px' }).observe($('.final'));

/* =========================================================
   ŠTART
   ========================================================= */
(async function init() {
  const draft = session('vk-draft');
  if (draft && draft.f) { hero = { ...draft, qrUrl: DEMO_URL }; if (draft.f.name && draft.f.name !== base.f.name) nameInput.value = draft.f.name; }
  await document.fonts.ready;
  await paintHero(null);
  window.addEventListener('resize', debounce(() => { draw(mCard, hero, heroSide); }, 200));
})();
