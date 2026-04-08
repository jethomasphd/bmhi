// ═══════════════════════════════════════════════════════════════
// B3 — Cognitive Reappraisal Prompt
// Mechanism: Growth mindset framing of search as data collection
// Evidence:  T2 (Dweck; job search self-efficacy literature)
// Time:      90 seconds
//
// The reframe is in the question itself. Even not answering
// shifts the frame from "failure" to "data collection."
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var CLOSING_TEXT = 'Data collected. See you tomorrow.';

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['B3'] = {
    id: 'B3',
    name: 'Reframe',
    tier: 'B',
    mechanism: 'Growth mindset framing of search as data collection',
    evidence: 'T2',
    time: '90s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Prompt
      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.opacity = '0';
      prompt.style.transition = 'opacity 1.2s ease';
      prompt.innerHTML =
        'One question before you close:<br><br>' +
        '<em>What did today\u2019s search tell you about<br>' +
        'what you\u2019re actually looking for?</em>';
      container.appendChild(prompt);

      // Privacy note
      var privacy = document.createElement('div');
      privacy.className = 'privacy-note';
      privacy.style.opacity = '0';
      privacy.style.transition = 'opacity 1s ease';
      privacy.textContent = 'This stays on your device.';
      container.appendChild(privacy);

      // Text input
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'mhi-input';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.style.opacity = '0';
      input.style.transition = 'opacity 1s ease';
      container.appendChild(input);

      // Closing text (hidden until finish)
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '32px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in sequence
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 200));
      timers.push(setTimeout(function () { privacy.style.opacity = '1'; }, 1800));
      timers.push(setTimeout(function () {
        input.style.opacity = '1';
        if (running) input.focus();
      }, 2200));

      // Hint after 8s
      timers.push(setTimeout(function () {
        if (running && !input.value) {
          input.placeholder = 'Even \u201cI don\u2019t know\u201d is useful data.';
        }
      }, 8000));

      // Submit
      var submitted = false;
      function finish() {
        if (submitted || !running) return;
        submitted = true;
        var chars = input.value.trim().length;

        // Fade out input, show closing
        input.style.transition = 'opacity 0.8s ease';
        input.style.opacity = '0.3';
        input.disabled = true;
        privacy.style.opacity = '0';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 800));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, chars > 0 ? 3 : 2, chars);
        }, 4000));
      }

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finish(); }
      });

      // Auto-complete after 20s of inactivity
      var idleTimer = setTimeout(finish, 20000);
      timers.push(idleTimer);

      input.addEventListener('input', function () {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(finish, 15000);
        timers.push(idleTimer);
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
