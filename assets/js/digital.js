// Stránka Digitálna vizitka – živá ukážka
import * as E from './card-engine.js';
import { renderDigital } from './digital-card.js';
import { $, T, VK, qrSVG, absUrl, debounce, session } from './util.js';

const demoUrl = absUrl(VK.links.demo);
const d = E.newDesign({ tpl: 'linea', ...E.templateDefaults('linea') });
d.f = { ...d.f, name: 'Martin Kováč', role: T('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: T('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: 'martin@domovreality.sk', web: 'domovreality.sk' };
const host = $('[data-dg-phone]');
const slugify = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function paint() { renderDigital(host, d, { url: demoUrl, qr: (u) => qrSVG(u) }); }
paint();
$('[data-dg-qr]').innerHTML = qrSVG(demoUrl);
const input = $('#dg-name');
input.addEventListener('input', debounce(() => {
  d.f.name = input.value.trim() || 'Martin Kováč';
  $('[data-dg-slug]').textContent = slugify(d.f.name) || 'martin-kovac';
  paint();
}, 60));
$('[data-dg-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const n = input.value.trim();
  const draft = E.newDesign({ ...d, f: { ...E.DEFAULT_FIELDS, ...(n ? { name: n } : {}), role: '', company: '', email: '', web: '', address: '', tagline: '' } });
  session('vk-draft', draft);
  location.href = VK.links.tvorba + '?druh=digital' + (n ? '&meno=' + encodeURIComponent(n) : '');
});
