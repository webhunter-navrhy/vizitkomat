// Vizitkomat v2 – editor vizitky (Fabric.js): úpravy priamo vo vizitke
import { SIZES, BLEED, SAFE, K, FONTS, PALETTES, newDesign, contrast, mix } from './model.js';
import { layout, templateDefaults, TEMPLATES } from './templates.js';
import { buildSide, toFabric, loadFonts, snapshot as snap, paint } from './render.js';
import { iconSVG } from '../icons.js';

const F = () => window.fabric;
const PROPS = ['data', 'selectable', 'evented', 'hasControls', 'lockMovementX', 'lockMovementY', 'globalCompositeOperation', 'cropX', 'cropY', 'objectCaching'];
const clone = (o) => JSON.parse(JSON.stringify(o));

export function createEditor(el, host, opts = {}) {
  const fab = F();
  // Fabric 5.3 – ticho pre neplatný textBaseline
  const canvas = new fab.Canvas(el, { preserveObjectStacking: true, selectionColor: 'rgba(36,64,230,.08)', selectionBorderColor: '#2440E6', selectionLineWidth: 1.5, stopContextMenu: true, fireRightClick: false, targetFindTolerance: 6, controlsAboveOverlay: true });
  fab.Object.prototype.set({ borderColor: '#2440E6', cornerColor: '#FFFFFF', cornerStrokeColor: '#2440E6', cornerStyle: 'circle', cornerSize: 11, transparentCorners: false, borderScaleFactor: 1.6, padding: 4 });
  fab.Textbox.prototype.set?.({ objectCaching: false });

  const S = {
    d: null, side: 'front', sides: { front: null, back: null }, custom: { front: false, back: false },
    zoom: 1, base: 1, uz: 1, px: 0, py: 0, hover: null, guides: true, marks: false, history: [], future: [], busy: false, listeners: {}, clip: null,
  };
  const emit = (ev, x) => (S.listeners[ev] || []).forEach((fn) => fn(x));
  const size = () => SIZES[S.d.size] || SIZES['90x50'];
  const Wt = () => (size().w + 2 * BLEED) * K, Ht = () => (size().h + 2 * BLEED) * K;

  // ---------- veľkosť a zoom ----------
  // plátno vypĺňa celú plochu, vizitka pláva v strede so skutočným tieňom; zoom a posun cez viewport
  function fit() {
    if (!S.d) return;
    const r = host.getBoundingClientRect();
    const W = Math.floor(r.width), H = Math.floor(r.height);
    if (W < 40 || H < 40) return;
    const pad = Math.min(opts.pad ?? 48, W * 0.07, H * 0.12);
    S.base = Math.max(0.15, Math.min((W - 2 * pad) / Wt(), (H - 2 * pad) / Ht(), 3));
    const z = S.base * S.uz;
    S.zoom = z;
    // posun len keď je vizitka väčšia ako plocha
    const mx = Math.max(0, (Wt() * z - W) / 2 + 60), my = Math.max(0, (Ht() * z - H) / 2 + 60);
    S.px = Math.max(-mx, Math.min(mx, S.px)); S.py = Math.max(-my, Math.min(my, S.py));
    if (canvas.width !== W || canvas.height !== H) canvas.setDimensions({ width: W, height: H });
    canvas.setViewportTransform([z, 0, 0, z, (W - Wt() * z) / 2 + S.px, (H - Ht() * z) / 2 + S.py]);
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
    S.py = cy - sy * z - (Math.floor(r.height) - Ht() * z) / 2;
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
  });
  canvas.on('mouse:up', () => { if (liveGuides.length) { liveGuides = []; canvas.requestRenderAll(); } });

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
  canvas.on('mouse:down', () => { if (S.hover) { S.hover = null; } emit('interact'); });
  canvas.on('selection:created', () => emit('selection', canvas.getActiveObject()));
  canvas.on('selection:updated', () => emit('selection', canvas.getActiveObject()));
  canvas.on('selection:cleared', () => emit('selection', null));
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
    };
    if (now) run(); else commitT = setTimeout(run, 250);
  }
  async function restore(st) {
    S.d = clone(st.d); S.sides = clone(st.sides); S.custom = { ...st.custom }; S.side = st.side;
    await loadSide(S.side, true);
    emit('restore', api); emit('change', api);
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
      if (tok !== loadTok) return;
      canvas.discardActiveObject();
      canvas.clear(); fit();
      await new Promise((res) => canvas.loadFromJSON(json, res));
      canvas.getObjects().forEach((o) => { if (o.data && o.data.bg) o.set({ selectable: false, evented: false }); if (o.type === 'i-text') o.set('objectCaching', false); });
    } else {
      const { bg, objs: fo } = await buildSide(S.d, side);
      if (tok !== loadTok) return;
      objs = [...bg, ...fo];
      const sel = canvas.getActiveObject();
      canvas.discardActiveObject();
      canvas.renderOnAddRemove = false;
      canvas.clear(); fit();
      objs.forEach((o) => canvas.add(o));
      canvas.renderOnAddRemove = true;
      void sel;
    }
    S.side = side;
    canvas.requestRenderAll();
    S.busy = false;
    saveSide();
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
      const old = S.d.pal || PALETTES[TEMPLATES[S.d.tpl].pal];
      S.d.pal = { ...pal };
      for (const side of ['front', 'back']) {
        if (!S.custom[side]) { if (side === S.side) await rebuild(side); else S.sides[side] = null; continue; }
        const map = {}; ['bg', 'ink', 'accent', 'soft'].forEach((k) => { if (old[k]) map[old[k].toLowerCase()] = pal[k]; });
        const recolor = (o) => { ['fill', 'stroke'].forEach((p) => { if (typeof o[p] === 'string' && map[o[p].toLowerCase()]) o[p] = map[o[p].toLowerCase()]; }); (o.objects || []).forEach(recolor); };
        if (side === S.side) { canvas.getObjects().forEach((o) => { recolor(o); o.dirty = true; }); canvas.requestRenderAll(); saveSide(); }
        else if (S.sides[side]) (S.sides[side].objects || []).forEach(recolor);
      }
      commit(true);
    },
    async setFonts(key) {
      const oldFp = FONTS[S.d.fonts || TEMPLATES[S.d.tpl].fonts], fp = FONTS[key];
      S.d.fonts = key;
      for (const side of ['front', 'back']) {
        if (!S.custom[side]) { if (side === S.side) await rebuild(side); else S.sides[side] = null; continue; }
        const swap = (o) => { if (o.fontFamily === oldFp.display) { o.fontFamily = fp.display; o.fontWeight = fp.dw; } else if (o.fontFamily === oldFp.text) o.fontFamily = fp.text; (o.objects || []).forEach(swap); };
        if (side === S.side) { await loadFonts([`${fp.dw} 40px "${fp.display}"`, `italic ${fp.dw} 40px "${fp.display}"`, `${fp.tw} 40px "${fp.text}"`, `${fp.tw2} 40px "${fp.text}"`]); canvas.getObjects().forEach((o) => { swap(o); o.dirty = true; o.initDimensions && o.initDimensions(); }); canvas.requestRenderAll(); saveSide(); }
        else if (S.sides[side]) (S.sides[side].objects || []).forEach(swap);
      }
      commit(true);
    },
    async setArt(art) { S.d.art = art; await rebuildAll(); commit(true); },
    async setLogo(src) { S.d.logo = src; await rebuildAll(); commit(true); },
    async setSize(sz) { S.d.size = sz; await rebuildAll(); fit(); commit(true); },
    async setCorners(c) { S.d.corners = c; applyClip(); canvas.requestRenderAll(); },
    async setBack(key) { S.d.back = key; S.custom.back = false; S.sides.back = null; if (S.side === 'back') await loadSide('back'); else await api.setSide('back'); commit(true); },
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
    setBg(color) {
      const bg = canvas.getObjects().find((o) => o.data && o.data.kind === 'bg');
      if (bg) { bg.set('fill', color); S.custom[S.side] = true; canvas.requestRenderAll(); commit(); }
    },

    // ---------- pridávanie ----------
    async add(kind, extra = {}) {
      const lay = layout(S.d, S.side); const sz = size(); const pal = lay.pal;
      let spec;
      if (kind === 'heading') spec = { type: 'text', text: extra.text || 'Nadpis', x: sz.w / 2, y: sz.h / 2, ox: 'center', oy: 'center', size: 5, font: 'd', color: pal.ink };
      else if (kind === 'text') spec = { type: 'text', text: extra.text || 'Text', x: sz.w / 2, y: sz.h / 2, ox: 'center', oy: 'center', size: 2.2, font: 't', color: pal.ink };
      else if (kind === 'rect') spec = { type: 'rect', x: sz.w / 2 - 8, y: sz.h / 2 - 5, w: 16, h: 10, fill: pal.accent };
      else if (kind === 'circle') spec = { type: 'circle', x: sz.w / 2, y: sz.h / 2, r: 6, fill: pal.accent };
      else if (kind === 'line') spec = { type: 'line', x1: sz.w / 2 - 10, y1: sz.h / 2, x2: sz.w / 2 + 10, y2: sz.h / 2, stroke: pal.ink, sw: 0.25 };
      else if (kind === 'icon') spec = { type: 'icon', name: extra.name || 'star', x: sz.w / 2 - 3, y: sz.h / 2 - 3, s: 6, color: pal.accent };
      else if (kind === 'qr') spec = { type: 'qr', x: sz.w / 2 - 9, y: sz.h / 2 - 9, s: 18, color: pal.ink };
      else if (kind === 'image') spec = { type: 'image', src: extra.src, x: sz.w / 2 - 12, y: sz.h / 2 - 9, w: 24, h: 18, fit: 'contain', role: extra.role || 'image' };
      const o = await toFabric(spec, lay, { qr: S.d.qrUrl });
      if (!o) return;
      if (spec.type === 'text') { await loadFonts([`${o.fontWeight} 40px "${o.fontFamily}"`]); o.initDimensions(); }
      canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll();
      S.custom[S.side] = true; commit();
      emit('selection', o);
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
        if (p.color) { const pc = paint(p.color); if (t.type === 'group') t.getObjects().forEach((x) => { if (x.stroke && x.stroke !== 'none') x.set('stroke', pc); if (x.fill && x.fill !== 'none' && x.fill !== 'transparent') x.set('fill', pc); }); else if (t.type === 'line') t.set('stroke', pc); else t.set('fill', pc); delete p.color; }
        if (p.upper != null) { t.set('text', p.upper ? t.text.toLocaleUpperCase() : t.text); t.data = { ...t.data, upper: p.upper }; delete p.upper; }
        if (p.textAlign) { const br = t.getBoundingRect(true, true); t.set({ textAlign: p.textAlign }); delete p.textAlign; void br; }
        t.set(p);
        if (t.initDimensions) t.initDimensions();
        t.setCoords(); t.dirty = true;
      }
      canvas.requestRenderAll(); S.custom[S.side] = true; commit();
      emit('selection', o);
    },
    async remove() {
      const o = canvas.getActiveObject(); if (!o || o.isEditing) return;
      (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach((x) => canvas.remove(x));
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
    nudge(dx, dy) { const o = canvas.getActiveObject(); if (!o || o.isEditing) return; o.left += dx; o.top += dy; o.setCoords(); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); },
    copy() { const o = canvas.getActiveObject(); if (o) o.clone((c) => { S.clip = c; }, PROPS); },
    paste() { if (!S.clip) return; S.clip.clone((c) => { c.set({ left: c.left + 3 * K, top: c.top + 3 * K }); canvas.add(c); canvas.setActiveObject(c); canvas.requestRenderAll(); S.custom[S.side] = true; commit(); }, PROPS); },

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
    else if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); api.duplicate(); }
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
