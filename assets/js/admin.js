// Administrace Vizitkomat – objednávky, ceník s marží, nastavení. Data: vizitkomat-api (/admin/api/…)
const API = window.VKA.api;
const app = document.getElementById('app');
let token = (() => { try { return localStorage.getItem('vka-token'); } catch (e) { return null; } })();
const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (v, cur) => `${new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(v || 0)} ${cur === 'EUR' ? '€' : 'Kč'}`;
const dt = (iso) => (iso ? new Date(iso).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
const slugify = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const ST = { nova: 'Nová', k_platbe: 'Čeká na platbu', zaplaceno: 'Zaplaceno', tisk: 'V tisku', odeslano: 'Odesláno', hotovo: 'Hotovo', zruseno: 'Zrušeno' };
const KIND = { bundle: 'Tištěné + digitální', print: 'Tištěné', digital: 'Digitální vizitka' };
const PAPER = { matny: 'matný 350 g', triplex: 'Triplex 720 g' };
const FIN = { none: '', matna: 'matná laminace', leskla: 'lesklá laminace', soft: 'soft-touch' };
const SIZE = { '90x50': '90 × 50 mm', '85x55': '85 × 55 mm', '55x55': '55 × 55 mm' };
const badge = (s) => `<span class="st st-${s}">${ST[s] || s}</span>`;
const fileUrl = (num, name) => `${API}/order/${num}/f/${encodeURIComponent(name)}?t=${encodeURIComponent(token)}`;

function toast(text) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = text; document.body.append(t); setTimeout(() => t.remove(), 3200); }
async function api(path, body) {
  const r = await fetch(`${API}/admin/api/${path}`, { method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${token}`, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== 'login') { logout(); throw new Error(j.error || 'Přihlaste se.'); }
  if (!r.ok) throw new Error(j.error || 'Chyba ' + r.status);
  return j;
}
let setup = null; // stav nastavení (bankovní účty) pro varování v hlavičce
const copyBtn = (text, label = 'Kopírovat') => `<button type="button" class="cp" data-copy="${esc(text)}" title="Zkopírovat">${label}</button>`;
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch (x) { const t = document.createElement('textarea'); t.value = b.dataset.copy; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  const o = b.textContent; b.textContent = '✓'; b.classList.add('ok'); setTimeout(() => { b.textContent = o; b.classList.remove('ok'); }, 1200);
});
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
function logout() { token = null; try { localStorage.removeItem('vka-token'); } catch (e) { /* nič */ } loginView(); }

/* ---------- přihlášení ---------- */
function loginView(err) {
  app.innerHTML = `<div class="login"><form data-login><span class="brand"><i></i>vizitkomat</span><h1>Administrace</h1>
    ${err ? `<p class="msg err">${esc(err)}</p>` : ''}
    <label class="f">Heslo<input type="password" name="pw" autocomplete="current-password" autofocus required></label>
    <button class="btn c" type="submit">Přihlásit</button></form></div>`;
  app.querySelector('[data-login]').addEventListener('submit', async (e) => {
    e.preventDefault();
    try { const j = await api('login', { password: e.target.pw.value }); token = j.token; try { localStorage.setItem('vka-token', token); } catch (x) { /* nič */ } location.hash = 'prehled'; route(); } catch (x) { loginView(x.message); }
  });
}

function shell(active, inner) {
  const nav = [['prehled', 'Přehled'], ['objednavky', 'Objednávky'], ['konverze', 'Konverze'], ['cenik', 'Ceník a marže'], ['hodnoceni', 'Hodnocení'], ['nastaveni', 'Nastavení']];
  const warn = setup && (!setup.eur || !setup.czk) ? `<a class="warnbar" href="#nastaveni"><b>Chybí bankovní účet${!setup.eur && !setup.czk ? 'y' : ''}</b> ${!setup.eur ? 'pro € (SK)' : ''}${!setup.eur && !setup.czk ? ' a ' : ''}${!setup.czk ? 'pro Kč (CZ)' : ''} – zákazníkům nepůjde poslat QR platbu. Doplnit →</a>` : '';
  app.innerHTML = `<header class="top"><span class="brand"><i></i>vizitkomat</span><nav>${nav.map(([h, l]) => `<a href="#${h}" class="${active === h ? 'on' : ''}">${l}</a>`).join('')}</nav><a href="${window.VKA.site}" target="_blank" class="top__web">Web ↗</a><button data-logout>Odhlásit</button></header>${warn}<main>${inner}</main>`;
  app.querySelector('[data-logout]').addEventListener('click', logout);
  return app.querySelector('main');
}

/* ---------- přehled: co je dnes potřeba udělat ---------- */
async function dashboardView() {
  const main = shell('prehled', '<h1 class="pg">Přehled</h1><p class="muted">Načítám…</p>');
  let d; try { d = await api('dashboard'); } catch (e) { main.innerHTML = `<p class="msg err">${esc(e.message)}</p>`; return; }
  if (JSON.stringify(setup) !== JSON.stringify(d.setup)) { setup = d.setup; return dashboardView(); }
  const T = d.todo;
  const rows = (list, extra = () => '') => (list.length ? `<ul class="tl">${list.map((o) => `<li><a href="#${o.number}"><b>${o.number}</b><span>${esc(o.n)}</span><em>${money(o.t, o.cur)}</em>${extra(o)}</a></li>`).join('')}</ul>` : '<p class="muted tl__none">Nic nečeká ✓</p>');
  const card = (cls, title, hint, list, extra) => `<section class="box todo ${list.length ? cls : 'done'}"><div class="todo__h"><b>${list.length}</b><div><h3>${title}</h3><p class="muted">${hint}</p></div></div>${rows(list, extra)}</section>`;
  const fin = (cur) => { const m = d.money[cur] || { rev: 0, cost: 0, n: 0 }; const mg = m.rev - m.cost; return `<div class="kpi"><span>${cur === 'EUR' ? 'Slovensko (€)' : 'Česko (Kč)'}</span><b>${money(m.rev, cur)}</b><small>${m.n} obj. · náklady ~${money(Math.round(m.cost), cur)} · marže <strong>${money(Math.round(mg), cur)}</strong> (${pct(mg, m.rev)} %)</small></div>`; };
  main.innerHTML = `<h1 class="pg">Přehled</h1>
    <div class="todos">
      ${card('hot', 'Zkontrolovat návrh', 'Projděte PDF a pošlete výzvu k platbě.', T.check)}
      ${card('warm', 'Čeká na platbu', 'Po 3 dnech jde automatická připomínka, tady ji pošlete ručně.', T.remind, (o) => `<i class="${o.days >= 3 ? 'late' : ''}">${o.days} d${o.reminded ? ' · připomenuto' : ''}</i>`)}
      ${card('hot', 'Objednat u Bizay', 'Zaplaceno – v detailu najdete přesné volby a PDF.', T.order)}
      ${card('warm', 'Zadat zásilku', 'Až Bizay odešle, vložte číslo zásilky DPD.', T.ship)}
      ${T.deliver.length ? card('', 'Ověřit doručení', 'Odesláno před víc než 14 dny – uzavřít jako hotovo.', T.deliver) : ''}
    </div>
    <section class="box"><h2>Tento měsíc (zaplacené objednávky)</h2><div class="kpis">${fin('EUR')}${fin('CZK')}</div><p class="muted" style="margin:12px 0 0">Náklady jsou odhad podle kalkulačky Bizay (bez slevy pro nové zákazníky, s DPH a dopravou), nebo skutečná cena, pokud ji zadáte při objednání tisku. <a href="#konverze">Konverze webu →</a></p></section>`;
}

/* ---------- objednávky ---------- */
let filter = 'aktivni', search = '';
async function ordersView() {
  const main = shell('objednavky', '<h1 class="pg">Objednávky</h1><p class="muted">Načítám…</p>');
  let list;
  try { list = await api('orders'); } catch (e) { main.innerHTML = `<p class="msg err">${esc(e.message)}</p>`; return; }
  const cnt = (s) => list.filter((o) => o.st === s).length;
  const month = new Date().toISOString().slice(0, 7);
  const paidSt = ['zaplaceno', 'tisk', 'odeslano', 'hotovo'];
  const rev = (cur) => list.filter((o) => o.cur === cur && paidSt.includes(o.st) && (o.c || '').startsWith(month)).reduce((s, o) => s + (o.t || 0), 0);
  const filters = [['aktivni', 'K vyřízení'], ['vse', 'Vše'], ...Object.entries(ST)];
  const draw = () => {
    const q = search.toLowerCase();
    const rows = list.filter((o) => (filter === 'vse' ? true : filter === 'aktivni' ? !['hotovo', 'zruseno'].includes(o.st) : o.st === filter) && (!q || o.number.toLowerCase().includes(q) || (o.n || '').toLowerCase().includes(q)));
    main.querySelector('[data-rows]').innerHTML = rows.length ? `<table><thead><tr><th>Číslo</th><th>Datum</th><th>Zákazník</th><th>Jazyk</th><th class="r">Částka</th><th>Stav</th></tr></thead><tbody>${rows.map((o) => `<tr data-go="${o.number}"><td class="num">${o.number}</td><td>${dt(o.c)}</td><td>${esc(o.n)}</td><td>${(o.l || '').toUpperCase()}</td><td class="r">${money(o.t, o.cur)}</td><td>${badge(o.st)}</td></tr>`).join('')}</tbody></table>` : '<p class="empty">Žádné objednávky v tomto filtru.</p>';
    main.querySelectorAll('[data-f]').forEach((b) => b.classList.toggle('on', b.dataset.f === filter));
  };
  main.innerHTML = `<h1 class="pg">Objednávky</h1>
    <div class="stats">
      <button class="stat${cnt('nova') ? ' hot' : ''}" data-f="nova"><b>${cnt('nova')}</b><span>Nové – zkontrolovat</span></button>
      <button class="stat" data-f="k_platbe"><b>${cnt('k_platbe')}</b><span>Čeká na platbu</span></button>
      <button class="stat${cnt('zaplaceno') ? ' hot' : ''}" data-f="zaplaceno"><b>${cnt('zaplaceno')}</b><span>Zaplaceno – objednat tisk</span></button>
      <button class="stat" data-f="tisk"><b>${cnt('tisk')}</b><span>V tisku – odeslat</span></button>
      <div class="stat" style="cursor:default"><b>${money(rev('EUR'), 'EUR')}</b><span>Tržby tento měsíc (SK)</span></div>
      <div class="stat" style="cursor:default"><b>${money(rev('CZK'), 'CZK')}</b><span>Tržby tento měsíc (CZ)</span></div>
    </div>
    <div class="box"><div class="bar">${filters.map(([k, l]) => `<button class="chip" data-f="${k}">${l}</button>`).join('')}<input type="search" placeholder="Hledat číslo nebo jméno" data-q value="${esc(search)}"></div><div data-rows></div></div>`;
  main.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]'); if (f) { filter = f.dataset.f; draw(); return; }
    const r = e.target.closest('[data-go]'); if (r) location.hash = r.dataset.go;
  });
  main.querySelector('[data-q]').addEventListener('input', (e) => { search = e.target.value; draw(); });
  draw();
}

/* ---------- detail objednávky ---------- */
async function detailView(num) {
  const main = shell('objednavky', `<a class="back" href="#objednavky">← Objednávky</a><p class="muted">Načítám ${esc(num)}…</p>`);
  let data;
  try { data = await api('order/' + num); } catch (e) { main.innerHTML = `<a class="back" href="#objednavky">← Objednávky</a><p class="msg err">${esc(e.message)}</p>`; return; }
  const { order: o, pay, carriers, track, bizay: B, mails } = data, c = o.customer, cur = o.currency;
  const mailNote = (k) => (mails?.[k] ? `<div class="mailprev"><span>Zákazník dostane e-mail</span><b>${esc(mails[k].subject)}</b><p>${esc(mails[k].text)}</p></div>` : '');
  const addr = [c.company, c.name, c.street, `${c.zip || ''} ${c.city || ''}`.trim(), c.country === 'CZ' ? 'Česká republika' : c.country === 'SK' ? 'Slovensko' : c.country, c.phone, c.email].filter(Boolean).join('\n');
  const pdfs = (o.files || []).filter((f) => /tlac|predna|zadna/.test(f.name));
  const bizayBox = B && B.items.length ? `<section class="box act bz"><div class="bz__h"><h3>Objednat u Bizay</h3><span class="mk">${B.market === 'CZ' ? 'bizay.cz · Kč' : 'bizay.sk · €'}</span><a class="btn sm c" href="${B.shop}" target="_blank" rel="noopener">Otevřít Bizay ↗</a></div>
      ${B.items.map((it) => `<div class="bz__item"><p class="muted" style="margin:0 0 6px">Položka ${it.n}</p><dl class="bz__dl">${it.choices.map(([k, v]) => `<dt>${esc(k)}</dt><dd><span>${esc(v)}</span>${copyBtn(v, '⧉')}</dd>`).join('')}</dl>
        <p class="bz__money">Prodej <b>${money(it.price, cur)}</b> · náklad Bizay ~<b>${it.cost != null ? money(it.cost, B.currency) : '?'}</b>${it.margin != null ? ` · marže <b class="${it.margin < 0 ? 'neg' : ''}">${money(it.margin, cur)}</b> (${pct(it.margin, it.price)} %)` : ''}${it.exact === false ? ' <span class="muted">(odhad)</span>' : ''}</p></div>`).join('')}
      <div class="bz__files">${pdfs.map((f) => `<a class="btn sm" href="${fileUrl(o.number, f.name)}&dl=${encodeURIComponent(`${o.number}-${f.name}`)}">⬇ ${esc(`${o.number}-${f.name}`)}</a>`).join('') || '<span class="muted">Bez tiskového PDF</span>'}</div>
      <p class="muted" style="margin:0">PDF má přední i zadní stranu (2 strany) se spadávkou 2 mm. U Bizay zvolte „Odoslať súbor“ / „Nahrát soubor“ a kontrolu návrhu nechte bez hodnocení (zdarma).</p>
      ${c.street ? `<div class="bz__addr"><div><b>Doručovací adresa</b><pre>${esc(addr)}</pre></div>${copyBtn(addr, 'Kopírovat adresu')}</div>` : ''}
    </section>` : '';

  const filesOf = (i) => (o.files || []).filter((f) => f.item === i);
  const specs = (cfg) => (cfg.kind === 'digital' ? 'jednorázově' : [SIZE[cfg.size] || cfg.size, PAPER[cfg.paper], cfg.paper !== 'triplex' && FIN[cfg.finish], cfg.corners === 'round' && 'zaoblené rohy', cfg.express && 'EXPRES', `${cfg.qty} ks`].filter(Boolean).join(' · '));
  const items = o.items.map((it, i) => {
    const fs = filesOf(i).filter((f) => !/karta-/.test(f.name));
    const dig = (it.kind === 'bundle' || it.kind === 'digital') && !it.custom;
    return `<div class="item"><a href="${fileUrl(o.number, `${it.n}-nahled.jpg`)}" target="_blank"><img src="${fileUrl(o.number, `${it.n}-nahled.jpg`)}" alt="" onerror="this.style.display='none'"></a>
      <div><h3>${KIND[it.kind] || it.kind}${it.custom ? ' · vlastní návrh' : ''} — ${money(it.price, cur)}</h3><p class="muted" style="margin:2px 0 0">${esc(specs(it.config))}</p>
      ${it.fields ? `<p class="muted" style="margin:4px 0 0">${esc([it.fields.name, it.fields.role, it.fields.company].filter(Boolean).join(' · '))}</p>` : ''}
      <div class="files">${fs.map((f) => `<a class="btn sm o" href="${fileUrl(o.number, f.name)}" target="_blank" download>⬇ ${esc(f.name)} <span class="muted">${Math.round(f.size / 1024)} kB</span></a>`).join('') || '<span class="muted">Bez tiskových souborů</span>'}</div>
      ${dig ? (o.digital ? `<p style="margin:10px 0 0">Digitální vizitka: <a href="${esc(o.digital.url)}" target="_blank">${esc(o.digital.url)}</a></p>` : `<div class="row" style="margin-top:10px"><label class="f">Adresa digitální vizitky<input data-slug value="${esc(slugify(it.fields?.name || c.name))}"></label><button class="btn sm c" data-act="publish-digital" data-item="${it.n}" style="flex:0 0 auto">Zveřejnit digitální vizitku</button></div><p class="muted" style="margin:6px 0 0">Zveřejněte až po zaplacení. Web se přegeneruje do 2 minut a zákazník dostane e-mail s odkazem.</p>`) : ''}
      </div></div>`;
  }).join('');
  const notify = (id, on = true) => `<label class="chk"><input type="checkbox" data-notify="${id}"${on ? ' checked' : ''}> Poslat zákazníkovi e-mail</label>`;
  let action = '';
  if (o.status === 'nova') action = `<h3>1. Zkontrolujte návrh a pošlete platbu</h3><p class="muted">Projděte tiskové PDF. Když je v pořádku, zákazník dostane QR platbu (${cur === 'EUR' ? 'PAY by square' : 'QR Platba'}) na ${money(o.total, cur)}.</p>${pay ? mailNote('pay') : '<p class="msg err">Nejdřív v <a href="#nastaveni">Nastavení</a> vyplňte bankovní účet pro ' + cur + '.</p>'}<div class="btns"><button class="btn y big" data-act="request-payment"${pay ? '' : ' disabled'}>✓ Návrh je OK – poslat platbu</button></div>`;
  else if (o.status === 'k_platbe') action = `<h3>2. Čeká se na platbu</h3><p class="muted">Ve výpisu hledejte platbu s tímto VS a částkou:</p><div class="paymatch"><div><span>VS</span><b>${esc(pay?.vs || o.pay?.vs || '')}</b>${copyBtn(pay?.vs || o.pay?.vs || '', '⧉')}</div><div><span>Částka</span><b>${money(o.total, cur)}</b></div><div><span>Výzva odeslána</span><b>${dt(o.pay?.requested)}</b></div></div>${pay ? `<details class="muted"><summary style="cursor:pointer">QR a údaje platby</summary><div class="pay" style="margin-top:10px">${pay.qr}<dl class="kv"><dt>${cur === 'EUR' ? 'IBAN' : 'Účet'}</dt><dd>${esc(pay.account && cur === 'CZK' ? pay.account : pay.ibanF)}</dd><dt>VS</dt><dd>${esc(pay.vs)}</dd></dl></div></details>` : ''}${mailNote('paid')}${notify('paid')}<div class="btns"><button class="btn g big" data-act="paid">✓ Platba přišla – zaplaceno</button><button class="btn o" data-act="remind-payment">Připomenout platbu${o.reminded ? ' znovu' : ''}</button></div>`;
  else if (o.status === 'zaplaceno') action = `<h3>3. Objednejte tisk u Bizay</h3><p class="muted">Volby, PDF a adresa jsou v panelu „Objednat u Bizay“ níže.</p><div class="row"><label class="f">Číslo objednávky Bizay<input data-ref placeholder="např. 12345678"></label><label class="f">Skutečná cena u Bizay (${B?.currency === 'CZK' ? 'Kč' : '€'}, nepovinné)<input data-cost inputmode="decimal" placeholder="${B?.cost ?? ''}"></label></div><div class="btns"><button class="btn c big" data-act="print">✓ Objednáno u Bizay – v tisku</button></div><p class="muted" style="margin:0">Zákazník e-mail nedostane, na stránce objednávky uvidí stav „V tlači“.</p>`;
  else if (o.status === 'tisk') action = `<h3>4. Odeslání</h3><p class="muted">${o.printRef ? `Bizay č. <b>${esc(o.printRef)}</b>. ` : ''}Číslo zásilky najdete v e-mailu od Bizay.</p><div class="row"><label class="f">Dopravce<select data-carrier>${Object.entries(carriers).map(([k, v]) => `<option value="${k}"${k === 'dpd' ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></label><label class="f">Číslo zásilky<input data-track inputmode="numeric" placeholder="např. 01234567890123"></label></div>${mailNote('ship')}${notify('ship')}<div class="btns"><button class="btn c big" data-act="shipped">✓ Odesláno – poslat sledování</button></div>`;
  else if (o.status === 'odeslano') action = `<h3>5. Doručeno?</h3><p class="muted">${o.shipping ? `Zásilka ${esc(o.shipping.number || '')} · ${esc(carriers[o.shipping.carrier] || '')}${o.shipping.number && o.shipping.carrier === 'dpd' ? ` · <a href="https://tracking.dpd.de/status/cs_CZ/parcel/${encodeURIComponent(o.shipping.number)}" target="_blank" rel="noopener">sledovat ↗</a>` : ''}` : ''}</p><div class="btns"><button class="btn o" data-act="done">Uzavřít jako hotovo</button></div>`;
  else action = `<h3>${ST[o.status]}</h3><p class="muted">Objednávka je uzavřená.</p>`;

  main.innerHTML = `<a class="back" href="#objednavky">← Objednávky</a>
    <div class="dhead"><h1>${o.number}</h1>${badge(o.status)}<span class="muted">${dt(o.created)} · ${o.lang.toUpperCase()}</span><span class="sum">${money(o.total, cur)}</span></div>
    <div class="grid2"><div class="stack">
      <section class="box"><h2>Položky</h2>${items}</section>
      <section class="box"><h2>Zákazník</h2><dl class="kv"><dt>Jméno</dt><dd>${esc(c.name)}</dd><dt>E-mail</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd><dt>Telefon</dt><dd><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></dd>${track ? `<dt>Stránka zákazníka</dt><dd><a href="${esc(track)}" target="_blank">Stav objednávky ↗</a></dd>` : ''}
        ${c.company ? `<dt>Firma</dt><dd>${esc(c.company)}${c.ico ? ', IČO ' + esc(c.ico) : ''}${c.dic ? ', DIČ ' + esc(c.dic) : ''}${c.icdph ? ', IČ DPH ' + esc(c.icdph) : ''}</dd>` : ''}
        ${c.street ? `<dt>Doručení</dt><dd>${c.ship === 'packeta' ? 'Packeta (výdejní místo)' : 'Kurýr'} · ${esc([c.street, `${c.zip} ${c.city}`, c.country].filter(Boolean).join(', '))}</dd>` : ''}
        ${c.note ? `<dt>Poznámka</dt><dd>${esc(c.note)}</dd>` : ''}</dl></section>
    </div><div class="stack">
      <section class="box act" data-actions>${action}</section>
      ${bizayBox}
      <section class="box act"><h3>Interní poznámka</h3><textarea rows="3" data-note>${esc(o.adminNote || '')}</textarea><div class="btns"><button class="btn sm o" data-act="note">Uložit poznámku</button></div></section>
      <section class="box act"><h3>Ostatní</h3><div class="row"><label class="f">Změnit stav ručně (bez e-mailu)<select data-status>${Object.entries(ST).map(([k, v]) => `<option value="${k}"${k === o.status ? ' selected' : ''}>${v}</option>`).join('')}</select></label><button class="btn sm o" data-act="status" style="flex:0 0 auto">Změnit</button></div>
        ${!['hotovo', 'zruseno'].includes(o.status) ? `<details><summary class="muted" style="cursor:pointer">Zrušit objednávku</summary><div class="act" style="margin-top:10px"><label class="f">Důvod (pošle se zákazníkovi)<input data-reason></label>${notify('cancel')}<button class="btn sm danger" data-act="cancel">Zrušit objednávku</button></div></details>` : ''}</section>
      <section class="box"><h2>Historie</h2><ul class="hist">${(o.history || []).slice().reverse().map((h) => `<li><time>${dt(h.t)}</time><span>${badge(h.s)} ${esc(h.note || '')}</span></li>`).join('')}</ul></section>
    </div></div>`;

  main.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, q = (s) => main.querySelector(s);
    const body = { action: act };
    if (act === 'request-payment' && !confirm(`Poslat zákazníkovi ${c.email} výzvu k platbě ${money(o.total, cur)}?`)) return;
    if (act === 'paid') body.notify = q('[data-notify="paid"]')?.checked;
    if (act === 'print') { body.ref = q('[data-ref]')?.value; body.cost = parseFloat(String(q('[data-cost]')?.value || '').replace(',', '.')) || null; }
    if (act === 'remind-payment' && !confirm(`Poslat ${c.email} připomínku platby?`)) return;
    if (act === 'shipped') { body.carrier = q('[data-carrier]').value; body.number = q('[data-track]').value; body.notify = q('[data-notify="ship"]').checked; if (!body.number && !confirm('Odeslat bez čísla zásilky?')) return; }
    if (act === 'cancel') { body.reason = q('[data-reason]').value; body.notify = q('[data-notify="cancel"]').checked; if (!confirm('Opravdu zrušit objednávku?')) return; }
    if (act === 'status') body.status = q('[data-status]').value;
    if (act === 'note') body.note = q('[data-note]').value;
    if (act === 'publish-digital') { body.item = b.dataset.item; body.slug = q('[data-slug]').value; if (!confirm(`Zveřejnit na adrese v/${slugify(body.slug)}/ a poslat zákazníkovi odkaz?`)) return; }
    b.disabled = true;
    try {
      const r = await api('order/' + num, body);
      toast(r.mailed === false ? 'Uloženo, ale e-mail se nepodařilo odeslat!' : r.mailed ? 'Uloženo a e-mail odeslán.' : 'Uloženo.');
      detailView(num);
    } catch (x) { toast(x.message); b.disabled = false; }
  });
}

/* ---------- konverze (anonymní denní součty z webu) ---------- */
const FUNNEL = [
  ['visit', 'Návštěvy webu', 'zobrazení stránek celkem'],
  ['start', 'Začali navrhovat', 'zadání pro AI nebo klik na šablonu'],
  ['editor', 'Otevřeli editor', 'krok Úpravy'],
  ['order_step', 'Krok Objednávka', 'výběr papíru a počtu'],
  ['add_cart', 'Vložili do košíku', ''],
  ['checkout_start', 'Začali vyplňovat objednávku', 'košík, první pole formuláře'],
  ['order_sent', 'Odeslali objednávku', ''],
];
const PAGE_L = { home: 'Úvod', tvorba: 'Tvorba', kosik: 'Košík', cennik: 'Ceník', digitalna: 'Digitální vizitka', vlastny: 'Vlastní návrh', obor: 'Oborové stránky', obory: 'Přehled oborů', kontakt: 'Kontakt', objednavka: 'Stav objednávky', other: 'Ostatní' };
let statsDays = 30, statsLang = 'all';
async function statsView() {
  const main = shell('konverze', '<h1 class="pg">Konverze</h1><p class="muted">Načítám…</p>');
  let data; try { data = await api('stats?days=' + statsDays); } catch (e) { main.innerHTML = `<h1 class="pg">Konverze</h1><p class="msg err">${esc(e.message)}</p>`; return; }
  const ok = (k) => statsLang === 'all' || k.endsWith('.' + statsLang);
  const sum = (pred) => data.days.reduce((s, d) => s + Object.entries(d.counts).filter(([k]) => pred(k) && ok(k)).reduce((a, [, n]) => a + n, 0), 0);
  const ev = (name) => sum((k) => k.startsWith(name + '.'));
  const val = { visit: sum((k) => k.startsWith('pv.')), start: ev('ai_submit') + ev('tpl_click') + ev('quick_start'), editor: ev('editor'), order_step: ev('order_step'), add_cart: ev('add_cart'), checkout_start: ev('checkout_start'), order_sent: ev('order_sent') };
  const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
  const pf = (a, b) => pct(a, b).toLocaleString('cs-CZ');
  const max = Math.max(1, val.visit);
  const rows = FUNNEL.map(([k, l, hint], i) => {
    const prev = i ? val[FUNNEL[i - 1][0]] : val.visit, v = val[k], drop = i ? 100 - pct(v, prev) : 0;
    return `<div class="fn"><div class="fn__l"><b>${l}</b>${hint ? `<span class="muted">${hint}</span>` : ''}</div><div class="fn__bar"><i style="width:${Math.max(0.6, (v / max) * 100)}%"></i></div><div class="fn__n"><b>${v.toLocaleString('cs-CZ')}</b>${i ? `<span class="${drop > 70 ? 'low' : 'muted'}">${pf(v, prev)} % z předchozího</span>` : '<span class="muted">100 %</span>'}</div></div>`;
  }).join('');
  const pages = Object.keys(PAGE_L).map((p) => [p, sum((k) => k.startsWith('pv.' + p + '.'))]).filter(([, n]) => n).sort((a, b) => b[1] - a[1]);
  const dmax = Math.max(1, ...data.days.map((d) => Object.entries(d.counts).filter(([k]) => k.startsWith('pv.') && ok(k)).reduce((a, [, n]) => a + n, 0)));
  const daily = data.days.map((d) => { const v = Object.entries(d.counts).filter(([k]) => k.startsWith('pv.') && ok(k)).reduce((a, [, n]) => a + n, 0); const o = Object.entries(d.counts).filter(([k]) => k.startsWith('order_sent.') && ok(k)).reduce((a, [, n]) => a + n, 0); return `<span class="dd" title="${d.d}: ${v} zobrazení, ${o} objednávek"><i style="height:${(v / dmax) * 100}%"></i>${o ? '<em></em>' : ''}</span>`; }).join('');
  main.innerHTML = `<h1 class="pg">Konverze</h1>
    <div class="tabs">${[[7, '7 dní'], [30, '30 dní'], [90, '90 dní']].map(([d, l]) => `<button class="chip${statsDays === d ? ' on' : ''}" data-days="${d}">${l}</button>`).join('')}<span style="width:12px"></span>${[['all', 'SK + CZ'], ['sk', 'Slovensko'], ['cz', 'Česko']].map(([v, l]) => `<button class="chip${statsLang === v ? ' on' : ''}" data-lang="${v}">${l}</button>`).join('')}</div>
    <div class="stats"><div class="stat"><b>${val.visit.toLocaleString('cs-CZ')}</b><span>zobrazení stránek</span></div><div class="stat"><b>${val.order_sent}</b><span>odeslaných objednávek</span></div><div class="stat"><b>${pf(val.order_sent, val.start)} %</b><span>z těch, co začali navrhovat</span></div><div class="stat"><b>${ev('draft_saved')}</b><span>uložených návrhů e-mailem</span></div></div>
    <div class="grid2"><section class="box"><h3 style="margin-top:0">Trychtýř</h3>${rows}<p class="muted" style="margin-bottom:0">Každý krok se počítá nejvýš jednou za zobrazení stránky. Data jsou anonymní souhrny (bez cookies a osobních údajů), proto jde o orientační čísla, ne o počet unikátních lidí.</p></section>
    <div class="stack"><section class="box"><h3 style="margin-top:0">Návštěvnost po dnech</h3><div class="daily">${daily}</div><p class="muted" style="margin:8px 0 0">Tečka = den s objednávkou.</p></section>
    <section class="box"><h3 style="margin-top:0">Stránky</h3>${pages.length ? `<table class="ptable"><tbody>${pages.map(([p, n]) => `<tr><td>${PAGE_L[p]}</td><td class="r"><b>${n.toLocaleString('cs-CZ')}</b></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Zatím žádná data. Statistiky se začnou sbírat po nasazení.</p>'}</section></div></div>`;
  main.addEventListener('click', (e) => {
    const d = e.target.closest('[data-days]'); if (d) { statsDays = +d.dataset.days; statsView(); return; }
    const l = e.target.closest('[data-lang]'); if (l) { statsLang = l.dataset.lang; statsView(); }
  });
}

/* ---------- ceník a marže ---------- */
const QTY = ['100', '250', '500', '1000'];
const ROWS = [['papers', 'matny', 'Matný 350 g'], ['papers', 'triplex', 'Triplex 720 g'], ['finishes', 'matna', '+ matná laminace'], ['finishes', 'leskla', '+ lesklá laminace'], ['finishes', 'soft', '+ soft-touch'], ['round', null, '+ zaoblené rohy'], ['sizes', '85x55', '+ formát 85 × 55'], ['sizes', '55x55', '+ formát 55 × 55']];
// nákup Bizay 90×50 obojstranne bez zľavy pre nových zákazníkov, s DPH a dopravou DPD (8. 10. 2026)
const DEFAULT_COSTS = {"sk": {"papers": {"matny": {"100": 21.41, "250": 30.07, "500": 35.2, "1000": 44.45}, "triplex": {"100": 72.19, "250": 93.92, "500": 128.27, "1000": 195.27}}}, "cz": {"papers": {"matny": {"100": 499, "250": 669, "500": 770, "1000": 953}, "triplex": {"100": 1500, "250": 1928, "500": 2605, "1000": 3926}}}};
async function pricesView() {
  const main = shell('cenik', '<h1 class="pg">Ceník a marže</h1><p class="muted">Načítám…</p>');
  let data; try { data = await api('prices'); } catch (e) { main.innerHTML = `<p class="msg err">${esc(e.message)}</p>`; return; }
  const P = structuredClone(data.prices), C = structuredClone(data.costs || DEFAULT_COSTS);
  let lang = 'cz';
  const get = (o, g, k, q) => (k ? o?.[g]?.[k]?.[q] : o?.[g]?.[q]);
  const set = (o, g, k, q, v) => { if (k) { ((o[g] ||= {})[k] ||= {})[q] = v; } else { (o[g] ||= {})[q] = v; } };
  const draw = () => {
    const p = P[lang], c = (C[lang] ||= {}), cur = lang === 'sk' ? 'EUR' : 'CZK';
    const mg = (price, cost) => { if (!cost || !price) return ''; const m = price - cost, pct = Math.round((m / price) * 100); return `<span class="mg ${pct >= 38 ? 'ok' : 'low'}">${money(Math.round(m * 100) / 100, cur)} · ${pct} %</span>`; };
    main.querySelector('[data-pt]').innerHTML = `<table class="ptable"><thead><tr><th></th>${QTY.map((q) => `<th class="r">${q} ks</th>`).join('')}</tr></thead><tbody>
      ${ROWS.map(([g, k, label]) => `<tr><td class="lbl">${label}<br><span class="muted">prodej / nákup</span></td>${QTY.map((q) => `<td class="r"><input type="number" step="any" min="0" data-p="${g}|${k || ''}|${q}" value="${get(p, g, k, q) ?? ''}"><input type="number" step="any" min="0" data-c="${g}|${k || ''}|${q}" value="${get(c, g, k, q) ?? ''}" placeholder="nákup" style="margin-top:4px;background:#fff">${g === 'papers' ? mg(get(p, g, k, q), get(c, g, k, q)) : ''}</td>`).join('')}</tr>`).join('')}
      <tr><td class="lbl">Expres</td><td class="r"><input type="number" step="any" min="0" data-s="express" value="${p.express}"></td><td colspan="3"></td></tr>
      <tr><td class="lbl">Digitální vizitka<br><span class="muted">jednorázově</span></td><td class="r"><input type="number" step="any" min="0" data-s="digital" value="${p.digital ?? p.digital_year ?? ''}"></td><td colspan="3" class="muted">K tištěným vizitkám je zdarma.</td></tr>
    </tbody></table>`;
    main.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === lang));
  };
  main.innerHTML = `<h1 class="pg">Ceník a marže</h1>
    <div class="grid2"><section class="box"><div class="tabs"><button class="chip" data-tab="cz">Česko (Kč)</button><button class="chip" data-tab="sk">Slovensko (€)</button></div>
      <p class="muted">Horní pole je prodejní cena na webu (konečná, nejsme plátci DPH). Spodní je vaše nákupní cena včetně DPH a dopravy – z ní se počítá marže. Ceny zahrnují dopravu zdarma.</p>
      <div data-pt style="overflow-x:auto"></div></section>
    <div class="stack"><section class="box act"><h3>Dopočítat ceny z marže</h3><p class="muted">Vyplňte nákupní ceny a cílovou marži, ceny papíru se dopočítají a zaokrouhlí.</p><label class="f">Cílová marže v %<input type="number" data-target value="40" min="0" max="95"></label><button class="btn o" data-calc>Dopočítat</button></section>
      <section class="box act"><h3>Uložit</h3><p class="muted">Ceny se hned použijí v objednávkách a web se do 2 minut přegeneruje s novými cenami.</p><div data-msg></div><button class="btn y" data-save>Uložit ceník</button></section></div></div>`;
  main.addEventListener('input', (e) => {
    const t = e.target; const v = t.value === '' ? undefined : Number(t.value);
    if (t.dataset.p) { const [g, k, q] = t.dataset.p.split('|'); set(P[lang], g, k || null, q, v); }
    if (t.dataset.c) { const [g, k, q] = t.dataset.c.split('|'); set(C[lang] ||= {}, g, k || null, q, v); }
    if (t.dataset.s) P[lang][t.dataset.s] = v;
  });
  main.addEventListener('change', (e) => { if (e.target.dataset.p || e.target.dataset.c) draw(); });
  main.addEventListener('click', async (e) => {
    const tab = e.target.closest('[data-tab]'); if (tab) { lang = tab.dataset.tab; draw(); return; }
    if (e.target.closest('[data-calc]')) {
      const m = Math.min(95, Math.max(0, Number(main.querySelector('[data-target]').value) || 0)) / 100;
      for (const [g, k] of ROWS.filter((r) => r[0] === 'papers')) for (const q of QTY) { const cost = get(C[lang], g, k, q); if (cost) { const raw = cost / (1 - m); set(P[lang], g, k, q, lang === 'sk' ? Math.ceil(raw) : Math.ceil(raw / 10) * 10); } }
      draw(); toast('Ceny dopočítány – zkontrolujte a uložte.'); return;
    }
    if (e.target.closest('[data-save]')) {
      const btn = e.target.closest('[data-save]'); btn.disabled = true;
      for (const l of ['sk', 'cz']) { P[l].digital = P[l].digital ?? P[l].digital_year; delete P[l].digital_year; }
      try { await api('prices', { prices: P, costs: C }); main.querySelector('[data-msg]').innerHTML = '<p class="msg ok">Uloženo. Web se přegeneruje do 2 minut.</p>'; } catch (x) { main.querySelector('[data-msg]').innerHTML = `<p class="msg err">${esc(x.message)}</p>`; }
      btn.disabled = false;
    }
  });
  draw();
}

/* ---------- nastavení ---------- */
async function settingsView() {
  const main = shell('nastaveni', '<h1 class="pg">Nastavení</h1><p class="muted">Načítám…</p>');
  let s; try { s = await api('settings'); } catch (e) { main.innerHTML = `<p class="msg err">${esc(e.message)}</p>`; return; }
  const f = (k, label, ph = '', hint = '') => `<label class="f">${label}<input name="${k}" value="${esc(s[k] || '')}" placeholder="${esc(ph)}">${hint ? `<span class="muted" style="font-weight:400">${hint}</span>` : ''}</label>`;
  main.innerHTML = `<h1 class="pg">Nastavení</h1><div class="grid2"><div class="stack">
    <form class="box act" data-set>${!s.ibanEur || !(s.accountCzk || s.ibanCzk) ? `<div class="alert"><b>Platby zatím nefungují.</b> Bez účtu nejde zákazníkovi poslat QR kód k zaplacení. ${!s.ibanEur ? 'Chybí IBAN pro € (Slovensko). ' : ''}${!(s.accountCzk || s.ibanCzk) ? 'Chybí účet pro Kč (Česko).' : ''}</div>` : ''}<h3>Platby převodem</h3>
      ${f('accountCzk', 'Účet pro platby v Kč (Česko)', '123456789/0100', 'Z čísla účtu se vytvoří QR Platba.')}
      ${f('ibanEur', 'IBAN pro platby v € (Slovensko)', 'SK00 0000 0000 0000 0000 0000', 'Pro QR PAY by square. Může to být i EUR účet v Česku (CZ…).')}
      ${f('beneficiary', 'Příjemce (jméno na QR)', 'webhunter s.r.o.')}
      <h3 style="margin-top:8px">E-maily</h3>
      ${f('notifyTo', 'Kam chodí nové objednávky', 'info.webhunter@email.cz')}
      ${f('replyTo', 'Kam zákazníci odpovídají', 'info.webhunter@email.cz')}
      ${f('siteUrl', 'Adresa webu (odkazy v e-mailech)', 'https://vizitkomat.eu/', 'Odkazy v e-mailech zákazníkům vedou sem.')}
      <div data-msg></div><button class="btn y" type="submit">Uložit nastavení</button></form>
  </div><div class="stack">

    <form class="box act" data-pw><h3>Změna hesla</h3><label class="f">Současné heslo<input type="password" name="old" autocomplete="current-password" required></label><label class="f">Nové heslo (min. 10 znaků)<input type="password" name="new" autocomplete="new-password" minlength="10" required></label><div data-msg></div><button class="btn o" type="submit">Změnit heslo</button></form>
  </div></div>`;
  // kontrola účtů už při psaní (IBAN mod 97, české číslo účtu předčíslí-číslo/kód banky)
  const ibanOk = (v) => { const x = v.replace(/\s+/g, '').toUpperCase(); if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(x)) return false; const r = (x.slice(4) + x.slice(0, 4)).replace(/[A-Z]/g, (ch) => ch.charCodeAt(0) - 55); let m = 0; for (const d of r) m = (m * 10 + +d) % 97; return m === 1; };
  const czOk = (v) => /^(\d{1,6}-)?\d{2,10}\/\d{4}$/.test(v.replace(/\s+/g, ''));
  const hint = (inp, ok, okText, badText) => { let h = inp.parentElement.querySelector('.vh'); if (!h) { h = document.createElement('span'); h.className = 'vh'; inp.after(h); } h.textContent = !inp.value ? '' : ok ? okText : badText; h.className = 'vh ' + (!inp.value ? '' : ok ? 'ok' : 'bad'); };
  const fm = main.querySelector('[data-set]');
  const vAcc = () => hint(fm.accountCzk, czOk(fm.accountCzk.value), '✓ formát účtu je v pořádku', 'Zadejte ve tvaru 123456789/0100 (případně 19-123456789/0800).');
  const vIban = () => hint(fm.ibanEur, ibanOk(fm.ibanEur.value), '✓ IBAN je platný', 'IBAN nesedí – zkontrolujte číslice (SK + 22 číslic).');
  fm.accountCzk.addEventListener('input', vAcc); fm.ibanEur.addEventListener('input', vIban); vAcc(); vIban();
  fm.addEventListener('submit', async (e) => {
    e.preventDefault(); const body = Object.fromEntries(new FormData(e.target).entries()); const m = e.target.querySelector('[data-msg]');
    try { const r = await api('settings', body); setup = { eur: !!r.settings.ibanEur, czk: !!(r.settings.ibanCzk || r.settings.accountCzk), beneficiary: !!r.settings.beneficiary }; m.innerHTML = '<p class="msg ok">Uloženo.</p>'; } catch (x) { m.innerHTML = `<p class="msg err">${esc(x.message)}</p>`; }
  });
  main.querySelector('[data-pw]').addEventListener('submit', async (e) => {
    e.preventDefault(); const body = Object.fromEntries(new FormData(e.target).entries()); const m = e.target.querySelector('[data-msg]');
    try { const r = await api('password', body); token = r.token; try { localStorage.setItem('vka-token', token); } catch (x) { /* nič */ } m.innerHTML = '<p class="msg ok">Heslo změněno.</p>'; e.target.reset(); } catch (x) { m.innerHTML = `<p class="msg err">${esc(x.message)}</p>`; }
  });
}

/* ---------- hodnocení zákazníků (moderace) ---------- */
async function reviewsView() {
  const main = shell('hodnoceni', '<h1 class="pg">Hodnocení</h1><p class="muted">Načítám…</p>');
  let data; try { data = await api('reviews'); } catch (e) { main.innerHTML = `<h1 class="pg">Hodnocení</h1><p class="msg err">${esc(e.message)}</p>`; return; }
  let rf = 'pending';
  const RS = { pending: 'Čeká na schválení', approved: 'Zveřejněno', hidden: 'Skryto' };
  const stars = (n) => `<span class="rv-st">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;
  const draw = () => {
    const list = data.reviews.filter((r) => rf === 'vse' || r.status === rf);
    const pub = data.reviews.filter((r) => r.status === 'approved' && r.consent);
    const avg = pub.length ? (pub.reduce((s, r) => s + r.stars, 0) / pub.length).toFixed(1).replace('.', ',') : '–';
    main.innerHTML = `<h1 class="pg">Hodnocení</h1>
      <p class="muted">Zákazníkům přijde e-mail s prosbou o hodnocení asi 5 dní po odeslání vizitek. Na web jdou jen schválená hodnocení se souhlasem zákazníka; blok s recenzemi se na webu ukáže od 3 zveřejněných.${data.github ? '' : ' <b>Pozor: chybí GH_TOKEN, zveřejnění na web nebude fungovat.</b>'}</p>
      <div class="stats"><div class="stat" style="cursor:default"><b>${pub.length}</b><span>Zveřejněno na webu</span></div><div class="stat" style="cursor:default"><b>${avg}</b><span>Průměr zveřejněných</span></div><div class="stat${data.reviews.some((r) => r.status === 'pending') ? ' hot' : ''}" style="cursor:default"><b>${data.reviews.filter((r) => r.status === 'pending').length}</b><span>Čeká na schválení</span></div></div>
      <div class="box"><div class="bar">${[['pending', 'Ke schválení'], ['approved', 'Zveřejněné'], ['hidden', 'Skryté'], ['vse', 'Vše']].map(([k, l]) => `<button class="chip${rf === k ? ' on' : ''}" data-rf="${k}">${l}</button>`).join('')}</div>
      ${list.length ? list.map((r) => `<article class="rv-card" data-n="${r.n}">
        <div class="rv-ph" data-ph="${r.photo ? r.n : ''}">${r.photo ? '<span class="muted">fotka…</span>' : '<span class="muted">bez fotky</span>'}</div>
        <div class="rv-b"><div class="rv-h">${stars(r.stars)} <span><b>${esc(r.name || 'bez jména')}</b>${r.city ? ', ' + esc(r.city) : ''}</span> <a href="#${r.n}" class="muted">${r.n}</a> <span class="muted">${dt(r.created)} · ${r.lang.toUpperCase()}</span> <span class="st">${RS[r.status] || r.status}</span></div>
          <textarea data-txt rows="3" maxlength="600">${esc(r.text || '')}</textarea>
          <p class="muted" style="margin:4px 0 8px">${r.consent ? '✓ souhlasí se zveřejněním' : '✗ NEsouhlasí se zveřejněním – lze jen skrýt'}. Text můžete opravit jen v překlepech, smysl neměňte.</p>
          <div class="rv-a">${r.consent ? `<button class="btn y" data-act="approved">${r.status === 'approved' ? 'Uložit a znovu zveřejnit' : 'Zveřejnit'}</button>` : ''}${r.photo && r.consent ? `<label class="muted rv-wp"><input type="checkbox" data-wp ${r.status === 'approved' && !r.photoPath ? '' : 'checked'}> i s fotkou</label>` : ''}<button class="btn o" data-act="hidden">Skrýt</button><button class="btn o" data-del>Smazat</button></div>
        </div></article>`).join('') : '<p class="muted" style="padding:18px">Zatím tu nic není.</p>'}</div>`;
    main.querySelectorAll('[data-ph]').forEach(async (el) => {
      const n = el.dataset.ph; if (!n) return;
      try { const r = await fetch(`${API}/admin/api/reviews/${n}/photo`, { headers: { authorization: `Bearer ${token}` } }); if (!r.ok) throw 0; const u = URL.createObjectURL(await r.blob()); el.innerHTML = `<a href="${u}" target="_blank" rel="noopener"><img alt="" src="${u}"></a>`; } catch (e) { el.innerHTML = '<span class="muted">fotku nelze načíst</span>'; }
    });
  };
  main.addEventListener('click', async (e) => {
    const f = e.target.closest('[data-rf]'); if (f) { rf = f.dataset.rf; draw(); return; }
    const card = e.target.closest('[data-n]'); if (!card) return;
    const n = card.dataset.n;
    const act = e.target.closest('[data-act]'), del = e.target.closest('[data-del]');
    if (!act && !del) return;
    if (del && !confirm(`Opravdu smazat hodnocení ${n}? Nejde to vrátit.`)) return;
    const btn = act || del; btn.disabled = true;
    try {
      let j;
      if (del) { const r = await fetch(`${API}/admin/api/reviews/${n}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } }); j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); data.reviews = data.reviews.filter((x) => x.n !== n); }
      else { j = await api(`reviews/${n}`, { status: act.dataset.act, text: card.querySelector('[data-txt]').value, withPhoto: card.querySelector('[data-wp]') ? card.querySelector('[data-wp]').checked : undefined }); data.reviews = data.reviews.map((x) => (x.n === n ? j.review : x)); }
      toast(j.publish ? (j.publish.ok ? `Uloženo. Web se přegeneruje do 2 minut (${j.publish.count} na webu).` : 'Uloženo, ale zveřejnění selhalo: ' + (j.publish.note || '')) : 'Uloženo.');
      draw();
    } catch (x) { toast(x.message); btn.disabled = false; }
  });
  draw();
}

