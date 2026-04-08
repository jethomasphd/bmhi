// ═══════════════════════════════════════════════════════════════
// A3 — Two-Minute Reset
// Mechanism: Parasympathetic + positive effort reattribution
// Evidence:  T2
// Time:      2 minutes
//
// Visible countdown. Optional ambient sound. At 0:00:
// "You spent time looking. That is not nothing."
//
// Late-night priority: router prefers A3 after 10pm.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var DURATION = 120; // seconds
  var CLOSING_TEXT = 'You spent time looking. That is not nothing.';

  var timers = [];
  var interval = null;
  var running = false;
  var audioCtx = null;
  var audioNodes = null;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (interval) { clearInterval(interval); interval = null; }
    stopSound();
    running = false;
  }

  // ─── Audio synthesis (Web Audio API, no external files) ──

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function makeWhiteNoise() {
    var ctx = getAudioCtx();
    var bufferSize = ctx.sampleRate * 2;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Gentle lowpass to soften it
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    var gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    // Fade in
    gain.gain.setTargetAtTime(0.06, ctx.currentTime, 0.8);

    return { source: source, gain: gain, filter: filter };
  }

  function makeRain() {
    var ctx = getAudioCtx();

    // Master gain
    var master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Layer 1: soft broadband base (distant steady rain)
    var buf1 = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf1.getChannelData(ch);
      for (var i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * 0.5;
      }
    }
    var src1 = ctx.createBufferSource();
    src1.buffer = buf1; src1.loop = true;

    var lp1 = ctx.createBiquadFilter();
    lp1.type = 'lowpass'; lp1.frequency.value = 800; lp1.Q.value = 0.5;

    var g1 = ctx.createGain(); g1.gain.value = 0.6;
    src1.connect(lp1); lp1.connect(g1); g1.connect(master);
    src1.start();

    // Layer 2: gentle high shimmer (close rain on a surface)
    var buf2 = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
    for (var ch2 = 0; ch2 < 2; ch2++) {
      var d2 = buf2.getChannelData(ch2);
      for (var j = 0; j < d2.length; j++) {
        // Gentle amplitude variation for texture
        var env = 0.3 + 0.7 * Math.pow(Math.random(), 3);
        d2[j] = (Math.random() * 2 - 1) * env * 0.3;
      }
    }
    var src2 = ctx.createBufferSource();
    src2.buffer = buf2; src2.loop = true;

    var bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.frequency.value = 3000; bp2.Q.value = 0.3;

    var g2 = ctx.createGain(); g2.gain.value = 0.25;
    src2.connect(bp2); bp2.connect(g2); g2.connect(master);
    src2.start();

    // Layer 3: very low rumble (distant thunder ambience)
    var buf3 = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    var d3 = buf3.getChannelData(0);
    for (var k = 0; k < d3.length; k++) {
      d3[k] = (Math.random() * 2 - 1);
    }
    var src3 = ctx.createBufferSource();
    src3.buffer = buf3; src3.loop = true;

    var lp3 = ctx.createBiquadFilter();
    lp3.type = 'lowpass'; lp3.frequency.value = 200; lp3.Q.value = 0.7;

    var g3 = ctx.createGain(); g3.gain.value = 0.15;
    src3.connect(lp3); lp3.connect(g3); g3.connect(master);
    src3.start();

    // Slow fade in
    master.gain.setTargetAtTime(0.07, ctx.currentTime, 1.2);

    return {
      source: src1, // for stopSound compatibility
      gain: master,
      _extras: [src2, src3] // extra sources to stop
    };
  }

  function stopSound() {
    if (audioNodes && audioNodes.gain) {
      var ctx = getAudioCtx();
      audioNodes.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      var src = audioNodes.source;
      var extras = audioNodes._extras || [];
      setTimeout(function () {
        try { src.stop(); } catch (e) { /* ok */ }
        for (var i = 0; i < extras.length; i++) {
          try { extras[i].stop(); } catch (e2) { /* ok */ }
        }
      }, 3000);
    }
    audioNodes = null;
  }

  // ─── Format time ────────────────────────────────────────

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ─── Registration ───────────────────────────────────────

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['A3'] = {
    id: 'A3',
    name: 'Quiet Reset',
    tier: 'A',
    mechanism: 'Parasympathetic + positive effort reattribution',
    evidence: 'T2',
    time: '2min',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      // Timer display
      var timerEl = document.createElement('div');
      timerEl.className = 'reset-timer';
      timerEl.textContent = formatTime(DURATION);
      container.appendChild(timerEl);

      // Sound buttons
      var btnWrap = document.createElement('div');
      btnWrap.className = 'sound-btns';

      var activeSound = null;
      var sounds = ['rain', 'white noise', 'silence'];

      function makeSoundBtn(name) {
        var btn = document.createElement('button');
        btn.className = 'sound-btn' + (name === 'silence' ? ' active' : '');
        btn.textContent = name;
        btn.addEventListener('click', function () {
          // Clear active
          var all = btnWrap.querySelectorAll('.sound-btn');
          for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
          btn.classList.add('active');

          stopSound();
          activeSound = name;

          if (name === 'rain') {
            audioNodes = makeRain();
          } else if (name === 'white noise') {
            audioNodes = makeWhiteNoise();
          }
          // silence: just stopped above
        });
        return btn;
      }

      for (var i = 0; i < sounds.length; i++) {
        btnWrap.appendChild(makeSoundBtn(sounds[i]));
      }
      container.appendChild(btnWrap);

      // Closing text (hidden until timer ends)
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Countdown
      var remaining = DURATION;
      var startTime = Date.now();

      interval = setInterval(function () {
        if (!running) return;
        remaining--;
        timerEl.textContent = formatTime(Math.max(0, remaining));

        if (remaining <= 0) {
          clearInterval(interval);
          interval = null;

          // Fade timer
          timerEl.style.transition = 'opacity 1.5s ease';
          timerEl.style.opacity = '0.3';

          // Hide sound buttons
          btnWrap.style.transition = 'opacity 1s ease';
          btnWrap.style.opacity = '0';

          // Stop sound gently
          stopSound();

          // Show closing
          timers.push(setTimeout(function () {
            closing.classList.add('vis');
          }, 1500));

          // Complete
          timers.push(setTimeout(function () {
            if (!running) return;
            helpers.complete(CLOSING_TEXT, 3, 0);
          }, 6000));
        }
      }, 1000);

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'breathe', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
