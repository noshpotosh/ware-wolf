(() => {
  const variantSelect = document.querySelector('.product-form select');
  const currentPrice = document.querySelector(
    '[data-product-current-price]'
  );
  const comparePrice = document.querySelector(
    '[data-product-compare-price]'
  );
  const submitButton = document.querySelector('.product-form__submit');

  function updateSelectedVariant() {
    if (!variantSelect || !currentPrice || !submitButton) return;

    const selectedOption = variantSelect.selectedOptions[0];
    const variantIsAvailable = selectedOption.dataset.available === 'true';

    currentPrice.textContent = selectedOption.dataset.price;
    submitButton.disabled = !variantIsAvailable;
    submitButton.textContent = variantIsAvailable
      ? 'Add to cart'
      : 'Sold out';

    if (!comparePrice) return;

    comparePrice.textContent = selectedOption.dataset.comparePrice;
    comparePrice.hidden = selectedOption.dataset.onSale !== 'true';
  }

  variantSelect?.addEventListener('change', updateSelectedVariant);

  const sections = document.querySelectorAll(
    '[data-product-recommendations]'
  );

  function loadRecommendations(section) {
    fetch(section.dataset.url)
      .then((response) => {
        if (!response.ok) throw new Error('Recommendations unavailable');
        return response.text();
      })
      .then((text) => {
        const responseDocument = new DOMParser().parseFromString(
          text,
          'text/html'
        );
        const recommendations = responseDocument.querySelector(
          '[data-product-recommendations]'
        );

        if (!recommendations?.querySelector('.product-card')) return;

        section.innerHTML = recommendations.innerHTML;
        section.hidden = false;
      })
      .catch(() => {
        // The server-rendered collection remains available if the API fails.
      });
  }

  sections.forEach((section) => loadRecommendations(section));
})();
