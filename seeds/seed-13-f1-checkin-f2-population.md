# SEED 13 — F1: Check-In Screen + F2: Population Mirror
# BMHI Build Sequence · Session 13 of 18
# SBIRT Screening & Referral Layer

---

## WHAT EXISTS

Sessions 01–12 built: Foundation, Tiers A–E complete (14 interventions).

---

## WHAT YOU ARE BUILDING

### F1: The Check-In Screen (SBIRT Model)

From seed.md:
```
Mechanism:   SBIRT — brief screening, open referral pathway
Evidence:    T1 (SBIRT literature in emergency medicine,
             adapted for digital contexts)
Time:        15 seconds
Complexity:  Low
Trigger:     Fires for returning users on visit ≥4 with
             zero-click record on all previous visits
```

**THIS IS AN ETHICAL REQUIREMENT, NOT A PRODUCT FEATURE.**

Implementation:
```
"How are you feeling after today's search?"

[5-point emoji scale: very low → low → neutral → good → great]

Score 4–5: No action. Continue to standard intervention.
Score 3:   Warm acknowledgment: "Thank you for checking in."
Score 1–2: Quiet referral card appears BELOW main intervention:

  "Some searches hit harder than others.
   If you want to talk to someone, here are free options:"

  [Crisis Text Line: Text HOME to 741741]
  [SAMHSA Helpline: 1-800-662-4357]
  [988 Suicide & Crisis Lifeline: Call or text 988]
```

**Critical clinical notes from seed.md §8:**
- DO NOT replace the intervention with a crisis screen
- SBIRT layers screening ONTO brief intervention, not instead of it
- The person chose to stay — honor that
- The referral is an addition, not a substitution

**Emoji scale implementation:**
- 5 circular buttons with emoji/icons
- Scale: deeply struggling → struggling → neutral → okay → good
- Use simple faces, not complex emoji (for cross-platform consistency):
  - Consider using SVG faces or simple text: 😞 😟 😐 🙂 😊
- Tapping one selects it (amber highlight)
- After selection, brief pause (1s), then either acknowledgment or referral + intervention

**Referral card:**
- Appears below the main intervention content
- Subtle, not alarming — rose background (#b07a7a at very low opacity)
- Links are tappable (tel: and sms: protocols where applicable)
- Card fades in gently, never pops

**F1 is a LAYER, not a standalone intervention.** It fires BEFORE the selected intervention on visit ≥4. The flow is: F1 screen → user taps emoji → selected intervention runs → if score 1-2, referral card appended below.

Create: `/public/interventions/f1-checkin.js`

### F2: The Population Mirror

From seed.md:
```
Mechanism:   Social proof; loneliness buffering; normalization at scale
Evidence:    T3
Time:        20 seconds (read-only)
Complexity:  Minimal
```

```
"You weren't searching alone today.

 [4,536,963] people used a job site today
 without clicking a single listing.

 The search is hard for everyone right now.
 You are in good company."
```

- The number should animate in (count up from 0 over 2s, using mono font, amber)
- Number can be static or fetched from a worker endpoint (future session)
- For now: use a realistic static number (4.54M ÷ 7 ≈ 648,138 daily)
- The number is the emotional payload — make it visually prominent
- Read-only, no interaction

Create: `/public/interventions/f2-population-mirror.js`

---

## INTEGRATION

1. Add `<script>` tags for both in `index.html`
2. Register F1 and F2 in intervention registry
3. F1 is special — it's a **pre-layer**, not a standalone intervention
   - Add a `preIntervention` hook to the router that checks visit ≥ 4
   - F1 renders first, then the selected intervention renders after user responds
4. F2 is a standalone intervention, add to suite navigator
5. Long Arc Protocol: Visit 4 → F1 + standard intervention
6. Measurement: F1 records the emoji score (1-5) and whether referral was shown/clicked

---

## TESTING

1. F1 displays emoji scale, one selectable at a time
2. Score 4-5: moves to intervention, no referral
3. Score 1-2: referral card appears with correct contact info
4. Referral links are tappable (tel:, sms:)
5. F1 does NOT replace the intervention — both appear
6. F2 number animates counting up
7. F2 closing text is warm and normalizing
8. Both work at 375px mobile
9. F1 fires only on visit ≥ 4 (test with cookie manipulation)
10. In demo mode, F1 can be triggered manually via suite navigator

---

## WHAT THE NEXT SESSION BUILDS

Session 14 adds G1 (Long Arc Protocol) — the returning user sequence engine.
