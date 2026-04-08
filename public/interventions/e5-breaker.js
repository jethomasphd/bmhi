// ═══════════════════════════════════════════════════════════════
// E5 — Rhythmic Breaker (Brick Breaker)
// Mechanism: Rhythmic visual tracking produces predictable sensory
//            input that supports parasympathetic activation;
//            smooth pursuit eye movements reduce physiological
//            arousal (EMDR-adjacent mechanism)
// Evidence:  T2 (Russoniello et al. 2009, 2011 — casual games +
//            HRV; van den Hout & Engelhard 2012 — eye movement
//            and working memory taxation; Kavanagh et al. 2001 —
//            visuospatial tasks reduce intrusion vividness)
// Time:      60–120 seconds
//
// No lives. Ball resets to paddle if missed. No fail state.
// Gentle pace. Predictable physics. Just tracking and rhythm.
//
// Citations:
//   Russoniello, C. V., O'Brien, K., & Parks, J. M. (2009). EEG,
//     HRV and psychological correlates while playing Bejeweled II.
//     Annual Review of CyberTherapy and Telemedicine, 7, 68–72.
//   van den Hout, M. A., & Engelhard, I. M. (2012). How does EMDR
//     work? Journal of Experimental Psychopathology, 3(5), 724–738.
//   Kavanagh, D. J., Freese, S., Andrade, J., & May, J. (2001).
//     Effects of visuospatial tasks on desensitization to emotive
//     memories. British Journal of Clinical Psychology, 40, 267–280.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var WORDS = ['breathe', 'pause', "you're here", 'you matter', 'steady', 'ready', 'begin again'];
  var wIdx = 0;
  function nw() { var w = WORDS[wIdx % WORDS.length]; wIdx++; return w; }

  var PAL = ['#c4a35a', '#7a9e8e', '#6a8fa7', '#b07a7a', '#8a9eae', '#b8856e', '#8e7299', '#a69076'];
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var PADDLE_W = 80, PADDLE_H = 10, BALL_R = 5;
  var BALL_SPEED = 1.6;
  var BRICK_ROWS = 5, BRICK_COLS = 8;
  var AUTO_END = 120000;
  var CLOSING_TEXT = 'Rhythm and focus. Your mind knows how to find calm.';

  var ICON = {
    left: '<polyline points="15 18 9 12 15 6"/>',
    right: '<polyline points="9 18 15 12 9 6"/>'
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

  window.BMHI_INTERVENTIONS['E5'] = {
    id: 'E5',
    name: 'Rhythmic Breaker',
    tier: 'E',
    mechanism: 'Rhythmic tracking; parasympathetic activation',
    evidence: 'T2',
    time: '60\u2013120s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var W, H, paddle, ball, bricks, brickW, brickH;
      var floatingWords = [];
      var finished = false;
      var bricksHit = 0;

      function resetBall() {
        ball = { x: paddle.x, y: H - 30 - BALL_R, dx: BALL_SPEED * 0.7, dy: -BALL_SPEED };
      }

      function initBricks() {
        bricks = [];
        for (var r = 0; r < BRICK_ROWS; r++) {
          for (var c = 0; c < BRICK_COLS; c++) {
            if (Math.random() < 0.15) continue;
            bricks.push({
              x: c * brickW, y: 20 + r * (brickH + 3),
              w: brickW - 2, h: brickH,
              c: PAL[r % PAL.length], alive: true
            });
          }
        }
      }

      function onControl(i) {
        if (finished) return;
        if (i === 0) paddle.x = Math.max(paddle.w / 2, paddle.x - 20);
        else if (i === 1) paddle.x = Math.min(W - paddle.w / 2, paddle.x + 20);
      }

      // Calculate dimensions
      var maxW = Math.min(container.offsetWidth || 320, 280);
      var maxH = Math.min(window.innerHeight * 0.55, 400);
      W = maxW;
      H = Math.min(maxH, 400);
      brickW = Math.floor(W / BRICK_COLS);
      brickH = 14;
      paddle = { x: W / 2, w: PADDLE_W };
      resetBall();
      initBricks();

      // Canvas
      var canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.style.borderRadius = '8px';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 10px';
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.8s ease';
      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      container.appendChild(canvas);

      // Controls (only left and right)
      var controls = [
        { icon: ICON.left, label: 'Left' },
        { icon: ICON.right, label: 'Right' }
      ];
      var ctrlRow = document.createElement('div');
      ctrlRow.style.cssText = 'display:flex;gap:16px;justify-content:center;margin-bottom:16px;opacity:0;transition:opacity 0.8s ease;';
      for (var ci = 0; ci < controls.length; ci++) {
        (function (idx) {
          var btn = document.createElement('button');
          btn.style.cssText =
            'width:60px;height:52px;border-radius:26px;background:rgba(42,36,28,0.5);' +
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

      function draw() {
        ctx.fillStyle = '#141820';
        ctx.fillRect(0, 0, W, H);
        // Bricks
        for (var i = 0; i < bricks.length; i++) {
          var br = bricks[i];
          if (!br.alive) continue;
          ctx.fillStyle = br.c;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(br.x + 1, br.y, br.w, br.h, 2);
          else ctx.rect(br.x + 1, br.y, br.w, br.h);
          ctx.fill();
        }
        // Paddle
        ctx.fillStyle = '#c4a35a';
        ctx.beginPath();
        var px = paddle.x - paddle.w / 2;
        if (ctx.roundRect) ctx.roundRect(px, H - 30, paddle.w, PADDLE_H, 5);
        else ctx.rect(px, H - 30, paddle.w, PADDLE_H);
        ctx.fill();
        // Ball
        ctx.fillStyle = '#d4cdc0';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
        // Floating words
        ctx.font = '300 12px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        for (var wi = floatingWords.length - 1; wi >= 0; wi--) {
          var fw = floatingWords[wi];
          fw.age += 16;
          var a = 1 - fw.age / 2000;
          if (a <= 0) { floatingWords.splice(wi, 1); continue; }
          ctx.fillStyle = 'rgba(196,146,42,' + a + ')';
          ctx.fillText(fw.text, W / 2, fw.y - (fw.age * 0.02));
        }
      }

      var lastTime = performance.now();
      function loop(now) {
        if (!running) return;
        var dt = now - lastTime;
        lastTime = now;

        if (!finished) {
          var steps = Math.ceil(dt / 8);
          for (var s = 0; s < steps; s++) {
            ball.x += ball.dx;
            ball.y += ball.dy;
            // Wall bounce
            if (ball.x <= BALL_R || ball.x >= W - BALL_R) { ball.dx = -ball.dx; ball.x = clamp(ball.x, BALL_R, W - BALL_R); }
            if (ball.y <= BALL_R) { ball.dy = Math.abs(ball.dy); }
            // Paddle bounce
            if (ball.dy > 0 && ball.y >= H - 30 - BALL_R && ball.y <= H - 20) {
              var ppx = ball.x - paddle.x;
              if (Math.abs(ppx) < paddle.w / 2 + BALL_R) {
                ball.dy = -Math.abs(ball.dy);
                ball.dx = BALL_SPEED * (ppx / (paddle.w / 2)) * 0.9;
                ball.y = H - 30 - BALL_R;
              }
            }
            // Reset if below paddle (no punishment)
            if (ball.y > H + 10) resetBall();
            // Brick collision
            for (var bi = 0; bi < bricks.length; bi++) {
              var br = bricks[bi];
              if (!br.alive) continue;
              if (ball.x >= br.x && ball.x <= br.x + br.w && ball.y - BALL_R <= br.y + br.h && ball.y + BALL_R >= br.y) {
                br.alive = false;
                ball.dy = -ball.dy;
                bricksHit++;
                floatingWords.push({ text: nw(), y: br.y, age: 0 });
                break;
              }
            }
          }
          // Regenerate bricks if all gone
          var alive = false;
          for (var j = 0; j < bricks.length; j++) if (bricks[j].alive) { alive = true; break; }
          if (!alive) initBricks();
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
          helpers.complete(CLOSING_TEXT, bricksHit > 0 ? 3 : 2, 0);
        }, 5000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'game',
            depth_score: bricksHit > 0 ? 3 : 2
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
