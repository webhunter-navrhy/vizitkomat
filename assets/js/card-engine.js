// Vizitkomat – vykresľovanie vizitiek do canvasu (náhľad aj tlačové dáta).
// Súradnice šablón sú v milimetroch, (0,0) je ľavý horný roh orezu.

export const SIZES = {
  '90x50': { w: 90, h: 50, label: '90 × 50 mm' },
  '85x55': { w: 85, h: 55, label: '85 × 55 mm' },
  '55x55': { w: 55, h: 55, label: '55 × 55 mm' },
};
export const BLEED = 2;   // spadávka
const CZ = typeof window !== 'undefined' && window.VK && window.VK.lang === 'cz';
const tr = (sk, cz) => (CZ ? cz : sk);
export const SAFE = 4;    // bezpečná zóna od orezu

export const FONT_PAIRS = {
  editorial: { label: 'Instrument Serif', display: 'Instrument Serif', dw: 400, text: 'Geist', tw: 400 },
  fraunces:  { label: 'Fraunces',         display: 'Fraunces', dw: 400, text: 'Manrope', tw: 400 },
  bodoni:    { label: 'Bodoni',           display: 'Bodoni Moda', dw: 400, text: 'Geist', tw: 400 },
  playfair:  { label: 'Playfair',         display: 'Playfair Display', dw: 400, text: 'Manrope', tw: 400 },
  gloock:    { label: 'Gloock',           display: 'Gloock', dw: 400, text: 'Geist', tw: 400 },
  swiss:     { label: 'Geist',            display: 'Geist', dw: 600, text: 'Geist', tw: 400 },
  grotesk:   { label: 'Space Grotesk',    display: 'Space Grotesk', dw: 600, text: 'Space Grotesk', tw: 400 },
  bricolage: { label: 'Bricolage',        display: 'Bricolage Grotesque', dw: 700, text: 'Manrope', tw: 400 },
  syne:      { label: 'Syne',             display: 'Syne', dw: 700, text: 'Manrope', tw: 400 },
  unbounded: { label: 'Unbounded',        display: 'Unbounded', dw: 600, text: 'Manrope', tw: 400 },
  mono:      { label: 'Plex Mono',        display: 'IBM Plex Mono', dw: 600, text: 'IBM Plex Mono', tw: 400 },
  script:    { label: 'Caveat',           display: 'Caveat', dw: 500, text: 'Geist', tw: 400 },
};

export const PALETTES = {
  papier:   { label: 'Papier',    bg: '#F4EFE6', ink: '#17150F', accent: '#E8462B', soft: '#E6DDCC' },
  atrament: { label: 'Atrament',  bg: '#15171C', ink: '#F1EEE6', accent: '#C9A96A', soft: '#262A31' },
  les:      { label: 'Les',       bg: '#EEF0E8', ink: '#18261D', accent: '#3E6B4E', soft: '#D9DFD0' },
  piesok:   { label: tr('Piesok', 'Písek'),    bg: '#F3E9DC', ink: '#2B2017', accent: '#B5643C', soft: '#E6D4BE' },
  pudrova:  { label: tr('Púdrová', 'Pudrová'),   bg: '#F7EEEA', ink: '#33201F', accent: '#C2786A', soft: '#EDD9D2' },
  more:     { label: 'More',      bg: '#EEF2F4', ink: '#132331', accent: '#1F5F86', soft: '#D7E1E7' },
  kobalt:   { label: 'Kobalt',    bg: '#F2F2EE', ink: '#121420', accent: '#2C3FD6', soft: '#DCDDF2' },
  limetka:  { label: tr('Limetka', 'Limetka'),   bg: '#141613', ink: '#F0F2EA', accent: '#C8F04A', soft: '#262A22' },
  slivka:   { label: tr('Slivka', 'Švestka'),    bg: '#F3EEF2', ink: '#24172A', accent: '#7B3F8C', soft: '#E3D6E3' },
  grafit:   { label: 'Grafit',    bg: '#ECEBE7', ink: '#1C1C1A', accent: '#1C1C1A', soft: '#D9D7D0' },
  marhula:  { label: tr('Marhuľa', 'Meruňka'),   bg: '#FFF4E8', ink: '#2A1A10', accent: '#F07A2E', soft: '#FBDDC0' },
  noc:      { label: 'Noc',       bg: '#0F1012', ink: '#ECECEA', accent: '#FF5B3A', soft: '#1E2024' },
};

export const DEFAULT_FIELDS = CZ ? {
  name: 'Lucie Hrušková',
  role: 'Architektka interiérů',
  company: 'Hruška Studio',
  phone: '+420 605 123 456',
  email: 'lucie@hruskastudio.cz',
  web: 'hruskastudio.cz',
  address: 'Panská 14, Praha',
  tagline: 'Prostory, ve kterých se dobře žije.',
} : {
  name: 'Lucia Hrušková',
  role: 'Architektka interiérov',
  company: 'Hruška Studio',
  phone: '+421 905 123 456',
  email: 'lucia@hruskastudio.sk',
  web: 'hruskastudio.sk',
  address: 'Panská 14, Bratislava',
  tagline: 'Priestory, v ktorých sa dobre žije.',
};

export function newDesign(over = {}) {
  return {
    tpl: 'editorial', size: '90x50', fonts: null, pal: { ...PALETTES.papier },
    f: { ...DEFAULT_FIELDS }, logo: null, back: 'auto',
    qrUrl: 'https://vizitkomat.eu/v/demo/', corners: 'straight',
    ...over,
  };
}

// ---------- pomocné ----------
const imgCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
  imgCache.set(src, p);
  return p;
}
function cachedImage(src) {
  const p = src && imgCache.get(src);
  return p && p.__img;
}

