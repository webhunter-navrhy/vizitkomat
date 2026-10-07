// AI grafik – klient. Skutočný jazykový model (Cloudflare Workers AI) + vygenerovaná grafika.
// Pri výpadku servera beží záložný lokálny výber šablón.
import { newDesign, PALETTES, FONTS, DEFAULT_FIELDS, tr, CZ } from './model.js';
import { TEMPLATES } from './templates.js';
import { analyze } from '../ai-engine.js';

export const API = 'https://vizitkomat-api.webhunter.workers.dev';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const TPL_DESC = {
  atelier: tr('redakčná kompozícia s veľkým menom', 'redakční kompozice s velkým jménem'),
  noirgold: tr('luxusná tmavá karta so zlatým rámom', 'luxusní tmavá karta se zlatým rámem'),
  monolit: tr('odvážne veľké iniciály cez okraj', 'odvážné velké iniciály přes okraj'),
  mramor: tr('mramor s bielym panelom', 'mramor s bílým panelem'),
  botanika: tr('ilustrácia po boku a jemný serif', 'ilustrace po boku a jemný serif'),
  prechod: tr('výrazný farebný prechod', 'výrazný barevný přechod'),
  bauhaus: tr('geometria v štýle Bauhaus', 'geometrie ve stylu Bauhaus'),
  terrazzo: tr('pás terrazza a pokojná typografia', 'pás terrazza a klidná typografie'),
  linia: tr('minimalizmus s líniovou kresbou', 'minimalismus s liniovou kresbou'),
  akvarel: tr('akvarelová škvrna po boku', 'akvarelová skvrna po boku'),
  terminal: tr('terminál pre ľudí z IT', 'terminál pro lidi z IT'),
  firma: tr('prehľadná firemná karta', 'přehledná firemní karta'),
  holo: tr('perleťový hologram', 'perleťový hologram'),
  drevo: tr('prírodné drevo', 'přírodní dřevo'),
  retro: tr('retro sedemdesiatky', 'retro sedmdesátky'),
  pecat: tr('pečať ako od remeselníka', 'pečeť jako od řemeslníka'),
  podpis: tr('meno ako podpis', 'jméno jako podpis'),
  duo: tr('dvojfarebný šikmý rez', 'dvoubarevný šikmý řez'),
  zlato: tr('zlatá línia na tmavom', 'zlatá linie na tmavém'),
};

function describe(d, generated) {
  const t = TPL_DESC[d.tpl] || '';
  const f = FONTS[d.fonts]?.label || '';
  return `${cap(t)}${f ? `, ${tr('písmo', 'písmo')} ${f}` : ''}${generated ? tr(', grafika na mieru od AI', ', grafika na míru od AI') : ''}.`;
}

function introFrom(fields, A) {
  const bits = [];
  if (fields.role) bits.push(fields.role.toLowerCase());
  if (fields.company) bits.push(fields.company);
  if (fields.address) bits.push(fields.address);
  const mood = (A?.moods || []).map((m) => ({ jemne: tr('jemne', 'jemně'), luxus: tr('luxusne', 'luxusně'), moderne: tr('moderne', 'moderně'), hrave: tr('hravo', 'hravě'), tmave: tr('tmavo', 'tmavě'), prirodne: tr('prírodne', 'přírodně'), tradic: tr('tradične', 'tradičně'), seriozne: tr('seriózne', 'seriózně') }[m])).filter(Boolean);
  if (mood.length) bits.push(mood.join(tr(' a ', ' a ')));
  return bits.length
    ? tr(`Rozumiem: ${bits.join(' · ')}. Tu sú tri návrhy, každý iný. Kliknite na ten, ktorý sa vám páči, a ďalej ho upravte.`, `Rozumím: ${bits.join(' · ')}. Tady jsou tři návrhy, každý jiný. Klikněte na ten, který se vám líbí, a dál ho upravte.`)
    : tr('Tu sú tri rôzne smery. Napíšte mi viac o tom, čo robíte, a trafím sa presnejšie.', 'Tady jsou tři různé směry. Napište mi víc o tom, co děláte, a trefím se přesněji.');
}

async function postJSON(path, body, ms = 25000) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}

/**
 * Navrhne vizitky. onArt(index, design) sa zavolá, keď dobehne vygenerovaná grafika.
 * base = aktuálne údaje vizitky, previous = súhrn aktuálneho návrhu (na úpravy typu „tmavšie“).
 */
