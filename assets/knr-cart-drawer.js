document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('knr-cart-drawer');
  const overlay = document.getElementById('knr-cart-overlay');
  const closeBtn = document.getElementById('knr-drawer-close');
  const cartIcon = document.querySelector('a.knr-icon-link[href="/cart"]');
  const viewMain = document.getElementById('knr-drawer-view-main');
  const viewSamples = document.getElementById('knr-drawer-view-samples');
  
  const btnTriggerSamples = document.getElementById('knr-trigger-samples-view');
  const btnBackToMain = document.getElementById('knr-back-to-main');
  const btnValidateSamples = document.getElementById('knr-validate-samples-choice');

  if (!drawer) return;

  const THRESHOLD_DELIVERY = parseInt(drawer.getAttribute('data-threshold-delivery'));
  const THRESHOLD_SAMPLES = parseInt(drawer.getAttribute('data-threshold-samples'));
  const THRESHOLD_GIFT = parseInt(drawer.getAttribute('data-threshold-gift'));
  const GIFT_VARIANT_ID = parseInt(drawer.getAttribute('data-gift-variant-id'));

  const formatMoney = (cents) => {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  };

  const setLoader = (isLoading) => {
    if (isLoading) drawer.classList.add('loading');
    else drawer.classList.remove('loading');
  };

  const openDrawer = () => {
    drawer.classList.add('active');
    overlay.classList.add('active');
    updateCartDrawer();
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    switchToView('main');
  };

  const switchToView = (viewName) => {
    if (viewName === 'samples') {
      viewMain.classList.remove('active');
      viewSamples.classList.add('active');
    } else {
      viewSamples.classList.remove('active');
      viewMain.classList.add('active');
    }
  };

  if (cartIcon) {
    cartIcon.onclick = (e) => {
      e.preventDefault();
      openDrawer();
    };
  }

  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;
  if (btnTriggerSamples) btnTriggerSamples.onclick = () => switchToView('samples');
  if (btnBackToMain) btnBackToMain.onclick = () => switchToView('main');
  if (btnValidateSamples) btnValidateSamples.onclick = () => switchToView('main');

  const refreshCartHTML = async () => {
    try {
      const res = await fetch('/cart?sections=knr-cart-drawer');
      const data = await res.json();
      const htmlString = data['knr-cart-drawer'];
      if (!htmlString) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      document.getElementById('knr-cart-items-list').innerHTML = doc.getElementById('knr-cart-items-list').innerHTML;
      document.getElementById('knr-drawer-subtotal-val').textContent = doc.getElementById('knr-drawer-subtotal-val').textContent;
      document.getElementById('knr-checkout-btn-price').textContent = doc.getElementById('knr-checkout-btn-price').textContent;
      document.getElementById('knr-drawer-count').textContent = doc.getElementById('knr-drawer-count').textContent;

      const headerBadge = document.querySelector('.knr-cart-badge');
      if (headerBadge) headerBadge.textContent = doc.getElementById('knr-drawer-count').textContent;

      bindCartEvents();
    } catch (err) {
      console.error("Erreur de rafraîchissement:", err);
    }
  };

  const recalculateCartDOM = () => {
    let totalCents = 0;
    let totalCount = 0;

    document.querySelectorAll('.knr-cart-item:not(.fade-out)').forEach(item => {
      const price = parseInt(item.getAttribute('data-price')) || 0;
      const qtyValEl = item.querySelector('.qty-val');
      const qty = qtyValEl ? parseInt(qtyValEl.textContent) : 1;

      const isGiftOrSample = item.querySelector('.knr-gift-badge') !== null;
      const linePrice = isGiftOrSample ? 0 : price * qty;

      totalCents += linePrice;
      totalCount += qty;

      const priceEl = item.querySelector('.knr-item-price');
      if (priceEl && !isGiftOrSample) {
        priceEl.textContent = formatMoney(linePrice);
      }
    });

    const subtotalEl = document.getElementById('knr-drawer-subtotal-val');
    const checkoutBtnPriceEl = document.getElementById('knr-checkout-btn-price');
    const countEl = document.getElementById('knr-drawer-count');
    const headerBadge = document.querySelector('.knr-cart-badge');

    if (subtotalEl) subtotalEl.textContent = formatMoney(totalCents);
    if (checkoutBtnPriceEl) checkoutBtnPriceEl.textContent = formatMoney(totalCents);
    if (countEl) countEl.textContent = totalCount;
    if (headerBadge) headerBadge.textContent = totalCount;

    updateProgressBarDOM(totalCents);
  };

  const updateProgressBarDOM = (totalPrice) => {
    const progressFill = document.getElementById('knr-progress-fill');
    const msgEl = document.getElementById('knr-progress-message');

    let percent = 0;
    if (totalPrice <= 0) {
      percent = 0;
    } else if (totalPrice < THRESHOLD_DELIVERY) {
      percent = (totalPrice / THRESHOLD_DELIVERY) * 20;
    } else if (totalPrice < THRESHOLD_SAMPLES) {
      const rangePrice = THRESHOLD_SAMPLES - THRESHOLD_DELIVERY;
      percent = 20 + ((totalPrice - THRESHOLD_DELIVERY) / rangePrice) * 30;
    } else if (totalPrice < THRESHOLD_GIFT) {
      const rangePrice = THRESHOLD_GIFT - THRESHOLD_SAMPLES;
      percent = 50 + ((totalPrice - THRESHOLD_SAMPLES) / rangePrice) * 30;
    } else {
      const maxCapPrice = THRESHOLD_GIFT + 2000;
      percent = totalPrice >= maxCapPrice ? 100 : 80 + ((totalPrice - THRESHOLD_GIFT) / 2000) * 20;
    }

    if (progressFill) progressFill.style.width = `${percent}%`;

    document.getElementById('node-delivery').classList.toggle('active', totalPrice >= THRESHOLD_DELIVERY);
    document.getElementById('node-samples').classList.toggle('active', totalPrice >= THRESHOLD_SAMPLES);
    document.getElementById('node-gift').classList.toggle('active', totalPrice >= THRESHOLD_GIFT);

    if (totalPrice < THRESHOLD_DELIVERY) {
      const diff = ((THRESHOLD_DELIVERY - totalPrice) / 100).toFixed(2);
      msgEl.innerHTML = `Plus que <strong>${diff} €</strong> pour bénéficier de la <strong>livraison offerte</strong>.`;
    } else if (totalPrice < THRESHOLD_SAMPLES) {
      const diff = ((THRESHOLD_SAMPLES - totalPrice) / 100).toFixed(2);
      msgEl.innerHTML = `Livraison offerte ! Plus que <strong>${diff} €</strong> pour débloquer vos <strong>échantillons offerts</strong>.`;
    } else if (totalPrice < THRESHOLD_GIFT) {
      const diff = ((THRESHOLD_GIFT - totalPrice) / 100).toFixed(2);
      msgEl.innerHTML = `Échantillons débloqués ! Plus que <strong>${diff} €</strong> pour obtenir votre <strong>produit cadeau</strong> !`;
    } else {
      msgEl.textContent = "Bravo, vous bénéficiez de tous vos cadeaux !";
    }
  };

  const updateCartDrawer = async () => {
    try {
      const cartRes = await fetch('/cart.js');
      const cart = await cartRes.json();
      const totalPrice = cart.total_price;

      updateProgressBarDOM(totalPrice);

      let cartChanged = false;
      const hasGift = cart.items.some(item => item.variant_id === GIFT_VARIANT_ID);

      if (totalPrice >= THRESHOLD_GIFT && !hasGift && GIFT_VARIANT_ID) {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1, properties: { _gift: 'true' } })
        });
        cartChanged = true;
      } else if (totalPrice < THRESHOLD_GIFT && hasGift && GIFT_VARIANT_ID) {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: GIFT_VARIANT_ID.toString(), quantity: 0 })
        });
        cartChanged = true;
      }

      const footerSamplesSelection = document.getElementById('knr-footer-samples-selection');
      const currentSamples = cart.items.filter(item => item.properties && item.properties._sample === 'true');
      const footerSamplesIndicator = document.getElementById('knr-footer-samples-indicator');
      const fractionEl = document.getElementById('knr-samples-fraction');
      const selectedBtnCount = document.getElementById('knr-samples-selected-btn-count');

      if (totalPrice >= THRESHOLD_SAMPLES) {
        if (footerSamplesSelection) footerSamplesSelection.style.display = 'block';
        if (footerSamplesIndicator) footerSamplesIndicator.textContent = `${currentSamples.length} échantillons offerts.`;
        if (fractionEl) fractionEl.textContent = `${currentSamples.length}/3`;
        if (selectedBtnCount) selectedBtnCount.textContent = `${currentSamples.length}/3`;

        document.querySelectorAll('.knr-sample-card').forEach(card => {
          const vId = parseInt(card.getAttribute('data-variant-id'));
          const isSelected = currentSamples.some(s => s.variant_id === vId);
          const link = card.querySelector('.knr-sample-add-link');
          if (link) {
            link.textContent = isSelected ? "Retirer" : "Ajouter";
            link.classList.toggle('added', isSelected);
          }
        });

        const thumbsSlots = document.getElementById('knr-thumbs-slots');
        if (thumbsSlots) {
          thumbsSlots.innerHTML = '';
          for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot-box';
            if (currentSamples[i]) {
              slot.innerHTML = `<img src="${currentSamples[i].image}" alt="Échantillon">`;
            } else {
              slot.innerHTML = `<svg class="svg-plus" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#000000" stroke-width="1.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>`;
            }
            thumbsSlots.appendChild(slot);
          }
        }
      } else {
        if (footerSamplesSelection) footerSamplesSelection.style.display = 'none';
        if (currentSamples.length > 0) {
          const updates = {};
          currentSamples.forEach(s => { updates[s.key] = 0; });
          await fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
          });
          cartChanged = true;
        }
      }

      if (cartChanged) {
        await refreshCartHTML();
        await updateCartDrawer();
      } else {
        await refreshCartHTML();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const bindCartEvents = () => {
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.onclick = async () => {
        const key = btn.getAttribute('data-key');
        const qty = parseInt(btn.getAttribute('data-qty'));
        const itemRow = btn.closest('.knr-cart-item');
        const qtyValEl = itemRow ? itemRow.querySelector('.qty-val') : null;

        if (qty === 0) {
          if (itemRow) itemRow.classList.add('fade-out');
        } else if (qtyValEl) {
          qtyValEl.textContent = qty;
          itemRow.querySelector('.qty-minus').setAttribute('data-qty', qty - 1);
          itemRow.querySelector('.qty-plus').setAttribute('data-qty', qty + 1);
        }

        recalculateCartDOM();
        setLoader(true);
        try {
          await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: key, quantity: qty })
          });
          await updateCartDrawer();
        } finally {
          setLoader(false);
        }
      };
    });

    document.querySelectorAll('.knr-item-remove').forEach(btn => {
      btn.onclick = async () => {
        const key = btn.getAttribute('data-key');
        const itemRow = btn.closest('.knr-cart-item');
        if (itemRow) itemRow.classList.add('fade-out');

        recalculateCartDOM();
        setLoader(true);
        try {
          await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: key, quantity: 0 })
          });
          await updateCartDrawer();
        } finally {
          setLoader(false);
        }
      };
    });

    document.querySelectorAll('.knr-sample-add-link').forEach(link => {
      link.onclick = async () => {
        const vId = parseInt(link.getAttribute('data-variant-id'));
        const isAdded = link.classList.contains('added');

        setLoader(true);
        
        link.classList.toggle('added', !isAdded);
        link.textContent = !isAdded ? "Retirer" : "Ajouter";

        try {
          if (isAdded) {
            await fetch('/cart/change.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: vId.toString(), quantity: 0 })
            });
          } else {
            const cartRes = await fetch('/cart.js');
            const cart = await cartRes.json();
            const currentSamples = cart.items.filter(item => item.properties && item.properties._sample === 'true');

            if (currentSamples.length >= 3) {
              alert("Vous pouvez sélectionner un maximum de 3 échantillons gratuits.");
              link.classList.toggle('added', false);
              link.textContent = "Ajouter";
              return;
            }

            await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: vId, quantity: 1, properties: { _sample: 'true' } })
            });
          }
          await updateCartDrawer();
        } catch (err) {
          console.error("Erreur lors de l'action échantillon:", err);
        } finally {
          setLoader(false);
        }
      };
    });
  };

  const mainSubmitBtn = document.getElementById('knr-main-submit-btn');
  if (mainSubmitBtn) {
    mainSubmitBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const variantIdInput = document.getElementById('knr-variant-id-input');
      if (!variantIdInput) return;

      mainSubmitBtn.textContent = "...";
      mainSubmitBtn.disabled = true;

      openDrawer();
      setLoader(true);

      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parseInt(variantIdInput.value), quantity: 1 })
        });
        await refreshCartHTML();
        await updateCartDrawer();
      } catch (err) {
        console.error(err);
      } finally {
        mainSubmitBtn.textContent = "Ajouter au panier";
        mainSubmitBtn.disabled = false;
        setLoader(false);
      }
    };
  }

  bindCartEvents();
});
