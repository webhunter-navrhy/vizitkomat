// Vizitkomat v2 – dátový model vizitky (rozmery v mm)
const LANG = (typeof window !== 'undefined' && window.VK && window.VK.lang) || 'sk';
export const CZ = LANG === 'cz';
export const tr = (sk, cz) => (CZ ? cz : sk);

export const SIZES = {
  '90x50': { w: 90, h: 50, label: '90 × 50 mm' },
  '85x55': { w: 85, h: 55, label: '85 × 55 mm' },
  '55x55': { w: 55, h: 55, label: '55 × 55 mm' },
};
export const BLEED = 2;
export const SAFE = 4;
export const K = 10; // px na mm vo vnútornom súradnicovom systéme editora

export const FONTS = {
  instrument: { label: 'Instrument Serif', display: 'Instrument Serif', dw: 400, text: 'Geist', tw: 400, tw2: 500 },
  fraunces: { label: 'Fraunces', display: 'Fraunces', dw: 400, text: 'Manrope', tw: 400, tw2: 600 },
  bodoni: { label: 'Bodoni Moda', display: 'Bodoni Moda', dw: 400, text: 'Geist', tw: 400, tw2: 500 },
  playfair: { label: 'Playfair', display: 'Playfair Display', dw: 400, text: 'Manrope', tw: 400, tw2: 600 },
  gloock: { label: 'Gloock', display: 'Gloock', dw: 400, text: 'Geist', tw: 400, tw2: 500 },
  geist: { label: 'Geist', display: 'Geist', dw: 600, text: 'Geist', tw: 400, tw2: 500 },
  inter: { label: 'Inter Tight', display: 'Inter Tight', dw: 700, text: 'Inter Tight', tw: 400, tw2: 500 },
  grotesk: { label: 'Space Grotesk', display: 'Space Grotesk', dw: 600, text: 'Space Grotesk', tw: 400, tw2: 500 },
  bricolage: { label: 'Bricolage', display: 'Bricolage Grotesque', dw: 700, text: 'Manrope', tw: 400, tw2: 600 },
  syne: { label: 'Syne', display: 'Syne', dw: 700, text: 'Manrope', tw: 400, tw2: 600 },
  unbounded: { label: 'Unbounded', display: 'Unbounded', dw: 600, text: 'Manrope', tw: 400, tw2: 600 },
  outfit: { label: 'Outfit', display: 'Outfit', dw: 600, text: 'Outfit', tw: 300, tw2: 500 },
  mono: { label: 'Plex Mono', display: 'IBM Plex Mono', dw: 600, text: 'IBM Plex Mono', tw: 400, tw2: 500 },
  caveat: { label: 'Caveat', display: 'Caveat', dw: 600, text: 'Geist', tw: 400, tw2: 500 },
  dmserif: { label: 'DM Serif', display: 'DM Serif Display', dw: 400, text: 'Montserrat', tw: 400, tw2: 500 },
  marcellus: { label: 'Marcellus', display: 'Marcellus', dw: 400, text: 'Montserrat', tw: 400, tw2: 500 },
  tenor: { label: 'Tenor Sans', display: 'Tenor Sans', dw: 400, text: 'Montserrat', tw: 300, tw2: 500 },
  caslon: { label: 'Libre Caslon', display: 'Libre Caslon Text', dw: 400, text: 'Montserrat', tw: 400, tw2: 500 },
  italiana: { label: 'Italiana', display: 'Italiana', dw: 400, text: 'Josefin Sans', tw: 400, tw2: 600 },
  cinzel: { label: 'Cinzel', display: 'Cinzel', dw: 500, text: 'Montserrat', tw: 400, tw2: 500 },
  abril: { label: 'Abril Fatface', display: 'Abril Fatface', dw: 400, text: 'Poppins', tw: 400, tw2: 500 },
  archivo: { label: 'Archivo Black', display: 'Archivo Black', dw: 400, text: 'Montserrat', tw: 400, tw2: 600 },
  bebas: { label: 'Bebas Neue', display: 'Bebas Neue', dw: 400, text: 'Montserrat', tw: 400, tw2: 600 },
  rubik: { label: 'Rubik', display: 'Rubik', dw: 800, text: 'Rubik', tw: 400, tw2: 500 },
  poppins: { label: 'Poppins', display: 'Poppins', dw: 600, text: 'Poppins', tw: 300, tw2: 500 },
  josefin: { label: 'Josefin Sans', display: 'Josefin Sans', dw: 300, text: 'Josefin Sans', tw: 400, tw2: 600 },
  spacemono: { label: 'Space Mono', display: 'Space Mono', dw: 700, text: 'Space Mono', tw: 400, tw2: 700 },
};
export const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300..700&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Manrope:wght@300..700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..800&family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Gloock&family=Inter+Tight:ital,wght@0,300..800;1,300..800&family=Space+Grotesk:wght@300..700&family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Syne:wght@400..800&family=Unbounded:wght@300..800&family=Outfit:wght@200..800&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Caveat:wght@400..700&family=Pinyon+Script&family=DM+Serif+Display:ital@0;1&family=Marcellus&family=Tenor+Sans&family=Montserrat:ital,wght@0,300..800;1,300..600&family=Archivo+Black&family=Space+Mono:wght@400;700&family=Josefin+Sans:wght@300..700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Italiana&family=Bebas+Neue&family=Rubik:wght@400..900&family=Cinzel:wght@400..700&family=Abril+Fatface&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap';

