// ═══════════════════════════════════════════════════════════════
// BMHI Delivery Mechanisms — Zero Storage
// Four mechanisms: popup, popunder, embedded, email CTA
// No cookies. No localStorage. No sessionStorage.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var BMHI_URL = 'index.html';
  var _activeOverlay = null;

  function reset() {
    if (_activeOverlay) {
      _activeOverlay.remove();
      _activeOverlay = null;
    }
    // Remove any embedded iframes
    var embeds = document.querySelectorAll('.bmhi-embed-frame');
    for (var i = 0; i < embeds.length; i++) embeds[i].remove();
  }

  // ═══════════════════════════════════════════════════════
  // POPUP — modal overlay with iframe
  // ═══════════════════════════════════════════════════════

  function showPopup() {
    reset();

    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.8);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;transition:opacity 0.8s ease;';

    var frame = document.createElement('iframe');
    frame.src = BMHI_URL + '?mode=embedded';
    frame.style.cssText =
      'width:100%;max-width:min(560px,92vw);height:85vh;max-height:700px;' +
      'border:none;border-radius:12px;background:#1a1612;' +
      'box-shadow:0 24px 80px rgba(0,0,0,0.6);';

    var dismiss = document.createElement('button');
    dismiss.innerHTML = '&times;';
    dismiss.style.cssText =
      'position:absolute;top:12px;right:12px;z-index:100000;' +
      'width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);' +
      'background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.6);font-size:22px;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'backdrop-filter:blur(8px);transition:all 0.3s;';
    function dismissOverlay() {
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); _activeOverlay = null; }, 800);
      window.removeEventListener('message', onPopupMsg);
    }

    dismiss.addEventListener('click', dismissOverlay);

    // Listen for "done" from embedded BMHI iframe
    function onPopupMsg(e) {
      if (e.data && e.data.bmhi === 'close') dismissOverlay();
    }
    window.addEventListener('message', onPopupMsg);

    overlay.appendChild(frame);
    overlay.appendChild(dismiss);
    document.body.appendChild(overlay);
    _activeOverlay = overlay;
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });
  }

  // ═══════════════════════════════════════════════════════
  // POP-UNDER — new window behind current
  // ═══════════════════════════════════════════════════════

  function showPopunder() {
    reset();
    var w = window.open(BMHI_URL, 'bmhi', 'width=560,height=700,left=100,top=100');
    if (w) window.focus();
  }

  // ═══════════════════════════════════════════════════════
  // EMAIL CTA — bottom banner with message (no storage)
  // ═══════════════════════════════════════════════════════

  function showEmailOptIn() {
    reset();

    var banner = document.createElement('div');
    banner.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'background:#1a1612;border-top:1px solid rgba(240,236,228,0.1);' +
      'padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;' +
      'justify-content:center;gap:10px;' +
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
      'padding:8px 14px;font-size:16px;background:transparent;' +
      'border:1px solid rgba(240,236,228,0.12);border-radius:8px;' +
      'color:#f0ece4;outline:none;width:100%;max-width:200px;' +
      'min-width:120px;font-family:inherit;';
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
      sendBtn.textContent = 'Thank you \u2713';
      sendBtn.disabled = true;
      // In production: POST to your endpoint. No client-side storage.
      setTimeout(closeBanner, 2000);
    });
    banner.appendChild(sendBtn);

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText =
      'background:none;border:none;color:rgba(240,236,228,0.3);' +
      'font-size:18px;cursor:pointer;margin-left:4px;transition:color 0.2s;';
    closeBtn.addEventListener('mouseenter', function () { closeBtn.style.color = '#f0ece4'; });
    closeBtn.addEventListener('mouseleave', function () { closeBtn.style.color = 'rgba(240,236,228,0.3)'; });
    closeBtn.addEventListener('click', closeBanner);
    banner.appendChild(closeBtn);

    function closeBanner() {
      banner.style.transform = 'translateY(100%)';
      setTimeout(function () { banner.remove(); _activeOverlay = null; }, 500);
    }

    document.body.appendChild(banner);
    _activeOverlay = banner;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.style.transform = 'translateY(0)'; });
    });
  }

  // ═══════════════════════════════════════════════════════
  // EMBEDDED — inline iframe
  // ═══════════════════════════════════════════════════════

  function embedBMHI(targetSelector) {
    reset();
    var target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = '';

    var frame = document.createElement('iframe');
    frame.className = 'bmhi-embed-frame';
    frame.src = BMHI_URL + '?mode=embedded';
    frame.style.cssText =
      'width:100%;max-width:560px;height:600px;border:none;' +
      'border-radius:12px;margin:20px auto;display:block;background:#1a1612;' +
      'box-shadow:0 4px 24px rgba(0,0,0,0.15);';
    target.appendChild(frame);

    frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ═══════════════════════════════════════════════════════
  // EXIT RECOVERY — CEO's 4-screen conversion flow
  // Recover intent first. Monetize second. Entertain last.
  // ═══════════════════════════════════════════════════════

  var EXIT_URL = 'exit.html';

  function showExitRecovery() {
    reset();

    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;transition:opacity 0.6s ease;';

    var frame = document.createElement('iframe');
    frame.src = EXIT_URL;
    frame.style.cssText =
      'width:100%;max-width:min(480px,92vw);height:85vh;max-height:640px;' +
      'border:none;border-radius:12px;background:#111318;' +
      'box-shadow:0 24px 80px rgba(0,0,0,0.6);';

    var dismiss = document.createElement('button');
    dismiss.innerHTML = '&times;';
    dismiss.style.cssText =
      'position:absolute;top:12px;right:12px;z-index:100000;' +
      'width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);' +
      'background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.6);font-size:22px;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'backdrop-filter:blur(8px);transition:all 0.3s;';
    dismiss.addEventListener('click', function () {
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); _activeOverlay = null; }, 600);
    });

    overlay.appendChild(frame);
    overlay.appendChild(dismiss);
    document.body.appendChild(overlay);
    _activeOverlay = overlay;
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });

    // Listen for close message from exit.html iframe
    function onClose(e) {
      if (e.data && e.data.bmhi === 'close') {
        window.removeEventListener('message', onClose);
        overlay.style.opacity = '0';
        setTimeout(function () { overlay.remove(); _activeOverlay = null; }, 600);
      }
    }
    window.addEventListener('message', onClose);
  }

  // ─── Export ─────────────────────────────────────────────
  window.BMHI_DELIVERY = {
    reset: reset,
    showPopup: showPopup,
    showPopunder: showPopunder,
    showEmailOptIn: showEmailOptIn,
    embedBMHI: embedBMHI,
    showExitRecovery: showExitRecovery
  };

})();