export async function askAI(prompt, base = {}, { previous, onArt } = {}) {
  const A = analyze(prompt);
  const known = {};
  for (const k of ['name', 'role', 'company', 'tagline', 'address']) if (base[k] && base[k] !== DEFAULT_FIELDS[k]) known[k] = base[k];
  try {
    const res = await postJSON('/design', { prompt, lang: CZ ? 'cz' : 'sk', fields: known, previous, art: false });
    if (!res.concepts || !res.concepts.length) throw new Error('empty');
    const fields = { ...DEFAULT_FIELDS, ...base, ...res.fields };
    if (!res.fields.company && !known.company) fields.company = base.company && base.company !== DEFAULT_FIELDS.company ? base.company : '';
    if (fields.tagline) fields.tagline = cap(fields.tagline);
    if (!res.fields.name && !known.name) fields.name = placeholderName(fields.role);
    deriveContacts(fields, base);
    if (fields.role) fields.role = cap(fields.role);
    // kontakty, ktoré klient nenapísal, nevymýšľame – nechávame ukážkové, kým ich nezmení
    const designs = res.concepts.map((c) => {
      const d = newDesign({ tpl: c.template, fonts: c.fonts || TEMPLATES[c.template].fonts, pal: { label: 'AI', ...c.palette }, art: c.art.mode === 'library' ? c.art.key : null, f: { ...fields } });
      d.ai = { mode: c.art.mode, prompt: c.art.prompt, kind: c.art.kind };
      d.why = describe(d, false);
      return d;
    });
    // grafika na mieru – paralelne, dorazí neskôr
    designs.forEach((d, i) => {
      if (d.ai.mode === 'generate' && d.ai.prompt) {
        d.artPending = true;
        postJSON('/artwork', { prompt: d.ai.prompt, kind: d.ai.kind }, 30000)
          .then((r) => { if (r.src) { d.art = r.src; d.why = describe(d, true); } })
          .catch(() => {})
          .finally(() => { d.artPending = false; onArt && onArt(i, d); });
      }
    });
    return { intro: introFrom(fields, A), fields, designs, remote: true };
  } catch (e) {
    return local(prompt, base, A);
  }
}

// ukážkové meno v správnom rode podľa profesie
function placeholderName(role = '') {
  const fem = /(ka|ice|ová|yně|ná|na)$/i.test(plain(role).split(/\s+/).pop() || '');
  return fem ? (CZ ? 'Lucie Hrušková' : 'Lucia Hrušková') : (CZ ? 'Petr Novák' : 'Peter Novák');
}
// ukážkové kontakty podľa nového mena / firmy (kým ich klient nezadá)
const plain = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function deriveContacts(f, base) {
  const dom = plain(f.company).replace(/^(salon|studio|ateliér|atelier|firma)\s+/, '').replace(/[^a-z0-9]+/g, '') || plain(f.name).split(/\s+/).pop()?.replace(/[^a-z]/g, '');
  const tld = CZ ? 'cz' : 'sk';
  const first = plain(f.name).split(/\s+/)[0]?.replace(/[^a-z]/g, '') || 'info';
  if (!base.email && dom) f.email = `${first}@${dom}.${tld}`;
  if (!base.web && dom) f.web = `${dom}.${tld}`;
  if (!base.address && f.address === DEFAULT_FIELDS.address) f.address = '';
}

// ---------- záloha bez servera ----------
const IND_TPL = {
  kadernik: ['podpis', 'mramor', 'botanika'], reality: ['noirgold', 'firma', 'zlato'], stavba: ['duo', 'firma', 'drevo'],
  it: ['terminal', 'monolit', 'prechod'], pravnik: ['noirgold', 'zlato', 'atelier'], wellness: ['linia', 'botanika', 'akvarel'],
  foto: ['podpis', 'prechod', 'akvarel'], gastro: ['pecat', 'terrazzo', 'retro'], auto: ['duo', 'monolit', 'firma'],
  lekar: ['firma', 'linia', 'atelier'], sport: ['duo', 'holo', 'monolit'],
};
const IND_PAL = {
  kadernik: ['ruza', 'krieda', 'sneh'], reality: ['noir', 'navy', 'smaragd'], stavba: ['kobalt', 'navy', 'dub'],
  it: ['limetka', 'sneh', 'koral'], pravnik: ['noir', 'smaragd', 'krieda'], wellness: ['olivova', 'krieda', 'indigo'],
  foto: ['krieda', 'koral', 'indigo'], gastro: ['smaragd', 'terrazzo', 'retro'], auto: ['kobalt', 'sneh', 'navy'],
  lekar: ['navy', 'olivova', 'krieda'], sport: ['kobalt', 'holo', 'koral'],
};
function local(prompt, base, A) {
  const ids = IND_TPL[A.industry] || ['atelier', 'monolit', 'botanika'];
  const pals = IND_PAL[A.industry] || [null, null, null];
  const f = { ...DEFAULT_FIELDS, ...base };
  if (A.name) f.name = A.name;
  if (A.city) f.address = A.city;
  if (A.company) f.company = A.company;
  deriveContacts(f, base);
  const designs = ids.map((id, i) => {
    const T0 = TEMPLATES[id];
    const d = newDesign({ tpl: id, fonts: T0.fonts, pal: { ...(PALETTES[pals[i]] || PALETTES[T0.pal]) }, f: { ...f } });
    d.why = describe(d, false);
    return d;
  });
  return { intro: introFrom(f, A), fields: f, designs, remote: false };
}