export function initials(name = '') {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '';
  const a = w[0][0] || '';
  const b = w.length > 1 ? w[w.length - 1][0] : (w[0][1] || '');
  return (a + b).toUpperCase();
}
function splitName(name = '') {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (w.length < 2) return [name.trim(), ''];
  return [w.slice(0, -1).join(' '), w[w.length - 1]];
}
function hexToRgb(h) {
  const n = parseInt(h.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function luminance(h) {
  const [r, g, b] = hexToRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function onColor(bg, pal) {
  // text, ktorý je čitateľný na danej farbe
  const c1 = contrast(bg, pal.ink), c2 = contrast(bg, pal.bg);
  if (Math.max(c1, c2) < 3) return luminance(bg) > 0.4 ? '#141414' : '#FAFAF7';
  return c1 >= c2 ? pal.ink : pal.bg;
}

function detailLines(f, keys = ['phone', 'email', 'web', 'address']) {
  return keys.map((k) => f[k]).filter((v) => v && v.trim());
}

// ---------- pero ----------
function makePen(ctx, d, k, ox, oy) {
  const S = SIZES[d.size] || SIZES['90x50'];
  const fp = FONT_PAIRS[d.fonts] || FONT_PAIRS[TEMPLATES[d.tpl]?.fonts] || FONT_PAIRS.editorial;
  const u = (mm) => mm * k;
  const X = (mm) => ox + mm * k;
  const Y = (mm) => oy + mm * k;
  const g = {
    ctx, k, W: S.w, H: S.h, B: BLEED, fp, pal: d.pal, f: d.f, d,
    sq: S.w === S.h, tall: S.h > 52,
    fill(color) { ctx.fillStyle = color; ctx.fillRect(X(-BLEED), Y(-BLEED), u(S.w + 2 * BLEED), u(S.h + 2 * BLEED)); },
    rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(X(x), Y(y), u(w), u(h)); },
    // obdĺžnik, ktorý pri hrane pokračuje do spadávky
    rectB(x, y, w, h, color) {
      let x0 = x, y0 = y, x1 = x + w, y1 = y + h;
      if (x0 <= 0) x0 = -BLEED; if (y0 <= 0) y0 = -BLEED;
      if (x1 >= S.w) x1 = S.w + BLEED; if (y1 >= S.h) y1 = S.h + BLEED;
      g.rect(x0, y0, x1 - x0, y1 - y0, color);
    },
    line(x1, y1, x2, y2, color, wmm = 0.2) {
      ctx.strokeStyle = color; ctx.lineWidth = u(wmm); ctx.beginPath();
      ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke();
    },
    circle(cx, cy, r, fill, stroke, wmm = 0.25) {
      ctx.beginPath(); ctx.arc(X(cx), Y(cy), u(r), 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = u(wmm); ctx.stroke(); }
    },
    font(o) {
      const fam = o.family || (o.display ? fp.display : fp.text);
      const wt = o.weight || (o.display ? fp.dw : fp.tw);
      return `${o.italic ? 'italic ' : ''}${wt} ${u(o.size)}px "${fam}"`;
    },
    measure(str, o) {
      ctx.font = g.font(o);
      const ls = (o.ls || 0) * o.size;
      return ctx.measureText(str).width / k + Math.max(0, [...str].length - 1) * ls;
    },
    // vráti veľkosť písma, aby sa text zmestil do maxW
    fit(str, o, maxW, min = 1.6) {
      let s = o.size;
      while (s > min && g.measure(str, { ...o, size: s }) > maxW) s *= 0.96;
      return s;
    },
    text(str, x, y, o = {}) {
      if (!str) return 0;
      if (o.upper) str = str.toLocaleUpperCase('sk');
      let size = o.size || 2.4;
      if (o.maxW) size = g.fit(str, { ...o, size }, o.maxW, o.min || 1.6);
      const oo = { ...o, size };
      ctx.font = g.font(oo);
      ctx.fillStyle = o.color || g.pal.ink;
      ctx.textBaseline = o.baseline || 'alphabetic';
      const w = g.measure(str, oo);
      let sx = x;
      if (o.align === 'center') sx = x - w / 2;
      else if (o.align === 'right') sx = x - w;
      const ls = (o.ls || 0) * size;
      if (!ls) { ctx.textAlign = 'left'; ctx.fillText(str, X(sx), Y(y)); }
      else {
        let cx = sx;
        for (const ch of str) { ctx.fillText(ch, X(cx), Y(y)); cx += ctx.measureText(ch).width / k + ls; }
      }
      return w;
    },
    lines(arr, x, y, o = {}) {
      const lh = o.lh || (o.size || 2.4) * 1.45;
      arr.forEach((s, i) => g.text(s, x, y + i * lh, o));
      return arr.length * lh;
    },
    logo(x, y, maxW, maxH, align = 'left', valign = 'top') {
      const im = cachedImage(d.logo);
      if (!im) return null;
      const r = Math.min(maxW / im.width, maxH / im.height);
      const w = im.width * r, h = im.height * r;
      let lx = x, ly = y;
      if (align === 'center') lx = x - w / 2; else if (align === 'right') lx = x - w;
      if (valign === 'middle') ly = y - h / 2; else if (valign === 'bottom') ly = y - h;
      ctx.drawImage(im, X(lx), Y(ly), u(w), u(h));
      return { w, h };
    },
    hasLogo() { return !!cachedImage(d.logo); },
    qr(x, y, size, color, bg) {
      if (typeof window === 'undefined' || !window.qrcode) return;
      const q = window.qrcode(0, 'M');
      q.addData(d.qrUrl || 'https://vizitkomat.eu'); q.make();
      const n = q.getModuleCount(), m = size / n;
      if (bg) g.rect(x - m * 1.5, y - m * 1.5, size + m * 3, size + m * 3, bg);
      ctx.fillStyle = color;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (q.isDark(r, c)) ctx.fillRect(Math.floor(X(x + c * m)), Math.floor(Y(y + r * m)), Math.ceil(u(m)), Math.ceil(u(m)));
      }
    },
    X, Y, u,
  };
  return g;
}

// ---------- šablóny ----------
// Každá šablóna má prednú (front) a zadnú (back) stranu.
export const TEMPLATES = {
  editorial: {
    name: 'Editorial', fonts: 'editorial', pal: 'papier', tags: ['kreativ', 'architekt', 'dizajn', 'poradenstvo', 'jemne', 'elegantne'],
    front(g) {
      const { W, H, f, pal } = g, m = SAFE + 1;
      g.fill(pal.bg);
      g.text(f.company, m, m + 2.2, { size: 2.0, upper: true, ls: 0.16, color: pal.ink, maxW: W * 0.55, weight: 500 });
      if (!g.logo(W - m, m - 0.4, 16, 7, 'right')) g.circle(W - m - 1.2, m + 1.4, 1.2, pal.accent);
      const nameY = H - m - (g.tall ? 15 : 11.5);
      g.text(f.name, m - 0.3, nameY, { display: true, size: g.sq ? 6.4 : 7.6, maxW: W - 2 * m, color: pal.ink });
      g.text(f.role, m, nameY + 4.6, { display: true, italic: true, size: 3.4, color: pal.accent, maxW: W * 0.5 });
      const det = detailLines(f, ['phone', 'email', 'web']);
      if (g.sq) g.lines(det, m, H - m - (det.length - 1) * 3.1 + 7, { size: 2.1, lh: 3.1, color: pal.ink, maxW: W - 2 * m });
      else g.lines(det, W - m, H - m - (det.length - 1) * 3.3, { size: 2.25, lh: 3.3, align: 'right', color: pal.ink, maxW: W * 0.42 });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.ink);
      if (!g.logo(W / 2, H / 2 - 2, W * 0.45, H * 0.35, 'center', 'middle'))
        g.text(initials(f.name), W / 2, H / 2 + 6, { display: true, italic: true, size: 22, align: 'center', color: pal.accent });
      g.text(f.tagline || f.company, W / 2, H - SAFE - 1.5, { display: true, italic: true, size: 2.8, align: 'center', color: pal.bg, maxW: W - 2 * SAFE });
    },
  },

  swiss: {
    name: tr('Švajčiarska', 'Švýcarská'), fonts: 'swiss', pal: 'papier', tags: ['it', 'firma', 'technika', 'stavba', 'moderne', 'ciste', 'minimal'],
    front(g) {
      const { W, H, f, pal } = g, m = SAFE + 1;
      g.fill(pal.bg);
      g.rectB(0, 0, 2.2, H, pal.accent);
      const x = m + 2;
      g.text(f.name, x, m + 6, { display: true, size: 4.6, maxW: W - x - 20, color: pal.ink, ls: -0.02 });
      g.text(f.role, x, m + 10.4, { size: 2.4, color: pal.accent, maxW: W - x - m, weight: 500 });
      g.logo(W - m, m, 15, 7, 'right');
      const det = detailLines(f, ['phone', 'email', 'web', 'address']);
      const col = Math.ceil(det.length / 2), cw = (W - x - m) / 2;
      det.forEach((s, i) => {
        const c = i < col ? 0 : 1, r = i < col ? i : i - col;
        g.text(s, x + c * cw, H - m - (col - 1 - r) * 3.2, { size: 2.15, color: pal.ink, maxW: cw - 2 });
      });
      g.line(x, H - m - col * 3.2 - 1.2, W - m, H - m - col * 3.2 - 1.2, mix(pal.ink, pal.bg, 0.8), 0.15);
    },
    back(g) {
      const { W, H, f, pal } = g, m = SAFE + 1;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      if (!g.logo(m, H - m, W * 0.5, H * 0.32, 'left', 'bottom'))
        g.text(f.company || f.name, m, H - m, { display: true, size: 7, maxW: W - 2 * m, color: on, ls: -0.03 });
      g.text(f.web, W - m, m + 2.2, { size: 2.2, align: 'right', color: on, weight: 500 });
    },
  },

  monogram: {
    name: 'Monogram', fonts: 'playfair', pal: 'pudrova', tags: ['beauty', 'kadernik', 'svadby', 'kozmetika', 'jemne', 'elegantne', 'zena'],
    front(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.bg);
      const cy = g.tall ? 15 : 12.5, r = g.tall ? 6.5 : 5.6;
      g.circle(W / 2, cy, r, null, pal.accent, 0.22);
      g.text(initials(f.name), W / 2, cy + r * 0.36, { display: true, italic: true, size: r * 1.05, align: 'center', color: pal.accent });
      g.text(f.name, W / 2, cy + r + 7.2, { display: true, size: 4.6, align: 'center', maxW: W - 2 * SAFE, color: pal.ink });
      g.text(f.role, W / 2, cy + r + 11.4, { size: 1.95, upper: true, ls: 0.2, align: 'center', color: pal.ink, maxW: W - 2 * SAFE });
      const det = detailLines(f, ['phone', 'email', 'web']);
      if (g.sq) g.lines(det, W / 2, H - SAFE - 0.8 - (det.length - 1) * 2.9, { size: 2, lh: 2.9, align: 'center', maxW: W - 2 * SAFE, color: pal.ink });
      else g.text(det.join('   ·   '), W / 2, H - SAFE - 1.1, { size: 2.05, align: 'center', maxW: W - 2 * SAFE, color: pal.ink });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.soft);
      if (!g.logo(W / 2, H / 2, W * 0.42, H * 0.36, 'center', 'middle')) {
        g.text(f.company || f.name, W / 2, H / 2 + 1.8, { display: true, italic: true, size: 6.4, align: 'center', color: pal.ink, maxW: W - 14 });
      }
      g.text(f.tagline, W / 2, H - SAFE - 1, { size: 1.9, upper: true, ls: 0.18, align: 'center', color: pal.accent, maxW: W - 2 * SAFE });
    },
  },

  split: {
    name: tr('Delená', 'Dělená'), fonts: 'bricolage', pal: 'les', tags: ['firma', 'zahrady', 'eko', 'priroda', 'remeslo', 'moderne', 'farebne'],
    front(g) {
      const { W, H, f, pal } = g;
      const bw = g.sq ? W : W * 0.36;
      if (g.sq) {
        g.fill(pal.bg); g.rectB(0, 0, W, 17, pal.accent);
        const on = onColor(pal.accent, pal);
        if (!g.logo(SAFE + 1, 8.5, 26, 9, 'left', 'middle')) g.text(initials(f.name), SAFE + 1, 11.8, { display: true, size: 8, color: on });
        g.text(f.name, SAFE + 1, 26, { display: true, size: 4.4, maxW: W - 2 * SAFE - 2, color: pal.ink });
        g.text(f.role, SAFE + 1, 30, { size: 2.2, color: pal.accent, maxW: W - 2 * SAFE - 2, weight: 500 });
        g.lines(detailLines(f, ['phone', 'email', 'web']), SAFE + 1, H - SAFE - 6, { size: 2, lh: 3, color: pal.ink, maxW: W - 2 * SAFE });
        return;
      }
      g.fill(pal.bg);
      g.rectB(0, 0, bw, H, pal.accent);
      const on = onColor(pal.accent, pal);
      if (!g.logo(bw / 2, H / 2, bw - 10, H * 0.42, 'center', 'middle'))
        g.text(initials(f.name), bw / 2, H / 2 + 4, { display: true, size: 12, align: 'center', color: on, ls: -0.04 });
      const x = bw + 5.5, mw = W - x - SAFE;
      g.text(f.name, x, 14, { display: true, size: 4.6, maxW: mw, color: pal.ink, ls: -0.02 });
      g.text(f.role, x, 18.4, { size: 2.3, color: pal.accent, maxW: mw, weight: 500 });
      const det = detailLines(f, ['phone', 'email', 'web', 'address']);
      g.lines(det, x, H - SAFE - 0.8 - (det.length - 1) * 3.2, { size: 2.15, lh: 3.2, color: pal.ink, maxW: mw });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      g.text(f.tagline || f.company, SAFE + 2, H / 2 + 2, { display: true, size: 5.2, maxW: W - 2 * SAFE - 4, color: on, ls: -0.02 });
      g.text(f.web, SAFE + 2, H - SAFE - 0.8, { size: 2.1, color: on, weight: 500 });
    },
  },

  terminal: {
    name: 'Terminál', fonts: 'mono', pal: 'limetka', tags: ['it', 'vyvojar', 'programator', 'tech', 'startup', 'tmave', 'hrave'],
    front(g) {
      const { W, H, f, pal } = g, m = SAFE + 0.5;
      g.fill(pal.bg);
      g.text('~/' + (f.company || 'vizitka').toLowerCase().replace(/\s+/g, '-'), m, m + 2, { size: 1.9, color: mix(pal.ink, pal.bg, 0.45), maxW: W - 2 * m });
      g.text('> ' + f.name, m, m + 9.5, { display: true, size: 3.7, color: pal.accent, maxW: W - 2 * m });
      g.text('  ' + f.role, m, m + 13.4, { size: 2.2, color: pal.ink, maxW: W - 2 * m });
      const rows = [['tel', f.phone], ['mail', f.email], ['web', f.web]].filter((r) => r[1]);
      rows.forEach(([kk, v], i) => {
        const y = H - m - (rows.length - 1 - i) * 3.3;
        g.text(kk.padEnd(5, ' '), m, y, { size: 2.1, color: mix(pal.ink, pal.bg, 0.45) });
        g.text(v, m + 9, y, { size: 2.1, color: pal.ink, maxW: W - m * 2 - 9 });
      });
      g.rect(W - m - 1.6, m + 6.6, 1.6, 3.4, pal.accent);
    },
    back(g) {
      const { W, H, pal } = g;
      g.fill(pal.bg);
      const s = Math.min(H - 2 * SAFE - 4, 30);
      g.qr(W - SAFE - s - 1, (H - s) / 2, s, pal.ink);
      g.text('$ scan --contact', SAFE + 1, H / 2 - 1, { size: 2.3, color: pal.accent, family: 'IBM Plex Mono' });
      g.text(tr('uložiť do kontaktov', 'uložit do kontaktů'), SAFE + 1, H / 2 + 3, { size: 2, color: mix(pal.ink, pal.bg, 0.35), family: 'IBM Plex Mono' });
    },
  },

  linea: {
    name: tr('Línia', 'Linie'), fonts: 'bodoni', pal: 'atrament', tags: ['pravnik', 'advokat', 'reality', 'financie', 'luxus', 'hotel', 'elegantne', 'tmave'],
    front(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.bg);
      const cy = H / 2 - (g.tall ? 3 : 2);
      g.text(f.name, W / 2, cy, { display: true, size: g.sq ? 3.6 : 4.2, upper: true, ls: 0.14, align: 'center', maxW: W - 2 * SAFE - 4, color: pal.ink });
      g.line(W / 2 - 6, cy + 3, W / 2 + 6, cy + 3, pal.accent, 0.18);
      g.text(f.role, W / 2, cy + 7.2, { display: true, italic: true, size: 2.9, align: 'center', maxW: W - 2 * SAFE, color: pal.accent });
      const det = detailLines(f, ['phone', 'email', 'web']);
      if (g.sq) g.lines(det, W / 2, H - SAFE - 0.8 - (det.length - 1) * 2.8, { size: 1.9, lh: 2.8, align: 'center', color: pal.ink, maxW: W - 2 * SAFE, ls: 0.04 });
      else g.text(det.join('    '), W / 2, H - SAFE - 1.1, { size: 1.95, align: 'center', color: pal.ink, maxW: W - 2 * SAFE, ls: 0.04 });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.bg);
      g.ctx.strokeStyle = pal.accent; g.ctx.lineWidth = g.u(0.18);
      g.ctx.strokeRect(g.X(3.2), g.Y(3.2), g.u(W - 6.4), g.u(H - 6.4));
      if (!g.logo(W / 2, H / 2, W * 0.4, H * 0.36, 'center', 'middle')) {
        g.text(initials(f.name), W / 2, H / 2 + 3.8, { display: true, size: 11, align: 'center', color: pal.accent, ls: 0.08 });
      }
      g.text(f.company, W / 2, H - 7.2, { size: 1.8, upper: true, ls: 0.3, align: 'center', color: pal.ink, maxW: W - 16 });
    },
  },

  bigtype: {
    name: tr('Veľké písmo', 'Velké písmo'), fonts: 'unbounded', pal: 'marhula', tags: ['kreativ', 'agentura', 'marketing', 'foto', 'hudba', 'event', 'hrave', 'odvazne', 'farebne'],
    front(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      const [first, last] = splitName(f.name);
      const big = (first || f.name).toLocaleUpperCase('sk');
      let size = H * (g.sq ? 0.36 : 0.52);
      const w = g.measure(big, { display: true, size, ls: -0.04 });
      const maxW = W * 1.18;
      if (w > maxW) size *= maxW / w;
      g.text(big, -1.2, size * 0.78, { display: true, size, color: on, ls: -0.04 });
      g.text(last, SAFE, H - SAFE - 7.4, { display: true, size: 4.2, color: on, maxW: W * 0.6, ls: -0.02 });
      g.text(f.role, SAFE, H - SAFE - 3.2, { size: 2.2, color: on, maxW: W * 0.55, weight: 500 });
      const det = detailLines(f, ['phone', 'email']);
      if (!g.sq) g.lines(det, W - SAFE, H - SAFE - 0.8 - (det.length - 1) * 3.1, { size: 2.1, lh: 3.1, align: 'right', color: on, maxW: W * 0.38 });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.bg);
      const [, last] = splitName(f.name);
      const word = (last || f.company || '').toLocaleUpperCase('sk');
      let size = H * 0.5;
      const w = g.measure(word, { display: true, size, ls: -0.04 });
      if (w > W * 1.15) size *= (W * 1.15) / w;
      g.text(word, W + 1.2, H + size * 0.08, { display: true, size, align: 'right', color: pal.accent, ls: -0.04 });
      g.lines(detailLines(f, ['web', 'address']), SAFE, SAFE + 2.4, { size: 2.1, lh: 3.1, color: pal.ink, maxW: W - 2 * SAFE });
      if (g.sq) g.lines(detailLines(f, ['phone', 'email']), SAFE, SAFE + 9, { size: 2.1, lh: 3.1, color: pal.ink, maxW: W - 2 * SAFE });
    },
  },

  diagonal: {
    name: 'Šikmý pás', fonts: 'grotesk', pal: 'kobalt', tags: ['auto', 'servis', 'doprava', 'sport', 'fitness', 'trener', 'odvazne', 'moderne'],
    front(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.bg);
      ctx.fillStyle = pal.accent; ctx.beginPath();
      ctx.moveTo(g.X(W * 0.62), g.Y(-BLEED)); ctx.lineTo(g.X(W + BLEED), g.Y(-BLEED));
      ctx.lineTo(g.X(W + BLEED), g.Y(H + BLEED)); ctx.lineTo(g.X(W * 0.78), g.Y(H + BLEED)); ctx.closePath(); ctx.fill();
      const on = onColor(pal.accent, pal);
      if (!g.logo(W - SAFE, SAFE, W * 0.18, 9, 'right'))
        g.text(initials(f.name), W - SAFE - 0.5, H / 2 + 4, { display: true, size: 11, align: 'right', color: on, ls: -0.04 });
      const mw = W * 0.56;
      g.text(f.name, SAFE + 1, 13, { display: true, size: 4.6, maxW: mw, color: pal.ink, ls: -0.02 });
      g.text(f.role, SAFE + 1, 17.4, { size: 2.3, maxW: mw, color: pal.accent, weight: 600, upper: true, ls: 0.06 });
      const det = detailLines(f, ['phone', 'email', 'web']);
      g.lines(det, SAFE + 1, H - SAFE - 0.8 - (det.length - 1) * 3.2, { size: 2.15, lh: 3.2, color: pal.ink, maxW: mw });
    },
    back(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      ctx.fillStyle = mix(pal.accent, '#000000', 0.12); ctx.beginPath();
      ctx.moveTo(g.X(-BLEED), g.Y(H * 0.7)); ctx.lineTo(g.X(W + BLEED), g.Y(H * 0.3));
      ctx.lineTo(g.X(W + BLEED), g.Y(H + BLEED)); ctx.lineTo(g.X(-BLEED), g.Y(H + BLEED)); ctx.closePath(); ctx.fill();
      if (!g.logo(W / 2, H / 2, W * 0.5, H * 0.4, 'center', 'middle'))
        g.text(f.company || f.name, W / 2, H / 2 + 2, { display: true, size: 6, align: 'center', maxW: W - 14, color: on, ls: -0.02 });
    },
  },

  arch: {
    name: tr('Oblúk', 'Oblouk'), fonts: 'fraunces', pal: 'piesok', tags: ['wellness', 'joga', 'masaze', 'terapia', 'psycholog', 'kaviaren', 'jemne', 'prirodne', 'zena'],
    front(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.bg);
      const aw = g.sq ? 20 : 26, ax = W - aw - 3.5, top = 5.5, bot = H + BLEED;
      ctx.fillStyle = pal.soft; ctx.beginPath();
      ctx.moveTo(g.X(ax), g.Y(bot)); ctx.lineTo(g.X(ax), g.Y(top + aw / 2));
      ctx.arc(g.X(ax + aw / 2), g.Y(top + aw / 2), g.u(aw / 2), Math.PI, 0);
      ctx.lineTo(g.X(ax + aw), g.Y(bot)); ctx.closePath(); ctx.fill();
      if (!g.logo(ax + aw / 2, top + aw / 2 + 3, aw - 7, aw * 0.6, 'center', 'middle'))
        g.text(initials(f.name), ax + aw / 2, top + aw / 2 + 5, { display: true, italic: true, size: 9, align: 'center', color: pal.accent });
      const mw = ax - SAFE - 4;
      g.text(f.name, SAFE + 0.6, 13.5, { display: true, size: 4.8, maxW: mw, color: pal.ink });
      g.text(f.role, SAFE + 0.6, 18, { display: true, italic: true, size: 2.9, maxW: mw, color: pal.accent });
      const det = detailLines(f, ['phone', 'email', 'web']);
      g.lines(det, SAFE + 0.6, H - SAFE - 0.8 - (det.length - 1) * 3.2, { size: 2.1, lh: 3.2, color: pal.ink, maxW: mw });
    },
    back(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      const aw = Math.min(W, H) * 0.62, ax = W / 2 - aw / 2, top = (H - aw * 1.2) / 2 + 1;
      ctx.strokeStyle = on; ctx.lineWidth = g.u(0.22); ctx.beginPath();
      ctx.moveTo(g.X(ax), g.Y(top + aw * 1.2)); ctx.lineTo(g.X(ax), g.Y(top + aw / 2));
      ctx.arc(g.X(W / 2), g.Y(top + aw / 2), g.u(aw / 2), Math.PI, 0);
      ctx.lineTo(g.X(ax + aw), g.Y(top + aw * 1.2)); ctx.stroke();
      if (!g.logo(W / 2, top + aw * 0.68, aw - 8, aw * 0.5, 'center', 'middle'))
        g.text(f.company || initials(f.name), W / 2, top + aw * 0.78, { display: true, italic: true, size: 4.4, align: 'center', color: on, maxW: aw - 4 });
    },
  },

  blueprint: {
    name: 'Výkres', fonts: 'grotesk', pal: 'more', tags: ['architekt', 'stavba', 'inzinier', 'projektant', 'geodet', 'technika', 'ciste'],
    front(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.bg);
      ctx.fillStyle = mix(pal.ink, pal.bg, 0.82);
      for (let x = 0; x <= W; x += 5) for (let y = 0; y <= H; y += 5) { ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), g.u(0.17), 0, 7); ctx.fill(); }
      const m = SAFE + 1;
      const lab = (t, x, y) => g.text(t, x, y, { size: 1.55, upper: true, ls: 0.18, color: pal.accent, family: 'IBM Plex Mono' });
      lab(tr('meno', 'jméno'), m, m + 1.5);
      g.text(f.name, m, m + 7, { display: true, size: 4.4, maxW: W - 2 * m - 16, color: pal.ink, ls: -0.02 });
      lab(tr('profesia', 'profese'), m, m + 11.3);
      g.text(f.role, m, m + 15, { size: 2.3, maxW: W * 0.55, color: pal.ink });
      g.logo(W - m, m, 14, 8, 'right');
      const det = detailLines(f, ['phone', 'email', 'web']);
      const y0 = H - m - (det.length - 1) * 3.1;
      lab('kontakt', g.sq ? m : W * 0.56, y0 - 4.2);
      g.lines(det, g.sq ? m : W * 0.56, y0, { size: 2.05, lh: 3.1, color: pal.ink, maxW: g.sq ? W - 2 * m : W * 0.44 - m });
      g.line(m, H - m + 1.6, m + 8, H - m + 1.6, pal.accent, 0.2);
    },
    back(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      ctx.strokeStyle = mix(pal.accent, on, 0.18); ctx.lineWidth = g.u(0.12);
      for (let x = 0; x <= W; x += 5) { ctx.beginPath(); ctx.moveTo(g.X(x), g.Y(-BLEED)); ctx.lineTo(g.X(x), g.Y(H + BLEED)); ctx.stroke(); }
      for (let y = 0; y <= H; y += 5) { ctx.beginPath(); ctx.moveTo(g.X(-BLEED), g.Y(y)); ctx.lineTo(g.X(W + BLEED), g.Y(y)); ctx.stroke(); }
      if (!g.logo(W / 2, H / 2, W * 0.5, H * 0.4, 'center', 'middle'))
        g.text(f.company || f.name, W / 2, H / 2 + 2, { display: true, size: 6, align: 'center', maxW: W - 14, color: on, ls: -0.02 });
      g.text(tr('mierka 1 : 1', 'měřítko 1 : 1'), W - SAFE, H - SAFE, { size: 1.6, align: 'right', color: on, family: 'IBM Plex Mono' });
    },
  },

  stamp: {
    name: tr('Pečiatka', 'Razítko'), fonts: 'gloock', pal: 'piesok', tags: ['remeslo', 'pekaren', 'vino', 'farma', 'reality', 'gastro', 'tradicne', 'rodinne'],
    front(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.bg);
      const r = g.sq ? 11 : 12.5, cx = g.sq ? W / 2 : W - r - SAFE - 1, cy = g.sq ? 15 : H / 2;
      g.circle(cx, cy, r, null, pal.accent, 0.22);
      g.circle(cx, cy, r - 3.6, null, pal.accent, 0.14);
      // text dookola
      const txt = ((f.company || f.name) + ' · ' + (f.address?.split(',').pop()?.trim() || tr('od roku 2026', 'od roku 2026')) + ' · ').toLocaleUpperCase(CZ ? 'cs' : 'sk');
      ctx.save(); ctx.translate(g.X(cx), g.Y(cy));
      ctx.font = `500 ${g.u(1.65)}px "${g.fp.text}"`; ctx.fillStyle = pal.accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const chars = [...txt], step = (Math.PI * 2) / chars.length;
      chars.forEach((ch, i) => { ctx.save(); ctx.rotate(i * step); ctx.fillText(ch, 0, -g.u(r - 1.8)); ctx.restore(); });
      ctx.restore();
      if (!g.logo(cx, cy, (r - 4.5) * 1.4, (r - 4.5) * 1.4, 'center', 'middle'))
        g.text(initials(f.name), cx, cy + 2.3, { display: true, size: 6.4, align: 'center', color: pal.ink });
      if (g.sq) {
        g.text(f.name, W / 2, 35, { display: true, size: 4, align: 'center', maxW: W - 2 * SAFE, color: pal.ink });
        g.text(f.role, W / 2, 39, { size: 2, align: 'center', maxW: W - 2 * SAFE, color: pal.accent });
        g.lines(detailLines(f, ['phone', 'email']), W / 2, H - SAFE - 2.6, { size: 1.9, lh: 2.8, align: 'center', maxW: W - 2 * SAFE, color: pal.ink });
        return;
      }
      const mw = cx - r - SAFE - 4;
      g.text(f.name, SAFE + 0.6, 14, { display: true, size: 4.8, maxW: mw, color: pal.ink });
      g.text(f.role, SAFE + 0.6, 18.4, { size: 2.2, maxW: mw, color: pal.accent, upper: true, ls: 0.08, weight: 500 });
      const det = detailLines(f, ['phone', 'email', 'web']);
      g.lines(det, SAFE + 0.6, H - SAFE - 0.8 - (det.length - 1) * 3.2, { size: 2.1, lh: 3.2, color: pal.ink, maxW: mw });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      g.text(f.tagline || f.company, W / 2, H / 2 + 1.6, { display: true, size: 5, align: 'center', maxW: W - 2 * SAFE - 6, color: on });
      g.line(W / 2 - 4, H / 2 + 5.5, W / 2 + 4, H / 2 + 5.5, on, 0.2);
    },
  },

  gradient: {
    name: tr('Prechod', 'Přechod'), fonts: 'syne', pal: 'slivka', tags: ['kreativ', 'socialne siete', 'influencer', 'marketing', 'beauty', 'event', 'moderne', 'farebne', 'hrave'],
    front(g) {
      const { W, H, f, pal, ctx } = g;
      g.fill(pal.bg);
      const blob = (x, y, r, c) => {
        const gr = ctx.createRadialGradient(g.X(x), g.Y(y), 0, g.X(x), g.Y(y), g.u(r));
        gr.addColorStop(0, c); gr.addColorStop(1, c + '00');
        ctx.fillStyle = gr; ctx.fillRect(g.X(-BLEED), g.Y(-BLEED), g.u(W + 2 * BLEED), g.u(H + 2 * BLEED));
      };
      blob(W * 0.95, H * 0.1, W * 0.6, pal.accent);
      blob(W * 0.6, H * 1.05, W * 0.45, mix(pal.accent, '#FFB36B', 0.55));
      blob(W * 0.15, -H * 0.2, W * 0.35, mix(pal.soft, '#FFFFFF', 0.2));
      const mw = W * 0.62;
      g.text(f.name, SAFE + 0.5, H / 2 - 1.5, { display: true, size: 4.8, maxW: mw, color: pal.ink, ls: -0.02 });
      g.text(f.role, SAFE + 0.5, H / 2 + 2.8, { size: 2.3, maxW: mw, color: pal.ink, weight: 500 });
      g.text([f.email, f.phone].filter(Boolean).join('  ·  '), SAFE + 0.5, H - SAFE - 0.8, { size: 2.05, maxW: W - 2 * SAFE, color: pal.ink });
      g.text(f.web, SAFE + 0.5, SAFE + 2, { size: 2.05, color: pal.ink, weight: 500 });
    },
    back(g) {
      const { W, H, f, pal, ctx } = g;
      const gr = ctx.createLinearGradient(g.X(0), g.Y(0), g.X(W), g.Y(H));
      gr.addColorStop(0, pal.accent); gr.addColorStop(1, mix(pal.accent, '#FFB36B', 0.6));
      ctx.fillStyle = gr; ctx.fillRect(g.X(-BLEED), g.Y(-BLEED), g.u(W + 2 * BLEED), g.u(H + 2 * BLEED));
      if (!g.logo(W / 2, H / 2, W * 0.45, H * 0.36, 'center', 'middle'))
        g.text(f.company || f.name, W / 2, H / 2 + 2, { display: true, size: 6, align: 'center', maxW: W - 14, color: '#FFFFFF', ls: -0.02 });
    },
  },

  corporate: {
    name: tr('Firemná', 'Firemní'), fonts: 'swiss', pal: 'more', tags: ['firma', 'uctovnictvo', 'financie', 'poistenie', 'reality', 'pravnik', 'lekar', 'ciste', 'serioze'],
    front(g) {
      const { W, H, f, pal } = g, m = SAFE + 1;
      g.fill(pal.bg);
      if (!g.logo(m, m, W * 0.38, 8))
        g.text(f.company, m, m + 3.2, { display: true, size: 3.2, color: pal.accent, maxW: W * 0.5 });
      const nameY = g.sq ? 26 : H / 2 + 3;
      g.text(f.name, m, nameY, { display: true, size: 4.2, maxW: g.sq ? W - 2 * m : W * 0.5, color: pal.ink, ls: -0.015 });
      g.text(f.role, m, nameY + 3.9, { size: 2.25, maxW: g.sq ? W - 2 * m : W * 0.5, color: mix(pal.ink, pal.bg, 0.35) });
      const rows = [['T', f.phone], ['E', f.email], ['W', f.web], ['A', f.address]].filter((r) => r[1]);
      const x = g.sq ? m : W * 0.6, mw = W - x - m;
      rows.forEach(([kk, v], i) => {
        const y = H - m - (rows.length - 1 - i) * 3.25;
        g.text(kk, x, y, { size: 2.05, color: pal.accent, weight: 600 });
        g.text(v, x + 3, y, { size: 2.05, color: pal.ink, maxW: mw - 3 });
      });
      if (g.sq) return;
      g.line(W * 0.6 - 3, H - m - rows.length * 3.25, W * 0.6 - 3, H - m + 0.6, mix(pal.ink, pal.bg, 0.8), 0.15);
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      if (!g.logo(W / 2, H / 2, W * 0.5, H * 0.38, 'center', 'middle'))
        g.text(f.company || f.name, W / 2, H / 2 + 1.8, { display: true, size: 5.4, align: 'center', maxW: W - 14, color: on });
    },
  },

  signature: {
    name: 'Podpis', fonts: 'script', pal: 'papier', tags: ['umelec', 'foto', 'fotograf', 'kvety', 'cukraren', 'svadby', 'hudba', 'osobne', 'hrave', 'jemne'],
    front(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.bg);
      const cy = g.sq ? 22 : H / 2 + 1;
      g.text(f.name, W / 2, cy, { display: true, size: g.sq ? 7 : 9, align: 'center', maxW: W - 2 * SAFE - 2, color: pal.ink });
      g.line(W / 2 - 12, cy + 2.6, W / 2 + 12, cy + 2.6, pal.accent, 0.2);
      g.text(f.role, W / 2, cy + 7, { size: 1.95, upper: true, ls: 0.22, align: 'center', color: pal.accent, maxW: W - 2 * SAFE, weight: 500 });
      const det = detailLines(f, ['phone', 'email', 'web']);
      if (g.sq) g.lines(det, W / 2, H - SAFE - 0.8 - (det.length - 1) * 2.8, { size: 1.9, lh: 2.8, align: 'center', color: pal.ink, maxW: W - 2 * SAFE });
      else g.text(det.join('   ·   '), W / 2, H - SAFE - 1.1, { size: 1.95, align: 'center', color: pal.ink, maxW: W - 2 * SAFE });
    },
    back(g) {
      const { W, H, f, pal } = g;
      g.fill(pal.accent);
      const on = onColor(pal.accent, pal);
      g.text(f.tagline || f.company, W / 2, H / 2 + 2.4, { display: true, size: 6.4, align: 'center', maxW: W - 2 * SAFE - 4, color: on });
    },
  },
};

