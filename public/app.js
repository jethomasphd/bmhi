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
    var container = $('navList');
    if (!container) return;
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

      var tierEl = document.createElement('div');
      tierEl.className = 'nav-tier';
      tierEl.setAttribute('data-tier', tierKey.toLowerCase());

      var heading = document.createElement('div');
      heading.className = 'nav-tier-heading';
      heading.textContent = TIER_LABELS[tierKey] || tierKey;
      tierEl.appendChild(heading);

      for (var j = 0; j < tiers[tierKey].length; j++) {
        (function (interventionId) {
          var intervention = window.BMHI_INTERVENTIONS[interventionId];
          var item = document.createElement('button');
          item.type = 'button';
          item.className = 'nav-item';
          item.setAttribute('data-id', interventionId);
          item.setAttribute('aria-label', intervention.name + ' \u2014 ' + intervention.mechanism);

          var name = document.createElement('span');
          name.className = 'nav-item-name';
          name.textContent = intervention.name;
          item.appendChild(name);

          var time = document.createElement('span');
          time.className = 'nav-item-time';
          time.textContent = intervention.time;
          item.appendChild(time);

          item.addEventListener('click', function () {
            closeSuiteNav();
            launchIntervention(interventionId);
          });
          tierEl.appendChild(item);
        })(tiers[tierKey][j]);
      }

      container.appendChild(tierEl);
    }
  }

  function openSuiteNav() {
    if (!state.suiteRevealed) {
      buildSuiteNav();
      state.suiteRevealed = true;
    }
    var modal = $('suiteNav');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeSuiteNav() {
    var modal = $('suiteNav');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
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
  }

  function renderPostContent() {
    var post = $('postContent');
    if (!post) return;
    post.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'post-wrap';

    var head = document.createElement('div');
    head.className = 'post-head';
    head.textContent = 'Your matches are ready.';
    wrap.appendChild(head);

    var sub = document.createElement('div');
    sub.className = 'post-sub';
    sub.textContent = 'Fresh matches are loaded. Step back into the search whenever you’re ready.';
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
      if (id) launchIntervention(id);
    });
    wrap.appendChild(secondary);

    // Sponsored clinical partner — quiet, single card, dismissible.
    if (window.BMHI_ADS && typeof window.BMHI_ADS.render === 'function') {
      window.BMHI_ADS.render(wrap);
    }

    // Tertiary: open the list modal for users who want to pick.
    var explore = document.createElement('button');
    explore.type = 'button';
    explore.className = 'post-explore';
    explore.textContent = 'See all resets';
    explore.addEventListener('click', openSuiteNav);
    wrap.appendChild(explore);

    post.appendChild(wrap);
  }

  function returnToSuite() {
    var id = selectRandom();
    if (id) launchIntervention(id);
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
    hideReadyPill();

    log('Launching:', interventionId, intervention.name);

    var completed = false;

    function finishEarly() {
      if (completed || state.activeIntervention !== interventionId) return;
      completed = true;
      if (intervention.cleanup) intervention.cleanup();
      hideReadyPill();
      showPost();
    }

    intervention.render(container, {
      complete: function (closingMessage, depthScore, textChars) {
        if (completed || state.activeIntervention !== interventionId) return;
        completed = true;
        hideReadyPill();
        showPost();
      },
      engage: function () {
        // No-op — no tracking
      }
    });

    // E-tier: games can run for 60–120s. After 15s of play, surface
    // a "matches ready" pill so the user knows they can exit whenever
    // they're done. Non-E interventions don't need this because they
    // either auto-complete on time or already have a submit button.
    if (interventionId.charAt(0) === 'E') {
      scheduleReadyPill(finishEarly);
    }

    showIntervention();
  }

  // ═══════════════════════════════════════════════════════════
  // READY PILL — "Matches ready" during long game interventions.
  // Appears at 15s; tapping it closes the intervention and goes
  // to the post stage. The user can also keep playing and finish
  // in their own time.
  // ═══════════════════════════════════════════════════════════

  var _readyTimer = null;

  function scheduleReadyPill(onTap) {
    clearReadyTimer();
    _readyTimer = setTimeout(function () {
      showReadyPill(onTap);
    }, 15000);
  }

  function clearReadyTimer() {
    if (_readyTimer) { clearTimeout(_readyTimer); _readyTimer = null; }
  }

  function showReadyPill(onTap) {
    var existing = document.getElementById('readyPill');
    if (existing) existing.remove();

    var pill = document.createElement('button');
    pill.type = 'button';
    pill.id = 'readyPill';
    pill.className = 'ready-pill';
    pill.setAttribute('aria-label', 'Your matches are ready — tap to continue');
    pill.innerHTML =
      '<span class="ready-pulse" aria-hidden="true"></span>' +
      '<span>Matches ready &mdash; continue when you’re done</span>';
    pill.addEventListener('click', function () {
      if (typeof onTap === 'function') onTap();
    });
    document.body.appendChild(pill);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { pill.classList.add('vis'); });
    });
  }

  function hideReadyPill() {
    clearReadyTimer();
    var pill = document.getElementById('readyPill');
    if (pill) {
      pill.classList.remove('vis');
      setTimeout(function () { if (pill.parentNode) pill.remove(); }, 500);
    }
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
    hideReadyPill();

    // Refresh icon = swap in a new intervention. In embedded mode the
    // outer popup/iframe still has its own close affordance; this
    // button is strictly a "try a different reset" action.
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

    // Modal: close button, backdrop click, and Escape key.
    var modal = $('suiteNav');
    var closeBtn = $('suiteNavClose');
    if (closeBtn) closeBtn.addEventListener('click', closeSuiteNav);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeSuiteNav();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeSuiteNav();
      }
    });

    // Persistent, subtle on every stage; becomes loud on post-intervention.
    showJobsCta(false);

    var selectedId = selectRandom();
    var selectedIntervention = selectedId ? window.BMHI_INTERVENTIONS[selectedId] : null;

    // Every visit — embedded or standalone — starts at the welcome.
    var btn = $('welcomeBtn');
    if (selectedIntervention && TIER_CTA[selectedIntervention.tier]) {
      btn.textContent = TIER_CTA[selectedIntervention.tier];
    }

    // Build the list now so the modal opens instantly on first tap.
    buildSuiteNav();
    state.suiteRevealed = true;

    showWelcome();

    btn.addEventListener('click', function () {
      var welcome = $('stageWelcome');
      welcome.classList.add('exiting');

      setTimeout(function () {
        welcome.classList.remove('active', 'exiting');
        if (selectedId) launchIntervention(selectedId);
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
