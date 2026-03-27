# SEED 07 — C2: Momentum Builder + C3: Network Nudge
# BMHI Build Sequence · Session 7 of 18
# Completes Tier C: Behavioral Activation

---

## WHAT EXISTS

Sessions 01–06 built: Foundation, Tier A, Tier B, C1.

---

## WHAT YOU ARE BUILDING

### C2: The Momentum Builder

From seed.md:
```
Mechanism:   Micro-mastery / behavioral activation via mini-task
Evidence:    T2 (BA literature; Fogg behavior model)
Time:        3–4 minutes
Complexity:  Medium
```

A completable micro-task within the intervention window. Rotating prompts based on time of day:

```
Opening: "Before you go — 90 seconds on something real."

[Morning — before 12pm]:
"Write the first line of your next cover letter.
 Just one sentence. Start with 'I am the kind of person who...'"

[Afternoon — 12pm to 6pm]:
"What's the job title you keep gravitating toward?
 Write it down. Now write one word that describes why it fits you."

[Evening — after 6pm]:
"Name one professional win from this year — any size.
 Write it. Keep it."
```

- Detect time of day and show appropriate prompt
- Text area for response (serif font, generous padding, warm background)
- Responses stored in `localStorage` (NOT sessionStorage — persist across visits)
- Optional: "Email this to myself" button (future session will wire this up)
- Privacy note: "This stays on your device."
- Closing: *"That's real. You made something."*

Create: `/public/interventions/c2-momentum.js`

### C3: The Network Nudge

From seed.md:
```
Mechanism:   Behavioral activation + weak-tie network activation
Evidence:    T3 (Granovetter; referral hiring literature)
Time:        60 seconds
Complexity:  Low
```

Implementation:
```
"70% of jobs are filled through referrals — not listings.

 Is there one person you haven't talked to in 6+ months
 who works somewhere interesting?"

[Name field — optional, no send, no storage]

"You don't have to reach out today.
 Just remember they exist."
```

- The statistic ("70%") displayed in mono font, amber, prominent
- Single text field for a name — purely for the user's own reflection
- Field value is NEVER stored, NEVER transmitted
- Even if they don't type anything, the prompt plants the seed
- Closing text appears whether or not they typed

Create: `/public/interventions/c3-network-nudge.js`

---

## INTEGRATION

1. Add `<script>` tags for both in `index.html`
2. Register C2 and C3 in intervention registry
3. Add to suite navigator (Tier C — clay #b8856e)
4. C2 needs time-of-day detection (use same helper as A3's late-night check)
5. C2's localStorage key: `bmhi_momentum_responses` (array of {date, prompt_type, response_preview})
   - Store only first 20 chars of response as preview, for the user's own reference
   - Full response stays in-session only

---

## TESTING

1. C2 shows time-appropriate prompt (test by changing system clock or mocking)
2. C2 text area works, response saves to localStorage
3. C3 displays statistic prominently, field works, closing text shows
4. C3 field value is not in localStorage or any network request
5. Both work at 375px mobile
6. Suite navigator now shows full A, B, C tiers

---

## WHAT THE NEXT SESSION BUILDS

Session 08 adds D1 (3-Sentence Release) — the highest-evidence emotional processing intervention.
