# SEED 12 — E2: Creative Micro-Task: Open Canvas
# BMHI Build Sequence · Session 12 of 18
# Completes Tier E: Flow State Experiences

---

## WHAT EXISTS

Sessions 01–11 built: Foundation, Tiers A–D, E1 (Pattern Match).

---

## WHAT YOU ARE BUILDING

### E2: Open Canvas

From seed.md:
```
Mechanism:   Expressive art; cortisol reduction; default mode
             network restoration
Evidence:    T3 (art therapy literature; drawing intervention studies)
Time:        2–3 minutes
Complexity:  High
```

A simple drawing surface:

```
"Draw whatever comes. No one will see this."

[White/off-white canvas area]
[Three color options below]
[One brush size]

Soft 2-minute countdown (subtle, no pressure)
Auto-save locally. Option to download. Never uploaded.
```

### Implementation

**Canvas setup:**
- Use HTML5 `<canvas>` element
- Size: full width (max 340px), 4:3 aspect ratio
- Background: var(--surface) — slightly lighter than page bg
- Border: subtle, rounded corners (12px)
- Touch-action: none (prevent scroll while drawing)

**Drawing mechanics:**
- Track pointer/touch events for drawing
- Smooth line rendering using `lineTo` with `lineJoin: 'round'`, `lineCap: 'round'`
- Single brush size: 3px stroke width
- Three color options:
  - Warm white (#f0ece4)
  - Muted amber (#c4922a)
  - Sage green (#7a9e8e)
- Color picker: three circles below canvas, active one has visible border

```javascript
// Drawing with touch support:
canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDraw);
// Set touch-action: none on canvas to prevent scrolling
```

**Timer:**
- Subtle 2-minute countdown bar below the canvas
- NOT a prominent number — just a thin progress bar
- No alarm at completion, just gentle transition to closing
- "No pressure" means the timer can be ignored

**Closing:**
- At 2:00 or when user taps done: canvas fades out gently
- Closing text: nothing specific — the drawing was the intervention
- Simple: *"That was yours."*

**Save/download:**
- Canvas auto-saves to localStorage as base64 data URL (optional)
- Small "save" icon/link that triggers `canvas.toDataURL()` download
- NEVER uploaded to any server

**Flow state tier accent:** plum (#8e7299)

Create: `/public/interventions/e2-open-canvas.js`

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register E2 in intervention registry
3. Add to suite navigator (Tier E — plum)
4. Suite navigator now shows A through E complete
5. Measurement: MHIL_ENGAGE records `interaction_type: 'draw'`, `time_in_seconds`

---

## TESTING

1. Canvas displays at appropriate size
2. Drawing works with mouse and touch
3. Three color options work, active state visible
4. Lines render smoothly without gaps
5. Timer bar progresses subtly
6. Download saves a PNG
7. Canvas works at 375px — drawing area fills width
8. Touch drawing doesn't cause page scroll
9. No canvas data transmitted anywhere

---

## WHAT THE NEXT SESSION BUILDS

Session 13 adds F1 (Check-In Screen) and F2 (Population Mirror) — the SBIRT screening and social proof layer.
