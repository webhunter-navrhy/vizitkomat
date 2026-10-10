// Spoločné správanie stránok: navigácia, počítadlo košíka, reveal, toast
import { cartCountFast } from './store.js';

const nav = document.getElementById('nav');
const zones = [...document.querySelectorAll('[data-nav]')];
function paintNav() {
  if (!nav) return;
  const y = nav.offsetHeight / 2;
  let zone = null;
  for (const z of zones) { const r = z.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { zone = z.dataset.nav; break; } }
  nav.classList.toggle('nav--on-blue', zone === 'blue');
  nav.style.setProperty('--nav-bg', zone === 'blue' ? 'var(--cobalt)' : zone === 'ink' ? 'var(--ink)' : zone === 'yellow' ? 'var(--yellow)' : zone === 'coral' ? 'var(--coral)' : 'var(--cream)');
  nav.style.setProperty('--nav-fg', zone === 'blue' || zone === 'ink' || zone === 'coral' ? '#fff' : 'var(--ink)');
  nav.classList.toggle('solid', window.scrollY > 8 || document.body.dataset.solidNav === '1');
  nav.classList.toggle('slim', window.scrollY > 120);
}
paintNav();
let navRaf = 0;
window.addEventListener('scroll', () => { if (!navRaf) navRaf = requestAnimationFrame(() => { navRaf = 0; paintNav(); }); }, { passive: true });
window.addEventListener('resize', paintNav);

const burger = document.querySelector('[data-burger]'), sheet = document.querySelector('[data-sheet]');
function setMenu(on) {
  if (!burger) return;
  burger.setAttribute('aria-expanded', on); sheet.classList.toggle('on', on);
  nav.classList.toggle('menu-on', on); document.body.classList.toggle('menu-on', on);
  if (on) sheet.querySelector('a')?.focus({ preventScroll: true });
}
burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
sheet?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });
matchMedia('(min-width: 1061px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

function paintCount(bump) {
  const n = cartCountFast();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = n; el.hidden = !n;
    if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  });
}
paintCount();
window.addEventListener('vk:cart', () => paintCount(true));
window.addEventListener('storage', () => paintCount());

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));
export function reveal(el) { io.observe(el); }

let toastEl, toastT;
export function toast(msg, action) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.append(toastEl); }
  toastEl.innerHTML = '';
  const s = document.createElement('span'); s.textContent = msg; toastEl.append(s);
  if (action) {
    const a = document.createElement(action.href ? 'a' : 'button');
    if (action.href) a.href = action.href; else a.addEventListener('click', () => { action.onClick(); toastEl.classList.remove('on'); });
    a.textContent = action.label; toastEl.append(a);
  }
  requestAnimationFrame(() => toastEl.classList.add('on'));
  clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), action ? 6000 : 3500);
}

/* ---------- konverzie: rozpracovaná vizitka + lepiace CTA na mobile ---------- */
const PAGE = document.body.className.replace(/.*page-(\S+).*/, '$1');
const tr2 = (sk, cz) => (window.VK?.lang === 'cz' ? cz : sk);
if (!['tvorba', 'kosik', 'objednavka', 'hodnotenie', 'admin', 'v_card'].includes(PAGE)) {
  // pripomenutie rozpracovaného návrhu (uložený v IndexedDB editora)
  import('./store.js').then(async ({ get }) => {
    const s = await get('studio-v2'); if (!s?.d?.f) return;
    let closed = false; try { closed = sessionStorage.getItem('vk2-resume-x') === '1'; } catch (e) { /* nič */ }
    if (closed || cartCountFast()) return;
    const el = document.createElement('div'); el.className = 'resume-pill';
    el.innerHTML = `<a href="${window.VK.links.tvorba}?pokracovat=1"><i></i><span><b>${tr2('Rozpracovaná vizitka', 'Rozpracovaná vizitka')}</b><small></small></span><em>${tr2('Pokračovať', 'Pokračovat')} →</em></a><button aria-label="×">×</button>`;
    el.querySelector('small').textContent = s.d.f.name || '';
    el.querySelector('button').addEventListener('click', () => { el.remove(); try { sessionStorage.setItem('vk2-resume-x', '1'); } catch (e) { /* nič */ } });
    document.body.append(el);
    setTimeout(() => el.classList.add('on'), 1200);
  });
  // lepiace tlačidlo na mobile po odscrollovaní hero
  if (!['404', 'digitalna', 'vlastny', 'kontakt', 'podmienky', 'gdpr', 'cennik'].includes(PAGE)) {
    const bar = document.createElement('a'); bar.className = 'mcta'; bar.href = window.VK.links.tvorba + '?rezim=ai';
    bar.innerHTML = `<span>${tr2('Navrhnúť vizitku', 'Navrhnout vizitku')}</span><small>${tr2('návrh zadarmo, platíte až po kontrole', 'návrh zdarma, platíte až po kontrole')}</small>`;
    document.body.append(bar);
    const hero = document.querySelector('.hero, main section'); let shown = false;
    const upd = () => { const on = window.scrollY > (hero ? hero.offsetHeight * 0.8 : 500) && (window.innerHeight + window.scrollY < document.body.scrollHeight - 420); if (on !== shown) { shown = on; bar.classList.toggle('on', on); } };
    window.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  }
}

/* ---------- právne stránky: obsah s aktívnou kapitolou ---------- */
const legal = document.querySelector('.legal');
if (legal) {
  const hs = [...legal.querySelectorAll('h2')];
  if (hs.length > 3) {
    const toc = document.createElement('nav'); toc.className = 'legal__toc'; toc.setAttribute('aria-label', tr2('Obsah', 'Obsah'));
    toc.innerHTML = `<p>${tr2('Obsah', 'Obsah')}</p>`;
    hs.forEach((h, i) => { h.id ||= 'k' + (i + 1); const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; toc.append(a); });
    legal.classList.add('legal--toc'); legal.prepend(toc);
    const links = [...toc.querySelectorAll('a')];
    const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.hash === '#' + e.target.id)); }), { rootMargin: '-20% 0px -70% 0px' });
    hs.forEach((h) => spy.observe(h));
  }
}
