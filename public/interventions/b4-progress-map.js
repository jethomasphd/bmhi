// ═══════════════════════════════════════════════════════════════
// B4 — Progress Mapping
// Mechanism: Progress visualization counters learned helplessness
// Evidence:  T3 (Zeigarnik; progress principle — Amabile & Kramer)
// Time:      60 seconds
// Requires:  Session continuity (visit >= 3)
//
// Shows returning users their visit timeline. The simple act
// of seeing persistence visualized interrupts the "nothing is
// working" narrative.
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

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['B4'] = {
    id: 'B4',
    name: 'Progress Map',
    tier: 'B',
    mechanism: 'Progress visualization counters learned helplessness',
    evidence: 'T3',
    time: '60s',

    // Router can check this: if visit < 3, skip this intervention
    minVisits: 3,

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Get visit count — use real session or demo fallback
      var session = window.BMHI && window.BMHI.getSession ? window.BMHI.getSession() : null;
      var visitCount = session ? session.visitNumber : 0;

      // In demo mode or low visits, use a realistic demo value
      if (visitCount < 3) visitCount = 7;

      var cappedDisplay = Math.min(visitCount, 12); // Show max 12 pips

      // Title
      var title = document.createElement('div');
      title.className = 'prompt-text';
      title.style.opacity = '0';
      title.style.transition = 'opacity 1.2s ease';
      title.innerHTML = '<em>Your search, week by week.</em>';
      container.appendChild(title);

      // Progress bar
      var barWrap = document.createElement('div');
      barWrap.className = 'progress-bar-wrap';
      barWrap.style.opacity = '0';
      barWrap.style.transition = 'opacity 1s ease';

      for (var i = 0; i < cappedDisplay; i++) {
        var pip = document.createElement('div');
        pip.className = 'progress-pip';
        // Height proportional to position (grows slightly)
        var baseH = 24 + (i / cappedDisplay) * 36;
        pip.style.height = '0px';
        pip.setAttribute('data-target-h', baseH + 'px');

        if (i === cappedDisplay - 1) {
          pip.classList.add('current');
        } else {
          pip.classList.add('past');
        }
        barWrap.appendChild(pip);
      }
      container.appendChild(barWrap);

      // Visit count number
      var countEl = document.createElement('div');
      countEl.style.cssText =
        'font-family:var(--mono);font-size:clamp(28px,7vw,40px);' +
        'font-weight:300;color:var(--amber);letter-spacing:1px;' +
        'margin:16px 0 8px;opacity:0;transition:opacity 1s ease;';
      countEl.textContent = visitCount;
      container.appendChild(countEl);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.innerHTML =
        'You\u2019ve shown up ' + visitCount + ' times. That\u2019s not giving up.<br>' +
        'That\u2019s how searches succeed \u2014 eventually.';
      container.appendChild(closing);

      // Animate in sequence
      timers.push(setTimeout(function () { title.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { barWrap.style.opacity = '1'; }, 1200));

      // Animate pips growing up one by one
      var pips = barWrap.querySelectorAll('.progress-pip');
      for (var j = 0; j < pips.length; j++) {
        (function (pip, delay) {
          timers.push(setTimeout(function () {
            pip.style.transition = 'height 0.6s cubic-bezier(0.4,0,0.2,1)';
            pip.style.height = pip.getAttribute('data-target-h');
          }, delay));
        })(pips[j], 1500 + j * 150);
      }

      // Show count after bars
      var countDelay = 1500 + cappedDisplay * 150 + 400;
      timers.push(setTimeout(function () { countEl.style.opacity = '1'; }, countDelay));

      // Show closing text
      timers.push(setTimeout(function () {
        closing.classList.add('vis');
      }, countDelay + 1000));

      // Auto-complete
      timers.push(setTimeout(function () {
        if (!running) return;
        helpers.complete(
          'You\u2019ve shown up ' + visitCount + ' times. That\u2019s not giving up.',
          2, 0
        );
      }, countDelay + 6000));

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'tap', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
