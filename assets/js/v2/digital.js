// Digitálna vizitka 2.0 – stránka v telefóne: skutočná vizitka (otočí sa), rýchle akcie, kontakt, o mne, služby,
// otváracie hodiny, siete a QR na celú obrazovku. Použitie: /v/<adresa>/, ukážka na webe, náhľad v editore.
import { FONTS, PALETTES, initials, contrast, mix, luminance } from './model.js';
import { TEMPLATES } from './templates.js';

const L = () => (window.VK && window.VK.lang) || 'sk';
const t = (sk, cz) => (L() === 'cz' ? cz : sk);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const I = {
  phone: '<path d="M5.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.5 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.5-3.5-8.5S9.5 6.1 12 3.5Z"/>',
  map: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  nav: '<path d="m3.5 11 17-7.5-7.5 17-2-7.5-7.5-2Z"/>',
  share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>',
  qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 18.5h1.5M18.5 14h2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c.3 2 2.4 4.2 4.6 4.6l1-1.2 1.9.8c-.2 1-1 1.8-2 1.8-3.4 0-6.8-3.3-6.8-6.8 0-1 .8-1.8 1.8-2l.8 1.9-1.3.9Z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  flip: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/>',
  facebook: '<path d="M14.5 8.5H17V4.5h-2.5A4 4 0 0 0 10.5 8.5v2.5H8v4h2.5v6h4v-6H17l.5-4h-3V9a.5.5 0 0 1 .5-.5Z"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5v6M8 7.5v.01M12 16.5v-3.5a2 2 0 0 1 4 0v3.5M12 10.5v6"/>',
  tiktok: '<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.5 2.4 2.2 4 4.5 4.2"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10.5 9.5 4 2.5-4 2.5Z"/>',
};
const ico = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k] || I.web}</svg>`;
const TITLES = /^(ing|mgr|mudr|judr|phdr|mvdr|bc|rndr|paeddr|doc|prof|dr|mba|phd|csc)\.?,?$/i;
const mono = (f) => initials((f.name || '').split(/\s+/).filter((w) => w && !TITLES.test(w)).join(' ') || f.company || '');
const SOC = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube' };

export function vcard(f, url) {
  const [first, ...rest] = (f.name || '').trim().replace(/^(Ing\.|Mgr\.|MUDr\.|JUDr\.|Bc\.|PhDr\.|MVDr\.)\s*/, '').split(/\s+/);
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
 * d – návrh (rovnaký model ako tlačená vizitka): d.f, d.pal, d.fonts, d.photo, d.logo, d.mark, d.socials,
 *     d.digital { bio, services (riadky), hours (riadky), whatsapp }
 * opts.url – verejná adresa · opts.qr(text) → svg · opts.front/back – obrázky vizitky · opts.static – len náhľad
 */
export function renderDigital(host, d, opts = {}) {
  const fp = FONTS[d.fonts] || FONTS[TEMPLATES[d.tpl]?.fonts] || FONTS.instrument;
  const p = d.pal || PALETTES[TEMPLATES[d.tpl]?.pal] || PALETTES.krieda;
  const f = d.f || {}, dg = d.digital || {};
  const dark = luminance(p.bg) < 0.25;
  const accFg = contrast(p.accent, '#FFFFFF') >= contrast(p.accent, '#111111') ? '#FFFFFF' : '#111111';
  const accText = contrast(p.accent, p.bg) >= 3 ? p.accent : p.ink;
  const muted = mix(p.ink, p.bg, 0.42), line = mix(p.ink, p.bg, 0.86), panel = mix(p.ink, p.bg, dark ? 0.93 : 0.955);
  const tel = (f.phone || '').replace(/[^\d+]/g, '');
  const wa = (dg.whatsapp || (dg.whatsappSame !== false ? tel : '')).replace(/[^\d]/g, '');
  const web = f.web ? (/^https?:/.test(f.web) ? f.web : 'https://' + f.web) : '';
  const map = f.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f.address) : '';
  const url = opts.url || '';
  const socials = Object.entries(d.socials || {}).filter(([k, v]) => v && SOC[k]);
  const lines = (s) => String(s || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const services = lines(dg.services), hours = lines(dg.hours);
  const H = opts.heading || 'p';
  const ext = (h) => (/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '');

  const quick = [
    tel && ['phone', t('Zavolať', 'Zavolat'), 'tel:' + tel],
    wa && ['wa', 'WhatsApp', 'https://wa.me/' + wa],
    f.email && ['mail', 'E-mail', 'mailto:' + f.email],
    map ? ['nav', t('Navigovať', 'Navigovat'), map] : web && ['web', 'Web', web],
  ].filter(Boolean);
  const rows = [
    tel && ['phone', t('Telefón', 'Telefon'), f.phone, 'tel:' + tel],
    f.email && ['mail', 'E-mail', f.email, 'mailto:' + f.email],
    web && ['web', 'Web', f.web.replace(/^https?:\/\//, '').replace(/\/$/, ''), web],
    f.address && ['map', t('Adresa', 'Adresa'), f.address, map],
  ].filter(Boolean);

  const mini = `<div class="dc__mini"><span class="dc__mini-m">${d.logo ? `<img src="${d.logo}" alt="">` : d.mark ? `<i style="-webkit-mask-image:url(${d.mark});mask-image:url(${d.mark})"></i>` : esc(mono(f))}</span><b>${esc(f.name || '')}</b><small>${esc(f.role || f.company || '')}</small></div>`;
  const face = (src, cls) => (src ? `<img class="${cls}" src="${src}" alt="">` : '');
  const hasCard = !!opts.front;
  const avatar = d.photo ? `<img src="${d.photo}" alt="">` : d.logo ? `<img class="is-logo" src="${d.logo}" alt="">` : d.mark ? `<i class="is-mark" style="-webkit-mask-image:url(${d.mark});mask-image:url(${d.mark})"></i>` : `<span>${esc(mono(f))}</span>`;

  host.innerHTML = `
  <article class="dc${dark ? ' dc--dark' : ''}${opts.static ? ' dc--static' : ''}" style="--d-bg:${p.bg};--d-ink:${p.ink};--d-acc:${p.accent};--d-acc-fg:${accFg};--d-acc-t:${accText};--d-soft:${p.soft};--d-muted:${muted};--d-line:${line};--d-panel:${panel};--d-fd:'${fp.display}';--d-dw:${fp.dw};--d-ft:'${fp.text}'">
    <div class="dc__top">
      <span class="dc__brand">${esc(f.company || f.name || '')}</span>
      <button class="dc__ibtn" data-dc-share aria-label="${t('Zdieľať', 'Sdílet')}">${ico('share')}</button>
    </div>
    <div class="dc__stage">
      <button class="dc__flip" data-dc-flip aria-label="${t('Otočiť vizitku', 'Otočit vizitku')}">
        <span class="dc__face dc__face--f">${hasCard ? face(opts.front, '') : mini}</span>
        <span class="dc__face dc__face--b">${hasCard && opts.back ? face(opts.back, '') : `<span class="dc__mini dc__mini--b"><b>${esc(f.company || f.name || '')}</b>${f.tagline ? `<small>${esc(f.tagline)}</small>` : ''}</span>`}</span>
      </button>
      <span class="dc__fliphint">${ico('flip')}${t('Ťuknite a vizitka sa otočí', 'Ťukněte a vizitka se otočí')}</span>
    </div>
    <section class="dc__id">
      <div class="dc__av">${avatar}</div>
      <div class="dc__who">
        <${H} class="dc__name">${esc(f.name || '')}</${H}>
        ${f.role ? `<p class="dc__role">${esc(f.role)}</p>` : ''}
        ${f.company && f.company !== f.name ? `<p class="dc__co">${esc(f.company)}</p>` : ''}
      </div>
    </section>
    ${f.tagline ? `<p class="dc__tag">${esc(f.tagline)}</p>` : ''}
    ${quick.length ? `<nav class="dc__quick" style="--n:${quick.length}">${quick.map(([k, label, href]) => `<a href="${href}"${ext(href)}><i>${ico(k)}</i><span>${label}</span></a>`).join('')}</nav>` : ''}
    ${rows.length ? `<section class="dc__sec"><h2>${t('Kontakt', 'Kontakt')}</h2><ul class="dc__rows">${rows.map(([k, lab, v, href]) => `<li><a href="${href}"${ext(href)}><i>${ico(k)}</i><span><small>${lab}</small>${esc(v)}</span><b>${ico('chev')}</b></a></li>`).join('')}</ul></section>` : ''}
    ${dg.bio ? `<section class="dc__sec"><h2>${t('O mne', 'O mně')}</h2><p class="dc__bio">${esc(dg.bio).replace(/\n/g, '<br>')}</p></section>` : ''}
    ${services.length ? `<section class="dc__sec"><h2>${t('Služby', 'Služby')}</h2><ul class="dc__chips">${services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>` : ''}
    ${hours.length ? `<section class="dc__sec"><h2>${t('Otváracie hodiny', 'Otevírací doba')}</h2><ul class="dc__hours">${hours.map((h) => { const m = h.match(/^(.+?):\s+(.+)$/); return m ? `<li><span>${esc(m[1])}</span><b>${esc(m[2])}</b></li>` : `<li><span>${esc(h)}</span></li>`; }).join('')}</ul></section>` : ''}
    ${socials.length ? `<section class="dc__sec"><h2>${t('Sledujte ma', 'Sledujte mě')}</h2><div class="dc__soc">${socials.map(([k, v]) => `<a href="${esc(/^https?:/.test(v) ? v : 'https://' + v)}" target="_blank" rel="noopener" aria-label="${SOC[k]}"><i>${ico(k)}</i><span>${SOC[k]}</span></a>`).join('')}</div></section>` : ''}
    <section class="dc__sec dc__sharebox">
      <div class="dc__qrmini" data-dc-qrmini></div>
      <div><h2>${t('Pošlite ďalej', 'Pošlete dál')}</h2><p>${t('Nechajte ho naskenovať QR kód alebo pošlite odkaz.', 'Nechte ho naskenovat QR kód nebo pošlete odkaz.')}</p>
      <button class="dc__link" data-dc-copy>${ico('copy')}<span>${t('Kopírovať odkaz', 'Kopírovat odkaz')}</span></button></div>
    </section>
    <footer class="dc__foot"><a href="https://vizitkomat.eu" target="_blank" rel="noopener">${t('Digitálna vizitka od', 'Digitální vizitka od')} <b>Vizitkomat</b> · ${t('chcem vlastnú', 'chci vlastní')}</a></footer>
    <div class="dc__bar">
      <button class="dc__save" data-dc-save>${ico('user')}<span>${t('Uložiť kontakt', 'Uložit kontakt')}</span></button>
      <button class="dc__qrbtn" data-dc-qr aria-label="${t('Ukázať QR kód', 'Ukázat QR kód')}">${ico('qr')}</button>
    </div>
    <div class="dc__qrfull" data-dc-qrfull hidden>
      <button class="dc__ibtn dc__close" data-dc-qrclose aria-label="${t('Zavrieť', 'Zavřít')}">${ico('x')}</button>
      <div class="dc__qrcard"><div class="dc__qrbig" data-dc-qrbig></div><b>${esc(f.name || '')}</b><small>${esc(f.role || '')}</small><p>${t('Naskenujte fotoaparátom v telefóne', 'Naskenujte fotoaparátem v telefonu')}</p></div>
    </div>
  </article>`;

  const card = host.querySelector('.dc');
  const link = url || (typeof location !== 'undefined' ? location.href : '');
  const qrMini = card.querySelector('[data-dc-qrmini]');
  if (opts.qr) qrMini.innerHTML = opts.qr(link); else qrMini.remove();
  card.querySelector('[data-dc-flip]').addEventListener('click', () => card.classList.toggle('dc--flipped'));
  if (opts.static) return card;
  card.querySelector('[data-dc-save]').addEventListener('click', () => downloadVCard(f, link));
  const copy = async (btn) => { try { await navigator.clipboard.writeText(link); btn.classList.add('ok'); setTimeout(() => btn.classList.remove('ok'), 1600); } catch (e) { /* nič */ } };
  card.querySelector('[data-dc-copy]').addEventListener('click', (e) => copy(e.currentTarget));
  card.querySelector('[data-dc-share]').addEventListener('click', async (e) => {
    if (navigator.share) { try { await navigator.share({ title: f.name, text: [f.role, f.company].filter(Boolean).join(' · '), url: link }); } catch (x) { /* zrušené */ } } else copy(e.currentTarget);
  });
  const full = card.querySelector('[data-dc-qrfull]');
  card.querySelector('[data-dc-qr]').addEventListener('click', () => { const big = card.querySelector('[data-dc-qrbig]'); if (!big.innerHTML && opts.qr) big.innerHTML = opts.qr(link); full.hidden = false; });
  full.addEventListener('click', (e) => { if (e.target === full || e.target.closest('[data-dc-qrclose]')) full.hidden = true; });
  return card;
}
