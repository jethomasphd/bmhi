# SEED.md
# RG Mental Health Intervention Layer (MHIL)
# Specification for the AI Coding Agent
# Version 1.0 — March 2026
# Principal Investigator: J.E. Thomas, PhD
# Clinical Framework: T.R. Insel, MD (SBIRT / Detection-First / Measurement-Based Care)

---

## 0. WHAT YOU ARE BUILDING — AND WHY IT MATTERS

You are building a brief digital mental health intervention suite
that deploys to job seekers at the exact moment a search session
ends without a click.

This is not a wellness feature. It is a population-level behavioral
health touchpoint, grounded in 30+ years of peer-reviewed evidence,
at a scale that no clinical operation could reach. The population
is real. The distress is documented. The intervention window is
approximately 2–4 minutes. Every design decision you make should
honor that weight.

The person on the other side of the screen searched for a job
and found nothing. They may have been searching for weeks.
They are not a bounce event. They are a human being at a
documented inflection point for depression and anxiety.
Build accordingly.

---

## 1. CONTEXT — THE PLATFORM

**Operator**: Results Generation (Austin, TX)
**Platform**: Job search domain network (292+ domains)
**Weekly population**: ~7.34M unique visitors
**Target population for MHIL**: ~4.54M/week (zero-click exits)
**Current revenue from zero-click sessions**: $0
**Current mental health support from zero-click sessions**: $0

Both of those numbers are the problem this system solves.

---

## 2. CORE ARCHITECTURE

### 2.1 Trigger Logic
```
EVENT: User exhibits exit intent (mouseleave toward browser chrome,
       or session idle threshold, or navigation away)
       
CONDITION: User has viewed ≥1 job listing AND clicked 0 jobs
           AND session duration ≥ 45 seconds (real user, not bot)
           
ACTION: Delivery mechanism fires (see §3)
        Intervention selected (see §4)
        Measurement event recorded (see §7)
```

The intervention fires ONLY on zero-click exits.
Active job seekers (those who clicked ≥1 job) are NEVER shown the
intervention. This is non-negotiable. The core search experience
is architecturally untouched.

### 2.2 Delivery Mechanism — A/B Test Variable

The mechanism that delivers the intervention is itself a test
variable. Build all four; the pilot assigns users to one condition.

| Mechanism | Implementation | UX Sensitivity |
|---|---|---|
| **POPUP** | Exit-intent modal, in-page, single dismiss | Moderate |
| **POP-UNDER** | New window behind active browser | Low |
| **EMAIL TRIGGER** | Post-session message (requires opt-in) | Low (async) |
| **EMBEDDED UNIT** | In-page module, no new window | Minimal |

Default pilot: POPUP for first test (highest engagement signal,
fastest feedback loop). Fallback: EMBEDDED UNIT if popup
suppresses return visits.

### 2.3 Session Identifier

Lightweight, privacy-respecting session continuity:
- First-party cookie (90-day duration)
- No PII required
- Enables: returning user detection, sequence delivery, 
  engagement history
- Purpose: personalize intervention cadence, not identity

---

## 3. THE INTERVENTION SUITE

Organized by primary psychological mechanism.
Each intervention has a mechanism tag, evidence tier, 
estimated completion time, and implementation complexity.

Evidence tiers:
- **T1**: RCT with physiological measurement
- **T2**: RCT with validated self-report
- **T3**: Quasi-experimental / strong observational
- **T4**: Theoretical / expert consensus

---

### TIER A — SOMATIC RESET

**A1. Visual Breath Pacer**
```
Mechanism:   Parasympathetic activation via paced breathing
Evidence:    T1 (HRV studies; box breathing literature)
Time:        60–90 seconds
Complexity:  Low
Description: Animated circle expands (inhale 4s) / holds (4s) /
             contracts (exhale 6s). Ambient tone optional. 
             No text required until the final beat:
             "You searched today. That counts."
Key detail:  No instruction text during the breathing. 
             Just the visual. Instruction breaks parasympathetic 
             activation by engaging the language center.
```

