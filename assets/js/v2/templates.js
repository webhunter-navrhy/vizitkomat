// Vizitkomat v3 – šablóny ako zoznam objektov (mm, 0,0 = ľavý horný roh orezu)
// Zásady: typografia namiesto klipartu (monogram / wordmark z mena), čitateľné veľkosti pre tlač (kontakty ≥ 1,8 mm),
// jasná hierarchia, odvážna kompozícia, zadná strana ako značka.
import { SIZES, SAFE, FONTS, PALETTES, initials, splitName, mix, readable, luminance, contrast, tr } from './model.js';

// ---------- pomocníci ----------
const T = (text, o = {}) => ({ type: 'text', text, ...o });
const R = (x, y, w, h, fill, o = {}) => ({ type: 'rect', x, y, w, h, fill, ...o });
const C = (x, y, r, o = {}) => ({ type: 'circle', x, y, r, ...o });
const Ln = (x1, y1, x2, y2, stroke, sw = 0.2, o = {}) => ({ type: 'line', x1, y1, x2, y2, stroke, sw, ...o });
const P = (d, o = {}) => ({ type: 'path', d, ...o });
const I = (name, x, y, s, color, o = {}) => ({ type: 'icon', name, x, y, s, color, ...o });
const IMG = (src, x, y, w, h, o = {}) => ({ type: 'image', src, x, y, w, h, fit: 'cover', ...o });
const QR = (x, y, s, color, bg) => ({ type: 'qr', x, y, s, color, bg });
const ARC = (text, x, y, r, o = {}) => ({ type: 'arctext', text, x, y, r, ...o });

const ICON_FOR = { phone: 'phone', email: 'mail', web: 'globe', address: 'map-pin' };
const LABEL = { phone: 'T', email: 'E', web: 'W', address: 'A' };
const TITLES = /^(ing|mgr|mudr|judr|phdr|mvdr|bc|rndr|paeddr|doc|prof|dr|mba|phd|csc)\.?,?$/i;
/** Meno bez titulov (pre monogram) */
const bare = (n = '') => n.split(/\s+/).filter((w) => w && !TITLES.test(w)).join(' ');
/** Monogram: iniciály osoby, inak firmy */
const mono = (c) => initials(bare(c.f.name) || c.f.company || '') || '·';
/** Mesto z adresy */
const city = (c) => (c.f.address || '').split(',').pop().trim();
/** Kontakty jedným riadkom */
const oneLine = (c, keys = ['phone', 'email', 'web']) => keys.map((k) => c.f[k]).filter((v) => v && v.trim()).join('   ·   ');

/** Kontakty do dvoch riadkov: „telefón · web“ a „e-mail“ (na stred alebo vľavo) */
function contactLines(c, o) {
  const f = c.f, size = o.size || 2.35, lh = size * 1.55;
  const l1 = [f.phone, f.web].filter((v) => v && v.trim()).join('   ·   ');
  const l2 = f.email && f.email.trim() ? f.email : '';
  const rows = [l1, l2].filter(Boolean);
  return rows.map((t, i) => T(t, { x: o.x, y: o.yb - (rows.length - 1 - i) * lh, ox: o.align === 'center' ? 'center' : 'left', oy: 'bottom', size, font: 't', color: o.color || c.pal.ink, fit: o.fit, ls: 0.01 }));
}
/** Kontakty – riadky končiace na súradnici yb. icons: ikonky (predvolene nie), labels: malé písmenká T/E/W/A. */
function contacts(c, o = {}) {
  const keys = (o.keys || ['phone', 'email', 'web', 'address']).filter((k) => c.f[k] && c.f[k].trim());
  // tlač: kontakty aspoň ~6,5 bodu (2,3 mm), riadkovanie 1,5×
  const size = Math.max(o.size || 2.4, 2.3), lh = Math.max(o.lh || 0, size * 1.5), color = o.color || c.pal.ink;
  const icons = o.icons === true, labels = !!o.labels, is = size * 1.05, gap = size * 0.75;
  const lw = labels ? size * 1.35 : 0;
  const align = o.align || 'left';
  const lc = o.lcolor || o.icolor || c.pal.accent;
  const out = [];
  const n = keys.length;
  keys.forEach((k, i) => {
    const yb = o.yb - (n - 1 - i) * lh;
    const yc = yb - size * 0.36;
    if (align === 'right') {
      if (icons) out.push(I(ICON_FOR[k], o.x - is, yc - is / 2, is, lc));
      out.push(T(c.f[k], { field: k, x: o.x - (icons ? is + gap : 0), y: yb, ox: 'right', oy: 'bottom', size, font: o.font || 't', w: o.weight, color, fit: o.fit, ls: o.ls }));
      if (labels) out.push(T(LABEL[k], { x: o.x - (o.fit || 30) - lw, y: yb, oy: 'bottom', size: size * 0.78, font: 't', w: 600, color: lc, ls: 0.1 }));
    } else if (align === 'center') {
      out.push(T(c.f[k], { field: k, x: o.x, y: yb, ox: 'center', oy: 'bottom', size, font: o.font || 't', w: o.weight, color, fit: o.fit, ls: o.ls }));
    } else {
      if (icons) out.push(I(ICON_FOR[k], o.x, yc - is / 2, is, lc));
      if (labels) out.push(T(LABEL[k], { x: o.x, y: yb - size * 0.08, oy: 'bottom', size: size * 0.78, font: 't', w: 600, color: lc, ls: 0.1 }));
      out.push(T(c.f[k], { field: k, x: o.x + (icons ? is + gap : 0) + lw, y: yb, oy: 'bottom', size, font: o.font || 't', w: o.weight, color, fit: o.fit && o.fit - lw, ls: o.ls }));
    }
  });
  return out;
}
/** Kontakty v dvoch stĺpcoch */
function contacts2(c, o) {
  const keys = (o.keys || ['phone', 'email', 'web', 'address']).filter((k) => c.f[k] && c.f[k].trim());
  const half = Math.ceil(keys.length / 2);
  return [
    ...contacts(c, { ...o, keys: keys.slice(0, half), fit: o.colW - 3 }),
    ...contacts(c, { ...o, x: o.x + o.colW, keys: keys.slice(half), yb: o.yb, fit: o.colW - 3 }),
  ];
}
/** Logo zákazníka, inak jeho znak (ak si ho sám pridal), inak typografický fallback (monogram / názov) */
function logoOr(c, x, y, w, h, o = {}, fallback = null) {
  if (c.logo) return IMG(c.logo, x, y, w, h, { fit: 'contain', role: 'logo', ax: o.ax || 'center', ay: o.ay || 'center' });
  if (c.mark && (o.mark || (fallback && fallback.type === 'text' && (fallback.mono || fallback.text === initials(c.f.name))))) {
    const s = Math.min(w, h) * (o.markScale || 0.9);
    return markImg(c, x, y, s, s, o.tint || (fallback && fallback.color) || c.pal.accent, o);
  }
  return fallback;
}
function markImg(c, x, y, w, h, tint, o = {}) {
  return IMG(c.mark, x, y, w, h, { fit: 'contain', role: 'mark', tint, ax: o.ax || 'center', ay: o.ay || 'center' });
}
function bgArt(c, key, o = {}) { return { color: c.pal.bg, art: c.art || key, artOpacity: o.opacity ?? 1, ...o }; }
/** Monogram ako text (označený, aby ho mohlo nahradiť logo/znak) */
const MONO = (c, o) => ({ ...T(mono(c), { font: 'd', ...o }), mono: true });