// zadná strana podľa voľby používateľa
const BACKS = {
  qr(g) {
    const { W, H, f, pal } = g;
    g.fill(pal.ink);
    const s = Math.min(H - 2 * SAFE - 4, 28);
    g.qr(W - SAFE - s - 1, (H - s) / 2, s, pal.ink, pal.bg);
    const mw = W - s - 2 * SAFE - 6;
    g.text(f.name, SAFE + 1, H / 2 - 2.2, { display: true, size: 4, color: pal.bg, maxW: mw });
    g.text(tr('Naskenujte a uložte si kontakt', 'Naskenujte a uložte si kontakt'), SAFE + 1, H / 2 + 2.4, { size: 2.05, color: mix(pal.bg, pal.ink, 0.35), maxW: mw });
  },
  details(g) {
    const { W, H, f, pal } = g;
    g.fill(pal.soft);
    const det = detailLines(f, ['phone', 'email', 'web', 'address']);
    g.lines(det, W / 2, H / 2 - ((det.length - 1) * 3.6) / 2 + 1, { size: 2.4, lh: 3.6, align: 'center', color: pal.ink, maxW: W - 2 * SAFE });
  },
  logo(g) {
    const { W, H, f, pal } = g;
    g.fill(pal.bg);
    if (!g.logo(W / 2, H / 2, W * 0.5, H * 0.45, 'center', 'middle'))
      g.text(f.company || initials(f.name), W / 2, H / 2 + 2, { display: true, size: 6.4, align: 'center', maxW: W - 14, color: pal.ink });
  },
  blank(g) { g.fill(g.pal.accent); },
};
export const BACK_OPTIONS = ['auto', 'qr', 'logo', 'details', 'blank'];

