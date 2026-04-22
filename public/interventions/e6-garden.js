// ═══════════════════════════════════════════════════════════════
// E6 — Mindful Garden (Nurturing Whac-A-Mole variant)
// Mechanism: Behavioral activation via nurturing interaction;
//            non-violent, non-competitive engagement produces
//            positive affect without performance pressure;
//            tending/befriending response (Taylor et al. 2000)
// Evidence:  T2 (Kaplan 1995 — Attention Restoration Theory;
//            Ulrich 1991 — stress recovery from nature exposure;
//            Russoniello et al. 2009 — casual games + HRV)
// Time:      60–120 seconds
//
// Flowers sprout. Tap to tend them. They bloom.
// No violence. No whacking. Just nurturing.
// Canvas-tap interaction. No button controls needed.
//
// Citations:
//   Kaplan, S. (1995). The restorative benefits of nature: Toward
//     an integrative framework. Journal of Environmental Psychology,
//     15(3), 169–182.
//   Ulrich, R. S., Simons, R. F., Losito, B. D., Fiorito, E.,
//     Miles, M. A., & Zelson, M. (1991). Stress recovery during
//     exposure to natural and urban environments. Journal of
//     Environmental Psychology, 11(3), 201–230.
//   Taylor, S. E., Klein, L. C., Lewis, B. P., Gruenewald, T. L.,
//     Gurung, R. A., & Updegraff, J. A. (2000). Biobehavioral
//     responses to stress in females: Tend-and-befriend.
//     Psychological Review, 107(3), 411–429.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var WORDS = ['breathe', 'pause', "you're here", 'you matter', 'steady', 'ready', 'begin again'];
  var wIdx = 0;
  function nw() { var w = WORDS[wIdx % WORDS.length]; wIdx++; return w; }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var COLS = 4, ROWS = 4;
  var SPROUT_INTERVAL = 1500;
  var PLANT_COLORS = ['#7a9e8e', '#6aaa8e', '#b8856e', '#8e7299', '#c4a35a', '#b07a7a'];
  var AUTO_END = 120000;
  var CLOSING_TEXT = 'You tended something small. Now tend the search.';

  function pCol() { return PLANT_COLORS[Math.floor(Math.random() * PLANT_COLORS.length)]; }

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

  window.BMHI_INTERVENTIONS['E6'] = {
    id: 'E6',
    name: 'Garden',
    tier: 'E',
    mechanism: 'Nurturing activation; attention restoration (Kaplan)',
    evidence: 'T2',
    time: '60\u2013120s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var cell, plots, sproutTimer;
      var floatingWords = [];
      var finished = false;
      var blooms = 0;

      // Prompt
      var prompt = document.createElement('div');
      prompt.style.cssText =
        'font-family:var(--serif);font-size:16px;font-weight:300;' +
        'font-style:italic;color:var(--dim);margin-bottom:12px;' +
        'opacity:0;transition:opacity 1s ease;';
      prompt.textContent = 'Tap the flowers. A quick reset while we refresh your feed.';
      container.appendChild(prompt);

      // Calculate dimensions — leave room for prompt + closing on mobile.
      var maxW = Math.min(container.offsetWidth || window.innerWidth, 300);
      var maxH = Math.min(window.innerHeight - 200, 320);
      var sq = Math.min(maxW, maxH);
      cell = Math.floor(sq / COLS);
      cell = clamp(cell, 36, 64);
      var cw = COLS * cell, ch = ROWS * cell;

      // Initialize plots
      plots = [];
      for (var r = 0; r < ROWS; r++) {
        plots[r] = [];
        for (var c = 0; c < COLS; c++) {
          plots[r][c] = { state: 'empty', color: null, age: 0, bloomAge: 0 };
        }
      }
      // Pre-sprout a few
      for (var i = 0; i < 4; i++) {
        var pr = Math.floor(Math.random() * ROWS), pc = Math.floor(Math.random() * COLS);
        plots[pr][pc] = { state: 'growing', color: pCol(), age: 500 + Math.random() * 1000, bloomAge: 0 };
      }
      sproutTimer = 0;

      // Canvas
      var canvas = document.createElement('canvas');
      canvas.width = cw * 2;
      canvas.height = ch * 2;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      canvas.style.borderRadius = '8px';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 12px';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.8s ease';
      canvas.style.cursor = 'pointer';
      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      container.appendChild(canvas);

      // Tap handler
      function handleTap(e) {
        if (finished) return;
        var rect = canvas.getBoundingClientRect();
        var scaleX = cw / rect.width;
        var scaleY = ch / rect.height;
        var clientX, clientY;
        if (e.touches) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
          e.preventDefault();
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        var x = (clientX - rect.left) * scaleX;
        var y = (clientY - rect.top) * scaleY;
        var tc = Math.floor(x / cell), tr = Math.floor(y / cell);
        if (tr < 0 || tr >= ROWS || tc < 0 || tc >= COLS) return;
        var p = plots[tr][tc];
        if (p.state === 'growing' || p.state === 'sprouting') {
          p.state = 'blooming';
          p.bloomAge = 0;
          blooms++;
          floatingWords.push({ text: nw(), y: tr * cell + cell / 2, age: 0 });
        }
      }
      canvas.addEventListener('click', handleTap);
      canvas.addEventListener('touchstart', handleTap);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { canvas.style.opacity = '1'; }, 800));

      function draw() {
        ctx.fillStyle = '#141820';
        ctx.fillRect(0, 0, cw, ch);

        for (var r = 0; r < ROWS; r++) {
          for (var c = 0; c < COLS; c++) {
            var px = c * cell, py = r * cell;
            var p = plots[r][c];

            // Plot background
            ctx.fillStyle = '#1a1f2a';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(px + 3, py + 3, cell - 6, cell - 6, 6);
            else ctx.rect(px + 3, py + 3, cell - 6, cell - 6);
            ctx.fill();
            ctx.strokeStyle = 'rgba(37,42,56,0.5)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            var cx = px + cell / 2, cy = py + cell / 2;

            if (p.state === 'sprouting') {
              ctx.fillStyle = p.color;
              ctx.globalAlpha = 0.5;
              ctx.beginPath();
              ctx.arc(cx, cy + 4, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            } else if (p.state === 'growing') {
              var growPct = Math.min(p.age / 3000, 1);
              var stemH = 8 + growPct * 14;
              ctx.strokeStyle = '#5a8a5a';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cx, cy + 10);
              ctx.lineTo(cx, cy + 10 - stemH);
              ctx.stroke();
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(cx, cy + 10 - stemH, 4 + growPct * 4, 0, Math.PI * 2);
              ctx.fill();
              // Pulse to invite tapping
              if (growPct > 0.5) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.15 + Math.sin(p.age * 0.004) * 0.1;
                ctx.beginPath();
                ctx.arc(cx, cy + 10 - stemH, 10 + growPct * 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
              }
            } else if (p.state === 'blooming') {
              var fade = 1 - p.bloomAge / 1800;
              ctx.fillStyle = p.color;
              ctx.globalAlpha = fade * 0.15;
              ctx.beginPath();
              ctx.arc(cx, cy, cell * 0.35, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = fade;
              for (var pe = 0; pe < 6; pe++) {
                var pa = (pe / 6) * Math.PI * 2 + p.bloomAge * 0.001;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(pa) * 8, cy + Math.sin(pa) * 8, 4, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.fillStyle = '#c4a35a';
              ctx.beginPath();
              ctx.arc(cx, cy, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            } else if (p.state === 'wilted') {
              var wFade = 1 - p.age / 1000;
              ctx.fillStyle = '#3a3a3a';
              ctx.globalAlpha = wFade * 0.5;
              ctx.beginPath();
              ctx.arc(cx, cy, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
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
          sproutTimer += dt;
          if (sproutTimer >= SPROUT_INTERVAL) {
            sproutTimer = 0;
            var empties = [];
            for (var r = 0; r < ROWS; r++)
              for (var c = 0; c < COLS; c++)
                if (plots[r][c].state === 'empty') empties.push({ r: r, c: c });
            if (empties.length > 0) {
              var pick = empties[Math.floor(Math.random() * empties.length)];
              plots[pick.r][pick.c] = { state: 'sprouting', color: pCol(), age: 0, bloomAge: 0 };
            }
          }
          for (var r2 = 0; r2 < ROWS; r2++) {
            for (var c2 = 0; c2 < COLS; c2++) {
              var p = plots[r2][c2];
              if (p.state === 'sprouting') {
                p.age += dt;
                if (p.age > 600) p.state = 'growing';
              } else if (p.state === 'growing') {
                p.age += dt;
                if (p.age > 6000) { p.state = 'wilted'; p.age = 0; }
              } else if (p.state === 'blooming') {
                p.bloomAge += dt;
                if (p.bloomAge > 1800) { p.state = 'empty'; p.color = null; p.age = 0; p.bloomAge = 0; }
              } else if (p.state === 'wilted') {
                p.age += dt;
                if (p.age > 1000) { p.state = 'empty'; p.color = null; p.age = 0; }
              }
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
        prompt.style.transition = 'opacity 1s ease';
        prompt.style.opacity = '0';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, blooms > 0 ? 3 : 2, 0);
        }, 5000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'game',
            depth_score: blooms > 0 ? 3 : 2
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
