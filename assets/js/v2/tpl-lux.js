// Vizitkomat – ilustrované šablóny „Lux“: kresby odborov (kytica, klasy, hrozno, lotos, výkres, erb, objektív, pražiareň,
// oblúk, staveniskový odznak, neon, eukalyptus, retro dielňa, chmeľ, nočná obloha, panoráma, letokruhy, cukráreň).
// Všetko kreslené krivkami v mm, farby z palety (aby fungovala zmena farieb v editore).
import { ornaments } from './tpl-rich.js';

export function luxTemplates(h) {
  const { T, R, C, Ln, P, QR, IMG, MONO, logoOr, bare, city, mix, luminance, tr, seeded, smooth, SCRIPT } = h;
  const { FOIL, MET, oval, f2, first, brand, leaf, sprig, wreath, divider, arcText, ringText, lsFor, tidy, emblem, iconRows, arch, tex } = ornaments(h);
  const dark = (col) => luminance(col) < 0.22;
  const light = (col) => luminance(col) > 0.6;
  // zlato z palety (fólia), inak akcent
  const G = (pal) => (pal.foil ? FOIL(pal) : pal.accent);
  const rad = (d) => (d * Math.PI) / 180;

  // ---------- kresby ----------
  /** Kvet: lupene okolo stredu */
  const flower = (cx, cy, r, n, color, o = {}) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (o.rot || 0);
      out.push(P(leaf(cx, cy, a, r, r * (o.w || 0.42)), o.fill ? { fill: color, opacity: o.opacity ?? 1 } : { stroke: color, sw: o.sw || 0.16 }));
    }
    out.push(C(cx, cy, r * 0.2, { fill: o.center || color }));
    return out;
  };
  /** Púčik na stonke */
  const bud = (x, y, s, a, color) => [P(leaf(x, y, a, s, s * 0.45), { fill: color }), P(leaf(x, y, a + 0.5, s * 0.6, s * 0.22), { stroke: color, sw: 0.14 }), P(leaf(x, y, a - 0.5, s * 0.6, s * 0.22), { stroke: color, sw: 0.14 })];
  /** Krivka stonky (kvadratická) z bodu v uhle */
  const stem = (x, y, len, ang, bend) => {
    const a = rad(ang), ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    const cx = (x + ex) / 2 - Math.sin(a) * len * bend, cy = (y + ey) / 2 + Math.cos(a) * len * bend;
    return { d: `M ${f2(x)} ${f2(y)} Q ${f2(cx)} ${f2(cy)} ${f2(ex)} ${f2(ey)}`, ex, ey };
  };
  /** Kytica: stonky zviazané stužkou, kvety, lístky a púčiky */
  const bouquet = (bx, by, s, color, accent) => {
    const out = [], heads = [];
    const spec = [[-112, 1.0, 'f'], [-98, 1.12, 's'], [-86, 0.92, 'f'], [-74, 1.05, 'b'], [-62, 0.86, 's'], [-124, 0.84, 'b'], [-80, 1.22, 'f2']];
    spec.forEach(([ang, k, kind], i) => {
      const st = stem(bx, by, s * k, ang, (i % 2 ? 0.08 : -0.08));
      out.push(P(st.d, { stroke: color, sw: 0.2 }));
      heads.push([st.ex, st.ey, ang, kind]);
    });
    heads.forEach(([x, y, ang, kind]) => {
      if (kind === 'f') out.push(...flower(x, y, s * 0.2, 6, color, { sw: 0.18, center: accent }));
      else if (kind === 'f2') out.push(...flower(x, y, s * 0.17, 8, accent, { fill: true, opacity: 0.85, center: color, w: 0.36 }));
      else if (kind === 'b') out.push(...bud(x, y, s * 0.14, rad(ang), accent));
      else out.push(...sprig(x - Math.cos(rad(ang)) * s * 0.3, y - Math.sin(rad(ang)) * s * 0.3, s * 0.42, ang, { color, leaves: 5, size: s * 0.11 }));
    });
    // stužka
    const k = s * 0.09;
    out.push(P(`M ${f2(bx - k * 2.6)} ${f2(by - s * 0.18)} C ${f2(bx - k * 4)} ${f2(by - s * 0.32)} ${f2(bx - k * 0.6)} ${f2(by - s * 0.28)} ${f2(bx)} ${f2(by - s * 0.2)} C ${f2(bx + k * 0.6)} ${f2(by - s * 0.28)} ${f2(bx + k * 4)} ${f2(by - s * 0.32)} ${f2(bx + k * 2.6)} ${f2(by - s * 0.18)}`, { stroke: accent, sw: 0.28 }));
    out.push(P(`M ${f2(bx)} ${f2(by - s * 0.2)} Q ${f2(bx - k * 1.5)} ${f2(by - s * 0.05)} ${f2(bx - k * 2.4)} ${f2(by + s * 0.08)} M ${f2(bx)} ${f2(by - s * 0.2)} Q ${f2(bx + k * 1.2)} ${f2(by - s * 0.04)} ${f2(bx + k * 2.8)} ${f2(by + s * 0.06)}`, { stroke: accent, sw: 0.24 }));
    return out;
  };
  /** Pšeničný klas */
  const wheat = (x, y, len, ang, color, o = {}) => {
    const a = rad(ang), dx = Math.cos(a), dy = Math.sin(a), out = [];
    const ex = x + dx * len, ey = y + dy * len;
    out.push(Ln(x, y, ex, ey, color, o.sw || 0.22));
    const n = o.grains || 7, s = o.size || len * 0.16;
    for (let i = 0; i < n; i++) {
      const t = 0.42 + (i / n) * 0.55, px = x + dx * len * t, py = y + dy * len * t, k = 1 - i / n * 0.35;
      out.push(P(leaf(px, py, a - 0.45, s * k, s * k * 0.36), { fill: color }));
      out.push(P(leaf(px, py, a + 0.45, s * k, s * k * 0.36), { fill: color }));
      if (o.awns !== false) { const aa = a - 0.3; out.push(Ln(px + Math.cos(a - 0.45) * s * k, py + Math.sin(a - 0.45) * s * k, px + Math.cos(aa) * s * k * 2.1, py + Math.sin(aa) * s * k * 2.1, color, 0.08)); }
    }
    out.push(P(leaf(ex, ey, a, s * 0.9, s * 0.3), { fill: color }));
    // list na stonke
    out.push(P(leaf(x + dx * len * 0.2, y + dy * len * 0.2, a + (o.flip ? -0.5 : 0.5), len * 0.3, len * 0.04), { fill: color, opacity: 0.85 }));
    return out;
  };
  /** Strapec hrozna + list + úponka */
  const grapes = (cx, cy, r, color, o = {}) => {
    const out = [], rows = [4, 3, 3, 2, 1];
    rows.forEach((n, j) => { for (let i = 0; i < n; i++) { const x = cx + (i - (n - 1) / 2) * r * 1.9, y = cy + j * r * 1.65; out.push(C(x, y, r, o.fill ? { fill: color } : { stroke: color, sw: 0.18 })); } });
    out.push(Ln(cx, cy - r * 1.2, cx + r * 0.6, cy - r * 3.2, color, 0.22));
    out.push(P(leaf(cx + r * 0.5, cy - r * 2.6, rad(-20), r * 3.4, r * 1.3), { fill: color, opacity: 0.9 }));
    out.push(P(leaf(cx + r * 0.5, cy - r * 2.6, rad(-60), r * 2.4, r * 0.9), { fill: color, opacity: 0.75 }));
    out.push(P(`M ${f2(cx + r * 0.3)} ${f2(cy - r * 2.6)} C ${f2(cx - r * 1.5)} ${f2(cy - r * 4.4)} ${f2(cx - r * 3.4)} ${f2(cy - r * 2.4)} ${f2(cx - r * 2.2)} ${f2(cy - r * 1.6)} C ${f2(cx - r * 1.4)} ${f2(cy - r * 1.2)} ${f2(cx - r * 1.2)} ${f2(cy - r * 2.2)} ${f2(cx - r * 1.9)} ${f2(cy - r * 2.2)}`, { stroke: color, sw: 0.14 }));
    return out;
  };
  /** Lotos v línii + vychádzajúce slnko */
  const lotus = (cx, cy, s, color, sun) => {
    const out = [];
    if (sun) { out.push(C(cx, cy - s * 0.55, s * 0.55, { fill: sun })); for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; out.push(Ln(cx + Math.cos(a) * s * 0.66, cy - s * 0.55 + Math.sin(a) * s * 0.66, cx + Math.cos(a) * s * 0.86, cy - s * 0.55 + Math.sin(a) * s * 0.86, sun, 0.2)); } }
    const pet = (a, L, w) => P(leaf(cx, cy, rad(a), L, w), { stroke: color, sw: 0.22, fill: sun ? mix(sun, '#FFFFFF', 0.55) : null });
    out.push(pet(-160, s * 0.62, s * 0.16), pet(-20, s * 0.62, s * 0.16), pet(-135, s * 0.78, s * 0.22), pet(-45, s * 0.78, s * 0.22), pet(-112, s * 0.9, s * 0.26), pet(-68, s * 0.9, s * 0.26), pet(-90, s, s * 0.28));
    for (const k of [0, 1, 2]) { const y = cy + s * 0.14 + k * s * 0.12, w = s * (0.8 - k * 0.2); out.push(P(smooth(Array.from({ length: 7 }, (_, i) => [cx - w + (i / 6) * w * 2, y + Math.sin(i * 1.6) * s * 0.025])), { stroke: color, sw: 0.16 })); }
    return out;
  };
  /** Štít erbu */
  const shield = (cx, cy, w, hgt) => `M ${f2(cx - w / 2)} ${f2(cy - hgt / 2)} L ${f2(cx + w / 2)} ${f2(cy - hgt / 2)} L ${f2(cx + w / 2)} ${f2(cy)} C ${f2(cx + w / 2)} ${f2(cy + hgt * 0.3)} ${f2(cx + w * 0.2)} ${f2(cy + hgt * 0.42)} ${f2(cx)} ${f2(cy + hgt / 2)} C ${f2(cx - w * 0.2)} ${f2(cy + hgt * 0.42)} ${f2(cx - w / 2)} ${f2(cy + hgt * 0.3)} ${f2(cx - w / 2)} ${f2(cy)} Z`;
  /** Pravidelný mnohouholník */
  const poly = (cx, cy, r, n, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + (i / n) * Math.PI * 2; return `${i ? 'L' : 'M'} ${f2(cx + Math.cos(a) * r)} ${f2(cy + Math.sin(a) * r)}`; }).join(' ') + ' Z';
  /** Clona objektívu */
  const aperture = (cx, cy, r, ri, color, sw = 0.2) => {
    const out = [C(cx, cy, r, { stroke: color, sw: sw * 1.6 }), C(cx, cy, r * 0.93, { stroke: color, sw })];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
      const x1 = cx + Math.cos(a) * ri, y1 = cy + Math.sin(a) * ri, x2 = cx + Math.cos(b) * ri, y2 = cy + Math.sin(b) * ri;
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      // čepeľ: predĺžená hrana šesťuholníka až k obvodu
      const t = Math.sqrt(Math.max(0, (r * 0.93) ** 2 - ((x1 - cx) * uy - (y1 - cy) * ux) ** 2)) - ((x1 - cx) * ux + (y1 - cy) * uy);
      out.push(Ln(x1, y1, x1 + ux * t, y1 + uy * t, color, sw));
    }
    out.push(P(poly(cx, cy, ri, n), { stroke: color, sw }));
    return out;
  };
  /** Krátke lúče/čiarky okolo kruhu */
  const ticks = (cx, cy, r1, r2, n, color, sw = 0.14) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return Ln(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, color, sw); });
  /** Kávové zrno */
  const bean = (x, y, a, L, fill, crease) => { const dx = Math.cos(a), dy = Math.sin(a); return [P(oval(x, y, L / 2, L * 0.33, a), { fill }), P(`M ${f2(x - dx * L * 0.38)} ${f2(y - dy * L * 0.38)} Q ${f2(x - dy * L * 0.12)} ${f2(y + dx * L * 0.12)} ${f2(x + dx * L * 0.38)} ${f2(y + dy * L * 0.38)}`, { stroke: crease, sw: 0.2 })]; };
  /** Výstražné pruhy */
  const hazard = (x, y, w, hh, a, b, step = 3) => { const out = [R(x, y, w, hh, a)]; for (let s = x - hh; s < x + w; s += step * 2) out.push(P(`M ${f2(s)} ${f2(y + hh)} L ${f2(s + hh)} ${f2(y)} L ${f2(s + hh + step)} ${f2(y)} L ${f2(s + step)} ${f2(y + hh)} Z`, { fill: b })); return out; };
  /** Eukalyptová vetvička (okrúhle lístky) */
  const euca = (x, y, len, ang, color, o = {}) => {
    const st = stem(x, y, len, ang, o.bend ?? 0.12), out = [P(st.d, { stroke: color, sw: 0.2 })];
    const a = rad(ang), n = o.leaves || 7;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 0.5), px = x + (st.ex - x) * t, py = y + (st.ey - y) * t, side = i % 2 ? 1 : -1, s = (o.size || len * 0.14) * (1 - t * 0.3);
      out.push(P(leaf(px, py, a + side * 1.1, s, s * 0.5), { fill: i % 3 === 0 && o.alt ? o.alt : color, opacity: o.opacity ?? 1 }));
    }
    return out;
  };
  /** Mesiac (kosák) */
  const crescent = (cx, cy, r, color) => { const k = 0.5523; return P(`M ${f2(cx)} ${f2(cy - r)} C ${f2(cx - r * 1.38)} ${f2(cy - r)} ${f2(cx - r * 1.38)} ${f2(cy + r)} ${f2(cx)} ${f2(cy + r)} C ${f2(cx - r * 0.72)} ${f2(cy + r * k)} ${f2(cx - r * 0.72)} ${f2(cy - r * k)} ${f2(cx)} ${f2(cy - r)} Z`, { fill: color }); };
  /** Hviezda (4 cípy) */
  const star4 = (x, y, s, color) => P(`M ${f2(x)} ${f2(y - s)} Q ${f2(x + s * 0.18)} ${f2(y - s * 0.18)} ${f2(x + s)} ${f2(y)} Q ${f2(x + s * 0.18)} ${f2(y + s * 0.18)} ${f2(x)} ${f2(y + s)} Q ${f2(x - s * 0.18)} ${f2(y + s * 0.18)} ${f2(x - s)} ${f2(y)} Q ${f2(x - s * 0.18)} ${f2(y - s * 0.18)} ${f2(x)} ${f2(y - s)} Z`, { fill: color });
  /** Panoráma mesta */
  const skyline = (x0, base, w, seed, fill, win) => {
    const r = seeded(seed), out = []; let x = x0;
    while (x < x0 + w) {
      const bw = 3.5 + r() * 5, bh = 5 + r() * 13 + (Math.abs(x - (x0 + w / 2)) < w * 0.15 ? 6 : 0);
      out.push(R(x, base - bh, bw, bh + 4, fill));
      if (r() > 0.6) out.push(R(x + bw / 2 - 0.15, base - bh - 2.4, 0.3, 2.4, fill));
      if (win) for (let yy = base - bh + 1.4; yy < base - 1.2; yy += 1.7) for (let xx = x + 0.9; xx < x + bw - 0.9; xx += 1.3) if (r() > 0.45) out.push(R(xx, yy, 0.5, 0.65, win));
      x += bw + 0.25;
    }
    return out;
  };
  /** Letokruhy (nepravidelné sústredné krivky) */
  const rings = (cx, cy, n, step, seed, color, o = {}) => {
    const r = seeded(seed), ph = [r() * 6, r() * 6], out = [];
    for (let k = 1; k <= n; k++) {
      const R0 = k * step, pts = [];
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; const rr = R0 * (1 + 0.06 * Math.sin(a * 3 + ph[0] + k * 0.3) + 0.04 * Math.sin(a * 5 + ph[1])); pts.push([cx + Math.cos(a) * rr * (o.sx || 1), cy + Math.sin(a) * rr]); }
      out.push(P(smooth(pts, true), { stroke: color, sw: k % 4 === 0 ? 0.32 : 0.14, opacity: o.opacity ?? 1 }));
    }
    return out;
  };
  /** Zúbkovaný okraj (cukráreň) – oblúčiky smerom dole od y */
  const scallop = (W, y, r, fill, up = false) => { let d = up ? `M -3 -3 L -3 ${f2(y)}` : `M -3 ${f2(y)}`; for (let x = -3; x < W + 3; x += r * 2) d += ` Q ${f2(x + r)} ${f2(y + r * 1.6)} ${f2(x + r * 2)} ${f2(y)}`; d += up ? ` L ${f2(W + 3)} -3 Z` : ` L ${f2(W + 3)} 80 L -3 80 Z`; return P(d, { fill }); };
  /** Šiška chmeľu */
  const hop = (cx, cy, s, color, fill) => {
    const out = [], rows = [[1, 0], [2, 0.18], [3, 0.36], [3, 0.54], [2, 0.72], [1, 0.88]];
    rows.forEach(([n, t]) => { for (let i = 0; i < n; i++) { const x = cx + (i - (n - 1) / 2) * s * 0.34, y = cy - s * 0.5 + t * s; out.push(P(leaf(x, y - s * 0.12, rad(90), s * 0.3, s * 0.17), { fill: fill || null, stroke: color, sw: 0.18 })); } });
    out.push(Ln(cx, cy - s * 0.62, cx + s * 0.1, cy - s * 0.86, color, 0.22));
    out.push(P(leaf(cx + s * 0.1, cy - s * 0.8, rad(-25), s * 0.55, s * 0.2), { fill: color }));
    return out;
  };
  /** Krídla (retro odznak) – perá */
  const wings = (cx, cy, s, color) => {
    const out = [];
    for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
      const L = s * (1 - i * 0.14), y = cy - s * 0.18 + i * s * 0.1, x = cx + side * s * 0.36;
      out.push(P(leaf(x, y, side > 0 ? rad(-8 + i * 6) : rad(188 - i * 6), L, s * 0.07), { fill: color }));
    }
    return out;
  };
  const contactsCenter = (c, keys, x, y, lh, size, color, fit) => keys.map((k) => c.f[k]).filter((v) => v && v.trim()).map((t, i, a) => T(t, { field: keys.filter((k) => c.f[k] && c.f[k].trim())[i], x, y: y + i * lh, ox: 'center', oy: 'center', size, font: 't', color, fit }));

  return tidy({
    // 1 · KVETINÁRSTVO – ručne kreslená kytica
    kytice: {
      name: tr('Kytica', 'Kytice'), fonts: 'playfair', pal: 'salvia', emblem: 'flower-tulip', tags: ['kvety', 'svadba', 'zahrady', 'butik', 'kozmetika', 'eko', 'prirodne', 'elegantne', 'jemne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F4F1EA', ink = dark(pal.ink) ? pal.ink : '#1F2A22', acc = pal.accent;
        if (c.sq) return { bg: { color: bg, art: tex(c, 'papier'), artOpacity: 0.45 }, objs: [
          ...bouquet(W * 0.62, H * 0.99, H * 0.5, ink, acc),
          T(brand(c), { field: 'company', x: m, y: m + 6, oy: 'bottom', size: 5.4, font: 'd', color: ink, fit: W - 2 * m }),
          T(f.tagline || f.role || '', { field: 'tagline', x: m + 0.4, y: m + 7.6, size: 2.8, font: SCRIPT, color: acc, fit: W - 2 * m }),
        ] };
        return { bg: { color: bg, art: tex(c, 'papier'), artOpacity: 0.45 }, objs: [
          ...bouquet(W * 0.73, H * 0.98, H * 0.62, ink, acc),
          T(brand(c), { field: 'company', x: m + 1, y: H * 0.5, oy: 'bottom', size: 6, font: 'd', color: ink, fit: W * 0.42 }),
          T(f.tagline || f.role || '', { field: 'tagline', x: m + 1.4, y: H * 0.5 + 1.8, size: 3.2, font: SCRIPT, color: acc, fit: W * 0.42 }),
          Ln(m + 1, H * 0.78, m + 13, H * 0.78, acc, 0.2), C(m + 14.2, H * 0.78, 0.45, { fill: acc }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1F2A22', acc = pal.accent, bg = mix(pal.accent, '#FFFFFF', 0.86);
        return { bg: { color: bg }, objs: [
          ...flower(W - m - 6, m + 5.5, 4.4, 6, acc, { sw: 0.2, center: ink }),
          ...sprig(W - m - 9, m + 9, 10, 150, { color: ink, leaves: 5, size: 2 }),
          ...sprig(W - m - 3, m + 9.5, 10, 75, { color: acc, leaves: 4, size: 1.8 }),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 4, font: 'd', color: ink, fit: W * 0.62 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.3, size: 1.7, font: 't', w: 600, ls: 0.24, color: acc, fit: W * 0.62 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.5, lh: 3.3, r: 1.15, ring: true, circle: acc, icon: acc, color: ink, size: 1.95, fit: W * 0.72 }),
        ] };
      },
    },

    // 2 · PEKÁREŇ – odznak s klasmi
    klas: {
      name: tr('Klas', 'Klas'), fonts: 'caslon', pal: 'piesok', emblem: 'bread', tags: ['pekaren', 'cukraren', 'gastro', 'kaviaren', 'farma', 'bio', 'remeslo', 'tradicne', 'prirodne', 'teple', 'klasicky'],
      front(c) {
        const { W, H, f, pal } = c; const ink = dark(pal.ink) ? pal.ink : '#2A2119', acc = pal.accent, cx = W / 2, cy = H * 0.45, r = H * 0.33;
        const top = brand(c).toLocaleUpperCase(), bot = (city(c) || f.role || '').toLocaleUpperCase();
        return { bg: { color: light(pal.bg) ? pal.bg : '#EFE6D8', art: tex(c, 'papier'), artOpacity: 0.6 }, objs: [
          ...[-158, -146, -134, -46, -34, -22].flatMap((a, i) => wheat(cx, cy + r * 0.55, r * 1.75 - (i % 3) * 1.8, a, i % 3 === 1 ? mix(acc, '#FFFFFF', 0.3) : acc, { size: 2.3, flip: a < -90 })),
          C(cx, cy, r, { fill: light(pal.bg) ? pal.bg : '#EFE6D8', stroke: ink, sw: 0.5 }), C(cx, cy, r - 1.1, { stroke: ink, sw: 0.16 }), C(cx, cy, r - 5.4, { stroke: ink, sw: 0.16 }),
          ...ringText(top, cx, cy, r - 3.25, -152, -28, { size: 2.1, font: 'd', w: 700, color: ink }),
          ...ringText(bot, cx, cy, r - 3.25, 138, 42, { size: 1.8, font: 't', w: 700, color: ink, bottom: true }),
          C(cx - r + 3.25, cy, 0.4, { fill: ink }), C(cx + r - 3.25, cy, 0.4, { fill: ink }),
          emblem(c, cx, cy, r * 0.62, acc),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.ink) ? pal.ink : '#2A2119', cr = '#F2E8D8', acc = mix(pal.accent, '#FFFFFF', 0.25);
        return { bg: { color: bg }, objs: [
          ...wheat(W + 1, H * 0.95, H * 0.62, -128, acc, { size: 2.3 }), ...wheat(W - 7, H + 2, H * 0.5, -112, mix(acc, bg, 0.35), { size: 2 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 3, oy: 'bottom', size: 3.2, font: 'd', w: 700, ls: 0.08, color: cr, fit: W * 0.62 }),
          T(f.name + (f.role ? ' · ' + f.role : ''), { field: 'name', x: m, y: m + 4.4, size: 1.9, font: 't', it: true, color: acc, fit: W * 0.62 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.52, lh: 3.2, r: 1.1, circle: acc, icon: bg, color: cr, size: 1.9, fit: W * 0.6 }),
        ] };
      },
    },

    // 3 · VINÁRSTVO – etiketa fľaše
    etiketa: {
      name: tr('Etiketa', 'Etiketa'), fonts: 'caslon', pal: 'vino', emblem: 'wine', tags: ['vino', 'vinarstvo', 'bar', 'restauracia', 'gastro', 'hotel', 'farma', 'tradicne', 'luxusne', 'klasicky', 'elegantne'],
      front(c) {
        const { W, H, f, pal } = c; const ink = dark(pal.ink) ? pal.ink : '#3A1C20', acc = pal.accent, g = 'foil:gold', i = 3.4;
        const corner = (x, y, sx, sy) => [P(`M ${f2(x)} ${f2(y + sy * 5)} L ${f2(x)} ${f2(y)} L ${f2(x + sx * 5)} ${f2(y)}`, { stroke: g, sw: 0.3 }), P(`M ${f2(x + sx * 1.4)} ${f2(y + sy * 3.2)} C ${f2(x + sx * 1.4)} ${f2(y + sy * 1.4)} ${f2(x + sx * 1.4)} ${f2(y + sy * 1.4)} ${f2(x + sx * 3.2)} ${f2(y + sy * 1.4)}`, { stroke: g, sw: 0.16 }), C(x + sx * 1.4, y + sy * 1.4, 0.35, { fill: g })];
        return { bg: { color: light(pal.bg) ? pal.bg : '#F3ECE3', art: tex(c, 'papier'), artOpacity: 0.55 }, objs: [
          R(i, i, W - 2 * i, H - 2 * i, null, { stroke: acc, sw: 0.14 }),
          ...corner(i + 1.2, i + 1.2, 1, 1), ...corner(W - i - 1.2, i + 1.2, -1, 1), ...corner(i + 1.2, H - i - 1.2, 1, -1), ...corner(W - i - 1.2, H - i - 1.2, -1, -1),
          ...grapes(W / 2, H * 0.22, 1.05, acc, { fill: true }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.6, ox: 'center', oy: 'center', size: 4, font: 'd', w: 700, ls: 0.1, color: ink, fit: W - 24 }),
          ...divider(W / 2, H * 0.7, 30, g),
          T((f.tagline || city(c) || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.79, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.3, color: mix(ink, '#FFFFFF', 0.3), fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.accent) ? pal.accent : '#5A1420', g = 'foil:gold', lt = '#F1E6D6';
        return { bg: { color: bg }, objs: [
          R(3.4, 3.4, W - 6.8, H - 6.8, null, { stroke: g, sw: 0.25 }),
          ...grapes(W / 2, m + 3.2, 0.8, '#C9A15A', { fill: true }),
          T(f.name, { field: 'name', x: W / 2, y: H * 0.42, ox: 'center', oy: 'center', size: 3.6, font: 'd', color: g, fit: W - 22 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.42 + 3.6, ox: 'center', oy: 'center', size: 1.6, font: 't', w: 600, ls: 0.3, color: lt, fit: W - 26 }),
          ...contactsCenter(c, ['phone', 'email', 'web'], W / 2, H * 0.66, 2.9, 1.85, lt, W - 22),
        ] };
      },
    },

    // 4 · JÓGA – lotos a slnko
    lotos: {
      name: tr('Lotos', 'Lotos'), fonts: 'italiana', pal: 'retro', emblem: 'flower-lotus', tags: ['joga', 'wellness', 'terapeut', 'masaz', 'spa', 'psycholog', 'kouc', 'kozmetika', 'prirodne', 'jemne', 'teple', 'zenske'],
      front(c) {
        const { W, H, f, pal } = c; const bg = light(pal.bg) ? pal.bg : '#F7E9D2', ink = dark(pal.ink) ? pal.ink : '#3B1F12', acc = pal.accent;
        return { bg: { color: bg }, objs: [
          ...lotus(W / 2, H * 0.44, H * 0.34, ink, mix(acc, bg, 0.35)),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.7, ox: 'center', oy: 'center', size: 4.4, font: 'd', ls: 0.18, color: ink, fit: W - 22 }),
          T((f.tagline || f.role || ''), { field: 'tagline', x: W / 2, y: H * 0.8, ox: 'center', oy: 'center', size: 2, font: 't', it: true, color: acc, fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = pal.accent && !light(pal.accent) ? pal.accent : '#C2643F', lt = '#FFF4EA';
        return { bg: { color: bg }, objs: [
          ...lotus(W - m - 9, H * 0.62, 13, lt, null),
          C(W - m - 9, H * 0.62 - 7.2, 2.4, { fill: mix(bg, '#FFFFFF', 0.35) }),
          T(f.name, { field: 'name', x: m, y: m + 4.2, oy: 'bottom', size: 4.4, font: 'd', color: lt, fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.6, size: 1.7, font: 't', w: 600, ls: 0.26, color: mix(bg, '#FFFFFF', 0.65), fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.52, lh: 3.2, r: 1.1, circle: lt, icon: bg, color: lt, size: 1.9, fit: W * 0.56 }),
        ] };
      },
    },

    // 5 · ARCHITEKT – modrotlač výkresu
    vykres: {
      name: tr('Výkres', 'Výkres'), fonts: 'grotesk', pal: 'navy', emblem: 'compass-tool', tags: ['architekt', 'stavba', 'interier', 'developer', 'reality', 'remeslo', 'it', 'firma', 'moderne', 'tmave', 'serioze'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#17325E', ln = '#FFFFFF', acc = pal.accent, o = [];
        for (let x = 0; x <= W; x += 3) o.push(Ln(x, -2, x, H + 2, ln, x % 15 === 0 ? 0.12 : 0.05, { opacity: x % 15 === 0 ? 0.22 : 0.12 }));
        for (let y = 0; y <= H; y += 3) o.push(Ln(-2, y, W + 2, y, ln, y % 15 === 0 ? 0.12 : 0.05, { opacity: y % 15 === 0 ? 0.22 : 0.12 }));
        const hx = W * 0.56, hb = H * 0.8, hw = W * 0.34, hh = H * 0.34;
        const house = [
          R(hx, hb - hh, hw, hh, null, { stroke: ln, sw: 0.28 }),
          P(`M ${f2(hx - 1.6)} ${f2(hb - hh)} L ${f2(hx + hw * 0.5)} ${f2(hb - hh - H * 0.2)} L ${f2(hx + hw + 1.6)} ${f2(hb - hh)}`, { stroke: ln, sw: 0.28 }),
          R(hx + hw * 0.12, hb - hh * 0.62, hw * 0.22, hh * 0.3, null, { stroke: ln, sw: 0.16 }), R(hx + hw * 0.66, hb - hh * 0.62, hw * 0.22, hh * 0.3, null, { stroke: ln, sw: 0.16 }),
          R(hx + hw * 0.42, hb - hh * 0.55, hw * 0.16, hh * 0.55, null, { stroke: acc, sw: 0.22 }),
          Ln(hx - 4, hb, hx + hw + 4, hb, ln, 0.3),
          // kóty
          Ln(hx, hb + 2.4, hx + hw, hb + 2.4, acc, 0.14), Ln(hx, hb + 1.4, hx, hb + 3.4, acc, 0.14), Ln(hx + hw, hb + 1.4, hx + hw, hb + 3.4, acc, 0.14),
          Ln(hx + hw + 3, hb, hx + hw + 3, hb - hh, acc, 0.14), Ln(hx + hw + 2, hb, hx + hw + 4, hb, acc, 0.14), Ln(hx + hw + 2, hb - hh, hx + hw + 4, hb - hh, acc, 0.14),
          C(hx + hw * 0.5, hb - hh - H * 0.2, 0.5, { fill: acc }),
        ];
        return { bg: { color: bg }, objs: [
          ...o, ...house,
          C(W - m - 2, m + 2, 2.6, { stroke: ln, sw: 0.14, opacity: 0.7 }), Ln(W - m - 2, m - 1.4, W - m - 2, m + 5.4, ln, 0.12), T('N', { x: W - m - 2, y: m - 2.4, ox: 'center', oy: 'bottom', size: 1.7, font: 't', w: 600, color: ln }),
          T((bare(f.name) || f.name), { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 4.2, font: 'd', w: 600, color: ln, fit: W * 0.46 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: H * 0.42 + 1, size: 1.7, font: 't', w: 600, ls: 0.2, color: acc, fit: W * 0.46 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', w: 500, ls: 0.24, color: mix(bg, '#FFFFFF', 0.7), fit: W * 0.46 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const navy = dark(pal.bg) ? pal.bg : '#17325E', acc = pal.accent, o = [];
        for (let x = 0; x <= W; x += 3) o.push(Ln(x, -2, x, H + 2, navy, 0.05, { opacity: 0.1 }));
        for (let y = 0; y <= H; y += 3) o.push(Ln(-2, y, W + 2, y, navy, 0.05, { opacity: 0.1 }));
        return { bg: { color: '#F5F3EE' }, objs: [
          ...o,
          R(W - 26, -2, 28, H + 4, navy),
          logoOr(c, W - 12, H / 2, 16, 16, { tint: '#FFFFFF' }, MONO(c, { x: W - 12, y: H / 2, ox: 'center', oy: 'center', size: 7, w: 600, color: '#FFFFFF' })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 2.6, oy: 'bottom', size: 2.4, font: 'd', w: 600, ls: 0.16, color: navy, fit: W - 38 }),
          Ln(m, m + 4.2, W - 32, m + 4.2, acc, 0.22),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.46, lh: 3.3, r: 1.1, circle: navy, icon: '#FFFFFF', color: navy, size: 1.95, fit: W - 42, font: 't' }),
        ] };
      },
    },

    // 6 · PRÁVNIK – erb s vavrínom
    erb: {
      name: tr('Erb', 'Erb'), fonts: 'cinzel', pal: 'smaragd', emblem: 'scales', tags: ['pravnik', 'advokat', 'financie', 'uctovnictvo', 'poistenie', 'konzultant', 'notar', 'firma', 'luxusne', 'tmave', 'serioze', 'klasicky'],
      front(c) {
        const { W, H, f, pal } = c; const bg = dark(pal.bg) ? pal.bg : '#0F3B2E', g = 'foil:gold', lt = '#EDE6D6', cx = W / 2, cy = H * 0.38;
        return { bg: { color: bg }, objs: [
          R(2.8, 2.8, W - 5.6, H - 5.6, null, { stroke: g, sw: 0.22 }), R(3.8, 3.8, W - 7.6, H - 7.6, null, { stroke: g, sw: 0.08 }),
          ...wreath(cx, cy + 0.6, 10.2, MET(pal.foil ? pal : { foil: 'gold' }), { leaves: 9, size: 3, gap: 70 }),
          P(shield(cx, cy, 11, 13.4), { stroke: g, sw: 0.4, fill: mix(bg, '#000000', 0.25) }), P(shield(cx, cy, 9.4, 11.6), { stroke: g, sw: 0.12 }),
          logoOr(c, cx, cy - 0.4, 7.4, 7.4, { tint: g }, emblem(c, cx, cy - 0.6, 6.6, g)),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: cx, y: H * 0.77, ox: 'center', oy: 'center', size: 3.4, font: 'd', w: 600, ls: 0.18, color: g, fit: W - 22 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: cx, y: H * 0.85, ox: 'center', oy: 'center', size: 1.6, font: 't', ls: 0.3, color: lt, fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = 'foil:gold', ink = dark(pal.bg) ? pal.bg : '#0F3B2E', cr = '#F4EFE5';
        return { bg: { color: cr, art: tex(c, 'papier'), artOpacity: 0.5 }, objs: [
          R(2.8, 2.8, W - 5.6, H - 5.6, null, { stroke: g, sw: 0.22 }),
          P(shield(W / 2, m + 3.6, 4.4, 5.4), { stroke: g, sw: 0.25 }), MONO(c, { x: W / 2, y: m + 3.2, ox: 'center', oy: 'center', size: 2.2, color: g }),
          T(f.name, { field: 'name', x: W / 2, y: H * 0.4, ox: 'center', oy: 'center', size: 3.6, font: 'd', w: 600, ls: 0.06, color: ink, fit: W - 20 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.4 + 3.5, ox: 'center', oy: 'center', size: 1.6, font: 't', w: 600, ls: 0.3, color: mix(ink, cr, 0.35), fit: W - 26 }),
          ...divider(W / 2, H * 0.58, 30, g),
          ...contactsCenter(c, ['phone', 'email', 'web', 'address'], W / 2, H * 0.67, 2.8, 1.85, ink, W - 20),
        ] };
      },
    },

    // 7 · FOTOGRAF – clona objektívu
    objektiv: {
      name: tr('Objektív', 'Objektiv'), fonts: 'dmserif', pal: 'grafit', emblem: 'aperture', tags: ['foto', 'kameraman', 'dizajn', 'kreativ', 'svadba', 'event', 'galeria', 'studio', 'umelec', 'moderne', 'tmave', 'odvazne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#1A1B1E', ln = mix(bg, '#FFFFFF', 0.42), acc = pal.accent && !dark(pal.accent) ? pal.accent : '#E8A55A', cx = W * 0.82, cy = H * 0.5;
        return { bg: { color: bg }, objs: [
          C(cx, cy, 25, { stroke: mix(bg, '#FFFFFF', 0.12), sw: 2.6 }), C(cx, cy, 21.5, { stroke: mix(bg, '#FFFFFF', 0.2), sw: 0.14 }),
          ...ticks(cx, cy, 22.5, 23.8, 60, mix(bg, '#FFFFFF', 0.3), 0.1),
          ...aperture(cx, cy, 19, 6.2, ln, 0.18),
          C(cx, cy, 5.6, { fill: mix(bg, '#000000', 0.4) }), C(cx - 1.6, cy - 1.6, 1.1, { fill: '#FFFFFF', opacity: 0.35 }), C(cx + 1.4, cy + 1.2, 0.5, { fill: acc, opacity: 0.8 }),
          T(f.name, { field: 'name', x: m, y: H * 0.47, oy: 'bottom', size: 5, font: 'd', color: '#F4F1EC', fit: W * 0.5 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: H * 0.47 + 1.4, size: 1.7, font: 't', w: 600, ls: 0.3, color: acc, fit: W * 0.48 }),
          C(m + 0.8, H - m - 0.6, 0.8, { fill: '#E5484D' }), T('REC', { x: m + 2.4, y: H - m - 0.6, oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.2, color: mix(bg, '#FFFFFF', 0.6) }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#1A1B1E', acc = pal.accent && !dark(pal.accent) ? pal.accent : '#E8A55A', ink = '#1A1B1E', o = [];
        for (let x = 1; x < W; x += 4.2) { o.push(R(x, 1.3, 2.2, 1.8, '#EDE8DF', { rx: 0.4 })); o.push(R(x, 10.6, 2.2, 1.8, '#EDE8DF', { rx: 0.4 })); }
        const frames = [0, 1, 2, 3].map((i) => (i ? IMG(c.scene(['svetlo', 'ruzova', 'saten'][i - 1]), m + i * 20.5, 4.2, 18.5, 5.4, { opacity: 0.9 }) : R(m, 4.2, 18.5, 5.4, mix(bg, '#FFFFFF', 0.12), { rx: 0.4 })));
        return { bg: { color: '#EDE8DF' }, objs: [
          R(-2, -2, W + 4, 15.6, bg), ...o, ...frames,
          logoOr(c, m + 9.25, 6.9, 14, 4.6, { tint: '#FFFFFF' }, MONO(c, { x: m + 9.25, y: 6.9, ox: 'center', oy: 'center', size: 3.4, color: '#FFFFFF', ls: 0.1 })),
          T(f.name, { field: 'name', x: m, y: H * 0.5, oy: 'bottom', size: 3.4, font: 'd', color: ink, fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web'], { x: m, y: H * 0.62, lh: 3.2, r: 1.1, circle: ink, icon: acc, color: ink, size: 1.9, fit: W * 0.56 }),
          R(W - m - 12.6, H * 0.46 - 0.6, 13.2, 13.2, '#FFFFFF'), QR(W - m - 12, H * 0.46, 12, ink),
        ] };
      },
    },

    // 8 · PRAŽIAREŇ – pečiatka a zrná
    prazirna: {
      name: tr('Pražiareň', 'Pražírna'), fonts: 'bebas', pal: 'retro', emblem: 'coffee-bean', tags: ['kaviaren', 'gastro', 'bistro', 'bar', 'obchod', 'pekaren', 'caj', 'remeslo', 'retro', 'teple', 'odvazne', 'tradicne'],
      front(c) {
        const { W, H, f, pal } = c; const ink = '#2B1A12', acc = pal.accent || '#C8642E', bg = '#D9C3A0', cx = W / 2, cy = H / 2, r = H * 0.36, rnd = seeded(brand(c) + 'pz'), beans = [];
        for (let i = 0, n = 0; i < 300 && n < 18; i++) { const x = rnd() * W, y = rnd() * H; if (Math.hypot(x - cx, y - cy) < r + 4) continue; n++; beans.push(...bean(x, y, rnd() * Math.PI, 2.8 + rnd() * 1.2, n % 3 ? ink : acc, bg)); }
        const top = brand(c).toLocaleUpperCase(), bot = (city(c) || f.role || '').toLocaleUpperCase();
        return { bg: { color: bg, art: c.scene('kraft'), artOpacity: 0.55 }, objs: [
          ...beans,
          C(cx, cy, r + 1.8, { fill: '#EFE3CF' }), ...ticks(cx, cy, r + 0.2, r + 1.5, 64, ink, 0.18),
          C(cx, cy, r - 0.4, { stroke: ink, sw: 0.45 }), C(cx, cy, r - 5.2, { stroke: ink, sw: 0.18 }),
          ...ringText(top, cx, cy, r - 2.8, -155, -25, { size: 2.4, font: 'd', color: ink }),
          ...ringText(bot, cx, cy, r - 2.8, 140, 40, { size: 2.1, font: 'd', color: acc, bottom: true }),
          star4(cx - r + 2.8, cy, 0.7, acc), star4(cx + r - 2.8, cy, 0.7, acc),
          emblem(c, cx, cy, r * 0.8, ink),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = '#2B1A12', cr = '#EFE3CF', acc = pal.accent || '#C8642E';
        return { bg: { color: bg }, objs: [
          C(W - 4, H - 4, 22, { stroke: cr, sw: 0.5, opacity: 0.12 }), C(W - 4, H - 4, 17, { stroke: cr, sw: 0.2, opacity: 0.12 }), ...ticks(W - 4, H - 4, 22.6, 24.4, 64, cr, 0.18).map((x) => ({ ...x, opacity: 0.12 })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 4.6, oy: 'bottom', size: 5.6, font: 'd', ls: 0.04, color: cr, fit: W * 0.66 }),
          T((f.tagline || '').toLocaleUpperCase(), { field: 'tagline', x: m, y: m + 5.8, size: 1.9, font: 'd', ls: 0.14, color: acc, fit: W * 0.66 }),
          T(f.name + (f.role ? ', ' + f.role : ''), { field: 'name', x: m, y: H * 0.5, oy: 'bottom', size: 2, font: 't', w: 600, color: cr, fit: W * 0.66 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.6, lh: 3, r: 1.05, circle: acc, icon: bg, color: cr, size: 1.85, fit: W * 0.6 }),
        ] };
      },
    },

    // 9 · BEAUTY – oblúkové okno so zlatým rámom
    arkada: {
      name: tr('Arkáda', 'Arkáda'), fonts: 'italiana', pal: 'rosegold', emblem: 'sparkle', tags: ['beauty', 'kozmetika', 'salon', 'nechty', 'kader', 'svadba', 'butik', 'moda', 'wellness', 'luxusne', 'jemne', 'elegantne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F4E6E0', g = G(pal), ink = dark(pal.ink) ? pal.ink : '#3A2A2A', aw = c.sq ? H * 0.42 : H * 0.62, ax = c.sq ? W * 0.5 - aw / 2 : W * 0.3 - aw / 2, top = c.sq ? H * 0.42 : H * 0.12, tx = c.sq ? m : W * 0.6, ty = c.sq ? m + 6 : H * 0.47, tf = c.sq ? W - 2 * m : W * 0.34;
        return { bg: { color: bg }, objs: [
          P(arch(ax, H + 3, aw, top), { fill: mix(pal.accent, '#FFFFFF', 0.7) }),
          IMG(c.root + 'assets/tex/blob-ruza.png', ax - 6, top, aw + 12, H, { role: 'art', blend: 'multiply', opacity: 0.6 }),
          P(arch(ax, H + 3, aw, top), { stroke: MET(pal), sw: 0.45 }), P(arch(ax + 1.4, H + 3, aw - 2.8, top + 1.4), { stroke: MET(pal), sw: 0.14 }),
          ...sprig(ax + aw * 0.2, H - 1, 18, -70, { color: g, leaves: 7, size: 3 }), ...sprig(ax + aw * 0.8, H - 1, 15, -112, { color: g, leaves: 6, size: 2.7 }),
          logoOr(c, ax + aw / 2, top + aw * 0.42, aw * 0.5, aw * 0.4, { tint: MET(pal) }, MONO(c, { x: ax + aw / 2, y: top + aw * 0.42, ox: 'center', oy: 'center', size: 6.6, color: MET(pal) })),
          T(brand(c), { field: 'company', x: tx, y: ty, oy: 'bottom', size: 5.2, font: 'd', color: ink, fit: tf + 2 }),
          Ln(tx, ty + 1.6, tx + 12, ty + 1.6, MET(pal), 0.2),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: tx, y: ty + 3.2, size: 1.6, font: 't', w: 600, ls: lsFor(f.role, 0.2), color: mix(ink, bg, 0.3), fit: tf }),
          T(f.tagline || '', { field: 'tagline', x: tx, y: ty + 6.4, size: 1.85, font: 't', it: true, color: mix(ink, bg, 0.2), fit: tf }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = pal.soft && dark(pal.soft) ? pal.soft : '#2E2626', g = G(pal), lt = '#F1DFD8';
        return { bg: { color: bg }, objs: [
          P(arch(W - m - 16, H + 3, 16, m - 1), { stroke: MET(pal), sw: 0.35 }), P(arch(W - m - 14.8, H + 3, 13.6, m + 0.2), { stroke: MET(pal), sw: 0.12 }),
          emblem(c, W - m - 8, m + 9, 6, MET(pal)),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 4.2, font: 'd', color: g, fit: W * 0.58 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.4, size: 1.7, font: 't', w: 600, ls: 0.26, color: lt, fit: W * 0.58 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.52, lh: 3.2, r: 1.1, ring: true, circle: '#C48573', icon: '#E2AE9C', color: lt, size: 1.9, fit: W * 0.56 }),
        ] };
      },
    },

    // 10 · STAVBA – výstražné pruhy a šesťuholník
    stavitel: {
      name: tr('Staviteľ', 'Stavitel'), fonts: 'bebas', pal: 'grafit', emblem: 'hard-hat', tags: ['stavba', 'remeslo', 'elektro', 'auto', 'stolar', 'firma', 'developer', 'odvazne', 'tmave', 'moderne', 'serioze'],
      front(c) {
        const { W, H, f, m } = c; const y = '#F2B705', bg = '#171717', hx = m + 9, hy = H * 0.42;
        return { bg: { color: bg, art: tex(c, 'cierna'), artOpacity: 0.5 }, objs: [
          ...hazard(-2, H - 6.2, W + 4, 8.4, y, '#171717', 2.6),
          P(poly(hx, hy, 9.6, 6, Math.PI / 6), { fill: y }), P(poly(hx, hy, 8.2, 6, Math.PI / 6), { stroke: bg, sw: 0.3 }),
          logoOr(c, hx, hy, 11, 11, { tint: bg }, emblem(c, hx, hy, 9.4, bg)),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m + 22, y: hy + 0.6, oy: 'bottom', size: 7.4, font: 'd', ls: 0.02, color: '#FFFFFF', fit: W - m - 27 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: m + 22, y: hy + 1.8, size: 2.4, font: 'd', ls: 0.12, color: y, fit: W - m - 27 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const y = '#F2B705', bg = '#171717';
        return { bg: { color: y }, objs: [
          ...hazard(-2, -2, W + 4, 4.6, bg, y, 2.2),
          T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + 6.4, oy: 'bottom', size: 5.2, font: 'd', ls: 0.02, color: bg, fit: W * 0.62 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 7.4, size: 2.2, font: 'd', ls: 0.14, color: mix(bg, y, 0.3), fit: W * 0.62 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.56, lh: 3.2, r: 1.15, circle: bg, icon: y, color: bg, size: 1.95, w: 600, fit: W * 0.58 }),
          R(W - m - 13.2, H * 0.5 - 0.6, 13.2, 13.2, '#FFFFFF'), QR(W - m - 12.6, H * 0.5, 12, bg),
        ] };
      },
    },

    // 11 · IT – neónová mriežka
    neon: {
      name: 'Neon', fonts: 'grotesk', pal: 'limetka', emblem: 'code', tags: ['it', 'startup', 'marketing', 'agentura', 'dizajn', 'kreativ', 'hudba', 'event', 'moderne', 'tmave', 'odvazne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = '#0A0B16', a1 = '#2EE6D6', a2 = '#B04CFF', hz = H * 0.6, o = [];
        for (let i = -9; i <= 9; i++) o.push(Ln(W / 2 + i * 1.6, hz, W / 2 + i * 13, H + 3, a1, 0.12, { opacity: 0.45 }));
        for (let k = 0; k < 7; k++) { const y = hz + (H + 3 - hz) * (k / 6) ** 1.8; o.push(Ln(-2, y, W + 2, y, a1, 0.12, { opacity: 0.25 + k * 0.05 })); }
        const glow = (x, y, r, col) => [8, 6, 4.4, 3].map((k, i) => C(x, y, r * k / 3, { fill: col, opacity: [0.05, 0.08, 0.12, 0.2][i] }));
        return { bg: { color: bg }, objs: [
          ...glow(W * 0.78, H * 0.32, 5, a2), ...glow(W * 0.2, H * 0.62, 4, a1),
          C(W * 0.78, H * 0.32, 5.2, { stroke: a2, sw: 0.3 }), R(-2, hz - 0.15, W + 4, 0.3, a1, { opacity: 0.8 }), ...o,
          logoOr(c, W * 0.78, H * 0.32, 7, 7, { tint: '#FFFFFF' }, emblem(c, W * 0.78, H * 0.32, 5.8, '#FFFFFF')),
          T(brand(c), { field: 'company', x: m, y: H * 0.34, oy: 'bottom', size: 6.2, font: 'd', w: 700, ls: -0.02, color: '#FFFFFF', fit: W * 0.56 }),
          T('> ' + (f.tagline || f.role || ''), { field: 'tagline', prefix: '> ', x: m, y: H * 0.34 + 1.6, size: 1.85, font: 'IBM Plex Mono', color: a1, fit: W * 0.56 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const bg = '#0A0B16', a1 = '#2EE6D6', a2 = '#B04CFF', mono = 'IBM Plex Mono';
        const row = (k, label, i) => (f[k] && f[k].trim() ? [T(label, { x: m, y: H * 0.5 + i * 3.1, oy: 'center', size: 1.7, font: mono, color: a2 }), T(f[k], { field: k, x: m + 9, y: H * 0.5 + i * 3.1, oy: 'center', size: 1.85, font: mono, color: '#E6E8F2', fit: W - m - 32 })] : []);
        const keys = [['phone', 'tel'], ['email', 'mail'], ['web', 'web'], ['address', 'loc']].filter(([k]) => f[k] && f[k].trim());
        return { bg: { color: bg }, objs: [
          R(m - 1.4, m - 1.4, W - 2 * m + 2.8, 3.4, '#161830', { rx: 0.6 }), C(m + 0.4, m + 0.3, 0.5, { fill: '#FF5F57' }), C(m + 2, m + 0.3, 0.5, { fill: '#FEBC2E' }), C(m + 3.6, m + 0.3, 0.5, { fill: '#28C840' }),
          T(f.name, { field: 'name', x: m, y: H * 0.36, oy: 'bottom', size: 3.8, font: 'd', w: 700, color: '#FFFFFF', fit: W - m - 30 }),
          T('// ' + (f.role || ''), { field: 'role', prefix: '// ', x: m, y: H * 0.36 + 1, size: 1.8, font: mono, color: a1, fit: W - m - 30 }),
          ...keys.flatMap(([k, l], i) => row(k, l, i)),
          R(W - m - 13.4, H * 0.42 - 1.4, 14.8, 14.8, a2, { rx: 1, opacity: 0.25 }), R(W - m - 12.6, H * 0.42 - 0.6, 13.2, 13.2, '#FFFFFF', { rx: 0.4 }), QR(W - m - 12, H * 0.42, 12, bg),
        ] };
      },
    },

    // 12 · SVADBY – eukalyptový rám
    eukalyptus: {
      name: tr('Eukalyptus', 'Eukalyptus'), fonts: 'playfair', pal: 'salvia', emblem: 'leaf', tags: ['svadba', 'svadby', 'kvety', 'event', 'foto', 'wellness', 'kozmetika', 'terapeut', 'kouc', 'prirodne', 'jemne', 'elegantne', 'zenske'],
      front(c) {
        const { W, H, f, pal } = c; const bg = '#F8F6F0', sage = pal.accent || '#7E9A80', dk = mix(sage, '#1F2A22', 0.45), g = 'foil:gold', ink = dark(pal.ink) ? pal.ink : '#2F3B32';
        return { bg: { color: bg, art: tex(c, 'papier'), artOpacity: 0.4 }, objs: [
          ...euca(-2, 9, 26, 12, sage, { leaves: 9, size: 3.4, alt: dk }), ...euca(-1, 4, 20, 40, dk, { leaves: 7, size: 2.8, opacity: 0.9 }), ...sprig(2, 13, 16, 62, { color: g, leaves: 6, size: 2.4 }),
          ...euca(W + 2, H - 9, 26, 192, sage, { leaves: 9, size: 3.4, alt: dk }), ...euca(W + 1, H - 4, 20, 220, dk, { leaves: 7, size: 2.8, opacity: 0.9 }), ...sprig(W - 2, H - 13, 16, 242, { color: g, leaves: 6, size: 2.4 }),
          C(W / 2, H / 2, H * 0.36, { stroke: MET({ foil: 'gold' }), sw: 0.25 }), C(W / 2, H / 2, H * 0.36 - 0.8, { stroke: MET({ foil: 'gold' }), sw: 0.08 }),
          T(first(c), { field: 'name', part: 0, x: W / 2, y: H * 0.46, ox: 'center', oy: 'center', size: 8.4, font: SCRIPT, color: ink, fit: H * 0.66 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.64, ox: 'center', oy: 'center', size: 1.8, font: 't', w: 600, ls: lsFor(brand(c), 0.3), color: dk, fit: H * 0.62 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const sage = pal.accent || '#7E9A80', bg = mix(sage, '#2F3B32', 0.15), lt = '#F8F6F0';
        return { bg: { color: bg }, objs: [
          ...euca(W + 2, 6, 24, 160, mix(bg, '#FFFFFF', 0.35), { leaves: 8, size: 3.2 }), ...euca(W + 1, 1, 18, 130, mix(bg, '#FFFFFF', 0.2), { leaves: 6, size: 2.6 }),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 4.2, font: 'd', color: lt, fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.4, size: 1.7, font: 't', w: 600, ls: 0.26, color: mix(bg, '#FFFFFF', 0.7), fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.52, lh: 3.2, r: 1.1, circle: lt, icon: bg, color: lt, size: 1.9, fit: W * 0.66 }),
        ] };
      },
    },

    // 13 · AUTOSERVIS – retro odznak s krídlami
    garaz: {
      name: tr('Garáž', 'Garáž'), fonts: 'bebas', pal: 'bauhaus', emblem: 'wrench', tags: ['auto', 'remeslo', 'elektro', 'stavba', 'barber', 'bar', 'pivovar', 'sport', 'retro', 'odvazne', 'tradicne', 'hrave'],
      front(c) {
        const { W, H, f, pal } = c; const cr = light(pal.bg) ? pal.bg : '#F2EBDD', navy = dark(pal.ink) ? pal.ink : '#1B2A44', red = pal.accent || '#C1462A', cx = W / 2, cy = H * 0.36;
        return { bg: { color: cr }, objs: [
          R(-2, H * 0.82, W + 4, 2, red), R(-2, H * 0.86, W + 4, 1, navy), R(-2, H * 0.89, W + 4, 0.6, red),
          ...wings(cx, cy, 21, navy),
          C(cx, cy, 7.4, { fill: navy }), C(cx, cy, 6.4, { stroke: cr, sw: 0.25 }),
          logoOr(c, cx, cy, 9, 9, { tint: cr }, emblem(c, cx, cy, 7.4, cr)),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: cx, y: H * 0.66, ox: 'center', oy: 'center', size: 6, font: 'd', ls: 0.04, color: navy, fit: W - 18 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: cx, y: H * 0.76, ox: 'center', oy: 'center', size: 2, font: 'd', ls: 0.2, color: red, fit: W - 22 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const navy = dark(pal.ink) ? pal.ink : '#1B2A44', cr = '#F2EBDD', red = pal.accent || '#C1462A';
        return { bg: { color: navy }, objs: [
          P(`M ${W * 0.62} -3 L ${W * 0.74} -3 L ${W * 0.54} ${H + 3} L ${W * 0.42} ${H + 3} Z`, { fill: red, opacity: 0.95 }), P(`M ${W * 0.77} -3 L ${W * 0.81} -3 L ${W * 0.61} ${H + 3} L ${W * 0.57} ${H + 3} Z`, { fill: cr, opacity: 0.9 }),
          T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + 4.4, oy: 'bottom', size: 4.6, font: 'd', ls: 0.04, color: cr, fit: W * 0.42 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.4, size: 2, font: 'd', ls: 0.16, color: red, fit: W * 0.42 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.5, lh: 3.2, r: 1.1, circle: cr, icon: navy, color: cr, size: 1.9, fit: W * 0.36 }),
          R(W - m - 12.6, H * 0.5 - 0.6, 13.2, 13.2, cr), QR(W - m - 12, H * 0.5, 12, navy),
        ] };
      },
    },

    // 14 · PIVOVAR – chmeľ a etiketa
    chmel: {
      name: tr('Chmeľ', 'Chmel'), fonts: 'caslon', pal: 'smaragd', emblem: 'beer-stein', tags: ['pivovar', 'bar', 'gastro', 'restauracia', 'bistro', 'farma', 'obchod', 'remeslo', 'tradicne', 'prirodne', 'tmave', 'retro'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#163126', cr = '#EFE6CF', g = 'foil:gold', hopc = mix(pal.accent || '#D8B56A', '#8DBF5A', 0.5);
        return { bg: { color: bg }, objs: [
          R(3, 3, W - 6, H - 6, null, { stroke: g, sw: 0.2 }),
          ...wheat(W * 0.09, H * 0.9, H * 0.56, -84, MET({ foil: 'gold' }), { size: 2, flip: true }), ...wheat(W * 0.91, H * 0.9, H * 0.56, -96, MET({ foil: 'gold' }), { size: 2 }),
          ...hop(W / 2, H * 0.32, 9.4, cr, mix(hopc, bg, 0.2)),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.64, ox: 'center', oy: 'center', size: 4.4, font: 'd', w: 700, ls: 0.08, color: cr, fit: W - 30 }),
          ...divider(W / 2, H * 0.73, 22, g),
          T((f.tagline || city(c) || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.81, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.26, color: mix(bg, cr, 0.75), fit: W - 32 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const cr = '#EFE6CF', ink = dark(pal.bg) ? pal.bg : '#163126', g = 'foil:gold';
        return { bg: { color: cr, art: tex(c, 'papier'), artOpacity: 0.5 }, objs: [
          ...hop(W - m - 6, H * 0.5, 10, ink, mix(ink, cr, 0.75)),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.8, font: 'd', w: 700, color: ink, fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.2, size: 1.7, font: 't', w: 600, ls: 0.26, color: mix(ink, cr, 0.35), fit: W * 0.6 }),
          Ln(m, H * 0.42, m + 16, H * 0.42, g, 0.3),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.54, lh: 3.2, r: 1.1, circle: ink, icon: cr, color: ink, size: 1.9, fit: W * 0.6 }),
        ] };
      },
    },

    // 15 · TERAPEUT / KOUČ – nočná obloha
    hvezdy: {
      name: tr('Hviezdy', 'Hvězdy'), fonts: 'cinzel', pal: 'noblesa', emblem: 'moon-stars', tags: ['terapeut', 'psycholog', 'kouc', 'joga', 'wellness', 'masaz', 'hudba', 'umelec', 'event', 'luxusne', 'tmave', 'jemne', 'elegantne'],
      front(c) {
        const { W, H, f, pal } = c; const bg = dark(pal.bg) ? pal.bg : '#121A33', g = 'foil:gold', lt = '#EDE6D6', r = seeded(brand(c) + 'st'), stars = [];
        for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H, s = r(); stars.push(C(x, y, 0.1 + s * 0.22, { fill: '#FFFFFF', opacity: 0.25 + s * 0.55 })); }
        const con = [[W * 0.1, H * 0.22], [W * 0.18, H * 0.12], [W * 0.27, H * 0.2], [W * 0.31, H * 0.33], [W * 0.22, H * 0.4]];
        return { bg: { color: bg }, objs: [
          ...stars,
          P('M ' + con.map((p) => p.map(f2).join(' ')).join(' L '), { stroke: g, sw: 0.1, opacity: 0.8 }), ...con.map(([x, y]) => C(x, y, 0.45, { fill: g })),
          crescent(W * 0.8, H * 0.3, 6, '#E2C47E'), star4(W * 0.71, H * 0.18, 1.3, '#E2C47E'), star4(W * 0.88, H * 0.55, 0.9, '#E2C47E'),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.62, ox: 'center', oy: 'center', size: 4, font: 'd', w: 600, ls: 0.16, color: g, fit: W - 22 }),
          T((f.tagline || f.role || ''), { field: 'tagline', x: W / 2, y: H * 0.74, ox: 'center', oy: 'center', size: 2.1, font: 't', it: true, color: lt, fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#121A33', g = 'foil:gold', lt = '#EDE6D6', r = seeded(f.name + 'sb'), stars = [];
        for (let i = 0; i < 30; i++) { const x = W * 0.55 + r() * W * 0.45, y = r() * H; stars.push(C(x, y, 0.1 + r() * 0.2, { fill: '#FFFFFF', opacity: 0.2 + r() * 0.4 })); }
        return { bg: { color: bg }, objs: [
          ...stars, crescent(W - m - 5, m + 5, 4, '#E2C47E'),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.6, font: 'd', w: 600, ls: 0.06, color: g, fit: W * 0.62 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.3, size: 1.6, font: 't', w: 600, ls: 0.28, color: lt, fit: W * 0.62 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.52, lh: 3.2, r: 1.1, ring: true, circle: '#C9A15A', icon: '#D9BB72', color: lt, size: 1.9, fit: W * 0.66 }),
        ] };
      },
    },

    // 16 · REALITY – panoráma mesta
    panorama: {
      name: tr('Panoráma', 'Panorama'), fonts: 'marcellus', pal: 'noblesa', emblem: 'key', tags: ['reality', 'developer', 'architekt', 'stavba', 'hotel', 'financie', 'investicie', 'firma', 'konzultant', 'luxusne', 'serioze', 'elegantne', 'moderne'],
      front(c) {
        const { W, H, f, pal } = c; const navy = dark(pal.bg) ? pal.bg : '#14213D', g = G(pal.foil ? pal : { foil: 'gold' }), cr = '#F4EFE6';
        return { bg: { color: cr, art: tex(c, 'papier'), artOpacity: 0.45 }, objs: [
          ...skyline(-2, H + 0.5, W + 4, brand(c), navy, mix(navy, '#F2D58A', 0.75)),
          R(-2, H - 1.4, W + 4, 3, navy),
          emblem(c, W / 2, H * 0.17, 6.4, g),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.34, ox: 'center', oy: 'center', size: 4.2, font: 'd', ls: 0.16, color: navy, fit: W - 20 }),
          ...divider(W / 2, H * 0.43, 26, g),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const navy = dark(pal.bg) ? pal.bg : '#14213D', g = G(pal.foil ? pal : { foil: 'gold' }), lt = '#EDE6D6';
        return { bg: { color: navy }, objs: [
          ...skyline(W * 0.56, H + 0.5, W * 0.48, f.name, mix(navy, '#FFFFFF', 0.08), mix(navy, '#F2D58A', 0.5)),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.8, font: 'd', color: g, fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.3, size: 1.6, font: 't', w: 600, ls: 0.28, color: lt, fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.5, lh: 3.2, r: 1.1, circle: '#C9A15A', icon: navy, color: lt, size: 1.9, fit: W * 0.5 }),
          R(W - m - 12.6, m - 0.6, 13.2, 13.2, '#FFFFFF'), QR(W - m - 12, m, 12, navy),
        ] };
      },
    },

    // 17 · STOLÁR – letokruhy
    letokruhy: {
      name: tr('Letokruhy', 'Letokruhy'), fonts: 'caslon', pal: 'dub', emblem: 'tree-evergreen', tags: ['stolar', 'remeslo', 'nabytok', 'interier', 'stavba', 'zahrady', 'farma', 'eko', 'prirodne', 'teple', 'tradicne', 'klasicky'],
      front(c) {
        const { W, H, f, pal, m } = c; const wood = '#E7D3B4', brown = dark(pal.ink) ? pal.ink : '#3B2A1E', acc = pal.accent || '#8A6A43';
        return { bg: { color: wood, art: c.scene('dub'), artOpacity: 0.35 }, objs: [
          ...rings(W * 0.86, H * 0.5, 16, 2.1, brand(c), brown, { opacity: 0.55 }),
          C(W * 0.86, H * 0.5, 1.2, { fill: brown, opacity: 0.6 }),
          P(`M ${W * 0.86} ${H * 0.5} L ${W + 3} ${H * 0.3}`, { stroke: brown, sw: 0.3, opacity: 0.4 }),
          logoOr(c, m + 6, m + 5, 10, 10, { tint: brown }, emblem(c, m + 4.5, m + 4.5, 8, brown)),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: H * 0.62, oy: 'bottom', size: 4.4, font: 'd', w: 700, ls: 0.06, color: brown, fit: W * 0.56 }),
          Ln(m, H * 0.62 + 1.4, m + 22, H * 0.62 + 1.4, acc, 0.3),
          T(f.tagline || f.role || '', { field: 'tagline', x: m, y: H * 0.62 + 2.8, size: 2.1, font: 'd', it: true, color: mix(brown, wood, 0.25), fit: W * 0.56 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.ink) ? pal.ink : '#3B2A1E', cr = '#F0E4D0', acc = '#C9A877';
        return { bg: { color: bg }, objs: [
          ...rings(W + 6, H + 4, 14, 2.4, f.name, cr, { opacity: 0.12 }),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.8, font: 'd', w: 700, color: cr, fit: W * 0.62 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 5.2, size: 1.7, font: 't', w: 600, ls: 0.26, color: acc, fit: W * 0.62 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.5, lh: 3.2, r: 1.1, circle: acc, icon: bg, color: cr, size: 1.9, fit: W * 0.66 }),
        ] };
      },
    },

    // 18 · CUKRÁREŇ – zúbkovaný okraj a bodky
    dortik: {
      name: tr('Tortička', 'Dortík'), fonts: 'abril', pal: 'pastel', emblem: 'cake', tags: ['cukraren', 'pekaren', 'kaviaren', 'gastro', 'event', 'oslavy', 'deti', 'butik', 'hrave', 'farebne', 'jemne', 'zenske', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const pink = light(pal.bg) ? pal.bg : '#F9C9DA', cr = '#FFF7F0', ink = dark(pal.ink) ? pal.ink : '#3A1E2A', acc = pal.accent || '#E2557A', dots = [];
        const sy = c.sq ? H * 0.84 : H * 0.8;
        for (let x = 1.5; x < W; x += 3) dots.push(C(x, sy + 2.6, 0.45, { fill: acc }));
        const o = [scallop(W, sy, 1.5, cr), ...dots];
        // poschodová torta na podnose: poleva, sviečky, čerešne
        const k = c.sq ? 0.86 : 0.88, cx = W / 2, base = c.sq ? H * 0.47 : H * 0.52;
        o.push(P(oval(cx, base + 0.8 * k, 15 * k, 1.5 * k), { fill: mix(acc, '#000000', 0.15), opacity: 0.25 }));
        o.push(P(oval(cx, base, 14 * k, 1.4 * k), { fill: cr }), R(cx - 1.4 * k, base, 2.8 * k, 2.6 * k, cr), P(oval(cx, base + 2.6 * k, 4 * k, 0.8 * k), { fill: cr }));
        const tiers = [[24, 5.4, mix(pink, '#FFFFFF', 0.55)], [17, 4.8, mix(acc, pink, 0.55)], [10.5, 4.2, cr]];
        let y = base;
        tiers.forEach(([w, h, col], i) => {
          w *= k; h *= k; const x0 = cx - w / 2; y -= h;
          o.push(R(x0, y, w, h, col, { rx: 0.5 }));
          o.push(R(x0, y + h - 0.6 * k, w, 0.6 * k, mix(col, '#000000', 0.08)));
          // poleva s kvapkami
          const ic = i === 1 ? cr : mix(acc, '#FFFFFF', 0.25); let d = `M ${f2(x0)} ${f2(y)} L ${f2(x0 + w)} ${f2(y)} L ${f2(x0 + w)} ${f2(y + 1.1 * k)}`;
          const n = Math.max(3, Math.round(w / 2.6));
          for (let j = n; j > 0; j--) { const xa = x0 + (w * j) / n, xb = x0 + (w * (j - 1)) / n, l = (1.1 + ((j * 7 + i * 3) % 4) * 0.55) * k; d += ` C ${f2(xa - (xa - xb) * 0.2)} ${f2(y + l + 0.6 * k)} ${f2(xb + (xa - xb) * 0.2)} ${f2(y + l + 0.6 * k)} ${f2(xb)} ${f2(y + 1.1 * k)}`; }
          o.push(P(d + ' Z', { fill: ic }));
          for (let j = 0; j < Math.round(w / 3); j++) o.push(C(x0 + 1.4 * k + j * 3 * k, y + h * 0.66, 0.32 * k, { fill: i === 1 ? cr : acc, opacity: 0.85 }));
        });
        // sviečky a čerešne
        for (const dx of [-2.6, 0, 2.6]) {
          const x = cx + dx * k, ch = (dx ? 3 : 3.8) * k;
          o.push(R(x - 0.35 * k, y - ch, 0.7 * k, ch, dx ? '#FFFFFF' : '#FFD23F'), Ln(x - 0.35 * k, y - ch * 0.4, x + 0.35 * k, y - ch * 0.6, acc, 0.16));
          o.push(P(`M ${f2(x)} ${f2(y - ch - 2.3 * k)} C ${f2(x + 0.9 * k)} ${f2(y - ch - 1.2 * k)} ${f2(x + 0.6 * k)} ${f2(y - ch - 0.1 * k)} ${f2(x)} ${f2(y - ch - 0.1 * k)} C ${f2(x - 0.6 * k)} ${f2(y - ch - 0.1 * k)} ${f2(x - 0.9 * k)} ${f2(y - ch - 1.2 * k)} ${f2(x)} ${f2(y - ch - 2.3 * k)} Z`, { fill: '#FFB020' }));
          o.push(C(x, y - ch - 0.9 * k, 0.32 * k, { fill: '#FFF2B0' }));
        }
        for (const dx of [-4.2, 4.2]) o.push(C(cx + dx * k, y - 0.4 * k, 0.9 * k, { fill: '#D6264B' }), Ln(cx + dx * k, y - 1.2 * k, cx + dx * k + 0.7 * k, y - 2.4 * k, '#3F6B3A', 0.16));
        const r = seeded(brand(c) + 'dk'), cols = [acc, '#FFFFFF', '#FFD23F', '#7FC8C2'];
        for (let i = 0; i < 26; i++) { const x = r() * W, yy = r() * (sy - 4); if (Math.abs(x - cx) < 15 * k && yy > y - 8 && yy < base + 3) continue; if (yy > base + 1 && Math.abs(x - cx) < W * 0.38) continue; o.push(R(x, yy, 1.3, 0.42, cols[i % 4], { rx: 0.2, rot: r() * 180 })); }
        o.push(T(brand(c), { field: 'company', x: cx, y: c.sq ? H * 0.635 : H * 0.665, ox: 'center', oy: 'center', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: W - 18 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: cx, y: c.sq ? H * 0.735 : H * 0.745 + 0.4, ox: 'center', oy: 'center', size: 1.8, font: 't', w: 600, color: acc, fit: W - 24 }));
        return { bg: { color: pink }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const pink = light(pal.bg) ? pal.bg : '#F9C9DA', cr = '#FFF7F0', ink = dark(pal.ink) ? pal.ink : '#3A1E2A', acc = pal.accent || '#E2557A', dots = [];
        for (let x = 1.5; x < W; x += 3) dots.push(C(x, 7.4, 0.45, { fill: acc }));
        return { bg: { color: cr }, objs: [
          R(-3, -3, W + 6, 8, pink), scallop(W, 5, 1.5, pink, true), ...dots,
          T(f.name, { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 4, font: 'd', color: ink, fit: W * 0.62 }),
          T(f.role || '', { field: 'role', x: m, y: H * 0.42 + 1, size: 2, font: 't', w: 600, color: acc, fit: W * 0.62 }),
          ...iconRows(c, ['phone', 'email', 'web'], { x: m, y: H * 0.64, lh: 3.2, r: 1.1, circle: acc, color: ink, size: 1.9, fit: W * 0.58 }),
          C(W - m - 6, H * 0.6, 6.4, { fill: pink }), emblem(c, W - m - 6, H * 0.6, 7, ink),
        ] };
      },
    },
  });
}