// stav účtů zjistíme jednou na začátku, ať je varování vidět na každé stránce
async function loadSetup() {
  if (setup || !token) return;
  try {
    const s = await api('settings'); setup = { eur: !!s.ibanEur, czk: !!(s.ibanCzk || s.accountCzk), beneficiary: !!s.beneficiary };
    const top = app.querySelector('.top');
    if (top && !app.querySelector('.warnbar') && (!setup.eur || !setup.czk)) top.insertAdjacentHTML('afterend', `<a class="warnbar" href="#nastaveni"><b>Chybí bankovní účet</b> ${!setup.eur ? 'pro € (SK)' : ''}${!setup.eur && !setup.czk ? ' a ' : ''}${!setup.czk ? 'pro Kč (CZ)' : ''} – zákazníkům nepůjde poslat QR platbu. Doplnit →</a>`);
  } catch (e) { /* nevadí */ }
}
function route() {
  if (!token) return loginView();
  setTimeout(loadSetup, 300);
  const h = decodeURIComponent(location.hash.slice(1));
  if (/^VK\d+$/.test(h)) return detailView(h);
  if (h === 'konverze') return statsView();
  if (h === 'cenik') return pricesView();
  if (h === 'hodnoceni') return reviewsView();
  if (h === 'nastaveni') return settingsView();
  if (h === 'objednavky') return ordersView();
  return dashboardView();
}
addEventListener('hashchange', route);
route();
