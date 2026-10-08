// Tlač vlastného návrhu
import { SIZES, BLEED, tr } from './model.js';
import * as store from './store.js';
import { toast } from './site.js';
import { money, printPrice, addWorkdays, fmtDay, deliveryDays } from '../util.js';
import { fileToDataURL } from '../logo.js';

const VK = window.VK, P = VK.prices;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const st = { size: '90x50', tier: 'std', qty: 250, corners: 'straight', express: false, back: 'blank', files: {} };

let pdfjs;
async function pdfLib() {
  if (pdfjs) return pdfjs;
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
  pdfjs = window.pdfjsLib; pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return pdfjs;
}
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
async function read(file) {
  const orig = await fileToDataURL(file);
  if (file.type === 'application/pdf') {
    const lib = await pdfLib();
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const v1 = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: 1400 / v1.width });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    return { name: file.name, type: 'pdf', orig, preview: c.toDataURL('image/jpeg', 0.9), wmm: v1.width * 25.4 / 72, hmm: v1.height * 25.4 / 72, pages: pdf.numPages };
  }
  const im = await loadImg(orig);
  const c = document.createElement('canvas'); const sc = Math.min(1, 1400 / im.width); c.width = im.width * sc; c.height = im.height * sc;
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return { name: file.name, type: 'img', orig, preview: c.toDataURL('image/jpeg', 0.9), w: im.width, h: im.height };
}
function analyze(f) {
  const S = SIZES[st.size];
  const out = [];
  if (f.type === 'pdf') {
    const bleed = Math.abs(f.wmm - (S.w + 2 * BLEED)) < 1.2 && Math.abs(f.hmm - (S.h + 2 * BLEED)) < 1.2;
    const trim = Math.abs(f.wmm - S.w) < 1.2 && Math.abs(f.hmm - S.h) < 1.2;
    out.push([bleed || trim ? 'ok' : 'warn', `PDF ${f.wmm.toFixed(1)} × ${f.hmm.toFixed(1)} mm${bleed ? tr(', spadávka v poriadku', ', spadávka v pořádku') : trim ? tr(', bez spadávky – pri kontrole ju doplníme', ', bez spadávky – při kontrole ji doplníme') : tr(' – rozmer nesedí s formátom, upravíme ho a pošleme vám náhľad', ' – rozměr nesedí s formátem, upravíme ho a pošleme vám náhled')}`]);
    if (f.pages > 1) out.push(['info', tr(`PDF má ${f.pages} strany, použijeme prvú (druhú nahrajte ako zadnú).`, `PDF má ${f.pages} strany, použijeme první (druhou nahrajte jako zadní).`)]);
    out.push(['ok', tr('Vektorové PDF sa vytlačí ostro v akejkoľvek veľkosti.', 'Vektorové PDF se vytiskne ostře v jakékoli velikosti.')]);
    return out;
  }
  const r = f.w / f.h, rB = (S.w + 2 * BLEED) / (S.h + 2 * BLEED), rT = S.w / S.h;
  const hasB = Math.abs(r - rB) < Math.abs(r - rT);
  const ok = Math.min(Math.abs(r - rB), Math.abs(r - rT)) < 0.04;
  const dpi = Math.round(f.w / ((hasB ? S.w + 2 * BLEED : S.w) / 25.4));
  out.push([dpi >= 300 ? 'ok' : dpi >= 200 ? 'warn' : 'bad', `${f.w} × ${f.h} px ≈ ${dpi} dpi${dpi >= 300 ? '' : dpi >= 200 ? tr(' – stačí, ale ostrejšie bude 300 dpi', ' – stačí, ale ostřejší bude 300 dpi') : tr(' – nízke rozlíšenie, tlač bude rozmazaná', ' – nízké rozlišení, tisk bude rozmazaný')}`]);
  out.push([ok ? (hasB ? 'ok' : 'warn') : 'warn', !ok ? tr('Pomer strán nesedí s formátom – obrázok upravíme a pošleme vám náhľad.', 'Poměr stran nesedí s formátem – obrázek upravíme a pošleme vám náhled.') : hasB ? tr('Spadávka 2 mm je v poriadku.', 'Spadávka 2 mm je v pořádku.') : tr('Bez spadávky – pri kontrole ju doplníme.', 'Bez spadávky – při kontrole ji doplníme.')]);
  return out;
}
function paintChecks() {
  const box = $('[data-checks-box]');
  if (!st.files.front) { box.hidden = true; return; }
  box.hidden = false;
  $('[data-prev-front]').src = st.files.front.preview;
  const bk = st.files.back?.preview || (st.back === 'same' ? st.files.front.preview : '');
  const pb = $('[data-prev-back]'); if (bk) { pb.src = bk; pb.parentElement.style.display = ''; } else pb.parentElement.style.display = 'none';
  const rows = [];
  for (const side of ['front', 'back']) { const f = st.files[side]; if (!f) continue; analyze(f).forEach(([c, t]) => rows.push([c, `${side === 'front' ? tr('Predná', 'Přední') : tr('Zadná', 'Zadní')}: ${t}`])); }
  rows.push(['info', tr('Farby prevedieme do CMYK. Pred tlačou súbor skontroluje človek a ak treba, ozve sa vám.', 'Barvy převedeme do CMYK. Před tiskem soubor zkontroluje člověk a pokud je potřeba, ozve se vám.')]);
  $('[data-checks]').innerHTML = rows.map(([c, t]) => `<li class="${c === 'bad' ? 'warn' : c}">${t}</li>`).join('');
}
$$('[data-od]').forEach((lab) => {
  const side = lab.dataset.od, input = lab.querySelector('input');
  const go = async (file) => {
    lab.classList.add('busy');
    try { st.files[side] = await read(file); lab.querySelector('img').src = st.files[side].preview; lab.classList.add('has'); lab.querySelector('small').textContent = file.name; }
    catch (e) { toast(tr('Súbor sa nepodarilo načítať. Skúste PDF, PNG alebo JPG.', 'Soubor se nepodařilo načíst. Zkuste PDF, PNG nebo JPG.')); }
    lab.classList.remove('busy'); $('[data-backopt]').hidden = !!st.files.back; paintChecks(); paint();
  };
  input.addEventListener('change', (e) => { const f = e.target.files[0]; if (f) go(f); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => lab.addEventListener(ev, (e) => { e.preventDefault(); lab.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => lab.addEventListener(ev, (e) => { e.preventDefault(); lab.classList.remove('over'); }));
  lab.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) go(f); });
});
$('[data-backopt]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.back = b.dataset.v; $$('[data-backopt] button').forEach((x) => x.classList.toggle('on', x === b)); paintChecks(); });
$('[data-size]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.size = b.dataset.v; $$('[data-size] button').forEach((x) => x.classList.toggle('on', x === b)); const S = SIZES[st.size]; $('[data-spec]').textContent = `${S.w + 4} × ${S.h + 4} mm`; paintChecks(); });

function cfg() {
  const base = { kind: 'print', size: st.size, qty: st.qty, corners: st.tier === 'triplex' ? 'straight' : st.corners, express: st.express };
  if (st.tier === 'triplex') return { ...base, paper: 'triplex', finish: 'none' };
  if (st.tier === 'soft') return { ...base, paper: 'matny', finish: 'soft' };
  return { ...base, paper: 'matny', finish: 'none' };
}
function paint() {
  const c = cfg();
  $$('[data-paper] .paper').forEach((b) => b.classList.toggle('on', b.dataset.v === st.tier));
  const stdP = printPrice({ ...c, paper: 'matny', finish: 'none' }, P);
  $$('[data-pp-price]').forEach((e) => { const k = e.dataset.ppPrice; const cc = k === 'triplex' ? { ...c, paper: 'triplex', finish: 'none' } : k === 'soft' ? { ...c, paper: 'matny', finish: 'soft' } : { ...c, paper: 'matny', finish: 'none' }; e.textContent = k === 'std' ? money(stdP) : '+' + money(printPrice(cc, P) - stdP); });
  $$('[data-qp]').forEach((s) => { s.textContent = money(printPrice({ ...c, qty: +s.dataset.qp }, P)); });
  $$('[data-qty] button').forEach((b) => b.classList.toggle('on', +b.dataset.v === st.qty));
  $('[data-round-p]').textContent = st.tier === 'triplex' ? tr('Triplex len s rovnými rohmi', 'Triplex jen s rovnými rohy') : '+' + money(P.round[String(st.qty)]);
  $('[data-round]').disabled = st.tier === 'triplex'; if (st.tier === 'triplex') $('[data-round]').checked = false;
  $$('[data-size] button').forEach((b) => { const add = P.sizes?.[b.dataset.v]?.[String(st.qty)] || 0; b.dataset.label ||= b.textContent; b.innerHTML = b.dataset.label + (add ? `<small> +${money(add)}</small>` : ''); });
  const total = printPrice(c, P);
  $('[data-sum]').textContent = money(total);
  $('[data-sum-m]').textContent = `${st.qty} ${tr('ks', 'ks')} · ${money(total / st.qty, { decimals: 2 })} / ${tr('ks', 'ks')}`;
  const now = new Date();
  $('[data-sum-d]').textContent = `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + deliveryDays(st.express)))}`;
  const btn = $('[data-add]');
  btn.disabled = !st.files.front;
  btn.className = 'btn btn--lg sum__cta' + (st.files.front ? ' btn--y' : '');
  btn.innerHTML = st.files.front ? `${tr('Objednať', 'Objednat')} <span class="ar">→</span>` : tr('Najprv nahrajte prednú stranu', 'Nejdřív nahrajte přední stranu');
}
$('[data-paper]').addEventListener('click', (e) => { const b = e.target.closest('.paper'); if (!b) return; st.tier = b.dataset.v; paint(); });
$('[data-qty]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.qty = +b.dataset.v; paint(); });
$('[data-round]').addEventListener('change', (e) => { st.corners = e.target.checked ? 'round' : 'straight'; paint(); });
$('[data-express]').addEventListener('change', (e) => { st.express = e.target.checked; paint(); });
$('[data-add]').addEventListener('click', async () => {
  if (!st.files.front) return;
  const back = st.files.back || (st.back === 'same' ? st.files.front : null);
  await store.cartAdd({
    kind: 'print', config: cfg(), title: tr('Vlastný návrh', 'Vlastní návrh'),
    design: { custom: true, size: st.size, files: { front: st.files.front, back, backMode: st.files.back ? 'file' : st.back } },
    thumb: st.files.front.preview, thumbBack: back?.preview || '',
  });
  location.href = VK.links.kosik;
});
paint();
