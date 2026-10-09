// Homepage v2 (Pop)
import { newDesign, FONTS, PALETTES, SIZES, tr, CZ } from './model.js';
// ťažké moduly (šablóny, renderer, AI, digitálna vizitka) načítame až keď ich treba
const tplMod = () => import('./templates.js');
import { qrSVG, addWorkdays, fmtDay, session, absUrl, deliveryDays } from '../util.js';

const VK = window.VK;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const DEMO = absUrl(VK.links.demo);
// Fabric.js načítame až keď ho treba (AI naživo), stránka sa tak načíta rýchlejšie
let fabricP = null;
const loadFabric = () => fabricP ||= (window.fabric ? Promise.resolve() : new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js'; sc.onload = res; sc.onerror = rej; document.head.append(sc); }));
const lazy = (el, fn, margin = '400px') => { if (!el) return; const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin }); io.observe(el); };

/* ---------- hero: živá ukážka (zadanie → vizitka) ---------- */
const vis = $('[data-hero-vis]');
(function demo() {
  const box = $('[data-demo]'); if (!box) return;
  const cards = $$('.dk', box), N = cards.length;
  const typeEl = $('[data-demo-type]'), tagEl = $('[data-demo-tag]'), ai = $('[data-demo-ai]'), deck = $('[data-demo-deck]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, visible = true, paused = false;
  const GLOW = ['rgba(255, 170, 190, .6)', 'rgba(255, 196, 120, .55)', 'rgba(255, 220, 160, .5)', 'rgba(255, 120, 120, .45)', 'rgba(255, 210, 63, .55)', 'rgba(120, 230, 210, .5)'];
  const layout = () => cards.forEach((c, i) => { const pos = (i - cur + N) % N; c.dataset.pos = pos < 3 ? pos : 'x'; c.classList.toggle('on', pos === 0); c.tabIndex = pos === 0 ? 0 : -1; });
  layout(); ai.classList.add('done');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // ostatné vizitky načítame až po prvej (rýchlejšie zobrazenie stránky)
  const loadRest = () => $$('img[data-src]', box).forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
  if (document.readyState === 'complete') setTimeout(loadRest, 300); else addEventListener('load', () => setTimeout(loadRest, 300), { once: true });
  const active = () => visible && !paused && !document.hidden && !vis.classList.contains('running');
  async function step() {
    const next = (cur + 1) % N, c = cards[next], txt = c.dataset.p;
    ai.classList.remove('done');
    for (let k = 0; k <= txt.length; k++) { typeEl.textContent = txt.slice(0, k); await wait(k ? 26 + Math.random() * 34 : 350); }
    ai.classList.add('thinking'); await wait(1000); ai.classList.remove('thinking');
    c.style.transition = 'none'; c.dataset.pos = 'in'; void c.offsetWidth; c.style.transition = '';
    cur = next; layout(); tagEl.textContent = c.dataset.t; ai.classList.add('done');
    deck.style.setProperty('--glow', GLOW[next % GLOW.length]);
    c.classList.remove('mat'); deck.classList.remove('spark'); void c.offsetWidth; c.classList.add('mat'); deck.classList.add('spark'); setTimeout(() => { c.classList.remove('mat'); deck.classList.remove('spark'); }, 1500);
    await wait(3400);
  }
  if (!reduce) (async () => { await wait(2600); for (;;) { if (active()) await step(); else await wait(400); } })();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(box);
  const inp = $('[data-ai-in]');
  inp?.addEventListener('focus', () => { paused = true; });
  inp?.addEventListener('blur', () => { paused = !!inp.value; });
  // jemné natočenie balíčka podľa myši
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    let raf = 0;
    vis.addEventListener('pointermove', (e) => {
      const r = vis.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { deck.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); deck.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg'); });
    });
    vis.addEventListener('pointerleave', () => { deck.style.setProperty('--ry', '0deg'); deck.style.setProperty('--rx', '0deg'); });
  }
  // klik na vizitku = skutočná AI s týmto zadaním
  deck.addEventListener('click', (e) => { const c = e.target.closest('.dk'); if (!c) return; const p = c.dataset.p; if (inp) inp.value = p; heroAI(p); });
})();

