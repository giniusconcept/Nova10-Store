const ADMIN_PASSWORD_SHA256 = '2e3f0e8b4a6b7094f7b75e308b4ed45ce548d098dcfe6016ad88fab96aab6b90';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SEED_PRODUCTS = [
  {rank:1,handle:'nettoyeur-haute-pression-sans-fil',title:'Nettoyeur haute pression sans fil',price:69.90,sku:'NOVA10-WASH-001',category:'Maison & Outdoor',image:'/assets/images/nova10-pressure-washer.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un nettoyeur haute pression sans fil conçu pour faciliter le nettoyage ponctuel de la voiture et des surfaces extérieures.'},
  {rank:2,handle:'serum-k-beauty-fermete-glow',title:'Sérum K‑Beauty fermeté & glow',price:24.90,sku:'NOVA10-SERUM-001',category:'Beauté',image:'/assets/images/nova10-kbeauty-serum.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un sérum visage inspiré des routines K‑Beauty pour compléter simplement votre rituel de soin quotidien.'},
  {rank:3,handle:'tumbler-isotherme-anti-fuite',title:'Tumbler isotherme anti-fuite',price:29.90,sku:'NOVA10-TUMBLER-001',category:'Lifestyle & Voyage',image:'/assets/images/nova10-tumbler.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un tumbler isotherme réutilisable pensé pour accompagner les boissons au bureau, en déplacement ou pendant les journées actives.'},
  {rank:4,handle:'basics-athleisure-compression',title:'Basics athleisure / compression',price:34.90,sku:'NOVA10-ATH-001',category:'Lifestyle & Voyage',image:'/assets/images/nova10-athleisure.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Des essentiels athleisure pensés pour accompagner les journées actives comme les moments de détente.'},
  {rank:5,handle:'sac-crossbody-voyage-compact',title:'Sac crossbody / voyage compact',price:29.90,sku:'NOVA10-BAG-001',category:'Lifestyle & Voyage',image:'/assets/images/nova10-crossbody.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un sac crossbody compact pensé pour garder vos essentiels à portée de main pendant les déplacements et les voyages.'},
  {rank:6,handle:'set-literie-confort-microfibre',title:'Set literie confort / microfibre',price:49.90,sku:'NOVA10-BED-001',category:'Maison & Outdoor',image:'/assets/images/nova10-bedding.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un ensemble de literie au style sobre, pensé pour apporter une touche confortable et facile à intégrer dans la chambre.'},
  {rank:7,handle:'accessoires-smartphone-modulaires',title:'Accessoires smartphone modulaires',price:24.90,sku:'NOVA10-PHONE-001',category:'Tech & Gaming',image:'/assets/images/nova10-phone-accessories.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Une sélection d’accessoires pratiques pour compléter l’usage quotidien de votre smartphone et garder vos essentiels bien organisés.'},
  {rank:8,handle:'appareil-beaute-visage-compact',title:'Appareil beauté visage compact',price:59.90,sku:'NOVA10-BEAUTY-001',category:'Beauté',image:'/assets/images/nova10-beauty-device.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un appareil beauté compact conçu pour s’intégrer facilement à une routine visage à domicile.'},
  {rank:9,handle:'ventilateur-portable-4-en-1',title:'Ventilateur portable 4-en-1',price:39.90,sku:'NOVA10-FAN-001',category:'Maison & Outdoor',image:'/assets/images/nova10-portable-fan.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Un ventilateur portable rechargeable au format compact, pratique pour le bureau, les déplacements et les journées chaudes.'},
  {rank:10,handle:'manette-gaming-sans-fil',title:'Manette gaming sans fil',price:49.90,sku:'NOVA10-GAME-001',category:'Tech & Gaming',image:'/assets/images/nova10-gaming-controller.jpg',stock:0,status:'draft',supplierName:'',supplierSku:'',supplierUrl:'',description:'Une manette sans fil au format moderne pour compléter un setup gaming et profiter d’une expérience de jeu plus confortable.'}
];

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}

