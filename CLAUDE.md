# CLAUDE.md — Integration guide for BMHI

You (the coding agent on the receiving team's side) have been handed the **Brief Mental Health Intervention Suite**. This file tells you what it is, what it is not, and how to wire it into a live job board without damaging it.

Read this end to end before you change anything.

---

## What BMHI is

A self-contained, static web app that delivers a single brief mental health intervention to a job seeker at the moment their search didn't go the way they hoped. Nineteen interventions, randomly selected, each grounded in peer-reviewed research. No backend. No build step. No framework. No cookies. No storage. No tracking.

**The whole unit lives in `public/`:**

```
public/
  index.html            The BMHI app shell (welcome → intervention → post)
  app.js                State machine, random selection, post-intervention CTA
  ads.js                Single-slot clinical partner unit (placeholder copy)
  delivery.js           The four host-page delivery mechanisms
  about.html            The science, for users who want it
  interventions/        19 self-contained intervention modules
  _headers              Security + framing headers (Cloudflare/Netlify format)
  embed.html            DEMO PAGE ONLY — not part of the unit you ship
```

Everything in `public/` except `embed.html` is the product. `embed.html` is a mock job board that exists so humans can see what the mechanisms feel like. **Do not ship `embed.html`.** Do not copy its job list, its styles, or its UI chrome onto your real job board — you already have a real job board.

---

## What to integrate

You have two integration levels. Pick based on what your site needs.

### Level 1 — Host-page delivery only (most common)

Your real job board loads `delivery.js` and calls one of four trigger functions when it detects a job-search failure signal (exit intent, long dwell with no clicks, empty result set, pagination past 3 with no clicks, etc.). The delivery layer injects an iframe pointing at a hosted copy of the BMHI `index.html`.

```html
<!-- On your real job search results page -->
<script src="https://your-bmhi-host.com/delivery.js"></script>
<script>
  // Trigger when the host decides it's time — e.g. exit intent,
  // pagination without clicks, zero-result search, etc.
  // Pick ONE mechanism per session.
  BMHI_DELIVERY.showPopup();       // modal iframe over current page
  BMHI_DELIVERY.showPopunder();    // new window behind current
  BMHI_DELIVERY.embedBMHI('#slot');// inline iframe at a selector
  BMHI_DELIVERY.showEmailOptIn();  // bottom banner with email capture
</script>
```

Before loading `delivery.js`, the iframe URL points at `index.html` relative to the script's origin. If you're hosting BMHI on a separate subdomain, adjust `BMHI_URL` at the top of `delivery.js` to an absolute URL:

```js
var BMHI_URL = 'https://bmhi.yoursite.com/index.html';
```

### Level 2 — Deep integration

You are embedding BMHI directly inside your job board's HTML (same origin, no iframe). Copy the `public/` directory into your project, mount `index.html` on a route (e.g. `/reset`), and link to it.

This path gives up the privacy guarantees. BMHI is designed to run in an iframe so its content is isolated from your analytics, your page's JavaScript, and anything else that might identify the user. Prefer Level 1 unless you have a very specific reason.

---

## Configuration

BMHI reads one optional global before `app.js` initializes. Set it on the host page that loads `index.html`:

```html
<script>
  window.BMHI_CONFIG = {
    // Where the "show me better matches" CTA sends users after
    // they finish an intervention. Defaults to thesejobs.net/jobs.
    jobsUrl: 'https://yoursite.com/jobs?q=&loc=auto'
  };
</script>
<script src="app.js"></script>
```

If BMHI is hosted cross-origin in an iframe, set `BMHI_CONFIG` **inside** the iframe's HTML (e.g. by templating `index.html` at deploy time). Cross-origin parents cannot write to child globals.

---

## The four delivery mechanisms

All four live in `delivery.js`. They all eventually point the user at the same `index.html`. The difference is *how* the user encounters it.

| Mechanism | When to fire | User experience |
|---|---|---|
| **Popup** | Exit intent, long dwell with zero clicks | Modal iframe over the current page |
| **Pop-Under** | Session start for qualifying traffic | New window opens behind the current one |
| **Embedded** | Inline below the result list on a zero-result query | Iframe appears inline, scrolls into view |
| **Email CTA** | Gentle, always-available option | Bottom banner with email field, zero friction |

"Exit recovery" is not a separate mechanism. It's the **Popup** fired on `mouseout` with `e.clientY <= 0`. The demo page shows this with a checkbox toggle.

---

## The user journey, inside the iframe

Every trigger loads the same flow. Do not short-circuit any of it.

1. **Welcome** — `Before you go.` / `You searched today. That counts.` / single CTA button.
2. **Intervention** — One of 19 modules, randomly selected. Late-night traffic (10 pm–5 am) gets a 50% somatic weighting.
3. **Post** — `Ready for a fresh search?` with a prominent `Show me better matches →` button that navigates `window.top.location` to `BMHI_CONFIG.jobsUrl`. Secondary option: another quick reset.

A persistent amber pill at the top of the frame reads `back to job search →` at every stage. Clicking it does the same `window.top.location` navigation. This is the **one path** out, and it always lands the user on a fresh search query.

---

## The sponsored partner slot

`ads.js` exposes a single-card placement that renders inside the post-intervention stage, after the CTA. It is:

- **One card only.** Never stacked. Never interstitial.
- **Dismissible.** Small × in the corner.
- **Design-system native.** Same typography and palette as the suite.
- **Clinical partners only.** Mental-health services with near-total audience overlap (Talkspace, BetterHelp at time of writing).

To replace the placeholder inventory at runtime, call `BMHI_ADS.configure()` with an array of partner objects before the post stage renders:

```js
BMHI_ADS.configure([
  {
    brand: 'Talkspace',
    tagline: 'Talk to a licensed therapist this week.',
    detail: 'Message, video, or phone. Covered by most insurance.',
    cta: 'Learn more',
    url: 'https://partner-landing.example/...',
    tint: 'sage' // sage | water | amber
  }
]);
```

Impression tracking is delegated to the partner's landing URL. BMHI itself writes nothing, reads nothing, and records no pixel.

---

## Hard constraints — do not violate

These exist for clinical and legal reasons. They are not preferences.

1. **Zero storage.** No cookies. No `localStorage`. No `sessionStorage`. No IndexedDB. If you believe you need persistence, you do not — re-read the Pennebaker research cited in `about.html`. Privacy is the mechanism.
2. **Welcome every visit.** The `Before you go.` screen is not a skip-able funnel step. It is the clinical handoff. Keep it.
3. **Every intervention ends.** There is no dark pattern here. The dismiss × is always visible, the post stage is always reachable, the jobs CTA always escapes the iframe.
4. **Never replace the jobs CTA copy.** "Show me better matches" and "back to job search" are the only approved phrasings. The strategy team banned "take a break" and "play a game" specifically because they break topic alignment with job search.
5. **Do not autoplay audio.** The ambient audio toggle must be user-initiated.
6. **Do not advertise anything outside the sponsored slot.** No product pitches from the surrounding job board during the intervention. No banner ads on the welcome screen. The frame is a clinical surface.
7. **Do not modify intervention copy** without clinical review. The closings, prompts, and phase labels were tuned with a PI and a founding NIMH director. Typo fixes fine; rewrites no.

---

## Safe extension points

These are things you can change without breaking the clinical design:

- `BMHI_CONFIG.jobsUrl` — where the post-intervention CTA sends users.
- `BMHI_ADS.configure([...])` — which partner ads render.
- The color palette in `:root` of `index.html` — as long as contrast ratios stay above 4.5:1.
- `delivery.js` iframe dimensions for the popup / embedded modes.
- Adding new intervention modules under `interventions/` — each module must register itself on `window.BMHI_INTERVENTIONS` with `{ id, name, tier, mechanism, evidence, time, render, cleanup }`. See any existing file for the contract.

---

## How the demo fits in

`public/embed.html` is a mock `thesejobs.net`-style job board. It loads `delivery.js` and wires the four mechanism buttons to a bottom control bar so a human can click through and see what each mechanism looks like in context.

If you are building a real integration, **look at `embed.html` only to understand how to call `BMHI_DELIVERY`**. Do not copy its job list, its search field, its color scheme, its controls, or its exit-intent toggle. You are building onto your own job board, not rebuilding the demo.

---

## Privacy posture (for your security team's review)

- No network requests from `app.js` other than the Google Fonts stylesheet load.
- No request to any first-party or third-party tracking endpoint from BMHI code.
- iframe breakout is one-directional: BMHI can navigate the top frame to `jobsUrl`, but reads nothing about the parent.
- `_headers` sets `X-Frame-Options` permissively on `index.html` (so iframe embedding works) and restrictively on `about.html` (no iframe). The permissive header is Netlify/Cloudflare syntax — replace with `Content-Security-Policy: frame-ancestors *` on hosts that don't honor it.
- The sponsored partner slot renders an `<a rel="sponsored noopener nofollow" target="_blank">` — no pixel, no prerender, no beacon.

---

## Open questions to route to product

If you hit any of these, escalate; don't guess:

- Rotating partner inventory server-side vs. at build time.
- Per-market jobsUrl (e.g. different default query per country or device).
- A/B testing which intervention fires first (currently pure random with late-night somatic weighting).
- Adding a second ad placement outside the post stage.

The product and clinical teams own those decisions.
