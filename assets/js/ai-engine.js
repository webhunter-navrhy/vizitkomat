// AI grafik – z voľného popisu poskladá návrhy vizitiek.
// Ak je nastavený VK.aiEndpoint (jazykový model na serveri), použije ho;
// inak beží lokálny návrhový engine priamo v prehliadači.
import { TEMPLATES, PALETTES, FONT_PAIRS, newDesign, DEFAULT_FIELDS } from './card-engine.js';

const lang = () => (window.VK && window.VK.lang) || 'sk';
const t = (sk, cz) => (lang() === 'cz' ? cz : sk);

// odbory: kľúčové slová (bez diakritiky, začiatky slov), roly [muž, žena]
export const INDUSTRIES = {
  kadernik: {
    label: ['kaderníctvo', 'kadeřnictví'],
    kw: ['kader', 'barber', 'vlas', 'salon', 'strih', 'stric', 'kosmet', 'kozmet', 'necht', 'mihal', 'rias', 'make-up', 'makeup', 'vizaz', 'beauty', 'manik', 'pedik', 'obocie', 'oboci'],
    role: { sk: ['Kaderník', 'Kaderníčka'], cz: ['Kadeřník', 'Kadeřnice'] },
    company: { sk: 'Salón Lúč', cz: 'Salon Lučina' },
    tagline: { sk: ['Vlasy, ktoré vás poslúchajú.', 'Krása bez náhlenia.', 'Strih, ktorý vydrží.'], cz: ['Vlasy, které poslouchají.', 'Krása bez spěchu.', 'Střih, který vydrží.'] },
    tpls: ['monogram', 'signature', 'arch', 'editorial', 'gradient'], pals: ['pudrova', 'papier', 'slivka', 'piesok'], fonts: ['playfair', 'script', 'fraunces', 'bodoni'],
  },
  reality: {
    label: ['reality', 'reality'],
    kw: ['realit', 'makler', 'nehnutel', 'nemovit', 'hypot', 'byty', 'developer', 'pozem'],
    role: { sk: ['Realitný maklér', 'Realitná maklérka'], cz: ['Realitní makléř', 'Realitní makléřka'] },
    company: { sk: 'Domov Reality', cz: 'Domov Reality' },
    tagline: { sk: ['Predám váš byt za férovú cenu.', 'Nehnuteľnosti s pokojnou hlavou.', 'Kľúče odovzdávam osobne.'], cz: ['Prodám váš byt za férovou cenu.', 'Nemovitosti s klidnou hlavou.', 'Klíče předávám osobně.'] },
    tpls: ['linea', 'corporate', 'editorial', 'stamp', 'swiss'], pals: ['atrament', 'more', 'grafit', 'papier'], fonts: ['bodoni', 'swiss', 'playfair', 'editorial'],
  },
  stavba: {
    label: ['stavebníctvo a remeslo', 'stavebnictví a řemeslo'],
    kw: ['stav', 'murar', 'zedn', 'remesl', 'remes', 'elektr', 'instal', 'tesar', 'truhl', 'stolar', 'podlah', 'strech', 'strec', 'maliar', 'malir', 'pokryv', 'obklad', 'zamoc', 'zamec', 'kovo', 'klemp', 'vodo', 'kurenar', 'topen', 'zahrad', 'okn', 'drevo', 'drev', 'rekonst', 'sklen', 'sklar', 'fasad', 'izol'],
    role: { sk: ['Majster stavby', 'Majsterka stavby'], cz: ['Stavbyvedoucí', 'Stavbyvedoucí'] },
    company: { sk: 'Pevné Stavby', cz: 'Pevné Stavby' },
    tagline: { sk: ['Postavíme to poriadne.', 'Robota, za ktorou si stojíme.', 'Termín dodržíme.'], cz: ['Postavíme to pořádně.', 'Práce, za kterou si stojíme.', 'Termín dodržíme.'] },
    tpls: ['diagonal', 'swiss', 'split', 'blueprint', 'corporate'], pals: ['kobalt', 'marhula', 'les', 'grafit'], fonts: ['grotesk', 'bricolage', 'swiss'],
  },
  it: {
    label: ['IT a vývoj', 'IT a vývoj'],
    kw: ['program', 'vyvoj', 'develop', 'softver', 'software', 'kod', 'data', 'startup', 'aplik', 'frontend', 'backend', 'devops', 'cyber', 'kyber', 'it ', 'ai ', 'web'],
    role: { sk: ['Softvérový vývojár', 'Softvérová vývojárka'], cz: ['Softwarový vývojář', 'Softwarová vývojářka'] },
    company: { sk: 'Bitová Dielňa', cz: 'Bitová Dílna' },
    tagline: { sk: ['Kód, ktorý sa dá čítať.', 'Softvér bez zbytočností.', 'Funguje to. Aj v pondelok.'], cz: ['Kód, který se dá číst.', 'Software bez zbytečností.', 'Funguje to. I v pondělí.'] },
    tpls: ['terminal', 'swiss', 'gradient', 'bigtype', 'blueprint'], pals: ['limetka', 'noc', 'kobalt', 'grafit'], fonts: ['mono', 'grotesk', 'swiss', 'unbounded'],
  },
  pravnik: {
    label: ['právo a financie', 'právo a finance'],
    kw: ['advok', 'prav', 'notar', 'exeku', 'dane', 'uctov', 'uctar', 'financ', 'poist', 'pojist', 'audit', 'bank', 'invest', 'mzd', 'porad'],
    role: { sk: ['Advokát', 'Advokátka'], cz: ['Advokát', 'Advokátka'] },
    company: { sk: 'Advokátska kancelária', cz: 'Advokátní kancelář' },
    tagline: { sk: ['Istota v každom paragrafe.', 'Riešenia, nie výhovorky.', 'Diskrétne a včas.'], cz: ['Jistota v každém paragrafu.', 'Řešení, ne výmluvy.', 'Diskrétně a včas.'] },
    tpls: ['linea', 'corporate', 'editorial', 'monogram', 'swiss'], pals: ['atrament', 'more', 'grafit', 'papier'], fonts: ['bodoni', 'playfair', 'swiss', 'editorial'],
  },
  wellness: {
    label: ['wellness a terapia', 'wellness a terapie'],
    kw: ['masa', 'jog', 'terap', 'psych', 'kouc', 'koc', 'reiki', 'fyzio', 'wellness', 'pilat', 'vyziv', 'dula', 'medit', 'bylin', 'aroma', 'relax', 'energ'],
    role: { sk: ['Terapeut', 'Terapeutka'], cz: ['Terapeut', 'Terapeutka'] },
    company: { sk: 'Ticho & Dych', cz: 'Ticho & Dech' },
    tagline: { sk: ['Priestor, kde sa dá vydýchnuť.', 'Telo v pokoji, hlava v pohode.', 'Pomaly je niekedy najrýchlejšie.'], cz: ['Prostor, kde se dá vydechnout.', 'Tělo v klidu, hlava v pohodě.', 'Pomalu je někdy nejrychleji.'] },
    tpls: ['arch', 'monogram', 'signature', 'editorial', 'stamp'], pals: ['piesok', 'les', 'pudrova', 'papier'], fonts: ['fraunces', 'editorial', 'script', 'playfair'],
  },
  foto: {
    label: ['fotografia a umenie', 'fotografie a umění'],
    kw: ['foto', 'umel', 'umel', 'maliar', 'malir', 'ilustr', 'grafik', 'dizajn', 'design', 'tetov', 'hudb', 'dj', 'video', 'film', 'kamera', 'svadob', 'svatb', 'kreat', 'agentur', 'marketing', 'social', 'influ', 'copy'],
    role: { sk: ['Fotograf', 'Fotografka'], cz: ['Fotograf', 'Fotografka'] },
    company: { sk: 'Ateliér Svetlo', cz: 'Ateliér Světlo' },
    tagline: { sk: ['Zachytím, čo sa nedá zopakovať.', 'Fotky, ku ktorým sa vraciate.', 'Svetlo, príbeh, okamih.'], cz: ['Zachytím, co se nedá zopakovat.', 'Fotky, ke kterým se vracíte.', 'Světlo, příběh, okamžik.'] },
    tpls: ['bigtype', 'signature', 'editorial', 'gradient', 'swiss'], pals: ['noc', 'marhula', 'papier', 'slivka'], fonts: ['unbounded', 'script', 'editorial', 'syne'],
  },
  gastro: {
    label: ['gastro a remeselné výrobky', 'gastro a řemeslné výrobky'],
    kw: ['kavia', 'kavar', 'kav', 'vin', 'pekar', 'cukrar', 'restau', 'bistro', 'farm', 'pivo', 'pivov', 'kvet', 'kvet', 'med', 'syr', 'cater', 'kuchar', 'gastro', 'catering', 'cokol', 'cajov', 'caj', 'zmrz', 'pizz', 'penzi', 'chalup', 'ubyt'],
    role: { sk: ['Majiteľ', 'Majiteľka'], cz: ['Majitel', 'Majitelka'] },
    company: { sk: 'Pod Gaštanom', cz: 'Pod Kaštanem' },
    tagline: { sk: ['Poctivo, ako za starých čias.', 'Robíme to s láskou od rána.', 'Chuť, ktorá sa vracia.'], cz: ['Poctivě, jako za starých časů.', 'Děláme to s láskou od rána.', 'Chuť, která se vrací.'] },
    tpls: ['stamp', 'arch', 'editorial', 'signature', 'split'], pals: ['piesok', 'les', 'marhula', 'papier'], fonts: ['gloock', 'fraunces', 'script', 'editorial'],
  },
  auto: {
    label: ['auto a doprava', 'auto a doprava'],
    kw: ['auto', 'servis', 'pneu', 'doprav', 'taxi', 'kamio', 'motor', 'kamion', 'autod', 'odtah', 'myt', 'stk', 'karos', 'lakov'],
    role: { sk: ['Vedúci servisu', 'Vedúca servisu'], cz: ['Vedoucí servisu', 'Vedoucí servisu'] },
    company: { sk: 'Rýchly Servis', cz: 'Rychlý Servis' },
    tagline: { sk: ['Opravíme to do večera.', 'Auto v dobrých rukách.', 'Bez zbytočného čakania.'], cz: ['Opravíme to do večera.', 'Auto v dobrých rukou.', 'Bez zbytečného čekání.'] },
    tpls: ['diagonal', 'swiss', 'bigtype', 'corporate'], pals: ['kobalt', 'noc', 'marhula', 'grafit'], fonts: ['grotesk', 'unbounded', 'swiss', 'bricolage'],
  },
  lekar: {
    label: ['zdravotníctvo', 'zdravotnictví'],
    kw: ['lekar', 'lekar', 'zubar', 'stomat', 'ambul', 'klinik', 'veter', 'lekarn', 'sestr', 'ortop', 'gyn', 'pedia', 'optik', 'ocn', 'logop', 'ergo'],
    role: { sk: ['Lekár', 'Lekárka'], cz: ['Lékař', 'Lékařka'] },
    company: { sk: 'Ambulancia Zdravie', cz: 'Ordinace Zdraví' },
    tagline: { sk: ['Čas pre každého pacienta.', 'Starostlivosť, ktorej rozumiete.', 'Zdravie bez stresu.'], cz: ['Čas pro každého pacienta.', 'Péče, které rozumíte.', 'Zdraví bez stresu.'] },
    tpls: ['corporate', 'swiss', 'monogram', 'arch'], pals: ['more', 'les', 'papier', 'kobalt'], fonts: ['swiss', 'fraunces', 'playfair'],
  },
  sport: {
    label: ['šport a pohyb', 'sport a pohyb'],
    kw: ['trener', 'fitn', 'fitk', 'sport', 'beh', 'cyklo', 'box', 'crossf', 'tanec', 'tanc', 'plav', 'tenis', 'futb', 'golf', 'lezen'],
    role: { sk: ['Osobný tréner', 'Osobná trénerka'], cz: ['Osobní trenér', 'Osobní trenérka'] },
    company: { sk: 'Pohyb Studio', cz: 'Pohyb Studio' },
    tagline: { sk: ['Silnejší každý týždeň.', 'Tréning, ktorý vás baví.', 'Prvý krok urobíme spolu.'], cz: ['Silnější každý týden.', 'Trénink, který vás baví.', 'První krok uděláme spolu.'] },
    tpls: ['bigtype', 'diagonal', 'swiss', 'gradient'], pals: ['marhula', 'kobalt', 'noc', 'limetka'], fonts: ['unbounded', 'syne', 'grotesk'],
  },
};

