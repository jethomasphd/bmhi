# BMHI — Brief Mental Health Intervention Suite

A population-level behavioral health touchpoint for job seekers, grounded in 30+ years of peer-reviewed evidence.

## What This Is

Evidence-based micro-interventions delivered at the exact moment a job search session ends without a click. Designed for the 4.54M weekly zero-click exits across 292+ job search domains.

## Live

Deployed via Cloudflare Pages: [bmhi.pages.dev](https://bmhi.pages.dev)

## Interventions Built

| ID | Name | Tier | Mechanism | Evidence |
|----|------|------|-----------|----------|
| A1 | Visual Breath Pacer | Somatic | Parasympathetic activation | T1 |
| A2 | Body Scan | Somatic | Somatic awareness interrupts rumination | T2 |
| A3 | Two-Minute Reset | Somatic | Parasympathetic + effort reattribution | T2 |
| B1 | Data Reframe | Cognitive | Normalization / external attribution | T3 |
| B2 | Defusion Exercise | Cognitive | ACT-derived cognitive defusion | T2 |
| B3 | Cognitive Reappraisal | Cognitive | Growth mindset framing | T2 |
| B4 | Progress Mapping | Cognitive | Progress visualization | T3 |
| C1 | One Small Thing | Behavioral | Implementation intention | T1 |

## Architecture

```
public/
  index.html                  ← App shell + full CSS design system
  app.js                      ← Core engine: session, measurement, router
  interventions/
    a1-breath-pacer.js
    a2-body-scan.js
    a3-two-minute-reset.js
    b1-data-reframe.js
    b2-defusion.js
    b3-reappraisal.js
    b4-progress-map.js
    c1-one-small-thing.js
```

## Deployment

Static site — no build step. Cloudflare Pages serves `public/` directly.

```bash
# CLI deploy
wrangler pages deploy ./public --project-name bmhi
```

## Clinical Framework

PI: J.E. Thomas, PhD · Clinical Framework: T.R. Insel, MD (SBIRT / Detection-First / Measurement-Based Care)

See `seed.md` for the full specification.
