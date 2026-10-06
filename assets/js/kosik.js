// Košík a objednávka
import { getCart, removeItem, updateItem, clearCart } from './cart.js';
import { $, $$, T, VK, money, itemPrice, addWorkdays, fmtDay, session, store } from './util.js';

const P = VK.prices;
const PAPER = { matny: T('Matný 350 g', 'Matný 350 g'), triplex: 'Triplex 720 g' };
const FINISH = { none: T('bez úpravy', 'bez úpravy'), matna: T('matná laminácia', 'matná laminace'), leskla: T('lesklá laminácia', 'lesklá laminace'), soft: 'soft-touch' };
const KIND = { bundle: T('Tlačené + digitálna', 'Tištěné + digitální'), print: T('Tlačené vizitky', 'Tištěné vizitky'), digital: T('Digitálna vizitka', 'Digitální vizitka') };
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function specs(c) {
  if (c.kind === 'digital') return [T('12 mesiacov', '12 měsíců'), 'vizitkomat.eu/v/…'];
  const out = [c.size.replace('x', ' × ') + ' mm', PAPER[c.paper]];
  if (c.paper !== 'triplex') out.push(FINISH[c.finish || 'none']);
  if (c.corners === 'round') out.push(T('zaoblené rohy', 'zaoblené rohy'));
  if (c.express) out.push(T('expres', 'expres'));
  if (c.kind === 'bundle') out.push(T('+ digitálna na rok zadarmo', '+ digitální na rok zdarma'));
  return out;
}
function arrival(items) {
  const now = new Date();
  const express = items.length && items.every((i) => i.config.express || i.kind === 'digital');
  return addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + (express ? 2 : 4));
}

function paint() {
  const items = getCart();
  $('[data-empty]').hidden = !!items.length;
  $('[data-full]').hidden = !items.length;
  if (!items.length) return;
  $('[data-items]').innerHTML = items.map((it) => {
    const c = it.config;
    const qtySel = c.kind === 'digital' ? '' : `<label class="ci__qty"><span class="sr">${T('Počet kusov', 'Počet kusů')}</span><select data-qty="${it.id}">${P.qty.map((q) => `<option value="${q}"${q === c.qty ? ' selected' : ''}>${q} ${T('ks', 'ks')}</option>`).join('')}</select></label>`;
    return `<li class="ci" data-id="${it.id}">
      <div class="ci__vis${c.kind === 'digital' ? ' ci__vis--digital' : ''}">
        ${it.thumb ? `<img src="${it.thumb}" alt="">` : ''}${it.thumbBack ? `<img class="ci__back" src="${it.thumbBack}" alt="">` : ''}
      </div>
      <div class="ci__body">
        <p class="ci__kind">${KIND[it.kind] || ''}</p>
        <h3>${esc(it.title)}</h3>
        <p class="ci__spec">${specs(c).map(esc).join(' · ')}</p>
        ${it.custom ? `<p class="ci__file">${T('Vlastný súbor', 'Vlastní soubor')}: ${esc([it.custom.front?.name, it.custom.back?.name].filter(Boolean).join(', '))}</p>` : ''}
        <div class="ci__acts">${qtySel}<button data-edit="${it.id}">${T('Upraviť návrh', 'Upravit návrh')}</button><button data-del="${it.id}">${T('Odstrániť', 'Odstranit')}</button></div>
      </div>
      <b class="ci__price">${money(itemPrice(c))}</b>
    </li>`;
  }).join('');

  const total = items.reduce((s, it) => s + itemPrice(it.config), 0);
  $('[data-lines]').innerHTML = items.map((it) => `<p><span>${esc(it.title)} <i>${it.kind === 'digital' ? T('digitálna', 'digitální') : it.config.qty + ' ' + T('ks', 'ks')}</i></span><span>${money(itemPrice(it.config))}</span></p>`).join('')
    + `<p><span>${T('Doprava', 'Doprava')}</span><span>${T('zadarmo', 'zdarma')}</span></p>`;
  $('[data-total]').textContent = money(total);
  const onlyDigital = items.every((i) => i.kind === 'digital');
  $('[data-ship-fs]').hidden = onlyDigital;
  $$('[data-ship-fs] [required]').forEach((i) => { i.required = !onlyDigital; });
  $('[data-date]').textContent = onlyDigital ? T('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.') : `${T('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(arrival(items))}`;
}

