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

  // ─── Cookie helpers ─────────────────────────────────────
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setCookie(name, val, days) {
    var d = new Date(); d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + encodeURIComponent(val) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  // ─── Trigger Logic (§2.1) ───────────────────────────────
  var _viewed = 0, _clicked = 0, _start = Date.now(), _triggered = false;

  function setContext(viewed, clicked) {
    _viewed = viewed; _clicked = clicked;
  }

  function shouldTrigger() {
    if (_triggered) return false;
    var duration = (Date.now() - _start) / 1000;
    return _viewed >= 1 && _clicked === 0 && duration >= 45;
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

  // ═══════════════════════════════════════════════════════════
  // MECHANISM 1: POPUP — exit-intent modal
  // ═══════════════════════════════════════════════════════════

  function showPopup() {
    if (_triggered) return;
    _triggered = true;

    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.75);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;transition:opacity 0.8s ease;';

    var frame = document.createElement('iframe');
    frame.src = BMHI_URL + '?mode=embedded&trigger=popup';
    frame.style.cssText =
      'width:100%;max-width:560px;height:90vh;max-height:700px;' +
      'border:none;border-radius:12px;background:#1a1612;';

    var dismiss = document.createElement('button');
    dismiss.textContent = '\u00d7';
    dismiss.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:100000;' +
      'width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);' +
      'background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.6);font-size:20px;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'backdrop-filter:blur(8px);transition:all 0.3s;';
    dismiss.addEventListener('click', function () {
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); }, 800);
    });

    overlay.appendChild(frame);
    overlay.appendChild(dismiss);
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });
  }

  // Exit-intent listener (desktop)
  function enableExitIntent() {
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 10 && shouldTrigger()) {
        showPopup();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // MECHANISM 2: POP-UNDER — new window behind active
  // ═══════════════════════════════════════════════════════════

  function showPopunder() {
    if (_triggered) return;
    _triggered = true;
    var w = window.open(BMHI_URL + '?trigger=popunder', 'bmhi',
      'width=560,height=700,left=100,top=100');
    if (w) window.focus();
  }

  // ═══════════════════════════════════════════════════════════
  // MECHANISM 3: EMAIL TRIGGER — opt-in banner
  // ═══════════════════════════════════════════════════════════

  function showEmailOptIn(workerUrl) {
    if (_triggered) return;
    _triggered = true;

    var banner = document.createElement('div');
    banner.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'background:#1a1612;border-top:1px solid rgba(240,236,228,0.1);' +
      'padding:20px 24px;display:flex;flex-wrap:wrap;align-items:center;' +
      'justify-content:center;gap:12px;opacity:0;transition:opacity 0.6s ease;' +
      'font-family:Inter,system-ui,sans-serif;';

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
      'cursor:pointer;font-family:inherit;';
    sendBtn.addEventListener('click', function () {
      var email = emailInput.value.trim();
      if (!email || email.indexOf('@') === -1) return;
      sendBtn.textContent = 'Sent';
      sendBtn.disabled = true;
      // POST to worker (wired in Seed 16)
      if (workerUrl) {
        fetch(workerUrl + '/api/email-trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, timestamp: new Date().toISOString() })
        }).catch(function () {});
      }
      setTimeout(function () {
        banner.style.opacity = '0';
        setTimeout(function () { banner.remove(); }, 600);
      }, 2000);
    });
    banner.appendChild(sendBtn);

    var closeBanner = document.createElement('button');
    closeBanner.textContent = '\u00d7';
    closeBanner.style.cssText =
      'background:none;border:none;color:rgba(240,236,228,0.3);' +
      'font-size:18px;cursor:pointer;margin-left:8px;';
    closeBanner.addEventListener('click', function () {
      banner.style.opacity = '0';
      setTimeout(function () { banner.remove(); }, 600);
    });
    banner.appendChild(closeBanner);

    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.style.opacity = '1'; });
  }

  // ═══════════════════════════════════════════════════════════
  // MECHANISM 4: EMBEDDED UNIT — inline iframe
  // ═══════════════════════════════════════════════════════════

  function embedBMHI(targetSelector) {
    if (_triggered) return;
    _triggered = true;
    var target = document.querySelector(targetSelector);
    if (!target) return;

    var frame = document.createElement('iframe');
    frame.src = BMHI_URL + '?mode=embedded&trigger=embedded';
    frame.style.cssText =
      'width:100%;max-width:560px;height:600px;border:none;' +
      'border-radius:12px;margin:20px auto;display:block;background:#1a1612;';
    target.appendChild(frame);
  }

  // ═══════════════════════════════════════════════════════════
  // AUTO-TRIGGER based on A/B assignment
  // ═══════════════════════════════════════════════════════════

  function autoTrigger(options) {
    var opts = options || {};
    var mechanism = getMechanism();

    if (mechanism === 'popup') {
      enableExitIntent();
    } else if (mechanism === 'popunder') {
      // Trigger on idle timeout as proxy for exit
      setTimeout(function () {
        if (shouldTrigger()) showPopunder();
      }, 60000);
    } else if (mechanism === 'email') {
      setTimeout(function () {
        if (shouldTrigger()) showEmailOptIn(opts.workerUrl || '');
      }, 60000);
    } else if (mechanism === 'embedded') {
      setTimeout(function () {
        if (shouldTrigger() && opts.embedTarget) {
          embedBMHI(opts.embedTarget);
        }
      }, 60000);
    }
  }

  // ─── Export ─────────────────────────────────────────────
  window.BMHI_DELIVERY = {
    setContext: setContext,
    shouldTrigger: shouldTrigger,
    getMechanism: getMechanism,
    showPopup: showPopup,
    showPopunder: showPopunder,
    showEmailOptIn: showEmailOptIn,
    embedBMHI: embedBMHI,
    autoTrigger: autoTrigger,
    enableExitIntent: enableExitIntent
  };

})();
