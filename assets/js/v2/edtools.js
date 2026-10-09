// Vizitkomat v2 – nástroje editora ako v Canve: plávajúca lišta pri prvku, výber písma a farieb,
// zarovnanie, vrstvy, kontextové menu, panel prvkov, orez a odstránenie pozadia obrázka, rýchle zmeny štýlu
import { FONTS, PALETTES, FOILS, tr, contrast } from './model.js';
import { TEMPLATES } from './templates.js';
import { ORDER } from './featured.js';
import { EMBLEM_KEYS, emblemURL } from './emblems.js';
import { ICONS, iconSVG } from '../icons.js';
import { analyzeLogo } from '../logo.js';
import { toast } from './site.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PT = 25.4 / 72 * 10; // 1 pt v px plátna (K = 10 px/mm)
const isMobile = () => matchMedia('(max-width: 760px)').matches;

// všetky písma, ktoré sa načítavajú (FONT_CSS), zoskupené podľa štýlu
const FAMILIES = [...new Set([...Object.values(FONTS).flatMap((f) => [f.display, f.text]), 'Pinyon Script', 'Montserrat'])];
const groupOf = (f) => (/mono/i.test(f) ? 'mono'
  : /script|caveat/i.test(f) ? 'script'
  : /bebas|archivo black|abril|unbounded|syne|rubik|bricolage/i.test(f) ? 'display'
  : /serif|fraunces|bodoni|playfair|gloock|marcellus|caslon|italiana|cinzel/i.test(f) ? 'serif' : 'sans');
const GROUPS = [['serif', tr('Pätkové', 'Patkové')], ['sans', tr('Bezpätkové', 'Bezpatkové')], ['display', tr('Výrazné', 'Výrazné')], ['script', tr('Písané', 'Psací')], ['mono', tr('Strojové', 'Strojové')]];
const SAMPLE = 'Ľubica Šťastná';

// slovenské a české hľadanie v znakoch a ikonách
const SYN = {
  kvet: 'flower tulip lotus plant leaf', kav: 'coffee', káv: 'coffee', chlieb: 'bread grains wheat croissant', chleb: 'bread grains wheat croissant', pek: 'bread grains wheat croissant', tort: 'cake cookie', dort: 'cake cookie', cukr: 'cake cookie', jedl: 'fork-knife chef-hat utensils pizza bowl', jídl: 'fork-knife chef-hat utensils pizza bowl', reštaur: 'fork-knife chef-hat utensils', restaur: 'fork-knife chef-hat utensils', piz: 'pizza', vín: 'wine grape', vin: 'wine grape', piv: 'beer', koktej: 'martini', koktail: 'martini', bar: 'martini beer wine',
  rastl: 'plant leaf tree sprout potted', rostl: 'plant leaf tree sprout potted', záhrad: 'plant leaf tree shovel sprout', zahrad: 'plant leaf tree shovel sprout', strom: 'tree', list: 'leaf', jog: 'tai-chi lotus yin-yang', masá: 'lotus hand-heart', masa: 'lotus hand-heart', zub: 'tooth', lekár: 'stethoscope heartbeat first-aid pill', lékař: 'stethoscope heartbeat first-aid pill', zdrav: 'stethoscope heartbeat first-aid pill heart', les: 'tree', pes: 'paw dog', zvier: 'paw dog cat', zvíř: 'paw dog cat', vet: 'paw dog cat', mačk: 'cat', kočk: 'cat',
  dom: 'house key buildings', real: 'house key buildings', kľúč: 'key', klíč: 'key', stav: 'hammer wrench hard-hat ruler drill crane building', remes: 'hammer wrench ruler drill', řemes: 'hammer wrench ruler drill', náradie: 'hammer wrench drill', elektr: 'lightning plug lightbulb zap', svetl: 'lightbulb', auto: 'car steering engine tire truck', servis: 'wrench engine tire', foto: 'camera aperture film', kamer: 'camera', práv: 'scales gavel', prav: 'scales gavel', advok: 'scales gavel', financ: 'chart coins calculator', účt: 'calculator coins', uct: 'calculator coins', peni: 'coins', it: 'code terminal cpu brackets', kód: 'code terminal', kod: 'code terminal', počíta: 'cpu code',
  šport: 'barbell dumbbell run bike', sport: 'barbell dumbbell run bike', fitn: 'barbell dumbbell', tréner: 'barbell dumbbell run', hudb: 'music guitar microphone', škol: 'graduation book pencil', skol: 'graduation book pencil', knih: 'book', deti: 'baby balloon', děti: 'baby balloon', cest: 'airplane globe compass mountains', hor: 'mountains', uprat: 'broom hand-soap', úklid: 'broom hand-soap', mód: 'dress t-shirt shirt handbag', krajč: 'needle dress', krejč: 'needle dress', kader: 'scissors hair-dryer', kadeř: 'scissors hair-dryer', barber: 'scissors', nožn: 'scissors', krás: 'sparkle diamond gem hair-dryer eyedropper', kozmet: 'sparkle drop eyedropper lotus', kosmet: 'sparkle drop eyedropper lotus', necht: 'sparkle diamond', neht: 'sparkle diamond',
  umen: 'palette paint-brush pen-nib paintbrush', uměn: 'palette paint-brush pen-nib paintbrush', dizaj: 'palette pen-nib', design: 'palette pen-nib', obchod: 'shopping-bag storefront package', more: 'anchor boat fish', moře: 'anchor boat fish', ryb: 'fish', srdc: 'heart', lás: 'heart', láska: 'heart', hviezd: 'star sparkle', hvězd: 'star sparkle', slnk: 'sun', slun: 'sun', mesiac: 'moon', měsíc: 'moon', telef: 'phone smartphone', mail: 'mail at-sign send', adres: 'map-pin', web: 'globe', siet: 'instagram facebook linkedin youtube', sít: 'instagram facebook linkedin youtube', korun: 'crown', kruh: 'hexagon', doprav: 'truck package', kvetin: 'flower tulip lotus plant',
};
const matches = (name, q) => {
  if (!q) return true;
  const n = name.toLowerCase();
  if (n.includes(q)) return true;
  return q.length > 1 && Object.entries(SYN).some(([k, v]) => (q.startsWith(k) || k.startsWith(q)) && v.split(' ').some((w) => n.includes(w)));
};

