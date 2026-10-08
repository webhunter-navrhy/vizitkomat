// Vizitkomat – prepracované šablóny „Neo“ (nahrádzajú pôvodné jednoduché verzie pod rovnakými ID, aby fungovali uložené návrhy).
// Každá strana je vrstvená: textúra papiera, ilustrácia alebo ornament, jasná typografická hierarchia, navrhnutý aj rub.
import { ornaments } from './tpl-rich.js';

export function neoTemplates(h) {
  const { T, R, C, Ln, P, IMG, MONO, contacts, logoOr, mono, bare, city, splitName, mix, luminance, tr, seeded, smooth, topoPaths, blobPath, SCRIPT } = h;
  const { FOIL, MET, oval, f2, first, brand, has, leaf, sprig, wreath, divider, fan, waveFill, ringText, lsFor, tidy, emblem, iconRows, arch, tex } = ornaments(h);
  const dark = (col) => luminance(col) < 0.22;
  const light = (col) => luminance(col) > 0.6;
  const G = (pal) => (pal.foil ? FOIL(pal) : pal.accent);
  const last = (c) => splitName(bare(c.f.name) || c.f.name)[1] || '';
  const rad = (d) => (d * Math.PI) / 180;
  /** Čitateľná farba textu na pozadí z palety (tmavá na svetlom, svetlá na tmavom) */
  const inkOn = (bg, pal, d = '#1A1A18', l = '#FFFFFF') => (luminance(bg) > 0.33 ? (dark(pal.ink) ? pal.ink : d) : (light(pal.ink) ? pal.ink : l));
  const bgArt = (c, key, o = {}) => ({ color: c.pal.bg, art: c.art || key, artOpacity: o.opacity ?? 1, ...o });

  // ---------- pomocníci ----------
  /** Zrnitosť papiera cez celú plochu (násobenie) */
  const paper = (c, op = 0.45) => IMG(tex(c, 'papier'), -2.5, -2.5, c.W + 5, c.H + 5, { role: 'art', blend: 'multiply', opacity: op });
  /** Slepá ražba: svetlý odlesk + tieň + text */
  const deboss = (txt, o, on) => [
    T(txt, { ...o, x: o.x + 0.13, y: o.y + 0.13, color: mix(on, '#FFFFFF', dark(on) ? 0.22 : 0.85) }),
    T(txt, { ...o, x: o.x - 0.09, y: o.y - 0.09, color: mix(on, '#000000', dark(on) ? 0.55 : 0.42), opacity: 0.8 }),
    T(txt, { ...o, color: o.color || mix(on, '#000000', dark(on) ? 0.12 : 0.1) }),
  ];
  /** Kontakty – riadky nad sebou (vľavo/vpravo/na stred), voliteľne ikonky */
  const rows = (c, o) => contacts(c, { keys: ['phone', 'email', 'web'], size: 1.95, lh: 2.95, ...o });
  /** Rohový ornament: lomená linka + oblúčik + bodka */
  const corner = (x, y, sx, sy, col, s = 5) => [
    P(`M ${f2(x)} ${f2(y + sy * s)} L ${f2(x)} ${f2(y)} L ${f2(x + sx * s)} ${f2(y)}`, { stroke: col, sw: 0.26 }),
    P(`M ${f2(x + sx * 1.3)} ${f2(y + sy * s * 0.62)} Q ${f2(x + sx * 1.3)} ${f2(y + sy * 1.3)} ${f2(x + sx * s * 0.62)} ${f2(y + sy * 1.3)}`, { stroke: col, sw: 0.14 }),
    C(x + sx * 1.3, y + sy * 1.3, 0.34, { fill: col }),
  ];
  const corners = (W, H, i, col, s) => [...corner(i, i, 1, 1, col, s), ...corner(W - i, i, -1, 1, col, s), ...corner(i, H - i, 1, -1, col, s), ...corner(W - i, H - i, -1, -1, col, s)];
  /** Perla: kruh s guľatým prechodom a odleskom */
  const pearl = (x, y, r) => [
    C(x + r * 0.12, y + r * 0.22, r, { fill: 'rgba(0,0,0,0.35)' }),
    C(x, y, r, { fill: { grad: ['#FFFFFF', '#F1ECE3', '#CFC7BA', '#8E877C'], stops: [0, 0.35, 0.75, 1], radial: true, cx: 0.36, cy: 0.32, r: 0.72 } }),
  ];
  /** Body na krivke (kvadratická Bézierova) s rovnakým rozostupom približne */
  const along = (p0, p1, p2, n) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]]; });
  /** Polkruh (horná polovica) z Bézierových kriviek; closed = vyplnený */
  const semi = (cx, cy, r, closed = true) => { const k = 0.5523 * r; return `M ${f2(cx - r)} ${f2(cy)} C ${f2(cx - r)} ${f2(cy - k)} ${f2(cx - k)} ${f2(cy - r)} ${f2(cx)} ${f2(cy - r)} C ${f2(cx + k)} ${f2(cy - r)} ${f2(cx + r)} ${f2(cy - k)} ${f2(cx + r)} ${f2(cy)}${closed ? ' Z' : ''}`; };
  /** Kontakty na stred – jeden alebo dva riadky */
  const centerLines = (c, x, yb, o) => {
    const f = c.f, l1 = [f.phone, f.web].filter((v) => v && v.trim()).join('   ·   '), l2 = has(c, 'email') ? f.email : '';
    const L = [l1, l2].filter(Boolean), lh = o.lh || 2.9;
    return L.map((t, i) => T(t, { field: i === L.length - 1 && l2 ? 'email' : undefined, x, y: yb - (L.length - 1 - i) * lh, ox: 'center', oy: 'bottom', size: o.size || 1.9, font: 't', w: o.w, color: o.color, fit: o.fit, ls: o.ls ?? 0.04 }));
  };

  return tidy({
    // ------------------------------------------------------------ CASA – oblúkové okno so svetlom a rastlinou
    casa: {
      name: 'Casa', fonts: 'cinzel', pal: 'ivory', tags: ['interier', 'architekt', 'dizajn', 'reality', 'hotel', 'penzion', 'nabytok', 'stolar', 'minimal', 'elegantne', 'jemne', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#2A2622', bg = light(pal.bg) ? pal.bg : '#F4EFE6', acc = pal.accent, g = G(pal);
        const aw = c.sq ? 22 : 23, ax = c.sq ? W / 2 - aw / 2 : W - m - aw + 1, top = c.sq ? 5 : 5.5, base = c.sq ? H * 0.52 : H + 0.5;
        const o = [paper(c, 0.4)];
        o.push(P(arch(ax, base, aw, top), { fill: { grad: [mix(acc, bg, 0.5), mix(acc, bg, 0.78)], angle: 100 } }));
        // svetlo z okna
        o.push(P(`M ${f2(ax + aw * 0.2)} ${f2(top + 6)} L ${f2(ax + aw * 0.42)} ${f2(top + 4)} L ${f2(ax + aw * 0.95)} ${f2(base)} L ${f2(ax + aw * 0.55)} ${f2(base)} Z`, { fill: '#FFFFFF', opacity: 0.22 }));
        o.push(P(arch(ax + 1.6, base, aw - 3.2, top + 1.6), { stroke: ink, sw: 0.12, opacity: 0.45 }));
        o.push(Ln(ax + aw / 2, top + 1.6, ax + aw / 2, base, ink, 0.1, { opacity: 0.3 }));
        o.push(Ln(ax + 1.6, top + aw * 0.5 + 4, ax + aw - 1.6, top + aw * 0.5 + 4, ink, 0.1, { opacity: 0.3 }));
        // rastlina v kvetináči
        const px = ax + aw * 0.5, pb = base - (c.sq ? 1.5 : 4.5);
        o.push(P(`M ${f2(px - 2.6)} ${f2(pb - 4.2)} L ${f2(px + 2.6)} ${f2(pb - 4.2)} L ${f2(px + 1.9)} ${f2(pb)} L ${f2(px - 1.9)} ${f2(pb)} Z`, { fill: ink }));
        o.push(...sprig(px, pb - 4.2, c.sq ? 9 : 13, -100, { color: ink, leaves: 7, size: 2.4 }), ...sprig(px - 0.3, pb - 4.3, c.sq ? 7 : 10, -132, { color: ink, leaves: 5, size: 2.1 }), ...sprig(px + 0.3, pb - 4.3, c.sq ? 7 : 9, -58, { color: ink, leaves: 5, size: 2.1 }));
        o.push(Ln(ax - 3, pb, ax + aw + 3, pb, ink, 0.14, { opacity: 0.6 }));
        if (c.sq) {
          o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.64, ox: 'center', oy: 'center', size: 2.8, font: 'd', ls: 0.2, color: ink, fit: W - 2 * m }));
          o.push(...divider(W / 2, H * 0.71, 16, g));
          o.push(...centerLines(c, W / 2, H - m, { color: mix(ink, bg, 0.25), fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          const mw = ax - m - 5;
          o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: H * 0.36, oy: 'bottom', size: 3.6, font: 'd', ls: 0.16, color: ink, fit: mw }));
          o.push(Ln(m, H * 0.36 + 2, m + 9, H * 0.36 + 2, g, 0.3));
          o.push(T(f.tagline || f.role || '', { field: f.tagline ? 'tagline' : 'role', x: m, y: H * 0.36 + 3.6, size: 1.9, font: 't', it: true, color: mix(ink, bg, 0.3), fit: mw }));
          o.push(...rows(c, { x: m, yb: H - m, color: mix(ink, bg, 0.15), fit: mw, size: 1.85, lh: 2.8 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const deep = dark(pal.ink) ? mix(pal.ink, pal.accent, 0.18) : '#3A3129', g = G(pal), lt = light(pal.bg) ? pal.bg : '#F4EFE6';
        const aw = c.sq ? 20 : 17, top = c.sq ? 7 : 5.5, base = c.sq ? H * 0.66 : H * 0.74;
        return { bg: { color: deep }, objs: [
          paper(c, 0.25),
          Ln(-2, base, W + 2, base, g, 0.2), Ln(-2, base + 0.9, W + 2, base + 0.9, g, 0.08),
          P(arch(W / 2 - aw / 2, base, aw, top), { fill: mix(deep, '#000000', 0.18) }),
          P(arch(W / 2 - aw / 2, base, aw, top), { stroke: g, sw: 0.3 }),
          P(arch(W / 2 - aw / 2 + 1.3, base, aw - 2.6, top + 1.3), { stroke: g, sw: 0.1 }),
          logoOr(c, W / 2, (top + base) / 2 + 2, aw * 0.6, aw * 0.6, { tint: g }, MONO(c, { x: W / 2, y: (top + base) / 2 + 2, ox: 'center', oy: 'center', size: aw * 0.42, color: g, ls: 0.02 })),
          T((f.web || brand(c)).toLocaleUpperCase(), { field: f.web ? 'web' : 'company', x: W / 2, y: base + (H - base) / 2 + 0.4, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 500, ls: 0.34, color: lt, fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ LETTERPRESS – slepá ražba na bavlnenom papieri
    letterpress: {
      name: 'Letterpress', fonts: 'tenor', pal: 'krieda', tags: ['architekt', 'dizajn', 'foto', 'umelec', 'konzultant', 'firma', 'minimal', 'elegantne', 'ciste', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F2EEE7', ink = dark(pal.ink) ? pal.ink : '#1F1D1A', acc = pal.accent;
        const cx = c.sq ? W / 2 : m + 12, cy = c.sq ? 17 : H / 2, r = c.sq ? 10 : 12;
        const o = [paper(c, 0.7)];
        // vyrazená pečať
        o.push(C(cx + 0.12, cy + 0.12, r, { stroke: '#FFFFFF', sw: 0.5, opacity: 0.9 }), C(cx - 0.06, cy - 0.06, r, { stroke: mix(bg, '#000000', 0.22), sw: 0.42 }), C(cx, cy, r, { stroke: mix(bg, '#000000', 0.18), sw: 0.42 }));
        o.push(C(cx, cy, r - 2.4, { stroke: mix(bg, '#000000', 0.12), sw: 0.12 }));
        o.push(...ringText(brand(c).toLocaleUpperCase() + ' · ' + (city(c) || f.role || '').toLocaleUpperCase(), cx, cy, r - 1.2, -170, -10, { size: 1.7, color: mix(bg, '#000000', 0.32), w: 500 }));
        o.push(...deboss(mono(c), { x: cx, y: cy + 1, ox: 'center', oy: 'center', size: r * 0.82, font: 'd', ls: 0.04, color: mix(bg, '#000000', 0.2) }, bg));
        if (c.sq) {
          o.push(T(bare(f.name).toLocaleUpperCase() || f.name, { field: 'name', x: W / 2, y: 33, ox: 'center', oy: 'center', size: 2.6, font: 'd', ls: 0.22, color: ink, fit: W - 2 * m }));
          o.push(T(f.role, { field: 'role', x: W / 2, y: 36.6, ox: 'center', oy: 'center', size: 1.8, font: 't', color: acc, fit: W - 2 * m }));
          o.push(...centerLines(c, W / 2, H - m, { color: mix(ink, bg, 0.3), fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          const x = cx + r + 6, mw = W - x - m;
          o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x, y: m + 4.2, oy: 'bottom', size: 2.9, font: 'd', ls: 0.2, color: ink, fit: mw }));
          o.push(T(f.role, { field: 'role', x, y: m + 5.6, size: 1.85, font: 't', w: 500, color: acc, fit: mw }));
          o.push(...rows(c, { x, yb: H - m, keys: ['phone', 'email', 'web', 'address'], color: mix(ink, bg, 0.22), fit: mw, size: 1.8, lh: 2.75 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const fl = dark(pal.accent) || luminance(pal.accent) < 0.4 ? pal.accent : '#2F3A4A';
        return { bg: { color: fl }, objs: [
          paper(c, 0.35),
          ...deboss(brand(c), { field: 'company', x: W / 2, y: H / 2 - 1, ox: 'center', oy: 'center', size: c.sq ? 5 : 6.4, font: 'd', ls: 0.04, fit: W - 2 * m - 4, color: mix(fl, '#000000', 0.28) }, fl),
          ...deboss((f.web || '').toLocaleUpperCase(), { field: 'web', x: W / 2, y: H - m - 0.4, ox: 'center', oy: 'bottom', size: 1.75, font: 't', w: 600, ls: 0.34, fit: W - 2 * m, color: mix(fl, '#000000', 0.28) }, fl),
        ] };
      },
    },

    // ------------------------------------------------------------ PERLA – perlový náhrdelník na koži
    perla: {
      name: tr('Perla', 'Perla'), fonts: 'cinzel', pal: 'onyx', tags: ['luxus', 'sperky', 'beauty', 'reality', 'pravnik', 'hotel', 'moda', 'luxusne', 'tmave', 'minimal', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = G(pal), bg = dark(pal.bg) ? pal.bg : '#151515', lt = light(pal.ink) ? pal.ink : '#EDEAE4';
        const o = [];
        const sag = c.sq ? 18 : 17, pts = along([W * 0.06, -3], [W / 2, sag * 2 - 3], [W * 0.94, -3], c.sq ? 19 : 25);
        o.push(P(smooth(pts.map(([x, y]) => [x, y])), { stroke: MET(pal), sw: 0.12, opacity: 0.7 }));
        pts.forEach(([x, y], i) => { const r = 0.95 + 0.35 * Math.sin((i / (pts.length - 1)) * Math.PI); o.push(...pearl(x, y, r)); });
        const by = sag - 3 + 1.6 * 2 - 0.4;
        o.push(P(`M ${f2(W / 2 - 0.8)} ${f2(by + 0.6)} L ${f2(W / 2 + 0.8)} ${f2(by + 0.6)} L ${f2(W / 2 + 0.5)} ${f2(by + 1.8)} L ${f2(W / 2 - 0.5)} ${f2(by + 1.8)} Z`, { fill: g }));
        o.push(...pearl(W / 2, by + 3.9, 2.1));
        const ny = c.sq ? H * 0.68 : H * 0.7;
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: ny, ox: 'center', oy: 'bottom', size: c.sq ? 3 : 3.5, font: 'd', w: 500, ls: 0.22, color: g, fit: W - 2 * m - 4 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: ny + 1.6, ox: 'center', size: 1.7, font: 't', w: 500, ls: 0.32, color: lt, opacity: 0.85, fit: W - 2 * m - 6 }));
        return { bg: { color: bg, art: tex(c, 'cierna'), artOpacity: 0.85 }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = G(pal), iv = '#F4F0E8', ink = '#1E1B18', acc = pal.foil ? MET(pal) : pal.accent;
        const cx = c.sq ? W / 2 : m + 11, cy = c.sq ? 16 : H / 2, r = c.sq ? 9 : 10;
        const o = [paper(c, 0.55)];
        for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; o.push(...pearl(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.95)); }
        o.push(logoOr(c, cx, cy, r * 1.1, r * 1.1, { tint: g }, MONO(c, { x: cx, y: cy + 0.4, ox: 'center', oy: 'center', size: r * 0.72, color: g, ls: 0.04 })));
        if (c.sq) {
          o.push(T(f.name, { field: 'name', x: W / 2, y: 33, ox: 'center', oy: 'center', size: 2.8, font: 'd', color: ink, fit: W - 2 * m }));
          o.push(...centerLines(c, W / 2, H - m, { color: mix(ink, iv, 0.25), fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          const x = cx + r + 6.5, mw = W - x - m;
          o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x, y: m + 3.4, oy: 'bottom', size: 2.4, font: 'd', w: 500, ls: 0.16, color: ink, fit: mw }));
          o.push(Ln(x, m + 5.2, x + 8, m + 5.2, acc, 0.25));
          o.push(...iconRows(c, ['phone', 'email', 'web', 'address'], { x, y: H / 2 - 0.4, lh: 3.2, r: 1.1, circle: ink, icon: iv, color: ink, size: 1.85, fit: mw - 4 }));
        }
        return { bg: { color: iv }, objs: o };
      },
    },

    // ------------------------------------------------------------ EGON – vínna etiketa s lúčmi
    egon: {
      name: 'Egon', fonts: 'dmserif', pal: 'cervena', tags: ['kaviaren', 'restauracia', 'vino', 'bar', 'gastro', 'moda', 'butik', 'galeria', 'odvazne', 'elegantne', 'tmave', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#7A1C1C', cr = light(pal.ink) ? pal.ink : '#F9DCD3', g = pal.foil ? FOIL(pal) : 'foil:gold';
        const o = [paper(c, 0.3)];
        for (let i = 0; i <= 26; i++) { const a = Math.PI + (i / 26) * Math.PI; o.push(Ln(W / 2, H + 6, W / 2 + Math.cos(a) * 80, H + 6 + Math.sin(a) * 80, cr, 0.12, { opacity: 0.12 })); }
        o.push(R(3, 3, W - 6, H - 6, null, { stroke: g, sw: 0.22 }), R(3.9, 3.9, W - 7.8, H - 7.8, null, { stroke: g, sw: 0.08 }));
        const words = brand(c).split(/\s+/); const half = Math.ceil(words.length / 2);
        const l1 = words.length > 2 ? words.slice(0, half).join(' ') : words[0], l2 = words.length > 2 ? words.slice(half).join(' ') : words.slice(1).join(' ');
        const sz = c.sq ? 5.4 : 7;
        o.push(T((city(c) || f.role || '').toLocaleUpperCase(), { field: city(c) ? 'address' : 'role', x: W / 2, y: H * 0.2, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.4, color: cr, opacity: 0.85, fit: W - 24 }));
        o.push(...divider(W / 2, H * 0.27, 22, g));
        o.push(T(l1, { field: 'company', x: W / 2, y: l2 ? H * 0.52 : H * 0.6, ox: 'center', oy: 'bottom', size: sz, font: 'd', color: cr, fit: W - 16, lh: 0.95 }));
        if (l2) o.push(T(l2, { field: 'company', x: W / 2, y: H * 0.52 + 0.4, ox: 'center', size: sz, font: 'd', it: true, color: cr, fit: W - 16 }));
        o.push(emblem(c, W / 2, H - 8.6, 4, g));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const red = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#7A1C1C', cr = '#FBF1EA', g = pal.foil ? FOIL(pal) : 'foil:gold';
        const o = [paper(c, 0.6), R(-2, H - 8, W + 4, 10, red), Ln(-2, H - 9, W + 2, H - 9, g, 0.2)];
        if (c.sq) {
          o.push(emblem(c, W / 2, 11, 7, red));
          o.push(T(f.name, { field: 'name', x: W / 2, y: 22, ox: 'center', oy: 'center', size: 3.6, font: 'd', color: red, fit: W - 2 * m }));
          o.push(T(f.role, { field: 'role', x: W / 2, y: 25.6, ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: mix(red, cr, 0.3), fit: W - 2 * m }));
          o.push(...centerLines(c, W / 2, H - 11, { color: '#3A1A1A', fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          o.push(C(m + 9, H * 0.42, 8.4, { fill: red }), C(m + 9, H * 0.42, 7.2, { stroke: g, sw: 0.14 }), emblem(c, m + 9, H * 0.42, 8, cr));
          const x = m + 22, mw = W - x - m;
          o.push(T(f.name, { field: 'name', x, y: m + 5, oy: 'bottom', size: 4.4, font: 'd', color: red, fit: mw }));
          o.push(T(f.role, { field: 'role', x, y: m + 6.1, size: 2, font: 'd', it: true, color: mix(red, cr, 0.3), fit: mw }));
          o.push(...rows(c, { x, yb: H - 11, color: '#3A1A1A', fit: mw, size: 1.85, lh: 2.8 }));
        }
        o.push(T((f.tagline || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H - 4.7, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.26, color: cr, fit: W - 12 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ MUSE – dúha z oblúkov
    muse: {
      name: 'Muse', fonts: 'dmserif', pal: 'periwinkle', tags: ['kozmetika', 'beauty', 'lekar', 'estetika', 'wellness', 'terapeut', 'kouc', 'dizajn', 'jemne', 'elegantne', 'moderne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, wh = luminance(bg) > 0.55 ? inkOn(bg, pal) : '#FFFFFF', acc = pal.accent, so = light(pal.soft) ? pal.soft : '#F6F4EF';
        const cx = c.sq ? W / 2 : W * 0.8, cy = H + 1, R0 = c.sq ? 24 : 27;
        const cols = [mix(bg, acc, 0.35), so, mix(bg, '#FFFFFF', 0.45), acc, mix(bg, acc, 0.15), so];
        const o = [];
        cols.forEach((col, i) => { const r = R0 - i * (R0 / 6.2); o.push(P(semi(cx, cy, r), { fill: col })); });
        o.push(C(cx, cy - R0 - 4, 1.1, { fill: acc }));
        if (c.sq) {
          o.push(T(brand(c), { field: 'company', x: W / 2, y: 13, ox: 'center', oy: 'center', size: 4.6, font: 'd', color: wh, fit: W - 2 * m }));
          o.push(T(f.tagline || f.role || '', { field: 'tagline', x: W / 2, y: 17.4, ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: acc, fit: W - 2 * m }));
        } else {
          o.push(T(brand(c), { field: 'company', x: m, y: H * 0.46, oy: 'bottom', size: 6, font: 'd', color: wh, fit: W * 0.56, lh: 0.95 }));
          o.push(T(f.tagline || f.role || '', { field: 'tagline', x: m, y: H * 0.46 + 1.2, size: 2.1, font: 'd', it: true, color: acc, fit: W * 0.5 }));
          o.push(Ln(m, H - m - 1, m + 8, H - m - 1, wh, 0.25));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const so = light(pal.soft) ? pal.soft : '#F6F4EF', acc = pal.accent, bg = pal.bg;
        const o = [paper(c, 0.4)];
        const ax = c.sq ? W - m - 4 : W - m - 6, ay = m + 7;
        [7, 5.4, 3.8].forEach((r, i) => o.push(P(semi(ax, ay, r, false), { stroke: [bg, acc, mix(bg, acc, 0.4)][i], sw: 1.1 })));
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', color: acc, fit: c.sq ? W - 2 * m - 14 : W * 0.6 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 6.2, size: 2, font: 'd', it: true, color: mix(acc, so, 0.35), fit: W * 0.6 }));
        o.push(...iconRows(c, c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], { x: m, y: c.sq ? H * 0.58 : H * 0.5, lh: 3.3, r: 1.15, circle: bg, icon: acc, color: '#2A2F45', size: 1.9, fit: W - 2 * m - 5 }));
        return { bg: { color: so }, objs: o };
      },
    },

    // ------------------------------------------------------------ PRUH – vlna dole, znak a tichý luxus
    pruh: {
      name: tr('Pruh', 'Pruh'), fonts: 'playfair', pal: 'more', tags: ['hotel', 'penzion', 'wellness', 'kozmetika', 'reality', 'architekt', 'kaviaren', 'spa', 'elegantne', 'jemne', 'luxusne', 'prirodne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F2F7F7', ink = dark(pal.ink) ? pal.ink : '#12302F', acc = pal.accent, wy = c.sq ? H * 0.64 : H * 0.66;
        const o = [paper(c, 0.4)];
        o.push(...waveFill(W, H, wy - 2.2, 1.2, 24, 1.4, mix(acc, bg, 0.6)));
        o.push(...waveFill(W, H, wy, 1.4, 22, 0.2, acc));
        for (let k = 1; k <= 3; k++) { const pts = []; for (let x = -4; x <= W + 4; x += 22 / 6) pts.push([x, wy + k * 3.4 + Math.sin(x / 22 * Math.PI * 2 + 0.2 + k * 0.6) * 1]); o.push(P(smooth(pts), { stroke: '#FFFFFF', sw: 0.12, opacity: 0.35 })); }
        o.push(emblem(c, W / 2, H * 0.16 + 1, 5, acc));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.39, ox: 'center', oy: 'center', size: c.sq ? 3 : 3.6, font: 'd', ls: 0.24, color: ink, fit: W - 2 * m - 4 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: W / 2, y: H * 0.39 + 4.2, ox: 'center', oy: 'center', size: 2, font: 'd', it: true, color: mix(ink, bg, 0.35), fit: W - 2 * m - 6 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, bg = dark(acc) || luminance(acc) < 0.35 ? acc : '#1F6E6A', wh = '#FFFFFF';
        const o = [];
        for (let k = 0; k < 7; k++) { const pts = []; for (let x = W * 0.45; x <= W + 4; x += 3) pts.push([x, -2 + k * 2.4 + Math.sin(x / 16 * Math.PI * 2 + k * 0.5) * 0.9]); o.push(P(smooth(pts), { stroke: wh, sw: 0.12, opacity: 0.25 })); }
        o.push(T(f.name, { field: 'name', x: c.sq ? W / 2 : m, y: H * 0.42, ox: c.sq ? 'center' : 'left', oy: 'bottom', size: 4.6, font: 'd', it: true, color: wh, fit: W - 2 * m }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: c.sq ? W / 2 : m, y: H * 0.42 + 1.2, ox: c.sq ? 'center' : 'left', size: 1.7, font: 't', w: 600, ls: 0.26, color: mix(wh, bg, 0.2), fit: W - 2 * m }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: wh, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: wh, fit: W - 2 * m, size: 1.85, lh: 2.8 }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ MAISON – zlaté zrkadlo na bordovej
    maison: {
      name: 'Maison', fonts: 'dmserif', pal: 'burgundy', tags: ['kader', 'salon', 'beauty', 'kozmetika', 'moda', 'butik', 'interier', 'kaviaren', 'elegantne', 'luxusne', 'tmave', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#5A1420', g = G(pal), cr = light(pal.ink) ? pal.ink : '#F4E9DC';
        const aw = c.sq ? 26 : 25, ax = W / 2 - aw / 2, top = 4.2, base = H - 4.2;
        return { bg: { color: bg }, objs: [
          paper(c, 0.22),
          P(arch(ax, base, aw, top), { fill: mix(bg, '#000000', 0.22) }),
          P(arch(ax, base, aw, top), { stroke: g, sw: 0.34 }), P(arch(ax + 1.2, base - 1.2, aw - 2.4, top + 1.2), { stroke: g, sw: 0.1 }),
          ...sprig(ax - 1, base - 0.5, 15, -112, { color: g, leaves: 7, size: 3 }), ...sprig(ax + aw + 1, base - 0.5, 15, -68, { color: g, leaves: 7, size: 3 }),
          logoOr(c, W / 2, H * 0.43, aw * 0.6, aw * 0.5, { tint: g }, MONO(c, { x: W / 2, y: H * 0.43, ox: 'center', oy: 'center', size: c.sq ? 10 : 11, color: g, ls: -0.02 })),
          ...divider(W / 2, H * 0.64, aw - 8, g),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.74, ox: 'center', oy: 'center', size: 1.9, font: 't', w: 500, ls: 0.3, color: cr, fit: aw - 5 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const red = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#5A1420', g = G(pal), cr = light(pal.soft) ? pal.soft : '#F1E6D6';
        const o = [paper(c, 0.5)];
        if (!c.sq) {
          const aw = 15, ax = W - m - aw;
          o.push(P(arch(ax, H - m, aw, m), { stroke: g, sw: 0.26 }), P(arch(ax + 1, H - m - 1, aw - 2, m + 1), { stroke: g, sw: 0.1 }));
          o.push(emblem(c, ax + aw / 2, H / 2 + 1, 7, red));
        }
        const mw = c.sq ? W - 2 * m : W - 2 * m - 20;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4.6, font: 'd', color: red, fit: mw }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 6.2, size: 2, font: 'd', it: true, color: mix(red, cr, 0.35), fit: mw }));
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web', 'address'], size: 1.85, lh: 2.85, labels: true, lcolor: pal.foil ? MET(pal) : pal.accent, color: '#2B1418', fit: mw }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ LUXURY – navy, zlatý rám s rohmi a znak
    luxury: {
      name: 'Luxury', fonts: 'caslon', pal: 'noblesa', emblem: 'scales', tags: ['pravnik', 'advokat', 'financie', 'reality', 'hotel', 'konzultant', 'manazer', 'luxusne', 'elegantne', 'serioze', 'tmave', 'klasicky'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#14213D', g = G(pal), iv = light(pal.ink) ? pal.ink : '#F4EFE6';
        return { bg: { color: bg, art: tex(c, 'navy'), artOpacity: 0.16 }, objs: [
          R(3, 3, W - 6, H - 6, null, { stroke: g, sw: 0.2 }), ...corners(W, H, 4.6, g, 4.2),
          emblem(c, W / 2, H * 0.27, c.sq ? 8 : 7.5, g),
          T(f.name, { field: 'name', x: W / 2, y: H * 0.58, ox: 'center', oy: 'bottom', size: c.sq ? 3.2 : 3.8, font: 'd', upper: true, ls: 0.14, color: g, fit: W - 18 }),
          ...divider(W / 2, H * 0.58 + 2.6, 20, g),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.58 + 5.6, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 500, ls: 0.32, color: iv, fit: W - 20 }),
          T(f.company || '', { field: 'company', x: W / 2, y: H - 7.4, ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: iv, opacity: 0.8, fit: W - 20 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const navy = dark(pal.bg) ? pal.bg : '#14213D', g = G(pal), iv = '#F4EFE6', met = pal.foil ? MET(pal) : pal.accent;
        const o = [paper(c, 0.55)];
        if (c.sq) {
          o.push(...wreath(W / 2, 15, 8, met, { leaves: 8, size: 2.6 }), MONO(c, { x: W / 2, y: 15, ox: 'center', oy: 'center', size: 6, color: navy }));
          o.push(T(f.name, { field: 'name', x: W / 2, y: 30, ox: 'center', oy: 'center', size: 2.8, font: 'd', color: navy, fit: W - 2 * m }));
          o.push(...centerLines(c, W / 2, H - m, { color: navy, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          o.push(...wreath(m + 10, H / 2 + 0.5, 9, met, { leaves: 9, size: 2.8 }));
          o.push(logoOr(c, m + 10, H / 2, 10, 10, { tint: navy }, MONO(c, { x: m + 10, y: H / 2, ox: 'center', oy: 'center', size: 6.4, color: navy, ls: 0.02 })));
          o.push(Ln(m + 23.5, m + 1, m + 23.5, H - m - 1, met, 0.14));
          const x = m + 27.5, mw = W - x - m;
          o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x, y: m + 3.6, oy: 'bottom', size: 2.4, font: 'd', ls: 0.12, color: navy, fit: mw }));
          o.push(T(f.tagline || '', { field: 'tagline', x, y: m + 4.8, size: 1.85, font: 'd', it: true, color: mix(navy, iv, 0.35), fit: mw }));
          o.push(...rows(c, { x, yb: H - m, keys: ['phone', 'email', 'web', 'address'], color: navy, fit: mw, size: 1.8, lh: 2.75 }));
        }
        return { bg: { color: iv }, objs: o };
      },
    },

    // ------------------------------------------------------------ STUDIO (hrastar) – veľká tlmená iniciála a citát na rube
    hrastar: {
      name: 'Studio', fonts: 'caslon', pal: 'krieda', tags: ['dizajn', 'agentura', 'architekt', 'foto', 'konzultant', 'pravnik', 'firma', 'minimal', 'elegantne', 'ciste', 'serioze'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F7F4EE', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent;
        const o = [paper(c, 0.45)];
        o.push(T((first(c) || brand(c)).slice(0, 1).toLocaleUpperCase(), { x: W + 1.5, y: H + (c.sq ? 9 : 12), ox: 'right', oy: 'bottom', size: c.sq ? 50 : 62, font: 'd', it: true, color: mix(ink, bg, 0.9) }));
        o.push(T((f.company || city(c) || '').toLocaleUpperCase(), { field: 'company', x: m, y: m, size: 1.75, font: 't', w: 600, ls: 0.28, color: ink, fit: W * 0.6 }));
        o.push(Ln(m, m + 3.4, c.sq ? W - m : W * 0.42, m + 3.4, ink, 0.1));
        const ny = c.sq ? H * 0.56 : H * 0.6;
        o.push(T(f.name, { field: 'name', x: m - 0.3, y: ny, oy: 'bottom', size: c.sq ? 4.6 : 5.6, font: 'd', color: ink, fit: W - 2 * m - 6, ls: -0.01 }));
        o.push(T(f.role, { field: 'role', x: m, y: ny + 1.1, size: 2.1, font: 'd', it: true, color: acc, fit: W - 2 * m - 6 }));
        o.push(...(c.sq ? rows(c, { x: m, yb: H - m, keys: ['phone', 'email'], color: mix(ink, bg, 0.2), fit: W - 2 * m, size: 1.75, lh: 2.6 })
          : [T([f.phone, f.email, f.web].filter((v) => v && v.trim()).join('   ·   '), { x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', color: mix(ink, bg, 0.2), fit: W - 2 * m, ls: 0.02 })]));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent, wh = '#F4F0E8';
        const q = f.tagline || brand(c);
        return { bg: { color: ink }, objs: [
          T('“', { x: m - 1, y: m - 2.2, size: 16, font: 'd', color: acc }),
          T(q, { field: f.tagline ? 'tagline' : 'company', x: m, y: H * 0.56, oy: 'bottom', size: c.sq ? 4.2 : 5.2, font: 'd', it: true, color: wh, fit: W - 2 * m, ls: -0.01 }),
          Ln(m, H - m - 3.6, m + 8, H - m - 3.6, acc, 0.3),
          T((f.web || brand(c)).toLocaleUpperCase(), { field: f.web ? 'web' : 'company', x: m, y: H - m, oy: 'bottom', size: 1.7, font: 't', w: 600, ls: 0.3, color: mix(wh, ink, 0.3), fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ ORGANIC – veľké listy monstery
    organic: {
      name: 'Organic', fonts: 'poppins', pal: 'mint', tags: ['eko', 'bio', 'farma', 'zahrady', 'kvety', 'wellness', 'joga', 'kozmetika', 'kaviaren', 'prirodne', 'jemne', 'ciste', 'minimal'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = inkOn(bg, pal, '#14231F', '#F3F1EA');
        const t1 = mix(bg, ink, 0.22), t2 = mix(bg, ink, 0.38), t3 = mix(bg, '#FFFFFF', 0.35);
        const o = [];
        const big = (x, y, a, L, col) => { const w = L * 0.42; o.push(P(leaf(x, y, a, L, w), { fill: col })); const dx = Math.cos(a), dy = Math.sin(a); o.push(Ln(x, y, x + dx * L * 0.92, y + dy * L * 0.92, t3, 0.18, { opacity: 0.7 })); for (let k = 1; k < 6; k++) { const t = k / 6.3, px = x + dx * L * t, py = y + dy * L * t; for (const s of [1, -1]) { const b = a + s * 0.95; o.push(Ln(px, py, px + Math.cos(b) * w * 0.8 * (1 - t * 0.5), py + Math.sin(b) * w * 0.8 * (1 - t * 0.5), t3, 0.12, { opacity: 0.6 })); } } };
        big(W + 3, H + 3, rad(-150), c.sq ? 30 : 34, t1); big(W + 2, H + 4, rad(-115), c.sq ? 26 : 30, t2); big(W + 4, H * 0.3, rad(-170), 18, t1);
        o.push(P(leaf(W * 0.66, H + 3, rad(-80), 16, 4.6), { fill: t3, opacity: 0.6 }));
        const mw = c.sq ? W - 2 * m : W * 0.52;
        o.push(T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4.4, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 6.2, size: 2, font: 't', color: mix(ink, bg, 0.3), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], icons: true, lcolor: ink, color: ink, fit: mw, size: 1.85, lh: 2.85 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#14231F', dg = mix(ink, pal.bg, 0.12), cr = '#EEF3EC';
        const o = []; const r = seeded(brand(c) + 'org');
        for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H; if (Math.abs(x - W / 2) < 22 && Math.abs(y - H / 2) < 9) continue; o.push(P(leaf(x, y, r() * Math.PI * 2, 5 + r() * 6, 1.6 + r() * 1.4), { fill: mix(dg, pal.bg, 0.12 + r() * 0.12) })); }
        o.push(T(brand(c), { field: 'company', x: W / 2, y: H / 2 - 0.5, ox: 'center', oy: 'bottom', size: c.sq ? 4.4 : 5.4, font: 'd', w: 600, color: cr, fit: W - 2 * m - 6, ls: -0.02 }));
        o.push(T(f.tagline || f.web || '', { field: f.tagline ? 'tagline' : 'web', x: W / 2, y: H / 2 + 1.2, ox: 'center', size: 1.9, font: 't', color: mix(cr, dg, 0.25), fit: W - 2 * m - 6 }));
        return { bg: { color: dg }, objs: o };
      },
    },

    // ------------------------------------------------------------ OSTRAKA – keramické nádoby v slnku
    ostraka: {
      name: 'Ostraka', fonts: 'poppins', pal: 'terrazzo', tags: ['architekt', 'dizajn', 'keramika', 'umelec', 'galeria', 'studio', 'it', 'minimal', 'moderne', 'ciste', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#FBF6EE', ink = dark(pal.ink) ? pal.ink : '#2B1D16', acc = pal.accent, sand = light(pal.soft) ? mix(pal.soft, ink, 0.12) : '#D9C9B2';
        const sx = c.sq ? W / 2 : W * 0.72, sy = c.sq ? H * 0.5 : H * 0.62, shelf = c.sq ? H * 0.5 : H * 0.8;
        const o = [paper(c, 0.4)];
        o.push(C(sx + 3, sy - 9, c.sq ? 9 : 11, { fill: mix(acc, bg, 0.72) }));
        // váza (vysoká), miska, fľaša
        const vase = (x, b, s, col) => P(`M ${f2(x - 1.2 * s)} ${f2(b - 12 * s)} L ${f2(x + 1.2 * s)} ${f2(b - 12 * s)} C ${f2(x + 1.1 * s)} ${f2(b - 9.5 * s)} ${f2(x + 4.6 * s)} ${f2(b - 8 * s)} ${f2(x + 4.4 * s)} ${f2(b - 3.6 * s)} C ${f2(x + 4.2 * s)} ${f2(b - 1 * s)} ${f2(x + 2.6 * s)} ${f2(b)} ${f2(x + 2.2 * s)} ${f2(b)} L ${f2(x - 2.2 * s)} ${f2(b)} C ${f2(x - 2.6 * s)} ${f2(b)} ${f2(x - 4.2 * s)} ${f2(b - 1 * s)} ${f2(x - 4.4 * s)} ${f2(b - 3.6 * s)} C ${f2(x - 4.6 * s)} ${f2(b - 8 * s)} ${f2(x - 1.1 * s)} ${f2(b - 9.5 * s)} ${f2(x - 1.2 * s)} ${f2(b - 12 * s)} Z`, { fill: col });
        const bowl = (x, b, s, col) => P(`M ${f2(x - 5 * s)} ${f2(b - 3.4 * s)} L ${f2(x + 5 * s)} ${f2(b - 3.4 * s)} C ${f2(x + 4.6 * s)} ${f2(b - 0.4 * s)} ${f2(x + 2.4 * s)} ${f2(b)} ${f2(x)} ${f2(b)} C ${f2(x - 2.4 * s)} ${f2(b)} ${f2(x - 4.6 * s)} ${f2(b - 0.4 * s)} ${f2(x - 5 * s)} ${f2(b - 3.4 * s)} Z`, { fill: col });
        const bottle = (x, b, s, col) => P(`M ${f2(x - 0.7 * s)} ${f2(b - 15 * s)} L ${f2(x + 0.7 * s)} ${f2(b - 15 * s)} L ${f2(x + 0.7 * s)} ${f2(b - 9 * s)} C ${f2(x + 2.8 * s)} ${f2(b - 8 * s)} ${f2(x + 2.8 * s)} ${f2(b - 6 * s)} ${f2(x + 2.8 * s)} ${f2(b - 5 * s)} L ${f2(x + 2.8 * s)} ${f2(b)} L ${f2(x - 2.8 * s)} ${f2(b)} L ${f2(x - 2.8 * s)} ${f2(b - 5 * s)} C ${f2(x - 2.8 * s)} ${f2(b - 6 * s)} ${f2(x - 2.8 * s)} ${f2(b - 8 * s)} ${f2(x - 0.7 * s)} ${f2(b - 9 * s)} Z`, { fill: col });
        const s = c.sq ? 0.95 : 1.05;
        o.push(bottle(sx - 8.5 * s, shelf, s, ink), vase(sx, shelf, s * 1.05, acc), bowl(sx + 9.5 * s, shelf, s, sand));
        o.push(P(`M ${f2(sx - 4.4 * s)} ${f2(shelf - 6 * s)} Q ${f2(sx)} ${f2(shelf - 7.4 * s)} ${f2(sx + 4.4 * s)} ${f2(shelf - 6 * s)}`, { stroke: bg, sw: 0.25, opacity: 0.7 }));
        o.push(Ln(c.sq ? m : W * 0.46, shelf, W + 2, shelf, ink, 0.16));
        if (c.sq) {
          o.push(T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H * 0.68, ox: 'center', oy: 'center', size: 4.4, font: 'd', w: 500, color: ink, fit: W - 2 * m, ls: -0.03 }));
          o.push(...centerLines(c, W / 2, H - m, { color: mix(ink, bg, 0.25), fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          const mw = W * 0.4;
          o.push(T(brand(c).toLocaleLowerCase(), { field: 'company', x: m, y: m + 5.4, oy: 'bottom', size: 5.4, font: 'd', w: 500, color: ink, fit: mw, ls: -0.03 }));
          o.push(T(f.tagline || f.role || '', { field: f.tagline ? 'tagline' : 'role', x: m, y: m + 6.8, size: 1.85, font: 't', color: acc, fit: mw }));
          o.push(...rows(c, { x: m, yb: H - m, color: mix(ink, bg, 0.2), fit: mw, size: 1.8, lh: 2.75 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = luminance(pal.accent) < 0.45 ? pal.accent : '#B4532A', cr = '#FBF1E6';
        const o = [];
        const x = c.sq ? W - 11 : W - 14, b = H + 1, s = c.sq ? 2.2 : 3.2;
        o.push(P(`M ${f2(x - 1.2 * s)} ${f2(b - 12 * s)} L ${f2(x + 1.2 * s)} ${f2(b - 12 * s)} C ${f2(x + 1.1 * s)} ${f2(b - 9.5 * s)} ${f2(x + 4.6 * s)} ${f2(b - 8 * s)} ${f2(x + 4.4 * s)} ${f2(b - 3.6 * s)} C ${f2(x + 4.2 * s)} ${f2(b - 1 * s)} ${f2(x + 2.6 * s)} ${f2(b)} ${f2(x + 2.2 * s)} ${f2(b)} L ${f2(x - 2.2 * s)} ${f2(b)} C ${f2(x - 2.6 * s)} ${f2(b)} ${f2(x - 4.2 * s)} ${f2(b - 1 * s)} ${f2(x - 4.4 * s)} ${f2(b - 3.6 * s)} C ${f2(x - 4.6 * s)} ${f2(b - 8 * s)} ${f2(x - 1.1 * s)} ${f2(b - 9.5 * s)} ${f2(x - 1.2 * s)} ${f2(b - 12 * s)} Z`, { stroke: cr, sw: 0.25, opacity: 0.6 }));
        for (let k = 1; k <= 4; k++) o.push(Ln(x - 4.4 * s + 0.3, b - k * 2.2 * s, x + 4.4 * s - 0.3, b - k * 2.2 * s, cr, 0.12, { opacity: 0.35 }));
        const mw = c.sq ? W - 2 * m : W * 0.58;
        o.push(T(f.name, { field: 'name', x: m, y: m + 4.6, oy: 'bottom', size: 4, font: 'd', w: 500, color: cr, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 5.8, size: 1.9, font: 't', color: mix(cr, acc, 0.25), fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], color: cr, fit: c.sq ? W * 0.62 : mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ GROOM – monogram v ovále a písaný podpis
    groom: {
      name: tr('Monogram stĺpec', 'Monogram sloupec'), fonts: 'italiana', pal: 'taupe', tags: ['svadba', 'beauty', 'kozmetika', 'foto', 'butik', 'dizajn', 'umelec', 'elegantne', 'jemne', 'minimal', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) > 0.33 ? pal.bg : '#D8CCC0', ink = inkOn(bg, pal, '#2E2622'), acc = pal.accent, lt = mix(bg, '#FFFFFF', 0.45);
        const ox = c.sq ? W / 2 : m + 9, oy = c.sq ? 16 : H / 2, rx = c.sq ? 7 : 7.2, ry = c.sq ? 10 : 15;
        const mk = mono(c), L1 = mk[0] || '', L2 = mk[1] || '';
        const o = [paper(c, 0.35)];
        o.push(P(oval(ox, oy, rx, ry), { fill: lt }), P(oval(ox, oy, rx + 0.9, ry + 0.9), { stroke: acc, sw: 0.14 }));
        if (c.sq) o.push(T(mk, { x: ox, y: oy, ox: 'center', oy: 'center', size: 7, font: 'd', color: ink, ls: 0.04 }));
        else {
          o.push(T(L1, { x: ox, y: oy - 5.4, ox: 'center', oy: 'center', size: 7, font: 'd', color: ink }));
          o.push(P(`M ${f2(ox)} ${f2(oy - 0.9)} L ${f2(ox + 0.9)} ${f2(oy)} L ${f2(ox)} ${f2(oy + 0.9)} L ${f2(ox - 0.9)} ${f2(oy)} Z`, { fill: acc }));
          o.push(T(L2, { x: ox, y: oy + 5.4, ox: 'center', oy: 'center', size: 7, font: 'd', color: ink }));
        }
        o.push(...sprig(ox, oy - ry - 0.4, 6, -60, { color: acc, leaves: 5, size: 1.6 }), ...sprig(ox, oy - ry - 0.4, 6, -120, { color: acc, leaves: 5, size: 1.6 }));
        const x = c.sq ? W / 2 : W * 0.62, al = 'center';
        o.push(T(first(c), { field: 'name', part: 0, x, y: c.sq ? 34 : H * 0.42, ox: al, oy: 'center', size: c.sq ? 8 : 10, font: SCRIPT, color: acc, fit: c.sq ? W - 2 * m : W * 0.5 }));
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x, y: c.sq ? 41 : H * 0.62, ox: al, oy: 'center', size: 2.4, font: 'd', ls: 0.3, color: ink, fit: c.sq ? W - 2 * m : W * 0.52 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x, y: c.sq ? 44.6 : H * 0.62 + 3.6, ox: al, oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.26, color: mix(ink, bg, 0.35), fit: c.sq ? W - 2 * m : W * 0.5 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const so = light(pal.soft) ? pal.soft : '#EFE8E1', ink = dark(pal.ink) ? pal.ink : '#2E2622', acc = pal.accent;
        return { bg: { color: so }, objs: [
          paper(c, 0.45),
          ...sprig(3, 3, 10, 35, { color: mix(acc, so, 0.3), leaves: 6, size: 2 }), ...sprig(W - 3, H - 3, 10, 215, { color: mix(acc, so, 0.3), leaves: 6, size: 2 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.3, ox: 'center', oy: 'center', size: c.sq ? 2.8 : 3.2, font: 'd', ls: 0.26, color: ink, fit: W - 2 * m - 6 }),
          ...divider(W / 2, H * 0.3 + 4, 18, acc),
          ...contacts(c, { x: W / 2, yb: H - m - (c.sq ? 2 : 1), align: 'center', keys: ['phone', 'email', 'web'], size: 1.9, lh: 2.95, color: ink, fit: W - 2 * m - 6 }),
        ] };
      },
    },

    // ------------------------------------------------------------ BISTRO – pruhovaná markíza
    bistro: {
      name: 'Bistro', fonts: 'rubik', pal: 'krieda', emblem: 'coffee', tags: ['gastro', 'kaviaren', 'restauracia', 'bistro', 'pekaren', 'bar', 'obchod', 'hrave', 'odvazne', 'moderne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F5F2EC', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent;
        const n = c.sq ? 7 : 11, sw = (W + 4) / n, ah = c.sq ? 9 : 9.5, sr = sw / 2;
        const o = [paper(c, 0.4)];
        for (let i = 0; i < n; i++) {
          const x = -2 + i * sw, col = i % 2 ? bg : acc;
          o.push(P(`M ${f2(x)} -3 L ${f2(x + sw)} -3 L ${f2(x + sw)} ${f2(ah)} C ${f2(x + sw)} ${f2(ah + sr * 1.1)} ${f2(x)} ${f2(ah + sr * 1.1)} ${f2(x)} ${f2(ah)} Z`, { fill: col }));
        }
        o.push(P(Array.from({ length: n }, (_, i) => { const x = -2 + i * sw; return `M ${f2(x)} ${f2(ah)} C ${f2(x)} ${f2(ah + sr * 1.1)} ${f2(x + sw)} ${f2(ah + sr * 1.1)} ${f2(x + sw)} ${f2(ah)}`; }).join(' '), { stroke: ink, sw: 0.2 }));
        const by = c.sq ? H * 0.6 : H * 0.62;
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: by, ox: 'center', oy: 'bottom', size: c.sq ? 5 : 6.4, font: 'd', w: 800, color: ink, fit: W - 2 * m, ls: -0.01 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: W / 2, y: by + 1.2, ox: 'center', size: 2, font: 't', w: 500, color: acc, fit: W - 2 * m - 4 }));
        const sy = H - m - 0.6;
        o.push(T('★', { x: W / 2 - 14, y: sy, ox: 'center', oy: 'center', size: 1.8, font: 't', color: acc }), T('★', { x: W / 2 + 14, y: sy, ox: 'center', oy: 'center', size: 1.8, font: 't', color: acc }));
        o.push(T((city(c) || f.web || '').toLocaleUpperCase(), { field: city(c) ? 'address' : 'web', x: W / 2, y: sy, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 700, ls: 0.3, color: ink, fit: 24 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, ink = dark(pal.ink) ? pal.ink : '#1A1A18', wh = '#FFF8F0', q = 2.6;
        const o = [];
        for (let r = 0; r < 2; r++) for (let x = -2, k = 0; x < W + 2; x += q, k++) if ((k + r) % 2 === 0) o.push(R(x, H - 2 * q + r * q + 2, q, q, ink));
        o.push(R(-2, H - 2 * q + 2, W + 4, 2 * q, null, { stroke: ink, sw: 0.1 }));
        o.push(emblem(c, W - m - 5, m + 5, 9, wh));
        o.push(T(f.name, { field: 'name', x: m, y: m + 4.6, oy: 'bottom', size: 4.4, font: 'd', w: 800, color: wh, fit: W - 2 * m - 14 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 5.8, size: 2, font: 't', w: 600, color: ink, fit: W - 2 * m - 14 }));
        o.push(...rows(c, { x: m, yb: H - 2 * q - 1.6, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: wh, fit: W - 2 * m, size: 1.85, lh: 2.8, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ DROP – nálepka a stekajúce kvapky
    drop: {
      name: 'Drop', fonts: 'rubik', pal: 'olive', emblem: 'coffee-bean', tags: ['kaviaren', 'bistro', 'bar', 'obchod', 'eko', 'zahrady', 'pivovar', 'hrave', 'odvazne', 'prirodne', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#4B5340', cr = light(pal.ink) ? pal.ink : '#F1ECE1', acc = pal.foil ? MET(pal) : pal.accent;
        const cx = c.sq ? W / 2 : W - m - 13, cy = c.sq ? 17 : H / 2, r = c.sq ? 11 : 14;
        const o = [];
        o.push(C(cx + 0.6, cy + 0.9, r, { fill: mix(bg, '#000000', 0.3) }), C(cx, cy, r, { fill: cr }), C(cx, cy, r - 1.2, { stroke: bg, sw: 0.14 }), C(cx, cy, r * 0.5, { stroke: bg, sw: 0.14 }));
        o.push(...ringText((brand(c) + ' • ' + (city(c) || f.role || brand(c)) + ' • ').toLocaleUpperCase(), cx, cy, r - 3, -90, 262, { size: 2, color: bg, w: 800, font: 'd' }));
        o.push(emblem(c, cx, cy, r * 0.62, acc));
        if (c.sq) {
          o.push(T(f.tagline || f.role || '', { field: 'tagline', x: W / 2, y: 37, ox: 'center', oy: 'center', size: 2, font: 't', w: 600, color: cr, fit: W - 2 * m }));
          o.push(T((f.web || '').toLocaleUpperCase(), { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.7, font: 't', w: 700, ls: 0.24, color: acc, fit: W - 2 * m }));
        } else {
          const words = brand(c).toLocaleLowerCase().split(/\s+/), l2 = words.length > 1 ? words.slice(1).join(' ') : '';
          const mw = cx - r - m - 3;
          o.push(T(words[0], { field: 'company', x: m - 0.3, y: l2 ? H * 0.42 : H * 0.55, oy: 'bottom', size: 7, font: 'd', w: 800, color: cr, fit: mw, ls: -0.03, lh: 0.9 }));
          if (l2) o.push(T(l2, { field: 'company', x: m - 0.3, y: H * 0.42 - 0.6, size: 7, font: 'd', w: 800, color: acc, fit: mw, ls: -0.03, lh: 0.9 }));
          o.push(T(f.tagline || '', { field: 'tagline', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 500, color: cr, opacity: 0.85, fit: mw }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ol = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#4B5340', cr = '#F3EEE3', acc = pal.foil ? MET(pal) : pal.accent;
        const o = [paper(c, 0.45)];
        const r = seeded(brand(c) + 'drip'), band = c.sq ? 8 : 7;
        let d = `M -3 -3 L ${W + 3} -3 L ${W + 3} ${band}`;
        for (let x = W + 3; x > -3;) { const w = 3 + r() * 4, len = r() < 0.55 ? 2 + r() * 7 : 0.6; const x2 = x - w; const xm = x - w / 2; d += ` L ${f2(xm + 1.1)} ${f2(band)} L ${f2(xm + 1.1)} ${f2(band + len)} C ${f2(xm + 1.1)} ${f2(band + len + 1.5)} ${f2(xm - 1.1)} ${f2(band + len + 1.5)} ${f2(xm - 1.1)} ${f2(band + len)} L ${f2(xm - 1.1)} ${f2(band)} L ${f2(x2)} ${f2(band)}`; x = x2; }
        d += ` L -3 ${band} Z`;
        o.push(P(d, { fill: ol }));
        const top = c.sq ? H * 0.42 : H * 0.5;
        o.push(T(f.name, { field: 'name', x: m, y: top, oy: 'bottom', size: 4.2, font: 'd', w: 800, color: ol, fit: W - 2 * m, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x: m, y: top + 1, size: 1.9, font: 't', w: 600, color: acc, fit: W - 2 * m }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web'], color: ol, fit: W - 2 * m, size: 1.85, lh: 2.8, weight: 500 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ CB – veľké prekrývajúce sa iniciály
    cb: {
      name: tr('Veľké iniciály', 'Velké iniciály'), fonts: 'dmserif', pal: 'krieda', tags: ['stolar', 'remeslo', 'architekt', 'stavba', 'pravnik', 'firma', 'dizajn', 'odvazne', 'minimal', 'serioze', 'klasicky'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F5F2EC', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent;
        const mk = mono(c), sz = c.sq ? 30 : 33;
        const o = [paper(c, 0.4)];
        o.push(T(mk[0] || '', { x: c.sq ? m - 2 : m - 2.4, y: c.sq ? H * 0.52 : H + 4.5, oy: 'bottom', size: sz, font: 'd', color: ink, ls: -0.02 }));
        if (mk[1]) o.push(T(mk[1], { x: c.sq ? m + sz * 0.42 : m + sz * 0.46, y: c.sq ? H * 0.52 + 4 : H + 8.5, oy: 'bottom', size: sz, font: 'd', it: true, color: acc, opacity: 0.88, ls: -0.02 }));
        const x = c.sq ? m : W * 0.56, mw = W - x - m;
        o.push(T(f.name, { field: 'name', x, y: c.sq ? H * 0.68 : m + 4.4, oy: 'bottom', size: c.sq ? 3.4 : 3.8, font: 'd', color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x, y: (c.sq ? H * 0.68 : m + 4.4) + 1.2, size: 1.7, font: 't', w: 600, ls: 0.2, color: acc, fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: mix(ink, bg, 0.2), fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent, wh = '#F5F1EA';
        return { bg: { color: ink }, objs: [
          T(mono(c), { x: W / 2, y: H / 2 + 2, ox: 'center', oy: 'center', size: c.sq ? 34 : 44, font: 'd', color: 'none', stroke: mix(wh, ink, 0.55), sw: 0.14, ls: -0.02 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 2.6, font: 't', w: 600, ls: 0.34, color: wh, fit: W - 2 * m - 6 }),
          Ln(W / 2 - 4, H / 2 + 3, W / 2 + 4, H / 2 + 3, acc, 0.3),
          T((f.web || '').toLocaleUpperCase(), { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.7, font: 't', w: 500, ls: 0.3, color: mix(wh, ink, 0.35), fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ TICHÁ – mesiac a kruhy na vode
    ticha: {
      name: tr('Tichá', 'Tichá'), fonts: 'tenor', pal: 'taupe', emblem: 'moon-stars', tags: ['architekt', 'dizajn', 'terapeut', 'psycholog', 'kouc', 'kozmetika', 'foto', 'minimal', 'jemne', 'elegantne', 'prirodne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = inkOn(bg, pal, '#2E2622', '#F3EEE8'), lt = mix(bg, '#FFFFFF', 0.55);
        const cx = W / 2, cy = c.sq ? H * 0.38 : H * 0.4, r = c.sq ? 8 : 8.5;
        const o = [];
        for (let k = 1; k <= 5; k++) o.push(P(oval(cx, cy + r + 4.5, r * (1 + k * 0.55), 1.3 + k * 0.55), { stroke: lt, sw: 0.12, opacity: 1 - k * 0.15 }));
        o.push(C(cx, cy, r, { fill: { grad: [lt, mix(bg, '#FFFFFF', 0.25)], angle: 120 } }));
        o.push(C(cx + r * 0.38, cy - r * 0.15, r * 0.86, { fill: bg, opacity: 0.55 }));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: c.sq ? H * 0.72 : H * 0.76, ox: 'center', oy: 'center', size: c.sq ? 2.6 : 3, font: 'd', ls: 0.4, color: ink, fit: W - 2 * m - 4 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: W / 2, y: c.sq ? H * 0.72 + 3.8 : H * 0.76 + 3.8, ox: 'center', oy: 'center', size: 1.8, font: 't', it: true, color: mix(ink, bg, 0.3), fit: W - 2 * m - 6 }));
        return { bg: { color: { grad: [mix(bg, '#FFFFFF', 0.2), bg, mix(bg, ink, 0.12)], angle: 90 }, art: tex(c, 'akvarel-bez'), artOpacity: 0.35, artBlend: 'multiply' }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const dk = dark(pal.ink) ? mix(pal.ink, pal.bg, 0.12) : dark(pal.bg) ? mix(pal.bg, '#FFFFFF', 0.06) : '#3A322C', lt = light(pal.bg) ? mix(pal.bg, '#FFFFFF', 0.4) : '#EFE8DF';
        return { bg: { color: dk }, objs: [
          C(W / 2, m + 4, 2.4, { fill: lt }), C(W / 2 + 1, m + 3.6, 2.1, { fill: dk }),
          T(f.name, { field: 'name', x: W / 2, y: H * 0.42, ox: 'center', oy: 'center', size: c.sq ? 3.2 : 3.6, font: 'd', ls: 0.06, color: lt, fit: W - 2 * m }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.42 + 3.6, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 500, ls: 0.3, color: mix(lt, dk, 0.35), fit: W - 2 * m }),
          ...centerLines(c, W / 2, H - m, { color: lt, fit: W - 2 * m, size: 1.8, lh: 2.8 }),
        ] };
      },
    },

    // ------------------------------------------------------------ OBRYS – obrysová iniciála cez celú plochu
    obrys: {
      name: tr('Obrys', 'Obrys'), fonts: 'dmserif', pal: 'sneh', tags: ['architekt', 'dizajn', 'umelec', 'foto', 'galeria', 'moda', 'minimal', 'odvazne', 'elegantne', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? mix(pal.bg, '#F3EFE8', 0.6) : '#F6F3EE', ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent;
        const mk = mono(c);
        const o = [paper(c, 0.35)];
        o.push(T(mk, { x: W + (c.sq ? 3 : 6), y: c.sq ? H * 0.74 : H + 9, ox: 'right', oy: 'bottom', size: c.sq ? 30 : 46, font: 'd', color: 'none', stroke: ink, sw: 0.13, ls: -0.04 }));
        o.push(R(m, m, 2.2, 2.2, acc));
        o.push(T(f.name, { field: 'name', x: m - 0.2, y: m + 9, oy: 'bottom', size: c.sq ? 4.2 : 5, font: 'd', color: ink, fit: c.sq ? W - 2 * m : W * 0.42 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 10.2, size: 2, font: 'd', it: true, color: mix(ink, bg, 0.35), fit: W * 0.6 }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: ink, fit: W * 0.5, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent, wh = '#F6F3EE';
        return { bg: { color: ink }, objs: [
          T(brand(c), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: c.sq ? 8 : 11, font: 'd', color: 'none', stroke: wh, sw: 0.14, fit: W - 2 * m, ls: -0.02 }),
          R(W / 2 - 1.1, H - m - 6, 2.2, 2.2, acc),
          T((f.web || '').toLocaleUpperCase(), { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.7, font: 't', w: 500, ls: 0.3, color: mix(wh, ink, 0.3), fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ FIGLIA – olivová ratolesť
    figlia: {
      name: 'Figlia', fonts: 'caslon', pal: 'salvia', emblem: 'leaf', tags: ['restauracia', 'kaviaren', 'pekaren', 'vino', 'bistro', 'kvety', 'obchod', 'remeslo', 'elegantne', 'prirodne', 'klasicky', 'teple'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = luminance(pal.bg) > 0.33 ? pal.bg : '#E8ECE3', ink = inkOn(bg, pal, '#1F2A22'), acc = pal.accent, olive = mix(acc, '#1F2A22', 0.45);
        const o = [paper(c, 0.45)];
        const branch = (x, y, len, ang, s) => {
          const a = rad(ang), ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, cx = (x + ex) / 2 - Math.sin(a) * len * 0.12, cy = (y + ey) / 2 + Math.cos(a) * len * 0.12;
          o.push(P(`M ${f2(x)} ${f2(y)} Q ${f2(cx)} ${f2(cy)} ${f2(ex)} ${f2(ey)}`, { stroke: ink, sw: 0.34 }));
          for (let i = 1; i <= 11; i++) {
            const t = i / 12, px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * ex, py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ey, sd = i % 2 ? 1 : -1;
            o.push(P(leaf(px, py, a + sd * 0.62, s * (1 - t * 0.35), s * 0.3), { fill: i % 3 ? acc : mix(acc, ink, 0.35) }));
            if (i % 3 === 1) { const ox2 = px + Math.cos(a - sd * 1.2) * 1.6, oy2 = py + Math.sin(a - sd * 1.2) * 1.6; o.push(Ln(px, py, ox2, oy2, ink, 0.16), P(oval(ox2 + 0.3, oy2 + 1.2, 1.25, 1.7, a), { fill: olive }), C(ox2 - 0.1, oy2 + 0.7, 0.35, { fill: '#FFFFFF', opacity: 0.45 })); }
          }
        };
        if (c.sq) branch(W * 0.12, H * 0.4, W * 0.8, -14, 6); else { branch(W * 0.46, H + 3, W * 0.62, -34, 7.6); branch(W + 3, H * 0.12, W * 0.3, 165, 5.4); }
        const tx = c.sq ? W / 2 : m, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T('EST. ' + (city(c) || '').toLocaleUpperCase(), { field: 'address', x: tx, y: c.sq ? H * 0.52 : m + 1.2, ox: al, oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.34, color: acc, fit: mw }));
        o.push(T(brand(c), { field: 'company', x: tx, y: c.sq ? H * 0.66 : H * 0.42, ox: al, oy: 'center', size: c.sq ? 4.4 : 5.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.tagline || '', { field: 'tagline', x: tx, y: c.sq ? H * 0.66 + 4.4 : H * 0.42 + 4.8, ox: al, oy: 'center', size: 2, font: 'd', it: true, color: mix(ink, bg, 0.3), fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const cr = '#F7F3EA', ink = dark(pal.ink) ? pal.ink : '#1F2A22', acc = pal.accent;
        const cx = c.sq ? W / 2 : m + 10, cy = c.sq ? 15 : H / 2;
        const o = [paper(c, 0.5), ...wreath(cx, cy + 0.5, 8.6, acc, { leaves: 9, size: 2.8 })];
        o.push(logoOr(c, cx, cy, 9, 9, { tint: ink }, MONO(c, { x: cx, y: cy, ox: 'center', oy: 'center', size: 6, it: true, color: ink })));
        const x = c.sq ? m : m + 24, mw = W - x - m;
        o.push(T(f.name, { field: 'name', x, y: c.sq ? 31 : m + 4.6, oy: 'bottom', size: c.sq ? 3.2 : 3.8, font: 'd', color: ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x, y: (c.sq ? 31 : m + 4.6) + 1, size: 1.9, font: 'd', it: true, color: acc, fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: ink, fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ MAITLAND – monogram v bielom kruhu
    maitland: {
      name: 'Maitland', fonts: 'dmserif', pal: 'mint', tags: ['pravnik', 'konzultant', 'financie', 'reality', 'architekt', 'firma', 'kaviaren', 'vydavatel', 'elegantne', 'serioze', 'ciste', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = inkOn(bg, pal, '#14231F', '#FBFAF6'), wh = '#FBFAF6';
        const cx = c.sq ? W / 2 : W * 0.76, cy = c.sq ? H * 0.36 : H / 2, r = c.sq ? 12 : 17;
        const o = [];
        o.push(C(cx, cy, r + 2.2, { stroke: wh, sw: 0.14, opacity: 0.8 }), C(cx, cy, r, { fill: wh }));
        o.push(logoOr(c, cx, cy, r * 1.2, r * 1.2, { tint: ink }, MONO(c, { x: cx, y: cy + 0.4, ox: 'center', oy: 'center', size: r * 0.82, color: ink, ls: -0.02 })));
                const tx = c.sq ? W / 2 : m, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m : W * 0.46;
        o.push(T(f.name, { field: 'name', x: tx, y: c.sq ? H * 0.74 : H * 0.5, ox: al, oy: 'bottom', size: c.sq ? 3.6 : 4.6, font: 'd', color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: tx, y: (c.sq ? H * 0.74 : H * 0.5) + 1.3, ox: al, size: 1.7, font: 't', w: 600, ls: 0.24, color: mix(ink, bg, 0.3), fit: mw }));
        if (!c.sq) o.push(Ln(m, H - m - 1, m + 10, H - m - 1, ink, 0.25));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#14231F', bg = pal.bg, wh = '#FBFAF6';
        return { bg: { color: ink }, objs: [
          C(W + 4, -4, 16, { fill: bg, opacity: 0.16 }), C(W + 4, -4, 10, { fill: bg, opacity: 0.2 }),
          T(brand(c), { field: 'company', x: m, y: m + 4.4, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: wh, fit: W - 2 * m - 12 }),
          T(f.tagline || '', { field: 'tagline', x: m, y: m + 5.6, size: 1.9, font: 'd', it: true, color: bg, fit: W - 2 * m - 12 }),
          ...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], color: wh, labels: true, lcolor: bg, fit: W - 2 * m, size: 1.8, lh: 2.75 }),
        ] };
      },
    },

    // ------------------------------------------------------------ MINIMAL – ťah štetca (ensō)
    minimal: {
      name: 'Minimal', fonts: 'fraunces', pal: 'salvia', tags: ['terapeut', 'psycholog', 'joga', 'wellness', 'kouc', 'umelec', 'architekt', 'jemne', 'minimal', 'osobne', 'prirodne', 'elegantne', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = inkOn(bg, pal, '#1F2A22', '#F1F0EA'), acc = pal.accent;
        const cx = c.sq ? W / 2 : W * 0.74, cy = c.sq ? H * 0.36 : H / 2, r = c.sq ? 10 : 12.5;
        const o = [paper(c, 0.5)];
        const enso = (rr, a0, a1, sw, op, wob) => { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = rad(a0 + (a1 - a0) * t); const q = rr * (1 + Math.sin(t * 9 + wob) * 0.012); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } o.push(P(smooth(pts), { stroke: acc, sw, opacity: op })); };
        enso(r, -70, 245, 1.5, 0.92, 0); enso(r + 0.5, -60, 200, 0.8, 0.6, 1.3); enso(r - 0.45, -40, 238, 0.6, 0.55, 2.1); enso(r + 0.9, 30, 150, 0.35, 0.4, 0.4);
        const tx = c.sq ? W / 2 : m, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(f.name, { field: 'name', x: tx, y: c.sq ? H * 0.72 : H * 0.46, ox: al, oy: 'bottom', size: c.sq ? 3.8 : 4.6, font: 'd', color: ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x: tx, y: (c.sq ? H * 0.72 : H * 0.46) + 1.1, ox: al, size: 2.1, font: 'd', it: true, color: acc, fit: mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m, { color: mix(ink, bg, 0.3), fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        else o.push(...rows(c, { x: m, yb: H - m, color: mix(ink, bg, 0.25), fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1F2A22', fg = mix(pal.bg, '#FFFFFF', 0.3), acc = pal.accent;
        const o = []; const cx = W / 2, cy = H * 0.36, r = 4;
        const pts = []; for (let i = 0; i <= 30; i++) { const a = rad(-70 + 315 * (i / 30)); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
        o.push(P(smooth(pts), { stroke: mix(acc, '#FFFFFF', 0.25), sw: 0.7 }));
        o.push(T(brand(c), { field: 'company', x: W / 2, y: H * 0.64, ox: 'center', oy: 'center', size: c.sq ? 3.4 : 3.8, font: 'd', color: fg, fit: W - 2 * m - 6 }));
        o.push(T(f.tagline || f.web || '', { field: f.tagline ? 'tagline' : 'web', x: W / 2, y: H * 0.64 + 4.2, ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: mix(fg, ink, 0.35), fit: W - 2 * m - 6 }));
        return { bg: { color: ink }, objs: o };
      },
    },

    // ------------------------------------------------------------ ALDER – pôdorys na tmavozelenej
    alder: {
      name: 'Alder', fonts: 'poppins', pal: 'smaragd', tags: ['firma', 'architekt', 'konzultant', 'it', 'reality', 'financie', 'agentura', 'moderne', 'ciste', 'serioze', 'minimal', 'tmave'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#0F3B2E', wh = light(pal.ink) ? pal.ink : '#F3EFE4', acc = pal.accent, ln = mix(bg, wh, 0.32);
        const o = [];
        // pôdorys bytu
        const x0 = c.sq ? 8 : W * 0.5, y0 = c.sq ? 5 : 6, pw = c.sq ? W - 16 : W * 0.44, ph = c.sq ? 22 : H - 12;
        const L = (x1, y1, x2, y2, sw = 0.16) => o.push(Ln(x1, y1, x2, y2, ln, sw));
        o.push(R(x0, y0, pw, ph, null, { stroke: ln, sw: 0.5 }));
        L(x0 + pw * 0.42, y0, x0 + pw * 0.42, y0 + ph * 0.38, 0.3); L(x0 + pw * 0.42, y0 + ph * 0.58, x0 + pw * 0.42, y0 + ph, 0.3);
        L(x0 + pw * 0.42, y0 + ph * 0.55, x0 + pw, y0 + ph * 0.55, 0.3);
        L(x0, y0 + ph * 0.62, x0 + pw * 0.2, y0 + ph * 0.62, 0.3);
        const door = (x, y, r, sx, sy) => { o.push(Ln(x, y, x + sx * r, y, ln, 0.12)); o.push(P(`M ${f2(x + sx * r)} ${f2(y)} Q ${f2(x + sx * r)} ${f2(y + sy * r)} ${f2(x)} ${f2(y + sy * r)}`, { stroke: ln, sw: 0.1 })); };
        door(x0 + pw * 0.42, y0 + ph * 0.38, ph * 0.2, 1, 1); door(x0 + pw * 0.62, y0 + ph * 0.55, ph * 0.16, 1, 1);
        for (const [a, b] of [[0.62, 0.86], [0.12, 0.3]]) { o.push(R(x0 + pw * a, y0 - 0.4, pw * (b - a), 0.8, bg)); L(x0 + pw * a, y0 - 0.2, x0 + pw * b, y0 - 0.2, 0.1); L(x0 + pw * a, y0 + 0.2, x0 + pw * b, y0 + 0.2, 0.1); }
        o.push(R(x0 + pw * 0.08, y0 + ph * 0.1, pw * 0.25, ph * 0.22, null, { stroke: ln, sw: 0.1 }), C(x0 + pw * 0.75, y0 + ph * 0.25, ph * 0.12, { stroke: ln, sw: 0.1 }));
        o.push(R(x0 + pw * 0.55, y0 + ph * 0.68, pw * 0.36, ph * 0.22, acc, { opacity: 0.85 }));
        // kóta
        const ky = y0 + ph + 2.4; L(x0, ky, x0 + pw, ky, 0.1); L(x0, ky - 0.8, x0, ky + 0.8, 0.1); L(x0 + pw, ky - 0.8, x0 + pw, ky + 0.8, 0.1);
        if (!c.sq) {
          o.push(T(brand(c) + '.', { field: 'company', x: m, y: H * 0.46, oy: 'bottom', size: 5, font: 'd', w: 600, color: wh, fit: W * 0.4, ls: -0.03 }));
          o.push(T(f.tagline || f.role || '', { field: f.tagline ? 'tagline' : 'role', x: m, y: H * 0.46 + 1.2, size: 1.85, font: 't', color: mix(wh, bg, 0.3), fit: W * 0.4 }));
          o.push(T('N 48°08′ · E 17°06′', { x: m, y: H - m, oy: 'bottom', size: 1.7, font: 'm', color: acc, ls: 0.06 }));
        } else {
          o.push(T(brand(c) + '.', { field: 'company', x: W / 2, y: H * 0.72, ox: 'center', oy: 'center', size: 4.4, font: 'd', w: 600, color: wh, fit: W - 2 * m, ls: -0.03 }));
          o.push(T(f.tagline || f.role || '', { field: f.tagline ? 'tagline' : 'role', x: W / 2, y: H * 0.72 + 4.2, ox: 'center', oy: 'center', size: 1.8, font: 't', color: mix(wh, bg, 0.3), fit: W - 2 * m }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const gr = dark(pal.bg) ? pal.bg : '#0F3B2E', cr = '#F4F0E6', acc = pal.accent, bw = c.sq ? 0 : 16;
        const o = [paper(c, 0.4)];
        if (bw) { o.push(R(-2, -2, bw + 2, H + 4, gr)); o.push(logoOr(c, bw / 2, H / 2, 10, 10, { tint: cr }, MONO(c, { x: bw / 2, y: H / 2, ox: 'center', oy: 'center', size: 5.4, w: 600, color: cr }))); o.push(R(bw - 0.8, -2, 0.8, H + 4, acc)); }
        const x = bw + (c.sq ? m : 6), mw = W - x - m;
        o.push(T(f.name, { field: 'name', x, y: m + 4.4, oy: 'bottom', size: 3.8, font: 'd', w: 600, color: gr, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x, y: m + 5.6, size: 1.9, font: 't', color: mix(gr, cr, 0.3), fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: ['phone', 'email', 'web', 'address'], color: gr, labels: true, lcolor: mix(acc, gr, 0.2), fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ INICIÁLY AR – prepletené iniciály v kruhu s vavrínom
    ar: {
      name: tr('Iniciály AR', 'Iniciály AR'), fonts: 'dmserif', pal: 'ivory', tags: ['pravnik', 'advokat', 'financie', 'konzultant', 'architekt', 'reality', 'firma', 'luxusne', 'elegantne', 'serioze', 'klasicky'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F4EFE6', ink = dark(pal.ink) ? pal.ink : '#2A2622', g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        const cx = W / 2, cy = c.sq ? H * 0.38 : H * 0.4, r = c.sq ? 11 : 12.5, mk = mono(c);
        const o = [paper(c, 0.5)];
        o.push(C(cx, cy, r, { stroke: met, sw: 0.14 }), C(cx, cy, r - 0.9, { stroke: met, sw: 0.08 }));
        o.push(...sprig(cx - r - 0.5, cy + 3, 9, -105, { color: met, leaves: 6, size: 2 }), ...sprig(cx + r + 0.5, cy + 3, 9, -75, { color: met, leaves: 6, size: 2 }));
        if (c.logo || c.mark) o.push(logoOr(c, cx, cy, r * 1.3, r * 1.3, { tint: g }, null));
        else {
          o.push(T(mk[0] || '', { x: cx - r * 0.22, y: cy - r * 0.06, ox: 'center', oy: 'center', size: r * 1.15, font: 'd', color: g }));
          if (mk[1]) o.push(T(mk[1], { x: cx + r * 0.26, y: cy + r * 0.2, ox: 'center', oy: 'center', size: r * 1.15, font: 'd', it: true, color: ink, opacity: 0.92 }));
        }
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: c.sq ? H * 0.74 : H * 0.79, ox: 'center', oy: 'center', size: 2.4, font: 'd', ls: 0.3, color: ink, fit: W - 2 * m - 4 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: W / 2, y: c.sq ? H * 0.74 + 3.6 : H * 0.79 + 3.4, ox: 'center', oy: 'center', size: 1.8, font: 'd', it: true, color: mix(ink, bg, 0.35), fit: W - 2 * m - 6 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const dk = dark(pal.ink) ? pal.ink : '#2A2622', g = G(pal), iv = '#F4EFE6', met = pal.foil ? MET(pal) : pal.accent;
        const o = [R(3, 3, W - 6, H - 6, null, { stroke: g, sw: 0.16 })];
        const tx = c.sq ? W / 2 : m + 2, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m - 4 : W * 0.55;
        o.push(T(f.name, { field: 'name', x: tx, y: m + 5.4, ox: al, oy: 'bottom', size: c.sq ? 3.4 : 4.2, font: 'd', color: g, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: tx, y: m + 6.8, ox: al, size: 1.7, font: 't', w: 500, ls: 0.26, color: iv, fit: mw }));
        if (c.sq) o.push(...centerLines(c, W / 2, H - m - 2, { color: iv, fit: W - 2 * m - 4, size: 1.75, lh: 2.6 }));
        else {
          o.push(...rows(c, { x: tx, yb: H - m - 1.5, keys: ['phone', 'email', 'web'], color: iv, labels: true, lcolor: met, fit: W * 0.55, size: 1.8, lh: 2.75 }));
          o.push(T(mono(c), { x: W - m - 11, y: H / 2, ox: 'center', oy: 'center', size: 13, font: 'd', it: true, color: 'none', stroke: met, sw: 0.12 }));
        }
        return { bg: { color: dk }, objs: o };
      },
    },

    // ------------------------------------------------------------ BODKA – rastrové bodky
    bodka: {
      name: tr('Bodka', 'Tečka'), fonts: 'poppins', pal: 'koral', tags: ['it', 'startup', 'agentura', 'marketing', 'dizajn', 'konzultant', 'firma', 'moderne', 'minimal', 'odvazne', 'ciste'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#FFF5EF', ink = dark(pal.ink) ? pal.ink : '#1D1A19', acc = pal.accent;
        const o = []; const st = 2.6, fx = W + 2, fy = H + 2, maxD = Math.hypot(W, H) * 0.62;
        for (let y = st / 2; y < H + st; y += st) for (let x = st / 2; x < W + st; x += st) { const d = Math.hypot(x - fx, y - fy) / maxD; const r = (1 - d) * st * 0.48; if (r > 0.12) o.push(C(x, y, r, { fill: acc })); }
        o.push(C(m + 1.1, m + 1.1, 1.1, { fill: acc }));
        const mw = c.sq ? W - 2 * m : W * 0.55;
        o.push(T(brand(c).toLocaleLowerCase(), { field: 'company', x: m - 0.3, y: c.sq ? H * 0.42 : H * 0.5, oy: 'bottom', size: c.sq ? 6 : 7.4, font: 'd', w: 600, color: ink, fit: mw, ls: -0.04 }));
        o.push(T(f.tagline || '', { field: 'tagline', x: m, y: (c.sq ? H * 0.42 : H * 0.5) + 1, size: 1.9, font: 't', color: mix(ink, bg, 0.35), fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, wh = '#FFFFFF', ink = dark(pal.ink) ? pal.ink : '#1D1A19';
        const o = []; const st = 2.6, maxD = Math.hypot(W, H) * 0.55;
        for (let y = st / 2; y < H + st; y += st) for (let x = st / 2; x < W + st; x += st) { const d = Math.hypot(x + 2, y + 2) / maxD; const r = (1 - d) * st * 0.45; if (r > 0.12) o.push(C(x, y, r, { fill: wh, opacity: 0.85 })); }
        const x = c.sq ? m : W * 0.42, mw = W - x - m;
        o.push(T(f.name, { field: 'name', x, y: c.sq ? H * 0.5 : m + 4.4, oy: 'bottom', size: 3.8, font: 'd', w: 600, color: wh, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x, y: (c.sq ? H * 0.5 : m + 4.4) + 1, size: 1.9, font: 't', w: 500, color: ink, fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: wh, fit: mw, size: 1.8, lh: 2.75, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ KONTRAST – štvrťkruhy, dve farby
    kontrast: {
      name: tr('Kontrast', 'Kontrast'), fonts: 'poppins', pal: 'merlot', tags: ['dizajn', 'agentura', 'kreativ', 'it', 'marketing', 'studio', 'hudba', 'odvazne', 'moderne', 'farebne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, cr = inkOn(bg, pal, '#1D1A19', '#F7EFE6'), acc = pal.accent;
        const qr = c.sq ? 26 : 32, k = 0.5523 * qr;
        const o = [];
        o.push(P(`M ${f2(W + 2)} ${f2(H + 2 - qr)} C ${f2(W + 2 - k)} ${f2(H + 2 - qr)} ${f2(W + 2 - qr)} ${f2(H + 2 - k)} ${f2(W + 2 - qr)} ${f2(H + 2)} L ${f2(W + 2)} ${f2(H + 2)} Z`, { fill: acc }));
        o.push(C(W + 2 - qr, H + 2 - qr, c.sq ? 5 : 6, { fill: cr }));
        o.push(C(W - m - 3, m + 3, 1.6, { stroke: cr, sw: 0.25 }));
        const mw = c.sq ? W - 2 * m : W * 0.55;
        o.push(T(brand(c), { field: 'company', x: m - 0.3, y: m + 7, oy: 'bottom', size: c.sq ? 6 : 7.6, font: 'd', w: 700, color: cr, fit: mw, ls: -0.04 }));
        o.push(T(f.tagline || f.role || '', { field: f.tagline ? 'tagline' : 'role', x: m, y: m + 8.4, size: 2, font: 't', w: 500, color: acc, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, acc = pal.accent, cr = light(pal.ink) ? pal.ink : '#F7EFE6';
        const qr = 14, k = 0.5523 * qr;
        const o = [P(`M -2 ${f2(-2 + qr)} C ${f2(-2 + k)} ${f2(-2 + qr)} ${f2(-2 + qr)} ${f2(-2 + k)} ${f2(-2 + qr)} -2 L -2 -2 Z`, { fill: bg })];
        const x = c.sq ? m : W * 0.38, mw = W - x - m, ty = c.sq ? 20 : m + 4.4;
        o.push(T(f.name, { field: 'name', x, y: ty, oy: 'bottom', size: 3.8, font: 'd', w: 700, color: bg, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x, y: ty + 1.2, size: 1.9, font: 't', w: 500, color: mix(bg, acc, 0.3), fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: bg, fit: mw, size: 1.8, lh: 2.75, weight: 500 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ WORDMARK – oválny odznak s menom firmy
    wordmark: {
      name: 'Wordmark', fonts: 'gloock', pal: 'piesok', tags: ['firma', 'gastro', 'kaviaren', 'restauracia', 'obchod', 'pekaren', 'vino', 'kvety', 'butik', 'salon', 'remeslo', 'elegantne', 'tradicne', 'firemne', 'prirodne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#EFE6D8', ink = dark(pal.ink) ? pal.ink : '#2A2119', acc = pal.accent;
        const cx = W / 2, cy = H / 2, rx = c.sq ? 21 : 33, ry = c.sq ? 17 : 17.5;
        const o = [paper(c, 0.5)];
        o.push(P(oval(cx, cy, rx, ry), { stroke: acc, sw: 0.32 }), P(oval(cx, cy, rx - 1.2, ry - 1.2), { stroke: acc, sw: 0.1 }));
        o.push(emblem(c, cx, cy - ry * 0.56, 4.6, acc));
        o.push(logoOr(c, cx, cy, rx * 1.3, ry * 0.7, {}, T(brand(c), { field: 'company', x: cx, y: cy + 0.6, ox: 'center', oy: 'center', size: c.sq ? 5 : 6.6, font: 'd', color: ink, fit: rx * 2 - 10, ls: -0.01 })));
        o.push(T(f.tagline || '', { field: 'tagline', x: cx, y: cy + ry * 0.4, ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: mix(ink, bg, 0.3), fit: rx * 1.4 }));
        o.push(T('— ' + (city(c) || 'EST.').toLocaleUpperCase() + ' —', { field: 'address', x: cx, y: cy + ry * 0.72, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.3, color: acc, fit: rx }));
        if (!c.sq) for (const sx of [-1, 1]) o.push(T('✦', { x: cx + sx * (rx + 4), y: cy, ox: 'center', oy: 'center', size: 2.4, font: 't', color: acc }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const so = light(pal.soft) ? pal.soft : '#E1D4C0', ink = dark(pal.ink) ? pal.ink : '#2A2119', acc = pal.accent;
        const o = [paper(c, 0.5)];
        if (c.sq) {
          o.push(emblem(c, W / 2, m + 4, 5, acc));
          o.push(T(f.name, { field: 'name', x: W / 2, y: 22, ox: 'center', oy: 'center', size: 3.4, font: 'd', color: ink, fit: W - 2 * m }));
          o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: 25.8, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.2, color: acc, fit: W - 2 * m }));
          o.push(...centerLines(c, W / 2, H - m, { color: ink, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          const dx = W * 0.46;
          o.push(emblem(c, m + 3, m + 3, 5, acc));
          o.push(T(f.name, { field: 'name', x: m, y: H * 0.62, oy: 'bottom', size: 4, font: 'd', color: ink, fit: dx - m - 4 }));
          o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: H * 0.62 + 1.2, size: 1.7, font: 't', w: 600, ls: 0.18, color: acc, fit: dx - m - 4 }));
          o.push(Ln(dx, m, dx, H - m, acc, 0.14), C(dx, m, 0.4, { fill: acc }), C(dx, H - m, 0.4, { fill: acc }));
          o.push(...iconRows(c, ['phone', 'email', 'web', 'address'], { x: dx + 4.5, y: H / 2 - 4.8, lh: 3.2, r: 1.1, circle: acc, icon: so, color: ink, size: 1.85, fit: W - dx - 4.5 - m - 4 }));
        }
        return { bg: { color: so }, objs: o };
      },
    },

    // ------------------------------------------------------------ EDITORIAL – obálka magazínu
    editorial: {
      name: 'Editorial', fonts: 'instrument', pal: 'krieda', tags: ['architekt', 'dizajn', 'kreativ', 'foto', 'poradenstvo', 'kouc', 'terapeut', 'elegantne', 'jemne', 'osobne', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F5F2EC', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent;
        const [fn, ln] = splitName(f.name);
        const o = [paper(c, 0.45)];
        o.push(T((f.company || city(c) || '').toLocaleUpperCase(), { field: 'company', x: m, y: m, size: 1.7, font: 't', w: 600, ls: 0.26, color: ink, fit: W * 0.5 }));
        o.push(T('N° 01', { x: W - m, y: m, ox: 'right', size: 1.7, font: 't', w: 600, ls: 0.2, color: acc }));
        o.push(Ln(m, m + 3.2, W - m, m + 3.2, ink, 0.12));
        if (!c.sq) {
          const pw = 22, px = W - m - pw, top = m + 6.5, base = H - m;
          o.push(P(arch(px, base, pw, top), { fill: { grad: [mix(acc, bg, 0.15), mix(acc, '#F4C9A8', 0.55)], angle: 70 } }));
          o.push(C(px + pw * 0.62, top + pw * 0.55, pw * 0.2, { fill: '#FFF3E6', opacity: 0.85 }));
        }
        const mw = c.sq ? W - 2 * m : W - 2 * m - 26, sz = c.sq ? 6.6 : 8.2, base = c.sq ? H * 0.56 : H * 0.6;
        o.push(T(fn || f.name, { field: 'name', part: 0, x: m - 0.4, y: base, oy: 'bottom', size: sz, font: 'd', color: ink, fit: mw, ls: -0.02, lh: 0.9 }));
        if (ln) o.push(T(ln, { field: 'name', part: 1, x: m - 0.4, y: base + 0.2, size: sz, font: 'd', it: true, color: acc, fit: mw, ls: -0.02, lh: 0.9 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: m, y: H - m, oy: 'bottom', size: 1.7, font: 't', w: 600, ls: 0.24, color: ink, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, fg = '#FFF6EE';
        const txt = f.tagline || brand(c);
        return { bg: { color: acc }, objs: [
          paper(c, 0.3),
          T('“', { x: m - 1.5, y: m - 3.5, size: 18, font: 'd', color: fg, opacity: 0.5 }),
          T(txt, { field: f.tagline ? 'tagline' : 'company', x: m, y: H * 0.56, oy: 'bottom', size: c.sq ? 4.8 : 5.8, font: 'd', it: true, color: fg, fit: W - 2 * m, ls: -0.01 }),
          ...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: fg, fit: W - 2 * m, size: 1.8, lh: 2.75 }),
        ] };
      },
    },

    // ------------------------------------------------------------ LINKA – kresba jednou čiarou (kvet)
    linka: {
      name: tr('Linka', 'Linka'), fonts: 'instrument', pal: 'krieda', tags: ['dizajn', 'kreativ', 'umelec', 'architekt', 'kaviaren', 'terapeut', 'kouc', 'jemne', 'hrave', 'minimal', 'osobne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F5F2EC', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent;
        // líniová kresba: stonka s listami ako obrysy a púčik
        const s = c.sq ? 0.72 : 1, bx = c.sq ? W / 2 : W * 0.73, by = c.sq ? H * 0.6 : H + 1, top = c.sq ? 5 : 6;
        const o = [paper(c, 0.4)];
        o.push(C(bx + 3 * s, top + 7 * s, 7.5 * s, { fill: mix(acc, bg, 0.84) }));
        const st = [[bx - 1, by], [bx + 1.5 * s, by - 10 * s], [bx - 1 * s, by - 22 * s], [bx + 2.5 * s, by - 33 * s], [bx + 1 * s, top + 4 * s]];
        o.push(P(smooth(st), { stroke: ink, sw: 0.26 }));
        const lf = (x, y, a, L, w) => { o.push(P(leaf(x, y, rad(a), L * s, w * s), { stroke: ink, sw: 0.22 })); o.push(Ln(x, y, x + Math.cos(rad(a)) * L * s * 0.8, y + Math.sin(rad(a)) * L * s * 0.8, ink, 0.12)); };
        lf(bx + 1.2 * s, by - 8 * s, -150, 11, 2.6); lf(bx + 0.6 * s, by - 15 * s, -28, 12, 2.8); lf(bx - 0.6 * s, by - 23 * s, -160, 9, 2.2); lf(bx + 1.6 * s, by - 29 * s, -20, 8, 2); lf(bx + 2 * s, by - 35 * s, -140, 6, 1.6);
        o.push(P(oval(bx + 1 * s, top + 2.4 * s, 1.6 * s, 2.4 * s, 0.2), { stroke: ink, sw: 0.24 }), C(bx + 1 * s, top + 2.6 * s, 0.75 * s, { fill: acc }));
        if (!c.sq) o.push(Ln(bx - 12, by - 1, bx + 12, by - 1, ink, 0.14));
        if (c.sq) {
          o.push(T(f.name, { field: 'name', x: W / 2, y: H * 0.78, ox: 'center', oy: 'bottom', size: 4, font: 'd', color: ink, fit: W - 2 * m }));
          o.push(T(f.role, { field: 'role', x: W / 2, y: H * 0.78 + 0.8, ox: 'center', size: 2.1, font: 'd', it: true, color: acc, fit: W - 2 * m }));
        } else {
          const mw = W * 0.5;
          o.push(T(f.name, { field: 'name', x: m, y: H * 0.46, oy: 'bottom', size: 5, font: 'd', color: ink, fit: mw, ls: -0.01 }));
          o.push(T(f.role, { field: 'role', x: m, y: H * 0.46 + 0.8, size: 2.3, font: 'd', it: true, color: acc, fit: mw }));
          o.push(...rows(c, { x: m, yb: H - m, color: mix(ink, bg, 0.25), fit: mw, size: 1.8, lh: 2.75 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, fg = '#FFF6EE';
        const rnd = seeded(f.name + 'b'); const pts = [[-4, H * 0.66]]; for (let i = 1; i < 7; i++) pts.push([W * (i / 7) + (rnd() - 0.5) * 5, H * (0.5 + (i % 2 ? -0.12 : 0.1))]); pts.push([W + 4, H * 0.4]);
        return { bg: { color: acc }, objs: [
          paper(c, 0.3),
          P(smooth(pts), { stroke: fg, sw: 0.3, opacity: 0.8 }),
          T(brand(c), { field: 'company', x: m, y: m + 5, oy: 'bottom', size: c.sq ? 4 : 5, font: 'd', it: true, color: fg, fit: W - 2 * m }),
          T((f.web || '').toLocaleUpperCase(), { field: 'web', x: W - m, y: H - m, ox: 'right', oy: 'bottom', size: 1.7, font: 't', w: 600, ls: 0.26, color: fg, fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ FOTOGRAFIA – hľadáčik nad vlastnou fotkou
    foto: {
      name: tr('Fotografia', 'Fotografie'), fonts: 'tenor', pal: 'sneh', emblem: 'aperture', tags: ['foto', 'kameraman', 'umelec', 'svadba', 'cestovanie', 'reality', 'architekt', 'moderne', 'elegantne', 'minimal'],
      front(c) {
        const { W, H, f, pal, m } = c; const ink = '#161616', bg = '#F7F5F1', acc = pal.accent, wh = '#FFFFFF';
        const pw = c.sq ? W : W * 0.54, px = W - pw, ph = c.sq ? H * 0.58 : H;
        const o = [IMG(c.photo || c.scene('tien'), px - (c.sq ? 2 : 0), -2, pw + 2 + (c.sq ? 2 : 0), ph + 2 + (c.sq ? 0 : 2), { role: 'photo' })];
        o.push(R(px - (c.sq ? 2 : 0), -2, pw + 4, ph + (c.sq ? 2 : 4), { grad: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)'], angle: 90 }));
        const fx0 = px + 4, fy0 = 4, fx1 = W - 4, fy1 = ph - 4, k = 2.6;
        for (const [x, y, sx, sy] of [[fx0, fy0, 1, 1], [fx1, fy0, -1, 1], [fx0, fy1, 1, -1], [fx1, fy1, -1, -1]]) o.push(P(`M ${f2(x)} ${f2(y + sy * k)} L ${f2(x)} ${f2(y)} L ${f2(x + sx * k)} ${f2(y)}`, { stroke: wh, sw: 0.22 }));
        const cx = (fx0 + fx1) / 2, cy = (fy0 + fy1) / 2;
        o.push(R(cx - 2.4, cy - 1.8, 4.8, 3.6, null, { stroke: wh, sw: 0.14 }), Ln(cx - 0.6, cy, cx + 0.6, cy, wh, 0.12), Ln(cx, cy - 0.6, cx, cy + 0.6, wh, 0.12));
        o.push(C(fx0 + 1.4, fy0 + 3.6, 0.55, { fill: '#FF3B30' }), T('REC', { x: fx0 + 2.6, y: fy0 + 3.6, oy: 'center', size: 1.7, font: 'm', color: wh }));
        o.push(T('ISO 200   1/250   f2.8', { x: cx, y: fy1 - 0.4, ox: 'center', oy: 'bottom', size: 1.7, font: 'm', color: wh, opacity: 0.9 }));
        if (c.sq) {
          o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: ph + 6.5, ox: 'center', oy: 'center', size: 2.6, font: 'd', ls: 0.2, color: ink, fit: W - 2 * m }));
          o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: ph + 10, ox: 'center', oy: 'center', size: 1.7, font: 't', ls: 0.3, color: '#777', fit: W - 2 * m }));
          o.push(T(f.web || '', { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.8, font: 't', color: ink, fit: W - 2 * m }));
          return { bg: { color: bg }, objs: o };
        }
        const lx = px / 2, mw = px - 2 * m;
        o.push(emblem(c, lx, H * 0.27, 6, ink));
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: lx, y: H * 0.56, ox: 'center', oy: 'bottom', size: 2.8, font: 'd', ls: 0.18, color: ink, fit: mw }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: lx, y: H * 0.56 + 1.4, ox: 'center', size: 1.7, font: 't', w: 500, ls: 0.3, color: acc, fit: mw }));
        o.push(T(f.web || '', { field: 'web', x: lx, y: H - m, ox: 'center', oy: 'bottom', size: 1.8, font: 't', color: '#555', fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = '#161616', wh = '#F7F5F1', qs = c.sq ? 15 : 15;
        const o = [];
        // filmový pás hore a dole
        for (const y0 of [-2, H - 3.2]) { o.push(R(-2, y0, W + 4, 5.2, ink)); for (let x = 1.2; x < W; x += 3.4) o.push(R(x, y0 + (y0 < 0 ? 2.6 : 1.4), 1.8, 1.2, wh, { rx: 0.3 })); }
        const qx = c.sq ? W / 2 - qs / 2 : m + 1, qy = c.sq ? 6.5 : (H - qs) / 2;
        o.push(R(qx - 1, qy - 1, qs + 2, qs + 2, '#FFFFFF', { rx: 0.6 }), { type: 'qr', x: qx, y: qy, s: qs, color: ink });
        const x = c.sq ? m : qx + qs + 6, mw = W - x - m;
        if (!c.sq) o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x, y: H * 0.34, oy: 'bottom', size: 2.4, font: 'd', ls: 0.16, color: ink, fit: mw }));
        o.push(...contacts(c, { x, yb: c.sq ? H - 5 : H * 0.34 + 13.5, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], size: 1.8, lh: 2.75, icons: true, lcolor: ink, color: ink, fit: mw }));
        return { bg: { color: wh }, objs: o };
      },
    },

    // ------------------------------------------------------------ GALÉRIA – obrazy v rámoch na stene
    galeria: {
      name: tr('Galéria', 'Galerie'), fonts: 'italiana', pal: 'krieda', tags: ['foto', 'umelec', 'galeria', 'architekt', 'dizajn', 'svadba', 'interier', 'butik', 'elegantne', 'minimal', 'luxusne', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? pal.bg : '#F2EEE6', ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent, gold = MET(pal);
        const o = [paper(c, 0.45)];
        const rail = 3.2; o.push(Ln(-2, rail, W + 2, rail, ink, 0.18));
        const frame = (x, y, w, h, art) => {
          o.push(Ln(x + w / 2, rail, x + w * 0.2, y, ink, 0.08), Ln(x + w / 2, rail, x + w * 0.8, y, ink, 0.08));
          o.push(R(x + 0.5, y + 0.8, w, h, '#000000', { opacity: 0.12 }), R(x, y, w, h, ink), R(x + 0.7, y + 0.7, w - 1.4, h - 1.4, '#FBF9F4'));
          const ix = x + w * 0.2, iy = y + h * 0.2, iw = w * 0.6, ih = h * 0.6; o.push(R(ix, iy, iw, ih, mix(acc, bg, 0.88)));
          art(ix, iy, iw, ih);
        };
        const sc = c.sq ? 0.8 : 1, cx = W / 2;
        frame(cx - 21 * sc, 9, 12 * sc, 16 * sc, (x, y, w, h) => { o.push(P(arch(x + w * 0.2, y + h, w * 0.6, y + h * 0.25), { fill: acc })); o.push(C(x + w * 0.5, y + h * 0.3, w * 0.12, { fill: '#F4D9A6' })); });
        frame(cx - 6 * sc, 7.5, 12 * sc, 12 * sc, (x, y, w, h) => { o.push(C(x + w / 2, y + h / 2, w * 0.3, { fill: mix(acc, ink, 0.5) })); o.push(C(x + w * 0.62, y + h * 0.4, w * 0.18, { fill: '#F4D9A6', opacity: 0.9 })); });
        frame(cx + 9 * sc, 10, 14 * sc, 10 * sc, (x, y, w, h) => { o.push(P(`M ${f2(x)} ${f2(y + h)} L ${f2(x)} ${f2(y + h * 0.6)} Q ${f2(x + w * 0.3)} ${f2(y + h * 0.2)} ${f2(x + w * 0.55)} ${f2(y + h * 0.55)} Q ${f2(x + w * 0.8)} ${f2(y + h * 0.3)} ${f2(x + w)} ${f2(y + h * 0.5)} L ${f2(x + w)} ${f2(y + h)} Z`, { fill: mix(acc, ink, 0.25) })); });
        const ny = c.sq ? H * 0.72 : H * 0.76;
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: ny, ox: 'center', oy: 'center', size: c.sq ? 2.8 : 3.4, font: 'd', ls: 0.26, color: ink, fit: W - 2 * m }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: ny + 3.6, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.3, color: gold, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const wall = dark(pal.ink) ? mix(pal.ink, pal.accent, 0.15) : '#2A2622', ink = '#1A1A18', pl = '#F7F3EA', gold = MET(pal);
        const pw = c.sq ? W - 12 : W - 22, ph = c.sq ? H - 14 : H - 16, px = (W - pw) / 2, py = (H - ph) / 2;
        return { bg: { color: wall }, objs: [
          R(px + 0.6, py + 1, pw, ph, '#000000', { opacity: 0.35 }), R(px, py, pw, ph, pl), R(px + 1, py + 1, pw - 2, ph - 2, null, { stroke: gold, sw: 0.12 }),
          C(px + 2.2, py + 2.2, 0.35, { fill: gold }), C(px + pw - 2.2, py + 2.2, 0.35, { fill: gold }), C(px + 2.2, py + ph - 2.2, 0.35, { fill: gold }), C(px + pw - 2.2, py + ph - 2.2, 0.35, { fill: gold }),
          T(brand(c), { field: 'company', x: W / 2, y: py + 5.4, ox: 'center', oy: 'center', size: 3, font: 'd', ls: 0.1, color: ink, fit: pw - 8 }),
          T(f.tagline || '', { field: 'tagline', x: W / 2, y: py + 8.6, ox: 'center', oy: 'center', size: 1.7, font: 't', it: true, color: '#6B6560', fit: pw - 8 }),
          ...centerLines(c, W / 2, py + ph - 3.2, { color: ink, fit: pw - 8, size: 1.75, lh: 2.6 }),
        ] };
      },
    },

    // ------------------------------------------------------------ SWISS – mriežka, blok a obrovská iniciála
    swiss: {
      name: 'Swiss', fonts: 'inter', pal: 'sneh', tags: ['it', 'firma', 'uctovnictvo', 'financie', 'architekt', 'dizajn', 'marketing', 'startup', 'moderne', 'ciste', 'serioze', 'minimal', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? mix(pal.bg, '#F2F0EB', 0.5) : '#F4F2EE', ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent;
        const o = [];
        for (let i = 1; i < 4; i++) o.push(Ln(W * i / 4, -2, W * i / 4, H + 2, ink, 0.06, { opacity: 0.35 }));
        const bw = c.sq ? W * 0.5 : W * 0.25, bh = c.sq ? H * 0.42 : H * 0.62;
        o.push(R(W - bw, -2, bw + 2, bh + 2, acc));
        o.push(T(mono(c).slice(0, 1).toLocaleLowerCase(), { x: W - bw + 1, y: bh + 3.2, oy: 'bottom', size: bh * 1.15, font: 'd', w: 700, color: '#FFFFFF', ls: -0.05 }));
        const mw = W - bw - 2 * m;
        o.push(T(f.name, { field: 'name', x: m - 0.3, y: m - 0.6, size: c.sq ? 3.6 : 5, font: 'd', w: 700, color: ink, fit: c.sq ? mw : mw + 4, ls: -0.035 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + (c.sq ? 4.4 : 6), size: 2.1, font: 't', w: 500, color: acc, fit: mw }));
        if (c.sq) o.push(...rows(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], labels: true, color: ink, fit: W - 2 * m, size: 1.8, lh: 2.75 }));
        else { const ks = ['phone', 'email', 'web', 'address'].filter((k) => has(c, k)); o.push(...rows(c, { x: m, yb: H - m, keys: ks.slice(0, 2), labels: true, color: ink, fit: W / 2 - m - 2, size: 1.8, lh: 2.75 }), ...rows(c, { x: W / 2 + 0.5, yb: H - m, keys: ks.slice(2), labels: true, color: ink, fit: W / 2 - m - 1, size: 1.8, lh: 2.75 })); }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent, wh = '#FFFFFF';
        return { bg: { color: ink }, objs: [
          C(W * 0.82, H * 0.3, c.sq ? 18 : 22, { fill: acc }),
          logoOr(c, m, m, 26, 12, { ax: 'left', ay: 'top', tint: wh }, null),
          T(brand(c), { field: 'company', x: m - 0.3, y: H - m - 3, oy: 'bottom', size: c.sq ? 4.4 : 5.6, font: 'd', w: 700, color: wh, fit: W - 2 * m, ls: -0.035 }),
          T((f.web || '').toLocaleLowerCase(), { field: 'web', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', w: 500, color: mix(wh, ink, 0.3), fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ TVARY – vystrihované tvary (Matisse)
    tvary: {
      name: 'Tvary', fonts: 'grotesk', pal: 'sneh', tags: ['kreativ', 'dizajn', 'marketing', 'agentura', 'hudba', 'event', 'foto', 'odvazne', 'moderne', 'hrave'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? mix(pal.bg, '#F6EFE4', 0.7) : '#F6EFE4', ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent;
        const blue = '#2F5D8C', mus = '#E5AE2E', r = seeded(brand(c) + 'mt');
        const o = [paper(c, 0.4)];
        o.push(P(blobPath(-3, H * 0.95, H * 0.52, r, 8), { fill: blue }));
        o.push(P(leaf(-2, H * 0.62, rad(-28), c.sq ? 22 : 28, c.sq ? 6 : 8), { fill: acc }));
        o.push(P(leaf(W * 0.08, H + 2, rad(-62), c.sq ? 14 : 18, 4), { fill: ink }));
        o.push(C(W * 0.2, H * 0.16, c.sq ? 4 : 5, { fill: mus }));
        if (!c.sq) o.push(P(blobPath(W + 3, -2, 9, r, 6), { fill: mix(acc, '#F6EFE4', 0.45) }), C(W * 0.9, H * 0.84, 1.4, { fill: blue }));
        for (let i = 0; i < 4; i++) o.push(C(W * 0.46 + i * 3, H * 0.66, 0.9, { fill: ink }));
        const x = W - m, mw = c.sq ? W * 0.6 : W * 0.5;
        o.push(T(f.name, { field: 'name', x, y: H * 0.46, ox: 'right', oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', w: 600, color: ink, fit: mw, ls: -0.02 }));
        o.push(T((f.role || '').toLocaleUpperCase(), { field: 'role', x, y: H * 0.46 + 1, ox: 'right', size: 1.7, font: 't', w: 500, ls: 0.22, color: acc, fit: mw }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent, wh = '#F6EFE4', r = seeded(brand(c) + 'tb');
        return { bg: { color: ink }, objs: [
          P(blobPath(W + 2, H * 0.15, H * 0.42, r), { fill: acc }), P(blobPath(W * 0.72, H + 5, H * 0.3, r), { fill: '#2F5D8C' }), C(W * 0.62, H * 0.24, 1.6, { fill: '#E5AE2E' }),
          T(brand(c), { field: 'company', x: m, y: m + 4.4, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', w: 600, color: wh, fit: W * 0.55, ls: -0.02 }),
          ...rows(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web', 'address'], color: wh, fit: W * 0.55, size: 1.8, lh: 2.75 }),
        ] };
      },
    },

    // ------------------------------------------------------------ STOH – ozvena názvu (obrysy)
    stoh: {
      name: tr('Stoh', 'Stoh'), fonts: 'josefin', pal: 'cervena', tags: ['marketing', 'agentura', 'moda', 'butik', 'kreativ', 'event', 'hudba', 'odvazne', 'moderne', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#7A1C1C', cr = light(pal.ink) ? pal.ink : '#F9DCD3', acc = pal.accent;
        const word = brand(c).toLocaleUpperCase(), n = c.sq ? 7 : 5, lh = (H + 4) / n, sz = lh * 0.92;
        const o = [];
        for (let i = 0; i < n; i++) {
          const y = -2 + lh * (i + 0.5), mid = i === Math.floor(n / 2);
          o.push(T(word, { field: mid ? 'company' : undefined, x: W / 2, y, ox: 'center', oy: 'center', size: sz, font: 'd', w: 700, ls: 0.02, color: mid ? cr : 'none', stroke: mid ? null : mix(cr, bg, 0.45), sw: 0.12, fit: W + (mid ? -2 * m : 30) }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const red = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#7A1C1C', cr = '#FBF0EA', acc = pal.accent;
        const o = [paper(c, 0.45)];
        for (let i = 0; i < 4; i++) o.push(R(W - m - 14 + i * 3.6, m, 2.4, H - 2 * m, i % 2 ? acc : red, { opacity: 1 - i * 0.18 }));
        const mw = c.sq ? W - 2 * m - 16 : W * 0.6;
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.6, font: 'd', w: 700, ls: 0.04, color: red, fit: mw }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 5.2, size: 1.9, font: 't', w: 600, color: acc, fit: mw }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: '#2A1414', fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ VRSTEVNICE – mapa s miestom
    vrstevnice: {
      name: tr('Vrstevnice', 'Vrstevnice'), fonts: 'inter', pal: 'smaragd', tags: ['architekt', 'stavba', 'reality', 'outdoor', 'turistika', 'firma', 'konzultant', 'eko', 'prirodne', 'serioze', 'moderne', 'ciste'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#0F3B2E', fg = light(pal.ink) ? pal.ink : '#F3EFE4', acc = pal.accent;
        const px = c.sq ? W * 0.62 : W * 0.72, py = H * 0.38;
        const o = [];
        topoPaths(px, py + 1, 16, 2.4, seeded(brand(c) + 'v')).forEach((d, i) => o.push(P(d, { stroke: mix(acc, bg, i % 4 === 0 ? 0.1 : 0.45), sw: i % 4 === 0 ? 0.2 : 0.11 })));
        topoPaths(W * 0.08, H * 1.02, 6, 3, seeded(brand(c) + 'w')).forEach((d) => o.push(P(d, { stroke: mix(acc, bg, 0.55), sw: 0.1 })));
        o.push(P(`M ${f2(px)} ${f2(py + 3)} C ${f2(px - 1.2)} ${f2(py + 1.4)} ${f2(px - 2.6)} ${f2(py - 0.2)} ${f2(px - 2.6)} ${f2(py - 2)} C ${f2(px - 2.6)} ${f2(py - 3.6)} ${f2(px - 1.4)} ${f2(py - 4.8)} ${f2(px)} ${f2(py - 4.8)} C ${f2(px + 1.4)} ${f2(py - 4.8)} ${f2(px + 2.6)} ${f2(py - 3.6)} ${f2(px + 2.6)} ${f2(py - 2)} C ${f2(px + 2.6)} ${f2(py - 0.2)} ${f2(px + 1.2)} ${f2(py + 1.4)} ${f2(px)} ${f2(py + 3)} Z`, { fill: acc }), C(px, py - 2, 0.9, { fill: bg }));
        o.push(T('1 248 m', { x: px + 3.4, y: py - 2, oy: 'center', size: 1.7, font: 'm', color: acc }));
        o.push(T(brand(c), { field: 'company', x: m, y: H - m - 3.2, oy: 'bottom', size: c.sq ? 4.4 : 5.6, font: 'd', w: 700, color: fg, fit: W * 0.72, ls: -0.04 }));
        o.push(T('48.1486° N · 17.1077° E', { x: m, y: H - m, oy: 'bottom', size: 1.7, font: 'm', color: mix(fg, bg, 0.35) }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const gr = dark(pal.bg) ? pal.bg : '#0F3B2E', wh = '#F7F5EF', acc = pal.accent;
        return { bg: { color: wh }, objs: [
          paper(c, 0.4),
          ...topoPaths(W * 0.95, H * 0.05, 9, 2.6, seeded(f.name + 'w')).map((d) => P(d, { stroke: mix(gr, wh, 0.82), sw: 0.12 })),
          T(f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.8, font: 'd', w: 700, color: gr, fit: W * 0.6, ls: -0.02 }),
          T(f.role, { field: 'role', x: m, y: m + 5.2, size: 1.9, font: 't', color: mix(gr, wh, 0.3), fit: W * 0.6 }),
          ...rows(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web', 'address'], icons: true, lcolor: acc, color: gr, fit: W - 2 * m, size: 1.8, lh: 2.75 }),
        ] };
      },
    },

    // ------------------------------------------------------------ MORTON – monogramový vzor a zlatý štítok
    morton: {
      name: 'Morton', fonts: 'josefin', pal: 'smaragd', tags: ['architekt', 'stavba', 'reality', 'firma', 'financie', 'konzultant', 'pravnik', 'luxusne', 'serioze', 'tmave', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) ? pal.bg : '#0F3B2E', g = pal.foil ? FOIL(pal) : 'foil:gold', mk = mono(c), tone = mix(bg, '#FFFFFF', 0.08);
        const o = [];
        for (let r = 0, y = 1; y < H + 4; r++, y += 5) for (let x = (r % 2 ? 4 : -1); x < W + 6; x += 10) o.push(T(mk, { x, y, ox: 'center', oy: 'center', size: 2.6, font: 'd', w: 600, ls: 0.1, color: tone }));
        const pw = c.sq ? W - 14 : 46, ph = c.sq ? 24 : 22, px = (W - pw) / 2, py = (H - ph) / 2;
        o.push(R(px, py, pw, ph, bg), R(px, py, pw, ph, null, { stroke: g, sw: 0.25 }), R(px + 1, py + 1, pw - 2, ph - 2, null, { stroke: g, sw: 0.08 }));
        o.push(logoOr(c, W / 2, py + 7, 10, 7, { tint: g }, MONO(c, { x: W / 2, y: py + 7, ox: 'center', oy: 'center', size: 6, w: 400, ls: 0.1, color: g })));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: py + 14.2, ox: 'center', oy: 'center', size: 2.3, font: 'd', w: 600, ls: 0.3, color: '#F3EFE4', fit: pw - 6 }));
        o.push(T((f.tagline || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: py + 17.6, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 400, ls: 0.2, color: mix('#F3EFE4', bg, 0.35), fit: pw - 6 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const gr = dark(pal.bg) ? pal.bg : '#0F3B2E', cr = '#F4F0E6', met = pal.foil ? MET(pal) : '#B8924A';
        const o = [paper(c, 0.45), R(-2, H - 3.2, W + 4, 5.2, gr), R(-2, H - 3.8, W + 4, 0.3, met)];
        o.push(T(f.name.toLocaleUpperCase(), { field: 'name', x: m, y: m + 3.6, oy: 'bottom', size: 3, font: 'd', w: 600, ls: 0.12, color: gr, fit: W - 2 * m }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 4.8, size: 1.9, font: 't', color: met, fit: W - 2 * m }));
        o.push(...rows(c, { x: m, yb: H - 7, keys: c.sq ? ['phone', 'email', 'web'] : ['phone', 'email', 'web', 'address'], labels: true, lcolor: met, color: gr, fit: W - 2 * m, size: 1.8, lh: 2.75 }));
        return { bg: { color: cr }, objs: o };
      },
    },

    // ------------------------------------------------------------ PÍSMENÁ – farebné dlaždice s písmenami
    pismena: {
      name: tr('Písmená', 'Písmena'), fonts: 'unbounded', pal: 'pastel', tags: ['kreativ', 'deti', 'skola', 'cukraren', 'kaviaren', 'marketing', 'event', 'hudba', 'hrave', 'farebne', 'odvazne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = dark(pal.ink) ? pal.ink : '#1E1B3A', acc = pal.accent;
        const word = (f.company && f.company.replace(/\s+/g, '').length <= 9 ? f.company : (first(c) || f.name || '')).replace(/\s+/g, '').slice(0, 9);
        const cols = [acc, ink, '#2F6BFF', '#18A058', '#F2B705', '#FFFFFF'];
        const n = word.length, rowsN = n > 5 ? 2 : 1, per = Math.ceil(n / rowsN), r = seeded(word);
        const ts = Math.min((W - 2 * m) / (per * 1.08), (H - 2 * m - (rowsN - 1) * 2) / (rowsN * 1.08));
        const o = [];
        for (let i = 0; i < n; i++) {
          const ri = Math.floor(i / per), ci = i % per, cnt = Math.min(per, n - ri * per);
          const x = W / 2 + (ci - (cnt - 1) / 2) * ts * 1.08, y = H / 2 + (ri - (rowsN - 1) / 2) * ts * 1.1;
          const col = cols[i % cols.length], fg = col === '#FFFFFF' || col === '#F2B705' ? ink : '#FFFFFF', rot = (r() - 0.5) * 14;
          o.push(i % 3 === 1 ? C(x, y, ts * 0.5, { fill: col }) : R(x - ts / 2, y - ts / 2, ts, ts, col, { rx: ts * 0.22, rot }));
          o.push(T(word[i].toLocaleLowerCase(), { x, y: y - ts * 0.04, ox: 'center', oy: 'center', size: ts * 0.62, font: 'd', w: 700, color: fg, rot: rot * 0.6 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1E1B3A', acc = pal.accent, cols = [acc, '#2F6BFF', '#18A058', '#F2B705', pal.bg];
        const o = cols.map((col, i) => C(W - m - 2 - i * 3.4, m + 2, 1.3, { fill: col }));
        o.push(T(f.name, { field: 'name', x: m, y: H * 0.46, oy: 'bottom', size: 4, font: 'd', w: 600, color: ink, fit: W - 2 * m, ls: -0.03 }));
        o.push(T(f.role, { field: 'role', x: m, y: H * 0.46 + 1, size: 2, font: 't', w: 600, color: acc, fit: W - 2 * m }));
        o.push(...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: ink, fit: W - 2 * m, size: 1.85, lh: 2.8, weight: 500 }));
        return { bg: { color: '#FFFDF9' }, objs: o };
      },
    },

    // ------------------------------------------------------------ AHOJ – bublina a konfety
    ahoj: {
      name: tr('Ahoj', 'Ahoj'), fonts: 'abril', pal: 'pastel', tags: ['deti', 'kreativ', 'marketing', 'terapeut', 'skola', 'cukraren', 'kaviaren', 'hrave', 'farebne', 'mlade', 'odvazne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = inkOn(bg, pal, '#1E1B3A'), acc = pal.accent;
        const bw = c.sq ? W - 12 : W * 0.56, bh = c.sq ? 22 : 24, bx = c.sq ? 6 : m, by = c.sq ? 7 : (H - bh) / 2 - 2;
        const o = [];
        const r = seeded(brand(c) + 'ah');
        for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H; if (x > bx - 2 && x < bx + bw + 2 && y > by - 2 && y < by + bh + 6) continue; const col = [acc, '#2F6BFF', '#F2B705', ink][i % 4]; if (i % 3 === 0) o.push(P(`M ${f2(x)} ${f2(y)} l 1 -1 l 1 1 l 1 -1 l 1 1`, { stroke: col, sw: 0.35 })); else if (i % 3 === 1) o.push(C(x, y, 0.7, { fill: col })); else o.push(R(x, y, 1.3, 1.3, col, { rot: r() * 60 })); }
        o.push(R(bx + 0.8, by + 1, bw, bh, ink, { rx: 5 }), P(`M ${f2(bx + 7.8)} ${f2(by + bh + 0.8)} L ${f2(bx + 6.8)} ${f2(by + bh + 6)} L ${f2(bx + 13.8)} ${f2(by + bh + 0.8)} Z`, { fill: ink }));
        o.push(R(bx, by, bw, bh, acc, { rx: 5 }), P(`M ${f2(bx + 7)} ${f2(by + bh - 0.2)} L ${f2(bx + 6)} ${f2(by + bh + 5)} L ${f2(bx + 13)} ${f2(by + bh - 0.2)} Z`, { fill: acc }));
        o.push(T(tr('Ahoj!', 'Ahoj!'), { x: bx + bw / 2, y: by + bh / 2 + 0.5, ox: 'center', oy: 'center', size: c.sq ? 11 : 13, font: 'd', color: '#FFFFFF', fit: bw - 6 }));
        if (!c.sq) {
          const x = bx + bw + 5, mw = W - x - m;
          o.push(T(first(c), { field: 'name', part: 0, x, y: H * 0.5, oy: 'bottom', size: 4.4, font: 'd', color: ink, fit: mw }));
          o.push(T(f.role, { field: 'role', x, y: H * 0.5 + 1, size: 1.9, font: 't', w: 500, color: ink, fit: mw }));
        } else o.push(T(f.name, { field: 'name', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 3, font: 'd', color: ink, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const so = light(pal.soft) ? pal.soft : '#FFE3EC', ink = dark(pal.ink) ? pal.ink : '#1E1B3A', acc = pal.accent;
        return { bg: { color: so }, objs: [
          R(W - m - 12, m, 12, 8, acc, { rx: 2.4 }), P(`M ${f2(W - m - 3)} ${f2(m + 7.8)} L ${f2(W - m - 2)} ${f2(m + 11)} L ${f2(W - m - 6)} ${f2(m + 7.8)} Z`, { fill: acc }),
          T('hi!', { x: W - m - 6, y: m + 4.1, ox: 'center', oy: 'center', size: 3.6, font: 'd', color: '#FFFFFF' }),
          T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4, font: 'd', color: ink, fit: W - 2 * m - 16 }),
          T(brand(c), { field: 'company', x: m, y: m + 6.2, size: 1.9, font: 't', w: 600, color: acc, fit: W - 2 * m - 16 }),
          ...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: ink, fit: W - 2 * m, size: 1.85, lh: 2.8, weight: 500 }),
        ] };
      },
    },

    // ------------------------------------------------------------ CROP – orezané obrie meno s tieňom
    crop: {
      name: 'Crop', fonts: 'syne', pal: 'koral', tags: ['kreativ', 'marketing', 'foto', 'hudba', 'event', 'sport', 'fitness', 'barber', 'odvazne', 'hrave', 'moderne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, fg = '#FFFFFF', ink = dark(pal.ink) ? pal.ink : '#1D1A19';
        const word = (first(c) || f.name || brand(c)).trim(), sz = c.sq ? 20 : 24;
        const o = [paper(c, 0.25)];
        o.push(T(word, { x: m - 0.6, y: H + (c.sq ? 3.4 : 4.2) - 1.2, oy: 'bottom', size: sz, font: 'd', w: 800, color: 'none', stroke: ink, sw: 0.16, ls: -0.05, fit: W * 1.12 }));
        o.push(T(word, { field: 'name', part: 0, x: m - 1.6, y: H + (c.sq ? 3.4 : 4.2), oy: 'bottom', size: sz, font: 'd', w: 800, color: fg, ls: -0.05, fit: W * 1.12 }));
        o.push(T(f.role, { field: 'role', x: m, y: m, size: 1.9, font: 't', w: 700, upper: true, ls: 0.16, color: ink, fit: W * 0.5 }));
        o.push(R(m, m + 3.4, 6, 0.5, ink));
        o.push(...contacts(c, { x: W - m, yb: m + 2 + 2.8 * 2, align: 'right', keys: ['phone', 'email', 'web'], size: 1.75, lh: 2.8, color: ink, w: 600, fit: W * 0.45 }));
        return { bg: { color: acc }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, ink = dark(pal.ink) ? pal.ink : '#1D1A19', bg = light(pal.bg) ? pal.bg : '#FFF5EF';
        const word = (first(c) || f.name || '').toLocaleUpperCase();
        const o = [];
        for (let i = 0; i < 3; i++) o.push(T(`${word} ${word} ${word}`, { x: -6 + i * 7, y: H - 2 + i * 0 - (2 - i) * 6.2, oy: 'bottom', size: 6, font: 'd', w: 800, color: 'none', stroke: mix(acc, bg, 0.3), sw: 0.12, ls: -0.02 }));
        o.push(T(f.name, { field: 'name', x: m, y: m + 4.4, oy: 'bottom', size: 4.2, font: 'd', w: 800, color: ink, fit: W - 2 * m, ls: -0.03 }));
        o.push(T(brand(c), { field: 'company', x: m, y: m + 5.6, size: 1.9, font: 't', w: 700, color: acc, fit: W - 2 * m }));
        return { bg: { color: bg }, objs: o };
      },
    },

    // ------------------------------------------------------------ LOUD – plagát, nálepka a páska
    loud: {
      name: 'Loud', fonts: 'rubik', pal: 'sneh', tags: ['agentura', 'marketing', 'event', 'hudba', 'interier', 'kreativ', 'bar', 'odvazne', 'hrave', 'moderne', 'mlade'],
      front(c) {
        const { W, H, f, pal, m } = c; const yel = '#FFE14D', ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent;
        const words = brand(c).toLocaleLowerCase().split(/\s+/).slice(0, 3), n = words.length, band = 6;
        const o = [];
        const lh = (H - band - 6) / n, sz = Math.min(lh * 1.05, c.sq ? 12 : 16);
        words.forEach((w, i) => o.push(T(w, { field: 'company', x: m - 0.8, y: 3.2 + lh * (i + 1), oy: 'bottom', size: sz, font: 'd', w: 900, color: i === n - 1 ? acc : ink, fit: W - 2 * m - (c.sq ? 0 : 14), ls: -0.05, lh: 0.85 })));
        if (!c.sq) {
          const sx = W - m - 6, sy = m + 6, pts = [];
          for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = i % 2 ? 6.2 : 7.6; pts.push(`${i ? 'L' : 'M'} ${f2(sx + Math.cos(a) * rr)} ${f2(sy + Math.sin(a) * rr)}`); }
          o.push(P(pts.join(' ') + ' Z', { fill: ink, rot: 12 }), emblem(c, sx, sy, 6, yel));
        }
        o.push(R(-2, H - band, W + 4, band + 2, ink));
        const tag = ((f.tagline || f.role || brand(c)) + '  ✶  ').toLocaleUpperCase();
        o.push(T(tag.repeat(4), { x: -3, y: H - band / 2 + 0.2, oy: 'center', size: 1.9, font: 't', w: 700, ls: 0.14, color: yel }));
        return { bg: { color: yel }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const yel = '#FFE14D', ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent;
        return { bg: { color: ink }, objs: [
          R(W - m - 3, -2, 3, H + 4, yel), R(W - m - 7, -2, 1.4, H + 4, acc),
          T(f.name, { field: 'name', x: m, y: m + 5, oy: 'bottom', size: 4.6, font: 'd', w: 900, color: yel, fit: W - 2 * m - 10, ls: -0.03 }),
          T(f.role, { field: 'role', x: m, y: m + 6.2, size: 2, font: 't', w: 600, color: '#FFFFFF', fit: W - 2 * m - 10 }),
          ...rows(c, { x: m, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], color: '#FFFFFF', fit: W - 2 * m - 10, size: 1.85, lh: 2.8, weight: 500 }),
        ] };
      },
    },

    // ------------------------------------------------------------ AKVAREL – modrý akvarel so zlatou vetvičkou
    akvarel: {
      name: 'Akvarel', fonts: 'playfair', pal: 'indigo', art: 'akvarel-modry', tags: ['umelec', 'foto', 'more', 'cestovanie', 'ucitel', 'poradenstvo', 'jemne', 'kreativ', 'osobne', 'prirodne'],
      front(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#14213D', acc = pal.accent, g = 'foil:gold';
        const o = [paper(c, 0.35)];
        o.push(IMG(c.artOf('akvarel-modry'), c.sq ? -4 : W * 0.44, c.sq ? H * 0.5 : -6, c.sq ? W + 8 : W * 0.66, c.sq ? H * 0.62 : H + 12, { role: 'art', blend: 'multiply' }));
        o.push(...sprig(c.sq ? W - 6 : W - 8, c.sq ? H - 4 : H - 5, c.sq ? 16 : 22, c.sq ? -150 : -130, { color: '#C9A15A', leaves: 8, size: 3.4 }));
        const mw = c.sq ? W - 2 * m : W * 0.5;
        o.push(T(f.name, { field: 'name', x: m, y: c.sq ? m + 6 : H * 0.42, oy: 'bottom', size: 5, font: 'd', color: ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x: m, y: (c.sq ? m + 6 : H * 0.42) + 1.1, size: 2.4, font: 'd', it: true, color: acc, fit: mw }));
        o.push(Ln(m, (c.sq ? m + 6 : H * 0.42) + 5.6, m + 7, (c.sq ? m + 6 : H * 0.42) + 5.6, g, 0.3));
        o.push(...rows(c, { x: m, yb: c.sq ? m + 21 : H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], icons: true, lcolor: acc, color: ink, fit: mw - 3, size: 1.85, lh: 2.8 }));
        return { bg: { color: '#FFFFFF' }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#14213D', g = 'foil:gold';
        const rx = c.sq ? 19 : 27, ry = c.sq ? 13 : 13.5;
        return { bg: { color: '#FFFFFF', art: c.art || 'akvarel-modry', artOpacity: 0.85 }, objs: [
          P(oval(W / 2, H / 2, rx, ry), { fill: '#FFFFFF', opacity: 0.94 }), P(oval(W / 2, H / 2, rx - 1.2, ry - 1.2), { stroke: g, sw: 0.2 }),
          logoOr(c, W / 2, H / 2 - 1.5, rx * 1.2, ry * 0.8, {}, T(brand(c), { field: 'company', x: W / 2, y: H / 2 - 1.5, ox: 'center', oy: 'center', size: c.sq ? 4.4 : 5.4, font: 'd', it: true, color: ink, fit: rx * 1.6 })),
          ...divider(W / 2, H / 2 + 3.4, rx * 0.8, g),
          T((f.web || '').toLocaleUpperCase(), { field: 'web', x: W / 2, y: H / 2 + 6.6, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.26, color: ink, fit: rx * 1.5 }),
        ] };
      },
    },

    // ------------------------------------------------------------ BOTANIKA – kvetinová kresba v ráme
    botanika: {
      name: tr('Botanika', 'Botanika'), fonts: 'fraunces', pal: 'krieda', art: 'botanika', tags: ['kvety', 'wellness', 'svadby', 'kozmetika', 'terapia', 'kaviaren', 'jemne', 'prirodne', 'zena'],
      front(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent, bg = '#FFFDF9';
        const o = [paper(c, 0.3)];
        o.push(IMG(c.artUrl || c.artOf('botanika'), c.sq ? W * 0.38 : W * 0.5, -2, c.sq ? W * 0.66 : W * 0.54, H + 4, { fit: 'cover', role: 'art', blend: 'multiply', ax: 'center' }));
        o.push(R(3, 3, W - 6, H - 6, null, { stroke: acc, sw: 0.14 }), R(3.8, 3.8, W - 7.6, H - 7.6, null, { stroke: acc, sw: 0.06 }));
        const mw = c.sq ? W * 0.56 : W * 0.5;
        o.push(T(f.name, { field: 'name', x: m + 1, y: H * 0.42, oy: 'bottom', size: c.sq ? 4.4 : 5.2, font: 'd', color: ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x: m + 1, y: H * 0.42 + 1.1, size: 2.4, font: 'd', it: true, color: acc, fit: mw }));
        o.push(...rows(c, { x: m + 1, yb: H - m - 1, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web'], color: mix(ink, bg, 0.15), fit: mw - 2, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#1A1A18', acc = pal.accent, so = mix(light(pal.soft) ? pal.soft : '#E8E2D7', '#FFFFFF', 0.35);
        return { bg: { color: so }, objs: [
          paper(c, 0.4),
          IMG(c.artUrl || c.artOf('botanika'), W / 2, H * 0.3, W * 0.36, H * 0.48, { fit: 'contain', role: 'art', blend: 'multiply', ax: 'center', ay: 'center' }),
          logoOr(c, W / 2, H * 0.68, W * 0.45, H * 0.2, {}, T(brand(c), { field: 'company', x: W / 2, y: H * 0.68, ox: 'center', oy: 'center', size: c.sq ? 4.2 : 4.8, font: 'd', it: true, color: ink, fit: W - 2 * m - 6 })),
          T((f.tagline || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H - m - 0.4, ox: 'center', oy: 'bottom', size: 1.7, font: 't', w: 600, ls: 0.24, color: acc, fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ MRAMOR – biely mramor, zlatý rám a monogram
    mramor: {
      name: 'Mramor', fonts: 'playfair', pal: 'sneh', art: 'mramor', tags: ['beauty', 'kozmetika', 'svadby', 'reality', 'luxus', 'elegantne', 'jemne', 'zena', 'interier'],
      front(c) {
        const { W, H, f, pal, m } = c; const ink = '#1F1C1A', g = pal.foil ? FOIL(pal) : 'foil:gold', met = pal.foil ? MET(pal) : '#B8924A';
        const pw = c.sq ? W - 10 : W * 0.56, px = c.sq ? 5 : W - pw - 5, py = 5, ph = H - 10, cx = px + pw / 2;
        return { bg: bgArt(c, 'mramor'), objs: [
          R(px + 0.4, py + 0.7, pw, ph, '#000000', { opacity: 0.08 }), R(px, py, pw, ph, '#FFFFFF', { opacity: 0.96 }),
          R(px + 1.4, py + 1.4, pw - 2.8, ph - 2.8, null, { stroke: g, sw: 0.22 }),
          C(cx, py + 6.6, 3.6, { stroke: g, sw: 0.18 }), MONO(c, { x: cx, y: py + 6.7, ox: 'center', oy: 'center', size: 3, color: met }),
          T(f.name, { field: 'name', x: cx, y: py + ph * 0.6, ox: 'center', oy: 'bottom', size: 4.2, font: 'd', color: ink, fit: pw - 8 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: cx, y: py + ph * 0.6 + 1.2, ox: 'center', size: 1.7, font: 't', w: 500, ls: 0.24, color: met, fit: pw - 8 }),
          ...centerLines(c, cx, py + ph - 3, { color: ink, fit: pw - 8, size: 1.75, lh: 2.6 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = pal.foil ? FOIL(pal) : 'foil:gold', met = pal.foil ? MET(pal) : '#B8924A', r = c.sq ? 11 : 12;
        return { bg: bgArt(c, 'mramor'), objs: [
          C(W / 2, H * 0.44, r, { fill: '#FFFFFF', opacity: 0.85 }), C(W / 2, H * 0.44, r, { stroke: g, sw: 0.3 }), C(W / 2, H * 0.44, r - 1.2, { stroke: g, sw: 0.1 }),
          logoOr(c, W / 2, H * 0.44, r * 1.2, r * 1.2, { tint: g }, MONO(c, { x: W / 2, y: H * 0.44 + 0.4, ox: 'center', oy: 'center', size: r * 0.8, it: true, color: g })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H - m - 0.6, ox: 'center', oy: 'bottom', size: 2, font: 't', w: 600, ls: 0.32, color: met, fit: W - 2 * m }),
        ] };
      },
    },

    // ------------------------------------------------------------ OBLÚK – stredomorské okno so slnkom nad morom
    oblouk: {
      name: tr('Oblúk', 'Oblouk'), fonts: 'fraunces', pal: 'terakota', tags: ['wellness', 'joga', 'terapeut', 'kozmetika', 'butik', 'kaviaren', 'kvety', 'interier', 'svadba', 'jemne', 'prirodne', 'zenske', 'teple'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, cr = inkOn(bg, pal, '#2A1A12', '#FFF6EE'), dk = dark(pal.accent) ? pal.accent : '#2A1A12';
        const aw = c.sq ? 22 : 24, ax = c.sq ? W / 2 - aw / 2 : W - m - aw, top = c.sq ? 4 : 4.5, base = c.sq ? H * 0.6 : H - 4.5;
        const o = [paper(c, 0.3)];
        o.push(P(arch(ax - 1.6, base + 1.6, aw + 3.2, top - 1.6), { fill: cr }));
        o.push(P(arch(ax, base, aw, top), { fill: { grad: ['#F6C9A0', '#F8E3C8', '#FBEFE0'], angle: 90 } }));
        const hz = top + (base - top) * 0.62;
        o.push(C(ax + aw * 0.5, hz, aw * 0.2, { fill: mix(bg, '#F6C9A0', 0.35) }));
        o.push(R(ax, hz, aw, base - hz, { grad: [mix(bg, '#3F7C8C', 0.75), '#2F5E6B'], angle: 90 }));
        for (let k = 1; k <= 4; k++) o.push(Ln(ax + aw * (0.15 + k * 0.05), hz + k * 1.4, ax + aw * (0.85 - k * 0.05), hz + k * 1.4, '#FFFFFF', 0.12, { opacity: 0.5 }));
        o.push(P(`M ${f2(ax)} ${f2(hz + 0.3)} Q ${f2(ax + aw * 0.25)} ${f2(hz - 3.6)} ${f2(ax + aw * 0.48)} ${f2(hz + 0.3)} Z`, { fill: mix(bg, dk, 0.35) }));
        o.push(R(ax - 2.4, base, aw + 4.8, 1.4, mix(cr, bg, 0.2)));
        if (c.sq) {
          o.push(T(f.name, { field: 'name', x: W / 2, y: H * 0.74, ox: 'center', oy: 'center', size: 3.6, font: 'd', color: cr, fit: W - 2 * m }));
          o.push(...centerLines(c, W / 2, H - m, { color: cr, fit: W - 2 * m, size: 1.75, lh: 2.6 }));
        } else {
          const mw = ax - m - 6;
          o.push(T(f.name, { field: 'name', x: m, y: H * 0.42, oy: 'bottom', size: 4.6, font: 'd', color: cr, fit: mw }));
          o.push(T(f.role, { field: 'role', x: m, y: H * 0.42 + 1, size: 2.2, font: 'd', it: true, color: mix(cr, bg, 0.25), fit: mw }));
          o.push(...rows(c, { x: m, yb: H - m, color: cr, fit: mw, size: 1.85, lh: 2.8 }));
        }
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const cr = '#FBF1E6', tc = luminance(pal.bg) < 0.45 ? pal.bg : luminance(pal.accent) < 0.45 ? pal.accent : '#C35F3A', aw = 12, ax = W / 2 - aw / 2, top = m, base = H * 0.52;
        return { bg: { color: cr }, objs: [
          paper(c, 0.45),
          P(arch(ax, base, aw, top), { fill: tc }), C(W / 2, top + (base - top) * 0.6, aw * 0.22, { fill: '#F6C9A0' }),
          R(ax, top + (base - top) * 0.68, aw, (base - top) * 0.32, '#2F5E6B'),
          T(brand(c), { field: 'company', x: W / 2, y: H * 0.68, ox: 'center', oy: 'center', size: c.sq ? 3.6 : 4.2, font: 'd', color: tc, fit: W - 2 * m - 6 }),
          T(f.tagline || '', { field: 'tagline', x: W / 2, y: H * 0.68 + 4.2, ox: 'center', oy: 'center', size: 1.9, font: 'd', it: true, color: mix(tc, cr, 0.3), fit: W - 2 * m - 6 }),
        ] };
      },
    },

    // ------------------------------------------------------------ VELORA – zlatý veniec okolo monogramu
    velora: {
      name: 'Velora', fonts: 'cinzel', pal: 'olive', tags: ['dizajn', 'branding', 'kozmetika', 'kvety', 'wellness', 'svadba', 'foto', 'kouc', 'elegantne', 'luxusne', 'prirodne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#4B5340', g = G(pal), cr = light(pal.ink) ? pal.ink : '#F1ECE1';
        const cy = c.sq ? H * 0.4 : H * 0.4, r = c.sq ? 11 : 11.5;
        return { bg: { color: bg }, objs: [
          paper(c, 0.25),
          ...wreath(W / 2, cy + 0.6, r, pal.foil ? MET(pal) : pal.accent, { leaves: 11, size: 3.3, gap: 50 }),
          logoOr(c, W / 2, cy, r * 1.1, r * 1.1, { tint: g }, MONO(c, { x: W / 2, y: cy + 0.4, ox: 'center', oy: 'center', size: r * 0.7, color: g, ls: 0.04 })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: c.sq ? H * 0.76 : H * 0.78, ox: 'center', oy: 'center', size: 2.8, font: 'd', ls: 0.26, color: cr, fit: W - 2 * m - 4 }),
          T(f.tagline || '', { field: 'tagline', x: W / 2, y: (c.sq ? H * 0.76 : H * 0.78) + 3.6, ox: 'center', oy: 'center', size: 1.8, font: 't', it: true, color: mix(cr, bg, 0.3), fit: W - 2 * m - 6 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ol = dark(pal.bg) || luminance(pal.bg) < 0.3 ? pal.bg : '#4B5340', cr = light(pal.soft) ? pal.soft : '#EFE9DD', met = pal.foil ? MET(pal) : pal.accent;
        return { bg: { color: cr }, objs: [
          paper(c, 0.5),
          ...sprig(-1, H + 1, 16, -58, { color: met, leaves: 8, size: 3 }), ...sprig(W + 1, -1, 16, 122, { color: met, leaves: 8, size: 3 }),
          T(f.name.toLocaleUpperCase(), { field: 'name', x: W / 2, y: H * 0.36, ox: 'center', oy: 'center', size: c.sq ? 2.6 : 3, font: 'd', ls: 0.18, color: ol, fit: W - 2 * m - 6 }),
          T(f.role || '', { field: 'role', x: W / 2, y: H * 0.36 + 3.6, ox: 'center', oy: 'center', size: 1.9, font: 't', it: true, color: met, fit: W - 2 * m - 6 }),
          ...contacts(c, { x: W / 2, yb: H - m - 1, align: 'center', keys: ['phone', 'email', 'web'], size: 1.85, lh: 2.8, color: ol, fit: W - 2 * m - 10 }),
        ] };
      },
    },

    // ------------------------------------------------------------ VLNY – plynúce linky
    vlny: {
      name: tr('Vlny', 'Vlny'), fonts: 'geist', pal: 'sneh', tags: ['kreativ', 'dizajn', 'foto', 'it', 'marketing', 'architekt', 'hudba', 'moderne', 'odvazne', 'minimal', 'ciste'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = light(pal.bg) ? mix(pal.bg, '#F4F2EE', 0.5) : '#F4F2EE', ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent;
        const o = [];
        const y0 = c.sq ? H * 0.5 : H * 0.48;
        for (let k = 0; k < 14; k++) { const pts = []; const y = y0 + k * 1.9; for (let x = -4; x <= W + 4; x += 3) pts.push([x, y + Math.sin(x / (W * 0.55) * Math.PI * 2 + k * 0.22) * (1.2 + k * 0.35)]); o.push(P(smooth(pts), { stroke: k === 6 ? acc : ink, sw: k === 6 ? 0.45 : 0.16 + k * 0.02 })); }
        o.push(C(W - m - 4, m + 4, 4, { stroke: ink, sw: 0.2 }));
        o.push(logoOr(c, W - m - 4, m + 4, 5.4, 5.4, {}, MONO(c, { x: W - m - 4, y: m + 4, ox: 'center', oy: 'center', size: 2.4, w: 600, color: ink, ls: 0.02 })));
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: m + 1.8, oy: 'center', size: 2.6, font: 'd', w: 600, ls: 0.22, color: ink, fit: W - 2 * m - 12 }));
        o.push(T(f.role, { field: 'role', x: m, y: m + 5.2, oy: 'center', size: 2, font: 't', color: acc, fit: W - 2 * m - 12 }));
        o.push(T([f.phone, f.email].filter((v) => v && v.trim()).join('   ·   '), { x: m, y: m + 9.4, oy: 'center', size: 1.8, font: 't', color: mix(ink, bg, 0.25), fit: W - 2 * m - 12 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = dark(pal.ink) ? pal.ink : '#111111', acc = pal.accent, bg = '#F4F2EE';
        const o = [];
        for (let k = -2; k < 22; k++) { const pts = []; const y = k * 2.6; for (let x = -4; x <= W + 4; x += 3) pts.push([x, y + Math.sin(x / (W * 0.5) * Math.PI * 2 + k * 0.3) * 2.2]); o.push(P(smooth(pts), { stroke: bg, sw: 0.5, opacity: 0.9 })); }
        const r = c.sq ? 10 : 11;
        o.push(C(W / 2, H / 2, r, { fill: acc }), T(brand(c), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 2.8, font: 'd', w: 600, color: '#FFFFFF', fit: r * 1.7 }));
        return { bg: { color: ink }, objs: o };
      },
    },

    // ------------------------------------------------------------ VZOR – čipkový rám a monogram v ovále
    vzor: {
      name: 'Vzor', fonts: 'gloock', pal: 'ruza', tags: ['kvety', 'cukraren', 'butik', 'kozmetika', 'beauty', 'salon', 'svadba', 'deti', 'jemne', 'hrave', 'zenske', 'elegantne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, ink = dark(pal.ink) ? pal.ink : '#3A2321', acc = pal.accent, wh = '#FFFBF8';
        const o = [];
        const i = 2.8, sr = 1.1;
        o.push(R(i, i, W - 2 * i, H - 2 * i, wh));
        for (let x = i + sr; x <= W - i - sr + 0.01; x += sr * 2) { o.push(C(x, i, sr, { fill: wh }), C(x, H - i, sr, { fill: wh })); }
        for (let y = i + sr; y <= H - i - sr + 0.01; y += sr * 2) { o.push(C(i, y, sr, { fill: wh }), C(W - i, y, sr, { fill: wh })); }
        for (let x = i + sr; x <= W - i - sr + 0.01; x += sr * 2) { o.push(C(x, i - 0.2, 0.28, { fill: acc }), C(x, H - i + 0.2, 0.28, { fill: acc })); }
        o.push(R(i + 2, i + 2, W - 2 * i - 4, H - 2 * i - 4, null, { stroke: acc, sw: 0.1 }));
        const cx = c.sq ? W / 2 : m + 13, cy = c.sq ? 17 : H / 2;
        o.push(P(oval(cx, cy, 7, 8.6), { stroke: acc, sw: 0.18 }), ...sprig(cx - 5, cy + 8, 7, -150, { color: acc, leaves: 5, size: 1.8 }), ...sprig(cx + 5, cy + 8, 7, -30, { color: acc, leaves: 5, size: 1.8 }));
        o.push(logoOr(c, cx, cy, 10, 10, { tint: acc }, MONO(c, { x: cx, y: cy, ox: 'center', oy: 'center', size: 6, it: true, color: acc, ls: -0.03 })));
        const x = c.sq ? W / 2 : cx + 12, al = c.sq ? 'center' : 'left', mw = c.sq ? W - 2 * m - 4 : W - x - m - 2;
        o.push(T(f.name, { field: 'name', x, y: c.sq ? 33 : H * 0.48, ox: al, oy: 'bottom', size: c.sq ? 3.6 : 4.4, font: 'd', color: ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x, y: (c.sq ? 33 : H * 0.48) + 1, ox: al, size: 2.1, font: 'd', it: true, color: acc, fit: mw }));
        o.push(...(c.sq ? centerLines(c, W / 2, H - m - 2, { color: mix(ink, wh, 0.25), fit: W - 2 * m - 4, size: 1.75, lh: 2.6 }) : rows(c, { x, yb: H - m - 2, keys: ['phone', 'email', 'web'], color: mix(ink, wh, 0.2), fit: mw, size: 1.75, lh: 2.65 })));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal } = c;
        const mk = mono(c), o = [], col = mix(pal.accent, pal.soft, 0.55), sx = 11, sy = 9;
        for (let r = 0, y = -2; y < H + 6; r++, y += sy) for (let x = (r % 2 ? sx / 2 : 0) - 3; x < W + 6; x += sx) o.push(T(mk, { x, y, ox: 'center', oy: 'center', size: 3.6, font: 'd', it: true, color: col, ls: -0.03 }));
        const bw = Math.min(W * 0.62, 56), bh = 13;
        o.push(R(W / 2 - bw / 2, H / 2 - bh / 2, bw, bh, pal.bg, { rx: bh / 2 }), R(W / 2 - bw / 2 + 1, H / 2 - bh / 2 + 1, bw - 2, bh - 2, null, { rx: bh / 2 - 1, stroke: pal.accent, sw: 0.12 }));
        o.push(T(f.company || f.name, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 3.6, font: 'd', color: pal.ink, fit: bw - 8 }));
        return { bg: { color: pal.soft }, objs: o };
      },
    },

    // ------------------------------------------------------------ SPLIT – pás s líniovým vzorom a monogramom
    split: {
      name: 'Split', fonts: 'geist', pal: 'navy', tags: ['firma', 'uctovnictvo', 'financie', 'poistenie', 'reality', 'stavba', 'lekar', 'it', 'konzultant', 'serioze', 'ciste', 'doveryhodne', 'firemne', 'tmave', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, acc = pal.accent, fg = luminance(acc) > 0.4 ? '#111111' : '#FFFFFF', ink = luminance(bg) < 0.3 ? '#FFFFFF' : pal.ink, muted = mix(ink, bg, 0.4);
        const band = c.sq ? H * 0.36 : W * 0.34;
        const o = [];
        if (c.sq) o.push(R(-2, -2, W + 4, band + 2, acc)); else o.push(R(-2, -2, band + 2, H + 4, acc));
        const bwid = c.sq ? W : band, bhei = c.sq ? band : H;
        for (let k = -bhei; k < bwid + 2; k += 2.2) o.push(Ln(k, bhei + 1, k + bhei + 2, -1, fg, 0.1, { opacity: 0.18 }));
        const mx = c.sq ? W / 2 : band / 2, my = c.sq ? band / 2 : H / 2, mr = c.sq ? 7 : 9;
        o.push(C(mx, my, mr, { fill: acc }), C(mx, my, mr, { stroke: fg, sw: 0.2 }));
        o.push(logoOr(c, mx, my, mr * 1.4, mr * 1.4, { tint: fg }, MONO(c, { x: mx, y: my + 0.2, ox: 'center', oy: 'center', size: mr * 0.9, w: 600, color: fg, ls: -0.04 })));
        const x = c.sq ? m : band + 6, top = c.sq ? band + 4 : m, mw = W - x - m;
        const accOnBg = luminance(bg) < 0.3 ? acc : (luminance(acc) < 0.5 ? acc : muted);
        o.push(T(f.name, { field: 'name', x, y: top + 4.4, oy: 'bottom', size: c.sq ? 3.4 : 4, font: 'd', color: ink, fit: mw, ls: -0.02 }));
        o.push(T(f.role, { field: 'role', x, y: top + 5.6, size: 2, font: 't', w: 500, color: accOnBg, fit: mw }));
        o.push(...rows(c, { x, yb: H - m, keys: c.sq ? ['phone', 'email'] : ['phone', 'email', 'web', 'address'], icons: true, lcolor: accOnBg, color: ink, fit: mw, size: 1.8, lh: 2.75 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const acc = pal.accent, fg = luminance(acc) > 0.4 ? '#111111' : '#FFFFFF';
        const o = [];
        for (let k = -H; k < W + 2; k += 2.2) o.push(Ln(k, H + 1, k + H + 2, -1, fg, 0.1, { opacity: 0.12 }));
        o.push(logoOr(c, W / 2, H / 2 - 1.5, W * 0.5, H * 0.4, { tint: fg }, T(brand(c), { field: 'company', x: W / 2, y: H / 2 - 1.5, ox: 'center', oy: 'center', size: c.sq ? 4.4 : 5.4, font: 'd', w: 600, color: fg, fit: W - 2 * m - 6, ls: -0.03 })));
        o.push(T(f.web || '', { field: 'web', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 1.8, font: 't', w: 500, color: fg, opacity: 0.85, fit: W - 2 * m, ls: 0.04 }));
        return { bg: { color: acc }, objs: o };
      },
    },

    // ------------------------------------------------------------ PODPIS – písaný podpis so zlatým ťahom
    podpis: {
      name: tr('Podpis', 'Podpis'), fonts: 'bodoni', pal: 'vino', tags: ['beauty', 'kozmetika', 'salon', 'foto', 'svadba', 'kouc', 'dizajn', 'butik', 'umelec', 'cukraren', 'elegantne', 'jemne', 'zenske', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const muted = mix(pal.ink, pal.bg, 0.4), g = pal.foil ? FOIL(pal) : 'foil:gold';
        const fn = first(c) || f.name, sx = c.sq ? W / 2 : W * 0.36, sy = H * (c.sq ? 0.34 : 0.42);
        const o = [paper(c, 0.45)];
        o.push(P(smooth([[sx - (c.sq ? 18 : 24), sy + 6.5], [sx - 6, sy + 5.2], [sx + 8, sy + 6.6], [sx + (c.sq ? 18 : 17), sy + 4.2]]), { stroke: g, sw: 0.32 }));
        o.push(T(fn, { field: 'name', part: 0, x: sx, y: sy, ox: 'center', oy: 'center', size: c.sq ? 12 : 15, font: SCRIPT, color: pal.accent, fit: c.sq ? W - 8 : W * 0.62, rot: -6 }));
        const x = c.sq ? W / 2 : W - m, al = c.sq ? 'center' : 'right', mw = c.sq ? W - 2 * m : W * 0.42;
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x, y: c.sq ? H * 0.62 : H * 0.6, ox: al, oy: 'center', size: 2.5, font: 'd', ls: 0.3, color: pal.ink, fit: mw }));
        o.push(T(f.role, { field: 'role', x, y: (c.sq ? H * 0.62 : H * 0.6) + 3.2, ox: al, oy: 'center', size: 1.9, font: 'd', it: true, color: muted, fit: mw }));
        o.push(...contacts(c, { x: c.sq ? W / 2 : m, yb: H - m, align: c.sq ? 'center' : 'left', keys: ['phone', 'email', 'web'], size: 1.95, lh: 2.9, color: muted, fit: c.sq ? W - 2 * m : W * 0.45 }));
        return { bg: { color: pal.bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal } = c; const fg = luminance(pal.accent) < 0.35 ? '#F3ECE3' : pal.ink, g = pal.foil ? FOIL(pal) : 'foil:gold';
        const fn = first(c);
        return { bg: { color: pal.accent }, objs: [
          paper(c, 0.22),
          R(3, 3, W - 6, H - 6, null, { stroke: g, sw: 0.2 }), R(3.9, 3.9, W - 7.8, H - 7.8, null, { stroke: g, sw: 0.08 }),
          T(f.company && f.company !== f.name ? f.company : fn, { field: f.company ? 'company' : 'name', x: W / 2, y: H / 2 - 3.5, ox: 'center', oy: 'center', size: c.sq ? 11 : 13, font: SCRIPT, color: g, fit: W - 16 }),
          ...divider(W / 2, H / 2 + 5, 22, g),
          T((f.role || f.web || '').toLocaleUpperCase(), { field: f.role ? 'role' : 'web', x: W / 2, y: H / 2 + 9.5, ox: 'center', oy: 'center', size: 1.8, font: 'd', ls: 0.34, color: fg, opacity: 0.9, fit: W - 18 }),
        ] };
      },
    },

    // ------------------------------------------------------------ MONOGRAM – iniciály v kruhu s vetvičkami
    monogram: {
      name: 'Monogram', fonts: 'bodoni', pal: 'noir', tags: ['pravnik', 'advokat', 'reality', 'luxus', 'financie', 'poradenstvo', 'hotel', 'elegantne', 'luxusne', 'serioze', 'klasicky', 'tmave'],
      front(c) {
        const { W, H, f, pal, m } = c; const muted = mix(pal.ink, pal.bg, 0.4), met = pal.foil ? MET(pal) : pal.accent;
        const my = c.sq ? H * 0.27 : H * 0.26, r = c.sq ? 7.4 : 7.6;
        const o = [C(W / 2, my, r, { stroke: met, sw: 0.14 }), ...sprig(W / 2 - r - 0.6, my + 2, 7, -110, { color: met, leaves: 5, size: 1.7 }), ...sprig(W / 2 + r + 0.6, my + 2, 7, -70, { color: met, leaves: 5, size: 1.7 })];
        o.push(logoOr(c, W / 2, my, r * 1.4, r * 1.2, {}, MONO(c, { x: W / 2, y: my + 0.2, ox: 'center', oy: 'center', size: r * 0.95, it: true, color: pal.accent, ls: -0.02 })));
        o.push(T(f.name, { field: 'name', x: W / 2, y: H * 0.56, ox: 'center', oy: 'center', size: 4.4, font: 'd', color: pal.ink, fit: W - 2 * m - 6, ls: 0.01 }));
        o.push(T(f.role, { field: 'role', x: W / 2, y: H * 0.56 + 3.8, ox: 'center', oy: 'center', size: 1.8, font: 't', w: c.fp.tw2, upper: true, ls: 0.3, color: muted, fit: W - 2 * m - 6 }));
        o.push(...centerLines(c, W / 2, H - m + 0.3, { color: pal.ink, fit: W - 2 * m, size: c.sq ? 1.75 : 1.95, lh: c.sq ? 2.6 : 3 }));
        return { bg: { color: pal.bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal } = c; const fg = luminance(pal.accent) > 0.4 ? '#111111' : '#FFFFFF', on = pal.accent;
        return { bg: { color: on }, objs: [
          paper(c, 0.2),
          R(3.2, 3.2, W - 6.4, H - 6.4, null, { stroke: fg, sw: 0.12, opacity: 0.55 }), ...corners(W, H, 4.4, fg, 3.4).map((x) => ({ ...x, opacity: 0.6 })),
          logoOr(c, W / 2, H / 2 - 2, W * 0.45, H * 0.42, { tint: fg }, MONO(c, { x: W / 2, y: H / 2 - 2, ox: 'center', oy: 'center', size: c.sq ? 19 : 21, it: true, color: fg, ls: -0.03 })),
          T((f.web || f.company || '').toLocaleUpperCase(), { field: f.web ? 'web' : 'company', x: W / 2, y: H - 6.6, ox: 'center', oy: 'bottom', size: 1.8, font: 't', w: 500, ls: 0.28, color: fg, fit: W - 16 }),
        ] };
      },
    },

    // ------------------------------------------------------------ OLIVIA – zlaté meno, písaný podpis a vetvičky
    olivia: {
      name: 'Olivia', fonts: 'cinzel', pal: 'ivory', tags: ['beauty', 'kozmetika', 'salon', 'svadba', 'event', 'kouc', 'foto', 'butik', 'reality', 'elegantne', 'luxusne', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = G(pal), met = pal.foil ? MET(pal) : pal.accent;
        return { bg: { color: pal.bg }, objs: [
          paper(c, 0.5),
          ...sprig(2, H - 2, c.sq ? 13 : 17, -48, { color: met, leaves: 8, size: 3 }), ...sprig(W - 2, 2, c.sq ? 13 : 17, 132, { color: met, leaves: 8, size: 3 }),
          T(first(c).toLocaleUpperCase(), { field: 'name', part: 0, x: W / 2, y: H * 0.46, ox: 'center', oy: 'center', size: c.sq ? 6 : 7.4, font: 'd', ls: 0.06, color: g, fit: W - 24 }),
          T((last(c) || f.company || '').toLocaleLowerCase(), { x: W / 2 + 7, y: H * 0.58, ox: 'center', oy: 'center', size: c.sq ? 7 : 8.6, font: SCRIPT, color: pal.ink, rot: -10, fit: W * 0.55 }),
          ...divider(W / 2, H * 0.73, 16, met),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.81, ox: 'center', oy: 'center', size: 1.7, font: 't', ls: 0.28, color: met, fit: W * 0.5 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = G(pal), met = pal.foil ? MET(pal) : pal.accent, qs = c.sq ? 13 : 15, cx = m + 1;
        if (c.sq) return { bg: { color: pal.bg }, objs: [paper(c, 0.5), R(W / 2 - qs / 2 - 0.6, m - 0.6, qs + 1.2, qs + 1.2, '#FFFFFF'), { type: 'qr', x: W / 2 - qs / 2, y: m, s: qs, color: '#1A1A1A' }, T(first(c).toLocaleUpperCase(), { field: 'name', x: W / 2, y: m + qs + 6, ox: 'center', oy: 'center', size: 3.4, font: 'd', ls: 0.06, color: g, fit: W - 2 * m }), ...centerLines(c, W / 2, H - m, { color: pal.ink, fit: W - 2 * m, size: 1.75, lh: 2.6 })] };
        return { bg: { color: pal.bg }, objs: [
          paper(c, 0.5),
          T(tr('NAPÍŠTE MI', 'NAPIŠTE MI'), { x: cx + qs / 2, y: m + 0.6, ox: 'center', size: 1.7, font: 't', ls: 0.26, color: pal.ink, fit: qs + 2 }),
          R(cx - 0.6, m + 3.6, qs + 1.2, qs + 1.2, '#FFFFFF'), { type: 'qr', x: cx, y: m + 4.2, s: qs, color: '#1A1A1A' },
          T(f.web || '', { field: 'web', x: cx + qs / 2, y: m + qs + 6.4, ox: 'center', size: 1.7, font: 't', color: pal.ink, fit: qs + 4 }),
          Ln(cx + qs + 5, m + 1, cx + qs + 5, H - m - 1, met, 0.18),
          T(first(c).toLocaleUpperCase(), { field: 'name', x: cx + qs + 9, y: m + 5, oy: 'bottom', size: 4.2, font: 'd', ls: 0.06, color: g, fit: W - cx - qs - 9 - m }),
          T((last(c) || '').toLocaleLowerCase(), { x: cx + qs + 18, y: m + 6.6, oy: 'center', size: 5, font: SCRIPT, color: pal.ink, rot: -8 }),
          ...contacts(c, { x: cx + qs + 9, yb: H - m, keys: ['phone', 'email', 'address'], size: 1.95, lh: 2.95, color: pal.ink, fit: W - cx - qs - 9 - m }),
          ...sprig(W - 1, H - 1, 10, -128, { color: met, leaves: 6, size: 2 }),
        ] };
      },
    },

    // ------------------------------------------------------------ PRUHY – retro cukráreň: pruhy, štítok a posýpka
    pruhy: {
      name: tr('Pruhy', 'Pruhy'), fonts: 'abril', pal: 'cokolada', tags: ['kozmetika', 'beauty', 'salon', 'kaviaren', 'cukraren', 'butik', 'moda', 'retro', 'hrave', 'odvazne', 'teple', 'zenske'],
      front(c) {
        const { W, H, f, pal, m } = c; const bg = pal.bg, pink = '#F2A7B8', cr = '#FFF4EC', sw = 3.2, o = [];
        for (let x = -2, i = 0; x < W + 2; x += sw, i++) if (i % 2) o.push(R(x, -2, sw, H + 4, mix(bg, '#000000', 0.25)));
        const r = seeded(brand(c) + 'spr'), cols = [pink, '#FFFFFF', '#F2C14E', '#7FC8C2'];
        const lw = c.sq ? W - 10 : W * 0.66, lh = c.sq ? 22 : 20, lx = (W - lw) / 2, ly = (H - lh) / 2;
        for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H; if (x > lx - 2 && x < lx + lw + 2 && y > ly - 2 && y < ly + lh + 2) continue; o.push(R(x, y, 1.6, 0.5, cols[i % 4], { rx: 0.25, rot: r() * 180 })); }
        const sc = 1.2; let d = '';
        for (let x = lx; x < lx + lw - 0.01; x += sc * 2) d += `M ${f2(x)} ${f2(ly)} C ${f2(x)} ${f2(ly - sc * 1.3)} ${f2(x + sc * 2)} ${f2(ly - sc * 1.3)} ${f2(x + sc * 2)} ${f2(ly)} Z M ${f2(x)} ${f2(ly + lh)} C ${f2(x)} ${f2(ly + lh + sc * 1.3)} ${f2(x + sc * 2)} ${f2(ly + lh + sc * 1.3)} ${f2(x + sc * 2)} ${f2(ly + lh)} Z `;
        o.push(R(lx + 0.6, ly + 1, lw, lh, '#000000', { opacity: 0.25 }), P(d, { fill: cr }), R(lx, ly, lw, lh, cr), R(lx + 1.2, ly + 1.2, lw - 2.4, lh - 2.4, null, { stroke: pink, sw: 0.2 }));
        o.push(T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H / 2 - 1.2, ox: 'center', oy: 'center', size: c.sq ? 6 : 7.4, font: 'd', color: bg, fit: lw - 8, ls: -0.02 }));
        o.push(T((f.tagline || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H / 2 + 5, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.16, color: mix(bg, pink, 0.4), fit: lw - 8 }));
        return { bg: { color: bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const pink = '#F2A7B8', qs = 12, ink = light(pal.ink) ? pal.ink : '#F2E8DE';
        const o = [];
        for (let x = -2, i = 0; x < W + 2; x += 3.2, i++) if (i % 2) o.push(R(x, -2, 3.2, 7.2, pink, { opacity: 0.9 }));
        o.push(R(-2, 5, W + 4, 0.4, pink));
        o.push(T(brand(c).toLocaleLowerCase(), { field: 'company', x: m, y: m + 9.6, oy: 'bottom', size: 4.6, font: 'd', color: pink, fit: W - 2 * m }));
        if (!c.sq) o.push(R(W - m - qs - 0.6, H - m - qs - 0.6, qs + 1.2, qs + 1.2, '#FFFFFF'), { type: 'qr', x: W - m - qs, y: H - m - qs, s: qs, color: pal.bg });
        o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'address'], size: 1.95, lh: 2.95, color: ink, fit: c.sq ? W - 2 * m : W - 2 * m - qs - 4 }));
        return { bg: { color: pal.bg }, objs: o };
      },
    },
  });
}
