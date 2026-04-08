# SEED 08 — D1: The 3-Sentence Release (Pennebaker-derived)
# BMHI Build Sequence · Session 8 of 18
# Highest-Evidence Emotional Processing Intervention

---

## WHAT EXISTS

Sessions 01–07 built: Foundation, Tier A, Tier B, Tier C complete.

---

## WHAT YOU ARE BUILDING

### D1: The 3-Sentence Release

From seed.md:
```
Mechanism:   Expressive disclosure — cortisol reduction,
             immune function improvement, distress processing
Evidence:    T1 (Pennebaker; 30+ years, replicated cross-culturally)
Time:        3–4 minutes
Complexity:  Low-medium
```

**This is the highest-evidence, highest-depth intervention in the entire suite.**

Implementation:

```
Opening: "You don't have to send this anywhere.
          No one will read it. Not even us."

Prompt: "Write 3 sentences about how today's
         search made you feel."

[Text area — large, generous padding, no character limit,
 warm background color, no submit button visible]

After ≥3 sentences detected (or 90 seconds):
A single button appears: [Let it go]

On click: text dissolves.
Final screen: "Gone. You named it. That's enough."
```

### Critical Implementation Details

**Privacy is the mechanism, not just the policy (§8.4):**
- Text is NEVER transmitted or stored — client-side only
- If users believe it's being read, they self-censor, and the mechanism fails
- State this clearly at the opening
- No network requests during this intervention — enforce this

**Sentence detection:**
- Count periods, exclamation marks, question marks, or newlines
- After 3+ sentence-enders detected, show the [Let it go] button
- Also show it after 90 seconds regardless (partial completion is valid)

**The dissolution animation is NOT decorative — it completes the ritual of release:**
```css
.mhi-textarea.dissolving {
  opacity: 0;
  transform: scale(0.98);
  filter: blur(4px);
  transition: opacity 3s ease, transform 3s ease, filter 3s ease;
}
```
- Text blurs and fades over 3 full seconds
- During dissolution, background very subtly lightens
- After dissolution complete, "Gone." appears in the empty space
- Then "You named it. That's enough." fades in below

**Visual design:**
- Emotional tier accent: rose (#b07a7a)
- Text area: large (min-height 160px), warm background (slightly lighter than page bg)
- No character counter, no word count — remove all metacognition about the writing
- Generous padding all around
- The "Let it go" button: serif, italic, amber, pill-shaped, fades in gently

Create: `/public/interventions/d1-release.js`

---

## CLINICAL NOTE FROM SEED.MD

The Pennebaker disclosure paradigm has been replicated for 30+ years across cultures. The mechanism works because:
1. Naming an emotion reduces amygdala activation
2. The act of structured writing creates narrative coherence from distress
3. The ritual of release (dissolution) provides psychological closure

All three steps must be present. Do not skip the dissolution.

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register D1 in intervention registry
3. Add to suite navigator (Tier D — rose #b07a7a)
4. Long Arc Protocol: Visit 5 → D1
5. Measurement: MHIL_ENGAGE records `interaction_type: 'type'`, `text_input_chars: N`, `depth_score: 3` if dissolution completed

---

## TESTING

1. Privacy statement displays clearly at opening
2. Text area is large, warm, inviting
3. No submit button visible initially
4. [Let it go] appears after 3 sentences or 90 seconds
5. Dissolution animation is smooth, 3 seconds, includes blur
6. "Gone." and closing text appear after dissolution
7. Text is verifiably NOT in localStorage, sessionStorage, or any network request
8. Works at 375px — text area fills width, comfortable thumb typing
9. Partial completion (typing but not finishing) still records engagement

---

## WHAT THE NEXT SESSION BUILDS

Session 09 adds D2 (Self-Compassion Mirror) — the deepest empathy intervention.
