// Homepage – jednoduchá verzia: rýchly štart + pás hotových vizitiek
const VK = window.VK;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const lazy = (el, fn, margin = '400px') => { if (!el) return; const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin }); io.observe(el); };

/* ---------- rýchly štart: meno + odbor → tvorba ---------- */
$$('[data-qs]').forEach((f) => f.addEventListener('submit', (e) => {
  const [m, o] = [f.elements.meno, f.elements.odbor];
  m.value = m.value.trim(); o.value = o.value.trim();
  if (!m.value && !o.value) { e.preventDefault(); m.focus(); return; }
  // prázdne polia do adresy nedávame
  [m, o].forEach((i) => { i.disabled = !i.value; });
  VK.ev?.('quick_start', true);
  setTimeout(() => [m, o].forEach((i) => { i.disabled = false; }), 0);
}));

/* ---------- pás hotových vizitiek (výber grafika) ---------- */
lazy($('.tpls'), async () => {
  const [{ ORDER }, { TPL_PERSONA, personaLabel }] = await Promise.all([import('./featured.js'), import('./personas.js')]);
  const ids = ORDER.filter((id) => VK.pre['tpl-' + id + '-f']).slice(0, 14);
  const TILT = [-2.5, 1.8, -1.2, 2.6, -1.9, 1.1];
  const items = [...ids, ...ids];
  $('[data-row="0"]').innerHTML = items.map((id, k) => {
    const f = VK.pre['tpl-' + id + '-f'], b = VK.pre['tpl-' + id + '-b'] || '';
    const dup = k >= ids.length ? ' aria-hidden="true" tabindex="-1"' : '';
    const role = personaLabel(TPL_PERSONA[id] || 'arch');
    return `<a class="tc2" href="${VK.links.tvorba}?sablona=${id}" data-t="${id}" style="--r:${TILT[k % TILT.length]}deg"${dup}><span class="tc2__stack">${b ? `<img class="tc2__b" alt="" src="${b}" loading="lazy" decoding="async">` : ''}<img class="tc2__f" alt="${role}" src="${f}" loading="lazy" decoding="async"></span><span class="tc2__cap"><b>${role}</b></span></a>`;
  }).join('');
}, '600px');
$('[data-tpl-rows]')?.addEventListener('click', (e) => { if (e.target.closest('[data-t]')) VK.ev?.('tpl_click', true); });
