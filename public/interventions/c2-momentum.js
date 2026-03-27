// ═══════════════════════════════════════════════════════════════
// C2 — The Momentum Builder
// Mechanism: Micro-mastery / behavioral activation via mini-task
// Evidence:  T2 (BA literature; Fogg behavior model)
// Time:      3–4 minutes
//
// A completable micro-task. Time-of-day rotating prompts.
// Responses stored in localStorage for the user's own reference.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var STORAGE_KEY = 'bmhi_momentum_responses';
  var CLOSING_TEXT = 'That\u2019s real. You made something.';

  var PROMPTS = {
    morning: {
      intro: 'Write the first line of your next cover letter.',
      detail: 'Just one sentence. Start with \u201cI am the kind of person who...\u201d',
      placeholder: 'I am the kind of person who...'
    },
    afternoon: {
      intro: 'What\u2019s the job title you keep gravitating toward?',
      detail: 'Write it down. Now write one word that describes why it fits you.',
      placeholder: 'The title... and the word'
    },
    evening: {
      intro: 'Name one professional win from this year \u2014 any size.',
      detail: 'Write it. Keep it.',
      placeholder: 'One win...'
    },
    'late-night': {
      intro: 'Name one professional win from this year \u2014 any size.',
      detail: 'Write it. Keep it.',
      placeholder: 'One win...'
    }
  };

  var timers = [];
  var running = false;

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    running = false;
  }

  function getTimeOfDay() {
    if (window.BMHI && window.BMHI.getTimeOfDay) return window.BMHI.getTimeOfDay();
    var h = new Date().getHours();
    if (h >= 22 || h < 5) return 'late-night';
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  }

  function saveResponse(promptType, text) {
    try {
      var history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      history.push({
        date: new Date().toISOString().split('T')[0],
        prompt_type: promptType,
        response_preview: text.substring(0, 20)
      });
      if (history.length > 30) history = history.slice(-30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) { /* ok */ }
  }

  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};

  window.BMHI_INTERVENTIONS['C2'] = {
    id: 'C2',
    name: 'Momentum Builder',
    tier: 'C',
    mechanism: 'Micro-mastery / behavioral activation via mini-task',
    evidence: 'T2',
    time: '3\u20134min',

    render: function (container, helpers) {
      running = true;
      container.innerHTML = '';

      var tod = getTimeOfDay();
      var prompt = PROMPTS[tod] || PROMPTS.afternoon;

      // Opening
      var opening = document.createElement('div');
      opening.className = 'prompt-text';
      opening.style.opacity = '0';
      opening.style.transition = 'opacity 1.2s ease';
      opening.innerHTML =
        'Before you go \u2014 90 seconds on something real.<br><br>' +
        '<em>' + prompt.intro + '</em><br>' +
        '<span style="color:var(--dim);font-size:0.85em">' + prompt.detail + '</span>';
      container.appendChild(opening);

      // Privacy note
      var privacy = document.createElement('div');
      privacy.className = 'privacy-note';
      privacy.style.opacity = '0';
      privacy.style.transition = 'opacity 1s ease';
      privacy.textContent = 'This stays on your device.';
      container.appendChild(privacy);

      // Text area
      var textarea = document.createElement('textarea');
      textarea.className = 'mhi-textarea';
      textarea.placeholder = prompt.placeholder;
      textarea.style.opacity = '0';
      textarea.style.transition = 'opacity 1s ease';
      container.appendChild(textarea);

      // Closing text
      var closing = document.createElement('div');
      closing.className = 'closing-text';
      closing.style.marginTop = '24px';
      closing.textContent = CLOSING_TEXT;
      container.appendChild(closing);

      // Fade in
      timers.push(setTimeout(function () { opening.style.opacity = '1'; }, 300));
      timers.push(setTimeout(function () { privacy.style.opacity = '1'; }, 1800));
      timers.push(setTimeout(function () {
        textarea.style.opacity = '1';
        if (running) textarea.focus();
      }, 2200));

      // Finish
      var finished = false;
      function finish() {
        if (finished || !running) return;
        finished = true;
        var text = textarea.value.trim();
        var chars = text.length;

        if (chars > 0) saveResponse(tod, text);

        textarea.style.transition = 'opacity 0.8s ease';
        textarea.style.opacity = '0.3';
        textarea.disabled = true;
        privacy.style.opacity = '0';

        timers.push(setTimeout(function () {
          if (!running) return;
          closing.classList.add('vis');
        }, 800));

        timers.push(setTimeout(function () {
          if (!running) return;
          helpers.complete(CLOSING_TEXT, chars > 0 ? 3 : 2, chars);
        }, 4500));
      }

      // Auto-finish after 90s or 20s idle after typing
      var idleTimer = setTimeout(finish, 90000);
      timers.push(idleTimer);

      textarea.addEventListener('input', function () {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(finish, 20000);
        timers.push(idleTimer);
      });

      if (helpers.engage) {
        helpers.engage({ interaction_type: 'type', depth_score: 1 });
      }
    },

    cleanup: function () {
      clearTimers();
    }
  };

})();
