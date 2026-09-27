/* NOVA10 Horizon parity runtime
 * Source of truth: exported NOVA10 Final / Shopify Horizon theme.
 * Goal: reproduce shopper-visible Horizon motion and interaction semantics
 * while routing commerce/data to NOVA10's independent backend.
 */
(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const supportsViewTransition = typeof document.startViewTransition === 'function';

  const SETTINGS = Object.freeze({
    source: 'NOVA10 Final',
    preset: 'Horizon',
    exportedThemeFiles: 490,
    stickyHeader: 'always',
    announcementSpeedSeconds: 5,
    cardHoverEffect: 'none',
    pageTransitionEnabled: false,
    transitionToMainProduct: false,
    motion: {
      fast: 62.5,
      normal: 125,
      medium: 150,
      slow: 200,
      easing: 'ease-in-out',
      fadeIn: 'cubic-bezier(.16,1,.3,1)',
      fadeOut: 'cubic-bezier(.4,0,.2,1)',
      bounce: 'cubic-bezier(.34,1.56,.64,1)'
    }
  });

  window.NOVA10_HORIZON = {
    version: 'parity-runtime-1.0.0',
    settings: SETTINGS,
    reducedMotion: reduce.matches,
    supportsViewTransition,
    modules: {
      baseMotion: true,
      scrollContainer: true,
      stickyHeader: true,
      drawer: true,
      predictiveSearch: true,
      productGridReveal: true,
      productCard: true,
      flyToCart: true,
      mediaZoom: true,
      stickyAddToCart: true,
      announcementBar: true,
      slideshow: true,
      marquee: true,
      focusManagement: true,
      scrollRestoration: true,
      pageViewTransitionsEngine: supportsViewTransition,
      pageViewTransitionsActive: SETTINGS.pageTransitionEnabled,
      productImageTransitionsActive: SETTINGS.transitionToMainProduct
    }
  };

  function injectStyles() {
    if ($('#nova10-horizon-parity-styles')) return;
    const style = document.createElement('style');
    style.id = 'nova10-horizon-parity-styles';
    style.textContent = `
      :root{
        --animation-speed-fast:.0625s;
        --animation-speed:.125s;
        --animation-speed-medium:.15s;
        --animation-speed-slow:.2s;
        --animation-easing:ease-in-out;
        --animation-timing-bounce:cubic-bezier(.34,1.56,.64,1);
        --animation-timing-default:cubic-bezier(0,0,.2,1);
        --animation-timing-fade-in:cubic-bezier(.16,1,.3,1);
        --animation-timing-fade-out:cubic-bezier(.4,0,.2,1);
        --drawer-animation-speed:.2s;
        --horizon-padding-sm:8px;
      }

      @keyframes horizon-grow{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
      @keyframes horizon-move-and-fade{from{transform:translate(var(--start-x,0),var(--start-y,0));opacity:var(--start-opacity,0)}to{transform:translate(var(--end-x,0),var(--end-y,0));opacity:var(--end-opacity,1)}}
      @keyframes horizon-element-slide-in-top{from{margin-top:var(--horizon-padding-sm);opacity:0}to{margin-top:0;opacity:1}}
      @keyframes horizon-element-slide-out-top{from{transform:translateY(0);opacity:1}to{transform:translateY(var(--horizon-padding-sm));opacity:0}}
      @keyframes horizon-search-element-slide-in-bottom{0%{transform:translateY(20px);opacity:0}100%{transform:translateY(0);opacity:1}}
      @keyframes horizon-search-element-slide-out-bottom{0%{transform:translateY(0);opacity:1}100%{transform:translateY(20px);opacity:0}}
      @keyframes horizon-fade-in{from{opacity:0}to{opacity:1}}
      @keyframes horizon-fade-out{from{opacity:1}to{opacity:0}}
      @keyframes horizon-modal-slide-in-top{from{transform:translateY(var(--horizon-padding-sm));opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes horizon-menu-drawer-nav-open{0%{visibility:hidden;opacity:0;transform:translateX(-.5rem)}100%{visibility:visible;opacity:1;transform:translateX(0)}}
      @keyframes horizon-product-grid-fade-in-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes horizon-section-reveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes horizon-hero-media-in{from{opacity:0;transform:scale(1.025)}to{opacity:1;transform:scale(1)}}
      @keyframes horizon-hero-copy-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes horizon-header-in{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

      html[data-horizon-ready='true'] .site-header{animation:horizon-header-in .32s var(--animation-timing-fade-in) both}
      html[data-horizon-ready='true'] .announcement{animation:horizon-fade-in .25s var(--animation-timing-fade-in) both}

      .drawer{transition:transform var(--drawer-animation-speed) ease,opacity var(--drawer-animation-speed) ease,visibility var(--drawer-animation-speed) ease!important}
      .scrim{transition:opacity var(--drawer-animation-speed) ease,visibility var(--drawer-animation-speed) ease,backdrop-filter var(--drawer-animation-speed) ease!important}
      .scrim.open{backdrop-filter:brightness(.75)}
      .mobile-drawer.open .mobile-nav a{animation:horizon-menu-drawer-nav-open var(--drawer-animation-speed) ease-in-out backwards;animation-delay:calc(var(--drawer-animation-speed) + (var(--horizon-i,1) - 1) * .1s)}
      .search-panel{transition:transform var(--animation-speed-medium) var(--animation-timing-fade-in),opacity var(--animation-speed-medium) var(--animation-timing-fade-in),visibility var(--animation-speed-medium) var(--animation-timing-fade-out)!important}
      .search-panel.open .search-row{animation:horizon-element-slide-in-top var(--animation-speed) var(--animation-easing) both}
      .search-panel.open .search-results>*{animation:horizon-search-element-slide-in-bottom var(--animation-speed-medium) var(--animation-timing-bounce) backwards;animation-delay:var(--horizon-delay,0ms)}
      #cartDrawer.open .drawer-head,#cartDrawer.open .drawer-body>*{animation:horizon-modal-slide-in-top var(--animation-speed) var(--animation-easing) both}
      .zoom-modal.open{animation:horizon-fade-in var(--animation-speed) var(--animation-easing) both}
      .zoom-modal.open img{animation:horizon-modal-slide-in-top var(--animation-speed) var(--animation-easing) both}
      .sticky-buy.visible{animation:horizon-search-element-slide-in-bottom var(--animation-speed-slow) var(--animation-timing-fade-in) both}
      .cart-count.horizon-grow{animation:horizon-grow .3s var(--animation-timing-bounce) both}

      .horizon-reveal{opacity:0;transform:translateY(18px);will-change:opacity,transform}
      .horizon-reveal.horizon-visible{animation:horizon-section-reveal .48s var(--animation-timing-fade-in) both;animation-delay:var(--horizon-delay,0ms)}
      .hero-media.horizon-reveal{transform:scale(1.025)}
      .hero-media.horizon-reveal.horizon-visible{animation:horizon-hero-media-in .65s var(--animation-timing-fade-in) both;animation-delay:var(--horizon-delay,0ms)}
      .hero-content>.horizon-reveal.horizon-visible{animation:horizon-hero-copy-in .55s var(--animation-timing-fade-in) both;animation-delay:var(--horizon-delay,0ms)}
      .product-card.horizon-reveal.horizon-visible{animation:horizon-product-grid-fade-in-up .42s var(--animation-timing-fade-in) both;animation-delay:var(--horizon-delay,0ms)}

      .icon-btn,.drawer-close,.zoom-close,.email-pill button{transition:transform var(--animation-speed-medium) var(--animation-timing-bounce),background-color var(--animation-speed-medium) cubic-bezier(.25,.46,.45,.94)!important}
      .icon-btn:active,.drawer-close:active,.zoom-close:active,.email-pill button:active{transform:scale(.88)!important;transition-duration:100ms!important}

      .horizon-fly{position:fixed;z-index:9999;pointer-events:none;object-fit:cover;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.18);will-change:transform,opacity,width,height}
      .horizon-marquee-track{display:flex;width:max-content;animation:horizon-marquee var(--marquee-speed,20s) linear infinite}
      @keyframes horizon-marquee{to{transform:translateX(-50%)}}
      .horizon-marquee:hover .horizon-marquee-track{animation-play-state:paused}

      @media (prefers-reduced-motion:reduce){
        .horizon-reveal{opacity:1!important;transform:none!important;animation:none!important}
        .site-header,.announcement,.drawer,.scrim,.search-panel,.search-results>*,.zoom-modal,.sticky-buy{animation:none!important;transition-duration:.01ms!important}
      }
    `;
    document.head.appendChild(style);
  }

  function focusables(root) {
    return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', root)
      .filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true' && !el.closest('[inert]'));
  }

  const dialogs = [
    { trigger:'#menuOpen', panel:'#mobileDrawer', close:'#menuClose' },
    { trigger:'#cartOpen', panel:'#cartDrawer', close:'#cartClose' },
    { trigger:'#searchOpen', panel:'#searchPanel', close:'#searchClose' }
  ];

  function syncDialog(pair) {
    const trigger = $(pair.trigger), panel = $(pair.panel);
    if (!trigger || !panel) return;
    const open = panel.classList.contains('open');
    trigger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.toggleAttribute('inert', !open);
    if (open) requestAnimationFrame(() => (panel.querySelector('input,button,a[href]') || panel).focus?.({preventScroll:true}));
  }

  function installDialog(pair) {
    const trigger = $(pair.trigger), panel = $(pair.panel);
    if (!trigger || !panel || panel.dataset.horizonDialog) return;
    panel.dataset.horizonDialog = 'true';
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-hidden','true');
    panel.setAttribute('inert','');
    new MutationObserver(() => syncDialog(pair)).observe(panel,{attributes:true,attributeFilter:['class']});
    panel.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || !panel.classList.contains('open')) return;
      const list = focusables(panel); if (!list.length) return;
      const first=list[0], last=list[list.length-1];
      if (e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if (!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    });
  }

  function installMenuStagger() {
    $$('#mobileDrawer .mobile-nav a').forEach((a,i)=>a.style.setProperty('--horizon-i',String(i+1)));
  }

  function installSearchStagger() {
    const root = $('#searchResults'); if (!root || root.dataset.horizonSearch) return;
    root.dataset.horizonSearch='true';
    const apply=()=>[...root.children].forEach((el,i)=>el.style.setProperty('--horizon-delay',`${Math.min(i,7)*30}ms`));
    apply(); new MutationObserver(apply).observe(root,{childList:true});
  }

  let revealObserver;
  function getRevealObserver(){
    if (reduce.matches || !('IntersectionObserver' in window)) return null;
    if (!revealObserver) revealObserver = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{ if(!entry.isIntersecting) return; entry.target.classList.add('horizon-visible'); revealObserver.unobserve(entry.target); });
    },{threshold:.08,rootMargin:'0px 0px -5% 0px'});
    return revealObserver;
  }

  function prepareReveals(root=document){
    const selectors = [
      '.hero-media','.hero-content > *','.section-head','.collection-card','.product-card',
      '.page-heading > *','.collection-tools','.product-main-image','.product-details > *',
      '.recommendations > h3','.generic-page > *','.contact-intro > *','.contact-form-wrap'
    ].join(',');
    const els=$$(selectors,root).filter(el=>!el.dataset.horizonReveal);
    els.forEach((el,i)=>{
      el.dataset.horizonReveal='true';
      if(reduce.matches){el.classList.add('horizon-visible');return;}
      el.classList.add('horizon-reveal');
      el.style.setProperty('--horizon-delay',`${Math.min(i%8,7)*45}ms`);
      const io=getRevealObserver(); if(io) io.observe(el); else requestAnimationFrame(()=>el.classList.add('horizon-visible'));
    });
  }

  function installRouteHydration(){
    const app=$('#app'); if(!app) return;
    prepareReveals(app);
    new MutationObserver(()=>requestAnimationFrame(()=>{prepareReveals(app);installProductPageBehaviors();})).observe(app,{childList:true,subtree:true});
    addEventListener('hashchange',()=>requestAnimationFrame(()=>{prepareReveals(app);window.scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'});}));
  }

  function installScrollRestoration(){
    if ('scrollRestoration' in history) history.scrollRestoration='manual';
    addEventListener('pagehide',()=>{ try{ sessionStorage.setItem('nova10:scroll:'+location.href,String(scrollY)); }catch{} });
    addEventListener('pageshow',()=>{ try{ const v=Number(sessionStorage.getItem('nova10:scroll:'+location.href)); if(Number.isFinite(v)&&v>0) requestAnimationFrame(()=>scrollTo({top:v,behavior:'auto'})); }catch{} });
  }

  function installStickyHeader(){
    const header=$('.site-header'); if(!header || header.dataset.horizonHeader) return;
    header.dataset.horizonHeader='true';
    header.dataset.sticky='always';
    let last=scrollY, ticking=false;
    const update=()=>{
      ticking=false; const y=scrollY;
      header.dataset.scrollDirection = y>last?'down':y<last?'up':'none';
      header.toggleAttribute('data-scrolled', y>4);
      last=y;
    };
    addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
    update();
  }

  function installCartCountMotion(){
    $$('.cart-count').forEach(el=>{
      if(el.dataset.horizonCount) return; el.dataset.horizonCount='true';
      el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');
      let prev=el.textContent;
      new MutationObserver(()=>{const next=el.textContent;if(next===prev||reduce.matches)return;prev=next;el.classList.remove('horizon-grow');void el.offsetWidth;el.classList.add('horizon-grow');el.addEventListener('animationend',()=>el.classList.remove('horizon-grow'),{once:true});}).observe(el,{childList:true,characterData:true,subtree:true});
    });
  }

  function installAnnouncement(){
    const el=$('.announcement'); if(!el || el.dataset.horizonAnnouncement) return;
    el.dataset.horizonAnnouncement='true';
    const slides=$$('[data-announcement-slide]',el); if(slides.length<2) return;
    let index=0, timer;
    const render=()=>slides.forEach((s,i)=>s.setAttribute('aria-hidden',String(i!==index)));
    const play=()=>{clearInterval(timer);timer=setInterval(()=>{if(document.hidden||el.matches(':hover'))return;index=(index+1)%slides.length;render();},SETTINGS.announcementSpeedSeconds*1000)};
    render();play();addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):play());
  }

  function installZoom(){
    const image=$('#zoomImage'), modal=$('#zoomModal'), close=$('#zoomClose');
    if(!image||!modal||image.dataset.horizonZoom)return;image.dataset.horizonZoom='true';
    const open=()=>{modal.classList.add('open');document.body.classList.add('drawer-open');close?.focus();};
    const shut=()=>{modal.classList.remove('open');document.body.classList.remove('drawer-open');image.focus();};
    image.addEventListener('click',open);close?.addEventListener('click',shut);modal.addEventListener('click',e=>{if(e.target===modal)shut();});
  }

  function installStickyBuy(){
    const sticky=$('#stickyBuy'); const buttons=$('.buy-stack'); if(!sticky||!buttons||sticky.dataset.horizonSticky)return;
    sticky.dataset.horizonSticky='true';
    if(!('IntersectionObserver' in window))return;
    const io=new IntersectionObserver(([entry])=>sticky.classList.toggle('visible',!entry.isIntersecting),{threshold:.05});io.observe(buttons);
  }

  function installFlyToCart(){
    document.addEventListener('nova10:add-to-cart',e=>{
      if(reduce.matches)return;
      const source=e.detail?.source?.querySelector?.('img') || e.detail?.source || $('.product-main-image img');
      const dest=$('#cartOpen'); if(!source||!dest)return;
      const a=source.getBoundingClientRect(),b=dest.getBoundingClientRect();
      const clone=source.cloneNode(true); clone.className='horizon-fly'; document.body.appendChild(clone);
      Object.assign(clone.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px'});
      const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
      const anim=clone.animate([
        {transform:'translate(0,0) scale(1)',opacity:1},
        {transform:`translate(${dx*.55}px,${Math.min(dy*.35,-40)}px) scale(.65)`,opacity:.9,offset:.55},
        {transform:`translate(${dx}px,${dy}px) scale(.12)`,opacity:.15}
      ],{duration:650,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
      anim.finished.finally(()=>clone.remove());
    });
  }

  function installSimpleSliders(){
    $$('[data-horizon-slideshow]').forEach(root=>{
      if(root.dataset.horizonSlider)return;root.dataset.horizonSlider='true';
      const slides=$$('[data-slide]',root); if(slides.length<2)return;
      let i=0; const show=n=>{i=(n+slides.length)%slides.length;slides.forEach((s,k)=>s.hidden=k!==i);};
      root.querySelector('[data-next]')?.addEventListener('click',()=>show(i+1));
      root.querySelector('[data-prev]')?.addEventListener('click',()=>show(i-1));show(0);
    });
  }

  function installMarquees(){
    $$('.horizon-marquee').forEach(root=>{
      if(root.dataset.horizonMarquee)return;root.dataset.horizonMarquee='true';
      const track=root.firstElementChild;if(!track)return;track.classList.add('horizon-marquee-track');
      if(track.children.length && track.scrollWidth<innerWidth*1.5){track.append(...[...track.children].map(n=>n.cloneNode(true)));}
    });
  }

  function installProductPageBehaviors(){installZoom();installStickyBuy();installSimpleSliders();installMarquees();}

  function installEscapeAndDrawerLinks(){
    document.addEventListener('keydown',e=>{
      if(e.key!=='Escape')return;
      for(const pair of dialogs){const panel=$(pair.panel);if(panel?.classList.contains('open')){$(pair.close)?.click();requestAnimationFrame(()=>$(pair.trigger)?.focus({preventScroll:true}));break;}}
    });
    document.addEventListener('click',e=>{
      const link=e.target.closest?.('a[href]');if(!link)return;const drawer=link.closest('.drawer');if(!drawer?.classList.contains('open'))return;const pair=dialogs.find(p=>$(p.panel)===drawer);if(pair)$(pair.close)?.click();
    });
  }

  function boot(){
    injectStyles();
    document.documentElement.dataset.themeStandard='shopify-horizon';
    document.documentElement.dataset.themeSource='nova10-final';
    document.documentElement.dataset.horizonEngine='parity-runtime-1';
    dialogs.forEach(installDialog);
    installMenuStagger();installSearchStagger();installRouteHydration();installScrollRestoration();installStickyHeader();installCartCountMotion();installAnnouncement();installFlyToCart();installProductPageBehaviors();installEscapeAndDrawerLinks();
    requestAnimationFrame(()=>document.documentElement.dataset.horizonReady='true');
    window.dispatchEvent(new CustomEvent('nova10:horizon-ready',{detail:window.NOVA10_HORIZON}));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
