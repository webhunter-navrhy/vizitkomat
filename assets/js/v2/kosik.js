// Košík a objednávka (v2)
import * as store from './store.js';
import { money, itemPrice, addWorkdays, fmtDay, session, deliveryDays } from '../util.js';
import { tr, SIZES, slugify } from './model.js';

const VK = window.VK, P = VK.prices;
const loadScript = (src) => new Promise((res, rej) => { if ([...document.scripts].some((x) => x.src === src)) return res(); const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = rej; document.head.append(sc); });
// tlačové dáta: PDF z editora alebo pôvodné súbory zákazníka
async function printFiles(it) {
  const d = it.design || {};
  if (d.custom) { const out = {}; if (d.files?.front?.orig) out.predna = d.files.front.orig; if (d.files?.back?.orig && d.files.backMode === 'file') out.zadna = d.files.back.orig; return out; }
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const { exportPDF, snapshot } = await import('./render.js');
  const dd = { ...d }; if (dd.sides && !(dd.sides.front || dd.sides.back)) delete dd.sides;
  const out = {};
  if (it.kind !== 'digital') out.tlac = await exportPDF(dd, 'tlac.pdf', { dataUrl: true });
  if (it.kind === 'bundle' || it.kind === 'digital') { out['karta-f'] = await snapshot(dd, 'front', 1100, 'image/jpeg', 0.88); out['karta-b'] = await snapshot(dd, 'back', 1100, 'image/jpeg', 0.88); }
  return out;
}
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KIND = { bundle: tr('Tlačené + digitálna', 'Tištěné + digitální'), print: tr('Tlačené vizitky', 'Tištěné vizitky'), digital: tr('Digitálna vizitka', 'Digitální vizitka') };
const PAPER = { matny: tr('matný 350 g', 'matný 350 g'), triplex: 'Triplex 720 g' };
const FIN = { none: '', matna: tr('matná laminácia', 'matná laminace'), leskla: tr('lesklá laminácia', 'lesklá laminace'), soft: 'soft-touch' };
function specs(c, it) {
  if (c.kind === 'digital') return [tr('jednorazovo, bez predplatného', 'jednorázově, bez předplatného')];
  if (it?.design?.custom) return [tr('vlastný návrh', 'vlastní návrh'), SIZES[c.size]?.label, PAPER[c.paper], c.paper !== 'triplex' && FIN[c.finish], c.corners === 'round' && tr('zaoblené rohy', 'zaoblené rohy'), c.express && 'expres'].filter(Boolean);
  return [SIZES[c.size]?.label, PAPER[c.paper], c.paper !== 'triplex' && FIN[c.finish], c.corners === 'round' && tr('zaoblené rohy', 'zaoblené rohy'), c.express && 'expres', c.kind === 'bundle' && tr('+ digitálna zadarmo', '+ digitální zdarma')].filter(Boolean);
}
function arrival(items) { const now = new Date(); const ex = items.every((i) => i.config.express || i.kind === 'digital'); return addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + deliveryDays(ex)); }

