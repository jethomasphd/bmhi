// ═══════════════════════════════════════════════════════════════
// BMHI — Brief Mental Health Intervention Suite
// Core Engine: random selection, zero storage, fully portable
//
// "The person on the other side of the screen searched for a job
//  and found nothing. They are not a bounce event."
//
// No cookies. No localStorage. No sessionStorage. No tracking.
// Every visit is a clean slate. Selection is random.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Button text per tier (what the welcome button says)
  var TIER_CTA = {
    A: 'Take a breath',
    B: 'See it differently',
    C: 'Try something small',
    D: 'Let something go',
    E: 'Quick mental reset',
    F: 'Check in with yourself'
  };

  // Felt-experience tier labels
  var TIER_LABELS = {
    A: 'Calm my body',
    B: 'Quiet my mind',
    C: 'Do something small',
    D: 'Feel what I feel',
    E: 'Reset before the next search',
    F: 'Get help'
  };

  // SVG icon markup for reset-tier games (consistent stroke-based, 16x16)
  var GAME_ICONS = {
    E1: '<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>',
    E3: '<rect x="2" y="6" width="4" height="4" rx="0.5"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><rect x="10" y="6" width="4" height="4" rx="0.5"/><rect x="4" y="2" width="4" height="4" rx="0.5"/>',
    E4: '<circle cx="4" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/><circle cx="10" cy="8" r="2"/><circle cx="14" cy="5" r="1"/>',
    E5: '<rect x="2" y="2" width="3" height="2" rx="0.5"/><rect x="6" y="2" width="3" height="2" rx="0.5"/><rect x="10" y="2" width="3" height="2" rx="0.5"/><circle cx="8" cy="9" r="1.5"/><rect x="4" y="13" width="8" height="2" rx="1"/>',
    E6: '<line x1="8" y1="14" x2="8" y2="7"/><circle cx="8" cy="5" r="2.5"/><line x1="5" y1="10" x2="8" y2="7"/><line x1="11" y1="10" x2="8" y2="7"/>'
  };

  // ─── State ─────────────────────────────────────────────────
  var state = {
    stage: 'init',
    activeIntervention: null,
    suiteRevealed: false,
    firstCompleted: false
  };

  // ─── DOM helpers ───────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function log() {
    var a = ['[bmhi]'];
    for (var i = 0; i < arguments.length; i++) a.push(arguments[i]);
    console.log.apply(console, a);
  }

  // ═══════════════════════════════════════════════════════════
  // TIME-OF-DAY AWARENESS (clock-based, no storage)
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
  // INTERVENTION REGISTRY & RANDOM SELECTION
  // ═══════════════════════════════════════════════════════════

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  function getAvailableInterventions() {
    var ids = [];
    for (var id in window.BMHI_INTERVENTIONS) {
      if (window.BMHI_INTERVENTIONS.hasOwnProperty(id)) ids.push(id);
    }
    return ids;
  }

  function selectRandom() {
    var available = getAvailableInterventions();
    if (available.length === 0) return null;

    // Late-night: 50% chance to route to a somatic (A-tier) intervention
    if (isLateNight()) {
      var somatic = available.filter(function (id) { return id.charAt(0) === 'A'; });
      if (somatic.length > 0 && Math.random() < 0.5) {
        return somatic[Math.floor(Math.random() * somatic.length)];
      }
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  // ═══════════════════════════════════════════════════════════
  // SUITE NAVIGATOR
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

          if (tierKey === 'E' && GAME_ICONS[interventionId]) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">' +
              GAME_ICONS[interventionId] + '</svg>';
            btn.setAttribute('title', intervention.name);
          } else {
            btn.textContent = intervention.name;
          }

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

  // ═══════════════════════════════════════════════════════════
  // JOBS CTA — persistent "back to job search" that refreshes
  // the user's feed with a generic, high-relevance query.
  // Breaks out of any iframe embed.
  // ═══════════════════════════════════════════════════════════

  // Host job boards override this via window.BMHI_CONFIG before
  // loading app.js. See CLAUDE.md for integration details.
  function jobsUrl() {
    var cfg = window.BMHI_CONFIG || {};
    return cfg.jobsUrl || 'https://thesejobs.net/jobs';
  }

  function goToJobs() {
    var url = jobsUrl();
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = url;
        return;
      }
    } catch (e) { /* cross-origin read blocked is fine — setting is allowed */ }
    window.location.href = url;
  }

  function showJobsCta(loud) {
    var cta = $('jobsCta');
    if (!cta) return;
    cta.classList.add('vis');
    cta.classList.toggle('loud', !!loud);
    var label = $('jobsCtaLabel');
    if (label) {
      label.innerHTML = loud
        ? 'show me better matches &rarr;'
        : 'back to job search &rarr;';
    }
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

  function showPost() {
    state.stage = 'post';

    // Keep the persistent jobs CTA subtle at the top — the
    // primary action now lives in the in-flow post UI below
    // as a large amber button, so no need to compete.
    showJobsCta(false);

    // Build the in-flow post UI (same in every mode) — the
    // primary action is always "show me better matches →".
    renderPostContent();
    transitionTo('stagePost');

    // Standalone: also reveal the suite nav so they can explore.
    if (!embeddedMode) {
      showSuiteNav();
      if (!state.firstCompleted) {
        state.firstCompleted = true;
        var reveal = $('postReveal');
        if (reveal) {
          setTimeout(function () { reveal.classList.add('vis'); }, 1200);
          setTimeout(function () { reveal.classList.remove('vis'); }, 8000);
        }
      }
    }
  }

  function renderPostContent() {
    var post = $('postContent');
    if (!post) return;
    post.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'post-wrap';

    var head = document.createElement('div');
    head.className = 'post-head';
    head.textContent = 'Ready for a fresh search?';
    wrap.appendChild(head);

    var sub = document.createElement('div');
    sub.className = 'post-sub';
    sub.textContent = 'We’ll refresh your feed with new matches.';
    wrap.appendChild(sub);

    var primary = document.createElement('button');
    primary.type = 'button';
    primary.className = 'post-primary';
    primary.innerHTML = 'Show me better matches &rarr;';
    primary.addEventListener('click', goToJobs);
    wrap.appendChild(primary);

    var secondary = document.createElement('button');
    secondary.type = 'button';
    secondary.className = 'post-secondary';
    secondary.textContent = 'Another quick reset first';
    secondary.addEventListener('click', function () {
      var id = selectRandom();
      if (id) {
        launchIntervention(id);
        if (!embeddedMode) updateActiveTab(id);
      }
    });
    wrap.appendChild(secondary);

    // Sponsored clinical partner — quiet, single card, dismissible.
    if (window.BMHI_ADS && typeof window.BMHI_ADS.render === 'function') {
      window.BMHI_ADS.render(wrap);
    }

    post.appendChild(wrap);
  }

  function returnToSuite() {
    var id = selectRandom();
    if (id) {
      launchIntervention(id);
      if (!embeddedMode) {
        showSuiteNav();
        updateActiveTab(id);
      }
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

    // Reset the jobs CTA to subtle for the duration of the intervention.
    showJobsCta(false);

    log('Launching:', interventionId, intervention.name);

    var completed = false;

    intervention.render(container, {
      complete: function (closingMessage, depthScore, textChars) {
        if (completed || state.activeIntervention !== interventionId) return;
        completed = true;
        showPost();
      },
      engage: function () {
        // No-op — no tracking
      }
    });

    showIntervention();
  }

  // ═══════════════════════════════════════════════════════════
  // DISMISS — always available
  // ═══════════════════════════════════════════════════════════

  function handleDismiss() {
    var prevId = state.activeIntervention;
    state.activeIntervention = null;

    if (prevId) {
      var intervention = window.BMHI_INTERVENTIONS[prevId];
      if (intervention && intervention.cleanup) intervention.cleanup();
    }

    if (audioPlaying) stopAudio();

    if (embeddedMode) {
      // Tell parent to close the overlay — user is done
      try { window.parent.postMessage({ bmhi: 'close' }, '*'); } catch (e) {}
      return;
    }

    returnToSuite();
  }

  // ═══════════════════════════════════════════════════════════
  // AUDIO — optional ambient, never autoplay
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
  // EMBEDDED MODE — same flow as standalone (welcome → intervention
  // → post). The only difference: embedded hides the suite nav so
  // the post-intervention UI keeps a single clear CTA path back
  // into the job search.
  // ═══════════════════════════════════════════════════════════

  var embeddedMode = false;

  // ═══════════════════════════════════════════════════════════
  // INIT — welcome every visit, random selection, zero storage
  // ═══════════════════════════════════════════════════════════

  function init() {
    log('init — zero storage mode');

    embeddedMode = window.location.search.indexOf('mode=embedded') !== -1;

    $('dismissBtn').addEventListener('click', handleDismiss);
    $('audioToggle').addEventListener('click', toggleAudio);
    $('jobsCta').addEventListener('click', goToJobs);

    // Persistent, subtle on every stage; becomes loud on post-intervention.
    showJobsCta(false);

    var selectedId = selectRandom();
    var selectedIntervention = selectedId ? window.BMHI_INTERVENTIONS[selectedId] : null;

    // Every visit — embedded or standalone — starts at the welcome.
    var btn = $('welcomeBtn');
    if (selectedIntervention && TIER_CTA[selectedIntervention.tier]) {
      btn.textContent = TIER_CTA[selectedIntervention.tier];
    }

    if (!embeddedMode) {
      buildSuiteNav();
      state.suiteRevealed = true;
    }

    showWelcome();

    btn.addEventListener('click', function () {
      var welcome = $('stageWelcome');
      welcome.classList.add('exiting');

      setTimeout(function () {
        welcome.classList.remove('active', 'exiting');
        if (!embeddedMode) showSuiteNav();

        if (selectedId) {
          launchIntervention(selectedId);
          if (!embeddedMode) updateActiveTab(selectedId);
        }
      }, 600);
    });
  }

  // ─── Expose for interventions (minimal, no storage) ────────
  window.BMHI = {
    getTimeOfDay: getTimeOfDay,
    isLateNight: isLateNight,
    log: log
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
