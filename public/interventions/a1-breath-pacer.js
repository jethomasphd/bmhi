// ═══════════════════════════════════════════════════════════════
// A1 — Visual Breath Pacer
// Mechanism: Parasympathetic activation via paced breathing
// Evidence:  T1 (HRV studies; box breathing literature)
// Time:      60–90 seconds
//
// NO instruction text during breathing. Text breaks
// parasympathetic activation by engaging the language center.
// Just the visual. Just the breath.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var INHALE = 4000;    // 4 seconds
  var HOLD   = 4000;    // 4 seconds
  var EXHALE = 6000;    // 6 seconds
  var CYCLE  = INHALE + HOLD + EXHALE; // 14 seconds
  var TOTAL_CYCLES = 3; // ~42 seconds total
  var CLOSING_TEXT = 'You searched today. That counts.';

  var timers = [];
  var animFrame = null;
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['A1'] = {
    id: 'A1',
    name: 'Visual Breath Pacer',
    tier: 'A',
    mechanism: 'Parasympathetic activation via paced breathing',
    evidence: 'T1',
    time: '60\u201390s',

    render: function (container, helpers) {
      running = true;

      // ─── Build DOM ───────────────────────────────────────
      container.innerHTML = '';

      // Outer glow ring (subtle ambient)
      var glow = document.createElement('div');
      glow.style.cssText =
        'width:180px;height:180px;border-radius:50%;position:relative;' +
        'display:flex;align-items:center;justify-content:center;' +
        'margin-bottom:48px;';

      // Ambient glow behind circle
      var glowBg = document.createElement('div');
      glowBg.style.cssText =
        'position:absolute;inset:-20px;border-radius:50%;' +
        'background:radial-gradient(circle,rgba(122,158,142,0.06),transparent 70%);' +
        'transition:opacity 2s ease;';
      glow.appendChild(glowBg);

      // Main breath circle
      var circle = document.createElement('div');
      circle.className = 'breath-circle';
      glow.appendChild(circle);

      container.appendChild(glow);

      // Phase label (only shown briefly at transitions as subtle cue)
      // Per spec: NO text during breathing. But we show a tiny,
      // near-invisible phase hint that fades fast.
      var label = document.createElement('div');
      label.className = 'breath-label';
      container.appendChild(label);

      // Closing text (shown at end)
      var closing = document.createElement('div');
      closing.className = 'breath-closing';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // ─── Animation Loop ──────────────────────────────────
      var cycleCount = 0;
      var startTime = Date.now();

      function runCycle() {
        if (!running) return;
        cycleCount++;

        // ── Inhale ──
        circle.className = 'breath-circle inhale';
        glowBg.style.opacity = '1';

        // ── Hold (after inhale completes) ──
        timers.push(setTimeout(function () {
          if (!running) return;
          circle.className = 'breath-circle hold';
        }, INHALE));

        // ── Exhale (after hold completes) ──
        timers.push(setTimeout(function () {
          if (!running) return;
          circle.className = 'breath-circle exhale';
          glowBg.style.opacity = '0.3';
        }, INHALE + HOLD));

        // ── Next cycle or finish ──
        timers.push(setTimeout(function () {
          if (!running) return;
          if (cycleCount >= TOTAL_CYCLES) {
            finish();
          } else {
            runCycle();
          }
        }, CYCLE));
      }

      function finish() {
        // Final rest position
        circle.className = 'breath-circle';
        circle.style.transition = 'transform 2s ease, opacity 2s ease';
        circle.style.transform = 'scale(0.6)';
        circle.style.opacity = '0.5';

        // Show closing text after a breath
        timers.push(setTimeout(function () {
          closing.classList.add('vis');
        }, 1500));

        // Auto-complete after reading time
        timers.push(setTimeout(function () {
          if (!running) return;
          var elapsed = (Date.now() - startTime) / 1000;
          helpers.complete(CLOSING_TEXT, 3, 0);
        }, 6000));
      }

      // ─── Start with a brief pause ───────────────────────
      // Let the user settle in. Don't rush.
      timers.push(setTimeout(function () {
        if (!running) return;
        runCycle();
      }, 1200));

      // Log engagement start
      if (helpers.engage) {
        helpers.engage({
          interaction_type: 'breathe',
          depth_score: 1
        });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
