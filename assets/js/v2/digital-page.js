import { newDesign, slugify, tr } from './model.js';
import { templateDefaults } from './templates.js';
import { renderDigital } from './digital.js';
import { qrSVG, absUrl, debounce, session } from '../util.js';
const VK = window.VK, $ = (s) => document.querySelector(s);
const url = absUrl(VK.links.demo);
const d = newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold') });
d.f = { ...d.f, name: tr('Martin Kováč', 'Martin Kovář'), role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: tr('martin@domovreality.sk', 'martin@domovreality.cz'), web: tr('domovreality.sk', 'domovreality.cz'), phone: tr('+421 905 123 456', '+420 605 123 456') };
d.digital = { bio: tr('Pomáham rodinám predať byt za férovú cenu a bez stresu. 12 rokov v Bratislave.', 'Pomáhám rodinám prodat byt za férovou cenu a bez stresu. 12 let v Praze.'), services: tr('Predaj bytov a domov\nOcenenie nehnuteľnosti\nPrenájom', 'Prodej bytů a domů\nOcenění nemovitosti\nPronájem'), hours: tr('Po – Pi: 8:00 – 18:00', 'Po – Pá: 8:00 – 18:00') };
d.socials = { instagram: 'https://instagram.com/', linkedin: 'https://linkedin.com/' };
const DEF = d.f.name;
// obrázok vizitky ukazujeme len pre ukážkové meno (s vlastným menom sa zobrazí jednoduchá karta)
const paint = () => { const own = d.f.name !== DEF; renderDigital($('[data-dg-phone]'), d, { url, qr: (u) => qrSVG(u), front: own ? null : VK.pre['tpl-noirgold-f'], back: own ? null : VK.pre['tpl-noirgold-b'] }); };
paint();
$('#dg-name').addEventListener('input', debounce((e) => { d.f.name = e.target.value.trim() || DEF; $('[data-dg-slug]').textContent = slugify(d.f.name) || 'martin-kovac'; paint(); }, 60));
$('[data-dg-form]').addEventListener('submit', (e) => {
  e.preventDefault(); const n = $('#dg-name').value.trim();
  session('vk2-draft', newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold'), f: { ...newDesign().f, ...(n ? { name: n } : {}) } }));
  location.href = VK.links.tvorba + '?druh=digital&rezim=texty';
});
