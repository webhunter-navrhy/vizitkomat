// Vizitkomat – kolekcia „Remeslá a štýly“ (4. kolo): nové ilustrované šablóny pre odbory, ktoré chýbali
// (veterinár, autoškola, záhradník, murár, maliar, kominár, krajčírka, produktový fotograf, DJ, lektor jazykov, doučovanie,
// luxusné reality, penzión, fine dining, pizzeria, specialty káva, vinotéka, kníhkupectvo, kvetinárstvo, masér, kozmetička,
// lekáreň, advokát, architekt, svadby, škôlka, bio farma) + čisté štýly (art-deco noir, japandi, risograf, holografia,
// botanická rytina, brutalizmus). Všetko kreslené krivkami v mm, farby odvodené z palety (dá sa prefarbiť).
import { ornaments } from './tpl-rich.js';

export function yTemplates(h) {
  const { T, R, C, Ln, P, QR, IMG, I, MONO, contacts, logoOr, mono, bare, city, splitName, mix, luminance, tr, seeded, smooth, SCRIPT } = h;
  const { FOIL, MET, oval, f2, first, brand, has, leaf, sprig, wreath, divider, decoFrame, fan, waveFill, ringText, arcText, tidy, emblem, arch, tex } = ornaments(h);
  const lum = luminance;
  const ctr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const rad = (d) => (d * Math.PI) / 180;
  const G = (pal) => (pal.foil ? FOIL(pal) : pal.accent);
  /** Svetlý základ odvodený z palety: pozadie, písmo, akcent (vždy čitateľné) */
  const LB = (pal, fb = '#F6F2EA') => {
    const bg = lum(pal.bg) > 0.5 ? pal.bg : fb;
    const ink = ctr(pal.ink, bg) >= 4.5 ? pal.ink : ctr(pal.bg, bg) >= 4.5 ? pal.bg : '#1C1A17';
    const acc = ctr(pal.accent, bg) >= 2 ? pal.accent : mix(pal.accent, '#000000', 0.45);
    return { bg, ink, acc };
  };
  /** Tmavý základ odvodený z palety */
  const DB = (pal, fb = '#17191E') => {
    const bg = lum(pal.bg) < 0.2 ? pal.bg : lum(pal.ink) < 0.08 ? pal.ink : fb;
    const ink = ctr(pal.ink, bg) >= 4.5 ? pal.ink : ctr(pal.bg, bg) >= 4.5 ? pal.bg : '#F4F0E8';
    const acc = ctr(pal.accent, bg) >= 2 ? pal.accent : mix(pal.accent, '#FFFFFF', 0.5);
    return { bg, ink, acc };
  };
  /** Kovový prechod pre ťahy (textúra fólie na tenkých čiarach pôsobí špinavo) */
  const MG = (pal) => (pal.foil ? { grad: { rose: ['#9C5E50', '#E9B8A8', '#B87A6A', '#F2CFC2'], silver: ['#7E8388', '#E6E8EA', '#A9ADB2', '#F2F3F4'], copper: ['#8A4F22', '#E3A574', '#B87333', '#F0C29A'] }[pal.foil] || ['#8A6A2C', '#F5E3A6', '#B48F44', '#E8CD86'], angle: 35 } : pal.accent);
  /** Akcent stmavený tak, aby na ňom biele písmo malo kontrast aspoň 4,5 : 1 */
  const deep = (col) => { let x = col; for (let i = 0; i < 12 && ctr(x, '#FFFFFF') < 4.5; i++) x = mix(x, '#000000', 0.12); return x; };
  const on = (bg) => (lum(bg) > 0.42 ? '#1C1A17' : '#FFFFFF');

  // ---------- pomocníci ----------
  const paper = (c, op = 0.45) => IMG(tex(c, 'papier'), -2.5, -2.5, c.W + 5, c.H + 5, { role: 'art', blend: 'multiply', opacity: op });
  const rows = (c, o) => contacts(c, { keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], size: 1.85, lh: 2.8, ...o });
  const keys4 = (c) => (c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address']);
  const centerLines = (c, x, yb, o) => {
    const f = c.f, l1 = [f.phone, f.web].filter((v) => v && v.trim()).join('   ·   '), l2 = has(c, 'email') ? f.email : '';
    const L = [l1, l2].filter(Boolean), lh = o.lh || 2.8;
    return L.map((t, i) => T(t, { field: i === L.length - 1 && l2 ? 'email' : undefined, x, y: yb - (L.length - 1 - i) * lh, ox: 'center', oy: 'bottom', size: o.size || 1.85, font: 't', w: o.w, color: o.color, fit: o.fit, ls: o.ls ?? 0.04 }));
  };
  /** Oblúk kružnice/elipsy ako Bézierovky (render nepozná príkaz A); uhly v stupňoch */
  const arcD = (cx, cy, r, a0, a1, move = true, ry = r) => {
    const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90)), da = (a1 - a0) / n; let d = '';
    for (let i = 0; i < n; i++) {
      const s0 = rad(a0 + i * da), s1 = rad(a0 + (i + 1) * da), k = (4 / 3) * Math.tan((s1 - s0) / 4);
      const p0 = [cx + r * Math.cos(s0), cy + ry * Math.sin(s0)], p3 = [cx + r * Math.cos(s1), cy + ry * Math.sin(s1)];
      const p1 = [p0[0] - k * r * Math.sin(s0), p0[1] + k * ry * Math.cos(s0)], p2 = [p3[0] + k * r * Math.sin(s1), p3[1] - k * ry * Math.cos(s1)];
      if (i === 0 && move) d += `M ${f2(p0[0])} ${f2(p0[1])} `;
      d += `C ${f2(p1[0])} ${f2(p1[1])} ${f2(p2[0])} ${f2(p2[1])} ${f2(p3[0])} ${f2(p3[1])} `;
    }
    return d;
  };
  /** Bod na kubickej krivke */
  const cub = (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
  /** Prerušovaná čiara po kubickej krivke */
  const dashes = (p0, p1, p2, p3, n, col, sw, duty = 0.5, op = 1) => { const out = []; for (let i = 0; i < n; i++) { const a = cub(p0, p1, p2, p3, i / n), b = cub(p0, p1, p2, p3, (i + duty) / n); out.push(Ln(a[0], a[1], b[0], b[1], col, sw, { opacity: op })); } return out; };
  /** Prerušovaný obdĺžnik (steh) */
  const stitch = (x, y, w, hh, col, step = 1.6, sw = 0.16) => { const out = []; for (let k = 0; k < w; k += step) { out.push(Ln(x + k, y, x + Math.min(w, k + step * 0.55), y, col, sw), Ln(x + k, y + hh, x + Math.min(w, k + step * 0.55), y + hh, col, sw)); } for (let k = 0; k < hh; k += step) { out.push(Ln(x, y + k, x, y + Math.min(hh, k + step * 0.55), col, sw), Ln(x + w, y + k, x + w, y + Math.min(hh, k + step * 0.55), col, sw)); } return out; };
  /** Bodka v mriežke (polotón) */
  const dotGrid = (x0, y0, x1, y1, step, rFn, col, o = {}) => { const out = []; for (let y = y0; y <= y1; y += step) for (let x = x0 + (o.stagger && Math.round((y - y0) / step) % 2 ? step / 2 : 0); x <= x1; x += step) { const r = rFn(x, y); if (r > 0.05) out.push(C(x, y, r, { fill: col, opacity: o.opacity ?? 1 })); } return out; };
  /** Štvorcípa hviezdička (lesk) */
  const twinkle = (x, y, s, col, o = {}) => P(`M ${f2(x)} ${f2(y - s)} Q ${f2(x + s * 0.14)} ${f2(y - s * 0.14)} ${f2(x + s)} ${f2(y)} Q ${f2(x + s * 0.14)} ${f2(y + s * 0.14)} ${f2(x)} ${f2(y + s)} Q ${f2(x - s * 0.14)} ${f2(y + s * 0.14)} ${f2(x - s)} ${f2(y)} Q ${f2(x - s * 0.14)} ${f2(y - s * 0.14)} ${f2(x)} ${f2(y - s)} Z`, { fill: col, opacity: o.opacity ?? 1 });
  /** Srdce */
  const heart = (x, y, s) => `M ${f2(x)} ${f2(y + s * 0.9)} C ${f2(x - s * 1.2)} ${f2(y + s * 0.1)} ${f2(x - s * 0.9)} ${f2(y - s * 0.75)} ${f2(x)} ${f2(y - s * 0.25)} C ${f2(x + s * 0.9)} ${f2(y - s * 0.75)} ${f2(x + s * 1.2)} ${f2(y + s * 0.1)} ${f2(x)} ${f2(y + s * 0.9)} Z`;
  /** Kvapka */
  const drop = (x, y, s) => `M ${f2(x)} ${f2(y - s)} C ${f2(x + s * 0.2)} ${f2(y - s * 0.55)} ${f2(x + s * 0.62)} ${f2(y - s * 0.1)} ${f2(x + s * 0.62)} ${f2(y + s * 0.32)} C ${f2(x + s * 0.62)} ${f2(y + s * 0.7)} ${f2(x + s * 0.32)} ${f2(y + s)} ${f2(x)} ${f2(y + s)} C ${f2(x - s * 0.32)} ${f2(y + s)} ${f2(x - s * 0.62)} ${f2(y + s * 0.7)} ${f2(x - s * 0.62)} ${f2(y + s * 0.32)} C ${f2(x - s * 0.62)} ${f2(y - s * 0.1)} ${f2(x - s * 0.2)} ${f2(y - s * 0.55)} ${f2(x)} ${f2(y - s)} Z`;
  /** Zúbkovaná hrana hore (vrchy, strechy) zo zoznamu bodov → vyplnené dole */
  const ridge = (pts, H, fill, o = {}) => P(`M ${f2(pts[0][0])} ${f2(H + 4)} ` + pts.map(([x, y]) => `L ${f2(x)} ${f2(y)}`).join(' ') + ` L ${f2(pts[pts.length - 1][0])} ${f2(H + 4)} Z`, { fill, opacity: o.opacity ?? 1, stroke: o.stroke, sw: o.sw });
  /** Labka (zvieracia stopa) */
  const paw = (x, y, s, col, a = 0, op = 1) => {
    const co = Math.cos(a), si = Math.sin(a), p = (dx, dy) => [x + dx * co - dy * si, y + dx * si + dy * co];
    const [px, py] = p(0, s * 0.2), out = [P(oval(px, py, s * 0.44, s * 0.36, a), { fill: col, opacity: op })];
    [[-0.5, -0.24, 0.16, 0.21, -0.45], [-0.18, -0.55, 0.17, 0.22, -0.12], [0.18, -0.55, 0.17, 0.22, 0.12], [0.5, -0.24, 0.16, 0.21, 0.45]].forEach(([dx, dy, rx, ry, aa]) => { const [tx, ty] = p(dx * s, dy * s); out.push(P(oval(tx, ty, rx * s, ry * s, a + aa), { fill: col, opacity: op })); });
    return out;
  };
  /** Plochý kvet: lupene okolo stredu */
  const bloom = (cx, cy, r, n, petal, core, o = {}) => {
    const out = [], a0 = o.rot || 0;
    for (let i = 0; i < n; i++) { const a = a0 + (i / n) * Math.PI * 2; out.push(P(oval(cx + Math.cos(a) * r * 0.52, cy + Math.sin(a) * r * 0.52, r * 0.5, r * (o.w || 0.3), a), { fill: petal, opacity: o.opacity ?? 1 })); }
    if (o.inner) for (let i = 0; i < n; i++) { const a = a0 + ((i + 0.5) / n) * Math.PI * 2; out.push(P(oval(cx + Math.cos(a) * r * 0.32, cy + Math.sin(a) * r * 0.32, r * 0.32, r * 0.2, a), { fill: o.inner })); }
    out.push(C(cx, cy, r * (o.core || 0.2), { fill: core }));
    return out;
  };
  /** Pivónia: vrstvy oblúkových lupeňov */
  const peony = (cx, cy, r, col, dk) => {
    const out = [C(cx, cy, r, { fill: col })];
    for (let k = 0; k < 3; k++) { const rr = r * (0.82 - k * 0.24); for (let i = 0; i < 5; i++) { const a = k * 33 + i * 72; out.push(P(arcD(cx, cy + k * 0.1, rr, a, a + 62), { stroke: dk, sw: 0.22, opacity: 0.75 })); } }
    out.push(C(cx, cy, r * 0.12, { fill: dk, opacity: 0.6 }));
    return out;
  };
  /** Kniha (chrbát) */
  const spine = (x, y, w, hh, col, band, o = {}) => [R(x, y, w, hh, col, { rx: 0.25, rot: o.rot }), R(x, y + hh * 0.12, w, hh * 0.05, band, { rot: o.rot }), R(x, y + hh * 0.83, w, hh * 0.05, band, { rot: o.rot }), R(x + w * 0.3, y + hh * 0.3, w * 0.4, hh * 0.36, band, { rx: 0.15, opacity: 0.55, rot: o.rot })];
  /** Fľaša vína (silueta) – tvar: 'bdx' bordeaux, 'brg' burgundy, 'sek' šampus */
  const bottle = (x, yb, w, hh, shape = 'bdx') => {
    const nw = w * 0.3, nh = hh * (shape === 'sek' ? 0.36 : 0.32), sh = hh * (shape === 'bdx' ? 0.12 : 0.22), cx = x + w / 2, top = yb - hh;
    const sx = shape === 'bdx' ? 0.6 : 0.85;
    return `M ${f2(x)} ${f2(yb)} L ${f2(x)} ${f2(top + nh + sh)} C ${f2(x)} ${f2(top + nh + sh * (1 - sx))} ${f2(cx - nw / 2)} ${f2(top + nh + sh * 0.25)} ${f2(cx - nw / 2)} ${f2(top + nh)} L ${f2(cx - nw / 2)} ${f2(top + 0.4)} L ${f2(cx - nw * 0.6)} ${f2(top + 0.4)} L ${f2(cx - nw * 0.6)} ${f2(top)} L ${f2(cx + nw * 0.6)} ${f2(top)} L ${f2(cx + nw * 0.6)} ${f2(top + 0.4)} L ${f2(cx + nw / 2)} ${f2(top + 0.4)} L ${f2(cx + nw / 2)} ${f2(top + nh)} C ${f2(cx + nw / 2)} ${f2(top + nh + sh * 0.25)} ${f2(x + w)} ${f2(top + nh + sh * (1 - sx))} ${f2(x + w)} ${f2(top + nh + sh)} L ${f2(x + w)} ${f2(yb)} Z`;
  };
  /** Rečová bublina so šípkou */
  const speech = (x, y, w, hh, fill, tail = 'left', o = {}) => {
    const tx = tail === 'left' ? x + w * 0.22 : x + w * 0.74, d = tail === 'left' ? -1 : 1;
    return [R(x, y, w, hh, fill, { rx: hh * 0.5, stroke: o.stroke, sw: o.sw, opacity: o.opacity ?? 1 }), P(`M ${f2(tx - 1.2)} ${f2(y + hh - 0.2)} L ${f2(tx + d * 1.6)} ${f2(y + hh + 2)} L ${f2(tx + 1.2)} ${f2(y + hh - 0.2)} Z`, { fill, opacity: o.opacity ?? 1 })];
  };
  /** Mušľový art-deco vzor (rady polkruhov) */
  const scallops = (x0, y0, x1, y1, r, col, sw = 0.14, op = 1) => { const out = []; let row = 0; for (let y = y0; y < y1 + r; y += r, row++) for (let x = x0 + (row % 2 ? r : 0); x < x1 + 2 * r; x += 2 * r) out.push(P(arcD(x, y, r, 180, 360), { stroke: col, sw, opacity: op })); return out; };
  /** Kávové zrnko */
  const bean = (x, y, s, a, col, crease, op = 1) => { const co = Math.cos(a), si = Math.sin(a), p = (dx, dy) => `${f2(x + dx * co - dy * si)} ${f2(y + dx * si + dy * co)}`; return [P(oval(x, y, s * 0.42, s * 0.6, a), { fill: col, opacity: op }), P(`M ${p(0, -s * 0.5)} C ${p(s * 0.18, -s * 0.2)} ${p(-s * 0.18, s * 0.2)} ${p(0, s * 0.5)}`, { stroke: crease, sw: Math.max(0.1, s * 0.07), opacity: op })]; };
  /** Dúha (oblúky) */
  const rainbow = (cx, cy, r, cols, sw) => cols.map((col, i) => P(arcD(cx, cy, r - i * sw, 180, 360), { stroke: col, sw: sw * 0.98 }));
  /** Oblak z kruhov */
  const cloud = (x, y, s, fill, stroke) => { const parts = [[0, 0, 0.5], [0.45, -0.22, 0.42], [0.9, 0.02, 0.36], [-0.42, 0.06, 0.34]]; const out = parts.map(([dx, dy, r]) => C(x + dx * s, y + dy * s, r * s, { fill, stroke, sw: 0.18 })); out.push(...parts.map(([dx, dy, r]) => C(x + dx * s, y + dy * s, r * s - 0.12, { fill }))); out.push(R(x - 0.7 * s, y + 0.05 * s, 1.85 * s, 0.35 * s, fill)); return out; };
  /** Paprsky slnka */
  const rays = (cx, cy, r0, r1, n, col, sw, a0 = 0, a1 = 360) => Array.from({ length: n }, (_, i) => { const a = rad(a0 + ((a1 - a0) * (i + 0.5)) / n); return Ln(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, col, sw); });
  /** Papraď: stonka a lístky (botanická rytina) */
  const fern = (x, y, len, ang, col, o = {}) => {
    const out = [], a = rad(ang), n = o.n || 14, bend = o.bend ?? 0.18;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, cx = (x + ex) / 2 - Math.sin(a) * len * bend, cy = (y + ey) / 2 + Math.cos(a) * len * bend;
    const pt = (t) => [(1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ey];
    const tan = (t) => Math.atan2(2 * (1 - t) * (cy - y) + 2 * t * (ey - cy), 2 * (1 - t) * (cx - x) + 2 * t * (ex - cx));
    out.push(P(`M ${f2(x)} ${f2(y)} Q ${f2(cx)} ${f2(cy)} ${f2(ex)} ${f2(ey)}`, { stroke: col, sw: o.sw || 0.24 }));
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), [px, py] = pt(t), ta = tan(t), L = len * 0.24 * (1 - t * 0.75) * (o.scale || 1);
      for (const side of [1, -1]) {
        const la = ta + side * 1.05;
        out.push(P(leaf(px, py, la, L, L * 0.26), { fill: col, opacity: o.fill ?? 0.18, stroke: col, sw: 0.1 }));
        out.push(Ln(px, py, px + Math.cos(la) * L * 0.85, py + Math.sin(la) * L * 0.85, col, 0.08));
      }
    }
    return out;
  };

  return tidy({
    // ------------------------------------------------------------ LABKA – veterinár: veľká labka v kruhu a stopy
    labka: {
      name: tr('Labka', 'Tlapka'), fonts: 'bricolage', pal: 'more', emblem: 'paw-print', tags: ['veterinar', 'zvierata', 'psy', 'macky', 'pes', 'strihanie psov', 'chovatelstvo', 'hotel pre psov', 'zdravie', 'jemne', 'priatelske', 'hrave', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F2F7F7'); const soft = mix(acc, bg, 0.82);
        const o = [];
        const cx = c.sq ? W * 0.68 : W * 0.76, cy = c.sq ? H * 0.3 : H * 0.48, r = c.sq ? 12 : 15;
        o.push(C(cx, cy, r, { fill: soft }));
        for (let i = 0; i < 4; i++) o.push(...paw(cx - r - 3 - i * 6.5, cy + r * 0.7 + (i % 2 ? 1.5 : -1.5) - i * 0.4, 2.6, acc, rad(-70), 0.18 + 0.06 * (3 - i)));
        o.push(...paw(cx, cy + 0.8, r * 0.95, acc, rad(-8)));
        o.push(P(heart(cx - 0.1, cy + r * 0.18, r * 0.18), { fill: bg }));
        const mw = c.sq ? W - 2 * m : W * 0.5, ty = c.sq ? H * 0.68 : H * 0.42;
        o.push(T(brand(c), { field: 'company', x: m, y: ty, oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', w: 700, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ty + 1.3, size: 1.95, font: 't', color: acc, fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 2.3, font: 'd', w: 700, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F2F7F7'); const bgb = deep(acc), wh = '#FFFFFF';
        const o = [], rnd = seeded(f.name + 'lb');
        for (let i = 0; i < 9; i++) o.push(...paw(rnd() * W, rnd() * H, 2.2 + rnd() * 1.6, wh, rnd() * 6, 0.09));
        const cx = c.sq ? W / 2 : m + 9, cy = c.sq ? H * 0.3 : H / 2;
        o.push(C(cx, cy, 8.4, { fill: wh }), emblem(c, cx, cy, 9, bgb));
        const tx = c.sq ? m : m + 21, mw = W - tx - m;
        o.push(T(f.name, { field: 'name', x: tx, y: c.sq ? H * 0.58 : m + 6, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', w: 700, color: wh, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: tx, y: (c.sq ? H * 0.58 : m + 6) + 1.2, size: 1.85, font: 't', color: mix(wh, bgb, 0.25), fit: mw }));
        o.push(...rows(c, { x: tx, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: wh, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ VOLANT – autoškola: kľukatá cesta so stredovou čiarou
    volant: {
      name: tr('Volant', 'Volant'), fonts: 'archivo', pal: 'navy', emblem: 'steering-wheel', tags: ['autoskola', 'vodicak', 'kurzy', 'doprava', 'auto', 'taxi', 'preprava', 'kamion', 'skola', 'odvazne', 'tmave', 'moderne', 'technicke'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = DB(pal, '#1E232B'); const road = mix(bg, '#FFFFFF', 0.1), edge = mix(bg, '#FFFFFF', 0.35);
        const o = [];
        const p0 = c.sq ? [W * 0.2, H + 4] : [W * 0.46, H + 4], p1 = c.sq ? [W * 0.9, H * 0.85] : [W * 0.98, H * 0.92], p2 = c.sq ? [W * 0.1, H * 0.4] : [W * 0.55, H * 0.2], p3 = c.sq ? [W + 4, H * 0.12] : [W + 4, -2];
        const d = `M ${f2(p0[0])} ${f2(p0[1])} C ${f2(p1[0])} ${f2(p1[1])} ${f2(p2[0])} ${f2(p2[1])} ${f2(p3[0])} ${f2(p3[1])}`;
        o.push(P(d, { stroke: edge, sw: c.sq ? 9.4 : 11 }), P(d, { stroke: road, sw: c.sq ? 8.4 : 10 }));
        o.push(...dashes(p0, p1, p2, p3, c.sq ? 10 : 12, acc, 0.5, 0.45));
        const mw = c.sq ? W - 2 * m : W * 0.46;
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + (c.sq ? 5.2 : 6), oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: mw, ls: 0.01 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.4 : 7.3), size: 1.9, font: 't', w: 600, color: acc, fit: mw }));
        o.push(R(m, H - m - 9.4, 7.2, 7.2, '#FFFFFF', { rx: 1 }), R(m + 0.5, H - m - 8.9, 6.2, 6.2, null, { stroke: '#D7263D', sw: 0.35, rx: 0.7 }), T('L', { x: m + 3.6, y: H - m - 5.6, ox: 'center', oy: 'center', size: 5, font: 'd', color: '#D7263D' }));
        if (!c.sq) o.push(T(f.phone || '', { field: 'phone', x: m + 9.6, y: H - m - 1.9, oy: 'bottom', size: 3.6, font: 'd', color: ink, fit: mw - 9.6 }), T(f.web || '', { field: 'web', x: m + 9.6, y: H - m - 1.4, size: 1.8, font: 't', color: mix(ink, bg, 0.3), fit: mw - 9.6 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = DB(pal, '#1E232B'); const lt = '#F4F1EA', dk = lum(ink) < 0.3 ? ink : bg;
        const o = [];
        const sq = 2.2, y0 = c.sq ? H - 7.2 : H - 6.4;
        for (let i = 0; i * sq < W + sq; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) o.push(R(i * sq - 1, y0 + j * sq, sq, sq, dk));
        o.push(R(-2, y0 - 0.6, W + 4, 0.6, acc));
        const cx = W - m - 7, cy = m + 7;
        o.push(C(cx, cy, 6.4, { stroke: dk, sw: 1.1 }), C(cx, cy, 1.9, { fill: dk }), Ln(cx - 6, cy + 0.6, cx - 1.9, cy, dk, 1), Ln(cx + 6, cy + 0.6, cx + 1.9, cy, dk, 1), Ln(cx, cy + 1.9, cx, cy + 6, dk, 1));
        const mw = W - 2 * m - 16;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: dk, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.2, size: 1.85, font: 't', w: 600, color: mix(acc, dk, 0.35), fit: mw }));
        o.push(...rows(c, { x: m, yb: y0 - 2.2, keys: c.sq ? ['phone', 'email'] : keys4(c), color: dk, fit: W - 2 * m, size: 1.8, lh: 2.65 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ ZÁHRADA – záhradník: vrstvené kopce, stromy a slnko
    zahrada: {
      name: tr('Záhrada', 'Zahrada'), fonts: 'fraunces', pal: 'salvia', emblem: 'plant', tags: ['zahradnik', 'zahrady', 'kosenie', 'trávnik', 'travnik', 'stromy', 'zelen', 'kvety', 'farma', 'priroda', 'eko', 'prirodne', 'jemne', 'svieze'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#EEF0E6'); const g1 = mix(acc, bg, 0.55), g2 = mix(acc, bg, 0.25), g3 = acc, g4 = mix(acc, '#0E1A10', 0.35);
        const o = [];
        const hy = c.sq ? H * 0.58 : H * 0.6;
        o.push(C(c.sq ? W * 0.78 : W * 0.84, hy - (c.sq ? 14 : 16), c.sq ? 3.4 : 4.2, { fill: mix('#E9A23B', bg, 0.25) }));
        o.push(...waveFill(W, H, hy, 2.2, 46, 0.6, g1), ...waveFill(W, H, hy + 4, 2, 38, 2.4, g2));
        const tree = (x, yb, s, col, kind) => kind === 'c' ? [R(x - 0.25, yb - s * 0.4, 0.5, s * 0.4, g4), P(oval(x, yb - s * 1.15, s * 0.32, s * 0.85), { fill: col })] : [R(x - 0.3, yb - s * 0.7, 0.6, s * 0.7, g4), C(x, yb - s * 1.15, s * 0.6, { fill: col }), C(x - s * 0.35, yb - s * 0.92, s * 0.38, { fill: col }), C(x + s * 0.38, yb - s * 0.95, s * 0.4, { fill: col })];
        const ts = c.sq ? [[W * 0.52, hy + 3.4, 5.5, 'r'], [W * 0.66, hy + 2.6, 6.2, 'c'], [W * 0.82, hy + 3.2, 7.4, 'r'], [W * 0.95, hy + 3.8, 5, 'c']] : [[W * 0.56, hy + 3.2, 5.8, 'r'], [W * 0.66, hy + 2.4, 7, 'c'], [W * 0.75, hy + 3, 8.2, 'r'], [W * 0.87, hy + 2.2, 6.4, 'c'], [W * 0.96, hy + 3.4, 6, 'r']];
        ts.forEach(([x, yb, s, k], i) => o.push(...tree(x, yb, s, i % 2 ? g3 : g4, k)));
        o.push(...waveFill(W, H, hy + 8.5, 1.6, 30, 1.2, g4));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: m + (c.sq ? 5 : 6), oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.2 : 7.3), size: 2.1, font: 'd', it: true, color: acc, fit: mw }));
        if (!c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: m + 14.4, oy: 'bottom', size: 2.2, font: 't', w: 600, color: ink, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#EEF0E6'); const dk = mix(acc, '#0E1A10', 0.55), lt = '#F3F1E8';
        const o = [], rnd = seeded(f.name + 'zl');
        for (let i = 0; i < 16; i++) { const x = rnd() * W, y = rnd() * H; if (x > m - 2 && x < W * 0.7 && y > m - 2 && y < H - m + 1) continue; o.push(P(leaf(x, y, rnd() * 6.3, 3 + rnd() * 3, 1), { fill: mix(acc, lt, 0.2), opacity: 0.35 })); }
        o.push(...sprig(W - m - 1, H - m + 2, c.sq ? 16 : 22, -120, { color: mix(acc, lt, 0.35), leaves: 8, size: 4 }));
        const mw = c.sq ? W - 2 * m : W * 0.6;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', color: lt, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.2, size: 2, font: 'd', it: true, color: mix(acc, lt, 0.5), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ TEHLA – stavebná firma / murár: tehlová stena a murárska lyžica
    tehla: {
      name: tr('Tehla', 'Cihla'), fonts: 'bebas', pal: 'terakota', emblem: 'hard-hat', tags: ['stavba', 'murar', 'stavebna firma', 'rekonstrukcie', 'zateplenie', 'obklady', 'remeslo', 'developer', 'strechy', 'odvazne', 'pevne', 'tradicne', 'teple'],
      front(c) {
        const { W, H, f, pal, m } = c; const base = lum(pal.bg) < 0.6 && lum(pal.bg) > 0.05 ? pal.bg : '#B5533A', ink = '#FFF4EA', mortar = mix(base, '#FFF4EA', 0.45);
        const o = [], rnd = seeded(f.name + 'th'), bw = 7, bh = 3.2;
        const x0 = c.sq ? -1 : W * 0.5, y0 = c.sq ? H * 0.52 : -1;
        o.push(R(x0, y0, W - x0 + 2, H - y0 + 2, mortar));
        for (let r = 0; y0 + r * bh < H + 2; r++) for (let k = -1; x0 + k * bw < W + 2; k++) { const x = x0 + k * bw + (r % 2 ? bw / 2 : 0); o.push(R(x + 0.3, y0 + r * bh + 0.3, bw - 0.6, bh - 0.6, mix(base, rnd() < 0.5 ? '#000000' : '#FFFFFF', rnd() * 0.16), { rx: 0.2 })); }
        o.push(R(x0 - 0.6, y0 - 0.6, c.sq ? W + 4 : 1.2, c.sq ? 1.2 : H + 4, mix(base, '#000000', 0.25)));
        if (!c.sq) { const tx = W * 0.6, ty = H * 0.62; o.push(P(`M ${f2(tx + 0.8)} ${f2(ty + 0.9)} L ${f2(tx + 11.8)} ${f2(ty - 5.1)} L ${f2(tx + 15.8)} ${f2(ty + 1.9)} L ${f2(tx + 6.8)} ${f2(ty + 4.4)} Z`, { fill: '#000000', opacity: 0.25 }), P(`M ${f2(tx)} ${f2(ty)} L ${f2(tx + 11)} ${f2(ty - 6)} L ${f2(tx + 15)} ${f2(ty + 1)} L ${f2(tx + 6)} ${f2(ty + 3.5)} Z`, { fill: { grad: ['#F1F3F5', '#B9BFC6', '#E3E6E9'], angle: 30 } }), P(`M ${f2(tx)} ${f2(ty)} L ${f2(tx + 11)} ${f2(ty - 6)}`, { stroke: '#FFFFFF', sw: 0.2 }), P(`M ${f2(tx + 10.6)} ${f2(ty - 2.4)} L ${f2(tx + 13.2)} ${f2(ty - 6.4)} L ${f2(tx + 15.2)} ${f2(ty - 6.6)}`, { stroke: '#6B7178', sw: 0.6 }), R(tx + 14.6, ty - 9.4, 7, 2.6, '#7A4E30', { rx: 1.3, rot: -24 }), R(tx + 15.6, ty - 9, 4.4, 0.5, '#FFFFFF', { rx: 0.25, rot: -24, opacity: 0.25 })); }
        const mw = c.sq ? W - 2 * m : W * 0.4;
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + (c.sq ? 7.4 : 9.4), oy: 'bottom', size: c.sq ? 7.2 : 9, font: 'd', color: ink, fit: mw, ls: 0.01 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 8.6 : 10.8), size: 1.95, font: 't', w: 600, color: mix(ink, base, 0.2), fit: mw }));
        if (!c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 4, font: 'd', color: ink, fit: mw, ls: 0.03 }));
        return { bg: { color: base }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const base = lum(pal.bg) < 0.6 && lum(pal.bg) > 0.05 ? pal.bg : '#B5533A', lt = '#F5EEE6', dk = '#2A1A12';
        const o = [], bw = 7, bh = 3.2, rnd = seeded(f.name + 'tb');
        for (let r = 0; r < 2; r++) for (let k = -1; k * bw < W + 2; k++) o.push(R(k * bw + (r % 2 ? bw / 2 : 0) + 0.3, -1 + r * bh + 0.3, bw - 0.6, bh - 0.6, mix(base, '#000000', rnd() * 0.15), { rx: 0.2 }));
        o.push(emblem(c, W - m - 4.5, m + 9.5, 7, base));
        const mw = W - 2 * m - 10;
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + 10.4, oy: 'bottom', size: c.sq ? 4.4 : 5.2, font: 'd', color: dk, fit: mw, ls: 0.02 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 11.6, size: 1.85, font: 't', w: 600, color: base, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: dk, fit: W - 2 * m, size: 1.8, lh: 2.7 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ VALČEK – maliar izieb: ťah valčekom a vzorkovník farieb
    valcek: {
      name: tr('Valček', 'Váleček'), fonts: 'poppins', pal: 'koral', emblem: 'paint-brush', tags: ['maliar', 'malir', 'natierac', 'interier', 'tapety', 'stierky', 'rekonstrukcie', 'remeslo', 'farby', 'farebne', 'hrave', 'moderne', 'svieze'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FFF8F2');
        const o = [], rnd = seeded(f.name + 'vk');
        const y = c.sq ? H * 0.16 : H * 0.2, bh = c.sq ? 9 : 11, x0 = c.sq ? W * 0.34 : W * 0.5, x1 = W + 3;
        const top = [], bot = [];
        for (let x = x0; x <= x1; x += 2) { top.push([x, y + (rnd() - 0.5) * 0.5]); bot.push([x, y + bh + (rnd() - 0.5) * 0.5]); }
        const left = [[x0, y], [x0 - 0.8, y + bh * 0.3], [x0 + 0.4, y + bh * 0.55], [x0 - 0.6, y + bh * 0.8], [x0, y + bh]];
        o.push(P(smooth(top) + ` L ${f2(x1)} ${f2(y + bh)} ` + bot.reverse().map(([a, b]) => `L ${f2(a)} ${f2(b)}`).join(' ') + ' ' + left.reverse().map(([a, b]) => `L ${f2(a)} ${f2(b)}`).join(' ') + ' Z', { fill: acc }));
        for (let i = 0; i < 6; i++) o.push(Ln(x0 + 2 + rnd() * (x1 - x0 - 4), y + 1 + rnd() * (bh - 2), x0 + 6 + rnd() * (x1 - x0 - 8), y + 1 + rnd() * (bh - 2), mix(acc, '#FFFFFF', 0.25), 0.2, { opacity: 0.6 }));
        const rx = x0 - 1.6, ry = y - 0.8;
        o.push(R(rx - 3.4, ry, 3.4, bh + 1.6, mix(acc, '#000000', 0.12), { rx: 1 }), R(rx - 3, ry + 0.4, 0.8, bh + 0.8, '#FFFFFF', { rx: 0.4, opacity: 0.35 }));
        o.push(P(`M ${f2(rx - 1.7)} ${f2(ry)} L ${f2(rx - 1.7)} ${f2(ry - 1.8)} L ${f2(rx - 7.5)} ${f2(ry - 1.8)} L ${f2(rx - 7.5)} ${f2(ry + 2.4)}`, { stroke: '#4A4F57', sw: 0.5 }), R(rx - 8.6, ry + 2.4, 2.2, c.sq ? 5.4 : 6.4, ink, { rx: 1 }));
        const sw = c.sq ? 5 : 6.2, cols = [mix(acc, '#FFFFFF', 0.55), '#2E5AA8', '#F2B705', '#5E7D5A'];
        if (!c.sq) cols.forEach((col, i) => o.push(R(W - m - (4 - i) * (sw + 1) + 1, H - m - sw, sw, sw, col, { rx: 0.8 })));
        const mw = c.sq ? W - 2 * m : W * 0.38, ty = c.sq ? H * 0.68 : H * 0.62;
        o.push(T(brand(c), { field: 'company', x: m, y: ty, oy: 'bottom', size: c.sq ? 4.4 : 5, font: 'd', w: 700, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ty + 1.2, size: 1.9, font: 't', color: mix(ink, bg, 0.25), fit: mw }));
        o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: c.sq ? 2.3 : 2.6, font: 'd', w: 600, color: acc, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FFF8F2');
        const o = [], cols = [acc, mix(acc, '#FFFFFF', 0.45), '#2E5AA8', '#F2B705', '#5E7D5A', ink];
        const cw = c.sq ? 9 : 11, x = W - cw - 3;
        cols.forEach((col, i) => { const ch = H / cols.length; o.push(R(x, i * ch - 0.01, cw + 4, ch + 0.02, col)); });
        o.push(R(x - 0.5, -1, 0.5, H + 2, '#FFFFFF'));
        const mw = x - m - 3;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.2 : 4, font: 'd', w: 700, color: ink, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.2, size: 1.85, font: 't', color: acc, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ KOMÍN – kominár: strechy v noci, dym a hviezdy pre šťastie
    komin: {
      name: tr('Komín', 'Komín'), fonts: 'dmserif', pal: 'noblesa', emblem: 'house-simple', tags: ['kominar', 'komin', 'kurenie', 'kotle', 'krby', 'strechy', 'klampiar', 'remeslo', 'servis', 'stastie', 'tradicne', 'tmave', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = DB(pal, '#14213D'); const g = G(pal), roof = mix(bg, '#FFFFFF', 0.1), roof2 = mix(bg, '#FFFFFF', 0.2);
        const o = [], rnd = seeded(f.name + 'km');
        for (let i = 0; i < 18; i++) { const x = rnd() * W, y = rnd() * H * 0.5; if (x < W * 0.55 && y < m + 12) continue; o.push(C(x, y, 0.12 + rnd() * 0.22, { fill: ink, opacity: 0.5 + rnd() * 0.5 })); }
        o.push(C(W - m - 3, m + 3.6, 3, { fill: g }), C(W - m - 1.7, m + 2.8, 2.7, { fill: bg }));
        const by = c.sq ? H * 0.72 : H * 0.7;
        const houses = c.sq ? [[-2, 14, 6], [12, 12, 8], [24, 16, 5], [40, 13, 7]] : [[-2, 15, 7], [13, 13, 9], [26, 17, 6], [43, 14, 8], [57, 18, 6], [75, 16, 8]];
        houses.forEach(([x, w, hh], i) => {
          const yb = by + (i % 2 ? 1.5 : 0), col = i % 2 ? roof2 : roof;
          o.push(R(x + w * 0.62, yb - hh - 4.4, 2, 4.6, col), R(x + w * 0.62 - 0.4, yb - hh - 4.8, 2.8, 0.8, col));
          if (i === 2 || i === 4) o.push(P(smooth([[x + w * 0.62 + 1, yb - hh - 5], [x + w * 0.62 + 0.2, yb - hh - 7], [x + w * 0.62 + 2.4, yb - hh - 9.2], [x + w * 0.62 + 1, yb - hh - 11.5], [x + w * 0.62 + 3.6, yb - hh - 13.8]]), { stroke: ink, sw: 0.5, opacity: 0.35 }));
          o.push(P(`M ${f2(x)} ${f2(yb)} L ${f2(x)} ${f2(yb - hh * 0.55)} L ${f2(x + w / 2)} ${f2(yb - hh)} L ${f2(x + w)} ${f2(yb - hh * 0.55)} L ${f2(x + w)} ${f2(yb)} Z`, { fill: col }));
          if (i % 2 === 0) o.push(R(x + w / 2 - 0.9, yb - hh * 0.45, 1.8, 2.2, g, { opacity: 0.85 }));
        });
        o.push(R(-2, by + 1, W + 4, H, mix(bg, '#000000', 0.35)));
        const mw = c.sq ? W - 2 * m : W * 0.56;
        o.push(T(brand(c), { field: 'company', x: m, y: m + (c.sq ? 5 : 6), oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.2 : 7.3), size: 1.95, font: 't', color: g, fit: mw, w: 500 }));
        o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m + 0.4, oy: 'bottom', size: 2.4, font: 't', w: 600, color: ink, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, acc } = DB(pal, '#14213D'); const lt = '#F4EFE6', g = G(pal), met = pal.foil ? MET(pal) : acc;
        const o = [paper(c, 0.4)];
        const r = c.sq ? 9.5 : 11, cx = c.sq ? W / 2 : m + r + 0.5, cy = c.sq ? m + r + 0.5 : H / 2;
        o.push(C(cx, cy, r, { stroke: g, sw: 0.3 }), C(cx, cy, r - 3.4, { stroke: met, sw: 0.12 }));
        o.push(...ringText(tr('PRE ŠŤASTIE', 'PRO ŠTĚSTÍ'), cx, cy, r - 1.7, 215, 325, { color: bg, size: 1.8, w: 600 }));
        o.push(emblem(c, cx, cy + 0.6, r * 0.8, bg));
        const tx = c.sq ? m : cx + r + 4, mw = W - tx - m;
        o.push(T(f.name, { field: 'name', x: tx, y: c.sq ? H * 0.66 : m + 6, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: bg, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: tx, y: (c.sq ? H * 0.66 : m + 6) + 1.2, size: 1.85, font: 't', color: met, fit: mw, w: 500 }));
        o.push(...rows(c, { x: tx, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: bg, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ NÁPRSTOK – krajčírka: meter, ihla s niťou a gombíky
    naprstok: {
      name: tr('Náprstok', 'Náprstek'), fonts: 'playfair', pal: 'ruza', emblem: 'needle', tags: ['krajcirka', 'krajcir', 'sitie', 'opravy odevov', 'svadobne saty', 'moda', 'atelier', 'textil', 'zakazkove', 'jemne', 'elegantne', 'zenske', 'remeslo'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F6EAE5'); const tape = '#F2C94C', tapeD = mix('#F2C94C', '#7A5A10', 0.5);
        const o = [paper(c, 0.35)];
        const p0 = c.sq ? [W * 0.3, -3] : [W * 0.56, -3], p1 = c.sq ? [W * 1.1, H * 0.2] : [W * 1.05, H * 0.25], p2 = c.sq ? [W * 0.4, H * 0.45] : [W * 0.5, H * 0.55], p3 = c.sq ? [W + 3, H * 0.62] : [W + 3, H + 2];
        const tw = c.sq ? 3.6 : 4.4, N = 46, top = [], bot = [];
        for (let i = 0; i <= N; i++) { const t = i / N, a = cub(p0, p1, p2, p3, t), b = cub(p0, p1, p2, p3, Math.min(1, t + 0.001)); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; top.push([a[0] + Math.cos(ang) * tw / 2, a[1] + Math.sin(ang) * tw / 2, ang]); bot.push([a[0] - Math.cos(ang) * tw / 2, a[1] - Math.sin(ang) * tw / 2]); }
        o.push(P(smooth(top.map(([x, y]) => [x, y])) + ' L ' + bot.reverse().map(([x, y]) => `${f2(x)} ${f2(y)}`).join(' L ') + ' Z', { fill: tape }));
        top.forEach(([x, y, ang], i) => { if (i % 1 === 0 && i > 0 && i < N) { const L = i % 5 === 0 ? tw * 0.5 : tw * 0.26; o.push(Ln(x, y, x - Math.cos(ang) * L, y - Math.sin(ang) * L, tapeD, 0.12)); } });
        const nx = c.sq ? W * 0.62 : W * 0.68, ny = c.sq ? H * 0.42 : H * 0.42;
        o.push(P(smooth([[nx + 6, ny - 6], [nx + 2, ny - 1], [nx - 4, ny + 1], [nx - 2, ny + 6], [nx + 3, ny + 4.5], [nx + 1.5, ny + 1], [nx - 6, ny + 3]]), { stroke: acc, sw: 0.24 }));
        o.push(Ln(nx + 4.4, ny - 8.6, nx + 9.6, ny - 0.2, '#8A8F96', 0.42), P(oval(nx + 5.1, ny - 7.4, 0.32, 0.9, rad(-30)), { stroke: '#8A8F96', sw: 0.16 }));
        const btn = (x, y, r, col) => [C(x, y, r, { fill: col }), C(x, y, r * 0.78, { stroke: mix(col, '#000000', 0.2), sw: 0.12 }), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => C(x + a * r * 0.24, y + b * r * 0.24, r * 0.1, { fill: mix(col, '#000000', 0.35) }))];
        o.push(...btn(c.sq ? W * 0.84 : W * 0.86, c.sq ? H * 0.72 : H * 0.8, 2.4, acc), ...btn(c.sq ? W * 0.68 : W * 0.76, c.sq ? H * 0.82 : H * 0.9, 1.6, ink));
        const mw = c.sq ? W * 0.56 : W * 0.48, ty = c.sq ? H * 0.62 : H * 0.44;
        o.push(T(f.name, { field: 'name', x: m, y: ty, oy: 'bottom', size: c.sq ? 3.8 : 4.8, font: 'd', it: true, color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: ty + 1.4, size: 1.75, font: 't', w: 600, ls: 0.2, color: acc, fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 2.1, font: 't', w: 600, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F6EAE5'); const dk = lum(pal.ink) < 0.15 ? pal.ink : '#3A2321', lt = '#F6EAE5';
        const o = [...stitch(3.2, 3.2, W - 6.4, H - 6.4, mix(acc, lt, 0.3), 1.5, 0.18)];
        o.push(emblem(c, W / 2, c.sq ? H * 0.28 : H * 0.3, c.sq ? 7 : 8, mix(acc, lt, 0.35)));
        o.push(T(brand(c), { field: 'company', x: W / 2, y: c.sq ? H * 0.52 : H * 0.56, ox: 'center', oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', it: true, color: lt, fit: W - 2 * m - 2 }));
        o.push(...centerLines(c, W / 2, H - m - 1.4, { color: mix(lt, dk, 0.15), fit: W - 2 * m - 2, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ SVETLO – produktový fotograf: kužeľ svetla na produkt v štúdiu
    svetlo: {
      name: tr('Svetlo', 'Světlo'), fonts: 'grotesk', pal: 'grafit', emblem: 'aperture', tags: ['foto', 'fotograf', 'produktova fotografia', 'eshop', 'reklama', 'studio', 'video', 'kreativ', 'agentura', 'moderne', 'tmave', 'minimal', 'technicke'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = DB(pal, '#141518');
        const o = [];
        const cx = c.sq ? W * 0.66 : W * 0.74, fy = c.sq ? H * 0.66 : H * 0.72;
        o.push(P(`M ${f2(cx - 2)} -2 L ${f2(cx + 2)} -2 L ${f2(cx + 14)} ${f2(fy + 2)} L ${f2(cx - 14)} ${f2(fy + 2)} Z`, { fill: { grad: ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.0)'], angle: 90 } }));
        o.push(P(oval(cx, fy + 1.4, 13, 2.6), { fill: { grad: ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)'], radial: true } }));
        o.push(P(oval(cx + 1.2, fy + 0.4, 5.2, 0.9), { fill: '#000000', opacity: 0.55 }));
        const bw = c.sq ? 7 : 8.4, bh = c.sq ? 10 : 12, bx = cx - bw / 2, byy = fy - bh;
        o.push(R(bx, byy, bw, bh, { grad: [mix(acc, '#FFFFFF', 0.25), acc, mix(acc, '#000000', 0.45)], angle: 0 }, { rx: 1.4 }));
        o.push(R(bx + bw * 0.16, byy + 1, bw * 0.12, bh - 2, '#FFFFFF', { rx: 0.4, opacity: 0.45 }));
        o.push(R(cx - bw * 0.2, byy - 1.4, bw * 0.4, 1.6, mix(acc, '#000000', 0.3)), R(cx - bw * 0.32, byy - 4.6, bw * 0.64, 3.4, '#E8E6E1', { rx: 0.6 }), R(cx - bw * 0.26, byy - 4.2, bw * 0.12, 2.6, '#FFFFFF', { rx: 0.3, opacity: 0.8 }));
        o.push(R(bx + 1, byy + bh * 0.42, bw - 2, bh * 0.26, '#F4F1EA', { opacity: 0.92 }), T(mono(c), { x: cx, y: byy + bh * 0.55, ox: 'center', oy: 'center', size: c.sq ? 1.8 : 2, font: 'd', w: 600, color: bg, ls: 0.1 }));
        const mw = c.sq ? W * 0.44 : W * 0.48;
        o.push(T(f.name, { field: 'name', x: m, y: m + (c.sq ? 4.6 : 5.6), oy: 'bottom', size: c.sq ? 3.6 : 4.6, font: 'd', w: 600, color: ink, fit: c.sq ? W - 2 * m : mw, ls: -0.02 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + (c.sq ? 5.8 : 6.9), size: 1.75, font: 't', w: 600, ls: 0.18, color: acc, fit: c.sq ? W - 2 * m : mw }));
        if (c.sq) o.push(T(f.web || f.phone || '', { field: f.web ? 'web' : 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', color: mix(ink, bg, 0.2), fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: mix(ink, bg, 0.12), fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, acc } = DB(pal, '#141518'); const ink = '#1C1D20';
        const o = [];
        o.push(R(-2, -2, W + 4, H + 4, { grad: ['#F2F1EE', '#D9D7D2'], angle: 90 }));
        o.push(P(`M -2 ${f2(H * 0.62)} Q ${f2(W / 2)} ${f2(H * 0.7)} ${f2(W + 2)} ${f2(H * 0.62)} L ${f2(W + 2)} ${f2(H + 2)} L -2 ${f2(H + 2)} Z`, { fill: '#CFCDC7', opacity: 0.6 }));
        for (const k of [1, 2]) { o.push(Ln((W * k) / 3, 3, (W * k) / 3, H - 3, ink, 0.08, { opacity: 0.25 }), Ln(3, (H * k) / 3, W - 3, (H * k) / 3, ink, 0.08, { opacity: 0.25 })); }
        const cm = (x, y, sx, sy) => [Ln(x, y, x + sx * 3, y, ink, 0.18), Ln(x, y, x, y + sy * 3, ink, 0.18)];
        o.push(...cm(2.6, 2.6, 1, 1), ...cm(W - 2.6, 2.6, -1, 1), ...cm(2.6, H - 2.6, 1, -1), ...cm(W - 2.6, H - 2.6, -1, -1));
        o.push(C(W - m - 2.4, m + 1.8, 1.1, { fill: '#E5484D' }), T('REC', { x: W - m - 4.2, y: m + 1.8, ox: 'right', oy: 'center', size: 1.7, font: 't', w: 600, color: ink, ls: 0.12 }));
        o.push(T(brand(c), { field: 'company', x: m, y: m + 5.4, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', w: 600, color: ink, fit: W - 2 * m - 12, ls: -0.02 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: ink, fit: W - 2 * m, size: 1.8, lh: 2.7 }));
        return { bg: { color: '#E8E6E1' }, objs: o };
      },
    },

    // ------------------------------------------------------------ VINYL – DJ / hudobník: platňa vychádzajúca z okraja a vlna zvuku
    vinyl: {
      name: 'Vinyl', fonts: 'unbounded', pal: 'limetka', emblem: 'music-notes', tags: ['dj', 'hudba', 'hudobnik', 'kapela', 'spevak', 'eventy', 'svadba', 'party', 'studio', 'zvuk', 'odvazne', 'tmave', 'mlade', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = DB(pal, '#121411');
        const o = [];
        const r = c.sq ? 17 : 21, cx = c.sq ? W - 2 : W - 5, cy = c.sq ? H * 0.34 : H / 2;
        o.push(C(cx, cy, r, { fill: '#0A0A0A' }));
        for (let k = 0; k < 14; k++) o.push(C(cx, cy, r - 1.4 - k * 1.05, { stroke: '#FFFFFF', sw: 0.06, opacity: k % 3 ? 0.08 : 0.16 }));
        o.push(P(arcD(cx, cy, r - 3, 150, 205), { stroke: '#FFFFFF', sw: 1.6, opacity: 0.07 }));
        o.push(C(cx, cy, r * 0.32, { fill: acc }), C(cx, cy, 0.7, { fill: bg }));
        o.push(T('A', { x: cx - r * 0.17, y: cy, ox: 'center', oy: 'center', size: 2.2, font: 'd', w: 700, color: on(acc) }), C(cx, cy, r * 0.25, { stroke: on(acc), sw: 0.08, opacity: 0.5 }));
        const rnd = seeded(f.name + 'wv'), n = c.sq ? 22 : 30, x0 = m, bw = (c.sq ? W * 0.5 : W * 0.52) / n, yb = c.sq ? H - m - 5 : H - m - 5.2;
        for (let i = 0; i < n; i++) { const hh = 0.6 + Math.abs(Math.sin(i * 0.55 + rnd() * 1.2)) * (c.sq ? 4 : 5.4) * (0.4 + rnd() * 0.6); o.push(R(x0 + i * bw, yb - hh / 2 - 1.6, bw * 0.55, hh, i < n * 0.6 ? acc : mix(ink, bg, 0.6), { rx: bw * 0.27 })); }
        const mw = c.sq ? W * 0.56 : W * 0.5;
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + (c.sq ? 5 : 6), oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', w: 700, color: ink, fit: mw, ls: 0.01 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + (c.sq ? 6.2 : 7.3), size: 1.9, font: 't', w: 500, color: acc, fit: mw }));
        o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 600, color: ink, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, acc } = DB(pal, '#121411'); const dk = lum(acc) > 0.4 ? '#121411' : '#FFFFFF';
        const o = [], rnd = seeded(f.name + 'eq'), n = 22, bw = (W + 2) / n;
        for (let i = 0; i < n; i++) { const hh = 4 + rnd() * (H * 0.55); o.push(R(-1 + i * bw + bw * 0.2, H - hh + 1, bw * 0.6, hh, dk, { opacity: 0.08, rx: 0.4 })); }
        const mw = W - 2 * m;
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 5.4, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', w: 700, color: dk, fit: mw }));
        o.push(T(f.tagline || '', { field: 'tagline', x: m, y: m + 6.6, size: 1.9, font: 't', w: 500, color: dk, opacity: 0.8, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: dk, fit: mw, size: 1.8, lh: 2.7, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ LINGUA – lektor jazykov: rečové bubliny s pozdravmi
    lingua: {
      name: 'Lingua', fonts: 'outfit', pal: 'indigo', emblem: 'globe', tags: ['lektor', 'jazyky', 'anglictina', 'nemcina', 'preklady', 'tlmocnik', 'jazykova skola', 'doucovanie', 'skola', 'vzdelavanie', 'priatelske', 'moderne', 'farebne', 'hrave'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FFFFFF'); const soft = mix(acc, bg, 0.85), mid = mix(acc, bg, 0.45);
        const o = [];
        const words = c.sq ? [['Hello!', acc, '#FFFFFF', 'left'], ['Hola', soft, ink, 'right'], ['Ciao', '#F2B705', ink, 'left']] : [['Hello!', acc, '#FFFFFF', 'left'], ['Hola', soft, ink, 'right'], ['Bonjour', mid, '#FFFFFF', 'left'], ['Hallo', '#F2B705', ink, 'right'], ['Ciao', soft, ink, 'left']];
        const pos = c.sq ? [[W * 0.36, H * 0.1, 15], [W * 0.66, H * 0.26, 11], [W * 0.5, H * 0.42, 10]] : [[W * 0.52, H * 0.12, 15], [W * 0.78, H * 0.2, 11.5], [W * 0.56, H * 0.42, 17], [W * 0.82, H * 0.56, 11], [W * 0.62, H * 0.72, 10]];
        words.forEach(([t, fill, col, tail], i) => { const [x, y, w] = pos[i], hh = 5.6; o.push(...speech(x, y, w, hh, fill, tail)); o.push(T(t, { x: x + w / 2, y: y + hh / 2 + 0.1, ox: 'center', oy: 'center', size: 2.4, font: 'd', w: 600, color: col })); });
        const mw = c.sq ? W - 2 * m : W * 0.42, ty = c.sq ? H * 0.74 : H * 0.42;
        o.push(T(f.name, { field: 'name', x: m, y: ty, oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: ty + 1.2, size: 1.9, font: 't', color: acc, fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 600, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#FFFFFF'); const bgb = deep(acc), wh = '#FFFFFF';
        const o = [T('“', { x: W - m + 1, y: m - 3, ox: 'right', size: c.sq ? 22 : 26, font: 'd', w: 700, color: wh, opacity: 0.16 })];
        const mw = W - 2 * m;
        o.push(T(f.tagline || brand(c), { field: 'tagline', x: m, y: m + 6, oy: 'bottom', size: c.sq ? 3 : 3.6, font: 'd', w: 600, color: wh, fit: mw - 6 }));
        o.push(T(brand(c), { field: 'company', x: m, y: m + 7.4, size: 1.85, font: 't', color: mix(wh, bgb, 0.3), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: wh, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ TABUĽA – doučovanie: školská tabuľa s kriedovými vzorcami
    tabula: {
      name: tr('Tabuľa', 'Tabule'), fonts: 'caveat', pal: 'smaragd', emblem: 'graduation-cap', tags: ['doucovanie', 'matematika', 'skola', 'ucitel', 'lektor', 'prijmacky', 'maturita', 'vzdelavanie', 'deti', 'kurzy', 'hrave', 'priatelske', 'tradicne'],
      front(c) {
        const { W, H, f, pal, m } = c; const board = lum(pal.bg) < 0.25 ? pal.bg : '#24443A', chalk = '#F2F0E6', yel = lum(pal.accent) > 0.35 ? pal.accent : '#F2D46B';
        const o = [], rnd = seeded(f.name + 'tb');
        for (let i = 0; i < 6; i++) o.push(P(oval(rnd() * W, rnd() * H, 6 + rnd() * 10, 2 + rnd() * 3, rnd() * 3), { fill: '#FFFFFF', opacity: 0.035 }));
        o.push(R(-2, -2, W + 4, 3.4, '#8A5A34'), R(-2, H - 1.4, W + 4, 3.4, '#8A5A34'), R(-2, 1.2, W + 4, 0.4, '#5E3A20', { opacity: 0.6 }));
        const fx = c.sq ? W * 0.58 : W * 0.6;
        const formulas = c.sq ? [['a² + b² = c²', fx - 4, H * 0.62, -4], ['π ≈ 3,14', fx + 4, H * 0.8, 3]] : [['a² + b² = c²', fx, H * 0.3, -4], ['√16 = 4', fx + 14, H * 0.52, 3], ['π ≈ 3,14', fx + 1, H * 0.7, -2]];
        formulas.forEach(([t, x, y, r]) => o.push(T(t, { x, y, oy: 'center', size: c.sq ? 2.6 : 3, font: 'Caveat', w: 500, color: chalk, opacity: 0.85, rot: r })));
        const tx = c.sq ? W * 0.78 : W * 0.86, ty = c.sq ? H * 0.2 : H * 0.36;
        o.push(P(`M ${f2(tx - 5)} ${f2(ty + 4)} L ${f2(tx + 4)} ${f2(ty + 4)} L ${f2(tx - 5)} ${f2(ty - 4)} Z`, { stroke: chalk, sw: 0.24, opacity: 0.8 }), R(tx - 5, ty + 2.6, 1.4, 1.4, null, { stroke: chalk, sw: 0.14, opacity: 0.7 }));
        const mw = c.sq ? W - 2 * m : W * 0.46, ny = c.sq ? H * 0.46 : H * 0.54;
        o.push(T(f.name, { field: 'name', x: m, y: ny, oy: 'bottom', size: c.sq ? 5.4 : 6.6, font: 'd', color: chalk, fit: mw }));
        o.push(P(smooth([[m, ny + 0.9], [m + mw * 0.35, ny + 1.5], [m + mw * 0.7, ny + 0.7]]), { stroke: yel, sw: 0.35, opacity: 0.9 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: ny + 2.6, size: 2.1, font: 't', color: yel, fit: mw }));
        if (!c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m - 0.4, oy: 'bottom', size: 2.2, font: 't', w: 600, color: chalk, fit: mw }));
        else o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m - 0.6, oy: 'bottom', size: 1.9, font: 't', w: 600, color: chalk, fit: W * 0.4 }));
        return { bg: { color: board }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const lt = '#FBFAF4', line = '#A8C4E6', red = '#E07A7A', ink = '#22324A';
        const o = [];
        for (let y = 7; y < H; y += 3.2) o.push(Ln(-2, y, W + 2, y, line, 0.12, { opacity: 0.7 }));
        o.push(Ln(m + 1.2, -2, m + 1.2, H + 2, red, 0.2));
        const x = m + 3.4, mw = W - x - m;
        o.push(T(f.name, { field: 'name', x, y: 7 + 3.2 * 1 - 0.3, oy: 'bottom', size: c.sq ? 4.4 : 5, font: 'Caveat', w: 600, color: ink, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x, y: 7 + 3.2 * 2 - 0.4, oy: 'bottom', size: 1.9, font: 't', color: mix(ink, lt, 0.25), fit: mw }));
        o.push(...rows(c, { x, yb: 7 + 3.2 * (c.sq ? 13 : 12) - 0.4 > H - m ? H - m : 7 + 3.2 * (c.sq ? 13 : 12) - 0.4, keys: keys4(c), color: ink, fit: mw, size: 1.85, lh: 3.2 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ VILA – luxusné reality: klasicistická fasáda vo fólii
    vila: {
      name: tr('Vila', 'Vila'), fonts: 'cinzel', pal: 'noblesa', emblem: 'key', tags: ['reality', 'makler', 'luxus', 'developer', 'vila', 'architekt', 'hotel', 'investicie', 'prestiz', 'elegantne', 'luxusne', 'tmave', 'tradicne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = DB(pal, '#14213D'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [];
        const cx = W / 2, w = c.sq ? 26 : 30, base = c.sq ? H * 0.5 : H * 0.54, hh = c.sq ? 15 : 17, x0 = cx - w / 2;
        o.push(P(`M ${f2(x0 - 1.4)} ${f2(base - hh + 3.6)} L ${f2(cx)} ${f2(base - hh - 1.4)} L ${f2(x0 + w + 1.4)} ${f2(base - hh + 3.6)} Z`, { stroke: g, sw: 0.28 }));
        o.push(P(`M ${f2(x0 + 1.6)} ${f2(base - hh + 2.9)} L ${f2(cx)} ${f2(base - hh + 0.2)} L ${f2(x0 + w - 1.6)} ${f2(base - hh + 2.9)} Z`, { stroke: met, sw: 0.12 }));
        o.push(C(cx, base - hh + 1.9, 0.6, { stroke: met, sw: 0.12 }));
        o.push(Ln(x0 - 1.4, base - hh + 4.2, x0 + w + 1.4, base - hh + 4.2, g, 0.22));
        const cols = 6, cg = w / (cols - 1);
        for (let i = 0; i < cols; i++) { const x = x0 + i * cg; o.push(Ln(x, base - hh + 4.6, x, base - 1.6, g, 0.42), Ln(x - 0.7, base - hh + 4.7, x + 0.7, base - hh + 4.7, g, 0.2), Ln(x - 0.7, base - 1.6, x + 0.7, base - 1.6, g, 0.2)); }
        for (let i = 0; i < cols - 1; i++) { const x = x0 + i * cg + cg / 2; if (i === Math.floor((cols - 1) / 2)) { o.push(P(arch(x - 1.5, base - 1.6, 3, base - hh + 7.4), { stroke: met, sw: 0.14 })); } else { o.push(P(arch(x - 1.1, base - hh + 11.4, 2.2, base - hh + 7.2), { stroke: met, sw: 0.12 })); } }
        for (let k = 0; k < 3; k++) o.push(Ln(x0 - 1.4 - k * 1.2, base - 1 + k * 0.7, x0 + w + 1.4 + k * 1.2, base - 1 + k * 0.7, g, 0.18));
        const ny = c.sq ? H * 0.72 : H * 0.76;
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: cx, y: ny, ox: 'center', oy: 'bottom', size: c.sq ? 3.2 : 3.6, font: 'd', color: ink, fit: W - 2 * m, ls: 0.14 }));
        o.push(T(f.role || '', { field: 'role', x: cx, y: ny + 1.2, ox: 'center', size: 1.85, font: 't', color: met, fit: W - 2 * m, ls: 0.06 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg } = DB(pal, '#14213D'); const lt = '#F4EFE6', g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [paper(c, 0.35), R(3, 3, W - 6, H - 6, null, { stroke: g, sw: 0.2 }), R(3.8, 3.8, W - 7.6, H - 7.6, null, { stroke: met, sw: 0.08 })];
        o.push(emblem(c, W / 2, c.sq ? m + 5.5 : m + 4.4, c.sq ? 6 : 5.4, g));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: c.sq ? H * 0.42 : H * 0.42, ox: 'center', oy: 'bottom', size: c.sq ? 2.8 : 3.2, font: 'd', color: bg, fit: W - 2 * m - 2, ls: 0.16 }));
        o.push(...divider(W / 2, (c.sq ? H * 0.42 : H * 0.42) + 2, 18, g));
        o.push(...centerLines(c, W / 2, H - m - 1.2, { color: bg, fit: W - 2 * m - 2, size: 1.8, lh: 2.7 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ PENZIÓN – hotel / penzión: vrstvené hory a visačka ku kľúču
    penzion: {
      name: tr('Penzión', 'Penzion'), fonts: 'dmserif', pal: 'piesok', emblem: 'mountains', tags: ['penzion', 'hotel', 'chata', 'ubytovanie', 'apartmany', 'hory', 'turistika', 'wellness', 'ski', 'restauracia', 'prirodne', 'tradicne', 'pokojne', 'teple'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#EFE6D8'); const l1 = mix(acc, bg, 0.7), l2 = mix(acc, bg, 0.42), l3 = acc, l4 = mix(acc, '#000000', 0.35);
        const o = [];
        o.push(C(c.sq ? W * 0.66 : W * 0.68, c.sq ? H * 0.38 : H * 0.4, c.sq ? 4.2 : 5, { fill: mix('#E9A23B', bg, 0.3) }));
        const yb = c.sq ? H * 0.5 : H * 0.5;
        o.push(ridge([[-2, yb + 4], [W * 0.18, yb - 3], [W * 0.32, yb + 1], [W * 0.5, yb - 7], [W * 0.66, yb - 1], [W * 0.84, yb - 9], [W + 2, yb - 2]], H, l1));
        o.push(ridge([[-2, yb + 9], [W * 0.12, yb + 3], [W * 0.28, yb + 7], [W * 0.44, yb + 1], [W * 0.62, yb + 8], [W * 0.78, yb + 2], [W + 2, yb + 7]], H, l2));
        o.push(P(`M ${f2(W * 0.84)} ${f2(yb - 9)} L ${f2(W * 0.81)} ${f2(yb - 6.3)} L ${f2(W * 0.83)} ${f2(yb - 6.8)} L ${f2(W * 0.85)} ${f2(yb - 6)} L ${f2(W * 0.875)} ${f2(yb - 6.7)} Z`, { fill: '#FFFFFF', opacity: 0.85 }));
        const pine = (x, y, s, col) => P(`M ${f2(x)} ${f2(y - s)} L ${f2(x + s * 0.32)} ${f2(y - s * 0.55)} L ${f2(x + s * 0.18)} ${f2(y - s * 0.55)} L ${f2(x + s * 0.42)} ${f2(y - s * 0.1)} L ${f2(x + s * 0.08)} ${f2(y - s * 0.1)} L ${f2(x + s * 0.08)} ${f2(y)} L ${f2(x - s * 0.08)} ${f2(y)} L ${f2(x - s * 0.08)} ${f2(y - s * 0.1)} L ${f2(x - s * 0.42)} ${f2(y - s * 0.1)} L ${f2(x - s * 0.18)} ${f2(y - s * 0.55)} L ${f2(x - s * 0.32)} ${f2(y - s * 0.55)} Z`, { fill: col });
        const rnd = seeded(f.name + 'pz');
        o.push(ridge([[-2, yb + 13], [W * 0.3, yb + 11], [W * 0.6, yb + 12.5], [W + 2, yb + 10.5]], H, l3));
        for (let i = 0; i < (c.sq ? 9 : 13); i++) { const x = (i + 0.5) * (W / (c.sq ? 9 : 13)) + (rnd() - 0.5) * 2; o.push(pine(x, yb + 12.2 + rnd() * 1.4, 3.6 + rnd() * 3, l4)); }
        o.push(R(-2, yb + 13.4, W + 4, H, l4));
        const mw = c.sq ? W - 2 * m : W * 0.6;
        o.push(T(brand(c), { field: 'company', x: m, y: m + (c.sq ? 5 : 6), oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.2 : 7.3), size: 1.9, font: 't', color: mix(ink, bg, 0.25), fit: mw }));
        o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m + 0.6, oy: 'bottom', size: 2, font: 't', w: 600, color: '#FFFFFF', fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#EFE6D8'); const dk = mix(acc, '#000000', 0.45), lt = '#F4EEE3', g = pal.foil ? FOIL(pal) : '#C9A15A';
        const o = [];
        const tw = c.sq ? 15 : 17, th = c.sq ? 25 : 30, tx = c.sq ? W - m - tw : m, ty = c.sq ? m : (H - th) / 2 + 2;
        if (!c.sq) {
          o.push(R(tx + 0.5, ty + 0.6, tw, th, '#000000', { rx: 2.4, opacity: 0.3 }), R(tx, ty, tw, th, lt, { rx: 2.4 }), R(tx + 1, ty + 1, tw - 2, th - 2, null, { stroke: g, sw: 0.16, rx: 1.8 }));
          o.push(C(tx + tw / 2, ty + 4, 1.4, { fill: dk }), C(tx + tw / 2, ty + 4, 1.9, { stroke: g, sw: 0.16 }));
          o.push(P(smooth([[tx + tw / 2, ty + 2.2], [tx + tw / 2 + 1.5, ty - 2.5], [tx + tw / 2 + 4, ty - 4]]), { stroke: g, sw: 0.3 }));
          o.push(T(mono(c), { x: tx + tw / 2, y: ty + th * 0.52, ox: 'center', oy: 'center', size: 6.4, font: 'd', color: dk }));
          o.push(T(tr('IZBA', 'POKOJ'), { x: tx + tw / 2, y: ty + th * 0.74, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.3, color: dk }));
        }
        if (c.sq) { const kx = W - m - 9, ky = m - 1; o.push(R(kx, ky, 9, 14, lt, { rx: 1.6 }), R(kx + 0.7, ky + 0.7, 7.6, 12.6, null, { stroke: g, sw: 0.14, rx: 1.2 }), C(kx + 4.5, ky + 2.6, 0.9, { fill: dk }), T(mono(c), { x: kx + 4.5, y: ky + 8.4, ox: 'center', oy: 'center', size: 3.4, font: 'd', color: dk })); }
        const x = c.sq ? m : m + tw + 5, mw = c.sq ? W - 2 * m : W - x - m;
        o.push(T(brand(c), { field: 'company', x, y: c.sq ? H * 0.42 : m + 6, oy: 'bottom', size: c.sq ? 3.8 : 4.4, font: 'd', color: lt, fit: mw }));
        o.push(T(city(c) || f.role || '', { field: 'address', x, y: (c.sq ? H * 0.42 : m + 6) + 1.2, size: 1.85, font: 't', color: mix(lt, dk, 0.3), fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ MENU – fine dining: cloche, príbor a zlatá linka
    menu: {
      name: tr('Degustácia', 'Degustace'), fonts: 'bodoni', pal: 'onyx', emblem: 'fork-knife', tags: ['restauracia', 'fine dining', 'gastro', 'kuchar', 'sef', 'catering', 'bistro', 'hotel', 'vino', 'luxus', 'elegantne', 'tmave', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = DB(pal, '#151515'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [];
        const cx = W / 2, cy = c.sq ? H * 0.38 : H * 0.42, r = c.sq ? 9 : 10.5;
        o.push(P(arcD(cx, cy, r, 180, 360, true, r * 0.86) + ` L ${f2(cx + r)} ${f2(cy)} Z`, { fill: { grad: [mix(bg, '#FFFFFF', 0.08), bg], angle: 120 }, stroke: g, sw: 0.26 }));
        o.push(P(arcD(cx, cy, r * 0.72, 205, 250, true, r * 0.62), { stroke: met, sw: 0.18, opacity: 0.8 }));
        o.push(C(cx, cy - r * 0.86 - 0.9, 0.9, { fill: g }), Ln(cx - r - 2.4, cy + 0.3, cx + r + 2.4, cy + 0.3, g, 0.3), Ln(cx - r - 1.2, cy + 1.3, cx + r + 1.2, cy + 1.3, met, 0.12));
        const fx = cx - r - 5.2, kx = cx + r + 5.2, ty = cy - 7, by = cy + 5;
        o.push(Ln(fx, ty + 3.4, fx, by, met, 0.24), ...[-0.7, 0, 0.7].map((d) => Ln(fx + d, ty, fx + d, ty + 2.6, met, 0.14)), P(`M ${f2(fx - 0.9)} ${f2(ty + 2.4)} Q ${f2(fx)} ${f2(ty + 4)} ${f2(fx + 0.9)} ${f2(ty + 2.4)}`, { stroke: met, sw: 0.14 }));
        o.push(P(`M ${f2(kx)} ${f2(by)} L ${f2(kx)} ${f2(ty)} Q ${f2(kx + 1.2)} ${f2(ty + 2)} ${f2(kx + 0.9)} ${f2(ty + 5)} L ${f2(kx)} ${f2(ty + 5)}`, { stroke: met, sw: 0.18 }));
        const ny = c.sq ? H * 0.72 : H * 0.74;
        o.push(T(brand(c), { field: 'company', x: cx, y: ny, ox: 'center', oy: 'bottom', size: c.sq ? 4.4 : 5.2, font: 'd', color: ink, fit: W - 2 * m }));
        o.push(T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: cx, y: ny + 1.4, ox: 'center', size: 1.7, font: 't', w: 500, ls: 0.3, color: met, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg } = DB(pal, '#151515'); const lt = '#F3EEE6', g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [paper(c, 0.3), R(3.2, 3.2, W - 6.4, H - 6.4, null, { stroke: met, sw: 0.14 })];
        o.push(T(tr('REZERVÁCIE', 'REZERVACE'), { x: W / 2, y: m + 2.6, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.4, color: met }));
        o.push(T(f.name, { field: 'name', x: W / 2, y: c.sq ? H * 0.4 : H * 0.44, ox: 'center', oy: 'bottom', size: c.sq ? 3.6 : 4.2, font: 'd', it: true, color: bg, fit: W - 2 * m - 2 }));
        o.push(T(f.role || '', { field: 'role', x: W / 2, y: (c.sq ? H * 0.4 : H * 0.44) + 1.2, ox: 'center', size: 1.85, font: 't', color: mix(bg, lt, 0.35), fit: W - 2 * m - 2 }));
        o.push(...divider(W / 2, (c.sq ? H * 0.4 : H * 0.44) + 5, 16, g));
        o.push(...centerLines(c, W / 2, H - m - 1, { color: bg, fit: W - 2 * m - 2, size: 1.8, lh: 2.7 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ FORNO – pizzeria: kúsok pizze a kockovaný obrus
    forno: {
      name: 'Forno', fonts: 'abril', pal: 'retro', emblem: 'pizza', tags: ['pizzeria', 'pizza', 'talianska', 'restauracia', 'bistro', 'rozvoz', 'gastro', 'jedlo', 'kaviaren', 'hrave', 'teple', 'tradicne', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F7E9D2'); const red = lum(acc) < 0.5 ? acc : '#C8372D';
        const o = [];
        const sq = 2.6, y0 = c.sq ? H - 9 : H - 9.4;
        for (let i = 0; i * sq < W + sq; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2 === 0) o.push(R(i * sq - 1, y0 + j * sq, sq, sq, red, { opacity: 0.9 }));
        for (let i = 0; i * sq < W + sq; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2 === 1 && (i % 2 === 0)) o.push(R(i * sq - 1, y0 + j * sq, sq, sq, red, { opacity: 0.35 }));
        const px = c.sq ? W * 0.64 : W * 0.72, py = c.sq ? H * 0.18 : H * 0.2, s = c.sq ? 18 : 22;
        const tip = [px + s * 0.12, py + s * 1.02], l = [px - s * 0.36, py + s * 0.12], rr = [px + s * 0.5, py + s * 0.04];
        o.push(P(`M ${f2(tip[0] + 0.6)} ${f2(tip[1] + 0.8)} L ${f2(l[0] + 0.6)} ${f2(l[1] + 0.8)} Q ${f2(px + 0.6)} ${f2(py - s * 0.18 + 0.8)} ${f2(rr[0] + 0.6)} ${f2(rr[1] + 0.8)} Z`, { fill: '#000000', opacity: 0.18 }));
        o.push(P(`M ${f2(tip[0])} ${f2(tip[1])} L ${f2(l[0])} ${f2(l[1])} Q ${f2(px)} ${f2(py - s * 0.18)} ${f2(rr[0])} ${f2(rr[1])} Z`, { fill: '#F4C04E' }));
        o.push(P(`M ${f2(l[0] - 0.4)} ${f2(l[1] - 0.2)} Q ${f2(px)} ${f2(py - s * 0.26)} ${f2(rr[0] + 0.4)} ${f2(rr[1] - 0.3)} L ${f2(rr[0] - 0.6)} ${f2(rr[1] + 2.4)} Q ${f2(px)} ${f2(py - s * 0.05)} ${f2(l[0] + 0.8)} ${f2(l[1] + 2.4)} Z`, { fill: '#C9853A' }));
        const pep = [[0.02, 0.32, 0.1], [0.26, 0.28, 0.09], [0.1, 0.55, 0.085], [0.18, 0.78, 0.06], [-0.12, 0.42, 0.06]];
        pep.forEach(([dx, dy, r]) => { o.push(C(px + dx * s, py + dy * s, r * s, { fill: red }), C(px + dx * s - r * s * 0.3, py + dy * s - r * s * 0.3, r * s * 0.22, { fill: '#FFFFFF', opacity: 0.25 })); });
        o.push(P(leaf(px + s * 0.28, py + s * 0.5, rad(-40), s * 0.16, s * 0.05), { fill: '#3E7A3A' }), P(leaf(px - s * 0.04, py + s * 0.2, rad(200), s * 0.14, s * 0.045), { fill: '#3E7A3A' }));
        for (let k = 0; k < 3; k++) o.push(P(smooth([[px - s * 0.2 + k * 3, py - 1], [px - s * 0.2 + k * 3 - 1, py - 3], [px - s * 0.2 + k * 3 + 0.8, py - 5]]), { stroke: ink, sw: 0.2, opacity: 0.35 }));
        const mw = c.sq ? W * 0.5 : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.42 : H * 0.42, oy: 'bottom', size: c.sq ? 4.8 : 6.4, font: 'd', color: red, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: (c.sq ? H * 0.42 : H * 0.42) + 1.3, size: 1.9, font: 't', w: 600, color: ink, fit: mw }));
        o.push(R(m - 1, y0 - 5.4, (c.sq ? W * 0.62 : W * 0.5) + 2, 4.4, bg), T(f.phone || '', { field: 'phone', x: m, y: y0 - 1.6, oy: 'bottom', size: c.sq ? 2.6 : 3, font: 'd', color: ink, fit: c.sq ? W * 0.62 : W * 0.5 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F7E9D2'); const red = lum(acc) < 0.5 ? acc : '#C8372D', cr = '#F7E9D2';
        const o = [], sq = 3;
        for (let i = 0; i * sq < W + sq; i++) for (let j = 0; j * sq < H + sq; j++) if ((i + j) % 2 === 0) o.push(R(i * sq - 1, j * sq - 1, sq, sq, '#FFFFFF', { opacity: 0.07 }));
        const r = c.sq ? 9.5 : 11, cx = c.sq ? W / 2 : m + r, cy = c.sq ? m + r - 0.5 : H / 2;
        o.push(C(cx, cy, r, { fill: cr }), C(cx, cy, r - 0.8, { stroke: red, sw: 0.2 }), C(cx, cy, r - 3.6, { stroke: red, sw: 0.12 }));
        o.push(...ringText(brand(c).toLocaleUpperCase(), cx, cy, r - 2.2, 200, 340, { color: red, size: 1.8, w: 700 }));
        o.push(emblem(c, cx, cy + 0.8, r * 0.78, red));
        const x = c.sq ? m : cx + r + 4, mw = W - x - m;
        o.push(T(f.name, { field: 'name', x, y: c.sq ? H * 0.68 : m + 6, oy: 'bottom', size: c.sq ? 3.2 : 4, font: 'd', color: cr, fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: cr, fit: mw, size: 1.8, lh: 2.7, weight: 500 }));
        return { bg: { color: red }, objs: o };
      },
    },

    // ------------------------------------------------------------ FILTER – specialty kaviareň: dripper V60 a kvapky
    filter: {
      name: 'Filter', fonts: 'tenor', pal: 'piesok', emblem: 'coffee', tags: ['kaviaren', 'kava', 'specialty', 'prazirna', 'barista', 'bistro', 'cukraren', 'gastro', 'caj', 'minimal', 'prirodne', 'moderne', 'teple'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#EFE6D8'); const line = ink;
        const o = [paper(c, 0.5)];
        const cx = c.sq ? W * 0.7 : W * 0.74, ty = c.sq ? H * 0.12 : H * 0.14, s = c.sq ? 0.82 : 1;
        const tw = 17 * s, bw = 5 * s, ch = 11 * s;
        o.push(P(`M ${f2(cx - tw / 2)} ${f2(ty)} L ${f2(cx + tw / 2)} ${f2(ty)} L ${f2(cx + bw / 2)} ${f2(ty + ch)} L ${f2(cx - bw / 2)} ${f2(ty + ch)} Z`, { fill: mix(acc, bg, 0.75), stroke: line, sw: 0.26 }));
        for (let i = 1; i < 6; i++) { const t = i / 6; o.push(Ln(cx - tw / 2 + tw * t, ty + 0.6, cx - bw / 2 + bw * t, ty + ch - 0.4, line, 0.1, { opacity: 0.5 })); }
        o.push(R(cx - tw / 2 - 1, ty - 0.9, tw + 2, 0.9, line, { rx: 0.3 }), P(arcD(cx + tw / 2 - 0.6, ty + 3.4 * s, 2.6 * s, -80, 80), { stroke: line, sw: 0.4 }));
        o.push(R(cx - 4 * s, ty + ch, 8 * s, 1, line, { rx: 0.3 }));
        o.push(P(drop(cx, ty + ch + 3 * s, 0.7 * s), { fill: acc }), P(drop(cx, ty + ch + 5.6 * s, 0.5 * s), { fill: acc, opacity: 0.7 }));
        const cy0 = ty + ch + 7.2 * s, cw = 11 * s, chh = 7.4 * s;
        o.push(P(`M ${f2(cx - cw / 2)} ${f2(cy0)} L ${f2(cx + cw / 2)} ${f2(cy0)} L ${f2(cx + cw / 2 - 1)} ${f2(cy0 + chh)} Q ${f2(cx)} ${f2(cy0 + chh + 1)} ${f2(cx - cw / 2 + 1)} ${f2(cy0 + chh)} Z`, { fill: '#FFFFFF', stroke: line, sw: 0.26, opacity: 0.95 }));
        o.push(P(oval(cx, cy0 + 0.6, cw / 2 - 0.5, 0.7), { fill: mix(acc, '#3B2A24', 0.5) }));
        const mw = c.sq ? W * 0.5 : W * 0.5, ty2 = c.sq ? H * 0.56 : H * 0.44;
        o.push(T(brand(c), { field: 'company', x: m, y: ty2, oy: 'bottom', size: c.sq ? 4 : 5.2, font: 'd', color: ink, fit: c.sq ? W * 0.42 : mw, ls: 0.02 }));
        o.push(T((f.tagline || f.role || ''), { field: 'tagline', x: m, y: ty2 + 1.3, size: 1.85, font: 't', color: acc, fit: c.sq ? W * 0.42 : mw }));
        if (c.sq) o.push(T(f.web || f.phone || '', { field: f.web ? 'web' : 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', color: ink, fit: W - 2 * m }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#EFE6D8'); const dk = '#3B2A24', lt = '#F2E8DE';
        const o = [], rnd = seeded(f.name + 'fb');
        for (let i = 0; i < 26; i++) { const x = rnd() * W, y = rnd() * H; if (x > m - 2 && x < W - m + 2 && y > H * 0.28 && y < H - m + 2) continue; o.push(...bean(x, y, 2.2 + rnd() * 1.2, rnd() * 6, mix(acc, dk, 0.45), dk, 0.75)); }
        const mw = W - 2 * m;
        o.push(T(f.name, { field: 'name', x: m, y: H * 0.46, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: lt, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: H * 0.46 + 1.2, size: 1.85, font: 't', color: mix(acc, lt, 0.4), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ VINOTÉKA – rad fliaš a pohár (fólia na bordovej)
    vinoteka: {
      name: tr('Vinotéka', 'Vinotéka'), fonts: 'caslon', pal: 'burgundy', emblem: 'wine', tags: ['vinoteka', 'vino', 'vinarstvo', 'sommelier', 'degustacie', 'bar', 'obchod', 'darceky', 'gastro', 'elegantne', 'luxusne', 'tmave', 'tradicne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = DB(pal, '#5A1420'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [];
        const yb = c.sq ? H - m + 1 : H - m + 1.2, set = c.sq ? [['bdx', 4.6, 17], ['brg', 5.2, 16], ['sek', 5, 18.5]] : [['bdx', 4.6, 18], ['brg', 5.4, 17], ['sek', 5.2, 19.5], ['bdx', 4.6, 18], ['brg', 5.4, 17]];
        let x = c.sq ? W - m - 18 : W - m - 30.5;
        set.forEach(([sh, w, hh], i) => { o.push(P(bottle(x, yb, w, hh, sh), i === 2 ? { fill: g } : { stroke: g, sw: 0.22 })); if (i !== 2) o.push(R(x + 0.5, yb - hh * 0.42, w - 1, hh * 0.22, null, { stroke: met, sw: 0.1 })); else o.push(R(x + 0.6, yb - hh * 0.42, w - 1.2, hh * 0.22, bg)); x += w + 1.2; });
        o.push(Ln(c.sq ? W - m - 20 : W - m - 33, yb + 0.4, W - m + 1, yb + 0.4, g, 0.22));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: m + (c.sq ? 5 : 7), oy: 'bottom', size: c.sq ? 4.2 : 5.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.4 : 8.4), size: 2, font: 'd', it: true, color: met, fit: mw }));
        if (!c.sq) o.push(...rows(c, { x: m, yb: H - m, color: mix(ink, bg, 0.12), fit: W * 0.42, size: 1.8, lh: 2.7, keys: ['phone', 'web'] }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg } = DB(pal, '#5A1420'); const lt = '#F4E9DC', g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [paper(c, 0.4)];
        const gx = c.sq ? W - m - 7 : W - m - 9, gy = c.sq ? m + 1 : m, gs = c.sq ? 0.8 : 1;
        o.push(P(`M ${f2(gx - 5 * gs)} ${f2(gy)} L ${f2(gx + 5 * gs)} ${f2(gy)} Q ${f2(gx + 5.6 * gs)} ${f2(gy + 9 * gs)} ${f2(gx)} ${f2(gy + 11 * gs)} Q ${f2(gx - 5.6 * gs)} ${f2(gy + 9 * gs)} ${f2(gx - 5 * gs)} ${f2(gy)} Z`, { stroke: g, sw: 0.24 }));
        o.push(P(`M ${f2(gx - 5.25 * gs)} ${f2(gy + 4.5 * gs)} L ${f2(gx + 5.25 * gs)} ${f2(gy + 4.5 * gs)} Q ${f2(gx + 5.2 * gs)} ${f2(gy + 9.2 * gs)} ${f2(gx)} ${f2(gy + 10.8 * gs)} Q ${f2(gx - 5.2 * gs)} ${f2(gy + 9.2 * gs)} ${f2(gx - 5.25 * gs)} ${f2(gy + 4.5 * gs)} Z`, { fill: bg, opacity: 0.85 }));
        o.push(Ln(gx, gy + 11 * gs, gx, gy + 18 * gs, g, 0.26), Ln(gx - 3.6 * gs, gy + 18.2 * gs, gx + 3.6 * gs, gy + 18.2 * gs, g, 0.3));
        const mw = W - 2 * m - 19;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: bg, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.2, size: 1.9, font: 'd', it: true, color: met, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: bg, fit: c.sq ? W - 2 * m : W - 2 * m - 16, size: 1.8, lh: 2.7 }));
        return { bg: { color: lt }, objs: o };
      },
    },

    // ------------------------------------------------------------ KNIHA – kníhkupectvo: kôpka kníh a ex libris
    kniha: {
      name: 'Ex libris', fonts: 'playfair', pal: 'dub', emblem: 'book-open', tags: ['knihkupectvo', 'knihy', 'kniznica', 'antikvariat', 'vydavatelstvo', 'spisovatel', 'redaktor', 'skola', 'kaviaren', 'tradicne', 'teple', 'elegantne', 'kultura'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F6F0E6');
        const o = [paper(c, 0.4)];
        const cols = [acc, mix(acc, '#000000', 0.4), '#7A1F2B', '#2E4A3A', '#C9A15A', '#22324A'], band = '#E9D9B5';
        const yb = c.sq ? H * 0.62 : H - m + 0.6, x0 = c.sq ? W * 0.36 : W * 0.54;
        const stack = [[18, 3.2], [16, 2.6], [19, 3.4], [15, 2.4]];
        let y = yb;
        stack.forEach(([w, hh], i) => { y -= hh; o.push(R(x0 + (i % 2 ? 1.2 : -0.6), y, w, hh, cols[i], { rx: 0.3 }), R(x0 + (i % 2 ? 1.2 : -0.6) + w * 0.12, y + hh * 0.3, w * 0.05, hh * 0.4, band), R(x0 + (i % 2 ? 1.2 : -0.6) + w * 0.24, y + hh * 0.42, w * 0.42, hh * 0.16, band, { opacity: 0.7 })); });
        let bx = x0 + 20.5; const ups = [[3.4, 15, 4], [2.8, 13, 5], [3.8, 16.5, 2], [3, 12, 3]];
        ups.forEach(([w, hh, ci], i) => { if (bx + w > W - 1.5) return; o.push(...spine(bx, yb - hh, w, hh, cols[ci], band, { rot: i === 3 ? 8 : 0 })); bx += w + 0.3; });
        o.push(R(x0 - 2, yb, W - x0 + 4, 0.5, ink, { opacity: 0.6 }));
        const mw = c.sq ? W - 2 * m : W * 0.42;
        const ny = c.sq ? H * 0.8 : H * 0.44;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? m + 5 : ny, oy: 'bottom', size: c.sq ? 4.2 : 5, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: (c.sq ? m + 5 : ny) + 1.3, size: 2, font: 'd', it: true, color: acc, fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 600, color: ink, fit: W - 2 * m }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F6F0E6'); const dk = '#2A2119', lt = '#F6F0E6', g = pal.foil ? FOIL(pal) : '#C9A15A';
        const o = [];
        const px = c.sq ? 5 : W * 0.08, pw = c.sq ? W - 10 : W * 0.38, py = c.sq ? 5 : 6, ph = c.sq ? H * 0.5 : H - 12;
        o.push(R(px, py, pw, ph, lt, { rx: 0.6 }), R(px + 1, py + 1, pw - 2, ph - 2, null, { stroke: g, sw: 0.18 }), R(px + 1.7, py + 1.7, pw - 3.4, ph - 3.4, null, { stroke: g, sw: 0.08 }));
        for (const [x, y] of [[px + 1.7, py + 1.7], [px + pw - 1.7, py + 1.7], [px + 1.7, py + ph - 1.7], [px + pw - 1.7, py + ph - 1.7]]) o.push(P(`M ${f2(x)} ${f2(y - 0.9)} L ${f2(x + 0.9)} ${f2(y)} L ${f2(x)} ${f2(y + 0.9)} L ${f2(x - 0.9)} ${f2(y)} Z`, { fill: g }));
        o.push(T('EX LIBRIS', { x: px + pw / 2, y: py + ph * 0.24, ox: 'center', oy: 'center', size: 1.75, font: 't', w: 600, ls: 0.34, color: acc }));
        o.push(emblem(c, px + pw / 2, py + ph * 0.52, c.sq ? 7 : 9, dk));
        o.push(T(mono(c), { x: px + pw / 2, y: py + ph * 0.8, ox: 'center', oy: 'center', size: 3, font: 'd', it: true, color: dk }));
        const x = c.sq ? m : px + pw + 5, mw = c.sq ? W - 2 * m : W - x - m;
        o.push(T(f.name, { field: 'name', x, y: c.sq ? H * 0.7 : m + 6, oy: 'bottom', size: c.sq ? 3.2 : 4.2, font: 'd', color: lt, fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ PIVÓNIA – moderné kvetinárstvo: veľké ploché kvety v oblúku
    pivonka: {
      name: tr('Pivónia', 'Pivoňka'), fonts: 'gloock', pal: 'terrazzo', emblem: 'flower-tulip', tags: ['kvetinarstvo', 'kvety', 'kytice', 'floristka', 'svadby', 'dekoracie', 'zahradnik', 'darceky', 'eventy', 'moderne', 'farebne', 'jemne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FBF6EE'); const pink = '#E9A3A0', olive = '#6D7A5E', dkp = mix(acc, '#000000', 0.2);
        const o = [];
        const aw = c.sq ? 24 : 30, ax = c.sq ? W - aw - 2.5 : W - aw - 5, top = c.sq ? 3 : 4;
        o.push(P(arch(ax, H + 1, aw, top), { fill: mix(acc, bg, 0.82) }));
        const cx = ax + aw / 2, cy = c.sq ? H * 0.48 : H * 0.5;
        o.push(P(leaf(cx - 3, cy + 6, rad(200), 13, 3.6), { fill: olive }), P(leaf(cx + 3, cy + 5, rad(-25), 12, 3.4), { fill: mix(olive, '#000000', 0.2) }), P(leaf(cx, cy + 4, rad(-100), 11, 2.8), { fill: olive }));
        o.push(...peony(cx - 4.4, cy - 1, c.sq ? 6.4 : 7.4, pink, mix(pink, '#7A2A30', 0.45)));
        o.push(...bloom(cx + 6, cy - 6.4, c.sq ? 5 : 5.8, 8, acc, '#F2B705', { w: 0.32, inner: mix(acc, '#FFFFFF', 0.35) }));
        o.push(...bloom(cx + 5.4, cy + 4.6, 3.4, 6, '#FFFFFF', dkp, { w: 0.36 }));
        o.push(P(`M ${f2(cx - 10)} ${f2(cy - 6)} Q ${f2(cx - 11)} ${f2(cy - 10)} ${f2(cx - 8.6)} ${f2(cy - 12)} Q ${f2(cx - 6.6)} ${f2(cy - 10.6)} ${f2(cx - 8)} ${f2(cy - 7)} Z`, { fill: dkp }), Ln(cx - 8.8, cy - 6.4, cx - 7.8, cy - 2, olive, 0.3));
        const mw = c.sq ? W - aw - 2 * m + 2 : ax - m - 3, ny = c.sq ? H * 0.36 : H * 0.44;
        o.push(T(brand(c), { field: 'company', x: m, y: ny, oy: 'bottom', size: c.sq ? 3.6 : 5.2, font: 'd', color: ink, fit: c.sq ? W * 0.4 : mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ny + 1.3, size: 1.8, font: 't', color: acc, fit: c.sq ? W * 0.32 : mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 600, color: ink, fit: W * 0.42 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#FBF6EE'); const lt = '#FBF6EE', bgb = deep(acc), pink = '#E9A3A0', olive = '#6D7A5E';
        const o = [], rnd = seeded(f.name + 'pv');
        for (let i = 0; i < 14; i++) { const x = rnd() * W, y = rnd() * H; if (x < W * 0.62 && y > m - 2) continue; o.push(...bloom(x, y, 1.4 + rnd() * 1.2, 5 + Math.floor(rnd() * 3), mix(lt, bgb, 0.3 + rnd() * 0.3), mix(bgb, '#F2B705', 0.6), { rot: rnd() * 3, opacity: 0.5 })); }
        const cx = c.sq ? W * 0.74 : W * 0.8, cy = c.sq ? H * 0.3 : H * 0.5;
        o.push(P(leaf(cx - 2, cy + 4, rad(150), 9, 2.6), { fill: olive }), P(leaf(cx + 2, cy + 4, rad(20), 9, 2.6), { fill: mix(olive, '#000000', 0.2) }));
        o.push(...peony(cx, cy, c.sq ? 5.4 : 6.6, pink, mix(pink, '#7A2A30', 0.45)));
        const mw = c.sq ? W - 2 * m : W * 0.56;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.62 : m + 6, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', color: lt, fit: c.sq ? W * 0.5 : mw }));
        o.push(T(f.name, { field: 'name', x: m, y: (c.sq ? H * 0.62 : m + 6) + 1.3, size: 1.9, font: 't', color: mix(lt, bgb, 0.2), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ DOTYK – masér / fyzioterapeut: zen kamene a vlnky
    dotyk: {
      name: tr('Dotyk', 'Dotek'), fonts: 'josefin', pal: 'taupe', emblem: 'hand-heart', tags: ['maser', 'masaze', 'fyzioterapia', 'fyzioterapeut', 'rehabilitacia', 'wellness', 'spa', 'joga', 'terapeut', 'zdravie', 'jemne', 'pokojne', 'prirodne', 'minimal'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#E9E2D8');
        const o = [paper(c, 0.4)];
        for (let k = 0; k < 4; k++) { const pts = []; for (let x = c.sq ? W * 0.42 : W * 0.54; x <= W + 4; x += 4) pts.push([x, (c.sq ? H * 0.72 : H * 0.66) + k * 1.4 + Math.sin(x / 13 + k * 0.4) * 2]); o.push(P(smooth(pts), { stroke: acc, sw: 0.14, opacity: 0.35 - k * 0.06 })); }
        const cx = c.sq ? W * 0.68 : W * 0.76, yb = c.sq ? H * 0.68 : H * 0.7;
        const k = c.sq ? 1 : 1.3, st = [[11 * k, 3.2 * k, 0], [9 * k, 2.8 * k, -0.04], [7.2 * k, 2.5 * k, 0.05], [5.2 * k, 2.1 * k, -0.03]]; let y = yb;
        st.forEach(([w, hh, a], i) => { y -= hh * 0.92; o.push(P(oval(cx + 0.4, y + 0.5, w / 2, hh / 2, a), { fill: '#000000', opacity: 0.12 }), P(oval(cx + (i % 2 ? 0.5 : -0.4), y, w / 2, hh / 2, a), { fill: mix(acc, i % 2 ? '#FFFFFF' : '#3A322C', i % 2 ? 0.3 : 0.25) }), P(oval(cx - w * 0.15, y - hh * 0.2, w * 0.18, hh * 0.12, a), { fill: '#FFFFFF', opacity: 0.22 })); y -= hh * 0.55; });
        o.push(...sprig(cx + 7, yb - 2, c.sq ? 10 : 13, -110, { color: mix(acc, '#5E7D5A', 0.6), leaves: 7, size: 2.6 }));
        const mw = c.sq ? W * 0.5 : W * 0.5, ny = c.sq ? H * 0.3 : H * 0.42;
        o.push(T(f.name, { field: 'name', x: m, y: ny, oy: 'bottom', size: c.sq ? 3.4 : 4.4, font: 'd', w: 400, color: ink, fit: c.sq ? W - 2 * m : mw, ls: 0.04 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: ny + 1.4, size: 1.75, font: 't', w: 600, ls: 0.22, color: acc, fit: c.sq ? W - 2 * m : mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 600, color: ink, fit: W * 0.42 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#E9E2D8'); const bgb = mix(acc, '#2E2622', 0.35), lt = '#F2ECE4';
        const o = [];
        const cx = c.sq ? W / 2 : W * 0.78, cy = c.sq ? H * 0.3 : H / 2;
        for (let k = 1; k <= 7; k++) o.push(P(oval(cx, cy, k * 3.2, k * 1.9), { stroke: lt, sw: 0.12, opacity: 0.32 - k * 0.03 }));
        o.push(emblem(c, cx, cy, c.sq ? 7 : 8, lt));
        const mw = c.sq ? W - 2 * m : W * 0.54;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.62 : m + 5.6, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: lt, fit: mw, ls: 0.04 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ SÉRUM – kozmetička: kvapkadlová fľaštička, kvapky a lesk
    serum: {
      name: tr('Sérum', 'Sérum'), fonts: 'italiana', pal: 'rosegold', emblem: 'eyedropper', tags: ['kozmetika', 'kozmeticka', 'beauty', 'plet', 'estetika', 'salon', 'nechty', 'mihalnice', 'wellness', 'derma', 'elegantne', 'jemne', 'zenske', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = LB(pal, '#F6E9E4'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [IMG(c.root + 'assets/tex/blob-ruza.png', c.sq ? W * 0.3 : W * 0.48, c.sq ? -8 : -10, c.sq ? 36 : 46, c.sq ? 30 : 38, { role: 'art', blend: 'multiply', opacity: 0.75 })];
        const cx = c.sq ? W * 0.7 : W * 0.74, yb = c.sq ? H * 0.62 : H * 0.8, bw = c.sq ? 10 : 12, bh = c.sq ? 13 : 16;
        o.push(R(cx - bw / 2, yb - bh, bw, bh, { grad: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'], angle: 0 }, { rx: 2.4, stroke: met, sw: 0.22 }));
        o.push(R(cx - bw / 2 + 0.8, yb - bh * 0.62, bw - 1.6, bh * 0.56, { grad: [mix(met, '#FFFFFF', 0.55), mix(met, '#FFFFFF', 0.2)], angle: 90 }, { rx: 1.8, opacity: 0.9 }));
        o.push(R(cx - bw / 2 + 1.2, yb - bh + 1, 0.9, bh - 2.4, '#FFFFFF', { rx: 0.45, opacity: 0.8 }));
        o.push(R(cx - bw * 0.22, yb - bh - 2.2, bw * 0.44, 2.4, MG(pal), { rx: 0.4 }), P(`M ${f2(cx - bw * 0.16)} ${f2(yb - bh - 2.2)} L ${f2(cx - bw * 0.16)} ${f2(yb - bh - 5)} Q ${f2(cx)} ${f2(yb - bh - 8.6)} ${f2(cx + bw * 0.16)} ${f2(yb - bh - 5)} L ${f2(cx + bw * 0.16)} ${f2(yb - bh - 2.2)} Z`, { fill: ink, opacity: 0.85 }));
        o.push(T(mono(c), { x: cx, y: yb - bh * 0.34, ox: 'center', oy: 'center', size: c.sq ? 2.6 : 3, font: 'd', color: ink }));
        o.push(P(drop(cx + bw * 0.9, yb - bh * 0.95, 1.2), { fill: MG(pal) }), P(drop(cx + bw * 1.05, yb - bh * 0.6, 0.8), { fill: MG(pal), opacity: 0.8 }), twinkle(cx - bw * 0.95, yb - bh * 0.9, 1.6, MG(pal)), twinkle(cx - bw * 0.7, yb - bh * 1.2, 0.8, MG(pal)));
        const mw = c.sq ? W * 0.5 : W * 0.5, ny = c.sq ? H * 0.78 : H * 0.44;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? m + 5 : ny, oy: 'bottom', size: c.sq ? 4.4 : 5.6, font: 'd', color: ink, fit: c.sq ? W * 0.5 : mw, ls: 0.04 }));
        o.push(T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: m, y: (c.sq ? m + 5 : ny) + 1.5, size: 1.7, font: 't', w: 500, ls: 0.24, color: met, fit: c.sq ? W * 0.5 : mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.8, lh: 2.6 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { ink } = LB(pal, '#F6E9E4'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent, dk = lum(ink) < 0.2 ? ink : '#3A2A2A', lt = '#F6E9E4';
        const o = [];
        const cx = c.sq ? W / 2 : W * 0.8, cy = c.sq ? H * 0.32 : H / 2, s = c.sq ? 9 : 12;
        o.push(P(drop(cx, cy, s), { stroke: MG(pal), sw: 0.3 }), P(drop(cx, cy + s * 0.12, s * 0.72), { stroke: met, sw: 0.1 }), twinkle(cx - s * 0.2, cy + s * 0.15, s * 0.22, MG(pal)));
        const mw = c.sq ? W - 2 * m : W * 0.56;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? H * 0.66 : m + 6, oy: 'bottom', size: c.sq ? 3.6 : 4.6, font: 'd', color: lt, fit: mw, ls: 0.04 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: (c.sq ? H * 0.66 : m + 6) + 1.2, size: 1.85, font: 't', color: met, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ APOTÉKA – lekáreň: kríž, bylinky a kapsuly
    apoteka: {
      name: tr('Apotéka', 'Apatyka'), fonts: 'outfit', pal: 'more', emblem: 'first-aid', tags: ['lekaren', 'lekarnik', 'zdravie', 'bylinky', 'vyzivove doplnky', 'ambulancia', 'lekar', 'farmacia', 'drogeria', 'ciste', 'svieze', 'moderne', 'dovera'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F4F8F6'); const herb = mix(acc, '#3E6B3A', 0.5);
        const o = [];
        const cx = c.sq ? W * 0.7 : W * 0.76, cy = c.sq ? H * 0.32 : H * 0.46, s = c.sq ? 7.4 : 9, t = s * 0.36;
        o.push(C(cx, cy, s * 1.55, { fill: mix(acc, bg, 0.88) }));
        o.push(...sprig(cx - s * 1.2, cy + s * 1.2, s * 1.9, -150, { color: herb, leaves: 7, size: s * 0.36 }), ...sprig(cx + s * 1.2, cy + s * 1.2, s * 1.9, -30, { color: herb, leaves: 7, size: s * 0.36 }));
        o.push(R(cx - t, cy - s, 2 * t, 2 * s, acc, { rx: t * 0.35 }), R(cx - s, cy - t, 2 * s, 2 * t, acc, { rx: t * 0.35 }), R(cx - t + 0.5, cy - s + 0.5, 0.7, 2 * s - 1, '#FFFFFF', { rx: 0.35, opacity: 0.35 }));
        const cap = (x, y, a, c1) => [R(x - 3, y - 1, 6, 2, '#FFFFFF', { rx: 1, rot: a, stroke: mix(acc, '#000000', 0.1), sw: 0.12 }), R(x - 3, y - 1, 3, 2, c1, { rx: 1, rot: a })];
        if (!c.sq) o.push(...cap(cx - s * 1.9, cy - s * 1.1, -30, '#F2B705'), ...cap(cx + s * 1.8, cy - s * 0.9, 25, acc));
        const mw = c.sq ? W - 2 * m : W * 0.48, ty = c.sq ? H * 0.72 : H * 0.42;
        o.push(T(brand(c), { field: 'company', x: m, y: ty, oy: 'bottom', size: c.sq ? 4.2 : 5.2, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ty + 1.3, size: 1.9, font: 't', color: acc, fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 2, font: 't', w: 600, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F4F8F6'); const bgb = deep(acc), wh = '#FFFFFF', herb = mix(acc, '#FFFFFF', 0.45);
        const o = [];
        const cx = c.sq ? W * 0.76 : W * 0.8, cy = c.sq ? H * 0.28 : H / 2, s = c.sq ? 5.4 : 7, t = s * 0.36;
        o.push(C(cx, cy, s * 1.7, { stroke: wh, sw: 0.14, opacity: 0.4 }), C(cx, cy, s * 2.1, { stroke: wh, sw: 0.1, opacity: 0.25 }));
        o.push(...sprig(cx - s * 0.6, cy + s * 1.5, s * 1.6, -140, { color: herb, leaves: 6, size: s * 0.34 }), ...sprig(cx + s * 0.6, cy + s * 1.5, s * 1.6, -40, { color: herb, leaves: 6, size: s * 0.34 }));
        o.push(R(cx - t, cy - s, 2 * t, 2 * s, wh, { rx: t * 0.35 }), R(cx - s, cy - t, 2 * s, 2 * t, wh, { rx: t * 0.35 }));
        const mw = c.sq ? W * 0.5 : W * 0.56;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.2 : 4.2, font: 'd', w: 600, color: wh, fit: c.sq ? W * 0.52 : mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.2, size: 1.85, font: 't', color: mix(wh, bgb, 0.25), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: wh, fit: c.sq ? W - 2 * m : mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ PARAGRAF – moderný advokát: obrovský § a jemné linky
    paragraf: {
      name: tr('Paragraf', 'Paragraf'), fonts: 'gloock', pal: 'bordo', emblem: 'scales', tags: ['advokat', 'pravnik', 'pravo', 'notar', 'exekutor', 'mediacia', 'danovy poradca', 'konzultant', 'financie', 'moderne', 'elegantne', 'prestiz', 'dovera'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F4EFEA');
        const o = [];
        o.push(T('§', { x: c.sq ? W + 4 : W + 2, y: c.sq ? H * 0.42 : H * 0.48, ox: 'right', oy: 'center', size: c.sq ? 46 : 62, font: 'd', color: acc, opacity: 0.95 }));
        for (let i = 0; i < 3; i++) o.push(Ln(c.sq ? W * 0.5 : W * 0.56, m + 1 + i * 1.1, W - m, m + 1 + i * 1.1, acc, 0.08, { opacity: 0.5 }));
        const mw = c.sq ? W * 0.56 : W * 0.5;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? H * 0.4 : H * 0.42, oy: 'bottom', size: c.sq ? 3.6 : 4.6, font: 'd', color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: (c.sq ? H * 0.4 : H * 0.42) + 1.3, size: 1.75, font: 't', w: 600, ls: 0.18, color: acc, fit: mw }));
        o.push(Ln(m, (c.sq ? H * 0.4 : H * 0.42) + 5, m + 8, (c.sq ? H * 0.4 : H * 0.42) + 5, ink, 0.2));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 600, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F4EFEA'); const bgb = deep(acc), lt = '#F4EFEA';
        const o = [];
        const r = c.sq ? 7 : 8, cx = c.sq ? W / 2 : W - m - r, cy = c.sq ? m + r : m + r;
        o.push(C(cx, cy, r, { stroke: lt, sw: 0.2 }), T('§', { x: cx, y: cy + 0.4, ox: 'center', oy: 'center', size: r * 1.2, font: 'd', color: lt }));
        const mw = c.sq ? W - 2 * m : W - 2 * m - 2 * r - 4;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.6 : m + 6, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: lt, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: lt, fit: W - 2 * m, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ AXON – minimalistický architekt: izometrická kocka a kóty
    axon: {
      name: 'Axon', fonts: 'inter', pal: 'krieda', emblem: 'compass-tool', tags: ['architekt', 'architektura', 'interier', 'projektant', 'staticky', 'stavba', 'developer', 'dizajn', 'minimal', 'moderne', 'technicke', 'ciste', 'kreativ'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F5F2EC');
        const o = [...dotGrid(c.sq ? W * 0.44 : W * 0.5, 3, W - 3, H - 3, 2.4, () => 0.1, ink, { opacity: 0.3 })];
        const cx = c.sq ? W * 0.7 : W * 0.75, cy = c.sq ? H * 0.38 : H * 0.48, s = c.sq ? 7.5 : 9, hh = c.sq ? 9 : 11;
        const iso = (x, y, z) => [cx + (x - y) * s * 0.866, cy + (x + y) * s * 0.5 - z * hh];
        const face = (pts, fill, op) => P('M ' + pts.map(([x, y]) => `${f2(x)} ${f2(y)}`).join(' L ') + ' Z', { fill, opacity: op, stroke: ink, sw: 0.18 });
        o.push(P(`M ${iso(0, 0, 0).map(f2).join(' ')} L ${iso(1, 0, 0).map(f2).join(' ')} L ${iso(1.9, 0.9, 0).map(f2).join(' ')} L ${iso(0.9, 0.9, 0).map(f2).join(' ')} Z`, { fill: ink, opacity: 0.08 }));
        o.push(face([iso(0, 1, 0), iso(1, 1, 0), iso(1, 1, 1), iso(0, 1, 1)], mix(ink, bg, 0.75), 1));
        o.push(face([iso(1, 0, 0), iso(1, 1, 0), iso(1, 1, 1), iso(1, 0, 1)], acc, 0.9));
        o.push(face([iso(0, 0, 1), iso(1, 0, 1), iso(1, 1, 1), iso(0, 1, 1)], bg, 1));
        o.push(face([iso(0.2, 1, 0), iso(0.55, 1, 0), iso(0.55, 1, 0.55), iso(0.2, 1, 0.55)], ink, 0.15));
        const [ax, ay] = iso(0, 1, 0), [bx, by] = iso(1, 1, 0);
        o.push(Ln(ax - 1.4, ay + 1.6, bx - 1.4, by + 1.6, ink, 0.12), Ln(ax - 2, ay + 1.2, ax - 0.8, ay + 2, ink, 0.12), Ln(bx - 2, by + 1.2, bx - 0.8, by + 2, ink, 0.12));
        o.push(T('4 500', { x: (ax + bx) / 2 - 2.4, y: (ay + by) / 2 + 3.4, ox: 'center', oy: 'center', size: 1.7, font: 't', color: ink, rot: 30, opacity: 0.75 }));
        const [tx, ty] = iso(0, 0, 1), [t2x, t2y] = iso(0, 0, 0);
        o.push(Ln(tx - 2.4, ty, t2x - 2.4, t2y, ink, 0.12), Ln(tx - 3, ty, tx - 1.8, ty, ink, 0.12), Ln(t2x - 3, t2y, t2x - 1.8, t2y, ink, 0.12));
        const mw = c.sq ? W - 2 * m : W * 0.44;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? H * 0.74 : m + 5.4, oy: 'bottom', size: c.sq ? 3.2 : 3.8, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: (c.sq ? H * 0.74 : m + 5.4) + 1.1, size: 1.8, font: 't', color: mix(ink, bg, 0.35), fit: mw }));
        if (c.sq) o.push(T(f.web || f.phone || '', { field: f.web ? 'web' : 'phone', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', color: acc, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7, labels: true }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { ink, acc } = LB(pal, '#F5F2EC'); const bgb = lum(ink) < 0.15 ? ink : '#1A1A18', lt = '#F5F2EC';
        const o = [];
        for (let x = 0; x <= W; x += 5) o.push(Ln(x, -1, x, H + 1, lt, 0.06, { opacity: 0.18 }));
        for (let y = 0; y <= H; y += 5) o.push(Ln(-1, y, W + 1, y, lt, 0.06, { opacity: 0.18 }));
        const nx = W - m - 2, ny = m + 2.8;
        o.push(C(nx, ny, 2.6, { stroke: lt, sw: 0.14 }), P(`M ${f2(nx)} ${f2(ny - 2.2)} L ${f2(nx + 0.9)} ${f2(ny + 1.2)} L ${f2(nx)} ${f2(ny + 0.5)} L ${f2(nx - 0.9)} ${f2(ny + 1.2)} Z`, { fill: acc }), T('N', { x: nx, y: ny - 3.7, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, color: lt }));
        o.push(T(brand(c), { field: 'company', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.2 : 4, font: 'd', w: 600, color: lt, fit: W - 2 * m - 8, ls: -0.02 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: keys4(c), color: lt, fit: W - 2 * m, size: 1.8, lh: 2.7, labels: true, lcolor: acc }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ PRSTENE – svadby a eventy: prepletené prstene vo fólii
    prstene: {
      name: tr('Prstene', 'Prsteny'), fonts: 'italiana', pal: 'ivory', emblem: 'diamond', tags: ['svadby', 'svadba', 'svatba', 'eventy', 'svadobna agentura', 'koordinatorka', 'dekoracie', 'oslavy', 'zlatnik', 'sperky', 'romanticke', 'elegantne', 'jemne', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = LB(pal, '#F4EFE6'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent, sage = '#8A9A80';
        const o = [paper(c, 0.4)];
        const cx = W / 2, cy = c.sq ? H * 0.34 : H * 0.36, r = c.sq ? 6.2 : 7.2; const ring = MG(pal);
        o.push(...sprig(cx - r - 2, cy + 3, c.sq ? 11 : 14, 165, { color: sage, leaves: 8, size: 2.6 }), ...sprig(cx + r + 2, cy + 3, c.sq ? 11 : 14, 15, { color: sage, leaves: 8, size: 2.6 }));
        o.push(C(cx - r * 0.55, cy, r, { stroke: ring, sw: 0.75 }), C(cx + r * 0.55, cy, r, { stroke: ring, sw: 0.75 }));
        o.push(P(arcD(cx - r * 0.55, cy, r, -40, 20, true), { stroke: ring, sw: 0.75 }));
        o.push(P(`M ${f2(cx + r * 0.55)} ${f2(cy - r - 2.6)} L ${f2(cx + r * 0.55 + 1.4)} ${f2(cy - r - 1.3)} L ${f2(cx + r * 0.55)} ${f2(cy - r + 0.2)} L ${f2(cx + r * 0.55 - 1.4)} ${f2(cy - r - 1.3)} Z`, { fill: '#FFFFFF', stroke: met, sw: 0.14 }), twinkle(cx + r * 0.55 + 2.6, cy - r - 2.4, 0.9, g));
        const ny = c.sq ? H * 0.68 : H * 0.72;
        o.push(T(brand(c), { field: 'company', x: cx, y: ny, ox: 'center', oy: 'bottom', size: c.sq ? 4.6 : 5.4, font: SCRIPT, color: ink, fit: W - 2 * m }));
        o.push(T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: cx, y: ny + 1.6, ox: 'center', size: 1.7, font: 't', w: 500, ls: 0.3, color: met, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { ink } = LB(pal, '#F4EFE6'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent, sage = '#7D8C73', bgb = '#E8E3D6';
        const o = [];
        o.push(...sprig(-1, H - 4, c.sq ? 14 : 18, -40, { color: sage, leaves: 9, size: 3 }), ...sprig(W + 1, 4, c.sq ? 14 : 18, 140, { color: sage, leaves: 9, size: 3 }));
        o.push(T(f.name, { field: 'name', x: W / 2, y: c.sq ? H * 0.36 : H * 0.36, ox: 'center', oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: ink, fit: W - 2 * m - 4 }));
        o.push(T(f.role || '', { field: 'role', x: W / 2, y: (c.sq ? H * 0.36 : H * 0.36) + 1.2, ox: 'center', size: 1.85, font: 't', color: met, fit: W - 2 * m - 4 }));
        o.push(...divider(W / 2, (c.sq ? H * 0.36 : H * 0.36) + 5.2, 16, g));
        o.push(...centerLines(c, W / 2, H - m - 1, { color: ink, fit: W - 2 * m - 4, size: 1.8, lh: 2.7 }));
        return { bg: { color: bgb }, objs: o };
      },
    },

    // ------------------------------------------------------------ DÚHA – škôlka / deti: dúha, oblaky a slnko
    duha: {
      name: tr('Dúha', 'Duha'), fonts: 'rubik', pal: 'koral', emblem: 'balloon', tags: ['skolka', 'deti', 'jasle', 'materska skola', 'kruzky', 'detske oslavy', 'animatorka', 'hracky', 'pediatr', 'hrave', 'farebne', 'priatelske', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FFF8F0');
        const o = [];
        const cols = [acc, '#F2B705', '#5DBB63', '#3BA6E0', '#8A5CF6'], cx = c.sq ? W * 0.62 : W * 0.74, cy = c.sq ? H * 0.62 : H * 0.84, r = c.sq ? 17 : 19, sw = c.sq ? 2.2 : 2.5;
        o.push(...rainbow(cx, cy, r, cols, sw));
        o.push(...cloud(cx - r + 1, cy - 0.8, c.sq ? 4.4 : 5, '#FFFFFF', mix(ink, bg, 0.7)), ...cloud(cx + r - 5, cy - 0.4, c.sq ? 4.4 : 5, '#FFFFFF', mix(ink, bg, 0.7)));
        const sx = c.sq ? W - m - 3 : W - m - 3, sy = m + 2.4;
        o.push(...rays(sx, sy, 3.2, 4.8, 10, '#F2B705', 0.35), C(sx, sy, 2.6, { fill: '#F2B705' }), C(sx - 0.8, sy - 0.4, 0.3, { fill: ink }), C(sx + 0.8, sy - 0.4, 0.3, { fill: ink }), P(arcD(sx, sy + 0.2, 1, 20, 160), { stroke: ink, sw: 0.18 }));
        o.push(twinkle(c.sq ? W * 0.44 : W * 0.5, c.sq ? H * 0.36 : H * 0.3, 1.2, '#3BA6E0'), twinkle(c.sq ? W * 0.84 : W * 0.62, c.sq ? H * 0.34 : H * 0.14, 0.9, acc));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: m + (c.sq ? 5 : 6), oy: 'bottom', size: c.sq ? 4.2 : 5.2, font: 'd', w: 800, color: ink, fit: c.sq ? W - 2 * m - 10 : mw, ls: -0.02 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.2 : 7.4), size: 1.9, font: 't', w: 500, color: acc, fit: c.sq ? W - 2 * m - 10 : mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 600, color: ink, fit: W * 0.32 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: W * 0.42, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#FFF8F0'); const sky = '#3BA6E0', wh = '#FFFFFF';
        const o = [], rnd = seeded(f.name + 'dh');
        for (let i = 0; i < 12; i++) { const x = rnd() * W, y = rnd() * H; if (x < W * 0.6 && y > m + 8) continue; if (i % 2) o.push(twinkle(x, y, 0.8 + rnd(), wh, { opacity: 0.4 })); else o.push(P(heart(x, y, 0.9 + rnd() * 0.6), { fill: wh, opacity: 0.3 })); }
        const cols = [acc, '#F2B705', '#5DBB63', '#FFFFFF'], cx = c.sq ? W * 0.78 : W * 0.82, cy = H + 2, r = c.sq ? 13 : 17;
        o.push(...rainbow(cx, cy, r, cols, c.sq ? 2 : 2.4), ...cloud(cx - r + 0.5, cy - 3.4, c.sq ? 3.6 : 4.4, wh, mix(sky, '#000000', 0.15)));
        const mw = c.sq ? W - 2 * m : W * 0.56;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5.2, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', w: 700, color: wh, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.4, size: 1.9, font: 't', w: 500, color: '#FFF3C4', fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: wh, fit: c.sq ? W * 0.5 : mw, size: 1.8, lh: 2.7, weight: 500 }));
        return { bg: { color: sky }, objs: o };
      },
    },

    // ------------------------------------------------------------ BRÁZDA – bio farma: brázdy poľa a slnko nad obzorom
    brazda: {
      name: tr('Brázda', 'Brázda'), fonts: 'fraunces', pal: 'dub', emblem: 'sun-horizon', tags: ['farma', 'bio', 'eko', 'zelenina', 'ovocie', 'med', 'vajcia', 'trh', 'vcelar', 'polnohospodar', 'syry', 'prirodne', 'tradicne', 'teple', 'rodinne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F6F0E6'); const sun = '#E9A23B', g1 = '#7E8C4E', g2 = '#5E6B3A', soil = mix(acc, '#3B2A1A', 0.35);
        const o = [];
        const hy = c.sq ? H * 0.5 : H * 0.52, sx = c.sq ? W * 0.7 : W * 0.74;
        o.push(...rays(sx, hy, 6.2, 9.6, 13, sun, 0.4, 180, 360), P(arcD(sx, hy, 5.4, 180, 360) + ' Z', { fill: sun }));
        const vx = sx, n = c.sq ? 9 : 11;
        o.push(R(-2, hy, W + 4, H - hy + 2, g2));
        for (let i = 0; i < n; i++) { const x0 = -6 + ((W + 12) * i) / n, x1 = -6 + ((W + 12) * (i + 1)) / n; o.push(P(`M ${f2(vx - 1 + (2 * i) / n)} ${f2(hy)} L ${f2(vx - 1 + (2 * (i + 1)) / n)} ${f2(hy)} L ${f2(x1)} ${f2(H + 2)} L ${f2(x0)} ${f2(H + 2)} Z`, { fill: i % 2 ? g1 : i % 3 ? soil : g2 })); }
        o.push(R(-2, hy - 0.3, W + 4, 0.6, ink, { opacity: 0.5 }));
        if (!c.sq) o.push(...sprig(W - m - 1, hy - 1, 12, -95, { color: mix(sun, ink, 0.3), leaves: 9, size: 2 }));
        const mw = c.sq ? W - 2 * m : W * 0.54;
        o.push(T(brand(c), { field: 'company', x: m, y: m + (c.sq ? 5 : 6), oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + (c.sq ? 6.2 : 7.3), size: 2, font: 'd', it: true, color: acc, fit: mw }));
        o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m + 0.1, oy: 'bottom', size: 2.2, font: 't', w: 700, color: '#FFFFFF', fit: c.sq ? W * 0.6 : W * 0.42 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F6F0E6'); const dk = '#4B5340', lt = '#F1ECE1', g = pal.foil ? FOIL(pal) : '#D9B26F';
        const o = [];
        const r = c.sq ? 9.5 : 11, cx = c.sq ? W / 2 : W - m - r, cy = c.sq ? m + r - 0.5 : H / 2;
        o.push(C(cx, cy, r, { stroke: g, sw: 0.26 }), C(cx, cy, r - 3.4, { stroke: g, sw: 0.12 }));
        o.push(...ringText(tr('Z NAŠEJ FARMY  ·  ', 'Z NAŠÍ FARMY  ·  ') + (city(c) || '').toLocaleUpperCase(), cx, cy, r - 1.7, 200, 340, { color: g, size: 1.75, w: 600 }));
        o.push(...sprig(cx, cy + r * 0.45, r * 0.95, -90, { color: g, leaves: 8, size: 1.8 }));
        const mw = c.sq ? W - 2 * m : W - 2 * m - 2 * r - 4;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? H * 0.66 : m + 6, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: lt, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: (c.sq ? H * 0.66 : m + 6) + 1.2, size: 1.9, font: 'd', it: true, color: mix(acc, lt, 0.4), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ GATSBY – art-deco noir: slnečné lúče, stupňovitý rám a vejáre
    gatsby: {
      name: 'Gatsby', fonts: 'cinzel', pal: 'onyx', emblem: 'martini', tags: ['bar', 'koktaily', 'klub', 'hotel', 'eventy', 'jazz', 'luxus', 'sperky', 'pravnik', 'reality', 'elegantne', 'tmave', 'luxusne', 'retro'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = DB(pal, '#151515'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [];
        const cx = W / 2, cy = H + (c.sq ? 2 : 4);
        o.push(...rays(cx, cy, c.sq ? 14 : 16, Math.max(W, H) * 1.2, 26, met, 0.1, 180, 360).map((l) => ({ ...l, opacity: 0.45 })));
        o.push(...decoFrame(W, H, 2.6, 2.4, g));
        o.push(...fan(cx, cy - (c.sq ? 2 : 4), c.sq ? 12 : 14, 14, g));
        const ny = c.sq ? H * 0.42 : H * 0.44;
        o.push(R(cx - (W - 2 * m) / 2, ny - 7, W - 2 * m, 10.4, bg, { opacity: 0.94 }));
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: cx, y: ny, ox: 'center', oy: 'bottom', size: c.sq ? 3.2 : 3.8, font: 'd', w: 600, color: ink, fit: W - 2 * m - 4, ls: 0.16 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: cx, y: ny + 1.3, ox: 'center', size: 1.7, font: 't', w: 500, ls: 0.3, color: met, fit: W - 2 * m - 4 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, ink } = DB(pal, '#151515'); const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [...scallops(-2, -1, W + 2, H + 2, 2.6, met, 0.12, 0.35)];
        const s = c.sq ? 8 : 9, cx = W / 2, cy = c.sq ? H * 0.32 : H * 0.36, k = s * 0.41;
        const oct = [[cx - k, cy - s], [cx + k, cy - s], [cx + s, cy - k], [cx + s, cy + k], [cx + k, cy + s], [cx - k, cy + s], [cx - s, cy + k], [cx - s, cy - k]];
        o.push(P('M ' + oct.map(([x, y]) => `${f2(x)} ${f2(y)}`).join(' L ') + ' Z', { fill: bg, stroke: g, sw: 0.3 }));
        o.push(MONO(c, { x: cx, y: cy + 0.3, ox: 'center', oy: 'center', size: s * 0.8, color: g, ls: 0.04 }));
        o.push(R(m - 1, H - m - (c.sq ? 7.4 : 7.6), W - 2 * m + 2, c.sq ? 9 : 9.2, bg, { opacity: 0.94 }));
        o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.8, lh: 2.7, ls: 0.06 }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ WABI – japandi: keramická váza, suchá vetvička a ticho
    wabi: {
      name: 'Wabi', fonts: 'marcellus', pal: 'piesok', emblem: 'leaf', tags: ['keramika', 'dizajn', 'interier', 'architekt', 'caj', 'joga', 'terapeut', 'remeslo', 'umelec', 'galeria', 'minimal', 'pokojne', 'prirodne', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#EFEBE4'); const clay = mix(acc, '#B5654A', 0.45);
        const o = [paper(c, 0.55)];
        const cx = c.sq ? W * 0.7 : W * 0.72, yb = c.sq ? H * 0.66 : H * 0.72, s = c.sq ? 0.9 : 1;
        o.push(Ln(c.sq ? W * 0.42 : W * 0.5, yb, W - 3, yb, ink, 0.12, { opacity: 0.7 }));
        o.push(P(`M ${f2(cx - 2.4 * s)} ${f2(yb)} C ${f2(cx - 7 * s)} ${f2(yb - 3 * s)} ${f2(cx - 6.4 * s)} ${f2(yb - 11 * s)} ${f2(cx - 1.6 * s)} ${f2(yb - 13 * s)} L ${f2(cx - 1.6 * s)} ${f2(yb - 16 * s)} L ${f2(cx + 1.6 * s)} ${f2(yb - 16 * s)} L ${f2(cx + 1.6 * s)} ${f2(yb - 13 * s)} C ${f2(cx + 6.4 * s)} ${f2(yb - 11 * s)} ${f2(cx + 7 * s)} ${f2(yb - 3 * s)} ${f2(cx + 2.4 * s)} ${f2(yb)} Z`, { fill: { grad: [mix(clay, '#FFFFFF', 0.12), clay, mix(clay, '#000000', 0.2)], angle: 0 } }));
        o.push(P(`M ${f2(cx - 5.6 * s)} ${f2(yb - 7 * s)} Q ${f2(cx)} ${f2(yb - 5.6 * s)} ${f2(cx + 5.6 * s)} ${f2(yb - 7 * s)}`, { stroke: mix(clay, '#FFFFFF', 0.4), sw: 0.2, opacity: 0.7 }));
        o.push(P(smooth([[cx, yb - 16 * s], [cx - 1 * s, yb - 22 * s], [cx + 2.4 * s, yb - 28 * s], [cx + 1 * s, yb - 33 * s]]), { stroke: ink, sw: 0.22 }));
        [[-1.2, -22, 2.4], [1.8, -26, -0.6], [1.4, -31, 2]].forEach(([dx, dy, a]) => o.push(P(leaf(cx + dx * s, yb + dy * s, a, 2.4, 0.7), { fill: ink, opacity: 0.85 })));
        o.push(P(oval(cx + 9 * s, yb - 1.1, 2.2 * s, 1.1 * s), { fill: mix(ink, bg, 0.35) }));
        const mw = c.sq ? W * 0.4 : W * 0.4;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? H * 0.86 : H * 0.62, oy: 'bottom', size: c.sq ? 3.2 : 4, font: 'd', color: ink, fit: c.sq ? W - 2 * m : mw, ls: 0.04 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: (c.sq ? H * 0.86 : H * 0.62) + 1.2, size: 1.8, font: 't', color: mix(ink, bg, 0.35), fit: c.sq ? W - 2 * m : mw }));
        if (!c.sq) { o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 2, size: 1.7, font: 't', w: 600, ls: 0.3, color: ink, fit: mw })); o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', color: ink, fit: mw })); }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { ink, acc } = LB(pal, '#EFEBE4'); const dk = lum(ink) < 0.15 ? ink : '#2A2622', lt = '#EFEBE4', red = '#A8402F';
        const o = [];
        const cx = c.sq ? W / 2 : W * 0.76, cy = c.sq ? H * 0.32 : H / 2, r = c.sq ? 9 : 11;
        o.push(P(arcD(cx, cy, r, -70, 230), { stroke: lt, sw: 0.18, opacity: 0.75 }));
        o.push(R(cx + r * 0.5, cy + r * 0.45, 4, 4, red, { rx: 0.5 }), T(mono(c), { x: cx + r * 0.5 + 2, y: cy + r * 0.45 + 2.1, ox: 'center', oy: 'center', size: 1.9, font: 'd', color: '#FFFFFF' }));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.66 : m + 5.4, oy: 'bottom', size: c.sq ? 3.2 : 3.8, font: 'd', color: lt, fit: mw, ls: 0.04 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: mix(lt, dk, 0.12), fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ RISO – risograf: prekrývajúce sa tvary, polotón a posun farieb
    riso: {
      name: 'Riso', fonts: 'archivo', pal: 'koral', emblem: 'palette', tags: ['grafik', 'dizajn', 'ilustrator', 'kreativ', 'agentura', 'tlac', 'umelec', 'hudba', 'kaviaren', 'festival', 'odvazne', 'farebne', 'hrave', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F4F0E6'); const pink = acc, blue = '#2F5BD9';
        const o = [];
        const cx = c.sq ? W * 0.64 : W * 0.76, cy = c.sq ? H * 0.32 : H * 0.4, r = c.sq ? 11 : 13;
        o.push(C(cx, cy, r, { fill: pink, opacity: 0.88 }));
        o.push(R(cx - r * 0.2, cy - r * 0.2, r * 1.3, r * 1.3, blue, { rot: 18, opacity: 0.78 }));
        o.push(...dotGrid(cx - r - 2, cy - r - 2, cx + r + 6, cy + r + 6, 1.15, (x, y) => { const d = Math.hypot(x - (cx - r * 0.6), y - (cy - r * 0.6)) / (r * 2.4); return Math.max(0, 0.42 * (1 - d)); }, ink, { stagger: true, opacity: 0.55 }));
        const mw = c.sq ? W - 2 * m : W * 0.46, ny = c.sq ? H * 0.78 : H * 0.62;
        const name = brand(c).toLocaleUpperCase();
        o.push(T(name, { x: m + 0.45, y: ny + 0.35, oy: 'bottom', size: c.sq ? 5 : 6.4, font: 'd', color: pink, fit: mw, opacity: 0.9 }));
        o.push(T(name, { field: 'company', x: m, y: ny, oy: 'bottom', size: c.sq ? 5 : 6.4, font: 'd', color: blue, fit: mw, opacity: 0.92 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ny + 1.2, size: 1.85, font: 't', w: 600, color: ink, fit: mw }));
        if (!c.sq) o.push(T(f.web || f.phone || '', { field: f.web ? 'web' : 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 600, color: ink, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { acc } = LB(pal, '#F4F0E6'); const blue = '#2F5BD9', cr = '#F4F0E6';
        const o = [...dotGrid(-1, -1, W + 1, H + 1, 1.4, (x, y) => Math.max(0, 0.5 * (x / W + y / H - 0.6)), acc, { stagger: true, opacity: 0.85 })];
        const mw = W - 2 * m;
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', color: cr, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 6.2, size: 1.85, font: 't', w: 600, color: cr, opacity: 0.85, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: cr, fit: c.sq ? mw : W * 0.6, size: 1.8, lh: 2.7, weight: 600 }));
        return { bg: { color: blue }, objs: o };
      },
    },

    // ------------------------------------------------------------ OPÁL – holografia: dúhový prechod, chrómové hviezdy a kruhy
    opal: {
      name: tr('Opál', 'Opál'), fonts: 'unbounded', pal: 'holo', emblem: 'sparkle', tags: ['kreativ', 'agentura', 'marketing', 'beauty', 'nechty', 'eventy', 'hudba', 'startup', 'influencer', 'dizajn', 'moderne', 'mlade', 'farebne', 'odvazne'],
      front(c) {
        const { W, H, f, pal, m } = c; const ink = lum(pal.ink) < 0.15 ? pal.ink : '#22183A', acc = pal.accent;
        const o = [];
        o.push(R(-2, -2, W + 4, H + 4, { grad: ['#E9D5FF', '#C7E8FF', '#D9FFE9', '#FFE8C7', '#FFD1EC', mix(acc, '#FFFFFF', 0.55)], angle: 35 }));
        o.push(C(W * 0.2, H * 0.1, W * 0.4, { fill: { grad: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)'], radial: true } }));
        o.push(C(W * 0.85, H * 0.9, W * 0.35, { fill: { grad: [mix(acc, '#FFFFFF', 0.4), 'rgba(255,255,255,0)'], radial: true }, opacity: 0.7 }));
        const cx = c.sq ? W * 0.7 : W * 0.76, cy = c.sq ? H * 0.32 : H * 0.42;
        for (let k = 1; k <= 4; k++) o.push(C(cx, cy, k * 3.2, { stroke: '#FFFFFF', sw: 0.14, opacity: 0.8 - k * 0.12 }));
        o.push(twinkle(cx, cy, c.sq ? 6 : 7.4, { grad: ['#FFFFFF', '#B9B6C9', '#FFFFFF', '#8E8AA6'], angle: 45 }), twinkle(cx + 9, cy - 6, 1.6, '#FFFFFF'), twinkle(cx - 8, cy + 7, 1.1, '#FFFFFF'));
        const mw = c.sq ? W - 2 * m : W * 0.52, ny = c.sq ? H * 0.74 : H * 0.62;
        o.push(T(f.name, { field: 'name', x: m, y: ny, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: ny + 1.2, size: 1.85, font: 't', w: 500, color: mix(ink, acc, 0.4), fit: mw }));
        if (!c.sq) o.push(T(f.web || f.phone || '', { field: f.web ? 'web' : 'phone', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', w: 500, color: ink, fit: mw }));
        return { bg: { color: '#EFE6FB' }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = lum(pal.ink) < 0.15 ? pal.ink : '#22183A', wh = '#FFFFFF';
        const holo = { grad: ['#E9D5FF', '#C7E8FF', '#D9FFE9', '#FFE8C7', '#FFD1EC'], angle: 20 };
        const o = [R(-2, H - 4, W + 4, 6, holo), R(-2, H - 4.4, W + 4, 0.4, '#FFFFFF', { opacity: 0.5 })];
        o.push(T(brand(c), { field: 'company', x: m, y: m + 5.4, oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', w: 700, color: holo, fit: W - 2 * m, ls: -0.02 }));
        o.push(...rows(c, { x: m, yb: H - 6.4, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: wh, fit: W - 2 * m, size: 1.8, lh: 2.7 }));
        return { bg: { color: ink }, objs: o };
      },
    },

    // ------------------------------------------------------------ HERBÁR – botanická rytina: papraď s lístkami a žilkami
    herbar: {
      name: tr('Herbár', 'Herbář'), fonts: 'caslon', pal: 'ivory', emblem: 'leaf', tags: ['caj', 'bylinky', 'kvetinarstvo', 'kozmetika', 'prirodna kozmetika', 'terapeut', 'farma', 'zahradnik', 'knihy', 'galeria', 'tradicne', 'prirodne', 'elegantne', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#F4EFE6'); const green = mix('#2E4A3A', ink, 0.25);
        const o = [paper(c, 0.6)];
        o.push(...fern(c.sq ? W * 0.6 : W * 0.62, H + 2, c.sq ? 34 : 40, -64, green, { n: 14, bend: 0.14, fill: 0.32, sw: 0.3 }));
        o.push(...fern(c.sq ? W * 0.9 : W * 0.88, H + 2, c.sq ? 22 : 26, -104, green, { n: 10, bend: -0.12, fill: 0.12, scale: 0.85 }));
        const lx = m, ly = m;
        o.push(T('No. ' + String(((brand(c).length * 7) % 89) + 10), { x: lx, y: ly + 1.6, size: 1.7, font: 't', w: 500, ls: 0.2, color: acc }));
        const mw = c.sq ? W * 0.5 : W * 0.48;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.4 : H * 0.44, oy: 'bottom', size: c.sq ? 3.8 : 4.8, font: 'd', it: true, color: ink, fit: mw }));
        o.push(Ln(m, (c.sq ? H * 0.4 : H * 0.44) + 1.4, m + 10, (c.sq ? H * 0.4 : H * 0.44) + 1.4, acc, 0.16));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: (c.sq ? H * 0.4 : H * 0.44) + 2.4, size: 1.85, font: 't', color: mix(ink, bg, 0.25), fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 600, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const dk = '#22382C', lt = '#F1EBDF', g = pal.foil ? FOIL(pal) : '#C9A15A', met = pal.foil ? MET(pal) : '#C9A15A';
        const o = [];
        o.push(...fern(c.sq ? W / 2 : W * 0.8, c.sq ? H * 0.5 : H - 4, c.sq ? 18 : 24, -90, met, { n: 11, bend: 0.06, fill: 0.25, sw: 0.2 }));
        const mw = c.sq ? W - 2 * m : W * 0.56;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? H * 0.66 : m + 6, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', it: true, color: lt, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: m, y: (c.sq ? H * 0.66 : m + 6) + 1.2, size: 1.85, font: 't', color: met, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : keys4(c), color: lt, fit: mw, size: 1.8, lh: 2.7 }));
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ BRUT – brutalizmus: hrubá mriežka, obrie číslo a strojopis
    brut: {
      name: 'Brut', fonts: 'archivo', pal: 'sneh', emblem: 'terminal', tags: ['it', 'programator', 'konzultant', 'dizajn', 'agentura', 'architekt', 'startup', 'fotograf', 'kreativ', 'hudba', 'odvazne', 'moderne', 'technicke', 'minimal'],
      front(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FFFFFF');
        const o = [];
        const lw = 0.6, gx = c.sq ? W * 0.5 : W * 0.62, gy = c.sq ? H * 0.5 : H * 0.56;
        o.push(R(2.6, 2.6, W - 5.2, H - 5.2, null, { stroke: ink, sw: lw }));
        o.push(Ln(gx, 2.6, gx, H - 2.6, ink, lw), Ln(2.6, gy, W - 2.6, gy, ink, lw));
        o.push(R(gx + lw / 2, gy + lw / 2, W - 2.6 - gx - lw, H - 2.6 - gy - lw, acc));
        o.push(T(mono(c), { x: gx + (W - 2.6 - gx) / 2, y: 2.6 + (gy - 2.6) / 2 + 0.6, ox: 'center', oy: 'center', size: c.sq ? 11 : 15, font: 'd', color: ink, fit: W - gx - 6 }));
        o.push(T('(01)', { x: gx + 1.4, y: gy + 1.4, size: 1.7, font: 'm', w: 500, color: on(acc) }));
        const mw = gx - 6;
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: 4.4, y: gy - 2.4, oy: 'bottom', size: c.sq ? 3.2 : 4, font: 'd', color: ink, fit: mw }));
        o.push(T('[' + (f.role || '') + ']', { field: 'role', x: 4.4, y: 4.6, size: 1.75, font: 'm', w: 500, color: ink, fit: mw }));
        o.push(...rows(c, { x: 4.6, yb: H - 4.6, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: ink, fit: mw, size: 1.75, lh: 2.5, font: 'm' }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const { bg, ink, acc } = LB(pal, '#FFFFFF'); const dk = lum(ink) < 0.15 ? ink : '#111111';
        const o = [];
        const ks = ['phone', 'email', 'web', 'address'].filter((k) => has(c, k)).slice(0, c.sq ? 3 : 4), lab = { phone: 'TEL', email: 'MAIL', web: 'WEB', address: 'ADR' };
        const rh = c.sq ? 7.2 : (H - 13) / Math.max(1, ks.length), y0 = H - 3 - rh * ks.length;
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: 4.4, y: 4.4, size: c.sq ? 3.4 : 4.2, font: 'd', color: bg, fit: W - 18 }));
        o.push(R(W - 9, 3, 6, 6, acc));
        ks.forEach((k, i) => { const y = y0 + i * rh; o.push(Ln(3, y, W - 3, y, bg, 0.4)); if (c.sq) o.push(T(lab[k], { x: 4.4, y: y + 1.2, size: 1.7, font: 'm', w: 500, color: acc }), T(c.f[k], { field: k, x: 4.4, y: y + rh - 0.9, oy: 'bottom', size: 1.8, font: 'm', w: 500, color: bg, fit: W - 8.8 })); else o.push(T(lab[k], { x: 4.4, y: y + rh / 2, oy: 'center', size: 1.7, font: 'm', w: 500, color: acc }), T(c.f[k], { field: k, x: 14, y: y + rh / 2, oy: 'center', size: 1.8, font: 'm', w: 500, color: bg, fit: W - 18 })); });
        return { bg: { color: dk }, objs: o };
      },
    },
  });
}
