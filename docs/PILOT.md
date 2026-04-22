# Pilot Configuration — Phase 1

## Proof of Mechanism (4 weeks)

| Parameter | Value |
|-----------|-------|
| **Domains** | thesejobs.net, jobcafes.com |
| **Population** | ~12,588 recoverable exits/week |
| **Delivery** | Inline iframe embed |
| **Interventions** | 17 interventions, randomly selected per page load |
| **Storage** | None — zero cookies, zero localStorage, zero tracking |
| **Success Criteria** | Qualitative feedback; dwell time on intervention iframe |

## Trigger Logic

```
EVENT:     User exhibits exit intent or scrolls past job listings
CONDITION: Intervention iframe loads inline between listings
ACTION:    Random intervention selected, welcome screen shown
```

The intervention fires for all users viewing the page. No behavioral targeting. No A/B cookie. No session tracking.

## Measurement

Because the suite stores nothing, measurement happens at the hosting layer:
- **Iframe load count** — standard server logs on the host
- **Time on page** — hosting analytics (if enabled)
- **Qualitative feedback** — optional survey link post-intervention

## Phase 2 — Intervention Comparison (8 weeks)

Expand to 10 domains. Add hosting-layer analytics to compare dwell time across intervention categories (somatic vs. cognitive vs. flow state).

## Phase 3 — Partner Conversations

With Phase 1-2 data in hand:
- Approach BetterHelp / Talkspace with CPL proposal
- Approach UT Austin iSchool with study design
- Approach clinical collaborators with co-authorship framework
