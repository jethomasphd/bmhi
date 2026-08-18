// ═══════════════════════════════════════════════════════════════
// BMHI Delivery Mechanisms — Zero Storage
// Four mechanisms: popup, popunder, embedded, email CTA
// No cookies. No localStorage. No sessionStorage.
//
// The host page calls exactly one of these per session:
//   BMHI_DELIVERY.showPopup()        modal iframe over the page
//   BMHI_DELIVERY.showPopunder()     new window behind the page
//   BMHI_DELIVERY.embedBMHI('#sel')  inline iframe at a selector
//   BMHI_DELIVERY.showEmailOptIn()   bottom banner, email capture
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var BMHI_URL = 'index.html';
  var _activeOverlay = null;
  var _returnFocus = null;

  // ─── Namespaced styles (injected once) ──────────────────
  // Inline styles can't carry media queries or safe-area math,
  // so the overlay/banner styles live in one prefixed block.
  var CSS = [
    '.bmhi-popup-overlay{position:fixed;inset:0;z-index:2147483000;',
    'background:rgba(8,6,4,0.78);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);',
    'display:flex;align-items:center;justify-content:center;',
    'padding:calc(env(safe-area-inset-top,0px) + 16px) 16px calc(env(safe-area-inset-bottom,0px) + 16px);',
    'opacity:0;transition:opacity 0.8s ease;}',

    '.bmhi-popup-frame{width:100%;max-width:560px;height:min(720px,92%);',
    'border:1px solid rgba(240,236,228,0.1);border-radius:18px;background:#1a1612;',
    'box-shadow:0 24px 80px rgba(0,0,0,0.6);}',
    '@media (max-width:640px){.bmhi-popup-frame{max-width:none;height:100%;border-radius:14px;}}',

    '.bmhi-popup-dismiss{position:absolute;',
    'top:calc(env(safe-area-inset-top,0px) + 12px);right:calc(env(safe-area-inset-right,0px) + 12px);',
    'width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);',
    'background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.65);font-size:22px;line-height:1;',
    'cursor:pointer;display:flex;align-items:center;justify-content:center;',
    '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
    'transition:color 0.3s,border-color 0.3s;-webkit-tap-highlight-color:transparent;}',
    '.bmhi-popup-dismiss:hover{color:#fff;border-color:rgba(255,255,255,0.35);}',
    '.bmhi-popup-dismiss:focus-visible{outline:2px solid rgba(217,166,62,0.8);outline-offset:3px;}',
    '.bmhi-email-input:focus-visible,.bmhi-email-send:focus-visible,.bmhi-email-close:focus-visible{',
    'outline:2px solid rgba(217,166,62,0.8);outline-offset:2px;}',

    '.bmhi-email-banner{position:fixed;bottom:0;left:0;right:0;z-index:2147483000;',
    'background:#1a1612;border-top:1px solid rgba(240,236,228,0.1);',
    'padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 14px);',
    'display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;',
    'transform:translateY(100%);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1);',
    'font-family:Inter,system-ui,sans-serif;box-shadow:0 -8px 40px rgba(0,0,0,0.3);}',

    '.bmhi-email-text{font-size:13.5px;color:#d8d2c6;font-weight:300;line-height:1.5;}',

    '.bmhi-email-input{padding:10px 14px;font-size:16px;background:rgba(240,236,228,0.04);',
    'border:1px solid rgba(240,236,228,0.14);border-radius:999px;',
    'color:#f2eee6;outline:none;width:100%;max-width:210px;min-width:140px;',
    'font-family:inherit;transition:border-color 0.3s;}',
    '.bmhi-email-input:focus{border-color:rgba(196,146,42,0.5);}',
    '.bmhi-email-input::placeholder{color:#918878;}',

    '.bmhi-email-send{padding:10px 22px;font-size:12.5px;font-weight:600;letter-spacing:0.02em;',
    'background:#c4922a;color:#211a10;border:1px solid rgba(217,166,62,0.6);border-radius:999px;',
    'cursor:pointer;font-family:inherit;transition:filter 0.2s;}',
    '.bmhi-email-send:hover{filter:brightness(1.08);}',
    '.bmhi-email-send:disabled{cursor:default;filter:none;opacity:0.85;}',

    '.bmhi-email-close{background:none;border:none;color:rgba(240,236,228,0.35);',
    'width:36px;height:36px;font-size:18px;line-height:1;cursor:pointer;',
    'transition:color 0.2s;-webkit-tap-highlight-color:transparent;}',
    '.bmhi-email-close:hover{color:#f2eee6;}',

    '@media (max-width:520px){',
    '.bmhi-email-banner{justify-content:flex-start;}',
    '.bmhi-email-text{width:100%;padding-right:36px;}',
    '.bmhi-email-input{flex:1;max-width:none;}',
    '.bmhi-email-close{position:absolute;top:8px;right:8px;}',
    '}',

    '.bmhi-embed-frame{width:100%;max-width:560px;height:min(620px,86vh);border:none;',
    'border-radius:14px;margin:20px auto;display:block;background:#1a1612;',
    'box-shadow:0 6px 30px rgba(0,0,0,0.18);}'
  ].join('');

  function ensureStyles() {
    if (document.getElementById('bmhi-delivery-styles')) return;
    var style = document.createElement('style');
    style.id = 'bmhi-delivery-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function reset() {
    if (_activeOverlay) {
      _activeOverlay.remove();
      _activeOverlay = null;
    }
    // Remove any embedded iframes
    var embeds = document.querySelectorAll('.bmhi-embed-frame');
    for (var i = 0; i < embeds.length; i++) embeds[i].remove();
  }

  function restoreFocus() {
    if (_returnFocus && typeof _returnFocus.focus === 'function' &&
        document.contains(_returnFocus)) {
      _returnFocus.focus({ preventScroll: true });
    }
    _returnFocus = null;
  }

  // ═══════════════════════════════════════════════════════
  // POPUP — modal overlay with iframe
  // ═══════════════════════════════════════════════════════

  function showPopup() {
    reset();
    ensureStyles();
    _returnFocus = document.activeElement;

    var overlay = document.createElement('div');
    overlay.className = 'bmhi-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'A brief reset');

    var frame = document.createElement('iframe');
    frame.className = 'bmhi-popup-frame';
    frame.src = BMHI_URL + '?mode=embedded';
    frame.title = 'BMHI — a brief reset';

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'bmhi-popup-dismiss';
    dismiss.innerHTML = '&times;';
    dismiss.setAttribute('aria-label', 'Close');

    function dismissOverlay() {
      overlay.style.opacity = '0';
      setTimeout(function () { overlay.remove(); _activeOverlay = null; }, 800);
      window.removeEventListener('message', onPopupMsg);
      document.removeEventListener('keydown', onKey);
      restoreFocus();
    }

    dismiss.addEventListener('click', dismissOverlay);

    // Backdrop click closes; clicks inside the iframe never bubble here.
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismissOverlay();
    });

    function onKey(e) {
      if (e.key === 'Escape') dismissOverlay();
    }
    document.addEventListener('keydown', onKey);

    // Listen for "done" from embedded BMHI iframe
    function onPopupMsg(e) {
      if (e.data && e.data.bmhi === 'close') dismissOverlay();
    }
    window.addEventListener('message', onPopupMsg);

    overlay.appendChild(frame);
    overlay.appendChild(dismiss);
    document.body.appendChild(overlay);
    _activeOverlay = overlay;
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      dismiss.focus({ preventScroll: true });
    });
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
    ensureStyles();

    var banner = document.createElement('div');
    banner.className = 'bmhi-email-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Better matches by email');

    var text = document.createElement('span');
    text.className = 'bmhi-email-text';
    text.textContent = 'Not seeing what you’re looking for? We’ll email you better matches.';
    banner.appendChild(text);

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'your email';
    emailInput.className = 'bmhi-email-input';
    emailInput.setAttribute('aria-label', 'Email address');
    emailInput.setAttribute('autocomplete', 'email');
    banner.appendChild(emailInput);

    var sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.className = 'bmhi-email-send';
    sendBtn.textContent = 'Send';
    sendBtn.addEventListener('click', function () {
      var email = emailInput.value.trim();
      if (!email || email.indexOf('@') === -1) { emailInput.focus(); return; }
      sendBtn.textContent = 'Thank you ✓';
      sendBtn.disabled = true;
      // In production: POST to your endpoint. No client-side storage.
      setTimeout(closeBanner, 2000);
    });
    banner.appendChild(sendBtn);

    emailInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); sendBtn.click(); }
    });

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'bmhi-email-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Dismiss');
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
    ensureStyles();
    var target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = '';

    var frame = document.createElement('iframe');
    frame.className = 'bmhi-embed-frame';
    frame.src = BMHI_URL + '?mode=embedded';
    frame.title = 'BMHI — a brief reset';
    frame.setAttribute('loading', 'lazy');
    target.appendChild(frame);

    frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ─── Export ─────────────────────────────────────────────
  window.BMHI_DELIVERY = {
    reset: reset,
    showPopup: showPopup,
    showPopunder: showPopunder,
    showEmailOptIn: showEmailOptIn,
    embedBMHI: embedBMHI
  };

})();
