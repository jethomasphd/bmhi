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

    // Store locally — no server, no database, fully client-side
    try {
      var events = JSON.parse(sessionStorage.getItem('bmhi_events') || '[]');
      events.push(payload);
      sessionStorage.setItem('bmhi_events', JSON.stringify(events));
    } catch (e) { /* ok */ }
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

    // Late-night override for Visit 1: A3 instead of A1
    if (visitNumber === 1 && isLateNight() && available.indexOf('A3') !== -1) {
      return 'A3';
    }

    // Long Arc Protocol for visits 1-7
    if (visitNumber >= 1 && visitNumber <= LONG_ARC.length) {
      var target = LONG_ARC[visitNumber - 1];
      if (target && available.indexOf(target) !== -1) {
        return target;
      }
      // Visit 4 (null in LONG_ARC) → F1 pre-layer handled by launchWithPreLayer
      // Fall through to engagement-based selection for the actual intervention
      if (target === null) {
        // For visit 4, pick from a curated set after F1
        var v4pool = ['A2', 'B3', 'C2', 'E1', 'F2'];
        var v4available = v4pool.filter(function (id) {
          return available.indexOf(id) !== -1;
        });
        if (v4available.length > 0) return selectByEngagement(v4available);
      }
    }

    // Visit 8+: engagement-based rotation with tier awareness
    // Late-night weighting: prefer somatic (A-tier) after 10pm
    if (isLateNight()) {
      var somatic = available.filter(function (id) { return id.charAt(0) === 'A'; });
      if (somatic.length > 0 && Math.random() < 0.5) {
        return selectByEngagement(somatic);
      }
    }

    return selectByEngagement(available);
  }

  function selectByEngagement(available) {
    var history = getEngagementHistory();
    var lastId = history.length > 0 ? history[history.length - 1].intervention : null;
    var lastTier = lastId ? lastId.charAt(0) : null;

    // Filter out interventions with unmet requirements
    var visitNumber = state.session ? state.session.visitNumber : 1;
    var eligible = available.filter(function (id) {
      var intervention = window.BMHI_INTERVENTIONS[id];
      if (intervention && intervention.minVisits && visitNumber < intervention.minVisits) {
        return false;
      }
      // Skip pre-layer interventions from normal rotation
      if (intervention && intervention.isPreLayer) return false;
      return true;
    });
    if (eligible.length === 0) eligible = available;

    // Filter out the last intervention (no back-to-back repeats)
    var candidates = eligible.filter(function (id) { return id !== lastId; });
    if (candidates.length === 0) candidates = eligible;

    // Prefer different tier than last (no back-to-back same tier)
    if (lastTier && candidates.length > 1) {
      var diffTier = candidates.filter(function (id) { return id.charAt(0) !== lastTier; });
      if (diffTier.length > 0) candidates = diffTier;
    }

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

  // Check if visit 4 should show F1 pre-layer
  function shouldShowPreLayer(visitNumber) {
    return visitNumber >= 4 && visitNumber % 4 === 0 &&
      window.BMHI_INTERVENTIONS['F1'] &&
      getAvailableInterventions().indexOf('F1') !== -1;
  }

  // ═══════════════════════════════════════════════════════════
  // SUITE NAVIGATOR (demo mode)
  // ═══════════════════════════════════════════════════════════

  var TIER_NAMES = {
    A: 'Somatic', B: 'Cognitive', C: 'Behavioral',
    D: 'Emotional', E: 'Flow', F: 'Screening'
  };

  function buildSuiteNav() {
    var container = $('suiteTiers');
    container.innerHTML = '';
    var available = getAvailableInterventions();
    available.sort();

    // Group by tier
    var tiers = {};
    for (var i = 0; i < available.length; i++) {
      var id = available[i];
      var tier = id.charAt(0);
      if (!tiers[tier]) tiers[tier] = [];
      tiers[tier].push(id);
    }

    var tierOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (var t = 0; t < tierOrder.length; t++) {
      var tierKey = tierOrder[t];
      if (!tiers[tierKey]) continue;

      var group = document.createElement('div');
      group.className = 'suite-tier-group';

      var label = document.createElement('div');
      label.className = 'suite-tier-label';
      label.textContent = TIER_NAMES[tierKey] || tierKey;
      group.appendChild(label);

      var tabRow = document.createElement('div');
      tabRow.className = 'suite-tier-tabs';

      for (var j = 0; j < tiers[tierKey].length; j++) {
        (function (interventionId) {
          var intervention = window.BMHI_INTERVENTIONS[interventionId];
          var btn = document.createElement('button');
          btn.className = 'suite-tab';
          btn.setAttribute('data-tier', tierKey.toLowerCase());
          btn.setAttribute('data-id', interventionId);
          btn.textContent = interventionId;
          btn.setAttribute('aria-label', intervention.name);

          // Tooltip
          var tip = document.createElement('div');
          tip.className = 'tab-tip';
          tip.innerHTML = '<strong>' + interventionId + ' \u00B7 ' + intervention.name + '</strong><br>' +
            intervention.mechanism + '<br>' +
            intervention.evidence + ' \u00B7 ' + intervention.time;
          btn.appendChild(tip);

          btn.addEventListener('click', function () {
            launchIntervention(interventionId);
            updateActiveTab(interventionId);
          });
          tabRow.appendChild(btn);
        })(tiers[tierKey][j]);
      }

      group.appendChild(tabRow);
      container.appendChild(group);
    }
  }

  function updateActiveTab(interventionId) {
    var all = document.querySelectorAll('.suite-tab');
    for (var k = 0; k < all.length; k++) {
      all[k].classList.toggle('active', all[k].getAttribute('data-id') === interventionId);
    }
    // Update info bar
    var info = $('suiteInfo');
    if (info) {
      var intervention = window.BMHI_INTERVENTIONS[interventionId];
      info.textContent = intervention
        ? interventionId + ' \u00B7 ' + intervention.name
        : '';
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

    // Record completion (before any branching)
    if (state.activeIntervention) {
      emitEvent('MHIL_CLOSE', {
        intervention_id: state.activeIntervention,
        completion_status: 'complete'
      });
    }

    // Always show suite nav (suite is the home now)
    showSuiteNav();
  }

  function resetToLanding() {
    // Return to suite view (no landing page — suite IS the home)
    showSuiteNav();
    var available = getAvailableInterventions();
    if (available.length > 0) {
      launchIntervention(available[0]);
      updateActiveTab(available[0]);
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
    var completed = false;

    // Provide the intervention with helpers
    intervention.render(container, {
      // Called when the intervention completes naturally
      complete: function (closingMessage, depthScore, textChars) {
        // Guard: only fire once, and never after cleanup/dismiss
        if (completed || state.activeIntervention !== interventionId) return;
        completed = true;
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
        if (state.activeIntervention !== interventionId) return;
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

  // Launch F1 pre-layer, then the actual intervention after it completes
  function launchInterventionWithPreLayer(preId, mainId) {
    var preIntervention = window.BMHI_INTERVENTIONS[preId];
    if (!preIntervention) {
      launchIntervention(mainId);
      return;
    }

    // Clean up previous
    if (state.activeIntervention) {
      var prev = window.BMHI_INTERVENTIONS[state.activeIntervention];
      if (prev && prev.cleanup) prev.cleanup();
    }

    state.activeIntervention = preId;
    var container = $('interventionContent');
    container.innerHTML = '';

    log('Pre-layer:', preId, '→ then:', mainId);

    emitEvent('MHIL_START', {
      intervention_id: preId,
      mechanism_tier: preIntervention.tier,
      is_pre_layer: true
    });

    var preCompleted = false;

    preIntervention.render(container, {
      complete: function (closingMessage, depthScore, textChars) {
        if (preCompleted || state.activeIntervention !== preId) return;
        preCompleted = true;
        recordEngagement(preId, depthScore || 2, textChars || 0, 15);
        // Now launch the actual intervention
        launchIntervention(mainId);
      },
      engage: function (data) {
        if (state.activeIntervention !== preId) return;
        emitEvent('MHIL_ENGAGE', Object.assign({
          intervention_id: preId
        }, data));
      }
    });

    showIntervention();
  }

  // ═══════════════════════════════════════════════════════════
  // LANDING — cinematic slow reveal
  // ═══════════════════════════════════════════════════════════

  var landingTimers = [];

  function revealLanding() {
    // Clear any previous landing timers
    for (var j = 0; j < landingTimers.length; j++) clearTimeout(landingTimers[j]);
    landingTimers = [];

    var timings = [
      { el: 'enso', cls: 'draw', delay: 800 },
      { el: 'rv1', cls: 'vis', delay: 3000 },
      { el: 'rv2', cls: 'vis', delay: 5000 },
      { el: 'rv3', cls: 'vis', delay: 6500 },
      { el: 'rv4', cls: 'vis', delay: 8500 },
      { el: 'rv5', cls: 'vis', delay: 10000 },
      { el: 'beginBtn', cls: 'vis', delay: 12000 },
      { el: 'demoLink', cls: 'vis', delay: 13000 },
      { el: 'aboutLink', cls: 'vis', delay: 13500 }
    ];

    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (var i = 0; i < timings.length; i++) {
      (function (t) {
        var delay = reducedMotion ? 0 : t.delay;
        landingTimers.push(setTimeout(function () {
          // Only apply if we're still on the landing stage
          if (state.stage !== 'landing') return;
          var el = $(t.el);
          if (el) el.classList.add(t.cls);
        }, delay));
      })(timings[i]);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DISMISS — always available (§4.3)
  // ═══════════════════════════════════════════════════════════

  function handleDismiss() {
    // Clean up active intervention — clear ID first to prevent
    // any in-flight callbacks from re-triggering showPost
    var prevId = state.activeIntervention;
    state.activeIntervention = null;

    if (prevId) {
      var intervention = window.BMHI_INTERVENTIONS[prevId];
      if (intervention && intervention.cleanup) intervention.cleanup();

      emitEvent('MHIL_CLOSE', {
        intervention_id: prevId,
        completion_status: state.stage === 'post' ? 'complete' : 'dismissed'
      });
    }

    // Stop ambient audio if playing
    if (audioPlaying) stopAudio();

    // Return to suite view
    resetToLanding();
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
    $('dismissBtn').addEventListener('click', handleDismiss);
    $('audioToggle').addEventListener('click', toggleAudio);

    // Boot directly into the full suite (no landing page)
    $('stageLanding').classList.remove('active');
    showSuiteNav();
    var available = getAvailableInterventions();
    if (available.length > 0) {
      launchIntervention(available[0]);
      var firstTab = $('suiteTiers').querySelector('.suite-tab');
      if (firstTab) firstTab.classList.add('active');
    }
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