const MOODS = {
  jemne:    { kw: ['jemn', 'nezn', 'pastel', 'zensk', 'romant', 'svetl', 'mekk', 'mak', 'vzdusn', 'krehk'], pals: ['pudrova', 'piesok', 'papier', 'slivka'], fonts: ['playfair', 'fraunces', 'script', 'editorial'], tpls: ['monogram', 'arch', 'signature'] },
  luxus:    { kw: ['luxus', 'premi', 'elegan', 'zlat', 'exkluz', 'nobl', 'stylov', 'drah', 'vip'], pals: ['atrament'], fonts: ['bodoni', 'playfair'], tpls: ['linea', 'monogram', 'editorial'] },
  moderne:  { kw: ['modern', 'minimal', 'cist', 'jednodu', 'strohy', 'cisto', 'clean', 'svajc', 'vycist'], pals: ['grafit', 'papier', 'kobalt'], fonts: ['swiss', 'grotesk'], tpls: ['swiss', 'corporate', 'blueprint'] },
  hrave:    { kw: ['hrav', 'vesel', 'farebn', 'barev', 'odvaz', 'vyrazn', 'kreat', 'zabav', 'pestr', 'vyrazn', 'cool', 'odlis', 'origin', 'mlad'], pals: ['marhula', 'limetka', 'slivka', 'kobalt'], fonts: ['unbounded', 'syne', 'bricolage'], tpls: ['bigtype', 'gradient', 'diagonal'] },
  tmave:    { kw: ['tmav', 'ciern', 'cern', 'noc', 'dark', 'temn'], pals: ['noc', 'atrament', 'limetka'], fonts: [], tpls: ['linea', 'terminal', 'bigtype'] },
  prirodne: { kw: ['prirod', 'eko', 'zelen', 'lesn', 'drev', 'bio', 'organ', 'udrzat', 'zem'], pals: ['les', 'piesok'], fonts: ['fraunces', 'gloock'], tpls: ['arch', 'stamp', 'split'] },
  tradic:   { kw: ['tradi', 'rodin', 'poctiv', 'retro', 'vintage', 'stary', 'klasic', 'histor', 'remesel'], pals: ['piesok', 'papier', 'les'], fonts: ['gloock', 'editorial', 'bodoni'], tpls: ['stamp', 'editorial', 'linea'] },
  seriozne: { kw: ['serioz', 'profes', 'doveryhod', 'duveryhod', 'korpor', 'firemn', 'formal', 'solid', 'spolahl', 'spolehl'], pals: ['more', 'grafit', 'atrament'], fonts: ['swiss', 'bodoni'], tpls: ['corporate', 'linea', 'swiss'] },
};

