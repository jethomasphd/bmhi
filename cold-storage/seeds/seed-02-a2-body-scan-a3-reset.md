# SEED 02 — A2: Body Scan + A3: Two-Minute Reset
# BMHI Build Sequence · Session 2 of 18
# Completes Tier A: Somatic Reset

---

## WHAT EXISTS

Session 01 built:
- `/public/index.html` — App shell with full CSS design system
- `/public/app.js` — Core engine: session management, measurement, router, landing
- `/public/interventions/a1-breath-pacer.js` — Visual Breath Pacer (working)

The app has: cinematic landing → intervention stage → post-intervention stage.
Interventions register themselves via `window.BMHI_INTERVENTIONS['ID'] = { ... }`.

---

## WHAT YOU ARE BUILDING

Two new interventions to complete the Somatic Reset tier:

### A2: Body Scan (60-second abbreviated)

From seed.md:
```
Mechanism:   Somatic awareness interrupts rumination
Evidence:    T2 (MBSR literature)
Time:        60 seconds
Complexity:  Low
```

Implementation:
- Three sequential prompts, one body region at a time
- Text fades in slowly (1.5s transition), stays for 3s, fades out
- Sequence:
  1. "Notice your shoulders." (3s pause)
  2. "Let them drop." (3s pause)
  3. "Your jaw. Unclench it." (3s pause)
  4. "Your hands. Open them." (3s pause)
  5. Final: "You're still here. That matters."
- Font: Cormorant Garamond, ~28px, italic, warm off-white
- NO interaction required — pure read/feel experience
- Auto-advances through the sequence
- Subtle ambient glow that shifts with each body region (optional)

Create: `/public/interventions/a2-body-scan.js`

### A3: Two-Minute Reset

From seed.md:
```
Mechanism:   Parasympathetic + positive effort reattribution
Evidence:    T2
Time:        2 minutes
Complexity:  Low
```

Implementation:
- Large visible countdown timer (mono font, 48-72px)
- Timer counts down from 2:00 to 0:00
- Sound selection buttons: Rain / White Noise / Silence
  - Use Web Audio API to generate white noise
  - Use a simple rain sound synthesizer (filtered noise bursts)
  - Audio is OPTIONAL, NEVER autoplay (§4.8)
- At 0:00, single sentence fades in: *"You spent time looking. That is not nothing."*
- **Late-night priority**: if time is after 10pm local, the router should prefer A3

Create: `/public/interventions/a3-two-minute-reset.js`

---

## INTEGRATION TASKS

1. Add `<script>` tags for both new files in `index.html`
2. Register A2 and A3 in the intervention router in `app.js`
3. Add A2 and A3 tabs to the suite navigator
4. Update the Long Arc Protocol: Visit 1 still routes to A1
5. Implement late-night detection (after 10pm local → prefer A3)
6. Add tier color coding: somatic interventions use sage green (#7a9e8e) accent

---

## AUDIO IMPLEMENTATION NOTE

For A3's ambient sounds, use Web Audio API (no external files needed):

```javascript
// White noise: AudioContext → createBufferSource with random samples
// Rain: filtered noise bursts at random intervals with bandpass filter
// Both user-initiated only — connect to the audio toggle button
```

---

## TESTING

1. "Explore the full suite" → navigator shows A1, A2, A3 tabs
2. A2 plays through all 5 text phases smoothly with proper timing
3. A3 countdown works, sound buttons toggle, final text appears at 0:00
4. After 10pm, router selects A3 as default instead of A1
5. Both interventions emit MHIL_START and MHIL_CLOSE events
6. Both work at 375px mobile width
7. Both are always dismissible

---

## WHAT THE NEXT SESSION BUILDS

Session 03 adds B1 (Data Reframe) — the first cognitive intervention, read-only.
