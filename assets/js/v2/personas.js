// Ukážkové osoby pre náhľady šablón (každá šablóna s iným odborom, nech je vidieť šírku)
import { tr, CZ } from './model.js';

const P = (sk, cz, icon) => ({ ...(CZ ? cz : sk), icon });
const tel = CZ ? '+420 605 123 456' : '+421 905 123 456';
const tld = CZ ? 'cz' : 'sk';
function full(p, dom, first) {
  return { phone: tel, email: `${first}@${dom}.${tld}`, web: `${dom}.${tld}`, ...p };
}

export const PERSONAS = {
  arch: P({ name: 'Lucia Hrušková', role: 'Architektka interiérov', company: 'Hruška Studio', tagline: 'Priestory, v ktorých sa dobre žije.', address: 'Panská 14, Bratislava' },
    { name: 'Lucie Hrušková', role: 'Architektka interiérů', company: 'Hruška Studio', tagline: 'Prostory, ve kterých se dobře žije.', address: 'Panská 14, Praha' }, 'lamp-floor'),
  pekar: P({ name: 'Peter Novák', role: 'Pekár', company: 'Pekáreň Kváskovo', tagline: 'Chlieb ako kedysi.', address: 'Banská Bystrica' },
    { name: 'Petr Novák', role: 'Pekař', company: 'Pekárna Kváskovo', tagline: 'Chleba jako dřív.', address: 'Olomouc' }, 'wheat'),
  kader: P({ name: 'Jana Malá', role: 'Kaderníčka', company: 'Salón Jana', tagline: 'Účes, ktorý vydrží.', address: 'Trnava' },
    { name: 'Jana Malá', role: 'Kadeřnice', company: 'Salon Jana', tagline: 'Účes, který vydrží.', address: 'Brno' }, 'scissors'),
  makler: P({ name: 'Martin Kováč', role: 'Realitný maklér', company: 'Domov Reality', tagline: 'Kľúče odovzdávam osobne.', address: 'Žilina' },
    { name: 'Martin Kovář', role: 'Realitní makléř', company: 'Domov Reality', tagline: 'Klíče předávám osobně.', address: 'Plzeň' }, 'key-round'),
  it: P({ name: 'Tomáš Varga', role: 'Programátor', company: 'Bitlab', tagline: 'Kód, ktorý sa dá čítať.', address: 'Košice' },
    { name: 'Tomáš Varga', role: 'Programátor', company: 'Bitlab', tagline: 'Kód, který se dá číst.', address: 'Ostrava' }, 'code'),
  vino: P({ name: 'Juraj Mrva', role: 'Vinár', company: 'Vinárstvo Pod Pezinkom', tagline: 'Poctivé víno z vlastných viníc.', address: 'Pezinok' },
    { name: 'Jiří Mrva', role: 'Vinař', company: 'Vinařství Pod Pálavou', tagline: 'Poctivé víno z vlastních vinic.', address: 'Mikulov' }, 'grape'),
  joga: P({ name: 'Eva Bieliková', role: 'Lektorka jógy', company: 'Štúdio Prana', tagline: 'Pokojná myseľ, pevné telo.', address: 'Nitra' },
    { name: 'Eva Bílková', role: 'Lektorka jógy', company: 'Studio Prana', tagline: 'Klidná mysl, pevné tělo.', address: 'Liberec' }, 'flower-2'),
  stolar: P({ name: 'Michal Horák', role: 'Stolár', company: 'Stolárstvo Horák', tagline: 'Nábytok na celý život.', address: 'Martin' },
    { name: 'Michal Horák', role: 'Truhlář', company: 'Truhlářství Horák', tagline: 'Nábytek na celý život.', address: 'Jihlava' }, 'tree-pine'),
  zubar: P({ name: 'MUDr. Anna Kráľová', role: 'Zubná lekárka', company: 'Dentál Úsmev', tagline: 'Úsmev bez obáv.', address: 'Prešov' },
    { name: 'MUDr. Anna Králová', role: 'Zubní lékařka', company: 'Dentál Úsměv', tagline: 'Úsměv bez obav.', address: 'Pardubice' }, 'smile'),
  foto: P({ name: 'Katarína Lipová', role: 'Fotografka', company: 'Lipová Foto', tagline: 'Svetlo, ktoré zostane.', address: 'Trenčín' },
    { name: 'Kateřina Lipová', role: 'Fotografka', company: 'Lipová Foto', tagline: 'Světlo, které zůstane.', address: 'Zlín' }, 'camera'),
  kvety: P({ name: 'Mária Horváthová', role: 'Kvetinárka', company: 'Levanduľa', tagline: 'Kvety, ktoré hovoria za vás.', address: 'Nitra' },
    { name: 'Marie Horváthová', role: 'Květinářka', company: 'Levandule', tagline: 'Květiny, které mluví za vás.', address: 'Hradec Králové' }, 'flower'),
  uct: P({ name: 'Ing. Pavol Šimko', role: 'Účtovník', company: 'Šimko Účtovníctvo', tagline: 'Čísla v poriadku, vy v pokoji.', address: 'Poprad' },
    { name: 'Ing. Pavel Šimek', role: 'Účetní', company: 'Šimek Účetnictví', tagline: 'Čísla v pořádku, vy v klidu.', address: 'Kladno' }, 'calculator'),
  nechty: P({ name: 'Nikola Švecová', role: 'Nechtová dizajnérka', company: 'Nails by Nika', tagline: 'Detaily, ktoré si všimnú.', address: 'Piešťany' },
    { name: 'Nikola Švecová', role: 'Nehtová designérka', company: 'Nails by Nika', tagline: 'Detaily, kterých si všimnou.', address: 'Karlovy Vary' }, 'sparkles'),
  barber: P({ name: 'Adam Rybár', role: 'Barber', company: 'Barber Rybár', tagline: 'Strih ako z filmu.', address: 'Zvolen' },
    { name: 'Adam Rybář', role: 'Barber', company: 'Barber Rybář', tagline: 'Střih jako z filmu.', address: 'Opava' }, 'scissors'),
  elektro: P({ name: 'Róbert Kubiš', role: 'Elektrikár', company: 'Kubiš Elektro', tagline: 'Zapojené raz a dobre.', address: 'Senec' },
    { name: 'Robert Kubiš', role: 'Elektrikář', company: 'Kubiš Elektro', tagline: 'Zapojeno jednou a dobře.', address: 'Teplice' }, 'zap'),
  advokat: P({ name: 'JUDr. Viera Hanková', role: 'Advokátka', company: 'Hanková & partneri', tagline: 'Právo zrozumiteľne.', address: 'Bratislava' },
    { name: 'JUDr. Věra Hanková', role: 'Advokátka', company: 'Hanková & partneři', tagline: 'Právo srozumitelně.', address: 'Praha' }, 'scale'),
  kava: P({ name: 'Ondrej Bača', role: 'Barista', company: 'Kaviareň Zrnko', tagline: 'Káva, pre ktorú sa oplatí zastaviť.', address: 'Banská Štiavnica' },
    { name: 'Ondřej Bača', role: 'Barista', company: 'Kavárna Zrnko', tagline: 'Káva, kvůli které se vyplatí zastavit.', address: 'Český Krumlov' }, 'coffee'),
  cukrar: P({ name: 'Zuzana Sladká', role: 'Cukrárka', company: 'Cukráreň Zuzka', tagline: 'Torty, na ktoré sa nezabúda.', address: 'Komárno' },
    { name: 'Zuzana Sladká', role: 'Cukrářka', company: 'Cukrárna Zuzka', tagline: 'Dorty, na které se nezapomíná.', address: 'Tábor' }, 'cake'),
  auto: P({ name: 'Peter Kolár', role: 'Automechanik', company: 'Autoservis Kolár', tagline: 'Opravené poctivo a načas.', address: 'Trenčín' },
    { name: 'Petr Kolář', role: 'Automechanik', company: 'Autoservis Kolář', tagline: 'Opraveno poctivě a včas.', address: 'Kolín' }, 'wrench'),
  stavba: P({ name: 'Ing. Marek Benda', role: 'Stavbyvedúci', company: 'Benda Stavby', tagline: 'Staviame pevne a načas.', address: 'Žilina' },
    { name: 'Ing. Marek Benda', role: 'Stavbyvedoucí', company: 'Benda Stavby', tagline: 'Stavíme pevně a včas.', address: 'Ústí nad Labem' }, 'hammer'),
  pivo: P({ name: 'Lukáš Sládek', role: 'Sládok', company: 'Pivovar Pod Hradom', tagline: 'Varené pomaly, s rešpektom.', address: 'Bojnice' },
    { name: 'Lukáš Sládek', role: 'Sládek', company: 'Pivovar Pod Hradem', tagline: 'Vařeno pomalu, s respektem.', address: 'Kutná Hora' }, 'beer'),
  terapeut: P({ name: 'Mgr. Lucia Tichá', role: 'Psychoterapeutka', company: 'Priestor Ticho', tagline: 'Miesto, kde sa dá nadýchnuť.', address: 'Banská Bystrica' },
    { name: 'Mgr. Lucie Tichá', role: 'Psychoterapeutka', company: 'Prostor Ticho', tagline: 'Místo, kde se dá nadechnout.', address: 'České Budějovice' }, 'moon'),
  svadba: P({ name: 'Simona Veselá', role: 'Svadobná koordinátorka', company: 'Áno, prosím', tagline: 'Váš deň, bez starostí.', address: 'Bratislava' },
    { name: 'Simona Veselá', role: 'Svatební koordinátorka', company: 'Ano, prosím', tagline: 'Váš den, bez starostí.', address: 'Brno' }, 'leaf'),
  upratovanie: P({ name: 'Monika Bieleková', role: 'Upratovacie služby', company: 'Čisto & Hotovo', tagline: 'Vy oddychujete, my upratujeme.', address: 'Bratislava' },
    { name: 'Monika Bílková', role: 'Úklidové služby', company: 'Čisto & Hotovo', tagline: 'Vy odpočíváte, my uklízíme.', address: 'Praha' }, 'broom'),
  fitness: P({ name: 'Dávid Mráz', role: 'Osobný tréner', company: 'Mráz Fitness', tagline: 'Silnejší každý týždeň.', address: 'Košice' },
    { name: 'David Mráz', role: 'Osobní trenér', company: 'Mráz Fitness', tagline: 'Silnější každý týden.', address: 'Brno' }, 'dumbbell'),
  tetovanie: P({ name: 'Rasťo Čierny', role: 'Tatér', company: 'Čierny Atrament', tagline: 'Príbehy pod kožou.', address: 'Nitra' },
    { name: 'Rosťa Černý', role: 'Tatér', company: 'Černý Inkoust', tagline: 'Příběhy pod kůží.', address: 'Plzeň' }, 'needle'),
  uctovnicka: P({ name: 'Ing. Jana Vargová', role: 'Daňová poradkyňa', company: 'Vargová Účtovníctvo', tagline: 'Pokojné čísla, pokojný spánok.', address: 'Trnava' },
    { name: 'Ing. Jana Vargová', role: 'Daňová poradkyně', company: 'Vargová Účetnictví', tagline: 'Klidná čísla, klidný spánek.', address: 'Olomouc' }, 'calculator'),
  psycholog: P({ name: 'Mgr. Petra Lánska', role: 'Psychologička', company: 'Poradňa Lánska', tagline: 'Priestor byť sám sebou.', address: 'Žilina' },
    { name: 'Mgr. Petra Lánská', role: 'Psycholožka', company: 'Poradna Lánská', tagline: 'Prostor být sám sebou.', address: 'Hradec Králové' }, 'butterfly'),
  svfoto: P({ name: 'Ema Kráľová', role: 'Svadobná fotografka', company: 'Ema Kráľová Photo', tagline: 'Váš deň, navždy.', address: 'Piešťany' },
    { name: 'Ema Králová', role: 'Svatební fotografka', company: 'Ema Králová Photo', tagline: 'Váš den, navždy.', address: 'Český Krumlov' }, 'camera'),
  startup: P({ name: 'Filip Novotný', role: 'CEO & spoluzakladateľ', company: 'Nodo', tagline: 'Softvér, ktorý šetrí čas.', address: 'Bratislava' },
    { name: 'Filip Novotný', role: 'CEO & spoluzakladatel', company: 'Nodo', tagline: 'Software, který šetří čas.', address: 'Praha' }, 'cpu'),
};

