# SEED 01 — Foundation + A1: Visual Breath Pacer
# BMHI Build Sequence · Session 1 of 18
# Principal Investigator: J.E. Thomas, PhD

---

## WHAT YOU ARE BUILDING

You are building the **foundation** of the Brief Mental Health Intervention (BMHI) suite — a single-page web application that delivers evidence-based micro-interventions to job seekers at their moment of greatest vulnerability: when a search session ends without a click.

This first session establishes:
1. The **application shell** (HTML + CSS design system)
2. The **session management** system (cookie-based visit tracking)
3. The **measurement framework** (event emission skeleton)
4. The **intervention router** (dispatches to the right intervention)
5. The **first intervention**: A1 — Visual Breath Pacer

---

## CONTEXT — WHY THIS MATTERS

Read `/seed.md` in the repo root for the full clinical specification. Key facts:

- **Population**: ~4.54M zero-click job search exits per week
- **Intervention window**: 2–4 minutes
- **This is not a wellness feature** — it is a population-level behavioral health touchpoint
- The person on the other side searched for a job and found nothing
- They may have been searching for weeks

---

## REFERENCE IMPLEMENTATION

Study `/RecursiveMarketing-main/public/mhi/` for the aesthetic and interaction patterns:
- `index.html` — Contemplative, Eastern-inspired UI with cinematic reveal
- `app.js` — State machine: landing → breath → game → search
- `games.js` — Four meditative mini-games (tetris, snake, breaker, garden) with no fail states, no scores, calming palettes

The BMHI suite shares this aesthetic DNA but diverges in purpose: instead of games leading to job search, we deliver **clinical micro-interventions** organized by psychological mechanism.

---

## VISUAL DESIGN SYSTEM (from seed.md §5)

```
Background:  #1a1612 (warm dark, NOT cold dark)
Text:        #f0ece4 (warm off-white)
Accent:      #c4922a (muted amber — calmer than RG orange)
Sage:        #7a9e8e (for somatic/breath interventions)
Water:       #6a8fa7 (cognitive)
Clay:        #b8856e (behavioral)
Rose:        #b07a7a (emotional)
Plum:        #8e7299 (flow state)

Typography:
  Serif:  Cormorant Garamond — primary prompts (signals "slow down")
  Sans:   Inter — UI elements
  Mono:   JetBrains Mono — data/stats

Animation:   600ms+ transitions. Nothing snappy.
Spacing:     Generous. White space IS the intervention.
Container:   max-width: 560px, centered.
```

---

## FILE STRUCTURE

Build everything under `/public/`:

```
public/
  index.html          ← App shell + all CSS
  app.js              ← Core engine: session, router, measurement, landing
  interventions/
    a1-breath-pacer.js  ← First intervention (this session)
```

Future sessions will add files to `interventions/` and register them in `app.js`.

---

## ARCHITECTURE TO BUILD

### 1. Application Shell (`index.html`)

Single HTML file with:
- Full CSS design system (all variables, all shared component styles)
- Google Fonts: Cormorant Garamond, Inter, JetBrains Mono
- Mobile-first responsive (375px minimum, per §4.7)
- Dismiss button (always visible, per §4.3)
- Audio toggle (optional ambient, never autoplay, per §4.8)
- Three stage containers:
  - `#stageLanding` — cinematic opening
  - `#stageIntervention` — where interventions render
  - `#stagePost` — post-intervention (completion message + optional partner CTA)
- Suite navigator bar (for demo mode — lets users browse all interventions)
- `<script>` tags loading app.js and intervention files
- `prefers-reduced-motion` media query support

Use the existing `/public/index.html` as a starting point — it already has much of this CSS. Improve and complete it.

### 2. Core Engine (`app.js`)

