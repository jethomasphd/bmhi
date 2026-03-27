// ═══════════════════════════════════════════════════════════════
// D1 — The 3-Sentence Release (Pennebaker-derived)
// Mechanism: Expressive disclosure — cortisol reduction,
//            immune function improvement, distress processing
// Evidence:  T1 (Pennebaker; 30+ years, replicated cross-culturally)
// Time:      3–4 minutes
//
// Text is NEVER transmitted or stored. Client-side only.
// The dissolution animation completes the ritual of release.
// Do not skip it.
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

  function countSentences(text) {
    // Count sentence-ending punctuation and newlines
    var endings = text.match(/[.!?\n]/g);
    return endings ? endings.length : 0;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['D1'] = {
    id: 'D1',
    name: '3-Sentence Release',
    tier: 'D',
    mechanism: 'Expressive disclosure — cortisol reduction',
    evidence: 'T1',
    time: '3\u20134min',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // ─── Opening: privacy guarantee ─────────────────────
      var opening = document.createElement('div');
      opening.className = 'prompt-text';
      opening.style.opacity = '0';
      opening.style.transition = 'opacity 1.2s ease';
      opening.innerHTML =
        'You don\u2019t have to send this anywhere.<br>' +
        'No one will read it. Not even us.';
      container.appendChild(opening);

      // Prompt
      var prompt = document.createElement('div');
      prompt.style.cssText =
        'font-family:var(--serif);font-size:clamp(16px,4vw,20px);' +
        'font-weight:400;font-style:italic;color:var(--text);' +
        'margin-bottom:24px;opacity:0;transition:opacity 1.2s ease;';
      prompt.textContent = 'Write 3 sentences about how today\u2019s search made you feel.';
      container.appendChild(prompt);

      // Text area — large, warm, inviting
      var textarea = document.createElement('textarea');
      textarea.className = 'mhi-textarea';
      textarea.style.minHeight = '160px';
      textarea.style.opacity = '0';
      textarea.style.transition = 'opacity 1s ease';
      textarea.setAttribute('autocomplete', 'off');
      textarea.setAttribute('spellcheck', 'false');
      // No placeholder — let them sit with the blankness
      container.appendChild(textarea);

      // "Let it go" button — hidden until 3 sentences or 90s
      var letgo = document.createElement('button');
      letgo.className = 'letgo-btn';
      letgo.textContent = 'Let it go';
      letgo.style.marginTop = '24px';
      container.appendChild(letgo);

      // Closing area (hidden until dissolution)
      var closingArea = document.createElement('div');
      closingArea.style.cssText = 'margin-top:32px;';
      var gone = document.createElement('div');
      gone.className = 'closing-text';
      gone.style.cssText =
        'font-size:clamp(20px,5vw,28px);font-weight:400;margin-bottom:16px;';
      gone.textContent = 'Gone.';
      closingArea.appendChild(gone);

      var named = document.createElement('div');
      named.className = 'closing-text';
      named.textContent = 'You named it. That\u2019s enough.';
      closingArea.appendChild(named);

      container.appendChild(closingArea);

      // ─── Fade in sequence ───────────────────────────────
      timers.push(setTimeout(function () { opening.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 2500));
      timers.push(setTimeout(function () {
        textarea.style.opacity = '1';
        if (running) textarea.focus();
      }, 4000));

      // ─── Sentence detection ─────────────────────────────
      var buttonShown = false;

      function showButton() {
        if (buttonShown) return;
        buttonShown = true;
        letgo.classList.add('vis');
      }

      textarea.addEventListener('input', function () {
        if (countSentences(textarea.value) >= 3) {
          showButton();
        }
      });

      // Also show after 90 seconds regardless
      timers.push(setTimeout(function () {
        if (running) showButton();
      }, 90000));

      // ─── Dissolution ritual ─────────────────────────────
      var dissolved = false;

      letgo.addEventListener('click', function () {
        if (dissolved || !running) return;
        dissolved = true;
        var charCount = textarea.value.trim().length;

        // Hide button
        letgo.style.transition = 'opacity 0.5s ease';
        letgo.style.opacity = '0';
        letgo.style.pointerEvents = 'none';

        // Hide prompt and opening
        opening.style.opacity = '0';
        prompt.style.opacity = '0';

        // Dissolve the text
        textarea.disabled = true;
        textarea.classList.add('dissolving');

        // After dissolution (3s), show closing
        timers.push(setTimeout(function () {
          if (!running) return;
          textarea.style.display = 'none';
          gone.classList.add('vis');
        }, 3200));

        timers.push(setTimeout(function () {
          if (!running) return;
          named.classList.add('vis');
        }, 4800));

        // Complete
        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete('You named it. That\u2019s enough.', 3, charCount);
        }, 8000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'type',
            depth_score: 3,
            text_input_chars: charCount
          });
        }
      });

      // Initial engagement log
      if (helpers.engage) {
        helpers.engage({ interaction_type: 'type', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
