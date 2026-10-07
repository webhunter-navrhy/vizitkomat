// Vizitkomat v2 – šablóny ako zoznam objektov (mm, 0,0 = ľavý horný roh orezu)
import { SIZES, SAFE, FONTS, PALETTES, initials, splitName, mix, readable, luminance, tr } from './model.js';

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

/** Kontakty – riadky končiace na súradnici yb (spodný okraj posledného riadku). */
function contacts(c, o = {}) {
  const keys = (o.keys || ['phone', 'email', 'web', 'address']).filter((k) => c.f[k] && c.f[k].trim());
  const size = o.size || 2.05, lh = o.lh || size * 1.62, color = o.color || c.pal.ink;
  const icons = o.icons !== false, is = size * 1.05, gap = size * 0.75;
  const align = o.align || 'left';
  const out = [];
  const n = keys.length;
  keys.forEach((k, i) => {
    const yb = o.yb - (n - 1 - i) * lh; // spodok riadku
    const yc = yb - size * 0.36;       // stred riadku
    if (align === 'right') {
      if (icons) out.push(I(ICON_FOR[k], o.x - is, yc - is / 2, is, o.icolor || c.pal.accent));
      out.push(T(c.f[k], { field: k, x: o.x - (icons ? is + gap : 0), y: yb, ox: 'right', oy: 'bottom', size, font: o.font || 't', w: o.weight, color, fit: o.fit, ls: o.ls }));
    } else if (align === 'center') {
      out.push(T(c.f[k], { field: k, x: o.x, y: yb, ox: 'center', oy: 'bottom', size, font: o.font || 't', w: o.weight, color, fit: o.fit, ls: o.ls }));
    } else {
      if (icons) out.push(I(ICON_FOR[k], o.x, yc - is / 2, is, o.icolor || c.pal.accent));
      out.push(T(c.f[k], { field: k, x: o.x + (icons ? is + gap : 0), y: yb, oy: 'bottom', size, font: o.font || 't', w: o.weight, color, fit: o.fit, ls: o.ls }));
    }
  });
  return out;
}
/** Kontakty v dvoch stĺpcoch */
function contacts2(c, o) {
  const keys = (o.keys || ['phone', 'email', 'web', 'address']).filter((k) => c.f[k] && c.f[k].trim());
  const half = Math.ceil(keys.length / 2);
  return [
    ...contacts(c, { ...o, keys: keys.slice(0, half), fit: o.colW - 4 }),
    ...contacts(c, { ...o, x: o.x + o.colW, keys: keys.slice(half), yb: o.yb, fit: o.colW - 4 }),
  ];
}
function logoOr(c, x, y, w, h, o = {}, fallback = null) {
  if (c.logo) return IMG(c.logo, x, y, w, h, { fit: 'contain', role: 'logo', ax: o.ax || 'center', ay: o.ay || 'center' });
  // znak od AI nahrádza iniciály (nie názov firmy)
  if (c.mark && (o.mark || (fallback && fallback.type === 'text' && fallback.text === initials(c.f.name)))) {
    const s = Math.min(w, h) * (o.markScale || 1);
    return markImg(c, x, y, s, s, o.tint || (fallback && fallback.color) || c.pal.accent, o);
  }
  return fallback;
}
function markImg(c, x, y, w, h, tint, o = {}) {
  return IMG(c.mark, x, y, w, h, { fit: 'contain', role: 'mark', tint, ax: o.ax || 'center', ay: o.ay || 'center' });
}
function bgArt(c, key, o = {}) { return { color: c.pal.bg, art: c.art || key, artOpacity: o.opacity ?? 1, ...o }; }

