# SEED 06 — C1: The One Small Thing
# BMHI Build Sequence · Session 6 of 18
# First Behavioral Activation Intervention

---

## WHAT EXISTS

Sessions 01–05 built: Foundation, Tier A (somatic), Tier B (cognitive) complete.

---

## WHAT YOU ARE BUILDING

### C1: The One Small Thing

From seed.md:
```
Mechanism:   Implementation intention — specific micro-commitment
Evidence:    T1 (Gollwitzer; implementation intention meta-analyses)
Time:        60 seconds
Complexity:  Low
```

This is the highest-evidence behavioral intervention in the suite. The literature is clear: **naming the specific action** (not just intending to act) dramatically increases follow-through. One tap. That's all we ask.

Implementation:
```
[Three tap targets — user selects ONE]:

[ Update one line of your resume ]
[ Message one person in your network ]
[ Search one new keyword tomorrow ]
```

- Three cards/buttons, vertically stacked
- Styled as action chips: border, rounded, generous padding
- Tapping one selects it (sage green highlight), deselects others
- After tap: brief confirmation animation (check mark draws in, 0.6s)
- Text: *"Done. You've decided. That's already progress."*
- Behavioral tier accent: clay (#b8856e)

### Confirmation Animation

SVG checkmark that draws itself:
```html
<svg viewBox="0 0 50 50">
  <path d="M 14 27 L 22 35 L 38 16"
    fill="none" stroke="#7a9e8e" stroke-width="2.5"
    stroke-linecap="round" stroke-linejoin="round"
    stroke-dasharray="60" stroke-dashoffset="60"/>
</svg>
```
Animate `stroke-dashoffset` to 0 on selection.

Create: `/public/interventions/c1-one-small-thing.js`

---

## INTEGRATION

1. Add `<script>` tag in `index.html`
2. Register C1 in intervention registry
3. Add to suite navigator (Tier C — clay)
4. Long Arc Protocol: Visit 3 → C1
5. Measurement: MHIL_ENGAGE records `interaction_type: 'tap'`, which option was selected (by index, not content)

---

## TESTING

1. Three action chips display, each tappable
2. Only one can be selected at a time
3. Check animation plays on selection
4. Closing text fades in after animation
5. Works with one thumb at 375px
6. Measurement records the selection

---

## WHAT THE NEXT SESSION BUILDS

Session 07 adds C2 (Momentum Builder) and C3 (Network Nudge), completing Tier C.
