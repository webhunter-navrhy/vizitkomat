// Digitálna vizitka 3.0 – stránka v telefóne: skutočná vizitka (otočí sa, lesk), rezervácia, rýchle akcie, kontakt,
// o mne, služby, otváracie hodiny so stavom „otvorené teraz“, odkazy, recenzie, siete, zdieľanie a QR na celú obrazovku.
// Použitie: /v/<adresa>/, ukážka na webe (static), náhľad v editore.
import { FONTS, PALETTES, FOILS, initials, contrast, mix, luminance } from './model.js';
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

/**
 * d – návrh (rovnaký model ako tlačená vizitka): d.f, d.pal, d.fonts, d.photo, d.logo, d.mark, d.socials, d.slug,
 *     d.digital { bio, services (riadky, voliteľne „Služba – 25 €“), hours (riadky), whatsapp,
 *                 booking (URL rezervácie), bookingLabel, reviews (URL recenzií Google), links (riadky „Názov | URL“) }
 * opts.url – verejná adresa · opts.qr(text) → svg · opts.front/back – obrázky vizitky · opts.static – len náhľad
 * opts.heading – značka mena (h1 na verejnej stránke) · opts.ref – kód odporúčania do odkazu „chcem tiež“
 */
export function renderDigital(host, d, opts = {}) {
  const fp = FONTS[d.fonts] || FONTS[TEMPLATES[d.tpl]?.fonts] || FONTS.instrument;
  const p = d.pal || PALETTES[TEMPLATES[d.tpl]?.pal] || PALETTES.krieda;
  const f = d.f || {}, dg = d.digital || {};
  const dark = luminance(p.bg) < 0.25;
  const accFg = contrast(p.accent, '#FFFFFF') >= contrast(p.accent, '#111111') ? '#FFFFFF' : '#111111';
  const accText = contrast(p.accent, p.bg) >= 3 ? p.accent : p.ink;
  const muted = mix(p.ink, p.bg, 0.42), line = mix(p.ink, p.bg, 0.86), panel = mix(p.ink, p.bg, dark ? 0.93 : 0.955);
  // metalický lesk akcentu (zlatá, ružové zlato, striebro) – inak jemný prechod farby akcentu
  const fs = p.foil && FOILS[p.foil];
  const foil = fs ? `linear-gradient(115deg,${fs[0]},${fs[2]} 38%,${fs[3]} 62%,${fs[4]} 82%,${fs[5]})` : `linear-gradient(115deg,${mix(p.accent, '#000000', 0.14)},${mix(p.accent, '#FFFFFF', 0.22)} 45%,${p.accent})`;
  const tel = (f.phone || '').replace(/[^\d+]/g, '');
  const wa = (dg.whatsapp || (dg.whatsappSame !== false ? tel : '')).replace(/[^\d]/g, '');
  const web = f.web ? href(f.web) : '';
  const map = f.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f.address) : '';
  const url = opts.url || '';
  const socials = Object.entries(d.socials || {}).filter(([k, v]) => v && SOC[k]);
  const services = lines(dg.services), hours = parseHours(dg.hours);
  const status = opts.static ? null : openStatus(hours);
  const links = lines(dg.links).map((x) => { const [a, b] = x.split('|').map((s) => s.trim()); return b ? [a, b] : [hostOf(a), a]; }).filter(([, u]) => u);
  const H = opts.heading || 'p';
  const ext = (h) => (/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '');
  const name = f.name || f.company || '';
  const ref = opts.ref || (d.slug ? 'v-' + d.slug : 'v');
  const home = `https://vizitkomat.eu/${L() === 'cz' ? 'cz/digitalni-vizitka/' : 'digitalna-vizitka/'}?ref=${encodeURIComponent(ref)}`;

  const quick = [
    tel && ['phone', t('Zavolať', 'Zavolat'), 'tel:' + tel],
    wa && ['wa', 'WhatsApp', 'https://wa.me/' + wa],
    f.email && ['mail', 'E-mail', 'mailto:' + f.email],
    map ? ['nav', t('Navigovať', 'Navigovat'), map] : web && ['web', 'Web', web],
  ].filter(Boolean);
  const rows = [
    tel && ['phone', t('Mobil', 'Mobil'), f.phone, 'tel:' + tel],
    f.email && ['mail', 'E-mail', f.email, 'mailto:' + f.email],
    web && ['web', 'Web', f.web.replace(/^https?:\/\//, '').replace(/\/$/, ''), web],
    f.address && ['map', t('Adresa', 'Adresa'), f.address, map],
  ].filter(Boolean);

  const mini = `<span class="dc__mini"><span class="dc__mini-m">${d.logo ? `<img src="${d.logo}" alt="">` : d.mark ? `<i style="-webkit-mask-image:url(${d.mark});mask-image:url(${d.mark})"></i>` : esc(mono(f))}</span><b>${esc(name)}</b><small>${esc(f.role || f.company || '')}</small></span>`;
  const face = (src) => (src ? `<img src="${src}" alt="" draggable="false">` : '');
  const hasCard = !!opts.front;
  const avatar = d.photo ? `<img src="${d.photo}" alt="">` : d.logo ? `<img class="is-logo" src="${d.logo}" alt="">` : d.mark ? `<i class="is-mark" style="-webkit-mask-image:url(${d.mark});mask-image:url(${d.mark})"></i>` : `<span>${esc(mono(f))}</span>`;
  // „Služba – cena“: cenu (krátky text za pomlčkou) zarovnáme doprava
  const svc = (s) => { const m = s.match(/^(.+)\s+[–—|-]\s+([^–—|]{1,22})$/); return m && /\d|zadarmo|zdarma|dohod|na mieru|na míru/i.test(m[2]) ? `<li><span>${esc(m[1])}</span><b>${esc(m[2])}</b></li>` : `<li><span>${esc(s)}</span></li>`; };
  const hoursHtml = hours.length ? `<section class="dc__sec"><div class="dc__h2row"><h2>${t('Otváracie hodiny', 'Otevírací doba')}</h2>${status ? `<span class="dc__open${status.open ? ' is-open' : ''}${status.soft ? ' is-soft' : ''}"><i></i>${esc(status.text)}</span>` : ''}</div><ul class="dc__hours">${hours.map((h) => `<li${status && h.days.includes(status.today) ? ' class="is-today"' : ''}><span>${esc(h.label)}</span>${h.value ? `<b>${esc(h.value)}</b>` : ''}</li>`).join('')}</ul></section>` : '';
  const linksHtml = links.length || dg.reviews ? `<section class="dc__sec"><h2>${t('Odkazy', 'Odkazy')}</h2><ul class="dc__links">${dg.reviews ? `<li><a class="is-rev" href="${esc(href(dg.reviews))}" target="_blank" rel="noopener"><i>${ico('star')}</i><span><b>${t('Ohodnoťte nás na Google', 'Ohodnoťte nás na Googlu')}</b><small>${t('Pomôže nám to viac, než si myslíte', 'Pomůže nám to víc, než si myslíte')}</small></span><em aria-hidden="true">★★★★★</em></a></li>` : ''}${links.map(([a, u]) => `<li><a href="${esc(href(u))}" target="_blank" rel="noopener"><i>${ico('ext')}</i><span><b>${esc(a)}</b><small>${esc(hostOf(u))}</small></span>${ico('chev')}</a></li>`).join('')}</ul></section>` : '';

  host.innerHTML = `
  <article class="dc${dark ? ' dc--dark' : ''}${opts.static ? ' dc--static' : ''}${hasCard ? ' dc--card' : ''}" style="--d-bg:${p.bg};--d-ink:${p.ink};--d-acc:${p.accent};--d-acc-fg:${accFg};--d-acc-t:${accText};--d-soft:${p.soft};--d-muted:${muted};--d-line:${line};--d-panel:${panel};--d-foil:${foil};--d-fd:'${fp.display}';--d-dw:${fp.dw};--d-ft:'${fp.text}'">
    ${hasCard ? `<div class="dc__glow" aria-hidden="true" style="background-image:url(${opts.front})"></div>` : ''}
    <div class="dc__top">
      <span class="dc__brand">${esc(f.company && f.company !== f.name ? f.company : t('Digitálna vizitka', 'Digitální vizitka'))}</span>
      <button class="dc__ibtn" data-dc-share aria-label="${t('Zdieľať vizitku', 'Sdílet vizitku')}">${ico('share')}</button>
    </div>
    <div class="dc__stage" data-dc-stage>
      <button class="dc__flip" data-dc-flip aria-label="${t('Otočiť vizitku', 'Otočit vizitku')}">
        <span class="dc__face dc__face--f">${hasCard ? face(opts.front) : mini}<i class="dc__sheen"></i></span>
        <span class="dc__face dc__face--b">${hasCard && opts.back ? face(opts.back) : `<span class="dc__mini dc__mini--b"><b>${esc(f.company || name)}</b>${f.tagline ? `<small>${esc(f.tagline)}</small>` : ''}</span>`}<i class="dc__sheen"></i></span>
      </button>
      <span class="dc__fliphint">${ico('flip')}${t('Ťuknite a vizitka sa otočí', 'Ťukněte a vizitka se otočí')}</span>
    </div>
    <section class="dc__id">
      <div class="dc__av">${avatar}</div>
      <div class="dc__who">
        <${H} class="dc__name">${esc(name)}</${H}>
        ${f.role ? `<p class="dc__role">${esc(f.role)}</p>` : ''}
        ${f.company && f.company !== f.name ? `<p class="dc__co">${esc(f.company)}</p>` : ''}
      </div>
    </section>
    ${f.tagline ? `<p class="dc__tag">${esc(f.tagline)}</p>` : ''}
    ${dg.booking ? `<a class="dc__book" href="${esc(href(dg.booking))}" target="_blank" rel="noopener"><i>${ico('cal')}</i><span><b>${esc(dg.bookingLabel || t('Rezervovať termín', 'Rezervovat termín'))}</b><small>${t('Online, bez telefonovania', 'Online, bez telefonování')}</small></span>${ico('chev')}</a>` : ''}
    ${quick.length ? `<nav class="dc__quick" style="--n:${quick.length}" aria-label="${t('Rýchly kontakt', 'Rychlý kontakt')}">${quick.map(([k, label, h]) => `<a href="${h}"${ext(h)}><i>${ico(k)}</i><span>${label}</span></a>`).join('')}</nav>` : ''}
    ${rows.length ? `<section class="dc__sec"><h2>${t('Kontakt', 'Kontakt')}</h2><ul class="dc__rows">${rows.map(([k, lab, v, h]) => `<li><a href="${h}"${ext(h)}><i>${ico(k)}</i><span><small>${lab}</small>${esc(v)}</span><b>${ico('chev')}</b></a></li>`).join('')}</ul></section>` : ''}
    ${dg.bio ? `<section class="dc__sec"><h2>${t('O mne', 'O mně')}</h2><p class="dc__bio">${esc(dg.bio).replace(/\n/g, '<br>')}</p></section>` : ''}
    ${services.length ? `<section class="dc__sec"><h2>${t('Služby', 'Služby')}</h2><ul class="dc__svc">${services.map(svc).join('')}</ul></section>` : ''}
    ${hoursHtml}
    ${linksHtml}
    ${socials.length ? `<section class="dc__sec"><h2>${t('Sledujte ma', 'Sledujte mě')}</h2><div class="dc__soc">${socials.map(([k, v]) => `<a href="${esc(href(v))}" target="_blank" rel="noopener" style="--b:${B[k][0]}" aria-label="${SOC[k]}"><i>${bico(k)}</i><span>${SOC[k]}</span></a>`).join('')}</div></section>` : ''}
    <section class="dc__sec dc__sharebox">
      <div class="dc__qrmini" data-dc-qrmini></div>
      <div><h2>${t('Pošlite ďalej', 'Pošlete dál')}</h2><p>${t('Nechajte si naskenovať QR kód alebo pošlite odkaz cez WhatsApp či SMS.', 'Nechte si naskenovat QR kód nebo pošlete odkaz přes WhatsApp či SMS.')}</p>
      <button class="dc__link" data-dc-share>${ico('share')}<span>${t('Zdieľať vizitku', 'Sdílet vizitku')}</span></button></div>
    </section>
    <footer class="dc__foot"><a href="${home}" target="_blank" rel="noopener"><span class="dc__foot-l">${t('Chcete tiež takúto vizitku?', 'Chcete taky takovou vizitku?')}</span><span class="dc__foot-r">${t('Vytvorte si ju za 2 minúty na', 'Vytvořte si ji za 2 minuty na')} <b>vizitkomat</b> →</span></a></footer>
    <div class="dc__bar">
      <button class="dc__save" data-dc-save>${ico('userplus')}<span>${t('Uložiť do kontaktov', 'Uložit do kontaktů')}</span></button>
      <button class="dc__qrbtn" data-dc-qr aria-label="${t('Ukázať QR kód', 'Ukázat QR kód')}">${ico('qr')}</button>
    </div>
    <div class="dc__sheet" data-dc-sheet hidden role="dialog" aria-modal="true" aria-label="${t('Zdieľať', 'Sdílet')}">
      <div class="dc__sheet-in">
        <span class="dc__grab" aria-hidden="true"></span>
        <div class="dc__sheet-h"><b>${t('Zdieľať vizitku', 'Sdílet vizitku')}</b><small>${esc(url.replace(/^https?:\/\//, ''))}</small></div>
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
      <div class="dc__qrcard"><div class="dc__qrbig" data-dc-qrbig></div><b>${esc(name)}</b><small>${esc([f.role, f.company !== f.name && f.company].filter(Boolean).join(' · '))}</small><p>${ico('sun')}${t('Zvýšte jas displeja a nechajte naskenovať fotoaparátom', 'Zvyšte jas displeje a nechte naskenovat fotoaparátem')}</p></div>
    </div>
    <div class="dc__toast" data-dc-toast role="status" aria-live="polite"></div>
  </article>`;

  const card = host.querySelector('.dc');
  const hw = host.clientWidth || 480;
  card.classList.toggle('dc--narrow', hw < 360); card.classList.toggle('dc--xs', hw < 290);
  const link = url || (typeof location !== 'undefined' ? location.href.split('#')[0] : '');
  const qrMini = card.querySelector('[data-dc-qrmini]');
  if (opts.qr) qrMini.innerHTML = opts.qr(link); else qrMini.remove();
  const buzz = () => { try { navigator.vibrate?.(8); } catch (e) { /* nič */ } };
  card.querySelector('[data-dc-flip]').addEventListener('click', () => { card.classList.toggle('dc--flipped'); buzz(); });
  if (opts.static) return card;

  // lesk a náklon vizitky podľa prsta / myši
  const stage = card.querySelector('[data-dc-stage]');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const tilt = (x, y) => { stage.style.setProperty('--tx', x.toFixed(3)); stage.style.setProperty('--ty', y.toFixed(3)); };
    stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); tilt(Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5)), Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5))); });
    stage.addEventListener('pointerleave', () => tilt(0, 0));
  }

  const toastEl = card.querySelector('[data-dc-toast]');
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 3200); };
  const saveBtn = card.querySelector('[data-dc-save]');
  const saveLabel = saveBtn.querySelector('span').textContent;
  saveBtn.addEventListener('click', async () => {
    if (saveBtn.classList.contains('busy')) return;
    buzz(); saveBtn.classList.add('busy');
    await downloadVCard(f, link, { socials: d.socials, bio: dg.bio, whatsapp: wa, photoSrc: d.photo || d.logo || null });
    saveBtn.classList.remove('busy'); saveBtn.classList.add('ok');
    saveBtn.querySelector('span').textContent = t('Kontakt je stiahnutý', 'Kontakt je stažený');
    toast(t('Otvorte stiahnutý kontakt a ťuknite na „Uložiť“.', 'Otevřete stažený kontakt a ťukněte na „Uložit“.'));
    setTimeout(() => { saveBtn.classList.remove('ok'); saveBtn.querySelector('span').textContent = saveLabel; }, 4500);
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
  const showQR = () => { const big = card.querySelector('[data-dc-qrbig]'); if (!big.innerHTML && opts.qr) big.innerHTML = opts.qr(link); full.hidden = false; full.querySelector('[data-dc-qrclose]').focus({ preventScroll: true }); buzz(); };
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
  card.querySelector('[data-dc-qr]').addEventListener('click', showQR);
  full.addEventListener('click', (e) => { if (e.target === full || e.target.closest('[data-dc-qrclose]')) full.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { full.hidden = true; if (!sheet.hidden) closeSheet(); } });
  return card;
}
