// Vizitkomat v2 – prevod šablón na objekty Fabric.js, náhľady a tlačové PDF
import { SIZES, BLEED, SAFE, K, FONTS, FONT_CSS, FOILS, isFoil } from './model.js';
import { layout } from './templates.js';
import { iconSVG } from '../icons.js';

const F = () => window.fabric;
const imgCache = new Map();
function loadImg(src) {
  if (!src) return Promise.resolve(null);
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((res) => {
    const im = new Image();
    if (!src.startsWith('data:')) im.crossOrigin = 'anonymous';
    im.onload = () => res(im); im.onerror = () => res(null); im.src = src;
  });
  imgCache.set(src, p);
  return p;
}

// ---------- fonty ----------
const loaded = new Set();
let cssReady;
function ensureFontCSS() {
  if (cssReady) return cssReady;
  cssReady = new Promise((res) => {
    let link = [...document.querySelectorAll('link[rel=stylesheet]')].find((l) => l.href === FONT_CSS);
    if (!link) { link = document.createElement('link'); link.rel = 'stylesheet'; link.href = FONT_CSS; document.head.append(link); }
    if (link.sheet) { try { if (link.sheet.cssRules.length) return res(); } catch (e) { return res(); } }
    link.addEventListener('load', () => res(), { once: true });
    link.addEventListener('error', () => res(), { once: true });
    setTimeout(res, 6000);
  });
  return cssReady;
}
export async function loadFonts(specs) {
  if (!document.fonts) return;
  await ensureFontCSS();
  const todo = [...new Set(specs)].filter((s) => !loaded.has(s));
  if (!todo.length) return;
  await Promise.all(todo.map((s) => document.fonts.load(s, 'ĽľščťžýáíéôäňĺŕěřůAa0').then(() => loaded.add(s)).catch(() => {})));
  if (F()) F().util.clearFabricFontCache();
}
function fontOf(o, fp) {
  if (o.font === 'm') return { family: 'IBM Plex Mono', weight: o.w || 400 };
  if (o.font === 'd') return { family: fp.display, weight: o.w || fp.dw };
  if (o.font && o.font !== 't') return { family: o.font, weight: o.w || 400 };
  return { family: fp.text, weight: o.w || fp.tw };
}
export function fontSpecsFor(lay) {
  const s = [];
  for (const o of lay.objs) {
    if (o.type !== 'text' && o.type !== 'arctext') continue;
    const f = fontOf(o, lay.fp);
    s.push(`${o.it ? 'italic ' : ''}${f.weight} 40px "${f.family}"`);
  }
  return s;
}

// ---------- metalická fólia ----------
function foilGrad(c) {
  const stops = FOILS[String(c).slice(5)] || FOILS.gold;
  return new (F().Gradient)({ type: 'linear', gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 0.6 }, colorStops: stops.map((color, i) => ({ offset: i / (stops.length - 1), color })) });
}
// fotografická textúra fólie (zlato/meď/striebro)
const TEX = { gold: 'gold', rose: 'rose', copper: 'rose', silver: 'silver' };
const texRoot = () => { let r = (typeof window !== 'undefined' && window.VK && window.VK.root) || './'; if (typeof location !== 'undefined' && !/^https?:/.test(r)) r = new URL(r, location.href).href; return r; };
const texCache = {};
async function foilTex(c) { const k = TEX[String(c).slice(5)] || 'gold'; return (texCache[k] ??= await loadImg(texRoot() + 'assets/tex/' + k + '.jpg')); }
async function fillOf(c, fallback, scaleMm = 55) {
  if (!isFoil(c)) return paint(c, fallback);
  const im = await foilTex(c);
  if (!im) return paint(c, fallback);
  const s = (scaleMm * K) / im.width;
  return new (F().Pattern)({ source: im, repeat: 'repeat', patternTransform: [s, 0, 0, s, 0, 0] });
}
/** Prechod: { grad: [farby…], angle: stupne } alebo { grad, radial: true, cx, cy, r } (v pomere k objektu) */
function gradOf(c) {
  const st = c.grad.map((col, i) => ({ offset: c.stops ? c.stops[i] : i / Math.max(1, c.grad.length - 1), color: col }));
  if (c.radial) return new (F().Gradient)({ type: 'radial', gradientUnits: 'percentage', coords: { x1: c.cx ?? 0.5, y1: c.cy ?? 0.5, r1: 0, x2: c.cx ?? 0.5, y2: c.cy ?? 0.5, r2: c.r ?? 0.5 }, colorStops: st });
  const a = ((c.angle ?? 90) * Math.PI) / 180, dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
  return new (F().Gradient)({ type: 'linear', gradientUnits: 'percentage', coords: { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy }, colorStops: st });
}
export const paint = (c, fallback) => (isFoil(c) ? foilGrad(c) : c && typeof c === 'object' && c.grad ? gradOf(c) : (c || fallback));

