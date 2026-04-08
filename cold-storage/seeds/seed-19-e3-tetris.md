# SEED 19 — E3: Meditative Blocks (Tetris)
# BMHI Build Sequence · Session 19
# Flow State — Visuospatial Rumination Interruption

---

## WHAT EXISTS

Sessions 01–18 built: Foundation, Tiers A–F complete (18 interventions), deployment, documentation.

---

## WHAT YOU ARE BUILDING

### E3: Meditative Blocks (Tetris)

From seed.md:
```
Mechanism:   Visuospatial processing interrupts rumination;
             executive function engagement blocks intrusive thought
Evidence:    T1 (Holmes et al. 2009, 2010 — Tetris reduces intrusive
             memories; Russoniello et al. 2009, 2011 — casual games
             produce EEG/HRV parasympathetic shift)
Time:        60–120 seconds
Complexity:  High
```

A meditative Tetris implementation:

```
- 8×14 grid, color-coded pieces from calming palette
- No game-over state — top rows clear silently when full
- Pre-seeded bottom rows for immediate puzzle-feel
- Lines cleared produce floating affirmation words
- Gentle 1-second drop speed
- No score, no level, no timer visible

Closing: "Your mind just did something remarkable —
         it chose focus over worry."
```

### Implementation Details

**Canvas-based rendering** with retina support (2x scaling):
- Grid background with subtle grid lines
- Rounded-rect blocks with highlight/shadow for depth
- Floating affirmation words that fade upward on line clear

**Controls:**
- Four buttons: Move Left, Rotate, Move Right, Drop
- SVG icon-based buttons matching design system
- Touch-friendly (52px tap targets, touchstart handlers)

**Piece set (8 shapes):**
```javascript
O (2×2), I (3), L (4), S, Z, J, Reverse-J, T
```

**No-fail mechanics:**
- If a spawned piece doesn't fit, top 4 rows silently clear
- Piece continues from row 0
- No "Game Over" screen, no restart prompt

**Color palette:** All pieces use colors from the calming system:
```
#c4a35a (amber), #7a9e8e (sage), #6a8fa7 (water),
#b07a7a (rose), #8a9eae (mist), #b8856e (clay),
#8e7299 (plum), #a69076 (sand)
```

**Wall-kick rotation:** Try offsets [0, -1, 1, -2, 2] for rotation near walls.

Create: `/public/interventions/e3-tetris.js`

---

## CLINICAL NOTE

Holmes et al. (2009, 2010) demonstrated that playing Tetris within 6 hours of trauma exposure reduced the frequency of intrusive visual memories by ~60% compared to controls. The mechanism is visuospatial working memory competition — Tetris requires the same cognitive resources that flashback/rumination imagery uses. The two cannot co-exist.

Russoniello et al. (2009, 2011, 2014) confirmed via EEG and HRV measurement that casual games without stakes produce measurable parasympathetic activation (increased alpha waves, increased HRV).

The critical design requirement: **no score, no timer, no game-over state**. Adding these reintroduces performance pressure, which reactivates the stress response the intervention is designed to interrupt.

---

## EVIDENCE CITATIONS

1. Holmes, E. A., James, E. L., Coode-Bate, T., & Deeprose, C. (2009). Can playing the computer game "Tetris" reduce the build-up of flashback-like images? *PLoS ONE*, 4(1), e4153.
2. Holmes, E. A., James, E. L., Kilford, E. J., & Deeprose, C. (2010). Key steps in developing a cognitive vaccine against traumatic flashbacks. *PLoS ONE*, 5(11), e13706.
3. Russoniello, C. V., O'Brien, K., & Parks, J. M. (2009). EEG, HRV and psychological correlates while playing Bejeweled II. *Annual Review of CyberTherapy and Telemedicine*, 7, 68–72.
4. Russoniello, C. V., O'Brien, K., & Parks, J. M. (2011). The effect of casual video games on mood and stress. *Journal of CyberTherapy and Rehabilitation*, 4(1), 53–66.

---

## INTEGRATION

1. Add `<script>` tag in `index.html` (after e2-open-canvas.js)
2. Register E3 in intervention registry via self-executing function
3. Add to suite navigator (Tier E — plum #8e7299)
4. Measurement: MHIL_ENGAGE records `interaction_type: 'game'`, `depth_score` based on lines cleared

---

## TESTING

1. 8×14 grid displays with pre-seeded bottom rows
2. Pieces drop at 1-second intervals
3. Left/Right/Rotate/Drop controls work (touch + click)
4. Wall-kick rotation prevents stuck pieces
5. Line clears trigger floating affirmation words
6. No game-over state — top rows clear silently
7. Closing text appears after 120 seconds
8. Canvas is responsive at 375px width
9. No score, no timer, no level counter visible
10. Dismiss (×) cleanly stops all animation frames and timers
