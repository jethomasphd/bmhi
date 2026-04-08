# SEED 11 — E1: Pattern Match Micro-Game
# BMHI Build Sequence · Session 11 of 18
# First Flow State Intervention

---

## WHAT EXISTS

Sessions 01–10 built: Foundation, Tiers A–D complete (12 interventions).

---

## WHAT YOU ARE BUILDING

### E1: Pattern Match Micro-Game

From seed.md:
```
Mechanism:   Flow state induction; rumination crowding via
             executive function engagement
Evidence:    T1 (Russoniello et al. 2009, 2011, 2014 — EEG/HRV)
Time:        60–90 seconds
Complexity:  High
```

A minimal visual pattern-matching (memory) game:

```
- 4×4 grid of abstract shapes (8 pairs = 16 cards)
- User taps to flip cards, matches pairs
- Calming color palette (desaturated blues/greens/ambers from design system)
- No timer, no score, no fail state
- Soft ambient audio (optional, user-initiated)
- Auto-ends after ~90 seconds or grid complete

No win screen. No score. Just:
"That's your brain doing what it's good at."
```

### Implementation Details

**Card symbols** — use simple Unicode/SVG shapes, NOT emoji:
```javascript
var SYMBOLS = ['◆', '●', '▲', '■', '◇', '○', '△', '□'];
// Or better: simple SVG paths for each (circle, triangle, square,
// diamond, wave, drop, star, leaf)
```

**Card mechanics:**
- Cards start face-down (show surface color)
- Tap to flip (0.3s CSS transform: rotateY)
- Two flipped: if match → both stay revealed with matched styling (dim, sage border)
- Two flipped: if no match → both flip back after 0.8s
- No sound on flip (or optional subtle tone)

**Colors per pair** — each pair uses a different color from the calming palette:
```
#c4922a (amber), #7a9e8e (sage), #6a8fa7 (water), #b8856e (clay),
#b07a7a (rose), #8e7299 (plum), #8a9eae (mist), #a69076 (sand)
```

**Absence of stakes is critical:**
- NO score counter
- NO move counter
- NO timer visible
- NO "you won!" screen
- NO comparison to previous performance
- Performance pressure reactivates the stress response the intervention is trying to interrupt

**Card grid styling:**
```css
.match-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-width: 280px;
}
.match-card {
  aspect-ratio: 1;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  /* Card flip animation */
  transition: transform 0.3s ease;
  transform-style: preserve-3d;
}
```

**End state:**
- After all pairs matched OR 90 seconds elapsed
- Cards gently fade out
- Closing text fades in: *"That's your brain doing what it's good at."*
- Flow state tier accent: plum (#8e7299)

### Reference: Existing Games

Study `/RecursiveMarketing-main/public/mhi/games.js` for patterns:
- The existing games (tetris, snake, breaker, garden) use canvas rendering
- For E1, **use DOM-based cards** instead of canvas — better for accessibility and CSS animations
- The garden game's tap interaction pattern is a useful reference
- Floating word system from games.js can be adapted for the closing message

Create: `/public/interventions/e1-pattern-match.js`

---

## CLINICAL NOTE

The Russoniello studies (2009, 2011, 2014) used EEG and HRV to demonstrate that casual games without stakes produce measurable parasympathetic activation. The mechanism is **rumination crowding** — the visuospatial processing required for pattern matching occupies the same cognitive resources that rumination uses. You can't ruminate and match patterns simultaneously.

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register E1 in intervention registry
3. Add to suite navigator (Tier E — plum #8e7299)
4. Measurement: MHIL_ENGAGE records `interaction_type: 'game'`, `depth_score` based on pairs matched
5. Shuffle the card positions on each render (Fisher-Yates shuffle)

---

## TESTING

1. 4×4 grid displays with 16 face-down cards
2. Tapping flips cards with smooth animation
3. Matching pairs stay revealed
4. Non-matching pairs flip back after 0.8s delay
5. No score, no timer, no move counter visible
6. Closing text appears after completion or 90s
7. Grid is responsive at 375px (cards should be ~56px each)
8. Touch targets are comfortable for thumb interaction
9. No performance data shown to user at any point

---

## WHAT THE NEXT SESSION BUILDS

Session 12 adds E2 (Open Canvas) — creative drawing micro-task.