// ---------- prevody ----------
const px = (mm) => (mm + BLEED) * K;
const len = (mm) => mm * K;
// najmenšie písmo pre tlač: 1,7 mm ≈ 4,8 pt (dlhé texty s obmedzenou šírkou 1,6 mm)
const MIN_TXT = 1.7, MIN_FIT = 1.6;

function scalePath(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let i = 0, out = '';
  for (const t of tokens) {
    if (/[a-zA-Z]/.test(t)) { out += t + ' '; i = 0; }
    else { out += (i % 2 === 0 ? px(+t) : px(+t)).toFixed(2) + ' '; i++; }
  }
  return out;
}

function qrPath(text) {
  const q = window.qrcode(0, 'M'); q.addData(text || 'https://vizitkomat.eu'); q.make();
  const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return { d, n };
}

const tintCache = new Map();
function tinted(el, src, color) {
  const key = src.length + ':' + src.slice(-40) + color;
  if (tintCache.has(key)) return tintCache.get(key);
  const c = document.createElement('canvas'); c.width = el.naturalWidth || el.width; c.height = el.naturalHeight || el.height;
  const x = c.getContext('2d'); x.drawImage(el, 0, 0); x.globalCompositeOperation = 'source-in';
  const tx = isFoil(color) ? texCache[TEX[color.slice(5)] || 'gold'] : null;
  if (tx) { x.fillStyle = x.createPattern(tx, 'repeat'); }
  else if (isFoil(color)) { const st = FOILS[color.slice(5)] || FOILS.gold; const g = x.createLinearGradient(0, 0, c.width, c.height * 0.6); st.forEach((col, i) => g.addColorStop(i / (st.length - 1), col)); x.fillStyle = g; } else x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  tintCache.set(key, c); if (tintCache.size > 120) tintCache.delete(tintCache.keys().next().value);
  return c;
}
async function imageObj(src, x, y, w, h, o = {}) {
  let el = await loadImg(src);
  if (!el) return null;
  if (o.tint) { if (isFoil(o.tint)) await foilTex(o.tint); el = tinted(el, src, o.tint); }
  const fab = F();
  const iw = el.naturalWidth || el.width, ih = el.naturalHeight || el.height;
  const W = len(w), H = len(h);
  let img;
  if (o.fit === 'contain') {
    const s = Math.min(W / iw, H / ih);
    let left = px(x), top = px(y);
    const ax = o.ax || 'left', ay = o.ay || 'top';
    if (ax === 'center') left -= (iw * s) / 2; else if (ax === 'right') left -= iw * s;
    if (ay === 'center') top -= (ih * s) / 2; else if (ay === 'bottom') top -= ih * s;
    img = new fab.Image(el, { left, top, scaleX: s, scaleY: s });
  } else { // cover s orezom
    const s = Math.max(W / iw, H / ih);
    const cw = W / s, ch = H / s;
    img = new fab.Image(el, { left: px(x), top: px(y), cropX: (iw - cw) / 2, cropY: (ih - ch) / 2, width: cw, height: ch, scaleX: s, scaleY: s });
  }
  if (o.opacity != null) img.set('opacity', o.opacity);
  if (o.blend) img.set('globalCompositeOperation', o.blend);
  return img;
}

function textValue(o, f) {
  let t = o.text ?? '';
  if (o.upper) t = t.toLocaleUpperCase();
  return t;
}

