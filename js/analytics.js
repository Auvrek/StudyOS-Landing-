/* analytics.js — Hooks vacíos para GA4 / Plausible
 *
 * TODO: Para activar analítica:
 * OPCIÓN A (Plausible — recomendado, privacy-first):
 *   Agregar al <head> de cada HTML:
 *   <script defer data-domain="studyos.app" src="https://plausible.io/js/script.js"></script>
 *   Plausible funciona sin configuración adicional para eventos de pageview.
 *   Para custom events usar: plausible('event-name', { props: { ... } })
 *
 * OPCIÓN B (Google Analytics 4):
 *   Agregar al <head>:
 *   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
 *   <script>
 *     window.dataLayer = window.dataLayer || [];
 *     function gtag(){dataLayer.push(arguments);}
 *     gtag('js', new Date());
 *     gtag('config', 'G-XXXXXXXXXX');
 *   </script>
 *
 * IMPORTANTE: solo activar analytics si el usuario aceptó cookies de analítica.
 * Verificar consentimiento con StudyOS.analytics.hasConsent() antes de enviar eventos.
 */

(function () {
  'use strict';

  const CONSENT_KEY = 'studyos_cookie_consent';

  function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'all';
  }

  function track(eventName, props) {
    if (!hasConsent()) return;

    // Plausible
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: props || {} });
      return;
    }

    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, props || {});
      return;
    }

    // Debug en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Analytics] Event:', eventName, props || {});
    }
  }

  // Eventos predefinidos de conversión
  const events = {
    ctaClick:       (location) => track('cta_click', { location }),
    planSelect:     (plan, cycle) => track('plan_select', { plan, cycle }),
    creditsSelect:  (pack) => track('credits_select', { pack }),
    faqOpen:        (question) => track('faq_open', { question }),
    langChange:     (lang) => track('lang_change', { lang }),
    trialStart:     () => track('trial_start'),
  };

  // Enganche automático a CTAs de conversión
  function initAutoTracking() {
    document.querySelectorAll('[data-track]').forEach(el => {
      el.addEventListener('click', () => {
        const evt   = el.getAttribute('data-track');
        const props = el.getAttribute('data-track-props');
        try {
          track(evt, props ? JSON.parse(props) : {});
        } catch (_) {
          track(evt, {});
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initAutoTracking);

  // Rastrear cambio de idioma cuando i18n dispara el evento
  document.addEventListener('i18n:applied', e => {
    events.langChange(e.detail.lang);
  });

  // Exponer
  window.StudyOS = window.StudyOS || {};
  window.StudyOS.analytics = { track, events, hasConsent };

})();
