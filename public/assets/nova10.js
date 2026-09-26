const PRODUCTS = [
  {
    rank:1, handle:'nettoyeur-haute-pression-sans-fil', title:'Nettoyeur haute pression sans fil', price:69.90, sku:'NOVA10-WASH-001', category:'Maison & Outdoor', image:'/assets/images/nova10-pressure-washer.jpg',
    description:'<p>Un nettoyeur haute pression sans fil conçu pour faciliter le nettoyage ponctuel de la voiture et des surfaces extérieures.</p><ul><li>Format sans fil</li><li>Usage maison et automobile</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:2, handle:'serum-k-beauty-fermete-glow', title:'Sérum K‑Beauty fermeté & glow', price:24.90, sku:'NOVA10-SERUM-001', category:'Beauté', image:'/assets/images/nova10-kbeauty-serum.jpg',
    description:'<p>Un sérum visage inspiré des routines K‑Beauty pour compléter simplement votre rituel de soin quotidien.</p><ul><li>Usage visage</li><li>Routine quotidienne</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:3, handle:'tumbler-isotherme-anti-fuite', title:'Tumbler isotherme anti-fuite', price:29.90, sku:'NOVA10-TUMBLER-001', category:'Lifestyle & Voyage', image:'/assets/images/nova10-tumbler.jpg',
    description:'<p>Un tumbler isotherme réutilisable pensé pour accompagner les boissons au bureau, en déplacement ou pendant les journées actives.</p><ul><li>Format nomade</li><li>Usage quotidien</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:4, handle:'basics-athleisure-compression', title:'Basics athleisure / compression', price:34.90, sku:'NOVA10-ATH-001', category:'Lifestyle & Voyage', image:'/assets/images/nova10-athleisure.jpg',
    description:'<p>Des essentiels athleisure pensés pour accompagner les journées actives comme les moments de détente.</p><ul><li>Style polyvalent</li><li>Usage sport et quotidien</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:5, handle:'sac-crossbody-voyage-compact', title:'Sac crossbody / voyage compact', price:29.90, sku:'NOVA10-BAG-001', category:'Lifestyle & Voyage', image:'/assets/images/nova10-crossbody.jpg',
    description:'<p>Un sac crossbody compact pensé pour garder vos essentiels à portée de main pendant les déplacements et les voyages.</p><ul><li>Format compact</li><li>Porté pratique au quotidien</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:6, handle:'set-literie-confort-microfibre', title:'Set literie confort / microfibre', price:49.90, sku:'NOVA10-BED-001', category:'Maison & Outdoor', image:'/assets/images/nova10-bedding.jpg',
    description:'<p>Un ensemble de literie au style sobre, pensé pour apporter une touche confortable et facile à intégrer dans la chambre.</p><ul><li>Univers maison</li><li>Style polyvalent</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:7, handle:'accessoires-smartphone-modulaires', title:'Accessoires smartphone modulaires', price:24.90, sku:'NOVA10-PHONE-001', category:'Tech & Gaming', image:'/assets/images/nova10-phone-accessories.jpg',
    description:'<p>Une sélection d’accessoires pratiques pour compléter l’usage quotidien de votre smartphone et garder vos essentiels bien organisés.</p><ul><li>Format compact</li><li>Usage quotidien</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:8, handle:'appareil-beaute-visage-compact', title:'Appareil beauté visage compact', price:59.90, sku:'NOVA10-BEAUTY-001', category:'Beauté', image:'/assets/images/nova10-beauty-device.jpg',
    description:'<p>Un appareil beauté compact conçu pour s’intégrer facilement à une routine visage à domicile.</p><ul><li>Format compact</li><li>Prise en main simple</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:9, handle:'ventilateur-portable-4-en-1', title:'Ventilateur portable 4-en-1', price:39.90, sku:'NOVA10-FAN-001', category:'Maison & Outdoor', image:'/assets/images/nova10-portable-fan.jpg',
    description:'<p>Un ventilateur portable rechargeable au format compact, pratique pour le bureau, les déplacements et les journées chaudes.</p><ul><li>Format portable</li><li>Rechargeable</li><li>Sélection NOVA10</li></ul>'
  },
  {
    rank:10, handle:'manette-gaming-sans-fil', title:'Manette gaming sans fil', price:49.90, sku:'NOVA10-GAME-001', category:'Tech & Gaming', image:'/assets/images/nova10-gaming-controller.jpg',
    description:'<p>Une manette sans fil au format moderne pour compléter un setup gaming et profiter d’une expérience de jeu plus confortable.</p><ul><li>Connexion sans fil</li><li>Format gaming</li><li>Sélection NOVA10</li></ul>'
  }
];

