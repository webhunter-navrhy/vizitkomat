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

/* ---------- hero: nálepky ---------- */
(async function stickers() {
  await document.fonts.ready;
  const ids = ['prechod', 'mramor', 'retro'];
  for (const [i, id] of ids.entries()) {
    const img = $(`[data-stk="${i}"]`);
    img.src = await snapshot(newDesign({ tpl: id, ...templateDefaults(id) }), 'front', 900, 'image/jpeg', 0.9);
    img.classList.add('ready');
  }
})();

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
lazy($('.how'), async () => {
  $('[data-step-card]').src = await snapshot(newDesign({ tpl: 'atelier', ...templateDefaults('atelier') }), 'front', 700, 'image/jpeg');
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
  async function show(i) {
    const s = data[i];
    $$('[data-real]').forEach((b) => b.classList.toggle('on', +b.dataset.real === i));
    $('[data-real-prompt]').textContent = prompts[s.key] || s.prompt;
    const box = $('[data-real-cards]'); box.innerHTML = '';
    for (const c of s.concepts) {
      const art = c.art.mode === 'file' ? VK.root + 'assets/ai/' + c.art.file : c.art.mode === 'library' ? c.art.key : null;
      const d = newDesign({ tpl: c.template, fonts: c.fonts || TEMPLATES[c.template].fonts, pal: { label: 'AI', ...c.palette }, art, f: { ...newDesign().f, ...s.fields, phone: CZ ? '+420 605 123 456' : '+421 905 123 456', email: '', web: '' } });
      const el = document.createElement('div'); el.className = 'real__card';
      el.innerHTML = `<div class="cv"><img alt=""><img alt=""></div><p><b>${TEMPLATES[c.template].name}</b> · ${FONTS[d.fonts]?.label || ''}${c.art.mode === 'file' ? ' · ' + tr('grafika od AI', 'grafika od AI') : ''}</p>`;
      box.append(el);
      const [f, b] = await Promise.all([snapshot(d, 'front', 760, 'image/jpeg'), snapshot(d, 'back', 760, 'image/jpeg')]);
      const ims = el.querySelectorAll('img'); ims[0].src = f; ims[1].src = b;
    }
  }
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-real]'); if (b) show(+b.dataset.real); });
  if (data.length) show(0);
});

/* ---------- mini editor ---------- */
lazy($('.edit'), async () => {
  const { createEditor } = await import('./editor.js');
  const host = $('[data-mini]');
  const ed = createEditor($('[data-mini-canvas]'), host, { pad: 36, mask: 'rgba(238,240,250,0.92)' });
  const tpls = ['monolit', 'atelier', 'duo', 'podpis', 'pecat', 'firma'];
  const pals = ['sneh', 'kobalt', 'koral', 'noir', 'salvia', 'levandula'];
  const fonts = ['inter', 'instrument', 'bricolage', 'bodoni', 'unbounded', 'caveat'];
  let ti = 0, pi = 0, fi = 0;
  await ed.load(newDesign({ tpl: tpls[0], ...templateDefaults(tpls[0]) }));
  $('[data-mini-tools]').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-mt]'); if (!b) return;
    const k = b.dataset.mt;
    if (k === 'pal') { pi = (pi + 1) % pals.length; await ed.setPalette(PALETTES[pals[pi]]); }
    if (k === 'font') { fi = (fi + 1) % fonts.length; await ed.setFonts(fonts[fi]); }
    if (k === 'tpl') { ti = (ti + 1) % tpls.length; await ed.setTemplate(tpls[ti]); }
    if (k === 'icon') await ed.add('icon', { name: ['heart', 'star', 'sparkles', 'coffee', 'leaf'][Math.floor(Math.random() * 5)] });
  });
});

/* ---------- šablóny ---------- */
lazy($('.tpls'), async () => {
  const ids = Object.keys(TEMPLATES);
  const rows = [ids.filter((_, i) => i % 2 === 0), ids.filter((_, i) => i % 2 === 1)];
  for (const [ri, list] of rows.entries()) {
    const track = $(`[data-row="${ri}"]`);
    const items = [...list, ...list];
    track.innerHTML = items.map((id) => `<a class="tc" href="${VK.links.tvorba}?rezim=sablony" data-t="${id}"><span>${TEMPLATES[id].name}</span><img alt="" loading="lazy"><img alt="" loading="lazy"></a>`).join('');
    for (const id of list) {
      const d = newDesign({ tpl: id, ...templateDefaults(id) });
      const [f, b] = await Promise.all([snapshot(d, 'front', 640, 'image/jpeg', 0.85), snapshot(d, 'back', 640, 'image/jpeg', 0.85)]);
      $$(`[data-t="${id}"]`, track).forEach((a) => { const ims = a.querySelectorAll('img'); ims[0].src = f; ims[1].src = b; });
    }
  }
}, '600px');
$('[data-tpl-rows]')?.addEventListener('click', (e) => {
  const a = e.target.closest('[data-t]'); if (!a) return;
  e.preventDefault();
  session('vk2-draft', newDesign({ tpl: a.dataset.t, ...templateDefaults(a.dataset.t) }));
  location.href = VK.links.tvorba + '?rezim=texty';
});

/* ---------- papier 3D ---------- */
lazy($('.paper'), async () => {
  const { cardScene } = await import('./three-cards.js');
  const d = newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold') });
  const [front, back] = await Promise.all([snapshot(d, 'front', 1600, 'image/jpeg', 0.92), snapshot(d, 'back', 1600, 'image/jpeg', 0.92)]);
  const sc = await cardScene($('[data-paper3d]'), [{ front, back, pos: [0, 0, 0], rot: [-0.3, -0.5, 0.06], finish: 'matte', edge: '#EDE8DE', thick: 0.7 }], { camZ: 205, fov: 30, shadow: false, drag: true, parallaxAmt: 0.12, float: false, fit: 150 });
  $('[data-mats]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mat]'); if (!b) return;
    $$('[data-mat]').forEach((x) => x.classList.toggle('on', x === b));
    const m = b.dataset.mat;
    if (m === 'triplex') { sc.setThickness(0, 2.2, '#E8462B'); sc.setFinish(0, 'matte'); }
    else { sc.setThickness(0, 0.7, '#EDE8DE'); sc.setFinish(0, m); }
    sc.spinTo(m === 'triplex' ? 0.9 : 0);
  });
});

/* ---------- digitál ---------- */
lazy($('.dig'), () => {
  const d = newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold') });
  d.f = { ...d.f, name: 'Martin Kováč', role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: 'martin@domovreality.sk', web: 'domovreality.sk' };
  renderDigital($('[data-dig-phone]'), d, { url: DEMO, qr: (u) => qrSVG(u) });
  $('[data-dig-qr]').innerHTML = qrSVG(DEMO);
});
