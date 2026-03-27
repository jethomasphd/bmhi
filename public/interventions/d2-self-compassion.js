// ═══════════════════════════════════════════════════════════════
// D2 — Self-Compassion Mirror (Neff-derived)
// Mechanism: Self-compassion — reduces self-critical rumination
//            more effectively than positive self-talk
// Evidence:  T2 (Neff; self-compassion scale literature)
// Time:      3 minutes
//
// People reject generic affirmations but readily offer genuine
// compassion to friends. This mirror uses that asymmetry.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  function crossfade(container, buildFn) {
    container.style.transition = 'opacity 0.8s ease';
    container.style.opacity = '0';
    timers.push(setTimeout(function () {
      if (!running) return;
      container.innerHTML = '';
      buildFn(container);
      container.style.opacity = '1';
    }, 900));
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['D2'] = {
    id: 'D2',
    name: 'Self-Compassion Mirror',
    tier: 'D',
    mechanism: 'Self-compassion reduces self-critical rumination',
    evidence: 'T2',
    time: '3min',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var userResponse = '';

      // ─── SCREEN 1: Friend's text ─────────────────────────
      function buildScreen1(el) {
        var prompt = document.createElement('div');
        prompt.className = 'prompt-text';
        prompt.style.marginBottom = '20px';
        prompt.innerHTML = '<em>Imagine your closest friend just texted you:</em>';
        el.appendChild(prompt);

        // Text message bubble
        var bubble = document.createElement('div');
        bubble.style.cssText =
          'max-width:320px;width:100%;padding:16px 20px;' +
          'background:var(--surface);border:1px solid var(--border);' +
          'border-radius:16px 16px 16px 4px;text-align:left;' +
          'font-family:var(--sans);font-size:14px;font-weight:300;' +
          'color:var(--dim);line-height:1.6;margin-bottom:28px;';
        bubble.innerHTML =
          '\u201cI spent the afternoon job searching.<br>' +
          'Found nothing. Feel like a failure.\u201d';
        el.appendChild(bubble);

        // Question
        var question = document.createElement('div');
        question.style.cssText =
          'font-family:var(--serif);font-size:clamp(16px,4vw,20px);' +
          'font-weight:400;font-style:italic;color:var(--text);' +
          'margin-bottom:20px;';
        question.textContent = 'What would you say back to them?';
        el.appendChild(question);

        // Privacy
        var privacy = document.createElement('div');
        privacy.className = 'privacy-note';
        privacy.textContent = 'This stays on your device.';
        el.appendChild(privacy);

        // Input
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'mhi-input';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');
        el.appendChild(input);

        timers.push(setTimeout(function () {
          if (running) input.focus();
        }, 1000));

        // Submit
        var submitted = false;
        function submit() {
          if (submitted || !running) return;
          userResponse = input.value.trim();
          if (!userResponse) return;
          submitted = true;
          crossfade(container, buildScreen2);
        }

        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
        });

        // Auto-advance after 45s if they typed
        var autoTimer = setTimeout(function () {
          if (running && input.value.trim()) submit();
        }, 45000);
        timers.push(autoTimer);

        input.addEventListener('input', function () {
          clearTimeout(autoTimer);
          autoTimer = setTimeout(function () {
            if (running && input.value.trim()) submit();
          }, 15000);
          timers.push(autoTimer);
        });
      }

      // ─── SCREEN 2: The mirror ────────────────────────────
      function buildScreen2(el) {
        // User's own words
        var echo = document.createElement('div');
        echo.className = 'user-echo';
        echo.textContent = userResponse;
        el.appendChild(echo);

        // Reveal line (fades in after 2s)
        var reveal = document.createElement('div');
        reveal.className = 'closing-text';
        reveal.style.marginTop = '24px';
        reveal.innerHTML =
          'Now \u2014 read that again.<br>' +
          '<em style="color:var(--rose)">It was written for you.</em>';
        el.appendChild(reveal);

        timers.push(setTimeout(function () {
          if (!running) return;
          reveal.classList.add('vis');
        }, 2500));

        // Complete after letting the moment breathe
        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(
            'It was written for you.',
            3,
            userResponse.length
          );
        }, 9000));
      }

      // Start
      buildScreen1(container);

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'type', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