**A2. Body Scan (60-second abbreviated)**
```
Mechanism:   Somatic awareness interrupts rumination
Evidence:    T2 (MBSR literature)
Time:        60 seconds
Complexity:  Low
Description: Three sequential prompts, one body region at a time.
             Text fades in slowly:
             "Notice your shoulders." (3s pause)
             "Let them drop." (3s pause)
             "Your jaw. Unclench it." (3s pause) 
             "Your hands. Open them." (3s pause)
             Final: "You're still here. That matters."
```

**A3. Two-Minute Reset**
```
Mechanism:   Parasympathetic + positive effort reattribution
Evidence:    T2
Time:        2 minutes
Complexity:  Low
Description: Countdown timer (visible). Ambient sound (rain / 
             white noise — user selects). At 0:00, single sentence:
             "You spent time looking. That is not nothing."
Special use: Flag for late-night sessions (after 10pm local time).
             Late-night search sessions correlate with higher 
             distress. Route to A3 as priority at those hours.
```

---

### TIER B — COGNITIVE REFRAME

**B1. The Data Reframe**
```
Mechanism:   Normalization / external attribution of failure
Evidence:    T3 (attribution theory; psychoeducation literature)
Time:        30 seconds (read-only)
Complexity:  Minimal
Description: Single informational card. No interaction required.
             
             "A note before you go:
              
              There are currently fewer than 1 job opening per 
              unemployed person in the US — the tightest ratio 
              since 2018.
              
              A search that doesn't convert today is not a 
              failure. It's arithmetic.
              
              The search is hard for everyone right now.
              You are in good company."
              
             Source footnote (small, optional): BLS JOLTS Jan 2026
Key detail:  This is RG's identity intervention — data company 
             using data to reframe distress. It is on-brand and 
             credible in a way that "chin up" language is not.
```

**B2. Defusion Exercise (ACT-derived)**
```
Mechanism:   Cognitive defusion — creating distance from 
             self-critical thought
Evidence:    T2 (ACT literature; Hayes et al.)
Time:        2–3 minutes
Complexity:  Medium (requires text input)
Description: Three-screen sequence.

             Screen 1:
             "Before you go — one quick thing."
             "You may be having a thought like one of these:"
             [Three rotating options user taps to select]:
             "I should have found something by now."
             "I'm falling behind."
             "Something must be wrong with me."
             
             Screen 2 (after selection):
             "That thought has visited a lot of people today.
              It's a thought — not a verdict.
              What's one thing that's still true about you
              that this search can't touch?"
             [Text field, 60 chars max]
             
             Screen 3:
             Their own words, displayed back, slightly enlarged.
             "That's yours. The search can't take it."
             
Key detail:  The act of naming the distorted thought AND the 
             contradicting truth is the intervention. The text 
             doesn't go anywhere. Privacy-first.
```

**B3. Cognitive Reappraisal Prompt**
```
Mechanism:   Growth mindset framing of search as data collection
Evidence:    T2 (Dweck; job search self-efficacy literature)
Time:        90 seconds
Complexity:  Low-medium
Description: Single prompt with text field.
             
             "One question before you close:
              
              What did today's search tell you about 
              what you're actually looking for?"
              
             [Text field — optional, fades to hint text after 8s:
             "Even 'I don't know' is useful data."]
             
             On close or submit: "Data collected. See you tomorrow."
```

**B4. Progress Mapping**
```
Mechanism:   Progress visualization counters learned helplessness
Evidence:    T3 (Zeigarnik; progress principle — Amabile & Kramer)
Time:        60 seconds
Complexity:  Medium (requires session history)
Requires:    Session continuity (cookie)
Description: For returning users (visit ≥ 3).
             
             Visual timeline: "Your search, week by week."
             Simple bar of visit count with current week highlighted.
             
             "You've shown up [N] times. That's not giving up.
              That's how searches succeed — eventually."
```