const COLORS = [
  [['modr', 'blue'], ['more', 'kobalt']], [['zelen', 'green'], ['les']], [['cerven', 'red'], ['papier', 'noc']],
  [['ruzov', 'pink'], ['pudrova']], [['fialov', 'purpl'], ['slivka']], [['oranz', 'orang'], ['marhula']],
  [['zlat', 'gold'], ['atrament']], [['ciern', 'cern', 'black'], ['noc', 'grafit']], [['bez', 'krem', 'pies', 'pisk'], ['piesok', 'papier']],
  [['siv', 'sed', 'grey', 'gray'], ['grafit']], [['zlt', 'zlut', 'limet', 'neon'], ['limetka']], [['hned', 'terak', 'cokol'], ['piesok']],
];

const CITIES = {
  bratislave: 'Bratislava', trnave: 'Trnava', ziline: 'Žilina', kosiciach: 'Košice', nitre: 'Nitra', 'banskej bystrici': 'Banská Bystrica',
  presove: 'Prešov', trencine: 'Trenčín', martine: 'Martin', poprade: 'Poprad', piestanoch: 'Piešťany', zvolene: 'Zvolen', senci: 'Senec',
  michalovciach: 'Michalovce', 'novych zamkoch': 'Nové Zámky', komarne: 'Komárno', levicach: 'Levice', prievidzi: 'Prievidza', skalici: 'Skalica',
  brne: 'Brno', praze: 'Praha', ostrave: 'Ostrava', olomouci: 'Olomouc', plzni: 'Plzeň', liberci: 'Liberec', zline: 'Zlín', pardubicich: 'Pardubice',
  'hradci kralove': 'Hradec Králové', 'ceskych budejovicich': 'České Budějovice', jihlave: 'Jihlava', opave: 'Opava', kladne: 'Kladno', karlovych: 'Karlovy Vary',
  'karlovych varech': 'Karlovy Vary', // genitív (zo/z …)
  bratislavy: 'Bratislava', trnavy: 'Trnava', ziliny: 'Žilina', kosic: 'Košice', nitry: 'Nitra', 'banskej bystrice': 'Banská Bystrica', presova: 'Prešov', trencina: 'Trenčín', popradu: 'Poprad', zvolena: 'Zvolen', martina: 'Martin', piestan: 'Piešťany',
  brna: 'Brno', prahy: 'Praha', ostravy: 'Ostrava', olomouce: 'Olomouc', plzne: 'Plzeň', liberce: 'Liberec', zlina: 'Zlín', pardubic: 'Pardubice', jihlavy: 'Jihlava', opavy: 'Opava', kladna: 'Kladno',
  'hradce kralove': 'Hradec Králové', 'ceskych budejovic': 'České Budějovice', 'usti nad labem': 'Ústí nad Labem', teplicich: 'Teplice', chomutove: 'Chomutov', prostejove: 'Prostějov', prerove: 'Přerov', pezinku: 'Pezinok', malackach: 'Malacky', ruzomberku: 'Ružomberok', liptovskom: 'Liptovský Mikuláš',
};

