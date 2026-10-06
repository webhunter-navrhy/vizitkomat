// Digitálna vizitka – vykreslenie do HTML (telefón, ukážka, /v/…)
import { FONT_PAIRS, TEMPLATES, initials, contrast, mix, luminance } from './card-engine.js';

const L = () => (window.VK && window.VK.lang) || 'sk';
const t = (sk, cz) => (L() === 'cz' ? cz : sk);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const I = {
  phone: '<path d="M5.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.5 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.5-3.5-8.5S9.5 6.1 12 3.5Z"/>',
  map: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>',
  qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 18.5h1.5M18.5 14h2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c.3 2 2.4 4.2 4.6 4.6l1-1.2 1.9.8c-.2 1-1 1.8-2 1.8-3.4 0-6.8-3.3-6.8-6.8 0-1 .8-1.8 1.8-2l.8 1.9-1.3.9Z"/>',
};
const ico = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

export function vcard(f, url) {
  const [first, ...rest] = (f.name || '').trim().split(/\s+/);
  const last = rest.pop() || '';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${last};${first || ''};${rest.join(' ')};;`, `FN:${f.name || ''}`];
  if (f.company) lines.push(`ORG:${f.company}`);
  if (f.role) lines.push(`TITLE:${f.role}`);
  if (f.phone) lines.push(`TEL;TYPE=CELL:${f.phone.replace(/[^\d+]/g, '')}`);
  if (f.email) lines.push(`EMAIL;TYPE=INTERNET:${f.email}`);
  if (f.web) lines.push(`URL:${/^https?:/.test(f.web) ? f.web : 'https://' + f.web}`);
  if (f.address) lines.push(`ADR;TYPE=WORK:;;${f.address};;;;`);
  if (url) lines.push(`NOTE:${t('Digitálna vizitka', 'Digitální vizitka')}: ${url}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}
export function downloadVCard(f, url) {
  const blob = new Blob([vcard(f, url)], { type: 'text/vcard;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (f.name || 'kontakt').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').toLowerCase() + '.vcf';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/**
 * d – návrh (rovnaký model ako tlačená vizitka) + d.digital { photo, socials, slug }
 * opts.url – verejná adresa vizitky, opts.qr – funkcia (text) => svg
 */
export function renderDigital(host, d, opts = {}) {
  const fp = FONT_PAIRS[d.fonts] || FONT_PAIRS[TEMPLATES[d.tpl]?.fonts] || FONT_PAIRS.editorial;
  const p = d.pal, f = d.f, dg = d.digital || {};
  const darkBg = luminance(p.bg) < 0.2;
  const coverFg = contrast(p.accent, '#FFFFFF') >= contrast(p.accent, p.ink) ? '#FFFFFF' : p.ink;
  const muted = mix(p.ink, p.bg, 0.42);
  const line = mix(p.ink, p.bg, 0.88);
  const tel = (f.phone || '').replace(/[^\d+]/g, '');
  const web = f.web ? (/^https?:/.test(f.web) ? f.web : 'https://' + f.web) : '';
  const map = f.address ? 'https://maps.google.com/?q=' + encodeURIComponent(f.address) : '';
  const url = opts.url || '';
  const socials = Object.entries(dg.socials || {}).filter(([, v]) => v);

  const actions = [
    tel && ['phone', t('Zavolať', 'Zavolat'), 'tel:' + tel],
    f.email && ['mail', t('Napísať', 'Napsat'), 'mailto:' + f.email],
    web && ['web', 'Web', web],
    map && ['map', t('Mapa', 'Mapa'), map],
  ].filter(Boolean).slice(0, 4);

  const rows = [
    tel && [t('Telefón', 'Telefon'), f.phone, 'tel:' + tel],
    f.email && ['E-mail', f.email, 'mailto:' + f.email],
    web && ['Web', f.web.replace(/^https?:\/\//, ''), web],
    f.address && [t('Adresa', 'Adresa'), f.address, map],
  ].filter(Boolean);

  const avatar = dg.photo ? `<img src="${dg.photo}" alt="">` : (d.logo && !dg.logoInCover ? `<img class="is-logo" src="${d.logo}" alt="">` : `<span>${esc(initials(f.name))}</span>`);

  host.innerHTML = `
  <article class="dcard${darkBg ? ' dcard--dark' : ''}" style="--d-bg:${p.bg};--d-ink:${p.ink};--d-accent:${p.accent};--d-soft:${p.soft};--d-cover-fg:${coverFg};--d-muted:${muted};--d-line:${line};--d-fd:'${fp.display}';--d-dw:${fp.dw};--d-ft:'${fp.text}'">
    <header class="dcard__cover dcard__cover--${d.tpl}">
      <span class="dcard__brand">${esc(f.company || '')}</span>
      <button class="dcard__icon" data-dc-share aria-label="${t('Zdieľať', 'Sdílet')}">${ico('share')}</button>
    </header>
    <div class="dcard__avatar">${avatar}</div>
    <div class="dcard__head">
      <h1>${esc(f.name)}</h1>
      <p class="dcard__role">${esc(f.role || '')}</p>
      ${f.company ? `<p class="dcard__company">${esc(f.company)}</p>` : ''}
    </div>
    <nav class="dcard__actions">${actions.map(([k, label, href]) => `<a href="${href}" ${k === 'web' || k === 'map' ? 'target="_blank" rel="noopener"' : ''}><i>${ico(k)}</i><span>${label}</span></a>`).join('')}</nav>
    <button class="dcard__save" data-dc-save>${ico('plus')}<span>${t('Uložiť do kontaktov', 'Uložit do kontaktů')}</span></button>
    ${f.tagline ? `<p class="dcard__tag">${esc(f.tagline)}</p>` : ''}
    <ul class="dcard__rows">${rows.map(([k, v, href]) => `<li><span>${k}</span><a href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(v)}</a></li>`).join('')}</ul>
    ${socials.length ? `<div class="dcard__social">${socials.map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${{ instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn' }[k] || esc(k)}</a>`).join('')}</div>` : ''}
    <div class="dcard__share">
      <button data-dc-qr>${ico('qr')}<span>${t('Ukázať QR kód', 'Ukázat QR kód')}</span></button>
      <div class="dcard__qrbox" data-dc-qrbox hidden></div>
    </div>
    <footer class="dcard__foot"><a href="https://vizitkomat.eu" target="_blank" rel="noopener">${t('Vytvorené na', 'Vytvořeno na')} <b>Vizitkomat.eu</b></a></footer>
  </article>`;

  const card = host.querySelector('.dcard');
  if (opts.static) { card.classList.add('dcard--static'); return card; }
  card.querySelector('[data-dc-save]').addEventListener('click', () => downloadVCard(f, url));
  card.querySelector('[data-dc-share]').addEventListener('click', async () => {
    const link = url || location.href;
    if (navigator.share) { try { await navigator.share({ title: f.name, text: f.role, url: link }); } catch (e) { /* zrušené */ } }
    else { try { await navigator.clipboard.writeText(link); card.querySelector('[data-dc-share]').classList.add('ok'); } catch (e) { /* nič */ } }
  });
  const qb = card.querySelector('[data-dc-qrbox]');
  card.querySelector('[data-dc-qr]').addEventListener('click', () => {
    if (!qb.innerHTML && opts.qr) qb.innerHTML = opts.qr(url || location.href);
    qb.hidden = !qb.hidden;
  });
  return card;
}