/** Jeden objekt šablóny → objekt Fabric */
export async function toFabric(o, lay, ctx = {}) {
  const fab = F();
  const fp = lay.fp;
  let obj = null;
  switch (o.type) {
    case 'text': {
      const ft = fontOf(o, fp);
      obj = new fab.IText(textValue(o), {
        left: px(o.x), top: px(o.y), originX: o.ox || 'left', originY: o.oy || 'top',
        fontFamily: ft.family, fontWeight: ft.weight, fontStyle: o.it ? 'italic' : 'normal',
        fontSize: len(Math.max(o.size || 2.2, MIN_TXT)), stroke: o.stroke ? paint(o.stroke) : null, strokeWidth: o.stroke ? len(o.sw || 0.12) : 0, paintFirst: o.stroke && o.color !== 'none' ? 'stroke' : 'fill', fill: o.color === 'none' ? 'transparent' : String(textValue(o)).trim() ? ((o.size || 2.2) < 14 ? paint(o.color, lay.pal.ink) : await fillOf(o.color, lay.pal.ink, Math.max(110, (o.size || 2.2) * 22))) : (isFoil(o.color) ? (FOILS[o.color.slice(5)] || FOILS.gold)[1] : (o.color || lay.pal.ink)), charSpacing: (o.ls || 0) * 1000,
        textAlign: o.ox === 'right' ? 'right' : o.ox === 'center' ? 'center' : 'left',
        lineHeight: o.lh || 1.12, opacity: o.opacity ?? 1, objectCaching: false,
      });
      if (o.fit && obj.width > len(o.fit)) obj.set('fontSize', Math.max(len(MIN_FIT), obj.fontSize * (len(o.fit) / obj.width)));
      break;
    }
    case 'rect': {
      if (o.fill && o.fill.art) {
        obj = await imageObj(o.fill.src, o.x, o.y, o.w, o.h, { fit: 'cover' });
        if (obj && o.rx) obj.set('clipPath', new fab.Rect({ width: obj.width, height: obj.height, rx: len(o.rx) / obj.scaleX, ry: len(o.rx) / obj.scaleX, originX: 'center', originY: 'center' }));
      } else {
        obj = new fab.Rect({ left: px(o.x), top: px(o.y), width: len(o.w), height: len(o.h), fill: await fillOf(o.fill, 'transparent'), rx: len(o.rx || 0), ry: len(o.rx || 0), stroke: o.stroke ? await fillOf(o.stroke) : null, strokeWidth: o.stroke ? len(o.sw || 0.2) : 0, opacity: o.opacity ?? 1, strokeUniform: true });
      }
      break;
    }
    case 'circle':
      obj = new fab.Circle({ left: px(o.x), top: px(o.y), radius: len(o.r), originX: 'center', originY: 'center', fill: await fillOf(o.fill, 'transparent'), stroke: o.stroke ? await fillOf(o.stroke) : null, strokeWidth: o.stroke ? len(o.sw || 0.2) : 0, opacity: o.opacity ?? 1, strokeUniform: true });
      break;
    case 'line':
      obj = new fab.Line([px(o.x1), px(o.y1), px(o.x2), px(o.y2)], { stroke: isFoil(o.stroke) ? (FOILS[o.stroke.slice(5)] || FOILS.gold)[1] : o.stroke, strokeWidth: len(o.sw || 0.2), opacity: o.opacity ?? 1 });
      break;
    case 'path':
      obj = new fab.Path(scalePath(o.d), { fill: await fillOf(o.fill, 'transparent'), stroke: o.stroke ? await fillOf(o.stroke) : null, strokeWidth: o.stroke ? len(o.sw || 0.2) : 0, opacity: o.opacity ?? 1 });
      break;
    case 'icon': {
      const svg = iconSVG(o.name, o.color || lay.pal.accent, o.sw || 1.7);
      obj = await new Promise((res) => fab.loadSVGFromString(svg, (objs, opts) => res(fab.util.groupSVGElements(objs, opts))));
      const s = len(o.s) / 24;
      obj.set({ left: px(o.x), top: px(o.y), scaleX: s, scaleY: s });
      break;
    }
    case 'image':
      obj = await imageObj(o.src, o.x, o.y, o.w, o.h, o);
      break;
    case 'qr': {
      const { d, n } = qrPath(ctx.qr || lay.qr);
      obj = new fab.Path(d, { fill: paint(o.color, '#000'), left: px(o.x), top: px(o.y), originX: 'left', originY: 'top' });
      const s = len(o.s) / n;
      obj.set({ scaleX: s, scaleY: s });
      break;
    }
    case 'arctext': {
      const ft = fontOf(o, fp);
      const chars = [...o.text];
      const step = 360 / chars.length;
      const items = chars.map((ch, i) => {
        const a = (i * step - 90) * Math.PI / 180;
        return new fab.Text(ch, {
          left: px(o.x) + Math.cos(a) * len(o.r), top: px(o.y) + Math.sin(a) * len(o.r),
          originX: 'center', originY: 'center', angle: i * step, fontFamily: ft.family, fontWeight: ft.weight,
          fontSize: len(o.size || 1.5), fill: isFoil(o.color) ? (FOILS[o.color.slice(5)] || FOILS.gold)[1] : (o.color || lay.pal.accent),
        });
      });
      obj = new fab.Group(items, {});
      break;
    }
    default:
      return null;
  }
  if (!obj) return null;
  if (o.rot) { const ctr = obj.getCenterPoint(); obj.set({ originX: 'center', originY: 'center', left: ctr.x, top: ctr.y, angle: o.rot }); }
  obj.data = { kind: o.type, field: o.field || null, prefix: o.prefix || '', part: o.part ?? null, upper: !!o.upper, role: o.role || null, fit: o.fit || null };
  if (o.mono) obj.data.mono = true;
  if (o.tint) { obj.data.tint = o.tint; if (o.src && !String(o.src).startsWith('data:')) obj.data.src0 = o.src; }
  return obj;
}