const FEMININE = /(cka|ka|ova|ná|na|ová|kyňa|kyne|ice|yně|ynie|ánka)$/;
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function pick(arr, i) { return arr[((i % arr.length) + arr.length) % arr.length]; }
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return Math.abs(h); }

export function analyze(prompt) {
  const raw = (prompt || '').trim();
  const s = ' ' + strip(raw) + ' ';
  const words = s.split(/[^a-z0-9-]+/).filter(Boolean);
  const has = (kw) => kw.some((k) => (k.endsWith(' ') ? s.includes(' ' + k) : words.some((w) => w.startsWith(k))));

  let industry = null, best = 0;
  for (const [key, I] of Object.entries(INDUSTRIES)) {
    const score = I.kw.filter((k) => has([k])).length;
    if (score > best) { best = score; industry = key; }
  }
  const moods = Object.entries(MOODS).filter(([, M]) => has(M.kw)).map(([k]) => k);
  const colorPals = COLORS.filter(([kw]) => has(kw)).flatMap(([, p]) => p);

  // meno
  let name = '';
  const nm = raw.match(/(?:[Ss]om|[Vv]olám sa|[Vv]olam sa|[Jj]menuji se|[Jj]sem|[Mm]eno|[Jj]méno)\s*:?\s+([A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽĚŘŮ][a-záäčďéíľĺňóôŕšťúýžěřů]+(?:\s+[A-ZÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽĚŘŮ][a-záäčďéíľĺňóôŕšťúýžěřů]+)+)/u);
  if (nm) name = nm[1];
  // mesto
  let city = '';
  const cm = s.match(/\s(?:v|vo|ve|z|zo|u)\s+([a-z]+(?:\s[a-z]+)?)/g) || [];
  for (const m of cm) {
    const key = m.trim().split(/\s+/).slice(1).join(' ');
    if (CITIES[key]) { city = CITIES[key]; break; }
    const one = key.split(' ')[0];
    if (CITIES[one]) { city = CITIES[one]; break; }
  }
  // firma v úvodzovkách
  let company = '';
  const qm = raw.match(/[„"“']([^"“”'„]{2,40})["“”']/u);
  if (qm) company = qm[1].trim();
  // pohlavie
  const fem = (name && /(ová|á)$/u.test(name.split(' ').pop())) ||
    words.some((w) => /^(kadernicka|kadernice|maklerka|makler?ka|fotografka|terapeutka|maserka|pravnicka|advokatka|programatorka|lekarka|lekarka|trenerka|majitelka|kozmeticka|kosmeticka|vyvojarka|vyvojarka|uctovnicka|ucetni|architektka|dizajnerka|designerka|uciteljka|ucitelka|kvetinarka|cukrarka|pekarka|zubarka|psychologicka|psycholozka|koucka|lektorka|fyzioterapeutka|vizazistka|manikerka|grafička|grafickа|graficka|ilustratorka|malirka|maliarka|veterinarka|notarka|poradkyna|poradkyne|sestra|dula)$/.test(w)) ||
    /\b(som|jsem)\s+\w+(ka|ná|ová|ice)\b/u.test(raw.toLowerCase());
  return { industry, moods, colorPals, name, city, company, fem, raw };
}

