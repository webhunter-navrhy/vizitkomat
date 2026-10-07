// Košík a objednávka (v2)
import * as store from './store.js';
import { money, itemPrice, addWorkdays, fmtDay, session } from '../util.js';
import { tr, SIZES } from './model.js';

const VK = window.VK, P = VK.prices;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KIND = { bundle: tr('Tlačené + digitálna', 'Tištěné + digitální'), print: tr('Tlačené vizitky', 'Tištěné vizitky'), digital: tr('Digitálna vizitka', 'Digitální vizitka') };
const PAPER = { matny: tr('matný 350 g', 'matný 350 g'), triplex: 'Triplex 720 g' };
const FIN = { none: '', matna: tr('matná laminácia', 'matná laminace'), leskla: tr('lesklá laminácia', 'lesklá laminace'), soft: 'soft-touch' };
function specs(c, it) {
  if (c.kind === 'digital') return [tr('12 mesiacov', '12 měsíců')];
  if (it?.design?.custom) return [tr('vlastný návrh', 'vlastní návrh'), SIZES[c.size]?.label, PAPER[c.paper], c.paper !== 'triplex' && FIN[c.finish], c.corners === 'round' && tr('zaoblené rohy', 'zaoblené rohy'), c.express && 'expres'].filter(Boolean);
  return [SIZES[c.size]?.label, PAPER[c.paper], c.paper !== 'triplex' && FIN[c.finish], c.corners === 'round' && tr('zaoblené rohy', 'zaoblené rohy'), c.express && 'expres', c.kind === 'bundle' && tr('+ digitálna na rok zadarmo', '+ digitální na rok zdarma')].filter(Boolean);
}
function arrival(items) { const now = new Date(); const ex = items.every((i) => i.config.express || i.kind === 'digital'); return addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + (ex ? 2 : 4)); }

let items = [];
async function paint() {
  items = await store.cartItems();
  $('[data-empty]').hidden = !!items.length; $('[data-full]').hidden = !items.length;
  if (!items.length) return;
  $('[data-items]').innerHTML = items.map((it) => {
    const c = it.config;
    const q = c.kind === 'digital' ? '' : `<label class="it__q"><span class="sr">${tr('Počet kusov', 'Počet kusů')}</span><select data-qty="${it.id}">${P.qty.map((n) => `<option value="${n}"${n === c.qty ? ' selected' : ''}>${n} ${tr('ks', 'ks')}</option>`).join('')}</select></label>`;
    return `<li class="it"><div class="it__v">${it.thumb ? `<img src="${it.thumb}" alt="">` : ''}${it.thumbBack ? `<img src="${it.thumbBack}" alt="">` : ''}</div>
      <div class="it__b"><p class="it__k">${KIND[it.kind] || ''}</p><h3>${esc(it.title)}</h3><p class="it__s">${specs(c, it).map(esc).join(' · ')}</p>
      <div class="it__a">${q}${it.design?.custom ? '' : `<button data-edit="${it.id}">${tr('Upraviť', 'Upravit')}</button>`}<button data-del="${it.id}">${tr('Odstrániť', 'Odstranit')}</button></div></div>
      <b class="it__p">${money(itemPrice(c))}</b></li>`;
  }).join('');
  const total = items.reduce((s, it) => s + itemPrice(it.config), 0);
  $('[data-lines]').innerHTML = items.map((it) => `<p><span>${esc(it.title)} <i>${it.kind === 'digital' ? tr('digitálna', 'digitální') : it.config.qty + ' ' + tr('ks', 'ks')}</i></span><span>${money(itemPrice(it.config))}</span></p>`).join('') + `<p><span>${tr('Doprava', 'Doprava')}</span><span>${tr('zadarmo', 'zdarma')}</span></p>`;
  $('[data-total]').textContent = money(total);
  const dig = items.every((i) => i.kind === 'digital');
  $('[data-ship-fs]').hidden = dig;
  $$('[data-ship-fs] [required]').forEach((i) => { i.required = !dig; });
  $('[data-date]').textContent = dig ? tr('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.') : `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(arrival(items))}`;
}
document.addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del]'); if (del) { await store.cartRemove(del.dataset.del); paint(); }
  const ed = e.target.closest('[data-edit]');
  if (ed) {
    const it = items.find((x) => x.id === ed.dataset.edit); if (!it) return;
    const d = { ...it.design }; const sides = d.sides; delete d.sides;
    await store.set('studio-v2', { d, sides: sides && (sides.front || sides.back) ? sides : null, custom: { front: !!(sides && sides.front), back: !!(sides && sides.back) }, cfg: it.config });
    await store.cartRemove(it.id);
    location.href = VK.links.tvorba + '?rezim=texty';
  }
});
document.addEventListener('change', async (e) => { const s = e.target.closest('[data-qty]'); if (s) { await store.cartUpdate(s.dataset.qty, { config: { qty: +s.value } }); paint(); } });
$('[data-company-toggle]').addEventListener('change', (e) => { $('[data-company]').hidden = !e.target.checked; });

