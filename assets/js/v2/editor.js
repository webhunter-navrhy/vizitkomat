// Vizitkomat v2 – editor vizitky (Fabric.js): úpravy priamo vo vizitke
import { SIZES, BLEED, SAFE, K, FONTS, PALETTES, FOILS, isFoil, newDesign, contrast, mix } from './model.js';
import { layout, templateDefaults, TEMPLATES } from './templates.js';
import { buildSide, toFabric, loadFonts, snapshot as snap, paint, loadImg } from './render.js';
import { emblemURL } from './emblems.js';
import { iconSVG } from '../icons.js';

const F = () => window.fabric;
const PROPS = ['data', 'selectable', 'evented', 'hasControls', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'editable', 'globalCompositeOperation', 'cropX', 'cropY', 'objectCaching', 'subTargetCheck'];
const LOCK = { lockMovementX: true, lockMovementY: true, lockScalingX: true, lockScalingY: true, lockRotation: true, hasControls: false, editable: false };
const UNLOCK = { lockMovementX: false, lockMovementY: false, lockScalingX: false, lockScalingY: false, lockRotation: false, hasControls: true, editable: true };
const MM = (v) => (v / K).toFixed(1).replace('.0', '').replace('.', ',');
const clone = (o) => JSON.parse(JSON.stringify(o));
const sig = (v) => (v == null ? '' : typeof v === 'string' ? v.toLowerCase() : JSON.stringify(v));
function walkJSON(list, fn) { (list || []).forEach((n) => { fn(n); if (n.objects) walkJSON(n.objects, fn); }); }
const BGLOCK = { selectable: false, evented: false, hasBorders: false, hasControls: false, lockMovementX: true, lockMovementY: true, lockScalingX: true, lockScalingY: true, lockRotation: true };

// ---------- skupiny: ilustrácie, ornamenty a znaky šablóny sa vyberajú ako celok ----------
// Šablóny kreslia ilustrácie z desiatok tvarov (lístky, stonky, lúče…). V editore z nich spravíme jednu
// skupinu: susediace dekoratívne tvary v jednom súvislom úseku vrstiev (medzi textami). Poradie vrstiev
// sa zachová (prekrývajúce sa časti sú vždy v jednej skupine), takže tlač vyzerá rovnako.
const DECOR = new Set(['path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse', 'triangle', 'group', 'image']);
function groupParts(fab, list, area, onlyTemplate) {
  const okRun = (o) => o && o.visible !== false && !/text/.test(o.type) && DECOR.has(o.type)
    && !(o.data && (o.data.bg || o.data.field || o.data.loose || o.data.mono || o.data.kind === 'qr' || o.data.kind === 'grp' || o.data.locked))
    && !(o.type === 'image' && ['logo', 'photo', 'file', 'image'].includes(o.data?.role))
    && (!onlyTemplate || o.data?.ti != null)
    && (() => { const r = o.getBoundingRect(true, true); return r.width * r.height < 0.55 * area; })();
  const out = [], tol = 1.2 * K;
  for (let i = 0; i < list.length;) {
    if (!okRun(list[i])) { out.push(list[i]); i++; continue; }
    const run = []; while (i < list.length && okRun(list[i])) run.push(list[i++]);
    const R = run.map((o) => o.getBoundingRect(true, true));
    const par = run.map((_, k) => k); const find = (k) => (par[k] === k ? k : (par[k] = find(par[k])));
    for (let a = 0; a < run.length; a++) for (let b = a + 1; b < run.length; b++) {
      const A = R[a], B = R[b];
      if (A.left - tol <= B.left + B.width && B.left - tol <= A.left + A.width && A.top - tol <= B.top + B.height && B.top - tol <= A.top + A.height) par[find(a)] = find(b);
    }
    const comps = new Map(); run.forEach((o, k) => { const r = find(k); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(o); });
    // rozsypané drobnosti (posýpka, konfety, bodky): jeden vzor, aby sa neklikali po jednom
    const small = (c) => c.length === 1 && c.every((o) => { const r = R[run.indexOf(o)]; return r.width * r.height < 0.012 * area; });
    const smalls = [...comps.values()].filter(small);
    if (smalls.length >= 3) {
      const merged = run.filter((o) => smalls.some((c) => c.includes(o)));
      smalls.forEach((c) => [...comps.entries()].forEach(([k, v]) => { if (v === c) comps.delete(k); }));
      comps.set('pattern', merged);
    }
    for (const c of comps.values()) {
      if (c.length < 2) { out.push(c[0]); continue; }
      const g = new fab.Group(c, { objectCaching: false, subTargetCheck: true });
      g.data = { kind: 'grp', role: 'decor' };
      out.push(g);
    }
  }
  return out;
}
// listy (koncové objekty) vrátane obsahu skupín
const leaves = (o, out = []) => { if (o.type === 'group' || o.type === 'activeSelection') o.getObjects().forEach((x) => leaves(x, out)); else out.push(o); return out; };
const toRGB = (c) => {
  if (typeof c !== 'string') return null;
  let m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) { let h = m[1]; if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  m = c.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i); return m ? [+m[1], +m[2], +m[3]] : null;
};
const colKey = (c) => (typeof c === 'string' && c && c !== 'transparent' && c !== 'none' ? c.toUpperCase() : null);

// malá menovka (mm, uhol) kreslená v súradniciach plátna, nezávisle od priblíženia
function pill(ctx, text, x, y, z, bg) {
  ctx.save();
  ctx.font = `700 ${11 / z}px Geist, system-ui, sans-serif`;
  const w = ctx.measureText(text).width + 12 / z, h = 18 / z;
  ctx.fillStyle = bg; ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); else ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 0.5 / z);
  ctx.restore();
}

