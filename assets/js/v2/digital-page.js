import { newDesign, slugify, tr } from './model.js';
import { templateDefaults } from './templates.js';
import { renderDigital } from './digital.js';
import { qrSVG, absUrl, debounce, session } from '../util.js';
const VK = window.VK, $ = (s) => document.querySelector(s);
const url = absUrl(VK.links.demo);
const d = newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold') });
d.f = { ...d.f, name: 'Martin Kováč', role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: 'martin@domovreality.sk', web: 'domovreality.sk' };
const paint = () => renderDigital($('[data-dg-phone]'), d, { url, qr: (u) => qrSVG(u) });
paint();
$('#dg-name').addEventListener('input', debounce((e) => { d.f.name = e.target.value.trim() || 'Martin Kováč'; $('[data-dg-slug]').textContent = slugify(d.f.name) || 'martin-kovac'; paint(); }, 60));
$('[data-dg-form]').addEventListener('submit', (e) => {
  e.preventDefault(); const n = $('#dg-name').value.trim();
  session('vk2-draft', newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold'), f: { ...newDesign().f, ...(n ? { name: n } : {}) } }));
  location.href = VK.links.tvorba + '?druh=digital&rezim=texty';
});
