/* nav.js — Header sticky, menú móvil, scroll suave */

(function () {
  'use strict';

  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const drawer    = document.querySelector('.nav-drawer');
    const backdrop  = document.querySelector('.nav-drawer__backdrop');
    const closeBtn  = document.querySelector('.nav-drawer__close');

    if (!hamburger || !drawer) return;

    function openMenu() {
      drawer.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    if (backdrop) backdrop.addEventListener('click', closeMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeMenu();
    });

    // Cerrar al hacer click en links del drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id     = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        const headerH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '68'
        );
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  function initActiveNavLinks() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!navLinks.length) return;

    const sections = Array.from(navLinks)
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      const scrollY = window.scrollY + 100;
      let current = null;

      sections.forEach(sec => {
        if (sec.offsetTop <= scrollY) current = sec.id;
      });

      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
    initActiveNavLinks();
  });

})();
