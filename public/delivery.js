// ═══════════════════════════════════════════════════════════════
// BMHI Delivery Mechanisms — A/B Test Variables (§2.2)
// Four mechanisms: popup, popunder, embedded, email
// The mechanism itself is a test variable for the pilot.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var COOKIE_NAME = 'bmhi_mechanism';
  var COOKIE_DAYS = 90;
  var BMHI_URL = '/index.html';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setCookie(name, val, days) {
    var d = new Date(); d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(val) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  // ─── Trigger state ─────────────────────────────────────
  var _viewed = 0, _clicked = 0, _start = Date.now(), _triggered = false;
  var _activeOverlay = null;

  function setContext(viewed, clicked) {
    _viewed = viewed; _clicked = clicked;
  }

  function shouldTrigger() {
    if (_triggered) return false;
    var duration = (Date.now() - _start) / 1000;
    return _viewed >= 1 && _clicked === 0 && duration >= 45;
  }

  // Reset so test harness can trigger multiple mechanisms
  function reset() {
    _triggered = false;
    if (_activeOverlay) {
      _activeOverlay.remove();
      _activeOverlay = null;
    }
  }

  // ─── A/B Assignment ─────────────────────────────────────
  function getMechanism() {
    var stored = getCookie(COOKIE_NAME);
    if (stored) return stored;
    var mechs = ['popup', 'popunder', 'email', 'embedded'];
    var assigned = mechs[Math.floor(Math.random() * 4)];
    setCookie(COOKIE_NAME, assigned, COOKIE_DAYS);
    return assigned;
  }

  // ═══════════════════════════════════════════════════════
  // POPUP — exit-intent modal
  // ═══════════════════════════════════════════════════════

  function showPopup() {
    reset();
    _triggered = true;

    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.8);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;transition:opacity 0.8s ease;';

    var frame = document.createElement('iframe');
    frame.src = BMHI_URL + '?mode=embedded&trigger=popup';
    frame.style.cssText =
      'width:100%;max-width:560px;height:88vh;max-height:700px;' +
      'border:none;border-radius:12px;background:#1a1612;' +
      'box-shadow:0 24px 80px rgba(0,0,0,0.6);';

    var dismiss = document.createElement('button');
    dismiss.innerHTML = '&times;';
    dismiss.style.cssText =
      'position:absolute;top:16px;right:16px;z-index:100000;' +
      'width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);' +
      'background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.6);font-size:20px;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'backdrop-filter:blur(8px);transition:all 0.3s;';
    dismiss.onmouseover = function () { dismiss.style.color = '#fff'; };
    dismiss.onmouseout = function () { dismiss.style.color = 'rgba(255,255,255,0.6)'; };
    dismiss.addEventListener('click', function () {
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); _activeOverlay = null; _triggered = false; }, 800);
    });

    overlay.appendChild(frame);
    overlay.appendChild(dismiss);
    document.body.appendChild(overlay);
    _activeOverlay = overlay;
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });
  }

  function enableExitIntent() {
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 10 && shouldTrigger()) showPopup();
    });
  }

  // ═══════════════════════════════════════════════════════
  // POP-UNDER
  // ═══════════════════════════════════════════════════════

  function showPopunder() {
    reset();
    _triggered = true;
    var w = window.open(BMHI_URL + '?trigger=popunder', 'bmhi',
      'width=560,height=700,left=100,top=100');
    if (w) window.focus();
  }

  // ═══════════════════════════════════════════════════════
  // EMAIL OPT-IN
  // ═══════════════════════════════════════════════════════

  function showEmailOptIn() {
    reset();
    _triggered = true;

    var banner = document.createElement('div');
    banner.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'background:#1a1612;border-top:1px solid rgba(240,236,228,0.1);' +
      'padding:20px 24px;display:flex;flex-wrap:wrap;align-items:center;' +
      'justify-content:center;gap:12px;' +
      'transform:translateY(100%);transition:transform 0.5s cubic-bezier(0.4,0,0.2,1);' +
      'font-family:Inter,system-ui,sans-serif;box-shadow:0 -8px 40px rgba(0,0,0,0.3);';

    var text = document.createElement('span');
    text.style.cssText = 'font-size:14px;color:#d4cfc5;font-weight:300;';
    text.textContent = 'Can we send you something helpful after your search?';
    banner.appendChild(text);

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'your email';
    emailInput.style.cssText =
      'padding:8px 14px;font-size:13px;background:transparent;' +
      'border:1px solid rgba(240,236,228,0.12);border-radius:8px;' +
      'color:#f0ece4;outline:none;width:200px;font-family:inherit;';
    banner.appendChild(emailInput);

    var sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.style.cssText =
      'padding:8px 20px;font-size:12px;font-weight:500;' +
      'background:#c4922a;color:#1a1612;border:none;border-radius:8px;' +
      'cursor:pointer;font-family:inherit;transition:all 0.2s;';
    sendBtn.addEventListener('click', function () {
      var email = emailInput.value.trim();
      if (!email || email.indexOf('@') === -1) return;
      sendBtn.textContent = 'Sent \u2713';
      sendBtn.disabled = true;
      // Store consent locally — no server needed
      try {
        var consents = JSON.parse(localStorage.getItem('bmhi_email_consents') || '[]');
        consents.push({ email: email, timestamp: new Date().toISOString() });
        localStorage.setItem('bmhi_email_consents', JSON.stringify(consents));
      } catch (e) { /* ok */ }
      setTimeout(closeBanner, 2000);
    });
    banner.appendChild(sendBtn);

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText =
      'background:none;border:none;color:rgba(240,236,228,0.3);' +
      'font-size:18px;cursor:pointer;margin-left:4px;transition:color 0.2s;';
    closeBtn.onmouseover = function () { closeBtn.style.color = '#f0ece4'; };
    closeBtn.onmouseout = function () { closeBtn.style.color = 'rgba(240,236,228,0.3)'; };
    closeBtn.addEventListener('click', closeBanner);
    banner.appendChild(closeBtn);

    function closeBanner() {
      banner.style.transform = 'translateY(100%)';
      setTimeout(function () { banner.remove(); _activeOverlay = null; _triggered = false; }, 500);
    }

    document.body.appendChild(banner);
    _activeOverlay = banner;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.style.transform = 'translateY(0)'; });
    });
  }

  // ═══════════════════════════════════════════════════════
  // EMBEDDED
  // ═══════════════════════════════════════════════════════

  function embedBMHI(targetSelector) {
    reset();
    _triggered = true;
    var target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = '';

    var frame = document.createElement('iframe');
    frame.src = BMHI_URL + '?mode=embedded&trigger=embedded';
    frame.style.cssText =
      'width:100%;max-width:560px;height:600px;border:none;' +
      'border-radius:12px;margin:20px auto;display:block;background:#1a1612;' +
      'box-shadow:0 4px 24px rgba(0,0,0,0.15);';
    target.appendChild(frame);
    _activeOverlay = frame;

    // Scroll into view smoothly
    frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ═══════════════════════════════════════════════════════
  // AUTO-TRIGGER
  // ═══════════════════════════════════════════════════════

  function autoTrigger(options) {
    var opts = options || {};
    var mechanism = getMechanism();
    if (mechanism === 'popup') {
      enableExitIntent();
    } else if (mechanism === 'popunder') {
      setTimeout(function () { if (shouldTrigger()) showPopunder(); }, 60000);
    } else if (mechanism === 'email') {
      setTimeout(function () { if (shouldTrigger()) showEmailOptIn(); }, 60000);
    } else if (mechanism === 'embedded') {
      setTimeout(function () {
        if (shouldTrigger() && opts.embedTarget) embedBMHI(opts.embedTarget);
      }, 60000);
    }
  }

  // ─── Export ─────────────────────────────────────────────
  window.BMHI_DELIVERY = {
    setContext: setContext,
    shouldTrigger: shouldTrigger,
    getMechanism: getMechanism,
    reset: reset,
    showPopup: showPopup,
    showPopunder: showPopunder,
    showEmailOptIn: showEmailOptIn,
    embedBMHI: embedBMHI,
    autoTrigger: autoTrigger,
    enableExitIntent: enableExitIntent
  };

})();