let items = [];
// výhodnejšia ponuka k položke: viac kusov alebo lepší papier
function upsell(it) {
  const c = it.config; if (c.kind === 'digital') return '';
  const now = itemPrice(c), out = [];
  const nq = P.qty[P.qty.indexOf(c.qty) + 1];
  if (nq) {
    const np = itemPrice({ ...c, qty: nq }), diff = np - now;
    if (diff <= now * 0.5) out.push(`<button data-up="${it.id}" data-qty-to="${nq}"><b>${tr(`${nq} ks za +${money(diff)}`, `${nq} ks za +${money(diff)}`)}</b><small>${tr('cena za kus', 'cena za kus')} ${money(np / nq, { decimals: 2 })} ${tr('namiesto', 'místo')} ${money(now / c.qty, { decimals: 2 })}</small></button>`);
  }
  if (c.paper === 'matny' && (c.finish || 'none') === 'none' && !it.design?.custom) {
    const sp = itemPrice({ ...c, finish: 'soft' });
    out.push(`<button data-up="${it.id}" data-soft="1"><b>${tr('Zamatový soft-touch', 'Sametový soft-touch')} +${money(sp - now)}</b><small>${tr('najobľúbenejší, príjemný na dotyk', 'nejoblíbenější, příjemný na dotek')}</small></button>`);
  }
  return out.length ? `<div class="it__up">${out.join('')}</div>` : '';
}
// odpočet: do 14:00 v pracovný deň ideme o deň skôr
function deadline() {
  const n = new Date(), d = n.getDay();
  if (d === 0 || d === 6 || n.getHours() >= 14) return '';
  const left = (14 * 60) - (n.getHours() * 60 + n.getMinutes());
  const h = Math.floor(left / 60), m = left % 60;
  return tr(`Objednajte do 14:00 (zostáva ${h ? h + ' h ' : ''}${m} min) a počítame s týmto termínom.`, `Objednejte do 14:00 (zbývá ${h ? h + ' h ' : ''}${m} min) a počítáme s tímto termínem.`);
}
async function paint() {
  items = await store.cartItems();
  $('[data-empty]').hidden = !!items.length; $('[data-full]').hidden = !items.length;
  try { $('[data-mine-link]').hidden = !JSON.parse(localStorage.getItem('vk2-orders') || '[]').length; } catch (e) { /* nič */ }
  if (!items.length) return;
  $('[data-team-box]').hidden = !items.some((i) => !i.design?.custom && i.kind !== 'digital');
  $('[data-items]').innerHTML = items.map((it) => {
    const c = it.config;
    const q = c.kind === 'digital' ? '' : `<label class="it__q"><span class="sr">${tr('Počet kusov', 'Počet kusů')}</span><select data-qty="${it.id}">${P.qty.map((n) => `<option value="${n}"${n === c.qty ? ' selected' : ''}>${n} ${tr('ks', 'ks')}</option>`).join('')}</select></label>`;
    return `<li class="it"><div class="it__v">${it.thumb ? `<img src="${it.thumb}" alt="">` : ''}${it.thumbBack ? `<img src="${it.thumbBack}" alt="">` : ''}</div>
      <div class="it__b"><p class="it__k">${KIND[it.kind] || ''}</p><h3>${esc(it.title)}</h3><p class="it__s">${specs(c, it).map(esc).join(' · ')}</p>
      <div class="it__a">${q}${it.design?.custom ? '' : `<button data-edit="${it.id}">${tr('Upraviť', 'Upravit')}</button><button data-team="${it.id}">+ ${tr('Kolega', 'Kolega')}</button>`}<button data-del="${it.id}">${tr('Odstrániť', 'Odstranit')}</button></div></div>
      ${upsell(it)}
      <b class="it__p">${money(itemPrice(c))}</b></li>`;
  }).join('');
  const total = items.reduce((s, it) => s + itemPrice(it.config), 0);
  $('[data-lines]').innerHTML = items.map((it) => `<p><span>${esc(it.title)} <i>${it.kind === 'digital' ? tr('digitálna', 'digitální') : it.config.qty + ' ' + tr('ks', 'ks')}</i></span><span>${money(itemPrice(it.config))}</span></p>`).join('') + `<p><span>${tr('Doprava', 'Doprava')}</span><span>${tr('zadarmo', 'zdarma')}</span></p>`;
  $('[data-total]').textContent = money(total);
  const dig = items.every((i) => i.kind === 'digital');
  $('[data-ship-fs]').hidden = dig;
  $$('[data-ship-fs] [required]').forEach((i) => { i.required = !dig; });
  $('[data-date]').innerHTML = dig ? tr('Digitálnu vizitku zapneme hneď po zaplatení.', 'Digitální vizitku zapneme hned po zaplacení.') : `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(arrival(items))}${deadline() ? `<small>${deadline()}</small>` : ''}`;
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
document.addEventListener('click', async (e) => {
  const u = e.target.closest('[data-up]'); if (!u) return;
  const it = items.find((x) => x.id === u.dataset.up); if (!it) return;
  if (u.dataset.qtyTo) await store.cartUpdate(it.id, { config: { qty: +u.dataset.qtyTo } });
  if (u.dataset.soft) await store.cartUpdate(it.id, { config: { finish: 'soft' } });
  paint();
});
setInterval(() => { if (items.length) paint(); }, 60000);
// IČO → údaje firmy z ARES / RPO
let icoT;
$('[data-ico]').addEventListener('input', (e) => {
  clearTimeout(icoT);
  const v = e.target.value.replace(/\s/g, ''), st = $('[data-ico-st]'), f = $('[data-checkout]');
  if (!/^\d{8}$/.test(v)) return;
  icoT = setTimeout(async () => {
    st.textContent = tr('hľadám…', 'hledám…');
    try {
      const land = f.country?.value === 'SK' ? 'sk' : 'cz';
      const r = await fetch(`${VK.orderEndpoint.replace(/\/order$/, '')}/firma?ico=${v}&land=${land}`);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      f.company.value = j.company || f.company.value;
      if (j.dic && f.dic && !f.dic.value) f.dic.value = j.dic;
      if (!f.street.value && j.street) { f.street.value = j.street; f.city.value = j.city; f.zip.value = j.zip; if (f.country && j.country) f.country.value = j.country; }
      st.textContent = tr('✓ doplnené z registra', '✓ doplněno z ARES');
    } catch (x) { st.textContent = tr('firmu sme nenašli, vyplňte ručne', 'firmu jsme nenašli, vyplňte ručně'); }
  }, 300);
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
  const order = { number: 'VK' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(Math.random() * 900 + 100), lang: VK.lang, currency: P.currency, total: items.reduce((s, it) => s + itemPrice(it.config), 0), customer: { ...data, terms: !!data.terms }, items: [] };
  const btn = f.querySelector('.co__go'); const btnLabel = btn.innerHTML; btn.disabled = true; btn.textContent = tr('Pripravujem tlačové dáta…', 'Připravuji tisková data…');
  let sent = false;
  if (VK.orderEndpoint) {
    try {
      for (const it of items) order.items.push({ kind: it.kind, config: it.config, title: it.title, design: it.design, thumb: it.thumb, files: await printFiles(it) });
      btn.textContent = tr('Odosielam objednávku…', 'Odesílám objednávku…');
      const r = await fetch(VK.orderEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(order) });
      if (!r.ok) throw new Error('http ' + r.status);
      const j = await r.json().catch(() => ({}));
      if (j.number) order.number = j.number;
      if (j.token) {
        order.track = `${VK.links.objednavka}?c=${encodeURIComponent(j.number)}&t=${encodeURIComponent(j.token)}`;
        try { const m = JSON.parse(localStorage.getItem('vk2-orders') || '[]').filter((x) => x.c !== j.number); m.unshift({ c: j.number, t: j.token, d: new Date().toISOString(), s: 'nova', total: j.total ?? order.total }); localStorage.setItem('vk2-orders', JSON.stringify(m.slice(0, 12))); } catch (x) { /* nič */ }
      }
      if (typeof j.total === 'number') order.total = j.total;
      if (j.payUrl) { await store.cartClear(); location.href = j.payUrl; return; }
      sent = true;
    } catch (x) {
      // objednávka neodišla: košík ostáva, zákazník môže skúsiť znova
      console.error(x);
      btn.disabled = false; btn.innerHTML = btnLabel;
      err.hidden = false; err.textContent = tr('Objednávku sa nepodarilo odoslať. Skúste to, prosím, o chvíľu znova alebo nám napíšte na info@vizitkomat.eu.', 'Objednávku se nepodařilo odeslat. Zkuste to prosím za chvíli znovu nebo nám napište na info@vizitkomat.eu.');
      return;
    }
  }
  $('[data-full]').hidden = true; $('.cart__head').hidden = true; $('[data-done]').hidden = false;
  $('[data-done-num]').textContent = tr('Objednávka ', 'Objednávka ') + order.number;
  $('[data-done-img]').src = items[0]?.thumb || '';
  $('[data-done-date]').textContent = `${tr('Odhadom', 'Odhadem')} ${fmtDay(arrival(items))}`;
  if (order.track) { const a = $('[data-done-track]'); a.href = order.track; a.hidden = false; }
  if (sent) { $('[data-done-lead]').textContent = tr(`Potvrdenie sme poslali na ${data.email}. Suma ${money(order.total)} sa platí až po kontrole návrhu.`, `Potvrzení jsme poslali na ${data.email}. Částka ${money(order.total)} se platí až po kontrole návrhu.`); await store.cartClear(); }
  else { $('[data-done-lead]').textContent = tr(`Toto je ukážka potvrdenia. Suma ${money(order.total)}.`, `Toto je ukázka potvrzení. Částka ${money(order.total)}.`); const t = $('[data-done-test]'); t.hidden = false; t.textContent = tr('Testovacia prevádzka: e-shop ešte nie je napojený na platobnú bránu, objednávka sa nikam neodoslala.', 'Zkušební provoz: e-shop ještě není napojený na platební bránu, objednávka se nikam neodeslala.'); }
  scrollTo({ top: 0, behavior: 'smooth' });
});
window.addEventListener('vk:cart', paint);

