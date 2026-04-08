# SEED 17 — Demo Mode, Suite Navigator, UX Polish
# BMHI Build Sequence · Session 17 of 18
# Museum-Quality Polish Pass

---

## WHAT EXISTS

Sessions 01–16 built: All interventions, Long Arc Protocol, delivery mechanisms, Cloudflare Worker.
Everything is functional. This session makes it beautiful.

---

## WHAT YOU ARE BUILDING

### 1. Suite Navigator Enhancement

The suite navigator (bottom bar in demo mode) needs to be polished into a museum-quality exhibition interface:

**Tier grouping with labels:**
```
SOMATIC          COGNITIVE        BEHAVIORAL       EMOTIONAL        FLOW    SCREENING
[A1][A2][A3]     [B1][B2][B3][B4] [C1][C2][C3]    [D1][D2][D3][D4] [E1][E2] [F1][F2]
```

- Each tier has its color accent
- Active intervention tab is highlighted
- Smooth scroll if tabs overflow on mobile
- Small info icon on each tab showing intervention name on hover/tap
- Current intervention's tier label shows above the tabs

**Intervention info panel:**
When hovering/long-pressing a suite tab, show a small tooltip:
```
A1 · Visual Breath Pacer
Parasympathetic activation
Evidence: T1 · 60-90s
```

### 2. Transitions Between Interventions

Polish the transitions when switching between interventions in demo mode:

```
Current intervention fades out (0.6s, ease-out)
Brief pause (200ms)
New intervention fades in (0.8s, ease-in)
```

- No jarring jumps
- Intervention content is fully cleared between switches
- Any timers/animations from previous intervention are properly cleaned up

### 3. Landing Page Polish

Enhance the cinematic landing for the standalone/demo experience:

- Add a subtle particle effect or noise texture overlay (like the /mhi reference)
- Ensure the enso circle draws with a beautiful brush-stroke quality
- Fine-tune all timing in the reveal sequence
- Add `prefers-reduced-motion` support: skip animations, show everything immediately

### 4. Post-Intervention Enhancement

After each intervention completes, the post-intervention stage should:

- Show the closing message with beautiful typography
- After 3 seconds, subtly reveal: "Want to go deeper?"
- Partner CTA (per §6, Channel B): single link to mental health resources
- Keep it subtle — the intervention is complete, this is an afterthought
- In demo mode: also show "Try another" button to return to suite navigator

### 5. Audio System Polish

- Implement a simple Web Audio API ambient drone:
  - Warm, low-frequency sine wave (~120Hz) with gentle amplitude modulation
  - Optional rain overlay (filtered white noise with random amplitude bursts)
  - Crossfade between sounds (500ms)
- Audio toggle button: shows speaker icon, toggles on/off
- Audio state persists in sessionStorage
- Never autoplay — always user-initiated (§4.8)

### 6. Accessibility

- All interactive elements have `aria-label`
- Focus management: when transitions between stages, focus moves to new content
- Keyboard navigation: Tab through controls, Enter/Space to activate
- Screen reader: intervention prompts are `aria-live="polite"`
- Color contrast: verify all text meets WCAG AA against dark backgrounds
- Touch targets: minimum 44px for all interactive elements

### 7. Performance

- Lazy-load intervention JS files (only load when needed)
- Preload fonts with `<link rel="preload">`
- Minimize layout shifts during transitions
- Canvas interventions (E2) should clean up properly to free memory
- Total page weight target: < 200KB (excluding fonts)

### 8. Mobile Polish

- Test every intervention at 375px, 390px, 414px widths
- Ensure no horizontal scroll anywhere
- Bottom suite navigator doesn't overlap intervention content
- Virtual keyboard doesn't break layout on text input interventions
- Touch targets are thumb-friendly (minimum 44px height)

---

## TESTING CHECKLIST

1. [ ] Every intervention launches and completes cleanly from suite navigator
2. [ ] Transitions between interventions are smooth and artifact-free
3. [ ] No timers or animations leak between intervention switches
4. [ ] Audio toggle works, never autoplays
5. [ ] Landing reveal is cinematic and properly timed
6. [ ] Post-intervention shows correctly with CTA
7. [ ] All 16 interventions work at 375px mobile
8. [ ] Keyboard navigation works throughout
9. [ ] `prefers-reduced-motion` disables animations
10. [ ] Console has no errors during full suite walkthrough
11. [ ] Page weight is under 200KB (excluding fonts)
12. [ ] Every text input intervention has privacy note visible

---

## WHAT THE NEXT SESSION BUILDS

Session 18 — the final session — handles deployment to Cloudflare Pages, documentation, and the README.