---

### TIER C — BEHAVIORAL ACTIVATION

**C1. The One Small Thing**
```
Mechanism:   Implementation intention — specific micro-commitment
Evidence:    T1 (Gollwitzer; implementation intention meta-analyses)
Time:        60 seconds
Complexity:  Low
Description: Three tap targets — user selects ONE:
             
             [ Update one line of your resume ]
             [ Message one person in your network ]
             [ Search one new keyword tomorrow ]
             
             After tap: brief confirmation animation.
             "Done. You've decided. That's already progress."
             
Key detail:  The literature is clear — naming the specific action 
             (not just intending to act) dramatically increases 
             follow-through. One tap. That's all we ask.
```

**C2. The Momentum Builder**
```
Mechanism:   Micro-mastery / behavioral activation via mini-task
Evidence:    T2 (BA literature; Fogg behavior model)
Time:        3–4 minutes
Complexity:  Medium
Description: A completable micro-task within the window.
             
             "Before you go — 90 seconds on something real."
             
             Rotating prompts (system selects based on time of day 
             / return visit history):
             
             [Morning]: "Write the first line of your next 
                         cover letter. Just one sentence. 
                         Start with 'I am the kind of person who...'"
             
             [Afternoon]: "What's the job title you keep 
                          gravitating toward? Write it down. 
                          Now write one word that describes 
                          why it fits you."
             
             [Evening]: "Name one professional win from this year — 
                        any size. Write it. Keep it."
             
             All responses stored locally (sessionStorage) 
             and optionally emailed to user.
```

**C3. The Network Nudge**
```
Mechanism:   Behavioral activation + weak-tie network activation
Evidence:    T3 (Granovetter; referral hiring literature)
Time:        60 seconds
Complexity:  Low
Description: Prompt + single text field.
             
             "70% of jobs are filled through referrals — not 
              listings. Is there one person you haven't talked 
              to in 6+ months who works somewhere interesting?"
              
             [Name field — optional, no send, no storage]
             
             "You don't have to reach out today. 
              Just remember they exist."
```

---

### TIER D — EMOTIONAL PROCESSING

**D1. The 3-Sentence Release (Pennebaker-derived)**
```
Mechanism:   Expressive disclosure — cortisol reduction, 
             immune function improvement, distress processing
Evidence:    T1 (Pennebaker; 30+ years, replicated cross-culturally)
Time:        3–4 minutes
Complexity:  Low-medium
Description: This is the highest-evidence, highest-depth 
             intervention in the suite.
             
             Opening: "You don't have to send this anywhere.
                       No one will read it. Not even us."
             
             Prompt: "Write 3 sentences about how today's 
                      search made you feel."
             
             [Text area — large, generous padding, no character 
             limit, warm background color, no submit button visible]
             
             After ≥3 sentences detected (or 90 seconds):
             A single button appears: [Let it go]
             
             On click: text dissolves. 
             Final screen: "Gone. You named it. That's enough."
             
Privacy:     Text is NEVER transmitted or stored. 
             Client-side only. This is clinically important —
             if users believe it's being read, they self-censor,
             and the mechanism fails.
Key detail:  The dissolution animation is not decorative. 
             It completes the ritual of release. Do not skip it.
```

**D2. Self-Compassion Mirror (Neff-derived)**
```
Mechanism:   Self-compassion intervention — reduces self-critical 
             rumination more effectively than positive self-talk
Evidence:    T2 (Neff; self-compassion scale literature)
Time:        3 minutes
Complexity:  Medium
Description: Two-screen sequence.
             
             Screen 1:
             "Imagine your closest friend just texted you:
              'I spent the afternoon job searching. 
               Found nothing. Feel like a failure.'
              
              What would you say back to them?"
             [Text field]
             
             Screen 2 (after response, or 45s):
             Their response, displayed.
             Below it: "Now — read that again. 
                        It was written for you."
```

