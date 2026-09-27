/* NOVA10 Final — screenshot parity layer, 2026-09-27.
   Loaded after the base storefront scripts so the public homepage matches
   the merchant's current Horizon/Shopify reference capture. */

productCard = function productCardShopifyReference(p){
  return `<article class="product-card">
    <a class="product-link" href="#/produit/${p.handle}" aria-label="${esc(p.title)}"></a>
    <div class="product-media"><img src="${p.image}" alt="${esc(p.title)}" loading="lazy"><span class="sold-chip">Épuisé</span></div>
    <h3 class="product-title">${esc(p.title)}</h3>
    <p class="product-price">${fmt(p.price)}</p>
  </article>`;
};

homeTemplate = function homeTemplateShopifyReference(){
  const homepageProducts = [...PRODUCTS]
    .sort((a,b)=>a.title.localeCompare(b.title,'fr',{sensitivity:'base'}))
    .slice(0,8);

  return `
    <section class="home-hero shopify-reference-hero">
      <div class="hero-frame">
        <div class="hero-media hero-media-single">
          <img src="/assets/images/nova10-pressure-washer.jpg" alt="Nettoyeur haute pression sans fil">
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>Browse our latest products</h1>
          <a class="button hero-shop-button" href="#/collection/top-10-nova10">Shop all</a>
        </div>
      </div>
    </section>
    <section class="home-section products-section nova-page shopify-home-products">
      <div class="section-head"><h2>Produits</h2><a class="view-all" href="#/collection/top-10-nova10">View all</a></div>
      ${productsGrid(homepageProducts)}
    </section>`;
};
