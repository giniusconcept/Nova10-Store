/* NOVA10 — Horizon interaction/accessibility/motion compatibility layer */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const pairs = [
    { trigger: '#menuOpen', panel: '#mobileDrawer', close: '#menuClose' },
    { trigger: '#cartOpen', panel: '#cartDrawer', close: '#cartClose' },
    { trigger: '#searchOpen', panel: '#searchPanel', close: '#searchClose' }
  ];

  function focusables(root) {
    return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', root)
      .filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true');
  }

  function sync(pair) {
    const trigger = $(pair.trigger);
    const panel = $(pair.panel);
    if (!trigger || !panel) return;
    const open = panel.classList.contains('open');
    trigger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.toggleAttribute('inert', !open);
    if (open) {
      requestAnimationFrame(() => {
        const preferred = panel.querySelector('input,button,a[href]');
        preferred?.focus({ preventScroll: true });
      });
    }
  }

  function setDialogSemantics(pair) {
    const trigger = $(pair.trigger);
    const panel = $(pair.panel);
    if (!trigger || !panel) return;
    const id = panel.id;
    trigger.setAttribute('aria-controls', id);
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');

    const observer = new MutationObserver(() => sync(pair));
    observer.observe(panel, { attributes: true, attributeFilter: ['class'] });

    panel.addEventListener('keydown', event => {
      if (event.key !== 'Tab' || !panel.classList.contains('open')) return;
      const items = focusables(panel);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function animateCartCount() {
    $$('.cart-count').forEach(el => {
      let previous = el.textContent;
      const observer = new MutationObserver(() => {
        const next = el.textContent;
        if (next === previous || reducedMotion.matches) return;
        previous = next;
        el.classList.remove('horizon-grow');
        void el.offsetWidth;
        el.classList.add('horizon-grow');
        el.addEventListener('animationend', () => el.classList.remove('horizon-grow'), { once: true });
      });
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  function replaySearchResults() {
    const root = $('#searchResults');
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (reducedMotion.matches || !$('#searchPanel')?.classList.contains('open')) return;
      [...root.children].forEach((child, index) => {
        child.style.animation = 'none';
        void child.offsetWidth;
        child.style.animation = '';
        child.style.animationDelay = `${Math.min(index, 7) * 0.03}s`;
      });
    });
    observer.observe(root, { childList: true });
  }

  function setPressedMotion() {
    document.addEventListener('pointerdown', event => {
      const el = event.target.closest('.icon-btn,.drawer-close,.zoom-close,.email-pill button');
      if (!el || reducedMotion.matches) return;
      el.dataset.horizonPressed = 'true';
    });
    const clear = event => {
      const el = event.target?.closest?.('[data-horizon-pressed]');
      if (el) delete el.dataset.horizonPressed;
    };
    document.addEventListener('pointerup', clear);
    document.addEventListener('pointercancel', clear);
  }

  /*
   * The original Horizon archive contains its most visible content motion in
   * product-grid/search/drawer components. Shopify normally activates those
   * effects when a section/component is hydrated or updated. Our independent
   * storefront renders routes with plain JavaScript, so those component hooks
   * do not exist. This adapter re-attaches the same fadeInUp / slide language
   * to the equivalent NOVA10 DOM nodes, including on scroll and route changes.
   */
  function installVisibleMotionStyles() {
    if ($('#nova10-horizon-visible-motion')) return;
    const style = document.createElement('style');
    style.id = 'nova10-horizon-visible-motion';
    style.textContent = `
      @media (prefers-reduced-motion:no-preference){
        .horizon-motion-enter{opacity:0;transform:translateY(10px);will-change:opacity,transform}
        .horizon-motion-enter.horizon-motion-visible{animation:horizon-visible-fade-in-up .42s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--horizon-motion-delay,0ms)}
        .hero-media.horizon-motion-enter{transform:translateY(12px) scale(1.008)}
        .hero-media.horizon-motion-enter.horizon-motion-visible{animation:horizon-visible-hero-in .52s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--horizon-motion-delay,0ms)}
        .announcement.horizon-motion-immediate{animation:horizon-visible-header-in .30s cubic-bezier(.16,1,.3,1) both}
        .site-header.horizon-motion-immediate{animation:horizon-visible-header-in .36s cubic-bezier(.16,1,.3,1) .04s both}
        @keyframes horizon-visible-fade-in-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes horizon-visible-hero-in{from{opacity:0;transform:translateY(12px) scale(1.008)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes horizon-visible-header-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      }
    `;
    document.head.appendChild(style);
  }

  let visibleMotionObserver;

  function getVisibleMotionObserver() {
    if (visibleMotionObserver || reducedMotion.matches) return visibleMotionObserver;
    if (!('IntersectionObserver' in window)) return null;
    visibleMotionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('horizon-motion-visible');
        visibleMotionObserver.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    return visibleMotionObserver;
  }

  function prepareVisibleMotion(root = document) {
    const selectors = [
      '.hero-media',
      '.hero-content > *',
      '.section-head',
      '.collection-card',
      '.product-card',
      '.page-heading > *',
      '.collection-tools',
      '.product-main-image',
      '.product-details > *',
      '.recommendations > h3',
      '.generic-page > *',
      '.contact-intro > *',
      '.contact-form-wrap'
    ].join(',');

    const nodes = $$(selectors, root).filter(el => !el.dataset.horizonMotionPrepared);
    if (!nodes.length) return;

    nodes.forEach((el, index) => {
      el.dataset.horizonMotionPrepared = 'true';
      if (reducedMotion.matches) return;
      el.classList.add('horizon-motion-enter');
      el.style.setProperty('--horizon-motion-delay', `${Math.min(index % 8, 7) * 45}ms`);
      const observer = getVisibleMotionObserver();
      if (observer) observer.observe(el);
      else requestAnimationFrame(() => el.classList.add('horizon-motion-visible'));
    });
  }

  function watchRouteMotion() {
    const app = $('#app');
    if (!app) return;
    prepareVisibleMotion(app);
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => prepareVisibleMotion(app));
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.dataset.themeStandard = 'shopify-horizon';
    document.documentElement.dataset.themeSource = 'nova10-final';
    document.documentElement.dataset.horizonMotion = 'visible-restored';

    installVisibleMotionStyles();
    if (!reducedMotion.matches) {
      $('.announcement')?.classList.add('horizon-motion-immediate');
      $('.site-header')?.classList.add('horizon-motion-immediate');
    }

    pairs.forEach(setDialogSemantics);
    animateCartCount();
    replaySearchResults();
    setPressedMotion();
    watchRouteMotion();

    $$('.cart-count').forEach(el => {
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      for (const pair of pairs) {
        const panel = $(pair.panel);
        const close = $(pair.close);
        const trigger = $(pair.trigger);
        if (panel?.classList.contains('open')) {
          close?.click();
          requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
          break;
        }
      }
    });

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const drawer = link.closest('.drawer');
      if (!drawer?.classList.contains('open')) return;
      const pair = pairs.find(p => $(p.panel) === drawer);
      $(pair?.close)?.click();
    });
  });
})();