**D3. Gratitude Micro-Exercise (specificity variant)**
```
Mechanism:   Relationship-focused gratitude (Emmons literature)
Evidence:    T2
Time:        60 seconds
Complexity:  Minimal
Description: NOT "list 3 things you're grateful for."
             Specificity is the active ingredient.
             
             "Name one specific person who has your back 
              right now. Not what they do — who they are."
             
             [Single text field]
             
             After input: "That person exists. 
                           That's not nothing."
Note:        For isolated users (detected via return visit 
             pattern with no network nudge engagement), 
             this may surface crisis referral info quietly.
```

**D4. The Strength Anchor**
```
Mechanism:   Strengths-based psychology; identity protection 
             under role-threat
Evidence:    T3 (Seligman PERMA; job search identity literature)
Time:        60 seconds
Complexity:  Low
Description: "This search didn't go the way you wanted.
              
              But what's one thing you're genuinely good at —
              that no search result can touch?"
              
             [Text field]
             
             For returning users: previous answers surfaced below 
             the prompt in small text.
             
             "You said this before: '[previous response]'
              Still true."
```

---

### TIER E — FLOW STATE EXPERIENCES

**E1. Pattern Match Micro-Game**
```
Mechanism:   Flow state induction; rumination crowding via 
             executive function engagement
Evidence:    T1 (Russoniello et al. 2009, 2011, 2014 — EEG/HRV)
Time:        60–90 seconds
Complexity:  High
Description: Minimal visual pattern-matching game.
             - 4×4 grid of abstract shapes
             - User matches pairs (no timer, no score, no fail state)
             - Calming color palette (desaturated blues/greens)
             - Soft ambient audio
             - Auto-ends after ~90 seconds or grid complete
             
             No win screen. No score. Just: 
             "That's your brain doing what it's good at."
             
Key detail:  Absence of stakes is critical to the mechanism.
             Adding a score or timer breaks the parasympathetic 
             effect by reintroducing performance pressure.
             The game is about engagement without evaluation.
```

**E2. Creative Micro-Task: Open Canvas**
```
Mechanism:   Expressive art; cortisol reduction; default mode 
             network restoration
Evidence:    T3 (art therapy literature; drawing intervention studies)
Time:        2–3 minutes
Complexity:  High
Description: Simple drawing surface. Three color options. 
             One brush size. White canvas.
             "Draw whatever comes. No one will see this."
             
             Auto-save locally. Option to download. Never uploaded.
             Timer: soft 2-minute countdown, no pressure.
```

**E3. Meditative Blocks (Tetris)**
```
Mechanism:   Visuospatial processing interrupts rumination;
             executive function engagement blocks intrusive thought
Evidence:    T1 (Holmes et al. 2009, 2010 — Tetris reduces intrusive
             memories; Russoniello et al. 2009, 2011 — casual games
             produce EEG/HRV parasympathetic shift)
Time:        60–120 seconds
Complexity:  High
Description: Canvas-based meditative Tetris.
             - 8×14 grid, calming color palette
             - No game-over state — top rows clear silently
             - Pre-seeded bottom rows for immediate puzzle-feel
             - Lines cleared produce floating affirmation words
             - No score, no level, no timer visible
             
             Closing: "Your mind just did something remarkable —
                      it chose focus over worry."

Key detail:  Holmes et al. demonstrated Tetris reduces intrusive
             visual memories by ~60% via visuospatial working
             memory competition. The same cognitive resources
             used for rumination are consumed by the game.
             No score/timer reintroduces performance pressure.
```