/** Pozadie: farba + voliteľne obrázok */
export async function bgObjects(lay) {
  const fab = F();
  const S = { w: lay.W + 2 * BLEED, h: lay.H + 2 * BLEED };
  const out = [];
  const base = new fab.Rect({ left: 0, top: 0, width: len(S.w), height: len(S.h), fill: paint(lay.bg.color, '#FFFFFF'), selectable: false, evented: false });
  base.data = { bg: true, kind: 'bg' };
  out.push(base);
  if (lay.bg.artSrc) {
    const img = await imageObj(lay.bg.artSrc, -BLEED, -BLEED, S.w, S.h, { fit: 'cover', opacity: lay.bg.artOpacity ?? 1, blend: lay.bg.artBlend });
    if (img) { img.set({ selectable: false, evented: false }); img.data = { bg: true, kind: 'bgart' }; out.push(img); }
  }
  return out;
}

/** Postaví všetky objekty strany (pozadie + obsah) */
export async function buildSide(d, side, opts = {}) {
  const lay = layout(d, side, opts);
  await loadFonts(fontSpecsFor(lay));
  const ctx = { qr: d.qrUrl };
  const bg = await bgObjects(lay);
  const objs = [];
  for (const o of lay.objs) { const fo = await toFabric(o, lay, ctx); if (fo) objs.push(fo); }
  return { bg, objs, lay };
}

// ---------- statické vykreslenie ----------
function sizeOf(d) { return SIZES[d.size] || SIZES['90x50']; }

async function staticCanvas(d, side) {
  const fab = F();
  const S = sizeOf(d);
  const el = document.createElement('canvas');
  const sc = new fab.StaticCanvas(el, { width: len(S.w + 2 * BLEED), height: len(S.h + 2 * BLEED), enableRetinaScaling: false, renderOnAddRemove: false });
  const json = d.sides && d.sides[side];
  if (json) {
    await collectJSONFonts(json);
    await new Promise((res) => sc.loadFromJSON(json, res));
    refreshQR(sc, d);
  } else {
    const { bg, objs } = await buildSide(d, side);
    [...bg, ...objs].forEach((o) => sc.add(o));
  }
  sc.renderAll();
  return sc;
}
async function collectJSONFonts(json) {
  const specs = [];
  (json.objects || []).forEach((o) => { if (o.fontFamily) specs.push(`${o.fontStyle === 'italic' ? 'italic ' : ''}${o.fontWeight || 400} 40px "${o.fontFamily}"`); });
  await loadFonts(specs);
}
export function refreshQR(canvas, d) {
  canvas.getObjects().forEach((o) => {
    if (o.data && o.data.kind === 'qr' && o.data.qrUrl !== d.qrUrl) { /* QR sa prepočíta pri ďalšom vytvorení */ }
  });
}

/** Náhľad (orez bez spadávky), vráti dataURL */
export async function snapshot(d, side = 'front', width = 600, type = 'image/png', quality = 0.9) {
  const sc = await staticCanvas(d, side);
  const S = sizeOf(d);
  const mult = width / len(S.w);
  const url = sc.toDataURL({ format: type === 'image/jpeg' ? 'jpeg' : 'png', quality, multiplier: mult, left: len(BLEED), top: len(BLEED), width: len(S.w), height: len(S.h) });
  sc.dispose();
  return url;
}
/** Vykreslí do existujúceho <canvas> (orez) */
export async function drawTo(canvas, d, side = 'front', width) {
  const url = await snapshot(d, side, width || canvas.clientWidth * Math.min(devicePixelRatio || 1, 2) || 600);
  const im = await loadImg(url);
  canvas.width = im.width; canvas.height = im.height;
  canvas.getContext('2d').drawImage(im, 0, 0);
  imgCache.delete(url);
  return canvas;
}

