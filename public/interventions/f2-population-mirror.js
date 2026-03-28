// ═══════════════════════════════════════════════════════════════
// F2 — The Population Mirror
// Mechanism: Social proof; loneliness buffering; normalization
// Evidence:  T3
// Time:      20 seconds (read-only)
//
// A living number. You weren't searching alone today.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ~4.54M weekly ÷ 7 ≈ 648,138 daily. Randomize slightly for realism.
  var BASE_DAILY = 648138;
  var CLOSING_TEXT = 'You are in good company.';

  var timers = [];
  var running = false;
  var animFrame = null;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
    running = false;
  }

  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['F2'] = {
    id: 'F2',
    name: 'Population Mirror',
    tier: 'F',
    mechanism: 'Social proof; loneliness buffering',
    evidence: 'T3',
    time: '20s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Slight daily variance for realism
      var todayCount = BASE_DAILY + Math.floor((Math.random() - 0.5) * 40000);

      // Opening
      var opening = document.createElement('div');
      opening.className = 'prompt-text';
      opening.style.opacity = '0';
      opening.style.transition = 'opacity 1.2s ease';
      opening.innerHTML = '<em>You weren\u2019t searching alone today.</em>';
      container.appendChild(opening);

      // Animated number
      var numEl = document.createElement('div');
      numEl.className = 'pop-number';
      numEl.style.opacity = '0';
      numEl.style.transition = 'opacity 1s ease';
      numEl.textContent = '0';
      container.appendChild(numEl);

      // Context
      var context = document.createElement('div');
      context.style.cssText =
        'font-family:var(--sans);font-size:13px;font-weight:300;' +
        'color:var(--dim);line-height:1.6;max-width:380px;' +
        'opacity:0;transition:opacity 1s ease;';
      context.textContent = 'people used a job site today without clicking a single listing.';
      container.appendChild(context);

      // Closing
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '32px';
      closing.innerHTML =
        'The search is hard for everyone right now.<br>' +
        '<em style="color:var(--amber)">' + CLOSING_TEXT + '</em>';
      container.appendChild(closing);

      // Fade in sequence
      timers.push(setTimeout(function () { opening.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () {
        numEl.style.opacity = '1';
        animateCount();
      }, 2000));
      timers.push(setTimeout(function () { context.style.opacity = '1'; }, 2500));
      timers.push(setTimeout(function () {
        if (running) closing.classList.add('vis');
      }, 5000));

      // Count-up animation over 2 seconds
      function animateCount() {
        var start = Date.now();
        var duration = 2000;

        function tick() {
          if (!running) return;
          var elapsed = Date.now() - start;
          var progress = Math.min(elapsed / duration, 1);
          // Ease-out curve
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * todayCount);
          numEl.textContent = formatNumber(current);

          if (progress < 1) {
            animFrame = requestAnimationFrame(tick);
          }
        }
        tick();
      }

      // Auto-complete
      timers.push(setTimeout(function () {
        if (!running) return;
        helpers.complete(CLOSING_TEXT, 2, 0);
      }, 12000));

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'tap', depth_score: 1 });
      }
    },

    cleanup: function () { clearTimers(); }
  };
})();