const TPL_WHY = {
  editorial: ['redakčná kompozícia s veľkým menom a pokojným rytmom', 'redakční kompozice s velkým jménem a klidným rytmem'],
  swiss: ['prísna švajčiarska mriežka, ktorá pôsobí presne', 'přísná švýcarská mřížka, která působí přesně'],
  monogram: ['monogram v kruhu, ktorý si ľudia zapamätajú', 'monogram v kruhu, který si lidé zapamatují'],
  split: ['farebný blok so značkou a čisté údaje vedľa', 'barevný blok se značkou a čisté údaje vedle'],
  terminal: ['terminálový štýl, ktorý ocení každý technik', 'terminálový styl, který ocení každý technik'],
  linea: ['tenké linky a verzálky ako na pozvánke do opery', 'tenké linky a verzálky jako na pozvánce do opery'],
  bigtype: ['obrie písmo cez celú vizitku, nedá sa prehliadnuť', 'obří písmo přes celou vizitku, nedá se přehlédnout'],
  diagonal: ['šikmý pás, ktorý dodá pohyb a energiu', 'šikmý pás, který dodá pohyb a energii'],
  arch: ['mäkký oblúk, ktorý pôsobí pokojne a ľudsky', 'měkký oblouk, který působí klidně a lidsky'],
  blueprint: ['technický výkres s bodkovanou mriežkou', 'technický výkres s tečkovanou mřížkou'],
  stamp: ['pečiatka s textom dookola ako od remeselníka', 'razítko s textem dokola jako od řemeslníka'],
  gradient: ['jemný farebný prechod, ktorý vyzerá moderne', 'jemný barevný přechod, který vypadá moderně'],
  corporate: ['prehľadné firemné rozloženie, ktoré nič neskrýva', 'přehledné firemní rozložení, které nic neskrývá'],
  signature: ['meno ako vlastnoručný podpis', 'jméno jako vlastnoruční podpis'],
};

