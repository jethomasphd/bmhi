// ═══════════════════════════════════════════════════════════════
// F1 — The Check-In Screen (SBIRT Model)
// Mechanism: SBIRT — brief screening, open referral pathway
// Evidence:  T1 (SBIRT literature, adapted for digital)
// Time:      15 seconds
//
// THIS IS AN ETHICAL REQUIREMENT, NOT A PRODUCT FEATURE.
// DO NOT replace the intervention with a crisis screen.
// SBIRT layers screening ONTO intervention, not instead of it.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var EMOJIS = [
    { icon: '\uD83D\uDE1E', label: 'very low', score: 1 },
    { icon: '\uD83D\uDE1F', label: 'low', score: 2 },
    { icon: '\uD83D\uDE10', label: 'neutral', score: 3 },
    { icon: '\uD83D\uDE42', label: 'okay', score: 4 },
    { icon: '\uD83D\uDE0A', label: 'good', score: 5 }
  ];

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  // Build referral card DOM (reusable)
  function buildReferralCard() {
    var card = document.createElement('div');
    card.className = 'referral-card';
    card.innerHTML =
      '<div class="ref-intro">Some searches hit harder than others. ' +
      'If you want to talk to someone, here are free options:</div>' +
      '<a href="sms:741741&body=HOME" class="referral-link">' +
        '<div class="ref-name">Crisis Text Line</div>' +
        '<div class="ref-detail">Text HOME to 741741</div>' +
      '</a>' +
      '<a href="tel:18006624357" class="referral-link">' +
        '<div class="ref-name">SAMHSA Helpline</div>' +
        '<div class="ref-detail">1-800-662-4357</div>' +
      '</a>' +
      '<a href="tel:988" class="referral-link">' +
        '<div class="ref-name">988 Suicide &amp; Crisis Lifeline</div>' +
        '<div class="ref-detail">Call or text 988</div>' +
      '</a>';
    return card;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['F1'] = {
    id: 'F1',
    name: 'Check In',
    tier: 'F',
    mechanism: 'SBIRT — brief screening, open referral',
    evidence: 'T1',
    time: '15s',

    // Minimum visits for auto-trigger (router checks this)
    minVisits: 4,
    // Flag: this is a pre-layer, not standalone
    isPreLayer: true,

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Prompt
      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.opacity = '0';
      prompt.style.transition = 'opacity 1.2s ease';
      prompt.innerHTML = '<em>How are you feeling after today\u2019s search?</em>';
      container.appendChild(prompt);

      // Emoji scale
      var scale = document.createElement('div');
      scale.className = 'emoji-scale';
      scale.style.opacity = '0';
      scale.style.transition = 'opacity 1s ease';

      var selected = false;

      for (var i = 0; i < EMOJIS.length; i++) {
        (function (em) {
          var btn = document.createElement('button');
          btn.className = 'emoji-btn';
          btn.textContent = em.icon;
          btn.setAttribute('aria-label', em.label);
          btn.addEventListener('click', function () {
            if (selected) return;
            selected = true;

            // Highlight selection
            var all = scale.querySelectorAll('.emoji-btn');
            for (var j = 0; j < all.length; j++) all[j].classList.remove('selected');
            btn.classList.add('selected');

            handleScore(em.score);
          });
          scale.appendChild(btn);
        })(EMOJIS[i]);
      }
      container.appendChild(scale);

      // Acknowledgment / referral area
      var responseArea = document.createElement('div');
      responseArea.style.cssText = 'margin-top:24px;max-width:400px;width:100%;';
      container.appendChild(responseArea);

      // Fade in
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { scale.style.opacity = '1'; }, 1500));

      function handleScore(score) {
        // Log the check-in
        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'tap',
            depth_score: 2,
            checkin_score: score,
            referral_shown: score <= 2
          });
        }

        if (score >= 4) {
          // Fine — move to intervention
          timers.push(setTimeout(function () {
            if (!running) return;
            helpers.complete('', 2, 0);
          }, 1000));
        } else if (score === 3) {
          // Warm acknowledgment
          var ack = document.createElement('div');
          ack.className = 'closing-text';
          ack.textContent = 'Thank you for checking in.';
          responseArea.appendChild(ack);
          timers.push(setTimeout(function () { ack.classList.add('vis'); }, 400));
          timers.push(setTimeout(function () {
            if (!running) return;
            helpers.complete('', 2, 0);
          }, 3000));
        } else {
          // Score 1-2: show referral card
          var ack2 = document.createElement('div');
          ack2.className = 'closing-text';
          ack2.style.marginBottom = '16px';
          ack2.textContent = 'Thank you for being honest.';
          responseArea.appendChild(ack2);

          var card = buildReferralCard();
          responseArea.appendChild(card);

          timers.push(setTimeout(function () { ack2.classList.add('vis'); }, 400));
          timers.push(setTimeout(function () { card.classList.add('vis'); }, 1500));

          // Still complete to intervention — referral is ADDITION not substitution
          timers.push(setTimeout(function () {
            if (!running) return;
            helpers.complete('', 2, 0);
          }, 8000));
        }
      }
    },

    cleanup: function () { clearTimers(); }
  };
})();
