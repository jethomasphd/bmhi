# SEED 05 — B3: Cognitive Reappraisal + B4: Progress Mapping
# BMHI Build Sequence · Session 5 of 18
# Completes Tier B: Cognitive Reframe

---

## WHAT EXISTS

Sessions 01–04 built: Foundation, A1–A3, B1, B2.

---

## WHAT YOU ARE BUILDING

### B3: Cognitive Reappraisal Prompt

From seed.md:
```
Mechanism:   Growth mindset framing of search as data collection
Evidence:    T2 (Dweck; job search self-efficacy literature)
Time:        90 seconds
Complexity:  Low-medium
```

Implementation:
```
"One question before you close:

 What did today's search tell you about
 what you're actually looking for?"

[Text field — optional]
```

- Text field hint fades in after 8s: *"Even 'I don't know' is useful data."*
- On close or submit: *"Data collected. See you tomorrow."*
- The reframe is in the question itself — even not answering shifts the frame from "failure" to "data collection"
- Text stays local, never transmitted

Create: `/public/interventions/b3-reappraisal.js`

### B4: Progress Mapping

From seed.md:
```
Mechanism:   Progress visualization counters learned helplessness
Evidence:    T3 (Zeigarnik; progress principle — Amabile & Kramer)
Time:        60 seconds
Complexity:  Medium (requires session history)
Requires:    Session continuity (cookie)
```

Implementation — **only shown to returning users (visit ≥ 3)**:
```
"Your search, week by week."

[Visual timeline: horizontal bar showing visit history]
[Current week highlighted in amber, previous visits in dim amber]

"You've shown up [N] times. That's not giving up.
 That's how searches succeed — eventually."
```

- Read the visit count from the session cookie
- Render a horizontal bar chart: one pip per visit, max ~12 shown
- Current visit highlighted in full amber, past visits in 30% opacity amber
- If visit count < 3, this intervention is skipped by the router (fall through to another B-tier)
- Visit count displayed in mono font, amber color

Create: `/public/interventions/b4-progress-map.js`

---

## INTEGRATION

1. Add `<script>` tags for both in `index.html`
2. Register B3 and B4 in intervention registry
3. B4 must check `getVisitNumber() >= 3` — if not, return a flag so the router can fall back
4. Add both to suite navigator (Tier B — water blue)
5. Suite navigator should now show: A1, A2, A3 | B1, B2, B3, B4

---

## TESTING

1. B3 displays prompt, text field works, hint appears after 8s
2. B3 closing text shows on submit or dismiss
3. B4 reads visit count from cookie correctly
4. B4 renders progress bar with correct number of pips
5. B4 shows appropriate text with visit count interpolated
6. B4 gracefully handles visit count < 3 (not displayed in demo, or shows mock data)
7. In demo mode, B4 should work with simulated visit count

---

## WHAT THE NEXT SESSION BUILDS

Session 06 adds C1 (The One Small Thing) — first behavioral activation intervention.
