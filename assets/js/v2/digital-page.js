// Stránka Digitálna vizitka: živá ukážka v hero (s menom návštevníka), interaktívna ukážka odborov a galéria štýlov.
import { newDesign, slugify, tr } from './model.js';
import { templateDefaults } from './templates.js';
import { personaFields } from './personas.js';
import { renderDigital } from './digital.js';
import { qrSVG, absUrl, debounce, session } from '../util.js';

const VK = window.VK, $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const url = absUrl(VK.links.demo);
const tld = tr('sk', 'cz');

const DEMOS = {
  makler: {
    tpl: 'noirgold',
    f: { name: tr('Martin Kováč', 'Martin Kovář'), role: tr('Realitný maklér', 'Realitní makléř'), company: 'Domov Reality', tagline: tr('Kľúče odovzdávam osobne.', 'Klíče předávám osobně.'), email: `martin@domovreality.${tld}`, web: `domovreality.${tld}`, phone: tr('+421 905 123 456', '+420 605 123 456'), address: tr('Panská 14, Bratislava', 'Panská 14, Praha') },
    digital: {
      bio: tr('Pomáham rodinám predať byt za férovú cenu a bez stresu. 12 rokov v Bratislave.', 'Pomáhám rodinám prodat byt za férovou cenu a bez stresu. 12 let v Praze.'),
      services: tr('Predaj bytov a domov – 2,5 % z ceny\nOcenenie nehnuteľnosti – zadarmo\nPrenájom', 'Prodej bytů a domů – 2,5 % z ceny\nOcenění nemovitosti – zdarma\nPronájem'),
      hours: tr('Po – Pi: 8:00 – 18:00\nSo: po dohode', 'Po – Pá: 8:00 – 18:00\nSo: po domluvě'),
      booking: 'https://calendly.com/', bookingLabel: tr('Dohodnúť obhliadku', 'Domluvit prohlídku'), reviews: 'https://www.google.com/maps', rating: tr('4,9 · 86 recenzií na Google', '4,9 · 86 recenzí na Googlu'),
    },
    socials: { instagram: 'https://instagram.com/', linkedin: 'https://linkedin.com/' },
  },
  nechty: {
    tpl: 'glow',
    f: { name: tr('Nikola Švecová', 'Nikola Švecová'), role: tr('Nechtová dizajnérka', 'Nehtová designérka'), company: 'Nails by Nika', tagline: tr('Detaily, ktorých si všimnú.', 'Detaily, kterých si všimnou.'), email: `nikola@nailsbynika.${tld}`, web: `nailsbynika.${tld}`, phone: tr('+421 905 123 456', '+420 605 123 456'), address: tr('Hlavná 8, Trnava', 'Masarykova 8, Karlovy Vary') },
    digital: {
      bio: tr('Gélové nechty, ktoré vydržia. Pracujem len s prémiovou kozmetikou a s časom na vás.', 'Gelové nehty, které vydrží. Pracuji jen s prémiovou kosmetikou a s časem na vás.'),
      services: tr('Gélové nechty – od 35 €\nManikúra – 20 €\nNail art – od 5 €', 'Gelové nehty – od 790 Kč\nManikúra – 450 Kč\nNail art – od 100 Kč'),
      hours: tr('Po – Pi: 9:00 – 19:00\nSo: 9:00 – 13:00\nNe: zatvorené', 'Po – Pá: 9:00 – 19:00\nSo: 9:00 – 13:00\nNe: zavřeno'),
      booking: 'https://reservio.com/', reviews: 'https://www.google.com/maps', rating: tr('5,0 · 212 recenzií na Google', '5,0 · 212 recenzí na Googlu'),
    },
    socials: { instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/', facebook: 'https://facebook.com/' },
  },
  kava: {
    tpl: 'cafe',
    f: { name: tr('Kaviareň Zrnko', 'Kavárna Zrnko'), role: '', company: tr('Kaviareň Zrnko', 'Kavárna Zrnko'), tagline: tr('Káva, kvôli ktorej sa oplatí zastaviť.', 'Káva, kvůli které se vyplatí zastavit.'), email: `ahoj@zrnko.${tld}`, web: `zrnko.${tld}`, phone: tr('+421 905 123 456', '+420 605 123 456'), address: tr('Námestie SNP 3, Banská Bystrica', 'Horní náměstí 3, Olomouc') },
    digital: {
      bio: tr('Výberová káva z malých pražiarní, domáce koláče a raňajky celý deň.', 'Výběrová káva z malých pražíren, domácí koláče a snídaně celý den.'),
      services: tr('Espresso – 2,20 €\nFlat white – 3,40 €\nDomáci koláč – 3,50 €', 'Espresso – 55 Kč\nFlat white – 85 Kč\nDomácí koláč – 89 Kč'),
      hours: tr('Po – Pi: 7:30 – 18:00\nSo – Ne: 9:00 – 17:00', 'Po – Pá: 7:30 – 18:00\nSo – Ne: 9:00 – 17:00'),
      reviews: 'https://www.google.com/maps', rating: tr('4,8 · 340 recenzií na Google', '4,8 · 340 recenzí na Googlu'), links: tr('Menu | https://zrnko.sk/menu\nRozvoz cez Wolt | https://wolt.com', 'Menu | https://zrnko.cz/menu\nRozvoz přes Wolt | https://wolt.com'),
    },
    socials: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/' },
  },
  kvety: {
    tpl: 'kytice',
    f: { name: tr('Mária Horváthová', 'Marie Horváthová'), role: tr('Kvetinárka', 'Květinářka'), company: tr('Levanduľa', 'Levandule'), tagline: tr('Kvety, ktoré hovoria za vás.', 'Květiny, které mluví za vás.'), email: `maria@levandula.${tld}`, web: `levandula.${tld}`, phone: tr('+421 905 123 456', '+420 605 123 456'), address: tr('Štefánikova 12, Nitra', 'Velké náměstí 12, Hradec Králové') },
    digital: {
      bio: tr('Viažem kytice na svadby, oslavy aj obyčajný utorok. Kvety beriem od slovenských pestovateľov.', 'Vážu kytice na svatby, oslavy i obyčejné úterý. Květiny beru od českých pěstitelů.'),
      services: tr('Svadobná kytica – od 65 €\nNarodeninová kytica – od 25 €\nVýzdoba podujatí – na mieru\nPredplatné kvetov – 39 €/mes.', 'Svatební kytice – od 1 590 Kč\nNarozeninová kytice – od 590 Kč\nVýzdoba akcí – na míru\nPředplatné květin – 890 Kč/měs.'),
      hours: tr('Po – Pi: 8:00 – 18:00\nSo: 8:00 – 12:00\nNe: zatvorené', 'Po – Pá: 8:00 – 18:00\nSo: 8:00 – 12:00\nNe: zavřeno'),
      reviews: 'https://www.google.com/maps', links: tr('Svadobný katalóg | https://levandula.sk/svadby', 'Svatební katalog | https://levandule.cz/svatby'),
    },
    socials: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/' },
  },
  auto: {
    tpl: 'garaz',
    f: { name: tr('Peter Kolár', 'Petr Kolář'), role: tr('Automechanik', 'Automechanik'), company: tr('Autoservis Kolár', 'Autoservis Kolář'), tagline: tr('Opravené poctivo a načas.', 'Opraveno poctivě a včas.'), email: `peter@autoservis-kolar.${tld}`, web: `autoservis-kolar.${tld}`, phone: tr('+421 905 123 456', '+420 605 123 456'), address: tr('Priemyselná 5, Trenčín', 'Průmyslová 5, Kolín') },
    digital: {
      bio: tr('Servis všetkých značiek, pneuservis a príprava na STK. Cenu poviem vopred, nie až pri platení.', 'Servis všech značek, pneuservis a příprava na STK. Cenu řeknu předem, ne až při placení.'),
      services: tr('Výmena oleja – od 39 €\nPrezutie pneumatík – 30 €\nDiagnostika – 25 €\nPríprava na STK – 35 €', 'Výměna oleje – od 890 Kč\nPřezutí pneumatik – 690 Kč\nDiagnostika – 590 Kč\nPříprava na STK – 790 Kč'),
      hours: tr('Po – Pi: 7:00 – 17:00\nSo: 8:00 – 12:00', 'Po – Pá: 7:00 – 17:00\nSo: 8:00 – 12:00'),
      booking: 'https://reservio.com/', bookingLabel: tr('Objednať auto do servisu', 'Objednat auto do servisu'), reviews: 'https://www.google.com/maps', rating: tr('4,7 · 158 recenzií na Google', '4,7 · 158 recenzí na Googlu'),
    },
    socials: { facebook: 'https://facebook.com/' },
  },
  zubar: {
    tpl: 'medic',
    f: { name: tr('MUDr. Anna Kráľová', 'MUDr. Anna Králová'), role: tr('Zubná lekárka', 'Zubní lékařka'), company: tr('Dentál Úsmev', 'Dentál Úsměv'), tagline: tr('Úsmev bez obáv.', 'Úsměv bez obav.'), email: `ordinacia@dentalusmev.${tld}`, web: `dentalusmev.${tld}`, phone: tr('+421 905 123 456', '+420 605 123 456'), address: tr('Hlavná 40, Prešov', 'Pernštýnská 40, Pardubice') },
    digital: {
      bio: tr('Bezbolestné ošetrenie, dentálna hygiena a estetika. Prijímame nových pacientov aj deti.', 'Bezbolestné ošetření, dentální hygiena a estetika. Přijímáme nové pacienty i děti.'),
      services: tr('Preventívna prehliadka – 30 €\nDentálna hygiena – 55 €\nBielenie zubov – od 190 €', 'Preventivní prohlídka – 600 Kč\nDentální hygiena – 1 200 Kč\nBělení zubů – od 4 500 Kč'),
      hours: tr('Po – Št: 7:30 – 16:00\nPi: 7:30 – 13:00', 'Po – Čt: 7:30 – 16:00\nPá: 7:30 – 13:00'),
      booking: 'https://reservio.com/', bookingLabel: tr('Objednať sa online', 'Objednat se online'), reviews: 'https://www.google.com/maps',
    },
    socials: { instagram: 'https://instagram.com/' },
  },
};
// ďalšie štýly do galérie (ukážkové osoby zhodné s náhľadmi vizitiek)
const EXTRA = {
  elektro: { tpl: 'iskra', p: 'elektro', digital: { bio: tr('Elektroinštalácie, revízie a smart domácnosť. Prídem do 48 hodín.', 'Elektroinstalace, revize a chytrá domácnost. Přijedu do 48 hodin.'), services: tr('Revízia elektroinštalácie – od 90 €\nMontáž svietidiel – od 25 €\nWallbox pre elektroauto – na mieru', 'Revize elektroinstalace – od 2 200 Kč\nMontáž svítidel – od 590 Kč\nWallbox pro elektroauto – na míru'), hours: tr('Po – Pi: 7:00 – 17:00', 'Po – Pá: 7:00 – 17:00'), booking: 'https://calendly.com/', bookingLabel: tr('Objednať výjazd', 'Objednat výjezd') }, socials: { facebook: 'https://facebook.com/' } },
  cukrar: { tpl: 'glazura', p: 'cukrar', digital: { bio: tr('Torty na mieru, makróny a dezerty na svadby. Pečieme z masla, nie z margarínu.', 'Dorty na míru, makronky a dezerty na svatby. Pečeme z másla, ne z margarínu.'), services: tr('Torta na mieru – od 45 €\nMakróny 12 ks – 18 €\nSvadobný stôl – na mieru', 'Dort na míru – od 1 090 Kč\nMakronky 12 ks – 420 Kč\nSvatební stůl – na míru'), hours: tr('Ut – So: 9:00 – 18:00\nNe: 10:00 – 16:00', 'Út – So: 9:00 – 18:00\nNe: 10:00 – 16:00'), rating: tr('5,0 · 97 recenzií', '5,0 · 97 recenzí'), reviews: 'https://www.google.com/maps' }, socials: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/' } },
  startup: { tpl: 'orbit', p: 'startup', digital: { bio: tr('Budujeme softvér, ktorý firmám šetrí desiatky hodín mesačne. Hľadáme partnerov aj ľudí do tímu.', 'Stavíme software, který firmám šetří desítky hodin měsíčně. Hledáme partnery i lidi do týmu.'), links: tr('Demo produktu | https://nodo.sk/demo\nKariéra | https://nodo.sk/kariera', 'Demo produktu | https://nodo.cz/demo\nKariéra | https://nodo.cz/kariera'), booking: 'https://calendly.com/', bookingLabel: tr('Dohodnúť 20 min hovor', 'Domluvit 20min hovor') }, socials: { linkedin: 'https://linkedin.com/' } },
  fitness: { tpl: 'sila', p: 'fitness', digital: { bio: tr('Osobné tréningy a plány na mieru. Výsledky, ktoré vidno po 6 týždňoch.', 'Osobní tréninky a plány na míru. Výsledky, které jsou vidět po 6 týdnech.'), services: tr('Osobný tréning – 30 €\nBalík 10 tréningov – 270 €\nJedálniček – 49 €', 'Osobní trénink – 690 Kč\nBalíček 10 tréninků – 6 200 Kč\nJídelníček – 1 190 Kč'), hours: tr('Po – Pi: 6:00 – 21:00\nSo: 8:00 – 14:00', 'Po – Pá: 6:00 – 21:00\nSo: 8:00 – 14:00'), booking: 'https://reservio.com/', bookingLabel: tr('Rezervovať tréning', 'Rezervovat trénink') }, socials: { instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/' } },
};
for (const [k, x] of Object.entries(EXTRA)) { const f = personaFields(x.p); DEMOS[k] = { tpl: x.tpl, f: { ...f, address: f.address }, digital: x.digital, socials: x.socials }; }
const design = (k) => { const x = DEMOS[k]; const d = newDesign({ tpl: x.tpl, ...templateDefaults(x.tpl) }); d.f = { ...d.f, ...x.f }; d.digital = { ...x.digital }; d.socials = { ...x.socials }; d.slug = slugify(x.f.name); return d; };

// hero: vizitka s menom návštevníka
const hero = design('makler');
const DEF = hero.f.name;
const paintHero = () => { const own = hero.f.name !== DEF; renderDigital($('[data-dg-phone]'), hero, { url, qr: (u) => qrSVG(u), front: own ? null : VK.pre['tpl-noirgold-f'], back: own ? null : VK.pre['tpl-noirgold-b'] }); };
paintHero();
$('#dg-name').addEventListener('input', debounce((e) => { hero.f.name = e.target.value.trim() || DEF; $('[data-dg-slug]').textContent = slugify(hero.f.name) || slugify(DEF); paintHero(); }, 60));
$('[data-dg-form]').addEventListener('submit', (e) => {
  e.preventDefault(); const n = $('#dg-name').value.trim();
  session('vk2-draft', newDesign({ tpl: 'noirgold', ...templateDefaults('noirgold'), f: { ...newDesign().f, ...(n ? { name: n } : {}) } }));
  location.href = VK.links.tvorba + '?druh=digital&rezim=texty';
});

// interaktívna ukážka odborov
const box = $('[data-dgl-phone]');
const show = (k) => {
  const x = DEMOS[k];
  renderDigital(box, design(k), { url: absUrl(VK.links.demo), qr: (u) => qrSVG(u), front: VK.pre[`tpl-${x.tpl}-f`], back: VK.pre[`tpl-${x.tpl}-b`] });
  box.scrollTop = 0;
  $$('[data-dgl-tabs] button').forEach((b) => { const on = b.dataset.p === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
};
let shown = false;
const io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !shown) { shown = true; show('makler'); io.disconnect(); } }, { rootMargin: '400px' });
io.observe(box);
$('[data-dgl-tabs]').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) show(b.dataset.p); });

// galéria štýlov: rovnaká vizitka, iná značka
const th = $('[data-dgl-themes]');
if (th) {
  const io2 = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return; io2.disconnect();
    th.querySelectorAll('[data-k]').forEach((el) => { const k = el.dataset.k, x = DEMOS[k]; if (!x) { el.remove(); return; } renderDigital(el.querySelector('.dcard-host'), design(k), { url, qr: (u) => qrSVG(u), static: true, front: VK.pre[`tpl-${x.tpl}-f`], back: VK.pre[`tpl-${x.tpl}-b`] }); });
    // nekonečný pás: kópia položiek (bez čítačky), ak to pohyb dovolí
    const track = th.querySelector('[data-dgl-track]');
    if (track && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      [...track.children].forEach((el) => { const c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
      th.classList.add('is-marq');
    }
  }, { rootMargin: '300px' });
  io2.observe(th);
}
