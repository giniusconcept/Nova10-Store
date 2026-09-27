/* NOVA10 Final — source-parity runtime adjustments.
   The exact Shopify export remains the source of truth. */
(() => {
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  function installExactRuntimeStyles(){
    if ($('#nova10-exact-runtime-style')) return;
    const style=document.createElement('style');
    style.id='nova10-exact-runtime-style';
    style.textContent=`
      .hero-frame{min-height:calc(var(--section-height-large) - var(--header-group-h,99px))!important}
      .cookie-customize{width:100%;margin-top:10px;min-height:44px!important;border-radius:10px!important;font-weight:700!important}
      .cookie-preferences{margin-top:16px;padding-top:14px;border-top:1px solid rgba(0,0,0,.15)}
      .cookie-preferences label{display:flex;gap:10px;align-items:flex-start;margin:10px 0;line-height:1.35;letter-spacing:0}
      .cookie-preferences input{margin-top:3px}
      .cookie-preferences .button{width:100%;margin-top:10px;min-height:44px!important;border-radius:10px!important;font-weight:700!important}
      .cookie-note{margin-top:10px!important;font-size:.85rem!important}
      .cookie-manage{position:fixed;left:14px;bottom:14px;z-index:2147482000;border:1px solid rgba(0,0,0,.25);border-radius:999px;background:#fff;color:#111;padding:9px 12px;font:inherit;font-size:.85rem;box-shadow:0 6px 20px rgba(0,0,0,.12);cursor:pointer}
      @media(max-width:749px){
        .footer-info.is-horizon-accordion .footer-menu-title{position:relative;cursor:pointer;padding:10px 28px 10px 0;margin:0;border-bottom:1px solid #DFDFDF}
        .footer-info.is-horizon-accordion .footer-menu-title::after{content:'+';position:absolute;right:2px;top:50%;translate:0 -50%;font-size:20px;font-weight:400}
        .footer-info.is-horizon-accordion.is-open .footer-menu-title::after{content:'−'}
        .footer-info.is-horizon-accordion .footer-links{display:none;padding-top:14px}
        .footer-info.is-horizon-accordion.is-open .footer-links{display:grid}
      }
    `;
    document.head.appendChild(style);
  }

  function syncHeaderHeight(){
    const announcement=$('.announcement');
    const header=$('.site-header');
    const total=(announcement?.offsetHeight||39)+(header?.offsetHeight||60);
    document.documentElement.style.setProperty('--header-group-h',`${total}px`);
  }

  function normalizeRenderedStorefront(){
    $$('.sold-chip').forEach(el=>{ if(el.textContent.trim()!=='Épuisé') el.textContent='Épuisé'; });

    /* Shopify hides accelerated checkout whenever the selected variant cannot be added. */
    $$('.product-page .accelerated').forEach(el=>{ el.hidden=true; el.style.display='none'; });

    /* The source theme has no configured card hover effect. */
    $$('.product-card,.collection-card').forEach(el=>el.dataset.horizonHover='none');
  }

  function installFooterAccordion(){
    const info=$('.footer-info');
    const title=$('.footer-menu-title');
    if(!info||!title||title.dataset.horizonAccordion==='true') return;
    title.dataset.horizonAccordion='true';
    title.setAttribute('role','button');
    title.setAttribute('tabindex','0');
    title.setAttribute('aria-expanded','false');
    info.classList.add('is-horizon-accordion');
    const toggle=()=>{
      if(!matchMedia('(max-width:749px)').matches) return;
      const open=info.classList.toggle('is-open');
      title.setAttribute('aria-expanded',String(open));
    };
    title.addEventListener('click',toggle);
    title.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  }

  function installConsentParity(){
    const banner=$('#cookieBanner');
    const customize=$('#cookieCustomize');
    const prefs=$('#cookiePreferences');
    const save=$('#cookieSave');
    const manage=$('#cookieManage');
    if(!banner||!customize||!prefs||!manage) return;

    const hasChoice=()=>Boolean(localStorage.getItem('nova10-consent'));
    const show=(custom=false)=>{
      banner.classList.remove('hidden');
      manage.classList.add('hidden');
      prefs.classList.toggle('hidden',!custom);
      customize.setAttribute('aria-expanded',String(custom));
    };
    const hide=()=>{
      banner.classList.add('hidden');
      manage.classList.remove('hidden');
    };

    customize.setAttribute('aria-expanded','false');
    customize.addEventListener('click',()=>show(prefs.classList.contains('hidden')));
    manage.addEventListener('click',()=>show(true));
    save?.addEventListener('click',()=>{
      const state={
        analytics:$('#cookieAnalytics')?.checked===true,
        preferences:$('#cookiePrefs')?.checked===true,
        marketing:$('#cookieMarketing')?.checked===true
      };
      localStorage.setItem('nova10-consent-detail',JSON.stringify(state));
      localStorage.setItem('nova10-consent',state.analytics?'analytics':'essential');
      hide();
    });
    $$('[data-consent]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(hide,0)));

    if(hasChoice()) hide();
  }

  function installMutationParity(){
    const app=$('#app');
    if(!app) return;
    const observer=new MutationObserver(()=>normalizeRenderedStorefront());
    observer.observe(app,{childList:true,subtree:true});
  }

  function boot(){
    installExactRuntimeStyles();
    syncHeaderHeight();
    installFooterAccordion();
    installConsentParity();
    installMutationParity();
    normalizeRenderedStorefront();
    window.addEventListener('resize',syncHeaderHeight,{passive:true});
    window.addEventListener('hashchange',()=>requestAnimationFrame(normalizeRenderedStorefront));
    document.documentElement.dataset.nova10ExactTheme='NOVA10-Final-Horizon-490-files';
    document.documentElement.dataset.nova10ParityRuntime='2.0.0';
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
