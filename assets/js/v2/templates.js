// Vizitkomat v3 – šablóny ako zoznam objektov (mm, 0,0 = ľavý horný roh orezu)
// Zásady: typografia namiesto klipartu (monogram / wordmark z mena), čitateľné veľkosti pre tlač (kontakty ≥ 1,8 mm),
// jasná hierarchia, odvážna kompozícia, zadná strana ako značka.
import { SIZES, SAFE, FONTS, PALETTES, initials, splitName, mix, readable, luminance, contrast, tr } from './model.js';
import { proTemplates } from './tpl-pro.js';
import { richTemplates } from './tpl-rich.js';
import { luxTemplates } from './tpl-lux.js';
import { neoTemplates } from './tpl-neo.js';
import { xTemplates, xBackExtras } from './tpl-x.js';

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
  const size = Math.max(o.size || 2.2, 1.85), lh = Math.max(o.lh || 0, size * 1.42), color = o.color || c.pal.ink;
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


// ---------- generátory vzorov (deterministické podľa mena) ----------
function seeded(str) { let h = 2166136261; for (const ch of String(str || 'x')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const f2 = (n) => n.toFixed(2);
/** Hladká krivka cez body (Catmull-Rom → kubické Bézierovky), closed = uzavretá */
function smooth(pts, closed = false) {
  const n = pts.length, P0 = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M ${f2(pts[0][0])} ${f2(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P0(i - 1), p1 = P0(i), p2 = P0(i + 1), p3 = P0(i + 2);
    d += ` C ${f2(p1[0] + (p2[0] - p0[0]) / 6)} ${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)} ${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return closed ? d + ' Z' : d;
}
/** Vodorovné vlny (pruhy) cez celú plochu */
function wavesPath(W, H, gap, amp, len, phase = 0) {
  const out = [];
  for (let y = -gap; y < H + gap * 2; y += gap) {
    const pts = [];
    for (let x = -len; x <= W + len; x += len / 4) pts.push([x, y + Math.sin((x / len) * Math.PI * 2 + phase + y * 0.35) * amp]);
    out.push(smooth(pts));
  }
  return out;
}
/** Vrstevnice okolo stredu */
function topoPaths(cx, cy, n, step, rnd) {
  const a = [rnd() * 6, rnd() * 6, rnd() * 6], out = [];
  for (let k = 1; k <= n; k++) {
    const pts = [];
    for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2; const r = k * step * (1 + 0.18 * Math.sin(t * 2 + a[0]) + 0.1 * Math.sin(t * 3 + a[1] + k * 0.3) + 0.06 * Math.sin(t * 5 + a[2])); pts.push([cx + Math.cos(t) * r * 1.35, cy + Math.sin(t) * r]); }
    out.push(smooth(pts, true));
  }
  return out;
}
/** Organická škvrna */
function blobPath(cx, cy, r, rnd, k = 7) {
  const pts = [];
  for (let i = 0; i < k; i++) { const t = (i / k) * Math.PI * 2; const rr = r * (0.72 + rnd() * 0.5); pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]); }
  return smooth(pts, true);
}
const SCRIPT = 'Pinyon Script';

// ---------- šablóny ----------
export const TEMPLATES = {


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


};

Object.assign(TEMPLATES, richTemplates({ T, R, C, Ln, P, QR, IMG, I, MONO, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, seeded, smooth, SCRIPT }));
Object.assign(TEMPLATES, luxTemplates({ T, R, C, Ln, P, QR, IMG, I, MONO, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, seeded, smooth, SCRIPT }));
Object.assign(TEMPLATES, proTemplates({ T, R, C, Ln, P, QR, IMG, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, seeded, smooth, SCRIPT }));
Object.assign(TEMPLATES, neoTemplates({ T, R, C, Ln, P, QR, IMG, I, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, wavesPath, blobPath, seeded, smooth, SCRIPT }));
for (const [id, ex] of Object.entries(xBackExtras({ T, R, C, Ln, P, QR, IMG, I, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, seeded, smooth, SCRIPT }))) {
  const t = TEMPLATES[id]; if (!t) continue; const base = t.back;
  t.back = (c) => { const r = base(c); r.objs = [...(ex.under ? ex.under(c) : []), ...r.objs, ...(ex.over ? ex.over(c) : [])]; return r; };
}
Object.assign(TEMPLATES, xTemplates({ T, R, C, Ln, P, QR, IMG, I, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, wavesPath, blobPath, seeded, smooth, SCRIPT }));

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
    qr: d.qrUrl || 'https://vizitkomat.eu', photo: d.photo || null, scene: (n) => `${root}assets/scenes/${n}.jpg`, root, emblem: d.emblem || T0.emblem || null,
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
