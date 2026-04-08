// ═══════════════════════════════════════════════════════════════
// E1 — Pattern Match Micro-Game
// Mechanism: Flow state induction; rumination crowding via
//            executive function engagement
// Evidence:  T1 (Russoniello et al. 2009, 2011, 2014 — EEG/HRV)
// Time:      60–90 seconds
//
// No timer. No score. No fail state.
// Absence of stakes is critical to the mechanism.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var SYMBOLS = [
    { shape: '\u25C6', color: '#c4922a' }, // amber diamond
    { shape: '\u25CF', color: '#7a9e8e' }, // sage circle
    { shape: '\u25B2', color: '#6a8fa7' }, // water triangle
    { shape: '\u25A0', color: '#b8856e' }, // clay square
    { shape: '\u25C7', color: '#b07a7a' }, // rose diamond outline
    { shape: '\u25CB', color: '#8e7299' }, // plum circle outline
    { shape: '\u25B3', color: '#8a9eae' }, // mist triangle outline
    { shape: '\u25A1', color: '#a69076' }  // sand square outline
  ];

  var CLOSING_TEXT = 'That\u2019s your brain doing what it\u2019s good at.';
  var AUTO_END = 90000; // 90 seconds

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  // Fisher-Yates shuffle
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['E1'] = {
    id: 'E1',
    name: 'Match',
    tier: 'E',
    mechanism: 'Flow state; rumination crowding',
    evidence: 'T1',
    time: '60\u201390s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Build deck: 8 pairs = 16 cards
      var deck = [];
      for (var i = 0; i < SYMBOLS.length; i++) {
        deck.push({ id: i, shape: SYMBOLS[i].shape, color: SYMBOLS[i].color });
        deck.push({ id: i, shape: SYMBOLS[i].shape, color: SYMBOLS[i].color });
      }
      deck = shuffle(deck);

      var matched = 0;
      var flipped = [];
      var locked = false;
      var pairsMatched = 0;

      // Grid
      var grid = document.createElement('div');
      grid.className = 'match-grid';
      grid.style.opacity = '0';
      grid.style.transition = 'opacity 0.8s ease';

      var cards = [];

      for (var c = 0; c < deck.length; c++) {
        (function (idx) {
          var card = document.createElement('div');
          card.className = 'match-card';
          card.setAttribute('data-id', deck[idx].id);
          card.setAttribute('data-idx', idx);

          // Face content (hidden by default)
          var face = document.createElement('span');
          face.style.cssText =
            'font-size:28px;opacity:0;transition:opacity 0.2s ease;' +
            'color:' + deck[idx].color + ';user-select:none;';
          face.textContent = deck[idx].shape;
          card.appendChild(face);

          card.addEventListener('click', function () {
            if (!running || locked) return;
            if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

            // Flip
            card.classList.add('flipped');
            face.style.opacity = '1';
            flipped.push({ card: card, face: face, id: deck[idx].id });

            if (flipped.length === 2) {
              locked = true;
              var a = flipped[0], b = flipped[1];

              if (a.id === b.id) {
                // Match
                timers.push(setTimeout(function () {
                  if (!running) return;
                  a.card.classList.add('matched');
                  b.card.classList.add('matched');
                  pairsMatched++;
                  flipped = [];
                  locked = false;

                  if (pairsMatched >= SYMBOLS.length) {
                    finishGame();
                  }
                }, 400));
              } else {
                // No match — flip back
                timers.push(setTimeout(function () {
                  if (!running) return;
                  a.card.classList.remove('flipped');
                  b.card.classList.remove('flipped');
                  a.face.style.opacity = '0';
                  b.face.style.opacity = '0';
                  flipped = [];
                  locked = false;
                }, 800));
              }
            }
          });

          cards.push(card);
          grid.appendChild(card);
        })(c);
      }

      container.appendChild(grid);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '32px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in grid
      timers.push(setTimeout(function () { grid.style.opacity = '1'; }, 300));

      // Auto-end after 90s
      timers.push(setTimeout(function () {
        if (running && pairsMatched < SYMBOLS.length) {
          finishGame();
        }
      }, AUTO_END));

      var finished = false;

      function finishGame() {
        if (finished || !running) return;
        finished = true;

        // Fade out grid
        grid.style.transition = 'opacity 1.5s ease';
        grid.style.opacity = '0.15';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          // depth: 3 if all matched, 2 if partial
          var depth = pairsMatched >= SYMBOLS.length ? 3 : 2;
          helpers.complete(CLOSING_TEXT, depth, 0);
        }, 6000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'game',
            depth_score: pairsMatched >= SYMBOLS.length ? 3 : 2
          });
        }
      }

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'game', depth_score: 1 });
      }
    },

    cleanup: function () { clearTimers(); }
  };
})();
