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
    var bufferSize = ctx.sampleRate * 4;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);

    // Shape noise to sound like rain: random amplitude bursts
    for (var i = 0; i < bufferSize; i++) {
      var t = i / ctx.sampleRate;
      // Envelope: random bursts every ~50ms
      var burst = Math.sin(t * 127.3) * Math.sin(t * 43.7);
      var envelope = Math.max(0, burst) * 0.7 + 0.3;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass to sound like rain drops
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 0.4;

    // Second filter for body
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3500;

    var gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(bp);
    bp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    // Fade in
    gain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.8);

    return { source: source, gain: gain };
  }

  function stopSound() {
    if (audioNodes && audioNodes.gain) {
      var ctx = getAudioCtx();
      audioNodes.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      var src = audioNodes.source;
      setTimeout(function () {
        try { src.stop(); } catch (e) { /* ok */ }
      }, 2000);
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
    name: 'Two-Minute Reset',
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