(async function prefill() {
  await paint();
  const f = $('[data-checkout]'), d = items[0]?.design?.f || {};
  let saved = null; try { saved = JSON.parse(localStorage.getItem('vk2-checkout') || 'null'); } catch (x) { /* nič */ }
  const vals = { name: d.name, email: d.email, phone: d.phone, ...(saved || {}) };
  for (const [k, v] of Object.entries(vals)) if (f[k] && v && !f[k].value && f[k].type !== 'checkbox') f[k].value = v;
})();

$('[data-checkout]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget, err = $('[data-err]');
  const bad = [...f.querySelectorAll('[required]')].filter((i) => !i.closest('[hidden]') && (i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value))));
  $$('.fl.bad', f).forEach((x) => x.classList.remove('bad'));
  bad.forEach((i) => i.closest('.fl')?.classList.add('bad'));
  if (bad.length) { err.hidden = false; err.textContent = bad.length === 1 && bad[0].name === 'terms' ? tr('Potvrďte, prosím, súhlas s podmienkami.', 'Potvrďte prosím souhlas s podmínkami.') : tr('Doplňte, prosím, zvýraznené polia.', 'Doplňte prosím zvýrazněná pole.'); bad[0].focus(); return; }
  err.hidden = true;
  const data = Object.fromEntries(new FormData(f).entries());
  try { localStorage.setItem('vk2-checkout', JSON.stringify({ name: data.name, email: data.email, phone: data.phone, street: data.street, city: data.city, zip: data.zip, company: data.company, ico: data.ico, dic: data.dic })); } catch (x) { /* nič */ }
  const order = { number: 'VK' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(Math.random() * 900 + 100), lang: VK.lang, currency: P.currency, total: items.reduce((s, it) => s + itemPrice(it.config), 0), customer: data, items: items.map((it) => ({ kind: it.kind, config: it.config, design: it.design, price: itemPrice(it.config) })) };
  const btn = f.querySelector('.co__go'); const btnLabel = btn.innerHTML; btn.disabled = true; btn.textContent = tr('Odosielam…', 'Odesílám…');
  let sent = false;
  if (VK.orderEndpoint) {
    try {
      const r = await fetch(VK.orderEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(order) });
      if (!r.ok) throw new Error('http ' + r.status);
      const j = await r.json().catch(() => ({}));
      if (j.number) order.number = j.number;
      if (j.payUrl) { await store.cartClear(); location.href = j.payUrl; return; }
      sent = true;
    } catch (x) {
      // objednávka neodišla: košík ostáva, zákazník môže skúsiť znova
      btn.disabled = false; btn.innerHTML = btnLabel;
      err.hidden = false; err.textContent = tr('Objednávku sa nepodarilo odoslať. Skúste to, prosím, o chvíľu znova alebo nám napíšte na info@vizitkomat.eu.', 'Objednávku se nepodařilo odeslat. Zkuste to prosím za chvíli znovu nebo nám napište na info@vizitkomat.eu.');
      return;
    }
  }
  $('[data-full]').hidden = true; $('.cart__head').hidden = true; $('[data-done]').hidden = false;
  $('[data-done-num]').textContent = tr('Objednávka ', 'Objednávka ') + order.number;
  $('[data-done-img]').src = items[0]?.thumb || '';
  $('[data-done-date]').textContent = `${tr('Odhadom', 'Odhadem')} ${fmtDay(arrival(items))}`;
  if (sent) { $('[data-done-lead]').textContent = tr(`Potvrdenie sme poslali na ${data.email}.`, `Potvrzení jsme poslali na ${data.email}.`); await store.cartClear(); }
  else { $('[data-done-lead]').textContent = tr(`Toto je ukážka potvrdenia. Suma ${money(order.total)}.`, `Toto je ukázka potvrzení. Částka ${money(order.total)}.`); const t = $('[data-done-test]'); t.hidden = false; t.textContent = tr('Testovacia prevádzka: e-shop ešte nie je napojený na platobnú bránu, objednávka sa nikam neodoslala.', 'Zkušební provoz: e-shop ještě není napojený na platební bránu, objednávka se nikam neodeslala.'); }
  scrollTo({ top: 0, behavior: 'smooth' });
});
window.addEventListener('vk:cart', paint);
