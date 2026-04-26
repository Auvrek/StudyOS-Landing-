/* stripe.js — Placeholders de integración Stripe
 *
 * TODO: Para activar pagos reales:
 * 1. Crear productos y precios en Stripe Dashboard → https://dashboard.stripe.com/products
 * 2. Pegar los priceId en STRIPE_CONFIG.prices abajo
 * 3. Pegar la publishableKey en STRIPE_CONFIG.publishableKey
 * 4. Crear la Netlify Function `create-checkout-session` en /netlify/functions/
 *    (template disponible en README.md)
 * 5. Crear la Netlify Function `create-portal-session` para el Customer Portal
 */

(function () {
  'use strict';

  const STRIPE_CONFIG = {
    publishableKey: '', // TODO: pk_live_xxx o pk_test_xxx

    prices: {
      // Subscripciones mensuales
      basic_monthly:  '',  // price_xxx desde Stripe Dashboard
      plus_monthly:   '',
      pro_monthly:    '',

      // Subscripciones anuales
      basic_yearly:   '',
      plus_yearly:    '',
      pro_yearly:     '',

      // Pagos únicos (créditos)
      credits_mini:     '',  // 3 créditos · €1,50
      credits_standard: '',  // 10 créditos · €5,00
      credits_large:    '',  // 20 créditos · €8,75
    },

    // Netlify Functions que crean las sesiones de Stripe Checkout
    checkoutEndpoint: '/.netlify/functions/create-checkout-session',
    portalEndpoint:   '/.netlify/functions/create-portal-session',

    // URL a la que redirige Stripe después de pago exitoso
    successUrl: window.location.origin + '/dashboard?checkout=success',
    cancelUrl:  window.location.href,
  };

  async function selectPlan(planId, billingCycle) {
    billingCycle = billingCycle || 'monthly';

    // El plan Trial no requiere Stripe — redirigir a signup
    if (planId === 'trial') {
      window.location.href = '/signup?trial=true';
      return;
    }

    const priceKey = planId + '_' + billingCycle;
    const priceId  = STRIPE_CONFIG.prices[priceKey];

    if (!priceId || !STRIPE_CONFIG.publishableKey) {
      console.warn('[Stripe] Not configured for:', priceKey);
      showSoonModal(planId, billingCycle);
      return;
    }

    setButtonLoading(true);

    try {
      const res  = await fetch(STRIPE_CONFIG.checkoutEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
          successUrl: STRIPE_CONFIG.successUrl,
          cancelUrl:  STRIPE_CONFIG.cancelUrl,
        }),
      });

      if (!res.ok) throw new Error('Checkout endpoint error: ' + res.status);

      const { url } = await res.json();
      window.location.href = url;

    } catch (err) {
      console.error('[Stripe] Checkout error:', err);
      showSoonModal(planId, billingCycle);
    } finally {
      setButtonLoading(false);
    }
  }

  async function buyCredits(packId) {
    const priceKey = 'credits_' + packId;
    const priceId  = STRIPE_CONFIG.prices[priceKey];

    if (!priceId || !STRIPE_CONFIG.publishableKey) {
      console.warn('[Stripe] Credits not configured for:', priceKey);
      showSoonModal('credits_' + packId);
      return;
    }

    setButtonLoading(true);

    try {
      const res = await fetch(STRIPE_CONFIG.checkoutEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: 'payment', // pago único, no suscripción
          successUrl: STRIPE_CONFIG.successUrl,
          cancelUrl:  STRIPE_CONFIG.cancelUrl,
        }),
      });

      if (!res.ok) throw new Error('Checkout endpoint error: ' + res.status);

      const { url } = await res.json();
      window.location.href = url;

    } catch (err) {
      console.error('[Stripe] Credits checkout error:', err);
      showSoonModal('credits_' + packId);
    } finally {
      setButtonLoading(false);
    }
  }

  async function openCustomerPortal() {
    // Para que usuarios gestionen su suscripción (cambio, cancelación, facturas)
    try {
      const res = await fetch(STRIPE_CONFIG.portalEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Portal endpoint error: ' + res.status);

      const { url } = await res.json();
      window.location.href = url;

    } catch (err) {
      console.error('[Stripe] Portal error:', err);
      alert('No pudimos abrir el portal de gestión. Intentá de nuevo en unos minutos.');
    }
  }

  function showSoonModal(planId, cycle) {
    // Modal placeholder mientras Stripe no está conectado
    const overlay = document.getElementById('soon-modal');
    if (overlay) {
      overlay.classList.add('open');
      return;
    }

    // Fallback alert si no hay modal en el DOM
    const msg = window.StudyOS?.i18n?.t
      ? window.StudyOS.i18n.t('pricing_preview.soon_modal') || '¡Próximamente! Te avisamos cuando esté listo.'
      : '¡Próximamente! Te avisamos cuando esté listo.';
    alert(msg);
  }

  function setButtonLoading(loading) {
    document.querySelectorAll('[data-action="select-plan"], [data-action="buy-credits"]').forEach(btn => {
      btn.disabled = loading;
      if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = '...';
      } else if (btn.dataset.originalText) {
        btn.textContent = btn.dataset.originalText;
        delete btn.dataset.originalText;
      }
    });
  }

  // Exponer API en window para que main.js pueda enganchar los listeners
  window.StudyOS = window.StudyOS || {};
  window.StudyOS.selectPlan          = selectPlan;
  window.StudyOS.buyCredits          = buyCredits;
  window.StudyOS.openCustomerPortal  = openCustomerPortal;

})();
