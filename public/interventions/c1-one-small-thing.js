// ═══════════════════════════════════════════════════════════════
// C1 — The One Small Thing
// Mechanism: Implementation intention — specific micro-commitment
// Evidence:  T1 (Gollwitzer; implementation intention meta-analyses)
// Time:      60 seconds
//
// The literature is clear: naming the specific action
// dramatically increases follow-through. One tap.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var ACTIONS = [
    'Update one line of your resume',
    'Message one person in your network',
    'Search one new keyword tomorrow'
  ];
  var CLOSING_TEXT = 'Done. You\u2019ve decided. That\u2019s already progress.';

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['C1'] = {
    id: 'C1',
    name: 'The One Small Thing',
    tier: 'C',
    mechanism: 'Implementation intention — specific micro-commitment',
    evidence: 'T1',
    time: '60s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var selected = false;

      // Prompt
      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.opacity = '0';
      prompt.style.transition = 'opacity 1.2s ease';
      prompt.innerHTML = '<em>Before you close \u2014 pick one small thing:</em>';
      container.appendChild(prompt);

      // Action chips
      var chips = document.createElement('div');
      chips.className = 'action-chips';
      chips.style.opacity = '0';
      chips.style.transition = 'opacity 1s ease';

      for (var i = 0; i < ACTIONS.length; i++) {
        (function (text, idx) {
          var chip = document.createElement('button');
          chip.className = 'action-chip';
          chip.textContent = text;
          chip.addEventListener('click', function () {
            if (selected) return;
            selected = true;

            // Highlight selection
            var all = chips.querySelectorAll('.action-chip');
            for (var j = 0; j < all.length; j++) all[j].classList.remove('selected');
            chip.classList.add('selected');

            // Fade out non-selected chips
            timers.push(setTimeout(function () {
              var all2 = chips.querySelectorAll('.action-chip');
              for (var k = 0; k < all2.length; k++) {
                if (!all2[k].classList.contains('selected')) {
                  all2[k].style.transition = 'opacity 0.6s ease';
                  all2[k].style.opacity = '0';
                }
              }
            }, 400));

            // Show confirmation
            timers.push(setTimeout(function () {
              if (!running) return;
              showConfirmation(idx);
            }, 1200));
          });
          chips.appendChild(chip);
        })(ACTIONS[i], i);
      }
      container.appendChild(chips);

      // Confirmation area (hidden initially)
      var confirmArea = document.createElement('div');
      confirmArea.style.cssText = 'opacity:0;transition:opacity 0.8s ease;margin-top:24px;';
      container.appendChild(confirmArea);

      function showConfirmation(selectedIdx) {
        // Check animation
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 50 50');
        svg.setAttribute('class', 'confirm-anim');

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 14 27 L 22 35 L 38 16');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#7a9e8e');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('class', 'check-path');
        svg.appendChild(path);
        confirmArea.appendChild(svg);

        // Closing text
        var closing = document.createElement('div');
        closing.className = 'closing-text';
        closing.textContent = CLOSING_TEXT;
        confirmArea.appendChild(closing);

        confirmArea.style.opacity = '1';

        // Animate check
        timers.push(setTimeout(function () {
          svg.classList.add('done');
        }, 200));

        // Show text
        timers.push(setTimeout(function () {
          closing.classList.add('vis');
        }, 1000));

        // Complete
        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, 3, 0);
        }, 5000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'tap',
            depth_score: 2,
            selected_index: selectedIdx
          });
        }
      }

      // Fade in sequence
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { chips.style.opacity = '1'; }, 1200));
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
