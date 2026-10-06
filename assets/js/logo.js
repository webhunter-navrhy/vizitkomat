// Logo: odstránenie bieleho pozadia, orezanie okrajov a farby značky
import { mix, luminance, contrast } from './card-engine.js';

export function fileToDataURL(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}
function load(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}
const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
function sat(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; }

/** Spracuje logo. Vráti { src, colors[], palette, width, height } */
export async function analyzeLogo(input) {
  const src = typeof input === 'string' ? input : await fileToDataURL(input);
  const im = await load(src);
  const max = 900;
  let w = im.naturalWidth || im.width || 600, h = im.naturalHeight || im.height || 300;
  const sc = Math.min(1, max / Math.max(w, h));
  w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(im, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h), px = id.data;

  // je pozadie biele/svetlé? (rohy)
  const corner = (x, y) => { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
  const cs = [corner(1, 1), corner(w - 2, 1), corner(1, h - 2), corner(w - 2, h - 2)];
  const whiteBg = cs.every(([r, g, b, a]) => a > 240 && r > 232 && g > 232 && b > 232);
  if (whiteBg) {
    for (let i = 0; i < px.length; i += 4) {
      const m = Math.min(px[i], px[i + 1], px[i + 2]);
      if (m > 245) px[i + 3] = 0;
      else if (m > 215) px[i + 3] = Math.round(px[i + 3] * (245 - m) / 30);
    }
    ctx.putImageData(id, 0, 0);
  }
  // orezanie priehľadných okrajov
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  let out = c;
  if (x1 > x0 && y1 > y0 && (x0 > 2 || y0 > 2 || x1 < w - 3 || y1 < h - 3)) {
    const pad = 2;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
    out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
    out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  }

  // farby: kvantizácia do 4-bitových košov
  const bins = new Map();
  let total = 0;
  for (let i = 0; i < px.length; i += 16) {
    if (px[i + 3] < 200) continue;
    const r = px[i], g = px[i + 1], b = px[i + 2];
    if (r > 238 && g > 238 && b > 238) continue;
    const k = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
    const e = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b; bins.set(k, e); total++;
  }
  let cols = [...bins.values()].map((e) => ({ n: e.n, r: e.r / e.n, g: e.g / e.n, b: e.b / e.n }))
    .sort((a, b) => b.n - a.n);
  // zlúčenie podobných
  const merged = [];
  for (const cc of cols) {
    const m = merged.find((x) => Math.hypot(x.r - cc.r, x.g - cc.g, x.b - cc.b) < 48);
    if (m) { const n = m.n + cc.n; m.r = (m.r * m.n + cc.r * cc.n) / n; m.g = (m.g * m.n + cc.g * cc.n) / n; m.b = (m.b * m.n + cc.b * cc.n) / n; m.n = n; }
    else merged.push({ ...cc });
  }
  cols = merged.filter((x) => x.n / Math.max(1, total) > 0.02).slice(0, 5);
  const colors = cols.map((x) => hex(x.r, x.g, x.b));

  // paleta: akcent = najsýtejšia výrazná farba, text = najtmavšia
  const vivid = [...cols].sort((a, b) => (sat(b.r, b.g, b.b) * Math.sqrt(b.n)) - (sat(a.r, a.g, a.b) * Math.sqrt(a.n)))[0];
  const darkest = [...cols].sort((a, b) => luminance(hex(a.r, a.g, a.b)) - luminance(hex(b.r, b.g, b.b)))[0];
  let accent = vivid && sat(vivid.r, vivid.g, vivid.b) > 0.25 ? hex(vivid.r, vivid.g, vivid.b) : (darkest ? hex(darkest.r, darkest.g, darkest.b) : '#E8462B');
  let ink = darkest && luminance(hex(darkest.r, darkest.g, darkest.b)) < 0.06 ? hex(darkest.r, darkest.g, darkest.b) : mix(accent, '#0E0D0B', 0.82);
  if (luminance(accent) > 0.7) accent = mix(accent, '#000000', 0.35);
  const bg = mix(accent, '#FBF9F5', 0.93);
  let palette = { label: 'Logo', bg, ink, accent, soft: mix(accent, '#FFFFFF', 0.78) };
  if (contrast(palette.ink, palette.bg) < 7) palette.ink = '#16140F';

  const dark = { label: 'Logo tmavá', bg: mix(ink, '#000000', 0.25), ink: '#F4F1EA', accent: luminance(accent) < 0.08 ? mix(accent, '#FFFFFF', 0.5) : accent, soft: mix(ink, '#FFFFFF', 0.12) };
  const vividPal = { label: 'Logo výrazná', bg: '#FBFAF7', ink: palette.ink, accent, soft: mix(accent, '#FFFFFF', 0.7) };

  return { src: out.toDataURL('image/png'), colors, palette, palettes: [palette, vividPal, dark], width: out.width, height: out.height, removedBg: whiteBg };
}

// ukážkové logo pre demo na homepage
export function demoLogoSVG(lang = 'sk') {
  const name = lang === 'cz' ? 'MAKOVICE' : 'MAKOVICA';
  const sub = lang === 'cz' ? 'KVĚTINÁŘSTVÍ' : 'KVETINÁRSTVO';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 120"><rect width="360" height="120" fill="#ffffff"/><g transform="translate(58 60)"><circle r="34" fill="#C2452D"/><path d="M-34 0a34 34 0 0 1 68 0" fill="#E77B3C"/><circle r="9" fill="#1F2A24"/><path d="M0 -34v-14M0 -48c8-4 14-2 18 4" stroke="#2F5D46" stroke-width="5" fill="none" stroke-linecap="round"/></g><text x="112" y="70" font-family="Georgia,serif" font-size="34" letter-spacing="3" fill="#1F2A24">${name}</text><text x="114" y="94" font-family="Helvetica,Arial,sans-serif" font-size="12" letter-spacing="4.6" fill="#2F5D46">${sub}</text></svg>`);
}