/* ---------- kolegovia: rovnaký dizajn, iné údaje ---------- */
const dlg = $('[data-team-dlg]'), tf = $('[data-team-form]');
let teamSrc = null, prevTok = 0;
// prepíše texty naviazané na polia aj v ručne upravených stranách
function withFields(design, f) {
  const d = JSON.parse(JSON.stringify(design));
  d.f = { ...d.f, ...f };
  d.slug = slugify(d.f.name); d.qrUrl = `https://vizitkomat.eu/v/${d.slug}/`;
  for (const side of ['front', 'back']) {
    const js = d.sides?.[side]; if (!js) continue;
    (js.objects || []).forEach((o) => {
      const k = o.data?.field; if (!k || !(k in f)) return;
      const v = f[k] || '';
      if (o.data.part != null) { const w = v.trim().split(/\s+/); o.text = o.data.part === 0 ? (w.length > 1 ? w.slice(0, -1).join(' ') : v) : (w.length > 1 ? w[w.length - 1] : ''); }
      else o.text = (o.data.prefix || '') + (o.data.upper ? v.toLocaleUpperCase() : v);
    });
  }
  return d;
}
async function renderer() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');
  return import('./render.js');
}
const teamFields = () => { const fd = new FormData(tf); return { name: fd.get('name').trim(), role: fd.get('role').trim(), phone: fd.get('phone').trim(), email: fd.get('email').trim() }; };
let prevT;
async function teamPreview() {
  if (!teamSrc) return; const tok = ++prevTok;
  const f = teamFields(); if (!f.name) return;
  const { snapshot } = await renderer();
  const u = await snapshot(withFields(teamSrc.design, f), 'front', 760, 'image/jpeg', 0.86);
  if (tok === prevTok) $('[data-team-img]').src = u;
}
function openTeam(id) {
  teamSrc = items.find((x) => x.id === id) || items.find((x) => !x.design?.custom && x.kind !== 'digital');
  if (!teamSrc) return;
  tf.reset();
  $('[data-team-src]').textContent = teamSrc.title;
  $('[data-team-img]').src = teamSrc.thumb || '';
  // doména e-mailu ako nápoveda
  const dom = (teamSrc.design?.f?.email || '').split('@')[1];
  tf.email.placeholder = dom ? `kolega@${dom}` : '';
  dlg.showModal(); tf.name.focus();
  renderer();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-team]'); if (b) openTeam(b.dataset.team);
  if (e.target.closest('[data-team-open]')) openTeam();
});
tf.addEventListener('input', () => { clearTimeout(prevT); prevT = setTimeout(teamPreview, 260); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
tf.addEventListener('submit', async (e) => {
  if (e.submitter?.value !== 'ok') return;
  e.preventDefault();
  const f = teamFields();
  if (!f.name) { tf.name.focus(); return; }
  const go = $('[data-team-go]'); go.disabled = true;
  try {
    const { snapshot } = await renderer();
    const d = withFields(teamSrc.design, f);
    const [front, back] = await Promise.all([snapshot(d, 'front', 640, 'image/jpeg'), snapshot(d, 'back', 640, 'image/jpeg')]);
    await store.cartAdd({ kind: teamSrc.kind, config: { ...teamSrc.config }, design: d, thumb: front, thumbBack: back, title: f.name });
    dlg.close();
    toastMsg(tr(`${f.name} je v košíku.`, `${f.name} je v košíku.`));
  } finally { go.disabled = false; }
});
function toastMsg(t) { import('./site.js').then((m) => m.toast?.(t)).catch(() => {}); }
