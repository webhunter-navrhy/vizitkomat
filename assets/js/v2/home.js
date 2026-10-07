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

/* ---------- hero: AI naživo ---------- */
const vis = $('[data-hero-vis]');
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
  const prompts = { kvety: tr('Mám kvetinárstvo v Nitre, chcem niečo jemné a prírodné.', 'Mám květinářství v Nitře, chci něco jemného a přírodního.'), vino: tr('Rodinné vinárstvo pri Pezinku, tradične a s nádychom luxusu.', 'Rodinné vinařství u Pezinku, tradičně a s nádechem luxusu.'), it: tr('Programátor z Košíc, moderne, tmavo a hravo.', 'Programátor z Košic, moderně, tmavě a hravě.') };
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
      el.innerHTML = `<div class="real__scene" style="--scene:${SCENES[j % 3]}"><img class="real__back" alt="" src="${P('b')}"><img class="real__front" alt="" src="${P('f')}"><span class="real__dir">${DIRS[j] || ''}</span></div><p><b>${TEMPLATES[c.template].name}</b> · ${FONTS[c.fonts || TEMPLATES[c.template].fonts]?.label || ''}${c.art.mode === 'file' ? ' · ' + tr('grafika od AI', 'grafika od AI') : ''}</p>`;
      box.append(el);
    });
  }
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-real]'); if (b) show(+b.dataset.real); });
  if (data.length) show(0);
});

/* ---------- šablóny ---------- */
lazy($('.tpls'), () => {
  const ids = Object.keys(TEMPLATES);
  const rows = [ids.filter((_, i) => i % 2 === 0), ids.filter((_, i) => i % 2 === 1)];
  for (const [ri, list] of rows.entries()) {
    const items = [...list, ...list];
    $(`[data-row="${ri}"]`).innerHTML = items.map((id, k) => `<a class="tc" href="${VK.links.tvorba}?rezim=sablony" data-t="${id}"${k >= list.length ? ' aria-hidden="true" tabindex="-1"' : ''}><span>${TEMPLATES[id].name}</span><img alt="${TEMPLATES[id].name}" src="${VK.pre['tpl-' + id + '-f'] || ''}" loading="lazy"><img alt="" src="${VK.pre['tpl-' + id + '-b'] || ''}" loading="lazy"></a>`).join('');
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
  d.f = { ...d.f, name: 'Martin Kováč', role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: 'martin@domovreality.sk', web: 'domovreality.sk' };
  renderDigital($('[data-dig-phone]'), d, { url: DEMO, qr: (u) => qrSVG(u) });
  $('[data-dig-qr]').innerHTML = qrSVG(DEMO);
});
