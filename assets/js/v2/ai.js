// AI grafik 2.0 – klient. Jazykový model (bezplatné free tiery cez náš Worker) navrhne tri smery,
// znak je ikona z Lucide (1500+ ikon, zadarmo a bez limitu). Pri výpadku beží lokálny návrhár.
import { newDesign, PALETTES, FONTS, DEFAULT_FIELDS, tr, CZ } from './model.js';
import { TEMPLATES } from './templates.js';
import { analyze, INDUSTRIES } from '../ai-engine.js';
import { processMark } from './mark.js';
import { iconSVG } from '../icons.js';
import { emblemFor } from './emblems.js';

export const API = 'https://vizitkomat-api.webhunter.workers.dev';
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const plain = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const DIR = { classic: tr('Klasický', 'Klasický'), modern: tr('Moderný', 'Moderní'), creative: tr('Kreatívny', 'Kreativní') };
function describe(d) {
  const dir = DIR[d.direction] ? `${DIR[d.direction]} ${tr('smer', 'směr')} · ` : '';
  return `${dir}${TEMPLATES[d.tpl]?.name || ''} · ${FONTS[d.fonts]?.label || ''}${d.mark ? tr(' · znak na mieru', ' · znak na míru') : ''}${d.art && String(d.art).startsWith('data:') ? tr(' · grafika od AI', ' · grafika od AI') : ''}`;
}
function introFrom(fields, A) {
  const bits = [];
  if (fields.role) bits.push(fields.role.toLowerCase());
  if (fields.company) bits.push(fields.company);
  if (fields.address) bits.push(fields.address);
  const mood = (A?.moods || []).map((m) => ({ jemne: tr('jemne', 'jemně'), luxus: tr('luxusne', 'luxusně'), moderne: tr('moderne', 'moderně'), hrave: tr('hravo', 'hravě'), tmave: tr('tmavo', 'tmavě'), prirodne: tr('prírodne', 'přírodně'), tradic: tr('tradične', 'tradičně'), seriozne: tr('seriózne', 'seriózně') }[m])).filter(Boolean);
  if (mood.length) bits.push(mood.join(' a '));
  return bits.length
    ? tr(`Rozumiem: ${bits.join(' · ')}. Pripravil som tri smery: klasický, moderný a kreatívny. Kliknite na ten, ktorý sa vám páči.`, `Rozumím: ${bits.join(' · ')}. Připravil jsem tři směry: klasický, moderní a kreativní. Klikněte na ten, který se vám líbí.`)
    : tr('Pripravil som tri smery: klasický, moderný a kreatívny. Napíšte mi viac o tom, čo robíte, a trafím sa presnejšie.', 'Připravil jsem tři směry: klasický, moderní a kreativní. Napište mi víc o tom, co děláte, a trefím se přesněji.');
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

// ikona Lucide ako náhradný znak (keď generovanie zlyhá)
const ICON_BY = {
  kadernik: 'scissors', reality: 'key', stavba: 'hammer', it: 'code', pravnik: 'scale', wellness: 'flower-2', foto: 'camera',
  gastro: 'chef-hat', auto: 'car', lekar: 'stethoscope', sport: 'dumbbell',
};
const ICON_WORDS = [['scissor', 'scissors'], ['comb', 'scissors'], ['hair', 'scissors'], ['house', 'house'], ['key', 'key'], ['roof', 'house'], ['hammer', 'hammer'], ['plane', 'hammer'], ['saw', 'hammer'], ['wrench', 'wrench'], ['bolt', 'zap'], ['lightning', 'zap'], ['code', 'code'], ['bracket', 'code'], ['scale', 'scale'], ['justice', 'scale'], ['lotus', 'flower-2'], ['flower', 'flower-2'], ['leaf', 'leaf'], ['camera', 'camera'], ['coffee', 'coffee'], ['cup', 'coffee'], ['wine', 'wine'], ['grape', 'wine'], ['car', 'car'], ['tooth', 'shield-check'], ['heart', 'heart'], ['tree', 'leaf'], ['brush', 'paintbrush'], ['music', 'music'], ['dog', 'dog'], ['truck', 'truck'], ['book', 'graduation-cap'], ['stethoscope', 'stethoscope'], ['dumbbell', 'dumbbell'], ['fork', 'utensils'], ['spoon', 'utensils'], ['bread', 'wheat'], ['croissant', 'croissant'], ['wheat', 'wheat'], ['cake', 'cake-slice'], ['pizza', 'pizza'], ['cookie', 'cookie'], ['beer', 'beer'], ['chef', 'chef-hat'], ['gem', 'gem'], ['diamond', 'gem'], ['ring', 'gem'], ['paw', 'paw-print'], ['plug', 'plug'], ['bike', 'bike'], ['gift', 'gift'], ['glasses', 'glasses'], ['shirt', 'shirt'], ['pine', 'tree-pine'], ['flame', 'flame'], ['drill', 'drill'], ['roller', 'paint-roller'], ['sprout', 'sprout'], ['pill', 'pill']];
export async function iconMark(name) {
  const svg = iconSVG(name, '#000000', 1.3).replace('width="24" height="24"', 'width="480" height="480"');
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const im = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
  if (!im) return null;
  const c = document.createElement('canvas'); c.width = 480; c.height = 480; c.getContext('2d').drawImage(im, 0, 0, 480, 480);
  return c.toDataURL('image/png');
}
function iconFor(subject, A) {
  const s = plain(subject);
  const hit = ICON_WORDS.find(([w]) => s.includes(w));
  return hit ? hit[1] : (ICON_BY[A?.industry] || 'sparkles');
}

// celá knižnica Lucide z CDN (zadarmo, bez limitu); overenie, že ikona existuje
const LUCIDE = 'https://cdn.jsdelivr.net/npm/lucide-static@1.52.0/icons/';
async function lucideMark(name) {
  if (!name) return null;
  try {
    const r = await fetch(LUCIDE + name + '.svg');
    if (!r.ok) return null;
    let svg = await r.text();
    if (!svg.includes('<svg')) return null;
    svg = svg.replace(/<!--[\s\S]*?-->/g, '').replace(/width="24"/, 'width="480"').replace(/height="24"/, 'height="480"').replace(/stroke="currentColor"/, 'stroke="#000000"').replace(/stroke-width="2"/, 'stroke-width="1.3"');
    const im = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
    if (!im) return null;
    const c = document.createElement('canvas'); c.width = 480; c.height = 480; c.getContext('2d').drawImage(im, 0, 0, 480, 480);
    return c.toDataURL('image/png');
  } catch (e) { return null; }
}
/** Znak k návrhu: ikona, ktorú vybrala AI, inak podľa slov v zadaní. */
export async function pickMark(icon, subject, A) {
  const m = await lucideMark(icon);
  if (m) return { src: m, ai: false };
  const s = await iconMark(iconFor(subject, A));
  return s ? { src: s, ai: false } : null;
}

/** Znak na mieru: vygeneruje, spracuje a vráti masku (PNG). */
export async function makeMark(subject, A) {
  if (subject) {
    try {
      const r = await postJSON('/artwork', { prompt: subject, kind: 'mark' }, 30000);
      if (r.src) { const m = await processMark(r.src); if (m) return { src: m, ai: true }; }
    } catch (e) { /* záloha nižšie */ }
  }
  const icon = await iconMark(iconFor(subject, A));
  return icon ? { src: icon, ai: false } : null;
}

/** Navrhne vizitky. onArt(i, design) sa volá, keď dorazí znak alebo grafika. */
export async function askAI(prompt, base = {}, { previous, onArt } = {}) {
  const A = analyze(prompt);
  const known = {};
  for (const k of ['name', 'role', 'company', 'tagline', 'address']) if (base[k] && base[k] !== DEFAULT_FIELDS[k]) known[k] = base[k];
  try {
    const body = { prompt, lang: CZ ? 'cz' : 'sk', fields: known, previous, art: false, nonce: previous ? Date.now() : 0 };
    let res;
    try { res = await postJSON('/design', body); } catch (e) { await new Promise((r) => setTimeout(r, 800)); res = await postJSON('/design', body); }
    if (!res.concepts || !res.concepts.length) throw new Error('empty');
    const fields = { ...DEFAULT_FIELDS, ...base, ...res.fields };
    if (!res.fields.company && !known.company) fields.company = base.company && base.company !== DEFAULT_FIELDS.company ? base.company : '';
    if (fields.tagline) fields.tagline = cap(fields.tagline);
    if (fields.role) fields.role = cap(fields.role);
    // ukážkové údaje, ktoré AI nepotvrdila, vymažeme, aby nepôsobili ako chyba
    for (const k of ['role', 'tagline', 'address']) if (!res.fields[k] && !known[k] && fields[k] === DEFAULT_FIELDS[k]) fields[k] = '';
    if (fields.company && fields.name && plain(fields.name) === plain(fields.company)) fields.name = '';
    if (!fields.name || (!res.fields.name && !known.name)) fields.name = placeholderName(fields.role);
    deriveContacts(fields, base);
    const designs = res.concepts.map((c) => {
      const pal = { label: 'AI', ...c.palette };
      delete pal.name;
      const d = newDesign({ tpl: c.template, fonts: c.fonts || TEMPLATES[c.template].fonts, pal, art: c.art.mode === 'library' ? c.art.key : null, f: { ...fields } });
      d.direction = c.direction; d.ai = { art: c.art, mark: c.mark };
      d.markPending = false; d.why = describe(d);
      return d;
    });
    // žiadne automatické ikonky ako logo: šablóny majú typografický monogram / wordmark
    const em = emblemFor(res.concepts.find((c) => c.icon)?.icon || '', prompt + ' ' + (fields.role || '')) || emblemFor('', prompt);
    designs.forEach((d) => { d.markPending = false; d.ai.icon = res.concepts.find((c) => c.icon)?.icon || ''; if (em) d.emblem = em; });
    let budget = 2;
    designs.forEach((d, i) => {
      if (d.ai.art.mode === 'generate' && d.ai.art.prompt && budget-- > 0) {
        d.artPending = true;
        postJSON('/artwork', { prompt: d.ai.art.prompt, kind: d.ai.art.kind }, 30000)
          .then((r) => { if (r.src) d.art = r.src; })
          .catch(() => {})
          .finally(() => { d.artPending = false; d.why = describe(d); onArt && onArt(i, d); });
      }
    });
    return { intro: introFrom(fields, A), fields, designs, remote: true };
  } catch (e) {
    return local(prompt, base, A, onArt);
  }
}

function placeholderName(role = '') {
  const fem = /(ka|ice|ova|yne|na)$/i.test(plain(role).split(/\s+/).pop() || '');
  return fem ? (CZ ? 'Lucie Hrušková' : 'Lucia Hrušková') : (CZ ? 'Petr Novák' : 'Peter Novák');
}
function deriveContacts(f, base) {
  const dom = plain(f.company).replace(/^(salon|studio|atelier|firma)\s+/, '').replace(/[^a-z0-9]+/g, '') || plain(f.name).split(/\s+/).pop()?.replace(/[^a-z]/g, '');
  const tld = CZ ? 'cz' : 'sk';
  const first = plain(f.name).split(/\s+/)[0]?.replace(/[^a-z]/g, '') || 'info';
  if (!base.email && dom) f.email = `${first}@${dom}.${tld}`;
  if (!base.web && dom) f.web = `${dom}.${tld}`;
  if (!base.address && f.address === DEFAULT_FIELDS.address) f.address = '';
}

// ---------- záloha bez servera ----------
const IND_TPL = {
  kadernik: ['saloon', 'arkada', 'glow'], reality: ['panorama', 'samet', 'builders'], stavba: ['stavitel', 'vykres', 'builders'],
  it: ['neon', 'kontrast', 'swiss'], pravnik: ['erb', 'deco', 'venec'], wellness: ['lotos', 'hvezdy', 'vetvicka'],
  foto: ['objektiv', 'eukalyptus', 'ruzovezlato'], gastro: ['prazirna', 'cafe', 'klas'], auto: ['garaz', 'stavitel', 'odznak'],
  lekar: ['medic', 'vlnyluxe', 'maitland'], sport: ['odznak', 'garaz', 'loud'],
};
// konkrétny odbor podľa slov v zadaní → ilustrovaná šablóna na prvé miesto
const KW_TPL = [[/pek[aá]r|chleb|chlieb|kvás/i, 'klas'], [/v[ií]n[aoá]r|vinař|víno|vino\b/i, 'etiketa'], [/kvet|květ|flor/i, 'kytice'], [/pivo|pivovar|sládek|sládok/i, 'chmel'], [/stol[aá]r|truhl|nábyt|nabyt/i, 'letokruhy'], [/cukr|tort|dort|zákusk|zakusk/i, 'dortik'], [/foto|fotograf/i, 'objektiv'], [/káv|kav[aá]r|kavia|barista|pražia|praží/i, 'prazirna'], [/svad|svat|wedding/i, 'eukalyptus'], [/advok|práv|prav[nň]|notár|notář/i, 'erb'], [/archit/i, 'vykres'], [/auto|servis|mechan|pneu/i, 'garaz'], [/jóg|jog[ay]/i, 'lotos'], [/terap|psych|kouč|kouc/i, 'hvezdy'], [/realit|makl/i, 'panorama'], [/stav[ebi]|stavb/i, 'stavitel'], [/program|vývoj|vyvoj|softw/i, 'neon'], [/kader|kadeř|salón|salon|nech|neht/i, 'arkada']];

const IND_PAL = {
  kadernik: ['ruza', 'krieda', 'levandula'], reality: ['noir', 'navy', 'smaragd'], stavba: ['kobalt', 'navy', 'piesok'],
  it: ['limetka', 'grafit', 'sneh'], pravnik: ['noir', 'bordo', 'smaragd'], wellness: ['salvia', 'krieda', 'levandula'],
  foto: ['krieda', 'koral', 'indigo'], gastro: ['piesok', 'smaragd', 'koral'], auto: ['kobalt', 'grafit', 'sneh'],
  lekar: ['more', 'salvia', 'navy'], sport: ['kobalt', 'koral', 'grafit'],
};
// ikona podľa slov v zadaní (záložný znak)
const PROMPT_ICONS = [['pek', 'wheat'], ['chlieb', 'wheat'], ['chleb', 'wheat'], ['cukr', 'cake-slice'], ['tort', 'cake-slice'], ['kvet', 'flower'], ['květ', 'flower'], ['kav', 'coffee'], ['káv', 'coffee'], ['pizz', 'pizza'], ['piv', 'beer'], ['vin', 'wine'], ['vín', 'wine'], ['kader', 'scissors'], ['kadeř', 'scissors'], ['barber', 'scissors'], ['zub', 'smile'], ['lekár', 'stethoscope'], ['lékař', 'stethoscope'], ['veter', 'paw-print'], ['psí', 'paw-print'], ['elektr', 'plug'], ['stav', 'hammer'], ['stol', 'tree-pine'], ['truhl', 'tree-pine'], ['tesár', 'tree-pine'], ['auto', 'car'], ['realit', 'key'], ['makl', 'key'], ['advok', 'scale'], ['práv', 'scale'], ['foto', 'camera'], ['program', 'code'], ['jóg', 'flower-2'], ['jog', 'flower-2'], ['masá', 'flower-2'], ['šperk', 'gem'], ['zlat', 'gem'], ['záhrad', 'sprout'], ['zahrad', 'sprout'], ['malí', 'paint-roller'], ['maliar', 'paint-roller'], ['fitn', 'dumbbell'], ['tréner', 'dumbbell'], ['trenér', 'dumbbell'], ['kuchár', 'chef-hat'], ['reštaur', 'chef-hat'], ['restaur', 'chef-hat'], ['optik', 'glasses'], ['móda', 'shirt'], ['butik', 'shirt']];
const CAPS = /^[A-ZÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽĚŘŮ]/;
const PREP = new Set(['v', 'vo', 've', 'z', 'zo', 'u', 'pri', 'na', 'do', 'od', 'z']);
function companyFrom(raw, name) {
  const words = raw.replace(/[,.;:!?()]/g, ' ').split(/\s+/).filter(Boolean);
  let run = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (CAPS.test(w) && !(i > 0 && PREP.has(words[i - 1]))) { run.push(w); }
    else if (run.length) break;
  }
  const c = run.join(' ');
  if (!c || run.length < 2 || (name && c.includes(name.split(' ')[0]))) return '';
  return c;
}
const BIZ = /^(pek[aá]re[nň]|pek[aá]rna|sal[oó]n|studio|štúdio|kaviare[nň]|kav[aá]rna|reštaur[aá]cia|restaurace|firma|ateli[eé]r|cukr[aá]re[nň]|kvetin[aá]rstvo|květinářství|penzi[oó]n|hotel|bistro|obchod|autoservis|klinika|ambulancia|ordinace)$/i;
// „Jana Malá, kaderníčka v Trnave“ → meno + profesia
function nameRole(raw) {
  const U = 'A-ZÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽĚŘŮ', l = 'a-záäčďéíľĺňóôŕšťúýžěřů';
  const m = raw.match(new RegExp(`^\\s*((?:(?:Ing|Mgr|MUDr|JUDr|PhDr|MVDr|Bc|RNDr|PaedDr|Dr)\\.\\s*)*[${U}][${l}]+\\s+[${U}][${l}]+)\\s*[,–-]\\s*([${l} ]{3,40}?)(?=\\s+(?:v|vo|ve|z|zo|ze|u|pri|na|pre|pro|z)\\s|[,.;]|$)`, 'u'));
  if (!m || BIZ.test(m[1].replace(/^(?:[A-Za-z]+\.\s*)+/, '').split(/\s+/)[0])) return {};
  const role = m[2].trim().split(/\s+/).length <= 3 ? cap(m[2].trim()) : '';
  return { name: m[1], role };
}
function local(prompt, base, A, onArt) {
  let ids = IND_TPL[A.industry] || ['glow', 'saloon', 'odznak'];
  const kw = KW_TPL.find(([re]) => re.test(prompt));
  if (kw) ids = [kw[1], ...ids.filter((t) => t !== kw[1])].slice(0, 3);
  const pals = IND_PAL[A.industry] || ['krieda', 'more', 'ruza'];
  const L = CZ ? 'cz' : 'sk';
  const I = INDUSTRIES[A.industry];
  const f = { ...DEFAULT_FIELDS, ...base };
  for (const k of ['role', 'tagline', 'address', 'company']) if (!base[k]) f[k] = '';
  const NR = nameRole(prompt);
  if (I) { f.role = I.role[L][A.fem ? 1 : 0]; f.tagline = I.tagline[L][0]; }
  if (NR.role) f.role = NR.role;
  if (A.city) f.address = A.city;
  const nm = A.name || NR.name || '';
  f.company = A.company || companyFrom(prompt, nm) || '';
  if (nm && plain(f.company) === plain(nm)) f.company = '';
  f.name = nm || base.name || placeholderName(f.role);
  deriveContacts(f, base);
  const dirs = ['classic', 'modern', 'creative'];
  const designs = ids.map((id, i) => {
    const d = newDesign({ tpl: id, fonts: TEMPLATES[id].fonts, pal: { ...(PALETTES[pals[i]] || PALETTES[TEMPLATES[id].pal]) }, f: { ...f } });
    d.direction = dirs[i]; d.markPending = false; d.why = describe(d);
    return d;
  });
  const p = plain(prompt);
  const hit = PROMPT_ICONS.find(([w]) => p.includes(plain(w)));
  const em = emblemFor(hit ? hit[1] : (ICON_BY[A.industry] || ''), prompt + ' ' + (f.role || ''));
  designs.forEach((d) => { d.markPending = false; d.ai = { icon: hit ? hit[1] : (ICON_BY[A.industry] || '') }; if (em) d.emblem = em; d.why = describe(d); });
  return { intro: introFrom(f, A), fields: f, designs, remote: false };
}