// ---------- fonty ----------
const loadedFonts = new Set();
export async function ensureFonts(d) {
  if (typeof document === 'undefined' || !document.fonts) return;
  const fp = FONT_PAIRS[d.fonts] || FONT_PAIRS[TEMPLATES[d.tpl]?.fonts] || FONT_PAIRS.editorial;
  const specs = [
    `${fp.dw} 20px "${fp.display}"`, `italic ${fp.dw} 20px "${fp.display}"`,
    `${fp.tw} 20px "${fp.text}"`, `500 20px "${fp.text}"`, `600 20px "${fp.text}"`, '400 20px "IBM Plex Mono"',
  ];
  await Promise.all(specs.filter((s) => !loadedFonts.has(s)).map((s) =>
    document.fonts.load(s, 'ĽľščťžýáíéôäňĺŕAa').then(() => loadedFonts.add(s)).catch(() => {})));
}

export async function prepare(d) {
  await ensureFonts(d);
  if (d.logo) {
    const im = await loadImage(d.logo);
    const p = imgCache.get(d.logo);
    if (p) p.__img = im;
  }
}

// ---------- vykreslenie ----------
/**
 * Vykreslí stranu vizitky do canvasu.
 * opts.pxPerMm – rozlíšenie; opts.bleed – vrátane spadávky; opts.marks – tlačové značky (náhľad)
 */