/** Lokálne návrhy. Vráti { intro, designs[] } */
export function suggestLocal(prompt, base = {}, count = 6) {
  const A = analyze(prompt);
  const L = lang();
  const I = INDUSTRIES[A.industry] || null;
  const seed = hash(prompt || 'vizitkomat');

  let tpls = I ? [...I.tpls] : ['editorial', 'swiss', 'monogram', 'split', 'arch', 'bigtype', 'linea', 'corporate'];
  let pals = I ? [...I.pals] : ['papier', 'atrament', 'les', 'kobalt', 'piesok', 'marhula'];
  let fonts = I ? [...I.fonts] : [];
  // nálady: farby a písmo majú prednosť, rozloženia sa striedajú s odborom
  const mt = [], mp = [], mf = [];
  const order = A.moods.includes('tmave') ? ['tmave', ...A.moods.filter((m) => m !== 'tmave')] : A.moods;
  order.forEach((m) => { mt.push(...MOODS[m].tpls); mp.push(...MOODS[m].pals); mf.push(...MOODS[m].fonts); });
  if (mt.length) {
    const mix2 = [];
    for (let i = 0; i < Math.max(tpls.length, mt.length); i++) { if (tpls[i]) mix2.push(tpls[i]); if (mt[i]) mix2.push(mt[i]); }
    tpls = mix2;
  }
  pals = [...mp, ...pals];
  fonts = [...mf, ...fonts];
  if (A.colorPals.length) pals = [...A.colorPals, ...pals];
  tpls = [...new Set(tpls)]; pals = [...new Set(pals)]; fonts = [...new Set(fonts)];

  const role = I ? I.role[L][A.fem ? 1 : 0] : (base.role || DEFAULT_FIELDS.role);
  const taglines = I ? I.tagline[L] : [t('Robím to rád a poriadne.', 'Dělám to rád a pořádně.')];
  const f = { ...DEFAULT_FIELDS, ...base };
  if (A.name) f.name = A.name;
  if (I && !base.roleLocked) f.role = role;
  if (A.company) f.company = A.company; else if (I && !base.companyLocked) f.company = I.company[L];
  if (A.city) f.address = A.city;
  if (I && !base.taglineLocked) f.tagline = pick(taglines, seed);
  if (A.name) {
    const slug = strip(A.name).replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
    f.email = `${slug.split('.')[0]}@${strip(f.company).replace(/[^a-z]+/g, '') || 'firma'}.${L === 'cz' ? 'cz' : 'sk'}`;
    f.web = `${strip(f.company).replace(/[^a-z]+/g, '') || 'firma'}.${L === 'cz' ? 'cz' : 'sk'}`;
  }

  const designs = [];
  const used = new Set();
  for (let i = 0; designs.length < count && i < 40; i++) {
    const tpl = tpls[i % tpls.length];
    const palKey = pals[(i + (seed % 2)) % pals.length];
    const key = tpl + palKey;
    if (used.has(key)) continue;
    used.add(key);
    const fontKey = fonts.length ? fonts[i % fonts.length] : TEMPLATES[tpl].fonts;
    // šablóna Terminál a Podpis majú vlastné písmo
    const fk = tpl === 'terminal' ? 'mono' : tpl === 'signature' ? 'script' : fontKey;
    const d = newDesign({ tpl, fonts: fk, pal: { ...PALETTES[palKey] }, f: { ...f, tagline: pick(taglines, seed + i) } });
    d.why = `${cap(TPL_WHY[tpl][L === 'cz' ? 1 : 0])}, ${t('paleta', 'paleta')} ${PALETTES[palKey].label}, ${t('písmo', 'písmo')} ${FONT_PAIRS[fk].label}.`;
    d.meta = { tpl, pal: palKey, fonts: fk };
    designs.push(d);
  }

  const parts = [];
  if (I) parts.push(I.label[L === 'cz' ? 1 : 0]);
  if (A.moods.length) parts.push(A.moods.map((m) => moodLabel(m)).join(', '));
  if (A.city) parts.push(A.city);
  const intro = parts.length
    ? t(`Rozumiem: ${parts.join(' · ')}. Tu sú moje návrhy, vyberte si a ďalej upravujte.`, `Rozumím: ${parts.join(' · ')}. Tady jsou mé návrhy, vyberte si a dál upravujte.`)
    : t('Pripravil som niekoľko smerov. Napíšte mi viac o tom, čo robíte, a trafím sa presnejšie.', 'Připravil jsem několik směrů. Napište mi víc o tom, co děláte, a trefím se přesněji.');
  return { intro, designs, analysis: A };
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function moodLabel(m) {
  const map = { jemne: ['jemne', 'jemně'], luxus: ['luxusne', 'luxusně'], moderne: ['moderne', 'moderně'], hrave: ['hravo', 'hravě'], tmave: ['tmavé farby', 'tmavé barvy'], prirodne: ['prírodne', 'přírodně'], tradic: ['tradične', 'tradičně'], seriozne: ['seriózne', 'seriózně'] };
  return map[m][lang() === 'cz' ? 1 : 0];
}

/** Návrhy – najprv server (ak je), inak lokálne. */
export async function suggest(prompt, base = {}, count = 6) {
  const ep = window.VK && window.VK.aiEndpoint;
  if (ep) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, lang: lang(), fields: base, count }), signal: ctrl.signal });
      clearTimeout(to);
      if (r.ok) {
        const j = await r.json();
        const designs = (j.designs || []).filter((x) => TEMPLATES[x.tpl] && PALETTES[x.pal]).map((x) => {
          const d = newDesign({ tpl: x.tpl, fonts: FONT_PAIRS[x.fonts] ? x.fonts : TEMPLATES[x.tpl].fonts, pal: { ...PALETTES[x.pal] }, f: { ...DEFAULT_FIELDS, ...base, ...(x.fields || {}) } });
          d.why = x.why || ''; d.meta = { tpl: x.tpl, pal: x.pal, fonts: d.fonts };
          return d;
        });
        if (designs.length) return { intro: j.intro || '', designs, remote: true };
      }
    } catch (e) { /* lokálny záložný režim */ }
  }
  await new Promise((r) => setTimeout(r, 650 + Math.random() * 500)); // čas na „premýšľanie“
  return suggestLocal(prompt, base, count);
}

