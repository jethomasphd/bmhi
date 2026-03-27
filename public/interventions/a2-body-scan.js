// ═══════════════════════════════════════════════════════════════
// A2 — Body Scan (60-second abbreviated)
// Mechanism: Somatic awareness interrupts rumination
// Evidence:  T2 (MBSR literature)
// Time:      60 seconds
//
// Pure read/feel experience. No interaction required.
// Text fades in slowly, one body region at a time.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var PHASES = [
    { text: 'Notice your shoulders.', pause: 4500 },
    { text: 'Let them drop.', pause: 4500 },
    { text: 'Your jaw. Unclench it.', pause: 4500 },
    { text: 'Your hands. Open them.', pause: 4500 },
    { text: 'You\u2019re still here. That matters.', pause: 0 }
  ];

  // Subtle hue shifts per body region
  var GLOWS = [
    'rgba(122,158,142,0.04)',  // shoulders — sage
    'rgba(122,158,142,0.06)',  // drop — deeper sage
    'rgba(106,143,167,0.05)',  // jaw — water
    'rgba(184,133,110,0.05)',  // hands — clay
    'rgba(196,146,42,0.06)'   // closing — amber
  ];

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['A2'] = {
    id: 'A2',
    name: 'Body Scan',
    tier: 'A',
    mechanism: 'Somatic awareness interrupts rumination',
    evidence: 'T2',
    time: '60s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Ambient glow background
      var glow = document.createElement('div');
      glow.style.cssText =
        'position:absolute;inset:0;pointer-events:none;' +
        'background:radial-gradient(ellipse 70% 50% at 50% 50%,' + GLOWS[0] + ',transparent);' +
        'transition:background 2s ease;';
      container.appendChild(glow);

      // Text element
      var textEl = document.createElement('div');
      textEl.className = 'scan-text';
      textEl.style.position = 'relative';
      container.appendChild(textEl);

      var phaseIndex = 0;
      var startTime = Date.now();

      function showPhase() {
        if (!running || phaseIndex >= PHASES.length) return;

        var phase = PHASES[phaseIndex];
        var isLast = phaseIndex === PHASES.length - 1;

        // Fade out current
        textEl.classList.remove('vis');

        timers.push(setTimeout(function () {
          if (!running) return;

          // Update glow
          glow.style.background =
            'radial-gradient(ellipse 70% 50% at 50% 50%,' +
            GLOWS[phaseIndex] + ',transparent)';

          // New text
          textEl.textContent = phase.text;
          textEl.classList.add('vis');

          if (isLast) {
            // Final phase — use closing style
            textEl.className = 'closing-text';
            timers.push(setTimeout(function () {
              textEl.classList.add('vis');
            }, 50));

            // Complete after reading time
            timers.push(setTimeout(function () {
              if (!running) return;
              helpers.complete(phase.text, 3, 0);
            }, 5000));
          } else {
            phaseIndex++;
            timers.push(setTimeout(showPhase, phase.pause));
          }
        }, 800)); // gap between phases
      }

      // Start with brief settling pause
      timers.push(setTimeout(function () {
        if (!running) return;
        showPhase();
      }, 1500));

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'breathe', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
