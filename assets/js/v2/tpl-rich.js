// Vizitkomat – bohaté šablóny: znak odboru v odznaku/venci, zlaté ornamenty, akvarel, vlny, textúry, kontakty v kruhoch.
import { emblemURL } from './emblems.js';

export function ornaments(h) {
  const { T, R, C, Ln, P, QR, IMG, I, MONO, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, seeded, smooth, SCRIPT } = h;
  const FOIL = (pal) => 'foil:' + (pal.foil || 'gold');
  const f2 = (n) => n.toFixed(2);
  const first = (c) => splitName(bare(c.f.name) || c.f.name)[0] || c.f.name || '';
  const brand = (c) => c.f.company || bare(c.f.name) || '';
  const has = (c, k) => !!(c.f[k] && c.f[k].trim());

  // ---------- ornamenty ----------
  /** List (mandľa) od bodu v smere uhla */
  const leaf = (x, y, a, L, w) => {
    const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, tx = x + dx * L, ty = y + dy * L, mx = x + dx * L * 0.5, my = y + dy * L * 0.5;
    return `M ${f2(x)} ${f2(y)} Q ${f2(mx + nx * w)} ${f2(my + ny * w)} ${f2(tx)} ${f2(ty)} Q ${f2(mx - nx * w)} ${f2(my - ny * w)} ${f2(x)} ${f2(y)} Z`;
  };
  /** Ovál (elipsa natočená o uhol a, v radiánoch) */
  const oval = (cx, cy, rx, ry, a = 0) => { const k = 0.5523, co = Math.cos(a), si = Math.sin(a), p = (x, y) => `${f2(cx + x * co - y * si)} ${f2(cy + x * si + y * co)}`; return `M ${p(rx, 0)} C ${p(rx, ry * k)} ${p(rx * k, ry)} ${p(0, ry)} C ${p(-rx * k, ry)} ${p(-rx, ry * k)} ${p(-rx, 0)} C ${p(-rx, -ry * k)} ${p(-rx * k, -ry)} ${p(0, -ry)} C ${p(rx * k, -ry)} ${p(rx, -ry * k)} ${p(rx, 0)} Z`; };
  /** Kovová farba bez textúry (pre tenké linky) */
  const MET = (pal) => ({ rose: '#C08070', silver: '#A9ADB2', copper: '#B87333' }[pal && pal.foil] || '#C9A15A');
  /** Vetvička: stonka + listy striedavo, smerom k špičke menšie */
  const sprig = (x, y, len, ang, o = {}) => {
    const n = o.leaves || 7, bend = o.bend ?? 0.25, size = o.size || len * 0.22, out = [];
    const a = ang * Math.PI / 180, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    const cx = (x + ex) / 2 - Math.sin(a) * len * bend, cy = (y + ey) / 2 + Math.cos(a) * len * bend;
    const pt = (t) => [(1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ey];
    const tan = (t) => Math.atan2(2 * (1 - t) * (cy - y) + 2 * t * (ey - cy), 2 * (1 - t) * (cx - x) + 2 * t * (ex - cx));
    out.push(P(`M ${f2(x)} ${f2(y)} Q ${f2(cx)} ${f2(cy)} ${f2(ex)} ${f2(ey)}`, { stroke: o.color, sw: o.sw || 0.22 }));
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 0.6), [px, py] = pt(t), ta = tan(t), side = i % 2 ? 1 : -1, s = size * (1 - t * 0.45);
      if (o.side === 'left' && side > 0) continue; if (o.side === 'right' && side < 0) continue;
      out.push(P(leaf(px, py, ta + side * 0.75, s, s * 0.32), { fill: o.color, opacity: o.opacity ?? 1 }));
    }
    out.push(P(leaf(ex, ey, tan(1), size * 0.6, size * 0.2), { fill: o.color }));
    return out;
  };
  /** Vavrínový veniec okolo stredu (otvorený hore) */
  const wreath = (cx, cy, r, color, o = {}) => {
    const out = [], n = o.leaves || 10, gap = (o.gap ?? 40) * Math.PI / 180, s = o.size || r * 0.36, span = Math.PI - gap / 2 - 0.15;
    for (const side of [1, -1]) {
      const pts = [];
      for (let i = 0; i <= n; i++) { const t = i / n, a = Math.PI / 2 - side * (0.15 + t * span); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, a]); }
      out.push(P(smooth(pts.map((p) => [p[0], p[1]])), { stroke: color, sw: o.sw || 0.2 }));
      pts.slice(1).forEach(([px, py, a], i) => {
        const dir = a - side * Math.PI / 2, ls = s * (1 - (i / n) * 0.4);
        out.push(P(leaf(px, py, dir + side * 0.0 + 0.55 * side * -1 + 0, ls, ls * 0.3), { fill: color }));
        out.push(P(leaf(px, py, dir - 0.55 * side * -1, ls * 0.92, ls * 0.28), { fill: color }));
      });
    }
    return out;
  };
  /** Ozdobný oddeľovač s kosoštvorcom */
  const divider = (cx, y, w, color) => [
    Ln(cx - w / 2, y, cx - 1.6, y, color, 0.14), Ln(cx + 1.6, y, cx + w / 2, y, color, 0.14),
    P(`M ${f2(cx)} ${f2(y - 0.9)} L ${f2(cx + 0.9)} ${f2(y)} L ${f2(cx)} ${f2(y + 0.9)} L ${f2(cx - 0.9)} ${f2(y)} Z`, { fill: color }),
    C(cx - w / 2, y, 0.32, { fill: color }), C(cx + w / 2, y, 0.32, { fill: color }),
  ];
  /** Art-deco rám so stupňovitými rohmi */
  const decoFrame = (W, H, inset, step, color) => {
    const a = inset, b = inset + step, out = [];
    out.push(P(`M ${b} ${a} L ${W - b} ${a} L ${W - b} ${b - step + step} L ${W - a} ${b} L ${W - a} ${H - b} L ${W - b} ${H - b} L ${W - b} ${H - a} L ${b} ${H - a} L ${b} ${H - b} L ${a} ${H - b} L ${a} ${b} L ${b} ${b} Z`, { stroke: color, sw: 0.22 }));
    const i2 = inset + 1.3;
    out.push(R(i2 + step, i2 + step, W - 2 * (i2 + step), H - 2 * (i2 + step), null, { stroke: color, sw: 0.1 }));
    return out;
  };
  /** Art-deco vejár */
  const fan = (cx, cy, r, n, color) => {
    const out = [];
    for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; out.push(Ln(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, color, 0.14)); }
    for (const k of [0.45, 0.72, 1]) out.push(P(smooth(Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]; })), { stroke: color, sw: 0.16 }));
    return out;
  };
  /** Vlna vyplnená smerom dole (y = základná výška) */
  const waveFill = (W, H, y, amp, len, phase, fill, o = {}) => {
    const pts = []; for (let x = -4; x <= W + 4; x += len / 6) pts.push([x, y + Math.sin(x / len * Math.PI * 2 + phase) * amp]);
    const top = smooth(pts);
    return [P(`${top} L ${W + 4} ${H + 4} L -4 ${H + 4} Z`, { fill }), ...(o.line ? [P(top, { stroke: o.line, sw: o.sw || 0.3 })] : [])];
  };
  /** Text po oblúku (len horný/dolný oblúk) */
  const arcText = (text, cx, cy, r, a0, a1, o) => {
    const ch = [...text]; if (!ch.length) return [];
    return ch.map((t, i) => { const a = (a0 + (a1 - a0) * (ch.length === 1 ? 0.5 : i / (ch.length - 1))) * Math.PI / 180; const bottom = o.bottom; return T(t, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, ox: 'center', oy: 'center', size: o.size, font: o.font || 't', w: o.w || 600, color: o.color, rot: a * 180 / Math.PI + (bottom ? -90 : 90) }); });
  };
  /** Text po kruhu, ktorý sa zmestí: zmenší písmo a skráti po slovách */
  const ringText = (text, cx, cy, r, a0, a1, o) => {
    const arc = Math.abs(a1 - a0) * Math.PI / 180 * r, max = o.size || 2.2;
    let t = String(text || '').trim();
    const per = (n) => arc / Math.max(1, n - 1);
    while (t.length > 3 && per(t.length) < 1.7 * 0.92) t = t.slice(0, -1).replace(/\s+\S*$/, '') || t.slice(0, -1);
    const size = Math.max(1.7, Math.min(max, per(t.length) / 0.92));
    return arcText(t.replace(/[\s&,.-]+$/, ''), cx, cy, r, a0, a1, { ...o, size });
  };
  /** Rozostup písmen podľa dĺžky textu (dlhé texty užšie) */
  const lsFor = (t, base) => { const n = String(t || '').length; return n > 30 ? Math.min(base, 0.03) : n > 22 ? Math.min(base, 0.08) : n > 16 ? Math.min(base, 0.16) : base; };
  /** Dlhé texty s obmedzenou šírkou: najprv uberie rozostup písmen, aby sa zmestili bez zmenšenia pod minimum */
  const tidyObjs = (objs) => objs.map((o) => {
    if (!o || o.type !== 'text' || !o.fit || !o.ls || o.ls <= 0) return o;
    const t = String(o.text || ''), size = o.size || 2.2, up = t === t.toLocaleUpperCase();
    const w = t.length * size * ((up ? 0.68 : 0.52) + o.ls);
    if (w <= o.fit) return o;
    return { ...o, ls: Math.max(0, Math.min(o.ls, o.fit / (t.length * size) - (up ? 0.68 : 0.52))) };
  });
  const tidy = (set) => { for (const t of Object.values(set)) for (const side of ['front', 'back']) { const fn = t[side]; t[side] = (c) => { const r = fn(c); r.objs = tidyObjs(r.objs.filter(Boolean)); return r; }; } return set; };
  /** Znak odboru (alebo logo zákazníka) */
  const emblem = (c, x, y, s, color) => (c.logo ? IMG(c.logo, x, y, s * 1.4, s, { fit: 'contain', role: 'logo', ax: 'center', ay: 'center' }) : c.mark ? IMG(c.mark, x, y, s, s, { fit: 'contain', role: 'mark', tint: color, ax: 'center', ay: 'center' }) : IMG(emblemURL(c.emblem || 'star-four'), x, y, s, s, { fit: 'contain', role: 'mark', tint: color, ax: 'center', ay: 'center' }));
  const ICN = { phone: 'phone', email: 'mail', web: 'globe', address: 'map-pin' };
  /** Kontakty s ikonou v kruhu */
  const iconRows = (c, keys, o) => {
    const ks = keys.filter((k) => has(c, k)), lh = o.lh || 3.4, r = o.r || 1.2, out = [];
    ks.forEach((k, i) => {
      const y = o.y + i * lh;
      if (o.ring) out.push(C(o.x + r, y, r, { stroke: o.circle, sw: 0.14 })); else out.push(C(o.x + r, y, r, { fill: o.circle }));
      out.push(I(ICN[k], o.x + r - r * 0.62, y - r * 0.62, r * 1.24, o.icon || '#FFFFFF', { sw: 2 }));
      out.push(T(c.f[k], { field: k, x: o.x + r * 2 + 1.4, y, oy: 'center', size: o.size || 2, font: o.font || 't', w: o.w, color: o.color, fit: o.fit, ls: o.ls }));
    });
    return out;
  };
  /** Oblúk (polkruh navrchu) ako krivky */
  const arch = (x, yb, w, top) => { const r = w / 2, k = 0.5523 * r, t = top + r; return `M ${f2(x)} ${f2(yb)} L ${f2(x)} ${f2(t)} C ${f2(x)} ${f2(t - k)} ${f2(x + r - k)} ${f2(top)} ${f2(x + r)} ${f2(top)} C ${f2(x + r + k)} ${f2(top)} ${f2(x + w)} ${f2(t - k)} ${f2(x + w)} ${f2(t)} L ${f2(x + w)} ${f2(yb)} Z`; };
  const tex = (c, k) => `${c.root}assets/tex/${k}.jpg`;
  const confetti = (W, H, seed, cols, avoid = []) => { const r = seeded(seed), o = []; for (let i = 0, k = 0; k < 26 && i < 400; k++, i++) { const x = r() * W, y = r() * H, s = 0.5 + r() * 1.1, col = cols[i % cols.length]; if (avoid.some(([a, b, c2, d]) => x > a && x < c2 && y > b && y < d)) { k--; continue; } o.push(i % 3 ? C(x, y, s, { fill: col }) : R(x, y, s * 1.6, s * 1.6, col, { rot: r() * 90 })); } return o; };

  return { FOIL, MET, oval, f2, first, brand, has, leaf, sprig, wreath, divider, decoFrame, fan, waveFill, arcText, ringText, lsFor, tidy, emblem, ICN, iconRows, arch, tex, confetti };
}

