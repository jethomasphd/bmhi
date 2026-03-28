# Pilot Configuration — Phase 1

## Proof of Mechanism (4 weeks)

| Parameter | Value |
|-----------|-------|
| **Domains** | thesejobs.net, jobcafes.com |
| **Population** | ~12,588 recoverable exits/week |
| **Delivery** | POPUP (primary), EMBEDDED (holdout) |
| **Interventions** | A1, B1, D1, E1 (one per session, rotating) |
| **Measurement** | Client-side MHIL event suite (sessionStorage + console) |
| **Success Criteria** | >=15% completion rate; no decline in return visit rate vs. baseline |

## Trigger Logic

```
EVENT:     User exhibits exit intent (mouseleave toward browser chrome)
CONDITION: User has viewed >= 1 job listing AND clicked 0 jobs
           AND session duration >= 45 seconds (real user, not bot)
ACTION:    Delivery mechanism fires, intervention selected per Long Arc Protocol
```

The intervention fires ONLY on zero-click exits. Active job seekers (those who clicked >= 1 job) are NEVER shown the intervention.

## Long Arc Sequence (Visit Progression)

| Visit | Intervention | Rationale |
|-------|-------------|-----------|
| 1 | A1 — Breath Pacer | Easiest, lowest ask. A3 if after 10pm. |
| 2 | B1 — Data Reframe | Normalize the experience |
| 3 | C1 — One Small Thing | Micro-agency |
| 4 | F1 Check-In + curated | First screening (SBIRT) |
| 5 | D1 — 3-Sentence Release | First emotional depth |
| 6 | B2 — Defusion Exercise | Cognitive work |
| 7 | D2 — Self-Compassion Mirror | Deepest empathy |
| 8+ | Engagement-based rotation | Tier-aware, no back-to-back repeats |

## Measurement Variables

**Primary outcome** (Insel's insistence):
`return_visit_rate` by `intervention_id` x `visit_number`

**Secondary outcome**:
`job_click_on_return_session` by `intervention_id`

**Engagement scoring**:
- Completion = 2 pts
- Text input = 3 pts
- Return visit within 7 days = 2 pts
- Same intervention type twice = route elsewhere

## Phase 2 — Intervention Comparison (8 weeks)

Expand to 10 domains. Add B2, C1, D2, F1. Full A/B across mechanism tiers.

## Phase 3 — Partner Conversations

With Phase 1-2 data in hand:
- Approach BetterHelp / Talkspace with CPL proposal
- Approach UT Austin iSchool with study design
- Approach clinical collaborators with co-authorship framework