// ---------- šablóny ----------
export const TEMPLATES = {
  monogram: {
    name: 'Monogram', fonts: 'bodoni', pal: 'noir', tags: ['pravnik', 'advokat', 'reality', 'luxus', 'financie', 'poradenstvo', 'hotel', 'elegantne', 'luxusne', 'serioze', 'klasicky', 'tmave'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.4);
      const o = [];
      const my = c.sq ? H * 0.25 : H * 0.24;
      o.push(logoOr(c, W / 2, my, 16, 11, {}, MONO(c, { x: W / 2, y: my, ox: 'center', oy: 'center', size: c.sq ? 9 : 9.5, it: true, color: pal.accent, ls: -0.02 })));
      o.push(Ln(W / 2 - 5, H * 0.41, W / 2 + 5, H * 0.41, pal.accent, 0.12));
      o.push(T(f.name, { field: 'name', x: W / 2, y: H * 0.52, ox: 'center', oy: 'center', size: 4.4, font: 'd', color: pal.ink, fit: W - 2 * m - 6, ls: 0.01 }));
      o.push(T(f.role, { field: 'role', x: W / 2, y: H * 0.615, ox: 'center', oy: 'center', size: 1.9, font: 't', w: c.fp.tw2, upper: true, ls: 0.3, color: muted, fit: W - 2 * m - 6 }));
      if (c.sq) o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: ['phone', 'email'], size: 1.75, lh: 2.9, color: pal.ink, fit: W - 2 * m }));
      else o.push(...contactLines(c, { x: W / 2, yb: H - m + 0.3, align: 'center', color: pal.ink, fit: W - 2 * m }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const fg = readable(pal.accent, pal);
      return { bg: { color: pal.accent }, objs: [
        R(3.2, 3.2, W - 6.4, H - 6.4, null, { stroke: fg, sw: 0.12, opacity: 0.55 }),
        logoOr(c, W / 2, H / 2 - 2, W * 0.45, H * 0.42, { tint: fg }, MONO(c, { x: W / 2, y: H / 2 - 2, ox: 'center', oy: 'center', size: c.sq ? 19 : 21, it: true, color: fg, ls: -0.03 })),
        T((f.web || f.company || '').toLocaleUpperCase(), { field: f.web ? 'web' : 'company', x: W / 2, y: H - 6.6, ox: 'center', oy: 'bottom', size: 1.8, font: 't', w: 500, ls: 0.28, color: fg, fit: W - 16 }),
      ] };
    },
  },

  editorial: {
    name: 'Editorial', fonts: 'instrument', pal: 'krieda', tags: ['architekt', 'dizajn', 'kreativ', 'foto', 'poradenstvo', 'kouc', 'terapeut', 'elegantne', 'jemne', 'osobne', 'moderne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const o = [];
      const [first, last] = splitName(f.name);
      o.push(T((f.company || city(c) || '').toLocaleUpperCase(), { field: 'company', x: m, y: m, size: 1.8, font: 't', w: c.fp.tw2, ls: 0.24, color: pal.ink, fit: W * 0.6 }));
      o.push(T(f.role, { field: 'role', x: W - m, y: m, ox: 'right', size: 1.8, font: 't', w: c.fp.tw2, upper: true, ls: 0.2, color: pal.accent, fit: W * 0.36 }));
      o.push(Ln(m, m + 3.4, W - m, m + 3.4, pal.ink, 0.1, { opacity: 0.5 }));
      const sz = c.sq ? 7 : 8.6, base = c.sq ? H * 0.52 : H * 0.55;
      o.push(T(first || f.name, { field: 'name', part: 0, x: m - 0.4, y: base, oy: 'bottom', size: sz, font: 'd', color: pal.ink, fit: W - 2 * m, ls: -0.02, lh: 0.9 }));
      if (last) o.push(T(last, { field: 'name', part: 1, x: m - 0.4, y: base + sz * 0.02, size: sz, font: 'd', it: true, color: pal.accent, fit: W - 2 * m, ls: -0.02, lh: 0.9 }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.75, lh: 2.8, color: muted, fit: W - 2 * m }));
      else o.push(...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.85, color: muted, fit: W * 0.5 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      const txt = f.tagline || f.company || f.name;
      return { bg: { color: pal.accent }, objs: [
        T(txt, { field: f.tagline ? 'tagline' : 'company', x: m, y: H / 2, oy: 'center', size: c.sq ? 5 : 5.6, font: 'd', it: true, color: fg, fit: W - 2 * m, ls: -0.01 }),
        T((f.web || '').toLocaleUpperCase(), { field: 'web', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', w: 500, ls: 0.24, color: fg, fit: W - 2 * m }),
      ] };
    },
  },

  swiss: {
    name: 'Swiss', fonts: 'inter', pal: 'sneh', tags: ['it', 'firma', 'uctovnictvo', 'financie', 'architekt', 'dizajn', 'marketing', 'startup', 'moderne', 'ciste', 'serioze', 'minimal', 'elegantne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const o = [];
      o.push(R(W - m - 5.5, m, 5.5, 5.5, pal.accent));
      o.push(T(f.name, { field: 'name', x: m - 0.2, y: m - 0.6, size: c.sq ? 4.6 : 5.4, font: 'd', w: 700, color: pal.ink, fit: W - 2 * m - 9, ls: -0.03 }));
      o.push(T(f.role, { field: 'role', x: m, y: m + (c.sq ? 5.4 : 6.3), size: 2.3, font: 't', w: 500, color: muted, fit: W - 2 * m - 9 }));
      if (f.company) o.push(T(f.company, { field: 'company', x: m, y: m + (c.sq ? 8.6 : 9.6), size: 2.3, font: 't', w: 500, color: pal.ink, fit: W - 2 * m - 9 }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.9, labels: true, color: pal.ink, fit: W - 2 * m }));
      else o.push(...contacts2(c, { x: m, yb: H - m, size: 1.8, lh: 2.9, labels: true, color: pal.ink, colW: (W - 2 * m) / 2 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      return { bg: { color: pal.accent }, objs: [
        logoOr(c, m, m, 26, 12, { ax: 'left', ay: 'top', tint: fg }, MONO(c, { x: -1.5, y: H + 9, oy: 'bottom', size: c.sq ? 40 : 46, w: 700, color: fg, ls: -0.06 })),
        T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W - m, y: m - 0.4, ox: 'right', size: 2, font: 't', w: 600, color: fg, fit: W * 0.5 }),
      ] };
    },
  },

  crop: {
    name: 'Crop', fonts: 'syne', pal: 'koral', tags: ['kreativ', 'marketing', 'foto', 'hudba', 'event', 'sport', 'fitness', 'barber', 'odvazne', 'hrave', 'moderne', 'mlade'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      const [first] = splitName(bare(f.name) || f.name);
      const word = (first || f.name || f.company || '').trim();
      const o = [];
      o.push(T(f.role, { field: 'role', x: m, y: m, size: 2, font: 't', w: 600, upper: true, ls: 0.16, color: fg, fit: W * 0.55 }));
      o.push(...contacts(c, { x: W - m, yb: m + 2 + 2.8 * 2, align: 'right', keys: ['phone', 'email', 'web'], size: 1.75, lh: 2.8, color: fg, fit: W * 0.45 }));
      o.push(T(word, { field: 'name', part: 0, x: m - 1.6, y: H + (c.sq ? 3.4 : 4.2), oy: 'bottom', size: c.sq ? 20 : 24, font: 'd', w: 800, color: fg, ls: -0.05, fit: W * 1.12 }));
      return { bg: { color: pal.accent }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(T(f.name, { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 4.4, font: 'd', w: 700, color: pal.ink, fit: W - 2 * m, ls: -0.03 }));
      o.push(T(f.company || f.role, { field: f.company ? 'company' : 'role', x: m, y: H * 0.42 + 0.8, size: 2, font: 't', w: 600, color: pal.accent, fit: W - 2 * m }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.8, color: pal.ink, fit: W - 2 * m }));
      return { bg: { color: pal.bg }, objs: o };
    },
  },

  wordmark: {
    name: 'Wordmark', fonts: 'gloock', pal: 'piesok', tags: ['firma', 'gastro', 'kaviaren', 'restauracia', 'obchod', 'pekaren', 'vino', 'kvety', 'butik', 'salon', 'remeslo', 'elegantne', 'tradicne', 'firemne', 'prirodne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const word = f.company || f.name;
      const o = [];
      o.push(logoOr(c, W / 2, H * 0.45, W * 0.55, H * 0.4, {}, T(word, { field: f.company ? 'company' : 'name', x: W / 2, y: H * 0.45, ox: 'center', oy: 'center', size: c.sq ? 6 : 7.2, font: 'd', color: pal.ink, fit: W - 2 * m - 4, ls: -0.02 })));
      if (f.tagline) o.push(T(f.tagline, { field: 'tagline', x: W / 2, y: H * 0.45 + (c.sq ? 6 : 6.6), ox: 'center', size: 2.4, font: 'd', it: true, color: muted, fit: W - 2 * m - 6 }));
      o.push(R(W / 2 - 3, H - m - 0.4, 6, 0.6, pal.accent));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.soft, 0.45);
      const o = [];
      if (c.sq) {
        o.push(T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.6, font: 'd', color: pal.ink, fit: W - 2 * m }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 5, size: 1.9, font: 't', w: c.fp.tw2, upper: true, ls: 0.14, color: pal.accent, fit: W - 2 * m }));
        o.push(...contacts(c, { x: m, yb: H - m, size: 1.75, lh: 2.8, color: pal.ink, fit: W - 2 * m }));
      } else {
        const dx = W * 0.47;
        o.push(T(f.name, { field: 'name', x: m, y: H / 2 - 0.2, oy: 'bottom', size: 3.8, font: 'd', color: pal.ink, fit: dx - m - 4 }));
        o.push(T(f.role, { field: 'role', x: m, y: H / 2 + 0.9, size: 1.9, font: 't', w: c.fp.tw2, upper: true, ls: 0.16, color: pal.accent, fit: dx - m - 4 }));
        o.push(Ln(dx, m + 1, dx, H - m - 1, pal.ink, 0.1, { opacity: 0.35 }));
        const keys = ['phone', 'email', 'web', 'address'].filter((k) => f[k]);
        o.push(...contacts(c, { x: dx + 4, yb: H / 2 + (keys.length - 1) * 1.45 + 0.7, size: 1.8, lh: 2.9, color: muted, fit: W - dx - 4 - m }));
      }
      return { bg: { color: pal.soft }, objs: o };
    },
  },

  split: {
    name: 'Split', fonts: 'geist', pal: 'navy', tags: ['firma', 'uctovnictvo', 'financie', 'poistenie', 'reality', 'stavba', 'lekar', 'it', 'konzultant', 'serioze', 'ciste', 'doveryhodne', 'firemne', 'tmave', 'moderne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const band = c.sq ? H * 0.36 : W * 0.34;
      const fg = readable(pal.accent, pal);
      const ink = luminance(pal.bg) < 0.3 ? '#FFFFFF' : pal.ink;
      const muted = mix(ink, pal.bg, 0.4);
      const o = [];
      if (c.sq) {
        o.push(R(-2, -2, W + 4, band + 2, pal.accent));
        o.push(logoOr(c, W / 2, band / 2, W * 0.5, band * 0.6, { tint: fg }, MONO(c, { x: W / 2, y: band / 2, ox: 'center', oy: 'center', size: 9, color: fg, ls: -0.04 })));
        o.push(T(f.name, { field: 'name', x: m, y: band + 8, oy: 'bottom', size: 3.6, font: 'd', color: ink, fit: W - 2 * m }));
        o.push(T(f.role, { field: 'role', x: m, y: band + 9, size: 2.1, font: 't', color: contrast(pal.accent, pal.bg) >= 3 ? pal.accent : muted, fit: W - 2 * m }));
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.75, lh: 2.8, color: muted, fit: W - 2 * m }));
      } else {
        o.push(R(-2, -2, band + 2, H + 4, pal.accent));
        o.push(logoOr(c, band / 2, H / 2, band * 0.62, H * 0.5, { tint: fg }, MONO(c, { x: band / 2, y: H / 2, ox: 'center', oy: 'center', size: 11, color: fg, ls: -0.04 })));
        const x = band + 6;
        o.push(T(f.name, { field: 'name', x, y: m + 4.8, oy: 'bottom', size: 4, font: 'd', color: ink, fit: W - x - m, ls: -0.02 }));
        const accOnBg = contrast(pal.accent, pal.bg) >= 3 ? pal.accent : muted;
        o.push(T(f.role, { field: 'role', x, y: m + 5.9, size: 2.2, font: 't', w: 500, color: accOnBg, fit: W - x - m }));
        if (f.company) o.push(T(f.company, { field: 'company', x, y: m + 8.9, size: 2.1, font: 't', color: muted, fit: W - x - m }));
        o.push(...contacts(c, { x, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.85, labels: true, lcolor: accOnBg, color: ink, fit: W - x - m }));
      }
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      return { bg: { color: pal.accent }, objs: [
        logoOr(c, W / 2, H / 2 - 1.5, W * 0.5, H * 0.4, { tint: fg }, T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2 - 1.5, ox: 'center', oy: 'center', size: 5.4, font: 'd', color: fg, fit: W - 2 * m - 6, ls: -0.03, mono: false })),
        T(f.web || '', { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.7, font: 't', w: 500, color: fg, opacity: 0.85, fit: W - 2 * m, ls: 0.04 }),
      ] };
    },
  },

  minimal: {
    name: 'Minimal', fonts: 'fraunces', pal: 'salvia', tags: ['terapeut', 'psycholog', 'joga', 'wellness', 'kouc', 'umelec', 'architekt', 'jemne', 'minimal', 'osobne', 'prirodne', 'elegantne', 'moderne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const o = [];
      o.push(C(W - m - 1, m + 1, 1.15, { fill: pal.accent }));
      o.push(T(f.name, { field: 'name', x: m, y: H * 0.44, oy: 'bottom', size: 4.4, font: 'd', w: 400, color: pal.ink, fit: W - 2 * m - 6, ls: -0.01 }));
      o.push(T(f.role, { field: 'role', x: m, y: H * 0.44 + 1, size: 2.3, font: 'd', it: true, color: pal.accent, fit: W - 2 * m - 6 }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.7, lh: 2.7, color: muted, fit: W - 2 * m }));
      else o.push(...contactLines(c, { x: m, yb: H - m, color: muted, fit: W - 2 * m }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const fg = readable(pal.ink, pal);
      return { bg: { color: pal.ink }, objs: [
        C(W / 2, H / 2 - 4.2, 1.15, { fill: pal.accent }),
        T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2 + 1, ox: 'center', oy: 'center', size: 3.4, font: 'd', color: fg, fit: W - 18 }),
        T(f.tagline || f.web || '', { field: f.tagline ? 'tagline' : 'web', x: W / 2, y: H / 2 + 5, ox: 'center', oy: 'center', size: 2.2, font: 'd', it: true, color: mix(fg, pal.ink, 0.35), fit: W - 18 }),
      ] };
    },
  },

  pecat: {
    name: tr('Pečať', 'Pečeť'), fonts: 'fraunces', pal: 'smaragd', tags: ['vino', 'vinarstvo', 'farma', 'pekaren', 'remeslo', 'pivovar', 'med', 'gastro', 'barber', 'kaviaren', 'tradicne', 'rodinne', 'poctive', 'tmave', 'prirodne', 'elegantne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const r = c.sq ? 11.5 : 13.5, cx = c.sq ? W / 2 : W - r - m + 0.5, cy = c.sq ? 16 : H / 2;
      const ring = ((f.company || bare(f.name)) + '  ·  ' + (city(c) || f.role || '') + '  ·  ').toLocaleUpperCase();
      o.push(C(cx, cy, r, { stroke: pal.accent, sw: 0.22 }));
      o.push(C(cx, cy, r - 3.6, { stroke: pal.accent, sw: 0.12 }));
      o.push(ARC(ring, cx, cy, r - 1.8, { size: 1.45, font: 't', color: pal.accent, w: 600 }));
      o.push(logoOr(c, cx, cy, (r - 4.6) * 1.5, (r - 4.6) * 1.5, { tint: pal.ink }, MONO(c, { x: cx, y: cy, ox: 'center', oy: 'center', size: c.sq ? 7 : 8, it: true, color: pal.ink, ls: -0.04 })));
      if (c.sq) {
        o.push(T(f.name, { field: 'name', x: W / 2, y: 34.5, ox: 'center', oy: 'bottom', size: 3.6, font: 'd', color: pal.ink, fit: W - 2 * m }));
        o.push(T(f.role, { field: 'role', x: W / 2, y: 35.4, ox: 'center', size: 1.9, font: 't', w: 600, upper: true, ls: 0.14, color: pal.accent, fit: W - 2 * m }));
        o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: ['phone', 'email'], size: 1.7, lh: 2.7, color: pal.ink, fit: W - 2 * m }));
      } else {
        const mw = cx - r - m - 3;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5.4, oy: 'bottom', size: 4.4, font: 'd', color: pal.ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 6.6, size: 1.9, font: 't', upper: true, ls: 0.14, color: pal.accent, fit: mw, w: 600 }));
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.85, color: pal.ink, fit: mw }));
      }
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const fg = readable(pal.accent, pal);
      const r = Math.min(H * 0.36, 17);
      const ring = ((f.company || bare(f.name)) + '  ·  ' + (city(c) || f.role || '') + '  ·  ').toLocaleUpperCase();
      return { bg: { color: pal.accent }, objs: [
        C(W / 2, H / 2, r, { stroke: fg, sw: 0.25 }),
        C(W / 2, H / 2, r - 4.2, { stroke: fg, sw: 0.14 }),
        ARC(ring, W / 2, H / 2, r - 2.1, { size: 1.7, font: 't', color: fg, w: 600 }),
        logoOr(c, W / 2, H / 2, (r - 5.4) * 1.5, (r - 5.4) * 1.5, { tint: fg }, MONO(c, { x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: r * 0.62, it: true, color: fg, ls: -0.04 })),
      ] };
    },
  },

  kruh: {
    name: 'Kruh', fonts: 'outfit', pal: 'more', tags: ['lekar', 'zubar', 'kaviaren', 'deti', 'skola', 'veterina', 'wellness', 'sport', 'priatelske', 'moderne', 'hrave', 'ciste'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      const muted = mix(pal.ink, pal.bg, 0.45);
      const o = [];
      if (c.sq) {
        o.push(C(W - 8, 9, 16, { fill: pal.accent }));
        o.push(logoOr(c, W - 12, 11, 12, 12, { tint: fg }, MONO(c, { x: W - 12.5, y: 11, ox: 'center', oy: 'center', size: 7, w: 600, color: fg, ls: -0.04 })));
        o.push(T(f.name, { field: 'name', x: m, y: H * 0.62, oy: 'bottom', size: 3.6, font: 'd', w: 600, color: pal.ink, fit: W - 2 * m, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x: m, y: H * 0.62 + 0.8, size: 1.85, font: 't', w: 500, color: pal.accent, fit: W - 2 * m }));
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.7, lh: 2.7, color: muted, fit: W - 2 * m }));
      } else {
        const r = H * 0.62, cx = W - r * 0.55;
        o.push(C(cx, H / 2, r, { fill: pal.accent }));
        o.push(logoOr(c, cx - r * 0.18, H / 2, r * 0.8, r * 0.8, { tint: fg }, MONO(c, { x: cx - r * 0.2, y: H / 2, ox: 'center', oy: 'center', size: 12, w: 600, color: fg, ls: -0.05 })));
        const mw = W - r * 1.55 - m - 3;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4.2, font: 'd', w: 600, color: pal.ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 6.1, size: 2.2, font: 't', w: 500, color: pal.accent, fit: mw }));
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.85, color: muted, fit: mw }));
      }
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      const r = Math.min(H * 0.34, W * 0.3);
      return { bg: { color: pal.soft }, objs: [
        C(W / 2, H / 2, r, { fill: pal.accent }),
        logoOr(c, W / 2, H / 2, r * 1.2, r * 1.2, { tint: fg }, T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 3.4, font: 'd', w: 600, color: fg, fit: r * 1.7, ls: -0.02 })),
      ] };
    },
  },

  vzor: {
    name: 'Vzor', fonts: 'gloock', pal: 'ruza', tags: ['kvety', 'cukraren', 'butik', 'kozmetika', 'beauty', 'salon', 'svadba', 'deti', 'jemne', 'hrave', 'zenske', 'elegantne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const o = [];
      o.push(logoOr(c, m, m, 14, 8, { ax: 'left', ay: 'top' }, MONO(c, { x: m, y: m - 0.6, size: 5, it: true, color: pal.accent, ls: -0.03 })));
      o.push(T(f.name, { field: 'name', x: m, y: H * 0.62, oy: 'bottom', size: c.sq ? 4 : 4.8, font: 'd', color: pal.ink, fit: c.sq ? W - 2 * m : W * 0.55 }));
      o.push(T(f.role, { field: 'role', x: m, y: H * 0.62 + 0.9, size: 2.3, font: 'd', it: true, color: pal.accent, fit: c.sq ? W - 2 * m : W * 0.55 }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.7, lh: 2.7, color: muted, fit: W - 2 * m }));
      else o.push(...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 1.75, lh: 2.8, color: muted, fit: W * 0.42 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const mk = mono(c);
      const o = [];
      const col = mix(pal.accent, pal.soft, 0.55);
      const sx = 11, sy = 9;
      for (let r = 0, y = -2; y < H + 6; r++, y += sy) for (let x = (r % 2 ? sx / 2 : 0) - 3; x < W + 6; x += sx) o.push(T(mk, { x, y, ox: 'center', oy: 'center', size: 3.6, font: 'd', it: true, color: col, ls: -0.03 }));
      const bw = Math.min(W * 0.62, 56), bh = 13;
      o.push(R(W / 2 - bw / 2, H / 2 - bh / 2, bw, bh, pal.bg, { rx: bh / 2 }));
      o.push(T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 3.6, font: 'd', color: pal.ink, fit: bw - 8 }));
      return { bg: { color: pal.soft }, objs: o };
    },
  },

  noirgold: {
    name: 'Noir', fonts: 'bodoni', pal: 'noir', tags: ['pravnik', 'advokat', 'reality', 'financie', 'luxus', 'hotel', 'elegantne', 'tmave', 'prestiz'],
    front(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(R(3, 3, W - 6, H - 6, null, { stroke: pal.accent, sw: 0.18 }));
      o.push(R(3.9, 3.9, W - 7.8, H - 7.8, null, { stroke: pal.accent, sw: 0.08, opacity: 0.6 }));
      const cy = H / 2 - (c.sq ? 3 : 1.5);
      o.push(T(f.name, { field: 'name', x: W / 2, y: cy, ox: 'center', oy: 'bottom', size: c.sq ? 3.6 : 4.3, font: 'd', upper: true, ls: 0.16, color: pal.ink, fit: W - 18 }));
      o.push(Ln(W / 2 - 5, cy + 2.1, W / 2 + 5, cy + 2.1, pal.accent, 0.18));
      o.push(T(f.role, { field: 'role', x: W / 2, y: cy + 3.6, ox: 'center', size: 2.7, font: 'd', it: true, color: pal.accent, fit: W - 18 }));
      const det = ['phone', 'email', 'web'].filter((k) => f[k]);
      if (c.sq) o.push(...contacts(c, { x: W / 2, yb: H - 7.5, align: 'center', keys: det, size: 1.8, fit: W - 16, ls: 0.04 }));
      else o.push(T(det.map((k) => f[k]).join('   ·   '), { x: W / 2, y: H - 7, ox: 'center', oy: 'bottom', size: 1.85, font: 't', color: mix(pal.ink, pal.bg, 0.15), fit: W - 16, ls: 0.05 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2, W * 0.42, H * 0.38, {}, T(initials(f.name), { x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 13, font: 'd', color: pal.accent, ls: 0.08 })));
      o.push(T(f.company, { field: 'company', x: W / 2, y: H - 6.2, ox: 'center', oy: 'bottom', size: 1.7, font: 't', upper: true, ls: 0.32, color: pal.accent, fit: W - 16 }));
      return { bg: bgArt(c, 'mramor-cierny', { artOpacity: 0.55 }), objs: o };
    },
  },
  stuha: {
    name: tr('Stuha', 'Stuha'), fonts: 'bricolage', pal: 'piesok', tags: ['obchod', 'gastro', 'pekaren', 'remeslo', 'farma', 'rodinne', 'pevne', 'citatelne', 'hrave'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const bh = c.sq ? H * 0.34 : H * 0.4;
      const on = readable(pal.accent, pal);
      o.push(R(-2, -2, W + 4, bh + 2, pal.accent));
      const ms = bh * 0.56;
      const mark = logoOr(c, m, bh / 2, ms * 1.4, ms, { mark: true, tint: on, ax: 'left' }, null);
      if (mark) { mark.ax = 'left'; o.push(mark); }
      const tx = mark ? m + ms + 3 : m;
      o.push(T(f.company || f.name, { field: f.company ? 'company' : 'name', x: tx, y: bh / 2, oy: 'center', size: c.sq ? 3.6 : 4.4, font: 'd', w: c.fp.dw, color: on, fit: W - tx - m, ls: -0.02 }));
      const y0 = bh + (c.sq ? 7 : 7.6);
      if (f.company) {
        o.push(T(f.name, { field: 'name', x: m, y: y0, oy: 'bottom', size: 3.4, font: 'd', w: c.fp.dw, color: pal.ink, fit: W * 0.55, ls: -0.01 }));
        o.push(T(f.role, { field: 'role', x: m, y: y0 + 0.9, size: 1.9, font: 't', w: 600, color: pal.accent, fit: W * 0.55 }));
      } else { // bez firmy: meno je na stuhe, dole profesia a slogan
        o.push(T(f.role, { field: 'role', x: m, y: y0, oy: 'bottom', size: 3, font: 'd', w: c.fp.dw, color: pal.ink, fit: W * 0.55, ls: -0.01 }));
        o.push(T(f.tagline, { field: 'tagline', x: m, y: y0 + 0.9, size: 1.9, font: 't', w: 600, color: pal.accent, fit: W * 0.55 }));
      }
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.85, fit: W - 2 * m - 4 }));
      else o.push(...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 1.85, lh: 3, color: pal.ink, icolor: pal.accent, fit: W * 0.42 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const fg = readable(pal.accent, pal);
      return { bg: { color: pal.accent }, objs: [
        R(m, m, W - 2 * m, H - 2 * m, null, { stroke: fg, sw: 0.15, opacity: 0.45, rx: 1 }),
        logoOr(c, W / 2, H / 2 - 1.5, W * 0.55, H * 0.4, { tint: fg }, T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2 - 1.5, ox: 'center', oy: 'center', size: c.sq ? 5 : 6, font: 'd', w: c.fp.dw, color: fg, fit: W - 2 * m - 8, ls: -0.02 })),
        T(f.tagline || f.web || '', { field: f.tagline ? 'tagline' : 'web', x: W / 2, y: H / 2 + 5.2, ox: 'center', oy: 'center', size: 2.2, font: 't', w: 500, color: fg, opacity: 0.85, fit: W - 2 * m - 8 }),
      ] };
    },

  },
  terminal: {
    name: tr('Terminál', 'Terminál'), fonts: 'mono', pal: 'limetka', tags: ['it', 'vyvojar', 'programator', 'tech', 'startup', 'data', 'tmave', 'hrave'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const dim = mix(pal.ink, pal.bg, 0.5);
      o.push(C(m + 0.8, m + 0.8, 0.8, { fill: '#FF5F57' }), C(m + 3.4, m + 0.8, 0.8, { fill: '#FEBC2E' }), C(m + 6, m + 0.8, 0.8, { fill: '#28C840' }));
      o.push(T('~/' + (f.company || 'vizitka').toLowerCase().replace(/\s+/g, '-'), { x: m + 9.5, y: m + 1.65, oy: 'bottom', size: 1.7, font: 'm', color: dim, fit: W - m * 2 - 10 }));
      o.push(T('> ' + f.name, { field: 'name', prefix: '> ', x: m, y: m + 11, oy: 'bottom', size: 3.6, font: 'm', w: 600, color: pal.accent, fit: W - 2 * m - 3 }));
      o.push(R(W - m - 1.6, m + 7.6, 1.5, 3.2, pal.accent));
      o.push(T('  ' + f.role, { field: 'role', prefix: '  ', x: m, y: m + 12.2, size: 2.1, font: 'm', color: pal.ink, fit: W - 2 * m }));
      const rows = [['tel', 'phone'], ['mail', 'email'], ['web', 'web']].filter(([, k]) => f[k]);
      rows.forEach(([lab, k], i) => {
        const yb = H - m - (rows.length - 1 - i) * 3.3;
        o.push(T(lab, { x: m, y: yb, oy: 'bottom', size: 1.95, font: 'm', color: dim }));
        o.push(T(f[k], { field: k, x: m + 8.5, y: yb, oy: 'bottom', size: 1.95, font: 'm', color: pal.ink, fit: W - 2 * m - 9 }));
      });
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, pal, m } = c;
      const s = Math.min(H - 2 * m - 2, 28);
      return { bg: { color: pal.bg }, objs: [
        QR(W - m - s, (H - s) / 2, s, pal.ink),
        T('$ scan --contact', { x: m, y: H / 2 - 0.5, oy: 'bottom', size: 2.2, font: 'm', color: pal.accent }),
        T(tr('uložiť do kontaktov', 'uložit do kontaktů'), { x: m, y: H / 2 + 1, size: 1.9, font: 'm', color: mix(pal.ink, pal.bg, 0.4) }),
      ] };
    },
  },
  duo: {
    name: 'Duo', fonts: 'grotesk', pal: 'kobalt', tags: ['auto', 'servis', 'sport', 'fitness', 'trener', 'doprava', 'stavba', 'elektro', 'odvazne', 'moderne', 'energicke'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const on = '#FFFFFF';
      o.push(P(`M ${W * 0.58} -2 L ${W + 2} -2 L ${W + 2} ${H + 2} L ${W * 0.44} ${H + 2} Z`, { fill: pal.accent }));
      o.push(logoOr(c, W * 0.8, H / 2, W * 0.26, H * 0.4, {}, T(initials(f.name), { x: W * 0.8, y: H / 2, ox: 'center', oy: 'center', size: 11, font: 'd', w: 700, color: pal.bg, ls: -0.05 })));
      const mw = W * 0.48;
      o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4.4, font: 'd', w: 700, color: on, fit: mw, ls: -0.02 }));
      o.push(T(f.role, { field: 'role', x: m, y: m + 6.2, size: 1.9, font: 't', w: 600, upper: true, ls: 0.1, color: pal.accent, fit: mw }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.9, color: on, icolor: pal.accent, fit: mw - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      return { bg: { color: pal.accent }, objs: [
        P(`M -2 ${H * 0.72} L ${W + 2} ${H * 0.28} L ${W + 2} ${H + 2} L -2 ${H + 2} Z`, { fill: pal.bg }),
        logoOr(c, W - c.m, H - c.m, W * 0.4, H * 0.26, { ax: 'right', ay: 'bottom' }, T(f.company || f.name, { field: 'company', x: W - c.m, y: H - c.m, ox: 'right', oy: 'bottom', size: 5, font: 'd', w: 700, color: '#FFFFFF', fit: W * 0.6, ls: -0.03 })),
      ] };
    },
  },
  mramor: {
    name: 'Mramor', fonts: 'playfair', pal: 'sneh', art: 'mramor', tags: ['beauty', 'kozmetika', 'svadby', 'reality', 'luxus', 'elegantne', 'jemne', 'zena', 'interier'],
    front(c) {
      const { W, H, f, pal } = c;
      const ink = luminance(pal.ink) < 0.2 ? pal.ink : '#1F1C1A', acc = c.pal.accent === '#FF4F1F' ? '#A27B45' : pal.accent;
      const o = [];
      const pw = c.sq ? W - 10 : W * 0.56, px = c.sq ? 5 : W - pw - 5, py = 5, ph = H - 10;
      o.push(R(px, py, pw, ph, '#FFFFFF', { opacity: 0.94 }));
      const cx = px + pw / 2;
      o.push(T(f.name, { field: 'name', x: cx, y: py + ph * 0.42, ox: 'center', oy: 'bottom', size: 4.6, font: 'd', color: ink, fit: pw - 6 }));
      o.push(T(f.role, { field: 'role', x: cx, y: py + ph * 0.42 + 1.2, ox: 'center', size: 1.75, font: 't', upper: true, ls: 0.2, color: acc, fit: pw - 6 }));
      o.push(...contacts(c, { x: cx, yb: py + ph - 3.2, align: 'center', keys: ['phone', 'email', 'web'], size: 1.8, lh: 2.8, color: ink, fit: pw - 6 }));
      return { bg: bgArt(c, 'mramor'), objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const acc = c.pal.accent === '#FF4F1F' ? '#A27B45' : pal.accent;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2, W * 0.45, H * 0.36, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 6, font: 'd', it: true, color: '#1F1C1A', fit: W - 14 })));
      o.push(T(f.tagline, { field: 'tagline', x: W / 2, y: H - SAFE - 0.5, ox: 'center', oy: 'bottom', size: 1.7, font: 't', upper: true, ls: 0.2, color: acc, fit: W - 2 * SAFE }));
      return { bg: bgArt(c, 'mramor'), objs: o };
    },
  },
  botanika: {
    name: tr('Botanika', 'Botanika'), fonts: 'fraunces', pal: 'krieda', art: 'botanika', tags: ['kvety', 'wellness', 'svadby', 'kozmetika', 'terapia', 'kaviaren', 'jemne', 'prirodne', 'zena'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(IMG(c.artUrl || c.artOf('botanika'), c.sq ? W * 0.42 : W * 0.56, -2, c.sq ? W * 0.62 : W * 0.48, H + 4, { fit: 'cover', role: 'art', blend: 'multiply', ax: 'center' }));
      const mw = c.sq ? W * 0.62 : W * 0.56;
      o.push(T(f.name, { field: 'name', x: m, y: H * 0.45, oy: 'bottom', size: c.sq ? 5 : 5.6, font: 'd', color: pal.ink, fit: mw }));
      o.push(T(f.role, { field: 'role', x: m, y: H * 0.45 + 1.1, size: 2.7, font: 'd', it: true, color: pal.accent, fit: mw }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.95, fit: mw - 4 }));
      return { bg: { color: '#FFFFFF' }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2 - 1, W * 0.45, H * 0.32, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2 - 1, ox: 'center', oy: 'center', size: 5.6, font: 'd', it: true, color: pal.ink, fit: W - 14 })));
      o.push(T(f.tagline, { field: 'tagline', x: W / 2, y: H - SAFE - 1, ox: 'center', oy: 'bottom', size: 2.4, font: 'd', it: true, color: pal.accent, fit: W - 2 * SAFE }));
      return { bg: { color: mix(pal.soft, '#FFFFFF', 0.4) }, objs: o };
    },
  },
  prechod: {
    name: tr('Prechod', 'Přechod'), fonts: 'syne', pal: 'koral', art: 'mesh-teply', tags: ['kreativ', 'socialne siete', 'influencer', 'marketing', 'beauty', 'event', 'hudba', 'moderne', 'farebne', 'hrave'],
    front(c) {
      const { W, H, f, m } = c;
      const o = [];
      o.push(T(f.name, { field: 'name', x: m, y: H - m - 4.6, oy: 'bottom', size: 5.2, font: 'd', w: 700, color: '#FFFFFF', fit: W - 2 * m, ls: -0.02 }));
      o.push(T(f.role, { field: 'role', x: m, y: H - m, oy: 'bottom', size: 2.2, font: 't', w: c.fp.tw2, color: '#FFFFFF', fit: W - 2 * m }));
      o.push(T(f.company, { field: 'company', x: m, y: m, size: 1.8, font: 't', w: c.fp.tw2, upper: true, ls: 0.2, color: '#FFFFFF', fit: W * 0.6 }));
      o.push(logoOr(c, W - m, m - 0.5, 14, 7, { ax: 'right', ay: 'top' }));
      return { bg: bgArt(c, 'mesh-teply'), objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(R(-2, -2, W * 0.36 + 2, H + 4, null, { fill: { art: c.art || 'mesh-teply' } }));
      o.push(logoOr(c, W * 0.18, H / 2, W * 0.26, H * 0.4, {}, T(initials(f.name), { x: W * 0.18, y: H / 2, ox: 'center', oy: 'center', size: 9, font: 'd', w: 700, color: '#FFFFFF', ls: -0.04 })));
      o.push(...contacts(c, { x: W * 0.36 + 5, yb: H - m, size: 2.05, lh: 3.5, color: pal.ink, icolor: pal.accent, fit: W * 0.64 - m - 8 }));
      return { bg: { color: '#FFFFFF' }, objs: o };
    },
  },
  bauhaus: {
    name: 'Bauhaus', fonts: 'outfit', pal: 'bauhaus', art: 'bauhaus', tags: ['architekt', 'dizajn', 'galeria', 'skola', 'kreativ', 'agentura', 'hrave', 'odvazne', 'farebne', 'retro'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const aw = c.sq ? W : W * 0.38;
      if (c.sq) o.push(IMG(c.artOf('bauhaus'), -2, -2, W + 4, H * 0.45 + 2, { role: 'art' }));
      else o.push(IMG(c.artOf('bauhaus'), -2, -2, aw + 2, H + 4, { role: 'art' }));
      const x = c.sq ? m : aw + 5, mw = W - x - m;
      const ny = c.sq ? H * 0.45 + 7 : m + 4.6;
      o.push(T(f.name, { field: 'name', x, y: ny, oy: 'bottom', size: 4.4, font: 'd', w: 600, color: pal.ink, fit: mw, ls: -0.02 }));
      o.push(T(f.role, { field: 'role', x, y: ny + 1, size: 2.1, font: 't', color: pal.accent, fit: mw, w: 500 }));
      o.push(...contacts(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], size: 1.95, color: pal.ink, icolor: pal.soft, fit: mw - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(C(W * 0.14, H * 0.98, H * 0.42, { fill: pal.soft }));
      o.push(C(W * 0.86, H * 0.16, H * 0.22, { fill: pal.accent }));
      o.push(R(W * 0.62, H * 0.6, W * 0.42, H * 0.5, pal.ink));
      o.push(C(W * 0.62, H * 0.6, H * 0.12, { fill: pal.bg }));
      o.push(logoOr(c, m, m, W * 0.42, H * 0.26, { ax: 'left', ay: 'top' }, T(f.company || f.name, { field: 'company', x: m, y: m, size: 4.6, font: 'd', w: 600, color: pal.ink, fit: W * 0.5, ls: -0.02 })));
      return { bg: { color: pal.bg }, objs: o };
    },
  },
  linia: {
    name: tr('Línia', 'Linie'), fonts: 'instrument', pal: 'olivova', art: 'liniove-listy', tags: ['wellness', 'joga', 'terapia', 'psycholog', 'kvety', 'eko', 'minimal', 'jemne', 'prirodne', 'ciste'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(IMG(c.artOf('liniove-listy'), c.sq ? W * 0.4 : W * 0.6, c.sq ? H * 0.02 : -4, c.sq ? W * 0.7 : W * 0.46, c.sq ? H * 0.6 : H + 8, { fit: 'cover', role: 'art', blend: 'multiply', opacity: 0.85 }));
      const mw = c.sq ? W - 2 * m : W * 0.58;
      o.push(T(f.name, { field: 'name', x: m - 0.3, y: c.sq ? H * 0.62 : H * 0.48, oy: 'bottom', size: c.sq ? 6.4 : 7.2, font: 'd', color: pal.ink, fit: mw }));
      o.push(T(f.role, { field: 'role', x: m, y: (c.sq ? H * 0.62 : H * 0.48) + 1.2, size: 1.75, font: 't', upper: true, ls: 0.22, color: pal.accent, fit: mw }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], icons: false, size: 1.95, color: pal.ink, fit: mw }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2, W * 0.42, H * 0.34, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 6.2, font: 'd', it: true, color: readable(pal.soft, pal), fit: W - 14 })));
      return { bg: { color: pal.soft }, objs: o };
    },
  },
  akvarel: {
    name: 'Akvarel', fonts: 'playfair', pal: 'indigo', art: 'akvarel-modry', tags: ['umelec', 'foto', 'more', 'cestovanie', 'ucitel', 'poradenstvo', 'jemne', 'kreativ', 'osobne', 'prirodne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(IMG(c.artOf('akvarel-modry'), c.sq ? -4 : W * 0.48, c.sq ? H * 0.52 : -6, c.sq ? W + 8 : W * 0.62, c.sq ? H * 0.6 : H + 12, { role: 'art', blend: 'multiply' }));
      const mw = c.sq ? W - 2 * m : W * 0.55;
      o.push(T(f.name, { field: 'name', x: m, y: c.sq ? m + 6 : H * 0.42, oy: 'bottom', size: 5.2, font: 'd', color: pal.ink, fit: mw }));
      o.push(T(f.role, { field: 'role', x: m, y: (c.sq ? m + 6 : H * 0.42) + 1.1, size: 2.6, font: 'd', it: true, color: pal.accent, fit: mw }));
      if (!c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.95, color: pal.ink, icolor: pal.accent, fit: mw - 4 }));
      else o.push(...contacts(c, { x: m, yb: m + 22, keys: ['phone', 'email'], size: 1.9, color: pal.ink, icolor: pal.accent, fit: mw - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2, W * 0.46, H * 0.36, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 6, font: 'd', it: true, color: readable(pal.soft, pal), fit: W - 14 })));
      return { bg: { color: pal.soft, art: c.art || 'akvarel-modry', artOpacity: 0.35 }, objs: o };
    },
  },
  podpis: {
    name: 'Podpis', fonts: 'caveat', pal: 'krieda', tags: ['umelec', 'foto', 'fotograf', 'cukraren', 'svadby', 'hudba', 'kouc', 'osobne', 'hrave', 'jemne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const cy = c.sq ? H * 0.42 : H * 0.48;
      o.push(T(f.name, { field: 'name', x: W / 2, y: cy, ox: 'center', oy: 'bottom', size: c.sq ? 7 : 8.6, font: 'd', color: pal.ink, fit: W - 2 * m }));
      o.push(Ln(W / 2 - 12, cy + 1.6, W / 2 + 12, cy + 1.6, pal.accent, 0.2));
      o.push(T(f.role, { field: 'role', x: W / 2, y: cy + 3.6, ox: 'center', size: 1.75, font: 't', w: 500, upper: true, ls: 0.24, color: pal.accent, fit: W - 2 * m }));
      const det = ['phone', 'email', 'web'].filter((k) => f[k]);
      if (c.sq) o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: det, size: 1.8, fit: W - 2 * m }));
      else o.push(T(det.map((k) => f[k]).join('   ·   '), { x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.9, font: 't', color: pal.ink, fit: W - 2 * m }));
      return { bg: { color: pal.bg, art: c.art || 'lnen', artOpacity: 0.5 }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const on = readable(pal.accent, pal);
      return { bg: { color: pal.accent }, objs: [T(f.tagline || f.company, { field: f.tagline ? 'tagline' : 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 6.2, font: 'd', color: on, fit: W - 2 * SAFE - 4 })] };
    },
  },};

