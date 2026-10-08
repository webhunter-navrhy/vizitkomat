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
function logout() { token = null; try { localStorage.removeItem('vka-token'); } catch (e) { /* nič */ } loginView(); }

/* ---------- přihlášení ---------- */
function loginView(err) {
  app.innerHTML = `<div class="login"><form data-login><span class="brand"><i></i>vizitkomat</span><h1>Administrace</h1>
    ${err ? `<p class="msg err">${esc(err)}</p>` : ''}
    <label class="f">Heslo<input type="password" name="pw" autocomplete="current-password" autofocus required></label>
    <button class="btn c" type="submit">Přihlásit</button></form></div>`;
  app.querySelector('[data-login]').addEventListener('submit', async (e) => {
    e.preventDefault();
    try { const j = await api('login', { password: e.target.pw.value }); token = j.token; try { localStorage.setItem('vka-token', token); } catch (x) { /* nič */ } route(); } catch (x) { loginView(x.message); }
  });
}

function shell(active, inner) {
  const nav = [['objednavky', 'Objednávky'], ['cenik', 'Ceník a marže'], ['nastaveni', 'Nastavení']];
  app.innerHTML = `<header class="top"><span class="brand"><i></i>vizitkomat</span><nav>${nav.map(([h, l]) => `<a href="#${h}" class="${active === h ? 'on' : ''}">${l}</a>`).join('')}</nav><a href="${window.VKA.site}" target="_blank" style="color:rgba(255,255,255,.7);font-size:13px">Web ↗</a><button data-logout>Odhlásit</button></header><main>${inner}</main>`;
  app.querySelector('[data-logout]').addEventListener('click', logout);
  return app.querySelector('main');
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
  const { order: o, pay, carriers, track } = data, c = o.customer, cur = o.currency;
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
  if (o.status === 'nova') action = `<h3>1. Zkontrolujte návrh a pošlete platbu</h3><p class="muted">Projděte tiskové PDF. Když je v pořádku, zákazník dostane e-mail s QR platbou (${cur === 'EUR' ? 'PAY by square' : 'QR Platba'}).</p>${pay ? '' : '<p class="msg err">Nejdřív v Nastavení vyplňte bankovní účet pro ' + cur + '.</p>'}<div class="btns"><button class="btn y" data-act="request-payment"${pay ? '' : ' disabled'}>Poslat výzvu k platbě</button></div>`;
  else if (o.status === 'k_platbe') action = `<h3>2. Čeká se na platbu</h3>${pay ? `<div class="pay">${pay.qr}<dl class="kv"><dt>Částka</dt><dd>${money(pay.amount, cur)}</dd><dt>${cur === 'EUR' ? 'IBAN' : 'Účet'}</dt><dd>${esc(pay.account && cur === 'CZK' ? pay.account : pay.ibanF)}</dd><dt>VS</dt><dd>${esc(pay.vs)}</dd></dl></div>` : ''}${notify('paid')}<div class="btns"><button class="btn g" data-act="paid">Označit jako zaplaceno</button><button class="btn o" data-act="request-payment">Poslat výzvu znovu</button></div>`;
  else if (o.status === 'zaplaceno') action = `<h3>3. Objednejte tisk</h3><p class="muted">Stáhněte PDF a objednejte tisk u Bizay. Číslo jejich objednávky si můžete poznamenat.</p><label class="f">Číslo objednávky v tiskárně (nepovinné)<input data-ref></label><div class="btns"><button class="btn c" data-act="print">Objednáno v tisku</button></div>`;
  else if (o.status === 'tisk') action = `<h3>4. Odeslání</h3><div class="row"><label class="f">Dopravce<select data-carrier>${Object.entries(carriers).map(([k, v]) => `<option value="${k}"${(c.ship === 'packeta' ? 'packeta' : 'dpd') === k ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></label><label class="f">Číslo zásilky<input data-track></label></div>${notify('ship')}<div class="btns"><button class="btn c" data-act="shipped">Označit jako odesláno</button></div>`;
  else if (o.status === 'odeslano') action = `<h3>5. Doručeno?</h3><p class="muted">${o.shipping ? `Zásilka ${esc(o.shipping.number || '')} · ${esc(carriers[o.shipping.carrier] || '')}` : ''}</p><div class="btns"><button class="btn o" data-act="done">Uzavřít jako hotovo</button></div>`;
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
    if (act === 'print') body.ref = q('[data-ref]')?.value;
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
    <form class="box act" data-set><h3>Platby převodem</h3>
      ${f('accountCzk', 'Účet pro platby v Kč (Česko)', '123456789/0100', 'Z čísla účtu se vytvoří QR Platba.')}
      ${f('ibanEur', 'IBAN pro platby v € (Slovensko)', 'SK00 0000 0000 0000 0000 0000', 'Pro QR PAY by square. Může to být i EUR účet v Česku (CZ…).')}
      ${f('beneficiary', 'Příjemce (jméno na QR)', 'webhunter s.r.o.')}
      <h3 style="margin-top:8px">E-maily</h3>
      ${f('notifyTo', 'Kam chodí nové objednávky', 'info.webhunter@email.cz')}
      ${f('replyTo', 'Kam zákazníci odpovídají', 'info.webhunter@email.cz')}
      ${f('siteUrl', 'Adresa webu (odkazy v e-mailech)', 'https://vizitkomat.eu/', 'Po spuštění domény změňte na https://vizitkomat.eu/')}
      <div data-msg></div><button class="btn y" type="submit">Uložit nastavení</button></form>
  </div><div class="stack">

    <form class="box act" data-pw><h3>Změna hesla</h3><label class="f">Současné heslo<input type="password" name="old" autocomplete="current-password" required></label><label class="f">Nové heslo (min. 10 znaků)<input type="password" name="new" autocomplete="new-password" minlength="10" required></label><div data-msg></div><button class="btn o" type="submit">Změnit heslo</button></form>
  </div></div>`;
  main.querySelector('[data-set]').addEventListener('submit', async (e) => {
    e.preventDefault(); const body = Object.fromEntries(new FormData(e.target).entries()); const m = e.target.querySelector('[data-msg]');
    try { await api('settings', body); m.innerHTML = '<p class="msg ok">Uloženo.</p>'; } catch (x) { m.innerHTML = `<p class="msg err">${esc(x.message)}</p>`; }
  });
  main.querySelector('[data-pw]').addEventListener('submit', async (e) => {
    e.preventDefault(); const body = Object.fromEntries(new FormData(e.target).entries()); const m = e.target.querySelector('[data-msg]');
    try { const r = await api('password', body); token = r.token; try { localStorage.setItem('vka-token', token); } catch (x) { /* nič */ } m.innerHTML = '<p class="msg ok">Heslo změněno.</p>'; e.target.reset(); } catch (x) { m.innerHTML = `<p class="msg err">${esc(x.message)}</p>`; }
  });
}

function route() {
  if (!token) return loginView();
  const h = decodeURIComponent(location.hash.slice(1));
  if (/^VK\d+$/.test(h)) return detailView(h);
  if (h === 'cenik') return pricesView();
  if (h === 'nastaveni') return settingsView();
  return ordersView();
}
addEventListener('hashchange', route);
route();