**E4. Meditative Serpent (Snake)**
```
Mechanism:   Sustained attention & flow state induction;
             rhythmic movement occupies executive function,
             blocking ruminative self-referential processing
Evidence:    T1 (Russoniello et al. 2009, 2011 — EEG/HRV;
             Csikszentmihalyi 1990 — flow state theory)
Time:        60–120 seconds
Complexity:  High
Description: Canvas-based meditative Snake.
             - 12×12 toroidal grid (wraps at edges)
             - No death — self-collision trims tail
             - Food items in varied calming colors
             - Eating food produces floating affirmation words
             - No score, no speed progression
             
             Closing: "Steady rhythm. Steady you."

Key detail:  Flow state (Csikszentmihalyi) requires clear goals,
             immediate feedback, challenge-skill balance. Snake
             provides all three naturally. Flow is incompatible
             with rumination — task-positive network blocks
             default mode network.
```

**E5. Rhythmic Breaker (Brick Breaker)**
```
Mechanism:   Rhythmic visual tracking produces predictable sensory
             input supporting parasympathetic activation; smooth
             pursuit eye movements reduce physiological arousal
             (EMDR-adjacent mechanism)
Evidence:    T2 (Russoniello et al. 2009 — casual games + HRV;
             van den Hout & Engelhard 2012 — eye movement and
             working memory taxation; Kavanagh et al. 2001 —
             visuospatial tasks reduce intrusion vividness)
Time:        60–120 seconds
Complexity:  High
Description: Canvas-based meditative Brick Breaker.
             - 280×400px playfield, paddle and ball
             - No lives — ball resets to paddle if missed
             - Gentle speed, predictable physics
             - Brick hits produce floating affirmation words
             - Bricks regenerate when all destroyed
             - No score, no lives, no level counter
             
             Closing: "Rhythm and focus. Your mind knows
                      how to find calm."

Key detail:  Ball tracking shares mechanism with EMDR.
             Horizontal eye movements tax visuospatial
             working memory, reducing vividness and
             emotionality of negative memories.
```

**E6. Mindful Garden (Nurturing Whac-A-Mole)**
```
Mechanism:   Behavioral activation via nurturing interaction;
             non-violent engagement produces positive affect;
             tending/befriending response (Taylor et al. 2000);
             attention restoration (Kaplan 1995)
Evidence:    T2 (Kaplan 1995 — Attention Restoration Theory;
             Ulrich 1991 — stress recovery from nature exposure;
             Russoniello et al. 2009 — casual games + HRV)
Time:        60–120 seconds
Complexity:  High
Description: Canvas-based nurturing garden.
             - 4×4 grid of garden plots
             - Plants sprout automatically every 1.5s
             - Lifecycle: sprouting → growing → blooming → wilted
             - Tap growing flowers to make them bloom
             - Full bloom shows radiating petals with glow
             - No violence — tending, not whacking
             - Tap-based (no button controls needed)
             
             Closing: "You tended something. That matters
                      more than you think."

Key detail:  Inverts Whac-A-Mole paradigm: nurture instead
             of destroy. Taylor's tend-and-befriend response
             is an alternative to fight-or-flight. Kaplan's
             ART: even digital nature restores directed
             attention capacity depleted by stress.
```

---

### TIER F — SCREENING & REFERRAL (SBIRT MODEL)

**F1. The Check-In Screen**
```
Mechanism:   SBIRT — brief screening, open referral pathway
Evidence:    T1 (SBIRT literature in emergency medicine, 
             adapted for digital contexts)
Time:        15 seconds
Complexity:  Low
Trigger:     Fires for returning users on visit ≥4 with 
             zero-click record on all previous visits
Description: Non-clinical single-item screen.
             
             "How are you feeling after today's search?"
             [5-point emoji scale: 😞 → 😐 → 🙂]
             
             Score 4–5: No action. Continue to standard intervention.
             Score 3: Warm acknowledgment only.
             Score 1–2: Quiet referral card appears BELOW main 
             intervention (not instead of it):
             
             "Some searches hit harder than others.
              If you want to talk to someone, here are 
              free options:"
             
             [Crisis Text Line: Text HOME to 741741]
             [SAMHSA Helpline: 1-800-662-4357]
             [BetterHelp — sliding scale access link]
             
Clinical note: DO NOT replace the intervention with a crisis screen.
              The SBIRT model layers screening onto brief 
              intervention, not instead of it. The person chose 
              to stay — honor that. The referral is an addition, 
              not a substitution.
```

