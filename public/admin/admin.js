const euro = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(n||0));
const num = n => new Intl.NumberFormat('fr-FR').format(Number(n||0));
let DATA = null;
let currentView = 'home';

async function api(path, options={}){
  const res = await fetch(path,{credentials:'same-origin',headers:{'content-type':'application/json',...(options.headers||{})},...options});
  let data={}; try{data=await res.json()}catch{}
  if(res.status===401) throw Object.assign(new Error('unauthorized'),{status:401});
  if(!res.ok) throw new Error(data.error||'Erreur');
  return data;
}

const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
function showLogin(){ $('#loginView')?.classList.remove('hidden'); $('#adminApp')?.classList.add('hidden'); }
function showApp(){ $('#loginView')?.classList.add('hidden'); $('#adminApp')?.classList.remove('hidden'); }
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))}
function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value}
function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),1800)}

function installShopifyHoverParity(){
  if(document.getElementById('shopify-hover-parity')) return;
  const style=document.createElement('style');
  style.id='shopify-hover-parity';
  style.textContent=`
    .nav-icon,.nav-icon .icon,.top-icon .icon,.group-head button .icon,.composer-btn .icon{
      transition:transform 115ms cubic-bezier(.2,.8,.2,1),color 100ms ease;
      transform-origin:50% 50%;
      will-change:transform;
    }
    .nav button:hover .nav-icon,.nav a:hover .nav-icon,
    .nav button:focus-visible .nav-icon,.nav a:focus-visible .nav-icon{
      transform:scale(1.13);
      color:#303030;
    }
    .nav button:hover .nav-icon .icon,.nav a:hover .nav-icon .icon{
      transform:scale(1.035);
    }
    .top-icon:hover .icon,.top-icon.active .icon,.top-icon:focus-visible .icon{
      transform:scale(1.13);
    }
    .group-head button:hover .icon,.group-head button:focus-visible .icon{
      transform:scale(1.15);
    }
    .composer-btn:hover .icon,.composer-btn:focus-visible .icon{
      transform:scale(1.10);
    }
    .nav button:active .nav-icon,.nav a:active .nav-icon,.top-icon:active .icon{
      transform:scale(.96);
      transition-duration:65ms;
    }
    @media (prefers-reduced-motion:reduce){
      .nav-icon,.nav-icon .icon,.top-icon .icon,.group-head button .icon,.composer-btn .icon{transition:none!important}
    }
  `;
  document.head.appendChild(style);
}

function renderBars(hostId, series){
  const host=document.getElementById(hostId); if(!host)return;
  const safe=Array.isArray(series)?series:[]; const max=Math.max(1,...safe.map(x=>x.sessions||0));
  host.innerHTML=safe.length?safe.map(x=>`<div class="bar-wrap" title="${escapeHtml(x.day)} — ${num(x.sessions)} sessions"><div class="bar" style="height:${Math.max(2,(x.sessions/max)*100)}%"></div></div>`).join(''):'<div class="empty" style="width:100%">Aucune donnée.</div>';
}

function sourceRows(hostId, sources){
  const host=document.getElementById(hostId); if(!host)return;
  const rows=Object.entries(sources||{}).sort((a,b)=>b[1]-a[1]); const max=Math.max(1,...rows.map(x=>x[1]));
  host.innerHTML=rows.length?rows.slice(0,12).map(([k,v])=>`<div class="source-row"><span>${escapeHtml(k)}</span><div class="source-track"><div class="source-fill" style="width:${(v/max)*100}%"></div></div><b>${num(v)}</b></div>`).join(''):'<div class="empty">Aucune donnée pour le moment.</div>';
}

function topProductRows(hostId, map){
  const host=document.getElementById(hostId); if(!host)return;
  const rows=Object.entries(map||{}).sort((a,b)=>b[1]-a[1]); const max=Math.max(1,...rows.map(x=>x[1]));
  host.innerHTML=rows.length?rows.slice(0,10).map(([k,v])=>`<div class="source-row"><span>${escapeHtml(k)}</span><div class="source-track"><div class="source-fill" style="width:${(v/max)*100}%"></div></div><b>${num(v)}</b></div>`).join(''):'<div class="empty">Aucune vue produit enregistrée.</div>';
}

