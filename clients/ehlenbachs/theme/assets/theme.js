(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector(
    '[data-primary-navigation]'
  );

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (!menuToggle || !navigation) return;

    const menuIsOpen = navigation.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(menuIsOpen));
  }

  menuToggle?.addEventListener('click', toggleMenu);

  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;

  const openButtons = document.querySelectorAll('[data-cart-open]');
  const closeTargets = drawer.querySelectorAll('[data-cart-close]');

  function openCart() {
    closeMenu();
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
    if (event.key !== 'Escape') return;

    closeMenu();
    closeCart();
  });
})();