function cookieValue(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function emptyMetric(day) {
  return { day, pageViews:0, sessions:0, productViews:0, searches:0, newsletterSignups:0, addToCart:0, checkouts:0, orders:0, revenue:0, sources:{}, pages:{}, products:{} };
}

function cleanText(v, max = 200) {
  return String(v ?? '').trim().slice(0, max);
}

export class NOVA10Store {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.storage = ctx.storage;
  }

  async ensureSeed() {
    if (!await this.storage.get('products')) await this.storage.put('products', SEED_PRODUCTS);
    if (!await this.storage.get('orders')) await this.storage.put('orders', []);
    if (!await this.storage.get('contacts')) await this.storage.put('contacts', []);
    if (!await this.storage.get('newsletter')) await this.storage.put('newsletter', []);
  }

  async isAdmin(request) {
    const token = cookieValue(request, 'nova10_admin');
    if (!token) return false;
    const session = await this.storage.get(`session:${token}`);
    if (!session || session.expiresAt < Date.now()) {
      if (session) await this.storage.delete(`session:${token}`);
      return false;
    }
    return true;
  }

  async handleTrack(request) {
    let body;
    try { body = await request.json(); } catch { return json({ok:false}, 400); }
    const event = cleanText(body.event, 40);
    const sessionId = cleanText(body.sessionId, 100);
    if (!event || !sessionId) return json({ok:false}, 400);
    const day = dayKey();
    const metricKey = `metric:${day}`;
    const metric = (await this.storage.get(metricKey)) || emptyMetric(day);
    const source = cleanText(body.source || 'Direct', 80) || 'Direct';
    const page = cleanText(body.page || '/', 180) || '/';
    const product = cleanText(body.product || '', 120);

    const seenKey = `seen:${day}:${sessionId}`;
    if (!await this.storage.get(seenKey)) {
      await this.storage.put(seenKey, 1);
      metric.sessions += 1;
      metric.sources[source] = (metric.sources[source] || 0) + 1;
    }

    if (event === 'page_view') {
      metric.pageViews += 1;
      metric.pages[page] = (metric.pages[page] || 0) + 1;
    } else if (event === 'product_view') {
      metric.productViews += 1;
      if (product) metric.products[product] = (metric.products[product] || 0) + 1;
    } else if (event === 'search') metric.searches += 1;
    else if (event === 'newsletter_signup') metric.newsletterSignups += 1;
    else if (event === 'add_to_cart') metric.addToCart += 1;
    else if (event === 'checkout_started') metric.checkouts += 1;

    await this.storage.put(metricKey, metric);
    return json({ok:true});
  }

  async dashboard() {
    await this.ensureSeed();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setUTCDate(d.getUTCDate() - i);
      const key = dayKey(d);
      days.push((await this.storage.get(`metric:${key}`)) || emptyMetric(key));
    }
    const products = await this.storage.get('products');
    const orders = await this.storage.get('orders');
    const contacts = await this.storage.get('contacts');
    const newsletter = await this.storage.get('newsletter');
    const today = days[days.length - 1];
    const sum = days.reduce((a,m) => {
      for (const k of ['pageViews','sessions','productViews','searches','newsletterSignups','addToCart','checkouts','orders','revenue']) a[k] += m[k] || 0;
      for (const [s,n] of Object.entries(m.sources || {})) a.sources[s] = (a.sources[s] || 0) + n;
      for (const [p,n] of Object.entries(m.products || {})) a.products[p] = (a.products[p] || 0) + n;
      return a;
    }, {pageViews:0,sessions:0,productViews:0,searches:0,newsletterSignups:0,addToCart:0,checkouts:0,orders:0,revenue:0,sources:{},products:{}});
    const customers = new Set((orders || []).map(o => o.email).filter(Boolean));
    return {
      today,
      last30: sum,
      series: days.map(m => ({day:m.day,pageViews:m.pageViews,sessions:m.sessions,orders:m.orders,revenue:m.revenue})),
      products,
      orders: (orders || []).slice().reverse().slice(0,100),
      customers: [...customers],
      contacts: (contacts || []).slice().reverse().slice(0,100),
      newsletterCount: (newsletter || []).length,
      operational: {
        paymentConnected: false,
        checkoutLive: false,
        productsReady: products.filter(p => p.stock > 0 && p.supplierName && p.status === 'active').length,
        productsTotal: products.length
      }
    };
  }

  async fetch(request) {
    await this.ensureSeed();
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/track' && request.method === 'POST') return this.handleTrack(request);

    if (path === '/api/newsletter' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ok:false}, 400); }
      const email = cleanText(body.email, 180).toLowerCase();
      if (!email || !email.includes('@')) return json({ok:false}, 400);
      const list = await this.storage.get('newsletter') || [];
      if (!list.some(x => x.email === email)) list.push({email, createdAt:new Date().toISOString()});
      await this.storage.put('newsletter', list.slice(-5000));
      return json({ok:true});
    }

    if (path === '/api/contact' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ok:false}, 400); }
      const item = {id:crypto.randomUUID(), firstName:cleanText(body.firstName,80), lastName:cleanText(body.lastName,80), email:cleanText(body.email,180), message:cleanText(body.message,4000), createdAt:new Date().toISOString()};
      if (!item.email || !item.message) return json({ok:false}, 400);
      const list = await this.storage.get('contacts') || [];
      list.push(item); await this.storage.put('contacts', list.slice(-2000));
      return json({ok:true});
    }

    if (path === '/api/products' && request.method === 'GET') {
      const products = await this.storage.get('products');
      return json({products});
    }

    if (path === '/api/admin/login' && request.method === 'POST') {
      let body; try { body = await request.json(); } catch { return json({ok:false,error:'Requête invalide'}, 400); }
      if (await sha256(body.password || '') !== ADMIN_PASSWORD_SHA256) return json({ok:false,error:'Mot de passe incorrect'}, 401);
      const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
      await this.storage.put(`session:${token}`, {expiresAt:Date.now()+SESSION_TTL_MS});
      return json({ok:true}, 200, {'set-cookie':`nova10_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS/1000)}`});
    }

    if (path === '/api/admin/logout' && request.method === 'POST') {
      const token = cookieValue(request, 'nova10_admin');
      if (token) await this.storage.delete(`session:${token}`);
      return json({ok:true}, 200, {'set-cookie':'nova10_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
    }

    if (path.startsWith('/api/admin/')) {
      if (!await this.isAdmin(request)) return json({ok:false,error:'Non autorisé'}, 401);

      if (path === '/api/admin/me' && request.method === 'GET') return json({ok:true,store:'NOVA10'});
      if (path === '/api/admin/dashboard' && request.method === 'GET') return json(await this.dashboard());
      if (path === '/api/admin/products' && request.method === 'GET') return json({products:await this.storage.get('products')});

      if (path.startsWith('/api/admin/products/') && request.method === 'PATCH') {
        const handle = decodeURIComponent(path.split('/').pop());
        let patch; try { patch = await request.json(); } catch { return json({ok:false}, 400); }
        const products = await this.storage.get('products');
        const index = products.findIndex(p => p.handle === handle);
        if (index < 0) return json({ok:false,error:'Produit introuvable'},404);
        const p = {...products[index]};
        if ('price' in patch) p.price = Math.max(0, Number(patch.price) || 0);
        if ('stock' in patch) p.stock = Math.max(0, Math.floor(Number(patch.stock) || 0));
        if ('status' in patch) p.status = ['draft','active','archived'].includes(patch.status) ? patch.status : p.status;
        if ('supplierName' in patch) p.supplierName = cleanText(patch.supplierName,160);
        if ('supplierSku' in patch) p.supplierSku = cleanText(patch.supplierSku,160);
        if ('supplierUrl' in patch) p.supplierUrl = cleanText(patch.supplierUrl,500);
        products[index] = p;
        await this.storage.put('products', products);
        return json({ok:true,product:p});
      }

      if (path === '/api/admin/orders' && request.method === 'GET') return json({orders:(await this.storage.get('orders')) || []});
      if (path === '/api/admin/contacts' && request.method === 'GET') return json({contacts:(await this.storage.get('contacts')) || []});
    }

    return json({ok:false,error:'Route API introuvable'},404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const id = env.NOVA10_DB.idFromName('primary');
      return env.NOVA10_DB.get(id).fetch(request);
    }
    if (url.pathname === '/admin') {
      const target = new URL(request.url); target.pathname = '/admin/index.html';
      return env.ASSETS.fetch(new Request(target, request));
    }
    return env.ASSETS.fetch(request);
  }
};
