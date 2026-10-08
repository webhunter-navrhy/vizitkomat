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
          T(first(c), { field: 'name', part: 0, x: m, y: m + 7, oy: 'bottom', size: 7.5, font: SCRIPT, color: ink, fit: W * 0.38 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W - m, y: m + 3.6, ox: 'right', oy: 'bottom', size: 3.6, font: 'd', ls: 0.18, color: ink, fit: W * 0.55 }),
          T(f.role, { field: 'role', x: W - m, y: m + 4.6, ox: 'right', size: 2.2, font: 'Libre Caslon Text', color: ink, fit: W * 0.55 }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 2.1, lh: 3.1, color: ink, font: 'Libre Caslon Text', fit: W * 0.6 }),
          Ln(m, H - m - 0.4, m + 12, H - m - 0.4, ink, 0.12),
          T(brand(c), { field: 'company', x: m, y: H - m - 1.4, oy: 'bottom', size: 1.8, font: 'Libre Caslon Text', it: true, color: ink, fit: W * 0.32 }),
        ] };
      },
    },


    topo: {
      name: tr('Topo zlatá', 'Topo zlatá'), fonts: 'tenor', pal: 'onyx', tags: ['reality', 'architekt', 'stavba', 'financie', 'konzultant', 'outdoor', 'firma', 'luxusne', 'tmave', 'serioze', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal);
        return { bg: { color: pal.bg }, objs: [
          ...topoPaths(W * 0.72, H * 0.55, 12, 2.9, seeded(f.name + 'tg')).map((d) => P(d, { stroke: g, sw: 0.12, opacity: 0.55 })),
          C(m + 4, H / 2, 4, { stroke: g, sw: 0.25 }),
          logoOr(c, m + 4, H / 2, 5.4, 5.4, { tint: g }, MONO(c, { x: m + 4, y: H / 2, ox: 'center', oy: 'center', size: 3, color: g, ls: 0.04 })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m + 10.5, y: H / 2 - 0.3, oy: 'bottom', size: 2.6, font: 'd', ls: 0.26, color: g, fit: W * 0.5 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: m + 10.5, y: H / 2 + 0.8, size: 1.6, font: 't', ls: 0.26, color: pal.ink, opacity: 0.75, fit: W * 0.5 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal);
        return { bg: { color: pal.bg }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: H / 2 - 1, oy: 'bottom', size: 3.2, font: 'd', ls: 0.2, color: g, fit: W * 0.45 }),
          T(f.role, { field: 'role', x: m, y: H / 2, size: 2, font: 't', ls: 0.06, color: pal.ink, opacity: 0.8, fit: W * 0.45 }),
          Ln(W * 0.53, m + 2, W * 0.53, H - m - 2, g, 0.15),
          ...contacts(c, { x: W * 0.53 + 3.5, yb: H / 2 + 4.6, keys: ['phone', 'email', 'web', 'address'], size: 2.05, lh: 3, color: pal.ink, fit: W * 0.41 - m }),
        ] };
      },
    },


  };
}
