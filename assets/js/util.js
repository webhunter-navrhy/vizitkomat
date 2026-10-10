// Spoločné pomôcky pre všetky stránky
export const VK = window.VK || { lang: 'sk', prices: {}, links: {} };
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const T = (sk, cz) => (VK.lang === 'cz' ? cz : sk);

export function money(v, { decimals } = {}) {
  const P = VK.prices;
  const d = decimals ?? (Number.isInteger(v) ? 0 : 2);
  return new Intl.NumberFormat(P.locale || 'sk-SK', { style: 'currency', currency: P.currency || 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

// cena tlačenej vizitky podľa konfigurácie
export function printPrice(c, P = VK.prices) {
  const q = String(c.qty);
  let p = P.papers[c.paper]?.[q] ?? 0;
  if (c.paper !== 'triplex') p += P.finishes[c.finish || 'none']?.[q] ?? 0;
  if (c.corners === 'round') p += P.round[q] ?? 0;
  p += P.sizes?.[c.size]?.[q] ?? 0;
  if (c.express) p += P.express;
  return p;
}
// pôvodná (bežná) cena počas zavádzacej akcie, inak null
export function wasPrice(c, P = VK.prices) {
  if (!P.launch || !P.was || c.kind === 'digital') return null;
  const w = printPrice(c, { ...P, ...P.was });
  return w > printPrice(c, P) ? w : null;
}
export function itemPrice(c, P = VK.prices) {
  if (c.kind === 'digital') return P.digital ?? P.digital_year;
  return printPrice(c, P);
}

// odhad doručenia v pracovných dňoch od objednávky (kontrola, platba, výroba, doprava)
export const deliveryDays = (express, P = VK.prices) => (express ? P.days?.express ?? 7 : P.days?.std ?? 11);

// pracovné dni
export function addWorkdays(date, n) {
  const d = new Date(date);
  while (n > 0) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) n--; }
  return d;
}
export function fmtDay(d, withWeekday = true) {
  const loc = VK.lang === 'cz' ? 'cs-CZ' : 'sk-SK';
  const wd = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d);
  const dm = `${d.getDate()}. ${d.getMonth() + 1}.`;
  return withWeekday ? `${wd} ${dm}` : dm;
}

let toastEl, toastTimer;
export function toast(msg, action) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.append(toastEl); }
  toastEl.innerHTML = '';
  const s = document.createElement('span'); s.textContent = msg; toastEl.append(s);
  if (action) { const a = document.createElement('a'); a.href = action.href; a.textContent = action.label; toastEl.append(a); }
  requestAnimationFrame(() => toastEl.classList.add('on'));
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('on'), 4200);
}

export function store(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
    if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(val));
  } catch (e) { return null; }
  return val;
}
export function session(key, val) {
  try {
    if (val === undefined) return JSON.parse(sessionStorage.getItem(key) || 'null');
    if (val === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, JSON.stringify(val));
  } catch (e) { return null; }
  return val;
}

export function debounce(fn, ms = 120) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export function raf2(fn) { requestAnimationFrame(() => requestAnimationFrame(fn)); }

// QR kód ako SVG reťazec
export function qrSVG(text, { dark = '#16140F', light = '#FFFFFF', margin = 0 } = {}) {
  const q = window.qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), s = n + margin * 2;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}
export function absUrl(rel) { return new URL(rel, location.href).href; }
