// Vizitkomat – šablóny podľa konkrétnych predlôh z Pinterestu (vkladá sa do TEMPLATES v templates.js)
// Každá šablóna: front(c), back(c) → { bg, objs }. Rozmery v mm (90 × 50), c.m = bezpečný okraj.
export function proTemplates(h) {
  const { T, R, C, Ln, P, QR, IMG, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, seeded, smooth, SCRIPT } = h;
  const FOIL = (pal) => 'foil:' + (pal.foil || 'gold');
  const first = (c) => splitName(bare(c.f.name) || c.f.name)[0] || c.f.name || '';
  const brand = (c) => c.f.company || bare(c.f.name) || '';

  return {
    lina: {
      name: 'Lina', fonts: 'cinzel', pal: 'burgundy', tags: ['beauty', 'kozmetika', 'salon', 'dizajn', 'svadba', 'foto', 'butik', 'kouc', 'elegantne', 'luxusne', 'zenske', 'tmave'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal);
        return { bg: { color: pal.bg }, objs: [
          P(smooth([[-2, H * 0.6], [W * 0.18, H * 0.42], [W * 0.42, H * 0.38], [W * 0.66, H * 0.2], [W * 0.58, H * 0.12], [W * 0.5, H * 0.3], [W * 0.62, H * 0.52], [W + 2, H * 0.44]]), { stroke: g, sw: 0.18 }),
          T(first(c), { field: 'name', part: 0, x: W * 0.4, y: H * 0.44, ox: 'center', oy: 'center', size: 13, font: SCRIPT, color: g, fit: W * 0.6 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W - m, y: H * 0.66, ox: 'right', oy: 'bottom', size: 2.6, font: 'd', ls: 0.22, color: g, fit: W * 0.52 }),
          T(f.role, { field: 'role', x: W - m, y: H * 0.66 + 0.9, ox: 'right', size: 2, font: 'Libre Caslon Text', it: true, color: pal.ink, opacity: 0.85, fit: W * 0.52 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = luminance(pal.soft) > 0.5 ? pal.bg : pal.ink;
        return { bg: { color: pal.soft }, objs: [
          T(first(c), { field: 'name', part: 0, x: m, y: m + 7, oy: 'bottom', size: 7.5, font: SCRIPT, color: ink, fit: c.sq ? W - 2 * m : W * 0.38 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W - m, y: c.sq ? m + 12.5 : m + 3.6, ox: 'right', oy: 'bottom', size: c.sq ? 2.8 : 3.6, font: 'd', ls: 0.18, color: ink, fit: c.sq ? W - 2 * m : W * 0.55 }),
          T(f.role, { field: 'role', x: W - m, y: c.sq ? m + 13.5 : m + 4.6, ox: 'right', size: 2.2, font: 'Libre Caslon Text', color: ink, fit: c.sq ? W - 2 * m : W * 0.55 }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 2.1, lh: 3.1, color: ink, font: 'Libre Caslon Text', fit: W * 0.6 }),
          Ln(m, H - m - 0.4, m + 12, H - m - 0.4, ink, 0.12),
          T(brand(c), { field: 'company', x: m, y: H - m - 1.4, oy: 'bottom', size: 1.8, font: 'Libre Caslon Text', it: true, color: ink, fit: W * 0.32 }),
        ] };
      },
    },


    topo: {
      name: tr('Topo zlatá', 'Topo zlatá'), fonts: 'tenor', pal: 'onyx', tags: ['reality', 'architekt', 'stavba', 'financie', 'konzultant', 'outdoor', 'firma', 'luxusne', 'tmave', 'serioze', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const lt = luminance(pal.bg) > 0.45, g = lt ? (luminance(pal.ink) < 0.3 ? pal.ink : '#1A1A18') : FOIL(pal), lines = FOIL(pal);
        const o = [...topoPaths(c.sq ? W * 0.62 : W * 0.72, c.sq ? H * 0.3 : H * 0.55, 12, c.sq ? 2.4 : 2.9, seeded(f.name + 'tg')).map((d, i) => P(d, { stroke: lines, sw: i % 4 === 3 ? 0.2 : 0.11, opacity: i % 4 === 3 ? 0.75 : 0.5 }))];
        if (c.sq) {
          o.push(C(W / 2, H * 0.56, 4.6, { fill: pal.bg }), C(W / 2, H * 0.56, 4.6, { stroke: g, sw: 0.25 }), C(W / 2, H * 0.56, 5.4, { stroke: g, sw: 0.08, opacity: 0.6 }));
          o.push(logoOr(c, W / 2, H * 0.56, 6, 6, { tint: g }, MONO(c, { x: W / 2, y: H * 0.56, ox: 'center', oy: 'center', size: 3.4, color: g, ls: 0.04 })));
          const bn = brand(c);
          o.push(T(bn.length > 22 ? bn : bn.toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.76, ox: 'center', oy: 'center', size: 2.5, font: 'd', ls: bn.length > 22 ? 0.02 : 0.24, color: g, fit: W - 2 * m }));
          const tg = f.tagline || f.role || '';
          o.push(T(tg.length > 28 ? tg : tg.toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.76 + 3.2, ox: 'center', oy: 'center', size: 1.6, font: 't', ls: tg.length > 28 ? 0.02 : 0.2, color: pal.ink, opacity: 0.75, fit: W - 2 * m }));
          return { bg: { color: pal.bg }, objs: o };
        }
        o.push(C(m + 4, H / 2, 4.6, { fill: pal.bg }), C(m + 4, H / 2, 4.2, { stroke: g, sw: 0.25 }), C(m + 4, H / 2, 5, { stroke: g, sw: 0.08, opacity: 0.6 }));
        o.push(logoOr(c, m + 4, H / 2, 5.4, 5.4, { tint: g }, MONO(c, { x: m + 4, y: H / 2, ox: 'center', oy: 'center', size: 3, color: g, ls: 0.04 })));
        o.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: m + 11, y: H / 2 - 0.3, oy: 'bottom', size: 2.6, font: 'd', ls: 0.26, color: g, fit: W * 0.5 }));
        const tg = f.tagline || f.role || '';
        o.push(T(tg.length > 32 ? tg : tg.toLocaleUpperCase(), { field: 'tagline', x: m + 11, y: H / 2 + 0.8, size: 1.6, font: 't', ls: tg.length > 32 ? 0.02 : 0.26, color: pal.ink, opacity: 0.75, fit: W - 2 * m - 11 }));
        return { bg: { color: pal.bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const lt = luminance(pal.bg) > 0.45, g = lt ? (luminance(pal.ink) < 0.3 ? pal.ink : '#1A1A18') : FOIL(pal), met = { rose: '#C08070', silver: '#A9ADB2', copper: '#B87333' }[pal.foil] || '#C9A15A';
        const o = [...topoPaths(c.sq ? W * 0.85 : W * 0.06, c.sq ? H * 0.08 : H * 0.95, 9, 2.6, seeded(f.name + 'tb')).map((d) => P(d, { stroke: met, sw: 0.1, opacity: 0.3 }))];
        // značka polohy na vrstevnici
        const stacked = !c.sq && (Math.max(...['phone', 'email', 'web', 'address'].map((k) => (f[k] || '').length)) > 30 || (bare(f.name) || f.name).length > 22);
        const px = c.sq || stacked ? W - m - 3 : m + 1.6, py = c.sq || stacked ? m + 3.4 : H / 2 - 9.6;
        o.push(P(`M ${(px).toFixed(2)} ${(py + 2.4).toFixed(2)} C ${(px - 1.8).toFixed(2)} ${(py + 0.2).toFixed(2)} ${(px - 1.8).toFixed(2)} ${(py - 1.9).toFixed(2)} ${px.toFixed(2)} ${(py - 1.9).toFixed(2)} C ${(px + 1.8).toFixed(2)} ${(py - 1.9).toFixed(2)} ${(px + 1.8).toFixed(2)} ${(py + 0.2).toFixed(2)} ${px.toFixed(2)} ${(py + 2.4).toFixed(2)} Z`, { fill: g }), C(px, py - 0.4, 0.6, { fill: pal.bg }));
        if (c.sq) {
          o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: H * 0.44, oy: 'bottom', size: 2.8, font: 'd', ls: 0.18, color: g, fit: W - 2 * m }));
          o.push(T(f.role, { field: 'role', x: m, y: H * 0.44 + 1, size: 1.9, font: 't', ls: 0.06, color: pal.ink, opacity: 0.8, fit: W - 2 * m }));
          o.push(Ln(m, H * 0.44 + 5.4, m + 8, H * 0.44 + 5.4, g, 0.15));
          o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 1.85, lh: 2.75, color: pal.ink, fit: W - 2 * m }));
          return { bg: { color: pal.bg }, objs: o };
        }
        const longest = Math.max(...['phone', 'email', 'web', 'address'].map((k) => (f[k] || '').length)), dx = W * 0.53;
        if (stacked) {
          // dlhé texty: meno hore cez celú šírku, kontakty pod linkou
          o.push(T(bare(f.name) || f.name, { field: 'name', x: m, y: m + 4, oy: 'bottom', size: 3.2, font: 'd', ls: 0.04, color: g, fit: W - 2 * m - 5 }));
          o.push(T(f.role, { field: 'role', x: m, y: m + 5, size: 1.9, font: 't', color: pal.ink, opacity: 0.8, fit: W - 2 * m - 5 }));
          o.push(Ln(m, m + 9.4, m + 12, m + 9.4, g, 0.15));
          o.push(...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web', 'address'], size: 1.85, lh: 2.75, color: pal.ink, fit: W - 2 * m }));
          return { bg: { color: pal.bg }, objs: o };
        }
        o.push(T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: H / 2 - 1, oy: 'bottom', size: 3.2, font: 'd', ls: 0.2, color: g, fit: dx - m - 3 }));
        o.push(T(f.role, { field: 'role', x: m, y: H / 2, size: 2, font: 't', ls: 0.06, color: pal.ink, opacity: 0.8, fit: dx - m - 3 }));
        o.push(Ln(dx, m + 2, dx, H - m - 2, g, 0.15), C(dx, m + 2, 0.35, { fill: g }), C(dx, H - m - 2, 0.35, { fill: g }));
        o.push(...contacts(c, { x: dx + 3.5, yb: H / 2 + 4.6, keys: ['phone', 'email', 'web', 'address'], size: 2.05, lh: 3, color: pal.ink, fit: W - dx - 3.5 - m }));
        return { bg: { color: pal.bg }, objs: o };
      },
    },


  };
}
