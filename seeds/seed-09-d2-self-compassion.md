# SEED 09 — D2: Self-Compassion Mirror (Neff-derived)
# BMHI Build Sequence · Session 9 of 18

---

## WHAT EXISTS

Sessions 01–08 built: Foundation, Tier A, Tier B, Tier C, D1 (Release).

---

## WHAT YOU ARE BUILDING

### D2: Self-Compassion Mirror

From seed.md:
```
Mechanism:   Self-compassion intervention — reduces self-critical
             rumination more effectively than positive self-talk
Evidence:    T2 (Neff; self-compassion scale literature)
Time:        3 minutes
Complexity:  Medium
```

A two-screen sequence that uses the user's own compassion for others as a mirror for self-compassion.

**Screen 1:**
```
"Imagine your closest friend just texted you:

 'I spent the afternoon job searching.
  Found nothing. Feel like a failure.'

 What would you say back to them?"

[Text field]
```

- The "friend's text" is styled like a text message (subtle bubble, slightly different background)
- Text field below for the user's response
- Serif font, generous sizing, warm tones
- No character limit but single-line feel encouraged
- Privacy note: text stays on device

**Screen 2 (after response, or 45s):**
```
[User's response displayed prominently]

"Now — read that again.
 It was written for you."
```

- User's own words displayed large (serif, ~24px, warm white)
- Pause of 2 seconds, then the reveal line fades in below
- The reveal ("It was written for you") is the psychological pivot
- Emotional tier accent: rose (#b07a7a)
- Let the moment breathe — no rush to close

Create: `/public/interventions/d2-self-compassion.js`

---

## CLINICAL NOTE

Self-compassion interventions (Neff) outperform positive self-talk because they bypass the credibility problem. People reject generic affirmations ("You're great!") but readily offer genuine compassion to friends. This mirror technique uses that asymmetry.

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register D2 in intervention registry
3. Long Arc Protocol: Visit 7 → D2 (deepest empathy, comes latest)
4. Add to suite navigator (Tier D — rose)

---

## TESTING

1. Screen 1: friend's "text" displays in message-bubble style
2. Text field works for user response
3. Transition to Screen 2 is gentle (fade)
4. User's own words displayed back prominently
5. Reveal line fades in after 2s pause
6. No text transmitted or stored
7. Works at 375px mobile

---

## WHAT THE NEXT SESSION BUILDS

Session 10 adds D3 (Gratitude) and D4 (Strength Anchor), completing Tier D.