const DOM = (p) => p.company.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^(studio|stolarstvo|truhlarstvi|pekaren|pekarna|kaviaren|kavarna|cukraren|cukrarna|vinarstvo|vinarstvi)\s+/, '').replace(/[^a-z0-9]+/g, '');
const FIRST = (p) => p.name.replace(/^(MUDr\.|Ing\.|JUDr\.|Mgr\.)\s*/, '').split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Polia vizitky pre osobu. */
export function personaFields(key) {
  const p = PERSONAS[key];
  const { icon, ...f } = p;
  return full(f, DOM(p), FIRST(p));
}

// ktorá osoba ukazuje ktorú šablónu
export const TPL_PERSONA = {
  kytice: 'kvety', klas: 'pekar', etiketa: 'vino', lotos: 'joga', vykres: 'arch', erb: 'advokat', objektiv: 'foto', prazirna: 'kava', arkada: 'kader', stavitel: 'stavba', neon: 'it', eukalyptus: 'svadba', garaz: 'auto', chmel: 'pivo', hvezdy: 'terapeut', panorama: 'makler', letokruhy: 'stolar', dortik: 'cukrar',
  glow: 'nechty', saloon: 'kader', builders: 'makler', cafe: 'kava', samet: 'makler', venec: 'vino', deco: 'advokat', vetvicka: 'kvety', mramorzlato: 'nechty', vlnyluxe: 'zubar', boho: 'joga', odznak: 'barber', medic: 'zubar', konfety: 'cukrar', ruzovezlato: 'nechty', akvarelsalvia: 'kvety',
  lina: 'nechty', alder: 'arch', ticha: 'joga', bodka: 'it', bistro: 'kava', galeria: 'foto', topo: 'makler', stoh: 'barber', organic: 'kvety', ahoj: 'cukrar', luxury: 'advokat', obrys: 'arch', olivia: 'nechty', morton: 'stolar', ar: 'advokat', letterpress: 'foto', egon: 'vino', velora: 'kvety', groom: 'kader', maison: 'kader', muse: 'zubar', casa: 'arch', perla: 'nechty', pruhy: 'cukrar', maitland: 'uct', figlia: 'pekar', ostraka: 'foto', hrastar: 'arch', loud: 'barber', cb: 'stolar', drop: 'kava', foto: 'foto', kontrast: 'it',
  podpis: 'nechty', vlny: 'foto', linka: 'arch', tvary: 'barber', oblouk: 'joga', pismena: 'cukrar', vrstevnice: 'stolar', pruh: 'kava',
  monogram: 'advokat', editorial: 'arch', swiss: 'it', crop: 'barber', wordmark: 'kava', split: 'uct', minimal: 'joga', pecat: 'vino',
  vzor: 'cukrar', noirgold: 'makler', stuha: 'pekar', terminal: 'it', mramor: 'kader', botanika: 'kvety',
  prechod: 'foto', bauhaus: 'arch', linia: 'joga', akvarel: 'kvety',
  iskra: 'elektro', cisto: 'upratovanie', sila: 'fitness', atrament: 'tetovanie', bilancia: 'uctovnicka', dusa: 'psycholog', vows: 'svfoto', britva: 'barber', glazura: 'cukrar', orbit: 'startup',
};
export const personaLabel = (key) => PERSONAS[key]?.role || tr('Ukážka', 'Ukázka');
