// Digitálna vizitka 5.0 – stránka v telefóne v štýle tlačenej vizitky: obálka so vzorom značky a skutočnou vizitkou (otočí sa),
// meno písmom vizitky, uloženie do kontaktov, rýchle akcie, rezervácia s najbližšími dňami, služby ako menu, hodiny so stavom,
// recenzie, mapa, odkazy, siete, galéria, zdieľanie a QR na celú obrazovku. Použitie: /v/<adresa>/, ukážka na webe (static), náhľad.
import { FONTS, FONT_CSS, PALETTES, FOILS, SIZES, initials, contrast, mix, luminance } from './model.js';
import { TEMPLATES } from './templates.js';

const L = () => (window.VK && window.VK.lang) || 'sk';
const t = (sk, cz) => (L() === 'cz' ? cz : sk);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const I = {
  phone: '<path d="M5.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.5 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.5-3.5-8.5S9.5 6.1 12 3.5Z"/>',
  map: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  nav: '<path d="m3.5 11 17-7.5-7.5 17-2-7.5-7.5-2Z"/>',
  share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>',
  qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 18.5h1.5M18.5 14h2"/>',
  userplus: '<circle cx="10" cy="8" r="4"/><path d="M3 20.5c1-4 3.8-6 7-6 1.6 0 3 .4 4.2 1.2"/><path d="M18.5 14v6M15.5 17h6"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c.3 2 2.4 4.2 4.6 4.6l1-1.2 1.9.8c-.2 1-1 1.8-2 1.8-3.4 0-6.8-3.3-6.8-6.8 0-1 .8-1.8 1.8-2l.8 1.9-1.3.9Z"/>',
  sms: '<path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.5 3v-3H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"/><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  ext: '<path d="M14 4.5h5.5V10M19.5 4.5 11 13"/><path d="M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  star: '<path d="m12 3.8 2.5 5.1 5.6.8-4 4 1 5.5-5-2.6-5 2.6 1-5.5-4-4 5.6-.8Z"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M12 13.5v4M10 15.5h4"/>',
  dots: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
  flip: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
};
// siete: plné značkové ikony
const B = {
  instagram: ['#E1306C', '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.1 8.2c-.1-1.5-.4-2.8-1.5-3.9S17.3 3 15.8 2.9C14.3 2.8 9.7 2.8 8.2 2.9 6.7 3 5.4 3.3 4.3 4.3S3 6.7 2.9 8.2c-.1 1.5-.1 6.1 0 7.6.1 1.5.4 2.8 1.5 3.9s2.4 1.4 3.9 1.5c1.5.1 6.1.1 7.6 0 1.5-.1 2.8-.4 3.9-1.5s1.4-2.4 1.5-3.9c.1-1.5.1-6.1-.2-7.6Zm-2 9.3a3.1 3.1 0 0 1-1.7 1.7c-1.2.5-4 .4-5.4.4s-4.2.1-5.4-.4a3.1 3.1 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.4s-.1-4.2.4-5.4A3.1 3.1 0 0 1 6.6 5c1.2-.5 4-.4 5.4-.4s4.2-.1 5.4.4a3.1 3.1 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.4s.1 4.2-.4 5.4Z"/>'],
  facebook: ['#1877F2', '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z"/>'],
  linkedin: ['#0A66C2', '<path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2ZM8 19H5V9.5h3V19ZM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5ZM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.8 13 12.8 14.3V19h-3V9.5h2.8v1.3c.4-.8 1.4-1.5 2.9-1.5 3 0 3.6 2 3.6 4.6V19Z"/>'],
  tiktok: ['#111111', '<path d="M19.6 8.3a6.6 6.6 0 0 1-3.9-1.3v6.1a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3a2.6 2.6 0 1 0 1.8 2.5V2h3a3.9 3.9 0 0 0 3.8 3.4v2.9Z"/>'],
  youtube: ['#FF0000', '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/>'],
};
const ico = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k] || I.web}</svg>`;
const bico = (k) => `<svg class="b" viewBox="0 0 24 24" aria-hidden="true">${B[k][1]}</svg>`;
const TITLES = /^(ing|mgr|mudr|judr|phdr|mvdr|bc|rndr|paeddr|doc|prof|dr|mba|phd|csc)\.?,?$/i;
const bare = (n = '') => n.split(/\s+/).filter((w) => w && !TITLES.test(w)).join(' ');
const mono = (f) => initials(bare(f.name || '') || f.company || '');
const SOC = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube' };
const href = (u) => (/^(https?:|mailto:|tel:)/.test(u) ? u : 'https://' + String(u).replace(/^\/+/, ''));
const lines = (s) => String(s || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
const hostOf = (u) => { try { return new URL(href(u)).hostname.replace(/^www\./, ''); } catch (e) { return u; } };

/* ---------- otváracie hodiny: „Po – Pi: 8:00 – 18:00“, „So: po dohode“, „Ne zatvorené“ ---------- */
const DAYS = [['ne'], ['po'], ['ut', 'út'], ['st'], ['št', 'čt'], ['pi', 'pá'], ['so']];
const dayIdx = (w) => { const k = w.toLowerCase().slice(0, 2); for (let i = 0; i < 7; i++) if (DAYS[i].includes(k)) return i; return -1; };
export function parseHours(text) {
  const out = [];
  for (const ln of lines(text)) {
    const m = ln.match(/^\s*([A-Za-zÀ-ž]{2})[a-zà-ž.]*\s*(?:[-–—]\s*([A-Za-zÀ-ž]{2})[a-zà-ž.]*)?\s*:?\s*(.*)$/);
    const a = m ? dayIdx(m[1]) : -1;
    if (a < 0) { out.push({ label: ln, days: [] }); continue; }
    const b = m[2] ? dayIdx(m[2]) : a;
    const days = [];
    if (b >= 0) { let i = a; for (let n = 0; n < 7; n++) { days.push(i); if (i === b) break; i = (i + 1) % 7; } } else days.push(a);
    const rest = m[3].trim();
    const ranges = [...rest.matchAll(/(\d{1,2})(?:[:.](\d{2}))?\s*[-–—]\s*(\d{1,2})(?:[:.](\d{2}))?/g)].map((r) => [(+r[1]) * 60 + (+(r[2] || 0)), (+r[3]) * 60 + (+(r[4] || 0))]);
    const label = ln.slice(0, ln.length - rest.length).replace(/[:\s]+$/, '').trim();
    out.push({ label, value: rest, days, ranges });
  }
  return out;
}
const hm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
export function openStatus(rows, now = new Date()) {
  const known = rows.filter((r) => r.days.length);
  if (!known.length) return null;
  const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
  const today = known.find((r) => r.days.includes(d));
  if (today?.ranges?.length) {
    const cur = today.ranges.find(([a, b]) => m >= a && m < b);
    if (cur) return { open: true, text: t(`Otvorené · do ${hm(cur[1])}`, `Otevřeno · do ${hm(cur[1])}`), today: d };
    const next = today.ranges.find(([a]) => a > m);
    if (next) return { open: false, text: t(`Zatvorené · otvára o ${hm(next[0])}`, `Zavřeno · otevírá v ${hm(next[0])}`), today: d };
  }
  for (let i = 1; i <= 7; i++) {
    const dd = (d + i) % 7, r = known.find((x) => x.days.includes(dd) && x.ranges?.length);
    if (r) {
      const W = L() === 'cz' ? ['v neděli', 'v pondělí', 'v úterý', 've středu', 've čtvrtek', 'v pátek', 'v sobotu'] : ['v nedeľu', 'v pondelok', 'v utorok', 'v stredu', 'vo štvrtok', 'v piatok', 'v sobotu'];
      const when = i === 1 ? t('zajtra', 'zítra') : W[dd];
      return { open: false, text: t(`Zatvorené · otvára ${when} o ${hm(r.ranges[0][0])}`, `Zavřeno · otevírá ${when} v ${hm(r.ranges[0][0])}`), today: d };
    }
  }
  return today ? { open: false, text: t('Dnes po dohode', 'Dnes po domluvě'), today: d, soft: true } : null;
}

/* ---------- vCard 3.0 (s fotkou a sieťami) ---------- */
const vesc = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const fold = (ln) => { if (ln.length <= 74) return ln; const p = [ln.slice(0, 74)]; for (let i = 74; i < ln.length; i += 73) p.push(' ' + ln.slice(i, i + 73)); return p.join('\r\n'); };
export function vcard(f, url, extra = {}) {
  const parts = bare(f.name || '').trim().split(/\s+/).filter(Boolean);
  const last = parts.length > 1 ? parts.pop() : '';
  const first = parts.shift() || '';
  const pre = (f.name || '').split(/\s+/).filter((w) => TITLES.test(w)).join(' ');
  const out = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vesc(last)};${vesc(first)};${vesc(parts.join(' '))};${vesc(pre)};`, `FN:${vesc(f.name || f.company || '')}`];
  if (f.company) out.push(`ORG:${vesc(f.company)}`);
  if (f.role) out.push(`TITLE:${vesc(f.role)}`);
  const tel = (f.phone || '').replace(/[^\d+]/g, '');
  if (tel) out.push(`TEL;TYPE=CELL,VOICE:${tel}`);
  if (extra.whatsapp && !tel.replace('+', '').endsWith(extra.whatsapp.slice(-9))) out.push(`TEL;TYPE=CELL:+${extra.whatsapp}`);
  if (f.email) out.push(`EMAIL;TYPE=INTERNET,WORK:${f.email}`);
  if (f.web) out.push(`URL;TYPE=WORK:${href(f.web)}`);
  if (f.address) out.push(`ADR;TYPE=WORK:;;${vesc(f.address)};;;;`);
  for (const [k, v] of Object.entries(extra.socials || {})) if (v && SOC[k]) out.push(`X-SOCIALPROFILE;TYPE=${k}:${href(v)}`);
  if (url) out.push(`URL;TYPE=${t('Vizitka', 'Vizitka')}:${url}`);
  const note = [f.tagline, extra.bio, url && `${t('Digitálna vizitka', 'Digitální vizitka')}: ${url}`].filter(Boolean).join('\n');
  if (note) out.push(`NOTE:${vesc(note)}`);
  if (extra.photo) out.push(`PHOTO;ENCODING=b;TYPE=JPEG:${extra.photo}`);
  out.push('END:VCARD');
  return out.map(fold).join('\r\n');
}
// fotka do vCard: zmenšená štvorcová JPEG (base64 bez hlavičky)
async function photoB64(src) {
  if (!src) return '';
  try {
    const im = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const s = Math.min(im.naturalWidth, im.naturalHeight), c = document.createElement('canvas'); c.width = c.height = 320;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 320, 320);
    x.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, 320, 320);
    return c.toDataURL('image/jpeg', 0.82).split(',')[1];
  } catch (e) { return ''; }
}
export async function downloadVCard(f, url, extra = {}) {
  const photo = await photoB64(extra.photoSrc);
  const blob = new Blob([vcard(f, url, { ...extra, photo })], { type: 'text/vcard;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (bare(f.name || '') || f.company || 'kontakt').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').toLowerCase() + '.vcf';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

Object.assign(I, {
  arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
});

/* ---------- vzor obálky podľa charakteru šablóny (gilloš, vrstevnice, mriežka, body, vlny) ---------- */
const hash = (s = '') => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
function patternKind(tags = [], dark) {
  const has = (...k) => k.some((x) => tags.includes(x));
  if (has('luxusne', 'luxus', 'prestiz')) return 'guilloche';
  if (has('prirodne', 'kvety', 'wellness', 'eko', 'joga', 'terapeut', 'zahrady')) return 'topo';
  if (has('hrave', 'kreativ', 'mlade', 'cukraren', 'event')) return 'dots';
  if (has('it', 'architekt', 'moderne', 'minimal', 'ciste', 'startup', 'lekar', 'zubar')) return 'grid';
  if (has('pravnik', 'advokat', 'financie', 'hotel')) return 'guilloche';
  if (has('elegantne', 'jemne', 'svadba')) return dark ? 'guilloche' : 'topo';
  return 'waves';
}
function pattern(kind, seed, col) {
  const W = 400, H = 300, r = rng(seed), P = [];
  const sw = (w, o) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${o}"`;
  if (kind === 'guilloche') {
    const cx = 290 + r() * 40, cy = 70 + r() * 40;
    for (let i = 0; i < 40; i++) P.push(`<ellipse cx="${cx}" cy="${cy}" rx="${190 + (i % 4) * 6}" ry="${54 + (i % 3) * 7}" transform="rotate(${i * 4.5} ${cx} ${cy})" ${sw(0.6, 0.36)}/>`);
    for (let i = 0; i < 24; i++) P.push(`<circle cx="${cx}" cy="${cy}" r="${12 + i * 9}" ${sw(0.4, 0.18)}/>`);
  } else if (kind === 'topo') {
    const cx = 80 + r() * 260, cy = 60 + r() * 120, a = r() * 6, b = r() * 6;
    for (let k = 1; k <= 18; k++) {
      let d = '';
      for (let s = 0; s <= 72; s++) { const th = (s / 72) * Math.PI * 2, rr = k * 17 * (1 + 0.13 * Math.sin(3 * th + a + k * 0.21) + 0.07 * Math.sin(5 * th - b)); d += `${s ? 'L' : 'M'}${(cx + Math.cos(th) * rr * 1.25).toFixed(1)} ${(cy + Math.sin(th) * rr).toFixed(1)}`; }
      P.push(`<path d="${d}Z" ${sw(k % 5 === 0 ? 1.1 : 0.7, k % 5 === 0 ? 0.6 : 0.38)}/>`);
    }
  } else if (kind === 'grid') {
    for (let x = 0; x <= W; x += 20) P.push(`<path d="M${x} 0V${H}" ${sw(x % 100 ? 0.4 : 0.8, x % 100 ? 0.22 : 0.4)}/>`);
    for (let y = 0; y <= H; y += 20) P.push(`<path d="M0 ${y}H${W}" ${sw(y % 100 ? 0.4 : 0.8, y % 100 ? 0.22 : 0.4)}/>`);
    const cx = 300 + r() * 50, cy = 60 + r() * 40;
    P.push(`<circle cx="${cx}" cy="${cy}" r="70" ${sw(0.9, 0.4)}/><circle cx="${cx}" cy="${cy}" r="40" ${sw(0.6, 0.3)}/><path d="M${cx - 96} ${cy}H${cx + 96}M${cx} ${cy - 96}V${cy + 96}" ${sw(0.6, 0.3)}/>`);
  } else if (kind === 'dots') {
    for (let y = 8; y < H; y += 16) for (let x = 8 + ((y / 16) % 2) * 8; x < W; x += 16) { const t = Math.max(0, 1 - Math.hypot(x - 330, y - 50) / 330); if (t > 0.05) P.push(`<circle cx="${x}" cy="${y}" r="${(0.5 + t * 3.6).toFixed(2)}" fill="${col}" fill-opacity="${(0.18 + t * 0.4).toFixed(2)}"/>`); }
  } else {
    const ph = r() * 6;
    for (let k = 0; k < 22; k++) {
      let d = ''; const y0 = 10 + k * 13, amp = 7 + Math.sin(k * 0.5 + ph) * 5;
      for (let x = 0; x <= W; x += 10) d += `${x ? 'L' : 'M'}${x} ${(y0 + Math.sin(x / 46 + k * 0.32 + ph) * amp).toFixed(1)}`;
      P.push(`<path d="${d}" ${sw(0.8, k % 4 === 0 ? 0.45 : 0.24)}/>`);
    }
  }
  return `<svg class="dc__pat" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${P.join('')}</svg>`;
}

/* ---------- štylizovaná mapa mesta vo farbách značky (bez externých dlaždíc) ---------- */
function mapArt(seed, c) {
  const r = rng(seed), W = 400, H = 200, P = [];
  P.push(`<rect width="${W}" height="${H}" fill="${c.base}"/>`);
  // bloky domov v nepravidelnej mriežke (medzery = ulice)
  const cols = [0], rows = [0];
  for (let x = 0; x < W;) { x += 38 + r() * 46; cols.push(Math.min(W + 30, x)); }
  for (let y = 0; y < H;) { y += 30 + r() * 34; rows.push(Math.min(H + 30, y)); }
  for (let i = 0; i < cols.length - 1; i++) for (let j = 0; j < rows.length - 1; j++) {
    const x = cols[i] + 4, y = rows[j] + 4, w = cols[i + 1] - cols[i] - 8, h = rows[j + 1] - rows[j] - 8;
    if (w < 8 || h < 8) continue;
    const park = r() < 0.07;
    P.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${park ? c.park : c.block}"/>`);
    if (!park && w > 30 && r() < 0.5) P.push(`<path d="M${(x + w / 2).toFixed(1)} ${y.toFixed(1)}V${(y + h).toFixed(1)}" stroke="${c.base}" stroke-width="1.4"/>`);
  }
  // rieka a hlavná trieda
  const y0 = 30 + r() * 140;
  P.push(`<path d="M-20 ${y0.toFixed(0)} C 110 ${(y0 - 50 + r() * 100).toFixed(0)}, 250 ${(y0 - 40 + r() * 80).toFixed(0)}, 420 ${(20 + r() * 160).toFixed(0)}" fill="none" stroke="${c.water}" stroke-width="15" stroke-linecap="round"/>`);
  P.push(`<path d="M${(r() * 120).toFixed(0)} -10 L${(280 + r() * 120).toFixed(0)} ${H + 10}" stroke="${c.road}" stroke-width="7" stroke-linecap="round"/>`);
  P.push(`<path d="M-10 ${(60 + r() * 80).toFixed(0)} L${W + 10} ${(70 + r() * 80).toFixed(0)}" stroke="${c.road}" stroke-width="5" stroke-linecap="round"/>`);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${P.join('')}</svg>`;
}

/* ---------- najbližšie dni s otvorené (pre rýchlu rezerváciu) ---------- */
function nextDays(rows, n = 5, now = new Date()) {
  const known = rows.filter((x) => x.days.length && x.ranges?.length);
  const W = L() === 'cz' ? ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'] : ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'];
  const out = [], m = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 14 && out.length < n; i++) {
    const dt = new Date(now); dt.setDate(now.getDate() + i);
    const wd = dt.getDay();
    const r = known.length ? known.find((x) => x.days.includes(wd)) : (wd ? { ranges: [[480, 1080]] } : null);
    if (!r) continue;
    if (i === 0 && !r.ranges.some(([, b]) => b - 60 > m)) continue;
    out.push({ top: i === 0 ? t('Dnes', 'Dnes') : i === 1 ? t('Zajtra', 'Zítra') : W[wd], num: `${dt.getDate()}.${dt.getMonth() + 1}.` });
  }
  return out;
}

// písma vizitky z Google Fonts (len tie, ktoré treba; každé raz)
const fontsDone = new Set();
function ensureFonts(fp) {
  if (typeof document === 'undefined') return;
  const want = [fp.display, fp.text].filter((n) => n && !fontsDone.has(n));
  if (!want.length) return;
  const fams = FONT_CSS.split('?')[1].split('&').filter((x) => want.some((n) => x === 'family=' + n.replace(/ /g, '+') || x.startsWith('family=' + n.replace(/ /g, '+') + ':')));
  want.forEach((n) => fontsDone.add(n));
  if (!fams.length) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + fams.join('&') + '&display=swap';
  document.head.append(l);
}


const safeHex = (c, fb) => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c : fb);
const WD = () => (L() === 'cz' ? ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'] : ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So']);
// stav dňa v týždni z otváracích hodín: 2 otvorené, 1 po dohode, 0 zatvorené
function weekState(rows) {
  const known = rows.filter((r) => r.days.length);
  return [1, 2, 3, 4, 5, 6, 0].map((wd) => { const r = known.find((x) => x.days.includes(wd)); return { wd, s: !r ? 0 : r.ranges?.length ? 2 : /zatv|zavř|zavr|closed/i.test(r.value || '') ? 0 : 1 }; });
}
// „4,9 · 127 recenzií“ → { num: '4,9', val: 4.9, note: '127 recenzií' }
function parseRating(s = '') {
  const m = String(s).match(/(\d)[.,](\d)/); if (!m) return null;
  const val = +(m[1] + '.' + m[2]); if (val > 5) return null;
  return { num: `${m[1]},${m[2]}`, val, note: String(s).replace(m[0], '').replace(/^[\s·•|,–-]+/, '').trim() };
}

/**
 * d – návrh (rovnaký model ako tlačená vizitka): d.f, d.pal, d.fonts, d.photo, d.logo, d.mark, d.socials, d.slug, d.size,
 *     d.digital { bio, services (riadky, voliteľne „Služba – 25 €“), hours (riadky), whatsapp,
 *                 booking (URL rezervácie), bookingLabel, reviews (URL recenzií Google), rating („4,9 · 120 recenzií“),
 *                 links (riadky „Názov | URL“), gallery (riadky s URL fotiek), cover (URL fotky do obálky) }
 * opts.url – verejná adresa · opts.qr(text) → svg · opts.front/back – obrázky vizitky · opts.static – len náhľad
 * opts.heading – značka mena (h1 na verejnej stránke) · opts.ref – kód odporúčania do odkazu „chcem tiež“
 */
export function renderDigital(host, d, opts = {}) {
  const T0 = TEMPLATES[d.tpl] || {};
  const fp = FONTS[d.fonts] || FONTS[T0.fonts] || FONTS.instrument;
  const p0 = d.pal || PALETTES[T0.pal] || PALETTES.krieda;
  const p = { ...p0, bg: safeHex(p0.bg, '#F5F2EC'), ink: safeHex(p0.ink, '#1A1A18'), accent: safeHex(p0.accent, '#B4532A') };
  ensureFonts(fp);
  const f = d.f || {}, dg = d.digital || {};
  const dark = luminance(p.bg) < 0.25;
  const ink = contrast(p.ink, p.bg) >= 4.5 ? p.ink : (dark ? '#F5F2EC' : '#16151A');
  const accFg = contrast(p.accent, '#FFFFFF') >= contrast(p.accent, '#111111') ? '#FFFFFF' : '#111111';
  const accText = contrast(p.accent, p.bg) >= 3 ? p.accent : ink;
  const muted = mix(ink, p.bg, 0.42), line = mix(ink, p.bg, dark ? 0.86 : 0.88);
  // svetlé témy: panely svetlejšie ako pozadie (papier na papieri), tmavé: jemne vystúpené
  const veryLight = luminance(p.bg) > 0.9;
  const panel = dark ? mix(ink, p.bg, 0.93) : veryLight ? mix(ink, p.bg, 0.965) : mix(p.bg, '#FFFFFF', 0.62);
  const tint = mix(p.accent, p.bg, dark ? 0.84 : 0.88);
  const cover = mix(p.bg, p.accent, dark ? 0.1 : 0.13);
  const fs = p.foil && FOILS[p.foil];
  const foil = fs ? `linear-gradient(115deg,${fs[0]},${fs[2]} 38%,${fs[3]} 62%,${fs[4]} 82%,${fs[5]})` : `linear-gradient(115deg,${mix(p.accent, '#000000', 0.12)},${mix(p.accent, '#FFFFFF', 0.2)} 48%,${p.accent})`;
  const btn = fs ? foil : p.accent, btnFg = fs ? '#2A1F0B' : accFg;
  const patCol = fs ? fs[2] : (contrast(p.accent, cover) >= 1.6 ? p.accent : ink);
  // „pas“ do peňaženky: farba značky
  const passBg = dark ? mix(p.bg, '#000000', 0.35) : (contrast(p.accent, '#FFFFFF') >= 2.2 ? p.accent : mix(ink, p.accent, 0.25));
  const passFg = contrast(passBg, '#FFFFFF') >= contrast(passBg, '#111111') ? '#FFFFFF' : '#111111';
  const tel = (f.phone || '').replace(/[^\d+]/g, '');
  const wa = (dg.whatsapp || (dg.whatsappSame !== false ? tel : '')).replace(/[^\d]/g, '');
  const web = f.web ? href(f.web) : '';
  const q = encodeURIComponent(f.address || '');
  const map = f.address ? 'https://www.google.com/maps/search/?api=1&query=' + q : '';
  const url = opts.url || '';
  const socials = Object.entries(d.socials || {}).filter(([k, v]) => v && SOC[k]);
  const services = lines(dg.services), hours = parseHours(dg.hours);
  const status = openStatus(hours);
  const links = lines(dg.links).map((x) => { const [a, b] = x.split('|').map((s) => s.trim()); return b ? [a, b] : [hostOf(a), a]; }).filter(([, u]) => u);
  const gallery = lines(dg.gallery).filter((u) => /^(https?:|data:|\.{0,2}\/)/.test(u)).slice(0, 12);
  const rating = parseRating(dg.rating);
  const H = opts.heading || 'p';
  const ext = (h) => (/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '');
  const name = f.name || f.company || '';
  const co = f.company && f.company !== f.name ? f.company : '';
  const ref = opts.ref || (d.slug ? 'v-' + d.slug : 'v');
  const home = `https://vizitkomat.eu/${L() === 'cz' ? 'cz/digitalni-vizitka/' : 'digitalna-vizitka/'}?ref=${encodeURIComponent(ref)}`;
  const sz = SIZES[d.size] || SIZES['90x50'];
  const seed = hash((d.slug || name) + d.tpl);
  const city = (f.address || '').split(',').map((s) => s.trim()).filter(Boolean).pop() || '';
  const shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const hairMono = /Bodoni|Italiana|Josefin|Tenor|Cormorant|Marcellus/.test(fp.display);

  const quick = [
    tel && ['phone', t('Zavolať', 'Zavolat'), 'tel:' + tel],
    wa && ['wa', 'WhatsApp', 'https://wa.me/' + wa],
    f.email && ['mail', 'E-mail', 'mailto:' + f.email],
    map ? ['nav', t('Trasa', 'Trasa'), map] : web && ['web', 'Web', web],
  ].filter(Boolean);
  const rows = [
    tel && ['phone', t('Mobil', 'Mobil'), f.phone, 'tel:' + tel],
    f.email && ['mail', 'E-mail', f.email, 'mailto:' + f.email],
    web && ['web', 'Web', f.web.replace(/^https?:\/\//, '').replace(/\/$/, ''), web],
  ].filter(Boolean);

  // vizitka v obálke: skutočné strany, inak vygenerovaná z farieb
  const face = (src) => (src ? `<img src="${src}" alt="" draggable="false" decoding="async">` : '');
  const markHtml = d.logo ? `<img src="${d.logo}" alt="">` : d.mark ? `<i style="-webkit-mask-image:url(${d.mark});mask-image:url(${d.mark})"></i>` : esc(mono(f));
  const miniF = `<span class="dc__mini"><span class="dc__mini-m">${markHtml}</span><span class="dc__mini-t"><b>${esc(name)}</b><small>${esc(f.role || co)}</small></span></span>`;
  const miniB = `<span class="dc__mini dc__mini--b"><b>${esc(co || name)}</b>${f.tagline ? `<small>${esc(f.tagline)}</small>` : ''}</span>`;
  const hasCard = !!opts.front;
  const avatar = d.photo ? `<img src="${d.photo}" alt="">` : d.logo ? `<img class="is-logo" src="${d.logo}" alt="">` : d.mark ? `<i class="is-mark" style="-webkit-mask-image:url(${d.mark});mask-image:url(${d.mark})"></i>` : `<span class="dc__mono">${esc(mono(f))}</span>`;

  const sh = (title, extra = '') => `<header class="dc__sh"><h2>${title}</h2>${extra}</header>`;
  // „Služba – cena“: cena za bodkami ako v menu
  const svc = (s) => { const m = s.match(/^(.+?)\s+[–—|-]\s+([^–—|]{1,24})$/); return m && /\d|zadarmo|zdarma|dohod|na mieru|na míru/i.test(m[2]) ? `<li><span>${esc(m[1])}</span><i aria-hidden="true"></i><b>${esc(m[2])}</b></li>` : `<li><span>${esc(s)}</span></li>`; };
  const statusChip = status ? `<span class="dc__open${status.open ? ' is-open' : ''}${status.soft ? ' is-soft' : ''}"><i></i>${esc(status.text)}</span>` : '';
  const days = dg.booking ? nextDays(hours) : [];
  const stars = (v = 5) => `<span class="dc__stars" aria-hidden="true">${[1, 2, 3, 4, 5].map((k) => `<span class="${v >= k - 0.25 ? 'on' : v >= k - 0.75 ? 'half' : ''}">${ico('star')}</span>`).join('')}</span>`;

  const S = [];
  if (dg.booking) S.push(`<section class="dc__sec dc__sec--book">
      <a class="dc__book" href="${esc(href(dg.booking))}" target="_blank" rel="noopener">
        <span class="dc__book-h"><i>${ico('cal')}</i><span><b>${esc(dg.bookingLabel || t('Rezervovať termín', 'Rezervovat termín'))}</b><small>${t('Vyberte si čas online, bez telefonovania', 'Vyberte si čas online, bez telefonování')}</small></span></span>
        ${days.length ? `<span class="dc__days">${days.map((x, i) => `<span${i ? '' : ' class="on"'}><small>${x.top}</small><b>${x.num}</b></span>`).join('')}</span>` : ''}
        <span class="dc__book-go"><span>${t('Zobraziť voľné termíny', 'Zobrazit volné termíny')}</span>${ico('arrow')}</span>
      </a></section>`);
  if (dg.bio) S.push(`<section class="dc__sec dc__sec--bio">${sh(t('O mne', 'O mně'))}<p class="dc__bio">${esc(dg.bio).replace(/\n/g, '<br>')}</p>${f.name && f.name !== co ? `<p class="dc__sign">${esc(bare(f.name))}</p>` : ''}</section>`);
  if (services.length) S.push(`<section class="dc__sec">${sh(t('Služby a ceny', 'Služby a ceny'))}<div class="dc__menu"><ul class="dc__svc">${services.map(svc).join('')}</ul></div></section>`);
  if (gallery.length) S.push(`<section class="dc__sec dc__sec--bleed">${sh(t('Ukážky práce', 'Ukázky práce'), `<span class="dc__cnt">${gallery.length}</span>`)}<div class="dc__gal">${gallery.map((u, i) => `<button data-dc-gal="${i}" aria-label="${t('Zväčšiť fotku', 'Zvětšit fotku')} ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div></section>`);
  if (hours.length) {
    const wk = weekState(hours), W = WD();
    S.push(`<section class="dc__sec">${sh(t('Otváracie hodiny', 'Otevírací doba'), statusChip)}
      ${wk.some((x) => x.s) ? `<div class="dc__week" aria-hidden="true">${wk.map((x) => `<span class="s${x.s}${status && status.today === x.wd ? ' is-today' : ''}"><b>${W[x.wd]}</b><i></i></span>`).join('')}</div>` : ''}
      <ul class="dc__hours">${hours.map((h) => `<li${status && h.days.includes(status.today) ? ' class="is-today"' : ''}><span>${esc(h.label)}${status && h.days.includes(status.today) ? `<em>${t('dnes', 'dnes')}</em>` : ''}</span>${h.value ? `<b>${esc(h.value)}</b>` : ''}</li>`).join('')}</ul></section>`);
  }
  if (dg.reviews || rating) S.push(`<section class="dc__sec"><a class="dc__rev${rating ? ' has-num' : ''}"${dg.reviews ? ` href="${esc(href(dg.reviews))}" target="_blank" rel="noopener"` : ''}>
      ${rating ? `<span class="dc__rev-n"><b>${rating.num}</b>${stars(rating.val)}<small>${esc(rating.note || t('hodnotenie na Google', 'hodnocení na Googlu'))}</small></span>` : stars(5)}
      <span class="dc__rev-t"><b>${t('Boli ste spokojní?', 'Byli jste spokojeni?')}</b><small>${t('Recenzia na Google zaberie 30 sekúnd a nám veľmi pomôže.', 'Recenze na Googlu zabere 30 sekund a nám moc pomůže.')}</small></span>
      ${dg.reviews ? `<span class="dc__rev-go"><span>${t('Napísať recenziu', 'Napsat recenzi')}</span>${ico('arrow')}</span>` : ''}</a></section>`);
  if (rows.length || f.address) S.push(`<section class="dc__sec">${sh(t('Kontakt', 'Kontakt'))}<ul class="dc__rows">${rows.map(([k, lab, v, h]) => `<li><a href="${h}"${ext(h)}><i>${ico(k)}</i><span><small>${lab}</small>${esc(v)}</span>${ico('chev')}</a></li>`).join('')}</ul>
      ${f.address ? `<div class="dc__map"><a class="dc__map-art" href="${map}" target="_blank" rel="noopener" aria-label="${t('Otvoriť mapu', 'Otevřít mapu')}">${mapArt(hash(f.address), { base: mix(p.bg, dark ? '#000000' : '#FFFFFF', dark ? 0.25 : 0.35), block: dark ? mix(ink, p.bg, 0.9) : mix(ink, p.bg, 0.935), road: dark ? mix(ink, p.bg, 0.8) : '#FFFFFF', water: mix(p.accent, p.bg, dark ? 0.7 : 0.72), park: mix(p.accent, p.bg, dark ? 0.8 : 0.82) })}<span class="dc__pin" aria-hidden="true">${ico('pin')}</span></a>
        <div class="dc__map-t"><span><small>${t('Adresa', 'Adresa')}</small><b>${esc(f.address)}</b></span></div>
        <div class="dc__maps"><a href="${map}" target="_blank" rel="noopener">${ico('nav')}Google Maps</a><a href="https://maps.apple.com/?q=${q}" target="_blank" rel="noopener">${ico('map')}Apple</a><a href="https://waze.com/ul?q=${q}&navigate=yes" target="_blank" rel="noopener">${ico('nav')}Waze</a></div></div>` : ''}</section>`);
  if (links.length) S.push(`<section class="dc__sec">${sh(t('Odkazy', 'Odkazy'))}<ul class="dc__links">${links.map(([a, u]) => `<li><a href="${esc(href(u))}" target="_blank" rel="noopener"><span><b>${esc(a)}</b><small>${esc(hostOf(u))}</small></span><i>${ico('arrow')}</i></a></li>`).join('')}</ul></section>`);
  if (socials.length) S.push(`<section class="dc__sec">${sh(t('Sledujte ma', 'Sledujte mě'))}<div class="dc__soc" style="--n:${Math.min(socials.length, 4)}">${socials.map(([k, v]) => `<a href="${esc(href(v))}" target="_blank" rel="noopener" style="--b:${B[k][0]}" aria-label="${SOC[k]}"><i>${bico(k)}</i><span>${SOC[k]}</span></a>`).join('')}</div></section>`);

  const pass = `<button class="dc__pass" data-dc-qr aria-label="${t('Ukázať QR kód na celú obrazovku', 'Ukázat QR kód na celou obrazovku')}">
      <span class="dc__pass-top"><span class="dc__pass-av">${avatar}</span><span class="dc__pass-br">${esc(co || name)}</span><em>${t('Vizitka', 'Vizitka')}</em></span>
      <span class="dc__pass-name">${esc(name)}</span>
      <span class="dc__pass-meta">${f.role ? `<span><small>${t('Pozícia', 'Pozice')}</small><b>${esc(f.role)}</b></span>` : ''}${f.phone ? `<span><small>${t('Telefón', 'Telefon')}</small><b>${esc(f.phone)}</b></span>` : ''}</span>
      <span class="dc__pass-qr" data-dc-qrmini></span>
      <span class="dc__pass-url">${esc(shortUrl || t('vaša adresa', 'vaše adresa'))}</span>
    </button>`;

  host.innerHTML = `
  <article class="dc${dark ? ' dc--dark' : ' dc--light'}${fs ? ' dc--foil' : ''}${hairMono ? ' dc--hair' : ''}${/Bebas|Archivo|Unbounded|Syne|Rubik|Mono|Abril|Caveat/.test(fp.display) ? ' dc--loud' : ''}${opts.static ? ' dc--static' : ''}${hasCard ? ' dc--card' : ''}" style="--d-bg:${p.bg};--d-ink:${ink};--d-acc:${p.accent};--d-acc-fg:${accFg};--d-acc-t:${accText};--d-muted:${muted};--d-line:${line};--d-panel:${panel};--d-tint:${tint};--d-cover:${cover};--d-foil:${foil};--d-btn:${btn};--d-btn-fg:${btnFg};--d-pass:${passBg};--d-pass-fg:${passFg};--d-fd:'${fp.display}';--d-dw:${fp.dw};--d-ft:'${fp.text}';--d-ar:${sz.w}/${sz.h}">
    <header class="dc__cover"${dg.cover ? ` style="--cov:url('${esc(dg.cover)}')"` : ''}>
      ${dg.cover ? '<span class="dc__cov-img" aria-hidden="true"></span>' : pattern(patternKind(T0.tags || [], dark), seed, patCol)}
      <span class="dc__spot" aria-hidden="true"></span>
      <div class="dc__top">
        <span class="dc__brand">${esc(co || t('Digitálna vizitka', 'Digitální vizitka'))}</span>
        <span class="dc__tbtns"><button class="dc__ibtn" data-dc-qr aria-label="${t('Ukázať QR kód', 'Ukázat QR kód')}">${ico('qr')}</button><button class="dc__ibtn" data-dc-share aria-label="${t('Zdieľať vizitku', 'Sdílet vizitku')}">${ico('share')}</button></span>
      </div>
      <div class="dc__stage${sz.w === sz.h ? ' is-sq' : ''}" data-dc-stage>
        <button class="dc__flip" data-dc-flip aria-label="${t('Otočiť vizitku', 'Otočit vizitku')}">
          <span class="dc__face dc__face--f">${hasCard ? face(opts.front) : miniF}<i class="dc__sheen"></i></span>
          <span class="dc__face dc__face--b">${hasCard && opts.back ? face(opts.back) : miniB}<i class="dc__sheen"></i></span>
        </button>
        <span class="dc__floor" aria-hidden="true"></span>
      </div>
    </header>
    <section class="dc__id">
      <div class="dc__idrow"><div class="dc__av">${avatar}</div>${statusChip || `<span class="dc__fliphint">${ico('flip')}${t('Ťuknite na vizitku', 'Ťukněte na vizitku')}</span>`}</div>
      <${H} class="dc__name">${esc(name)}</${H}>
      ${f.role || co ? `<p class="dc__role">${f.role ? `<b>${esc(f.role)}</b>` : ''}${co ? `<span>${esc(co)}${city ? ' · ' + esc(city) : ''}</span>` : city ? `<span>${esc(city)}</span>` : ''}</p>` : ''}
      ${f.tagline ? `<p class="dc__tag">${esc(f.tagline)}</p>` : ''}
    </section>
    <div class="dc__cta" data-dc-cta>
      <button class="dc__save" data-dc-save><i>${ico('userplus')}</i><span>${t('Uložiť do kontaktov', 'Uložit do kontaktů')}</span></button>
      ${quick.length ? `<nav class="dc__quick" style="--n:${quick.length}" aria-label="${t('Rýchly kontakt', 'Rychlý kontakt')}">${quick.map(([k, label, h]) => `<a href="${h}"${ext(h)}><i>${ico(k)}</i><span>${label}</span></a>`).join('')}</nav>` : ''}
    </div>
    ${S.join('')}
    <section class="dc__sec dc__share">
      ${pass}
      <h2 class="dc__share-h">${t('Pošlite vizitku ďalej', 'Pošlete vizitku dál')}</h2>
      <p>${t('Ukážte kód na celú obrazovku alebo pošlite odkaz cez WhatsApp, SMS či e-mail.', 'Ukažte kód na celou obrazovku nebo pošlete odkaz přes WhatsApp, SMS či e-mail.')}</p>
      <div class="dc__share-b"><button class="dc__ghost" data-dc-share>${ico('share')}<span>${t('Zdieľať', 'Sdílet')}</span></button><button class="dc__ghost" data-dc-qr>${ico('qr')}<span>${t('QR kód', 'QR kód')}</span></button></div>
    </section>
    <footer class="dc__foot"><a href="${home}" target="_blank" rel="noopener"><span>${t('Chcete tiež takúto vizitku?', 'Chcete taky takovou vizitku?')}</span><b>${t('Vytvorte si ju na', 'Vytvořte si ji na')} vizitkomat.eu →</b></a></footer>
    <div class="dc__bar" data-dc-bar>
      <div class="dc__bar-in">
        <span class="dc__bar-av">${avatar}</span>
        <button class="dc__save dc__save--s" data-dc-save><i>${ico('userplus')}</i><span>${t('Uložiť kontakt', 'Uložit kontakt')}</span></button>
        ${tel ? `<a class="dc__ibtn" href="tel:${tel}" aria-label="${t('Zavolať', 'Zavolat')}">${ico('phone')}</a>` : `<button class="dc__ibtn" data-dc-qr aria-label="QR">${ico('qr')}</button>`}
      </div>
    </div>
    <div class="dc__sheet" data-dc-sheet hidden role="dialog" aria-modal="true" aria-label="${t('Zdieľať', 'Sdílet')}">
      <div class="dc__sheet-in">
        <span class="dc__grab" aria-hidden="true"></span>
        <div class="dc__sheet-h"><span class="dc__bar-av">${avatar}</span><span><b>${esc(name)}</b><small>${esc(shortUrl)}</small></span></div>
        <div class="dc__sheet-g">
          <a data-sh="wa" href="#" target="_blank" rel="noopener"><i style="--b:#25D366">${ico('wa')}</i>WhatsApp</a>
          <a data-sh="sms" href="#"><i style="--b:#34C759">${ico('sms')}</i>SMS</a>
          <a data-sh="mail" href="#"><i style="--b:#5B6CF0">${ico('mail')}</i>E-mail</a>
          <button data-sh="copy"><i>${ico('copy')}</i>${t('Kopírovať', 'Kopírovat')}</button>
          <button data-sh="qr"><i>${ico('qr')}</i>QR kód</button>
          <button data-sh="native"><i>${ico('dots')}</i>${t('Ďalšie', 'Další')}</button>
        </div>
        <button class="dc__a2hs" data-sh="home"><i>${ico('home')}</i><span><b>${t('Pridať na plochu telefónu', 'Přidat na plochu telefonu')}</b><small>${t('Vizitka bude po ruke ako aplikácia', 'Vizitka bude po ruce jako aplikace')}</small></span></button>
        <p class="dc__a2hs-tip" data-dc-a2hs hidden></p>
      </div>
    </div>
    <div class="dc__qrfull" data-dc-qrfull hidden role="dialog" aria-modal="true" aria-label="QR">
      <button class="dc__ibtn dc__close" data-dc-qrclose aria-label="${t('Zavrieť', 'Zavřít')}">${ico('x')}</button>
      <div class="dc__qrbigcard"><span class="dc__bar-av">${avatar}</span><b>${esc(name)}</b><small>${esc([f.role, co].filter(Boolean).join(' · '))}</small><div class="dc__qrbig" data-dc-qrbig></div><p>${ico('sun')}${t('Zvýšte jas a nechajte naskenovať fotoaparátom', 'Zvyšte jas a nechte naskenovat fotoaparátem')}</p></div>
    </div>
    ${gallery.length ? `<div class="dc__lb" data-dc-lb hidden role="dialog" aria-modal="true" aria-label="${t('Galéria', 'Galerie')}"><button class="dc__ibtn dc__close" data-dc-lbclose aria-label="${t('Zavrieť', 'Zavřít')}">${ico('x')}</button><div class="dc__lb-track" data-dc-lbtrack>${gallery.map((u) => `<figure><img src="${esc(u)}" alt="" loading="lazy" decoding="async"></figure>`).join('')}</div><span class="dc__lb-n" data-dc-lbn></span></div>` : ''}
    <div class="dc__toast" data-dc-toast role="status" aria-live="polite"></div>
  </article>`;

  const card = host.querySelector('.dc');
  const hw = host.clientWidth || 480;
  card.classList.toggle('dc--narrow', hw < 360); card.classList.toggle('dc--xs', hw < 290);
  const link = url || (typeof location !== 'undefined' ? location.href.split('#')[0] : '');
  const qrMini = card.querySelector('[data-dc-qrmini]');
  if (opts.qr) qrMini.innerHTML = opts.qr(link); else qrMini.remove();
  const buzz = () => { try { navigator.vibrate?.(8); } catch (e) { /* nič */ } };
  // pomer strán podľa skutočného obrázka (ak sa formát líši od údaja v návrhu)
  const fimg = card.querySelector('.dc__face--f img');
  const fixAr = () => { if (!fimg.naturalWidth) return; const r = fimg.naturalWidth / fimg.naturalHeight; if (Math.abs(r - sz.w / sz.h) > 0.04) { card.style.setProperty('--d-ar', String(r)); card.querySelector('.dc__stage').classList.toggle('is-sq', r < 1.2); } };
  if (fimg) { if (fimg.complete) fixAr(); else fimg.addEventListener('load', fixAr, { once: true }); }
  card.querySelector('[data-dc-flip]').addEventListener('click', () => { card.classList.toggle('dc--flipped'); card.classList.add('dc--touched'); buzz(); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // postupné odkrývanie sekcií + spodná lišta, keď hlavné tlačidlo odíde z obrazovky
  const scroller = (() => { for (let el = host; el && el !== document.body; el = el.parentElement) { const o = getComputedStyle(el).overflowY; if (/(auto|scroll)/.test(o) && el.scrollHeight > el.clientHeight + 4) return el; } return null; })();
  if ('IntersectionObserver' in window) {
    if (!reduce && !opts.static) {
      card.classList.add('dc--rv');
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
      card.querySelectorAll('.dc__sec, .dc__foot').forEach((s) => io.observe(s));
    }
    const bar = card.querySelector('[data-dc-bar]'), cta = card.querySelector('[data-dc-cta]');
    new IntersectionObserver(([e]) => {
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      bar.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.bottom < top + 40);
    }).observe(cta);
  }
  if (opts.static) return card;

  // lesk a náklon vizitky podľa prsta / myši
  const stage = card.querySelector('[data-dc-stage]');
  if (!reduce) {
    const tilt = (x, y) => { stage.style.setProperty('--tx', x.toFixed(3)); stage.style.setProperty('--ty', y.toFixed(3)); };
    stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); tilt(Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5)), Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5))); });
    stage.addEventListener('pointerleave', () => tilt(0, 0));
  }

  const toastEl = card.querySelector('[data-dc-toast]');
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 3600); };
  card.querySelectorAll('[data-dc-save]').forEach((saveBtn) => {
    const saveLabel = saveBtn.querySelector('span').textContent;
    saveBtn.addEventListener('click', async () => {
      if (saveBtn.classList.contains('busy')) return;
      buzz(); saveBtn.classList.add('busy');
      await downloadVCard(f, link, { socials: d.socials, bio: dg.bio, whatsapp: wa, photoSrc: d.photo || d.logo || null });
      saveBtn.classList.remove('busy'); saveBtn.classList.add('ok');
      saveBtn.querySelector('i').innerHTML = ico('check');
      saveBtn.querySelector('span').textContent = t('Kontakt je pripravený', 'Kontakt je připravený');
      toast(/iP(hone|ad|od)/.test(navigator.userAgent) ? t('Ťuknite na „Vytvoriť nový kontakt“ a je to.', 'Ťukněte na „Vytvořit nový kontakt“ a je to.') : t('Otvorte stiahnutý kontakt a ťuknite na „Uložiť“.', 'Otevřete stažený kontakt a ťukněte na „Uložit“.'));
      setTimeout(() => { saveBtn.classList.remove('ok'); saveBtn.querySelector('i').innerHTML = ico('userplus'); saveBtn.querySelector('span').textContent = saveLabel; }, 5000);
    });
  });
  const copy = async () => { try { await navigator.clipboard.writeText(link); toast(t('Odkaz je skopírovaný', 'Odkaz je zkopírovaný')); buzz(); } catch (e) { toast(link); } };

  // zdieľanie: spodný panel
  const sheet = card.querySelector('[data-dc-sheet]');
  const msg = `${name}${f.role ? ' – ' + f.role : ''}: ${link}`;
  sheet.querySelector('[data-sh="wa"]').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
  sheet.querySelector('[data-sh="sms"]').href = `sms:?&body=${encodeURIComponent(msg)}`;
  sheet.querySelector('[data-sh="mail"]').href = `mailto:?subject=${encodeURIComponent(t('Kontakt: ', 'Kontakt: ') + name)}&body=${encodeURIComponent(msg)}`;
  if (!navigator.share) sheet.querySelector('[data-sh="native"]').remove();
  let lastFocus = null;
  const openSheet = (e) => { lastFocus = e?.currentTarget; sheet.hidden = false; requestAnimationFrame(() => { sheet.classList.add('on'); sheet.querySelector('[data-sh]')?.focus({ preventScroll: true }); }); buzz(); };
  const closeSheet = () => { sheet.classList.remove('on'); setTimeout(() => { sheet.hidden = true; lastFocus?.focus?.({ preventScroll: true }); }, 260); };
  card.querySelectorAll('[data-dc-share]').forEach((b) => b.addEventListener('click', openSheet));
  // QR na celú obrazovku
  const full = card.querySelector('[data-dc-qrfull]');
  const showQR = () => { const big = card.querySelector('[data-dc-qrbig]'); if (!big.innerHTML && opts.qr) big.innerHTML = opts.qr(link); full.hidden = false; requestAnimationFrame(() => full.classList.add('on')); full.querySelector('[data-dc-qrclose]').focus({ preventScroll: true }); buzz(); };
  const hideQR = () => { full.classList.remove('on'); setTimeout(() => { full.hidden = true; }, 220); };
  sheet.addEventListener('click', async (e) => {
    if (e.target === sheet) return closeSheet();
    const b = e.target.closest('[data-sh]'); if (!b) return;
    const k = b.dataset.sh;
    if (k === 'copy') { e.preventDefault(); copy(); closeSheet(); }
    else if (k === 'qr') { e.preventDefault(); closeSheet(); showQR(); }
    else if (k === 'native') { e.preventDefault(); try { await navigator.share({ title: name, text: [f.role, f.company].filter(Boolean).join(' · '), url: link }); } catch (x) { /* zrušené */ } }
    else if (k === 'home') {
      e.preventDefault();
      const ios = /iP(hone|ad|od)/.test(navigator.userAgent);
      const tip = sheet.querySelector('[data-dc-a2hs]'); tip.hidden = false;
      tip.textContent = ios ? t('V Safari ťuknite dole na ikonu Zdieľať (štvorec so šípkou) a vyberte „Pridať na plochu“.', 'V Safari ťukněte dole na ikonu Sdílet (čtverec se šipkou) a vyberte „Přidat na plochu“.')
        : t('V prehliadači otvorte menu ⋮ a vyberte „Pridať na plochu“ alebo „Inštalovať aplikáciu“.', 'V prohlížeči otevřete menu ⋮ a vyberte „Přidat na plochu“ nebo „Instalovat aplikaci“.');
    } else setTimeout(closeSheet, 400);
  });
  card.querySelectorAll('[data-dc-qr]').forEach((b) => b.addEventListener('click', showQR));
  full.addEventListener('click', (e) => { if (e.target === full || e.target.closest('[data-dc-qrclose]')) hideQR(); });
  // galéria na celú obrazovku (posúvanie prstom)
  const lb = card.querySelector('[data-dc-lb]');
  let hideLB = () => {};
  if (lb) {
    const tr = lb.querySelector('[data-dc-lbtrack]'), nEl = lb.querySelector('[data-dc-lbn]'), N = gallery.length;
    const upd = () => { nEl.textContent = `${Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth)) + 1} / ${N}`; };
    tr.addEventListener('scroll', upd, { passive: true });
    const showLB = (i) => { lb.hidden = false; requestAnimationFrame(() => { tr.scrollLeft = i * tr.clientWidth; upd(); lb.classList.add('on'); }); lb.querySelector('[data-dc-lbclose]').focus({ preventScroll: true }); buzz(); };
    hideLB = () => { lb.classList.remove('on'); setTimeout(() => { lb.hidden = true; }, 220); };
    card.querySelectorAll('[data-dc-gal]').forEach((b) => b.addEventListener('click', () => showLB(+b.dataset.dcGal)));
    lb.addEventListener('click', (e) => { if (e.target.closest('[data-dc-lbclose]') || e.target === lb) hideLB(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') tr.scrollBy({ left: tr.clientWidth, behavior: 'smooth' }); if (e.key === 'ArrowLeft') tr.scrollBy({ left: -tr.clientWidth, behavior: 'smooth' }); });
  }
  // jeden poslucháč klávesnice na hostiteľa (náhľad sa prekresľuje často)
  if (host._dcKey) document.removeEventListener('keydown', host._dcKey);
  host._dcKey = (e) => { if (e.key === 'Escape') { if (!full.hidden) hideQR(); if (!sheet.hidden) closeSheet(); if (lb && !lb.hidden) hideLB(); } };
  document.addEventListener('keydown', host._dcKey);
  return card;
}