const COLLECTIONS = {
  'beaute': { title:'Beauté', description:'Sélection NOVA10 dédiée aux soins, à la beauté et aux appareils visage.', image:'/assets/images/nova10-kbeauty-serum.jpg', products:['appareil-beaute-visage-compact','serum-k-beauty-fermete-glow'] },
  'maison-outdoor': { title:'Maison & Outdoor', description:'Produits NOVA10 pour la maison, le confort, le nettoyage et les usages extérieurs.', image:'/assets/images/nova10-pressure-washer.jpg', products:['ventilateur-portable-4-en-1','set-literie-confort-microfibre','nettoyeur-haute-pression-sans-fil'] },
  'tech-gaming': { title:'Tech & Gaming', description:'Sélection NOVA10 autour du gaming, des accessoires smartphone et de l’électronique du quotidien.', image:'/assets/images/nova10-gaming-controller.jpg', products:['manette-gaming-sans-fil','accessoires-smartphone-modulaires'] },
  'lifestyle-voyage': { title:'Lifestyle & Voyage', description:'Sélection NOVA10 pour les déplacements, l’hydratation, le sport et les essentiels du quotidien.', image:'/assets/images/nova10-crossbody.jpg', products:['sac-crossbody-voyage-compact','basics-athleisure-compression','tumbler-isotherme-anti-fuite'] },
  'top-10-nova10': { title:'Top 10 NOVA10', description:'La sélection principale NOVA10 : dix produits tendance organisés pour la boutique.', image:null, products:PRODUCTS.map(p=>p.handle) }
};

const fmt = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(value);
const productByHandle = handle => PRODUCTS.find(p=>p.handle===handle);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function productCard(p){
  return `<article class="product-card">
    <a class="product-link" href="#/produit/${p.handle}" aria-label="${esc(p.title)}"></a>
    <div class="product-media"><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"><span class="sold-chip">Indisponible</span></div>
    <h3 class="product-title">${esc(p.title)}</h3>
    <p class="product-price">${fmt(p.price)}</p>
  </article>`;
}

function productsGrid(list){ return `<div class="product-grid">${list.map(productCard).join('')}</div>`; }

function homeTemplate(){
  const cards = Object.entries(COLLECTIONS).filter(([h])=>h!=='top-10-nova10').map(([handle,c])=>`
    <article class="collection-card">
      <img src="${c.image}" alt="${esc(c.title)}" loading="lazy">
      <span class="collection-card-title">${esc(c.title)}</span>
      <a href="#/collection/${handle}" aria-label="${esc(c.title)}"></a>
    </article>`).join('');
  return `
    <section class="home-hero nova-page">
      <div class="hero-frame">
        <div class="hero-media"><img src="/assets/images/nova10-crossbody.jpg" alt="Sac crossbody NOVA10"></div>
        <div class="hero-media"><img src="/assets/images/nova10-gaming-controller.jpg" alt="Manette gaming NOVA10"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>NOVA10 — le meilleur du moment, sans catalogue inutile.</h1>
          <p>10 produits sélectionnés dans la beauté, la maison, la tech, le gaming et le lifestyle.</p>
          <a class="button" href="#/collection/top-10-nova10">Découvrir le Top 10</a>
        </div>
      </div>
    </section>
    <section class="home-section collections-section nova-page">
      <div class="section-head"><h2>Explorer nos univers</h2></div>
      <div class="collection-grid">${cards}</div>
    </section>
    <section class="home-section products-section nova-page">
      <div class="section-head"><h2>Top 10 NOVA10</h2><a class="view-all" href="#/collection/top-10-nova10">Voir tout</a></div>
      ${productsGrid(PRODUCTS)}
    </section>`;
}

