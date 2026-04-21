// ═══════════════════════════════════════════════════════════════
// D3 — Gratitude Micro-Exercise (specificity variant)
// Mechanism: Relationship-focused gratitude (Emmons literature)
// Evidence:  T2
// Time:      60 seconds
//
// NOT "list 3 things you're grateful for."
// Specificity is the active ingredient.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var CLOSING_TEXT = 'Someone\u2019s in your corner. Carry that into the next search.';
  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['D3'] = {
    id: 'D3',
    name: 'Gratitude',
    tier: 'D',
    mechanism: 'Relationship-focused gratitude',
    evidence: 'T2',
    time: '60s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.opacity = '0';
      prompt.style.transition = 'opacity 1.2s ease';
      prompt.innerHTML =
        'Name one <em>specific</em> person who has your back right now.<br><br>' +
        '<span style="color:var(--dim);font-size:0.85em">Not what they do \u2014 who they are.</span>';
      container.appendChild(prompt);

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'mhi-input';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.style.opacity = '0';
      input.style.transition = 'opacity 1s ease';
      container.appendChild(input);

      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '32px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () {
        input.style.opacity = '1';
        if (running) input.focus();
      }, 1800));

      var finished = false;
      function finish() {
        if (finished || !running) return;
        finished = true;
        input.style.transition = 'opacity 0.8s ease';
        input.style.opacity = '0.3';
        input.disabled = true;

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 600));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, input.value.trim() ? 3 : 2, 0);
        }, 4500));
      }

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finish(); }
      });

      // Auto-finish: 30s if nothing typed, or 10s after typing
      var autoTimer = setTimeout(finish, 30000);
      timers.push(autoTimer);

      input.addEventListener('input', function () {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(finish, 10000);
        timers.push(autoTimer);
      });

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'type', depth_score: 1 });
      }
    },

    cleanup: function () { clearTimers(); }
  };
})();
