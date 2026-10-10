// Hodnotenie vizitiek zákazníkom (odkaz s číslom objednávky a tokenom z e-mailu)
import { tr } from './model.js';

const VK = window.VK;
const API = VK.orderEndpoint.replace(/\/order$/, '');
const $ = (s, el = document) => el.querySelector(s);
const q = new URLSearchParams(location.search);
const num = (q.get('c') || '').toUpperCase(), tok = q.get('t') || '';
const show = (k) => document.querySelectorAll('[data-state]').forEach((e) => { e.hidden = e.dataset.state !== k; });
const LABEL = [, tr('Nespokojný', 'Nespokojený'), tr('Nič moc', 'Nic moc'), tr('V poriadku', 'V pořádku'), tr('Veľmi dobré', 'Velmi dobré'), tr('Výborné!', 'Výborné!')];
let photo = null;

// fotka: zmenšíme v prehliadači na max. 1600 px JPEG (pod 3 MB)
async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    for (const qq of [0.85, 0.75, 0.6]) { const d = c.toDataURL('image/jpeg', qq); if (d.length * 0.75 < 2.8e6) return d; }
    return null;
  } finally { URL.revokeObjectURL(url); }
}

async function boot() {
  if (!/^VK\d{6}$/.test(num) || !/^[a-f0-9]{24}$/.test(tok)) return show('bad');
  let info;
  try { const r = await fetch(`${API}/review?c=${num}&t=${tok}`); if (!r.ok) throw new Error(r.status); info = await r.json(); } catch (e) { return show('bad'); }
  if (info.done) return show('done');
  if (!info.ready) { const a = $('[data-track]'); if (a) a.href += `?c=${num}&t=${tok}`; return show('early'); }
  const f = $('[data-state="form"]');
  $('[data-num]').textContent = tr('Objednávka ', 'Objednávka ') + info.number;
  if (info.name) f.elements.name.value = info.name;
  if (info.city) f.elements.city.value = info.city;
  show('form');
  f.addEventListener('change', (e) => { if (e.target.name === 'stars') { $('[data-stars-t]').textContent = LABEL[+e.target.value] || ''; $('[data-stars]').classList.add('is-set'); $('[data-err]').hidden = true; } });
  $('[data-file]').addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    $('[data-drop-t]').innerHTML = `<b>${tr('Spracúvam fotku…', 'Zpracovávám fotku…')}</b>`;
    photo = await shrink(file).catch(() => null);
    if (!photo) { $('[data-drop-t]').innerHTML = `<b>${tr('Túto fotku sa nepodarilo načítať', 'Tuto fotku se nepodařilo načíst')}</b><small>${tr('skúste inú', 'zkuste jinou')}</small>`; return; }
    $('[data-prev]').src = photo; $('[data-prev]').hidden = false; $('[data-drop-t]').hidden = true; $('[data-photo-x]').hidden = false;
  });
  $('[data-photo-x]').addEventListener('click', () => { photo = null; $('[data-file]').value = ''; $('[data-prev]').hidden = true; $('[data-drop-t]').hidden = false; $('[data-drop-t]').innerHTML = `<b>${tr('+ Pridať fotku vizitiek', '+ Přidat fotku vizitek')}</b><small>${tr('nepovinné · fotka z mobilu stačí', 'nepovinné · fotka z mobilu stačí')}</small>`; $('[data-photo-x]').hidden = true; });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stars = +(f.elements.stars.value || 0), err = $('[data-err]');
    if (!stars) { err.textContent = tr('Vyberte, prosím, počet hviezdičiek.', 'Vyberte prosím počet hvězdiček.'); err.hidden = false; $('[data-stars]').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const btn = $('.rvf__go'); btn.disabled = true;
    try {
      const r = await fetch(`${API}/review`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ c: num, t: tok, stars, text: f.elements.text.value, name: f.elements.name.value, city: f.elements.city.value, consent: f.elements.consent.checked, photo }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 409 && /už máme/.test(j.error || '')) { show('done'); return; }
      if (r.status === 413) throw new Error(tr('Fotka je príliš veľká, skúste menšiu.', 'Fotka je příliš velká, zkuste menší.'));
      if (!r.ok) throw new Error(VK.lang === 'cz' ? tr('', 'Odeslání se nepodařilo, zkuste to znovu.') : (j.error || 'Odoslanie sa nepodarilo, skúste to znova.'));
      VK.ev?.('review_sent', true);
      show('done'); scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x) { err.textContent = x.message; err.hidden = false; btn.disabled = false; }
  });
}
boot();