function collectionTemplate(handle){
  const c = COLLECTIONS[handle] || COLLECTIONS['top-10-nova10'];
  const products = c.products.map(productByHandle).filter(Boolean);
  return `<section class="nova-page">
    <div class="page-heading"><h1>${esc(c.title)}</h1><p>${esc(c.description)}</p></div>
    <div class="collection-tools" aria-label="Outils de collection">
      <div class="tools-left"><button class="tool-btn" type="button">Filtrer</button><span>${products.length} produit${products.length>1?'s':''}</span></div>
      <div class="tools-right"><button class="tool-btn" type="button">Trier par : Sélection</button><button class="tool-btn" type="button" aria-label="Densité grille">▦</button></div>
    </div>
    <div class="collection-route-grid">${productsGrid(products)}</div>
  </section>`;
}

function productTemplate(handle){
  const p = productByHandle(handle) || PRODUCTS[0];
  const recs = PRODUCTS.filter(x=>x.handle!==p.handle).slice(0,4);
  return `<section class="product-page nova-page">
    <div class="product-layout">
      <div class="product-gallery">
        <button class="product-main-image" id="zoomImage" type="button" aria-label="Agrandir l’image"><img src="${p.image}" alt="${esc(p.title)}"></button>
      </div>
      <aside class="product-details">
        <div class="product-details-header"><h1>${esc(p.title)}</h1><p class="product-page-price">${fmt(p.price)}</p></div>
        <div class="product-divider"></div>
        <div class="qty-row"><span class="qty-label">Quantité</span><div class="qty"><button type="button" aria-label="Diminuer">−</button><span>1</span><button type="button" aria-label="Augmenter">+</button></div></div>
        <div class="buy-stack">
          <button class="button" type="button" disabled>Épuisé</button>
          <button class="button accelerated" type="button" disabled>Achat immédiat indisponible</button>
        </div>
        <div class="product-description">${p.description}</div>
        <details class="disclosure"><summary>Informations produit</summary><p>Référence : ${esc(p.sku)}. La vente sera activée après validation du fournisseur et du stock réel.</p></details>
      </aside>
    </div>
    <div class="recommendations"><h3>You may also like</h3>${productsGrid(recs)}</div>
  </section>
  <div class="zoom-modal" id="zoomModal"><button class="zoom-close" id="zoomClose" aria-label="Fermer">×</button><img src="${p.image}" alt="${esc(p.title)}"></div>
  <div class="sticky-buy" id="stickyBuy"><img src="${p.image}" alt=""><div class="sticky-buy-info"><strong>${esc(p.title)}</strong><span>${fmt(p.price)}</span></div><button class="button" disabled>Épuisé</button></div>`;
}

const PAGE_CONTENT = {
  apropos: {
    title:'À propos de NOVA10',
    body:`<p>NOVA10 est une boutique pensée autour d’une sélection courte : dix produits organisés par univers pour garder une expérience simple, lisible et actuelle.</p><h2>Notre approche</h2><p>Nous privilégions une sélection resserrée plutôt qu’un catalogue surchargé. Beauté, maison, tech, gaming, lifestyle et voyage : chaque univers reste volontairement clair.</p><h2>Une boutique indépendante</h2><p>Cette version de NOVA10 est servie par notre propre infrastructure et ne dépend plus de Shopify pour son affichage.</p>`
  },
  faq: {
    title:'FAQ',
    body:`<div class="faq-list"><details><summary>Les produits sont-ils disponibles immédiatement ?</summary><p>Les références restent indisponibles tant que leur fournisseur et leur stock réel ne sont pas validés.</p></details><details><summary>Quels sont les univers NOVA10 ?</summary><p>Beauté, Maison & Outdoor, Tech & Gaming et Lifestyle & Voyage.</p></details><details><summary>Comment contacter NOVA10 ?</summary><p>Écrivez-nous à giniusconcept@gmail.com.</p></details><details><summary>Comment fonctionnent les retours ?</summary><p>Les modalités applicables sont détaillées dans la page Retours & remboursements.</p></details></div>`
  },
  livraison: {
    title:'Livraison',
    body:`<p>Les conditions définitives de livraison seront activées produit par produit après validation des fournisseurs, des zones desservies et des délais réels.</p><h2>Suivi des commandes</h2><p>Lors de l’ouverture commerciale, les informations de suivi seront communiquées après expédition lorsque le transporteur le permet.</p>`
  },
  retours: {
    title:'Retours & remboursements',
    body:`<p>Pour les achats à distance auxquels le droit de rétractation s’applique, le consommateur dispose en principe de quatorze jours calendaires à compter de la réception du bien pour notifier sa décision de se rétracter.</p><h2>Exercer la rétractation</h2><p>Vous pouvez contacter NOVA10 à <strong>giniusconcept@gmail.com</strong> en indiquant votre nom, votre numéro de commande et les produits concernés.</p><h2>Produit endommagé, défectueux ou non conforme</h2><p>Ces situations sont distinctes d’un simple changement d’avis et peuvent relever des garanties légales applicables.</p>`
  },
  cgv: {
    title:'Conditions générales de vente',
    body:`<p><strong>Version préparatoire avant ouverture commerciale.</strong></p><h2>Produits</h2><p>Les caractéristiques essentielles des produits sont présentées sur leurs fiches.</p><h2>Prix</h2><p>Les prix sont affichés en euros. Les frais éventuels sont présentés avant validation définitive de la commande.</p><h2>Commande et paiement</h2><p>La commande ne devient définitive qu’après validation des étapes du checkout et confirmation du paiement par le prestataire activé.</p><h2>Rétractation et garanties</h2><p>Les droits légaux du consommateur restent applicables dans les conditions prévues par la réglementation.</p>`
  },
  confidentialite: {
    title:'Politique de confidentialité',
    body:`<p>NOVA10 limite les traitements aux données nécessaires au fonctionnement du site, au service client et, lors de l’ouverture commerciale, au traitement des commandes.</p><h2>Cookies et traceurs</h2><p>Les traceurs non strictement nécessaires ne sont activés qu’après consentement lorsqu’il est requis. Vous pouvez refuser aussi facilement qu’accepter.</p><h2>Vos droits</h2><p>Pour toute demande relative à vos données personnelles : <strong>giniusconcept@gmail.com</strong>.</p><p>Vous pouvez également introduire une réclamation auprès de la CNIL en France.</p>`
  }
};

