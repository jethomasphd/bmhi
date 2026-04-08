# SEED 20 — E4: Meditative Serpent (Snake)
# BMHI Build Sequence · Session 20
# Flow State — Sustained Attention & Rhythmic Movement

---

## WHAT EXISTS

Sessions 01–19 built: Foundation, Tiers A–F complete, E3 Tetris added.

---

## WHAT YOU ARE BUILDING

### E4: Meditative Serpent (Snake)

```
Mechanism:   Sustained attention & flow state induction;
             rhythmic movement occupies executive function,
             blocking ruminative self-referential processing
Evidence:    T1 (Russoniello et al. 2009, 2011 — EEG/HRV;
             Csikszentmihalyi 1990 — flow state theory)
Time:        60–120 seconds
Complexity:  High
```

A meditative Snake implementation:

```
- 12×12 grid, calming earth-tone palette
- No death states — edges wrap (toroidal grid)
- Self-collision trims the tail instead of ending the game
- Food items spawn in varied calming colors
- Eating food produces floating affirmation words
- Snake auto-trims if it gets too long (>40% of grid)
- No score, no length counter, no speed progression

Closing: "Steady rhythm. Steady you."
```

### Implementation Details

**No-fail design:**
- Edges wrap — snake goes off right, appears on left
- Self-collision: body is trimmed to the collision point (no death)
- Snake length capped at 40% of grid area, resets to 5 segments
- No speed increase — constant 180ms move interval

**Starting state:**
- Snake starts at center, length 5, moving right
- First food spawned at random empty cell
- Each food item gets a random color from PAL

**Controls:**
- Four buttons: Left, Up, Down, Right
- Cannot reverse direction (prevents instant self-collision)

Create: `/public/interventions/e4-snake.js`

---

## CLINICAL NOTE

Csikszentmihalyi's (1990) flow state requires three conditions: (1) clear goals, (2) immediate feedback, (3) balance between challenge and skill. Snake naturally provides all three — guide the serpent to food, see it grow, difficulty is self-regulating.

The critical insight is that flow states are incompatible with rumination. The default mode network (self-referential thinking, worry, regret) deactivates when the task-positive network engages. Snake's sustained attention demand — simple but unbroken — keeps the task-positive network active.

No death states and no scoring ensure the flow channel stays open. Performance anxiety collapses flow.

---

## EVIDENCE CITATIONS

1. Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.
2. Russoniello, C. V., O'Brien, K., & Parks, J. M. (2009). EEG, HRV and psychological correlates while playing Bejeweled II. *Annual Review of CyberTherapy and Telemedicine*, 7, 68–72.
3. Nolen-Hoeksema, S. (2000). The role of rumination in depressive disorders and mixed anxiety/depressive symptoms. *Journal of Abnormal Psychology*, 109(3), 504–511.
4. Raichle, M. E., et al. (2001). A default mode of brain function. *Proceedings of the National Academy of Sciences*, 98(2), 676–682.

---

## INTEGRATION

1. Add `<script>` tag in `index.html` (after e3-tetris.js)
2. Register E4 in intervention registry
3. Measurement: MHIL_ENGAGE records `interaction_type: 'game'`, `depth_score` based on food eaten

---

## TESTING

1. 12×12 grid displays with snake at center
2. Snake moves at constant speed (180ms)
3. Edges wrap correctly (all four sides)
4. Self-collision trims tail (no game over)
5. Food eating produces floating affirmation words
6. Direction controls work, no reverse allowed
7. Snake length caps at 40% of grid
8. Closing text appears after 120 seconds
9. No score, no speed progression visible
