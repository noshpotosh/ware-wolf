(() => {
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;

  const openButtons = document.querySelectorAll('[data-cart-open]');
  const closeTargets = drawer.querySelectorAll('[data-cart-close]');

  function openCart() {
    drawer.hidden = false;
    drawer.classList.add('is-open');
    openButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'true');
    });
  }

  function closeCart() {
    drawer.classList.remove('is-open');
    openButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
    window.setTimeout(() => {
      if (!drawer.classList.contains('is-open')) {
        drawer.hidden = true;
      }
    }, 250);
  }

  openButtons.forEach((button) => {
    button.addEventListener('click', openCart);
  });

  closeTargets.forEach((target) => {
    target.addEventListener('click', closeCart);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });
})();
