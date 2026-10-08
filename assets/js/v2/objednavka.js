// Stav objednávky pre zákazníka (verejný odkaz s tokenom z e-mailu)
import { money, fmtDay, addWorkdays, deliveryDays } from '../util.js';
import { tr } from './model.js';

const VK = window.VK;
const API = VK.orderEndpoint.replace(/\/order$/, '');
const $ = (s, el = document) => el.querySelector(s);
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const q = new URLSearchParams(location.search);
const num = (q.get('c') || '').toUpperCase(), tok = q.get('t') || '';

// moje objednávky v tomto prehliadači
export const MINE = 'vk2-orders';
function mine() { try { return JSON.parse(localStorage.getItem(MINE) || '[]'); } catch (e) { return []; } }

const KIND = { bundle: tr('Tlačené + digitálna', 'Tištěné + digitální'), print: tr('Tlačené vizitky', 'Tištěné vizitky'), digital: tr('Digitálna vizitka', 'Digitální vizitka') };
const PAPER = { matny: tr('matný 350 g', 'matný 350 g'), triplex: 'Triplex 720 g' };
const FIN = { matna: tr('matná laminácia', 'matná laminace'), leskla: tr('lesklá laminácia', 'lesklá laminace'), soft: 'soft-touch' };
const spec = (c) => (c.kind === 'digital' ? tr('jednorazovo', 'jednorázově') : [`${c.qty} ${tr('ks', 'ks')}`, PAPER[c.paper], c.paper !== 'triplex' && FIN[c.finish], c.corners === 'round' && tr('zaoblené rohy', 'zaoblené rohy'), c.express && 'expres'].filter(Boolean).join(' · '));
const day = (iso) => new Date(iso).toLocaleDateString(VK.lang === 'cz' ? 'cs-CZ' : 'sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

// kroky časovej osi
const STEPS = [
  ['nova', tr('Prijatá', 'Přijatá'), tr('Objednávku máme a návrh kontroluje človek.', 'Objednávku máme a návrh kontroluje člověk.')],
  ['k_platbe', tr('Platba', 'Platba'), tr('Návrh je v poriadku, čaká sa na platbu.', 'Návrh je v pořádku, čeká se na platbu.')],
  ['zaplaceno', tr('Zaplatená', 'Zaplacená'), tr('Platbu sme prijali, posielame do tlače.', 'Platbu jsme přijali, posíláme do tisku.')],
  ['tisk', tr('V tlači', 'V tisku'), tr('Tlačiareň práve vyrába vaše vizitky.', 'Tiskárna právě vyrábí vaše vizitky.')],
  ['odeslano', tr('Na ceste', 'Na cestě'), tr('Vizitky sú zabalené a na ceste k vám.', 'Vizitky jsou zabalené a na cestě k vám.')],
];
const HEAD = {
  nova: [tr('Kontrolujeme', 'Kontrolujeme'), tr('váš návrh', 'váš návrh'), tr('Do jedného pracovného dňa prejde návrh rukami grafika. Potom vám pošleme QR platbu.', 'Do jednoho pracovního dne projde návrh rukama grafika. Pak vám pošleme QR platbu.')],
  k_platbe: [tr('Zostáva', 'Zbývá'), tr('len platba', 'jen platba'), tr('Návrh je pripravený na tlač. Vizitky vytlačíme hneď po pripísaní platby.', 'Návrh je připravený k tisku. Vizitky vytiskneme hned po připsání platby.')],
  zaplaceno: [tr('Ďakujeme,', 'Děkujeme,'), tr('máme zaplatené', 'máme zaplaceno'), tr('Vizitky posielame do tlače. Hneď ako vyrazia, uvidíte tu číslo zásielky.', 'Vizitky posíláme do tisku. Jakmile vyrazí, uvidíte tu číslo zásilky.')],
  tisk: [tr('Vizitky', 'Vizitky'), tr('sa tlačia', 'se tisknou'), tr('Tlačiareň ich práve vyrába. Číslo zásielky sa tu objaví po odoslaní.', 'Tiskárna je právě vyrábí. Číslo zásilky se tu objeví po odeslání.')],
  odeslano: [tr('Vizitky sú', 'Vizitky jsou'), tr('na ceste', 'na cestě'), tr('Kuriér DPD ich doručí zvyčajne do 3 až 6 pracovných dní. Číslo zásielky nájdete nižšie.', 'Kurýr DPD je doručí obvykle do 3 až 6 pracovních dnů. Číslo zásilky najdete níže.')],
  hotovo: [tr('Hotovo,', 'Hotovo,'), tr('užívajte', 'užívejte'), tr('Ďakujeme za objednávku. Keď budete potrebovať ďalšie, návrh máte uložený.', 'Děkujeme za objednávku. Až budete potřebovat další, návrh máte uložený.')],
  zruseno: [tr('Objednávka', 'Objednávka'), tr('je zrušená', 'je zrušená'), tr('Ak ide o omyl, odpíšte nám na e-mail.', 'Pokud jde o omyl, odepište nám na e-mail.')],
};

async function load() {
  if (!num || !tok) { showMine(); return; }
  let o;
  try { const r = await fetch(`${API}/track?c=${encodeURIComponent(num)}&t=${encodeURIComponent(tok)}`); if (!r.ok) throw new Error(r.status); o = await r.json(); }
  catch (e) { $('[data-load]').hidden = true; $('[data-none]').hidden = false; return; }
  // zapamätať do „mojich objednávok“
  try { const m = mine().filter((x) => x.c !== o.number); m.unshift({ c: o.number, t: tok, d: o.created, s: o.status, total: o.total }); localStorage.setItem(MINE, JSON.stringify(m.slice(0, 12))); } catch (e) { /* nič */ }
  paint(o);
}

function paint(o) {
  const P = VK.prices;
  $('[data-load]').hidden = true; $('[data-ok]').hidden = false;
  $('[data-num]').textContent = `${tr('Objednávka', 'Objednávka')} ${o.number} · ${day(o.created)}`;
  const h = HEAD[o.status] || HEAD.nova;
  $('[data-head]').innerHTML = `${esc(h[0])} <span class="hl-c">${esc(h[1])}</span>`;
  $('[data-lead]').textContent = h[2];
  // časová os
  const digOnly = o.items.every((i) => i.kind === 'digital');
  const steps = digOnly ? STEPS.slice(0, 3) : STEPS;
  const idx = o.status === 'hotovo' ? steps.length : steps.findIndex((s) => s[0] === o.status);
  const when = (s) => { const x = [...o.history].reverse().find((hh) => hh.s === s); return x ? day(x.t) : ''; };
  $('[data-tl]').innerHTML = o.status === 'zruseno' ? '' : steps.map(([k, label, txt], i) => `<li class="${i < idx ? 'ok' : i === idx ? 'on' : ''}"><b>${esc(label)}</b>${i === idx ? `<span>${esc(txt)}</span>` : ''}${when(k) && i <= idx ? `<time>${esc(when(k))}</time>` : ''}</li>`).join('');
  // platba
  if (o.pay) {
    $('[data-pay]').hidden = false;
    $('[data-qr]').innerHTML = o.pay.qr;
    const row = (k, v, copy) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}${copy ? ` <button class="cp" data-copy="${esc(copy)}">${tr('Kopírovať', 'Kopírovat')}</button>` : ''}</dd></div>`;
    $('[data-paydl]').innerHTML = row(tr('Suma', 'Částka'), money(o.pay.amount), String(o.pay.amount))
      + (o.pay.account ? row(tr('Číslo účtu', 'Číslo účtu'), o.pay.account, o.pay.account) : '')
      + row('IBAN', o.pay.iban, o.pay.iban.replace(/\s/g, ''))
      + row(tr('Variabilný symbol', 'Variabilní symbol'), o.pay.vs, o.pay.vs)
      + row(tr('Príjemca', 'Příjemce'), o.pay.name);
  }
  // zásielka a digitálna vizitka
  const sh = [];
  if (o.shipping?.number || o.shipping?.url) sh.push(`<div><b>${tr('Číslo zásielky', 'Číslo zásilky')}</b><span>${esc(o.shipping.number || '')}</span>${o.shipping.url ? `<a class="btn btn--sm" href="${esc(o.shipping.url)}" target="_blank" rel="noopener">${tr('Sledovať zásielku', 'Sledovat zásilku')} <span class="ar">→</span></a>` : ''}</div>`);
  if (o.digitalUrl) sh.push(`<div><b>${tr('Digitálna vizitka je online', 'Digitální vizitka je online')}</b><span>${esc(o.digitalUrl.replace(/^https?:\/\//, ''))}</span><a class="btn btn--sm btn--y" href="${esc(o.digitalUrl)}" target="_blank" rel="noopener">${tr('Otvoriť', 'Otevřít')} <span class="ar">→</span></a></div>`);
  if (!digOnly && !['odeslano', 'hotovo', 'zruseno'].includes(o.status)) {
    const ex = o.items.every((i) => i.config?.express || i.kind === 'digital');
    const base = o.history.find((hh) => hh.s === 'zaplaceno')?.t || new Date().toISOString();
    sh.push(`<div><b>${tr('Odhad doručenia', 'Odhad doručení')}</b><span>${esc(fmtDay(addWorkdays(new Date(base), deliveryDays(ex) - 1)))}${o.status === 'nova' || o.status === 'k_platbe' ? ' · ' + tr('ak zaplatíte dnes', 'pokud zaplatíte dnes') : ''}</span></div>`);
  }
  if (sh.length) { $('[data-ship]').hidden = false; $('[data-ship]').innerHTML = sh.join(''); }
  // položky
  const imgUrl = (n) => `${API}/track/img?c=${encodeURIComponent(o.number)}&t=${encodeURIComponent(tok)}&i=${n}`;
  $('[data-cards]').innerHTML = o.items.map((it) => `<div class="trk__it"><img src="${imgUrl(it.n)}" alt="" loading="lazy" onerror="this.remove()"><div><small>${esc(KIND[it.kind] || '')}</small><b>${esc(it.title)}</b><span>${esc(spec({ ...it.config, kind: it.kind }))}</span></div><em>${money(it.price)}</em></div>`).join('');
  $('[data-sum]').innerHTML = `<p><span>${tr('Doprava', 'Doprava')}</span><span>${tr('zadarmo', 'zdarma')}</span></p><p class="t"><span>${tr('Spolu', 'Celkem')}</span><b>${money(o.total)}</b></p>`;
  $('[data-mail]').href = `mailto:info@vizitkomat.eu?subject=${encodeURIComponent(tr('Objednávka ', 'Objednávka ') + o.number)}`;
}

function showMine() {
  $('[data-load]').hidden = true;
  const m = mine();
  if (!m.length) { $('[data-none]').hidden = false; return; }
  const box = $('[data-mine]'); box.hidden = false;
  box.innerHTML = `<h1 class="h-l">${tr('Moje', 'Moje')} <span class="hl-c">${tr('objednávky', 'objednávky')}</span></h1><ul class="mine">${m.map((x) => `<li><a href="?c=${encodeURIComponent(x.c)}&t=${encodeURIComponent(x.t)}"><b>${esc(x.c)}</b><span>${esc(new Date(x.d).toLocaleDateString(VK.lang === 'cz' ? 'cs-CZ' : 'sk-SK'))}</span><em>${money(x.total)}</em><i>→</i></a></li>`).join('')}</ul>`;
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); const t = b.textContent; b.textContent = tr('Skopírované', 'Zkopírováno'); setTimeout(() => { b.textContent = t; }, 1400); } catch (x) { /* nič */ }
});
load();
