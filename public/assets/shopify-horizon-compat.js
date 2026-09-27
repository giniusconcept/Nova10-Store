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

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.dataset.themeStandard = 'shopify-horizon';
    document.documentElement.dataset.themeSource = 'nova10-final';
    document.documentElement.dataset.horizonMotion = 'restored';

    pairs.forEach(setDialogSemantics);
    animateCartCount();
    replaySearchResults();
    setPressedMotion();

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
