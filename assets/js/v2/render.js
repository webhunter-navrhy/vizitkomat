// Vizitkomat v2 – prevod šablón na objekty Fabric.js, náhľady a tlačové PDF
import { SIZES, BLEED, SAFE, K, FONTS, FONT_CSS } from './model.js';
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
    let link = [...document.querySelectorAll('link[rel=stylesheet]')].find((l) => l.href.includes('Bodoni+Moda') && l.href.includes('Inter+Tight'));
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

// ---------- prevody ----------
const px = (mm) => (mm + BLEED) * K;
const len = (mm) => mm * K;

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
  const x = c.getContext('2d'); x.drawImage(el, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  tintCache.set(key, c); if (tintCache.size > 120) tintCache.delete(tintCache.keys().next().value);
  return c;
}
async function imageObj(src, x, y, w, h, o = {}) {
  let el = await loadImg(src);
  if (!el) return null;
  if (o.tint) el = tinted(el, src, o.tint);
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
        fontSize: len(o.size || 2.2), fill: o.color || lay.pal.ink, charSpacing: (o.ls || 0) * 1000,
        textAlign: o.ox === 'right' ? 'right' : o.ox === 'center' ? 'center' : 'left',
        lineHeight: o.lh || 1.12, opacity: o.opacity ?? 1, objectCaching: false,
      });
      if (o.fit && obj.width > len(o.fit)) obj.set('fontSize', obj.fontSize * (len(o.fit) / obj.width));
      break;
    }
    case 'rect': {
      if (o.fill && o.fill.art) {
        obj = await imageObj(o.fill.src, o.x, o.y, o.w, o.h, { fit: 'cover' });
        if (obj && o.rx) obj.set('clipPath', new fab.Rect({ width: obj.width, height: obj.height, rx: len(o.rx) / obj.scaleX, ry: len(o.rx) / obj.scaleX, originX: 'center', originY: 'center' }));
      } else {
        obj = new fab.Rect({ left: px(o.x), top: px(o.y), width: len(o.w), height: len(o.h), fill: o.fill || 'transparent', rx: len(o.rx || 0), ry: len(o.rx || 0), stroke: o.stroke || null, strokeWidth: o.stroke ? len(o.sw || 0.2) : 0, opacity: o.opacity ?? 1, strokeUniform: true });
      }
      break;
    }
    case 'circle':
      obj = new fab.Circle({ left: px(o.x), top: px(o.y), radius: len(o.r), originX: 'center', originY: 'center', fill: o.fill || 'transparent', stroke: o.stroke || null, strokeWidth: o.stroke ? len(o.sw || 0.2) : 0, opacity: o.opacity ?? 1, strokeUniform: true });
      break;
    case 'line':
      obj = new fab.Line([px(o.x1), px(o.y1), px(o.x2), px(o.y2)], { stroke: o.stroke, strokeWidth: len(o.sw || 0.2), opacity: o.opacity ?? 1 });
      break;
    case 'path':
      obj = new fab.Path(scalePath(o.d), { fill: o.fill || 'transparent', stroke: o.stroke || null, strokeWidth: o.stroke ? len(o.sw || 0.2) : 0, opacity: o.opacity ?? 1 });
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
      obj = new fab.Path(d, { fill: o.color || '#000', left: px(o.x), top: px(o.y), originX: 'left', originY: 'top' });
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
          fontSize: len(o.size || 1.5), fill: o.color || lay.pal.accent,
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
  return obj;
}

/** Pozadie: farba + voliteľne obrázok */
export async function bgObjects(lay) {
  const fab = F();
  const S = { w: lay.W + 2 * BLEED, h: lay.H + 2 * BLEED };
  const out = [];
  const base = new fab.Rect({ left: 0, top: 0, width: len(S.w), height: len(S.h), fill: lay.bg.color || '#FFFFFF', selectable: false, evented: false });
  base.data = { bg: true, kind: 'bg' };
  out.push(base);
  if (lay.bg.artSrc) {
    const img = await imageObj(lay.bg.artSrc, -BLEED, -BLEED, S.w, S.h, { fit: 'cover', opacity: lay.bg.artOpacity ?? 1 });
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
export async function exportPDF(d, filename = 'vizitka.pdf') {
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
  doc.save(filename);
}

export { loadImg };
