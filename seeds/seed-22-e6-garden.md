# SEED 22 — E6: Mindful Garden
# BMHI Build Sequence · Session 22
# Flow State — Nurturing Activation & Attention Restoration

---

## WHAT EXISTS

Sessions 01–21 built: Foundation, Tiers A–F complete, E3–E5 games added.

---

## WHAT YOU ARE BUILDING

### E6: Mindful Garden (Nurturing Whac-A-Mole)

```
Mechanism:   Behavioral activation via nurturing interaction;
             non-violent, non-competitive engagement produces
             positive affect without performance pressure;
             tending/befriending response (Taylor et al. 2000);
             attention restoration via nature exposure (Kaplan 1995)
Evidence:    T2 (Kaplan 1995 — Attention Restoration Theory;
             Ulrich 1991 — stress recovery from nature exposure;
             Russoniello et al. 2009 — casual games + HRV)
Time:        60–120 seconds
Complexity:  High
```

A nurturing garden micro-experience:

```
- 4×4 grid of garden plots
- Plants sprout automatically every 1.5 seconds
- Life cycle: sprouting → growing → blooming → wilted → empty
- Tap growing flowers to make them bloom (the nurturing action)
- Full bloom shows radiating petals with glow
- Floating affirmation words appear on bloom
- No violence — this is tending, not whacking
- Tap-based interaction (no button controls)

Closing: "You tended something. That matters more than you think."
```

### Implementation Details

**Nature-inspired design:**
- Earth-tone plot backgrounds (#1a1f2a)
- Green stems (#5a8a5a) with colored flower heads
- Plant colors from nature palette: sage, green, clay, plum, amber, rose
- Subtle plot borders for structure
- Growing flowers pulse gently to invite tapping

**Plant lifecycle (all times in ms):**
```
sprouting:  600ms (small green dot)
growing:    up to 6000ms (stem grows, flower head expands, pulse starts at 50%)
blooming:   1800ms (radiating petals + center glow — triggered by tap)
wilted:     1000ms (fading grey dot — if not tapped in time)
empty:      awaits next sprout
```

**Canvas-based interaction:**
- Click/touchstart on canvas → calculate grid position
- If plot contains growing/sprouting plant → bloom it
- No external control buttons needed

**Pre-seeded state:**
- 4 random plots start with growing plants (varied ages)
- Ensures immediate visual interest and something to tap

Create: `/public/interventions/e6-garden.js`

---

## CLINICAL NOTE

This intervention inverts the Whac-A-Mole paradigm: instead of destroying, the user nurtures. Taylor et al. (2000) identified the "tend-and-befriend" response as an alternative to fight-or-flight, particularly effective for stress reduction. The garden metaphor activates this response pathway.

Kaplan's (1995) Attention Restoration Theory (ART) posits that nature exposure restores directed attention capacity depleted by stress. Even digital nature representations produce measurable restoration effects (Berto, 2005). The garden's organic growth patterns, green hues, and lifecycle rhythms leverage this mechanism.

Ulrich et al. (1991) demonstrated that nature scenes produce faster stress recovery (measured via skin conductance, muscle tension, and pulse transit time) compared to urban scenes. The garden provides a concentrated nature-interaction micro-dose.

---

## EVIDENCE CITATIONS

1. Kaplan, S. (1995). The restorative benefits of nature: Toward an integrative framework. *Journal of Environmental Psychology*, 15(3), 169–182.
2. Ulrich, R. S., Simons, R. F., Losito, B. D., Fiorito, E., Miles, M. A., & Zelson, M. (1991). Stress recovery during exposure to natural and urban environments. *Journal of Environmental Psychology*, 11(3), 201–230.
3. Taylor, S. E., Klein, L. C., Lewis, B. P., Gruenewald, T. L., Gurung, R. A., & Updegraff, J. A. (2000). Biobehavioral responses to stress in females: Tend-and-befriend. *Psychological Review*, 107(3), 411–429.
4. Berto, R. (2005). Exposure to restorative environments helps restore attentional capacity. *Journal of Environmental Psychology*, 25(3), 249–259.

---

## INTEGRATION

1. Add `<script>` tag in `index.html` (after e5-breaker.js)
2. Register E6 in intervention registry
3. Measurement: MHIL_ENGAGE records `interaction_type: 'game'`, `depth_score` based on blooms

---

## TESTING

1. 4×4 grid displays with 4 pre-sprouted plants
2. New plants sprout every ~1.5 seconds in empty plots
3. Tapping growing plants triggers bloom animation
4. Bloom shows radiating petals with center glow
5. Untapped plants wilt after 6 seconds
6. Floating affirmation words appear on bloom
7. Canvas responds to both click and touch
8. Closing text appears after 120 seconds
9. No score, no counter, no timer visible
