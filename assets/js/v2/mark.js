// Znak od AI: z čiernobielej kresby urobí priehľadnú masku (farbí sa až pri vykreslení)
export async function processMark(src, max = 640) {
  const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const w0 = im.naturalWidth, h0 = im.naturalHeight;
  const c = document.createElement('canvas'); c.width = w0; c.height = h0;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, w0, h0), p = d.data;
  // jas pozadia z okrajov
  const samples = [];
  for (let i = 0; i < w0; i += 8) { samples.push(lum(p, i, 2, w0), lum(p, i, h0 - 3, w0)); }
  for (let j = 0; j < h0; j += 8) { samples.push(lum(p, 2, j, w0), lum(p, w0 - 3, j, w0)); }
  samples.sort((a, b) => a - b);
  const bg = samples[Math.floor(samples.length / 2)];
  const span = Math.max(40, bg * 0.55);
  let x0 = w0, y0 = h0, x1 = 0, y1 = 0;
  for (let j = 0; j < h0; j++) for (let i = 0; i < w0; i++) {
    const k = (j * w0 + i) * 4;
    const l = 0.299 * p[k] + 0.587 * p[k + 1] + 0.114 * p[k + 2];
    let a = (bg - l - 12) / span; a = a < 0 ? 0 : a > 1 ? 1 : a;
    p[k] = p[k + 1] = p[k + 2] = 0; p[k + 3] = Math.round(a * 255);
    if (a > 0.25) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
  }
  x.putImageData(d, 0, 0);
  if (x1 <= x0 || y1 <= y0) return null;
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w0 - 1, x1 + pad); y1 = Math.min(h0 - 1, y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, sc = Math.min(1, max / Math.max(cw, ch));
  const o = document.createElement('canvas'); o.width = Math.round(cw * sc); o.height = Math.round(ch * sc);
  o.getContext('2d').drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
  return o.toDataURL('image/png');
}
function lum(p, i, j, w) { const k = (j * w + i) * 4; return 0.299 * p[k] + 0.587 * p[k + 1] + 0.114 * p[k + 2]; }