```javascript
// Module structure:
(function() {
  'use strict';

  // ═══ SESSION MANAGEMENT ═══
  // Cookie-based, 90-day, no PII (per §2.3)
  // Tracks: visit_number, last_visit_date, engagement_history[]
  // Functions: getSession(), updateSession(), getVisitNumber()

  // ═══ MEASUREMENT FRAMEWORK ═══
  // Event emission per §7
  // Events: MHIL_TRIGGER, MHIL_START, MHIL_ENGAGE, MHIL_CLOSE, MHIL_RETURN
  // For now: emit to console.log and store in sessionStorage
  // Future session will add Cloudflare Worker endpoint

  // ═══ INTERVENTION REGISTRY ═══
  // window.BMHI_INTERVENTIONS = {}
  // Each intervention registers itself:
  //   { id, name, tier, mechanism, evidence, time, complexity,
  //     render(container), cleanup() }

  // ═══ INTERVENTION ROUTER ═══
  // For normal mode: follows Long Arc Protocol (§G1):
  //   Visit 1: A1, Visit 2: B1, Visit 3: C1, etc.
  // For demo mode: user picks from suite navigator
  // Function: selectIntervention(visitNumber, history) → interventionId

  // ═══ LANDING ═══
  // Cinematic reveal sequence (like /mhi but calmer)
  // Enso circle draws, then text fades in line by line
  // "Begin" button → transition to selected intervention
  // "Explore the full suite" → demo mode with navigator

  // ═══ STATE MACHINE ═══
  // States: landing → intervention → post
  // Always dismissible (§4.3)
  // Partial completion still counts (§4.6)

  // ═══ TIME-OF-DAY AWARENESS ═══
  // Detect morning/afternoon/evening/late-night
  // Late-night (after 10pm) → priority route to A3 (§A3 special use)
})();
```

### 3. A1: Visual Breath Pacer (`interventions/a1-breath-pacer.js`)

From seed.md §A1:
```
Mechanism:   Parasympathetic activation via paced breathing
Evidence:    T1 (HRV studies; box breathing literature)
Time:        60–90 seconds
Complexity:  Low
```

Implementation:
- Animated circle: expands (inhale 4s) → holds (4s) → contracts (exhale 6s)
- Use CSS transitions with ease-in-out (NEVER linear)
- Color: sage green (`#7a9e8e`)
- **NO instruction text during breathing** — text breaks parasympathetic activation by engaging the language center
- At the final beat, a single line fades in: *"You searched today. That counts."*
- Auto-completes after 3 full cycles (~42 seconds) or user can stay longer
- Ambient tone: optional, user-initiated only

```javascript
// Registration pattern for all future interventions:
(function() {
  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};
  window.BMHI_INTERVENTIONS['A1'] = {
    id: 'A1',
    name: 'Visual Breath Pacer',
    tier: 'A',
    mechanism: 'Parasympathetic activation via paced breathing',
    evidence: 'T1',
    time: '60–90s',
    render: function(container) {
      // Build DOM, start animation cycle
      // Return cleanup function
    },
    cleanup: function() {
      // Clear timers, remove listeners
    }
  };
})();
```

---

## UX PRINCIPLES (non-negotiable, from §4)

1. **Honor the weight** — never open cheerful. Quiet, warm, unhurried.
2. **One thing only** — one prompt, one action, one experience per intervention.
3. **Always dismissible** — visible close button at all times.
4. **No performance pressure** — no scores, no fail states.
5. **Private by default** — text never transmitted unless consented.
6. **Completion not required** — partial is still an intervention.
7. **Mobile first** — works at 375px with one thumb.
8. **Ambient sound optional** — never autoplay.

---

## LANDING SEQUENCE

The cinematic reveal (inspired by /mhi but adapted for BMHI):

```
t=0ms      Background gradient fades in
t=800ms    Enso circle draws (3s animation)
t=3000ms   "Before you go." fades in (serif, large)
t=5000ms   "You searched today." (serif, italic, dim)
t=6500ms   "That counts." (serif, italic, dim)
t=8500ms   Brief explanatory note (sans, small, faint)
t=10000ms  "Take what you need." (serif, amber)
t=12000ms  [Begin] button fades in
t=13000ms  "explore the full suite" link fades in
```

---

## TESTING

When complete, opening `index.html` in a browser should:
1. Show the cinematic landing sequence
2. Clicking "Begin" transitions to A1 (Breath Pacer)
3. The breath circle animates through inhale/hold/exhale cycles
4. After ~42s (or dismiss), closing text appears
5. Transition to post-intervention stage
6. Console shows MHIL_TRIGGER, MHIL_START, MHIL_ENGAGE, MHIL_CLOSE events
7. Cookie stores visit count
8. "Explore the full suite" shows navigator (only A1 available for now)
9. Everything works at 375px mobile width
10. Dismiss button works at any point

---

## WHAT THE NEXT SESSION BUILDS

Session 02 will add A2 (Body Scan) and A3 (Two-Minute Reset), completing the Somatic Reset tier. It will register them in the intervention router and add their tabs to the suite navigator.

---

*Build with care. The person on the other side of the screen searched for a job and found nothing.*
