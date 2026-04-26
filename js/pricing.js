/* pricing.js — Toggle mensual/anual, actualización de precios */

(function () {
  'use strict';

  // Precios definidos aquí; actualizá estos valores si cambian los planes
  const PRICES = {
    basic:  { monthly: 8,  yearly: 77  },   // yearly = 8*12*0.80 redondeado
    plus:   { monthly: 15, yearly: 144 },
    pro:    { monthly: 22, yearly: 211 },
  };

  let currentCycle = 'monthly';

  function formatPrice(amount) {
    return '€' + amount;
  }

  function updatePriceDisplays(cycle) {
    currentCycle = cycle;

    document.querySelectorAll('[data-price-plan]').forEach(el => {
      const plan    = el.getAttribute('data-price-plan');
      const display = el.getAttribute('data-price-display') || 'amount';

      if (!PRICES[plan]) return;

      const price = PRICES[plan][cycle];

      if (display === 'amount') {
        el.textContent = formatPrice(price);
      } else if (display === 'period') {
        const key = cycle === 'yearly' ? '/año' : '/mes';
        // Usará la clave i18n si está disponible; si no, fallback literal
        const i18nKey = cycle === 'yearly'
          ? el.getAttribute('data-i18n-yearly') || key
          : el.getAttribute('data-i18n-monthly') || key;
        el.textContent = i18nKey;
      }
    });

    // Actualizar botones con data-plan y data-cycle
    document.querySelectorAll('[data-action="select-plan"]').forEach(btn => {
      btn.setAttribute('data-cycle', cycle);
    });

    // Badge de ahorro
    document.querySelectorAll('[data-yearly-badge]').forEach(badge => {
      badge.style.display = cycle === 'yearly' ? '' : 'none';
    });
  }

  function initPricingToggle() {
    const toggle    = document.querySelector('#pricing-toggle');
    const labelMon  = document.querySelector('[data-label="monthly"]');
    const labelYear = document.querySelector('[data-label="yearly"]');

    if (!toggle) return;

    toggle.addEventListener('change', () => {
      const cycle = toggle.checked ? 'yearly' : 'monthly';
      updatePriceDisplays(cycle);

      if (labelMon)  labelMon.classList.toggle('active', !toggle.checked);
      if (labelYear) labelYear.classList.toggle('active', toggle.checked);
    });
  }

  function initCreditCalc() {
    const slider  = document.querySelector('#credit-calc-slider');
    const output  = document.querySelector('#credit-calc-result');
    const display = document.querySelector('#credit-calc-value');

    if (!slider || !output) return;

    function PLANS_MAP() {
      // Créditos incluidos en el plan actual (detectar por data-attr o default a Pro)
      return 15; // Pro como default; la app real lo tomaría del contexto
    }

    slider.addEventListener('input', () => {
      const pdfs     = parseInt(slider.value, 10);
      const included = PLANS_MAP();
      const extra    = Math.max(0, pdfs - included);

      if (display) display.textContent = pdfs;

      if (extra === 0) {
        output.innerHTML = window.StudyOS?.i18n?.t('credits_page.calc_result_0')
          || 'Tus PDFs entran en el plan mensual.';
      } else {
        const tpl = window.StudyOS?.i18n?.t('credits_page.calc_result_credits')
          || 'Necesitarías {n} créditos extra además de tu plan.';
        output.innerHTML = tpl.replace('{n}', '<strong>' + extra + '</strong>');
      }
    });

    // Trigger inicial
    slider.dispatchEvent(new Event('input'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPricingToggle();
    initCreditCalc();
  });

  // Exponer para uso externo
  window.StudyOS = window.StudyOS || {};
  window.StudyOS.pricing = { updatePriceDisplays };

})();
