// Vizitkomat – kolekcia „Signature“ (3. kolo): prepracované najslabšie šablóny pod pôvodnými ID + nové ilustrované šablóny
// pre odbory, ktoré chýbali (elektrikár, upratovanie, fitnes, tetovanie, účtovníčka, psychologička, svadobný fotograf,
// vintage barber, moderná cukráreň, startup). Všetko kreslené krivkami v mm, farby z palety.
import { ornaments } from './tpl-rich.js';

export function xTemplates(h) {
  const { T, R, C, Ln, P, QR, IMG, I, MONO, contacts, logoOr, mono, bare, city, splitName, mix, luminance, tr, seeded, smooth, SCRIPT } = h;
  const { FOIL, MET, oval, f2, first, brand, has, leaf, sprig, wreath, divider, decoFrame, fan, waveFill, ringText, arcText, tidy, emblem, iconRows, arch, tex, confetti } = ornaments(h);
  const dark = (col) => luminance(col) < 0.22;
  const light = (col) => luminance(col) > 0.6;
  const G = (pal) => (pal.foil ? FOIL(pal) : pal.accent);
  const rad = (d) => (d * Math.PI) / 180;
  const inkOn = (bg, pal, d = '#1A1A18', l = '#FFFFFF') => (luminance(bg) > 0.4 ? (dark(pal.ink) ? pal.ink : d) : (light(pal.ink) ? pal.ink : l));
  const last = (c) => splitName(bare(c.f.name) || c.f.name)[1] || '';

  // ---------- pomocníci ----------
  const paper = (c, op = 0.45) => IMG(tex(c, 'papier'), -2.5, -2.5, c.W + 5, c.H + 5, { role: 'art', blend: 'multiply', opacity: op });
  const rows = (c, o) => contacts(c, { keys: ['phone', 'email', 'web'], size: 1.9, lh: 2.9, ...o });
  const centerLines = (c, x, yb, o) => {
    const f = c.f, l1 = [f.phone, f.web].filter((v) => v && v.trim()).join('   ·   '), l2 = has(c, 'email') ? f.email : '';
    const L = [l1, l2].filter(Boolean), lh = o.lh || 2.9;
    return L.map((t, i) => T(t, { field: i === L.length - 1 && l2 ? 'email' : undefined, x, y: yb - (L.length - 1 - i) * lh, ox: 'center', oy: 'bottom', size: o.size || 1.9, font: 't', w: o.w, color: o.color, fit: o.fit, ls: o.ls ?? 0.04 }));
  };
  /** Oblúk kružnice ako kubické Bézierovky (render nepodporuje príkaz A); uhly v stupňoch, rx/ry voliteľne */
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
  /** Výsek kruhu (koláč) */
  const pie = (cx, cy, r, a0, a1) => `M ${f2(cx)} ${f2(cy)} L ${f2(cx + r * Math.cos(rad(a0)))} ${f2(cy + r * Math.sin(rad(a0)))} ` + arcD(cx, cy, r, a0, a1, false) + 'Z';
  /** Ťah štetca po kružnici (ensō): vyplnená krivka so zužovaním a jemnou nepravidelnosťou */
  const brush = (cx, cy, r, a0, a1, wMax, rnd, o = {}) => {
    const n = 64, outer = [], inner = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = rad(a0 + (a1 - a0) * t);
      const taper = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), o.pow ?? 0.55) * (t > 0.85 ? 1 - (t - 0.85) * 3.2 : 1);
      const w = Math.max(0.05, wMax * taper * (0.9 + 0.2 * Math.sin(t * 17 + (o.ph || 0))));
      const rr = r * (1 + 0.015 * Math.sin(t * 7 + (o.ph || 0)));
      outer.push([cx + Math.cos(a) * (rr + w / 2), cy + Math.sin(a) * (rr + w / 2)]);
      inner.push([cx + Math.cos(a) * (rr - w / 2), cy + Math.sin(a) * (rr - w / 2)]);
    }
    const d = smooth(outer) + ' L ' + inner.reverse().map(([x, y]) => `${f2(x)} ${f2(y)}`).join(' L ') + ' Z';
    return P(d, { fill: o.color, opacity: o.opacity ?? 1 });
  };
  /** Japonská pečiatka (hanko): štvorec so zaoblením a iniciálami */
  const seal = (c, x, y, s, col, txt) => [
    R(x, y, s, s, col, { rx: s * 0.12 }),
    R(x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8, null, { stroke: '#FFFFFF', sw: 0.12, rx: s * 0.06, opacity: 0.75 }),
    T(txt, { x: x + s / 2, y: y + s / 2 + s * 0.04, ox: 'center', oy: 'center', size: s * 0.46, font: 'd', color: '#FFFFFF', ls: -0.02 }),
  ];
  /** Bodky v mriežke (polotón): veľkosť podľa funkcie */
  const dotGrid = (x0, y0, x1, y1, step, rFn, col, o = {}) => { const out = []; for (let y = y0; y <= y1; y += step) for (let x = x0 + ((Math.round((y - y0) / step) % 2) && o.stagger ? step / 2 : 0); x <= x1; x += step) { const r = rFn(x, y); if (r > 0.05) out.push(C(x, y, r, { fill: col, opacity: o.opacity ?? 1 })); } return out; };
  /** Šikmé pruhy cez obdĺžnik (len čiary, orezané ručne) */
  const hatch = (x0, y0, w, h, gap, col, sw = 0.12, op = 1) => { const out = []; for (let k = -h; k < w; k += gap) { const xa = x0 + Math.max(k, 0), ya = y0 + Math.max(0, -k), xb = x0 + Math.min(k + h, w), yb = y0 + Math.min(h, w - k); if (xb > xa) out.push(Ln(xa, ya, xb, yb, col, sw, { opacity: op })); } return out; };
  /** Hviezdička (lesk) – štvorcípa */
  const twinkle = (x, y, s, col, o = {}) => P(`M ${f2(x)} ${f2(y - s)} Q ${f2(x + s * 0.14)} ${f2(y - s * 0.14)} ${f2(x + s)} ${f2(y)} Q ${f2(x + s * 0.14)} ${f2(y + s * 0.14)} ${f2(x)} ${f2(y + s)} Q ${f2(x - s * 0.14)} ${f2(y + s * 0.14)} ${f2(x - s)} ${f2(y)} Q ${f2(x - s * 0.14)} ${f2(y - s * 0.14)} ${f2(x)} ${f2(y - s)} Z`, { fill: col, opacity: o.opacity ?? 1 });
  /** Bublina s odleskom */
  const bubble = (x, y, r, col, o = {}) => [
    C(x, y, r, { fill: { grad: ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.0)', o.rim || col], stops: [0, 0.62, 1], radial: true }, stroke: o.rim || col, sw: Math.max(0.08, r * 0.05), opacity: o.opacity ?? 0.9 }),
    P(`M ${f2(x - r * 0.62)} ${f2(y - r * 0.12)} Q ${f2(x - r * 0.6)} ${f2(y - r * 0.6)} ${f2(x - r * 0.1)} ${f2(y - r * 0.66)}`, { stroke: '#FFFFFF', sw: Math.max(0.1, r * 0.12), opacity: 0.9 }),
  ];
  /** Blesk */
  const bolt = (x, y, s) => `M ${f2(x + s * 0.18)} ${f2(y)} L ${f2(x + s * 0.62)} ${f2(y)} L ${f2(x + s * 0.42)} ${f2(y + s * 0.4)} L ${f2(x + s * 0.72)} ${f2(y + s * 0.4)} L ${f2(x + s * 0.12)} ${f2(y + s * 1.08)} L ${f2(x + s * 0.3)} ${f2(y + s * 0.58)} L ${f2(x)} ${f2(y + s * 0.58)} Z`;
  /** Plošný spoj: čiary s ohybom 45° a bodkami na konci */
  const traces = (seed, x0, y0, x1, y1, n, col, o = {}) => {
    const r = seeded(seed), out = [];
    for (let i = 0; i < n; i++) {
      const y = y0 + (i + 0.5) * ((y1 - y0) / n), xa = x0 + r() * 4, len = (x1 - x0) * (0.35 + r() * 0.6), xb = Math.min(x1, xa + len * 0.55), dy = (r() - 0.5) * 6;
      const xc = Math.min(x1, xb + Math.abs(dy)), xe = Math.min(x1 + 6, xc + len * 0.45);
      out.push(P(`M ${f2(xa)} ${f2(y)} L ${f2(xb)} ${f2(y)} L ${f2(xc)} ${f2(y + dy)} L ${f2(xe)} ${f2(y + dy)}`, { stroke: col, sw: o.sw || 0.22, opacity: o.opacity ?? 1 }));
      out.push(C(xa, y, 0.55, { stroke: col, sw: 0.18, opacity: o.opacity ?? 1 }), C(xe, y + dy, 0.4, { fill: col, opacity: o.opacity ?? 1 }));
    }
    return out;
  };
  /** Kvapky polevy zhora (cukráreň) */
  const drips = (W, y, seed, fill) => {
    const r = seeded(seed); let d = `M -3 -3 L ${f2(W + 3)} -3 L ${f2(W + 3)} ${f2(y)}`;
    let x = W + 3;
    while (x > -3) { const w = 3 + r() * 4, len = r() < 0.55 ? 2 + r() * 7 : 0.6; const x2 = x - w; const mx = (x + x2) / 2; d += ` Q ${f2(x - w * 0.15)} ${f2(y)} ${f2(mx + w * 0.22)} ${f2(y + len * 0.6)} Q ${f2(mx + w * 0.22)} ${f2(y + len + 1.2)} ${f2(mx)} ${f2(y + len + 1.2)} Q ${f2(mx - w * 0.22)} ${f2(y + len + 1.2)} ${f2(mx - w * 0.22)} ${f2(y + len * 0.6)} Q ${f2(x2 + w * 0.15)} ${f2(y)} ${f2(x2)} ${f2(y)}`; x = x2; }
    return P(d + ' L -3 -3 Z', { fill });
  };
  /** Posýpka: krátke zaoblené paličky */
  const sprinkles = (W, H, seed, cols, avoid = [], n = 34) => {
    const r = seeded(seed), out = []; let k = 0;
    for (let i = 0; i < 600 && k < n; i++) {
      const x = r() * W, y = r() * H; if (avoid.some(([a, b, c2, d]) => x > a && x < c2 && y > b && y < d)) continue;
      const a = r() * Math.PI, l = 0.9 + r() * 0.5;
      out.push(Ln(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2, x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2, cols[k % cols.length], 0.55)); k++;
    }
    return out;
  };
  /** Stuha (banner) s vlnou a zastrihnutými koncami */
  const banner = (cx, cy, w, hh, fill, edge) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, b = 1.4;
    return [
      P(`M ${f2(x0 - 4)} ${f2(cy - hh / 2 + b)} L ${f2(x0 + 1)} ${f2(cy - hh / 2 + b)} L ${f2(x0 + 1)} ${f2(cy + hh / 2 + b)} L ${f2(x0 - 4)} ${f2(cy + hh / 2 + b)} L ${f2(x0 - 2.4)} ${f2(cy + b)} Z`, { fill: mix(fill, '#000000', 0.25) }),
      P(`M ${f2(x1 + 4)} ${f2(cy - hh / 2 + b)} L ${f2(x1 - 1)} ${f2(cy - hh / 2 + b)} L ${f2(x1 - 1)} ${f2(cy + hh / 2 + b)} L ${f2(x1 + 4)} ${f2(cy + hh / 2 + b)} L ${f2(x1 + 2.4)} ${f2(cy + b)} Z`, { fill: mix(fill, '#000000', 0.25) }),
      P(`M ${f2(x0)} ${f2(cy - hh / 2)} Q ${f2(cx)} ${f2(cy - hh / 2 - 1.6)} ${f2(x1)} ${f2(cy - hh / 2)} L ${f2(x1)} ${f2(cy + hh / 2)} Q ${f2(cx)} ${f2(cy + hh / 2 - 1.6)} ${f2(x0)} ${f2(cy + hh / 2)} Z`, { fill, stroke: edge, sw: 0.16 }),
    ];
  };
  /** Ruža (tetovanie): špirála lupeňov */
  const rose = (cx, cy, r, fill, line) => {
    const out = [C(cx, cy, r, { fill, stroke: line, sw: 0.24 })];
    // lupene: sústredné oblúky striedavo pootočené
    for (let k = 0; k < 4; k++) { const rr = r * (0.86 - k * 0.2), a = -150 + k * 70; out.push(P(arcD(cx, cy + k * 0.08 * r, rr, a, a + 200, true, rr * 0.82), { stroke: line, sw: 0.24 })); }
    out.push(P(arcD(cx, cy, r * 0.16, 0, 300), { stroke: line, sw: 0.24 }));
    out.push(P(`M ${f2(cx - r * 0.98)} ${f2(cy + r * 0.1)} Q ${f2(cx - r * 0.5)} ${f2(cy + r * 1.05)} ${f2(cx + r * 0.6)} ${f2(cy + r * 0.82)}`, { stroke: line, sw: 0.24 }));
    out.push(P(`M ${f2(cx + r * 0.95)} ${f2(cy - r * 0.2)} Q ${f2(cx + r * 0.8)} ${f2(cy + r * 0.6)} ${f2(cx + r * 0.2)} ${f2(cy + r * 0.95)}`, { stroke: line, sw: 0.2 }));
    return out;
  };

  return tidy({
    // ------------------------------------------------------------ NOIR – art-deco rám, vejár a fóliové meno (nahrádza pôvodný Noir)
    noirgold: {
      name: 'Noir', fonts: 'bodoni', pal: 'noir', tags: ['pravnik', 'advokat', 'reality', 'financie', 'luxus', 'hotel', 'elegantne', 'tmave', 'prestiz'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = G(pal), met = pal.foil ? MET(pal) : pal.accent, lt = luminance(pal.bg) > 0.45, ink = lt ? (dark(pal.ink) ? pal.ink : '#1A1A18') : (light(pal.ink) ? pal.ink : '#F2EDE4');
        const o = [IMG(tex(c, lt ? 'papier' : 'cierna'), -2.5, -2.5, W + 5, H + 5, { role: 'art', blend: 'multiply', opacity: lt ? 0.4 : 0.35 })];
        o.push(...decoFrame(W, H, 2.6, 2.2, met));
        // jemné lúče z vejára za menom
        const cy = c.sq ? H * 0.46 : H / 2 - 1.2, fy = c.sq ? 15 : 13.2;
        o.push(...fan(W / 2, fy, c.sq ? 6 : 6.5, 11, met));
        o.push(C(W / 2, fy, 0.5, { fill: g }));
        o.push(T(f.name, { field: 'name', x: W / 2, y: cy + 3, ox: 'center', oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', upper: true, ls: 0.16, color: g, fit: W - 20 }));
        o.push(...divider(W / 2, cy + 5, 16, met));
        o.push(T(f.role, { field: 'role', x: W / 2, y: cy + 6.8, ox: 'center', size: c.sq ? 2.3 : 2.6, font: 'd', it: true, color: ink, opacity: 0.9, fit: W - 20 }));
        const det = ['phone', 'email', 'web'].filter((k) => f[k] && f[k].trim());
        if (c.sq) o.push(...contacts(c, { x: W / 2, yb: H - 7.2, align: 'center', keys: det, size: 1.75, lh: 2.6, color: ink, fit: W - 16, ls: 0.04 }));
        else o.push(T(det.map((k) => f[k]).join('   ·   '), { x: W / 2, y: H - 6.8, ox: 'center', oy: 'bottom', size: 1.8, font: 't', color: mix(ink, pal.bg, 0.12), fit: W - 18, ls: 0.05 }));
        return { bg: { color: pal.bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal } = c; const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const o = [];
        const r = c.sq ? 10 : 10.5;
        o.push(C(W / 2, H / 2 - 1.5, r, { stroke: met, sw: 0.2 }), C(W / 2, H / 2 - 1.5, r - 1.1, { stroke: met, sw: 0.08, opacity: 0.7 }));
        for (let i = 0; i < 4; i++) { const a = rad(45 + i * 90); o.push(P(`M ${f2(W / 2 + Math.cos(a) * (r + 0.6))} ${f2(H / 2 - 1.5 + Math.sin(a) * (r + 0.6))} L ${f2(W / 2 + Math.cos(a) * (r + 2.2))} ${f2(H / 2 - 1.5 + Math.sin(a) * (r + 2.2))}`, { stroke: met, sw: 0.14 })); }
        o.push(logoOr(c, W / 2, H / 2 - 1.5, r * 1.5, r * 1.3, {}, MONO(c, { x: W / 2, y: H / 2 - 1.3, ox: 'center', oy: 'center', size: r * 0.72, color: g, ls: 0.04 })));
        o.push(T(f.company, { field: 'company', x: W / 2, y: H - 5.8, ox: 'center', oy: 'bottom', size: 1.7, font: 't', upper: true, ls: 0.32, color: g, fit: W - 16 }));
        return { bg: { color: pal.bg, art: c.art || (luminance(pal.bg) > 0.45 ? 'mramor' : 'mramor-cierny'), artOpacity: 0.5 }, objs: o };
      },
    },

    // ============================================================ PREPRACOVANÉ ============================================================

    // ------------------------------------------------------------ MINIMAL – ensō ťahom štetca a červená pečiatka
    minimal: {
      name: 'Minimal', fonts: 'fraunces', pal: 'salvia', tags: ['terapeut', 'psycholog', 'joga', 'wellness', 'kouc', 'umelec', 'architekt', 'caj', 'jemne', 'minimal', 'osobne', 'prirodne', 'elegantne', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#ECEEE6', ink = dark(pal.ink) ? pal.ink : '#1F2A22', acc = pal.accent, red = '#A8402F';
        const rnd = seeded(f.name), cx = c.sq ? W / 2 : W * 0.72, cy = c.sq ? H * 0.34 : H * 0.48, r = c.sq ? 10.5 : 14;
        const o = [paper(c, 0.6)];
        o.push(brush(cx, cy, r, -62, 262, c.sq ? 3.2 : 4.2, rnd, { color: ink, opacity: 0.92, ph: 1 }));
        o.push(brush(cx + 0.3, cy - 0.2, r + 0.9, -40, 210, 0.5, rnd, { color: ink, opacity: 0.35, ph: 2.4 }));
        o.push(brush(cx - 0.2, cy + 0.3, r - 1.1, -20, 240, 0.35, rnd, { color: ink, opacity: 0.3, ph: 4.1 }));
        o.push(...seal(c, c.sq ? cx + r - 1.5 : cx + r - 2.6, c.sq ? cy + r - 3.2 : cy + r - 4.2, c.sq ? 4.6 : 5.4, red, mono(c)));
        const tx = c.sq ? W / 2 : m + 0.4, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m : W * 0.44, ny = c.sq ? H * 0.72 : H * 0.44;
        o.push(T(f.name, { field: 'name', x: tx, y: ny, ox: al, oy: 'bottom', size: c.sq ? 3.8 : 4.8, font: 'd', color: ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x: tx, y: ny + 1.2, ox: al, size: 2.1, font: 'd', it: true, color: acc, fit: mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: mix(ink, bg, 0.25), fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        else { o.push(Ln(m + 0.4, ny + 6, m + 6.4, ny + 6, red, 0.3)); o.push(...rows(c, { x: m + 0.4, yb: H - m, color: mix(ink, bg, 0.2), fit: mw, size: 1.8, lh: 2.75 })); }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1F2A22', bg = light(pal.bg) ? pal.bg : '#ECEEE6', red = '#A8402F', acc = pal.accent;
        const rnd = seeded(f.name + 'b'), r = c.sq ? 15 : 17, cx = c.sq ? W / 2 : W * 0.27, cy = c.sq ? H * 0.38 : H / 2;
        const o = [];
        // tušové hory v hmle a svetlé ensō
        const hills = (y0, amp, col, op, ph) => { const pts = []; for (let x = -4; x <= W + 4; x += 3) pts.push([x, y0 - Math.abs(Math.sin(x / 13 + ph)) * amp - Math.sin(x / 5 + ph * 2) * amp * 0.15]); return P(smooth(pts) + ` L ${W + 4} ${H + 4} L -4 ${H + 4} Z`, { fill: col, opacity: op }); };
        o.push(hills(H * 0.86, 5, mix(ink, bg, 0.18), 0.9, 0.4), hills(H * 0.95, 3.4, mix(ink, '#000000', 0.25), 0.9, 2.1));
        o.push(brush(cx, cy, r, -70, 255, c.sq ? 2.6 : 3.2, rnd, { color: bg, opacity: 0.9, ph: 0.6 }));
        o.push(brush(cx + 0.3, cy - 0.2, r + 0.9, -40, 200, 0.4, rnd, { color: bg, opacity: 0.35, ph: 2.2 }));
        const x = c.sq ? W / 2 : W * 0.56, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m : W - x - m;
        const ty = c.sq ? H * 0.38 : H * 0.44;
        o.push(T(brand(c), { field: 'company', x: c.sq ? cx : x, y: c.sq ? cy + 1.6 : ty, ox: c.sq ? 'center' : al, oy: c.sq ? 'center' : 'bottom', size: c.sq ? 3.4 : 4.4, font: 'd', color: bg, fit: c.sq ? r * 1.5 : mw * 0.9 }));
        const longWeb = !c.sq && (f.web || '').length > 24, sqLong = c.sq && (f.web || '').length > 18;
        if (sqLong) o.push(T(f.web, { field: 'web', x: W / 2, y: H - m - 10.4, ox: 'center', oy: 'bottom', size: 1.7, font: 't', color: bg, fit: W - 2 * m }));
        if (!c.sq) o.push(T(longWeb ? f.web : f.tagline || '', { field: longWeb ? 'web' : 'tagline', x, y: ty + 1.3, ox: al, size: longWeb ? 1.75 : 1.95, font: longWeb ? 't' : 'd', it: !longWeb, color: mix(bg, ink, 0.3), fit: W - x - m + 1 }));
        o.push(...seal(c, c.sq ? W / 2 - 2.2 : x, H - m - 4.4, 4.4, red, mono(c)));
        if (has(c, 'web') && !longWeb && !sqLong) o.push(T(f.web, { field: 'web', x: c.sq ? W / 2 + 3.4 : x + 6.2, y: H - m - 2.2, oy: 'center', size: 1.75, font: 't', ls: 0.12, color: bg, fit: c.sq ? W / 2 - m - 3.4 : mw - 7 }));
        return { bg: { color: ink, art: tex(c, 'papier'), artOpacity: 0.12, artBlend: 'multiply' }, objs: o };
      },
    },

    // ------------------------------------------------------------ KONTRAST – obrovské obrysové písmeno a štvrťkruhy
    kontrast: {
      name: tr('Kontrast', 'Kontrast'), fonts: 'poppins', pal: 'merlot', tags: ['dizajn', 'agentura', 'kreativ', 'it', 'marketing', 'studio', 'hudba', 'startup', 'odvazne', 'moderne', 'farebne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.35 ? pal.bg : '#5B2333', cr = light(pal.ink) ? pal.ink : '#F7EFE6', acc = pal.accent;
        const L = (brand(c)[0] || 'A').toLocaleUpperCase();
        const o = [];
        o.push(T(L, { x: c.sq ? W * 0.62 : W * 0.68, y: H * 0.56, ox: 'center', oy: 'center', size: c.sq ? 52 : 70, font: 'd', w: 700, color: 'none', stroke: acc, sw: 0.22 }));
        o.push(T(L, { x: (c.sq ? W * 0.62 : W * 0.68) + 1.4, y: H * 0.56 + 1.4, ox: 'center', oy: 'center', size: c.sq ? 52 : 70, font: 'd', w: 700, color: 'none', stroke: cr, sw: 0.08, opacity: 0.35 }));
        o.push(C(c.sq ? W - m - 4 : W - m - 5, c.sq ? H - m - 4 : H - m - 5, c.sq ? 3.4 : 4.2, { fill: acc }));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m - 0.3, y: m + 7, oy: 'bottom', size: c.sq ? 5.6 : 7, font: 'd', w: 700, color: cr, fit: mw, ls: -0.04 }));
        o.push(R(m, m + 9, Math.min(mw, 2 + (f.role || f.tagline || '').length * 1.15), 3.6, acc, { rx: 1.8 }));
        o.push(T(f.role || f.tagline || '', { field: 'role', x: m + 1.1, y: m + 10.85, oy: 'center', size: 1.8, font: 't', w: 600, color: bg, fit: mw - 2 }));
        o.push(T('↗', { x: m, y: H - m, oy: 'bottom', size: 3.6, font: 't', w: 500, color: acc }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.35 ? pal.bg : '#5B2333', acc = pal.accent;
        const o = [];
        const cx = W + 1, cy = H + 1; [34, 28, 22, 16, 10].forEach((r, i) => o.push(P(pie(cx, cy, r, 180, 270), { fill: i % 2 ? acc : bg })));
        const x = m, mw = c.sq ? W - 2 * m : W * 0.5, ty = m + 4.4;
        o.push(T(f.name, { field: 'name', x, y: ty, oy: 'bottom', size: c.sq ? 3.4 : 3.9, font: 'd', w: 700, color: bg, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x, y: ty + 1.2, size: 1.9, font: 't', w: 500, color: mix(bg, acc, 0.35), fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: bg, fit: c.sq ? W * 0.5 : W * 0.52, size: 1.8, lh: 2.75, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ MUSE – svetlý medailón so znakom a textom po kruhu
    muse: {
      name: 'Muse', fonts: 'dmserif', pal: 'periwinkle', tags: ['kozmetika', 'beauty', 'lekar', 'zubar', 'estetika', 'wellness', 'terapeut', 'kouc', 'dizajn', 'jemne', 'elegantne', 'moderne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, wh = luminance(bg) > 0.62 ? (dark(pal.ink) ? pal.ink : '#2A2F45') : '#FFFFFF', acc = pal.accent, so = light(pal.soft) ? pal.soft : '#F6F4EF';
        const cx = c.sq ? W / 2 : W * 0.74, cy = c.sq ? H * 0.38 : H / 2, r = c.sq ? 11 : 14.5;
        const o = [];
        o.push(C(cx, cy, r + 5.5, { fill: { grad: [mix(bg, '#FFFFFF', 0.22), bg], radial: true }, opacity: 0.9 }));
        o.push(C(cx, cy, r + 3.2, { stroke: so, sw: 0.12, opacity: 0.8 }));
        o.push(C(cx, cy, r, { fill: so }));
        o.push(...ringText((brand(c) + ' · ' + (city(c) || f.role || '')).toLocaleUpperCase(), cx, cy, r - 2, -205, 25, { size: 1.6, color: acc, w: 600 }));
        o.push(emblem(c, cx, cy + 0.6, r * 0.78, acc));
        for (let i = 0; i < 3; i++) o.push(twinkle(cx + r * 0.95 + i * 2.2, cy - r * 0.9 + i * 2.6, 1.1 - i * 0.25, so, { opacity: 0.9 }));
        if (c.sq) {
          o.push(T(brand(c), { field: 'company', x: W / 2, y: H * 0.8, ox: 'center', oy: 'bottom', size: 4, font: 'd', color: wh, fit: W - 2 * m }));
          o.push(T(f.tagline || f.role || '', { field: 'tagline', x: W / 2, y: H * 0.8 + 1, ox: 'center', size: 1.9, font: 'd', it: true, color: wh, opacity: 0.85, fit: W - 2 * m }));
        } else {
          o.push(T(brand(c), { field: 'company', x: m, y: H * 0.5, oy: 'bottom', size: 6, font: 'd', color: wh, fit: W * 0.48, lh: 0.95 }));
          o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m + 0.2, y: H * 0.5 + 1.3, size: 2.2, font: 'd', it: true, color: wh, opacity: 0.85, fit: W * 0.46 }));
          o.push(Ln(m, H - m - 1, m + 8, H - m - 1, wh, 0.25), C(m + 9.4, H - m - 1, 0.45, { fill: wh }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const so = light(pal.soft) ? pal.soft : '#F6F4EF', acc = pal.accent, bg = pal.bg, ink = '#2A2F45';
        const o = [paper(c, 0.4)];
        o.push(...waveFill(W, H, H - 7, 1.4, 30, 0.6, bg), ...waveFill(W, H, H - 4.6, 1.2, 26, 2.2, mix(bg, acc, 0.35)));
        o.push(emblem(c, W - m - 4, m + 4, 7, bg));
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.6 : 4.6, font: 'd', color: acc, fit: c.sq ? W - 2 * m - 10 : W * 0.6 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 6.2, size: 2, font: 'd', it: true, color: mix(acc, so, 0.35), fit: W * 0.6 }));
        o.push(...iconRows(c, c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], { x: m, y: c.sq ? H * 0.52 : H * 0.47, lh: 3.2, r: 1.15, circle: bg, icon: acc, color: ink, size: 1.9, fit: W - 2 * m - 5 }));
        return { bg: { color: so }, objs: o };
      },
    },

    // ------------------------------------------------------------ CROP – meno prerastajúce cez okraj
    crop: {
      name: 'Crop', fonts: 'archivo', pal: 'koral', tags: ['barber', 'fitness', 'trener', 'kreativ', 'hudba', 'dj', 'tetovanie', 'streetwear', 'agentura', 'odvazne', 'mlade', 'moderne', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#FFF5EF', ink = dark(pal.ink) ? pal.ink : '#1D1A19', acc = pal.accent;
        const word = (first(c) || brand(c)).toLocaleUpperCase();
        const sz = Math.min(c.sq ? 22 : 30, (W + 4) / Math.max(3, word.length) / 0.86);
        const o = [];
        o.push(T(word, { x: -1.2, y: H + sz * 0.24, oy: 'bottom', size: sz, font: 'd', color: acc, ls: -0.03 }));
        o.push(T(word, { x: -1.2 + 0.9, y: H + sz * 0.24 - 0.9, oy: 'bottom', size: sz, font: 'd', color: 'none', stroke: ink, sw: 0.14, ls: -0.03 }));
        o.push(T((brand(c) || '').toLocaleUpperCase(), { field: 'company', x: m, y: m + 3, oy: 'bottom', size: 2.4, font: 'd', ls: 0.04, color: ink, fit: W * 0.55 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 4.3, size: 1.8, font: 't', w: 600, color: acc, fit: W * 0.55 }));
        o.push(...contacts(c, { x: W - m, yb: m + 7, keys: c.sq ? ['phone'] : ['phone', 'web'], align: 'right', size: 1.8, lh: 2.6, color: ink, fit: W * 0.38 }));
        o.push(C(W - m - 0.6, m + 0.6, 0.9, { fill: acc }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, ink = dark(pal.ink) ? pal.ink : '#1D1A19', cr = light(pal.bg) ? pal.bg : '#FFF5EF';
        const word = (first(c) || brand(c)).toLocaleUpperCase();
        const o = [];
        for (let i = 0; i < 6; i++) o.push(T((word + ' ').repeat(6), { x: -6 - i * 7, y: -2 + i * 9.4, size: 8.5, font: 'd', color: 'none', stroke: cr, sw: 0.1, opacity: 0.28, ls: 0.02 }));
        const pw = c.sq ? W - 2 * m + 2 : W * 0.56, ph = c.sq ? 25 : H - 2 * m + 2, px = c.sq ? m - 1 : W - m - pw + 1, py = c.sq ? H - m - ph + 1 : m - 1;
        o.push(R(px + 1, py + 1, pw, ph, ink), R(px, py, pw, ph, cr));
        o.push(T(f.name, { field: 'name', x: px + 3, y: py + 5.4, oy: 'bottom', size: 3.2, font: 'd', color: ink, fit: pw - 6 }));
        o.push(T(f.role, { field: 'role', x: px + 3, y: py + 6.4, size: 1.8, font: 't', w: 600, color: acc, fit: pw - 6 }));
        o.push(...rows(c, { x: px + 3, yb: py + ph - 2.6, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: ink, fit: pw - 6, size: 1.8, lh: 2.7, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ LETTERPRESS – hrubý bavlnený papier, vyrazený monogram
    letterpress: {
      name: 'Letterpress', fonts: 'caslon', pal: 'krieda', tags: ['architekt', 'dizajn', 'foto', 'umelec', 'konzultant', 'firma', 'pravnik', 'vydavatel', 'minimal', 'elegantne', 'ciste', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F2EEE7', ink = dark(pal.ink) ? pal.ink : '#1F1D1A', acc = pal.accent;
        const o = [paper(c, 0.85)];
        const deb = (txt, oo, depth = 0.16) => [
          T(txt, { ...oo, x: oo.x + depth, y: oo.y + depth, color: '#FFFFFF', opacity: 0.85 }),
          T(txt, { ...oo, x: oo.x - depth * 0.7, y: oo.y - depth * 0.7, color: mix(bg, '#000000', 0.32), opacity: 0.7 }),
          T(txt, { ...oo, color: oo.color }),
        ];
        o.push(R(3.2, 3.2, W - 6.4, H - 6.4, null, { stroke: mix(bg, '#000000', 0.16), sw: 0.12 }), R(3.2 + 0.12, 3.2 + 0.12, W - 6.4, H - 6.4, null, { stroke: '#FFFFFF', sw: 0.12, opacity: 0.8 }));
        const cy = c.sq ? H * 0.38 : H * 0.42;
        o.push(...deb(mono(c), { x: W / 2, y: cy, ox: 'center', oy: 'center', size: c.sq ? 15 : 17, font: 'd', it: true, ls: -0.04, color: acc }, 0.2));
        o.push(...divider(W / 2, cy + (c.sq ? 9 : 10.2), 18, mix(acc, bg, 0.2)));
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: cy + (c.sq ? 13 : 14.2), ox: 'center', oy: 'center', size: 2.3, font: 't', w: 500, ls: 0.34, color: ink, fit: W - 2 * m - 4 }));
        o.push(T(f.role, { field: 'role', x: W / 2, y: cy + (c.sq ? 16 : 17.3), ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: mix(ink, bg, 0.3), fit: W - 2 * m - 4 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const fl = luminance(pal.accent) < 0.4 ? pal.accent : '#2F3A4A', lt = mix(fl, '#FFFFFF', 0.9);
        const deb = (txt, oo) => [T(txt, { ...oo, x: oo.x + 0.16, y: oo.y + 0.16, color: mix(fl, '#FFFFFF', 0.2) }), T(txt, { ...oo, x: oo.x - 0.11, y: oo.y - 0.11, color: mix(fl, '#000000', 0.45), opacity: 0.8 }), T(txt, { ...oo, color: mix(fl, '#000000', 0.12) })];
        const o = [paper(c, 0.35)];
        // veľký slepo razený monogram, ktorý presahuje okraj
        const mk = mono(c), ms = c.sq ? 30 : 40;
        o.push(...deb(mk, { x: c.sq ? W / 2 + 6 : W - m + 6, y: c.sq ? H * 0.58 : H / 2 + 1, ox: c.sq ? 'center' : 'right', oy: 'center', size: ms, font: 'd', it: true, ls: -0.04 }));
        o.push(R(3.2, 3.2, W - 6.4, H - 6.4, null, { stroke: lt, sw: 0.1, opacity: 0.45 }));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.8 : 4.4, font: 'd', it: true, color: lt, fit: mw }));
        o.push(Ln(m, m + 7.2, m + 10, m + 7.2, lt, 0.16, { opacity: 0.7 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], color: lt, fit: mw, size: 1.85, lh: 2.8, ls: 0.04 }));
        return { bg: { color: fl }, objs: o };
      },
    },

    // ------------------------------------------------------------ HRASTAR – axonometrická kresba stavby s kótami
    hrastar: {
      name: 'Hrastar', fonts: 'josefin', pal: 'piesok', tags: ['architekt', 'stavba', 'interier', 'developer', 'reality', 'projektant', 'statik', 'dizajn', 'moderne', 'ciste', 'technicke', 'serioze'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#EFE6D8', ink = dark(pal.ink) ? pal.ink : '#2A2119', acc = pal.accent, ln = mix(ink, bg, 0.25);
        const o = [paper(c, 0.4)];
        // jemná mriežka
        for (let x = (c.sq ? 0 : W * 0.48); x <= W; x += 2.5) o.push(Ln(x, 0, x, H, ink, 0.05, { opacity: 0.12 }));
        for (let y = 0; y <= H; y += 2.5) o.push(Ln(c.sq ? 0 : W * 0.48, y, W, y, ink, 0.05, { opacity: 0.12 }));
        // izometrická budova
        const s = c.sq ? 4.4 : 5.8, ox = c.sq ? W / 2 + 1 : W * 0.72, oy = c.sq ? 14 + 3.7 * s : H - 3.2 - 3.8 * s * 0.5;
        const iso = (x, y, z) => [ox + (x - y) * s * 0.866, oy + (x + y) * s * 0.5 - z * s];
        const poly = (pts, o2) => P('M ' + pts.map((p) => iso(...p)).map(([a, b]) => `${f2(a)} ${f2(b)}`).join(' L ') + ' Z', o2);
        const bx = 2.2, by = 1.6, bz = 2.6;
        o.push(poly([[0, by, 0], [bx, by, 0], [bx, by, bz], [0, by, bz]], { fill: mix(acc, bg, 0.55), stroke: ink, sw: 0.16 }));
        o.push(poly([[bx, 0, 0], [bx, by, 0], [bx, by, bz], [bx, 0, bz]], { fill: mix(acc, bg, 0.25), stroke: ink, sw: 0.16 }));
        o.push(poly([[0, 0, bz], [bx, 0, bz], [bx, by, bz], [0, by, bz]], { fill: bg, stroke: ink, sw: 0.16 }));
        o.push(poly([[0.3, 0.9, bz], [1.2, 0.9, bz], [1.2, 0.9, bz + 1.1], [0.3, 0.9, bz + 1.1]], { fill: mix(acc, bg, 0.4), stroke: ink, sw: 0.14 }));
        o.push(poly([[1.2, 0, bz], [1.2, 0.9, bz], [1.2, 0.9, bz + 1.1], [1.2, 0, bz + 1.1]], { fill: acc, stroke: ink, sw: 0.14 }));
        o.push(poly([[0.3, 0, bz + 1.1], [1.2, 0, bz + 1.1], [1.2, 0.9, bz + 1.1], [0.3, 0.9, bz + 1.1]], { fill: bg, stroke: ink, sw: 0.14 }));
        for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) o.push(poly([[0.35 + i * 0.62, by, 0.5 + k * 1.05], [0.75 + i * 0.62, by, 0.5 + k * 1.05], [0.75 + i * 0.62, by, 1.15 + k * 1.05], [0.35 + i * 0.62, by, 1.15 + k * 1.05]], { fill: ink, opacity: 0.75 }));
        for (let i = 0; i < 2; i++) o.push(poly([[bx, 0.35 + i * 0.6, 0.6], [bx, 0.75 + i * 0.6, 0.6], [bx, 0.75 + i * 0.6, 2.1], [bx, 0.35 + i * 0.6, 2.1]], { fill: ink, opacity: 0.55 }));
        // kóty
        const [a1, b1] = iso(0, by + 0.6, 0), [a2, b2] = iso(bx, by + 0.6, 0);
        o.push(Ln(a1, b1, a2, b2, acc, 0.14), Ln(a1 - 0.6, b1 - 0.35, a1 + 0.6, b1 + 0.35, acc, 0.14), Ln(a2 - 0.6, b2 - 0.35, a2 + 0.6, b2 + 0.35, acc, 0.14));
        o.push(T('12 400', { x: (a1 + a2) / 2 - 0.4, y: (b1 + b2) / 2 + 0.7, ox: 'center', size: 1.7, font: 't', w: 600, color: acc, rot: 30 }));
        const [c1x, c1y] = iso(bx + 0.6, 0, 0), [c2x, c2y] = iso(bx + 0.6, 0, bz);
        o.push(Ln(c1x, c1y, c2x, c2y, ln, 0.1), Ln(c1x - 0.6, c1y, c1x + 0.6, c1y, ln, 0.1), Ln(c2x - 0.6, c2y, c2x + 0.6, c2y, ln, 0.1));
        const tx = m, mw = c.sq ? W - 2 * m : W * 0.42;
        if (c.sq) {
          o.push(T(f.name, { field: 'name', x: m, y: m + 3.6, oy: 'bottom', size: 3.2, font: 'd', w: 600, color: ink, fit: mw }));
          o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 4.8, size: 1.7, font: 't', w: 600, ls: 0.2, color: acc, fit: mw }));
          o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          o.push(T(f.name, { field: 'name', x: tx, y: m + 5, oy: 'bottom', size: 4.4, font: 'd', w: 600, color: ink, fit: mw }));
          o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: tx, y: m + 6.4, size: 1.75, font: 't', w: 600, ls: 0.22, color: acc, fit: mw }));
          o.push(...rows(c, { x: tx, yb: H - m, keys: ['phone', 'email', 'web', 'address'], color: ink, fit: mw, size: 1.8, lh: 2.75, labels: true, lcolor: acc }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#2A2119', acc = pal.accent, bg = light(pal.bg) ? pal.bg : '#EFE6D8';
        const o = [];
        for (let x = 0; x <= W; x += 2.5) o.push(Ln(x, 0, x, H, bg, x % 10 < 0.01 ? 0.07 : 0.035, { opacity: x % 10 < 0.01 ? 0.16 : 0.09 }));
        for (let y = 0; y <= H; y += 2.5) o.push(Ln(0, y, W, y, bg, y % 10 < 0.01 ? 0.07 : 0.035, { opacity: y % 10 < 0.01 ? 0.16 : 0.09 }));
        // izometrický náčrt domu s kótami (viditeľné steny x = bw a y = bd)
        const s = c.sq ? 1.25 : 1.6, k = Math.cos(Math.PI / 6), q = 0.5, bw = 7, bd = 5, bh = 8, rh = 3.6, top = bh + rh;
        const ox = c.sq ? W / 2 - (bw - bd) * k * s / 2 : W * 0.75 - (bw - bd) * k * s / 2, oy = c.sq ? m + top * s + 1 : H - m - (bw + bd) * q * s;
        const iso = (x, y, z) => [ox + (x - y) * k * s, oy + (x + y) * q * s - z * s];
        const L = (a, b, w = 0.18, op = 0.95) => { const p = iso(...a), r = iso(...b); o.push(Ln(p[0], p[1], r[0], r[1], acc, w, { opacity: op })); };
        const face = (pts, op) => { const d = pts.map((p, i) => { const [x, y] = iso(...p); return (i ? 'L ' : 'M ') + f2(x) + ' ' + f2(y); }).join(' ') + ' Z'; o.push(P(d, { fill: acc, opacity: op })); };
        face([[bw, 0, 0], [bw, bd, 0], [bw, bd, bh], [bw, bd / 2, top], [bw, 0, bh]], 0.1);
        face([[0, bd, 0], [bw, bd, 0], [bw, bd, bh], [0, bd, bh]], 0.05);
        face([[0, bd, bh], [bw, bd, bh], [bw, bd / 2, top], [0, bd / 2, top]], 0.16);
        for (const [a, b] of [[[bw, 0, 0], [bw, bd, 0]], [[0, bd, 0], [bw, bd, 0]], [[bw, 0, 0], [bw, 0, bh]], [[bw, bd, 0], [bw, bd, bh]], [[0, bd, 0], [0, bd, bh]], [[bw, bd, bh], [0, bd, bh]], [[bw, 0, bh], [bw, bd / 2, top]], [[bw, bd, bh], [bw, bd / 2, top]], [[0, bd / 2, top], [bw, bd / 2, top]], [[0, bd, bh], [0, bd / 2, top]]]) L(a, b, 0.22);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const x0 = 0.8 + i * 2.15, z0 = 1.4 + j * 3.3; L([x0, bd, z0], [x0 + 1.25, bd, z0], 0.12); L([x0, bd, z0 + 2], [x0 + 1.25, bd, z0 + 2], 0.12); L([x0, bd, z0], [x0, bd, z0 + 2], 0.12); L([x0 + 1.25, bd, z0], [x0 + 1.25, bd, z0 + 2], 0.12); }
        L([bw, 1.6, 0], [bw, 1.6, 3.2], 0.14); L([bw, 3.4, 0], [bw, 3.4, 3.2], 0.14); L([bw, 1.6, 3.2], [bw, 3.4, 3.2], 0.14);
        for (const z0 of [5]) { L([bw, 1, z0], [bw, 2.2, z0], 0.12); L([bw, 1, z0 + 1.8], [bw, 2.2, z0 + 1.8], 0.12); L([bw, 1, z0], [bw, 1, z0 + 1.8], 0.12); L([bw, 2.2, z0], [bw, 2.2, z0 + 1.8], 0.12); L([bw, 2.8, z0], [bw, 4, z0], 0.12); L([bw, 2.8, z0 + 1.8], [bw, 4, z0 + 1.8], 0.12); L([bw, 2.8, z0], [bw, 2.8, z0 + 1.8], 0.12); L([bw, 4, z0], [bw, 4, z0 + 1.8], 0.12); }
        L([-1.3, bd + 1.3, 0], [-1.3, bd + 1.3, bh], 0.1, 0.7); L([-1.8, bd + 1.8, 0], [-0.8, bd + 0.8, 0], 0.1, 0.7); L([-1.8, bd + 1.8, bh], [-0.8, bd + 0.8, bh], 0.1, 0.7);
        const g0 = iso(-1.3, bd + 1.3, bh / 2); o.push(T(`${Math.round(bh * 375)}`, { x: g0[0] - 0.9, y: g0[1], ox: 'right', oy: 'center', size: 1.6, font: 't', color: acc, opacity: 0.85 }));
        // pečiatka výkresu (rohové pole)
        const tw = c.sq ? W - 2 * m : W * 0.46, tx = m, ty = c.sq ? H - m - 9.5 : H - m - 12, th = c.sq ? 9.5 : 12;
        o.push(R(tx, ty, tw, th, null, { stroke: bg, sw: 0.16, opacity: 0.7 }), Ln(tx, ty + th * 0.58, tx + tw, ty + th * 0.58, bg, 0.1, { opacity: 0.5 }), Ln(tx + tw * 0.6, ty + th * 0.58, tx + tw * 0.6, ty + th, bg, 0.1, { opacity: 0.5 }));
        o.push(logoOr(c, tx + tw / 2, ty + th * 0.3, tw - 4, th * 0.42, {}, T(brand(c).toLocaleUpperCase(), { field: 'company', x: tx + 1.6, y: ty + th * 0.3, oy: 'center', size: c.sq ? 2.6 : 3, font: 'd', w: 600, ls: 0.18, color: bg, fit: tw - 3.2 })));
        o.push(T(f.web || f.tagline || '', { field: f.web ? 'web' : 'tagline', x: tx + 1.6, y: ty + th * 0.79, oy: 'center', size: 1.7, font: 't', ls: 0.06, color: acc, fit: tw * 0.6 - 2.4 }));
        o.push(T('M 1:100', { x: tx + tw * 0.8, y: ty + th * 0.79, ox: 'center', oy: 'center', size: 1.6, font: 't', w: 600, color: bg, opacity: 0.8 }));
        if (!c.sq) o.push(T((f.tagline || '').toLocaleUpperCase(), { field: 'tagline', x: m, y: m + 2, oy: 'top', size: 1.6, font: 't', w: 600, ls: 0.22, color: bg, opacity: 0.7, fit: W * 0.44 }));
        return { bg: { color: ink }, objs: o };
      },
    },

    // ------------------------------------------------------------ MAITLAND – stúpajúci graf a účtovná mriežka
    maitland: {
      name: 'Maitland', fonts: 'dmserif', pal: 'mint', tags: ['uctovnictvo', 'financie', 'poradenstvo', 'poistenie', 'konzultant', 'pravnik', 'firma', 'banka', 'investicie', 'elegantne', 'serioze', 'ciste', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = luminance(bg) > 0.4 ? (dark(pal.ink) ? pal.ink : '#14231F') : '#FBFAF6', g = pal.foil ? FOIL(pal) : ink;
        const o = [];
        const x0 = c.sq ? m : W * 0.5, x1 = W - m + 1, yb = c.sq ? H * 0.5 : H - m - 1, yt = c.sq ? m + 2 : m + 1;
        for (let i = 0; i <= 5; i++) { const y = yb - (i * (yb - yt)) / 5; o.push(Ln(x0, y, x1, y, ink, 0.06, { opacity: 0.35 })); }
        const rnd = seeded(brand(c)), n = 9, pts = [];
        for (let i = 0; i < n; i++) { const t = i / (n - 1); pts.push([x0 + t * (x1 - x0), yb - (yb - yt) * (0.12 + 0.78 * Math.pow(t, 1.3)) + (i && i < n - 1 ? (rnd() - 0.5) * 3 : 0)]); }
        for (let i = 0; i < n; i++) { const bw = (x1 - x0) / n * 0.42; o.push(R(pts[i][0] - bw / 2, pts[i][1] + 2.4, bw, yb - pts[i][1] - 2.4, ink, { opacity: 0.12 })); }
        o.push(P(smooth(pts) + ` L ${f2(x1)} ${f2(yb)} L ${f2(x0)} ${f2(yb)} Z`, { fill: { grad: [mix(bg, '#FFFFFF', 0.5), bg], angle: 90 }, opacity: 0.6 }));
        o.push(P(smooth(pts), { stroke: ink, sw: 0.32 }));
        pts.forEach(([x, y], i) => { if (i % 2 === 0 || i === n - 1) o.push(C(x, y, i === n - 1 ? 1 : 0.5, { fill: i === n - 1 ? g : bg, stroke: ink, sw: 0.18 })); });
        o.push(P(`M ${f2(x1 - 2.4)} ${f2(pts[n - 1][1] - 2.2)} L ${f2(x1 + 0.3)} ${f2(pts[n - 1][1] - 3.2)} L ${f2(x1 - 0.8)} ${f2(pts[n - 1][1] - 0.4)}`, { stroke: ink, sw: 0.3 }));
        const tx = m, mw = c.sq ? W - 2 * m : W * 0.4;
        const ny = c.sq ? H * 0.74 : H * 0.48;
        o.push(T(f.name, { field: 'name', x: tx, y: ny, oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: tx, y: ny + 1.3, size: 1.7, font: 't', w: 600, ls: 0.24, color: ink, opacity: 0.75, fit: mw }));
        if (!c.sq) o.push(T(brand(c), { field: 'company', x: tx, y: H - m, oy: 'bottom', size: 2.2, font: 'd', it: true, color: ink, fit: mw }));
        else o.push(T(brand(c), { field: 'company', x: tx, y: H - m, oy: 'bottom', size: 2, font: 'd', it: true, color: ink, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#14231F', bg = pal.bg, wh = '#FBFAF6';
        const o = [];
        for (let x = 0; x <= W + 1; x += 3) o.push(Ln(x, 0, x, H, bg, 0.05, { opacity: 0.12 }));
        for (let y = 0; y <= H + 1; y += 3) o.push(Ln(0, y, W, y, bg, 0.05, { opacity: 0.12 }));
        o.push(P(smooth([[W * 0.45, H - 3], [W * 0.62, H * 0.62], [W * 0.76, H * 0.7], [W * 0.9, H * 0.3], [W + 2, H * 0.18]]), { stroke: bg, sw: 0.5, opacity: 0.45 }));
        o.push(T(brand(c), { field: 'company', x: m, y: m + 4.4, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: wh, fit: W - 2 * m - 6 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: m, y: m + 5.6, size: 1.95, font: 'd', it: true, color: bg, fit: W - 2 * m - 6 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], color: wh, labels: true, lcolor: bg, fit: c.sq ? W - 2 * m : W * 0.55, size: 1.8, lh: 2.75 }));
        return { bg: { color: ink }, objs: o };
      },
    },

    // ------------------------------------------------------------ ORGANIC – trs veľkých listov (monstera, banánovník)
    organic: {
      name: 'Organic', fonts: 'outfit', pal: 'salvia', tags: ['kvety', 'zahrady', 'eko', 'wellness', 'joga', 'kozmetika', 'kaviaren', 'bio', 'rastliny', 'prirodne', 'svieze', 'moderne', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = inkOn(bg, pal, '#1F2A22', '#F3F1EA'), acc = pal.accent, dk = mix(acc, '#0E1A12', 0.45), lt = mix(acc, '#FFFFFF', 0.35);
        const rnd = seeded(f.name + 'leaf'), o = [];
        const big = (x, y, a, L, wd, col, vein) => { o.push(P(leaf(x, y, a, L, wd), { fill: col })); const ex = x + Math.cos(a) * L * 0.92, ey = y + Math.sin(a) * L * 0.92; o.push(Ln(x, y, ex, ey, vein, 0.14, { opacity: 0.55 })); for (let i = 1; i < 7; i++) { const t = i / 7.5, px = x + Math.cos(a) * L * t, py = y + Math.sin(a) * L * t, sl = wd * 0.8 * Math.sin(Math.PI * t); for (const sd of [1, -1]) o.push(Ln(px, py, px + Math.cos(a + sd * 0.95) * sl, py + Math.sin(a + sd * 0.95) * sl, vein, 0.09, { opacity: 0.45 })); } };
        const bx = c.sq ? W + 3 : W + 4, by = c.sq ? H + 3 : H + 4, sc = c.sq ? 0.8 : 1;
        [[-150, 34, 9, dk], [-128, 38, 10, acc], [-106, 30, 8, lt], [-172, 26, 7, acc], [-92, 22, 6, dk], [-140, 22, 6, lt]].forEach(([a, L, wd, col]) => big(bx + (rnd() - 0.5) * 3, by + (rnd() - 0.5) * 3, rad(a + (rnd() - 0.5) * 6), L * sc, wd * sc, col, mix(col, '#FFFFFF', 0.5)));
        const mw = c.sq ? W - 2 * m : W * 0.5, tx = m;
        o.push(T(brand(c), { field: 'company', x: tx, y: c.sq ? m + 6 : H * 0.42, oy: 'bottom', size: c.sq ? 4.6 : 6, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: tx, y: (c.sq ? m + 6 : H * 0.42) + 1.4, size: 2, font: 't', color: ink, opacity: 0.75, fit: mw }));
        if (!c.sq) o.push(...rows(c, { x: tx, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, bg = mix(acc, '#0E1A12', 0.55), cr = '#F3F1EA';
        const rnd = seeded(f.name + 'pat'), o = [];
        for (let i = 0; i < 26; i++) { const x = rnd() * (W + 8) - 4, y = rnd() * (H + 8) - 4, a = rnd() * Math.PI * 2, L = 4 + rnd() * 5; o.push(P(leaf(x, y, a, L, L * 0.34), { fill: mix(bg, acc, 0.35 + rnd() * 0.25), opacity: 0.85 })); }
        o.push(R(W / 2 - (c.sq ? 20 : 27), H / 2 - (c.sq ? 13 : 11), c.sq ? 40 : 54, c.sq ? 26 : 22, cr, { rx: 1.2 }));
        o.push(T(f.name, { field: 'name', x: W / 2, y: H / 2 - (c.sq ? 5 : 4), ox: 'center', oy: 'bottom', size: 3.3, font: 'd', w: 600, color: bg, fit: c.sq ? 36 : 50 }));
        o.push(T(f.role || '', { field: 'role', x: W / 2, y: H / 2 - (c.sq ? 4 : 3), ox: 'center', size: 1.8, font: 't', color: acc, fit: c.sq ? 36 : 50 }));
        o.push(...centerLines(c, W / 2, H / 2 + (c.sq ? 10 : 8.4), { color: '#1F2A22', fit: c.sq ? 36 : 50, size: 1.8, lh: 2.7 }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ TICHA – úsvit nad vrstvenými kopcami
    ticha: {
      name: tr('Tichá', 'Tichá'), fonts: 'marcellus', pal: 'taupe', tags: ['joga', 'terapeut', 'psycholog', 'wellness', 'masaz', 'kouc', 'meditacia', 'spa', 'penzion', 'jemne', 'prirodne', 'minimal', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const top = mix(pal.bg, '#FFFFFF', 0.35), ink = dark(pal.ink) ? pal.ink : '#2E2622', acc = pal.accent;
        const o = [];
        const sy = c.sq ? H * 0.52 : H * 0.62;
        o.push(C(W / 2, sy, c.sq ? 9 : 10, { fill: { grad: ['#F6D9B8', mix(acc, '#F3C9A0', 0.4)], angle: 90 }, opacity: 0.95 }));
        for (let i = 0; i < 4; i++) o.push(C(W / 2, sy, (c.sq ? 9 : 10) + 2.4 + i * 2.4, { stroke: '#FFFFFF', sw: 0.1, opacity: 0.35 - i * 0.07 }));
        const hills = [[sy + 2, 2.6, 46, 0.4, 0.25], [sy + 4.8, 2.2, 38, 2.1, 0.45], [sy + 7.4, 1.8, 30, 4.2, 0.65], [sy + 10.6, 1.5, 26, 1.1, 0.85]];
        hills.forEach(([y, amp, len, ph, t]) => o.push(...waveFill(W, H, y, amp, len, ph, mix(mix(pal.bg, '#FFFFFF', 0.15), ink, t * 0.75))));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: c.sq ? m + 6 : m + 5.4, ox: 'center', oy: 'bottom', size: c.sq ? 2.8 : 3.4, font: 'd', ls: 0.3, color: ink, fit: W - 2 * m }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: W / 2, y: (c.sq ? m + 6 : m + 5.4) + 1.6, ox: 'center', size: 1.95, font: 't', it: true, color: mix(ink, top, 0.3), fit: W - 2 * m }));
        return { bg: { color: { grad: [top, mix(top, acc, 0.12)], angle: 90 } }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = mix(pal.bg, '#FFFFFF', 0.45), ink = dark(pal.ink) ? pal.ink : '#2E2622', acc = pal.accent;
        const o = [paper(c, 0.45)];
        const cx = c.sq ? W / 2 : W - 12, cy = c.sq ? 13 : H / 2;
        for (let i = 0; i < 7; i++) o.push(P(oval(cx, cy, 2 + i * 2.6, (2 + i * 2.6) * 0.42), { stroke: acc, sw: 0.12, opacity: 0.6 - i * 0.07 }));
        o.push(C(cx, cy - 3.2, 1.1, { fill: acc }));
        const x = m, mw = c.sq ? W - 2 * m : W * 0.55;
        o.push(T(f.name, { field: 'name', x: c.sq ? W / 2 : x, y: c.sq ? H * 0.58 : m + 5, ox: c.sq ? 'center' : 'left', oy: 'bottom', size: 3.8, font: 'd', color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: c.sq ? W / 2 : x, y: (c.sq ? H * 0.58 : m + 5) + 1.3, ox: c.sq ? 'center' : 'left', size: 1.7, font: 't', w: 500, ls: 0.26, color: acc, fit: mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        else o.push(...rows(c, { x, yb: H - m, keys: ['phone', 'email', 'web', 'address'], color: ink, fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ OBRYS – monogram s konštrukčnými kružnicami (typografický náčrt)
    obrys: {
      name: 'Obrys', fonts: 'bodoni', pal: 'krieda', tags: ['architekt', 'dizajn', 'grafik', 'typograf', 'agentura', 'kreativ', 'studio', 'foto', 'minimal', 'moderne', 'ciste', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F5F2EC', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent;
        const o = [paper(c, 0.4)];
        const cx = c.sq ? W / 2 : W * 0.66, cy = c.sq ? H * 0.42 : H / 2, sz = c.sq ? 24 : 30;
        // konštrukčné línie
        o.push(Ln(0, cy - sz * 0.36, W, cy - sz * 0.36, acc, 0.08, { opacity: 0.7 }), Ln(0, cy + sz * 0.34, W, cy + sz * 0.34, acc, 0.08, { opacity: 0.7 }));
        o.push(Ln(cx - sz * 0.62, 0, cx - sz * 0.62, H, acc, 0.06, { opacity: 0.5 }), Ln(cx + sz * 0.62, 0, cx + sz * 0.62, H, acc, 0.06, { opacity: 0.5 }));
        o.push(C(cx - sz * 0.25, cy, sz * 0.33, { stroke: acc, sw: 0.07, opacity: 0.7 }), C(cx + sz * 0.27, cy, sz * 0.33, { stroke: acc, sw: 0.07, opacity: 0.7 }));
        o.push(Ln(cx - sz * 0.62, cy + sz * 0.34, cx + sz * 0.62, cy - sz * 0.36, acc, 0.06, { opacity: 0.5 }));
        [[cx - sz * 0.62, cy - sz * 0.36], [cx + sz * 0.62, cy + sz * 0.34], [cx, cy]].forEach(([x, y]) => o.push(R(x - 0.45, y - 0.45, 0.9, 0.9, null, { stroke: acc, sw: 0.1 })));
        o.push(T(mono(c), { x: cx, y: cy, ox: 'center', oy: 'center', size: sz, font: 'd', color: 'none', stroke: ink, sw: 0.14, ls: -0.04 }));
        o.push(T('Aa — ' + c.fp.display, { x: W - m, y: m + 1, ox: 'right', oy: 'center', size: 1.7, font: 't', color: acc }));
        const mw = c.sq ? W - 2 * m : W * 0.34;
        if (c.sq) {
          o.push(T(f.name, { field: 'name', x: W / 2, y: H - m - 3.4, ox: 'center', oy: 'bottom', size: 2.8, font: 'd', color: ink, fit: mw }));
          o.push(T(f.role || '', { field: 'role', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.8, font: 't', color: acc, fit: mw }));
        } else {
          o.push(T(f.name, { field: 'name', x: m, y: H - m - 3.4, oy: 'bottom', size: 3.4, font: 'd', color: ink, fit: mw }));
          o.push(T(f.role || '', { field: 'role', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', color: acc, fit: mw }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent, bg = light(pal.bg) ? pal.bg : '#F5F2EC';
        const o = [];
        o.push(T(mono(c), { x: c.sq ? W / 2 : W - m - 6, y: H / 2, ox: 'center', oy: 'center', size: c.sq ? 40 : 46, font: 'd', color: 'none', stroke: mix(ink, bg, 0.22), sw: 0.12, ls: -0.04 }));
        o.push(R(m, m, 2.2, 2.2, acc));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(brand(c), { field: 'company', x: m, y: m + 8, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: bg, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], color: mix(bg, ink, 0.15), fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: ink }, objs: o };
      },
    },

    // ------------------------------------------------------------ TVARY – bauhausová mozaika dlaždíc
    tvary: {
      name: tr('Tvary', 'Tvary'), fonts: 'outfit', pal: 'bauhaus', tags: ['dizajn', 'architekt', 'kreativ', 'agentura', 'skola', 'deti', 'barber', 'kaviaren', 'studio', 'galeria', 'odvazne', 'farebne', 'moderne', 'hrave'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#FBF3E2', ink = dark(pal.ink) ? pal.ink : '#1B2A44', acc = pal.accent, ye = pal.soft && !light(pal.soft) && !dark(pal.soft) ? pal.soft : '#E3A41B';
        const cols = [ink, acc, ye, bg];
        const o = [];
        const n = c.sq ? 3 : 3, rowsN = c.sq ? 2 : 3, s = c.sq ? W / 3 : H / 3, x0 = c.sq ? 0 : W - n * s, y0 = c.sq ? H - rowsN * s : 0;
        const rnd = seeded(brand(c));
        for (let r = 0; r < rowsN; r++) for (let k = 0; k < n; k++) {
          const x = x0 + k * s, y = y0 + r * s, i = (r * n + k + Math.floor(rnd() * 3)) % 4, b = cols[i], fg = cols[(i + 1 + (k % 2)) % 4], t = (r * 7 + k * 3 + Math.floor(rnd() * 5)) % 5;
          o.push(R(x, y, s + 0.05, s + 0.05, b));
          if (t === 0) o.push(C(x + s / 2, y + s / 2, s * 0.36, { fill: fg }));
          else if (t === 1) o.push(P(pie(x + s, y + s, s, 180, 270), { fill: fg }));
          else if (t === 2) o.push(P(pie(x + s / 2, y + s, s / 2, 180, 360), { fill: fg }));
          else if (t === 3) o.push(P(`M ${f2(x)} ${f2(y)} L ${f2(x + s)} ${f2(y)} L ${f2(x)} ${f2(y + s)} Z`, { fill: fg }));
          else { o.push(R(x + s * 0.25, y + s * 0.25, s * 0.5, s * 0.5, fg)); }
        }
        const mw = c.sq ? W - 2 * m : W - n * s - m - 3;
        const ty = c.sq ? m + 4.6 : H * 0.42;
        o.push(T(f.name, { field: 'name', x: m, y: ty, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', w: 700, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role || '', { field: 'role', x: m, y: ty + 1.2, size: 2, font: 't', w: 500, color: acc, fit: mw }));
        if (!c.sq) o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1B2A44', acc = pal.accent, bg = light(pal.bg) ? pal.bg : '#FBF3E2', ye = '#E3A41B';
        const o = [];
        const s = 6; for (let k = 0; k < Math.ceil(W / s) + 1; k++) { const x = k * s, col = [acc, ye, bg][k % 3]; if (k % 3 === 0) o.push(C(x + s / 2, H - s / 2, s * 0.4, { fill: col })); else if (k % 3 === 1) o.push(P(pie(x + s / 2, H, s / 2, 180, 360), { fill: col })); else o.push(R(x + 1, H - s + 1, s - 2, s - 2, col)); }
        o.push(logoOr(c, W / 2, H / 2 - 3, W * 0.6, H * 0.34, {}, T(brand(c), { field: 'company', x: W / 2, y: H / 2 - 3, ox: 'center', oy: 'center', size: c.sq ? 5 : 6.4, font: 'd', w: 700, color: bg, fit: W - 2 * m, ls: -0.02 })));
        o.push(T(f.web || f.tagline || '', { field: f.web ? 'web' : 'tagline', x: W / 2, y: H / 2 + 3.2, ox: 'center', oy: 'center', size: 1.9, font: 't', w: 500, ls: 0.1, color: ye, fit: W - 2 * m }));
        return { bg: { color: ink }, objs: o };
      },
    },


    // ------------------------------------------------------------ SWISS – medzinárodný typografický štýl: mriežka, kruh, stĺpce
    swiss: {
      name: 'Swiss', fonts: 'inter', pal: 'sneh', tags: ['it', 'firma', 'uctovnictvo', 'financie', 'architekt', 'dizajn', 'marketing', 'startup', 'agentura', 'moderne', 'ciste', 'serioze', 'minimal', 'odvazne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F4F2EE', ink = dark(pal.ink) ? pal.ink : '#111111', acc = luminance(pal.accent) < 0.75 ? pal.accent : '#FF4F1F';
        const o = [];
        const cw = (W - 2 * m) / 6;
        for (let i = 0; i <= 6; i++) o.push(Ln(m + i * cw, 0, m + i * cw, H, ink, 0.04, { opacity: 0.18 }));
        o.push(C(W - m - cw * 0.9, m + cw * 0.5, c.sq ? 14 : 15, { fill: acc }));
        o.push(Ln(m, m + 6.2, W - m, m + 6.2, ink, 0.25));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: m + 4.8, oy: 'bottom', size: 1.75, font: 't', w: 600, ls: 0.06, color: ink, fit: cw * 2.6 }));
        if (!c.sq) o.push(...rows(c, { x: m + cw * 2.6, yb: m + 4.8, keys: ['phone'], color: ink, fit: cw * 1.5, size: 1.75, lh: 2.6 }));
        const word = brand(c);
        o.push(T(word, { field: 'company', x: m - 0.6, y: H - m + 0.6, oy: 'bottom', size: c.sq ? 9 : 12, font: 'd', w: 700, color: ink, fit: W - 2 * m + 1, ls: -0.05 }));
        o.push(T(f.name, { field: 'name', x: m, y: H - m - (c.sq ? 10.6 : 13.4), oy: 'bottom', size: 2.2, font: 't', w: 600, color: ink, fit: W * 0.5 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#111111', acc = luminance(pal.accent) < 0.75 ? pal.accent : '#FF4F1F', wh = '#FFFFFF';
        const R0 = c.sq ? 19 : 23, cx = c.sq ? W * 0.82 : W * 0.86, cy = c.sq ? H * 1.02 : H * 1.08;
        const o = [C(c.sq ? W * 0.2 : W * 0.12, H * 0.92, c.sq ? 18 : 22, { stroke: wh, sw: 0.25, opacity: 0.45 }), C(cx, cy, R0, { fill: ink })];
        const cw = (W - 2 * m) / 6;
        for (let i = 1; i < 6; i++) o.push(Ln(m + i * cw, 0, m + i * cw, H, ink, 0.05, { opacity: 0.18 }));
        const L = [['T', f.phone, 'phone'], ['E', f.email, 'email'], ['W', f.web, 'web'], ['A', f.address, 'address']].filter((x) => x[1]);
        L.slice(0, c.sq ? 3 : 4).forEach(([k, v, fld], i) => {
          const col = c.sq ? 0 : (i % 2) * 3, row = c.sq ? i : Math.floor(i / 2), x = m + col * cw, y = m + 3 + row * (c.sq ? 6.6 : 8);
          o.push(Ln(x, y - 2.6, x + cw * (c.sq ? 4 : 2.8), y - 2.6, ink, 0.2));
          o.push(T(k, { x, y, oy: 'bottom', size: 1.7, font: 't', w: 700, color: wh }));
          o.push(T(v, { field: fld, x, y: y + 2.6, oy: 'bottom', size: 1.85, font: 't', w: 500, color: ink, fit: cw * (c.sq ? 4.4 : 2.8) }));
        });
        o.push(T(f.name, { field: 'name', x: W - m, y: H - m, ox: 'right', oy: 'bottom', size: c.sq ? 2.4 : 2.8, font: 'd', w: 700, color: wh, fit: c.sq ? W * 0.42 : W * 0.32, ls: -0.02 }));
        o.push(T('↗', { x: W - m, y: H - m - 4.2, ox: 'right', oy: 'bottom', size: 3, font: 't', w: 700, color: acc }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ FIGLIA – pekáreň/bistro: kreslený croissant a klasy, ručne písaný slogan
    figlia: {
      name: 'Figlia', fonts: 'caslon', pal: 'piesok', emblem: 'bread', tags: ['pekaren', 'restauracia', 'kaviaren', 'bistro', 'cukraren', 'obchod', 'remeslo', 'farma', 'elegantne', 'prirodne', 'klasicky', 'teple', 'tradicne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#EFE6D8', ink = dark(pal.ink) ? pal.ink : '#2A2119', acc = pal.accent, crust = mix('#C98A3E', acc, 0.25);
        const o = [paper(c, 0.6)];
        const cx = c.sq ? W / 2 : W * 0.74, cy = c.sq ? H * 0.34 : H * 0.48, R0 = c.sq ? 10 : 12.5;
        // bochník kváskového chleba s naseknutím
        const ly = cy + R0 * 0.1;
        o.push(P(oval(cx + 0.6, ly + R0 * 0.36, R0 * 1.02, R0 * 0.18), { fill: '#000000', opacity: 0.12 }));
        o.push(P(oval(cx, ly, R0, R0 * 0.46, rad(-4)), { fill: { grad: [mix(crust, '#FFE6B8', 0.45), crust, mix(crust, '#4A2810', 0.45)], radial: true, cx: 0.42, cy: 0.32, r: 0.78 }, stroke: ink, sw: 0.18 }));
        for (let k = 0; k < 4; k++) { const x = cx - R0 * 0.6 + k * R0 * 0.38; o.push(P(`M ${f2(x - R0 * 0.08)} ${f2(ly + R0 * 0.2)} Q ${f2(x + R0 * 0.02)} ${f2(ly - R0 * 0.02)} ${f2(x + R0 * 0.2)} ${f2(ly - R0 * 0.24)}`, { stroke: mix(crust, '#FFF1D6', 0.6), sw: R0 * 0.07 }), P(`M ${f2(x - R0 * 0.08)} ${f2(ly + R0 * 0.2)} Q ${f2(x + R0 * 0.02)} ${f2(ly - R0 * 0.02)} ${f2(x + R0 * 0.2)} ${f2(ly - R0 * 0.24)}`, { stroke: ink, sw: 0.1, opacity: 0.6 })); }
        for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; o.push(C(cx + Math.cos(a) * R0 * 0.62, ly + Math.sin(a) * R0 * 0.26, 0.12, { fill: '#FFF8EC', opacity: 0.7 })); }
        o.push(...sprig(cx - R0 * 1.15, cy + R0 * 0.5, c.sq ? 8 : 11, -120, { color: acc, leaves: 7, size: 1.9 }), ...sprig(cx + R0 * 1.15, cy + R0 * 0.5, c.sq ? 8 : 11, -60, { color: acc, leaves: 7, size: 1.9 }));
                const tx = c.sq ? W / 2 : m + 0.5, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m : W * 0.5, by = c.sq ? H * 0.72 : H * 0.42;
        o.push(T(brand(c), { field: 'company', x: tx, y: by, ox: al, oy: 'bottom', size: c.sq ? 4.2 : 5.6, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: tx + (c.sq ? 0 : 0.4), y: by + 1.6, ox: al, size: c.sq ? 2.6 : 3, font: SCRIPT, color: acc, fit: mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        else o.push(...rows(c, { x: m + 0.5, yb: H - m, color: mix(ink, bg, 0.15), fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, bg = mix(acc, '#2A1A10', 0.35), cr = '#F3E9D8';
        const rnd = seeded(f.name + 'fg'), o = [];
        for (let y = -2; y < H + 4; y += 8) for (let x = ((y / 8) % 2 ? 4 : -2); x < W + 4; x += 10) o.push(...sprig(x, y + 6, 6, -70 - rnd() * 40, { color: mix(bg, cr, 0.18), leaves: 5, size: 1.3 }));
        o.push(C(W / 2, H / 2, c.sq ? 16 : 15.5, { fill: bg }), C(W / 2, H / 2, c.sq ? 15 : 14.5, { stroke: cr, sw: 0.16 }), C(W / 2, H / 2, c.sq ? 14.2 : 13.7, { stroke: cr, sw: 0.08, opacity: 0.7 }));
        o.push(...ringText(brand(c).toLocaleUpperCase(), W / 2, H / 2, c.sq ? 12.2 : 11.7, -150, -30, { size: 1.8, color: cr, w: 600 }));
        o.push(emblem(c, W / 2, H / 2 + 0.4, 7.4, cr));
        o.push(T((city(c) || f.web || '').toLocaleUpperCase(), { field: city(c) ? 'address' : 'web', x: W / 2, y: H / 2 + (c.sq ? 9.4 : 9), ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.24, color: cr, fit: 20 }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ============================================================ NOVÉ ============================================================

    // ------------------------------------------------------------ ISKRA – elektrikár: blesk a plošný spoj
    iskra: {
      name: tr('Iskra', 'Jiskra'), fonts: 'bebas', pal: 'navy', emblem: 'lightning', tags: ['elektro', 'elektrikar', 'instalater', 'servis', 'technik', 'fotovoltika', 'remeslo', 'stavba', 'it', 'odvazne', 'technicke', 'tmave', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.3 ? pal.bg : '#14213D', ye = luminance(pal.accent) > 0.35 ? pal.accent : '#F5C518', wh = '#F4F1EA';
        const o = [];
        o.push(...traces(f.name, c.sq ? -2 : W * 0.42, c.sq ? H * 0.42 : -1, W + 2, c.sq ? H + 2 : H + 1, c.sq ? 7 : 9, mix(bg, ye, 0.32), { sw: 0.2 }));
        const s = c.sq ? 20 : 28, bx = c.sq ? W - s * 0.72 - m + 2 : W - s * 0.72 - m, by = c.sq ? H * 0.32 : (H - s * 1.08) / 2;
        o.push(P(bolt(bx + 1, by + 1, s), { fill: '#000000', opacity: 0.3 }), P(bolt(bx, by, s), { fill: ye }), P(bolt(bx + s * 0.12, by + s * 0.08, s * 0.78), { stroke: mix(ye, '#FFFFFF', 0.5), sw: 0.16, opacity: 0.8 }));
        const mw = c.sq ? W - 2 * m : W * 0.52;
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m + 7.4, oy: 'bottom', size: c.sq ? 6.4 : 8.2, font: 'd', color: wh, fit: mw, ls: 0.02 }));
        o.push(R(m, m + 8.8, 9, 0.6, ye));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: m + 10.6, size: 1.9, font: 't', w: 600, color: wh, opacity: 0.85, fit: mw }));
        if (!c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 4.2, font: 'd', color: ye, ls: 0.04, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.3 ? pal.bg : '#14213D', ye = luminance(pal.accent) > 0.35 ? pal.accent : '#F5C518';
        const o = [...traces(f.name + 'b', -2, -1, W + 2, H + 1, 10, mix(ye, bg, 0.22), { sw: 0.2, opacity: 0.6 })];
        const pw = c.sq ? W - 2 * m + 2 : W * 0.62, px = m - 1, py = c.sq ? H * 0.28 : m - 1, ph = c.sq ? H * 0.72 - m + 1 : H - 2 * m + 2;
        o.push(R(px, py, pw, ph, ye));
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: px + 3, y: py + 6, oy: 'bottom', size: 4.6, font: 'd', color: bg, fit: pw - 6, ls: 0.03 }));
        o.push(T(f.role || '', { field: 'role', x: px + 3, y: py + 7, size: 1.85, font: 't', w: 600, color: bg, fit: pw - 6 }));
        o.push(...rows(c, { x: px + 3, yb: py + ph - 2.4, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: bg, fit: pw - 6, size: 1.85, lh: 2.75, weight: 600 }));
        if (!c.sq) o.push(emblem(c, W - (W - px - pw) / 2, H / 2, 10, ye));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ ČISTO – upratovanie: bubliny a lesk
    cisto: {
      name: tr('Čisto', 'Čisto'), fonts: 'outfit', pal: 'more', emblem: 'broom', tags: ['upratovanie', 'cistenie', 'pradelna', 'domacnost', 'sluzby', 'facility', 'okna', 'auto', 'svieze', 'jemne', 'moderne', 'ciste'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F2F7F7', ink = dark(pal.ink) ? pal.ink : '#12302F', acc = pal.accent, rim = mix(acc, '#FFFFFF', 0.25);
        const o = [];
        o.push(C(c.sq ? W * 0.75 : W * 0.8, c.sq ? H * 0.28 : H * 0.42, c.sq ? 16 : 20, { fill: { grad: [mix(acc, '#FFFFFF', 0.72), 'rgba(255,255,255,0)'], radial: true } }));
        const rnd = seeded(f.name + 'b'), pts = c.sq ? [[W * 0.72, H * 0.26, 7], [W * 0.88, H * 0.12, 3.6], [W * 0.56, H * 0.12, 2.6], [W * 0.9, H * 0.42, 2.2], [W * 0.6, H * 0.4, 1.6]] : [[W * 0.78, H * 0.44, 9], [W * 0.92, H * 0.22, 4.4], [W * 0.62, H * 0.2, 3.2], [W * 0.94, H * 0.72, 3], [W * 0.66, H * 0.74, 2.2], [W * 0.86, H * 0.86, 1.5], [W * 0.56, H * 0.48, 1.3]];
        pts.forEach(([x, y, r]) => o.push(...bubble(x, y, r, acc, { rim })));
        o.push(twinkle(c.sq ? W * 0.86 : W * 0.88, c.sq ? H * 0.3 : H * 0.5, c.sq ? 2.2 : 2.8, acc), twinkle(c.sq ? W * 0.66 : W * 0.7, c.sq ? H * 0.14 : H * 0.3, 1.2, acc), twinkle(c.sq ? W * 0.94 : W * 0.97, c.sq ? H * 0.06 : H * 0.1, 0.9, acc));
        o.push(emblem(c, c.sq ? W * 0.72 : W * 0.78, c.sq ? H * 0.26 : H * 0.44, c.sq ? 6.4 : 8.4, acc));
        const mw = c.sq ? W - 2 * m : W * 0.52, ty = c.sq ? H * 0.66 : H * 0.42;
        o.push(T(brand(c), { field: 'company', x: m, y: ty, oy: 'bottom', size: c.sq ? 4.6 : 5.8, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ty + 1.3, size: 2, font: 't', color: acc, fit: mw }));
        if (c.sq) o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 2.4, font: 'd', w: 600, color: ink, fit: mw }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.85, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, ink = dark(pal.ink) ? pal.ink : '#12302F', wh = '#FFFFFF';
        const o = [];
        o.push(...waveFill(W, H, H * 0.62, 1.8, 34, 0.4, mix(acc, '#FFFFFF', 0.2)), ...waveFill(W, H, H * 0.74, 1.5, 28, 2.6, mix(acc, ink, 0.25)));
        const rnd = seeded(f.name + 'bb');
        for (let i = 0; i < 9; i++) o.push(...bubble(rnd() * W, H * 0.5 + rnd() * H * 0.45, 0.8 + rnd() * 2.4, wh, { rim: wh, opacity: 0.7 }));
        o.push(T(f.name, { field: 'name', x: m, y: m + 4.6, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', w: 600, color: wh, fit: W - 2 * m }));
        o.push(T(f.role || '', { field: 'role', x: m, y: m + 5.8, size: 1.85, font: 't', color: mix(wh, acc, 0.25), fit: W - 2 * m }));
        o.push(...rows(c, { x: m, yb: c.sq ? H * 0.56 : H * 0.6, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: wh, fit: W - 2 * m, size: 1.85, lh: 2.75, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ SILA – fitnes tréner: šikmý pruh a obrovské písmo
    sila: {
      name: tr('Sila', 'Síla'), fonts: 'archivo', pal: 'limetka', emblem: 'barbell', tags: ['fitness', 'trener', 'sport', 'gym', 'crossfit', 'beh', 'vyziva', 'fyzio', 'box', 'odvazne', 'tmave', 'moderne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.25 ? pal.bg : '#121411', acc = luminance(pal.accent) > 0.3 ? pal.accent : '#C6F24E', wh = '#F0F2EA';
        const o = [];
        o.push(P(`M ${f2(W * 0.52)} -3 L ${f2(W * 0.74)} -3 L ${f2(W * 0.5)} ${f2(H + 3)} L ${f2(W * 0.28)} ${f2(H + 3)} Z`, { fill: acc }));
        o.push(P(`M ${f2(W * 0.77)} -3 L ${f2(W * 0.81)} -3 L ${f2(W * 0.57)} ${f2(H + 3)} L ${f2(W * 0.53)} ${f2(H + 3)} Z`, { fill: acc, opacity: 0.5 }));
        const word = (first(c) || brand(c)).toLocaleUpperCase();
        o.push(T(word, { x: W - m + 1, y: H * 0.54, ox: 'right', oy: 'center', size: c.sq ? 11 : 15, font: 'd', it: true, color: 'none', stroke: wh, sw: 0.14, fit: W - 2 * m, rot: 0 }));
        o.push(T(word, { x: W - m, y: H * 0.54 - 0.8, ox: 'right', oy: 'center', size: c.sq ? 11 : 15, font: 'd', it: true, color: wh, fit: W - 2 * m, opacity: 0.95 }));
        o.push(emblem(c, m + 4, m + 4, 7.4, acc));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W - m, y: H - m, ox: 'right', oy: 'bottom', size: 1.85, font: 't', w: 700, ls: 0.28, color: wh, fit: W * 0.6 }));
        o.push(T(last(c).toLocaleUpperCase(), { field: 'name', x: W - m, y: H * 0.54 + (c.sq ? 7 : 9.6), ox: 'right', oy: 'center', size: c.sq ? 2.6 : 3.2, font: 't', w: 700, ls: 0.4, color: acc, fit: W * 0.6 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.25 ? pal.bg : '#121411', acc = luminance(pal.accent) > 0.3 ? pal.accent : '#C6F24E';
        const o = [];
        for (let i = -2; i < W / 5 + 2; i++) { const x = i * 5; o.push(P(`M ${f2(x)} ${f2(H - 8)} L ${f2(x + 2.5)} ${f2(H - 10.5)} L ${f2(x + 5)} ${f2(H - 8)}`, { stroke: bg, sw: 0.5, opacity: 0.25 })); }
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', color: bg, fit: W - 2 * m }));
        o.push(T(f.tagline || brand(c), { field: f.tagline ? 'tagline' : 'company', x: m, y: m + 6.3, size: 1.95, font: 't', w: 600, color: bg, opacity: 0.75, fit: W - 2 * m }));
        o.push(...rows(c, { x: m, yb: H - 12, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: bg, fit: W - 2 * m, size: 1.9, lh: 2.8, weight: 700 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ ATRAMENT – tetovanie: ruža, stuha a hviezdy v štýle flash
    atrament: {
      name: tr('Atrament', 'Inkoust'), fonts: 'abril', pal: 'cervena', emblem: 'needle', tags: ['tetovanie', 'tattoo', 'piercing', 'barber', 'umelec', 'hudba', 'bar', 'vintage', 'retro', 'odvazne', 'tmave', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = '#151210', cr = '#F1E6D2', red = luminance(pal.bg) < 0.4 ? mix(pal.bg, '#E0402F', 0.5) : '#B8322A', grn = '#3E6B4A';
        const o = [IMG(tex(c, 'cierna'), -2.5, -2.5, W + 5, H + 5, { role: 'art', opacity: 0.8 })];
        const cx = c.sq ? W / 2 : W * 0.72, cy = c.sq ? H * 0.36 : H * 0.44, r = c.sq ? 7.5 : 9;
        o.push(P(leaf(cx - r * 0.6, cy + r * 0.5, rad(150), r * 1.4, r * 0.5), { fill: grn, stroke: cr, sw: 0.2 }), P(leaf(cx + r * 0.6, cy + r * 0.5, rad(30), r * 1.4, r * 0.5), { fill: grn, stroke: cr, sw: 0.2 }));
        o.push(...rose(cx, cy, r, red, cr));
        [[cx - r * 1.9, cy - r * 0.9, 1.4], [cx + r * 1.9, cy - r * 0.7, 1.1], [cx + r * 1.6, cy + r * 1.3, 0.9], [cx - r * 1.5, cy + r * 1.5, 0.8]].forEach(([x, y, s]) => o.push(twinkle(x, y, s, cr)));
        o.push(...banner(cx, cy + r + 2.6, c.sq ? W - 2 * m - 6 : r * 3.6, 4.4, cr, cr));
        o.push(T(brand(c), { field: 'company', x: cx, y: cy + r + 2.4, ox: 'center', oy: 'center', size: 2.4, font: 'd', color: bg, fit: c.sq ? W - 2 * m - 10 : r * 3.4 }));
        if (!c.sq) {
          const mw = W * 0.4;
          o.push(T(f.name, { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 4.6, font: 'd', color: cr, fit: mw }));
          o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: H * 0.42 + 1.3, size: 1.8, font: 't', w: 600, ls: 0.24, color: red, fit: mw }));
          o.push(...rows(c, { x: m, yb: H - m, color: cr, fit: mw, size: 1.8, lh: 2.75 }));
        } else o.push(T(f.name, { field: 'name', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 3, font: 'd', color: cr, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const cr = '#F1E6D2', ink = '#151210', red = luminance(pal.bg) < 0.4 ? mix(pal.bg, '#E0402F', 0.5) : '#B8322A';
        const o = [paper(c, 0.7)];
        o.push(R(2.6, 2.6, W - 5.2, H - 5.2, null, { stroke: ink, sw: 0.3 }), R(3.5, 3.5, W - 7, H - 7, null, { stroke: red, sw: 0.14 }));
        o.push(emblem(c, W / 2, c.sq ? 13 : 12, c.sq ? 8 : 9, ink));
        [[-1, 1], [1, 1]].forEach(([s]) => o.push(twinkle(W / 2 + s * (c.sq ? 9 : 12), c.sq ? 13 : 12, 1.2, red)));
        o.push(T(f.name, { field: 'name', x: W / 2, y: H * (c.sq ? 0.54 : 0.56), ox: 'center', oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: ink, fit: W - 2 * m - 4 }));
        o.push(...centerLines(c, W / 2, H - m - 1, { color: ink, fit: W - 2 * m - 4, size: 1.8, lh: 2.7 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ BILANCIA – účtovníčka: zlaté počítadlo na noblesnej modrej
    bilancia: {
      name: tr('Bilancia', 'Bilance'), fonts: 'caslon', pal: 'noblesa', emblem: 'calculator', tags: ['uctovnictvo', 'financie', 'dane', 'poradenstvo', 'poistenie', 'banka', 'mzdy', 'audit', 'pravnik', 'elegantne', 'serioze', 'luxusne', 'tmave'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.3 ? pal.bg : '#14213D', g = G(pal), met = MET(pal), cr = light(pal.ink) ? pal.ink : '#F4EFE6';
        const o = [IMG(tex(c, 'navy'), -2.5, -2.5, W + 5, H + 5, { role: 'art', blend: 'multiply', opacity: 0.35 })];
        const x0 = c.sq ? m + 2 : W * 0.56, x1 = W - m, y0 = c.sq ? m + 2 : m + 1, rowsN = c.sq ? 4 : 5, gap = c.sq ? 4.2 : (H - 2 * m - 2) / (rowsN - 1);
        o.push(R(x0 - 1.6, y0 - 2.2, x1 - x0 + 3.2, gap * (rowsN - 1) + 4.4, null, { stroke: g, sw: 0.24 }));
        const rnd = seeded(f.name + 'ab');
        for (let r = 0; r < rowsN; r++) {
          const y = y0 + r * gap; o.push(Ln(x0 - 1.6, y, x1 + 1.6, y, met, 0.12, { opacity: 0.8 }));
          const nL = 1 + Math.floor(rnd() * 4), nR = 6 - nL;
          const bead = (x, col, hi) => o.push(P(oval(x, y, 1.08, 0.86), { fill: { grad: [hi, col, mix(col, '#000000', 0.35)], stops: [0, 0.5, 1], radial: true, cx: 0.38, cy: 0.3, r: 0.75 } }));
          for (let i = 0; i < nL; i++) bead(x0 + 1.15 + i * 2.25, MET(pal), '#FFF2C8');
          for (let i = 0; i < nR; i++) bead(x1 - 1.15 - i * 2.25, mix(cr, bg, 0.2), '#FFFFFF');
        }
        const mw = c.sq ? W - 2 * m : W * 0.46, ny = c.sq ? H * 0.74 : H * 0.48;
        o.push(T(f.name, { field: 'name', x: m, y: ny, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', color: cr, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: ny + 1.3, size: 1.7, font: 't', w: 500, ls: 0.28, color: g, fit: mw }));
        if (!c.sq) o.push(T(brand(c), { field: 'company', x: m, y: H - m, oy: 'bottom', size: 2.1, font: 'd', it: true, color: cr, opacity: 0.85, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) < 0.3 ? pal.bg : '#14213D', g = G(pal), iv = '#F4EFE6', met = MET(pal);
        const o = [paper(c, 0.55)];
        o.push(R(-2, -2, W + 4, 3.6, bg), Ln(-2, 2.2, W + 2, 2.2, g, 0.2));
        o.push(R(3, 4.4, W - 6, H - 7.4, null, { stroke: met, sw: 0.1, opacity: 0.7 }));
        o.push(T(brand(c), { field: 'company', x: m, y: m + 6, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: bg, fit: W - 2 * m - 10 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: m, y: m + 7.3, size: 1.95, font: 'd', it: true, color: mix(bg, iv, 0.35), fit: W - 2 * m - 10 }));
        o.push(emblem(c, W - m - 4, m + 6, 7, g));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], color: bg, labels: true, lcolor: met, fit: c.sq ? W - 2 * m : W * 0.56, size: 1.8, lh: 2.75 }));
        if (!c.sq) {
          // malé počítadlo vpravo dole
          const x0 = W * 0.68, x1 = W - m, y0 = H - m - 8.6, gap = 2.9, rnd = seeded(f.name + 'bk');
          o.push(R(x0 - 1.4, y0 - 1.9, x1 - x0 + 2.8, gap * 3 + 3.8, null, { stroke: met, sw: 0.18 }));
          for (let r = 0; r < 4; r++) { const y = y0 + r * gap; o.push(Ln(x0 - 1.4, y, x1 + 1.4, y, met, 0.1)); const nL = 1 + Math.floor(rnd() * 3); for (let i = 0; i < 5; i++) { const left = i < nL, x = left ? x0 + 0.9 + i * 1.9 : x1 - 0.9 - (4 - i) * 1.9; o.push(P(oval(x, y, 0.88, 0.7), { fill: left ? g : bg })); } }
        }
        return { bg: { color: iv }, objs: o };
      },
    },

    // ------------------------------------------------------------ DÚŠA – psychologička: akvarelové škvrny a dva prepletené kruhy
    dusa: {
      name: tr('Duša', 'Duše'), fonts: 'italiana', pal: 'levandula', emblem: 'butterfly', tags: ['psycholog', 'terapeut', 'kouc', 'poradna', 'mediacia', 'wellness', 'joga', 'dula', 'jemne', 'zenske', 'elegantne', 'osobne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#ECE8F5', ink = dark(pal.ink) ? pal.ink : '#251F3A', acc = pal.accent;
        const o = [IMG(c.root + 'assets/tex/blob-sivy.png', c.sq ? W * 0.2 : W * 0.42, c.sq ? -10 : -12, c.sq ? 46 : 58, c.sq ? 40 : 46, { role: 'art', blend: 'multiply', opacity: 0.55 }), IMG(c.root + 'assets/tex/blob-ruza.png', c.sq ? -12 : W * 0.6, c.sq ? H * 0.2 : H * 0.18, c.sq ? 40 : 48, c.sq ? 34 : 40, { role: 'art', blend: 'multiply', opacity: 0.6 })];
        const cx = c.sq ? W / 2 : W * 0.74, cy = c.sq ? H * 0.32 : H * 0.48, r = c.sq ? 7.5 : 9.5;
        o.push(C(cx - r * 0.42, cy, r, { stroke: acc, sw: 0.22 }), C(cx + r * 0.42, cy, r, { stroke: ink, sw: 0.14 }));
        o.push(emblem(c, cx, cy, r * 0.62, acc));
        o.push(...sprig(cx + r * 1.2, cy + r * 1.1, c.sq ? 8 : 11, -150, { color: acc, leaves: 6, size: 1.9 }));
        const mw = c.sq ? W - 2 * m : W * 0.46, al = c.sq ? 'center' : 'left', tx = c.sq ? W / 2 : m, ny = c.sq ? H * 0.7 : H * 0.44;
        o.push(T(f.name, { field: 'name', x: tx, y: ny, ox: al, oy: 'bottom', size: c.sq ? 4 : 5, font: 'd', color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: tx, y: ny + 1.3, ox: al, size: 1.7, font: 't', w: 600, ls: 0.26, color: acc, fit: mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: ink, fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, bg = mix(acc, '#1A1530', 0.35), lt = '#F3F0FA';
        const o = [IMG(c.root + 'assets/tex/blob-ruza.png', -10, -8, W * 0.8, H * 1.1, { role: 'art', blend: 'screen', opacity: 0.18 })];
        const cx = W / 2, cy = H * 0.4, r = c.sq ? 6 : 7;
        o.push(C(cx - r * 0.42, cy, r, { stroke: lt, sw: 0.18, opacity: 0.9 }), C(cx + r * 0.42, cy, r, { stroke: mix(lt, acc, 0.4), sw: 0.14 }));
        o.push(T(brand(c), { field: 'company', x: W / 2, y: H * 0.72, ox: 'center', oy: 'bottom', size: c.sq ? 3.6 : 4.2, font: 'd', color: lt, fit: W - 2 * m }));
        o.push(T(f.tagline || '', { field: 'tagline', x: W / 2, y: H * 0.72 + 1.3, ox: 'center', size: 1.9, font: 't', it: true, color: mix(lt, acc, 0.3), fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ ÁNO – svadobný fotograf: zlatá clona, kaligrafia a polaroidy
    vows: {
      name: tr('Áno', 'Ano'), fonts: 'italiana', pal: 'ivory', emblem: 'aperture', tags: ['foto', 'fotograf', 'svadba', 'video', 'kameraman', 'eventy', 'portret', 'umelec', 'elegantne', 'jemne', 'luxusne', 'romanticke'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F4EFE6', ink = dark(pal.ink) ? pal.ink : '#2A2622', g = G(pal), met = MET(pal);
        const o = [paper(c, 0.55)];
        const cx = W / 2, cy = c.sq ? H * 0.36 : H * 0.4, r = c.sq ? 9 : 10.5;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, b = a + Math.PI * 0.62; o.push(P(`M ${f2(cx + Math.cos(a) * r)} ${f2(cy + Math.sin(a) * r)} Q ${f2(cx + Math.cos(a + 0.5) * r * 0.62)} ${f2(cy + Math.sin(a + 0.5) * r * 0.62)} ${f2(cx + Math.cos(b) * r * 0.42)} ${f2(cy + Math.sin(b) * r * 0.42)}`, { stroke: g, sw: 0.2 })); }
        o.push(C(cx, cy, r, { stroke: g, sw: 0.3 }), C(cx, cy, r + 1.2, { stroke: met, sw: 0.1 }));
        o.push(...sprig(cx - r - 1, cy + 2, c.sq ? 9 : 13, 160, { color: met, leaves: 7, size: 2.2 }), ...sprig(cx + r + 1, cy + 2, c.sq ? 9 : 13, 20, { color: met, leaves: 7, size: 2.2 }));
        o.push(T(f.name, { field: 'name', x: W / 2, y: cy + r + (c.sq ? 8 : 8.6), ox: 'center', oy: 'bottom', size: c.sq ? 4.6 : 5.6, font: SCRIPT, color: ink, fit: W - 2 * m }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: cy + r + (c.sq ? 10.6 : 11.4), ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.34, color: met, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = '#1E1B18', g = G(pal), iv = '#F4EFE6', met = MET(pal);
        const o = [];
        const pol = (x, y, w, a, tone) => { const hh = w * 1.18; o.push(R(x + 0.5, y + 0.7, w, hh, '#000000', { rot: a, opacity: 0.35 }), R(x, y, w, hh, iv, { rot: a }), R(x + w * 0.08, y + w * 0.08, w * 0.84, w * 0.84, { grad: tone, angle: 120 }, { rot: a })); };
        if (!c.sq) { pol(W * 0.62, H * 0.18, 14, -8, ['#C9B79C', '#6E5B4D']); pol(W * 0.74, H * 0.3, 14, 7, ['#E3D6C2', '#8A7660']); }
        else { pol(W * 0.52, H * 0.08, 12, 8, ['#C9B79C', '#6E5B4D']); }
        const mw = c.sq ? W - 2 * m : W * 0.52;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.6 : m + 6, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', color: iv, fit: mw }));
        o.push(Ln(m, (c.sq ? H * 0.6 : m + 6) + 2, m + 9, (c.sq ? H * 0.6 : m + 6) + 2, g, 0.25));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: mix(iv, ink, 0.12), fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: ink, art: tex(c, 'cierna'), artOpacity: 0.7 }, objs: o };
      },
    },

    // ------------------------------------------------------------ BRITVA – vintage barber: točiaci sa stĺpik a oblúkový nápis
    britva: {
      name: tr('Britva', 'Břitva'), fonts: 'bebas', pal: 'retro', emblem: 'scissors', tags: ['barber', 'kader', 'holic', 'pansky', 'vintage', 'retro', 'tetovanie', 'bar', 'tradicne', 'odvazne', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F7E9D2', ink = dark(pal.ink) ? pal.ink : '#3B1F12', red = '#B8322A', blue = '#1F3A68';
        const o = [paper(c, 0.6)];
        const cx = c.sq ? W / 2 : W * 0.3, cy = c.sq ? H * 0.4 : H / 2, r = c.sq ? 14 : 17;
        o.push(C(cx, cy, r, { stroke: ink, sw: 0.4 }), C(cx, cy, r - 1, { stroke: ink, sw: 0.12 }), C(cx, cy, r - 5.4, { stroke: ink, sw: 0.12 }));
        o.push(...arcText(brand(c).toLocaleUpperCase(), cx, cy, r - 3.2, -158, -22, { size: 2.2, color: ink, font: 'd', w: 400 }));
        o.push(...arcText(('EST. ' + (city(c) || '')).toLocaleUpperCase(), cx, cy, r - 3.2, 150, 30, { size: 1.8, color: red, font: 't', w: 700, bottom: true }));
        // stĺpik
        const pw = c.sq ? 3.6 : 4.4, ph = c.sq ? 12 : 15, px = cx - pw / 2, py = cy - ph / 2;
        o.push(R(px - 0.6, py - 1.6, pw + 1.2, 1.4, ink, { rx: 0.5 }), R(px - 0.6, py + ph + 0.2, pw + 1.2, 1.4, ink, { rx: 0.5 }), C(cx, py - 2.4, 1, { fill: ink }));
        o.push(R(px, py, pw, ph, '#FFFFFF', { stroke: ink, sw: 0.18 }));
        for (let k = -2; k < ph / 2.2 + 1; k++) { const y = py + k * 2.2; const pts = [[px, y + 1.4], [px + pw, y], [px + pw, y + 0.9], [px, y + 2.3]].map(([x, yy]) => [x, Math.max(py, Math.min(py + ph, yy))]); o.push(P('M ' + pts.map(([a, b]) => `${f2(a)} ${f2(b)}`).join(' L ') + ' Z', { fill: k % 2 ? red : blue })); }
        o.push(R(px, py, pw, ph, null, { stroke: ink, sw: 0.18 }));
        if (c.sq) { o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: W / 2, y: H - m - 2.4, ox: 'center', oy: 'bottom', size: 3.6, font: 'd', color: ink, fit: W - 2 * m, ls: 0.04 })); o.push(T(f.phone || '', { field: 'phone', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.85, font: 't', w: 600, color: red, fit: W - 2 * m })); }
        else {
          const x = W * 0.56, mw = W - x - m;
          o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x, y: m + 6, oy: 'bottom', size: 5, font: 'd', color: ink, fit: mw, ls: 0.04 }));
          o.push(T(f.tagline || f.role || '', { field: 'tagline', x, y: m + 7.2, size: 1.9, font: 't', it: true, color: red, fit: mw }));
          o.push(...rows(c, { x, yb: H - m, keys: ['phone', 'web', 'address'], color: ink, fit: mw, size: 1.8, lh: 2.75, weight: 600 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const blue = '#1F3A68', red = '#B8322A', cr = '#F7E9D2';
        const o = [];
        for (let k = -6; k < (W + H) / 3; k++) { const x = k * 3; o.push(P(`M ${f2(x)} -2 L ${f2(x + 1.5)} -2 L ${f2(x + 1.5 - 4)} 2.5 L ${f2(x - 4)} 2.5 Z`, { fill: k % 2 ? red : cr }), P(`M ${f2(x)} ${f2(H - 2.5)} L ${f2(x + 1.5)} ${f2(H - 2.5)} L ${f2(x + 1.5 - 4)} ${f2(H + 2)} L ${f2(x - 4)} ${f2(H + 2)} Z`, { fill: k % 2 ? red : cr })); }
        o.push(emblem(c, W / 2, H * 0.36, c.sq ? 8 : 9, cr));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.62, ox: 'center', oy: 'center', size: c.sq ? 4.4 : 5.4, font: 'd', color: cr, fit: W - 2 * m, ls: 0.06 }));
        o.push(T([f.phone, f.web].filter(Boolean).join('   ·   '), { x: W / 2, y: H * 0.62 + 4, ox: 'center', oy: 'center', size: 1.85, font: 't', w: 600, color: mix(cr, blue, 0.2), fit: W - 2 * m }));
        return { bg: { color: blue }, objs: o };
      },
    },

    // ------------------------------------------------------------ GLAZÚRA – moderná cukráreň: steká čokoláda, posýpka, makrónky
    glazura: {
      name: tr('Glazúra', 'Glazura'), fonts: 'bricolage', pal: 'pastel', emblem: 'cake', tags: ['cukraren', 'cukrar', 'torty', 'pekaren', 'kaviaren', 'zmrzlina', 'dezerty', 'deti', 'oslavy', 'hrave', 'farebne', 'mlade', 'sladke'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg && light(pal.bg) ? pal.bg : '#F9C9DA', choco = '#4A2C24', ink = dark(pal.ink) ? pal.ink : '#1E1B3A', acc = pal.accent;
        const cols = [acc, '#FFFFFF', '#FFD23F', '#6FC3B2', '#7A5CFF'];
        const o = [drips(W, c.sq ? 8 : 7, brand(c), choco)];
        o.push(...sprinkles(W, H, f.name, cols, [[-5, -5, W + 5, 14], [m - 2, H * 0.45, W * 0.62, H]], c.sq ? 22 : 30));
        const mac = (x, y, w, col) => [R(x - w / 2 + 0.4, y + 0.2, w - 0.8, 2.6, mix(col, '#000000', 0.1), { rx: 1.3 }), R(x - w / 2 + 0.2, y + 0.4, w - 0.4, 2.4, col, { rx: 1.2 }), R(x - w / 2 + 0.6, y - 0.6, w - 1.2, 1.2, '#FFF6E8', { rx: 0.6 }), R(x - w / 2, y - 3.2, w, 2.8, col, { rx: 1.4 }), R(x - w / 2 + 1, y - 2.8, w * 0.4, 0.5, '#FFFFFF', { rx: 0.25, opacity: 0.45 })];
        const mx = c.sq ? W - m - 6 : W - m - 7, my = c.sq ? H * 0.52 : H * 0.62;
        o.push(...mac(mx, my + 6, 11, '#F4A8C0'), ...mac(mx, my, 10, '#B7E4D6'), ...mac(mx, my - 6, 9, '#FFE08A'));
        const mw = c.sq ? W - 2 * m - 12 : W * 0.6;
        o.push(T(brand(c), { field: 'company', x: m, y: c.sq ? H * 0.58 : H * 0.6, oy: 'bottom', size: c.sq ? 4.4 : 6.2, font: 'd', color: choco, fit: mw, ls: -0.03 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: (c.sq ? H * 0.58 : H * 0.6) + 1.3, size: 2, font: 't', w: 600, color: ink, fit: mw }));
        o.push(T(f.phone || '', { field: 'phone', x: m, y: H - m, oy: 'bottom', size: 2.2, font: 'd', color: acc, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const choco = '#4A2C24', bg = pal.bg && light(pal.bg) ? pal.bg : '#F9C9DA', acc = pal.accent;
        const px = m - 1.5, py = m - 1.5, pw = W - 2 * px, ph = H - 2 * py;
        const o = [...sprinkles(W, H, f.name + 'b', [bg, '#FFFFFF', '#FFD23F', '#6FC3B2'], [[px - 0.5, py - 0.5, px + pw + 0.5, py + ph + 0.5]], 30)];
        o.push(R(px, py, pw, ph, bg, { rx: 3 }));
        // čokoládová poleva stekajúca z horného okraja panelu
        const rd = seeded(f.name + 'gl'); let d = `M ${f2(px + 3)} ${f2(py)} L ${f2(px + pw - 3)} ${f2(py)} Q ${f2(px + pw)} ${f2(py)} ${f2(px + pw)} ${f2(py + 3)} L ${f2(px + pw)} ${f2(py + 2.2)}`;
        for (let x = px + pw; x > px + 1;) { const w = 2.2 + rd() * 2.8, l = 1.2 + rd() * (rd() < 0.35 ? 5.5 : 2.2), x1 = Math.max(px, x - w); d += ` C ${f2(x - w * 0.15)} ${f2(py + 2.2 + l)} ${f2(x1 + w * 0.15)} ${f2(py + 2.2 + l)} ${f2(x1)} ${f2(py + 2.2)}`; x = x1; }
        d += ` L ${f2(px)} ${f2(py + 3)} Q ${f2(px)} ${f2(py)} ${f2(px + 3)} ${f2(py)} Z`;
        o.push(P(d, { fill: choco }));
        o.push(...sprinkles(pw, 3, f.name + 'gs', ['#FFFFFF', '#FFD23F', '#6FC3B2', bg], [], 12).map((s0) => ({ ...s0, x: (s0.x ?? 0) + px, y: (s0.y ?? 0) + py + 0.4 })));
        // makrónky
        const mac = (x, y, s, col) => [P(oval(x, y + s * 0.42, s, s * 0.34), { fill: mix(col, '#000000', 0.08) }), R(x - s * 0.86, y - s * 0.05, s * 1.72, s * 0.32, '#FFF7EE', { rx: s * 0.15 }), P(oval(x, y - s * 0.3, s, s * 0.38), { fill: col }), P(oval(x - s * 0.3, y - s * 0.42, s * 0.36, s * 0.1), { fill: '#FFFFFF', opacity: 0.35 })];
        if (!c.sq) { const mx = px + pw - 7.5, my = py + ph - 4; o.push(...mac(mx, my, 3.4, '#F2A7B8'), ...mac(mx - 1.2, my - 5.2, 3, '#B9E3D6'), ...mac(mx + 1, my - 9.6, 2.6, '#FFD98A')); }
        const nx = px + 2.5, mw = c.sq ? pw - 5 : pw - 18;
        o.push(T(f.name, { field: 'name', x: nx, y: py + 12, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: choco, fit: mw }));
        o.push(T(f.role || '', { field: 'role', x: nx, y: py + 13.2, size: 1.85, font: 't', w: 600, color: acc, fit: mw }));
        o.push(...rows(c, { x: nx, yb: py + ph - 2.2, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: choco, fit: mw, size: 1.8, lh: 2.7, weight: 500 }));
        return { bg: { color: choco }, objs: o };
      },
    },

    // ------------------------------------------------------------ ORBIT – startup: farebná hmla, sklenená karta a mriežka
    orbit: {
      name: 'Orbit', fonts: 'inter', pal: 'grafit', emblem: 'cpu', tags: ['it', 'startup', 'saas', 'aplikacie', 'ai', 'technologie', 'agentura', 'marketing', 'fintech', 'moderne', 'tmave', 'technicke', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = '#0B0D14', acc = pal.accent && luminance(pal.accent) > 0.25 ? pal.accent : '#9FD3C7', wh = '#F4F6FA';
        const o = [];
        o.push(C(W * 0.82, H * 0.2, c.sq ? 24 : 30, { fill: { grad: ['rgba(122,92,255,0.85)', 'rgba(122,92,255,0)'], radial: true } }));
        o.push(C(W * 0.58, H * 0.95, c.sq ? 22 : 28, { fill: { grad: [mix(acc, '#000000', 0.05), 'rgba(0,0,0,0)'], radial: true }, opacity: 0.9 }));
        o.push(C(W * 0.98, H * 0.9, c.sq ? 16 : 20, { fill: { grad: ['rgba(255,90,140,0.7)', 'rgba(255,90,140,0)'], radial: true } }));
        for (let x = 0; x <= W; x += 4) o.push(Ln(x, 0, x, H, wh, 0.04, { opacity: 0.08 }));
        for (let y = 0; y <= H; y += 4) o.push(Ln(0, y, W, y, wh, 0.04, { opacity: 0.08 }));
        const gx = c.sq ? m - 1 : W * 0.5, gy = c.sq ? H * 0.5 : m + 2, gw = c.sq ? W - 2 * m + 2 : W * 0.5 - m + 1, gh = c.sq ? H * 0.5 - m + 1 : H - 2 * m - 4;
        o.push(R(gx, gy, gw, gh, 'rgba(255,255,255,0.08)', { rx: 2.2, stroke: 'rgba(255,255,255,0.35)', sw: 0.12 }));
        o.push(C(gx + 3.2, gy + 3.2, 0.8, { fill: acc }), T('online', { x: gx + 4.6, y: gy + 3.2, oy: 'center', size: 1.7, font: 't', color: wh, opacity: 0.75 }));
        o.push(...rows(c, { x: gx + 2.6, yb: gy + gh - 2.4, keys: c.sq ? ['email', 'web'] : ['phone', 'email', 'web'], color: wh, fit: gw - 5, size: 1.8, lh: 2.7 }));
        o.push(logoOr(c, m + 3, m + 3, 6, 6, { tint: wh }, null) || C(m + 1.8, m + 1.8, 1.8, { fill: { grad: [acc, '#7A5CFF'], angle: 135 } }));
        const mw = c.sq ? W - 2 * m : W * 0.42, ny = c.sq ? H * 0.38 : H * 0.6;
        o.push(T(brand(c), { field: 'company', x: m, y: ny, oy: 'bottom', size: c.sq ? 5 : 6.4, font: 'd', color: wh, fit: mw, ls: -0.04 }));
        o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: ny + 1.3, size: 1.9, font: 't', color: wh, opacity: 0.7, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = '#0B0D14', acc = pal.accent && luminance(pal.accent) > 0.25 ? pal.accent : '#9FD3C7', wh = '#F4F6FA';
        const o = [C(W / 2, H / 2, c.sq ? 22 : 26, { fill: { grad: ['rgba(122,92,255,0.6)', 'rgba(122,92,255,0)'], radial: true } })];
        for (let i = 1; i <= 4; i++) o.push(P(oval(W / 2, H / 2, i * (c.sq ? 5.4 : 8), i * (c.sq ? 4 : 4.2), -0.25), { stroke: wh, sw: 0.06, opacity: 0.22 }));
        o.push(C(W / 2 + (c.sq ? 16 : 24) * 0.97, H / 2 - 2.4, 0.8, { fill: acc }), C(W / 2 - (c.sq ? 10 : 15), H / 2 + 3.6, 0.5, { fill: '#FF5A8C' }));
        o.push(logoOr(c, W / 2, H / 2, W * 0.5, H * 0.3, { tint: wh }, T(brand(c), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: c.sq ? 5 : 6.4, font: 'd', color: wh, fit: W - 2 * m, ls: -0.04 })));
        o.push(T(f.web || '', { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.8, font: 't', ls: 0.14, color: acc, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
    },
  });
}

/** Doplnky zadných strán existujúcich šablón (vrstvy pod / nad pôvodný obsah), aby žiadny rub nebol len farba a text. */
export function xBackExtras(h) {
  const { T, R, C, Ln, P, MONO, mix, luminance, seeded, smooth, splitName, bare, topoPaths } = h;
  const { FOIL, MET, f2, first, brand, sprig, emblem, arch, leaf } = ornaments(h);
  const dark = (col) => luminance(col) < 0.22, light = (col) => luminance(col) > 0.6;
  const ring = (cx, cy, r, n, seed, col, op) => { const rnd = seeded(seed), out = []; for (let k = 1; k <= n; k++) { const pts = []; for (let i = 0; i < 36; i++) { const t = (i / 36) * Math.PI * 2, rr = k * r * (1 + 0.05 * Math.sin(t * 3 + rnd() * 0.3 + k)); pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]); } out.push(P(smooth(pts, true), { stroke: col, sw: k % 4 === 0 ? 0.22 : 0.1, opacity: op })); } return out; };
  return {
    ahoj: { under(c) { const { W, H, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1E1B3A', acc = pal.accent, r = seeded(c.f.name + 'hb'), o = []; for (let i = 0; i < 16; i++) { const x = W * 0.45 + r() * W * 0.55, y = r() * H; if (x > W - m - 14 && y < m + 13) continue; const col = [acc, '#2F6BFF', '#F2B705', ink][i % 4]; if (i % 3 === 0) o.push(P(`M ${f2(x)} ${f2(y)} q 1 -1.4 2 0 t 2 0 t 2 0`, { stroke: col, sw: 0.4 })); else if (i % 3 === 1) o.push(C(x, y, 0.8, { fill: col })); else o.push(R(x, y, 1.4, 1.4, col, { rot: r() * 60 })); } return o; } },
    akvarelsalvia: { over(c) { const { W, H, pal } = c; const g = FOIL(pal), cx = W * 0.82, cy = H * 0.46, r = c.sq ? 6 : 7.5; return [C(cx, cy, r, { stroke: g, sw: 0.16 }), ...sprig(cx - 4.5, cy + r * 0.9, 9, -150, { color: '#6E8B76', leaves: 6, size: 2 }), ...sprig(cx + 4.5, cy + r * 0.9, 9, -30, { color: '#6E8B76', leaves: 6, size: 2 }), emblem(c, cx, cy, r * 1.1, '#2F3B32')]; } },
    letokruhy: { under(c) { const { W, H } = c; return ring(W + 1, H * 0.55, 2.3, 13, c.f.name, '#C9A877', 0.32); } },
    pismena: { over(c) { const { W, H, pal, m } = c; const cols = [pal.accent, '#2F6BFF', '#18A058', '#F2B705']; const ch = [...(bare(c.f.name) || 'A').replace(/\s/g, '')].slice(0, 3); const s = c.sq ? 7 : 8.4; return ch.map((L, i) => { const x = W - m - s - i * (s + 1.2) + 0.5, y = m - 0.5 + (i % 2) * 1.2, col = cols[i % cols.length]; return [i % 2 ? C(x + s / 2, y + s / 2, s / 2, { fill: col }) : R(x, y, s, s, col, { rx: s * 0.22, rot: i ? 0 : -6 }), T(L.toLocaleLowerCase(), { x: x + s / 2, y: y + s / 2 + 0.2, ox: 'center', oy: 'center', size: s * 0.72, font: 'd', w: 700, color: i === 3 ? '#1E1B3A' : '#FFFFFF' })]; }).reverse().flat(); } },
    vrstevnice: { over(c) { const { W, H, pal } = c; const acc = pal.accent, cx = W * 0.82, cy = H * 0.3; return [...topoPaths(cx, cy, 6, 2.4, seeded(c.f.name + 'v2')).map((d, i) => P(d, { stroke: acc, sw: i === 5 ? 0.2 : 0.11, opacity: 0.55 })), P(`M ${f2(cx)} ${f2(cy + 0.6)} C ${f2(cx - 2.2)} ${f2(cy - 2)} ${f2(cx - 2.2)} ${f2(cy - 4.6)} ${f2(cx)} ${f2(cy - 4.6)} C ${f2(cx + 2.2)} ${f2(cy - 4.6)} ${f2(cx + 2.2)} ${f2(cy - 2)} ${f2(cx)} ${f2(cy + 0.6)} Z`, { fill: acc }), C(cx, cy - 3, 0.75, { fill: '#F7F5EF' })]; } },
    alder: { under(c) { if (c.sq) return []; const { W, H, pal } = c; const gr = dark(pal.bg) ? pal.bg : '#0F3B2E', x0 = W * 0.64, y0 = 5, w = W - x0 - 3, hh = H - 10, col = mix(gr, '#F4F0E6', 0.75); return [R(x0, y0, w, hh, null, { stroke: col, sw: 0.3 }), Ln(x0 + w * 0.45, y0, x0 + w * 0.45, y0 + hh * 0.6, col, 0.2), Ln(x0, y0 + hh * 0.6, x0 + w, y0 + hh * 0.6, col, 0.2), P(`M ${f2(x0 + w * 0.45)} ${f2(y0 + hh * 0.6)} Q ${f2(x0 + w * 0.45 + 4)} ${f2(y0 + hh * 0.6 - 0.4)} ${f2(x0 + w * 0.45 + 4)} ${f2(y0 + hh * 0.6 - 4)}`, { stroke: col, sw: 0.14 }), R(x0 + w * 0.62, y0 + hh * 0.7, w * 0.28, hh * 0.2, null, { stroke: col, sw: 0.14 })]; } },
    editorial: { under(c) { const { W, H } = c; const fg = '#FFF6EE', aw = c.sq ? 18 : 22, x = W - aw - 4; return [P(arch(x, H + 1, aw, c.sq ? 10 : 6), { stroke: fg, sw: 0.2, opacity: 0.25 }), P(arch(x + 2.2, H + 1, aw - 4.4, (c.sq ? 10 : 6) + 2.2), { stroke: fg, sw: 0.1, opacity: 0.2 }), C(x + aw / 2, (c.sq ? 10 : 6) + aw * 0.3, 1.8, { fill: fg, opacity: 0.3 })]; } },
    morton: { over(c) { if (c.sq) return []; const { W, H, pal, m } = c; const gr = dark(pal.bg) ? pal.bg : '#0F3B2E', met = pal.foil ? MET(pal) : '#B8924A', s = 13, x = W - m - s, y = H - 8.6 - s; return [R(x, y, s, s, gr), R(x + 1, y + 1, s - 2, s - 2, null, { stroke: met, sw: 0.14 }), MONO(c, { x: x + s / 2, y: y + s / 2 + 0.3, ox: 'center', oy: 'center', size: 5.2, color: met, ls: 0.04 })]; } },
    split: { under(c) { const { W, H, pal } = c; const fg = luminance(pal.accent) > 0.4 ? '#111111' : '#FFFFFF', r = H * 0.44; return [C(c.sq ? W / 2 : W * 0.16, H / 2, r, { fill: fg, opacity: 0.06 }), C(c.sq ? W / 2 : W * 0.16, H / 2, r - 2, { stroke: fg, sw: 0.12, opacity: 0.25 })]; } },
  };
}