// prefarbenie jednofarebného obrázka (znak, AI znak) – aj metalickou fóliou
async function tintEl(src, color) {
  const el = await loadImg(src); if (!el) return null;
  const c = document.createElement('canvas'); c.width = el.naturalWidth || el.width; c.height = el.naturalHeight || el.height;
  const x = c.getContext('2d'); x.drawImage(el, 0, 0); x.globalCompositeOperation = 'source-in';
  if (isFoil(color)) { const st = FOILS[color.slice(5)] || FOILS.gold; const g = x.createLinearGradient(0, 0, c.width, c.height * 0.6); st.forEach((col, i) => g.addColorStop(i / (st.length - 1), col)); x.fillStyle = g; } else x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

export function createEditor(el, host, opts = {}) {
  const fab = F();
  // Fabric 5.3 – ticho pre neplatný textBaseline
  const coarse = matchMedia('(pointer: coarse)').matches;
  const canvas = new fab.Canvas(el, { preserveObjectStacking: true, selectionColor: 'rgba(36,64,230,.08)', selectionBorderColor: '#2440E6', selectionLineWidth: 1.5, stopContextMenu: true, fireRightClick: true, targetFindTolerance: coarse ? 14 : 6, controlsAboveOverlay: true });
  fab.Object.prototype.set({ borderColor: '#2440E6', cornerColor: '#FFFFFF', cornerStrokeColor: '#2440E6', cornerStyle: 'circle', cornerSize: coarse ? 16 : 11, touchCornerSize: 30, transparentCorners: false, borderScaleFactor: 1.6, padding: coarse ? 3 : 4 });
  // ovládač otáčania nad prvkom, kúsok vyššie (ako v Canve)
  if (fab.Object.prototype.controls?.mtr) fab.Object.prototype.controls.mtr.offsetY = coarse ? -34 : -26;
  fab.Textbox.prototype.set?.({ objectCaching: false });

  const S = {
    d: null, side: 'front', sides: { front: null, back: null }, custom: { front: false, back: false },
    zoom: 1, base: 1, uz: 1, px: 0, py: 0, hover: null, guides: true, marks: false, history: [], future: [], busy: false, listeners: {}, clip: null, dist: [], badge: null,
  };
  const emit = (ev, x) => (S.listeners[ev] || []).forEach((fn) => fn(x));
  const size = () => SIZES[S.d.size] || SIZES['90x50'];
  const Wt = () => (size().w + 2 * BLEED) * K, Ht = () => (size().h + 2 * BLEED) * K;
  // klikateľnosť: celoplošné textúry sú pozadie; veľké rámy a vzory reagujú len na svoje čiary, nie na prázdnu plochu
  // texty, obrázky a ilustrácie sa zväčšujú rovnomerne za rohy (bočné úchyty by ich deformovali a na dotyku zavadzajú)
  const tuneControls = (o) => { if (/text/.test(o.type) || o.type === 'image' || o.type === 'group') { o.setControlsVisibility?.({ mt: false, mb: false, ml: false, mr: false }); o.lockScalingFlip = true; } };
  canvas.on('object:added', (e) => e.target && tuneControls(e.target));
  function tuneHit() {
    const area = Wt() * Ht();
    canvas.getObjects().forEach((o) => {
      tuneControls(o);
      if (o.data?.bg) { o.set(BGLOCK); return; }
      const r = o.getBoundingRect(true, true), a = r.width * r.height;
      if ((o.type === 'image' || o.type === 'rect') && !o.data?.field && !['logo', 'photo'].includes(o.data?.role) && a >= 0.92 * area && o.data?.ti != null && !o.data?.user) { o.data = { ...o.data, bglike: true }; o.set(BGLOCK); return; }
      const hollow = o.type === 'group' || !o.fill || o.fill === 'transparent' || o.fill === 'none';
      o.perPixelTargetFind = !!(hollow && a > 0.18 * area);
    });
  }

  // ---------- veľkosť a zoom ----------
  // plátno vypĺňa celú plochu, vizitka pláva v strede so skutočným tieňom; zoom a posun cez viewport
  // na mobile je pod vizitkou ukotvená lišta nástrojov – necháme jej miesto, aby nezakrývala okraj a rohy
  const reserveB = () => 0;
  function fit() {
    if (!S.d) return;
    const r = host.getBoundingClientRect();
    const W = Math.floor(r.width), H = Math.floor(r.height), rb = reserveB();
    if (W < 40 || H < 40) return;
    const pad = Math.min(opts.pad ?? 48, W * 0.07, H * 0.12);
    S.base = Math.max(0.15, Math.min((W - 2 * pad) / Wt(), (H - rb - 2 * pad) / Ht(), 3));
    const z = S.base * S.uz;
    S.zoom = z;
    // posun len keď je vizitka väčšia ako plocha
    const mx = Math.max(0, (Wt() * z - W) / 2 + 60), my = Math.max(0, (Ht() * z - H) / 2 + 60);
    S.px = Math.max(-mx, Math.min(mx, S.px)); S.py = Math.max(-my, Math.min(my, S.py));
    if (canvas.width !== W || canvas.height !== H) canvas.setDimensions({ width: W, height: H });
    canvas.calcOffset();
    canvas.setViewportTransform([z, 0, 0, z, (W - Wt() * z) / 2 + S.px, (H - rb - Ht() * z) / 2 + S.py]);
    applyClip();
    canvas.getObjects().forEach((o) => o.setCoords());
    canvas.requestRenderAll();
    emit('zoom', S.uz);
  }
  function zoomAt(uz, cx, cy) {
    const r = host.getBoundingClientRect();
    if (cx == null) { cx = r.width / 2; cy = r.height / 2; }
    uz = Math.max(0.6, Math.min(4, uz));
    const v = canvas.viewportTransform, sx = (cx - v[4]) / v[0], sy = (cy - v[5]) / v[3];
    const z = S.base * uz;
    S.uz = uz;
    S.px = cx - sx * z - (Math.floor(r.width) - Wt() * z) / 2;
    S.py = cy - sy * z - (Math.floor(r.height) - reserveB() - Ht() * z) / 2;
    if (Math.abs(uz - 1) < 0.02) { S.uz = 1; S.px = 0; S.py = 0; }
    fit();
  }
  // orez: mimo vizitky je plátno priehľadné (vidno plochu), so spadávkou len pri zobrazení orezu
  function applyClip() {
    const sz = size(), b = BLEED * K, rr = S.d.corners === 'round' ? 3 * K : 0;
    const c = S.marks ? new fab.Rect({ left: 0, top: 0, width: Wt(), height: Ht() }) : new fab.Rect({ left: b, top: b, width: sz.w * K, height: sz.h * K, rx: rr, ry: rr });
    c.excludeFromExport = true;
    canvas.clipPath = c;
  }
  const ro = new ResizeObserver(() => fit());
  ro.observe(host);
  addEventListener('scroll', () => canvas.calcOffset(), { passive: true });

  // ---------- prekrytie: spadávka, orez, bezpečná zóna, vodiace čiary ----------
  let liveGuides = [];
  canvas.on('after:render', () => {
    const ctx = canvas.getContext();
    const v = canvas.viewportTransform;
    const sz = size(), b = BLEED * K, w = sz.w * K, h = sz.h * K, r = S.d.corners === 'round' ? 3 * K : 0;
    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    // tieň pod vizitkou (len mimo nej, za ovládacími prvkami)
    const card = () => { ctx.beginPath(); if (S.marks) ctx.rect(0, 0, Wt(), Ht()); else if (ctx.roundRect && r) ctx.roundRect(b, b, w, h, r); else ctx.rect(b, b, w, h); };
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(15, 20, 64, .30)'; ctx.shadowBlur = 46; ctx.shadowOffsetY = 22;
    card(); ctx.fill();
    ctx.shadowColor = 'rgba(15, 20, 64, .16)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1.5;
    card(); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 1 / S.zoom;
    if (S.marks) {
      ctx.beginPath(); ctx.rect(0, 0, Wt(), Ht());
      if (ctx.roundRect && r) ctx.roundRect(b, b, w, h, r); else ctx.rect(b, b, w, h);
      ctx.fillStyle = 'rgba(232,70,43,0.18)'; ctx.fill('evenodd');
      ctx.strokeStyle = '#E8462B';
      ctx.beginPath(); if (ctx.roundRect && r) ctx.roundRect(b, b, w, h, r); else ctx.rect(b, b, w, h); ctx.stroke();
      ctx.setLineDash([5 / S.zoom, 4 / S.zoom]);
      ctx.strokeStyle = 'rgba(36,64,230,.9)';
      ctx.strokeRect(b + SAFE * K, b + SAFE * K, w - 2 * SAFE * K, h - 2 * SAFE * K);
      ctx.setLineDash([]);
    }
    // obrys prvku pod myšou: je zrejmé, čo sa dá chytiť a upraviť
    const act = canvas.getActiveObject();
    if (S.hover && S.hover !== act && S.hover.selectable && S.hover.visible && canvas.getObjects().includes(S.hover) && !(act && act.type === 'activeSelection' && act.contains(S.hover))) {
      const br = S.hover.getBoundingRect(true, true), p = 3 / S.zoom;
      ctx.setLineDash([4 / S.zoom, 3 / S.zoom]); ctx.strokeStyle = 'rgba(36,64,230,.85)'; ctx.lineWidth = 1.4 / S.zoom;
      ctx.strokeRect(br.left - p, br.top - p, br.width + 2 * p, br.height + 2 * p); ctx.setLineDash([]);
    }
    if (S.guides && liveGuides.length) {
      ctx.strokeStyle = '#FF3D9A'; ctx.lineWidth = 1.2 / S.zoom;
      liveGuides.forEach((g) => { ctx.beginPath(); if (g.x != null) { ctx.moveTo(g.x, 0); ctx.lineTo(g.x, Ht()); } else { ctx.moveTo(0, g.y); ctx.lineTo(Wt(), g.y); } ctx.stroke(); });
    }
    // vzdialenosti k okraju vizitky počas ťahania (v mm, ako vo Figme)
    if (S.dist.length) {
      const z = S.zoom;
      ctx.strokeStyle = '#E8462B'; ctx.fillStyle = '#E8462B'; ctx.lineWidth = 1 / z;
      S.dist.forEach((d) => {
        ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke();
        const cap = 3 / z, hz = d.y1 === d.y2;
        ctx.beginPath(); if (hz) { ctx.moveTo(d.x1, d.y1 - cap); ctx.lineTo(d.x1, d.y1 + cap); ctx.moveTo(d.x2, d.y2 - cap); ctx.lineTo(d.x2, d.y2 + cap); } else { ctx.moveTo(d.x1 - cap, d.y1); ctx.lineTo(d.x1 + cap, d.y1); ctx.moveTo(d.x2 - cap, d.y2); ctx.lineTo(d.x2 + cap, d.y2); } ctx.stroke();
        pill(ctx, d.label, (d.x1 + d.x2) / 2, (d.y1 + d.y2) / 2, z, '#E8462B');
      });
    }
    if (S.badge) pill(ctx, S.badge.text, S.badge.x, S.badge.y, S.zoom, '#0F1440');
    ctx.restore();
  });

  // ---------- prichytávanie ----------
  canvas.on('object:moving', (e) => {
    const o = e.target; liveGuides = [];
    if (!S.guides || e.e?.altKey) return;
    const sz = size(), b = BLEED * K, th = 7 / S.zoom;
    const br = o.getBoundingRect(true, true);
    const xs = [b + (sz.w * K) / 2, b + SAFE * K, b + sz.w * K - SAFE * K];
    const ys = [b + (sz.h * K) / 2, b + SAFE * K, b + sz.h * K - SAFE * K];
    canvas.getObjects().forEach((x) => {
      if (x === o || !x.visible || (x.data && x.data.bg)) return;
      const r = x.getBoundingRect(true, true);
      xs.push(r.left, r.left + r.width / 2, r.left + r.width);
      ys.push(r.top, r.top + r.height / 2, r.top + r.height);
    });
    const cand = (vals, a) => { let best = null; for (const v of vals) for (const [k, p] of a) { const dd = v - p; if (Math.abs(dd) < th && (!best || Math.abs(dd) < Math.abs(best.d))) best = { d: dd, v }; } return best; };
    const bx = cand(xs, [['l', br.left], ['c', br.left + br.width / 2], ['r', br.left + br.width]]);
    const by = cand(ys, [['t', br.top], ['c', br.top + br.height / 2], ['b', br.top + br.height]]);
    if (bx) { o.left += bx.d; liveGuides.push({ x: bx.v }); }
    if (by) { o.top += by.d; liveGuides.push({ y: by.v }); }
    o.setCoords();
    measure(o);
  });
  // vzdialenosť od najbližšej vodorovnej a zvislej hrany orezu
  function measure(o) {
    const sz = size(), b = BLEED * K, R = o.getBoundingRect(true, true);
    const L = R.left - b, Rr = b + sz.w * K - (R.left + R.width), T = R.top - b, B = b + sz.h * K - (R.top + R.height);
    const cy = R.top + R.height / 2, cx = R.left + R.width / 2;
    S.dist = [];
    if (L <= Rr) { if (L > 0) S.dist.push({ x1: b, y1: cy, x2: R.left, y2: cy, label: MM(L) + ' mm' }); }
    else if (Rr > 0) S.dist.push({ x1: R.left + R.width, y1: cy, x2: b + sz.w * K, y2: cy, label: MM(Rr) + ' mm' });
    if (T <= B) { if (T > 0) S.dist.push({ x1: cx, y1: b, x2: cx, y2: R.top, label: MM(T) + ' mm' }); }
    else if (B > 0) S.dist.push({ x1: cx, y1: R.top + R.height, x2: cx, y2: b + sz.h * K, label: MM(B) + ' mm' });
    emit('transform', o);
  }
  // otáčanie: prichytí sa k 0/45/90°, menovka s uhlom
  canvas.on('object:rotating', (e) => {
    const o = e.target; let a = ((o.angle % 360) + 360) % 360;
    if (!e.e?.altKey) for (const t of [0, 45, 90, 135, 180, 225, 270, 315, 360]) if (Math.abs(a - t) < 4) { a = t % 360; o.rotate(a); break; }
    const R = o.getBoundingRect(true, true);
    S.badge = { text: Math.round(a) + '°', x: R.left + R.width / 2, y: R.top + R.height + 16 / S.zoom };
    emit('transform', o);
  });
  canvas.on('object:scaling', (e) => {
    const o = e.target, R = o.getBoundingRect(true, true);
    S.badge = { text: `${MM(R.width)} × ${MM(R.height)} mm`, x: R.left + R.width / 2, y: R.top + R.height + 16 / S.zoom };
    emit('transform', o);
  });
  canvas.on('mouse:up', () => { if (liveGuides.length || S.dist.length || S.badge) { liveGuides = []; S.dist = []; S.badge = null; canvas.requestRenderAll(); emit('transformEnd'); } });

  // ---------- zmeny používateľa ----------
  const userChange = () => { if (S.busy) return; S.custom[S.side] = true; commit(); };
  canvas.on('object:modified', userChange);
  canvas.on('text:changed', (e) => {
    const o = e.target; if (S.busy || !o.data || !o.data.field) { userChange(); return; }
    const k = o.data.field;
    let val = o.text;
    if (o.data.prefix && val.startsWith(o.data.prefix)) val = val.slice(o.data.prefix.length);
    if (o.data.part != null) {
      const parts = canvas.getObjects().filter((x) => x.data && x.data.field === k && x.data.part != null).sort((a, b) => a.data.part - b.data.part);
      val = parts.map((x) => x.text).join(' ').trim();
    }
    S.d.f[k] = val;
    syncOtherSide(k, val);
    emit('fields', { k, v: val });
    commit();
  });
  canvas.on('mouse:over', (e) => { if (e.target && e.target.selectable) { S.hover = e.target; canvas.requestRenderAll(); emit('hover', e.target); } });
  canvas.on('mouse:out', (e) => { if (S.hover && e.target === S.hover) { S.hover = null; canvas.requestRenderAll(); emit('hover', null); } });
  // režim výberu viacerých prvkov (na dotyku nie je Shift)
  let wasActive = null;
  let multiPrev = null;
  canvas.on('mouse:down:before', (e) => {
    const a = canvas.getActiveObject(); wasActive = a && e.target === a ? a : null;
    multiPrev = S.multi && a ? (a.type === 'activeSelection' ? a.getObjects().slice() : a.data?.bg ? [] : [a]) : null;
  });
  // režim „vybrať viac“: ťuknutie pridá/odoberie prvok z výberu
  canvas.on('mouse:up', (e) => {
    if (S.multi && e.isClick && !e.target) { api.setMulti(false); return; }
    if (!S.multi || !multiPrev || !e.isClick) return;
    const t = e.target; if (!t || !t.selectable || t.data?.bg) return;
    const list = multiPrev.includes(t) ? multiPrev.filter((x) => x !== t) : [...multiPrev, t];
    multiPrev = null;
    S.multiBusy = true; canvas.discardActiveObject(); S.multiBusy = false;
    if (list.length) canvas.setActiveObject(list.length > 1 ? new fab.ActiveSelection(list, { canvas }) : list[0]);
    const na = canvas.getActiveObject(); if (na) na.hasControls = false; // pri výbere viacerých úchyty nezavadzajú
    canvas.requestRenderAll(); emit('selection', canvas.getActiveObject()); emit('layers');
  });
  // druhé ťuknutie na vybraný text = písanie (na dotyku Fabric niekedy úpravu nezapne)
  canvas.on('mouse:up', (e) => {
    const t = e.target;
    if (!t || !e.isClick || t !== wasActive || t.isEditing || !/text/.test(t.type) || t.data?.locked || !t.editable) return;
    if (e.e && (e.e.pointerType === 'touch' || e.e.type?.startsWith('touch'))) { t.enterEditing(); t.setCursorByClick?.(e.e); canvas.requestRenderAll(); }
  });
  canvas.on('mouse:down', (e) => {
    if (S.hover) { S.hover = null; }
    emit('interact');
    if (e.button === 3) {
      const t = e.target && e.target.selectable ? e.target : null;
      const act = canvas.getActiveObject();
      if (t && !(act && act.type === 'activeSelection' && act.contains(t))) { canvas.setActiveObject(t); canvas.requestRenderAll(); }
      emit('contextmenu', { target: canvas.getActiveObject(), x: e.e.clientX, y: e.e.clientY });
    }
  });
  canvas.on('selection:created', () => { emit('selection', canvas.getActiveObject()); emit('layers'); });
  canvas.on('selection:updated', () => { emit('selection', canvas.getActiveObject()); emit('layers'); });
  canvas.on('selection:cleared', () => { emit('selection', null); emit('layers'); if (S.multi && !S.multiBusy) api.setMulti(false); });
  canvas.on('object:scaling', () => emit('selection', canvas.getActiveObject()));

  // ---------- história ----------
  let commitT;
  function state() {
    saveSide();
    return { d: clone({ ...S.d, sides: null }), sides: clone(S.sides), custom: { ...S.custom }, side: S.side };
  }
  function commit(now) {
    clearTimeout(commitT);
    const run = () => {
      const st = state();
      const last = S.history[S.history.length - 1];
      const js = JSON.stringify(st);
      if (last && last.__js === js) return;
      st.__js = js;
      S.history.push(st); if (S.history.length > 40) S.history.shift();
      S.future = [];
      emit('change', api);
      emit('history', { undo: S.history.length > 1, redo: false });
      emit('layers');
    };
    if (now) run(); else commitT = setTimeout(run, 250);
  }
  async function restore(st) {
    S.d = clone(st.d); S.sides = clone(st.sides); S.custom = { ...st.custom }; S.side = st.side;
    await loadSide(S.side, true);
    emit('restore', api); emit('change', api); emit('layers');
    emit('history', { undo: S.history.length > 1, redo: S.future.length > 0 });
  }
  async function undo() { if (S.history.length < 2) return; S.future.push(S.history.pop()); await restore(S.history[S.history.length - 1]); }
  async function redo() { const st = S.future.pop(); if (!st) return; S.history.push(st); await restore(st); }

  // ---------- strany ----------
  function saveSide() {
    if (!S.d) return;
    const js = canvas.toJSON(PROPS); delete js.clipPath;
    S.sides[S.side] = js;
  }
  let loadTok = 0;
  async function loadSide(side, fromState) {
    const tok = ++loadTok;
    S.busy = true;
    const json = S.sides[side];
    let objs = null;
    if (json && (S.custom[side] || fromState)) {
      const specs = []; (json.objects || []).forEach((o) => { if (o.fontFamily) specs.push(`${o.fontStyle === 'italic' ? 'italic ' : ''}${o.fontWeight || 400} 40px "${o.fontFamily}"`); });
      await loadFonts(specs);
      if (tok !== loadTok) { S.busy = false; return; }
      canvas.discardActiveObject();
      canvas.clear(); fit();
      await new Promise((res) => canvas.loadFromJSON(json, res));
      canvas.getObjects().forEach((o) => { if (o.data && o.data.bg) o.set(BGLOCK); if (o.type === 'i-text') o.set('objectCaching', false); if (o.data?.kind === 'grp') o.set({ subTargetCheck: true, objectCaching: false }); });
      // staršie návrhy: časti ilustrácií zo šablóny zoskupíme aj tu
      const cur = canvas.getObjects(), bgs = cur.filter((o) => o.data && o.data.bg), rest = cur.filter((o) => !(o.data && o.data.bg));
      let hasTi = false; walkJSON(json.objects, (n) => { if (n.data?.ti != null) hasTi = true; });
      const grouped = groupParts(fab, rest, Wt() * Ht(), hasTi);
      if (grouped.length !== rest.length) {
        canvas.renderOnAddRemove = false; canvas.clear(); fit();
        [...bgs, ...grouped].forEach((o) => canvas.add(o));
        canvas.renderOnAddRemove = true;
      }
    } else {
      const { bg, objs: fo } = await buildSide(S.d, side);
      if (tok !== loadTok) { S.busy = false; return; }
      // index objektu v šablóne: podľa neho pri zmene palety/písma prefarbíme aj upravenú vizitku
      [...bg, ...fo].forEach((o, i) => { o.data = { ...(o.data || {}), ti: i }; });
      S.d.tf = { ...(S.d.tf || {}), [side]: tfSnap() };
      bg.forEach((o) => o.set(BGLOCK));
      objs = [...bg, ...groupParts(fab, fo, Wt() * Ht(), false)];
      const sel = canvas.getActiveObject();
      canvas.discardActiveObject();
      canvas.renderOnAddRemove = false;
      canvas.clear(); fit();
      objs.forEach((o) => canvas.add(o));
      canvas.renderOnAddRemove = true;
      void sel;
    }
    S.side = side;
    tuneHit();
    canvas.requestRenderAll();
    S.busy = false;
    saveSide();
    emit('layers');
  }
  async function rebuild(side = S.side) {
    if (side === S.side) { S.custom[side] = false; S.sides[side] = null; await loadSide(side); }
    else { S.custom[side] = false; S.sides[side] = null; }
  }
  async function rebuildAll() { S.custom = { front: false, back: false }; S.sides = { front: null, back: null }; await loadSide(S.side); }

  function syncOtherSide(k, val) {
    const other = S.side === 'front' ? 'back' : 'front';
    if (!S.custom[other]) { S.sides[other] = null; return; }
    const js = S.sides[other]; if (!js) return;
    (js.objects || []).forEach((o) => { if (o.data && o.data.field === k && o.data.part == null) o.text = (o.data.prefix || '') + (o.data.upper ? val.toLocaleUpperCase() : val); });
  }

  // stav návrhu, z ktorého bola strana postavená (polia, logo, znak…) – základ pre porovnanie so šablónou
  const tfSnap = () => ({ tpl: S.d.tpl, f: clone(S.d.f), logo: S.d.logo, mark: S.d.mark, art: S.d.art, back: S.d.back, size: S.d.size, photo: S.d.photo, qrUrl: S.d.qrUrl, emblem: S.d.emblem });
  const baseFor = (side, d) => ({ ...d, ...(S.d.tf?.[side] || {}), pal: d.pal, fonts: d.fonts, sides: null });

  /** Zmena palety / písma aj na ručne upravenej strane: každý prvok zo šablóny dostane farbu/písmo,
   *  aké by mal v šablóne s novým štýlom – ak ho používateľ sám nezmenil. Pozície a úpravy ostanú. */
  async function restyle(apply, kind) {
    saveSide();
    const oldD = clone({ ...S.d, sides: null });
    apply();
    const newD = clone({ ...S.d, sides: null });
    for (const side of ['front', 'back']) {
      if (!S.custom[side]) { if (side !== S.side) S.sides[side] = null; continue; }
      const js = S.sides[side]; if (!js) continue;
      let done = false;
      if (S.d.tf?.[side]) {
        const [ob, nb] = await Promise.all([buildSide(baseFor(side, oldD), side), buildSide(baseFor(side, newD), side)]);
        const O = [...ob.bg, ...ob.objs].map((o) => o.toObject(PROPS)), N0 = [...nb.bg, ...nb.objs].map((o) => o.toObject(PROPS));
        // nový prvok k starému: rovnaký index, alebo (keď šablóna s novým štýlom pridá/uberie prvky) rovnaký typ, pole a poloha
        const key = (x) => [x.type, x.data?.field || '', x.data?.role || '', Math.round(x.left || 0), Math.round(x.top || 0), Math.round((x.width || 0) * (x.scaleX || 1)), Math.round((x.height || 0) * (x.scaleY || 1))].join('|');
        const byKey = new Map(); N0.forEach((x) => { const k = key(x); if (!byKey.has(k)) byKey.set(k, x); });
        const N = O.length === N0.length ? N0 : O.map((x) => byKey.get(key(x)) || null);
        {
          const keys = kind === 'pal' ? ['fill', 'stroke', 'src'] : ['fontFamily', 'fontWeight', 'fontStyle', 'fontSize'];
          walkJSON(js.objects, (n) => {
            const ti = n.data?.ti; if (ti == null || !O[ti] || !N[ti]) return;
            const a = O[ti], b = N[ti];
            if (a.type !== n.type || (a.data?.field || null) !== (n.data?.field || null)) return;
            for (const k of keys) {
              if (k === 'src' && !(n.type === 'image' && n.data?.tint)) continue;
              if (sig(n[k]) === sig(a[k])) n[k] = b[k] == null ? null : clone(b[k]);
            }
            if (kind === 'pal' && n.type === 'image' && b.data?.tint && sig(n.src) === sig(b.src)) n.data = { ...n.data, tint: b.data.tint };
          });
          done = true;
        }
      }
      if (!done) legacyRestyle(js, kind, oldD, newD);
    }
    if (S.custom[S.side]) await loadSide(S.side, true); else await rebuild(S.side);
  }
  // návrhy bez indexov šablóny: presná zhoda farieb palety / rodiny písma
  function legacyRestyle(js, kind, oldD, newD) {
    if (kind === 'pal') {
      const old = oldD.pal || PALETTES[TEMPLATES[oldD.tpl].pal], pal = newD.pal, map = {};
      ['bg', 'ink', 'accent', 'soft'].forEach((k) => { if (old[k] && pal[k]) map[old[k].toLowerCase()] = pal[k]; });
      walkJSON(js.objects, (n) => { ['fill', 'stroke'].forEach((p) => { if (typeof n[p] === 'string' && map[n[p].toLowerCase()]) n[p] = map[n[p].toLowerCase()]; }); });
    } else {
      const oldFp = FONTS[oldD.fonts || TEMPLATES[oldD.tpl].fonts], fp = FONTS[newD.fonts];
      walkJSON(js.objects, (n) => { if (n.fontFamily === oldFp.display) { n.fontFamily = fp.display; n.fontWeight = fp.dw; } else if (n.fontFamily === oldFp.text) n.fontFamily = fp.text; });
    }
  }
  /** Logo / znak / obrázok šablóny na ručne upravenej strane: vymení len tieto prvky, zvyšok ostane */
  async function patchRoles(roles, apply) {
    saveSide();
    apply();
    const newD = clone({ ...S.d, sides: null });
    for (const side of ['front', 'back']) {
      if (!S.custom[side]) { if (side !== S.side) S.sides[side] = null; continue; }
      const js = S.sides[side]; if (!js) continue;
      const nb = await buildSide({ ...baseFor(side, newD), f: S.d.f, logo: newD.logo, mark: newD.mark, art: newD.art }, side);
      const fresh = nb.objs.filter((o) => roles.includes(o.data?.role));
      const monoNew = nb.objs.filter((o) => o.data?.mono);
      js.objects = (js.objects || []).filter((n) => !roles.includes(n.data?.role));
      if (fresh.length && !monoNew.length) js.objects = js.objects.filter((n) => !n.data?.mono); // logo nahradilo monogram
      if (!fresh.length && monoNew.length && !js.objects.some((n) => n.data?.mono)) monoNew.forEach((o) => js.objects.push(o.toObject(PROPS)));
      if (roles.includes('art')) { const nbg = nb.bg.map((o) => o.toObject(PROPS)); js.objects = [...nbg, ...js.objects.filter((n) => !n.data?.bg)]; }
      fresh.forEach((o) => js.objects.push(o.toObject(PROPS)));
    }
    if (S.custom[S.side]) await loadSide(S.side, true); else await rebuild(S.side);
  }
  const colorSig = () => sig(canvas.getObjects().filter((o) => !o.data?.user).map((o) => leaves(o).map((x) => [x.fill, x.stroke].map((c) => (typeof c === 'string' ? c : '')).join(','))));
  async function remapNearest(oldPal, pal) {
    const roles = ['bg', 'ink', 'accent', 'soft'].filter((k) => toRGB(oldPal[k]) && pal[k]);
    const near = (c) => {
      const v = toRGB(c); if (!v) return null;
      let best = null; for (const k of roles) { const o = toRGB(oldPal[k]); const d = Math.hypot(v[0] - o[0], v[1] - o[1], v[2] - o[2]); if (!best || d < best.d) best = { d, k }; }
      return best && best.d < 120 ? pal[best.k] : null;
    };
    saveSide();
    for (const side of ['front', 'back']) {
      if (!S.custom[side]) {
        if (side === S.side) { S.custom[side] = true; }
        else { const { bg, objs } = await buildSide(S.d, side); [...bg, ...objs].forEach((o, i) => { o.data = { ...(o.data || {}), ti: i }; }); S.d.tf = { ...(S.d.tf || {}), [side]: tfSnap() }; S.sides[side] = { version: fab.version, objects: [...bg, ...groupParts(fab, objs, Wt() * Ht(), false)].map((o) => o.toObject(PROPS)) }; S.custom[side] = true; }
      }
      const js = S.sides[side]; if (!js) continue;
      walkJSON(js.objects, (n) => { if (n.data?.user) return; ['fill', 'stroke'].forEach((k) => { const c = near(n[k]); if (c) n[k] = c; }); });
    }
    await loadSide(S.side, true);
  }
  const fontSig = () => canvas.getObjects().filter((o) => o.fontFamily).map((o) => o.fontFamily + o.fontWeight).join('|');
  const isScript = (f) => /script|caveat|vibes|allura|pinyon|parisienne|signature/i.test(f || '');
  async function remapFonts(fp) {
    saveSide();
    for (const side of ['front', 'back']) {
      if (!S.custom[side]) {
        if (side === S.side) S.custom[side] = true;
        else { const { bg, objs } = await buildSide(S.d, side); [...bg, ...objs].forEach((o, i) => { o.data = { ...(o.data || {}), ti: i }; }); S.d.tf = { ...(S.d.tf || {}), [side]: tfSnap() }; S.sides[side] = { version: fab.version, objects: [...bg, ...groupParts(fab, objs, Wt() * Ht(), false)].map((o) => o.toObject(PROPS)) }; S.custom[side] = true; }
      }
      const js = S.sides[side]; if (!js) continue;
      const texts = []; walkJSON(js.objects, (n) => { if (n.fontFamily && !n.data?.user && !isScript(n.fontFamily)) texts.push(n); });
      const max = Math.max(0, ...texts.map((n) => (n.fontSize || 0) * (n.scaleY || 1)));
      texts.forEach((n) => { if ((n.fontSize || 0) * (n.scaleY || 1) >= max * 0.7) { n.fontFamily = fp.display; n.fontWeight = fp.dw; } else { n.fontFamily = fp.text; n.fontWeight = +n.fontWeight >= 600 ? fp.tw2 : fp.tw; } });
    }
    await loadSide(S.side, true);
  }
  const hasRole = (role) => canvas.getObjects().some((o) => o.data?.role === role) || ['front', 'back'].some((sd) => sd !== S.side && S.custom[sd] && (S.sides[sd]?.objects || []).some((n) => n.data?.role === role));
  // logo, ktoré šablóna nepoužíva: nahradí monogram, inak ho pridáme do rohu a vyberieme
  async function placeLogo(src) {
    const lay = layout(S.d, S.side), sz = size(), b = BLEED * K;
    const mono = canvas.getObjects().find((o) => o.data?.mono && o.visible !== false);
    let spec;
    if (mono) {
      const r = mono.getBoundingRect(true, true), side = Math.max(r.width, r.height * 1.6, 8 * K);
      spec = { type: 'image', src, x: (r.left + r.width / 2 - side / 2) / K - BLEED, y: (r.top + r.height / 2 - side / 3.2) / K - BLEED, w: side / K, h: side / 1.6 / K, fit: 'contain', ax: 'left', ay: 'top', role: 'logo' };
    } else spec = { type: 'image', src, x: sz.w - SAFE - 18, y: SAFE, w: 18, h: 9, fit: 'contain', ax: 'left', ay: 'top', role: 'logo' };
    const o = await toFabric(spec, lay); if (!o) return null;
    if (mono) { const r = mono.getBoundingRect(true, true); o.set({ left: r.left + r.width / 2 - (o.width * o.scaleX) / 2, top: r.top + r.height / 2 - (o.height * o.scaleY) / 2 }); canvas.remove(mono); }
    else { o.set({ left: b + (sz.w - SAFE) * K - o.width * o.scaleX, top: b + SAFE * K }); }
    o.setCoords(); canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll();
    S.custom[S.side] = true; saveSide();
    emit('selection', o); emit('logoPlaced', { replacedMono: !!mono }); emit('added', o);
    return o;
  }
  // výber pozadia kliknutím na prázdne miesto vizitky
  canvas.on('mouse:up', (e) => {
    if (e.target || !e.isClick || e.button === 3 || !S.d) return;
    const p = canvas.getPointer(e.e), sz = size(), b = BLEED * K;
    if (p.x < b || p.y < b || p.x > b + sz.w * K || p.y > b + sz.h * K) return;
    const bg = canvas.getObjects().find((o) => o.data && o.data.kind === 'bg');
    if (bg) { canvas.setActiveObject(bg); canvas.requestRenderAll(); emit('selection', bg); }
  });
  // dvojklik na skupinu: rozdelí ju a vyberie časť pod kurzorom (úpravy jednotlivých lístkov, lúčov…)
  canvas.on('mouse:dblclick', (e) => {
    const t = e.target;
    if (t && t.type === 'group' && t.data?.kind === 'grp' && !t.data.locked) api.ungroup(t, e.subTargets && e.subTargets[e.subTargets.length - 1]);
  });

  // ---------- verejné API ----------
  const api = {
    canvas,
    on(ev, fn) { (S.listeners[ev] = S.listeners[ev] || []).push(fn); return api; },
    get design() { return S.d; },
    get side() { return S.side; },
    get custom() { return { ...S.custom }; },
    async load(d, sides, custom) {
      S.d = newDesign(d);
      S.sides = sides ? clone(sides) : { front: null, back: null };
      S.custom = custom ? { ...custom } : { front: !!(sides && sides.front), back: !!(sides && sides.back) };
      S.history = []; S.future = [];
      await loadSide('front');
      commit(true);
    },
    async setSide(side) { if (side === S.side) return; saveSide(); await loadSide(side); emit('side', side); },
    export() { saveSide(); return { d: clone({ ...S.d, sides: null }), sides: clone(S.sides), custom: { ...S.custom } }; },
    /** návrh pripravený na náhľady/tlač (so stranami, ak sú upravené) */
    printable() {
      saveSide();
      const d = clone({ ...S.d });
      d.sides = { front: S.custom.front ? S.sides.front : null, back: S.custom.back ? S.sides.back : null };
      return d;
    },
    async snapshot(side, width = 800, type = 'image/png') { return snap(api.printable(), side, width, type); },

    async setField(k, v) {
      S.d.f[k] = v;
      for (const side of ['front', 'back']) {
        if (!S.custom[side]) { if (side === S.side) await rebuildKeepSel(); else S.sides[side] = null; continue; }
        if (side === S.side) {
          canvas.getObjects().forEach((o) => {
            if (!o.data || o.data.field !== k) return;
            if (o.data.part != null) {
              const w = v.trim().split(/\s+/); const first = w.length > 1 ? w.slice(0, -1).join(' ') : v; const last = w.length > 1 ? w[w.length - 1] : '';
              o.set('text', o.data.part === 0 ? first : last);
            } else o.set('text', (o.data.prefix || '') + (o.data.upper ? v.toLocaleUpperCase() : v));
            if (o.data.fit && o.width * o.scaleX > o.data.fit * K) o.set('fontSize', o.fontSize * (o.data.fit * K) / (o.width * o.scaleX));
          });
          canvas.requestRenderAll(); saveSide();
        } else syncOtherSide(k, v);
      }
      commit();
    },
    async setFields(obj) { Object.assign(S.d.f, obj); await rebuildAll(); commit(true); },
    async applyDesign(d2, { keepFields = true } = {}) {
      if (Object.keys(d2).length === 1 && 'mark' in d2) { await patchRoles(['mark'], () => { S.d.mark = d2.mark; }); commit(true); return; }
      const f = keepFields ? { ...S.d.f, ...(d2.f || {}) } : d2.f;
      S.d = newDesign({ ...S.d, ...d2, f, sides: null, logo: d2.logo ?? S.d.logo, size: S.d.size, corners: S.d.corners, qrUrl: S.d.qrUrl });
      await rebuildAll(); commit(true);
    },
    async setTemplate(id, keepStyle) {
      const st = keepStyle ? {} : templateDefaults(id);
      S.d = { ...S.d, tpl: id, ...st, art: keepStyle ? S.d.art : null };
      await rebuildAll(); commit(true);
    },
    async setPalette(pal) {
      const oldPal = { ...(S.d.pal || PALETTES[TEMPLATES[S.d.tpl].pal]) };
      const before = colorSig();
      await restyle(() => { S.d.pal = { ...pal }; }, 'pal');
      // šablóna s pevnými farbami: farby vizitky namapujeme na najbližšie farby novej palety
      if (colorSig() === before && sig(oldPal) !== sig(pal)) await remapNearest(oldPal, pal);
      commit(true);
    },
    async setFonts(key) {
      const fp = FONTS[key];
      await loadFonts([`${fp.dw} 40px "${fp.display}"`, `italic ${fp.dw} 40px "${fp.display}"`, `${fp.tw} 40px "${fp.text}"`, `${fp.tw2} 40px "${fp.text}"`]);
      const before = fontSig();
      await restyle(() => { S.d.fonts = key; }, 'font');
      // šablóna s pevnými písmami: najväčší text dostane písmo nadpisov, ostatné písmo textu (písané ostanú)
      if (fontSig() === before) await remapFonts(fp);
      commit(true);
    },
    async setArt(art) { await patchRoles(['art'], () => { S.d.art = art; }); commit(true); },
    async setLogo(src) {
      await patchRoles(['logo'], () => { S.d.logo = src; });
      if (src && !hasRole('logo')) await placeLogo(src);
      commit(true);
    },
    async setSize(sz) { S.d.size = sz; await rebuildAll(); fit(); commit(true); },
    async setCorners(c) { S.d.corners = c; applyClip(); canvas.requestRenderAll(); },
    async setBack(key) { S.d.back = key; S.custom.back = false; S.sides.back = null; if (S.side === 'back') await loadSide('back'); else { saveSide(); await loadSide('back'); emit('side', 'back'); } commit(true); },
    async setQR(url) {
      S.d.qrUrl = url;
      for (const side of ['front', 'back']) {
        if (!S.custom[side]) { if (side === S.side) await rebuild(side); else S.sides[side] = null; continue; }
        if (side === S.side) {
          for (const o of canvas.getObjects().filter((x) => x.data && x.data.kind === 'qr')) {
            const size = o.width * o.scaleX, left = o.left, top = o.top, fill = o.fill;
            const lay = layout(S.d, side);
            const n = await toFabric({ type: 'qr', x: 0, y: 0, s: 10, color: fill }, lay, { qr: url });
            n.set({ left, top, scaleX: size / n.width, scaleY: size / n.width });
            canvas.insertAt(n, canvas.getObjects().indexOf(o), true);
          }
          canvas.requestRenderAll(); saveSide();
        }
      }
    },
    /** farba alebo prechod pozadia ({ grad: [..], angle }); textúru/grafiku šablóny pod tým skryje */
    setBg(color) {
      const bg = canvas.getObjects().find((o) => o.data && o.data.kind === 'bg'); if (!bg) return;
      bg.set('fill', paint(color)); bg.dirty = true;
      canvas.getObjects().forEach((o) => { if (o.data && (o.data.bglike || o.data.kind === 'bgart')) o.set('visible', false); });
      S.custom[S.side] = true; canvas.requestRenderAll(); commit(); emit('layers');
    },
    bgColor() { const bg = canvas.getObjects().find((o) => o.data && o.data.kind === 'bg'); return bg ? bg.fill : null; },
    /** textúra papiera cez celú vizitku ({ src, blend, opacity } alebo null) */
    async setBgTexture(t) {
      canvas.getObjects().filter((o) => o.data?.kind === 'bgtex').forEach((o) => canvas.remove(o));
      if (t && t.src) {
        const lay = layout(S.d, S.side), sz = size();
        const img = await toFabric({ type: 'image', src: t.src, x: -BLEED, y: -BLEED, w: sz.w + 2 * BLEED, h: sz.h + 2 * BLEED, fit: 'cover', role: 'texture' }, lay);
        if (img) {
          img.set({ ...BGLOCK, opacity: t.opacity ?? 1, globalCompositeOperation: t.blend || 'source-over' });
          img.data = { ...img.data, bg: true, kind: 'bgtex', tex: t.key || null };
          const idx = canvas.getObjects().filter((o) => o.data?.bg && o.data.kind !== 'bgtex').length;
          canvas.insertAt(img, idx, false);
          if (!t.blend || t.blend === 'source-over') canvas.getObjects().forEach((o) => { if (o.data && (o.data.bglike || o.data.kind === 'bgart')) o.set('visible', false); });
        }
      }
      S.custom[S.side] = true; canvas.requestRenderAll(); commit(true);
    },
    bgTexture() { return canvas.getObjects().find((o) => o.data?.kind === 'bgtex')?.data?.tex || null; },
    /** štýl prvku (písmo, farba, rozostupy) – „kopírovať štýl“ */
    styleOf(o = canvas.getActiveObject()) {
      if (!o || o.type === 'activeSelection') return null;
      const keys = /text/.test(o.type) ? ['fontFamily', 'fontWeight', 'fontStyle', 'fontSize', 'charSpacing', 'lineHeight', 'fill', 'stroke', 'strokeWidth', 'opacity'] : ['fill', 'stroke', 'strokeWidth', 'opacity'];
      const st = { text: /text/.test(o.type), upper: !!o.data?.upper };
      keys.forEach((k) => { st[k] = o[k]; });
      if (o.type === 'group') st.col = api.colorsOf(o)[0] || null;
      return st;
    },
    async applyStyle(st, o = canvas.getActiveObject()) {
      if (!st || !o) return;
      const targets = o.type === 'activeSelection' ? o.getObjects() : [o];
      for (const t of targets) {
        if (/text/.test(t.type) && st.text) {
          await loadFonts([`${st.fontStyle === 'italic' ? 'italic ' : ''}${st.fontWeight || 400} 40px "${st.fontFamily}"`]);
          ['fontFamily', 'fontWeight', 'fontStyle', 'charSpacing', 'lineHeight', 'fill', 'stroke', 'strokeWidth', 'opacity'].forEach((k) => { if (st[k] !== undefined) t.set(k, st[k]); });
          if (st.fontSize) t.set('fontSize', st.fontSize / (t.scaleY || 1));
          if (st.upper !== !!t.data?.upper) { t.set('text', st.upper ? t.text.toLocaleUpperCase() : (t.data?.field ? (t.data.prefix || '') + (S.d.f[t.data.field] || t.text) : t.text)); t.data = { ...t.data, upper: st.upper }; }
          t.initDimensions?.();
        } else if (t.type === 'group' && (st.col || typeof st.fill === 'string')) {
          const from = api.colorsOf(t)[0]; const to = st.col || st.fill; if (from && to) { const pc = paint(to); leaves(t).forEach((x) => { if (colKey(x.fill) === from) x.set('fill', pc); if (colKey(x.stroke) === from) x.set('stroke', pc); }); }
        } else if (!/text/.test(t.type) && t.type !== 'image') {
          ['fill', 'stroke', 'strokeWidth', 'opacity'].forEach((k) => { if (st[k] !== undefined && st[k] !== null) t.set(k, st[k]); });
        }
        t.setCoords(); t.dirty = true;
      }
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', o);
    },
    /** QR kódy na aktuálnej strane */
    qrCount() { return canvas.getObjects().filter((o) => o.data?.kind === 'qr').length; },
    removeQR() { canvas.getObjects().filter((o) => o.data?.kind === 'qr').forEach((o) => canvas.remove(o)); canvas.discardActiveObject(); S.custom[S.side] = true; canvas.requestRenderAll(); commit(); emit('layers'); },

    // ---------- pridávanie ----------
    async add(kind, extra = {}) {
      const lay = layout(S.d, S.side); const sz = size(); const pal = lay.pal;
      let spec;
      if (kind === 'heading') spec = { type: 'text', text: extra.text || 'Nadpis', x: sz.w / 2, y: sz.h / 2, ox: 'center', oy: 'center', size: 5, font: 'd', color: pal.ink };
      else if (kind === 'subheading') spec = { type: 'text', text: extra.text || 'Podnadpis', x: sz.w / 2, y: sz.h / 2, ox: 'center', oy: 'center', size: 2, font: 't', w: 600, ls: 0.18, upper: true, color: pal.accent };
      else if (kind === 'small') spec = { type: 'text', text: extra.text || 'Malý text', x: sz.w / 2, y: sz.h / 2, ox: 'center', oy: 'center', size: 1.8, font: 't', color: pal.ink };
      else if (kind === 'rounded') spec = { type: 'rect', x: sz.w / 2 - 10, y: sz.h / 2 - 4, w: 20, h: 8, rx: 4, fill: pal.accent };
      else if (kind === 'ring') spec = { type: 'circle', x: sz.w / 2, y: sz.h / 2, r: 7, fill: 'transparent', stroke: pal.accent, sw: 0.35 };
      else if (kind === 'frame') spec = { type: 'rect', x: SAFE - 1, y: SAFE - 1, w: sz.w - 2 * SAFE + 2, h: sz.h - 2 * SAFE + 2, fill: 'transparent', stroke: pal.accent, sw: 0.25 };
      else if (kind === 'dashed') spec = { type: 'line', x1: sz.w / 2 - 12, y1: sz.h / 2, x2: sz.w / 2 + 12, y2: sz.h / 2, stroke: pal.ink, sw: 0.25, dash: true };
      else if (kind === 'emblem') spec = { type: 'image', src: emblemURL(extra.key, 512), x: sz.w / 2 - 6, y: sz.h / 2 - 6, w: 12, h: 12, fit: 'contain', tint: extra.color || pal.accent, role: 'emblem' };
      else if (kind === 'divider') {
        const c = (sz.h * K) / 2 + BLEED * K, cx = (sz.w * K) / 2 + BLEED * K, w = 11 * K, col = paint(pal.accent);
        const parts = [new fab.Line([cx - w, c, cx - 1.6 * K, c], { stroke: col, strokeWidth: 0.25 * K }), new fab.Rect({ left: cx, top: c, width: 1.6 * K, height: 1.6 * K, angle: 45, originX: 'center', originY: 'center', fill: col }), new fab.Line([cx + 1.6 * K, c, cx + w, c], { stroke: col, strokeWidth: 0.25 * K })];
        const g = new fab.Group(parts, {}); g.data = { kind: 'divider', user: true };
        canvas.add(g); canvas.setActiveObject(g); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', g); emit('added', g);
        return g;
      }
      else if (['frame2', 'corners', 'dots', 'wave', 'sprig'].includes(kind)) {
        const b = BLEED * K, W = sz.w * K, H = sz.h * K, col = paint(pal.accent), sw = 0.25 * K, cx = b + W / 2, cy = b + H / 2;
        let parts = [];
        if (kind === 'frame2') { const m = (SAFE - 1.2) * K; parts = [new fab.Rect({ left: b + m, top: b + m, width: W - 2 * m, height: H - 2 * m, fill: 'transparent', stroke: col, strokeWidth: sw * 1.6, strokeUniform: true }), new fab.Rect({ left: b + m + 1.1 * K, top: b + m + 1.1 * K, width: W - 2 * m - 2.2 * K, height: H - 2 * m - 2.2 * K, fill: 'transparent', stroke: col, strokeWidth: sw * 0.7, strokeUniform: true })]; }
        if (kind === 'corners') { const m = (SAFE - 1) * K, L = 5 * K; const c = (x, y, dx, dy) => new fab.Polyline([{ x: x + dx * L, y }, { x, y }, { x, y: y + dy * L }], { fill: 'transparent', stroke: col, strokeWidth: sw * 1.4, strokeUniform: true }); parts = [c(b + m, b + m, 1, 1), c(b + W - m, b + m, -1, 1), c(b + m, b + H - m, 1, -1), c(b + W - m, b + H - m, -1, -1)]; }
        if (kind === 'dots') parts = [-1, 0, 1].map((k) => new fab.Circle({ left: cx + k * 2.4 * K, top: cy, radius: (k ? 0.45 : 0.7) * K, originX: 'center', originY: 'center', fill: col }));
        if (kind === 'wave') { let d = `M ${cx - 12 * K} ${cy}`; for (let k = 0; k < 6; k++) d += ` q ${2 * K} ${k % 2 ? 1.6 * K : -1.6 * K} ${4 * K} 0`; parts = [new fab.Path(d, { fill: 'transparent', stroke: col, strokeWidth: sw * 1.2, strokeLineCap: 'round' })]; }
        if (kind === 'sprig') { parts = [new fab.Path(`M ${cx - 9 * K} ${cy} Q ${cx} ${cy - 1.2 * K} ${cx + 9 * K} ${cy}`, { fill: 'transparent', stroke: col, strokeWidth: sw, strokeLineCap: 'round' })]; for (let k = -3; k <= 3; k++) { if (!k) continue; const x = cx + k * 2.4 * K, y = cy - 0.5 * K; parts.push(new fab.Ellipse({ left: x, top: y + (k % 2 ? -0.9 : 0.9) * K, rx: 1.05 * K, ry: 0.42 * K, angle: k % 2 ? -32 : 32, originX: 'center', originY: 'center', fill: col })); } }
        const g = parts.length > 1 ? new fab.Group(parts, { objectCaching: false, subTargetCheck: true }) : parts[0];
        g.data = { kind: parts.length > 1 ? 'grp' : 'path', role: 'ornament', user: true };
        canvas.add(g); canvas.setActiveObject(g); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', g); emit('added', g);
        return g;
      }
      else if (kind === 'text') spec = { type: 'text', text: extra.text || 'Text', x: sz.w / 2, y: sz.h / 2, ox: 'center', oy: 'center', size: 2.2, font: 't', color: pal.ink };
      else if (kind === 'rect') spec = { type: 'rect', x: sz.w / 2 - 8, y: sz.h / 2 - 5, w: 16, h: 10, fill: pal.accent };
      else if (kind === 'circle') spec = { type: 'circle', x: sz.w / 2, y: sz.h / 2, r: 6, fill: pal.accent };
      else if (kind === 'line') spec = { type: 'line', x1: sz.w / 2 - 10, y1: sz.h / 2, x2: sz.w / 2 + 10, y2: sz.h / 2, stroke: pal.ink, sw: 0.25 };
      else if (kind === 'icon') spec = { type: 'icon', name: extra.name || 'star', x: sz.w / 2 - 3, y: sz.h / 2 - 3, s: 6, color: pal.accent };
      else if (kind === 'qr') spec = { type: 'qr', x: sz.w / 2 - 9, y: sz.h / 2 - 9, s: 18, color: pal.ink };
      else if (kind === 'image') spec = { type: 'image', src: extra.src, x: sz.w / 2 - 12, y: sz.h / 2 - 9, w: 24, h: 18, fit: 'contain', role: extra.role || 'image' };
      const o = await toFabric(spec, lay, { qr: S.d.qrUrl });
      if (!o) return;
      if (spec.dash) o.set('strokeDashArray', [0.9 * K, 0.6 * K]);
      if (kind === 'emblem') o.data = { ...o.data, emb: extra.key, tint: spec.tint };
      o.data = { ...o.data, user: true };
      if (spec.type === 'text') { await loadFonts([`${o.fontWeight} 40px "${o.fontFamily}"`]); o.initDimensions(); }
      canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll();
      S.custom[S.side] = true; commit();
      emit('selection', o); emit('added', o);
      return o;
    },
    async replaceImage(o, src) {
      const lay = layout(S.d, S.side);
      const w = (o.width * o.scaleX) / K, h = (o.height * o.scaleY) / K;
      const n = await toFabric({ type: 'image', src, x: o.left / K - BLEED, y: o.top / K - BLEED, w, h, fit: 'contain', role: o.data?.role }, lay);
      canvas.insertAt(n, canvas.getObjects().indexOf(o), true); canvas.setActiveObject(n); canvas.requestRenderAll();
      S.custom[S.side] = true; commit();
    },

    // ---------- úpravy vybraného objektu ----------
    active() { return canvas.getActiveObject(); },
    async style(props) {
      const o = canvas.getActiveObject(); if (!o) return;
      const targets = o.type === 'activeSelection' ? o.getObjects() : [o];
      for (const t of targets) {
        const p = { ...props };
        if (p.fontFamily || p.fontWeight || p.fontStyle) await loadFonts([`${p.fontStyle || t.fontStyle === 'italic' ? 'italic ' : ''}${p.fontWeight || t.fontWeight || 400} 40px "${p.fontFamily || t.fontFamily}"`]);
        if (p.color && t.type === 'image' && (t.data?.emb || t.data?.src0 || t.data?.role === 'mark' || t.data?.role === 'emblem')) {
          const src = t.data.emb ? emblemURL(t.data.emb, 512) : (t.data.src0 || S.d.mark);
          const el2 = src && await tintEl(src, p.color);
          if (el2) { const sx = t.scaleX, sy = t.scaleY, w = t.width, h = t.height; t.setElement(el2); t.set({ width: w, height: h, scaleX: sx, scaleY: sy }); t.data = { ...t.data, tint: p.color }; }
          delete p.color;
        }
        if (p.color) { const pc = paint(p.color); if (t.type === 'group') t.getObjects().forEach((x) => { if (x.stroke && x.stroke !== 'none') x.set('stroke', pc); if (x.fill && x.fill !== 'none' && x.fill !== 'transparent') x.set('fill', pc); }); else if (t.type === 'line') t.set('stroke', pc); else t.set('fill', pc); delete p.color; }
        if (p.upper != null) { t.set('text', p.upper ? t.text.toLocaleUpperCase() : t.text); t.data = { ...t.data, upper: p.upper }; delete p.upper; }
        if (p.textAlign) {
          // zarovnanie aj pre jednoriadkový text: kotva sa presunie na zvolenú stranu, text ostane na mieste
          const ox = p.textAlign === 'right' ? 'right' : p.textAlign === 'center' ? 'center' : 'left';
          const pt = t.getPointByOrigin(ox, 'top');
          t.set({ textAlign: p.textAlign, originX: ox }); t.setPositionByOrigin(pt, ox, 'top');
          delete p.textAlign;
        }
        t.set(p);
        if (t.initDimensions) t.initDimensions();
        t.setCoords(); t.dirty = true;
      }
      canvas.requestRenderAll(); S.custom[S.side] = true; commit();
      emit('selection', o);
    },
    async remove() {
      const o = canvas.getActiveObject(); if (!o || o.isEditing || o.data?.bg) return;
      const all = (o.type === 'activeSelection' ? o.getObjects() : [o]).filter((x) => !x.data?.bg);
      if (all.every((x) => x.data?.locked)) { emit('locked', o); return; }
      all.filter((x) => !x.data?.locked).forEach((x) => canvas.remove(x));
      canvas.discardActiveObject(); canvas.requestRenderAll(); S.custom[S.side] = true; commit();
    },
    async duplicate() {
      const o = canvas.getActiveObject(); if (!o) return;
      o.clone((c) => { c.set({ left: o.left + 3 * K, top: o.top + 3 * K }); c.data = { ...(o.data || {}), field: null }; canvas.add(c); canvas.setActiveObject(c); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); }, PROPS);
    },
    order(dir) {
      const o = canvas.getActiveObject(); if (!o) return;
      const minIdx = canvas.getObjects().filter((x) => x.data && x.data.bg).length;
      if (dir === 'up') canvas.bringForward(o); else if (dir === 'top') canvas.bringToFront(o);
      else if (dir === 'down') { canvas.sendBackwards(o); if (canvas.getObjects().indexOf(o) < minIdx) canvas.moveTo(o, minIdx); }
      else if (dir === 'bottom') canvas.moveTo(o, minIdx);
      canvas.requestRenderAll(); S.custom[S.side] = true; commit();
    },
    align(where) {
      const o = canvas.getActiveObject(); if (!o) return;
      const sz = size(), b = BLEED * K, br = o.getBoundingRect(true, true);
      if (where === 'hcenter') o.left += b + (sz.w * K) / 2 - (br.left + br.width / 2);
      if (where === 'vcenter') o.top += b + (sz.h * K) / 2 - (br.top + br.height / 2);
      if (where === 'left') o.left += b + SAFE * K - br.left;
      if (where === 'right') o.left += b + (sz.w - SAFE) * K - (br.left + br.width);
      o.setCoords(); canvas.requestRenderAll(); S.custom[S.side] = true; commit();
    },
    nudge(dx, dy) { const o = canvas.getActiveObject(); if (!o || o.isEditing || o.data?.locked || o.lockMovementX) return; o.left += dx; o.top += dy; o.setCoords(); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); },
    copy() { const o = canvas.getActiveObject(); if (o) o.clone((c) => { S.clip = c; }, PROPS); },
    paste() { if (!S.clip) return; S.clip.clone((c) => { c.set({ left: c.left + 3 * K, top: c.top + 3 * K }); canvas.add(c); canvas.setActiveObject(c); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); }, PROPS); },

    // ---------- farby v skupine, zoskupenie ----------
    /** farby použité v prvku (aj vo vnútri skupiny), od najčastejšej */
    colorsOf(o = canvas.getActiveObject()) {
      if (!o) return [];
      const n = new Map();
      leaves(o).forEach((x) => {
        const w = x.type === 'image' ? 3 : 1;
        if (x.type === 'image') { const k = colKey(x.data?.tint); if (k) n.set(k, (n.get(k) || 0) + w); return; }
        [colKey(x.fill), x.strokeWidth ? colKey(x.stroke) : null].forEach((k) => { if (k) n.set(k, (n.get(k) || 0) + w); });
      });
      return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
    },
    /** v prvku nahradí jednu farbu inou (tiene a ďalšie farby ilustrácie ostanú) */
    async recolor(o = canvas.getActiveObject(), from, to) {
      if (!o || !from || !to) return;
      const F0 = String(from).toUpperCase(), pc = paint(to);
      for (const x of leaves(o)) {
        if (x.type === 'image') {
          if (colKey(x.data?.tint) === F0) {
            const src = x.data.emb ? emblemURL(x.data.emb, 512) : (x.data.src0 || (x.data.role === 'mark' ? S.d.mark : null));
            const el2 = src && await tintEl(src, to);
            if (el2) { const sx = x.scaleX, sy = x.scaleY, w = x.width, h = x.height; x.setElement(el2); x.set({ width: w, height: h, scaleX: sx, scaleY: sy }); x.data = { ...x.data, tint: to }; }
          }
          continue;
        }
        if (colKey(x.fill) === F0) x.set('fill', pc);
        if (colKey(x.stroke) === F0) x.set('stroke', pc);
        x.dirty = true;
      }
      if (o.type === 'group') o.dirty = true;
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', o);
    },
    canGroup(o = canvas.getActiveObject()) { return !!(o && o.type === 'activeSelection' && o.getObjects().filter((x) => !(x.data && (x.data.field || x.data.bg))).length >= 2); },
    /** zoskupí vybrané prvky (texty s údajmi ostanú samostatne, aby sa dali ďalej meniť z polí) */
    group() {
      const act = canvas.getActiveObject(); if (!api.canGroup(act)) return null;
      const all = canvas.getObjects();
      const list = act.getObjects().filter((x) => !(x.data && (x.data.field || x.data.bg))).sort((a, b) => all.indexOf(a) - all.indexOf(b));
      const idx = all.indexOf(list[0]);
      canvas.discardActiveObject();
      list.forEach((x) => canvas.remove(x));
      list.forEach((x) => { if (x.data) delete x.data.loose; });
      const g = new fab.Group(list, { objectCaching: false, subTargetCheck: true });
      g.data = { kind: 'grp', role: 'user' };
      canvas.insertAt(g, Math.min(idx, canvas.getObjects().length), false);
      tuneHit(); canvas.setActiveObject(g); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', g); emit('layers');
      return g;
    },
    /** rozdelí skupinu na časti (zostanú na svojom mieste aj v poradí vrstiev) */
    ungroup(o = canvas.getActiveObject(), focus) {
      if (!o || o.type !== 'group' || o.data?.kind !== 'grp') return null;
      const idx = canvas.getObjects().indexOf(o), items = o.getObjects().slice();
      o._restoreObjectsState();
      canvas.discardActiveObject(); canvas.remove(o);
      items.forEach((it, k) => { it.group = undefined; it.data = { ...(it.data || {}), loose: true }; canvas.insertAt(it, idx + k, false); it.setCoords(); });
      tuneHit();
      const pick = focus && items.includes(focus) ? focus : null;
      canvas.setActiveObject(pick || new fab.ActiveSelection(items, { canvas }));
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', canvas.getActiveObject()); emit('layers'); emit('ungrouped', { n: items.length, focus: !!pick });
      return items;
    },
    setMulti(on) {
      S.multi = !!on;
      const a = canvas.getActiveObject();
      if (a) { a.hasControls = !S.multi && !a.data?.locked && !a.data?.bg; canvas.requestRenderAll(); }
      emit('multi', S.multi);
    },
    get multi() { return !!S.multi; },
    selectBg() { const bg = canvas.getObjects().find((o) => o.data && o.data.kind === 'bg'); if (bg) { canvas.setActiveObject(bg); canvas.requestRenderAll(); emit('selection', bg); } },

    // ---------- zamknutie, vrstvy, zarovnanie ----------
    isLocked(o = canvas.getActiveObject()) { return !!(o && (o.type === 'activeSelection' ? o.getObjects().every((x) => x.data?.locked) : o.data?.locked)); },
    lock(o = canvas.getActiveObject(), on) {
      if (!o) return;
      const all = o.type === 'activeSelection' ? o.getObjects() : [o];
      const to = on ?? !all.every((x) => x.data?.locked);
      all.forEach((x) => { x.set(to ? LOCK : UNLOCK); x.data = { ...(x.data || {}), locked: to }; });
      if (o.type === 'activeSelection') o.set({ hasControls: !to, lockMovementX: to, lockMovementY: to });
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', o);
      return to;
    },
    /** zoznam vrstiev (bez pozadia), zhora nadol */
    layers() {
      const act = canvas.getActiveObject();
      const sel = new Set(act ? (act.type === 'activeSelection' ? act.getObjects() : [act]) : []);
      return canvas.getObjects().filter((o) => !(o.data && (o.data.bg || o.data.bglike))).map((o) => ({ o, type: o.type, kind: o.data?.kind, role: o.data?.role, field: o.data?.field, text: o.text || '', locked: !!o.data?.locked, visible: o.visible !== false, selected: sel.has(o) })).reverse();
    },
    select(o, add) {
      if (!o) return;
      if (add) { const act = canvas.getActiveObject(); const list = act ? (act.type === 'activeSelection' ? act.getObjects() : [act]) : []; if (!list.includes(o)) list.push(o); canvas.discardActiveObject(); canvas.setActiveObject(list.length > 1 ? new fab.ActiveSelection(list, { canvas }) : o); }
      else canvas.setActiveObject(o);
      canvas.requestRenderAll(); emit('selection', canvas.getActiveObject()); emit('layers');
    },
    selectMany(list) {
      if (!list.length) return;
      canvas.discardActiveObject();
      canvas.setActiveObject(list.length > 1 ? new fab.ActiveSelection(list, { canvas }) : list[0]);
      canvas.requestRenderAll(); emit('selection', canvas.getActiveObject()); emit('layers');
    },
    selectAll() {
      const list = canvas.getObjects().filter((o) => o.selectable && o.visible !== false && !(o.data && o.data.bg));
      if (!list.length) return;
      canvas.discardActiveObject();
      canvas.setActiveObject(list.length > 1 ? new fab.ActiveSelection(list, { canvas }) : list[0]);
      canvas.requestRenderAll(); emit('selection', canvas.getActiveObject()); emit('layers');
    },
    setVisible(o, v) { if (!o) return; o.set('visible', v); if (!v && canvas.getActiveObject() === o) canvas.discardActiveObject(); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('layers'); },
    /** presun vrstvy na pozíciu v zozname zhora (0 = navrchu) */
    moveLayer(o, topIndex) {
      const objs = canvas.getObjects(), minIdx = objs.filter((x) => x.data && x.data.bg).length;
      const n = objs.length - minIdx;
      const idx = Math.max(minIdx, Math.min(objs.length - 1, minIdx + (n - 1 - topIndex)));
      canvas.moveTo(o, idx); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('layers');
    },
    /** zarovnanie: jeden prvok k vizitke (bezpečná zóna), viac prvkov navzájom */
    alignSel(where) {
      const act = canvas.getActiveObject(); if (!act) return;
      const sz = size(), b = BLEED * K;
      if (act.type !== 'activeSelection') {
        const br = act.getBoundingRect(true, true);
        const box = { l: b + SAFE * K, r: b + (sz.w - SAFE) * K, t: b + SAFE * K, bt: b + (sz.h - SAFE) * K, cx: b + (sz.w * K) / 2, cy: b + (sz.h * K) / 2 };
        if (where === 'left') act.left += box.l - br.left;
        if (where === 'center' || where === 'hcenter') act.left += box.cx - (br.left + br.width / 2);
        if (where === 'right') act.left += box.r - (br.left + br.width);
        if (where === 'top') act.top += box.t - br.top;
        if (where === 'middle' || where === 'vcenter') act.top += box.cy - (br.top + br.height / 2);
        if (where === 'bottom') act.top += box.bt - (br.top + br.height);
        act.setCoords();
      } else {
        const list = act.getObjects();
        canvas.discardActiveObject();
        if (list.some((o) => o.initDimensions)) fab.util.clearFabricFontCache();
        list.forEach((o) => { if (o.initDimensions) { o.initDimensions(); o.setCoords(); } });
        const R = list.map((o) => ({ o, r: o.getBoundingRect(true, true) }));
        const minL = Math.min(...R.map((x) => x.r.left)), maxR = Math.max(...R.map((x) => x.r.left + x.r.width));
        const minT = Math.min(...R.map((x) => x.r.top)), maxB = Math.max(...R.map((x) => x.r.top + x.r.height));
        if (where === 'dist-h' || where === 'dist-v') {
          const hz = where === 'dist-h';
          const sorted = [...R].sort((a, c) => (hz ? a.r.left - c.r.left : a.r.top - c.r.top));
          const total = sorted.reduce((s2, x) => s2 + (hz ? x.r.width : x.r.height), 0);
          const gap = ((hz ? maxR - minL : maxB - minT) - total) / Math.max(1, sorted.length - 1);
          let pos = hz ? minL : minT;
          sorted.forEach((x) => { if (hz) x.o.left += pos - x.r.left; else x.o.top += pos - x.r.top; pos += (hz ? x.r.width : x.r.height) + gap; });
        } else R.forEach(({ o, r }) => {
          if (o.data?.locked) return;
          if (where === 'left') o.left += minL - r.left;
          if (where === 'center' || where === 'hcenter') o.left += (minL + maxR) / 2 - (r.left + r.width / 2);
          if (where === 'right') o.left += maxR - (r.left + r.width);
          if (where === 'top') o.top += minT - r.top;
          if (where === 'middle' || where === 'vcenter') o.top += (minT + maxB) / 2 - (r.top + r.height / 2);
          if (where === 'bottom') o.top += maxB - (r.top + r.height);
        });
        list.forEach((o) => o.setCoords());
        canvas.setActiveObject(new fab.ActiveSelection(list, { canvas }));
      }
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', canvas.getActiveObject());
    },
    /** presah mimo bezpečnú zónu (v px plátna); null = v poriadku */
    overflow(o = canvas.getActiveObject()) {
      if (!o || o.type === 'activeSelection' || (o.data && o.data.bg)) return null;
      const sz = size(), b = BLEED * K, R = o.getBoundingRect(true, true), tol = 0.3 * K;
      const box = { l: b + SAFE * K, r: b + (sz.w - SAFE) * K, t: b + SAFE * K, bt: b + (sz.h - SAFE) * K };
      // veľké plochy a obrázky cez celú vizitku sú v poriadku, ide o texty a drobné prvky
      if (R.width > sz.w * K * 0.9 || R.height > sz.h * K * 0.9) return null;
      const out = { l: box.l - R.left, r: R.left + R.width - box.r, t: box.t - R.top, b: R.top + R.height - box.bt };
      return Object.values(out).some((v) => v > tol) ? { ...out, w: R.width, h: R.height, boxW: box.r - box.l, boxH: box.bt - box.t } : null;
    },
    /** vráti prvok do bezpečnej zóny: text sa zmenší, ak je širší, potom sa posunie */
    fitSafe(o = canvas.getActiveObject()) {
      const ov = api.overflow(o); if (!ov) return;
      if (/text/.test(o.type) && (ov.w > ov.boxW || ov.h > ov.boxH)) {
        const k = Math.min(ov.boxW / ov.w, ov.boxH / ov.h) * 0.98;
        o.set('fontSize', Math.max(1.6 * K, o.fontSize * k)); o.initDimensions?.(); o.setCoords();
      }
      const o2 = api.overflow(o);
      if (o2) { if (o2.l > 0) o.left += o2.l; if (o2.r > 0) o.left -= o2.r; if (o2.t > 0) o.top += o2.t; if (o2.b > 0) o.top -= o2.b; o.setCoords(); }
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', o);
    },
    /** orez obrázka: obdĺžnik v pixeloch pôvodného obrázka */
    crop(o, r) {
      if (!o || o.type !== 'image') return;
      const ox = o.cropX || 0, oy = o.cropY || 0;
      const p = o.getPointByOrigin('left', 'top');
      const dx = (r.x - ox) * o.scaleX, dy = (r.y - oy) * o.scaleY;
      const rad = fab.util.degreesToRadians(o.angle || 0);
      o.set({ cropX: r.x, cropY: r.y, width: r.w, height: r.h });
      o.setPositionByOrigin(new fab.Point(p.x + dx * Math.cos(rad) - dy * Math.sin(rad), p.y + dx * Math.sin(rad) + dy * Math.cos(rad)), 'left', 'top');
      o.setCoords(); o.dirty = true;
      canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', o);
    },
    async setElement(o, el) { o.setElement(el); o.dirty = true; canvas.requestRenderAll(); S.custom[S.side] = true; commit(); emit('selection', o); },
    setGuides(on) { S.guides = on; },
    setMarks(on) { S.marks = on; applyClip(); canvas.requestRenderAll(); },
    zoomIn() { zoomAt(S.uz * 1.25); },
    zoomOut() { zoomAt(S.uz / 1.25); },
    zoomFit() { S.uz = 1; S.px = 0; S.py = 0; fit(); },
    get zoomLevel() { return S.uz; },
    /** vyberie objekt podľa textu (napr. z kontroly pred tlačou) */
    selectByText(t) {
      const n = (x) => String(x || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const o = canvas.getObjects().find((x) => x.selectable && x.text && (n(x.text).includes(n(t)) || n(t).includes(n(x.text))));
      if (o) { canvas.setActiveObject(o); canvas.requestRenderAll(); emit('selection', o); }
      return o;
    },
    undo, redo,
    fit,
    deselect() { canvas.discardActiveObject(); canvas.requestRenderAll(); },
    async resetSide() { await rebuild(S.side); commit(true); },
    /** vlastný súbor: obrázok cez celú stranu vrátane spadávky */
    async coverImage(src, side = S.side) {
      if (side !== S.side) { saveSide(); await loadSide(side); emit('side', side); }
      const lay = layout(S.d, S.side); const sz = size();
      const img = await toFabric({ type: 'image', src, x: -BLEED, y: -BLEED, w: sz.w + 2 * BLEED, h: sz.h + 2 * BLEED, fit: 'cover', role: 'file' }, lay);
      if (!img) return;
      canvas.getObjects().filter((o) => !(o.data && o.data.kind === 'bg')).forEach((o) => canvas.remove(o));
      img.set({ selectable: false, evented: false }); img.data = { ...img.data, bg: true, kind: 'file' };
      canvas.add(img); canvas.requestRenderAll(); S.custom[S.side] = true; commit(true);
    },
  };

  // zmeny návrhu bežia za sebou (rýchle klikanie na palety/písma/logo nesmie prepisovať rozpracovanú stranu)
  let queue = Promise.resolve();
  const serial = (fn) => (...a) => { const p = queue.then(() => fn(...a)); queue = p.catch(() => {}); return p; };
  for (const k of ['load', 'setSide', 'setField', 'setFields', 'applyDesign', 'setTemplate', 'setPalette', 'setFonts', 'setArt', 'setLogo', 'setSize', 'setBack', 'setQR', 'resetSide', 'coverImage']) api[k] = serial(api[k]);
  const _undo = serial(undo), _redo = serial(redo);
  api.idle = () => queue;
  api.undo = _undo; api.redo = _redo;

  // klávesy
  window.addEventListener('keydown', (e) => {
    if (!host.offsetParent) return; // editor nie je na obrazovke
    const t = document.activeElement;
    if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.closest('.canvas-container')) return;
    const o = canvas.getActiveObject();
    if (o && o.isEditing) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); api.zoomIn(); }
    else if (mod && e.key === '-') { e.preventDefault(); api.zoomOut(); }
    else if (mod && e.key === '0') { e.preventDefault(); api.zoomFit(); }
    else if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? api.redo() : api.undo(); }
    else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); api.redo(); }
    else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); api.duplicate(); }
    else if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); api.selectAll(); }
    else if (mod && e.shiftKey && e.key.toLowerCase() === 'l' && o) { e.preventDefault(); api.lock(); }
    else if (mod && (e.key === ']' || e.code === 'BracketRight') && o) { e.preventDefault(); api.order(e.shiftKey || e.altKey ? 'top' : 'up'); }
    else if (mod && (e.key === '[' || e.code === 'BracketLeft') && o) { e.preventDefault(); api.order(e.shiftKey || e.altKey ? 'bottom' : 'down'); }
    else if (mod && e.key.toLowerCase() === 'c') { api.copy(); }
    else if (mod && e.key.toLowerCase() === 'v') { api.paste(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && o) { e.preventDefault(); api.remove(); }
    else if (e.key.startsWith('Arrow') && o) {
      e.preventDefault();
      const st = (e.shiftKey ? 2 : 0.25) * K;
      api.nudge(e.key === 'ArrowLeft' ? -st : e.key === 'ArrowRight' ? st : 0, e.key === 'ArrowUp' ? -st : e.key === 'ArrowDown' ? st : 0);
    } else if (e.key === 'Escape') api.deselect();
  });

  // Ctrl/⌘ + koliesko priblíži, pri priblížení koliesko posúva
  host.addEventListener('wheel', (e) => {
    if (!S.d) return;
    const r = host.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomAt(S.uz * Math.exp(-e.deltaY * 0.0055), e.clientX - r.left, e.clientY - r.top); }
    else if (S.uz > 1.01) { e.preventDefault(); S.px -= e.deltaX; S.py -= e.deltaY; fit(); }
  }, { passive: false });
  // dva prsty: priblíženie a posun (Fabric dostane len jednoprstové dotyky)
  let pinch = null;
  const tp = (e) => { const r = host.getBoundingClientRect(), [a, b] = e.touches; return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), x: (a.clientX + b.clientX) / 2 - r.left, y: (a.clientY + b.clientY) / 2 - r.top }; };
  host.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2 || !S.d) return;
    e.stopPropagation();
    const p = tp(e); pinch = { ...p, uz: S.uz };
    canvas.discardActiveObject(); canvas._currentTransform = null; canvas.requestRenderAll();
  }, { capture: true, passive: true });
  host.addEventListener('touchmove', (e) => {
    if (!pinch || e.touches.length !== 2) return;
    e.stopPropagation(); e.preventDefault();
    const p = tp(e);
    zoomAt(pinch.uz * (p.d / pinch.d), p.x, p.y);
    S.px += p.x - pinch.x; S.py += p.y - pinch.y; pinch.x = p.x; pinch.y = p.y; fit();
  }, { capture: true, passive: false });
  host.addEventListener('touchend', (e) => { if (e.touches.length < 2) pinch = null; }, { capture: true });

  async function rebuildKeepSel() { await rebuild(S.side); }
  return api;
}