function genericTemplate(key){
  const page = PAGE_CONTENT[key] || PAGE_CONTENT.apropos;
  return `<section class="nova-page generic-page"><h1>${esc(page.title)}</h1>${page.body}</section>`;
}

function contactTemplate(){
  return `<section class="nova-page generic-page contact-intro"><h1>Contact</h1><p>Une question sur NOVA10 ? Écrivez-nous via le formulaire ou directement à giniusconcept@gmail.com.</p></section>
  <section class="contact-form-wrap">
    <form class="form-grid" id="contactForm">
      <div class="form-row"><div class="field"><label for="firstName">Prénom</label><input id="firstName" name="firstName" autocomplete="given-name"></div><div class="field"><label for="lastName">Nom</label><input id="lastName" name="lastName" autocomplete="family-name"></div></div>
      <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="message">Message</label><textarea id="message" name="message" required></textarea></div>
      <div><button class="button" type="submit">Envoyer</button></div>
    </form>
  </section>`;
}

function notFoundTemplate(){ return `<section class="nova-page generic-page"><h1>Page introuvable</h1><p><a class="button" href="#/">Retour à l’accueil</a></p></section>`; }

function route(){
  const raw = location.hash.replace(/^#\/?/,'').replace(/\/$/,'');
  const parts = raw ? raw.split('/') : [];
  if(parts.length===0) return {type:'home'};
  if(parts[0]==='boutique') return {type:'collection',handle:'top-10-nova10'};
  if(parts[0]==='collection') return {type:'collection',handle:parts[1]||'top-10-nova10'};
  if(parts[0]==='produit') return {type:'product',handle:parts[1]};
  if(parts[0]==='contact') return {type:'contact'};
  if(PAGE_CONTENT[parts[0]]) return {type:'page',key:parts[0]};
  return {type:'404'};
}

function render(){
  const r=route();
  const main=document.getElementById('app');
  if(r.type==='home') main.innerHTML=homeTemplate();
  else if(r.type==='collection') main.innerHTML=collectionTemplate(r.handle);
  else if(r.type==='product') main.innerHTML=productTemplate(r.handle);
  else if(r.type==='contact') main.innerHTML=contactTemplate();
  else if(r.type==='page') main.innerHTML=genericTemplate(r.key);
  else main.innerHTML=notFoundTemplate();
  bindRouteUI(r);
  window.scrollTo({top:0,behavior:'instant'});
  document.title = r.type==='product' ? `${productByHandle(r.handle)?.title||'Produit'} — NOVA10` : r.type==='collection' ? `${COLLECTIONS[r.handle]?.title||'Boutique'} — NOVA10` : 'NOVA10';
}

function bindRouteUI(r){
  if(r.type==='product'){
    const mainImage=document.getElementById('zoomImage'), modal=document.getElementById('zoomModal'), close=document.getElementById('zoomClose');
    mainImage?.addEventListener('click',()=>modal?.classList.add('open'));
    close?.addEventListener('click',()=>modal?.classList.remove('open'));
    modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
    const sticky=document.getElementById('stickyBuy');
    const observer=new IntersectionObserver(entries=>{if(sticky)sticky.classList.toggle('visible',!entries[0].isIntersecting)},{threshold:.05});
    if(mainImage) observer.observe(mainImage);
  }
  const form=document.getElementById('contactForm');
  form?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(form); const subject=encodeURIComponent('NOVA10 — Contact'); const body=encodeURIComponent(`Nom : ${fd.get('firstName')||''} ${fd.get('lastName')||''}\nE-mail : ${fd.get('email')||''}\n\n${fd.get('message')||''}`); location.href=`mailto:giniusconcept@gmail.com?subject=${subject}&body=${body}`});
}

