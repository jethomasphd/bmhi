// ═══════════════════════════════════════════════════════════════
// E3 — Meditative Tetris
// Mechanism: Visuospatial processing interrupts rumination;
//            executive function engagement blocks intrusive thought
// Evidence:  T1 (Holmes et al. 2009, 2010 — Tetris reduces
//            intrusive memories; Russoniello et al. 2009, 2011 —
//            casual games produce EEG/HRV parasympathetic shift)
// Time:      60–120 seconds
//
// No score. No game-over. No fail state.
// Performance pressure reactivates the stress response.
// Lines cleared release floating affirmation words.
//
// Citations:
//   Holmes, E. A., James, E. L., Coode-Bate, T., & Deeprose, C.
//     (2009). Can playing the computer game "Tetris" reduce the
//     build-up of flashback-like images? PLoS ONE, 4(1), e4153.
//   Holmes, E. A., James, E. L., Kilford, E. J., & Deeprose, C.
//     (2010). Key steps in developing a cognitive vaccine against
//     traumatic flashbacks. PLoS ONE, 5(11), e13706.
//   Russoniello, C. V., O'Brien, K., & Parks, J. M. (2009). EEG,
//     HRV and psychological correlates while playing Bejeweled II.
//     Annual Review of CyberTherapy and Telemedicine, 7, 68–72.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var WORDS = ['breathe', 'pause', "you're here", 'you matter', 'steady', 'ready', 'begin again'];
  var wIdx = 0;
  function nw() { var w = WORDS[wIdx % WORDS.length]; wIdx++; return w; }

  var PAL = ['#c4a35a', '#7a9e8e', '#6a8fa7', '#b07a7a', '#8a9eae', '#b8856e', '#8e7299', '#a69076'];
  function rC() { return PAL[Math.floor(Math.random() * PAL.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var COLS = 8, ROWS = 14;
  var DROP = 1000;
  var AUTO_END = 120000; // 2 minutes
  var CLOSING_TEXT = 'Focus over worry. Now let’s find the match.';

  var PIECES = [
    { s: [[1, 1], [1, 1]], c: '#c4a35a' },
    { s: [[1, 1, 1]], c: '#7a9e8e' },
    { s: [[1, 1, 1, 1]], c: '#6a8fa7' },
    { s: [[1, 1, 0], [0, 1, 1]], c: '#b07a7a' },
    { s: [[0, 1, 1], [1, 1, 0]], c: '#8a9eae' },
    { s: [[1, 0], [1, 0], [1, 1]], c: '#b8856e' },
    { s: [[0, 1], [0, 1], [1, 1]], c: '#8e7299' },
    { s: [[1, 1, 1], [0, 1, 0]], c: '#a69076' }
  ];

  var ICON = {
    left: '<polyline points="15 18 9 12 15 6"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    rotate: '<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    slam: '<polyline points="7 13 12 18 17 13"/><line x1="12" y1="6" x2="12" y2="18"/>'
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

  window.BMHI_INTERVENTIONS['E3'] = {
    id: 'E3',
    name: 'Blocks',
    tier: 'E',
    mechanism: 'Visuospatial rumination interruption (Holmes)',
    evidence: 'T1',
    time: '60\u2013120s',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var prompt = document.createElement('div');
      prompt.className = 'prompt-text';
      prompt.style.cssText = 'font-size:14px;margin-bottom:20px;color:var(--dim);';
      prompt.textContent = 'Quick rhythm reset. We\u2019re freshening your feed.';
      container.appendChild(prompt);

      var cell, grid, piece, dropTimer, linesCleared;
      var floatingWords = [];
      var finished = false;

      function spawn() {
        var d = PIECES[Math.floor(Math.random() * PIECES.length)];
        var sh = [];
        for (var r = 0; r < d.s.length; r++) sh[r] = d.s[r].slice();
        return { s: sh, c: d.c, x: Math.floor((COLS - sh[0].length) / 2), y: 0 };
      }

      function fits(sh, px, py) {
        for (var r = 0; r < sh.length; r++)
          for (var c = 0; c < sh[r].length; c++)
            if (sh[r][c]) {
              var gx = px + c, gy = py + r;
              if (gx < 0 || gx >= COLS || gy >= ROWS) return false;
              if (gy >= 0 && grid[gy][gx]) return false;
            }
        return true;
      }

      function lock() {
        for (var r = 0; r < piece.s.length; r++)
          for (var c = 0; c < piece.s[r].length; c++)
            if (piece.s[r][c]) {
              var gy = piece.y + r, gx = piece.x + c;
              if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) grid[gy][gx] = piece.c;
            }
      }

      function clearLines() {
        var ev = [];
        for (var r = ROWS - 1; r >= 0; r--) {
          var full = true;
          for (var c = 0; c < COLS; c++) if (!grid[r][c]) { full = false; break; }
          if (full) {
            ev.push({ text: nw(), y: r * cell, age: 0 });
            grid.splice(r, 1);
            var nr = [];
            for (var c2 = 0; c2 < COLS; c2++) nr.push(null);
            grid.unshift(nr);
            r++;
            linesCleared++;
          }
        }
        return ev;
      }

      function onControl(i) {
        if (!piece || finished) return;
        if (i === 0 && fits(piece.s, piece.x - 1, piece.y)) piece.x--;
        else if (i === 2 && fits(piece.s, piece.x + 1, piece.y)) piece.x++;
        else if (i === 1) {
          var old = piece.s, rows = old.length, cols = old[0].length, rot = [];
          for (var c = 0; c < cols; c++) {
            rot[c] = [];
            for (var r = rows - 1; r >= 0; r--) rot[c].push(old[r][c]);
          }
          var off = [0, -1, 1, -2, 2];
          for (var j = 0; j < off.length; j++)
            if (fits(rot, piece.x + off[j], piece.y)) { piece.s = rot; piece.x += off[j]; break; }
        } else if (i === 3) {
          while (fits(piece.s, piece.x, piece.y + 1)) piece.y++;
          lock();
          var ev = clearLines();
          for (var e = 0; e < ev.length; e++) floatingWords.push(ev[e]);
          piece = spawn();
          if (!fits(piece.s, piece.x, piece.y)) {
            for (var r = 0; r < 4; r++) for (var c = 0; c < COLS; c++) grid[r][c] = null;
            piece.y = 0;
          }
          dropTimer = 0;
        }
      }

      // Calculate dimensions — reserve ~180px for prompt + controls + closing.
      var maxW = Math.min(container.offsetWidth || window.innerWidth, 300);
      var maxH = Math.min(window.innerHeight - 220, 440);
      cell = Math.floor(Math.min(maxW / COLS, maxH / ROWS));
      cell = clamp(cell, 16, 30);
      var cw = COLS * cell, ch = ROWS * cell;

      // Initialize grid
      grid = [];
      for (var r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (var c = 0; c < COLS; c++) grid[r][c] = null;
      }
      // Seed bottom rows for immediate puzzle-feel
      for (var r2 = ROWS - 5; r2 < ROWS; r2++) {
        var d = 0.4 + (r2 - (ROWS - 5)) * 0.08;
        for (var c2 = 0; c2 < COLS; c2++) if (Math.random() < d) grid[r2][c2] = rC();
      }
      for (var r3 = ROWS - 5; r3 < ROWS; r3++) {
        var f = true;
        for (var c3 = 0; c3 < COLS; c3++) if (!grid[r3][c3]) { f = false; break; }
        if (f) for (var g = 0; g < 3; g++) grid[r3][Math.floor(Math.random() * COLS)] = null;
      }
      piece = spawn();
      dropTimer = 0;
      linesCleared = 0;

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
        { icon: ICON.left, label: 'Move left' },
        { icon: ICON.rotate, label: 'Rotate' },
        { icon: ICON.right, label: 'Move right' },
        { icon: ICON.slam, label: 'Drop' }
      ];
      var ctrlRow = document.createElement('div');
      ctrlRow.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-bottom:16px;opacity:0;transition:opacity 0.8s ease;';
      for (var ci = 0; ci < controls.length; ci++) {
        (function (idx) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText =
            'width:58px;height:58px;border-radius:50%;background:rgba(42,36,28,0.5);' +
            'border:1px solid rgba(240,236,228,0.12);color:rgba(196,146,42,0.85);' +
            'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
            'transition:all 0.15s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;' +
            'user-select:none;';
          btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + controls[idx].icon + '</svg>';
          btn.setAttribute('aria-label', controls[idx].label);
          btn.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            btn.style.background = 'rgba(196,146,42,0.15)';
            onControl(idx);
          });
          var reset = function () { btn.style.background = 'rgba(42,36,28,0.5)'; };
          btn.addEventListener('pointerup', reset);
          btn.addEventListener('pointerleave', reset);
          btn.addEventListener('pointercancel', reset);
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

      // Drawing
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
        // Grid lines
        ctx.strokeStyle = 'rgba(37,42,56,0.25)';
        ctx.lineWidth = 0.5;
        for (var c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cell, 0); ctx.lineTo(c * cell, ch); ctx.stroke(); }
        for (var r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cell); ctx.lineTo(cw, r * cell); ctx.stroke(); }
        // Locked blocks
        for (var r2 = 0; r2 < ROWS; r2++)
          for (var c2 = 0; c2 < COLS; c2++)
            if (grid[r2][c2]) blk(c2 * cell + 1, r2 * cell + 1, cell - 2, grid[r2][c2]);
        // Active piece
        if (piece)
          for (var pr = 0; pr < piece.s.length; pr++)
            for (var pc = 0; pc < piece.s[pr].length; pc++)
              if (piece.s[pr][pc]) blk((piece.x + pc) * cell + 1, (piece.y + pr) * cell + 1, cell - 2, piece.c);
        // Floating words
        ctx.font = '300 12px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        for (var wi = floatingWords.length - 1; wi >= 0; wi--) {
          var fw = floatingWords[wi];
          fw.age += 16;
          var alpha = 1 - fw.age / 2000;
          if (alpha <= 0) { floatingWords.splice(wi, 1); continue; }
          ctx.fillStyle = 'rgba(196,146,42,' + alpha + ')';
          ctx.fillText(fw.text, cw / 2, fw.y - (fw.age * 0.02));
        }
      }

      // Game loop
      var lastTime = performance.now();
      function loop(now) {
        if (!running) return;
        var dt = now - lastTime;
        lastTime = now;

        if (!finished) {
          dropTimer += dt;
          if (dropTimer >= DROP) {
            dropTimer = 0;
            if (fits(piece.s, piece.x, piece.y + 1)) {
              piece.y++;
            } else {
              lock();
              var ev = clearLines();
              for (var e = 0; e < ev.length; e++) floatingWords.push(ev[e]);
              piece = spawn();
              if (!fits(piece.s, piece.x, piece.y)) {
                for (var r = 0; r < 4; r++) for (var c = 0; c < COLS; c++) grid[r][c] = null;
                piece.y = 0;
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
        ctrlRow.style.transition = 'opacity 1s ease';
        ctrlRow.style.opacity = '0';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 1500));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, linesCleared > 0 ? 3 : 2, 0);
        }, 5000));

        if (helpers.engage) {
          helpers.engage({
            interaction_type: 'game',
            depth_score: linesCleared > 0 ? 3 : 2
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