function renderDashboard(){
  const d=DATA||{}, t=d.today||{}, l=d.last30||{}, operational=d.operational||{};
  setText('sessions30',`${num(l.sessions||0)} sessions`);
  setText('readyProducts',`${operational.productsReady||0} / ${operational.productsTotal||10} produits prêts à vendre.`);
  setText('fProductViews',num(l.productViews||0)); setText('fCart',num(l.addToCart||0)); setText('fCheckout',num(l.checkouts||0)); setText('fOrders',num(l.orders||0));
  setText('fConversion',l.sessions?`${((Number(l.orders||0)/Number(l.sessions))*100).toFixed(2).replace('.',',')} %`:'0 %');
  setText('aVisitors',num(l.sessions||0)); setText('aViews',num(l.pageViews||0)); setText('aProducts',num(l.productViews||0)); setText('aSearches',num(l.searches||0));
  setText('financeRevenue',euro(t.revenue||0)); setText('financeOrders',num(t.orders||0)); setText('ordersBadge',num((d.orders||[]).length));
  renderBars('analyticsChart',d.series||[]); sourceRows('homeSources',l.sources); sourceRows('acqSources',l.sources); topProductRows('topProducts',l.products);
}

function renderOrders(){
  const body=$('#ordersBody'), empty=$('#ordersEmpty'); if(!body||!empty)return;
  const rows=DATA?.orders||[]; empty.classList.toggle('hidden',rows.length>0);
  body.innerHTML=rows.map(o=>`<tr><td><b>#${escapeHtml(o.number||o.id||'—')}</b></td><td>${escapeHtml((o.createdAt||'').slice(0,10))}</td><td>${escapeHtml(o.email||'—')}</td><td><span class="pill">${escapeHtml(o.paymentStatus||'Payé')}</span></td><td>${escapeHtml(o.fulfillmentStatus||'Non traité')}</td><td><b>${euro(o.total)}</b></td></tr>`).join('');
}

function renderProducts(){
  const body=$('#productsBody'); if(!body)return;
  body.innerHTML=(DATA?.products||[]).map(p=>`<tr data-handle="${escapeHtml(p.handle)}"><td><div class="prod"><img src="${escapeHtml(p.image)}" alt=""><div><b>${escapeHtml(p.title)}</b><br><span style="color:#6d7175">${escapeHtml(p.sku)}</span></div></div></td><td><input class="input small" data-k="price" type="number" min="0" step="0.01" value="${Number(p.price||0).toFixed(2)}"></td><td><input class="input small" data-k="stock" type="number" min="0" step="1" value="${Number(p.stock||0)}"></td><td><select class="input" data-k="status"><option value="draft" ${p.status==='draft'?'selected':''}>Brouillon</option><option value="active" ${p.status==='active'?'selected':''}>Actif</option><option value="archived" ${p.status==='archived'?'selected':''}>Archivé</option></select></td><td><input class="input wide" data-k="supplierName" value="${escapeHtml(p.supplierName||'')}" placeholder="Fournisseur"></td><td><input class="input wide" data-k="supplierSku" value="${escapeHtml(p.supplierSku||'')}" placeholder="SKU fournisseur"></td><td><button class="save-btn" data-save>Enregistrer</button></td></tr>`).join('');
  $$('[data-save]',body).forEach(btn=>btn.addEventListener('click',saveProduct));
}

async function saveProduct(e){
  const btn=e.currentTarget, tr=btn.closest('tr'), handle=tr.dataset.handle, patch={};
  $$('[data-k]',tr).forEach(el=>patch[el.dataset.k]=el.type==='number'?Number(el.value):el.value);
  btn.disabled=true;btn.textContent='…';
  try{await api(`/api/admin/products/${encodeURIComponent(handle)}`,{method:'PATCH',body:JSON.stringify(patch)});btn.textContent='Enregistré';toast('Produit enregistré');setTimeout(()=>{btn.textContent='Enregistrer';btn.disabled=false},850);await loadData(false)}catch(err){btn.textContent='Erreur';btn.disabled=false;toast(err.message||'Erreur')}
}

function renderStock(){
  const body=$('#stockBody'); if(!body)return;
  body.innerHTML=(DATA?.products||[]).map(p=>`<tr><td><div class="prod"><img src="${escapeHtml(p.image)}" alt=""><b>${escapeHtml(p.title)}</b></div></td><td>${escapeHtml(p.sku)}</td><td><b>${num(p.stock)}</b></td><td>${p.stock>0?'<span class="pill">En stock</span>':'<span class="pill warn">Rupture</span>'}</td><td>${escapeHtml(p.supplierName||'Non renseigné')}</td></tr>`).join('');
}

