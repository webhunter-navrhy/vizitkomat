// Navigácia, košík v hlavičke, reveal animácie
import { $, $$ } from './util.js';
import { cartCount } from './cart.js';

const nav = $('#nav');
const darkEls = [...document.querySelectorAll('[data-dark]')];
const solid = () => {
  if (!nav) return;
  nav.classList.toggle('is-solid', window.scrollY > 12 || document.body.classList.contains('page-tvorba') || document.body.classList.contains('page-kosik'));
  const y = nav.offsetHeight / 2;
  nav.classList.toggle('is-dark', !nav.classList.contains('menu-open') && darkEls.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; }));
};
solid();
window.addEventListener('scroll', solid, { passive: true });

const burger = $('[data-burger]'), sheet = $('[data-sheet]');
burger?.addEventListener('click', () => {
  const on = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', on); sheet.classList.toggle('on', on); nav.classList.toggle('menu-open', on);
});

function paintCount(bump) {
  const n = cartCount();
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = n; el.hidden = !n;
    if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  });
}
paintCount();
window.addEventListener('vk:cart', () => paintCount(true));
window.addEventListener('storage', () => paintCount());

// reveal
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach((el) => io.observe(el));
export function observeReveal(el) { io.observe(el); }
