# SEED 03 — B1: The Data Reframe
# BMHI Build Sequence · Session 3 of 18
# First Cognitive Reframe Intervention

---

## WHAT EXISTS

Sessions 01–02 built the foundation and all Tier A (Somatic Reset):
- App shell, CSS design system, session management, measurement, router
- A1: Visual Breath Pacer, A2: Body Scan, A3: Two-Minute Reset
- Late-night routing to A3, suite navigator with tier tabs

---

## WHAT YOU ARE BUILDING

### B1: The Data Reframe

From seed.md:
```
Mechanism:   Normalization / external attribution of failure
Evidence:    T3 (attribution theory; psychoeducation literature)
Time:        30 seconds (read-only)
Complexity:  Minimal
```

This is Results Generation's **identity intervention** — a data company using data to reframe distress. It is on-brand and credible in a way that "chin up" language is not.

Implementation — a single informational card, no interaction required:

```
"A note before you go:

 There are currently fewer than 1 job opening per
 unemployed person in the US — the tightest ratio
 since 2018.

 A search that doesn't convert today is not a
 failure. It's arithmetic.

 The search is hard for everyone right now.
 You are in good company."

Source: BLS JOLTS Jan 2026
```

### Visual Design

- Card layout: left-aligned text within centered container (max-width 480px)
- Small italic prefix: "A note before you go:" (serif, dim color)
- Key statistic displayed large: the ratio number in mono font, amber color, ~48px
- Body text in serif, 18-24px, warm off-white, generous line-height (1.7)
- Emphasis (italic/bold) on "failure" and "arithmetic"
- Source footnote: mono, 9px, faint color
- Final line ("You are in good company") slightly larger, warmer
- Entire card fades in over 1.5s — no rush
- Auto-completes after ~15 seconds of display, then closing text
- Cognitive tier accent: water blue (#6a8fa7) for subtle border/accent

Create: `/public/interventions/b1-data-reframe.js`

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register B1 in intervention registry
3. Add B1 to suite navigator under Tier B (cognitive — water blue)
4. Long Arc Protocol: Visit 2 → B1

---

## KEY PRINCIPLE

This is a read-only intervention. No input, no buttons beyond dismiss. The user just reads. The reframe happens in the reading. Honor the simplicity — don't add interaction where none is needed.

---

## TESTING

1. B1 displays as a beautifully typeset card
2. Statistic number is prominent and legible
3. Source citation is subtle but present
4. Auto-completes after ~15s, transitions to post-intervention
5. Works at 375px mobile
6. Measurement events fire correctly

---

## WHAT THE NEXT SESSION BUILDS

Session 04 adds B2 (Defusion Exercise) — the first multi-screen intervention with user text input.
