# SEED 10 — D3: Gratitude Micro-Exercise + D4: Strength Anchor
# BMHI Build Sequence · Session 10 of 18
# Completes Tier D: Emotional Processing

---

## WHAT EXISTS

Sessions 01–09 built: Foundation, Tier A, Tier B, Tier C, D1, D2.

---

## WHAT YOU ARE BUILDING

### D3: Gratitude Micro-Exercise (specificity variant)

From seed.md:
```
Mechanism:   Relationship-focused gratitude (Emmons literature)
Evidence:    T2
Time:        60 seconds
Complexity:  Minimal
```

**NOT "list 3 things you're grateful for."** Specificity is the active ingredient.

```
"Name one specific person who has your back
 right now. Not what they do — who they are."

[Single text field]

After input: "That person exists.
              That's not nothing."
```

- Single text field, serif, centered
- The prompt emphasis is on "specific" and "who they are"
- Closing text fades in after input (or after 30s if no input)
- For isolated users (detected via return visit pattern with no network nudge engagement), this may surface crisis referral info quietly — but implement this connection in Session 13 (F1 integration)

Create: `/public/interventions/d3-gratitude.js`

### D4: The Strength Anchor

From seed.md:
```
Mechanism:   Strengths-based psychology; identity protection under role-threat
Evidence:    T3 (Seligman PERMA; job search identity literature)
Time:        60 seconds
Complexity:  Low
```

```
"This search didn't go the way you wanted.

 But what's one thing you're genuinely good at —
 that no search result can touch?"

[Text field]
```

- For returning users: previous answers surfaced below the prompt in small text
- "You said this before: '[previous response]' — Still true."
- Store responses in localStorage: `bmhi_strengths` (array of strings, max 5)
- New response adds to the array
- Display previous responses only if they exist
- Privacy note: stored only on their device

Create: `/public/interventions/d4-strength-anchor.js`

---

## INTEGRATION

1. Add `<script>` tags for both in `index.html`
2. Register D3 and D4 in intervention registry
3. Add to suite navigator (Tier D — rose #b07a7a)
4. D4 localStorage key: `bmhi_strengths`
5. Suite navigator should now show complete tiers A, B, C, D

---

## TESTING

1. D3 displays prompt, text field works, closing shows after input
2. D4 displays prompt with text field
3. D4 stores response in localStorage
4. D4 shows previous responses on subsequent visits/demo views
5. Both work at 375px mobile
6. Privacy guarantees maintained

---

## WHAT THE NEXT SESSION BUILDS

Session 11 adds E1 (Pattern Match Micro-Game) — the first flow state intervention.
