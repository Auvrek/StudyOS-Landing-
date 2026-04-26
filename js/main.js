/* main.js — Inicialización general, event delegation, cookie banner */

(function () {
  'use strict';

  // ─── EVENT DELEGATION — acciones de botones ────────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;

    switch (action) {
      case 'select-plan':
        e.preventDefault();
        if (window.StudyOS?.selectPlan) {
          window.StudyOS.selectPlan(btn.dataset.plan, btn.dataset.cycle || 'monthly');
        }
        if (window.StudyOS?.analytics?.events?.planSelect) {
          window.StudyOS.analytics.events.planSelect(btn.dataset.plan, btn.dataset.cycle || 'monthly');
        }
        break;

      case 'buy-credits':
        e.preventDefault();
        if (window.StudyOS?.buyCredits) {
          window.StudyOS.buyCredits(btn.dataset.pack);
        }
        if (window.StudyOS?.analytics?.events?.creditsSelect) {
          window.StudyOS.analytics.events.creditsSelect(btn.dataset.pack);
        }
        break;

      case 'open-portal':
        e.preventDefault();
        if (window.StudyOS?.openCustomerPortal) {
          window.StudyOS.openCustomerPortal();
        }
        break;

      case 'close-modal':
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
        break;

      case 'cookie-accept':
        setCookieConsent('all');
        hideCookieBanner();
        break;

      case 'cookie-reject':
        setCookieConsent('essential');
        hideCookieBanner();
        break;

      case 'cookie-config':
        // TODO: abrir modal de configuración detallada de cookies
        showCookieConfigModal();
        break;
    }
  });

  // ─── COOKIE BANNER ─────────────────────────────────────────────
  const CONSENT_KEY = 'studyos_cookie_consent';

  function setCookieConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    // Expiración en 1 año via cookie (para SSR si se agrega)
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1);
    document.cookie = CONSENT_KEY + '=' + value + '; expires=' + exp.toUTCString() + '; path=/; SameSite=Lax';
  }

  function hideCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 400);
    }
  }

  function showCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;
    setTimeout(() => banner.classList.add('visible'), 1000);
  }

  function showCookieConfigModal() {
    // TODO: implementar modal de configuración granular
    alert('Configuración de cookies: próximamente.');
  }

  function initCookieBanner() {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) showCookieBanner();
  }

  // ─── MODAL GENÉRICO ────────────────────────────────────────────
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });

  // ─── TRACKING DE CTAs ──────────────────────────────────────────
  function initCtaTracking() {
    document.querySelectorAll('.btn-primary, .btn-nav, [data-track-cta]').forEach(btn => {
      btn.addEventListener('click', () => {
        const location = btn.getAttribute('data-cta-location') || 'unknown';
        if (window.StudyOS?.analytics?.events?.ctaClick) {
          window.StudyOS.analytics.events.ctaClick(location);
        }
      });
    });
  }

  // ─── INTERSECTION OBSERVER — animaciones de entrada ───────────
  function initEntryAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  // ─── INIT ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initCookieBanner();
    initCtaTracking();
    initEntryAnimations();
  });

})();
