# SEED 21 — E5: Rhythmic Breaker (Brick Breaker)
# BMHI Build Sequence · Session 21
# Flow State — Rhythmic Visual Tracking

---

## WHAT EXISTS

Sessions 01–20 built: Foundation, Tiers A–F complete, E3 Tetris, E4 Snake added.

---

## WHAT YOU ARE BUILDING

### E5: Rhythmic Breaker (Brick Breaker)

```
Mechanism:   Rhythmic visual tracking produces predictable sensory
             input that supports parasympathetic activation;
             smooth pursuit eye movements reduce physiological
             arousal (EMDR-adjacent mechanism)
Evidence:    T2 (Russoniello et al. 2009, 2011 — casual games + HRV;
             van den Hout & Engelhard 2012 — eye movement and working
             memory taxation; Kavanagh et al. 2001 — visuospatial
             tasks reduce intrusion vividness)
Time:        60–120 seconds
Complexity:  High
```

A meditative Brick Breaker implementation:

```
- 280×400px playfield, paddle and ball
- 5 rows × 8 columns of bricks (some pre-destroyed for variety)
- No lives — ball resets to paddle if it goes below
- Gentle ball speed, paddle bounce with angle variation
- Brick destruction produces floating affirmation words
- Bricks regenerate when all destroyed (infinite play)
- No score, no lives counter, no level progression

Closing: "Rhythm and focus. Your mind knows how to find calm."
```

### Implementation Details

**No-fail design:**
- Ball going below paddle: instantly resets to paddle position
- No "lives" counter, no "game over"
- Bricks fully regenerate when all destroyed
- Some bricks pre-destroyed for instant-puzzle feel

**Physics:**
- Ball speed: 1.6 pixels per physics step
- Paddle bounce varies ball angle based on hit position
- Wall bounce: simple reflection
- dt-independent via fixed physics steps (ceil(dt/8))

**Controls:**
- Two buttons only: Left, Right
- 20px movement per press
- Paddle clamped to playfield bounds

Create: `/public/interventions/e5-breaker.js`

---

## CLINICAL NOTE

The rhythmic back-and-forth tracking of the ball in Brick Breaker shares a mechanism with EMDR (Eye Movement Desensitization and Reprocessing). van den Hout & Engelhard (2012) demonstrated that horizontal eye movements tax visuospatial working memory, reducing the vividness and emotionality of negative memories.

Kavanagh et al. (2001) showed that visuospatial tasks specifically reduce the vividness of intrusive mental imagery. The predictable, rhythmic physics of Brick Breaker provide a gentle version of this mechanism — the user's eyes naturally track the ball in a smooth pursuit pattern, engaging visuospatial working memory without conscious effort.

The absence of lives and punishment ensures the tracking remains relaxed rather than anxious.

---

## EVIDENCE CITATIONS

1. Russoniello, C. V., O'Brien, K., & Parks, J. M. (2009). EEG, HRV and psychological correlates while playing Bejeweled II. *Annual Review of CyberTherapy and Telemedicine*, 7, 68–72.
2. van den Hout, M. A., & Engelhard, I. M. (2012). How does EMDR work? *Journal of Experimental Psychopathology*, 3(5), 724–738.
3. Kavanagh, D. J., Freese, S., Andrade, J., & May, J. (2001). Effects of visuospatial tasks on desensitization to emotive memories. *British Journal of Clinical Psychology*, 40, 267–280.
4. Shapiro, F. (2001). *Eye movement desensitization and reprocessing: Basic principles, protocols, and procedures* (2nd ed.). Guilford Press.

---

## INTEGRATION

1. Add `<script>` tag in `index.html` (after e4-snake.js)
2. Register E5 in intervention registry
3. Measurement: MHIL_ENGAGE records `interaction_type: 'game'`, `depth_score` based on bricks hit

---

## TESTING

1. Playfield displays with paddle, ball, and brick grid
2. Ball bounces off walls, paddle, and bricks
3. Left/Right controls move paddle smoothly
4. Ball resets to paddle when going below (no punishment)
5. Brick hits produce floating affirmation words
6. All bricks destroyed → bricks regenerate
7. Closing text appears after 120 seconds
8. No score, no lives, no level counter visible
