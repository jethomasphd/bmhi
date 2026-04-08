// ═══════════════════════════════════════════════════════════════
// B2 — Defusion Exercise (ACT-derived)
// Mechanism: Cognitive defusion — distance from self-critical thought
// Evidence:  T2 (ACT literature; Hayes et al.)
// Time:      2–3 minutes
//
// Three-screen sequence:
// 1. Name the distorted thought (tap to select)
// 2. Name what's still true (text input)
// 3. See your own words reflected back
//
// The act of naming IS the intervention.
// Text is NEVER transmitted. Client-side only.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var THOUGHTS = [
    '\u201cI should have found something by now.\u201d',
    '\u201cI\u2019m falling behind.\u201d',
    '\u201cSomething must be wrong with me.\u201d'
  ];

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  // Fade-transition helper: fade out container, swap content, fade in
  function crossfade(container, buildFn, delay) {
    container.style.transition = 'opacity 0.8s ease';
    container.style.opacity = '0';
    timers.push(setTimeout(function () {
      if (!running) return;
      container.innerHTML = '';
      buildFn(container);
      container.style.opacity = '1';
    }, delay || 900));
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['B2'] = {
    id: 'B2',
    name: 'Step Back',
    tier: 'B',
    mechanism: 'Cognitive defusion — distance from self-critical thought',
    evidence: 'T2',
    time: '2\u20133min',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var selectedThought = '';
      var userText = '';

      // ─── SCREEN 1: Name the thought ──────────────────────
      function buildScreen1(el) {
        var intro = document.createElement('div');
        intro.className = 'prompt-text';
        intro.innerHTML =
          'Before you go \u2014 one quick thing.<br><br>' +
          '<em>You may be having a thought like one of these:</em>';
        el.appendChild(intro);

        var choices = document.createElement('div');
        choices.className = 'defusion-thoughts';

        for (var i = 0; i < THOUGHTS.length; i++) {
          (function (text, idx) {
            var btn = document.createElement('button');
            btn.className = 'thought-btn';
            btn.textContent = text;
            btn.addEventListener('click', function () {
              // Deselect all, select this one
              var all = choices.querySelectorAll('.thought-btn');
              for (var j = 0; j < all.length; j++) all[j].classList.remove('selected');
              btn.classList.add('selected');
              selectedThought = text;

              // Auto-advance after pause
              timers.push(setTimeout(function () {
                if (!running) return;
                crossfade(container, buildScreen2);
              }, 1200));
            });
            choices.appendChild(btn);
          })(THOUGHTS[i], i);
        }

        el.appendChild(choices);

        // Fade in
        el.style.opacity = '0';
        timers.push(setTimeout(function () { el.style.opacity = '1'; }, 50));
      }

      // ─── SCREEN 2: Name what's still true ────────────────
      function buildScreen2(el) {
        var prompt = document.createElement('div');
        prompt.className = 'prompt-text';
        prompt.innerHTML =
          'That thought has visited a lot of people today.<br>' +
          'It\u2019s a thought \u2014 not a verdict.<br><br>' +
          '<em>What\u2019s one thing that\u2019s still true about you<br>' +
          'that this search can\u2019t touch?</em>';
        el.appendChild(prompt);

        // Privacy note
        var privacy = document.createElement('div');
        privacy.className = 'privacy-note';
        privacy.textContent = 'This stays on your device. No one sees it.';
        el.appendChild(privacy);

        // Text input
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'mhi-input';
        input.maxLength = 60;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');
        el.appendChild(input);

        // Focus after fade-in
        timers.push(setTimeout(function () {
          if (running) input.focus();
        }, 1000));

        // Placeholder hint after 5s
        timers.push(setTimeout(function () {
          if (running && !input.value) {
            input.placeholder = 'anything \u2014 even small';
          }
        }, 5000));

        // Submit handlers
        var submitted = false;
        function submit() {
          if (submitted) return;
          userText = input.value.trim();
          if (!userText) return;
          submitted = true;
          crossfade(container, buildScreen3);
        }

        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
        });

        // Auto-advance 15s after first keystroke
        var autoTimer = null;
        input.addEventListener('input', function () {
          if (autoTimer) clearTimeout(autoTimer);
          autoTimer = setTimeout(function () {
            if (running && input.value.trim()) submit();
          }, 15000);
          timers.push(autoTimer);
        });
      }

      // ─── SCREEN 3: Reflect their words back ─────────────
      function buildScreen3(el) {
        // Their words, enlarged
        var echo = document.createElement('div');
        echo.className = 'user-echo';
        echo.textContent = userText;
        el.appendChild(echo);

        // Closing line (fades in after 2s)
        var closing = document.createElement('div');
        closing.className = 'closing-text';
        closing.textContent = 'That\u2019s yours. The search can\u2019t take it.';
        el.appendChild(closing);

        timers.push(setTimeout(function () {
          closing.classList.add('vis');
        }, 2000));

        // Complete after reading time
        timers.push(setTimeout(function () {
          if (!running) return;
          var charCount = userText.length;
          helpers.complete(
            'That\u2019s yours. The search can\u2019t take it.',
            3,
            charCount
          );
        }, 7000));
      }

      // ─── Start with Screen 1 ────────────────────────────
      buildScreen1(container);

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'tap', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
