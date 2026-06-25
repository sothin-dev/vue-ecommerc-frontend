<template>
  <div class="not-found">
    <div class="not-found__content animate-fade-in">
      <div class="not-found__icon-wrap">
        <span class="not-found__code">404</span>
      </div>
      <h1 class="not-found__title">Page Not Found</h1>
      <p class="not-found__desc">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="not-found__actions">
        <RouterLink to="/" class="btn btn-primary btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Go Home
        </RouterLink>
        <RouterLink to="/products" class="btn btn-outline btn-lg">
          Browse Products
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 75vh; display: grid; place-items: center;
  padding: 3rem 1.5rem; text-align: center;
}
.not-found__content { max-width: 440px; }
.not-found__icon-wrap {
  width: 120px; height: 120px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  display: grid; place-items: center; margin: 0 auto 1.75rem;
}
.not-found__code {
  font-size: 3rem; font-weight: 800; color: var(--primary);
  letter-spacing: -.03em;
}
.not-found__title {
  font-size: 2rem; font-weight: 800; letter-spacing: -.02em;
  margin-bottom: .75rem;
}
.not-found__desc {
  font-size: 1rem; color: var(--gray-500); line-height: 1.6;
  margin-bottom: 2rem;
}
.not-found__actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
</style>
