(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const ctaLinks = document.querySelectorAll('.js-cta');
  const form = document.getElementById('ploomes-form');
  const context = document.getElementById('contact-context');

  // Mobile navigation
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  // UTM persistence: first touch + current touch.
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const currentUtm = {};
  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) currentUtm[key] = value;
  });

  if (Object.keys(currentUtm).length) {
    sessionStorage.setItem('infinity_utm_current', JSON.stringify(currentUtm));
    if (!localStorage.getItem('infinity_utm_first')) {
      localStorage.setItem('infinity_utm_first', JSON.stringify(currentUtm));
    }
  }

  const safeParse = (value) => {
    try { return JSON.parse(value || '{}'); } catch { return {}; }
  };

  const updatePloomesUrl = (extra = {}) => {
    if (!form) return;
    const base = 'https://forms.ploomes.com/form/4e3b3aabeecc45ac935a021d79d59610';
    const q = new URLSearchParams();
    q.set('iframe', 'true');

    const first = safeParse(localStorage.getItem('infinity_utm_first'));
    const current = safeParse(sessionStorage.getItem('infinity_utm_current'));

    // Current UTM names remain conventional for easy mapping in Ploomes.
    utmKeys.forEach(key => {
      if (current[key]) q.set(key, current[key]);
    });

    // First-touch attribution is kept under explicit names.
    Object.entries(first).forEach(([key, value]) => q.set(`first_${key}`, value));
    Object.entries(extra).forEach(([key, value]) => value && q.set(key, value));
    q.set('landing_page', 'Infinity System');
    q.set('page_url', window.location.href.split('#')[0]);

    form.src = `${base}?${q.toString()}`;
  };

  updatePloomesUrl();

  // All commercial CTAs converge to the same form, while preserving intent.
  ctaLinks.forEach(link => {
    link.addEventListener('click', () => {
      const plan = link.dataset.plan || '';
      const origin = link.dataset.cta || 'cta';
      const intent = { origem_cta: origin, plano_interesse: plan };
      sessionStorage.setItem('infinity_cta_context', JSON.stringify(intent));
      updatePloomesUrl(intent);

      if (context) {
        context.textContent = plan
          ? `Interesse selecionado: plano ${plan}. O formulário abaixo é o mesmo CTA comercial da página.`
          : 'Fale com um especialista Infinity. O formulário abaixo é o CTA comercial central da página.';
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'infinity_cta_click',
        cta_origin: origin,
        plan_interest: plan || undefined
      });
    });
  });

  // Reveal animations with reduced-motion fallback handled in CSS.
  const elements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -30px 0px' });
    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('is-visible'));
  }
})();
