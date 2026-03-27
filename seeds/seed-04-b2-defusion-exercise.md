# SEED 04 — B2: Defusion Exercise (ACT-derived)
# BMHI Build Sequence · Session 4 of 18
# First Multi-Screen Intervention with Text Input

---

## WHAT EXISTS

Sessions 01–03 built: Foundation, A1–A3 (somatic tier), B1 (data reframe).
Pattern established: interventions register via `window.BMHI_INTERVENTIONS['ID']`.

---

## WHAT YOU ARE BUILDING

### B2: Defusion Exercise

From seed.md:
```
Mechanism:   Cognitive defusion — creating distance from self-critical thought
Evidence:    T2 (ACT literature; Hayes et al.)
Time:        2–3 minutes
Complexity:  Medium (requires text input)
```

This is a **three-screen sequence** — the first multi-step intervention:

**Screen 1:**
```
"Before you go — one quick thing."
"You may be having a thought like one of these:"

[Three tappable options]:
"I should have found something by now."
"I'm falling behind."
"Something must be wrong with me."
```

- Options are styled as cards/pills the user taps to select
- Only one can be selected (highlighted with amber border)
- After selection, 1s pause, then auto-advance to Screen 2

**Screen 2 (after selection):**
```
"That thought has visited a lot of people today.
 It's a thought — not a verdict.

 What's one thing that's still true about you
 that this search can't touch?"

[Text field, 60 chars max]
```

- Text field: serif font, centered, single-line input
- Placeholder hint fades in after 5s: "anything — even small"
- Privacy note above field: "This stays on your device. No one sees it."
- Submit on Enter or after 15s idle after typing

**Screen 3:**
```
[User's own words, displayed slightly enlarged]

"That's yours. The search can't take it."
```

- User's text displayed in serif, ~28px, warm white
- Below it, the closing line fades in after 2s
- Text is NEVER transmitted — client-side only (§4.5, §8.4)

### Transitions Between Screens

- Each screen fades out (0.8s) then next fades in (0.8s)
- Not abrupt — gentle, unhurried

Create: `/public/interventions/b2-defusion.js`

---

## KEY CLINICAL NOTE

The act of **naming** the distorted thought AND the **contradicting truth** IS the intervention. The text doesn't go anywhere. The mechanism is in the doing, not the data.

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register B2 in intervention registry
3. Add to suite navigator (Tier B — water blue)
4. Long Arc Protocol: Visit 6 → B2
5. Measurement: MHIL_ENGAGE should record `interaction_type: 'type'`, `text_input_chars: N` (count only, NO content)

---

## TESTING

1. Screen 1: three thought options render, one selectable at a time
2. Selection auto-advances to Screen 2
3. Text input works, 60 char limit enforced
4. Privacy note is visible
5. Screen 3 displays user's own words back to them
6. Closing text fades in after user's words are shown
7. Text is NEVER in any network request or storage
8. All three screens work at 375px mobile width
9. Measurement events record char count but NOT content

---

## WHAT THE NEXT SESSION BUILDS

Session 05 adds B3 (Cognitive Reappraisal) and B4 (Progress Mapping), completing Tier B.