// ---------- zadné strany na výber ----------
export const BACKS = {
  qr(c) {
    const { W, H, f, pal, m } = c;
    const s = Math.min(H - 2 * m, 26);
    return { bg: { color: pal.ink }, objs: [
      R(W - m - s - 1.2, (H - s) / 2 - 1.2, s + 2.4, s + 2.4, pal.bg, { rx: 1 }),
      QR(W - m - s, (H - s) / 2, s, pal.ink),
      T(f.name, { field: 'name', x: m, y: H / 2 - 0.6, oy: 'bottom', size: 3.8, font: 'd', color: pal.bg, fit: W - s - 2 * m - 6 }),
      T(tr('Naskenujte a uložte si kontakt', 'Naskenujte a uložte si kontakt'), { x: m, y: H / 2 + 1, size: 1.9, font: 't', color: mix(pal.bg, pal.ink, 0.3), fit: W - s - 2 * m - 6 }),
    ] };
  },
  details(c) {
    const { W, H, pal } = c;
    const keys = ['phone', 'email', 'web', 'address'].filter((k) => c.f[k]);
    return { bg: { color: pal.soft }, objs: contacts(c, { x: W / 2 - 18, yb: H / 2 + (keys.length * 3.6) / 2 - 1, size: 2.25, lh: 3.6, fit: 34 }) };
  },
  logo(c) {
    const { W, H, f, pal } = c;
    return { bg: { color: pal.bg }, objs: [logoOr(c, W / 2, H / 2, W * 0.5, H * 0.45, {}, T(f.company || initials(f.name), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 6, font: 'd', color: pal.ink, fit: W - 14 }))] };
  },
  blank(c) { return { bg: { color: c.pal.accent }, objs: [] }; },
};
export const BACK_KEYS = ['auto', 'qr', 'logo', 'details', 'blank'];