export const PALETTES = {
  krieda:   { label: tr('Krieda', 'Křída'),     bg: '#F5F2EC', ink: '#1A1A18', accent: '#B4532A', soft: '#E8E2D7' },
  sneh:     { label: tr('Sneh', 'Sníh'),        bg: '#FFFFFF', ink: '#111111', accent: '#FF4F1F', soft: '#F1F1EF' },
  noir:     { label: 'Noir',                     bg: '#0E0E10', ink: '#F2F0EB', accent: '#D9B26F', soft: '#1D1D21' },
  smaragd:  { label: 'Smaragd',                  bg: '#0F3B2E', ink: '#F3EFE4', accent: '#D8B56A', soft: '#1A4B3C' },
  navy:     { label: 'Navy',                     bg: '#14213D', ink: '#F4F1EA', accent: '#E9A23B', soft: '#22325A' },
  salvia:   { label: tr('Šalvia', 'Šalvěj'),    bg: '#E8ECE3', ink: '#1F2A22', accent: '#5E7D5A', soft: '#D3DCCB' },
  ruza:     { label: tr('Ruža', 'Růže'),        bg: '#F6EAE5', ink: '#3A2321', accent: '#B4685D', soft: '#EBD4CC' },
  terakota: { label: tr('Terakota', 'Terakota'), bg: '#C35F3A', ink: '#FFF6EE', accent: '#2A1A12', soft: '#B0532F' },
  kobalt:   { label: 'Kobalt',                   bg: '#1E3BCF', ink: '#FFFFFF', accent: '#FFD23F', soft: '#3350DA' },
  levandula:{ label: tr('Levanduľa', 'Levandule'), bg: '#ECE8F5', ink: '#251F3A', accent: '#6A4FB3', soft: '#DAD3EC' },
  grafit:   { label: 'Grafit',                   bg: '#26282C', ink: '#F1F1EF', accent: '#9FD3C7', soft: '#35383D' },
  piesok:   { label: tr('Piesok', 'Písek'),     bg: '#EFE6D8', ink: '#2A2119', accent: '#8A6A43', soft: '#E1D4C0' },
  koral:    { label: tr('Korál', 'Korál'),      bg: '#FFF5EF', ink: '#1D1A19', accent: '#F05A3C', soft: '#FFE0D5' },
  limetka:  { label: tr('Limetka', 'Limetka'),  bg: '#121411', ink: '#F0F2EA', accent: '#C6F24E', soft: '#22261F' },
  more:     { label: tr('More', 'Moře'),        bg: '#F2F7F7', ink: '#12302F', accent: '#1F8A86', soft: '#D4ECEA' },
  bordo:    { label: 'Bordó',                    bg: '#F4EFEA', ink: '#2B1418', accent: '#7A1F2B', soft: '#E7DAD5' },
  bauhaus:  { label: 'Bauhaus',                  bg: '#FBF3E2', ink: '#1B2A44', accent: '#C1462A', soft: '#E3A41B' },
  terrazzo: { label: 'Terrazzo',                 bg: '#FBF6EE', ink: '#2B1D16', accent: '#B4532A', soft: '#EADFCF' },
  olivova:  { label: tr('Olivová', 'Olivová'),  bg: '#FFFFFF', ink: '#171717', accent: '#6D7A5E', soft: '#5E6B52' },
  indigo:   { label: 'Indigo',                   bg: '#FFFFFF', ink: '#14213D', accent: '#2E5AA8', soft: '#1F3E7A' },
  retro:    { label: 'Retro',                    bg: '#F7E9D2', ink: '#3B1F12', accent: '#D9612A', soft: '#F0D9B5' },
  holo:     { label: tr('Perleť', 'Perleť'),    bg: '#F3EEFB', ink: '#22183A', accent: '#6A4FB3', soft: '#22183A' },
  dub:      { label: 'Dub',                      bg: '#F6F0E6', ink: '#2A2119', accent: '#8A6A43', soft: '#C9A877' },
  vino:     { label: tr('Víno', 'Víno'),        bg: '#F3ECE3', ink: '#3A1C20', accent: '#6B1E2A', soft: '#D9B98A' },
  taupe:    { label: 'Taupe',                    bg: '#D8CCC0', ink: '#2E2622', accent: '#6E5B4D', soft: '#EFE8E1' },
  cokolada: { label: tr('Čokoláda', 'Čokoláda'), bg: '#3B2A24', ink: '#F2E8DE', accent: '#C9A27A', soft: '#4A362F' },
  pastel:   { label: tr('Pastel', 'Pastel'),     bg: '#F9C9DA', ink: '#1E1B3A', accent: '#FF5A1F', soft: '#FFE3EC' },
  burgundy: { label: tr('Burgundy', 'Burgundy'), bg: '#5A1420', ink: '#F4E9DC', accent: '#C9A15A', soft: '#F1E6D6', foil: 'gold' },
  noblesa:  { label: tr('Noblesa', 'Noblesa'),  bg: '#14213D', ink: '#F4EFE6', accent: '#C9A15A', soft: '#1B2A4A', foil: 'gold' },
  onyx:     { label: 'Onyx',                     bg: '#151515', ink: '#EDEAE4', accent: '#C9A15A', soft: '#F2EFEA', foil: 'gold' },
  ivory:    { label: tr('Slonovina', 'Slonovina'), bg: '#F4EFE6', ink: '#2A2622', accent: '#B08A4A', soft: '#E7DFD2', foil: 'gold' },
  rosegold: { label: tr('Ružové zlato', 'Růžové zlato'), bg: '#F6E9E4', ink: '#3A2A2A', accent: '#B87A6A', soft: '#2E2626', foil: 'rose' },
  olive:    { label: tr('Olivová tmavá', 'Olivová tmavá'), bg: '#4B5340', ink: '#F1ECE1', accent: '#C9A15A', soft: '#EFE9DD', foil: 'gold' },
  mint:     { label: tr('Mätová', 'Mátová'),    bg: '#A9C9C0', ink: '#14231F', accent: '#14231F', soft: '#EEF3F1' },
  periwinkle:{ label: tr('Levanduľová modrá', 'Levandulová modrá'), bg: '#A9B6E3', ink: '#FFFFFF', accent: '#2F3A6B', soft: '#F6F4EF' },
  merlot:   { label: 'Merlot',                   bg: '#5B2333', ink: '#F7EFE6', accent: '#3FC6E8', soft: '#5B2333' },
  cervena:  { label: tr('Červená', 'Červená'),  bg: '#7A1C1C', ink: '#F9DCD3', accent: '#F06A5A', soft: '#7A1C1C' },
  stribro:  { label: tr('Grafit strieborná', 'Grafit stříbrná'), bg: '#2A2D31', ink: '#ECECEC', accent: '#BFC3C7', soft: '#F1F1F1', foil: 'silver' },
};