function renderCustomers(){
  const host=$('#customersList'); if(!host)return; const list=DATA?.customers||[];
  host.innerHTML=list.length?list.map(email=>`<div class="list-item"><div><b>${escapeHtml(email)}</b><div style="color:#6d7175;font-size:12px">Client NOVA10</div></div></div>`).join(''):'<div class="empty"><strong>Aucun client</strong>Les clients apparaîtront ici après les premières commandes.</div>';
}
function renderAll(){renderDashboard();renderOrders();renderProducts();renderStock();renderCustomers();renderCommandResults($('#commandInput')?.value||'')}

async function loadData(showSpinner=true){
  const refresh=$('#refresh'); if(showSpinner&&refresh){refresh.disabled=true;refresh.textContent='Actualisation…'}
  try{DATA=await api('/api/admin/dashboard');renderAll()}catch(err){if(err.status===401){showLogin();return}throw err}finally{if(refresh){refresh.disabled=false;refresh.textContent='Actualiser'}}
}

function switchView(name,{push=true}={}){
  const target=$(`.view[data-view="${CSS.escape(name)}"]`); if(!target)return;
  currentView=name;
  $$('.view').forEach(v=>v.classList.toggle('active',v===target));
  $$('.nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $('#sidebar')?.classList.remove('open'); window.scrollTo({top:0,behavior:'instant'});
  if(push) history.replaceState(null,'',`#${name}`);
}

const COMMANDS=[
  ['Accueil','home'],['Commandes','orders'],['Produits','products'],['Clients','customers'],['Croissance','growth'],['Réductions','discounts'],['Contenu','content'],['Marchés','markets'],['Finances','finances'],['Analyses de données','analytics'],['Boutique en ligne','storefront'],['Agentique','agentic'],['Applications','apps'],['Paramètres','settings']
];
function renderCommandResults(query=''){
  const host=$('#commandResults');if(!host)return;const q=query.trim().toLowerCase();
  const matches=COMMANDS.filter(([label])=>!q||label.toLowerCase().includes(q));
  const products=(DATA?.products||[]).filter(p=>q&&(`${p.title} ${p.sku||''}`).toLowerCase().includes(q)).slice(0,5);
  let html='<div class="command-section-label">Navigation</div>'+matches.map(([label,view])=>`<button class="command-result" data-command-view="${view}"><span>${escapeHtml(label)}</span><small>Ouvrir</small></button>`).join('');
  if(products.length)html+='<div class="command-section-label">Produits</div>'+products.map(p=>`<button class="command-result" data-command-product="${escapeHtml(p.handle)}"><span>${escapeHtml(p.title)}</span><small>${escapeHtml(p.sku||'')}</small></button>`).join('');
  if(!matches.length&&!products.length)html+='<div class="empty" style="padding:24px">Aucun résultat.</div>';
  host.innerHTML=html;
  $$('[data-command-view]',host).forEach(b=>b.addEventListener('click',()=>{closeSearch();switchView(b.dataset.commandView)}));
  $$('[data-command-product]',host).forEach(b=>b.addEventListener('click',()=>{const h=b.dataset.commandProduct;closeSearch();switchView('products');requestAnimationFrame(()=>{const row=$(`#productsBody tr[data-handle="${CSS.escape(h)}"]`);row?.scrollIntoView({behavior:'smooth',block:'center'});row?.animate([{background:'#fff4bd'},{background:'transparent'}],{duration:1100})})}));
}
function openSearch(){const overlay=$('#searchOverlay');overlay?.classList.add('open');overlay?.setAttribute('aria-hidden','false');const input=$('#commandInput');if(input){input.value='';renderCommandResults('');setTimeout(()=>input.focus(),30)}}
function closeSearch(){const overlay=$('#searchOverlay');overlay?.classList.remove('open');overlay?.setAttribute('aria-hidden','true')}

function closePopovers(except=null){[['notificationsPopover','notificationsToggle'],['accountPopover','accountToggle']].forEach(([pid,bid])=>{if(except===pid)return;$('#'+pid)?.classList.remove('open');$('#'+bid)?.classList.remove('active')})}
function togglePopover(id,buttonId){const p=$('#'+id),b=$('#'+buttonId);if(!p)return;const open=!p.classList.contains('open');closePopovers(id);p.classList.toggle('open',open);b?.classList.toggle('active',open)}

function routeAssistant(text, host){
  const q=(text||'').trim().toLowerCase(); if(!q){host.classList.add('hidden');return}
  let target='home', label='Accueil', message='Je peux vous orienter dans le cockpit NOVA10.';
  const routes=[
    [/produit|catalogue|stock/,'products','Produits','Ouvrez le catalogue pour gérer vos produits, prix, stock et fournisseurs.'],
    [/commande|client|vente/,'orders','Commandes','Ouvrez les commandes pour suivre ventes, paiements et traitements.'],
    [/paiement|finance|chiffre|revenu/,'finances','Finances','Ouvrez Finances pour préparer le prestataire de paiement et suivre les ventes.'],
    [/trafic|analyse|session|conversion/,'analytics','Analyses de données','Ouvrez les analyses pour examiner le trafic, les produits consultés et la conversion.'],
    [/boutique|site|storefront/,'storefront','Boutique en ligne','Ouvrez Boutique en ligne pour vérifier le storefront NOVA10.'],
    [/marché|pays|international/,'markets','Marchés','Ouvrez Marchés pour gérer les zones commerciales.'],
    [/réduction|promo|code/,'discounts','Réductions','Ouvrez Réductions pour préparer les remises.'],
    [/contenu|faq|livraison|retour/,'content','Contenu','Ouvrez Contenu pour gérer les pages de la boutique.']
  ];
  for(const [rx,v,l,m] of routes){if(rx.test(q)){target=v;label=l;message=m;break}}
  host.innerHTML=`${escapeHtml(message)} <a href="#${target}" data-assistant-jump="${target}">Ouvrir ${escapeHtml(label)}</a>`;host.classList.remove('hidden');
  $('[data-assistant-jump]',host)?.addEventListener('click',e=>{e.preventDefault();switchView(e.currentTarget.dataset.assistantJump)});
}

async function logout(){try{await api('/api/admin/logout',{method:'POST',body:'{}'})}catch{}closePopovers();showLogin();const p=$('#password');if(p)p.value='';history.replaceState(null,'',location.pathname)}

function bindUI(){
  installShopifyHoverParity();
  $$('.nav button[data-view]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  $$('[data-jump]').forEach(el=>el.addEventListener('click',()=>switchView(el.dataset.jump)));
  $$('[data-collapsible] .group-head button').forEach(btn=>btn.addEventListener('click',()=>btn.closest('[data-collapsible]')?.classList.toggle('collapsed')));
  $('#refresh')?.addEventListener('click',()=>loadData());
  $('#menuToggle')?.addEventListener('click',()=>$('#sidebar')?.classList.toggle('open'));
  $('#globalSearchOpen')?.addEventListener('click',openSearch);
  $('#commandInput')?.addEventListener('input',e=>renderCommandResults(e.target.value));
  $('#searchOverlay')?.addEventListener('mousedown',e=>{if(e.target===e.currentTarget)closeSearch()});
  $('#notificationsToggle')?.addEventListener('click',e=>{e.stopPropagation();togglePopover('notificationsPopover','notificationsToggle')});
  $('#accountToggle')?.addEventListener('click',e=>{e.stopPropagation();togglePopover('accountPopover','accountToggle')});
  $('#accountPopover')?.addEventListener('click',e=>e.stopPropagation());$('#notificationsPopover')?.addEventListener('click',e=>e.stopPropagation());
  $('[data-account-settings]')?.addEventListener('click',()=>{closePopovers();switchView('settings')});
  $('[data-account-logout]')?.addEventListener('click',logout);$('#logout')?.addEventListener('click',logout);
  $('#assistantTop')?.addEventListener('click',()=>switchView('agentic'));
  $('#homeAssistantForm')?.addEventListener('submit',e=>{e.preventDefault();routeAssistant($('#homeAssistantInput')?.value,$('#homeAssistantResponse'))});
  $('#agenticForm')?.addEventListener('submit',e=>{e.preventDefault();routeAssistant($('#agenticInput')?.value,$('#agenticResponse'))});
  $('#createDiscount')?.addEventListener('click',()=>toast('Module de création de réduction prêt à être connecté.'));
  document.addEventListener('click',()=>closePopovers());
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}
    if(e.key==='Escape'){closeSearch();closePopovers();$('#sidebar')?.classList.remove('open')}
  });
  window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(v&&$(`.view[data-view="${CSS.escape(v)}"]`))switchView(v,{push:false})});
}

async function boot(){
  bindUI();
  $('#loginForm')?.addEventListener('submit',async e=>{e.preventDefault();const err=$('#loginError');err?.classList.add('hidden');try{await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:$('#password').value})});showApp();await loadData();const desired=location.hash.slice(1)||'home';switchView(desired,{push:false})}catch(ex){if(err){err.textContent='Mot de passe incorrect.';err.classList.remove('hidden')}}});
  try{await api('/api/admin/me');showApp();await loadData();const desired=location.hash.slice(1)||'home';switchView(desired,{push:false})}catch(err){showLogin()}
}

document.addEventListener('DOMContentLoaded',boot);