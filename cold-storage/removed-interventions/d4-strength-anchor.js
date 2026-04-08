// ═══════════════════════════════════════════════════════════════
// D4 — The Strength Anchor
// Mechanism: Strengths-based psychology; identity protection
//            under role-threat
// Evidence:  T3 (Seligman PERMA; job search identity literature)
// Time:      60 seconds
//
// For returning users: previous answers surface below the prompt.
// "You said this before: '[response]' — Still true."
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var STORAGE_KEY = 'bmhi_strengths';
  var CLOSING_TEXT = 'That\u2019s yours. No search result can touch it.';
  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  function getStrengths() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveStrength(text) {
    try {
      var arr = getStrengths();
      arr.push(text);
      if (arr.length > 5) arr = arr.slice(-5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) { /* ok */ }
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['D4'] = {
    id: 'D4',
    name: 'Inner Anchor',
    tier: 'D',
    mechanism: 'Identity protection under role-threat',
    evidence: 'T3',
    time: '60s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.opacity = '0';
      prompt.style.transition = 'opacity 1.2s ease';
      prompt.innerHTML =
        'This search didn\u2019t go the way you wanted.<br><br>' +
        '<em>But what\u2019s one thing you\u2019re genuinely good at \u2014<br>' +
        'that no search result can touch?</em>';
      container.appendChild(prompt);

      // Privacy
      var privacy = document.createElement('div');
      privacy.className = 'privacy-note';
      privacy.style.opacity = '0';
      privacy.style.transition = 'opacity 1s ease';
      privacy.textContent = 'Stored only on your device.';
      container.appendChild(privacy);

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'mhi-input';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      input.style.opacity = '0';
      input.style.transition = 'opacity 1s ease';
      container.appendChild(input);

      // Show previous strengths if any
      var prev = getStrengths();
      var prevEl = null;
      if (prev.length > 0) {
        prevEl = document.createElement('div');
        prevEl.style.cssText =
          'margin-top:20px;opacity:0;transition:opacity 1s ease;' +
          'max-width:400px;width:100%;';
        for (var i = 0; i < prev.length; i++) {
          var line = document.createElement('div');
          line.style.cssText =
            'font-family:var(--serif);font-size:13px;font-style:italic;' +
            'color:var(--faint);line-height:1.6;margin-bottom:4px;';
          line.textContent = 'You said: \u201c' + prev[i] + '\u201d \u2014 Still true.';
          prevEl.appendChild(line);
        }
        container.appendChild(prevEl);
      }

      // Closing
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '28px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { privacy.style.opacity = '1'; }, 1600));
      timers.push(setTimeout(function () {
        input.style.opacity = '1';
        if (running) input.focus();
      }, 2000));
      if (prevEl) {
        timers.push(setTimeout(function () { prevEl.style.opacity = '1'; }, 2800));
      }

      // Finish
      var finished = false;
      function finish() {
        if (finished || !running) return;
        finished = true;
        var text = input.value.trim();
        if (text) saveStrength(text);

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
          helpers.complete(CLOSING_TEXT, text ? 3 : 2, text.length);
        }, 5000));
      }

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finish(); }
      });

      var autoTimer = setTimeout(finish, 25000);
      timers.push(autoTimer);

      input.addEventListener('input', function () {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(finish, 12000);
        timers.push(autoTimer);
      });

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'type', depth_score: 1 });
      }
    },

    cleanup: function () { clearTimers(); }
  };
})();
