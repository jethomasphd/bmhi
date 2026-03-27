// ═══════════════════════════════════════════════════════════════
// BMHI — Brief Mental Health Intervention Suite
// Core Engine: session, measurement, router, landing, state machine
//
// "The person on the other side of the screen searched for a job
//  and found nothing. They are not a bounce event."
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Constants ──────────────────────────────────────────────
  var COOKIE_NAME = 'bmhi_session';
  var COOKIE_DAYS = 90;
  var STORAGE_KEY = 'bmhi_engagement';
  var WORKER_URL = window.__BMHI_WORKER__ || '';

  // Long Arc Protocol: visit → intervention (null = use engagement score)
  var LONG_ARC = ['A1', 'B1', 'C1', null, 'D1', 'B2', 'D2'];

  // ─── State ─────────────────────────────────────────────────
  var state = {
    stage: 'landing',      // landing | intervention | post
    demoMode: false,
    activeIntervention: null,
    session: null
  };

  // ─── DOM helpers ───────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function log() {
    var a = ['[bmhi]'];
    for (var i = 0; i < arguments.length; i++) a.push(arguments[i]);
    console.log.apply(console, a);
  }

  // ═══════════════════════════════════════════════════════════
  // SESSION MANAGEMENT — cookie-based, 90-day, no PII (§2.3)
  // ═══════════════════════════════════════════════════════════

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function generateSessionId() {
    var a = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < 12; i++) id += a[Math.floor(Math.random() * a.length)];
    return id;
  }

  function getSession() {
    var raw = getCookie(COOKIE_NAME);
    var session;
    if (raw) {
      try { session = JSON.parse(raw); } catch (e) { session = null; }
    }
    if (!session || !session.id) {
      session = {
        id: generateSessionId(),
        visitNumber: 0,
        lastVisit: null,
        created: new Date().toISOString()
      };
    }
    return session;
  }

  function saveSession(session) {
    setCookie(COOKIE_NAME, JSON.stringify(session), COOKIE_DAYS);
  }

  function getEngagementHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveEngagementHistory(history) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }
    catch (e) { /* localStorage not available */ }
  }

  function recordEngagement(interventionId, depthScore, textChars, timeSeconds) {
    var history = getEngagementHistory();
    history.push({
      date: new Date().toISOString().split('T')[0],
      intervention: interventionId,
      score: depthScore + (textChars > 0 ? 3 : 0),
      completed: depthScore >= 2
    });
    // Keep last 50 entries
    if (history.length > 50) history = history.slice(-50);
    saveEngagementHistory(history);
  }

  function incrementVisit() {
    var session = state.session;
    var today = new Date().toISOString().split('T')[0];
    if (session.lastVisit !== today) {
      session.visitNumber++;
      session.lastVisit = today;
      saveSession(session);
    }
    return session.visitNumber;
  }

  // ═══════════════════════════════════════════════════════════
  // MEASUREMENT FRAMEWORK — event emission per §7
  // ═══════════════════════════════════════════════════════════

  function emitEvent(eventType, data) {
    var payload = {
      event: eventType,
      data: Object.assign({
        session_id: state.session ? state.session.id : 'unknown',
        visit_number: state.session ? state.session.visitNumber : 0,
        time_of_day: getTimeOfDay(),
        timestamp: new Date().toISOString()
      }, data || {}),
    };

    log(eventType, payload.data);

    // Store locally
    try {
      var events = JSON.parse(sessionStorage.getItem('bmhi_events') || '[]');
      events.push(payload);
      sessionStorage.setItem('bmhi_events', JSON.stringify(events));
    } catch (e) { /* ok */ }

    // POST to worker (fire-and-forget — never block the intervention)
    if (WORKER_URL) {
      try {
        fetch(WORKER_URL + '/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function () {});
      } catch (e) { /* ok */ }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TIME-OF-DAY AWARENESS
  // ═══════════════════════════════════════════════════════════

  function getTimeOfDay() {
    var h = new Date().getHours();
    if (h >= 22 || h < 5) return 'late-night';
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  }

  function isLateNight() {
    return getTimeOfDay() === 'late-night';
  }

  // ═══════════════════════════════════════════════════════════
  // INTERVENTION REGISTRY & ROUTER
  // ═══════════════════════════════════════════════════════════

  // Interventions register themselves on window.BMHI_INTERVENTIONS
  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  function getAvailableInterventions() {
    var ids = [];
    for (var id in window.BMHI_INTERVENTIONS) {
      if (window.BMHI_INTERVENTIONS.hasOwnProperty(id)) ids.push(id);
    }
    return ids;
  }

  function selectIntervention(visitNumber) {
    var available = getAvailableInterventions();
    if (available.length === 0) return null;

    // Late-night override: prefer A3 if available
    if (isLateNight() && available.indexOf('A3') !== -1) {
      return 'A3';
    }

    // Long Arc Protocol for visits 1-7
    if (visitNumber >= 1 && visitNumber <= LONG_ARC.length) {
      var target = LONG_ARC[visitNumber - 1];
      if (target && available.indexOf(target) !== -1) {
        return target;
      }
      // Fallback: visit 4 (null) or unavailable → pick first available
    }

    // Visit 8+ or fallback: engagement-based rotation
    return selectByEngagement(available);
  }

  function selectByEngagement(available) {
    var history = getEngagementHistory();
    var lastId = history.length > 0 ? history[history.length - 1].intervention : null;

    // Filter out interventions with unmet requirements
    var visitNumber = state.session ? state.session.visitNumber : 1;
    var eligible = available.filter(function (id) {
      var intervention = window.BMHI_INTERVENTIONS[id];
      if (intervention && intervention.minVisits && visitNumber < intervention.minVisits) {
        return false;
      }
      return true;
    });
    if (eligible.length === 0) eligible = available;

    // Filter out the last intervention (no back-to-back repeats)
    var candidates = eligible.filter(function (id) { return id !== lastId; });
    if (candidates.length === 0) candidates = eligible;

    // Count engagement per intervention
    var counts = {};
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      counts[h.intervention] = (counts[h.intervention] || 0) + h.score;
    }

    // Prefer interventions with lower engagement (expose variety)
    candidates.sort(function (a, b) {
      return (counts[a] || 0) - (counts[b] || 0);
    });

    return candidates[0];
  }

  // ═══════════════════════════════════════════════════════════
  // SUITE NAVIGATOR (demo mode)
  // ═══════════════════════════════════════════════════════════

  function buildSuiteNav() {
    var tabs = $('suiteTabs');
    tabs.innerHTML = '';
    var available = getAvailableInterventions();
    available.sort();

    for (var i = 0; i < available.length; i++) {
      (function (id) {
        var intervention = window.BMHI_INTERVENTIONS[id];
        var btn = document.createElement('button');
        btn.className = 'suite-tab';
        btn.setAttribute('data-tier', intervention.tier.toLowerCase());
        btn.setAttribute('data-id', id);
        btn.textContent = id;
        btn.title = intervention.name + ' · ' + intervention.evidence + ' · ' + intervention.time;
        btn.addEventListener('click', function () {
          launchIntervention(id);
          // Update active tab
          var all = tabs.querySelectorAll('.suite-tab');
          for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
          btn.classList.add('active');
        });
        tabs.appendChild(btn);
      })(available[i]);
    }
  }

  function showSuiteNav() {
    state.demoMode = true;
    document.body.classList.add('demo-mode');
    buildSuiteNav();
    $('suiteNav').classList.add('vis');
    $('dismissBtn').classList.add('vis');
  }

  function hideSuiteNav() {
    $('suiteNav').classList.remove('vis');
  }

  // ═══════════════════════════════════════════════════════════
  // STAGE TRANSITIONS
  // ═══════════════════════════════════════════════════════════

  function transitionTo(stageId) {
    // Fade out current
    var stages = document.querySelectorAll('.stage');
    for (var i = 0; i < stages.length; i++) {
      stages[i].classList.remove('active');
    }
    // Fade in target after brief pause
    setTimeout(function () {
      $(stageId).classList.add('active');
    }, 200);
  }

  function showLanding() {
    state.stage = 'landing';
    transitionTo('stageLanding');
    $('dismissBtn').classList.remove('vis');
    $('audioToggle').classList.remove('vis');
  }

  function showIntervention() {
    state.stage = 'intervention';
    transitionTo('stageIntervention');
    $('dismissBtn').classList.add('vis');
    $('audioToggle').classList.add('vis');
  }

  function showPost(closingMessage) {
    state.stage = 'post';
    var container = $('postContent');
    container.innerHTML = '';

    var msg = document.createElement('div');
    msg.className = 'closing-text';
    msg.textContent = closingMessage || '';
    container.appendChild(msg);

    // Post-intervention CTA (after delay)
    var post = document.createElement('div');
    post.className = 'post-intervention';
    post.innerHTML =
      '<p class="post-cta">Want to explore more?</p>' +
      (state.demoMode
        ? '<button class="post-link" id="postTryAnother">Try another intervention</button>'
        : '');
    container.appendChild(post);

    transitionTo('stagePost');

    setTimeout(function () { msg.classList.add('vis'); }, 400);
    setTimeout(function () { post.classList.add('vis'); }, 3000);

    // Wire up "try another"
    setTimeout(function () {
      var btn = $('postTryAnother');
      if (btn) {
        btn.addEventListener('click', function () {
          showSuiteNav();
          // Pick next intervention that's different from current
          var available = getAvailableInterventions();
          var next = selectByEngagement(available);
          if (next) {
            launchIntervention(next);
            // Highlight the tab
            var tabs = $('suiteTabs').querySelectorAll('.suite-tab');
            for (var k = 0; k < tabs.length; k++) {
              tabs[k].classList.toggle('active', tabs[k].getAttribute('data-id') === next);
            }
          }
        });
      }
    }, 100);

    // Record completion
    if (state.activeIntervention) {
      emitEvent('MHIL_CLOSE', {
        intervention_id: state.activeIntervention,
        completion_status: 'complete'
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INTERVENTION LIFECYCLE
  // ═══════════════════════════════════════════════════════════

  function launchIntervention(interventionId) {
    var intervention = window.BMHI_INTERVENTIONS[interventionId];
    if (!intervention) {
      log('Intervention not found:', interventionId);
      return;
    }

    // Clean up previous
    if (state.activeIntervention) {
      var prev = window.BMHI_INTERVENTIONS[state.activeIntervention];
      if (prev && prev.cleanup) prev.cleanup();
    }

    state.activeIntervention = interventionId;
    var container = $('interventionContent');
    container.innerHTML = '';

    log('Launching:', interventionId, intervention.name);

    emitEvent('MHIL_START', {
      intervention_id: interventionId,
      mechanism_tier: intervention.tier
    });

    var startTime = Date.now();

    // Provide the intervention with helpers
    intervention.render(container, {
      // Called when the intervention completes naturally
      complete: function (closingMessage, depthScore, textChars) {
        var elapsed = (Date.now() - startTime) / 1000;
        recordEngagement(interventionId, depthScore || 2, textChars || 0, elapsed);
        emitEvent('MHIL_ENGAGE', {
          intervention_id: interventionId,
          interaction_type: intervention.tier === 'A' ? 'breathe' :
            intervention.tier === 'E' ? 'game' :
              textChars > 0 ? 'type' : 'tap',
          depth_score: depthScore || 2,
          text_input_chars: textChars || 0,
          time_in_seconds: Math.round(elapsed)
        });
        showPost(closingMessage);
      },
      // For logging engagement mid-intervention
      engage: function (data) {
        emitEvent('MHIL_ENGAGE', Object.assign({
          intervention_id: interventionId
        }, data));
      }
    });

    showIntervention();
  }

  // ═══════════════════════════════════════════════════════════
  // LANDING — cinematic slow reveal
  // ═══════════════════════════════════════════════════════════

  function revealLanding() {
    var timings = [
      { el: 'enso', cls: 'draw', delay: 800 },
      { el: 'rv1', cls: 'vis', delay: 3000 },
      { el: 'rv2', cls: 'vis', delay: 5000 },
      { el: 'rv3', cls: 'vis', delay: 6500 },
      { el: 'rv4', cls: 'vis', delay: 8500 },
      { el: 'rv5', cls: 'vis', delay: 10000 },
      { el: 'beginBtn', cls: 'vis', delay: 12000 },
      { el: 'demoLink', cls: 'vis', delay: 13000 }
    ];

    // Check for reduced motion preference
    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (var i = 0; i < timings.length; i++) {
      (function (t) {
        var delay = reducedMotion ? 0 : t.delay;
        setTimeout(function () {
          var el = $(t.el);
          if (el) el.classList.add(t.cls);
        }, delay);
      })(timings[i]);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DISMISS — always available (§4.3)
  // ═══════════════════════════════════════════════════════════

  function handleDismiss() {
    // Clean up active intervention
    if (state.activeIntervention) {
      var intervention = window.BMHI_INTERVENTIONS[state.activeIntervention];
      if (intervention && intervention.cleanup) intervention.cleanup();

      emitEvent('MHIL_CLOSE', {
        intervention_id: state.activeIntervention,
        completion_status: state.stage === 'post' ? 'complete' : 'dismissed'
      });
    }

    if (state.demoMode) {
      // In demo mode, return to landing
      state.activeIntervention = null;
      hideSuiteNav();
      state.demoMode = false;
      document.body.classList.remove('demo-mode');
      // Reset landing elements so reveal can re-animate
      var rvEls = ['enso', 'rv1', 'rv2', 'rv3', 'rv4', 'rv5', 'beginBtn', 'demoLink'];
      for (var r = 0; r < rvEls.length; r++) {
        var el = $(rvEls[r]);
        if (el) { el.classList.remove('vis', 'draw'); }
      }
      showLanding();
      setTimeout(revealLanding, 300);
    } else {
      // In normal mode, close the whole thing
      document.body.style.transition = 'opacity 0.8s ease';
      document.body.style.opacity = '0';
      // In production, this would close the popup/window
      log('Dismissed — in production, this closes the intervention window');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // AUDIO — optional ambient, never autoplay (§4.8)
  // ═══════════════════════════════════════════════════════════

  var audioCtx = null;
  var audioPlaying = false;
  var audioNodes = {};

  function toggleAudio() {
    if (audioPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }

  function startAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Warm sine drone ~120Hz with gentle modulation
    var osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 120;

    var gain = audioCtx.createGain();
    gain.gain.value = 0;

    // Gentle amplitude modulation
    var lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    var lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    // Fade in over 2s
    gain.gain.setTargetAtTime(0.04, audioCtx.currentTime, 0.6);

    audioNodes = { osc: osc, gain: gain, lfo: lfo, lfoGain: lfoGain };
    audioPlaying = true;
    $('audioToggle').classList.add('on');
  }

  function stopAudio() {
    if (audioNodes.gain) {
      audioNodes.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
      var osc = audioNodes.osc;
      var lfo = audioNodes.lfo;
      setTimeout(function () {
        try { osc.stop(); } catch (e) { /* ok */ }
        try { lfo.stop(); } catch (e) { /* ok */ }
      }, 2000);
    }
    audioNodes = {};
    audioPlaying = false;
    $('audioToggle').classList.remove('on');
  }

  // ═══════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════

  function init() {
    log('init');

    // Session
    state.session = getSession();
    var visitNumber = incrementVisit();
    log('Visit #' + visitNumber, 'Session:', state.session.id);

    // Check for returning user
    var history = getEngagementHistory();
    if (history.length > 0) {
      var lastEntry = history[history.length - 1];
      var daysSince = Math.floor(
        (Date.now() - new Date(lastEntry.date).getTime()) / 86400000
      );
      emitEvent('MHIL_RETURN', {
        days_since_last_visit: daysSince,
        intervention_last_session: lastEntry.intervention
      });
    }

    // Emit trigger event
    emitEvent('MHIL_TRIGGER', {
      domain: window.location.hostname,
      trigger_type: 'standalone',
      session_duration: 0,
      pages_viewed: 0
    });

    // Wire up buttons
    $('beginBtn').addEventListener('click', function () {
      var id = selectIntervention(visitNumber);
      if (id) {
        // Fade out landing
        $('stageLanding').style.transition = 'opacity 0.8s ease';
        $('stageLanding').style.opacity = '0';
        setTimeout(function () {
          $('stageLanding').classList.remove('active');
          $('stageLanding').style.opacity = '';
          $('stageLanding').style.transition = '';
          launchIntervention(id);
        }, 800);
      }
    });

    $('demoLink').addEventListener('click', function () {
      // Fade out landing, show suite navigator
      $('stageLanding').style.transition = 'opacity 0.6s ease';
      $('stageLanding').style.opacity = '0';
      setTimeout(function () {
        $('stageLanding').classList.remove('active');
        $('stageLanding').style.opacity = '';
        $('stageLanding').style.transition = '';
        showSuiteNav();
        // Launch first available intervention
        var available = getAvailableInterventions();
        if (available.length > 0) {
          launchIntervention(available[0]);
          // Mark first tab active
          var firstTab = $('suiteTabs').querySelector('.suite-tab');
          if (firstTab) firstTab.classList.add('active');
        }
      }, 600);
    });

    $('dismissBtn').addEventListener('click', handleDismiss);
    $('audioToggle').addEventListener('click', toggleAudio);

    // Embedded mode: shorter landing
    if (window.location.search.indexOf('mode=embedded') !== -1) {
      // Skip to intervention immediately
      setTimeout(function () {
        var id = selectIntervention(visitNumber);
        if (id) {
          $('stageLanding').classList.remove('active');
          launchIntervention(id);
        }
      }, 500);
      return;
    }

    // Start cinematic reveal
    revealLanding();
  }

  // ─── Expose for interventions to use ───────────────────────
  window.BMHI = {
    emitEvent: emitEvent,
    getSession: function () { return state.session; },
    getTimeOfDay: getTimeOfDay,
    isLateNight: isLateNight,
    getEngagementHistory: getEngagementHistory,
    showPost: showPost,
    log: log
  };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