/* ---------- hero: AI naživo ---------- */
const STEPS = [tr('Čítam zadanie…', 'Čtu zadání…'), tr('Vyberám rozloženie…', 'Vybírám rozložení…'), tr('Ladím farby a písmo…', 'Ladím barvy a písmo…'), tr('Píšem slogan…', 'Píšu slogan…'), tr('Kreslím grafiku…', 'Kreslím grafiku…')];
let designs = [], snapshot = null;
async function heroAI(prompt) {
  VK.ev?.('ai_submit');
  vis.classList.add('running');
  const run = $('[data-ai-run]'); run.hidden = false;
  $('[data-ai-load]').hidden = false; $('[data-ai-res]').hidden = true;
  let i = 0; $('[data-ai-step]').textContent = STEPS[0];
  const t = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); $('[data-ai-step]').textContent = STEPS[i]; }, 1300);
  if (matchMedia('(max-width: 1060px)').matches) vis.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await loadFabric().catch(() => {});
  const [{ askAI }, rmod] = await Promise.all([import('./ai.js'), import('./render.js')]); snapshot = rmod.snapshot;
  const r = await askAI(prompt, {}, { onArt: (idx, d) => { designs[idx] = d; paintOne(idx); } });
  clearInterval(t);
  designs = r.designs;
  $('[data-ai-intro]').textContent = r.intro;
  const grid = $('[data-ai-grid]'); grid.innerHTML = '';
  designs.forEach((d, idx) => { const b = document.createElement('button'); b.dataset.i = idx; b.innerHTML = `<img alt="">${d.artPending ? `<span class="pend">${tr('kreslím grafiku…', 'kreslím grafiku…')}</span>` : ''}`; grid.append(b); paintOne(idx); });
  $('[data-ai-load]').hidden = true; $('[data-ai-res]').hidden = false;
}
async function paintOne(i) {
  const b = $(`[data-ai-grid] [data-i="${i}"]`); if (!b) return;
  if (!designs[i].artPending) b.querySelector('.pend')?.remove();
  if (!snapshot) snapshot = (await import('./render.js')).snapshot;
  b.querySelector('img').src = await snapshot(designs[i], 'front', 820, 'image/jpeg', 0.9);
}
function openDesign(i) { const d = designs[i]; if (!d) return; session('vk2-draft', { ...d, why: undefined }); location.href = VK.links.tvorba + '?rezim=ai'; }
$('[data-ai-grid]').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) openDesign(+b.dataset.i); });
$('[data-ai-open]').addEventListener('click', (e) => { if (designs.length) { e.preventDefault(); openDesign(0); } });
$('[data-aibox]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-ai-in]').value.trim(); if (v.length > 2) heroAI(v); else $('[data-ai-in]').focus(); });
$$('[data-ai-chips] button').forEach((b) => b.addEventListener('click', () => { $('[data-ai-in]').value = b.dataset.p; heroAI(b.dataset.p); }));
$('[data-aibox-final]').addEventListener('submit', (e) => { e.preventDefault(); VK.ev?.('ai_submit'); const v = $('[data-final-in]').value.trim(); location.href = VK.links.tvorba + '?rezim=ai' + (v ? '&prompt=' + encodeURIComponent(v) : ''); });

/* ---------- kroky ---------- */
lazy($('.story'), () => {
  const now = new Date();
  $('[data-arrive]').textContent = new Intl.DateTimeFormat(CZ ? 'cs-CZ' : 'sk-SK', { weekday: 'long', day: 'numeric', month: 'numeric' }).format(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + deliveryDays(false)));
});

/* ---------- AI ukážky ---------- */
lazy($('.real'), async () => {
  const [data, { TEMPLATES }] = await Promise.all([fetch(VK.root + 'assets/ai/showcase.json').then((r) => r.json()).catch(() => []), tplMod()]);
  const tabs = $('[data-real-tabs]');
  const labels = { kvety: tr('Kvetinárstvo', 'Květinářství'), vino: tr('Vinárstvo', 'Vinařství'), it: tr('Programátor', 'Programátor') };
  const prompts = { kvety: tr('Mám kvetinárstvo Levanduľa v Nitre, chcem niečo jemné a prírodné.', 'Mám květinářství Levandule v Brně, chci něco jemného a přírodního.'), vino: tr('Rodinné vinárstvo pod Pezinkom, tradične a s nádychom luxusu.', 'Rodinné vinařství pod Pálavou, tradičně a s nádechem luxusu.'), it: tr('Programátor z Košíc, firma Bitlab, moderne, tmavo a hravo.', 'Programátor z Ostravy, firma Bitlab, moderně, tmavě a hravě.') };
  tabs.innerHTML = data.map((s, i) => `<button role="tab" data-real="${i}"${i ? '' : ' class="on"'}>${labels[s.key] || s.key}</button>`).join('');
  const DIRS = [tr('Klasický', 'Klasický'), tr('Moderný', 'Moderní'), tr('Kreatívny', 'Kreativní')];
  const SCENES = ['#2A3270', '#34306E', '#2B3A6B'];
  function show(i) {
    const s = data[i];
    $$('[data-real]').forEach((b) => b.classList.toggle('on', +b.dataset.real === i));
    $('[data-real-prompt]').textContent = prompts[s.key] || s.prompt;
    const box = $('[data-real-cards]'); box.innerHTML = '';
    s.concepts.forEach((c, j) => {
      const P = (side) => VK.pre[`show-${s.key}-${j}-${side}`] || '';
      const el = document.createElement('div'); el.className = 'real__card';
      el.innerHTML = `<div class="real__scene real__scene--photo"><img alt="" src="${VK.pre[`show-${s.key}-${j}-m`] || P('f')}"><span class="real__dir">${DIRS[j] || ''}</span></div><p><b>${TEMPLATES[c.template]?.name || ''}</b> · ${FONTS[c.fonts || TEMPLATES[c.template]?.fonts]?.label || ''}</p>`;
      box.append(el);
    });
  }
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-real]'); if (b) show(+b.dataset.real); });
  // prvý príklad je vinárstvo, kvetinárstvo už ukazuje príbeh vyššie
  if (data.length) show(Math.max(0, data.findIndex((x) => x.key === 'vino')));
});

