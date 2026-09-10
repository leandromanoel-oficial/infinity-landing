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
     3. Formulário Ploomes — atribuição de campanha (UTM), origem do CTA
     ------------------------------------------------------------------ */
  const FORM_BASE = 'https://forms.ploomes.com/form/4e3b3aabeecc45ac935a021d79d59610';
  const UTM_KEYS  = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const CLICK_IDS = ['gclid', 'fbclid', 'msclkid'];
  const CAMPAIGN_KEYS = [...UTM_KEYS, ...CLICK_IDS];

  const FIRST_KEY  = 'infinity_utm_first';    // first-touch persistente (localStorage)
  const OPTOUT_KEY = 'infinity_utm_optout';   // oposição do visitante (localStorage)
  const TTL_MS     = 90 * 24 * 60 * 60 * 1000; // 90 dias

  const frame     = $('#ploomes-form');
  const skeleton  = $('#form-skeleton');
  const contextEl = $('#contact-context');

  const store = {
    get(area, key) { try { return JSON.parse(area.getItem(key) || '{}'); } catch { return {}; } },
    set(area, key, value) { try { area.setItem(key, JSON.stringify(value)); } catch { /* modo privado / sem espaço */ } },
    del(area, key) { try { area.removeItem(key); } catch { /* ignore */ } }
  };

  const optedOut = () => { try { return localStorage.getItem(OPTOUT_KEY) === '1'; } catch { return false; } };

  /* Oposição ao tratamento (LGPD Art. 9º/18): apaga a atribuição persistida e
     impede novas gravações. Exposto para o botão da Política de Cookies. */
  window.infinityCampanhaOptOut = () => {
    try { localStorage.setItem(OPTOUT_KEY, '1'); } catch { /* ignore */ }
    store.del(localStorage, FIRST_KEY);
    return true;
  };
  window.infinityCampanhaOptIn = () => { store.del(localStorage, OPTOUT_KEY); return true; };
  window.infinityCampanhaStatus = () => (optedOut() ? 'opt-out' : 'ativo');

  /* Parâmetros de campanha da URL atual (last-touch). */
  const params  = new URLSearchParams(location.search);
  const fromUrl = {};
  CAMPAIGN_KEYS.forEach(k => { const v = params.get(k); if (v) fromUrl[k] = v.slice(0, 180); });

  /* last-touch — escopo de sessão, descartado ao fechar a aba. */
  if (Object.keys(fromUrl).length) {
    store.set(sessionStorage, 'infinity_utm_current', fromUrl);
  }

  /* first-touch — escopo persistente (localStorage), TTL de 90 dias.
     Base legal: legítimo interesse (LGPD Art. 7º, IX) para creditar o lead à
     campanha que o originou, mesmo que ele volte dias depois por acesso direto
     ou orgânico. Não identifica a pessoa, não é cookie de terceiro, não há
     perfil comportamental nem compartilhamento para publicidade. O visitante
     pode se opor pelo link na Política de Cookies (infinityCampanhaOptOut). */
  const now = Date.now();
  let first = store.get(localStorage, FIRST_KEY);
  if (first && first.expires && now > first.expires) {
    first = {};
    store.del(localStorage, FIRST_KEY);
  }
  if (optedOut()) {
    first = {};
    store.del(localStorage, FIRST_KEY);
  } else if (Object.keys(fromUrl).length && !(first && first.params)) {
    first = {
      params:     fromUrl,
      first_seen: new Date(now).toISOString().slice(0, 10),
      referrer:   (document.referrer || '').slice(0, 300),
      expires:    now + TTL_MS
    };
    store.set(localStorage, FIRST_KEY, first);
  }

  const buildFormUrl = (intent = {}) => {
    const q = new URLSearchParams({ iframe: 'true' });
    const current      = store.get(sessionStorage, 'infinity_utm_current');
    const firstParams  = (first && first.params) || {};

    /* Efetivo: last-touch da visita atual; se ausente, o first-touch persistido. */
    CAMPAIGN_KEYS.forEach(k => {
      const v = current[k] || firstParams[k];
      if (v) q.set(k, v);
    });
    /* Snapshot do first-touch, para o CRM distinguir origem inicial x recente. */
    UTM_KEYS.forEach(k => { if (firstParams[k]) q.set(k + '_first', firstParams[k]); });
    if (first && first.first_seen) q.set('utm_first_seen', first.first_seen);
    if (first && first.referrer)   q.set('utm_first_referrer', first.referrer);

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
     6. Oposição à atribuição de campanha — botão da Política de Cookies
     ------------------------------------------------------------------ */
  const optoutBtn = $('#campanha-optout');
  if (optoutBtn) {
    const statusEl = $('#campanha-optout-status');
    const render = () => {
      const off = optedOut();
      optoutBtn.textContent = off
        ? 'Reativar atribuição de campanha'
        : 'Desativar atribuição de campanha neste navegador';
      if (statusEl) {
        statusEl.textContent = off
          ? 'Atribuição de campanha desativada neste navegador. Nenhum dado de origem é guardado.'
          : 'Atribuição de campanha ativa: a origem da sua primeira visita fica guardada por até 90 dias neste navegador.';
      }
    };
    optoutBtn.addEventListener('click', () => {
      if (optedOut()) window.infinityCampanhaOptIn();
      else window.infinityCampanhaOptOut();
      render();
    });
    render();
  }

  /* ---------------------------------------------------------------------
     7. Detalhes
     ------------------------------------------------------------------ */
  const year = $('#ano');
  if (year) year.textContent = String(new Date().getFullYear());
})();
