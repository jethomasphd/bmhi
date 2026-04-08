# BMHI — Brief Mental Health Intervention Suite

A population-level behavioral health touchpoint for job seekers, grounded in 30+ years of peer-reviewed evidence. The most credible solution to the detection problem in mental health: reaching people at a documented moment of distress, without requiring them to seek help.

## Live

Deployed via Cloudflare Pages: [bmhi.pages.dev](https://bmhi.pages.dev)

## The Exit Window

Every week, 4.54 million people search for a job across this network and leave without clicking a single listing. That moment — the 2–4 minutes between the last search result and closing the browser — is the exit window. It is a temporally precise, behaviorally verified dose of a documented psychiatric stressor. This suite delivers brief, evidence-based interventions in that window.

The theory of change: **validated distress plus micro-agency**. Acknowledge what just happened was hard. Offer one small thing the person can do. Interrupt the learned helplessness spiral that repeated failed searches install.

## UX: Direct Suite Access

Users land directly on the full intervention suite — no landing page, no gate. The suite navigator is immediately visible at the bottom of the screen, organized by evidence tier. Users can freely browse all 22 interventions or let the Long Arc Protocol select the right one for their visit number and engagement history.

## Interventions (22 built, 6 tiers complete)

| ID | Name | Tier | Mechanism | Evidence |
|----|------|------|-----------|----------|
| A1 | Visual Breath Pacer | A · Somatic | Parasympathetic activation | T1 |
| A2 | Body Scan | A · Somatic | Somatic awareness interrupts rumination | T2 |
| A3 | Two-Minute Reset | A · Somatic | Parasympathetic + effort reattribution | T2 |
| B1 | Data Reframe | B · Cognitive | Normalization / external attribution | T3 |
| B2 | Defusion Exercise | B · Cognitive | ACT-derived cognitive defusion | T2 |
| B3 | Cognitive Reappraisal | B · Cognitive | Growth mindset framing | T2 |
| B4 | Progress Mapping | B · Cognitive | Progress visualization | T3 |
| C1 | One Small Thing | C · Behavioral | Implementation intention | T1 |
| C2 | Momentum Builder | C · Behavioral | Micro-mastery / behavioral activation | T2 |
| C3 | Network Nudge | C · Behavioral | Weak-tie network activation | T3 |
| D1 | 3-Sentence Release | D · Emotional | Expressive disclosure (Pennebaker) | T1 |
| D2 | Self-Compassion Mirror | D · Emotional | Self-compassion (Neff) | T2 |
| D3 | Gratitude | D · Emotional | Relationship-focused gratitude | T2 |
| D4 | Strength Anchor | D · Emotional | Identity protection under role-threat | T3 |
| E1 | Pattern Match | E · Flow | Rumination crowding (Russoniello) | T1 |
| E2 | Open Canvas | E · Flow | Expressive art / cortisol reduction | T3 |
| E3 | Meditative Blocks | E · Flow | Visuospatial rumination interruption (Holmes) | T1 |
| E4 | Meditative Serpent | E · Flow | Sustained attention / flow state (Csikszentmihalyi) | T1 |
| E5 | Rhythmic Breaker | E · Flow | Rhythmic tracking / parasympathetic activation | T2 |
| E6 | Mindful Garden | E · Flow | Nurturing activation / attention restoration (Kaplan) | T2 |
| F1 | Check-In Screen | F · SBIRT | Brief screening + referral pathway | T1 |
| F2 | Population Mirror | F · SBIRT | Social proof / loneliness buffering | T3 |

**22 interventions across 6 tiers. Long Arc Protocol (G1) sequences returning users. Complete.**

### Flow State Games (Tier E: E3–E6)

Four canvas-based games adapted from the RecursiveMarketing prototype, fully realized as standalone interventions with clinical documentation. All games share these design principles:

- **No score, no timer, no fail state** — performance pressure reactivates the stress response
- **Calming color palette** — desaturated earth tones from the BMHI design system
- **Floating affirmation words** — gentle text floats upward on interaction ("breathe", "you matter", "steady")
- **Auto-end after 120 seconds** — with graceful fade to closing message
- **Evidence-grounded** — each game's mechanism traces to peer-reviewed research

| Game | Mechanism | Key Citation |
|------|-----------|-------------|
| E3 · Meditative Blocks (Tetris) | Visuospatial processing blocks intrusive imagery | Holmes et al. 2009, 2010 |
| E4 · Meditative Serpent (Snake) | Sustained attention induces flow state | Csikszentmihalyi 1990; Russoniello 2009 |
| E5 · Rhythmic Breaker | Smooth pursuit eye tracking (EMDR-adjacent) | van den Hout & Engelhard 2012 |
| E6 · Mindful Garden | Tend-and-befriend + attention restoration | Taylor et al. 2000; Kaplan 1995 |

## Architecture

```
public/
  index.html                  ← App shell + full CSS design system
  about.html                  ← The science (position paper + 20 citations)
  app.js                      ← Core: session, measurement, router, state machine
  delivery.js                 ← Four delivery mechanisms (popup, popunder, embedded, email)
  embed.html                  ← Job site demo with delivery mechanism toggle
  _headers                    ← Cloudflare Pages security headers
  interventions/
    a1-breath-pacer.js        ← Tier A: Somatic Reset
    a2-body-scan.js
    a3-two-minute-reset.js
    b1-data-reframe.js        ← Tier B: Cognitive Reframe
    b2-defusion.js
    b3-reappraisal.js
    b4-progress-map.js
    c1-one-small-thing.js     ← Tier C: Behavioral Activation
    c2-momentum.js
    c3-network-nudge.js
    d1-release.js             ← Tier D: Emotional Processing
    d2-self-compassion.js
    d3-gratitude.js
    d4-strength-anchor.js
    e1-pattern-match.js       ← Tier E: Flow State
    e2-open-canvas.js
    e3-tetris.js              ← Tier E: Meditative Blocks (Tetris)
    e4-snake.js               ← Tier E: Meditative Serpent (Snake)
    e5-breaker.js             ← Tier E: Rhythmic Breaker (Brick Breaker)
    e6-garden.js              ← Tier E: Mindful Garden
    f1-checkin.js             ← Tier F: SBIRT Screening & Referral
    f2-population-mirror.js
docs/
  PILOT.md                    ← Phase 1 pilot configuration
  LAUNCH-CHECKLIST.md         ← Pre-launch verification checklist
```

## Core Systems

- **Direct Suite Access**: Users land directly on the full intervention suite with navigator — no landing page gate
- **Session Management**: 90-day first-party cookie, no PII, tracks visit count and engagement history
- **Measurement Framework**: MHIL event suite (TRIGGER, START, ENGAGE, CLOSE, RETURN) stored in sessionStorage — fully client-side, no server required
- **Intervention Router**: Long Arc Protocol (visit-sequenced deepening) with engagement-based rotation for visit 8+
- **Time-of-Day Awareness**: Late-night sessions (after 10pm) route to A3 priority
- **Privacy Architecture**: Text input NEVER transmitted or stored anywhere — cookie + localStorage only. Privacy is the mechanism, not just the policy (Pennebaker)
- **Zero Infrastructure**: No database, no server, no API keys. Pure static files. Embeddable on any web property via iframe or script tag.

## Deployment

Static site — no build step, no Node, no bundler, no backend. Any static host works.

```bash
# Cloudflare Pages (CLI)
wrangler pages deploy ./public --project-name bmhi

# Or connect GitHub repo in Cloudflare dashboard:
# Build output directory: public
# Build command: (leave empty)

# Or literally any static host:
# Netlify, Vercel, GitHub Pages, S3, nginx — just serve public/
```

## Embedding on Any Site

```html
<!-- Option 1: Popup on exit intent -->
<script src="https://bmhi.pages.dev/delivery.js"></script>
<script>
  BMHI_DELIVERY.setContext(jobsViewed, jobsClicked);
  BMHI_DELIVERY.enableExitIntent();
</script>

<!-- Option 2: Inline iframe -->
<iframe src="https://bmhi.pages.dev/?mode=embedded"
  style="width:100%;max-width:560px;height:600px;border:none;border-radius:12px;">
</iframe>
```

See `embed.html` for a full working demo of all four delivery mechanisms.

## Source Documents

| File | Description |
|------|-------------|
| `seed.md` | Full clinical specification (22 interventions, 6 tiers, measurement framework, ethical framework) |
| `exit_window_position_paper.html` | Academic position paper: the exit window as detection-problem solution |
| `companion_insel_summoning.html` | Dialogue with T.R. Insel, MD — clinical validation and measurement requirements |
| `rg_mental-health-intervention.html` | Strategic brief: the business case |

## Measurement

Events emitted per session (stored in sessionStorage, logged to console):

| Event | When | Key Data |
|-------|------|----------|
| `MHIL_TRIGGER` | Intervention fires | domain, visit_number, trigger_type, time_of_day |
| `MHIL_START` | Intervention displayed | intervention_id, mechanism_tier |
| `MHIL_ENGAGE` | User interaction | interaction_type, depth_score, text_input_chars |
| `MHIL_CLOSE` | Intervention ended | completion_status, referral_shown |
| `MHIL_RETURN` | User returns to site | days_since_last_visit, intervention_last_session |

**Primary outcome variable**: `return_visit_rate` by `intervention_id` x `visit_number`

All measurement is client-side. No server telemetry. When a backend is needed for aggregation, any analytics endpoint can ingest these events — the format is documented in `seed.md` §7.

## Ethical Framework

1. **Do no harm first** — every intervention acknowledges distress before offering reframe
2. **Never weaponize vulnerability** — monetization happens AFTER the intervention, never during
3. **Referral is not optional** — F1 screening fires for returning users; crisis resources always available
4. **Privacy is the mechanism** — if users don't trust it, they self-censor, and Pennebaker's cortisol mechanism fails
5. **This is not a medical device** — language is "supportive" not "therapeutic," "evidence-grounded" not "clinically proven"

## Clinical Framework

**PI:** Jacob E. Thomas, PhD — Department of Health Behavior, UT Austin; MA Clinical Psychology, Columbia University

**Clinical Framework:** Thomas R. Insel, MD — former Director, National Institute of Mental Health (2002–2015). SBIRT model, detection-first approach, measurement-based care.

*"If you don't measure it, you didn't do it."* — T.R. Insel

*"They searched today. They found nothing. Give them something."* — T.R. Insel, March 2026