function setDrawer(drawer, open){
  const scrim=document.getElementById('scrim');
  drawer?.classList.toggle('open',open); scrim?.classList.toggle('open',open);
  document.body.classList.toggle('drawer-open',open);
}

function initGlobalUI(){
  const cart=document.getElementById('cartDrawer'), menu=document.getElementById('mobileDrawer'), scrim=document.getElementById('scrim'), search=document.getElementById('searchPanel');
  document.getElementById('cartOpen')?.addEventListener('click',()=>setDrawer(cart,true));
  document.getElementById('cartClose')?.addEventListener('click',()=>setDrawer(cart,false));
  document.getElementById('menuOpen')?.addEventListener('click',()=>setDrawer(menu,true));
  document.getElementById('menuClose')?.addEventListener('click',()=>setDrawer(menu,false));
  scrim?.addEventListener('click',()=>{setDrawer(cart,false);setDrawer(menu,false);search?.classList.remove('open')});
  document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>setDrawer(menu,false)));
  const searchOpen=document.getElementById('searchOpen'), searchClose=document.getElementById('searchClose'), searchInput=document.getElementById('siteSearch');
  searchOpen?.addEventListener('click',()=>{search?.classList.add('open');scrim?.classList.add('open');setTimeout(()=>searchInput?.focus(),50)});
  searchClose?.addEventListener('click',()=>{search?.classList.remove('open');scrim?.classList.remove('open')});
  searchInput?.addEventListener('input',()=>renderSearch(searchInput.value));
  renderSearch('');
  const cookie=document.getElementById('cookieBanner');
  if(!localStorage.getItem('nova10-consent')) cookie?.classList.remove('hidden');
  document.querySelectorAll('[data-consent]').forEach(btn=>btn.addEventListener('click',()=>{localStorage.setItem('nova10-consent',btn.dataset.consent);cookie?.classList.add('hidden')}));
  const newsletter=document.getElementById('newsletterForm');
  newsletter?.addEventListener('submit',e=>{e.preventDefault();const input=newsletter.querySelector('input');if(input?.value){localStorage.setItem('nova10-newsletter',input.value);input.value='';input.placeholder='Merci — inscription enregistrée';}});
}

function renderSearch(q){
  const host=document.getElementById('searchResults'); if(!host)return;
  const term=(q||'').trim().toLowerCase();
  const list=(term?PRODUCTS.filter(p=>`${p.title} ${p.category}`.toLowerCase().includes(term)):PRODUCTS.slice(0,4));
  host.innerHTML=list.map(p=>`<a class="search-result" href="#/produit/${p.handle}"><img src="${p.image}" alt=""><div><strong>${esc(p.title)}</strong><span>${fmt(p.price)}</span></div></a>`).join('') || '<p>Aucun résultat.</p>';
  host.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{document.getElementById('searchPanel')?.classList.remove('open');document.getElementById('scrim')?.classList.remove('open')}));
}

window.addEventListener('hashchange',render);
window.addEventListener('DOMContentLoaded',()=>{initGlobalUI();render();});
