// Vizitkomat v3 – šablóny ako zoznam objektov (mm, 0,0 = ľavý horný roh orezu)
// Zásady: typografia namiesto klipartu (monogram / wordmark z mena), čitateľné veľkosti pre tlač (kontakty ≥ 1,8 mm),
// jasná hierarchia, odvážna kompozícia, zadná strana ako značka.
import { SIZES, SAFE, FONTS, PALETTES, initials, splitName, mix, readable, luminance, contrast, tr } from './model.js';
import { proTemplates } from './tpl-pro.js';

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
/** Oblúk (obdĺžnik s polkruhom navrchu) */
function archPath(x, yb, w, h) {
  const r = w / 2, k = 0.5523 * r, top = yb - h + r;
  return `M ${f2(x)} ${f2(yb)} L ${f2(x)} ${f2(top)} C ${f2(x)} ${f2(top - k)} ${f2(x + r - k)} ${f2(top - r)} ${f2(x + r)} ${f2(top - r)} C ${f2(x + r + k)} ${f2(top - r)} ${f2(x + w)} ${f2(top - k)} ${f2(x + w)} ${f2(top)} L ${f2(x + w)} ${f2(yb)} Z`;
}
const SCRIPT = 'Pinyon Script';

// ---------- šablóny ----------
export const TEMPLATES = {

  podpis: {
    name: tr('Podpis', 'Podpis'), fonts: 'bodoni', pal: 'vino', tags: ['beauty', 'kozmetika', 'salon', 'foto', 'svadba', 'kouc', 'dizajn', 'butik', 'umelec', 'cukraren', 'elegantne', 'jemne', 'zenske', 'luxusne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const [first] = splitName(bare(f.name) || f.name);
      const muted = mix(pal.ink, pal.bg, 0.4);
      const o = [];
      o.push(T(first || f.name, { field: 'name', part: 0, x: c.sq ? W / 2 : W * 0.36, y: H * (c.sq ? 0.36 : 0.44), ox: 'center', oy: 'center', size: c.sq ? 12 : 15, font: SCRIPT, color: pal.accent, fit: c.sq ? W - 8 : W * 0.66, rot: -6 }));
      o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: c.sq ? W / 2 : W - m, y: c.sq ? H * 0.62 : H * 0.5, ox: c.sq ? 'center' : 'right', oy: 'center', size: 2.5, font: 'd', ls: 0.3, color: pal.ink, fit: c.sq ? W - 2 * m : W * 0.5 }));
      o.push(T(f.role, { field: 'role', x: c.sq ? W / 2 : W - m, y: c.sq ? H * 0.62 + 3.2 : H * 0.5 + 3.2, ox: c.sq ? 'center' : 'right', oy: 'center', size: 1.9, font: 'd', it: true, color: muted, fit: c.sq ? W - 2 * m : W * 0.5 }));
      o.push(...contacts(c, { x: c.sq ? W / 2 : W - m, yb: H - m, align: c.sq ? 'center' : 'right', keys: ['phone', 'email', 'web'], size: 2.1, lh: 3.1, color: muted, fit: c.sq ? W - 2 * m : W * 0.55 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const [first] = splitName(bare(f.name) || f.name);
      const fg = readable(pal.accent, pal), gold = pal.soft;
      return { bg: { color: pal.accent }, objs: [
        T(f.company && f.company !== f.name ? f.company : first, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2 - 3.5, ox: 'center', oy: 'center', size: c.sq ? 11 : 14, font: SCRIPT, color: gold, fit: W - 14 }),
        T((f.role || f.web || '').toLocaleUpperCase(), { field: f.role ? 'role' : 'web', x: W / 2, y: H / 2 + 10.5, ox: 'center', oy: 'center', size: 1.9, font: 'd', ls: 0.34, color: fg, opacity: 0.85, fit: W - 18 }),
      ] };
    },
  },

  vlny: {
    name: tr('Vlny', 'Vlny'), fonts: 'geist', pal: 'sneh', tags: ['kreativ', 'dizajn', 'foto', 'it', 'marketing', 'architekt', 'hudba', 'moderne', 'odvazne', 'minimal', 'ciste'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const o = [];
      o.push(C(W - m - 4, m + 4, 4, { stroke: pal.ink, sw: 0.2 }));
      o.push(logoOr(c, W - m - 4, m + 4, 5.4, 5.4, {}, MONO(c, { x: W - m - 4, y: m + 4, ox: 'center', oy: 'center', size: 2.4, w: 600, color: pal.ink, ls: 0.02 })));
      o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: m + 1.8, oy: 'center', size: 2.5, font: 'd', w: 600, ls: 0.22, color: pal.ink, fit: W - 2 * m - 12 }));
      o.push(T(f.role, { field: 'role', x: m, y: m + 5.2, oy: 'center', size: 2.1, font: 't', color: muted, fit: W - 2 * m - 12 }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 2.15, lh: 3.2, color: pal.ink, fit: W - 2 * m }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, pal } = c;
      const ink = luminance(pal.bg) > 0.5 ? pal.ink : pal.accent;
      return { bg: { color: pal.bg }, objs: wavesPath(W, H, 3.4, 1.15, 16).map((d) => P(d, { stroke: ink, sw: 1.45 })) };
    },
  },

  linka: {
    name: tr('Linka', 'Linka'), fonts: 'instrument', pal: 'krieda', tags: ['dizajn', 'kreativ', 'umelec', 'architekt', 'kaviaren', 'terapeut', 'kouc', 'jemne', 'hrave', 'minimal', 'osobne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.bg, 0.45);
      const rnd = seeded(f.name + 'l');
      const pts = [[-3, H * 0.3]]; for (let i = 1; i < 6; i++) pts.push([W * (i / 6) + (rnd() - 0.5) * 8, H * (0.12 + rnd() * 0.3)]); pts.push([W + 3, H * 0.2]);
      return { bg: { color: pal.bg }, objs: [
        P(smooth(pts), { stroke: pal.accent, sw: 0.35 }),
        T(f.name, { field: 'name', x: m, y: H * 0.62, oy: 'bottom', size: 4.6, font: 'd', color: pal.ink, fit: W * 0.6, ls: -0.01 }),
        T(f.role, { field: 'role', x: m, y: H * 0.62 + 1, size: 2.2, font: 'd', it: true, color: pal.accent, fit: W * 0.6 }),
        ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 2.1, lh: 3.1, color: muted, fit: W * 0.4 }),
      ] };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const rnd = seeded(f.name + 'b');
      const pts = []; for (let i = 1; i < 7; i++) pts.push([W * (i / 7) + (rnd() - 0.5) * 6, H * (0.25 + rnd() * 0.45)]);
      return { bg: { color: pal.bg }, objs: [
        P(smooth([[-4, H * 0.7], ...pts, [W + 4, H * 0.35]]), { stroke: pal.ink, sw: 0.4 }),
        T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W - c.m, y: H - c.m, ox: 'right', oy: 'bottom', size: 2.4, font: 'd', it: true, color: pal.ink, fit: W * 0.5 }),
      ] };
    },
  },

  tvary: {
    name: tr('Tvary', 'Tvary'), fonts: 'grotesk', pal: 'sneh', tags: ['kreativ', 'dizajn', 'marketing', 'agentura', 'hudba', 'event', 'foto', 'odvazne', 'moderne', 'hrave'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const rnd = seeded(f.name + 't');
      const ink = luminance(pal.bg) > 0.5 ? pal.ink : pal.bg;
      const o = [];
      o.push(P(blobPath(-4, H * 0.85, H * 0.55, rnd), { fill: pal.ink }));
      o.push(P(blobPath(W * 0.18, -6, H * 0.4, rnd), { fill: pal.ink }));
      for (let i = 0; i < 4; i++) o.push(C(W * 0.4 + i * 3.4, H * 0.62, 1.1, { fill: pal.ink }));
      o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W - m, y: H * 0.42, ox: 'right', oy: 'bottom', size: 3, font: 'd', w: 600, ls: 0.24, color: pal.ink, fit: W * 0.55 }));
      o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W - m, y: H * 0.42 + 1, ox: 'right', size: 1.8, font: 't', w: 500, ls: 0.22, color: mix(pal.ink, pal.bg, 0.4), fit: W * 0.55 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const rnd = seeded(f.name + 'u');
      return { bg: { color: pal.bg }, objs: [
        P(blobPath(W + 2, H * 0.2, H * 0.6, rnd), { fill: pal.ink }),
        P(blobPath(W * 0.62, H + 6, H * 0.35, rnd), { fill: pal.ink }),
        ...contacts(c, { x: m, yb: H - m, keys: ['email', 'phone', 'web', 'address'], size: 2.1, lh: 3.1, color: pal.ink, fit: W * 0.55, ls: 0.06 }),
      ] };
    },
  },

  oblouk: {
    name: tr('Oblúk', 'Oblouk'), fonts: 'fraunces', pal: 'terakota', tags: ['wellness', 'joga', 'terapeut', 'kozmetika', 'butik', 'kaviaren', 'kvety', 'interier', 'svadba', 'jemne', 'prirodne', 'zenske', 'teple'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const light = pal.soft, ink = pal.ink;
      const o = [];
      const aw = c.sq ? 18 : H * 0.62, ax = c.sq ? W - m - aw : W - m - aw - 1;
      o.push(P(archPath(ax, H + 2, aw, H * 0.82), { fill: light }));
      o.push(C(ax + aw / 2, H * 0.52, aw * 0.22, { fill: pal.accent }));
      o.push(T(f.name, { field: 'name', x: m, y: H * 0.44, oy: 'bottom', size: 4.4, font: 'd', color: ink, fit: ax - m - 4 }));
      o.push(T(f.role, { field: 'role', x: m, y: H * 0.44 + 1, size: 2.1, font: 'd', it: true, color: mix(ink, pal.bg, 0.3), fit: ax - m - 4 }));
      o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 2.1, lh: 3.1, color: ink, fit: ax - m - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal } = c;
      const o = [];
      const aw = Math.min(W * 0.34, 30);
      o.push(P(archPath(W / 2 - aw / 2, H + 2, aw, H * 0.86), { fill: pal.soft }));
      o.push(C(W / 2, H * 0.36, aw * 0.2, { fill: pal.accent }));
      o.push(T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H * 0.68, ox: 'center', oy: 'center', size: 2.8, font: 'd', color: pal.ink, fit: aw - 4 }));
      return { bg: { color: pal.bg }, objs: o };
    },
  },

  pismena: {
    name: tr('Písmená', 'Písmena'), fonts: 'unbounded', pal: 'pastel', tags: ['kreativ', 'deti', 'skola', 'cukraren', 'kaviaren', 'marketing', 'event', 'hudba', 'hrave', 'farebne', 'odvazne', 'mlade'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const word = (f.company && f.company.length <= 10 ? f.company : (splitName(bare(f.name))[0] || f.name || '')).replace(/\s+/g, '').slice(0, 8);
      const cols = [pal.accent, pal.ink, '#2F6BFF', '#18A058', '#F2B705'];
      const half = Math.ceil(word.length / 2), rows = word.length > 5 ? [word.slice(0, half), word.slice(half)] : [word];
      const maxLen = Math.max(...rows.map((r) => r.length));
      const sz = Math.min(rows.length > 1 ? H * 0.42 : H * 0.6, (W - 2 * m) / (maxLen * 0.8));
      const o = [];
      rows.forEach((row, ri) => {
        const cw = sz * 0.78; const x0 = W / 2 - (row.length * cw) / 2 + cw / 2;
        [...row].forEach((ch, i) => o.push(T(ch.toLocaleLowerCase(), { x: x0 + i * cw, y: H / 2 + (ri - (rows.length - 1) / 2) * sz * 0.88, ox: 'center', oy: 'center', size: sz, font: 'd', w: 700, color: cols[(i + ri * 2) % cols.length], ls: -0.04 })));
      });
      return { bg: { color: pal.bg }, objs: o };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      return { bg: { color: '#FFFFFF' }, objs: [
        T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 4, font: 'd', w: 600, color: pal.ink, fit: W - 2 * m, ls: -0.02 }),
        T(f.role, { field: 'role', x: m, y: m + 5, size: 2.2, font: 't', w: 600, color: pal.accent, fit: W - 2 * m }),
        ...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 2.2, lh: 3.3, color: pal.ink, fit: W - 2 * m }),
      ] };
    },
  },

  vrstevnice: {
    name: tr('Vrstevnice', 'Vrstevnice'), fonts: 'inter', pal: 'smaragd', tags: ['architekt', 'stavba', 'reality', 'outdoor', 'turistika', 'firma', 'konzultant', 'eko', 'prirodne', 'serioze', 'moderne', 'ciste'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const fg = luminance(pal.bg) < 0.3 ? '#FFFFFF' : pal.ink;
      return { bg: { color: pal.bg }, objs: [
        ...topoPaths(W * 0.8, H * 0.3, 9, 2.6, seeded(f.name + 'v')).map((d) => P(d, { stroke: mix(pal.accent, pal.bg, 0.25), sw: 0.13 })),
        T(f.company || f.name, { field: f.company ? 'company' : 'name', x: m, y: H - m, oy: 'bottom', size: 6, font: 'd', w: 700, color: fg, fit: W * 0.7, ls: -0.04 }),
      ] };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const muted = mix(pal.ink, pal.soft, 0.45);
      return { bg: { color: '#FFFFFF' }, objs: [
        ...topoPaths(W * 0.1, H * 1.05, 7, 3, seeded(f.name + 'w')).map((d) => P(d, { stroke: mix(pal.bg, '#FFFFFF', 0.82), sw: 0.13 })),
        T(f.name, { field: 'name', x: m, y: m + 3.6, oy: 'bottom', size: 3.6, font: 'd', w: 700, color: pal.bg, fit: W * 0.55, ls: -0.02 }),
        T(f.role, { field: 'role', x: m, y: m + 4.6, size: 2.1, font: 't', color: mix(pal.bg, '#FFFFFF', 0.3), fit: W * 0.55 }),
        ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web', 'address'], size: 2.1, lh: 3.1, color: pal.bg, fit: W * 0.5 }),
      ] };
    },
  },

  pruh: {
    name: tr('Pruh', 'Pruh'), fonts: 'playfair', pal: 'more', tags: ['hotel', 'penzion', 'wellness', 'kozmetika', 'reality', 'architekt', 'kaviaren', 'spa', 'elegantne', 'jemne', 'luxusne', 'prirodne'],
    front(c) {
      const { W, H, f, pal, m } = c;
      const bh = H * 0.36;
      return { bg: { color: pal.bg }, objs: [
        R(-2, H - bh, W + 4, bh + 2, c.art ? null : pal.accent, c.art ? { fill: { art: c.art } } : {}),
        T((f.company || bare(f.name) || '').toLocaleUpperCase(), { field: f.company ? 'company' : 'name', x: W / 2, y: (H - bh) / 2 - 1, ox: 'center', oy: 'center', size: 3.4, font: 'd', ls: 0.34, color: pal.ink, fit: W - 2 * m - 6 }),
        Ln(W / 2 - 3, (H - bh) / 2 + 3.4, W / 2 + 3, (H - bh) / 2 + 3.4, pal.ink, 0.15),
      ] };
    },
    back(c) {
      const { W, H, f, pal, m } = c;
      const bh = H * 0.22;
      const muted = mix(pal.ink, pal.bg, 0.45);
      return { bg: { color: pal.bg }, objs: [
        R(-2, H - bh, W + 4, bh + 2, c.art ? null : pal.accent, c.art ? { fill: { art: c.art } } : {}),
        T((f.company || '').toLocaleUpperCase(), { field: 'company', x: W / 2, y: m + 1.2, ox: 'center', oy: 'center', size: 2.2, font: 'd', ls: 0.3, color: pal.ink, fit: W - 2 * m }),
        T(f.name, { field: 'name', x: W / 2, y: m + 5.8, ox: 'center', oy: 'center', size: 3.2, font: 'd', it: true, color: pal.ink, fit: W - 2 * m }),
        ...contacts(c, { x: W / 2, yb: H - bh - 3, align: 'center', keys: ['phone', 'email', 'web'], size: 2.1, lh: 3.1, color: muted, fit: W - 2 * m }),
      ] };
    },
  },
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
};

Object.assign(TEMPLATES, proTemplates({ T, R, C, Ln, P, QR, IMG, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, seeded, smooth, SCRIPT }));

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
    qr: d.qrUrl || 'https://vizitkomat.eu', photo: d.photo || null, scene: (n) => `${root}assets/scenes/${n}.jpg`,
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
