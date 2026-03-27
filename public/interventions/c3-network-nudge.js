// ═══════════════════════════════════════════════════════════════
// C3 — The Network Nudge
// Mechanism: Behavioral activation + weak-tie network activation
// Evidence:  T3 (Granovetter; referral hiring literature)
// Time:      60 seconds
//
// The field value is NEVER stored, NEVER transmitted.
// Even if they don't type, the prompt plants the seed.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var CLOSING_TEXT = 'You don\u2019t have to reach out today. Just remember they exist.';

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['C3'] = {
    id: 'C3',
    name: 'Network Nudge',
    tier: 'C',
    mechanism: 'Behavioral activation + weak-tie network activation',
    evidence: 'T3',
    time: '60s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Statistic
      var stat = document.createElement('div');
      stat.style.cssText =
        'font-family:var(--mono);font-size:clamp(36px,9vw,52px);' +
        'font-weight:300;color:var(--amber);letter-spacing:1px;' +
        'margin-bottom:8px;opacity:0;transition:opacity 1.2s ease;';
      stat.textContent = '70%';
      container.appendChild(stat);

      // Context
      var context = document.createElement('div');
      context.style.cssText =
        'font-family:var(--mono);font-size:11px;color:var(--faint);' +
        'letter-spacing:0.5px;margin-bottom:32px;opacity:0;' +
        'transition:opacity 1s ease;';
      context.textContent = 'of jobs are filled through referrals \u2014 not listings.';
      container.appendChild(context);

      // Prompt
      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.opacity = '0';
      prompt.style.transition = 'opacity 1.2s ease';
      prompt.innerHTML =
        '<em>Is there one person you haven\u2019t talked to in 6+ months<br>' +
        'who works somewhere interesting?</em>';
      container.appendChild(prompt);

      // Name field — optional, no storage, no send
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'mhi-input';
      input.placeholder = 'a name, if one comes to mind';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.style.opacity = '0';
      input.style.transition = 'opacity 1s ease';
      container.appendChild(input);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '32px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in sequence
      timers.push(setTimeout(function () { stat.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { context.style.opacity = '1'; }, 1200));
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 2200));
      timers.push(setTimeout(function () {
        input.style.opacity = '1';
      }, 3200));

      // Show closing after pause (whether or not they typed)
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
          // Never transmit field value — just count whether they typed
          var typed = input.value.trim().length > 0;
          helpers.complete(CLOSING_TEXT, typed ? 3 : 2, 0);
        }, 5000));
      }

      // Auto-finish after 15s, or 8s after typing
      var autoTimer = setTimeout(finish, 15000);
      timers.push(autoTimer);

      input.addEventListener('input', function () {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(finish, 8000);
        timers.push(autoTimer);
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finish(); }
      });

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'tap', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
