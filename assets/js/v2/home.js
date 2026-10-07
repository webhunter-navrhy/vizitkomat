// Homepage v2 (Pop)
import { newDesign, FONTS, PALETTES, SIZES, tr, CZ } from './model.js';
import { TEMPLATES, templateDefaults } from './templates.js';
import { snapshot } from './render.js';
import { askAI } from './ai.js';
import { renderDigital } from './digital.js';
import { qrSVG, addWorkdays, fmtDay, session, absUrl } from '../util.js';

const VK = window.VK;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const DEMO = absUrl(VK.links.demo);
const lazy = (el, fn, margin = '400px') => { if (!el) return; const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin }); io.observe(el); };

/* ---------- hero: živá ukážka (zadanie → vizitka) ---------- */
const vis = $('[data-hero-vis]');
(function demo() {
  const box = $('[data-demo]'); if (!box) return;
  const cards = $$('.dk', box), N = cards.length;
  const typeEl = $('[data-demo-type]'), tagEl = $('[data-demo-tag]'), ai = $('[data-demo-ai]'), deck = $('[data-demo-deck]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, visible = true, paused = false;
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
let designs = [];
async function heroAI(prompt) {
  vis.classList.add('running');
  const run = $('[data-ai-run]'); run.hidden = false;
  $('[data-ai-load]').hidden = false; $('[data-ai-res]').hidden = true;
  let i = 0; $('[data-ai-step]').textContent = STEPS[0];
  const t = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); $('[data-ai-step]').textContent = STEPS[i]; }, 1300);
  if (matchMedia('(max-width: 1060px)').matches) vis.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  b.querySelector('img').src = await snapshot(designs[i], 'front', 820, 'image/jpeg', 0.9);
}
function openDesign(i) { const d = designs[i]; if (!d) return; session('vk2-draft', { ...d, why: undefined }); location.href = VK.links.tvorba + '?rezim=ai'; }
$('[data-ai-grid]').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) openDesign(+b.dataset.i); });
$('[data-ai-open]').addEventListener('click', (e) => { if (designs.length) { e.preventDefault(); openDesign(0); } });
$('[data-aibox]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-ai-in]').value.trim(); if (v.length > 2) heroAI(v); else $('[data-ai-in]').focus(); });
$$('[data-ai-chips] button').forEach((b) => b.addEventListener('click', () => { $('[data-ai-in]').value = b.dataset.p; heroAI(b.dataset.p); }));
$('[data-aibox-final]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-final-in]').value.trim(); location.href = VK.links.tvorba + '?rezim=ai' + (v ? '&prompt=' + encodeURIComponent(v) : ''); });

/* ---------- kroky ---------- */
lazy($('.how'), () => {
  const now = new Date();
  $('[data-arrive]').textContent = new Intl.DateTimeFormat(CZ ? 'cs-CZ' : 'sk-SK', { weekday: 'long', day: 'numeric', month: 'numeric' }).format(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + 4));
});

/* ---------- AI ukážky ---------- */
lazy($('.real'), async () => {
  const data = await fetch(VK.root + 'assets/ai/showcase.json').then((r) => r.json()).catch(() => []);
  const tabs = $('[data-real-tabs]');
  const labels = { kvety: tr('Kvetinárstvo', 'Květinářství'), vino: tr('Vinárstvo', 'Vinařství'), it: tr('Programátor', 'Programátor') };
  const prompts = { kvety: tr('Mám kvetinárstvo Levanduľa v Nitre, chcem niečo jemné a prírodné.', 'Mám květinářství Levandule v Nitře, chci něco jemného a přírodního.'), vino: tr('Rodinné vinárstvo pod Pezinkom, tradične a s nádychom luxusu.', 'Rodinné vinařství pod Pálavou, tradičně a s nádechem luxusu.'), it: tr('Programátor z Košíc, firma Bitlab, moderne, tmavo a hravo.', 'Programátor z Ostravy, firma Bitlab, moderně, tmavě a hravě.') };
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
  if (data.length) show(0);
});

/* ---------- šablóny ---------- */
lazy($('.tpls'), () => {
  // ilustrované šablóny ako prvé
  const RICH = ['glow', 'saloon', 'cafe', 'samet', 'venec', 'deco', 'odznak', 'medic', 'builders', 'vetvicka', 'mramorzlato', 'vlnyluxe', 'boho', 'ruzovezlato', 'akvarelsalvia', 'konfety'];
  const ids = [...RICH, ...Object.keys(TEMPLATES).filter((id) => !RICH.includes(id))].filter((id) => TEMPLATES[id]).slice(0, 36);
  const rows = [ids.filter((_, i) => i % 2 === 0), ids.filter((_, i) => i % 2 === 1)];
  for (const [ri, list] of rows.entries()) {
    const items = [...list, ...list];
    $(`[data-row="${ri}"]`).innerHTML = items.map((id, k) => `<a class="tc tc--photo" href="${VK.links.tvorba}?rezim=sablony" data-t="${id}"${k >= list.length ? ' aria-hidden="true" tabindex="-1"' : ''}><span>${TEMPLATES[id].name}</span><img alt="${TEMPLATES[id].name}" src="${VK.pre['tpl-' + id + '-m'] || VK.pre['tpl-' + id + '-f'] || ''}" loading="lazy"></a>`).join('');
  }
}, '600px');
$('[data-tpl-rows]')?.addEventListener('click', (e) => {
  const a = e.target.closest('[data-t]'); if (!a) return;
  e.preventDefault();
  session('vk2-draft', newDesign({ tpl: a.dataset.t, ...templateDefaults(a.dataset.t) }));
  location.href = VK.links.tvorba + '?rezim=texty';
});

/* ---------- digitál ---------- */
lazy($('.dig'), () => {
  const d = newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold') });
  d.f = { ...d.f, name: tr('Martin Kováč', 'Martin Kovář'), role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: tr('martin@domovreality.sk', 'martin@domovreality.cz'), web: tr('domovreality.sk', 'domovreality.cz'), phone: tr('+421 905 123 456', '+420 605 123 456') };
  d.digital = { bio: tr('Pomáham rodinám predať byt za férovú cenu a bez stresu.', 'Pomáhám rodinám prodat byt za férovou cenu a bez stresu.'), services: tr('Predaj bytov\nOcenenie\nPrenájom', 'Prodej bytů\nOcenění\nPronájem') };
  renderDigital($('[data-dig-phone]'), d, { url: DEMO, qr: (u) => qrSVG(u), front: VK.pre['tpl-noirgold-f'], back: VK.pre['tpl-noirgold-b'] });
  $('[data-dig-qr]').innerHTML = qrSVG(DEMO);
});
