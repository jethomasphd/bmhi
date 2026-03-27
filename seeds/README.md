# BMHI Build Sequence — 18 Sessions

## How to Use These Seeds

Each seed file is a self-contained assignment for a coding agent session. Run them **in order** — each builds on the previous.

### Sequence Overview

| # | Seed File | What It Builds | Key Files Created |
|---|-----------|---------------|-------------------|
| 01 | `seed-01-foundation-a1-breath-pacer.md` | App shell, CSS, session mgmt, measurement skeleton, A1 | `public/index.html`, `public/app.js`, `public/interventions/a1-breath-pacer.js` |
| 02 | `seed-02-a2-body-scan-a3-reset.md` | Body Scan + Two-Minute Reset (completes Tier A) | `a2-body-scan.js`, `a3-two-minute-reset.js` |
| 03 | `seed-03-b1-data-reframe.md` | Data Reframe (first cognitive intervention) | `b1-data-reframe.js` |
| 04 | `seed-04-b2-defusion-exercise.md` | Defusion Exercise — first multi-screen with text input | `b2-defusion.js` |
| 05 | `seed-05-b3-reappraisal-b4-progress.md` | Cognitive Reappraisal + Progress Mapping (completes Tier B) | `b3-reappraisal.js`, `b4-progress-map.js` |
| 06 | `seed-06-c1-one-small-thing.md` | One Small Thing (first behavioral activation) | `c1-one-small-thing.js` |
| 07 | `seed-07-c2-momentum-c3-network.md` | Momentum Builder + Network Nudge (completes Tier C) | `c2-momentum.js`, `c3-network-nudge.js` |
| 08 | `seed-08-d1-pennebaker-release.md` | 3-Sentence Release — highest-evidence emotional intervention | `d1-release.js` |
| 09 | `seed-09-d2-self-compassion.md` | Self-Compassion Mirror | `d2-self-compassion.js` |
| 10 | `seed-10-d3-gratitude-d4-strength.md` | Gratitude + Strength Anchor (completes Tier D) | `d3-gratitude.js`, `d4-strength-anchor.js` |
| 11 | `seed-11-e1-pattern-match-game.md` | Pattern Match Micro-Game (first flow state) | `e1-pattern-match.js` |
| 12 | `seed-12-e2-open-canvas.md` | Open Canvas drawing (completes Tier E) | `e2-open-canvas.js` |
| 13 | `seed-13-f1-checkin-f2-population.md` | SBIRT Check-In + Population Mirror (Tier F) | `f1-checkin.js`, `f2-population-mirror.js` |
| 14 | `seed-14-g1-long-arc-protocol.md` | Returning user sequence engine | Modifies `app.js` |
| 15 | `seed-15-delivery-mechanisms.md` | Popup, pop-under, embedded, email trigger | `delivery.js`, `embed.html` |
| 16 | `seed-16-cloudflare-worker-measurement.md` | Backend: events, email, population counter | `worker/src/index.js`, `worker/wrangler.toml` |
| 17 | `seed-17-demo-mode-polish.md` | Suite navigator, transitions, accessibility, polish | Modifies all files |
| 18 | `seed-18-deployment-documentation.md` | Cloudflare Pages deploy, README, launch checklist | `README.md`, `docs/` |

### For Each Session

1. Point the coding agent at the seed file: `seeds/seed-NN-*.md`
2. Also point it at `/seed.md` (the master specification) for full context
3. Also point it at `/RecursiveMarketing-main/public/mhi/` for aesthetic reference
4. The agent builds what the seed describes and commits
5. Move to the next seed

### Reference Files

- `/seed.md` — Master clinical specification (always provide as context)
- `/RecursiveMarketing-main/public/mhi/index.html` — UI aesthetic reference
- `/RecursiveMarketing-main/public/mhi/app.js` — Interaction pattern reference
- `/RecursiveMarketing-main/public/mhi/games.js` — Game implementation reference
- `/rg_mental-health-intervention.html` — Data visualization / pitch deck reference

### Architecture Pattern

All interventions follow this registration pattern:

```javascript
(function() {
  window.BMHI_INTERVENTIONS = window.BMHI_INTERVENTIONS || {};
  window.BMHI_INTERVENTIONS['XX'] = {
    id: 'XX',
    name: 'Intervention Name',
    tier: 'X',          // A-F
    mechanism: '...',
    evidence: 'T1-T4',
    time: '60s',
    render: function(container) { /* build DOM, start */ },
    cleanup: function() { /* clear timers, remove listeners */ }
  };
})();
```

The core engine (`app.js`) handles:
- Session management (cookie, visit count, engagement history)
- Intervention routing (Long Arc Protocol)
- Measurement event emission
- Stage transitions (landing → intervention → post)
- Demo mode (suite navigator)
