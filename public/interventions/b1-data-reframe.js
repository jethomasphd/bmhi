// ═══════════════════════════════════════════════════════════════
// B1 — The Data Reframe
// Mechanism: Normalization / external attribution of failure
// Evidence:  T3 (attribution theory; psychoeducation literature)
// Time:      30 seconds (read-only)
//
// A data company using data to reframe distress.
// On-brand. Credible. Not "chin up" — arithmetic.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var DISPLAY_TIME = 15000; // 15s reading time before auto-complete
  var CLOSING_TEXT = 'You are in good company.';

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['B1'] = {
    id: 'B1',
    name: 'The Data Reframe',
    tier: 'B',
    mechanism: 'Normalization / external attribution of failure',
    evidence: 'T3',
    time: '30s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Card wrapper
      var card = document.createElement('div');
      card.className = 'reframe-card';
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      card.style.transition = 'opacity 1.5s ease, transform 1.5s ease';

      // Subtle left accent (water blue for cognitive tier)
      card.style.borderLeft = '2px solid rgba(106,143,167,0.3)';
      card.style.paddingLeft = '24px';

      // Prefix
      var note = document.createElement('div');
      note.className = 'rf-note';
      note.textContent = 'A note before you go:';
      card.appendChild(note);

      // Key statistic
      var stat = document.createElement('div');
      stat.className = 'rf-stat';
      stat.innerHTML = '&lt;1 : 1';
      card.appendChild(stat);

      // Body
      var body = document.createElement('div');
      body.className = 'rf-body';
      body.innerHTML =
        'There are currently fewer than 1 job opening per ' +
        'unemployed person in the US\u2009\u2014\u2009the tightest ratio ' +
        'since 2018.' +
        '<br><br>' +
        'A search that doesn\u2019t convert today is not a ' +
        '<em>failure</em>. It\u2019s <em>arithmetic</em>.' +
        '<br><br>' +
        'The search is hard for everyone right now.';
      card.appendChild(body);

      // Closing line (warmer, slightly larger)
      var close = document.createElement('div');
      close.className = 'rf-close';
      close.textContent = CLOSING_TEXT;
      card.appendChild(close);

      // Source
      var source = document.createElement('div');
      source.className = 'rf-source';
      source.textContent = 'Source: BLS JOLTS, January 2026';
      card.appendChild(source);

      container.appendChild(card);

      // Fade in
      timers.push(setTimeout(function () {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 200));

      // Auto-complete after reading time
      timers.push(setTimeout(function () {
        if (!running) return;
        helpers.complete(CLOSING_TEXT, 2, 0);
      }, DISPLAY_TIME));

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'tap', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