export function richTemplates(h) {
  const { T, R, C, Ln, P, QR, IMG, I, MONO, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, seeded, smooth, SCRIPT } = h;
  const { FOIL, MET, oval, f2, first, brand, has, leaf, sprig, wreath, divider, decoFrame, fan, waveFill, arcText, ringText, tidy, emblem, iconRows, arch, tex, confetti } = ornaments(h);
  return tidy({
    glow: {
      name: 'Glow', fonts: 'playfair', pal: 'rosegold', emblem: 'flower-lotus', tags: ['beauty', 'kozmetika', 'salon', 'kader', 'nechty', 'wellness', 'masaz', 'svadba', 'elegantne', 'jemne', 'zenske', 'luxusne'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal), ink = '#5A2E2E';
        return { bg: { color: '#F8F0EC' }, objs: [
          IMG(c.root + 'assets/tex/blob-ruza.png', -16, -14, 56, 40, { role: 'art', blend: 'multiply', opacity: 0.9 }),
          IMG(c.root + 'assets/tex/blob-ruza.png', W - 42, H - 26, 60, 42, { role: 'art', blend: 'multiply', opacity: 0.9 }),
          ...sprig(4, 13, 20, -28, { color: g, leaves: 7, size: 4.2 }), ...sprig(W - 4, H - 12, 20, 152, { color: g, leaves: 7, size: 4.2 }),
          emblem(c, W / 2, H * 0.27, 10.5, g),
          T(brand(c), { field: 'company', x: W / 2, y: H * 0.57, ox: 'center', oy: 'center', size: 6.2, font: 'd', color: ink, fit: W - 26 }),
          ...divider(W / 2, H * 0.68, 26, g),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.77, ox: 'center', oy: 'center', size: 1.6, font: 't', w: 500, ls: 0.3, color: ink, fit: W - 28 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), ink = '#5A2E2E', pw = W * 0.38;
        return { bg: { color: '#FFFBF8' }, objs: [
          R(-2, -2, pw + 2, H + 4, '#F8ECE6'), IMG(c.root + 'assets/tex/blob-ruza.png', -14, H * 0.3, pw + 22, H * 0.9, { role: 'art', blend: 'multiply', opacity: 0.85 }),
          Ln(pw, m, pw, H - m, g, 0.18),
          emblem(c, pw / 2, H * 0.36, 9, g),
          T(brand(c), { field: 'company', x: pw / 2, y: H * 0.36 + 7.4, ox: 'center', oy: 'center', size: brand(c).length > 22 ? 2 : 2.6, font: brand(c).length > 22 ? 't' : 'd', color: ink, fit: pw - 7 }),
          T(f.name, { field: 'name', x: pw + 5, y: m + 4.4, oy: 'bottom', size: 4.4, font: 'd', it: true, color: g, fit: W - pw - 9 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: pw + 5, y: m + 6.4, size: 1.6, font: 't', w: 600, ls: 0.26, color: ink, fit: W - pw - 9 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: pw + 5, y: m + 13, lh: 3.3, r: 1.15, circle: '#C48573', color: ink, size: 1.95, fit: W - pw - 13 }),
        ] };
      },
    },

    saloon: {
      name: 'Saloon', fonts: 'cinzel', pal: 'onyx', emblem: 'crown-simple', tags: ['salon', 'kader', 'barber', 'beauty', 'luxus', 'hotel', 'reality', 'sperky', 'luxusne', 'tmave', 'elegantne'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal), cream = '#F5EFE3', dark = '#141414', px = W * 0.3;
        const panel = `M -3 -3 L ${f2(px)} -3 C ${f2(px + 6)} ${f2(H * 0.3)} ${f2(px - 7)} ${f2(H * 0.66)} ${f2(px + 1)} ${f2(H + 3)} L -3 ${f2(H + 3)} Z`;
        const edge = `M ${f2(px)} -3 C ${f2(px + 6)} ${f2(H * 0.3)} ${f2(px - 7)} ${f2(H * 0.66)} ${f2(px + 1)} ${f2(H + 3)}`;
        const cx = px + (W - px) / 2;
        return { bg: { color: cream }, objs: [
          P(panel, { fill: dark }), P(edge, { stroke: g, sw: 0.45 }),
          ...sprig(px * 0.35, H + 1, 24, -80, { color: g, leaves: 9, size: 4 }), ...sprig(px * 0.6, -1, 18, 100, { color: g, leaves: 6, size: 3.4, opacity: 0.8 }),
          emblem(c, cx, H * 0.2, 5.4, g),
          MONO(c, { x: cx, y: H * 0.43, ox: 'center', oy: 'center', size: 12, color: g, ls: -0.04 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: cx, y: H * 0.66, ox: 'center', oy: 'center', size: 2.8, font: 'd', ls: 0.3, color: dark, fit: W - px - 12 }),
          ...divider(cx, H * 0.74, 22, g),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: cx, y: H * 0.83, ox: 'center', oy: 'center', size: 1.45, font: 't', w: 600, ls: 0.26, color: '#6E655A', fit: W - px - 14 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), cream = '#F5EFE3', dark = '#141414', px = W * 0.4;
        const panel = `M ${f2(W + 3)} -3 L ${f2(px)} -3 C ${f2(px - 6)} ${f2(H * 0.3)} ${f2(px + 7)} ${f2(H * 0.66)} ${f2(px - 1)} ${f2(H + 3)} L ${f2(W + 3)} ${f2(H + 3)} Z`;
        const edge = `M ${f2(px)} -3 C ${f2(px - 6)} ${f2(H * 0.3)} ${f2(px + 7)} ${f2(H * 0.66)} ${f2(px - 1)} ${f2(H + 3)}`;
        return { bg: { color: dark }, objs: [
          P(panel, { fill: cream }), P(edge, { stroke: g, sw: 0.45 }),
          emblem(c, px / 2, H * 0.3, 6.5, g),
          MONO(c, { x: px / 2, y: H * 0.52, ox: 'center', oy: 'center', size: 7, color: g }),
          T(([f.tagline, brand(c), f.role].find((t) => t && t.length <= 26) || '').toLocaleUpperCase(), { field: 'tagline', x: px / 2, y: H * 0.76, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 500, ls: 0.22, color: g, fit: px - 9 }),
          T(f.name, { field: 'name', x: px + 7, y: m + 3.2, oy: 'bottom', size: 3, font: 'd', w: 600, color: dark, fit: W - px - 11 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: px + 7, y: m + 4.3, size: 1.5, font: 't', w: 600, ls: 0.24, color: '#6E655A', fit: W - px - 11 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: px + 7, y: m + 11, lh: 3.2, r: 1.1, circle: dark, icon: '#D9BB72', color: dark, size: 1.9, fit: W - px - 15 }),
        ] };
      },
    },

    builders: {
      name: tr('Stavby', 'Stavby'), fonts: 'cinzel', pal: 'noblesa', emblem: 'buildings', tags: ['stavba', 'reality', 'developer', 'architekt', 'firma', 'financie', 'investicie', 'luxusne', 'serioze', 'tmave', 'firemne'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal), s = 'foil:silver';
        return { bg: { color: '#0F1A33', art: tex(c, 'navy'), artOpacity: 0.3 }, objs: [
          P(`M ${W * 0.62} -3 L ${W + 3} -3 L ${W + 3} ${H * 0.36} Z`, { fill: s }),
          P(`M ${W * 0.7} -3 L ${W + 3} -3 L ${W + 3} ${H * 0.24} Z`, { fill: g }),
          P(`M -3 ${H * 0.72} L ${W * 0.34} ${H + 3} L -3 ${H + 3} Z`, { fill: s }),
          P(`M -3 ${H * 0.82} L ${W * 0.22} ${H + 3} L -3 ${H + 3} Z`, { fill: g }),
          emblem(c, W / 2, H * 0.27, 11, g),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.55, ox: 'center', oy: 'center', size: 5.4, font: 'd', w: 600, ls: 0.12, color: g, fit: W - 22 }),
          ...divider(W / 2, H * 0.66, 30, g),
          T(f.tagline || f.role || '', { field: 'tagline', x: W / 2, y: H * 0.77, ox: 'center', oy: 'center', size: 3.4, font: SCRIPT, color: g, fit: W - 30 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), px = W * 0.6;
        return { bg: { color: '#0F1A33', art: tex(c, 'navy'), artOpacity: 0.3 }, objs: [
          IMG(c.photo || c.scene('beton'), px, -2, W - px + 2, H + 4, { role: 'photo' }),
          P(`M ${px - 1} -3 L ${px + 9} -3 L ${px - 1} ${H + 3} Z`, { fill: '#0F1A33' }),
          Ln(px + 9, -3, px - 1, H + 3, g, 0.5),
          emblem(c, m + 3.4, m + 3, 6, g),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m + 8, y: m + 3, oy: 'center', size: 2.6, font: 'd', w: 600, ls: 0.1, color: g, fit: px - m - 14 }),
          T(f.name, { field: 'name', x: m, y: m + 10.5, oy: 'bottom', size: 2.6, font: 't', w: 600, color: '#FFFFFF', fit: px - m - 6 }),
          T(f.role, { field: 'role', x: m, y: m + 11.3, size: 1.8, font: 't', color: '#C9CED8', fit: px - m - 6 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.55, lh: 3.2, r: 1.1, circle: '#C9A15A', icon: '#0F1A33', color: '#FFFFFF', size: 1.85, fit: px - m - 10 }),
        ] };
      },
    },

    cafe: {
      name: tr('Kaviareň', 'Kavárna'), fonts: 'playfair', pal: 'cokolada', emblem: 'coffee', tags: ['kaviaren', 'gastro', 'bistro', 'pekaren', 'cukraren', 'restauracia', 'caj', 'teple', 'tradicne', 'hrave'],
      front(c) {
        const { W, H, f, pal } = c; const brown = '#3B2418', caramel = '#B07A4A', cream = '#F3E8DA'; const r = seeded(f.name + 'cf'); const beans = [];
        for (let i = 0, n = 0; i < 200 && n < 16; i++) {
          const x = r() * W, y = r() * H * 0.82, a = r() * Math.PI;
          if (x > W * 0.16 && x < W * 0.84 && y > H * 0.1) continue;
          n++; const dx = Math.cos(a), dy = Math.sin(a), L = 3.2;
          beans.push(P(oval(x, y, L / 2, L * 0.34, a), { fill: '#E6D5BF' }));
          beans.push(P(`M ${f2(x - dx * L * 0.38)} ${f2(y - dy * L * 0.38)} Q ${f2(x - dy * 0.35)} ${f2(y + dx * 0.35)} ${f2(x + dx * L * 0.38)} ${f2(y + dy * L * 0.38)}`, { stroke: '#F3E8DA', sw: 0.22 }));
        }
        const words = brand(c).split(/\s+/); const main = words.length > 1 ? words.slice(1).join(' ') : words[0]; const pre = words.length > 1 ? words[0] : (f.role || '');
        return { bg: { color: cream }, objs: [
          ...beans,
          ...waveFill(W, H, H * 0.86, 1.6, 34, 0.6, brown, { line: caramel, sw: 0.5 }),
          emblem(c, W / 2, H * 0.24, 9, brown),
          T(main, { field: 'company', x: W / 2, y: H * 0.5, ox: 'center', oy: 'center', size: 7.2, font: 'd', it: true, w: 700, color: brown, fit: W - 22 }),
          Ln(W / 2 - 25, H * 0.63, W / 2 - 12.5, H * 0.63, caramel, 0.16), Ln(W / 2 + 12.5, H * 0.63, W / 2 + 25, H * 0.63, caramel, 0.16),
          C(W / 2 - 25, H * 0.63, 0.35, { fill: caramel }), C(W / 2 + 25, H * 0.63, 0.35, { fill: caramel }),
          T(pre.toLocaleUpperCase(), { x: W / 2, y: H * 0.63, ox: 'center', oy: 'center', size: 1.6, font: 't', w: 700, ls: 0.4, color: caramel, fit: 20 }),
          T(f.tagline || '', { field: 'tagline', x: W / 2, y: H * 0.74, ox: 'center', oy: 'center', size: 3, font: SCRIPT, color: brown, fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const brown = '#3B2418', caramel = '#C9935F', cream = '#F3E8DA', px = W * 0.62, qs = 12;
        const panel = `M ${f2(px)} -3 C ${f2(px - 8)} ${f2(H * 0.35)} ${f2(px + 8)} ${f2(H * 0.65)} ${f2(px - 2)} ${f2(H + 3)} L ${W + 3} ${H + 3} L ${W + 3} -3 Z`;
        return { bg: { color: brown }, objs: [
          P(panel, { fill: cream }),
          T(f.name, { field: 'name', x: m, y: m + 3, oy: 'bottom', size: 2.8, font: 'd', it: true, w: 700, color: cream, fit: px - m - 6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 4, size: 1.5, font: 't', w: 600, ls: 0.24, color: caramel, fit: px - m - 6 }),
          ...iconRows(c, ['phone', 'email', 'address'], { x: m, y: H * 0.5, lh: 3.4, r: 1.15, circle: caramel, icon: brown, color: cream, size: 1.9, fit: px - m - 12 }),
          emblem(c, px + (W - px) / 2 + 1, m + 3.2, 6, brown),
          R(px + (W - px) / 2 + 1 - qs / 2, H * 0.36, qs, qs, '#FFFFFF'), QR(px + (W - px) / 2 + 1 - qs / 2 + 0.6, H * 0.36 + 0.6, qs - 1.2, brown),
          T(tr('Naskenujte', 'Naskenujte'), { x: px + (W - px) / 2 + 1, y: H * 0.36 + qs + 2.4, ox: 'center', oy: 'center', size: 1.6, font: 't', w: 600, color: brown }),
        ] };
      },
    },

    samet: {
      name: tr('Zamat', 'Samet'), fonts: 'cinzel', pal: 'onyx', emblem: 'buildings', tags: ['reality', 'pravnik', 'financie', 'luxus', 'hotel', 'architekt', 'konzultant', 'manazer', 'luxusne', 'tmave', 'serioze', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal);
        return { bg: { color: '#141414', art: tex(c, 'samet'), artOpacity: 0.9 }, objs: [
          R(-2, -2, W + 4, H + 4, '#000000', { opacity: 0.45 }),
          emblem(c, m + 9, H / 2 - 2, 15, g),
          Ln(m + 17, H * 0.62, W + 2, H * 0.62, g, 0.25),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W - m, y: H * 0.62 - 1.4, ox: 'right', oy: 'bottom', size: 3.4, font: 'd', w: 600, ls: 0.16, color: g, fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W - m, y: H * 0.62 + 1.5, ox: 'right', size: 1.65, font: 'd', ls: 0.3, color: g, fit: W * 0.5 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), qs = 13;
        return { bg: { color: '#141414', art: tex(c, 'samet'), artOpacity: 0.9 }, objs: [
          R(-2, -2, W + 4, H + 4, '#000000', { opacity: 0.5 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: m + 3, oy: 'bottom', size: 3.4, font: 'd', w: 600, ls: 0.1, color: g, fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 4.2, size: 1.6, font: 'd', ls: 0.26, color: g, fit: W * 0.6 }),
          R(W - m - qs - 0.6, m - 0.6, qs + 1.2, qs + 1.2, '#F2EEE6'), QR(W - m - qs, m, qs, '#141414'),
          T(tr('NAPÍŠTE MI', 'NAPIŠTE MI'), { x: W - m - qs / 2, y: m + qs + 2, ox: 'center', oy: 'center', size: 1.4, font: 'd', ls: 0.2, color: g }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: H * 0.6, oy: 'bottom', size: 2.6, font: 'd', w: 600, ls: 0.14, color: g, fit: W * 0.6 }),
          Ln(m, H * 0.6 + 1.2, W - m, H * 0.6 + 1.2, g, 0.18),
          ...[[f.email, f.web].filter(Boolean).join('   |   '), [f.phone, f.address].filter(Boolean).join('   |   ')].map((t, i) => T(t, { x: m, y: H - m - (1 - i) * 3, oy: 'bottom', size: 1.75, font: 'd', ls: 0.04, color: '#E8E2D6', fit: W - 2 * m })),
        ] };
      },
    },

    venec: {
      name: tr('Veniec', 'Věnec'), fonts: 'cinzel', pal: 'noblesa', emblem: 'star-four', tags: ['pravnik', 'vino', 'hotel', 'svadba', 'reality', 'financie', 'remeslo', 'pekaren', 'luxusne', 'klasicky', 'elegantne', 'tradicne'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal), ink = '#24201B', r = H * 0.27;
        return { bg: { color: '#F4EFE6', art: tex(c, 'papier'), artOpacity: 0.5 }, objs: [
          ...wreath(W / 2, H * 0.4, r, g, { leaves: 10, size: 3.6 }),
          logoOr(c, W / 2, H * 0.4, r * 1.1, r * 1.1, { tint: g }, MONO(c, { x: W / 2, y: H * 0.4, ox: 'center', oy: 'center', size: 8.4, color: g, ls: -0.02 })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.8, ox: 'center', oy: 'center', size: 3, font: 'd', w: 600, ls: 0.24, color: ink, fit: W - 20 }),
          T((city(c) || f.role || '').toLocaleUpperCase(), { x: W / 2, y: H * 0.88, ox: 'center', oy: 'center', size: 1.5, font: 't', w: 600, ls: 0.4, color: '#8A7D6A', fit: W - 30 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal); const bg = pal.bg && luminance(pal.bg) < 0.3 ? pal.bg : '#14213D';
        return { bg: { color: bg }, objs: [
          ...wreath(W / 2, m + 5, 4.4, g, { leaves: 6, size: 1.6, sw: 0.14 }), MONO(c, { x: W / 2, y: m + 5, ox: 'center', oy: 'center', size: 3, color: g }),
          T(f.name, { field: 'name', x: W / 2, y: H * 0.47, ox: 'center', oy: 'center', size: 3.8, font: 'd', w: 600, ls: 0.06, color: g, fit: W - 20 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.47 + 3.6, ox: 'center', oy: 'center', size: 1.6, font: 't', ls: 0.32, color: '#E8E2D6', fit: W - 24 }),
          ...divider(W / 2, H * 0.68, 30, g),
          T([f.phone, f.email].filter(Boolean).join('   ·   '), { x: W / 2, y: H * 0.77, ox: 'center', oy: 'center', size: 1.85, font: 't', color: '#E8E2D6', fit: W - 16 }),
          T([f.web, f.address].filter(Boolean).join('   ·   '), { x: W / 2, y: H * 0.77 + 3, ox: 'center', oy: 'center', size: 1.85, font: 't', color: '#E8E2D6', fit: W - 16 }),
        ] };
      },
    },

    deco: {
      name: 'Art Deco', fonts: 'cinzel', pal: 'onyx', emblem: 'diamond', tags: ['hotel', 'bar', 'vino', 'luxus', 'sperky', 'event', 'pravnik', 'reality', 'luxusne', 'tmave', 'elegantne', 'retro'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal);
        return { bg: { color: '#111111' }, objs: [
          ...decoFrame(W, H, 3, 3, g),
          ...fan(W / 2, H * 0.42, 9, 14, g),
          C(W / 2, H * 0.42, 1, { fill: g }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.6, ox: 'center', oy: 'center', size: 4.2, font: 'd', w: 600, ls: 0.2, color: g, fit: W - 24 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.71, ox: 'center', oy: 'center', size: 1.5, font: 't', w: 500, ls: 0.4, color: '#CFC6B4', fit: W - 30 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal);
        return { bg: { color: '#111111' }, objs: [
          ...decoFrame(W, H, 3, 3, g),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: H * 0.32, ox: 'center', oy: 'center', size: 3.4, font: 'd', w: 600, ls: 0.16, color: g, fit: W - 26 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.32 + 3.6, ox: 'center', oy: 'center', size: 1.5, font: 't', ls: 0.36, color: '#CFC6B4', fit: W - 30 }),
          ...divider(W / 2, H * 0.52, 22, g),
          ...[f.phone, f.email, f.web].filter(Boolean).map((t, i) => T(t, { x: W / 2, y: H * 0.63 + i * 3, ox: 'center', oy: 'center', size: 1.85, font: 't', ls: 0.06, color: '#E8E2D6', fit: W - 26 })),
        ] };
      },
    },

    vetvicka: {
      name: tr('Vetvička', 'Větvička'), fonts: 'cinzel', pal: 'olive', emblem: 'leaf', tags: ['kvety', 'wellness', 'joga', 'kozmetika', 'eko', 'zahrady', 'svadba', 'terapeut', 'prirodne', 'elegantne', 'jemne', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), cream = '#F1ECE1';
        return { bg: { color: pal.bg && luminance(pal.bg) < 0.35 ? pal.bg : '#4B5340' }, objs: [
          ...sprig(W * 0.62, H + 2, 34, -62, { color: g, leaves: 11, size: 5.4, bend: 0.3 }),
          ...sprig(W * 0.8, H + 2, 24, -96, { color: g, leaves: 8, size: 4.2, bend: -0.2, opacity: 0.9 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m + 1, y: H * 0.44, oy: 'bottom', size: 3.6, font: 'd', w: 600, ls: 0.1, color: cream, fit: W * 0.55 }),
          T(f.role || '', { field: 'role', x: m + 2, y: H * 0.44 + 1.2, size: 5, font: SCRIPT, color: '#E8D7A8', fit: W * 0.5 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), ink = '#3A3D30';
        return { bg: { color: '#F4F0E7', art: tex(c, 'papier'), artOpacity: 0.5 }, objs: [
          ...sprig(W - 2, -2, 20, 125, { color: g, leaves: 8, size: 3.6 }), ...sprig(W + 1, H - 3, 26, 196, { color: g, leaves: 9, size: 3.8, bend: -0.2, opacity: 0.85 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 2.6, oy: 'bottom', size: 2.8, font: 'd', w: 600, ls: 0.16, color: ink, fit: W * 0.6 }),
          T(f.tagline || '', { field: 'tagline', x: m, y: m + 3.6, size: 1.8, font: 't', it: false, color: '#7A7563', fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.47, lh: 3.3, r: 1.15, ring: true, circle: '#B08A4A', icon: '#8C6B2E', color: ink, size: 1.95, fit: W * 0.7 }),
        ] };
      },
    },

    mramorzlato: {
      name: tr('Mramor a zlato', 'Mramor a zlato'), fonts: 'cinzel', pal: 'ivory', emblem: 'diamond', tags: ['beauty', 'kozmetika', 'sperky', 'svadba', 'interier', 'reality', 'salon', 'luxus', 'luxusne', 'elegantne', 'jemne'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal), r = H * 0.25;
        return { bg: { color: '#F2F0EC', art: c.scene('mramor'), artOpacity: 1 }, objs: [
          C(W / 2, H * 0.42, r, { stroke: g, sw: 0.45 }), C(W / 2, H * 0.42, r - 1.2, { stroke: g, sw: 0.14 }),
          logoOr(c, W / 2, H * 0.42, r * 1.2, r * 1.2, { tint: g }, MONO(c, { x: W / 2, y: H * 0.42, ox: 'center', oy: 'center', size: 8.4, color: g, ls: -0.04 })),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: H * 0.8, ox: 'center', oy: 'center', size: 2.9, font: 'd', w: 600, ls: 0.26, color: '#2A2622', fit: W - 22 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.8 + 3.2, ox: 'center', oy: 'center', size: 1.45, font: 't', w: 600, ls: 0.34, color: '#7A6F60', fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), lt = '#E9E2D4';
        return { bg: { color: '#1D1B18', art: c.scene('mramor'), artOpacity: 0.08 }, objs: [
          R(3.2, 3.2, W - 6.4, H - 6.4, null, { stroke: g, sw: 0.35 }), R(4.4, 4.4, W - 8.8, H - 8.8, null, { stroke: g, sw: 0.12 }),
          C(W / 2, m + 5.2, 4.2, { stroke: g, sw: 0.25 }),
          MONO(c, { x: W / 2, y: m + 5.2, ox: 'center', oy: 'center', size: 3.4, color: g }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.45, ox: 'center', oy: 'center', size: 2.9, font: 'd', w: 600, ls: 0.24, color: g, fit: W - 22 }),
          ...[f.phone, f.email, f.web, f.address].filter(Boolean).map((t, i) => T(t, { x: W / 2, y: H * 0.58 + i * 2.9, ox: 'center', oy: 'center', size: 1.85, font: 't', w: 400, color: lt, fit: W - 22 })),
        ] };
      },
    },

    vlnyluxe: {
      name: tr('Vlny luxe', 'Vlny luxe'), fonts: 'playfair', pal: 'noblesa', emblem: 'drop-half', tags: ['wellness', 'spa', 'lekar', 'zubar', 'more', 'cestovanie', 'hotel', 'konzultant', 'financie', 'elegantne', 'moderne', 'serioze'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), navy = '#14213D', teal = '#2C5F6E';
        return { bg: { color: '#F7F4EE' }, objs: [
          ...waveFill(W, H, H * 0.62, 2.4, 40, 0.3, mix(teal, '#FFFFFF', 0.6)),
          ...waveFill(W, H, H * 0.7, 2.2, 36, 1.6, teal, { line: g, sw: 0.4 }),
          ...waveFill(W, H, H * 0.8, 2, 44, 2.6, navy, { line: g, sw: 0.3 }),
          emblem(c, m + 4, m + 4, 7, g),
          T(brand(c), { field: 'company', x: m + 9.5, y: m + 4, oy: 'center', size: 3.6, font: 'd', color: navy, fit: W * 0.6 }),
          T(f.name, { field: 'name', x: W - m, y: H * 0.46, ox: 'right', oy: 'bottom', size: 3, font: 'd', it: true, color: navy, fit: W * 0.55 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W - m, y: H * 0.46 + 0.8, ox: 'right', size: 1.5, font: 't', w: 600, ls: 0.24, color: '#6A6F7C', fit: W * 0.55 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal), navy = '#14213D';
        return { bg: { color: navy }, objs: [
          P(`M -4 ${H * 0.2} ${smooth(Array.from({ length: 9 }, (_, i) => [i * W / 8, H * 0.2 + Math.sin(i * 0.9) * 1.6])).slice(1)}`, { stroke: g, sw: 0.3 }),
          emblem(c, W - m - 4, m + 3.5, 7, g),
          T(f.name, { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 3.4, font: 'd', color: '#FFFFFF', fit: W * 0.6 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: H * 0.42 + 0.9, size: 1.5, font: 't', w: 600, ls: 0.24, color: '#AEB6C8', fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web'], { x: m, y: H * 0.66, lh: 3.2, r: 1.1, circle: '#C9A15A', icon: navy, color: '#FFFFFF', size: 1.9, fit: W * 0.7 }),
        ] };
      },
    },

    boho: {
      name: 'Boho', fonts: 'playfair', pal: 'terakota', emblem: 'sun-horizon', tags: ['joga', 'wellness', 'kozmetika', 'kvety', 'butik', 'kaviaren', 'foto', 'svadba', 'terapeut', 'prirodne', 'teple', 'hrave', 'zenske'],
      front(c) {
        const { W, H, f } = c; const sand = '#EADBC8', terra = '#C2643F', clay = '#9C4A2F', ochre = '#D9A15B', ink = '#3A2318'; const ax = W * 0.68;
        return { bg: { color: sand }, objs: [
          P(arch(ax - 15, H + 3, 30, H * 0.45 - 15), { fill: mix(terra, sand, 0.55) }),
          P(arch(ax - 10, H + 3, 20, H * 0.6 - 10), { fill: terra }),
          C(ax, H * 0.36, 4.2, { fill: ochre }),
          P(`M ${ax - 22} ${H + 3} Q ${ax - 8} ${H * 0.72} ${ax + 4} ${H * 0.86} Q ${ax + 16} ${H * 0.96} ${ax + 26} ${H * 0.78} L ${ax + 26} ${H + 3} Z`, { fill: clay }),
          T(first(c), { field: 'name', part: 0, x: W * 0.06, y: H * 0.44, oy: 'center', size: 9, font: SCRIPT, color: ink, fit: W * 0.5 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W * 0.07, y: H * 0.62, size: 1.6, font: 't', w: 600, ls: 0.3, color: clay, fit: W * 0.42 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const terra = '#C2643F', ochre = '#D9A15B', ink = '#3A2318';
        return { bg: { color: terra }, objs: [
          P(arch(W - 26, H + 3, 22, H * 0.42), { fill: mix(terra, '#FFF4EA', 0.18) }), P(arch(W - 22, H + 3, 14, H * 0.58), { fill: mix(terra, '#000000', 0.12) }),
          C(W - 15, H * 0.5, 3.2, { fill: ochre }),
          T(f.name, { field: 'name', x: m, y: m + 3.4, oy: 'bottom', size: 3.6, font: 'd', color: '#FFF4EA', fit: W * 0.6 }),
          T(brand(c), { field: 'company', x: m, y: m + 4.4, size: 2, font: 'd', it: true, color: '#F6D9C2', fit: W * 0.6 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.5, lh: 3.2, r: 1.1, circle: '#FFF4EA', icon: terra, color: '#FFF4EA', size: 1.9, fit: W * 0.52 }),
        ] };
      },
    },

    odznak: {
      name: tr('Odznak', 'Odznak'), fonts: 'bebas', pal: 'onyx', emblem: 'scissors', tags: ['barber', 'pivovar', 'remeslo', 'stolar', 'auto', 'tetovanie', 'bar', 'pekaren', 'retro', 'tmave', 'odvazne', 'tradicne'],
      front(c) {
        const { W, H, f } = c; const cream = '#EFE6D2', dark = '#1C1B19', cx = W / 2, cy = H * 0.43, r = H * 0.32;
        const top = brand(c).toLocaleUpperCase(), bot = (city(c) || f.role || '').toLocaleUpperCase();
        return { bg: { color: dark }, objs: [
          C(cx, cy, r, { stroke: cream, sw: 0.5 }), C(cx, cy, r - 1.2, { stroke: cream, sw: 0.18 }), C(cx, cy, r - 5.6, { stroke: cream, sw: 0.18 }),
          ...ringText(top, cx, cy, r - 3.3, -150, -30, { size: 2.2, font: 'd', color: cream }),
          ...ringText(bot, cx, cy, r - 3.3, 135, 45, { size: 1.9, font: 'd', color: cream, bottom: true }),
          T('★', { x: cx - r + 3.2, y: cy, ox: 'center', oy: 'center', size: 1.6, font: 't', color: cream }), T('★', { x: cx + r - 3.2, y: cy, ox: 'center', oy: 'center', size: 1.6, font: 't', color: cream }),
          emblem(c, cx, cy, r * 0.66, cream),
          P(`M ${cx - 24} ${H * 0.8} L ${cx - 20} ${H * 0.86} L ${cx - 24} ${H * 0.92} L ${cx + 24} ${H * 0.92} L ${cx + 20} ${H * 0.86} L ${cx + 24} ${H * 0.8} Z`, { fill: cream }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: cx, y: H * 0.865, ox: 'center', oy: 'center', size: 2.6, font: 'd', ls: 0.12, color: dark, fit: 38 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const cream = '#EFE6D2', dark = '#1C1B19';
        return { bg: { color: cream }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: m + 3.6, ox: 'center', oy: 'center', size: 5, font: 'd', ls: 0.06, color: dark, fit: W - 18 }),
          ...divider(W / 2, m + 8.4, 40, dark),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: m + 12, ox: 'center', oy: 'center', size: 2, font: 'd', ls: 0.2, color: dark, fit: W - 20 }),
          ...[[f.phone, f.email].filter(Boolean).join('   ★   '), [f.web, f.address].filter(Boolean).join('   ★   ')].map((t, i) => T(t.toLocaleUpperCase(), { x: W / 2, y: H - m - 4 + i * 3.2, ox: 'center', oy: 'center', size: 2, font: 'd', ls: 0.08, color: dark, fit: W - 16 })),
        ] };
      },
    },

    medic: {
      name: tr('Medic', 'Medic'), fonts: 'poppins', pal: 'more', emblem: 'tooth', tags: ['lekar', 'zubar', 'ambulancia', 'fyzioterapia', 'veterina', 'lekaren', 'kozmetika', 'ciste', 'moderne', 'serioze', 'doveryhodne'],
      front(c) {
        const { W, H, f, pal, m } = c; const teal = '#1F8A86', dark = '#12302F'; const o = [];
        for (let y = 4; y < H; y += 6) for (let x = W * 0.55; x < W; x += 6) { o.push(Ln(x - 0.6, y, x + 0.6, y, '#E3F0EF', 0.25)); o.push(Ln(x, y - 0.6, x, y + 0.6, '#E3F0EF', 0.25)); }
        return { bg: { color: '#FFFFFF' }, objs: [
          ...o,
          P(`M ${W * 0.62} -3 C ${W * 0.5} ${H * 0.35} ${W * 0.78} ${H * 0.62} ${W * 0.66} ${H + 3} L ${W + 3} ${H + 3} L ${W + 3} -3 Z`, { fill: teal }),
          P(`M ${W * 0.7} -3 C ${W * 0.58} ${H * 0.35} ${W * 0.86} ${H * 0.62} ${W * 0.74} ${H + 3} L ${W + 3} ${H + 3} L ${W + 3} -3 Z`, { fill: dark }),
          C(W * 0.84, H / 2, 7.4, { fill: '#FFFFFF' }), emblem(c, W * 0.84, H / 2, 9, teal),
          T(f.name, { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 3.8, font: 'd', w: 600, color: dark, fit: W * 0.5 }),
          T(f.role || '', { field: 'role', x: m, y: H * 0.42 + 0.9, size: 2.1, font: 't', w: 500, color: teal, fit: W * 0.5 }),
          T(brand(c), { field: 'company', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 600, color: '#5E7774', fit: W * 0.5 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const teal = '#1F8A86', dark = '#12302F';
        return { bg: { color: '#F3F9F8' }, objs: [
          R(-2, -2, W + 4, 11, teal), T(brand(c), { field: 'company', x: m, y: 4.9, oy: 'center', size: 2.4, font: 't', w: 600, color: '#FFFFFF', fit: W * 0.7 }),
          ...iconRows(c, ['phone', 'email', 'web', 'address'], { x: m, y: H * 0.36, lh: 3.6, r: 1.25, circle: teal, color: dark, size: 2.05, fit: W * 0.62 }),
          R(W - m - 12.6, H * 0.38 - 0.6, 13.2, 13.2, '#FFFFFF'), QR(W - m - 12, H * 0.38, 12, dark),
        ] };
      },
    },

    konfety: {
      name: tr('Konfety', 'Konfety'), fonts: 'rubik', pal: 'pastel', emblem: 'balloon', tags: ['deti', 'skola', 'cukraren', 'event', 'oslavy', 'hracky', 'kreativ', 'hrave', 'farebne', 'mlade', 'odvazne'],
      front(c) {
        const { W, H, f } = c; const cols = ['#FF5A1F', '#2F6BFF', '#18A058', '#F2B705', '#E84D8A']; const ink = '#1E1B3A';
        return { bg: { color: '#FFF4E8' }, objs: [
          ...confetti(W, H, f.name, cols, [[W * 0.06, H * 0.52, W * 0.94, H * 0.9], [W / 2 - 9, H * 0.34 - 9, W / 2 + 9, H * 0.34 + 9]]),
          C(W / 2, H * 0.34, 6.4, { fill: '#2F6BFF' }), emblem(c, W / 2, H * 0.34, 8, '#FFFFFF'),
          T(brand(c), { field: 'company', x: W / 2, y: H * 0.66, ox: 'center', oy: 'center', size: 5.4, font: 'd', w: 800, color: ink, fit: W - 18, ls: -0.02 }),
          T(f.tagline || '', { field: 'tagline', x: W / 2, y: H * 0.8, ox: 'center', oy: 'center', size: 2, font: 'd', w: 500, color: '#FF5A1F', fit: W - 24 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#1E1B3A';
        return { bg: { color: '#2F6BFF' }, objs: [
          ...confetti(W, H, f.name + 'b', ['#FFD23F', '#FF8FB1', '#FFFFFF']).map((o) => ({ ...o, opacity: 0.5 })),
          R(m - 1, m - 1, W - 2 * m + 2, H - 2 * m + 2, '#FFFFFF', { rx: 3 }),
          T(f.name, { field: 'name', x: m + 3, y: m + 5, oy: 'bottom', size: 3.6, font: 'd', w: 800, color: ink, fit: W - 2 * m - 6 }),
          T(f.role || '', { field: 'role', x: m + 3, y: m + 6, size: 2.1, font: 'd', w: 500, color: '#FF5A1F', fit: W - 2 * m - 6 }),
          ...iconRows(c, ['phone', 'email', 'web'], { x: m + 3, y: H * 0.58, lh: 3.3, r: 1.15, circle: '#2F6BFF', color: ink, size: 1.95, fit: W - 2 * m - 12 }),
        ] };
      },
    },

    ruzovezlato: {
      name: tr('Ružové zlato', 'Růžové zlato'), fonts: 'italiana', pal: 'rosegold', emblem: 'butterfly', tags: ['beauty', 'nechty', 'kozmetika', 'salon', 'svadba', 'butik', 'moda', 'foto', 'zenske', 'luxusne', 'jemne', 'elegantne'],
      front(c) {
        const { W, H, f } = c; const r = 'foil:rose';
        return { bg: { color: '#F8EEEA' }, objs: [
          IMG(c.root + 'assets/tex/blob-ruza.png', W * 0.15, -10, W * 0.7, H + 20, { role: 'art', blend: 'multiply', opacity: 0.55 }),
          ...sprig(2, H - 4, 18, -30, { color: r, leaves: 6, size: 3.2 }), ...sprig(W - 2, 4, 18, 150, { color: r, leaves: 6, size: 3.2 }),
          T(first(c), { field: 'name', part: 0, x: W / 2, y: H * 0.45, ox: 'center', oy: 'center', size: 12, font: SCRIPT, color: r, fit: W - 26 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: H * 0.67, ox: 'center', oy: 'center', size: 2.4, font: 'd', ls: 0.36, color: '#5A3E3A', fit: W - 26 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.74, ox: 'center', oy: 'center', size: 1.45, font: 't', w: 600, ls: 0.34, color: '#9C6E64', fit: W - 30 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const r = 'foil:rose', dark = '#2E2626';
        return { bg: { color: dark }, objs: [
          emblem(c, W / 2, m + 4, 6.4, r),
          T(brand(c), { field: 'company', x: W / 2, y: H * 0.43, ox: 'center', oy: 'center', size: 5, font: 'd', color: '#E9B8A6', fit: W - 20 }),
          ...divider(W / 2, H * 0.55, 26, r),
          ...[[f.phone, f.email].filter(Boolean).join('   ·   '), [f.web, f.address].filter(Boolean).join('   ·   ')].map((t, i) => T(t, { x: W / 2, y: H * 0.68 + i * 3.1, ox: 'center', oy: 'center', size: 1.85, font: 't', color: '#E9D6D0', fit: W - 16 })),
        ] };
      },
    },

    akvarelsalvia: {
      name: tr('Akvarel šalvia', 'Akvarel šalvěj'), fonts: 'playfair', pal: 'salvia', emblem: 'plant', tags: ['kvety', 'zahrady', 'wellness', 'terapeut', 'psycholog', 'joga', 'eko', 'kouc', 'prirodne', 'jemne', 'elegantne'],
      front(c) {
        const { W, H, f, pal } = c; const ink = '#2F3B32', g = FOIL(pal);
        return { bg: { color: '#F6F5F0' }, objs: [
          IMG(c.root + 'assets/tex/blob-bez.png', W * 0.4, -14, W * 0.75, H + 26, { role: 'art', blend: 'multiply', opacity: 0.75 }),
          IMG(c.root + 'assets/tex/blob-sivy.png', W * 0.55, H * 0.2, W * 0.55, H * 0.9, { role: 'art', blend: 'multiply', opacity: 0.5 }),
          emblem(c, W * 0.74, H * 0.42, 13, ink),
          T(brand(c), { field: 'company', x: c.m + 1, y: H * 0.5, oy: 'bottom', size: 5, font: 'd', color: ink, fit: W * 0.5 }),
          T(f.tagline || f.role || '', { field: 'tagline', x: c.m + 1.5, y: H * 0.5 + 1.6, size: 3, font: SCRIPT, color: '#6E8B76', fit: W * 0.45 }),
          Ln(c.m + 1, H * 0.74, c.m + 14, H * 0.74, g, 0.16),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#2F3B32';
        return { bg: { color: '#F6F5F0' }, objs: [
          IMG(c.root + 'assets/tex/blob-bez.png', W * 0.45, H * 0.25, W * 0.7, H * 1.1, { role: 'art', blend: 'multiply', opacity: 0.7 }),
          T(f.name, { field: 'name', x: m, y: m + 3.6, oy: 'bottom', size: 3.6, font: 'd', color: ink, fit: W * 0.7 }),
          T(f.role || '', { field: 'role', x: m, y: m + 4.6, size: 2, font: 'd', it: true, color: '#6E8B76', fit: W * 0.7 }),
          ...iconRows(c, ['phone', 'email', 'web'], { x: m, y: H * 0.5, lh: 3.3, r: 1.15, ring: true, circle: '#6E8B76', icon: '#4E6B56', color: ink, size: 1.95, fit: W * 0.7 }),
        ] };
      },
    },
  });
}