// predvolené zadania pre odbory (homepage „Pre koho“)
export const PRESETS = {
  kadernik: { sk: 'Som Jana Kováčová, kaderníčka v Trnave, chcem niečo jemné a elegantné', cz: 'Jsem Jana Kovářová, kadeřnice v Brně, chci něco jemného a elegantního' },
  reality: { sk: 'Som Marek Horváth, realitný maklér v Bratislave, prémiovo a dôveryhodne', cz: 'Jsem Marek Novotný, realitní makléř v Praze, prémiově a důvěryhodně' },
  stavba: { sk: 'Som Peter Baláž, stavebná firma v Žiline, výrazne a čitateľne', cz: 'Jsem Petr Dvořák, stavební firma v Olomouci, výrazně a čitelně' },
  it: { sk: 'Som Tomáš Varga, programátor v Košiciach, tmavé a hravé', cz: 'Jsem Tomáš Procházka, programátor v Brně, tmavé a hravé' },
  pravnik: { sk: 'Som Eva Nagyová, advokátka v Nitre, luxusne a seriózne', cz: 'Jsem Eva Králová, advokátka v Praze, luxusně a seriózně' },
  wellness: { sk: 'Som Zuzana Šimková, masáže a jóga v Poprade, prírodne a pokojne', cz: 'Jsem Zuzana Šimková, masáže a jóga v Liberci, přírodně a klidně' },
  foto: { sk: 'Som Adam Kollár, svadobný fotograf v Banskej Bystrici, odvážne a výrazne', cz: 'Jsem Adam Kolář, svatební fotograf v Plzni, odvážně a výrazně' },
  gastro: { sk: 'Som Mária Hudecová, rodinné vinárstvo v Pezinku, tradične a poctivo', cz: 'Jsem Marie Hudcová, rodinné vinařství ve Zlíně, tradičně a poctivě' },
};
