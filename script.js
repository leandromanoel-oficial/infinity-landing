/* =========================================================================
   Infinity System by Refrisat — comportamento da landing
   ========================================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------------------------------------------------------------------
     1. Menu mobile
     ------------------------------------------------------------------ */
  const toggle = $('.nav-toggle');
  const nav    = $('.main-nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open && window.matchMedia('(max-width:1080px)').matches ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width:1080px)').matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
     2. Header com sombra ao rolar + item ativo na navegação
     ------------------------------------------------------------------ */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const navLinks = $$('.main-nav a[href^="#"]');
  const sections = navLinks
    .map(a => ({ link: a, el: document.getElementById(a.getAttribute('href').slice(1)) }))
    .filter(x => x.el);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const match = sections.find(s => s.el === entry.target);
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.removeAttribute('aria-current'));
          match.link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s.el));
  }

  /* ---------------------------------------------------------------------
     3. Formulário Ploomes — UTMs, origem do CTA e plano de interesse
     ------------------------------------------------------------------ */
  const FORM_BASE = 'https://forms.ploomes.com/form/4e3b3aabeecc45ac935a021d79d59610';
  const UTM_KEYS  = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  const frame     = $('#ploomes-form');
  const skeleton  = $('#form-skeleton');
  const contextEl = $('#contact-context');

  const store = {
    get(area, key) { try { return JSON.parse(area.getItem(key) || '{}'); } catch { return {}; } },
    set(area, key, value) { try { area.setItem(key, JSON.stringify(value)); } catch { /* modo privado */ } }
  };

  /* Captura de UTM — escopo de sessão apenas.
     Nada é gravado em localStorage: o armazenamento persistente exigiria
     banner de consentimento, e a atribuição de primeira origem entre visitas
     foi deliberadamente abandonada em favor de uma página sem banner.
     sessionStorage é descartado ao fechar a aba. */
  const params  = new URLSearchParams(location.search);
  const current = {};
  UTM_KEYS.forEach(k => { const v = params.get(k); if (v) current[k] = v.slice(0, 180); });

  if (Object.keys(current).length) {
    store.set(sessionStorage, 'infinity_utm_current', current);
  }

  const buildFormUrl = (intent = {}) => {
    const q = new URLSearchParams({ iframe: 'true' });
    const cur = store.get(sessionStorage, 'infinity_utm_current');

    UTM_KEYS.forEach(k => { if (cur[k]) q.set(k, cur[k]); });
    Object.entries(intent).forEach(([k, v]) => { if (v) q.set(k, v); });

    q.set('landing_page', 'Infinity System');
    q.set('page_url', location.href.split('#')[0]);
    return `${FORM_BASE}?${q.toString()}`;
  };

  /* O formulário só é recarregado enquanto o visitante ainda não digitou
     nada. Depois disso, trocar o src apagaria o que já foi preenchido —
     esse era o comportamento anterior. */
  let formTouched = false;

  window.addEventListener('blur', () => {
    if (document.activeElement === frame) formTouched = true;
  });

  const syncForm = (intent) => {
    if (!frame || formTouched) return;
    const next = buildFormUrl(intent);
    if (frame.src !== next) frame.src = next;   // evita recarga desnecessária
  };

  if (frame) {
    // Restaura a intenção da sessão (o visitante pode voltar à página).
    syncForm(store.get(sessionStorage, 'infinity_cta_context'));
    frame.addEventListener('load', () => { if (skeleton) skeleton.hidden = true; });
    setTimeout(() => { if (skeleton) skeleton.hidden = true; }, 8000);   // fallback
  }

  /* ---------------------------------------------------------------------
     4. CTAs — todos convergem para o mesmo formulário, preservando a origem
     ------------------------------------------------------------------ */
  $$('.js-cta').forEach(link => {
    link.addEventListener('click', () => {
      const plan   = link.dataset.plan || '';
      const origin = link.dataset.cta  || 'cta';
      const intent = { origem_cta: origin, plano_interesse: plan };

      store.set(sessionStorage, 'infinity_cta_context', intent);
      syncForm(intent);

      if (contextEl) {
        contextEl.textContent = plan
          ? `Interesse registrado: plano ${plan}. Preencha o formulário ao lado e um especialista entra em contato.`
          : 'Preencha o formulário ao lado e um especialista Infinity entra em contato.';
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'infinity_cta_click',
        cta_origin: origin,
        plan_interest: plan || undefined
      });
    });
  });

  /* ---------------------------------------------------------------------
     5. Animação de entrada (respeita prefers-reduced-motion via CSS)
     ------------------------------------------------------------------ */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${Math.min(i, 4) * 60}ms`;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  /* ---------------------------------------------------------------------
     6. Detalhes
     ------------------------------------------------------------------ */
  const year = $('#ano');
  if (year) year.textContent = String(new Date().getFullYear());
})();