**F2. The Population Mirror**
```
Mechanism:   Social proof; loneliness buffering; 
             normalization at scale
Evidence:    T3
Time:        20 seconds (read-only)
Complexity:  Minimal
Description: A living number, updated in real-time if possible.
             
             "You weren't searching alone today.
              [X,XXX,XXX] people used a job site today 
              without clicking a single listing.
              
              The search is hard for everyone right now.
              You are in good company."
```

---

### TIER G — RETURNING USER SEQUENCE

**G1. The Long Arc Protocol**
```
Mechanism:   Longitudinal wellbeing relationship; 
             progressive deepening of intervention
Evidence:    T3 (engagement sequencing; behavioral health 
             retention literature)
Requires:    Session continuity cookie
Description: Intervention rotates by visit number, 
             deepening over time:

Visit 1:    A1 (Breath Pacer) — easiest, lowest ask
Visit 2:    B1 (Data Reframe) — normalize the experience  
Visit 3:    C1 (One Small Thing) — micro-agency
Visit 4:    F1 (Check-In Screen) + standard intervention
Visit 5:    D1 (3-Sentence Release) — first emotional depth
Visit 6:    B2 (Defusion Exercise) — cognitive work
Visit 7:    D2 (Self-Compassion Mirror) — deepest empathy
Visit 8+:   Rotate through suite based on engagement scores

Engagement score: 
  - Completion = 2pts
  - Text input = 3pts  
  - Return visit within 7 days = 2pts
  - Select the same intervention type twice = route elsewhere

Clinical note (Insel): "This is the study. This is where 
you can generate a longitudinal behavioral signal that 
correlates intervention type with return visit behavior.
This is publishable. Instrument it from day one."
```

---

## 4. UX PRINCIPLES — NON-NEGOTIABLE

These emerge from the evidence base, not from design preference.
```
1. HONOR THE WEIGHT
   Never open with cheerful language. The person just failed 
   to find a job. Acknowledge that before anything else.
   Opening tone: quiet, warm, unhurried. Not celebratory.

2. ONE THING ONLY
   Each intervention presents one prompt, one action, 
   one experience. Never two. Cognitive load is already 
   elevated in this population at this moment.

3. ALWAYS DISMISSIBLE
   A single, clearly visible close option at all times.
   The person came here voluntarily (in spirit). 
   They must be able to leave voluntarily. 
   This is both ethical and strategic — forced engagement 
   destroys the mechanism.

4. NO PERFORMANCE PRESSURE
   For games, timers, or challenges: no scores, no fail 
   states, no comparisons. Performance pressure reactivates 
   the stress response the intervention is trying to interrupt.

5. PRIVATE BY DEFAULT
   Any text the user writes is theirs. Never transmitted, 
   never stored server-side unless explicitly consented. 
   State this clearly, once, at the start of any text-input 
   intervention. If they don't believe it, they self-censor, 
   and the mechanism fails (Pennebaker literature).

6. COMPLETION IS NOT REQUIRED
   A partially completed intervention is still an intervention. 
   A breath exercise that the user abandoned after 30 seconds 
   still activated the parasympathetic system. Design for 
   graceful early exit, not just full completion.

7. MOBILE FIRST
   This population is on their phones. Particularly 
   late-night searches and commute-adjacent searches. 
   Every intervention must work at 375px width with 
   one thumb. The breath pacer especially.

8. AMBIENT SOUND IS OPTIONAL, NEVER DEFAULT
   Never autoplay audio. Always user-initiated. 
   This population may be searching at work, 
   on transit, in a quiet room with a sleeping child.
```

