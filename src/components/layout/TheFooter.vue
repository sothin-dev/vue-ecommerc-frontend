<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand-col">
          <RouterLink to="/" class="footer__logo">
            <span class="footer__logo-icon">◆</span>
            ShopVue
          </RouterLink>
          <p class="footer__desc">Your one-stop online shop for quality products at great prices. Fast shipping, easy returns.</p>
          <div class="footer__socials">
            <a href="#" class="footer__social" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" class="footer__social" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" class="footer__social" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
          </div>
        </div>
        <div class="footer__links-col">
          <h4 class="footer__heading">Shop</h4>
          <RouterLink to="/products" class="footer__link">All Products</RouterLink>
          <RouterLink to="/products?sort=newest" class="footer__link">New Arrivals</RouterLink>
          <RouterLink to="/products?sort=on_sale" class="footer__link">Best Deals</RouterLink>
          <RouterLink to="/products?sort=price_asc" class="footer__link">Under $50</RouterLink>
        </div>
        <div class="footer__links-col">
          <h4 class="footer__heading">Account</h4>
          <RouterLink to="/profile" class="footer__link">My Profile</RouterLink>
          <RouterLink to="/orders" class="footer__link">My Orders</RouterLink>
          <RouterLink to="/wishlist" class="footer__link">Wishlist</RouterLink>
          <RouterLink to="/cart" class="footer__link">Cart</RouterLink>
        </div>
        <div class="footer__links-col">
          <h4 class="footer__heading">Support</h4>
          <a href="#" class="footer__link">Help Center</a>
          <a href="#" class="footer__link">Contact Us</a>
          <a href="#" class="footer__link">Returns Policy</a>
          <a href="#" class="footer__link">FAQ</a>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; {{ new Date().getFullYear() }} ShopVue. All rights reserved.</p>
        <div class="footer__bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--gray-950); color: #94a3b8;
  margin-top: 5rem; position: relative;
}
.footer::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), #a855f7, var(--secondary), var(--primary));
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}
.footer__top {
  display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr;
  gap: 2.5rem; padding: 3.5rem 0 2.5rem;
}
.footer__logo {
  display: inline-flex; align-items: center; gap: .45rem;
  font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 1rem;
}
.footer__logo-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; font-size: .8rem;
}
.footer__desc {
  font-size: .875rem; line-height: 1.7; color: #64748b; margin-bottom: 1.25rem;
}
.footer__socials { display: flex; gap: .5rem; }
.footer__social {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid #334155; display: grid; place-items: center;
  color: #64748b; transition: all .2s;
}
.footer__social:hover {
  border-color: var(--primary); color: var(--primary);
  background: rgba(99,102,241,.1); transform: translateY(-2px);
}
.footer__heading {
  color: #fff; font-size: .75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  margin-bottom: 1rem;
}
.footer__link {
  display: block; font-size: .85rem; color: #64748b;
  margin-bottom: .55rem; transition: all .2s;
}
.footer__link:hover { color: #e2e8f0; transform: translateX(3px); }
.footer__bottom {
  border-top: 1px solid #1e293b;
  padding: 1.5rem 0; display: flex;
  align-items: center; justify-content: space-between;
  font-size: .8rem; color: #475569;
}
.footer__bottom-links { display: flex; gap: 1.5rem; }
.footer__bottom-links a { transition: color .2s; }
.footer__bottom-links a:hover { color: #94a3b8; }

@media (max-width: 768px) {
  .footer__top { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .footer__brand-col { grid-column: span 2; }
  .footer__bottom { flex-direction: column; gap: .75rem; text-align: center; }
}
@media (max-width: 480px) {
  .footer__top { grid-template-columns: 1fr; }
  .footer__brand-col { grid-column: span 1; }
}
</style>
