# SEED 14 — G1: The Long Arc Protocol
# BMHI Build Sequence · Session 14 of 18
# Returning User Sequence Engine

---

## WHAT EXISTS

Sessions 01–13 built: Foundation, Tiers A–F complete (16 interventions).
All interventions are registered and can be triggered via suite navigator.
Basic visit counting exists in session management.

---

## WHAT YOU ARE BUILDING

### G1: The Long Arc Protocol

From seed.md:
```
Mechanism:   Longitudinal wellbeing relationship;
             progressive deepening of intervention
Evidence:    T3 (engagement sequencing; behavioral health retention literature)
Requires:    Session continuity cookie
```

This is not an intervention — it is the **sequence engine** that determines WHICH intervention fires for returning users.

### Visit Sequence

```
Visit 1:    A1 (Breath Pacer) — easiest, lowest ask
Visit 2:    B1 (Data Reframe) — normalize the experience
Visit 3:    C1 (One Small Thing) — micro-agency
Visit 4:    F1 (Check-In Screen) + standard intervention
Visit 5:    D1 (3-Sentence Release) — first emotional depth
Visit 6:    B2 (Defusion Exercise) — cognitive work
Visit 7:    D2 (Self-Compassion Mirror) — deepest empathy
Visit 8+:   Rotate through suite based on engagement scores
```

### Engagement Scoring System

```
Completion = 2 pts
Text input = 3 pts
Return visit within 7 days = 2 pts
Select the same intervention type twice = route elsewhere
```

Store engagement history in the session cookie/localStorage:
```javascript
{
  visits: [
    { date: '2026-03-27', intervention: 'A1', score: 2, completed: true },
    { date: '2026-03-28', intervention: 'B1', score: 2, completed: true },
    // ...
  ],
  totalScore: 14,
  lastVisit: '2026-03-28'
}
```

### Visit 8+ Rotation Logic

For visits beyond the initial sequence:
1. Calculate engagement score per intervention tier (A, B, C, D, E)
2. Avoid repeating the same tier twice in a row
3. Prefer tiers with lower engagement scores (expose user to variety)
4. If a user consistently engages with text-input interventions, lean toward D-tier
5. If a user dismisses quickly, lean toward A-tier (lowest ask)
6. Never repeat the exact same intervention back-to-back

### Implementation

Refactor `selectIntervention()` in `app.js`:

```javascript
function selectIntervention(session) {
  var visit = session.visitNumber;
  var history = session.engagementHistory;

  // Fixed sequence for visits 1-7
  var sequence = ['A1','B1','C1',null,'D1','B2','D2'];
  // null at index 3 = Visit 4 uses F1 + fallback

  if (visit <= 7) {
    var id = sequence[visit - 1];
    if (id) return id;
    // Visit 4: return best available after F1 pre-screen
    return selectByEngagement(history, ['A2','B3','C2','E1']);
  }

  // Visit 8+: engagement-based rotation
  return selectByEngagement(history, getAllInterventionIds());
}
```

### Late-Night Override

Per seed.md A3:
- After 10pm local time, Visit 1 routes to A3 instead of A1
- After 10pm for any visit, somatic interventions (A-tier) are weighted higher

### What to Modify

This session primarily modifies `/public/app.js`:
- Upgrade the session cookie to store engagement history
- Implement `selectIntervention()` with full Long Arc logic
- Implement `selectByEngagement()` for Visit 8+ rotation
- Add late-night override
- Implement engagement score tracking (call `recordEngagement()` on intervention completion)
- Ensure the suite navigator demo mode bypasses the Long Arc (direct selection)

---

## CLINICAL NOTE (from Insel)

*"This is the study. This is where you can generate a longitudinal behavioral signal that correlates intervention type with return visit behavior. This is publishable. Instrument it from day one."*

---

## TESTING

1. Visit 1 routes to A1 (or A3 after 10pm)
2. Visit 2 routes to B1
3. Visit 3 routes to C1
4. Visit 4 shows F1 check-in first, then a selected intervention
5. Visit 5 routes to D1
6. Visit 6 routes to B2
7. Visit 7 routes to D2
8. Visit 8+ selects based on engagement scores
9. Same intervention never repeats back-to-back at Visit 8+
10. Engagement scores accumulate correctly in localStorage
11. Demo mode still allows direct selection via suite navigator
12. Session cookie/localStorage persists across page reloads

Test visit progression: manipulate the cookie/localStorage to simulate different visit numbers.

---

## WHAT THE NEXT SESSION BUILDS

Session 15 builds the four delivery mechanisms (popup, pop-under, embedded, email trigger).