export function render(canvas, d, side = 'front', opts = {}) {
  const S = SIZES[d.size] || SIZES['90x50'];
  const withBleed = !!(opts.bleed || opts.marks);
  const pad = opts.marks ? 7 : (withBleed ? BLEED : 0);
  const k = opts.pxPerMm || (opts.width ? opts.width / (S.w + 2 * pad) : 10);
  const cw = Math.round((S.w + 2 * pad) * k), ch = Math.round((S.h + 2 * pad) * k);
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const ox = pad * k, oy = pad * k;
  const g = makePen(ctx, d, k, ox, oy);

  ctx.save();
  if (!withBleed) {
    // len orez (bežný náhľad), prípadne so zaoblenými rohmi
    ctx.beginPath();
    const r = d.corners === 'round' ? 3 * k : 0;
    if (ctx.roundRect) ctx.roundRect(ox, oy, S.w * k, S.h * k, r); else ctx.rect(ox, oy, S.w * k, S.h * k);
    ctx.clip();
  } else {
    ctx.beginPath(); ctx.rect(ox - BLEED * k, oy - BLEED * k, (S.w + 2 * BLEED) * k, (S.h + 2 * BLEED) * k); ctx.clip();
  }
  const T = TEMPLATES[d.tpl] || TEMPLATES.editorial;
  if (side === 'back' && d.back && d.back !== 'auto' && BACKS[d.back]) BACKS[d.back](g);
  else (side === 'back' ? T.back : T.front)(g);
  ctx.restore();

  if (opts.marks) drawMarks(ctx, k, ox, oy, S, d.corners === 'round');
  return canvas;
}

