// Cenník: interaktívny konfigurátor (ceny z VK.prices, rovnaký výpočet ako košík)
import { money, printPrice, addWorkdays, fmtDay, deliveryDays } from '../util.js';
import { tr } from './model.js';

const VK = window.VK, P = VK.prices;
const box = document.querySelector('[data-cfg]');
if (box) {
  const $ = (s) => box.querySelector(s), $$ = (s) => [...box.querySelectorAll(s)];
  const st = { tier: 'std', qty: 250, size: '90x50', corners: 'straight', express: false };
  const TIER = {
    std: { paper: 'matny', finish: 'none', label: tr('matný 350 g', 'matný 350 g') },
    lam: { paper: 'matny', finish: 'matna', label: tr('matný 350 g + laminácia', 'matný 350 g + laminace') },
    soft: { paper: 'matny', finish: 'soft', label: tr('matný 350 g + soft-touch', 'matný 350 g + soft-touch') },
    triplex: { paper: 'triplex', finish: 'none', label: 'Triplex 720 g' },
  };
  const cfg = (o = {}) => { const s = { ...st, ...o }; const t = TIER[s.tier]; return { kind: 'print', size: s.size, qty: s.qty, corners: s.tier === 'triplex' ? 'straight' : s.corners, express: s.express, paper: t.paper, finish: t.finish }; };
  const card = $('[data-cfg-card]');
  let shown = 0;
  function countTo(el, to) {
    const from = shown, t0 = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    const step = (t) => { const k = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3); el.textContent = money(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); else shown = to; };
    requestAnimationFrame(step);
  }
  function paint() {
    const c = cfg(), total = printPrice(c, P);
    $$('[data-k]').forEach((b) => { if (b.type === 'checkbox') { b.checked = st.express; return; } b.setAttribute('aria-checked', String(String(st[b.dataset.k]) === b.dataset.v)); });
    const rb = $('[data-k="corners"][data-v="round"]'); rb.disabled = st.tier === 'triplex'; rb.title = st.tier === 'triplex' ? tr('Triplex len s rovnými rohmi', 'Triplex jen s rovnými rohy') : '';
    if (st.tier === 'triplex') $('[data-k="corners"][data-v="straight"]').setAttribute('aria-checked', 'true'), rb.setAttribute('aria-checked', 'false');
    $$('[data-qp]').forEach((s) => { s.textContent = money(printPrice(cfg({ qty: +s.dataset.qp }), P)); });
    countTo($('[data-cfg-price]'), total);
    $('[data-cfg-per]').textContent = `${money(total / c.qty, { decimals: 2 })} / ${tr('ks', 'ks')}`;
    $('[data-cfg-spec]').textContent = [`${c.qty} ${tr('ks', 'ks')}`, c.size.replace('x', ' × ') + ' mm', TIER[st.tier].label, c.corners === 'round' && tr('zaoblené rohy', 'zaoblené rohy'), c.express && tr('expres', 'expres')].filter(Boolean).join(' · ');
    const now = new Date();
    $('[data-cfg-date]').textContent = `${tr('Doručenie odhadom', 'Doručení odhadem')} ${fmtDay(addWorkdays(now, (now.getHours() >= 14 ? 1 : 0) + deliveryDays(c.express)))}`;
    const q = new URLSearchParams({ rezim: 'ai', papier: c.paper, povrch: c.finish, ks: c.qty, rohy: c.corners });
    $('[data-cfg-go]').href = `${VK.links.tvorba}?${q}`;
    // náhľad: formát, rohy, hrúbka a povrch
    const [w, h] = c.size.split('x').map(Number);
    card.style.setProperty('--ar', `${w} / ${h}`);
    card.style.setProperty('--w', `${Math.round((w / 90) * 100)}%`);
    card.dataset.tier = st.tier; card.dataset.round = c.corners === 'round' ? '1' : '0';
    card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
  }
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-k]'); if (!b || b.disabled) return;
    st[b.dataset.k] = b.dataset.k === 'qty' ? +b.dataset.v : b.dataset.v; paint();
  });
  box.addEventListener('change', (e) => { if (e.target.dataset.k === 'express') { st.express = e.target.checked; paint(); } });
  // šípky v skupinách (radiogroup)
  box.addEventListener('keydown', (e) => {
    const b = e.target.closest('[role="radio"]'); if (!b || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const g = [...b.parentElement.querySelectorAll('[role="radio"]:not([disabled])')], i = g.indexOf(b);
    const n = g[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : g.length - 1)) % g.length];
    e.preventDefault(); n.focus(); n.click();
  });
  paint();
}