/** Tlačové PDF – obe strany vrátane spadávky, 600 dpi */
export async function exportPDF(d, filename = 'vizitka.pdf', opts = {}) {
  const S = sizeOf(d);
  const pw = S.w + 2 * BLEED, ph = S.h + 2 * BLEED;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: pw >= ph ? 'l' : 'p', unit: 'mm', format: [pw, ph], compress: true });
  const mult = (600 / 25.4) / K;
  let first = true;
  for (const side of ['front', 'back']) {
    const sc = await staticCanvas(d, side);
    const url = sc.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: mult });
    sc.dispose();
    if (!first) doc.addPage([pw, ph], pw >= ph ? 'l' : 'p');
    doc.addImage(url, 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
    first = false;
  }
  doc.setProperties({ title: `Vizitka – ${d.f.name}`, creator: 'Vizitkomat.eu' });
  if (opts.dataUrl) return doc.output('datauristring');
  doc.save(filename);
}

export { loadImg };

/** Fotografický náhľad: papierová textúra + mäkké svetlo (len pre náhľady, nie pre tlač) */
let paperImg = null;
export async function photo(url, opts = {}) {
  const im = await loadImg(url);
  if (!im) return url;
  if (!paperImg) {
    let root = (typeof window !== 'undefined' && window.VK && window.VK.root) || './';
    if (typeof location !== 'undefined' && !/^https?:/.test(root)) root = new URL(root, location.href).href;
    paperImg = await loadImg(root + 'assets/img/paper.png');
  }
  const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0, w, h);
  if (paperImg) {
    x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = opts.grain ?? 0.55;
    const s = w / 1100; x.scale(s, s); x.fillStyle = x.createPattern(paperImg, 'repeat'); x.fillRect(0, 0, w / s, h / s); x.restore();
  }
  // svetlo zľava zhora a jemné stmavenie k okrajom
  let g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.07)');
  x.save(); x.globalCompositeOperation = 'soft-light'; x.fillStyle = g; x.fillRect(0, 0, w, h); x.restore();
  g = x.createRadialGradient(w * 0.4, h * 0.35, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.08)');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  return c.toDataURL('image/jpeg', opts.quality ?? 0.88);
}

