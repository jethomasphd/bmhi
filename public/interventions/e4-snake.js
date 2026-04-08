// ═══════════════════════════════════════════════════════════════
// E4 — Meditative Serpent (Snake)
// Mechanism: Sustained attention & flow state induction;
//            rhythmic movement occupies executive function,
//            blocking ruminative self-referential processing
// Evidence:  T1 (Russoniello et al. 2009, 2011, 2014 — EEG/HRV;
//            Csikszentmihalyi 1990 — flow state theory)
// Time:      60–120 seconds
//
// No death. Wraps edges. Self-collision trims tail (no punishment).
// No score. No fail state. Just presence and rhythm.
//
// Citations:
//   Russoniello, C. V., O'Brien, K., & Parks, J. M. (2009). EEG,
//     HRV and psychological correlates while playing Bejeweled II.
//     Annual Review of CyberTherapy and Telemedicine, 7, 68–72.
//   Csikszentmihalyi, M. (1990). Flow: The psychology of optimal
//     experience. Harper & Row.
//   Nolen-Hoeksema, S. (2000). The role of rumination in depressive
//     disorders and mixed anxiety/depressive symptoms. Journal of
//     Abnormal Psychology, 109(3), 504–511.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var WORDS = ['breathe', 'pause', "you're here", 'you matter', 'steady', 'ready', 'begin again'];
  var wIdx = 0;
  function nw() { var w = WORDS[wIdx % WORDS.length]; wIdx++; return w; }

  var PAL = ['#c4a35a', '#7a9e8e', '#6a8fa7', '#b07a7a', '#8a9eae', '#b8856e', '#8e7299', '#a69076'];
  function rC() { return PAL[Math.floor(Math.random() * PAL.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var COLS = 12, ROWS = 12;
  var SPEED = 180;
  var AUTO_END = 120000;
  var CLOSING_TEXT = 'Steady rhythm. Steady you.';

  var ICON = {
    left: '<polyline points="15 18 9 12 15 6"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    up: '<polyline points="18 15 12 9 6 15"/>',
    down: '<polyline points="6 9 12 15 18 9"/>'
  };

  var timers = [];
  var raf = null;
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['E4'] = {
    id: 'E4',
    name: 'Meditative Serpent',
    tier: 'E',
    mechanism: 'Sustained attention; flow state (Csikszentmihalyi)',
    evidence: 'T1',
    time: '60\u2013120s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var cell, body, dir, food, moveTimer;
      var floatingWords = [];
      var finished = false;
      var foodEaten = 0;

      function randFood() {
        for (var tries = 0; tries < 100; tries++) {
          var x = Math.floor(Math.random() * COLS), y = Math.floor(Math.random() * ROWS);
          var on = false;
          for (var i = 0; i < body.length; i++) if (body[i].x === x && body[i].y === y) { on = true; break; }
          if (!on) return { x: x, y: y, c: rC() };
        }
        return { x: 0, y: 0, c: rC() };
      }

      function onControl(i) {
        if (finished) return;
        if (i === 0 && dir.x !== 1) dir = { x: -1, y: 0 };
        else if (i === 1 && dir.y !== 1) dir = { x: 0, y: -1 };
        else if (i === 2 && dir.y !== -1) dir = { x: 0, y: 1 };
        else if (i === 3 && dir.x !== -1) dir = { x: 1, y: 0 };
      }

      // Calculate dimensions
      var maxW = Math.min(container.offsetWidth || 320, 320);
      var maxH = Math.min(window.innerHeight * 0.5, 400);
      var sq = Math.min(maxW, maxH);
      cell = Math.floor(sq / COLS);
      cell = clamp(cell, 18, 28);
      var cw = COLS * cell, ch = ROWS * cell;

      // Initialize
      body = [];
      var mid = Math.floor(ROWS / 2);
      for (var i = 4; i >= 0; i--) body.push({ x: Math.floor(COLS / 2) - i, y: mid });
      dir = { x: 1, y: 0 };
      food = randFood();
      moveTimer = 0;

      // Canvas
      var canvas = document.createElement('canvas');
      canvas.width = cw * 2;
      canvas.height = ch * 2;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      canvas.style.borderRadius = '8px';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 10px';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.8s ease';
      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      container.appendChild(canvas);

      // Controls
      var controls = [
        { icon: ICON.left, label: 'Left' },
        { icon: ICON.up, label: 'Up' },
        { icon: ICON.down, label: 'Down' },
        { icon: ICON.right, label: 'Right' }
      ];
      var ctrlRow = document.createElement('div');
      ctrlRow.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-bottom:16px;opacity:0;transition:opacity 0.8s ease;';
      for (var ci = 0; ci < controls.length; ci++) {
        (function (idx) {
          var btn = document.createElement('button');
          btn.style.cssText =
            'width:52px;height:52px;border-radius:50%;background:rgba(42,36,28,0.5);' +
            'border:1px solid rgba(240,236,228,0.07);color:rgba(154,147,132,0.7);' +
            'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
            'transition:all 0.2s;-webkit-tap-highlight-color:transparent;';
          btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + controls[idx].icon + '</svg>';
          btn.setAttribute('aria-label', controls[idx].label);
          btn.addEventListener('click', function () { onControl(idx); });
          btn.addEventListener('touchstart', function (e) { e.preventDefault(); onControl(idx); });
          ctrlRow.appendChild(btn);
        })(ci);
      }
      container.appendChild(ctrlRow);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in
      timers.push(setTimeout(function () { canvas.style.opacity = '1'; ctrlRow.style.opacity = '1'; }, 300));

      function blk(x, y, s, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, s, s, 3);
        else ctx.rect(x, y, s, s);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 2, y + 2, s - 4, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 2, y + s - 1, s - 4, 1);
      }

      function draw() {
        // Background
        ctx.fillStyle = '#141820';
        ctx.fillRect(0, 0, cw, ch);
        ctx.strokeStyle = 'rgba(37,42,56,0.25)';
        ctx.lineWidth = 0.5;
        for (var c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cell, 0); ctx.lineTo(c * cell, ch); ctx.stroke(); }
        for (var r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cell); ctx.lineTo(cw, r * cell); ctx.stroke(); }
        // Food
        ctx.fillStyle = food.c;
        ctx.beginPath();
        ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * 0.35, 0, Math.PI * 2);
        ctx.fill();
        // Body
        for (var i = body.length - 1; i >= 0; i--) {
          var b = body[i];
          var alpha = 0.4 + 0.6 * (1 - i / body.length);
          ctx.save();
          ctx.globalAlpha = alpha;
          blk(b.x * cell + 2, b.y * cell + 2, cell - 4, i === 0 ? '#a8c8a0' : '#7a9e8e');
          ctx.restore();
        }
        // Floating words
        ctx.font = '300 12px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        for (var wi = floatingWords.length - 1; wi >= 0; wi--) {
          var fw = floatingWords[wi];
          fw.age += 16;
          var a = 1 - fw.age / 2000;
          if (a <= 0) { floatingWords.splice(wi, 1); continue; }
          ctx.fillStyle = 'rgba(196,146,42,' + a + ')';
          ctx.fillText(fw.text, cw / 2, fw.y - (fw.age * 0.02));
        }
      }

      var lastTime = performance.now();
      function loop(now) {
        if (!running) return;
        var dt = now - lastTime;
        lastTime = now;

        if (!finished) {
          moveTimer += dt;
          if (moveTimer >= SPEED) {
            moveTimer = 0;
            var head = body[0];
            var nx = (head.x + dir.x + COLS) % COLS;
            var ny = (head.y + dir.y + ROWS) % ROWS;
            // Self-collision: trim tail (no death)
            for (var si = 0; si < body.length; si++) {
              if (body[si].x === nx && body[si].y === ny) {
                body = body.slice(0, si);
                break;
              }
            }
            body.unshift({ x: nx, y: ny });
            if (nx === food.x && ny === food.y) {
              floatingWords.push({ text: nw(), y: ny * cell, age: 0 });
              food = randFood();
              foodEaten++;
              if (body.length > COLS * ROWS * 0.4) body = body.slice(0, 5);
            } else {
              body.pop();
            }
          }
        }
        draw();
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      // Auto-end
      timers.push(setTimeout(function () {
        if (!running || finished) return;
        finishGame();
      }, AUTO_END));

      function finishGame() {
        if (finished || !running) return;
        finished = true;

        canvas.style.transition = 'opacity 1.5s ease';
        canvas.style.opacity = '0.15';
        ctrlRow.style.transition = 'opacity 1s ease';
        ctrlRow.style.opacity = '0';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, foodEaten > 0 ? 3 : 2, 0);
        }, 5000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'game',
            depth_score: foodEaten > 0 ? 3 : 2
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