/* ---------- šablóny ---------- */
lazy($('.tpls'), async () => {
  const [{ TEMPLATES }, { TPL_PERSONA, personaLabel }] = await Promise.all([tplMod(), import('./personas.js')]);
  // výber grafika ako prvý, potom ďalšie najlepšie (poradie z featured.js)
  const { ORDER } = await import('./featured.js');
  const ids = ORDER.filter((id) => TEMPLATES[id] && VK.pre['tpl-' + id + '-f']).slice(0, 24);
  const rows = [ids.filter((_, i) => i % 2 === 0), ids.filter((_, i) => i % 2 === 1)];
  const TILT = [-2.5, 1.8, -1.2, 2.6, -1.9, 1.1];
  for (const [ri, list] of rows.entries()) {
    const items = [...list, ...list];
    $(`[data-row="${ri}"]`).innerHTML = items.map((id, k) => {
      const t = TEMPLATES[id], f = VK.pre['tpl-' + id + '-f'] || '', b = VK.pre['tpl-' + id + '-b'] || '';
      const dup = k >= list.length ? ' aria-hidden="true" tabindex="-1"' : '';
      return `<a class="tc2" href="${VK.links.tvorba}?rezim=sablony" data-t="${id}" style="--r:${TILT[(k + ri * 3) % TILT.length]}deg"${dup}><span class="tc2__stack">${b ? `<img class="tc2__b" alt="" src="${b}" loading="lazy" decoding="async">` : ''}<img class="tc2__f" alt="${t.name}" src="${f}" loading="lazy" decoding="async"></span><span class="tc2__cap"><b>${t.name}</b><i>${personaLabel(TPL_PERSONA[id] || 'arch')}</i></span></a>`;
    }).join('');
  }
}, '600px');
$('[data-tpl-rows]')?.addEventListener('click', async (e) => {
  const a = e.target.closest('[data-t]'); if (!a) return;
  e.preventDefault(); VK.ev?.('tpl_click');
  const { templateDefaults } = await tplMod();
  session('vk2-draft', newDesign({ tpl: a.dataset.t, ...templateDefaults(a.dataset.t) }));
  location.href = VK.links.tvorba + '?rezim=texty';
});

/* ---------- digitál ---------- */
lazy($('.dig'), async () => {
  const [{ templateDefaults }, { renderDigital }] = await Promise.all([tplMod(), import('./digital.js')]);
  const d = newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold') });
  d.f = { ...d.f, name: tr('Martin Kováč', 'Martin Kovář'), role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: tr('martin@domovreality.sk', 'martin@domovreality.cz'), web: tr('domovreality.sk', 'domovreality.cz'), phone: tr('+421 905 123 456', '+420 605 123 456') };
  d.digital = { bio: tr('Pomáham rodinám predať byt za férovú cenu a bez stresu.', 'Pomáhám rodinám prodat byt za férovou cenu a bez stresu.'), services: tr('Predaj bytov\nOcenenie\nPrenájom', 'Prodej bytů\nOcenění\nPronájem') };
  renderDigital($('[data-dig-phone]'), d, { url: DEMO, qr: (u) => qrSVG(u), front: VK.pre['tpl-noirgold-f'], back: VK.pre['tpl-noirgold-b'] });
  $('[data-dig-qr]').innerHTML = qrSVG(DEMO);
});

/* ---------- príbeh: sticky scéna podľa kroku ---------- */
(function story() {
  const stage = $('[data-story-stage]'); if (!stage) return;
  const steps = $$('.story__steps li');
  const set = (n) => { stage.dataset.step = n; steps.forEach((li) => li.classList.toggle('on', li.dataset.s === n)); };
  set('1');
  let io;
  const mk = () => {
    io?.disconnect();
    // čiara aktivácie: v strede obrazovky, na mobile nižšie (scéna je hore)
    const m = matchMedia('(max-width: 900px)').matches ? '-64% 0px -34% 0px' : '-48% 0px -50% 0px';
    io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) set(e.target.dataset.s); }); }, { rootMargin: m });
    steps.forEach((li) => io.observe(li));
  };
  mk(); matchMedia('(max-width: 900px)').addEventListener('change', mk);
})();

/* ---------- papier: náklon za kurzorom ---------- */
if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $$('[data-tilt]').forEach((el) => {
    const card = $('.sw__card', el); let raf = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
        el.classList.add('tilt');
        card.style.setProperty('--tx', x.toFixed(3)); card.style.setProperty('--ty', y.toFixed(3));
        card.style.setProperty('--lx', (50 + x * 90).toFixed(1) + '%'); card.style.setProperty('--ly', (40 + y * 90).toFixed(1) + '%');
      });
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('tilt'); card.style.setProperty('--tx', 0); card.style.setProperty('--ty', 0); });
  });
}