document.addEventListener('click', (e) => {
  const del = e.target.closest('[data-del]');
  if (del) { const li = del.closest('.ci'); li.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateX(-12px)' }], { duration: 250 }).onfinish = () => { removeItem(del.dataset.del); paint(); }; }
  const ed = e.target.closest('[data-edit]');
  if (ed) {
    const it = getCart().find((x) => x.id === ed.dataset.edit);
    if (it) {
      session('vk-draft', it.design);
      const saved = store('vk-studio-v1') || {};
      store('vk-studio-v1', { ...saved, d: it.design, cfg: it.config });
      removeItem(it.id);
      location.href = VK.links.tvorba;
    }
  }
});
document.addEventListener('change', (e) => {
  const s = e.target.closest('[data-qty]');
  if (s) { updateItem(s.dataset.qty, { config: { qty: +s.value } }); paint(); }
});

// firma
$('[data-company-toggle]').addEventListener('change', (e) => { $('[data-company]').hidden = !e.target.checked; });
// predvyplnenie z návrhu
(function prefill() {
  const it = getCart()[0]; const f = $('[data-checkout]');
  if (!it) return;
  const d = it.design?.f || {};
  if (d.name && !f.name.value) f.name.value = d.name;
  if (d.email && !f.email.value) f.email.value = d.email;
  if (d.phone && !f.phone.value) f.phone.value = d.phone;
  const saved = store('vk-checkout');
  if (saved) for (const [k, v] of Object.entries(saved)) if (f[k] && f[k].type !== 'checkbox' && f[k].type !== 'radio' && !f[k].value) f[k].value = v;
})();

$('[data-checkout]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const err = $('[data-err]');
  const bad = [...f.querySelectorAll('[required]')].filter((i) => !i.closest('[hidden]') && (i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value))));
  $$('.fl.bad', f).forEach((x) => x.classList.remove('bad'));
  bad.forEach((i) => i.closest('.fl')?.classList.add('bad'));
  if (bad.length) {
    err.hidden = false;
    err.textContent = bad.some((i) => i.name === 'terms') && bad.length === 1 ? T('Potvrďte, prosím, súhlas s obchodnými podmienkami.', 'Potvrďte prosím souhlas s obchodními podmínkami.') : T('Doplňte, prosím, zvýraznené polia.', 'Doplňte prosím zvýrazněná pole.');
    bad[0].focus();
    return;
  }
  err.hidden = true;
  const data = Object.fromEntries(new FormData(f).entries());
  store('vk-checkout', { name: data.name, email: data.email, phone: data.phone, street: data.street, city: data.city, zip: data.zip, company: data.company, ico: data.ico, dic: data.dic });
  const items = getCart();
  const order = {
    number: 'VK' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(Math.random() * 900 + 100),
    lang: VK.lang, currency: P.currency, total: items.reduce((s, it) => s + itemPrice(it.config), 0),
    customer: data, items: items.map((it) => ({ kind: it.kind, config: it.config, design: it.design, custom: it.custom, price: itemPrice(it.config) })),
  };
  const btn = f.querySelector('.co__go'); btn.disabled = true; btn.textContent = T('Odosielam…', 'Odesílám…');
  let sent = false;
  if (VK.orderEndpoint) {
    try {
      const r = await fetch(VK.orderEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(order) });
      if (r.ok) { const j = await r.json().catch(() => ({})); if (j.number) order.number = j.number; if (j.payUrl) { location.href = j.payUrl; return; } sent = true; }
    } catch (x) { /* nižšie */ }
  }
  showDone(order, items, sent);
});

function showDone(order, items, sent) {
  $('[data-full]').hidden = true; $('[data-empty]').hidden = true;
  $('.cart__head').hidden = true;
  const d = $('[data-done]'); d.hidden = false;
  $('[data-done-num]').textContent = order.number;
  $('[data-done-img]').src = items[0]?.thumb || '';
  $('[data-done-lead]').textContent = T(`Potvrdenie sme poslali na ${order.customer.email}. Suma ${money(order.total)}.`, `Potvrzení jsme poslali na ${order.customer.email}. Částka ${money(order.total)}.`);
  $('[data-done-date]').textContent = `${T('Odhadom', 'Odhadem')} ${fmtDay(arrival(items))}.`;
  if (!sent) {
    const t = $('[data-done-test]'); t.hidden = false;
    t.textContent = T('Testovacia prevádzka: e-shop ešte nie je napojený na platobnú bránu, objednávka sa nikam neodoslala.', 'Zkušební provoz: e-shop ještě není napojený na platební bránu, objednávka se nikam neodeslala.');
    $('[data-done-lead]').textContent = T(`Toto je ukážka potvrdenia. Suma ${money(order.total)}.`, `Toto je ukázka potvrzení. Částka ${money(order.total)}.`);
  } else clearCart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

paint();
window.addEventListener('vk:cart', paint);