function drawMarks(ctx, k, ox, oy, S, round) {
  const u = (mm) => mm * k;
  // stmavená spadávka
  ctx.save();
  ctx.fillStyle = 'rgba(232,70,43,0.16)';
  ctx.beginPath();
  ctx.rect(ox - u(BLEED), oy - u(BLEED), u(S.w + 2 * BLEED), u(S.h + 2 * BLEED));
  ctx.rect(ox + u(S.w), oy, -u(S.w), u(S.h));
  ctx.fill('evenodd');
  // orez
  ctx.strokeStyle = '#E8462B'; ctx.lineWidth = Math.max(1, u(0.15));
  ctx.beginPath();
  if (round && ctx.roundRect) ctx.roundRect(ox, oy, u(S.w), u(S.h), u(3)); else ctx.rect(ox, oy, u(S.w), u(S.h));
  ctx.stroke();
  // bezpečná zóna
  ctx.setLineDash([u(0.8), u(0.6)]);
  ctx.strokeStyle = 'rgba(30,120,200,0.8)';
  ctx.strokeRect(ox + u(SAFE), oy + u(SAFE), u(S.w - 2 * SAFE), u(S.h - 2 * SAFE));
  ctx.setLineDash([]);
  // orezové značky
  ctx.strokeStyle = '#17150F'; ctx.lineWidth = Math.max(1, u(0.12));
  const L = 4, gap = BLEED + 1;
  const corner = (x, y, dx, dy) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * u(gap), y); ctx.lineTo(x + dx * u(gap + L), y);
    ctx.moveTo(x, y + dy * u(gap)); ctx.lineTo(x, y + dy * u(gap + L));
    ctx.stroke();
  };
  corner(ox, oy, -1, -1); corner(ox + u(S.w), oy, 1, -1);
  corner(ox, oy + u(S.h), -1, 1); corner(ox + u(S.w), oy + u(S.h), 1, 1);
  ctx.restore();
}

