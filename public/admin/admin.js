const euro = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(n||0));
const num = n => new Intl.NumberFormat('fr-FR').format(Number(n||0));
let DATA = null;

async function api(path, options={}){
  const res = await fetch(path,{credentials:'same-origin',headers:{'content-type':'application/json',...(options.headers||{})},...options});
  let data={}; try{data=await res.json()}catch{}
  if(res.status===401) throw Object.assign(new Error('unauthorized'),{status:401});
  if(!res.ok) throw new Error(data.error||'Erreur');
  return data;
}

function showLogin(){document.getElementById('loginView').classList.remove('hidden');document.getElementById('adminApp').classList.add('hidden')}
function showApp(){document.getElementById('loginView').classList.add('hidden');document.getElementById('adminApp').classList.remove('hidden')}

function renderBars(hostId, series){
  const host=document.getElementById(hostId); if(!host)return;
  const max=Math.max(1,...series.map(x=>x.sessions||0));
  host.innerHTML=series.map(x=>`<div class="bar-wrap" title="${x.day} — ${x.sessions} visiteurs"><div class="bar" style="height:${Math.max(2,(x.sessions/max)*100)}%"></div></div>`).join('');
}

function sourceRows(hostId, sources){
  const host=document.getElementById(hostId); if(!host)return;
  const rows=Object.entries(sources||{}).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...rows.map(x=>x[1]));
  host.innerHTML=rows.length?rows.slice(0,12).map(([k,v])=>`<div class="source-row"><span>${escapeHtml(k)}</span><div class="source-track"><div class="source-fill" style="width:${(v/max)*100}%"></div></div><b>${num(v)}</b></div>`).join(''):'<div class="empty">Aucune donnée pour le moment.</div>';
}

function topProductRows(hostId, map){
  const host=document.getElementById(hostId); if(!host)return;
  const rows=Object.entries(map||{}).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...rows.map(x=>x[1]));
  host.innerHTML=rows.length?rows.slice(0,10).map(([k,v])=>`<div class="source-row"><span>${escapeHtml(k)}</span><div class="source-track"><div class="source-fill" style="width:${(v/max)*100}%"></div></div><b>${num(v)}</b></div>`).join(''):'<div class="empty">Aucune vue produit enregistrée.</div>';
}

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function renderDashboard(){
  const d=DATA,t=d.today,l=d.last30;
  document.getElementById('mVisitors').textContent=num(t.sessions);
  document.getElementById('mViews').textContent=num(t.pageViews);
  document.getElementById('mOrders').textContent=num(t.orders);
  document.getElementById('mRevenue').textContent=euro(t.revenue);
  document.getElementById('sessions30').textContent=`${num(l.sessions)} sessions`;
  document.getElementById('readyProducts').textContent=`${d.operational.productsReady} / ${d.operational.productsTotal}`;
  document.getElementById('fProductViews').textContent=num(l.productViews);
  document.getElementById('fCart').textContent=num(l.addToCart);
  document.getElementById('fCheckout').textContent=num(l.checkouts);
  document.getElementById('fOrders').textContent=num(l.orders);
  document.getElementById('fConversion').textContent=l.sessions?`${((l.orders/l.sessions)*100).toFixed(2).replace('.',',')} %`:'0 %';
  renderBars('trafficChart',d.series);renderBars('analyticsChart',d.series);
  sourceRows('homeSources',l.sources);sourceRows('acqSources',l.sources);topProductRows('topProducts',l.products);
  document.getElementById('aVisitors').textContent=num(l.sessions);
  document.getElementById('aViews').textContent=num(l.pageViews);
  document.getElementById('aProducts').textContent=num(l.productViews);
  document.getElementById('aSearches').textContent=num(l.searches);
}

function renderOrders(){
  const body=document.getElementById('ordersBody'), empty=document.getElementById('ordersEmpty');
  const rows=DATA.orders||[]; empty.classList.toggle('hidden',rows.length>0);
  body.innerHTML=rows.map(o=>`<tr><td><b>#${escapeHtml(o.number||o.id||'—')}</b></td><td>${escapeHtml((o.createdAt||'').slice(0,10))}</td><td>${escapeHtml(o.email||'—')}</td><td><span class="pill">${escapeHtml(o.paymentStatus||'Payé')}</span></td><td>${escapeHtml(o.fulfillmentStatus||'Non traité')}</td><td><b>${euro(o.total)}</b></td></tr>`).join('');
}