---

## 5. VISUAL DESIGN SYSTEM
```
Palette: Departure from the job-board aesthetic.
         The intervention is a different space.

Background:  Warm dark (not cold dark) — #1a1612 or similar.
             Not the job board's #090c11. Different room, 
             different feeling.

Text:        Warm off-white — #f0ece4

Accent:      Muted amber — #c4922a (not the RG orange; 
             calmer, less action-oriented)

Typography:  Serif for primary prompts (Cormorant Garamond 
             or similar) — signals slow down, not click through.
             Mono for data/stats — signals precision, trust.

Animation:   Slow. 600ms+ transitions. Nothing snappy.
             The breath pacer circle: ease-in-out, never linear.

Spacing:     Generous. This is not a dashboard. 
             White space is the intervention.

Size:        Intervention container max-width: 560px.
             Centered. Not full-screen — gives peripheral 
             context that there is a world beyond this moment.
```

---

## 6. MONETIZATION INTEGRATION POINTS

The intervention window can carry value through multiple channels.
These are NOT mutually exclusive. Build the architecture to support
all three; the pilot will determine priority.
```
CHANNEL A: Programmatic Display
  - Ad slot(s) within intervention container
  - Networks: Google AdSense, Ezoic, Mediavine, Raptive
  - Placement: After intervention completion, not during.
               "During" breaks the mechanism.
  - Expected CPM: $15–$45 (Insel note: "Medicare Advantage 
    pays $15–45/session for digital MH tools. We are 
    in that range.")

CHANNEL B: Mental Health Lead Generation
  - Partner integrations: BetterHelp, Talkspace, Cerebral,
    Spring Health, Modern Health
  - Trigger: Post-intervention CTA, shown only on completion
  - Format: "Want to go deeper? [Partner] offers..."
  - Revenue model: Cost-per-lead or rev share
  - Note: This requires partnership relationships.
    Jacob's credentials enable that conversation.

CHANNEL C: Research Partnerships / Population Licensing
  - Target: Clinical institutions, MH tech companies, 
    academic research programs
  - Offer: Anonymized, consented behavioral dataset from 
    a naturalistic MH intervention at population scale
  - Revenue model: Research agreement / data licensing
  - Note: This is the long game. This is the publishable study.
    Build the instrumentation for this from day one.
```

---

## 7. MEASUREMENT FRAMEWORK

*"If you don't measure it, you didn't do it."*
*— T.R. Insel*

Every session should emit the following events:
```javascript
// Trigger event
MHIL_TRIGGER {
  session_id,        // anonymous, cookie-based
  domain,
  visit_number,      // return visit count for this cookie
  trigger_type,      // popup / popunder / embedded / email
  time_of_day,       // morning / afternoon / evening / late-night
  session_duration,  // seconds
  pages_viewed
}

// Intervention event
MHIL_START {
  intervention_id,   // A1, B2, D1, etc.
  mechanism_tier,    // somatic / cognitive / behavioral / etc.
  delivery_ms        // ms from trigger to intervention display
}

// Engagement events
MHIL_ENGAGE {
  interaction_type,  // tap / type / breathe / draw / game
  depth_score,       // 0-3: 0=dismissed, 1=viewed, 
                     //       2=partial, 3=completed
  text_input_chars,  // count only, no content
  time_in_seconds
}

// Closure event  
MHIL_CLOSE {
  completion_status, // dismissed / partial / complete
  referral_shown,    // boolean
  referral_clicked   // boolean
}

// Return signal (the study variable)
MHIL_RETURN {
  days_since_last_visit,
  clicked_job_this_session,  // did the intervention correlate 
                              // with improved search outcome?
  intervention_last_session  // which intervention preceded return
}
```