// náhľad do dataURL (pre košík, 3D kartu a pod.)
export async function snapshot(d, side = 'front', width = 900, type = 'image/png') {
  await prepare(d);
  const c = document.createElement('canvas');
  render(c, d, side, { width });
  return c.toDataURL(type, 0.92);
}

// tlačové PDF: každá strana jedna stránka vrátane spadávky, 600 dpi
export async function exportPDF(d, filename = 'vizitka.pdf') {
  await prepare(d);
  const S = SIZES[d.size];
  const pw = S.w + 2 * BLEED, ph = S.h + 2 * BLEED;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: pw > ph ? 'l' : 'p', unit: 'mm', format: [pw, ph], compress: true });
  const k = 600 / 25.4;
  ['front', 'back'].forEach((side, i) => {
    const c = document.createElement('canvas');
    render(c, d, side, { pxPerMm: k, bleed: true });
    if (i) doc.addPage([pw, ph], pw > ph ? 'l' : 'p');
    doc.addImage(c.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
  });
  doc.setProperties({ title: `Vizitka – ${d.f.name}`, creator: 'Vizitkomat.eu' });
  doc.save(filename);
}

export function templateDefaults(id) {
  const T = TEMPLATES[id];
  return { fonts: T.fonts, pal: { ...PALETTES[T.pal] } };
}
