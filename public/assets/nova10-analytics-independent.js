(()=>{
  const KEY='nova10-session-id';
  let sid=localStorage.getItem(KEY);if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`);localStorage.setItem(KEY,sid)}
  const params=new URLSearchParams(location.search);
  const campaignSource=params.get('utm_source')||params.get('source');
  const refSource=(()=>{try{return document.referrer?new URL(document.referrer).hostname.replace(/^www\./,''):'Direct'}catch{return 'Direct'}})();
  const source=campaignSource||refSource||'Direct';
  const send=(event,extra={})=>{const payload={event,sessionId:sid,source,page:location.hash||'#/',...extra};try{navigator.sendBeacon('/api/track',new Blob([JSON.stringify(payload)],{type:'application/json'}))}catch{fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{})}};
  const routeTrack=()=>{send('page_view');const m=(location.hash||'').match(/#\/produit\/([^/?#]+)/);if(m)send('product_view',{product:decodeURIComponent(m[1])})};
  async function syncProducts(){try{const r=await fetch('/api/products',{cache:'no-store'});if(!r.ok)return;const {products}=await r.json();if(!Array.isArray(products)||typeof PRODUCTS==='undefined')return;const map=new Map(products.map(p=>[p.handle,p]));PRODUCTS.forEach(p=>{const remote=map.get(p.handle);if(remote){p.price=remote.price;p.stock=remote.stock;p.status=remote.status;p.supplierName=remote.supplierName;p.supplierSku=remote.supplierSku}});if(typeof render==='function')render()}catch{}}
  document.addEventListener('DOMContentLoaded',()=>{
    syncProducts().finally(routeTrack);
    window.addEventListener('hashchange',routeTrack);
    const search=document.getElementById('siteSearch');let timer;search?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(search.value.trim())send('search',{query:search.value.trim().slice(0,80)})},700)});
    const newsletter=document.getElementById('newsletterForm');newsletter?.addEventListener('submit',()=>{const input=newsletter.querySelector('input[type=email]');const email=input?.value?.trim();if(email){fetch('/api/newsletter',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email}),keepalive:true}).catch(()=>{});send('newsletter_signup')}});
    document.addEventListener('click',e=>{const link=e.target.closest('a[href*="#/produit/"]');if(link)send('product_click',{page:location.hash||'#/'})});
  });
})();
