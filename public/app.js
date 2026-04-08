// ═══════════════════════════════════════════════════════════════
// BMHI — Brief Mental Health Intervention Suite
// Core Engine: session, measurement, router, state machine
//
// "The person on the other side of the screen searched for a job
//  and found nothing. They are not a bounce event."
//
// Product design: Steve Jobs, summoned April 2026
// "You don't give them a menu. You give them a moment."
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Constants ──────────────────────────────────────────────
  var COOKIE_NAME = 'bmhi_session';
  var COOKIE_DAYS = 90;
  var STORAGE_KEY = 'bmhi_engagement';

  // Long Arc Protocol: visit → intervention (null = use engagement score)
  var LONG_ARC = ['A1', 'B1', 'C1', null, 'D1', 'B2', 'D2'];

  // Button text per tier (what the welcome button says)
  var TIER_CTA = {
    A: 'Take a breath',
    B: 'See it differently',
    C: 'Try something small',
    D: 'Let something go',
    E: 'Play for a moment',
    F: 'Check in with yourself'
  };

  // Felt-experience tier labels (Jobs: "invitations, not categories")
  var TIER_LABELS = {
    A: 'Calm my body',
    B: 'Quiet my mind',
    C: 'Do something small',
    D: 'Feel what I feel',
    E: 'Get out of my head',
    F: 'Get help'
  };

  // SVG icon markup for Play tier games (consistent stroke-based, 16×16)
  var GAME_ICONS = {
    E1: '<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>', // match: 4 cards
    E2: '<line x1="4" y1="12" x2="7" y2="4"/><line x1="7" y1="4" x2="12" y2="8"/><circle cx="12" cy="8" r="1.5"/>', // draw: brush stroke
    E3: '<rect x="2" y="6" width="4" height="4" rx="0.5"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><rect x="10" y="6" width="4" height="4" rx="0.5"/><rect x="4" y="2" width="4" height="4" rx="0.5"/>', // blocks: L-piece
    E4: '<circle cx="4" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/><circle cx="10" cy="8" r="2"/><circle cx="14" cy="5" r="1"/>', // serpent: body + food
    E5: '<rect x="2" y="2" width="3" height="2" rx="0.5"/><rect x="6" y="2" width="3" height="2" rx="0.5"/><rect x="10" y="2" width="3" height="2" rx="0.5"/><circle cx="8" cy="9" r="1.5"/><rect x="4" y="13" width="8" height="2" rx="1"/>', // breaker: bricks + ball + paddle
    E6: '<line x1="8" y1="14" x2="8" y2="7"/><circle cx="8" cy="5" r="2.5"/><line x1="5" y1="10" x2="8" y2="7"/><line x1="11" y1="10" x2="8" y2="7"/>' // garden: flower with stem + leaves
  };

  // ─── State ─────────────────────────────────────────────────
  var state = {
    stage: 'init',         // init | welcome | intervention | post | suite
    activeIntervention: null,
    session: null,
    firstVisitCompleted: false, // tracks if user completed first intervention this session
    suiteRevealed: false        // tracks if navigator has been shown
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

  function isReturningUser() {
    return getEngagementHistory().length > 0;
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

    if (visitNumber === 1 && isLateNight() && available.indexOf('A3') !== -1) {
      return 'A3';
    }

    if (visitNumber >= 1 && visitNumber <= LONG_ARC.length) {
      var target = LONG_ARC[visitNumber - 1];
      if (target && available.indexOf(target) !== -1) {
        return target;
      }
      if (target === null) {
        var v4pool = ['A2', 'B3', 'C2', 'E1', 'F2'];
        var v4available = v4pool.filter(function (id) {
          return available.indexOf(id) !== -1;
        });
        if (v4available.length > 0) return selectByEngagement(v4available);
      }
    }

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

    var visitNumber = state.session ? state.session.visitNumber : 1;
    var eligible = available.filter(function (id) {
      var intervention = window.BMHI_INTERVENTIONS[id];
      if (intervention && intervention.minVisits && visitNumber < intervention.minVisits) return false;
      if (intervention && intervention.isPreLayer) return false;
      return true;
    });
    if (eligible.length === 0) eligible = available;

    var candidates = eligible.filter(function (id) { return id !== lastId; });
    if (candidates.length === 0) candidates = eligible;

    if (lastTier && candidates.length > 1) {
      var diffTier = candidates.filter(function (id) { return id.charAt(0) !== lastTier; });
      if (diffTier.length > 0) candidates = diffTier;
    }

    var counts = {};
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      counts[h.intervention] = (counts[h.intervention] || 0) + h.score;
    }

    candidates.sort(function (a, b) {
      return (counts[a] || 0) - (counts[b] || 0);
    });

    return candidates[0];
  }

  function shouldShowPreLayer(visitNumber) {
    return visitNumber >= 4 && visitNumber % 4 === 0 &&
      window.BMHI_INTERVENTIONS['F1'] &&
      getAvailableInterventions().indexOf('F1') !== -1;
  }

  // ═══════════════════════════════════════════════════════════
  // SUITE NAVIGATOR — felt-experience labels, game icons
  // ═══════════════════════════════════════════════════════════

  function buildSuiteNav() {
    var container = $('suiteTiers');
    container.innerHTML = '';
    var available = getAvailableInterventions();
    available.sort();

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
      label.textContent = TIER_LABELS[tierKey] || tierKey;
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
          btn.setAttribute('aria-label', intervention.name + ' \u2014 ' + intervention.mechanism);

          // Play tier: use icons instead of text
          if (tierKey === 'E' && GAME_ICONS[interventionId]) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' +
              GAME_ICONS[interventionId] + '</svg>';
            btn.setAttribute('title', intervention.name);
          } else {
            btn.textContent = intervention.name;
          }

          // Tooltip (mechanism on hover for experts)
          var tip = document.createElement('div');
          tip.className = 'tab-tip';
          tip.innerHTML = '<strong>' + intervention.name + '</strong><br>' +
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
    var infoText = $('suiteInfoText');
    if (infoText) {
      var intervention = window.BMHI_INTERVENTIONS[interventionId];
      if (intervention) {
        infoText.textContent = (TIER_LABELS[intervention.tier] || intervention.tier) +
          ' \u00B7 ' + intervention.name;
      }
    }
  }

  function showSuiteNav() {
    if (!state.suiteRevealed) {
      buildSuiteNav();
      state.suiteRevealed = true;
    }
    document.body.classList.add('demo-mode');
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
    var stages = document.querySelectorAll('.stage');
    for (var i = 0; i < stages.length; i++) {
      stages[i].classList.remove('active');
    }
    setTimeout(function () {
      $(stageId).classList.add('active');
    }, 200);
  }

  function showWelcome() {
    state.stage = 'welcome';
    transitionTo('stageWelcome');
  }

  function showIntervention() {
    state.stage = 'intervention';
    transitionTo('stageIntervention');
    $('dismissBtn').classList.add('vis');
    $('audioToggle').classList.add('vis');
  }

  function showPost(closingMessage) {
    state.stage = 'post';

    if (state.activeIntervention) {
      emitEvent('MHIL_CLOSE', {
        intervention_id: state.activeIntervention,
        completion_status: 'complete'
      });
    }

    // Reveal the suite navigator
    showSuiteNav();

    // First completion: show the "there's more" reveal
    if (!state.firstVisitCompleted) {
      state.firstVisitCompleted = true;
      var reveal = $('postReveal');
      if (reveal) {
        setTimeout(function () { reveal.classList.add('vis'); }, 800);
        // Auto-hide after 6 seconds
        setTimeout(function () { reveal.classList.remove('vis'); }, 7000);
      }
    }
  }

  function returnToSuite() {
    showSuiteNav();
    var id = selectIntervention(state.session.visitNumber);
    if (id) {
      launchIntervention(id);
      updateActiveTab(id);
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

    intervention.render(container, {
      complete: function (closingMessage, depthScore, textChars) {
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
  // PRE-LAYER (F1 check-in before main intervention)
  // ═══════════════════════════════════════════════════════════

  function launchInterventionWithPreLayer(preId, mainId) {
    var preIntervention = window.BMHI_INTERVENTIONS[preId];
    if (!preIntervention) {
      launchIntervention(mainId);
      return;
    }

    if (state.activeIntervention) {
      var prev = window.BMHI_INTERVENTIONS[state.activeIntervention];
      if (prev && prev.cleanup) prev.cleanup();
    }

    state.activeIntervention = preId;
    var container = $('interventionContent');
    container.innerHTML = '';

    log('Pre-layer:', preId, '\u2192 then:', mainId);

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
  // DISMISS — always available (§4.3)
  // ═══════════════════════════════════════════════════════════

  function handleDismiss() {
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

    if (audioPlaying) stopAudio();

    returnToSuite();
  }

  // ═══════════════════════════════════════════════════════════
  // AUDIO — optional ambient, never autoplay (§4.8)
  // ═══════════════════════════════════════════════════════════

  var audioCtx = null;
  var audioPlaying = false;
  var audioNodes = {};

  function toggleAudio() {
    if (audioPlaying) { stopAudio(); } else { startAudio(); }
  }

  function startAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    var osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 120;

    var gain = audioCtx.createGain();
    gain.gain.value = 0;

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
  // INIT — welcome every time, suite reveals after first action
  // ═══════════════════════════════════════════════════════════

  function init() {
    log('init');

    state.session = getSession();
    var visitNumber = incrementVisit();
    var returning = isReturningUser();
    log('Visit #' + visitNumber, 'Session:', state.session.id, returning ? '(returning)' : '(new)');

    // Check for returning user event
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

    emitEvent('MHIL_TRIGGER', {
      domain: window.location.hostname,
      trigger_type: 'standalone',
      session_duration: 0,
      pages_viewed: 0
    });

    // Wire up dismiss & audio
    $('dismissBtn').addEventListener('click', handleDismiss);
    $('audioToggle').addEventListener('click', toggleAudio);

    // Select the intervention the router wants
    var selectedId = selectIntervention(visitNumber);
    var selectedIntervention = selectedId ? window.BMHI_INTERVENTIONS[selectedId] : null;

    // ─── WELCOME SCREEN — every visit ────────────────────
    // "Before you go." — every time. The user always arrives
    // with the brief prompt. The hand on the shoulder.

    // Set the welcome button text based on what the router chose
    var btn = $('welcomeBtn');
    if (selectedIntervention && TIER_CTA[selectedIntervention.tier]) {
      btn.textContent = TIER_CTA[selectedIntervention.tier];
    }

    // Returning users: pre-build the suite nav (hidden) so it's
    // ready to show immediately after the first intervention
    if (returning) {
      buildSuiteNav();
      state.suiteRevealed = true;
      state.firstVisitCompleted = true; // skip "there's more" reveal
    }

    showWelcome();

    // When they click the button, fade out welcome, launch intervention
    btn.addEventListener('click', function () {
      var welcome = $('stageWelcome');
      welcome.classList.add('exiting');

      setTimeout(function () {
        welcome.classList.remove('active', 'exiting');

        // Returning users: show suite nav immediately alongside intervention
        if (returning) {
          showSuiteNav();
        }

        if (selectedId) {
          if (shouldShowPreLayer(visitNumber)) {
            launchInterventionWithPreLayer('F1', selectedId);
          } else {
            launchIntervention(selectedId);
          }
          if (returning) {
            updateActiveTab(selectedId);
          }
        }
      }, 600);
    });
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