/** Rozloženie strany návrhu */
export function layout(d, side = 'front', opts = {}) {
  const S = SIZES[d.size] || SIZES['90x50'];
  const T0 = TEMPLATES[d.tpl] || TEMPLATES.editorial;
  const pal = d.pal || PALETTES[T0.pal];
  const fp = FONTS[d.fonts || T0.fonts] || FONTS.instrument;
  let root = opts.root ?? ((typeof window !== 'undefined' && window.VK && window.VK.root) || './');
  if (typeof location !== 'undefined' && !/^https?:/.test(root)) root = new URL(root, location.href).href;
  const artOf = (k) => (k && /^(data:|https?:|\/)/.test(k) ? k : `${root}assets/art/${k}.jpg`);
  const c = {
    W: S.w, H: S.h, sq: S.w === S.h, m: SAFE + 1, f: d.f, pal, fp, logo: d.logo,
    art: d.art || null, artOf: (k) => artOf(d.art || k), artUrl: d.art ? artOf(d.art) : null, mark: d.mark || null,
    qr: d.qrUrl || 'https://vizitkomat.eu',
  };
  let out;
  if (side === 'back' && d.back && d.back !== 'auto' && BACKS[d.back]) out = BACKS[d.back](c);
  else out = (side === 'back' ? T0.back : T0.front)(c);
  out.objs = out.objs.filter(Boolean);
  if (out.bg.art) out.bg.artSrc = artOf(out.bg.art);
  out.objs.forEach((o) => { if (o.fill && o.fill.art) o.fill.src = artOf(o.fill.art); });
  return { ...out, W: S.w, H: S.h, fp, pal };
}

export function templateDefaults(id) {
  const T0 = TEMPLATES[id];
  return { fonts: T0.fonts, pal: { ...PALETTES[T0.pal] }, art: null };
}
