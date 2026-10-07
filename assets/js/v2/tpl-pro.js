// Vizitkomat – šablóny podľa konkrétnych predlôh z Pinterestu (vkladá sa do TEMPLATES v templates.js)
// Každá šablóna: front(c), back(c) → { bg, objs }. Rozmery v mm (90 × 50), c.m = bezpečný okraj.
export function proTemplates(h) {
  const { T, R, C, Ln, P, QR, IMG, MONO, contacts, logoOr, mono, bare, city, splitName, mix, readable, luminance, tr, topoPaths, seeded, smooth, SCRIPT } = h;
  const FOIL = (pal) => 'foil:' + (pal.foil || 'gold');
  const first = (c) => splitName(bare(c.f.name) || c.f.name)[0] || c.f.name || '';
  const last = (c) => splitName(bare(c.f.name) || c.f.name)[1] || '';
  const brand = (c) => c.f.company || bare(c.f.name) || '';
  const has = (c, k) => !!(c.f[k] && c.f[k].trim());
  /** Riadky textu (zoznam) končiace na yb */
  const lines = (list, o) => {
    const L = list.filter(Boolean), lh = o.lh || o.size * 1.55;
    return L.map((t, i) => T(t, { x: o.x, y: o.yb - (L.length - 1 - i) * lh, ox: o.ox || 'left', oy: 'bottom', size: o.size, font: o.font || 't', w: o.w, color: o.color, ls: o.ls, upper: o.upper, fit: o.fit, it: o.it }));
  };
  /** Popis + hodnota (T 0905…) */
  const labeled = (c, keys, o) => {
    const ks = keys.filter((k) => has(c, k)), lh = o.lh || o.size * 1.65, lab = { phone: o.L?.phone || 'T', email: o.L?.email || 'E', web: o.L?.web || 'W', address: o.L?.address || 'A' };
    const out = [];
    ks.forEach((k, i) => {
      const y = o.yb - (ks.length - 1 - i) * lh;
      out.push(T(lab[k], { x: o.x, y, oy: 'bottom', size: o.size * 0.85, font: o.lfont || 't', w: 600, color: o.lcolor || o.color, ls: 0.12, upper: true }));
      out.push(T(c.f[k], { field: k, x: o.x + (o.lw || o.size * 1.6), y, oy: 'bottom', size: o.size, font: o.font || 't', w: o.w, color: o.color, fit: o.fit, ls: o.ls }));
    });
    return out;
  };

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

    alder: {
      name: 'Alder', fonts: 'poppins', pal: 'smaragd', tags: ['firma', 'architekt', 'konzultant', 'it', 'reality', 'financie', 'agentura', 'moderne', 'ciste', 'serioze', 'minimal', 'tmave'],
      front(c) {
        const { W, H, pal } = c; const fg = luminance(pal.bg) < 0.4 ? '#FFFFFF' : pal.ink;
        return { bg: { color: pal.bg }, objs: [
          logoOr(c, W / 2, H / 2, W * 0.6, H * 0.4, { tint: fg }, T(brand(c).replace(/\s+s\.?r\.?o\.?$/i, '') + '.', { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 8.5, font: 'd', w: 600, color: fg, ls: -0.03, fit: W - 18 })),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const dark = luminance(pal.bg) < 0.4 ? pal.bg : pal.ink;
        return { bg: { color: '#FBFAF7' }, objs: [
          ...topoPaths(W * 0.86, H * 0.12, 7, 2.6, seeded(f.name + 'a')).map((d) => P(d, { stroke: '#E5E2DA', sw: 0.12 })),
          T(brand(c).replace(/\s+s\.?r\.?o\.?$/i, '') + '.', { field: 'company', x: m, y: m - 0.4, size: 3.4, font: 'd', w: 600, color: dark, ls: -0.03, fit: W * 0.5 }),
          T(f.name, { field: 'name', x: m, y: H - m - 12.4, oy: 'bottom', size: 2.4, font: 't', w: 600, color: '#151515', fit: W * 0.5 }),
          T(f.role, { field: 'role', x: m, y: H - m - 12.4 + 0.5, size: 2.1, font: 't', color: '#555', fit: W * 0.5 }),
          ...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'web'], size: 2.1, lh: 2.95, color: '#151515', fit: W * 0.5 }),
          ...lines((f.address || '').split(',').map((s) => s.trim()), { x: W * 0.62, yb: H - m, size: 2.1, color: '#151515', fit: W * 0.33 }),
        ] };
      },
    },

    ticha: {
      name: tr('Tichá', 'Tichá'), fonts: 'tenor', pal: 'taupe', tags: ['architekt', 'dizajn', 'terapeut', 'psycholog', 'kouc', 'kozmetika', 'foto', 'minimal', 'jemne', 'elegantne', 'prirodne'],
      front(c) {
        const { W, H, f, pal } = c;
        return { bg: { color: pal.bg }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: H / 2 - 0.4, ox: 'center', oy: 'bottom', size: 2.7, font: 'd', ls: 0.36, color: pal.ink, fit: W - 20 }),
          T(f.role, { field: 'role', x: W / 2, y: H / 2 + 0.8, ox: 'center', size: 2, font: 't', color: mix(pal.ink, pal.bg, 0.35), fit: W - 24 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = '#2A2622';
        return { bg: { color: '#FBFAF7' }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m + 4, y: m, size: 2.2, font: 'd', ls: 0.3, color: ink, fit: W * 0.6 }),
          T(f.role, { field: 'role', x: m + 4, y: m + 3, size: 1.9, font: 't', color: '#77706A', fit: W * 0.6 }),
          C(W - m - 1, m + 1, 0.9, { fill: pal.bg }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['address', 'phone', 'email'], size: 2.05, lh: 3, color: ink, fit: W * 0.55 }),
          T(f.web || '', { field: 'web', x: m - 1.2, y: H / 2, ox: 'center', oy: 'center', size: 1.8, font: 't', ls: 0.12, color: '#77706A', rot: -90 }),
        ] };
      },
    },

    bodka: {
      name: tr('Bodka', 'Tečka'), fonts: 'poppins', pal: 'koral', tags: ['it', 'startup', 'agentura', 'marketing', 'dizajn', 'konzultant', 'firma', 'moderne', 'minimal', 'odvazne', 'ciste'],
      front(c) {
        const { W, H, pal, m } = c;
        return { bg: { color: '#EFEBE3' }, objs: [
          logoOr(c, m, m, 26, 9, { ax: 'left', ay: 'top' }, T(brand(c).toLocaleLowerCase(), { field: 'company', x: m - 0.3, y: m - 1.2, size: 6.2, font: 'd', w: 700, color: '#141414', ls: -0.04, fit: W * 0.7 })),
          C(W * 0.5, H * 0.66, 3.1, { fill: pal.accent }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const y = H * 0.32, s = 2.15, lh = 3.1;
        return { bg: { color: '#EFEBE3' }, objs: [
          ...lines([f.name, f.role, f.email, f.phone], { x: m + 2, yb: y + lh * 3, size: s, lh, color: '#141414', fit: W * 0.42 }),
          ...lines([...(f.address || '').split(',').map((x) => x.trim()), f.web], { x: W * 0.53, yb: y + lh * 3, size: s, lh, color: '#141414', fit: W * 0.4 }),
          T('#1', { x: m + 2, y: H - m, oy: 'bottom', size: 1.6, font: 't', color: '#8A857C' }),
        ] };
      },
    },

    bistro: {
      name: 'Bistro', fonts: 'rubik', pal: 'krieda', tags: ['gastro', 'kaviaren', 'restauracia', 'bistro', 'pekaren', 'bar', 'obchod', 'hrave', 'odvazne', 'moderne', 'mlade'],
      front(c) {
        const { W, H, pal } = c;
        return { bg: { color: '#EFE6D6' }, objs: [
          logoOr(c, W / 2, H / 2, W * 0.6, H * 0.5, {}, T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 12, font: 'd', w: 900, color: '#121212', ls: -0.06, fit: W - 16 })),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const mono = 'Space Mono', ink = '#121212';
        const svc = (c.f.tagline || c.f.role || '').toLocaleUpperCase();
        return { bg: { color: '#EFE6D6' }, objs: [
          T(svc, { field: 'tagline', x: m, y: m, size: 1.9, font: mono, w: 700, color: ink, fit: W - 2 * m, ls: 0.1 }),
          P(smooth([[W * 0.6, H * 0.85], [W * 0.66, H * 0.45], [W * 0.82, H * 0.34], [W * 0.9, H * 0.55], [W * 0.78, H * 0.8], [W * 0.68, H * 0.62], [W * 0.84, H * 0.42], [W + 3, H * 0.4]]), { stroke: ink, sw: 0.45 }),
          ...lines([f.address, f.email], { x: m, yb: H - m - 3.2, size: 1.95, font: mono, color: ink, fit: W * 0.55 }),
          T(f.name, { field: 'name', x: m, y: H - m, oy: 'bottom', size: 1.95, font: mono, w: 700, color: ink, fit: W * 0.45 }),
          T(f.phone || '', { field: 'phone', x: W - m, y: H - m, ox: 'right', oy: 'bottom', size: 1.95, font: mono, w: 700, color: ink }),
        ] };
      },
    },

    galeria: {
      name: tr('Galéria', 'Galerie'), fonts: 'italiana', pal: 'krieda', tags: ['foto', 'umelec', 'galeria', 'architekt', 'dizajn', 'svadba', 'interier', 'butik', 'elegantne', 'minimal', 'luxusne', 'jemne'],
      front(c) {
        const { W, H, f, pal, m } = c; const muted = mix(pal.ink, pal.bg, 0.45);
        return { bg: { color: pal.bg }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.42, ox: 'center', oy: 'center', size: 11, font: 'd', color: pal.ink, ls: 0.02, fit: W - 2 * m + 2 }),
          ...lines([f.role, city(c)], { x: m, yb: H - m, size: 2, font: 'Libre Caslon Text', color: muted, fit: W * 0.42 }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['email', 'web'], size: 2, lh: 2.9, color: muted, font: 'Libre Caslon Text', fit: W * 0.48 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(f.tagline || f.name, { field: f.tagline ? 'tagline' : 'name', x: W / 2, y: H * 0.42, ox: 'center', oy: 'center', size: 6, font: SCRIPT, color: pal.ink, fit: W - 20 }),
          T(f.name, { field: 'name', x: W / 2, y: H * 0.42 + 6.4, ox: 'center', oy: 'center', size: 2, font: 't', upper: true, ls: 0.3, color: mix(pal.ink, pal.bg, 0.4), fit: W - 24 }),
          T(brand(c).toLocaleUpperCase(), { x: W / 2, y: H + 4.6, ox: 'center', oy: 'bottom', size: 11, font: 'd', color: mix(pal.ink, pal.bg, 0.88), fit: W - 2 * m + 2 }),
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

    stoh: {
      name: tr('Stoh', 'Stoh'), fonts: 'josefin', pal: 'cervena', tags: ['marketing', 'agentura', 'moda', 'butik', 'kreativ', 'event', 'hudba', 'odvazne', 'moderne', 'farebne'],
      front(c) {
        const { W, H, f, pal, m } = c; const words = brand(c).toLocaleUpperCase().split(/\s+/).slice(0, 3).join('\n');
        return { bg: { color: pal.bg }, objs: [
          T(words, { field: 'company', x: m - 0.2, y: m - 0.6, size: 5.6, font: 'd', w: 300, lh: 0.95, color: pal.ink, fit: W * 0.55 }),
          T(f.name, { field: 'name', x: m, y: H - m - 3, oy: 'bottom', size: 2.4, font: 't', w: 600, color: pal.ink, fit: W * 0.42 }),
          T(f.role, { field: 'role', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', color: pal.ink, opacity: 0.8, fit: W * 0.42 }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 1.95, lh: 2.8, color: pal.ink, fit: W * 0.48 }),
        ] };
      },
      back(c) {
        const { W, H, pal } = c;
        return { bg: { color: pal.ink }, objs: [
          T(brand(c).toLocaleUpperCase(), { x: -6, y: H * 0.95, oy: 'bottom', size: 22, font: 'd', w: 300, color: pal.bg, rot: -18, ls: 0.02 }),
        ] };
      },
    },

    organic: {
      name: 'Organic', fonts: 'poppins', pal: 'mint', tags: ['eko', 'bio', 'farma', 'zahrady', 'kvety', 'wellness', 'joga', 'kozmetika', 'kaviaren', 'prirodne', 'jemne', 'ciste', 'minimal'],
      front(c) {
        const { W, H, f, pal, m } = c; const fg = readable(pal.ink, pal);
        return { bg: { color: pal.bg }, objs: [
          T(brand(c), { field: 'company', x: m, y: m, size: 2.1, font: 't', w: 500, color: pal.ink, fit: W * 0.6 }),
          C(W - m - 6, H * 0.62, 5.2, { fill: pal.ink }),
          logoOr(c, W - m - 6, H * 0.62, 6.4, 6.4, { tint: fg }, MONO(c, { x: W - m - 6, y: H * 0.62, ox: 'center', oy: 'center', size: 3.4, w: 600, color: fg, ls: 0.02 })),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const fg = readable(pal.ink, pal);
        return { bg: { color: pal.soft }, objs: [
          C(m + 4, m + 4, 4, { fill: pal.ink }),
          logoOr(c, m + 4, m + 4, 5, 5, { tint: fg }, MONO(c, { x: m + 4, y: m + 4, ox: 'center', oy: 'center', size: 2.6, w: 600, color: fg })),
          ...lines([f.name, f.role, f.phone, f.email], { x: m, yb: H - m, size: 2.05, color: '#1A1A1A', fit: W * 0.45 }),
          ...lines([brand(c), ...(f.address || '').split(',').map((x) => x.trim()), f.web], { x: W * 0.55, yb: H - m, size: 2.05, color: '#1A1A1A', fit: W * 0.4 }),
        ] };
      },
    },

    ahoj: {
      name: tr('Ahoj', 'Ahoj'), fonts: 'abril', pal: 'pastel', tags: ['deti', 'kreativ', 'marketing', 'terapeut', 'skola', 'cukraren', 'kaviaren', 'hrave', 'farebne', 'mlade', 'odvazne'],
      front(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(tr('Ahoj', 'Ahoj'), { x: m - 1.5, y: H * 0.56, oy: 'bottom', size: 22, font: 'Archivo Black', color: pal.accent, ls: -0.04 }),
          P(`M ${W * 0.52} ${H * 0.66} C ${W * 0.6} ${H * 0.86} ${W * 0.8} ${H * 0.86} ${W * 0.88} ${H * 0.64}`, { stroke: pal.accent, sw: 1.1 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: H - m, oy: 'bottom', size: 1.8, font: 't', w: 600, ls: 0.3, color: pal.accent, fit: W * 0.45 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const fg = pal.bg;
        return { bg: { color: pal.accent }, objs: [
          T((bare(f.name) || f.name).toLocaleLowerCase(), { field: 'name', x: W / 2, y: H * 0.36, ox: 'center', oy: 'center', size: 6, font: 'd', color: fg, fit: W - 18 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.36 + 4.4, ox: 'center', oy: 'center', size: 1.7, font: 't', w: 600, ls: 0.3, color: fg, fit: W - 24 }),
          ...contacts(c, { x: m + 2, yb: H - m, keys: ['email', 'phone'], size: 1.95, lh: 2.8, color: fg, fit: W * 0.42 }),
          ...contacts(c, { x: W - m - 2, yb: H - m, align: 'right', keys: ['web', 'address'], size: 1.95, lh: 2.8, color: fg, fit: W * 0.42 }),
        ] };
      },
    },

    luxury: {
      name: 'Luxury', fonts: 'caslon', pal: 'noblesa', tags: ['pravnik', 'advokat', 'financie', 'reality', 'hotel', 'konzultant', 'manazer', 'luxusne', 'elegantne', 'serioze', 'tmave', 'klasicky'],
      front(c) {
        const { W, H, pal } = c; const g = FOIL(pal);
        return { bg: { color: pal.bg }, objs: [
          logoOr(c, W / 2, H / 2, W * 0.5, H * 0.4, { tint: g }, T(brand(c), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 5.2, font: 'd', color: g, fit: W - 24 })),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal); const top = H * 0.32, ly = H * 0.52;
        return { bg: { color: pal.bg }, objs: [
          T(f.name, { field: 'name', x: m + 3, y: top, oy: 'bottom', size: 3.6, font: 'd', color: g, fit: W * 0.7 }),
          T(f.role, { field: 'role', x: m + 3, y: top + 0.9, size: 1.9, font: 't', color: pal.ink, opacity: 0.85, fit: W * 0.7 }),
          Ln(m + 3, ly, W - m - 3, ly, g, 0.12),
          Ln(W * 0.52, ly + 2, W * 0.52, H - m - 1.5, g, 0.12),
          Ln(m + 3, H - m, W - m - 3, H - m, g, 0.12),
          ...lines((f.address || '').split(',').map((x) => x.trim()), { x: m + 3, yb: H - m - 2.2, size: 1.95, color: pal.ink, fit: W * 0.42 - m }),
          ...lines([f.phone, f.email, f.web], { x: W * 0.52 + 3, yb: H - m - 2.2, size: 1.95, color: pal.ink, fit: W * 0.45 - m }),
        ] };
      },
    },

    obrys: {
      name: tr('Obrys', 'Obrys'), fonts: 'dmserif', pal: 'sneh', tags: ['architekt', 'dizajn', 'umelec', 'foto', 'galeria', 'moda', 'minimal', 'odvazne', 'elegantne', 'moderne'],
      front(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: '#F4F3F0' }, objs: [
          T((last(c) || first(c)).toLocaleUpperCase(), { x: W * 0.15, y: H * 1.25, oy: 'bottom', size: 26, font: 'd', color: '#E3E1DC', rot: -52 }),
          T(f.name, { field: 'name', x: W - m, y: m, ox: 'right', size: 2.4, font: 'd', color: '#2A2A2A', fit: W * 0.5 }),
          T(f.role, { field: 'role', x: W - m, y: m + 3.2, ox: 'right', size: 1.8, font: 't', upper: true, ls: 0.22, color: '#7A7873', fit: W * 0.5 }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email', 'web'], size: 1.95, lh: 2.8, color: '#2A2A2A', fit: W * 0.5 }),
        ] };
      },
      back(c) {
        const { W, H, f } = c;
        return { bg: { color: '#F4F3F0' }, objs: [
          T((last(c) || first(c)).toLocaleUpperCase(), { x: -4, y: H * 0.9, oy: 'bottom', size: 30, font: 'd', color: '#FFFFFF', rot: -38 }),
          T((last(c) || first(c)).toLocaleUpperCase(), { x: -4.4, y: H * 0.9 - 0.4, oy: 'bottom', size: 30, font: 'd', color: '#E6E4DF', opacity: 0.6, rot: -38 }),
        ] };
      },
    },

    olivia: {
      name: 'Olivia', fonts: 'cinzel', pal: 'ivory', tags: ['beauty', 'kozmetika', 'salon', 'svadba', 'event', 'kouc', 'foto', 'butik', 'reality', 'elegantne', 'luxusne', 'zenske'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal);
        return { bg: { color: pal.bg }, objs: [
          T(first(c).toLocaleUpperCase(), { field: 'name', part: 0, x: W / 2, y: H * 0.48, ox: 'center', oy: 'center', size: 7.4, font: 'd', ls: 0.06, color: g, fit: W - 24 }),
          T((last(c) || f.company || '').toLocaleLowerCase(), { x: W / 2 + 7, y: H * 0.6, ox: 'center', oy: 'center', size: 8.6, font: SCRIPT, color: pal.ink, rot: -10, fit: W * 0.55 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: H * 0.8, ox: 'center', oy: 'center', size: 1.6, font: 't', ls: 0.28, color: g, fit: W * 0.4 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal); const qs = 15, cx = m + 1;
        return { bg: { color: pal.bg }, objs: [
          T(tr('NAPÍŠTE MI', 'NAPIŠTE MI'), { x: cx + qs / 2, y: m + 0.6, ox: 'center', size: 1.6, font: 't', ls: 0.26, color: pal.ink, fit: qs + 2 }),
          R(cx - 0.6, m + 3.6, qs + 1.2, qs + 1.2, '#FFFFFF'),
          QR(cx, m + 4.2, qs, '#1A1A1A'),
          T(f.web || '', { field: 'web', x: cx + qs / 2, y: m + qs + 6.4, ox: 'center', size: 1.6, font: 't', color: pal.ink, fit: qs + 4 }),
          Ln(cx + qs + 5, m + 1, cx + qs + 5, H - m - 1, g, 0.18),
          T(first(c).toLocaleUpperCase(), { field: 'name', x: cx + qs + 9, y: m + 5, oy: 'bottom', size: 4.2, font: 'd', ls: 0.06, color: g, fit: W - cx - qs - 9 - m }),
          T((last(c) || '').toLocaleLowerCase(), { x: cx + qs + 18, y: m + 6.6, oy: 'center', size: 5, font: SCRIPT, color: pal.ink, rot: -8 }),
          ...contacts(c, { x: cx + qs + 9, yb: H - m, keys: ['phone', 'email', 'address'], size: 2, lh: 3, color: pal.ink, fit: W - cx - qs - 9 - m }),
        ] };
      },
    },

    morton: {
      name: 'Morton', fonts: 'josefin', pal: 'smaragd', tags: ['architekt', 'stavba', 'reality', 'firma', 'financie', 'konzultant', 'pravnik', 'luxusne', 'serioze', 'tmave', 'moderne'],
      front(c) {
        const { W, H, pal } = c; const g = FOIL(pal); const mk = mono(c); const o = [];
        for (let y = 2, r = 0; y < H + 4; y += 8, r++) for (let x = 3; x < W + 4; x += 11) o.push(T(mk, { x, y, ox: 'center', oy: 'center', size: 4.2, font: 'd', w: 300, color: mix(g === 'foil:gold' ? '#D9BB72' : '#DDD', pal.bg, 0.72), ls: 0.1 }));
        o.push(R(W / 2 - 8, H / 2 - 5, 16, 10, pal.bg));
        o.push(logoOr(c, W / 2, H / 2, 12, 8, { tint: g }, MONO(c, { x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 6, w: 300, color: g, ls: 0.12 })));
        return { bg: { color: pal.bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: '#FBFAF7' }, objs: [
          logoOr(c, W - m - 22, m + 2.4, 6, 6, { tint: pal.bg }, MONO(c, { x: W - m - 22, y: m + 2.6, ox: 'center', oy: 'center', size: 3.4, w: 300, color: pal.bg, ls: 0.1 })),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W - m - 17, y: m + 2.6, oy: 'center', size: 2.3, font: 'd', w: 400, ls: 0.12, color: pal.bg, fit: 20 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m, y: H * 0.58, oy: 'bottom', size: 2.3, font: 't', w: 700, ls: 0.06, color: '#1A1A1A', fit: W * 0.55 }),
          T(f.role, { field: 'role', x: m, y: H * 0.58 + 0.6, size: 1.9, font: 't', color: '#555', fit: W * 0.55 }),
          ...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email'], size: 1.95, lh: 2.8, color: '#1A1A1A', fit: W * 0.55 }),
          T(f.web || '', { field: 'web', x: W - m, y: H - m, ox: 'right', oy: 'bottom', size: 1.95, font: 't', color: '#1A1A1A' }),
          R(W - 22, H - 1.6, 24, 3.6, pal.bg),
        ] };
      },
    },

    ar: {
      name: tr('Iniciály AR', 'Iniciály AR'), fonts: 'dmserif', pal: 'ivory', tags: ['pravnik', 'advokat', 'financie', 'konzultant', 'architekt', 'reality', 'firma', 'luxusne', 'elegantne', 'serioze', 'klasicky'],
      front(c) {
        const { W, H, pal } = c; const mk = mono(c); const ink = luminance(pal.bg) > 0.5 ? '#1A1A1A' : pal.ink;
        const objs = [];
        if (c.logo) objs.push(logoOr(c, W / 2, H * 0.42, W * 0.4, H * 0.4, {}, null));
        else {
          objs.push(T(mk[0] || '', { x: W / 2 - 2.2, y: H * 0.44, ox: 'center', oy: 'center', size: 15, font: 'd', color: ink }));
          if (mk[1]) objs.push(T(mk[1], { x: W / 2 + 3.4, y: H * 0.47, ox: 'center', oy: 'center', size: 13, font: 'd', color: ink }));
        }
        objs.push(T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.74, ox: 'center', oy: 'center', size: 2.2, font: 't', w: 500, ls: 0.3, color: ink, fit: W - 24 }));
        return { bg: { color: pal.bg }, objs };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const mk = mono(c); const ink = luminance(pal.bg) > 0.5 ? '#1A1A1A' : pal.ink;
        return { bg: { color: pal.bg }, objs: [
          T(mk, { x: m + 10, y: H / 2, ox: 'center', oy: 'center', size: 18, font: 'd', color: mix(ink, pal.bg, 0.92) }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W * 0.46, y: H * 0.36, oy: 'bottom', size: 2.4, font: 't', w: 600, ls: 0.14, color: ink, fit: W * 0.5 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W * 0.46, y: H * 0.36 + 0.7, size: 1.7, font: 't', ls: 0.2, color: mix(ink, pal.bg, 0.4), fit: W * 0.5 }),
          ...contacts(c, { x: W * 0.46, yb: H - m, keys: ['phone', 'email', 'address'], size: 2, lh: 2.9, color: ink, fit: W * 0.5 }),
        ] };
      },
    },

    letterpress: {
      name: 'Letterpress', fonts: 'tenor', pal: 'sneh', tags: ['architekt', 'dizajn', 'foto', 'umelec', 'konzultant', 'firma', 'minimal', 'elegantne', 'ciste', 'jemne'],
      front(c) {
        const { W, H, f } = c;
        return { bg: { color: '#F2F1EE' }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2 + 0.25, y: H / 2 + 0.25, ox: 'center', oy: 'center', size: 5, font: 'd', ls: 0.24, color: '#FFFFFF', fit: W - 16 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 5, font: 'd', ls: 0.24, color: '#CFCCC6', fit: W - 16 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#3A3A3A';
        return { bg: { color: '#F2F1EE' }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m, y: m, size: 2.1, font: 't', w: 500, ls: 0.16, color: ink, fit: W * 0.4 }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W * 0.52, y: m, size: 2.1, font: 't', w: 500, ls: 0.16, color: ink, fit: W * 0.42 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W * 0.52, y: m + 2.9, size: 2.1, font: 't', ls: 0.16, color: ink, fit: W * 0.42 }),
          ...contacts(c, { x: m, yb: H - m, keys: ['email', 'web'], size: 2.05, lh: 2.9, color: ink, fit: W * 0.45 }),
          T(f.phone || '', { field: 'phone', x: W * 0.52, y: H - m, oy: 'bottom', size: 2.05, font: 't', color: ink }),
        ] };
      },
    },

    egon: {
      name: 'Egon', fonts: 'dmserif', pal: 'cervena', tags: ['kaviaren', 'restauracia', 'vino', 'bar', 'gastro', 'moda', 'butik', 'galeria', 'odvazne', 'elegantne', 'tmave', 'farebne'],
      front(c) {
        const { W, H, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m - 1, y: m - 2.2, size: 15, font: 'd', color: pal.accent, ls: -0.02, fit: W - 2 * m + 2 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const mono = 'Space Mono';
        return { bg: { color: pal.bg }, objs: [
          ...lines([...(f.address || '').split(',').map((x) => x.trim()), f.phone ? tr('Tel. ', 'Tel. ') + f.phone : ''], { x: m, yb: m + 9, size: 2.1, font: mono, color: pal.accent, fit: W * 0.6 }),
          T((f.web || f.email || '').toLocaleUpperCase(), { field: 'web', x: W - m, y: H * 0.56, ox: 'right', size: 1.6, font: 't', w: 600, ls: 0.12, color: pal.accent, fit: W * 0.5 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: m, y: H - m, oy: 'bottom', size: 1.6, font: 't', w: 600, ls: 0.12, color: pal.accent, fit: W * 0.7 }),
        ] };
      },
    },

    velora: {
      name: 'Velora', fonts: 'cinzel', pal: 'olive', tags: ['dizajn', 'branding', 'kozmetika', 'kvety', 'wellness', 'svadba', 'foto', 'kouc', 'elegantne', 'luxusne', 'prirodne', 'zenske'],
      front(c) {
        const { W, H, f, pal } = c; const g = FOIL(pal); const ink = '#3A3A33';
        const lx = W / 2, ly = H * 0.28;
        return { bg: { color: pal.soft }, objs: [
          logoOr(c, lx, ly, 10, 8, { tint: g }, MONO(c, { x: lx, y: ly, ox: 'center', oy: 'center', size: 6, color: g, ls: -0.08 })),
          P(smooth([[lx - 4.5, ly + 4], [lx - 6.5, ly], [lx - 5, ly - 4.5], [lx - 2, ly - 6]]), { stroke: g, sw: 0.15 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H * 0.57, ox: 'center', oy: 'center', size: 3.4, font: 'd', ls: 0.18, color: ink, fit: W - 18 }),
          C(W / 2, H * 0.68, 0.5, { fill: g }),
          Ln(W / 2 - 12, H * 0.68, W / 2 - 1.5, H * 0.68, g, 0.1), Ln(W / 2 + 1.5, H * 0.68, W / 2 + 12, H * 0.68, g, 0.1),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.77, ox: 'center', oy: 'center', size: 1.5, font: 't', ls: 0.3, color: ink, fit: W - 24 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const g = FOIL(pal);
        return { bg: { color: pal.bg }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: m + 2, y: H * 0.46, oy: 'bottom', size: 3.2, font: 'd', ls: 0.12, color: pal.ink, fit: W * 0.42 }),
          T(f.role, { field: 'role', x: m + 3, y: H * 0.46 + 1, size: 3.6, font: SCRIPT, color: g, fit: W * 0.4 }),
          Ln(W * 0.5, m + 3, W * 0.5, H - m - 3, g, 0.14),
          ...contacts(c, { x: W * 0.5 + 3.4, yb: H / 2 + 4.6, keys: ['phone', 'email', 'web', 'address'], size: 2, lh: 3, icons: true, lcolor: g, color: pal.ink, fit: W * 0.44 - m }),
        ] };
      },
    },

    groom: {
      name: tr('Monogram stĺpec', 'Monogram sloupec'), fonts: 'italiana', pal: 'taupe', tags: ['svadba', 'beauty', 'kozmetika', 'foto', 'butik', 'dizajn', 'umelec', 'elegantne', 'jemne', 'minimal', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c; const mk = mono(c); const ink = '#2E2622';
        return { bg: { color: '#E9E1D5' }, objs: [
          T(mk[0] || '', { x: m + 6, y: H * 0.28, ox: 'center', oy: 'center', size: 8, font: 'd', color: ink }),
          T('+', { x: m + 6, y: H * 0.5, ox: 'center', oy: 'center', size: 3.4, font: 'd', color: ink }),
          T(mk[1] || mk[0] || '', { x: m + 6, y: H * 0.72, ox: 'center', oy: 'center', size: 8, font: 'd', color: ink }),
          T(first(c).toLocaleLowerCase(), { field: 'name', part: 0, x: W - m - 3, y: H * 0.68, ox: 'right', oy: 'center', size: 9, font: SCRIPT, color: ink, fit: W * 0.55 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#2E2622';
        return { bg: { color: '#F4F0EA' }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W / 2, y: H * 0.36, ox: 'center', oy: 'center', size: 3, font: 'd', ls: 0.24, color: ink, fit: W - 20 }),
          T(f.role, { field: 'role', x: W / 2, y: H * 0.36 + 3.4, ox: 'center', oy: 'center', size: 2, font: 't', color: '#7A7068', fit: W - 24 }),
          ...contacts(c, { x: W / 2, yb: H - m, align: 'center', keys: ['phone', 'email', 'web'], size: 2, lh: 2.9, color: ink, fit: W - 20 }),
        ] };
      },
    },

    maison: {
      name: 'Maison', fonts: 'dmserif', pal: 'burgundy', tags: ['kader', 'salon', 'beauty', 'kozmetika', 'moda', 'butik', 'interier', 'kaviaren', 'elegantne', 'luxusne', 'tmave', 'zenske'],
      front(c) {
        const { W, H, pal } = c; const words = brand(c).toLocaleLowerCase().split(/\s+/);
        const txt = words.length > 1 ? words.slice(0, -1).join(' ') + '\n' + words[words.length - 1] : words[0];
        return { bg: { color: pal.bg }, objs: [
          T(txt, { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 7.2, font: 'd', color: pal.ink, lh: 0.86, fit: W - 22 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = '#2A1A1A';
        return { bg: { color: pal.soft }, objs: [
          T(f.name, { field: 'name', x: m, y: m + 0.4, size: 3.2, font: 'd', color: ink, fit: W * 0.6 }),
          T(f.role, { field: 'role', x: m, y: m + 4.4, size: 1.9, font: 't', color: '#6A5A55', fit: W * 0.6 }),
          T(brand(c).toLocaleLowerCase(), { x: W - m - 1, y: H / 2, ox: 'center', oy: 'center', size: 4.2, font: 'd', color: ink, rot: 90 }),
          ...contacts(c, { x: m, yb: H - m, keys: ['phone', 'email', 'address'], size: 1.95, lh: 2.8, color: ink, fit: W * 0.72 }),
          T('✱', { x: W - m - 1, y: H - m, ox: 'center', oy: 'bottom', size: 3, font: 't', color: pal.bg }),
        ] };
      },
    },

    muse: {
      name: 'Muse', fonts: 'dmserif', pal: 'periwinkle', tags: ['kozmetika', 'beauty', 'lekar', 'estetika', 'wellness', 'terapeut', 'kouc', 'dizajn', 'jemne', 'elegantne', 'moderne', 'zenske'],
      front(c) {
        const { W, H, f, pal } = c;
        return { bg: { color: pal.bg }, objs: [
          T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H * 0.46, ox: 'center', oy: 'center', size: 7.4, font: 'd', color: '#FFFFFF', fit: W - 22 }),
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: W / 2, y: H * 0.46 + 5.6, ox: 'center', oy: 'center', size: 1.55, font: 't', ls: 0.4, color: '#FFFFFF', opacity: 0.9, fit: W - 26 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: pal.soft }, objs: [
          T(f.role, { field: 'role', x: m, y: m, size: 1.8, font: 't', w: 500, color: '#555', fit: W * 0.5 }),
          T(mono(c).toLocaleLowerCase(), { x: W - m, y: m - 0.8, ox: 'right', size: 4, font: 'd', color: pal.bg }),
          T(f.name, { field: 'name', x: m, y: H / 2 + 1, oy: 'center', size: 5.4, font: 'd', it: true, color: pal.bg, fit: W - 2 * m }),
          T(f.web || '', { field: 'web', x: m, y: H - m, oy: 'bottom', size: 1.85, font: 't', color: '#555' }),
          ...contacts(c, { x: W - m, yb: H - m, align: 'right', keys: ['phone', 'email'], size: 1.85, lh: 2.7, color: '#555', fit: W * 0.5 }),
        ] };
      },
    },

    casa: {
      name: 'Casa', fonts: 'cinzel', pal: 'ivory', tags: ['interier', 'architekt', 'dizajn', 'reality', 'hotel', 'penzion', 'nabytok', 'stolar', 'minimal', 'elegantne', 'jemne', 'luxusne'],
      front(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: m + 1, y: H - m - 1, oy: 'bottom', size: 3.6, font: 'd', w: 600, ls: 0.16, color: '#1E1B18', fit: W * 0.7 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = '#1E1B18';
        return { bg: { color: pal.bg }, objs: [
          C(W - m - 3.5, m + 3.5, 3.4, { stroke: ink, sw: 0.18 }),
          logoOr(c, W - m - 3.5, m + 3.5, 4.4, 4.4, {}, MONO(c, { x: W - m - 3.5, y: m + 3.5, ox: 'center', oy: 'center', size: 2.4, color: ink, ls: 0.04 })),
          ...lines([brand(c).toLocaleUpperCase(), (f.tagline || f.role || '').toLocaleUpperCase()], { x: m + 1, yb: H - m - 13, size: 1.8, w: 600, ls: 0.12, color: ink, fit: W * 0.7 }),
          ...lines([f.name, f.phone, f.email, f.web], { x: m + 1, yb: H - m, size: 1.95, color: ink, fit: W * 0.7 }),
        ] };
      },
    },

    perla: {
      name: tr('Perla', 'Perla'), fonts: 'cinzel', pal: 'onyx', tags: ['luxus', 'sperky', 'beauty', 'reality', 'pravnik', 'hotel', 'moda', 'luxusne', 'tmave', 'minimal', 'elegantne'],
      front(c) {
        const { W, H, pal } = c;
        return { bg: { color: '#151515' }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2 + 0.18, y: H / 2 + 0.18, ox: 'center', oy: 'center', size: 4.8, font: 'd', ls: 0.2, color: '#050505', fit: W - 20 }),
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 4.8, font: 'd', ls: 0.2, color: '#2C2C2C', fit: W - 20 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const ink = '#1A1A1A'; const qs = 12;
        return { bg: { color: '#F7F6F3' }, objs: [
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: W - m, y: m, ox: 'right', size: 2.6, font: 'd', w: 600, ls: 0.2, color: ink, fit: W * 0.6 }),
          T(f.role, { field: 'role', x: W - m, y: m + 3.4, ox: 'right', size: 2, font: 'Libre Caslon Text', it: true, color: '#6A6A6A', fit: W * 0.6 }),
          QR(m, H - m - qs, qs, ink),
          Ln(m + qs + 3, H - m - qs, m + qs + 3, H - m, ink, 0.12),
          ...contacts(c, { x: m + qs + 6, yb: H - m, keys: ['phone', 'email', 'web', 'address'], size: 1.95, lh: 2.75, color: ink, fit: W - m - qs - 6 - m }),
        ] };
      },
    },

    pruhy: {
      name: tr('Pruhy', 'Pruhy'), fonts: 'abril', pal: 'cokolada', tags: ['kozmetika', 'beauty', 'salon', 'kaviaren', 'cukraren', 'butik', 'moda', 'retro', 'hrave', 'odvazne', 'teple', 'zenske'],
      front(c) {
        const { W, H, pal } = c; const o = []; const sw = 3.2;
        for (let x = -2, i = 0; x < W + 2; x += sw, i++) if (i % 2) o.push(R(x, -2, sw, H + 4, mix(pal.bg, '#000000', 0.25)));
        o.push(T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 9, font: 'd', color: pal.accent === pal.bg ? pal.ink : '#F2A7B8', fit: W - 16, ls: -0.02 }));
        return { bg: { color: pal.bg }, objs: o };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const pink = '#F2A7B8'; const qs = 12;
        return { bg: { color: pal.bg }, objs: [
          T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: m + 1.5, ox: 'center', oy: 'center', size: 4.2, font: 'd', color: pink, fit: W - 20 }),
          R(m + 1.5, H - m - qs - 0.6, qs + 1.2, qs + 1.2, '#FFFFFF'),
          QR(m + 2.1, H - m - qs, qs, pal.bg),
          Ln(W * 0.4, H - m - qs, W * 0.4, H - m, pink, 0.15),
          ...contacts(c, { x: W * 0.4 + 3, yb: H - m, keys: ['phone', 'email', 'address'], size: 2, lh: 3, color: pal.ink, fit: W * 0.55 - m }),
        ] };
      },
    },

    maitland: {
      name: 'Maitland', fonts: 'dmserif', pal: 'mint', tags: ['pravnik', 'konzultant', 'financie', 'reality', 'architekt', 'firma', 'kaviaren', 'vydavatel', 'elegantne', 'serioze', 'ciste', 'moderne'],
      front(c) {
        const { W, H, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(brand(c), { field: 'company', x: m - 0.4, y: H - m + 0.6, oy: 'bottom', size: 9.5, font: 'd', color: pal.ink, ls: -0.01, fit: W - 2 * m }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(f.name, { field: 'name', x: m, y: m, size: 2.2, font: 't', w: 500, color: pal.ink, fit: W * 0.55 }),
          T(f.role, { field: 'role', x: m, y: m + 3, size: 2.1, font: 't', color: mix(pal.ink, pal.bg, 0.4), fit: W * 0.55 }),
          ...contacts(c, { x: W * 0.52, yb: H * 0.66, keys: ['phone', 'email', 'web'], size: 2.05, lh: 2.95, color: pal.ink, fit: W * 0.44 }),
          ...lines((f.address || '').split(',').map((x) => x.trim()), { x: W * 0.52, yb: H - m, size: 2.05, color: pal.ink, fit: W * 0.44 }),
        ] };
      },
    },

    figlia: {
      name: 'Figlia', fonts: 'caslon', pal: 'salvia', tags: ['restauracia', 'kaviaren', 'pekaren', 'vino', 'bistro', 'kvety', 'obchod', 'remeslo', 'elegantne', 'prirodne', 'klasicky', 'teple'],
      front(c) {
        const { W, H, pal } = c; const bg = mix(pal.accent, '#2F3B32', 0.15);
        return { bg: { color: bg }, objs: [
          T(brand(c), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 8.4, font: 'd', w: 700, color: '#FFFFFF', fit: W - 20 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = mix(pal.accent, '#FFFFFF', 0.2);
        return { bg: { color: bg }, objs: [
          ...lines([f.phone, f.email, ''].concat((f.address || '').split(',').map((x) => x.trim())).map((x) => (x || '').toLocaleUpperCase()), { x: W / 2, ox: 'center', yb: H / 2 + 6, size: 1.95, lh: 3.1, ls: 0.3, color: '#FFFFFF', fit: W - 16 }),
        ] };
      },
    },

    ostraka: {
      name: 'Ostraka', fonts: 'poppins', pal: 'sneh', tags: ['architekt', 'dizajn', 'keramika', 'umelec', 'galeria', 'studio', 'it', 'minimal', 'moderne', 'ciste', 'jemne'],
      front(c) {
        const { W, H, f, m } = c; const ink = '#151515';
        return { bg: { color: '#E8E6E1' }, objs: [
          ...lines([f.role, f.tagline], { x: W - m, ox: 'right', yb: m + 4.4, size: 1.85, color: ink, fit: W * 0.5 }),
          Ln(-2, H * 0.58, W + 2, H * 0.58, '#BDB9B1', 0.1),
          T(brand(c).toLocaleLowerCase(), { field: 'company', x: W - m + 0.4, y: H - m + 1, ox: 'right', oy: 'bottom', size: 9, font: 'd', w: 500, color: ink, ls: -0.03, fit: W - 2 * m }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#151515'; const [a, b] = splitName(f.name);
        return { bg: { color: '#E8E6E1' }, objs: [
          T((a || f.name) + (b ? '\n' + b : ''), { field: 'name', x: m, y: m - 0.4, size: 3.4, font: 'd', w: 500, lh: 1, color: ink, fit: W * 0.5 }),
          ...contacts(c, { x: W * 0.56, yb: m + 8.4, keys: ['phone', 'email', 'web'], size: 1.95, lh: 2.75, color: ink, fit: W * 0.4 }),
          ...lines((f.address || '').split(',').map((x) => x.trim()), { x: W * 0.56, yb: H - m, size: 1.95, color: ink, fit: W * 0.4 }),
        ] };
      },
    },

    hrastar: {
      name: 'Studio', fonts: 'caslon', pal: 'sneh', tags: ['dizajn', 'agentura', 'architekt', 'foto', 'konzultant', 'pravnik', 'firma', 'minimal', 'elegantne', 'ciste', 'serioze'],
      front(c) {
        const { W, H, f, m } = c; const ink = '#151515';
        return { bg: { color: '#FBFAF8' }, objs: [
          T(brand(c).toLocaleUpperCase(), { field: 'company', x: W / 2, y: m, ox: 'center', size: 1.9, font: 't', w: 700, ls: 0.04, color: ink, fit: W - 24 }),
          T(f.tagline || f.role || brand(c), { field: 'tagline', x: W / 2, y: H - m, ox: 'center', oy: 'bottom', size: 5, font: 'd', color: ink, fit: W - 14 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#151515';
        return { bg: { color: '#FBFAF8' }, objs: [
          T(f.name, { field: 'name', x: W / 2, y: m + 3.4, ox: 'center', oy: 'bottom', size: 4.6, font: 'd', color: ink, fit: W - 14 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: W / 2, y: m + 4.4, ox: 'center', size: 1.75, font: 't', w: 700, color: ink, fit: W - 20 }),
          ...lines([f.phone, f.email, f.web, city(c)].map((x) => (x || '').toLocaleUpperCase()), { x: W / 2, ox: 'center', yb: H - m, size: 1.8, w: 600, color: ink, fit: W - 16 }),
        ] };
      },
    },

    loud: {
      name: 'Loud', fonts: 'rubik', pal: 'sneh', tags: ['agentura', 'marketing', 'event', 'hudba', 'interier', 'kreativ', 'bar', 'odvazne', 'hrave', 'moderne', 'mlade'],
      front(c) {
        const { W, H } = c;
        return { bg: { color: '#F6F5F2' }, objs: [
          logoOr(c, W / 2, H / 2, W * 0.6, H * 0.5, {}, T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 13, font: 'd', w: 900, color: '#0A0A0A', ls: -0.07, fit: W - 14 })),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#0A0A0A'; const U = (x) => (x || '').toLocaleUpperCase();
        return { bg: { color: '#F6F5F2' }, objs: [
          ...lines([U(f.name), U(f.phone), U(f.email)], { x: m, yb: m + 7.4, size: 1.9, w: 700, color: ink, fit: W * 0.45 }),
          ...lines([U(f.role), U(f.web), U(city(c))], { x: W * 0.52, yb: m + 7.4, size: 1.9, w: 700, color: ink, fit: W * 0.43 }),
          T(U(brand(c)), { field: 'company', x: m, y: H - m, oy: 'bottom', size: 1.9, font: 't', w: 700, color: ink }),
          ...lines((f.tagline || '').toLocaleUpperCase().split(/,\s*/), { x: W * 0.52, yb: H - m, size: 1.9, w: 700, color: ink, fit: W * 0.43 }),
        ] };
      },
    },

    cb: {
      name: tr('Veľké iniciály', 'Velké iniciály'), fonts: 'dmserif', pal: 'sneh', tags: ['stolar', 'remeslo', 'architekt', 'stavba', 'pravnik', 'firma', 'dizajn', 'odvazne', 'minimal', 'serioze', 'klasicky'],
      front(c) {
        const { W, H, f, m } = c; const ink = '#151515';
        return { bg: { color: '#F7F6F3' }, objs: [
          T(mono(c), { x: W / 2, y: H / 2 + 2, ox: 'center', oy: 'center', size: 30, font: 'd', color: '#ECEAE5' }),
          ...lines([f.name, f.role], { x: m, yb: m + 5.8, size: 2.5, color: ink, fit: W * 0.45 }),
          ...lines((f.address || '').split(',').map((x) => x.trim()), { x: W * 0.55, yb: m + 5.8, size: 2.5, color: ink, fit: W * 0.4 }),
          ...contacts(c, { x: m, yb: H - m, keys: ['email', 'phone'], size: 1.9, lh: 2.7, color: ink, font: 'Space Mono', fit: W * 0.5 }),
          ...lines([(f.tagline || '').toLocaleUpperCase()], { x: W * 0.55, yb: H - m, size: 1.9, font: 'Space Mono', color: ink, fit: W * 0.4 }),
        ] };
      },
      back(c) {
        const { W, H } = c;
        return { bg: { color: '#F7F6F3' }, objs: [
          logoOr(c, W / 2, H / 2, W * 0.6, H * 0.6, {}, T(mono(c), { x: W / 2, y: H / 2 + 3, ox: 'center', oy: 'center', size: 34, font: 'd', color: '#0E0E0E', ls: -0.04 })),
        ] };
      },
    },

    drop: {
      name: 'Drop', fonts: 'rubik', pal: 'olive', tags: ['kaviaren', 'bistro', 'bar', 'obchod', 'eko', 'zahrady', 'pivovar', 'hrave', 'odvazne', 'prirodne', 'moderne'],
      front(c) {
        const { W, H, pal } = c;
        return { bg: { color: '#EEEDE8' }, objs: [
          logoOr(c, W / 2, H / 2, W * 0.6, H * 0.5, { tint: pal.bg }, T(brand(c).toLocaleLowerCase(), { field: 'company', x: W / 2, y: H / 2, ox: 'center', oy: 'center', size: 11, font: 'd', w: 900, color: mix(pal.bg, '#000000', 0.25), ls: -0.05, fit: W - 18 })),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const bg = mix(pal.bg, '#000000', 0.25);
        return { bg: { color: bg }, objs: [
          T((f.tagline || f.role || '').toLocaleUpperCase(), { field: 'tagline', x: m, y: m, size: 2.6, font: 't', w: 800, lh: 1, color: '#F1EFE8', fit: W * 0.55 }),
          T(f.web ? '@' + f.web.split('.')[0] : '', { x: W - m, y: m, ox: 'right', size: 1.8, font: 't', color: '#F1EFE8' }),
          ...lines([f.phone, f.web], { x: m, yb: H - m, size: 1.85, color: '#F1EFE8', fit: W * 0.42 }),
          ...lines((f.address || '').split(',').map((x) => x.trim()), { x: W * 0.55, yb: H - m, size: 1.85, color: '#F1EFE8', fit: W * 0.4 }),
        ] };
      },
    },

    foto: {
      name: tr('Fotografia', 'Fotografie'), fonts: 'tenor', pal: 'sneh', tags: ['foto', 'kameraman', 'umelec', 'svadba', 'cestovanie', 'reality', 'architekt', 'moderne', 'elegantne', 'minimal'],
      front(c) {
        const { W, H, f, m } = c; const ink = '#1A1A1A'; const pw = W * 0.46;
        return { bg: { color: '#FFFFFF' }, objs: [
          IMG(c.photo || c.scene('tien'), W - pw, -2, pw + 2, H + 4, { role: 'photo' }),
          T((bare(f.name) || f.name).toLocaleUpperCase(), { field: 'name', x: (W - pw) / 2, y: H / 2 - 0.4, ox: 'center', oy: 'bottom', size: 2.7, font: 'd', ls: 0.2, color: ink, fit: W - pw - 10 }),
          T((f.role || '').toLocaleUpperCase(), { field: 'role', x: (W - pw) / 2, y: H / 2 + 0.8, ox: 'center', size: 1.6, font: 't', ls: 0.3, color: '#777', fit: W - pw - 12 }),
        ] };
      },
      back(c) {
        const { W, H, f, m } = c; const ink = '#1A1A1A'; const qs = 14;
        return { bg: { color: '#FFFFFF' }, objs: [
          QR(m + 2, (H - qs) / 2, qs, ink),
          ...contacts(c, { x: m + qs + 8, yb: H / 2 + 4.5, keys: ['phone', 'email', 'web', 'address'], size: 2, lh: 3, icons: true, lcolor: ink, color: ink, ls: 0.06, fit: W - qs - 2 * m - 10 }),
        ] };
      },
    },

    kontrast: {
      name: tr('Kontrast', 'Kontrast'), fonts: 'poppins', pal: 'merlot', tags: ['dizajn', 'agentura', 'kreativ', 'it', 'marketing', 'studio', 'hudba', 'odvazne', 'moderne', 'farebne', 'mlade'],
      front(c) {
        const { W, H, pal, m } = c;
        return { bg: { color: pal.bg }, objs: [
          T(brand(c).toLocaleLowerCase(), { field: 'company', x: m - 0.6, y: H * 0.6, oy: 'center', size: 14, font: 'd', w: 600, color: pal.accent, ls: -0.04, fit: W - m + 4 }),
        ] };
      },
      back(c) {
        const { W, H, f, pal, m } = c; const keys = ['name', 'phone', 'email', 'web'].filter((k) => has(c, k));
        const lab = { name: tr('kto', 'kdo'), phone: 'tel.', email: '@', web: 'web' };
        const o = [T((f.role || '').toLocaleLowerCase(), { field: 'role', x: m, y: m, size: 2, font: 't', w: 500, color: pal.accent, fit: W * 0.5 }), T(brand(c).toLocaleLowerCase(), { x: W - m, y: m, ox: 'right', size: 2, font: 't', w: 500, color: pal.accent })];
        keys.forEach((k, i) => {
          const y = H - m - (keys.length - 1 - i) * 3;
          o.push(T(lab[k], { x: m, y, oy: 'bottom', size: 2, font: 't', w: 500, color: pal.accent }));
          o.push(T(f[k], { field: k, x: W - m, y, ox: 'right', oy: 'bottom', size: 2, font: 't', w: 500, color: pal.accent, fit: W * 0.6 }));
        });
        return { bg: { color: pal.bg }, objs: o };
      },
    },
  };
}