const I = {
  b: '<b>B</b>', i: '<i style="font-family:Georgia,serif">I</i>',
  al: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg>',
  ac: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>',
  ar: '<svg viewBox="0 0 24 24"><path d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg>',
  sp: '<svg viewBox="0 0 24 24"><path d="M4 18 8.5 6h1L14 18M5.6 14h6.8M17 8l3-3 3 3M20 5v14M17 16l3 3 3-3"/></svg>',
  pos: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/><path d="M13 7.5h7M4 16.5h7"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>',
  unlock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 6.6-1.6"/></svg>',
  dup: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  del: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  crop: '<svg viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>',
  wand: '<svg viewBox="0 0 24 24"><path d="m4 20 11-11M14 4l1.2 2.4L17.6 7.6 15.2 8.8 14 11.2 12.8 8.8 10.4 7.6l2.4-1.2zM19 13l.7 1.3 1.3.7-1.3.7L19 17l-.7-1.3L17 15l1.3-.7z"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2 21h20zM12 10v5M12 18v.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>',
  group: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M2 2h20v20H2z" stroke-dasharray="2.5 2.5"/></svg>',
  ungroup: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M14 4h6v6M4 14v6h6" stroke-dasharray="2.5 2.5"/></svg>',
  roller: '<svg viewBox="0 0 24 24"><rect x="4" y="3.5" width="14" height="6" rx="1.5"/><path d="M18 6.5h2v5h-8v3"/><rect x="10.5" y="14.5" width="3" height="6.5" rx="1"/></svg>',
  grip: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></svg>',
};
const ALIGN_I = {
  left: '<svg viewBox="0 0 24 24"><path d="M4 3v18M8 7h10v4H8zM8 14h6v4H8z"/></svg>',
  center: '<svg viewBox="0 0 24 24"><path d="M12 3v18M6 7h12v4H6zM8 14h8v4H8z"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M20 3v18M6 7h10v4H6zM10 14h6v4h-6z"/></svg>',
  top: '<svg viewBox="0 0 24 24"><path d="M3 4h18M7 8v10h4V8zM14 8v6h4V8z"/></svg>',
  middle: '<svg viewBox="0 0 24 24"><path d="M3 12h18M7 6v12h4V6zM14 8v8h4V8z"/></svg>',
  bottom: '<svg viewBox="0 0 24 24"><path d="M3 20h18M7 6v10h4V6zM14 10v6h4v-6z"/></svg>',
  'dist-h': '<svg viewBox="0 0 24 24"><path d="M3 4v16M21 4v16M9 8h6v8H9z"/></svg>',
  'dist-v': '<svg viewBox="0 0 24 24"><path d="M4 3h16M4 21h16M8 9h8v6H8z"/></svg>',
};
const TYPE_I = {
  text: '<svg viewBox="0 0 24 24"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  shape: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="10" height="10" rx="1.5"/><circle cx="16" cy="16" r="5"/></svg>',
  line: '<svg viewBox="0 0 24 24"><path d="M4 20 20 4"/></svg>',
  qr: '<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/></svg>',
  icon: '<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>',
};