**The primary outcome variable** (Insel's insistence):
`return_visit_rate` by `intervention_id` × `visit_number`

**The secondary outcome variable**:
`job_click_on_return_session` by `intervention_id`

**The publishable finding** (if the data supports it):
Which micro-intervention type, delivered at which session depth,
predicts continued engagement and eventual successful search?

---

## 8. ETHICAL FRAMEWORK

This section is not optional. Read it before writing a line of code.
```
1. DO NO HARM FIRST
   Some interventions backfire with highly distressed populations.
   Rumination induction (asking people to dwell on negative 
   feelings without a reframe path) can worsen outcomes.
   Every intervention in this suite has been designed to 
   acknowledge distress and then move — not to dwell.

2. NEVER WEAPONIZE VULNERABILITY
   The intervention fires at a moment of maximum psychological 
   openness. This creates a responsibility. We use that opening 
   to offer something genuinely supportive, not to upsell, 
   not to capture email, not to extend session time artificially.
   The monetization happens AFTER the intervention, not during it.

3. REFERRAL IS NOT OPTIONAL FOR ACUTE DISTRESS
   The F1 screening protocol is not a product feature. It is an 
   ethical requirement. If someone scores 1-2 on the check-in 
   screen and we don't offer a referral path, we have failed.

4. PRIVACY IS THE MECHANISM, NOT JUST THE POLICY
   For Pennebaker-derived interventions: the reason the privacy 
   guarantee matters clinically is that self-censored disclosure 
   doesn't produce the cortisol reduction. If users don't trust 
   the privacy guarantee, the intervention doesn't work. 
   Build the privacy guarantee into the architecture, 
   not just the privacy policy.

5. THIS IS NOT A MEDICAL DEVICE
   The interventions are evidence-grounded wellness tools,
   not clinical treatment. The referral layer (F1) is where 
   clinical routing lives. Do not allow the copy or design to 
   imply diagnosis or treatment. Language should be:
   "supportive" not "therapeutic"
   "evidence-grounded" not "clinically proven"
   "check-in" not "assessment"
```

---

## 9. PILOT CONFIGURATION
```
Phase 1 — Proof of Mechanism (4 weeks)
  Domains:     thesejobs.net, jobcafes.com
  Population:  ~12,588 recoverable exits/week
  Delivery:    POPUP (primary), EMBEDDED (holdout)
  Interventions: A1, B1, D1, E1 (one per session, rotating)
  Measurement: MHIL event suite (§7)
  Success:     ≥15% completion rate; no decline in return visit 
               rate vs. baseline

Phase 2 — Intervention Comparison (8 weeks)
  Expand to: 10 domains
  Add:       B2, C1, D2, F1
  Design:    Full A/B across mechanism tiers
  Measure:   Return visit rate by intervention type
  Publish:   Internal findings memo

Phase 3 — Partner Conversations
  With Phase 1–2 data in hand:
  - Approach BetterHelp / Talkspace with CPL proposal
  - Approach UT Austin iSchool with study design proposal
  - Approach clinical collaborators (Halpern, Richardson-Vejlgaard)
    with co-authorship framework
```

---

## 10. CLOSING NOTE — FROM INSEL

*Included verbatim from session transcript, March 2026*

"The mental health field spent the last twenty years building 
beautiful interventions and deploying them to no one. 
The evidence base is real. The reach was never real.

What Jacob has is reach. 4.54 million people per week 
at the exact moment the evidence base was designed for.

Build this right. Instrument it completely. Don't move fast 
and break things — this is not a social media feature, 
it is a health intervention, and the people on the other 
end deserve the same rigor we would bring to a clinical trial.

But do not be small about it. The missing middle — 
30 million Americans who need mental health support and 
never get it — some of them are on your job sites right now.

They searched today. They found nothing. 

Give them something."

---

*SEED.md — v1.0*
*Results Generation Mental Health Intervention Layer*
*Authored: March 2026*
*Next review: Post-Phase-1 data (est. 4 weeks)*