/* faq.js — Acordeón de FAQ con animación suave */

(function () {
  'use strict';

  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer   = item.querySelector('.faq-answer');

      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = question.getAttribute('aria-expanded') === 'true';

        // Cerrar todos los demás
        items.forEach(other => {
          if (other !== item) {
            const otherQ = other.querySelector('.faq-question');
            const otherA = other.querySelector('.faq-answer');
            if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
            if (otherA) otherA.classList.remove('open');
          }
        });

        // Toggle el actual
        question.setAttribute('aria-expanded', String(!isOpen));
        answer.classList.toggle('open', !isOpen);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initFAQ);

})();