export const ART = {
  'akvarel-modry': { label: tr('Akvarel modrý', 'Akvarel modrý'), tone: 'light' },
  bauhaus: { label: 'Bauhaus', tone: 'light' },
  botanika: { label: tr('Botanika', 'Botanika'), tone: 'light' },
  drevo: { label: tr('Drevo', 'Dřevo'), tone: 'light' },
  holo: { label: tr('Holografia', 'Holografie'), tone: 'light' },
  'liniove-listy': { label: tr('Líniové listy', 'Liniové listy'), tone: 'light' },
  lnen: { label: tr('Ľan', 'Len'), tone: 'light' },
  'mesh-studeny': { label: tr('Prechod modrý', 'Přechod modrý'), tone: 'mid' },
  'mesh-teply': { label: tr('Prechod teplý', 'Přechod teplý'), tone: 'mid' },
  'mramor-cierny': { label: tr('Mramor čierny', 'Mramor černý'), tone: 'dark' },
  mramor: { label: tr('Mramor biely', 'Mramor bílý'), tone: 'light' },
  terrazzo: { label: 'Terrazzo', tone: 'light' },
  vlny: { label: tr('Retro vlny', 'Retro vlny'), tone: 'mid' },
  'zlato-folia': { label: tr('Zlatá', 'Zlatá'), tone: 'mid' },
};
export function artURL(key, root) {
  const r = root ?? ((typeof window !== 'undefined' && window.VK && window.VK.root) || './');
  return key && /^(data:|https?:|\/)/.test(key) ? key : `${r}assets/art/${key}.jpg`;
}