function renderProducts(){
  const body=document.getElementById('productsBody');
  body.innerHTML=(DATA.products||[]).map(p=>`<tr data-handle="${escapeHtml(p.handle)}"><td><div class="prod"><img src="${escapeHtml(p.image)}" alt=""><div><b>${escapeHtml(p.title)}</b><br><span style="color:#6d7175">${escapeHtml(p.sku)}</span></div></div></td><td><input class="input small" data-k="price" type="number" min="0" step="0.01" value="${Number(p.price||0).toFixed(2)}"></td><td><input class="input small" data-k="stock" type="number" min="0" step="1" value="${Number(p.stock||0)}"></td><td><select class="input" data-k="status"><option value="draft" ${p.status==='draft'?'selected':''}>Brouillon</option><option value="active" ${p.status==='active'?'selected':''}>Actif</option><option value="archived" ${p.status==='archived'?'selected':''}>Archivé</option></select></td><td><input class="input wide" data-k="supplierName" value="${escapeHtml(p.supplierName||'')}" placeholder="Fournisseur"></td><td><input class="input wide" data-k="supplierSku" value="${escapeHtml(p.supplierSku||'')}" placeholder="SKU fournisseur"></td><td><button class="save-btn" data-save>Enregistrer</button></td></tr>`).join('');
  body.querySelectorAll('[data-save]').forEach(btn=>btn.addEventListener('click',saveProduct));
}

async function saveProduct(e){
  const tr=e.target.closest('tr'), handle=tr.dataset.handle, patch={};
  tr.querySelectorAll('[data-k]').forEach(el=>patch[el.dataset.k]=el.type==='number'?Number(el.value):el.value);
  e.target.disabled=true;e.target.textContent='…';
  try{await api(`/api/admin/products/${encodeURIComponent(handle)}`,{method:'PATCH',body:JSON.stringify(patch)});e.target.textContent='Enregistré';setTimeout(()=>{e.target.textContent='Enregistrer';e.target.disabled=false},900);await loadData(false)}catch(err){e.target.textContent='Erreur';e.target.disabled=false;alert(err.message)}
}

function renderStock(){
  const body=document.getElementById('stockBody');
  body.innerHTML=(DATA.products||[]).map(p=>`<tr><td><div class="prod"><img src="${escapeHtml(p.image)}"><b>${escapeHtml(p.title)}</b></div></td><td>${escapeHtml(p.sku)}</td><td><b>${num(p.stock)}</b></td><td>${p.stock>0?'<span class="pill">En stock</span>':'<span class="pill warn">Rupture</span>'}</td><td>${escapeHtml(p.supplierName||'Non renseigné')}</td></tr>`).join('');
}

function renderCustomers(){
  const host=document.getElementById('customersList'), list=DATA.customers||[];
  host.innerHTML=list.length?list.map(email=>`<div class="list-item"><div><b>${escapeHtml(email)}</b><div style="color:#6d7175;font-size:12px">Client NOVA10</div></div></div>`).join(''):'<div class="empty"><strong>Aucun client</strong>Les clients apparaîtront ici après les premières commandes.</div>';
}

function renderAll(){renderDashboard();renderOrders();renderProducts();renderStock();renderCustomers()}

async function loadData(showSpinner=true){
  const refresh=document.getElementById('refresh'); if(showSpinner){refresh.disabled=true;refresh.textContent='Actualisation…'}
  try{DATA=await api('/api/admin/dashboard');renderAll()}catch(err){if(err.status===401){showLogin();return}throw err}finally{refresh.disabled=false;refresh.textContent='Actualiser'}
}

function switchView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===name));
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  const btn=document.querySelector(`#nav button[data-view="${name}"]`);document.getElementById('topTitle').textContent=btn?btn.textContent.trim():'NOVA10';
  document.getElementById('sidebar').classList.remove('open');window.scrollTo(0,0);
}

async function boot(){
  try{await api('/api/admin/me');showApp();await loadData()}catch(err){showLogin()}
  document.getElementById('loginForm').addEventListener('submit',async e=>{e.preventDefault();const err=document.getElementById('loginError');err.classList.add('hidden');try{await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:document.getElementById('password').value})});showApp();await loadData()}catch(ex){err.textContent='Mot de passe incorrect.';err.classList.remove('hidden')}});
  document.querySelectorAll('#nav button[data-view]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  document.getElementById('refresh').addEventListener('click',()=>loadData());
  document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('logout').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST',body:'{}'})}catch{}showLogin();document.getElementById('password').value=''});
}

document.addEventListener('DOMContentLoaded',boot);
