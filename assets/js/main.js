/* =========================================================
   RAVA DESIGN + BUILD — interactions
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = {
    phone: '+15088165070',
    // Optional: paste a form endpoint (Formspree, Web3Forms, Getform…) to receive requests by email.
    // While empty, the form opens a pre-filled text message to the phone number above.
    formEndpoint: ''
  };

  window.__ravaReady = true;

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => innerWidth > 900;

  /* ---------------- i18n ---------------- */
  const dict = window.RAVA_I18N || {};
  const en = Object.assign({}, dict.en);
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (!(k in en)) en[k] = el.innerHTML; });
  let lang = 'en';
  const t = k => (dict[lang] && dict[lang][k]) || en[k] || '';

  function setLang(l, save = true) {
    lang = ['en', 'es', 'pt'].includes(l) ? l : 'en';
    root.lang = lang === 'pt' ? 'pt-BR' : lang;
    $$('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (v && el.innerHTML !== v) el.innerHTML = v; });
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.title = t('js.title');
    if (save) { try { localStorage.setItem('rava-lang', lang); } catch (e) { /* storage unavailable */ } }
    splitScrub();
    layout();
  }

  function initialLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q) return q;
    try { const s = localStorage.getItem('rava-lang'); if (s) return s; } catch (e) { /* ignore */ }
    const n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return ['es', 'pt'].includes(n) ? n : 'en';
  }

  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------------- Statement word split ---------------- */
  const scrubEl = $('[data-scrub]');
  let words = [];
  function splitScrub() {
    if (!scrubEl) return;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(scrubEl);
    words = $$('.w', scrubEl);
    lastOn = -1;
  }

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.15, easing: x => Math.min(1, 1.001 - Math.pow(2, -10 * x)), smoothWheel: true });
  }
  const lock = on => {
    document.body.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };
  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
    else if (typeof target === 'number') scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------------- Opening sequence ---------------- */
  const pre = $('.preloader');
  function revealSite() { root.classList.add('is-loaded'); }

  function intro() {
    if (!pre || reduce) { if (pre) pre.classList.add('is-gone'); revealSite(); return; }
    // Visitors arriving on a section link (e.g. an ad pointing to /#flooring) get the short intro.
    const target = location.hash.length > 1 ? $(location.hash) : null;
    let fast = !!target;
    try { fast = fast || sessionStorage.getItem('rava-intro') === '1'; sessionStorage.setItem('rava-intro', '1'); } catch (e) { /* ignore */ }
    if (fast) root.classList.add('intro-fast');
    lock(true);

    const dur = fast ? 900 : 2700;
    const countEl = $('.js-count');
    const bar = $('.preloader__bar');
    const heroImg = $('.arch img');
    const imgReady = new Promise(res => {
      if (!heroImg || heroImg.complete) return res();
      heroImg.addEventListener('load', res, { once: true });
      heroImg.addEventListener('error', res, { once: true });
      setTimeout(res, 3500);
    });
    const t0 = performance.now();
    const counted = new Promise(res => {
      (function tick(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        countEl.textContent = Math.round(e * 100);
        bar.style.setProperty('--p', e);
        p < 1 ? requestAnimationFrame(tick) : res();
      })(t0);
    });

    Promise.all([counted, imgReady]).then(() => {
      pre.classList.add('is-out');
      setTimeout(revealSite, 650);
      setTimeout(() => {
        pre.classList.add('is-gone'); lock(false);
        if (target) { layout(); scrollToTarget(target); }
      }, 1700);
    });
  }

  /* ---------------- Nav ---------------- */
  const nav = $('.nav');
  const burger = $('.burger');
  const menu = $('#menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    lock(open);
  }
  burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    [['city', a.dataset.city], ['project', a.dataset.project]].forEach(([name, val]) => {
      if (!val) return;
      const sel = $(`select[name="${name}"]`);
      sel.value = val; sel.classList.add('has-value');
    });
    if (root.classList.contains('menu-open')) { setMenu(false); setTimeout(() => scrollToTarget(target), 350); }
    else scrollToTarget(target);
  });

  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(x => {
      if (!x.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + x.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------------- Reveal on scroll ----------------
     Checked with getBoundingClientRect in the scroll loop: clip-path reveals start fully
     clipped, which IntersectionObserver would report as never intersecting. */
  let pending = $$('[data-reveal]');
  function reveals(vh) {
    if (!pending.length) return;
    pending = pending.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('is-in'); return false; }
      return true;
    });
  }

  /* ---------------- Scroll-driven effects ---------------- */
  const progress = $('.progress span');
  const fab = $('.fab');
  const parallax = $$('[data-parallax]');
  const work = $('.work');
  const track = $('.work__track');
  const workN = $('.js-work-n');
  const workBar = $('.work__bar i');
  const workCount = $$('.work__item').length;
  const steps = $('.steps');
  const stepItems = $$('.step');
  const rail = $('.steps__rail i');
  let lastY = -1, lastW = 0, lastOn = -1, navY = 0;

  function layout() {
    if (!work || !track) return;
    if (desktop()) {
      track.style.width = 'max-content';
      const dist = Math.max(0, track.offsetWidth - innerWidth);
      work.style.height = (dist + innerHeight) + 'px';
      work.dataset.dist = dist;
    } else {
      track.style.width = '';
      work.style.height = '';
      track.style.transform = '';
    }
    lastY = -1;
  }

  function update() {
    const y = lenis ? lenis.scroll : scrollY;
    if (y === lastY && innerWidth === lastW) return;
    lastY = y; lastW = innerWidth;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    reveals(vh);
    fab.classList.toggle('is-on', y > vh * 0.85 && y < max - 260);

    if (!root.classList.contains('menu-open')) {
      nav.classList.toggle('is-scrolled', y > 40);
      if (y > navY + 6 && y > 500) nav.classList.add('is-hidden');
      else if (y < navY - 6 || y < 500) nav.classList.remove('is-hidden');
      navY = y;
    }

    if (!reduce) {
      parallax.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(img.dataset.parallax);
        img.style.translate = `0 ${off.toFixed(1)}px`;
      });
    }

    if (work && desktop()) {
      const r = work.getBoundingClientRect();
      const dist = +work.dataset.dist || 0;
      const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      workBar.style.transform = `scaleX(${p})`;
      workN.textContent = String(clamp(Math.floor(p * workCount) + 1, 1, workCount)).padStart(2, '0');
    }

    if (scrubEl && words.length) {
      const r = scrubEl.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
      const on = Math.round(p * words.length);
      if (on !== lastOn) { words.forEach((w, i) => w.classList.toggle('on', i < on)); lastOn = on; }
    }

    if (steps) {
      const r = steps.getBoundingClientRect();
      rail.style.transform = `scaleY(${clamp((vh * 0.6 - r.top) / r.height, 0, 1)})`;
      stepItems.forEach(s => s.classList.toggle('is-active', s.getBoundingClientRect().top < vh * 0.6));
    }
  }

  function frame(time) {
    if (lenis) lenis.raf(time);
    update();
    requestAnimationFrame(frame);
  }

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  addEventListener('load', layout);

  /* ---------------- Cursor, magnetic, spotlight ---------------- */
  if (fine) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      cursor.classList.remove('is-hidden');
    });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      const view = e.target.closest('[data-cursor="view"]');
      const hover = e.target.closest('a, button, select, input, textarea, label, .card');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-hover', !view && !!hover);
      if (view) label.textContent = t('js.view');
    });

    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    $$('.card').forEach(c => c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
  }

  /* ---------------- Lightbox ---------------- */
  const lb = $('.lightbox');
  const lbImg = $('img', lb);
  const lbCap = $('figcaption', lb);
  const items = $$('.work__item');
  let idx = 0;
  function show(i) {
    idx = (i + items.length) % items.length;
    const img = $('img', items[idx]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = $('h3', items[idx]).textContent;
  }
  function openLb(i) { show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lock(true); $('.lightbox__close').focus(); }
  function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lock(false); }
  items.forEach((it, i) => {
    it.setAttribute('tabindex', '0');
    it.addEventListener('click', () => openLb(i));
    it.addEventListener('keydown', e => { if (e.key === 'Enter') openLb(i); });
  });
  $('.lightbox__close').addEventListener('click', closeLb);
  $('.lightbox__nav--prev').addEventListener('click', () => show(idx - 1));
  $('.lightbox__nav--next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });

  /* ---------------- Contact form ---------------- */
  const form = $('.form');
  const success = $('.form-success');
  $$('select', form).forEach(s => s.addEventListener('change', () => s.classList.toggle('has-value', !!s.value)));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const bad = [];
    if (!data.name || data.name.trim().length < 2) bad.push('name');
    if (!data.phone || data.phone.replace(/\D/g, '').length < 7) bad.push('phone');
    $$('.field', form).forEach(f => f.classList.remove('is-invalid'));
    if (bad.length) {
      bad.forEach(n => form.elements[n].closest('.field').classList.add('is-invalid'));
      form.elements[bad[0]].focus();
      return;
    }

    const projectSel = form.elements.project;
    const projectLabel = projectSel.value ? projectSel.options[projectSel.selectedIndex].text : '';
    const lines = [
      t('js.smsHead'),
      `${t('js.name')}: ${data.name.trim()}`,
      `${t('js.phone')}: ${data.phone.trim()}`,
      data.email && `${t('js.email')}: ${data.email.trim()}`,
      data.city && `${t('js.city')}: ${data.city}`,
      projectLabel && `${t('js.project')}: ${projectLabel}`,
      data.message && `${t('js.message')}: ${data.message.trim()}`
    ].filter(Boolean);

    let sent = false;
    if (CONFIG.formEndpoint) {
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, project: projectLabel, language: lang, _subject: t('js.smsHead') })
        });
        sent = res.ok;
      } catch (err) { sent = false; }
    }
    if (!sent) location.href = `sms:${CONFIG.phone}?&body=${encodeURIComponent(lines.join('\n'))}`;

    form.hidden = true;
    success.hidden = false;
  });

  /* ---------------- Misc ---------------- */
  const year = $('.js-year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------- Boot ---------------- */
  setLang(initialLang(), false);
  layout();
  requestAnimationFrame(frame);
  intro();
})();
