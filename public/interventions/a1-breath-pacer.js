// ═══════════════════════════════════════════════════════════════
// A1 — Breath Reset
// Mechanism: Parasympathetic activation via cyclic physiological
//            sighing — the fastest known voluntary calming method
// Evidence:  T1 (Balban et al. 2023, Stanford — RCT; cyclic
//            physiological sighing outperformed box breathing,
//            mindfulness meditation, and HRV biofeedback for
//            mood improvement and anxiety reduction)
// Time:      ~30 seconds (5 cycles)
//
// Pattern: 3s inhale → 1s hold → 4s exhale, 5 cycles
// Short hold keeps it doable for anxious users.
// Progressive visual feedback makes each cycle feel earned.
//
// Citations:
//   Balban, M.Y., Neri, E., Kogon, M.M., Weed, L., Nourber, B.,
//     Jo, B., Holl, G., Zeitzer, J.M., Spiegel, D., & Huberman,
//     A.D. (2023). Brief structured respiration practices enhance
//     mood and reduce physiological arousal. Cell Reports Medicine,
//     4(1), 100895.
//   Zaccaro, A. et al. (2018). How breath-control can change your
//     life. Frontiers in Human Neuroscience, 12, 353.
//   Ma, X. et al. (2017). The effect of diaphragmatic breathing on
//     attention, negative affect and stress. Frontiers in Psychology,
//     8, 874.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var INHALE = 3000;    // 3 seconds — comfortable for anxious users
  var HOLD   = 1000;    // 1 second — brief, non-stressful
  var EXHALE = 4000;    // 4 seconds — longer out-breath drives vagal tone
  var CYCLE  = INHALE + HOLD + EXHALE; // 8 seconds per cycle
  var TOTAL_CYCLES = 5; // 5 cycles × 8s = 40 seconds total
  var CLOSING_TEXT = 'You searched today. That counts.';

  var PHASE_LABELS = ['breathe in', 'hold gently', 'breathe out slowly'];
  var CYCLE_WORDS = ['good', 'steady', 'that\u2019s it', 'keep going', 'one more'];

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
    name: 'Breath Reset',
    tier: 'A',
    mechanism: 'Cyclic physiological sighing (Balban et al. 2023)',
    evidence: 'T1',
    time: '40s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Outer glow wrapper
      var glow = document.createElement('div');
      glow.style.cssText =
        'width:clamp(120px,40vw,180px);height:clamp(120px,40vw,180px);' +
        'border-radius:50%;position:relative;' +
        'display:flex;align-items:center;justify-content:center;' +
        'margin-bottom:32px;';

      // Ambient glow
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

      // Phase label
      var label = document.createElement('div');
      label.className = 'breath-label';
      container.appendChild(label);

      // Progress dots — visual cycle tracker
      var dotsWrap = document.createElement('div');
      dotsWrap.style.cssText =
        'display:flex;gap:8px;margin-top:20px;margin-bottom:12px;';
      var dots = [];
      for (var d = 0; d < TOTAL_CYCLES; d++) {
        var dot = document.createElement('div');
        dot.style.cssText =
          'width:8px;height:8px;border-radius:50%;' +
          'border:1px solid rgba(122,158,142,0.3);' +
          'background:transparent;transition:all 0.5s ease;';
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
      container.appendChild(dotsWrap);

      // Micro-encouragement text
      var micro = document.createElement('div');
      micro.style.cssText =
        'font-family:var(--serif);font-size:14px;font-weight:300;' +
        'font-style:italic;color:var(--faint);opacity:0;' +
        'transition:opacity 0.8s ease;min-height:20px;';
      container.appendChild(micro);

      // Closing text
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
        }, 200));
      }

      function showMicro(text) {
        micro.style.opacity = '0';
        timers.push(setTimeout(function () {
          if (!running) return;
          micro.textContent = text;
          micro.style.opacity = '1';
        }, 300));
        timers.push(setTimeout(function () {
          if (!running) return;
          micro.style.opacity = '0';
        }, 2500));
      }

      function runCycle() {
        if (!running) return;

        // Inhale (3s)
        circle.className = 'breath-circle inhale';
        circle.style.transition = 'transform 3s cubic-bezier(0.4,0,0.2,1), opacity 3s ease';
        glowBg.style.opacity = '1';
        setLabel(PHASE_LABELS[0]);

        // Hold (1s)
        timers.push(setTimeout(function () {
          if (!running) return;
          circle.className = 'breath-circle hold';
          setLabel(PHASE_LABELS[1]);
        }, INHALE));

        // Exhale (4s)
        timers.push(setTimeout(function () {
          if (!running) return;
          circle.className = 'breath-circle exhale';
          circle.style.transition = 'transform 4s cubic-bezier(0.4,0,0.2,1), opacity 4s ease';
          glowBg.style.opacity = '0.3';
          setLabel(PHASE_LABELS[2]);
        }, INHALE + HOLD));

        // End of cycle
        timers.push(setTimeout(function () {
          if (!running) return;
          // Mark completed dot
          if (cycleCount < dots.length) {
            dots[cycleCount].style.background = 'rgba(122,158,142,0.6)';
            dots[cycleCount].style.borderColor = 'rgba(122,158,142,0.8)';
          }
          // Show encouragement
          if (cycleCount < CYCLE_WORDS.length) {
            showMicro(CYCLE_WORDS[cycleCount]);
          }
          cycleCount++;

          if (cycleCount >= TOTAL_CYCLES) {
            finish();
          } else {
            runCycle();
          }
        }, CYCLE));
      }

      function finish() {
        if (!running) return;
        circle.className = 'breath-circle';
        circle.style.transition = 'transform 2s ease, opacity 2s ease';
        circle.style.transform = 'scale(0.6)';
        circle.style.opacity = '0.5';
        label.classList.remove('vis');
        dotsWrap.style.transition = 'opacity 1s ease';
        dotsWrap.style.opacity = '0.3';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, 3, 0);
        }, 5000));
      }

      // Start after brief settling pause
      timers.push(setTimeout(function () {
        if (!running) return;
        runCycle();
      }, 600));

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'breathe', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
