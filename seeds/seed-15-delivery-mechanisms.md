# SEED 15 — Delivery Mechanisms (A/B Test Variables)
# BMHI Build Sequence · Session 15 of 18
# Popup, Pop-Under, Embedded Unit, Email Trigger

---

## WHAT EXISTS

Sessions 01–14 built: All 16 interventions (Tiers A–F) + Long Arc Protocol (G1).
The suite works as a standalone page with direct navigation.

---

## WHAT YOU ARE BUILDING

The delivery mechanism that fires the intervention is itself a test variable (§2.2). Build all four; the pilot assigns users to one condition.

### What This Session Creates

A new file: `/public/delivery.js` — handles how the BMHI intervention is delivered to the user when embedded on a job search site.

Also create: `/public/embed.html` — a test harness page that simulates a job search site to demonstrate all four delivery mechanisms.

### Mechanism 1: POPUP (Default for Phase 1)

Exit-intent modal, in-page, single dismiss.

```javascript
// Trigger: mouseleave toward browser chrome (desktop)
//          or back-button intent / tab switch (mobile)
document.addEventListener('mouseleave', function(e) {
  if (e.clientY < 10 && shouldTrigger()) {
    showPopup();
  }
});
```

- Full-screen overlay with semi-transparent dark background
- BMHI container (max-width 560px) centered
- Smooth fade-in (0.8s)
- Single dismiss (X button, always visible)
- Contains the full BMHI experience (landing → intervention → post)

### Mechanism 2: POP-UNDER

New window behind active browser.

```javascript
// Opens BMHI in a new window, then refocuses original
var bmhiWindow = window.open('/public/index.html', 'bmhi',
  'width=560,height=700,left=100,top=100');
window.focus(); // Return focus to original tab
```

- Lower engagement friction but less immediate
- Window opens at modest size (560×700)
- BMHI page loads in standalone mode

### Mechanism 3: EMAIL TRIGGER

Post-session message (requires opt-in).

- Show a small, non-intrusive banner: "Can we send you something helpful?"
- Email field + consent checkbox
- If consented: POST to Cloudflare Worker endpoint (built in Session 16)
- Worker sends a brief email with link to BMHI page
- For now: build the opt-in UI and the POST request structure
- The actual email sending is wired up in Session 16

### Mechanism 4: EMBEDDED UNIT

In-page module, no new window.

```javascript
// Inject BMHI as an inline element on the page
function embedBMHI(targetSelector) {
  var container = document.querySelector(targetSelector);
  var iframe = document.createElement('iframe');
  iframe.src = '/public/index.html?mode=embedded';
  iframe.style.cssText = 'width:100%;max-width:560px;height:600px;' +
    'border:none;border-radius:12px;margin:20px auto;display:block;';
  container.appendChild(iframe);
}
```

- Renders inline within the job search page
- Uses iframe for style isolation
- Minimal UX disruption
- `?mode=embedded` query param tells BMHI to skip the full landing and use a shorter intro

### Trigger Logic (§2.1)

All mechanisms share the same trigger condition:

```javascript
function shouldTrigger() {
  // User has viewed ≥1 job listing
  // AND clicked 0 jobs
  // AND session duration ≥ 45 seconds (real user, not bot)
  var viewed = getJobsViewed();    // from page context
  var clicked = getJobsClicked();  // from page context
  var duration = getSessionDuration();
  return viewed >= 1 && clicked === 0 && duration >= 45;
}
```

For the demo/test harness (`embed.html`), simulate these conditions with buttons.

### Test Harness (`embed.html`)

A simple page that:
- Looks like a basic job search results page (minimal styling)
- Has buttons: "Trigger Popup", "Trigger Pop-Under", "Trigger Embedded", "Show Email Opt-In"
- Demonstrates each mechanism working
- Includes a fake "45 seconds elapsed, 0 clicks" simulation

### A/B Assignment

```javascript
// Assign user to a mechanism via cookie
function getMechanism() {
  var stored = getCookie('bmhi_mechanism');
  if (stored) return stored;
  var mechanisms = ['popup', 'popunder', 'email', 'embedded'];
  var assigned = mechanisms[Math.floor(Math.random() * 4)];
  setCookie('bmhi_mechanism', assigned, 90);
  return assigned;
}
```

---

## INTEGRATION

1. Add `<script>` tag for `delivery.js` in `index.html` (conditional — only when embedded)
2. `delivery.js` exports a global `BMHI_DELIVERY` object
3. Update measurement framework: MHIL_TRIGGER event now includes `trigger_type`
4. `embed.html` is a separate test page, not part of the main BMHI app
5. Add `?mode=embedded` handling to `app.js` (shorter landing sequence)

---

## TESTING

1. Popup: triggers on mouseleave, displays centered modal, dismissible
2. Pop-under: opens new window, focus returns to original
3. Embedded: renders inline iframe correctly
4. Email: opt-in banner displays, collects email (POST deferred to Session 16)
5. Test harness demonstrates all four mechanisms
6. A/B cookie assignment persists
7. Trigger logic respects conditions (≥1 viewed, 0 clicked, ≥45s)
8. All mechanisms work on mobile (popup and embedded most important)

---

## WHAT THE NEXT SESSION BUILDS

Session 16 builds the Cloudflare Worker for measurement event collection and email delivery.
