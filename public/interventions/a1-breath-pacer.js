// ═══════════════════════════════════════════════════════════════
// A1 — Visual Breath Pacer
// Mechanism: Parasympathetic activation via paced breathing
// Evidence:  T1 (HRV studies; box breathing 4-4-6 protocol)
// Time:      ~30 seconds (2 cycles)
//
// Text prompts guide each phase: "breathe in" / "hold" / "breathe out"
// Circle animates in sync. Closing: "You searched today. That counts."
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var INHALE = 4000;    // 4 seconds
  var HOLD   = 4000;    // 4 seconds
  var EXHALE = 6000;    // 6 seconds
  var CYCLE  = INHALE + HOLD + EXHALE; // 14 seconds
  var TOTAL_CYCLES = 2; // ~28 seconds — evidence-based minimum
  var CLOSING_TEXT = 'You searched today. That counts.';

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['A1'] = {
    id: 'A1',
    name: 'Visual Breath Pacer',
    tier: 'A',
    mechanism: 'Parasympathetic activation via paced breathing',
    evidence: 'T1',
    time: '30s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Outer glow wrapper
      var glow = document.createElement('div');
      glow.style.cssText =
        'width:clamp(120px,40vw,180px);height:clamp(120px,40vw,180px);' +
        'border-radius:50%;position:relative;' +
        'display:flex;align-items:center;justify-content:center;' +
        'margin-bottom:40px;';

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

      // Phase label — guides the user
      var label = document.createElement('div');
      label.className = 'breath-label';
      container.appendChild(label);

      // Closing text (shown at end)
      var closing = document.createElement('div');
      closing.className = 'breath-closing';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // ─── Animation ──────────────────────────────────────
      var cycleCount = 0;

      function setLabel(text) {
        label.classList.remove('vis');
        timers.push(setTimeout(function () {
          if (!running) return;
          label.textContent = text;
          label.classList.add('vis');
        }, 300));
      }

      function runCycle() {
        if (!running) return;
        cycleCount++;

        // Inhale
        circle.className = 'breath-circle inhale';
        glowBg.style.opacity = '1';
        setLabel('breathe in');

        // Hold
        timers.push(setTimeout(function () {
          if (!running) return;
          circle.className = 'breath-circle hold';
          setLabel('hold');
        }, INHALE));

        // Exhale
        timers.push(setTimeout(function () {
          if (!running) return;
          circle.className = 'breath-circle exhale';
          glowBg.style.opacity = '0.3';
          setLabel('breathe out');
        }, INHALE + HOLD));

        // Next cycle or finish
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
        if (!running) return;
        // Rest position
        circle.className = 'breath-circle';
        circle.style.transition = 'transform 2s ease, opacity 2s ease';
        circle.style.transform = 'scale(0.6)';
        circle.style.opacity = '0.5';
        label.classList.remove('vis');

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, 3, 0);
        }, 5000));
      }

      // Start after settling pause
      timers.push(setTimeout(function () {
        if (!running) return;
        runCycle();
      }, 800));

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'breathe', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
