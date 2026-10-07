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
}
paintNav();
let navRaf = 0;
window.addEventListener('scroll', () => { if (!navRaf) navRaf = requestAnimationFrame(() => { navRaf = 0; paintNav(); }); }, { passive: true });
window.addEventListener('resize', paintNav);

const burger = document.querySelector('[data-burger]'), sheet = document.querySelector('[data-sheet]');
burger?.addEventListener('click', () => {
  const on = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', on); sheet.classList.toggle('on', on);
});

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