export const DEFAULT_FIELDS = CZ ? {
  name: 'Lucie Hrušková', role: 'Architektka interiérů', company: 'Hruška Studio',
  phone: '+420 605 123 456', email: 'lucie@hruskastudio.cz', web: 'hruskastudio.cz',
  address: 'Panská 14, Praha', tagline: 'Prostory, ve kterých se dobře žije.',
} : {
  name: 'Lucia Hrušková', role: 'Architektka interiérov', company: 'Hruška Studio',
  phone: '+421 905 123 456', email: 'lucia@hruskastudio.sk', web: 'hruskastudio.sk',
  address: 'Panská 14, Bratislava', tagline: 'Priestory, v ktorých sa dobre žije.',
};

// ---------- farby ----------
function rgb(h) { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function luminance(h) {
  const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** Metalická fólia (tlačí sa ako metalický prechod) */
export const FOILS = {
  gold: ['#8A6A2C', '#D9BB72', '#F5E3A6', '#B48F44', '#E8CD86', '#8C6B2E'],
  rose: ['#9C5E50', '#E2AE9C', '#F7D3C4', '#C48573', '#EBBAA8', '#98584A'],
  silver: ['#7D8186', '#D5D8DB', '#F7F8F9', '#A4A8AD', '#E3E5E7', '#7A7E83'],
  copper: ['#7A3E1F', '#C9784A', '#F0B48A', '#A85A33', '#DC9466', '#753A1C'],
};
export const isFoil = (c) => typeof c === 'string' && c.startsWith('foil:');
export const foilBase = (c) => (FOILS[String(c).slice(5)] || FOILS.gold)[1];
export function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
export function mix(a, b, t) { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
export function readable(on, pal) { // najlepšia farba textu na danom pozadí
  const cands = [pal.ink, pal.bg, '#FFFFFF', '#111111'];
  return cands.sort((a, b) => contrast(on, b) - contrast(on, a))[0];
}
export function initials(name = '') {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '';
  return ((w[0][0] || '') + (w.length > 1 ? w[w.length - 1][0] : (w[0][1] || ''))).toUpperCase();
}
export function splitName(name = '') {
  const w = name.trim().split(/\s+/).filter(Boolean);
  return w.length < 2 ? [name.trim(), ''] : [w.slice(0, -1).join(' '), w[w.length - 1]];
}
export const slugify = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/** Nový návrh */
export function newDesign(over = {}) {
  return {
    v: 2, size: '90x50', tpl: 'editorial', fonts: null, pal: null, art: null,
    f: { ...DEFAULT_FIELDS }, logo: null, mark: null, photo: null, back: 'auto',
    slug: '', socials: {}, sides: null, custom: false,
    ...over,
  };
}
