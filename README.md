# BMHI — Brief Mental Health Intervention Suite

A population-level behavioral health touchpoint for job seekers, grounded in 30+ years of peer-reviewed evidence. The most credible solution to the detection problem in mental health: reaching people at a documented moment of distress, without requiring them to seek help.

## Live

Deployed via Cloudflare Pages: [bmhi.pages.dev](https://bmhi.pages.dev)

## The Exit Window

Every week, 4.54 million people search for a job across this network and leave without clicking a single listing. That moment — the 2–4 minutes between the last search result and closing the browser — is the exit window. It is a temporally precise, behaviorally verified dose of a documented psychiatric stressor. This suite delivers brief, evidence-based interventions in that window.

The theory of change: **validated distress plus micro-agency**. Acknowledge what just happened was hard. Offer one small thing the person can do. Interrupt the learned helplessness spiral that repeated failed searches install.

## Interventions (18 built, 6 tiers complete)

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
| F1 | Check-In Screen | F · SBIRT | Brief screening + referral pathway | T1 |
| F2 | Population Mirror | F · SBIRT | Social proof / loneliness buffering | T3 |

**Remaining:** Final polish and integration testing.

## Architecture

```
public/
  index.html                  ← App shell + full CSS design system
  about.html                  ← The science (position paper + citations)
  app.js                      ← Core: session, measurement, router, state machine
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
    f1-checkin.js             ← Tier F: SBIRT Screening & Referral
    f2-population-mirror.js
```

## Core Systems

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
| `seed.md` | Full clinical specification (20 interventions, 8 tiers, measurement framework, ethical framework) |
| `exit_window_position_paper.html` | Academic position paper: the exit window as detection-problem solution |
| `companion_insel_summoning.html` | Dialogue with T.R. Insel, MD — clinical validation and measurement requirements |
| `rg_mental-health-intervention.html` | Strategic brief: the business case |

## Clinical Framework

**PI:** Jacob E. Thomas, PhD — Department of Health Behavior, UT Austin; MA Clinical Psychology, Columbia University

**Clinical Framework:** Thomas R. Insel, MD — former Director, National Institute of Mental Health (2002–2015). SBIRT model, detection-first approach, measurement-based care.

*"If you don't measure it, you didn't do it."* — T.R. Insel

*"They searched today. They found nothing. Give them something."* — T.R. Insel, March 2026