// ---------- šablóny ----------
export const TEMPLATES = {
  atelier: {
    name: 'Ateliér', fonts: 'instrument', pal: 'krieda', tags: ['architekt', 'dizajn', 'kreativ', 'poradenstvo', 'elegantne', 'jemne', 'osobne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(T(f.company, { field: 'company', x: m, y: m, size: 1.75, font: 't', w: c.fp.tw2, upper: true, ls: 0.22, color: pal.ink, fit: W * 0.55 }));
      o.push(logoOr(c, W - m, m - 0.6, 18, 7, { ax: 'right', ay: 'top' }, C(W - m - 1.1, m + 0.9, 1.1, { fill: pal.accent })));
      const ny = c.sq ? H * 0.5 : H * 0.6;
      o.push(T(f.name, { field: 'name', x: m - 0.3, y: ny, oy: 'bottom', size: c.sq ? 6.6 : 8, font: 'd', color: pal.ink, fit: W - 2 * m, ls: -0.01 }));
      o.push(T(f.role, { field: 'role', x: m, y: ny + 1.2, size: 3.3, font: 'd', it: true, color: pal.accent, fit: W - 2 * m }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.95, fit: W - 2 * m - 4 }));
      else {
        o.push(Ln(m, H - m - 8.4, W - m, H - m - 8.4, mix(pal.ink, pal.bg, 0.82), 0.15));
        o.push(...contacts2(c, { x: m, yb: H - m, colW: (W - 2 * m) / 2 + 2, size: 1.95, lh: 3.25 }));
      }
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2 - 2, W * 0.5, H * 0.34, {}, T(initials(f.name), { x: W / 2, y: H / 2 - 1, ox: 'center', oy: 'center', size: c.sq ? 19 : 22, font: 'd', it: true, color: pal.accent })));
      o.push(T(f.tagline || f.web, { field: f.tagline ? 'tagline' : 'web', x: W / 2, y: H - SAFE - 0.6, ox: 'center', oy: 'bottom', size: 2.6, font: 'd', it: true, color: pal.bg, fit: W - 2 * SAFE }));
      return { bg: { color: pal.ink }, objs: o };
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

  monolit: {
    name: 'Monolit', fonts: 'inter', pal: 'sneh', tags: ['it', 'firma', 'technika', 'startup', 'marketing', 'moderne', 'ciste', 'minimal', 'odvazne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const big = initials(f.name);
      o.push(T(big, { x: W + 1, y: H + 4.5, ox: 'right', oy: 'bottom', size: H * 0.9, font: 'd', w: 800, color: pal.accent, ls: -0.06 }));
      o.push(T(f.name, { field: 'name', x: m, y: m, size: 4.4, font: 'd', w: 700, color: pal.ink, fit: W * 0.62, ls: -0.03 }));
      o.push(T(f.role, { field: 'role', x: m, y: m + 5.6, size: 2.2, font: 't', color: mix(pal.ink, pal.bg, 0.4), fit: W * 0.6 }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], icons: false, size: 2.05, weight: c.fp.tw2, fit: W * 0.55 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const on = readable(pal.accent, pal);
      const o = [];
      o.push(logoOr(c, m, H - m, W * 0.5, H * 0.3, { ax: 'left', ay: 'bottom' }, T(f.company || f.name, { field: 'company', x: m, y: H - m, oy: 'bottom', size: 6.2, font: 'd', w: 700, color: on, fit: W - 2 * m, ls: -0.04 })));
      o.push(T(f.web, { field: 'web', x: W - m, y: m, ox: 'right', size: 2.1, font: 't', w: c.fp.tw2, color: on }));
      return { bg: { color: pal.accent }, objs: o };
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

  terrazzo: {
    name: 'Terrazzo', fonts: 'gloock', pal: 'terrazzo', art: 'terrazzo', tags: ['kaviaren', 'cukraren', 'gastro', 'interier', 'kreativ', 'hrave', 'jemne', 'farebne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const sh = c.sq ? H * 0.32 : H * 0.36;
      o.push(IMG(c.artOf('terrazzo'), -2, -2, W + 4, sh + 2, { role: 'art' }));
      o.push(T(f.name, { field: 'name', x: m, y: sh + 8.2, oy: 'bottom', size: 4.8, font: 'd', color: pal.ink, fit: W * 0.58 }));
      o.push(T(f.role, { field: 'role', x: m, y: sh + 9.4, size: 2.1, font: 't', color: pal.accent, fit: W * 0.58, w: 500 }));
      o.push(...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], size: 1.9, color: pal.ink, icolor: pal.accent, fit: W * 0.42 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(R(W / 2 - (W * 0.32), H / 2 - 7, W * 0.64, 14, pal.bg, { rx: 7 }));
      o.push(logoOr(c, W / 2, H / 2, W * 0.5, 10, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 4.4, font: 'd', color: pal.ink, fit: W * 0.56 })));
      return { bg: { color: pal.bg, art: c.art || 'terrazzo' }, objs: o };
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
    name: 'Akvarel', fonts: 'playfair', pal: 'indigo', art: 'akvarel-modry', tags: ['umelec', 'foto', 'more', 'cestovanie', 'ucitel', 'poradenstvo', 'jemne', 'kreativ', 'osobne'],
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

  firma: {
    name: tr('Firemná', 'Firemní'), fonts: 'geist', pal: 'navy', tags: ['firma', 'uctovnictvo', 'financie', 'poistenie', 'reality', 'stavba', 'lekar', 'ciste', 'serioze', 'doveryhodne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const band = 3.2;
      const fg = readable(pal.bg, pal);
      o.push(R(-2, H - band, W + 4, band + 2, pal.accent));
      o.push(logoOr(c, m, m, W * 0.42, 8.5, { ax: 'left', ay: 'top' }, T(f.company, { field: 'company', x: m, y: m, size: 3, font: 'd', w: 700, color: fg, fit: W * 0.5, ls: -0.02 })));
      const ny = c.sq ? 24 : H * 0.56;
      o.push(T(f.name, { field: 'name', x: m, y: ny, oy: 'bottom', size: 4, font: 'd', w: 600, color: fg, fit: c.sq ? W - 2 * m : W * 0.5, ls: -0.01 }));
      o.push(T(f.role, { field: 'role', x: m, y: ny + 1, size: 2.1, font: 't', color: mix(fg, pal.bg, 0.35), fit: c.sq ? W - 2 * m : W * 0.5 }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - band - 3, keys: ['phone', 'email'], size: 1.85, color: fg, fit: W - 2 * m - 4 }));
      else o.push(...contacts(c, { x: W * 0.58, yb: H - band - 3.2, size: 1.9, lh: 3.1, color: fg, fit: W * 0.42 - m - 3 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2, W * 0.5, H * 0.38, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 5.6, font: 'd', w: 700, color: luminance(pal.bg) < 0.35 ? pal.bg : pal.ink, fit: W - 14, ls: -0.02 })));
      o.push(R(-2, H - 3.2, W + 4, 5.2, pal.accent));
      return { bg: { color: '#FFFFFF' }, objs: o };
    },
  },

  holo: {
    name: tr('Hologram', 'Hologram'), fonts: 'unbounded', pal: 'holo', art: 'holo', tags: ['beauty', 'nechty', 'kozmetika', 'kreativ', 'event', 'tanec', 'hudba', 'moderne', 'hrave', 'mlade'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const [first, last] = splitName(f.name);
      o.push(T((first || f.name), { field: 'name', part: 0, x: m - 0.3, y: H * 0.42, oy: 'bottom', size: 5.6, font: 'd', w: 600, color: pal.ink, fit: W - 2 * m, ls: -0.04 }));
      if (last) o.push(T(last, { field: 'name', part: 1, x: m - 0.3, y: H * 0.42 + 0.6, size: 5.6, font: 'd', w: 300, color: pal.ink, fit: W - 2 * m, ls: -0.04 }));
      o.push(...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email'], icons: false, size: 1.9, color: pal.ink, fit: W * 0.5 }));
      o.push(T(f.role, { field: 'role', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 600, upper: true, ls: 0.12, color: pal.accent, fit: W * 0.42 }));
      return { bg: bgArt(c, 'holo'), objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      return { bg: { color: pal.soft }, objs: [
        logoOr(c, W / 2, H / 2, W * 0.46, H * 0.36, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 5, font: 'd', w: 600, color: readable(pal.soft, pal), fit: W - 14, ls: -0.03 })),
      ] };
    },
  },

  drevo: {
    name: tr('Drevo', 'Dřevo'), fonts: 'bricolage', pal: 'dub', art: 'drevo', tags: ['stolar', 'truhlar', 'remeslo', 'stavba', 'tesar', 'podlahy', 'nabytok', 'eko', 'prirodne', 'poctive'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4.6, font: 'd', w: 700, color: pal.ink, fit: W - 2 * m - 16, ls: -0.02 }));
      o.push(T(f.role, { field: 'role', x: m, y: m + 6.2, size: 2.15, font: 't', w: 600, color: pal.accent, fit: W * 0.6 }));
      o.push(logoOr(c, W - m, m - 0.5, 14, 9, { ax: 'right', ay: 'top' }));
      o.push(...contacts(c, { x: m, yb: H - m, size: 1.95, color: pal.ink, icolor: pal.accent, fit: W - 2 * m - 4, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'] }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(R(W / 2 - 22, H / 2 - 7.5, 44, 15, pal.bg, { opacity: 0.92, rx: 1 }));
      o.push(logoOr(c, W / 2, H / 2, 38, 11, {}, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 4.4, font: 'd', w: 700, color: pal.ink, fit: 38, ls: -0.02 })));
      return { bg: { color: pal.soft, art: c.art || 'drevo' }, objs: o };
    },
  },

  retro: {
    name: 'Retro', fonts: 'bricolage', pal: 'retro', art: 'vlny', tags: ['kaviaren', 'bar', 'hudba', 'pivovar', 'barber', 'kreativ', 'retro', 'hrave', 'odvazne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const ink = pal.ink, acc = pal.accent;
      o.push(T(f.name, { field: 'name', x: W / 2, y: H * 0.46, ox: 'center', oy: 'bottom', size: 5.4, font: 'd', w: 800, color: ink, fit: W - 2 * m, ls: -0.03 }));
      o.push(T(f.role, { field: 'role', x: W / 2, y: H * 0.46 + 1.3, ox: 'center', size: 1.9, font: 't', w: 700, upper: true, ls: 0.2, color: acc, fit: W - 2 * m }));
      o.push(Ln(W / 2 - 14, H * 0.46 + 5.4, W / 2 + 14, H * 0.46 + 5.4, acc, 0.35));
      const det = ['phone', 'email', 'web'].filter((k) => f[k]);
      if (c.sq) o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: det, size: 1.85, color: ink, fit: W - 2 * m }));
      else o.push(T(det.map((k) => f[k]).join('  •  '), { x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.9, font: 't', w: 500, color: ink, fit: W - 2 * m }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      o.push(C(W / 2, H / 2, Math.min(W, H) * 0.3, { fill: pal.bg }));
      o.push(logoOr(c, W / 2, H / 2, Math.min(W, H) * 0.42, Math.min(W, H) * 0.3, {}, T(initials(f.name), { x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 9, font: 'd', w: 800, color: pal.ink, ls: -0.04 })));
      return { bg: { color: pal.accent, art: c.art || 'vlny' }, objs: o };
    },
  },

  pecat: {
    name: tr('Pečať', 'Pečeť'), fonts: 'gloock', pal: 'smaragd', tags: ['vino', 'vinarstvo', 'farma', 'pekaren', 'remeslo', 'pivovar', 'med', 'gastro', 'tradicne', 'rodinne', 'poctive'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const r = c.sq ? 11 : 12.5, cx = c.sq ? W / 2 : W - r - m, cy = c.sq ? 15 : H / 2;
      o.push(C(cx, cy, r, { stroke: pal.accent, sw: 0.25 }));
      o.push(C(cx, cy, r - 3.4, { stroke: pal.accent, sw: 0.12 }));
      const city = (f.address || '').split(',').pop().trim();
      o.push(ARC(((f.company || f.name) + ' · ' + (city || tr('od roku 2026', 'od roku 2026')) + ' · ').toLocaleUpperCase(), cx, cy, r - 1.7, { size: 1.5, font: 't', color: pal.accent, w: 500 }));
      o.push(logoOr(c, cx, cy, (r - 4.4) * 1.4, (r - 4.4) * 1.4, {}, T(initials(f.name), { x: cx, y: cy, ox: 'center', oy: 'center', size: 6, font: 'd', color: pal.ink })));
      if (c.sq) {
        o.push(T(f.name, { field: 'name', x: W / 2, y: 33.5, ox: 'center', oy: 'bottom', size: 3.8, font: 'd', color: pal.ink, fit: W - 2 * m }));
        o.push(T(f.role, { field: 'role', x: W / 2, y: 34.5, ox: 'center', size: 1.8, font: 't', upper: true, ls: 0.14, color: pal.accent, fit: W - 2 * m }));
        o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: ['phone', 'email'], size: 1.8, color: pal.ink, fit: W - 2 * m }));
      } else {
        const mw = cx - r - m - 4;
        o.push(T(f.name, { field: 'name', x: m, y: m + 6, oy: 'bottom', size: 4.6, font: 'd', color: pal.ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 7.2, size: 1.8, font: 't', upper: true, ls: 0.14, color: pal.accent, fit: mw, w: 500 }));
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.9, color: pal.ink, fit: mw - 4 }));
      }
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      return { bg: { color: pal.accent }, objs: [
        T(f.tagline || f.company, { field: f.tagline ? 'tagline' : 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 4.4, font: 'd', color: pal.bg, fit: W - 2 * SAFE - 6 }),
      ] };
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

  zlato: {
    name: tr('Zlatá línia', 'Zlatá linie'), fonts: 'bodoni', pal: 'smaragd', art: 'zlato-folia', tags: ['luxus', 'hotel', 'reality', 'pravnik', 'svadby', 'klenoty', 'vino', 'elegantne', 'tmave', 'prestiz'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(R(m, -2, 1.4, H + 4, null, { fill: { art: 'zlato-folia' } }));
      const x = m + 5, mw = W - x - m;
      o.push(T(f.name, { field: 'name', x, y: H * 0.5, oy: 'bottom', size: c.sq ? 4.6 : 5.4, font: 'd', color: pal.ink, fit: mw }));
      o.push(T(f.role, { field: 'role', x, y: H * 0.5 + 1.2, size: 2.5, font: 'd', it: true, color: pal.accent, fit: mw }));
      o.push(...contacts(c, { x, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.85, color: mix(pal.ink, pal.bg, 0.1), icolor: pal.accent, fit: mw - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      return { bg: { color: pal.bg }, objs: [
        R(-2, H / 2 - 0.5, W + 4, 1, null, { fill: { art: 'zlato-folia' } }),
        C(W / 2, H / 2, Math.min(W, H) * 0.26, { fill: pal.bg, stroke: pal.accent, sw: 0.25 }),
        logoOr(c, W / 2, H / 2, Math.min(W, H) * 0.34, Math.min(W, H) * 0.34, {}, T(initials(f.name), { x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 8, font: 'd', color: pal.accent })),
      ] };
    },
  },
};

// ---------- šablóny so znakom ----------
Object.assign(TEMPLATES, {
  znak: {
    name: 'Znak', fonts: 'playfair', pal: 'krieda', tags: ['pekaren', 'kaviaren', 'kvety', 'lekar', 'remeslo', 'gastro', 'elegantne', 'klasicke', 'jemne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const ms = c.sq ? 16 : 13;
      const my = c.sq ? 6 : 4.6;
      o.push(logoOr(c, W / 2, my + ms / 2, ms * 1.8, ms, { mark: true, tint: pal.accent }, C(W / 2, my + ms / 2, ms / 2.2, { stroke: pal.accent, sw: 0.25 })));
      if (!c.mark && !c.logo) o.push(T(initials(f.name), { x: W / 2, y: my + ms / 2, ox: 'center', oy: 'center', size: ms / 2.6, font: 'd', it: true, color: pal.accent }));
      const ny = my + ms + (c.sq ? 9 : 7.6);
      o.push(T(f.name, { field: 'name', x: W / 2, y: ny, ox: 'center', oy: 'bottom', size: c.sq ? 4.2 : 4.8, font: 'd', color: pal.ink, fit: W - 2 * m }));
      o.push(T(f.role || f.company, { field: f.role ? 'role' : 'company', x: W / 2, y: ny + 1, ox: 'center', size: 1.75, font: 't', w: c.fp.tw2, upper: true, ls: 0.22, color: pal.accent, fit: W - 2 * m }));
      const det = ['phone', 'email', 'web'].filter((k) => f[k]);
      if (c.sq) o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: det, size: 1.8, lh: 2.7, fit: W - 2 * m }));
      else o.push(T(det.map((k) => f[k]).join('   ·   '), { x: W / 2, y: H - m + 0.4, ox: 'center', oy: 'bottom', size: 1.85, font: 't', color: mix(pal.ink, pal.bg, 0.15), fit: W - 2 * m }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      const ms = Math.min(W, H) * 0.42;
      o.push(logoOr(c, W / 2, H / 2 - 3, W * 0.5, ms, { mark: true, tint: pal.bg }, T(f.company || initials(f.name), { field: 'company', x: W / 2, y: H / 2 - 2, ox: 'center', oy: 'center', size: 6, font: 'd', color: pal.bg, fit: W - 14 })));
      o.push(T(f.tagline || f.company, { field: f.tagline ? 'tagline' : 'company', x: W / 2, y: H - SAFE - 1.2, ox: 'center', oy: 'bottom', size: 2.6, font: 'd', it: true, color: pal.bg, fit: W - 2 * SAFE }));
      return { bg: { color: pal.accent }, objs: o };
    },
  },

  kruh: {
    name: 'Kruh', fonts: 'geist', pal: 'more', tags: ['lekar', 'zubar', 'fyzio', 'sluzby', 'remeslo', 'poradenstvo', 'moderne', 'ciste', 'doveryhodne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      const on = readable(pal.accent, pal);
      if (c.sq) {
        const r = 9.5;
        o.push(C(W / 2, m + r, r, { fill: pal.accent }));
        o.push(logoOr(c, W / 2, m + r, r * 1.25, r * 1.25, { mark: true, tint: on }, T(initials(f.name), { x: W / 2, y: m + r, ox: 'center', oy: 'center', size: 6.4, font: 'd', w: 700, color: on })));
        o.push(T(f.name, { field: 'name', x: W / 2, y: m + 2 * r + 6.4, ox: 'center', oy: 'bottom', size: 4, font: 'd', w: c.fp.dw, color: pal.ink, fit: W - 2 * m }));
        o.push(T(f.role, { field: 'role', x: W / 2, y: m + 2 * r + 7.4, ox: 'center', size: 2, font: 't', color: pal.accent, fit: W - 2 * m, w: 500 }));
        o.push(...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: ['phone', 'email'], size: 1.8, fit: W - 2 * m }));
        return { bg: { color: pal.bg }, objs: o };
      }
      const r = H * 0.27, cx = m + r - 0.5, cy = H / 2;
      o.push(C(cx, cy, r, { fill: pal.accent }));
      o.push(logoOr(c, cx, cy, r * 1.25, r * 1.25, { mark: true, tint: on }, T(initials(f.name), { x: cx, y: cy, ox: 'center', oy: 'center', size: r * 0.85, font: 'd', w: 700, color: on, ls: -0.04 })));
      const x = cx + r + 6, mw = W - x - m;
      o.push(T(f.name, { field: 'name', x, y: m + 6.2, oy: 'bottom', size: 4.5, font: 'd', w: c.fp.dw, color: pal.ink, fit: mw, ls: -0.02 }));
      o.push(T(f.role, { field: 'role', x, y: m + 7.3, size: 2.15, font: 't', w: 500, color: pal.accent, fit: mw }));
      o.push(...contacts(c, { x, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.95, color: pal.ink, icolor: pal.accent, fit: mw - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const on = readable(pal.accent, pal);
      const o = [];
      o.push(C(W * 0.86, H * 0.12, H * 0.5, { fill: mix(pal.accent, '#FFFFFF', 0.12) }));
      o.push(C(W * 0.1, H * 0.95, H * 0.36, { fill: mix(pal.accent, '#000000', 0.08) }));
      o.push(logoOr(c, W / 2, H / 2 - 3.5, W * 0.4, H * 0.36, { mark: true, tint: on }, T(initials(f.name), { x: W / 2, y: H / 2 - 3, ox: 'center', oy: 'center', size: 10, font: 'd', w: 700, color: on })));
      o.push(T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2 + 9.5, ox: 'center', oy: 'bottom', size: 2.6, font: 'd', w: c.fp.dw, color: on, fit: W - 2 * SAFE }));
      return { bg: { color: pal.accent }, objs: o };
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
      const { W, H, f, pal } = c;
      const o = [];
      o.push(logoOr(c, W / 2, H / 2 - 3, W * 0.4, H * 0.42, { mark: true, tint: pal.accent }, T(f.company || f.name, { field: 'company', x: W / 2, y: H / 2 - 2, ox: 'center', oy: 'center', size: 5.4, font: 'd', w: c.fp.dw, color: pal.accent, fit: W - 14, ls: -0.02 })));
      o.push(T(f.tagline || f.web, { field: f.tagline ? 'tagline' : 'web', x: W / 2, y: H - SAFE - 1, ox: 'center', oy: 'bottom', size: 2.2, font: 't', w: 600, color: pal.ink, fit: W - 2 * SAFE }));
      return { bg: { color: pal.soft }, objs: o };
    },
  },

  vzor: {
    name: tr('Vzor', 'Vzor'), fonts: 'fraunces', pal: 'ruza', tags: ['butik', 'beauty', 'kaviaren', 'kvety', 'cukraren', 'kreativ', 'hrave', 'jemne', 'farebne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const o = [];
      o.push(logoOr(c, m, m, 9, 9, { mark: true, tint: pal.accent, ax: 'left', ay: 'top' }, C(m + 1.2, m + 1.2, 1.2, { fill: pal.accent })));
      const mw = W - 2 * m;
      o.push(T(f.name, { field: 'name', x: m - 0.3, y: c.sq ? H * 0.56 : H * 0.6, oy: 'bottom', size: c.sq ? 5.4 : 6.4, font: 'd', color: pal.ink, fit: mw }));
      o.push(T(f.role, { field: 'role', x: m, y: (c.sq ? H * 0.56 : H * 0.6) + 1, size: 2.7, font: 'd', it: true, color: pal.accent, fit: mw }));
      if (c.sq) o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], icons: false, size: 1.85, fit: mw }));
      else o.push(...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], icons: false, size: 1.85, lh: 2.9, color: pal.ink, fit: W * 0.45 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      const tint = mix(pal.accent, pal.soft, 0.35);
      const step = 9, s = 5.2;
      for (let row = 0, y = -1; y < H + 3; row++, y += step * 0.8) {
        for (let x = (row % 2) * step / 2 - 2; x < W + 3; x += step) {
          if (c.mark) o.push({ ...markImg(c, x, y, s, s, tint), rot: row % 2 ? -12 : 12 });
          else o.push(C(x, y, 0.9, { fill: tint }));
        }
      }
      const pw = Math.min(W * 0.66, 50);
      o.push(R(W / 2 - pw / 2, H / 2 - 7, pw, 14, pal.bg, { rx: 7 }));
      o.push(logoOr(c, W / 2, H / 2, pw - 10, 9, {}, T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 4.2, font: 'd', it: true, color: pal.ink, fit: pw - 8 })));
      return { bg: { color: pal.soft }, objs: o };
    },
  },
});

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
  const T0 = TEMPLATES[d.tpl] || TEMPLATES.atelier;
  const pal = d.pal || PALETTES[T0.pal];
  const fp = FONTS[d.fonts || T0.fonts] || FONTS.instrument;
  let root = opts.root ?? ((typeof window !== 'undefined' && window.VK && window.VK.root) || './');
  if (typeof location !== 'undefined' && !/^https?:/.test(root)) root = new URL(root, location.href).href;
  const artOf = (k) => (k && k.startsWith('data:') ? k : `${root}assets/art/${k}.jpg`);
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