/** Fotografický mockup: skutočná fotka podkladu + vizitky s hrúbkou papiera a realistickým tieňom. */
const SCENES_LIGHT = ['travertin', 'len', 'mramor', 'svetlo', 'kamen', 'dub'];
const SCENES_DARK = ['beton', 'len', 'tien', 'saten', 'dub', 'kamen', 'kraft'];
function cardBright(im) {
  const c = document.createElement('canvas'); c.width = 8; c.height = 5; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 8, 5);
  const d = x.getImageData(0, 0, 8, 5).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; return s / (d.length / 4) / 255;
}
function drawCard(x, im, cx, cy, w, h, ang, depth) {
  x.save(); x.translate(cx, cy); x.rotate(ang);
  // kontaktný + mäkký tieň
  x.save(); x.shadowColor = 'rgba(30,22,12,0.55)'; x.shadowBlur = w * 0.012; x.shadowOffsetX = w * 0.004; x.shadowOffsetY = w * 0.008;
  x.fillStyle = '#000'; x.fillRect(-w / 2, -h / 2, w, h); x.restore();
  x.save(); x.shadowColor = 'rgba(30,22,12,0.32)'; x.shadowBlur = w * 0.09; x.shadowOffsetX = w * 0.03; x.shadowOffsetY = w * 0.06;
  x.fillStyle = '#000'; x.fillRect(-w / 2, -h / 2, w, h); x.restore();
  // hrúbka papiera (hrana)
  for (let i = depth; i > 0; i--) { x.fillStyle = i === depth ? 'rgba(0,0,0,0.25)' : '#E9E4DA'; x.fillRect(-w / 2 + i * 0.35, -h / 2 + i, w, h); }
  x.drawImage(im, -w / 2, -h / 2, w, h);
  // jemný lesk zhora
  const g = x.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.06)');
  x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h);
  // odlesk na hornej a ľavej hrane papiera + jemné stmavenie protiľahlých hrán
  x.lineWidth = Math.max(1, w * 0.0016);
  x.strokeStyle = 'rgba(255,255,255,0.55)'; x.beginPath(); x.moveTo(-w / 2, h / 2); x.lineTo(-w / 2, -h / 2); x.lineTo(w / 2, -h / 2); x.stroke();
  x.strokeStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.moveTo(w / 2, -h / 2); x.lineTo(w / 2, h / 2); x.lineTo(-w / 2, h / 2); x.stroke();
  x.restore();
}
export async function mockup(front, back, opts = {}) {
  const W = opts.width || 1200, H = Math.round(W * (opts.ratio || 0.8));
  const [fi, bi] = await Promise.all([loadImg(front), back ? loadImg(back) : null]);
  if (!fi) return front;
  let root = (typeof window !== 'undefined' && window.VK && window.VK.root) || './';
  if (typeof location !== 'undefined' && !/^https?:/.test(root)) root = new URL(root, location.href).href;
  const bright = cardBright(fi);
  const list = bright < 0.45 ? SCENES_LIGHT : SCENES_DARK;
  const scene = opts.scene || list[(opts.seed || 0) % list.length];
  const bg = await loadImg(root + 'assets/scenes/' + scene + '.jpg');
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  if (bg) { const s = Math.max(W / bg.width, H / bg.height); x.drawImage(bg, (W - bg.width * s) / 2, (H - bg.height * s) / 2, bg.width * s, bg.height * s); } else { x.fillStyle = '#E8E2D8'; x.fillRect(0, 0, W, H); }
  // svetlo okna + vinetácia
  let g = x.createRadialGradient(W * 0.3, H * 0.2, W * 0.05, W * 0.5, H * 0.5, W * 0.85); g.addColorStop(0, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const cw = W * (opts.single ? 0.7 : 0.6), ch = cw * (fi.height / fi.width), depth = Math.max(2, Math.round(W / 420));
  if (bi && !opts.single) {
    drawCard(x, bi, W * 0.6, H * 0.36, cw, ch, (opts.tiltB ?? 7) * Math.PI / 180, depth);
    drawCard(x, fi, W * 0.42, H * 0.64, cw, ch, (opts.tiltF ?? -4) * Math.PI / 180, depth);
  } else drawCard(x, fi, W / 2, H / 2, cw, ch, (opts.tiltF ?? -3) * Math.PI / 180, depth);
  return c.toDataURL('image/jpeg', opts.quality ?? 0.86);
}

/** Kontrola pred tlačou: malé písmo, text pri okraji, slabé rozlíšenie obrázkov, QR. */
export async function inspect(d) {
  const S = sizeOf(d), out = { small: [], edge: [], lowres: [], qr: false, texts: 0 };
  const CONTACT = ['name', 'role', 'company', 'phone', 'email', 'web', 'address', 'tagline'];
  const x0 = len(BLEED + SAFE) - len(1), y0 = x0, x1 = len(BLEED + S.w - SAFE) + len(1), y1 = len(BLEED + S.h - SAFE) + len(1);
  for (const side of ['front', 'back']) {
    const sc = await staticCanvas(d, side);
    const walk = (list) => list.forEach((o) => {
      if (o.type === 'group' && o.data?.kind !== 'qr') return;
      if (!o.visible || o.data?.bg) return;
      if (o.data?.kind === 'qr') { out.qr = true; return; }
      if (/text/.test(o.type) && String(o.text || '').trim()) {
        out.texts++;
        const pt = (o.fontSize * (o.scaleY || 1)) / len(1) / (25.4 / 72);
        if (pt < 4.5) out.small.push({ side, text: String(o.text).slice(0, 40), pt });
        if (o.data?.field && CONTACT.includes(o.data.field) && pt < 14) {
          const r = o.getBoundingRect(true, true);
          if (r.left < x0 || r.top < y0 || r.left + r.width > x1 || r.top + r.height > y1) out.edge.push({ side, text: String(o.text).slice(0, 40) });
        }
      }
      if (o.type === 'image' && ['logo', 'photo'].includes(o.data?.role)) {
        const el = o.getElement?.(); const wmm = (o.width * (o.scaleX || 1)) / len(1);
        const dpi = el && wmm ? (el.naturalWidth || el.width) / (wmm / 25.4) : 999;
        if (dpi < 150) out.lowres.push({ side, dpi: Math.round(dpi) });
      }
    });
    walk(sc.getObjects());
    sc.dispose();
  }
  return out;
}
