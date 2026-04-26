/* i18n.js — Sistema de traducción client-side
 * Carga JSON desde /locales/{lang}.json y reemplaza todos los [data-i18n] del DOM.
 * Persiste la preferencia en localStorage.
 * Detecta: localStorage > navigator.language > fallback 'es'
 */

(function () {
  'use strict';

  const SUPPORTED = ['es', 'en', 'de', 'et'];
  const DEFAULT   = 'es';
  const STORAGE_KEY = 'studyos_lang';

  let _translations = {};
  let _lang = DEFAULT;

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(nav)) return nav;

    return DEFAULT;
  }

  function get(key) {
    const parts = key.split('.');
    let val = _translations;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        return key; // fallback: devolver la clave si no se encuentra
      }
    }
    return typeof val === 'string' ? val : key;
  }

  function applyTranslations() {
    // [data-i18n="key"] — reemplaza textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = get(key);
      if (text !== key) el.textContent = text;
    });

    // [data-i18n-html="key"] — reemplaza innerHTML (para enlaces o énfasis)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const text = get(key);
      if (text !== key) el.innerHTML = text;
    });

    // [data-i18n-attr="attr:key;attr2:key2"] — reemplaza atributos
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const pairs = el.getAttribute('data-i18n-attr').split(';');
      pairs.forEach(pair => {
        const [attr, key] = pair.trim().split(':');
        if (attr && key) {
          const text = get(key.trim());
          if (text !== key.trim()) el.setAttribute(attr.trim(), text);
        }
      });
    });

    // Actualizar meta tags
    const metaTitle = get('meta.title_' + (window.__STUDYOS_PAGE__ || 'home'));
    if (metaTitle && metaTitle !== 'meta.title_' + (window.__STUDYOS_PAGE__ || 'home')) {
      document.title = metaTitle;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    const descKey  = 'meta.description_' + (window.__STUDYOS_PAGE__ || 'home');
    const descVal  = get(descKey);
    if (metaDesc && descVal !== descKey) metaDesc.setAttribute('content', descVal);

    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && metaTitle) ogTitle.setAttribute('content', metaTitle);

    // Atributo lang del <html>
    document.documentElement.lang = _lang;

    // Dispatch evento para que otros módulos reaccionen
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: _lang } }));
  }

  async function loadLang(lang) {
    try {
      const res  = await fetch('/locales/' + lang + '.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _translations = await res.json();
      _lang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations();
    } catch (e) {
      console.warn('[i18n] Failed to load lang "' + lang + '"', e);
      if (lang !== DEFAULT) {
        // Intentar con el fallback
        await loadLang(DEFAULT);
      }
    }
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) {
      console.warn('[i18n] Unsupported lang:', lang);
      return;
    }
    loadLang(lang);
  }

  function getCurrentLang() { return _lang; }

  function t(key) { return get(key); }

  // Inicializar en DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const lang = detectLang();
    loadLang(lang);

    // Conectar selectores de idioma
    document.querySelectorAll('[data-lang-selector]').forEach(sel => {
      sel.value = lang;
      sel.addEventListener('change', e => setLang(e.target.value));
    });
  });

  // Exponer API
  window.StudyOS = window.StudyOS || {};
  window.StudyOS.i18n = { setLang, getCurrentLang, t };

})();
