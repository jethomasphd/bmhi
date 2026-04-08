// ═══════════════════════════════════════════════════════════════
// E2 — Open Canvas
// Mechanism: Expressive art; cortisol reduction; default mode
//            network restoration
// Evidence:  T3 (art therapy literature; drawing intervention studies)
// Time:      2–3 minutes
//
// "Draw whatever comes. No one will see this."
// Canvas data NEVER uploaded. Download option only.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var DURATION = 120; // 2 minutes
  var COLORS = [
    { value: '#f0ece4', name: 'white' },
    { value: '#c4922a', name: 'amber' },
    { value: '#7a9e8e', name: 'sage' }
  ];
  var CLOSING_TEXT = 'That was yours.';

  var timers = [];
  var interval = null;
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (interval) { clearInterval(interval); interval = null; }
    running = false;
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['E2'] = {
    id: 'E2',
    name: 'Draw',
    tier: 'E',
    mechanism: 'Expressive art; cortisol reduction',
    evidence: 'T3',
    time: '2\u20133min',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var currentColor = COLORS[0].value;
      var drawing = false;
      var lastX = 0, lastY = 0;
      var hasDrawn = false;

      // Prompt
      var prompt = document.createElement('div');
      prompt.style.cssText =
        'font-family:var(--serif);font-size:16px;font-weight:300;' +
        'font-style:italic;color:var(--dim);margin-bottom:16px;' +
        'opacity:0;transition:opacity 1s ease;';
      prompt.textContent = 'Draw whatever comes. No one will see this.';
      container.appendChild(prompt);

      // Canvas wrapper
      var wrap = document.createElement('div');
      wrap.className = 'canvas-wrap';
      wrap.style.opacity = '0';
      wrap.style.transition = 'opacity 0.8s ease';

      var canvas = document.createElement('canvas');
      canvas.className = 'draw-canvas';
      canvas.style.touchAction = 'none';
      // Set actual pixel dimensions
      var cw = 340, ch = 255; // 4:3
      canvas.width = cw * 2; // retina
      canvas.height = ch * 2;
      canvas.style.width = '100%';
      canvas.style.maxWidth = cw + 'px';
      canvas.style.height = 'auto';
      canvas.style.aspectRatio = '4/3';

      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2); // retina scaling
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      wrap.appendChild(canvas);

      // Color picks
      var picks = document.createElement('div');
      picks.className = 'color-picks';

      var pickBtns = [];
      for (var i = 0; i < COLORS.length; i++) {
        (function (c, idx) {
          var btn = document.createElement('div');
          btn.className = 'color-pick' + (idx === 0 ? ' active' : '');
          btn.style.background = c.value;
          btn.addEventListener('click', function () {
            currentColor = c.value;
            for (var j = 0; j < pickBtns.length; j++) pickBtns[j].classList.remove('active');
            btn.classList.add('active');
          });
          pickBtns.push(btn);
          picks.appendChild(btn);
        })(COLORS[i], i);
      }

      // Save/download link
      var saveBtn = document.createElement('button');
      saveBtn.style.cssText =
        'font-family:var(--mono);font-size:9px;color:var(--faint);' +
        'background:none;border:none;cursor:pointer;margin-left:16px;' +
        'letter-spacing:0.5px;transition:color 0.3s;';
      saveBtn.textContent = 'save';
      saveBtn.addEventListener('click', function () {
        var link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
      picks.appendChild(saveBtn);

      wrap.appendChild(picks);

      // Timer bar
      var timerWrap = document.createElement('div');
      timerWrap.style.cssText =
        'width:100%;max-width:' + cw + 'px;height:2px;background:var(--surface);' +
        'border-radius:1px;overflow:hidden;margin-top:10px;';
      var timerFill = document.createElement('div');
      timerFill.style.cssText =
        'height:100%;width:0;border-radius:1px;' +
        'background:linear-gradient(90deg,rgba(142,114,153,0.3),var(--plum));' +
        'transition:width 1s linear;';
      timerWrap.appendChild(timerFill);
      wrap.appendChild(timerWrap);

      container.appendChild(wrap);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '24px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // ─── Drawing mechanics ──────────────────────────────
      function getPos(e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = cw / rect.width;
        var scaleY = ch / rect.height;
        var clientX, clientY;
        if (e.touches) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      }

      function startDraw(e) {
        e.preventDefault();
        drawing = true;
        hasDrawn = true;
        var pos = getPos(e);
        lastX = pos.x; lastY = pos.y;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
      }

      function doDraw(e) {
        if (!drawing) return;
        e.preventDefault();
        var pos = getPos(e);
        ctx.strokeStyle = currentColor;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x; lastY = pos.y;
      }

      function stopDraw(e) {
        if (e) e.preventDefault();
        drawing = false;
      }

      canvas.addEventListener('pointerdown', startDraw);
      canvas.addEventListener('pointermove', doDraw);
      canvas.addEventListener('pointerup', stopDraw);
      canvas.addEventListener('pointerleave', stopDraw);

      // ─── Fade in ────────────────────────────────────────
      timers.push(setTimeout(function () { prompt.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { wrap.style.opacity = '1'; }, 1200));

      // ─── Timer ──────────────────────────────────────────
      var elapsed = 0;
      interval = setInterval(function () {
        if (!running) return;
        elapsed++;
        timerFill.style.width = (elapsed / DURATION * 100) + '%';

        if (elapsed >= DURATION) {
          clearInterval(interval);
          interval = null;
          finishCanvas();
        }
      }, 1000);

      var finished = false;

      function finishCanvas() {
        if (finished || !running) return;
        finished = true;

        wrap.style.transition = 'opacity 1.5s ease';
        wrap.style.opacity = '0.2';
        prompt.style.opacity = '0';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, hasDrawn ? 3 : 1, 0);
        }, 5000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'draw',
            depth_score: hasDrawn ? 3 : 1
          });
        }
      }

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'draw', depth_score: 1 });
      }
    },

    cleanup: function () { clearTimers(); }
  };
})();