export function initEdTools({ ed, stage, getStep, curPal, brandColors, onStyleChange, shrink, onSelection }) {
  const host = $('[data-host]', stage);
  const L = {
    font: tr('Písmo', 'Písmo'), size: tr('Veľkosť (pt)', 'Velikost (pt)'), bold: tr('Tučné', 'Tučné'), italic: tr('Kurzíva', 'Kurzíva'), align: tr('Zarovnanie textu', 'Zarovnání textu'), spacing: tr('Rozostupy', 'Rozestupy'), color: tr('Farba', 'Barva'),
    pos: tr('Pozícia a poradie', 'Pozice a pořadí'), lock: tr('Zamknúť', 'Zamknout'), unlock: tr('Odomknúť', 'Odemknout'), dup: tr('Duplikovať', 'Duplikovat'), del: tr('Zmazať', 'Smazat'), more: tr('Ďalšie', 'Další'),
    replace: tr('Vymeniť', 'Vyměnit'), crop: tr('Orezať', 'Oříznout'), bg: tr('Bez pozadia', 'Bez pozadí'),
  };

  /* ---------------- plávajúca lišta ---------------- */
  const bar = $('[data-etb]', stage);
  bar.innerHTML = `
    <div class="etb__g" data-g="text">
      <button class="etb__font" data-act="font" title="${L.font}"><span data-fontname>Font</span><svg viewBox="0 0 12 12"><path d="M3 4.5 6 7.5 9 4.5"/></svg></button>
      <div class="etb__size"><button data-act="sz-" aria-label="−">−</button><input data-szv inputmode="decimal" aria-label="${L.size}"><button data-act="sz+" aria-label="+">+</button></div>
      <button class="etb__b" data-act="bold" title="${L.bold} (⌘B)">${I.b}</button>
      <button class="etb__b" data-act="italic" title="${L.italic} (⌘I)">${I.i}</button>
      <button class="etb__b" data-act="align" title="${L.align}" data-alignicon>${I.al}</button>
      <button class="etb__b" data-act="spacing" title="${L.spacing}">${I.sp}</button>
    </div>
    <div class="etb__g" data-g="bg"><span class="etb__lbl">${tr('Pozadie', 'Pozadí')}</span></div>
    <div class="etb__g" data-g="color"><button class="etb__sw" data-act="color" title="${L.color}"><i data-curcol></i></button></div>
    <div class="etb__g" data-g="img">
      <button class="etb__t" data-act="replace">${I.swap}<span>${L.replace}</span></button>
      <button class="etb__t" data-act="crop">${I.crop}<span>${L.crop}</span></button>
      <button class="etb__t" data-act="removebg">${I.wand}<span>${L.bg}</span></button>
    </div>
    <div class="etb__g" data-g="common">
      <button class="etb__t" data-act="group" title="${tr('Zoskupiť – presúvať a meniť ako celok', 'Seskupit – přesouvat a měnit jako celek')}">${I.group}<span>${tr('Zoskupiť', 'Seskupit')}</span></button>
      <button class="etb__t" data-act="ungroup" title="${tr('Rozdeliť na časti (alebo dvojklik)', 'Rozdělit na části (nebo dvojklik)')}">${I.ungroup}<span>${tr('Rozdeliť', 'Rozdělit')}</span></button>
      <button class="etb__b" data-act="pos" title="${L.pos}">${I.pos}</button>
      <button class="etb__b" data-act="copystyle" title="${tr('Kopírovať štýl – potom kliknite na iný prvok', 'Kopírovat styl – pak klikněte na jiný prvek')}">${I.roller}</button>
      <button class="etb__b" data-act="lock" data-lockbtn title="${L.lock} (⌘⇧L)">${I.unlock}</button>
      <button class="etb__b" data-act="dup" title="${L.dup} (⌘D)">${I.dup}</button>
      <button class="etb__b etb__del" data-act="del" title="${L.del} (Del)">${I.del}</button>
      <button class="etb__b" data-act="more" title="${L.more}">${I.more}</button>
    </div>
    <button class="etb__warn" data-act="fitsafe" data-warn hidden>${I.warn}<span>${tr('Mimo bezpečnej zóny', 'Mimo bezpečné zóny')}</span><b>${tr('Opraviť', 'Opravit')}</b></button>`;
  const dock = $('[data-ctxbar]', stage); if (dock) dock.append(bar);
  const pop = document.createElement('div'); pop.className = 'etb-pop'; pop.hidden = true; stage.append(pop);
  const fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.hidden = true; stage.append(fileIn);
  let popKind = null, moving = false, recolorFrom = null, lastSel = null, styleClip = null, styleSrc = null;

  const kindOf = (o) => {
    if (!o) return null;
    if (o.type === 'activeSelection') return 'multi';
    if (o.data?.bg) return 'bg';
    if (/text/.test(o.type)) return 'text';
    if (o.type === 'image') return ['mark', 'emblem'].includes(o.data?.role) || o.data?.emb ? 'tint' : 'img';
    return 'shape';
  };
  const colorOf = (o) => {
    if (!o) return '';
    if (o.type === 'image') return o.data?.tint || '';
    if (o.type === 'activeSelection') return colorOf(o.getObjects()[0]);
    if (o.type === 'line') return o.stroke;
    if (o.type === 'group') return recolorFrom && ed.colorsOf(o).includes(recolorFrom) ? recolorFrom : (ed.colorsOf(o)[0] || '');
    if ((o.type === 'rect' || o.type === 'circle') && (!o.fill || o.fill === 'transparent') && o.stroke) return o.stroke;
    return o.fill;
  };
  const swatchBg = (c) => (typeof c === 'string' ? (c.startsWith('foil:') ? foilGrad(c) : c) : (c && c.colorStops ? `linear-gradient(135deg, ${c.colorStops.map((s) => s.color).join(',')})` : '#ccc'));
  const foilGrad = (k) => { const st = FOILS[k.slice(5)] || FOILS.gold; return `linear-gradient(135deg, ${st.join(',')})`; };

  function paint(o = ed.active()) {
    closePop();
    if (!o || getStep() !== 'edit') { bar.hidden = true; return; }
    const k = kindOf(o);
    bar.hidden = false;
    bar.dataset.kind = k;
    $('[data-g="text"]', bar).hidden = k !== 'text';
    $('[data-g="img"]', bar).hidden = k !== 'img';
    $('[data-g="color"]', bar).hidden = k === 'img';
    $('[data-g="bg"]', bar).hidden = k !== 'bg';
    $('[data-g="common"]', bar).hidden = k === 'bg';
    $('[data-act="group"]', bar).hidden = !(k === 'multi' && ed.canGroup(o));
    $('[data-act="ungroup"]', bar).hidden = !(o.type === 'group' && o.data?.kind === 'grp');
    if (o !== lastSel) { lastSel = o; recolorFrom = o.type === 'group' ? (ed.colorsOf(o)[0] || null) : null; }
    if (k === 'text') {
      $('[data-fontname]', bar).textContent = o.fontFamily;
      $('[data-fontname]', bar).style.fontFamily = `'${o.fontFamily}'`;
      $('[data-szv]', bar).value = (o.fontSize * (o.scaleY || 1) / PT).toFixed(1).replace('.0', '').replace('.', ',');
      $('[data-act="bold"]', bar).classList.toggle('on', +o.fontWeight >= 600);
      $('[data-act="italic"]', bar).classList.toggle('on', o.fontStyle === 'italic');
      $('[data-alignicon]', bar).innerHTML = o.textAlign === 'center' ? I.ac : o.textAlign === 'right' ? I.ar : I.al;
    }
    $('[data-curcol]', bar).style.background = swatchBg(colorOf(o));
    const locked = ed.isLocked(o);
    const lb = $('[data-lockbtn]', bar); lb.innerHTML = locked ? I.lock : I.unlock; lb.classList.toggle('on', locked); lb.title = (locked ? L.unlock : L.lock) + ' (⌘⇧L)';
    bar.classList.toggle('is-locked', locked);
    const ov = k !== 'multi' && ed.overflow(o);
    $('[data-warn]', bar).hidden = !ov;
    place(o);
  }
  // lišta nad prvkom (alebo pod ním, keď nie je miesto); na mobile dole nad tlačidlom
  function place(o = ed.active()) {
    if (bar.hidden || !o) return;
    if (isMobile() || dock) { bar.style.left = ''; bar.style.top = ''; bar.classList.remove('is-below'); return; }
    const sr = stage.getBoundingClientRect(), hr = host.getBoundingClientRect();
    const r = o.getBoundingRect(); // px plátna vrátane priblíženia
    const bw = bar.offsetWidth, bh = bar.offsetHeight, topMin = 64;
    let x = hr.left - sr.left + r.left + r.width / 2 - bw / 2;
    let y = hr.top - sr.top + r.top - bh - 18;
    let below = false;
    if (y < topMin) { y = hr.top - sr.top + r.top + r.height + 18; below = true; }
    if (y + bh > sr.height - 70) { y = topMin; below = false; }
    const lay = $('[data-layers]', stage), right = lay && !lay.hidden ? sr.width - lay.offsetWidth - 28 : sr.width - 12;
    x = Math.max(12, Math.min(right - bw, x));
    bar.style.left = Math.round(x) + 'px'; bar.style.top = Math.round(y) + 'px';
    bar.classList.toggle('is-below', below);
  }

  /* ---------------- vyskakovacie panely ---------------- */
  function openPop(kind, anchor) {
    if (popKind === kind) { closePop(); return; }
    popKind = kind;
    pop.className = 'etb-pop etb-pop--' + kind;
    pop.innerHTML = ({ font: fontPop, color: colorPop, spacing: spacingPop, pos: posPop, more: morePop }[kind])();
    pop.hidden = false;
    $$('[data-act]', bar).forEach((b) => b.classList.toggle('is-open', b.dataset.act === kind));
    // umiestnenie pod tlačidlom
    const sr = stage.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
    if (isMobile()) { pop.style.left = ''; pop.style.top = ''; }
    else {
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let x = ar.left - sr.left + ar.width / 2 - pw / 2;
      let y = bar.classList.contains('is-below') || ar.top - sr.top - ph - 10 < 8 ? ar.bottom - sr.top + 10 : ar.top - sr.top - ph - 10;
      if (y + ph > sr.height - 8) y = Math.max(8, ar.top - sr.top - ph - 10);
      x = Math.max(8, Math.min(sr.width - pw - 8, x));
      pop.style.left = Math.round(x) + 'px'; pop.style.top = Math.round(y) + 'px';
    }
    if (kind === 'font') { const q = $('[data-fq]', pop); if (!isMobile()) q.focus({ preventScroll: true }); const cur = $('.fpk__list .is-cur', pop); if (cur) pop.scrollTop = cur.offsetTop - pop.clientHeight / 2; }
  }
  function closePop() { pop.hidden = true; popKind = null; $$('.is-open', bar).forEach((b) => b.classList.remove('is-open')); }

  function fontPop() {
    const o = ed.active(); const cur = o?.fontFamily;
    const used = new Set(ed.canvas.getObjects().filter((x) => x.fontFamily).map((x) => x.fontFamily));
    const item = (f) => `<button class="fpk__i${f === cur ? ' is-cur' : ''}" data-fam="${esc(f)}" style="font-family:'${esc(f)}'"><span>${SAMPLE}</span><small>${esc(f)}</small></button>`;
    const groups = [[tr('Vo vizitke', 've vizitce'), [...used]], ...GROUPS.map(([g, label]) => [label, FAMILIES.filter((f) => groupOf(f) === g)])];
    return `<div class="fpk"><input class="fpk__q" data-fq placeholder="${tr('Hľadať písmo…', 'Hledat písmo…')}" autocomplete="off">
      <div class="fpk__list" data-flist>${groups.filter(([, l]) => l.length).map(([label, list]) => `<p class="fpk__h">${label}</p>${list.map(item).join('')}`).join('')}</div></div>`;
  }
  const RECENT = 'vk2-recent-col';
  const recent = () => { try { return JSON.parse(localStorage.getItem(RECENT)) || []; } catch (e) { return []; } };
  const pushRecent = (c) => { if (typeof c !== 'string') return; try { localStorage.setItem(RECENT, JSON.stringify([c, ...recent().filter((x) => x !== c)].slice(0, 8))); } catch (e) { /* nič */ } };
  function colorPop() {
    const o = ed.active(); const cur = String(colorOf(o) || '').toUpperCase();
    const pal = curPal();
    const dot = (c, title = c) => `<button class="cpk__c${String(c).toUpperCase() === cur ? ' on' : ''}" data-col="${esc(c)}" style="background:${swatchBg(c)}" title="${esc(title)}" aria-label="${esc(title)}"></button>`;
    const sec = (h, list) => (list.length ? `<p class="cpk__h">${h}</p><div class="cpk__row">${list.join('')}</div>` : '');
    const docCols = [...new Set([pal.ink, pal.accent, pal.bg, pal.soft, '#FFFFFF', '#111111'].filter((c) => typeof c === 'string').map((c) => c.toUpperCase()))];
    const brand = (brandColors() || []).map((c) => c.toUpperCase()).filter((c) => !docCols.includes(c));
    const foils = [['foil:gold', tr('Zlatá fólia', 'Zlatá fólie')], ['foil:rose', tr('Ružové zlato', 'Růžové zlato')], ['foil:silver', tr('Strieborná fólia', 'Stříbrná fólie')], ['foil:copper', tr('Medená fólia', 'Měděná fólie')]].filter(([k]) => FOILS[k.slice(5)]);
    const hex = /^#[0-9a-f]{6}$/i.test(cur) ? cur : '#000000';
    const inEl = o?.type === 'group' ? ed.colorsOf(o).slice(0, 8) : [];
    const elSec = inEl.length > 1 ? `<p class="cpk__h">${tr('Ktorú farbu zmeniť', 'Kterou barvu změnit')}</p><div class="cpk__row cpk__row--from">${inEl.map((c) => `<button class="cpk__c cpk__from${c === (recolorFrom || inEl[0]) ? ' on' : ''}" data-from="${esc(c)}" style="background:${swatchBg(c)}" title="${esc(c)}"></button>`).join('')}</div><p class="cpk__h">${tr('Nová farba', 'Nová barva')}</p>` : '';
    return `<div class="cpk">${elSec}${sec(tr('Farby vizitky', 'Barvy vizitky'), docCols.map((c) => dot(c)))}${sec(tr('Farby značky', 'Barvy značky'), brand.map((c) => dot(c)))}${sec(tr('Nedávne', 'Nedávné'), recent().map((c) => dot(c, c.startsWith('foil:') ? 'fólia' : c)))}
      ${o?.type === 'activeSelection' || kindOf(o) !== 'img' ? sec(tr('Metalická fólia', 'Metalická fólie'), foils.map(([k, t]) => dot(k, t))) : ''}
      <div class="cpk__own"><label class="cpk__wheel" title="${tr('Vlastná farba', 'Vlastní barva')}"><input type="color" data-colpick value="${hex}"></label><input class="cpk__hex" data-hex value="${hex}" maxlength="7" spellcheck="false" aria-label="HEX"><span class="cpk__ct" data-ct></span></div></div>`;
  }
  function spacingPop() {
    const o = ed.active(); if (!o) return '';
    const up = !!o.data?.upper;
    return `<div class="spk">
      <label>${tr('Rozostup písmen', 'Rozestup písmen')}<output data-lsv>${Math.round(o.charSpacing || 0)}</output><input type="range" min="-100" max="600" step="10" value="${o.charSpacing || 0}" data-ls></label>
      <label>${tr('Výška riadku', 'Výška řádku')}<output data-lhv>${(o.lineHeight || 1.16).toFixed(2)}</output><input type="range" min="0.8" max="2" step="0.02" value="${o.lineHeight || 1.16}" data-lh></label>
      <button class="spk__up${up ? ' on' : ''}" data-act="upper">${tr('VEĽKÉ PÍSMENÁ', 'VELKÁ PÍSMENA')}</button></div>`;
  }
  function posPop() {
    const multi = ed.active()?.type === 'activeSelection';
    const al = (k, t) => `<button data-align="${k}" title="${t}">${ALIGN_I[k]}</button>`;
    return `<div class="ppk"><p class="ppk__h">${multi ? tr('Zarovnať prvky', 'Zarovnat prvky') : tr('Zarovnať na vizitke', 'Zarovnat na vizitce')}</p>
      <div class="ppk__grid">${al('left', tr('Vľavo', 'Vlevo'))}${al('center', tr('Na stred', 'Na střed'))}${al('right', tr('Vpravo', 'Vpravo'))}${al('top', tr('Hore', 'Nahoru'))}${al('middle', tr('Na stred zvisle', 'Na střed svisle'))}${al('bottom', tr('Dole', 'Dolů'))}</div>
      ${multi ? `<div class="ppk__grid ppk__grid--2">${al('dist-h', tr('Rovnaké medzery vodorovne', 'Stejné mezery vodorovně'))}${al('dist-v', tr('Rovnaké medzery zvisle', 'Stejné mezery svisle'))}</div>` : ''}
      <p class="ppk__h">${tr('Poradie vrstiev', 'Pořadí vrstev')}</p>
      <div class="ppk__ord"><button data-order="top">${tr('Úplne dopredu', 'Úplně dopředu')}<kbd>⌘⇧]</kbd></button><button data-order="up">${tr('Dopredu', 'Dopředu')}<kbd>⌘]</kbd></button><button data-order="down">${tr('Dozadu', 'Dozadu')}<kbd>⌘[</kbd></button><button data-order="bottom">${tr('Úplne dozadu', 'Úplně dozadu')}<kbd>⌘⇧[</kbd></button></div></div>`;
  }
  function morePop() {
    const o = ed.active();
    return `<div class="mpk"><label>${tr('Priehľadnosť', 'Průhlednost')}<output data-opv>${Math.round((o?.opacity ?? 1) * 100)} %</output><input type="range" min="10" max="100" value="${Math.round((o?.opacity ?? 1) * 100)}" data-opacity></label>
      <hr><button data-act="multi">${ed.multi ? tr('Ukončiť výber viacerých', 'Ukončit výběr více prvků') : tr('Vybrať viac prvkov', 'Vybrat více prvků')}<kbd>Shift</kbd></button><button data-act="copy">${tr('Kopírovať', 'Kopírovat')}<kbd>⌘C</kbd></button><button data-act="paste">${tr('Vložiť', 'Vložit')}<kbd>⌘V</kbd></button><button data-act="selall">${tr('Vybrať všetko', 'Vybrat vše')}<kbd>⌘A</kbd></button></div>`;
  }

  /* ---------------- akcie ---------------- */
  async function act(a, el) {
    const o = ed.active();
    if (a === 'font' || a === 'color' || a === 'spacing' || a === 'pos' || a === 'more') return openPop(a, el);
    if (a === 'sz-' || a === 'sz+') { if (!o) return; const pt = o.fontSize * (o.scaleY || 1) / PT + (a === 'sz+' ? 1 : -1); return ed.style({ fontSize: Math.max(4, pt) * PT / (o.scaleY || 1) }); }
    if (a === 'bold') return o && ed.style({ fontWeight: +o.fontWeight >= 600 ? 400 : 700 });
    if (a === 'italic') return o && ed.style({ fontStyle: o.fontStyle === 'italic' ? 'normal' : 'italic' });
    if (a === 'align') return o && ed.style({ textAlign: o.textAlign === 'left' ? 'center' : o.textAlign === 'center' ? 'right' : 'left' });
    if (a === 'upper') {
      if (!o) return; const up = !(o.data && o.data.upper);
      if (!up && o.data?.field) await ed.style({ upper: false, text: (o.data.prefix || '') + (ed.design.f[o.data.field] || o.text) }); else await ed.style({ upper: up });
      closePop(); return openPop('spacing', $('[data-act="spacing"]', bar));
    }
    if (a === 'lock') { const on = ed.lock(); toast(on ? tr('Prvok je zamknutý: nedá sa posunúť ani zmazať.', 'Prvek je zamčený: nejde posunout ani smazat.') : tr('Prvok je odomknutý.', 'Prvek je odemčený.')); return; }
    if (a === 'dup') return ed.duplicate();
    if (a === 'copystyle') {
      if (styleClip) { styleClip = null; bar.classList.remove('is-painting'); return; }
      styleClip = ed.styleOf(o); styleSrc = o;
      if (styleClip) { bar.classList.add('is-painting'); toast(tr('Štýl je skopírovaný. Kliknite na prvok, ktorému ho chcete dať.', 'Styl je zkopírovaný. Klikněte na prvek, kterému ho chcete dát.')); }
      return;
    }
    if (a === 'group') { ed.group(); toast(tr('Zoskupené. Dvojklikom skupinu znova rozdelíte.', 'Seskupeno. Dvojklikem skupinu zase rozdělíte.')); return; }
    if (a === 'ungroup') return ed.ungroup();
    if (a === 'del') return ed.remove();
    if (a === 'copy') { ed.copy(); closePop(); toast(tr('Skopírované. Vložíte cez ⌘V.', 'Zkopírováno. Vložíte přes ⌘V.')); return; }
    if (a === 'paste') { ed.paste(); closePop(); return; }
    if (a === 'selall') { closePop(); return ed.selectAll(); }
    if (a === 'multi') { closePop(); ed.setMulti(!ed.multi); return; }
    if (a === 'fitsafe') return o && ed.fitSafe(o);
    if (a === 'replace') return fileIn.click();
    if (a === 'crop') return o && cropDialog(o);
    if (a === 'removebg') return o && removeBg(o);
  }
  bar.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act, b); });
  bar.addEventListener('scroll', () => bar.classList.toggle('is-end', bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 4), { passive: true });
  bar.addEventListener('change', (e) => {
    if (!e.target.matches('[data-szv]')) return;
    const o = ed.active(); const pt = parseFloat(e.target.value.replace(',', '.'));
    if (o && pt > 2) ed.style({ fontSize: pt * PT / (o.scaleY || 1) });
  });
  bar.addEventListener('keydown', (e) => { if (e.target.matches('[data-szv]') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); act(e.key === 'ArrowUp' ? 'sz+' : 'sz-'); } });
  fileIn.addEventListener('change', async () => { const f = fileIn.files[0]; const o = ed.active(); if (f && o) ed.replaceImage(o, await shrink(f, 2000, f.type === 'image/png' ? 'image/png' : 'image/jpeg')); fileIn.value = ''; });

  async function setColor(c) {
    const o = ed.active(); if (!o) return;
    if (o.type === 'group' && o.data?.kind === 'grp') {
      const from = recolorFrom && ed.colorsOf(o).includes(recolorFrom) ? recolorFrom : ed.colorsOf(o)[0];
      await ed.recolor(o, from, c); recolorFrom = String(c).toUpperCase(); lastSel = o;
      const fb = $(`.cpk__from[data-from]`, pop); if (fb) { closePop(); openPop('color', $('[data-act="color"]', bar)); }
    } else await ed.style({ color: c });
    pushRecent(c);
    $$('[data-col]', pop).forEach((b) => b.classList.toggle('on', b.dataset.col.toUpperCase() === String(c).toUpperCase()));
    const ct = $('[data-ct]', pop);
    if (ct && /^#[0-9a-f]{6}$/i.test(c)) { const bg = curPal().bg; const r = contrast(c, bg); ct.textContent = r < 3 ? tr('slabý kontrast', 'slabý kontrast') : ''; }
  }
  pop.addEventListener('click', async (e) => {
    const fam = e.target.closest('[data-fam]');
    if (fam) { await ed.style({ fontFamily: fam.dataset.fam }); $$('.fpk__i', pop).forEach((b) => b.classList.toggle('is-cur', b === fam)); return; }
    const fr = e.target.closest('[data-from]'); if (fr) { recolorFrom = fr.dataset.from; $$('.cpk__from', pop).forEach((b) => b.classList.toggle('on', b === fr)); $('[data-curcol]', bar).style.background = swatchBg(recolorFrom); return; }
    const c = e.target.closest('[data-col]'); if (c) return setColor(c.dataset.col);
    const al = e.target.closest('[data-align]'); if (al) return ed.alignSel(al.dataset.align);
    const ord = e.target.closest('[data-order]'); if (ord) return ed.order(ord.dataset.order);
    const a = e.target.closest('[data-act]'); if (a) act(a.dataset.act, a);
  });
  pop.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('[data-fq]')) { const q = t.value.trim().toLowerCase(); $$('.fpk__i', pop).forEach((b) => { b.hidden = q && !b.dataset.fam.toLowerCase().includes(q); }); $$('.fpk__h', pop).forEach((h) => { let n = h.nextElementSibling, any = false; while (n && !n.matches('.fpk__h')) { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; }); }
    if (t.matches('[data-colpick]')) { $('[data-hex]', pop).value = t.value.toUpperCase(); setColorD(t.value.toUpperCase()); }
    if (t.matches('[data-hex]') && /^#[0-9a-f]{6}$/i.test(t.value)) setColor(t.value.toUpperCase());
    if (t.matches('[data-ls]')) { $('[data-lsv]', pop).textContent = t.value; ed.style({ charSpacing: +t.value }); }
    if (t.matches('[data-lh]')) { $('[data-lhv]', pop).textContent = (+t.value).toFixed(2); ed.style({ lineHeight: +t.value }); }
    if (t.matches('[data-opacity]')) { $('[data-opv]', pop).textContent = t.value + ' %'; ed.style({ opacity: +t.value / 100 }); }
  });
  let colT; const setColorD = (c) => { clearTimeout(colT); colT = setTimeout(() => setColor(c), 60); };
  pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); if (e.key === 'Enter' && e.target.matches('[data-fq]')) $('.fpk__i:not([hidden])', pop)?.click(); });
  document.addEventListener('pointerdown', (e) => { if (!pop.hidden && !e.target.closest('.etb-pop') && !e.target.closest('.etb')) closePop(); });

  /* ---------------- odstránenie bieleho pozadia, orez ---------------- */
  async function removeBg(o) {
    let src = o.getSrc ? o.getSrc() : null; if (!src) return;
    // orezaný obrázok: najprv vystrihneme viditeľnú časť, aby sa orez nestratil
    if (o.cropX || o.cropY || o.width < (o.getElement().naturalWidth || o.getElement().width)) {
      const el = o.getElement(), c = document.createElement('canvas'); c.width = Math.round(o.width); c.height = Math.round(o.height);
      c.getContext('2d').drawImage(el, o.cropX || 0, o.cropY || 0, o.width, o.height, 0, 0, c.width, c.height);
      src = c.toDataURL('image/png');
    }
    const b = $('[data-act="removebg"]', bar); b.classList.add('is-busy');
    try {
      const r = await analyzeLogo(src);
      if (!r.removedBg) { toast(tr('Pozadie obrázka nie je biele, nechali sme ho tak. Najlepšie fungujú logá na bielom.', 'Pozadí obrázku není bílé, nechali jsme ho být. Nejlépe fungují loga na bílém.')); return; }
      await ed.replaceImage(o, r.src);
      toast(tr('Biele pozadie je preč.', 'Bílé pozadí je pryč.'), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() });
    } finally { b.classList.remove('is-busy'); }
  }
  function cropDialog(o) {
    const el = o.getElement(); const W = el.naturalWidth || el.width, H = el.naturalHeight || el.height;
    let r = { x: o.cropX || 0, y: o.cropY || 0, w: o.width, h: o.height };
    const dlg = document.createElement('div'); dlg.className = 'ecrop'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true');
    dlg.innerHTML = `<div class="ecrop__box"><div class="ecrop__head"><b>${tr('Orezať obrázok', 'Oříznout obrázek')}</b><span>${tr('Ťahajte rámik alebo jeho rohy.', 'Táhněte rámeček nebo jeho rohy.')}</span></div>
      <div class="ecrop__stage" data-cs><div class="ecrop__clip"><div class="ecrop__img" data-ci></div><div class="ecrop__dim" data-cd></div></div><div class="ecrop__r" data-cr><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div>
      <div class="ecrop__foot"><button class="link" data-c="reset">${tr('Celý obrázok', 'Celý obrázek')}</button><span></span><button class="btn btn--w btn--sm" data-c="cancel">${tr('Zrušiť', 'Zrušit')}</button><button class="btn btn--c btn--sm" data-c="ok">${tr('Orezať', 'Oříznout')}</button></div></div>`;
    document.body.append(dlg);
    const stg = $('[data-cs]', dlg), img = $('[data-ci]', dlg), rect = $('[data-cr]', dlg);
    const maxW = Math.min(720, innerWidth - 60), maxH = Math.min(460, innerHeight - 220);
    const sc = Math.min(maxW / W, maxH / H);
    stg.style.width = W * sc + 'px'; stg.style.height = H * sc + 'px';
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.getContext('2d').drawImage(el, 0, 0); img.append(cv);
    const dim = $('[data-cd]', dlg);
    const draw = () => { const st = { left: r.x * sc + 'px', top: r.y * sc + 'px', width: r.w * sc + 'px', height: r.h * sc + 'px' }; Object.assign(rect.style, st); Object.assign(dim.style, st); };
    draw();
    let drag = null;
    rect.addEventListener('pointerdown', (e) => { e.preventDefault(); rect.setPointerCapture(e.pointerId); drag = { h: e.target.dataset.h || 'move', x: e.clientX, y: e.clientY, r: { ...r } }; });
    rect.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) / sc, dy = (e.clientY - drag.y) / sc, q = { ...drag.r }, min = Math.max(8, Math.min(W, H) * 0.04);
      if (drag.h === 'move') { q.x = Math.max(0, Math.min(W - q.w, q.x + dx)); q.y = Math.max(0, Math.min(H - q.h, q.y + dy)); }
      else {
        if (drag.h.includes('w')) { const nx = Math.max(0, Math.min(q.x + q.w - min, q.x + dx)); q.w += q.x - nx; q.x = nx; }
        if (drag.h.includes('e')) q.w = Math.max(min, Math.min(W - q.x, q.w + dx));
        if (drag.h.includes('n')) { const ny = Math.max(0, Math.min(q.y + q.h - min, q.y + dy)); q.h += q.y - ny; q.y = ny; }
        if (drag.h.includes('s')) q.h = Math.max(min, Math.min(H - q.y, q.h + dy));
      }
      r = q; draw();
    });
    rect.addEventListener('pointerup', () => { drag = null; });
    const close = () => { dlg.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); if (e.key === 'Enter') ok(); };
    const ok = () => { ed.crop(o, { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }); close(); };
    document.addEventListener('keydown', onKey);
    dlg.addEventListener('click', (e) => {
      const c = e.target.closest('[data-c]')?.dataset.c;
      if (c === 'cancel' || e.target === dlg) close();
      if (c === 'reset') { r = { x: 0, y: 0, w: W, h: H }; draw(); }
      if (c === 'ok') ok();
    });
  }

  /* ---------------- kontextové menu (pravé tlačidlo) ---------------- */
  const menu = document.createElement('div'); menu.className = 'ecm'; menu.hidden = true; menu.setAttribute('role', 'menu'); document.body.append(menu);
  ed.on('contextmenu', ({ target, x, y }) => {
    if (getStep() !== 'edit') return;
    const it = (a, label, kbd = '', cls = '') => `<button role="menuitem" data-m="${a}"${cls ? ` class="${cls}"` : ''}>${label}${kbd ? `<kbd>${kbd}</kbd>` : ''}</button>`;
    const locked = target && ed.isLocked(target);
    menu.innerHTML = target
      ? it('copy', tr('Kopírovať', 'Kopírovat'), '⌘C') + it('paste', tr('Vložiť', 'Vložit'), '⌘V') + it('dup', L.dup, '⌘D') + '<hr>'
        + it('up', tr('Dopredu', 'Dopředu'), '⌘]') + it('down', tr('Dozadu', 'Dozadu'), '⌘[') + it('top', tr('Úplne dopredu', 'Úplně dopředu'), '⌘⇧]') + it('bottom', tr('Úplne dozadu', 'Úplně dozadu'), '⌘⇧[') + '<hr>'
        + it('center', tr('Na stred vizitky', 'Na střed vizitky')) + it('lock', locked ? L.unlock : L.lock, '⌘⇧L')
        + (target.type === 'group' && target.data?.kind === 'grp' ? it('ungroup', tr('Rozdeliť na časti', 'Rozdělit na části'), '⌘⇧G') : '') + (ed.canGroup(target) ? it('group', tr('Zoskupiť', 'Seskupit'), '⌘G') : '')
        + '<hr>' + it('del', L.del, 'Del', 'ecm__del')
      : it('paste', tr('Vložiť', 'Vložit'), '⌘V') + it('selall', tr('Vybrať všetko', 'Vybrat vše'), '⌘A') + it('marks', tr('Zobraziť orez a spadávku', 'Zobrazit ořez a spadávku'));
    menu.hidden = false;
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    menu.style.left = Math.min(x, innerWidth - mw - 8) + 'px'; menu.style.top = Math.min(y, innerHeight - mh - 8) + 'px';
    $('button', menu)?.focus({ preventScroll: true });
  });
  menu.addEventListener('click', (e) => {
    const m = e.target.closest('[data-m]')?.dataset.m; if (!m) return;
    menu.hidden = true;
    ({ copy: () => ed.copy(), paste: () => ed.paste(), dup: () => ed.duplicate(), up: () => ed.order('up'), down: () => ed.order('down'), top: () => ed.order('top'), bottom: () => ed.order('bottom'), center: () => { ed.alignSel('center'); ed.alignSel('middle'); }, lock: () => act('lock'), group: () => act('group'), ungroup: () => ed.ungroup(), del: () => ed.remove(), selall: () => ed.selectAll(), marks: () => $('[data-marks]')?.click() })[m]?.();
  });
  menu.addEventListener('keydown', (e) => {
    const items = $$('button', menu), i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (e.key === 'Escape') menu.hidden = true;
  });
  document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !e.target.closest('.ecm')) menu.hidden = true; });
  addEventListener('scroll', () => { menu.hidden = true; }, { passive: true });

  /* ---------------- vrstvy ---------------- */
  const layBtn = $('[data-layers-btn]', stage), layBox = $('[data-layers]', stage);
  const layLabel = (l) => {
    if (l.text) return esc(l.text.replace(/\s+/g, ' ').slice(0, 34));
    if (l.kind === 'qr') return 'QR kód';
    if (l.role === 'logo') return 'Logo';
    if (l.role === 'mark' || l.role === 'emblem') return tr('Znak', 'Znak');
    if (l.role === 'photo') return tr('Fotka', 'Fotka');
    if (l.type === 'image') return tr('Obrázok', 'Obrázek');
    if (l.type === 'line' || l.kind === 'divider') return tr('Čiara', 'Čára');
    if (l.kind === 'grp') return l.o.data?.role === 'user' ? tr('Skupina', 'Skupina') : tr('Ilustrácia', 'Ilustrace');
    if (l.type === 'group') return tr('Ikona', 'Ikona');
    return tr('Tvar', 'Tvar');
  };
  const layIcon = (l) => (/text/.test(l.type) ? TYPE_I.text : l.kind === 'qr' ? TYPE_I.qr : l.type === 'image' ? TYPE_I.image : l.type === 'line' ? TYPE_I.line : l.type === 'group' ? TYPE_I.icon : TYPE_I.shape);
  let layList = [];
  // dlhé série drobných tvarov (časti ilustrácie) zlúčime do jedného riadku
  const isPart = (l) => !l.text && l.kind !== 'qr' && l.type !== 'image' && ['path', 'circle', 'rect', 'line', 'group', 'polygon', 'ellipse'].includes(l.type);
  function collapse(list) {
    const out = [];
    for (let i = 0; i < list.length;) {
      let j = i; while (j < list.length && isPart(list[j])) j++;
      if (j - i >= 4) {
        const items = list.slice(i, j);
        out.push({ group: true, items, o: items[0].o, type: 'path', label: tr('Ilustrácia', 'Ilustrace') + ` · ${items.length} ${tr('častí', 'částí')}`, locked: items.every((x) => x.locked), visible: items.some((x) => x.visible), selected: items.some((x) => x.selected) });
        i = j;
      } else { out.push(list[i]); i++; }
    }
    return out;
  }
  function paintLayers() {
    if (!layBox || layBox.hidden) return;
    layList = collapse(ed.layers());
    $('[data-lay-list]', layBox).innerHTML = layList.length ? layList.map((l, i) => `<li class="lay${l.selected ? ' on' : ''}${l.visible ? '' : ' is-off'}${l.group ? ' lay--grp' : ''}" data-i="${i}" draggable="${!isMobile() && !l.group}">
      <span class="lay__grip" aria-hidden="true">${I.grip}</span><span class="lay__ic">${layIcon(l)}</span><span class="lay__t">${l.group ? esc(l.label) : layLabel(l)}</span>
      <button class="lay__b" data-lay="vis" title="${l.visible ? tr('Skryť', 'Skrýt') : tr('Zobraziť', 'Zobrazit')}">${l.visible ? I.eye : I.eyeOff}</button>
      <button class="lay__b${l.locked ? ' on' : ''}" data-lay="lock" title="${l.locked ? L.unlock : L.lock}">${l.locked ? I.lock : I.unlock}</button></li>`).join('') : `<li class="lay__empty">${tr('Na tejto strane nie sú žiadne prvky.', 'Na této straně nejsou žádné prvky.')}</li>`;
  }
  layBtn?.addEventListener('click', () => { const on = layBox.hidden; layBox.hidden = !on; layBtn.setAttribute('aria-pressed', on); if (on) paintLayers(); place(); });
  $('[data-layers-x]', stage)?.addEventListener('click', () => { layBox.hidden = true; layBtn.setAttribute('aria-pressed', 'false'); place(); });
  layBox?.addEventListener('click', (e) => {
    const li = e.target.closest('[data-i]'); if (!li) return;
    const l = layList[+li.dataset.i]; if (!l) return;
    const b = e.target.closest('[data-lay]');
    const objs = l.group ? l.items.map((x) => x.o) : [l.o];
    if (b?.dataset.lay === 'vis') { objs.forEach((o, k) => (k === objs.length - 1 ? ed.setVisible(o, !l.visible) : o.set('visible', !l.visible))); return; }
    if (b?.dataset.lay === 'lock') { objs.forEach((o) => ed.lock(o, !l.locked)); paintLayers(); return; }
    if (!l.visible) return;
    if (l.group) return ed.selectMany(objs.filter((o) => o.visible !== false));
    ed.select(l.o, e.shiftKey || e.metaKey);
  });
  let dragI = null;
  layBox?.addEventListener('dragstart', (e) => { const li = e.target.closest('[data-i]'); if (!li) return; dragI = +li.dataset.i; li.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; });
  layBox?.addEventListener('dragover', (e) => { const li = e.target.closest('[data-i]'); if (dragI == null || !li) return; e.preventDefault(); $$('.lay', layBox).forEach((x) => x.classList.toggle('is-over', x === li)); });
  layBox?.addEventListener('drop', (e) => { const li = e.target.closest('[data-i]'); if (dragI == null || !li) return; e.preventDefault(); const l = layList[dragI]; ed.moveLayer(l.o, +li.dataset.i); dragI = null; });
  layBox?.addEventListener('dragend', () => { dragI = null; $$('.lay', layBox).forEach((x) => x.classList.remove('is-drag', 'is-over')); });

  /* ---------------- panel prvkov ---------------- */
  const elBox = $('[data-elements]');
  let showElements = () => {};
  if (elBox) {
    const shapes = [['rect', tr('Obdĺžnik', 'Obdélník'), '<b class="a-r"></b>'], ['rounded', tr('Zaoblený', 'Zaoblený'), '<b class="a-rr"></b>'], ['circle', tr('Kruh', 'Kruh'), '<b class="a-c"></b>'], ['ring', tr('Prstenec', 'Prstenec'), '<b class="a-ring"></b>'],
      ['line', tr('Čiara', 'Čára'), '<b class="a-l"></b>'], ['dashed', tr('Prerušovaná', 'Přerušovaná'), '<b class="a-dl"></b>'], ['divider', tr('Oddeľovač', 'Oddělovač'), '<b class="a-div"><i></i></b>'], ['frame', tr('Rámik', 'Rámeček'), '<b class="a-fr"></b>']];
    const orn = [['frame2', tr('Dvojitý rám', 'Dvojitý rám'), '<svg viewBox="0 0 40 26"><rect x="2" y="2" width="36" height="22" rx="1"/><rect x="5" y="5" width="30" height="16" stroke-width=".8"/></svg>'], ['corners', tr('Rohy', 'Rohy'), '<svg viewBox="0 0 40 26"><path d="M2 8V2h6M32 2h6v6M2 18v6h6M38 18v6h-6"/></svg>'], ['dots', tr('Bodky', 'Tečky'), '<svg viewBox="0 0 40 26"><circle cx="12" cy="13" r="1.6"/><circle cx="20" cy="13" r="2.4"/><circle cx="28" cy="13" r="1.6"/></svg>'], ['wave', tr('Vlnka', 'Vlnka'), '<svg viewBox="0 0 40 26"><path d="M4 13q4-5 8 0t8 0 8 0 8 0"/></svg>'], ['sprig', tr('Vetvička', 'Větvička'), '<svg viewBox="0 0 40 26"><path d="M4 14Q20 11 36 14"/><ellipse cx="12" cy="11" rx="3" ry="1.2" transform="rotate(-30 12 11)"/><ellipse cx="20" cy="15" rx="3" ry="1.2" transform="rotate(30 20 15)"/><ellipse cx="28" cy="11" rx="3" ry="1.2" transform="rotate(-30 28 11)"/></svg>']];
    elBox.innerHTML = `<label class="els__q"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input data-elq placeholder="${tr('Hľadať: káva, kľúč, zub, srdce…', 'Hledat: káva, klíč, zub, srdce…')}" autocomplete="off"></label>
      <div data-elgroup="shapes"><h3>${tr('Tvary a čiary', 'Tvary a čáry')}</h3><div class="adds adds--4">${shapes.map(([k, l, i]) => `<button data-add="${k}">${i}${l}</button>`).join('')}<button data-add="qr"><b class="a-q"></b>QR</button><button data-add-img2><b class="a-i"></b>${tr('Obrázok', 'Obrázek')}</button></div></div>
      <div data-elgroup="orn"><h3>${tr('Ornamenty a rámy', 'Ornamenty a rámy')}</h3><div class="adds adds--4 adds--orn">${orn.map(([k, l, i]) => `<button data-add="${k}">${i}${l}</button>`).join('')}</div></div>
      <div data-elgroup="emb"><h3>${tr('Znaky odborov', 'Znaky oborů')} <small data-emb-n></small></h3><div class="icons icons--emb" data-emb></div><button class="link els__more" data-emb-more>${tr('Zobraziť všetky', 'Zobrazit všechny')}</button></div>
      <div data-elgroup="ic"><h3>${tr('Ikony', 'Ikony')}</h3><div class="icons" data-ic></div></div>
      <p class="els__none" data-elnone hidden>${tr('Nič sme nenašli. Skúste iné slovo, napríklad „dom“ alebo „hviezda“.', 'Nic jsme nenašli. Zkuste jiné slovo, třeba „dům“ nebo „hvězda“.')}</p>`;
    let embAll = false, painted = false;
    const paintEls = () => {
      const q = $('[data-elq]', elBox).value.trim().toLowerCase();
      const emb = EMBLEM_KEYS.filter((k) => matches(k, q)), ic = Object.keys(ICONS).filter((k) => matches(k, q));
      const embShow = q || embAll ? emb : emb.slice(0, 24);
      $('[data-emb]', elBox).innerHTML = embShow.map((k) => `<button data-emb-k="${k}" title="${k}"><img alt="" loading="lazy" src="${emblemURL(k, 64)}"></button>`).join('');
      $('[data-emb-n]', elBox).textContent = emb.length ? `(${emb.length})` : '';
      $('[data-emb-more]', elBox).hidden = !!q || embAll || emb.length <= 24;
      $('[data-ic]', elBox).innerHTML = ic.map((n) => `<button data-icon="${n}" title="${n}">${iconSVG(n, '#0F1440', 1.8)}</button>`).join('');
      $('[data-elgroup="emb"]', elBox).hidden = !emb.length; $('[data-elgroup="ic"]', elBox).hidden = !ic.length;
      $('[data-elgroup="shapes"]', elBox).hidden = !!q; $('[data-elgroup="orn"]', elBox).hidden = !!q;
      $('[data-elnone]', elBox).hidden = !!(emb.length || ic.length) || !q;
    };
    const ensure = () => { if (!painted) { painted = true; paintEls(); } };
    showElements = ensure;
    $('[data-elq]', elBox).addEventListener('input', paintEls);
    $('[data-emb-more]', elBox).addEventListener('click', () => { embAll = true; paintEls(); });
    elBox.addEventListener('click', (e) => {
      const a = e.target.closest('[data-add]'); if (a) return ed.add(a.dataset.add);
      if (e.target.closest('[data-add-img2]')) return $('[data-img-file]')?.click();
      const em = e.target.closest('[data-emb-k]'); if (em) return ed.add('emblem', { key: em.dataset.embK });
      const ic = e.target.closest('[data-icon]'); if (ic) return ed.add('icon', { name: ic.dataset.icon });
    });
  }

  /* ---------------- rýchle zmeny štýlu („mágia“) ---------------- */
  const magic = $('[data-magic]');
  let layoutIdx = 0;
  magic?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-mg]'); if (!b) return;
    b.classList.add('is-busy');
    try {
      if (b.dataset.mg === 'pal') {
        const cur = curPal();
        const list = Object.values(PALETTES).filter((p) => p.bg !== cur.bg && contrast(p.bg, p.ink) >= 4.5);
        const p = list[Math.floor(Math.random() * list.length)];
        await ed.setPalette(p); toast(tr(`Farby: ${p.label}`, `Barvy: ${p.label}`), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() });
      } else if (b.dataset.mg === 'font') {
        const cur = ed.design.fonts || TEMPLATES[ed.design.tpl]?.fonts;
        const keys = Object.keys(FONTS).filter((k) => k !== cur);
        const k = keys[Math.floor(Math.random() * keys.length)];
        await ed.setFonts(k); toast(tr(`Písmo: ${FONTS[k].label}`, `Písmo: ${FONTS[k].label}`), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() });
      } else if (b.dataset.mg === 'layout') {
        const t0 = TEMPLATES[ed.design.tpl], tags = new Set(t0?.tags || []);
        const pool = ORDER.filter((id) => TEMPLATES[id] && id !== ed.design.tpl && (TEMPLATES[id].tags || []).some((t) => tags.has(t)));
        const list = pool.length ? pool : ORDER.filter((id) => TEMPLATES[id] && id !== ed.design.tpl);
        const id = list[layoutIdx++ % list.length];
        await ed.setTemplate(id, true);
        toast(tr(`Rozloženie: ${TEMPLATES[id].name}`, `Rozložení: ${TEMPLATES[id].name}`), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() });
      }
      onStyleChange?.();
    } finally { b.classList.remove('is-busy'); }
  });

  /* ---------------- väzby na editor ---------------- */
  ed.on('selection', (o) => {
    // kopírovanie štýlu: ďalší vybraný prvok dostane skopírovaný štýl
    if (styleClip && o && o !== styleSrc && !o.data?.bg) { const st = styleClip; styleClip = null; bar.classList.remove('is-painting'); ed.applyStyle(st, o).then(() => toast(tr('Štýl je použitý.', 'Styl je použitý.'), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() })); return; }
    paint(o); onSelection?.(o);
  });
  ed.on('transform', () => { if (!moving) { moving = true; bar.classList.add('is-moving'); closePop(); } });
  ed.on('transformEnd', () => { moving = false; bar.classList.remove('is-moving'); paint(); });
  ed.on('change', () => { if (!moving && !bar.hidden) { const o = ed.active(); if (o) { $('[data-warn]', bar).hidden = kindOf(o) === 'multi' || !ed.overflow(o); place(o); } } });
  ed.on('zoom', () => place());
  ed.on('layers', () => paintLayers());
  // pruh „vyberáte viac prvkov“
  const multiBar = document.createElement('div'); multiBar.className = 'emulti'; multiBar.hidden = true;
  multiBar.innerHTML = `<span>${tr('Ťuknite na ďalšie prvky, ktoré chcete pridať k výberu', 'Ťukněte na další prvky, které chcete přidat k výběru')}</span><button type="button" data-multi-x>${tr('Hotovo', 'Hotovo')}</button>`;
  stage.append(multiBar);
  multiBar.addEventListener('click', (e) => { if (e.target.closest('[data-multi-x]')) ed.setMulti(false); });
  ed.on('multi', (on) => { multiBar.hidden = !on; });
  ed.on('ungrouped', ({ focus }) => toast(focus ? tr('Skupina je rozdelená, upravujete vybranú časť. Spojíte ich cez Zoskupiť alebo Späť.', 'Skupina je rozdělená, upravujete vybranou část. Spojíte je přes Seskupit nebo Zpět.') : tr('Skupina je rozdelená na časti.', 'Skupina je rozdělená na části.'), { label: tr('Späť', 'Zpět'), onClick: () => ed.undo() }));
  ed.on('logoPlaced', ({ replacedMono }) => toast(replacedMono ? tr('Logo nahradilo monogram. Posuňte ho alebo zmeňte veľkosť za rohy.', 'Logo nahradilo monogram. Posuňte ho nebo změňte velikost za rohy.') : tr('Logo je vo vizitke. Chyťte ho a posuňte, kam patrí.', 'Logo je ve vizitce. Chyťte ho a posuňte, kam patří.')));
  ed.on('locked', () => toast(tr('Prvok je zamknutý. Odomknete ho ikonou zámku.', 'Prvek je zamčený. Odemknete ho ikonou zámku.')));
  ed.canvas.on('text:editing:entered', () => bar.classList.add('is-editing'));
  ed.canvas.on('text:editing:exited', () => { bar.classList.remove('is-editing'); paint(); });
  addEventListener('resize', () => place());
  // Escape najprv zavrie otvorený panel alebo menu, až potom zruší výber
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!menu.hidden) { menu.hidden = true; e.stopImmediatePropagation(); return; }
    if (!pop.hidden) { closePop(); e.stopImmediatePropagation(); }
  }, true);
  // ⌘B / ⌘I pri vybranom texte
  addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || getStep() !== 'edit') return;
    const o = ed.active(); if (!o || !/text/.test(o.type) || o.isEditing) return;
    const t = document.activeElement; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    if (e.key.toLowerCase() === 'b') { e.preventDefault(); act('bold'); }
    if (e.key.toLowerCase() === 'i') { e.preventDefault(); act('italic'); }
  });

  // ⌘G zoskupiť, ⌘⇧G rozdeliť
  addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'g' || getStep() !== 'edit') return;
    const t = document.activeElement; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    const o = ed.active(); if (!o || o.isEditing) return;
    e.preventDefault(); if (e.shiftKey) ed.ungroup(); else if (ed.canGroup()) act('group');
  });

  return { paint, place, paintLayers, closePop, showElements: () => showElements() };
}
