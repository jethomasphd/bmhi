# Launch Checklist

## Technical — Interventions
- [ ] A1 Breath Pacer: circle animates, text prompts guide breathing
- [ ] A2 Body Scan: 5-phase text sequence with glow shifts
- [ ] A3 Two-Minute Reset: countdown works, rain/white noise/silence toggle
- [ ] B1 Data Reframe: card displays, auto-completes after 15s
- [ ] B2 Defusion: 3-screen sequence, text input, echo works
- [ ] B3 Reappraisal: prompt + input + closing text
- [ ] B4 Progress Map: bar chart animates, visit count displays
- [ ] C1 One Small Thing: 3 chips, checkmark animation
- [ ] C2 Momentum: time-of-day prompt, textarea, localStorage save
- [ ] C3 Network Nudge: stat + input, field value NOT stored
- [ ] D1 Release: textarea, sentence detection, "Let it go", dissolution animation (blur + fade)
- [ ] D2 Self-Compassion: friend text bubble, user response echoed back
- [ ] D3 Gratitude: single field, closing text
- [ ] D4 Strength Anchor: input + previous answers from localStorage
- [ ] E1 Pattern Match: 4x4 grid, pairs match, NO score/timer/counter
- [ ] E2 Open Canvas: drawing works (mouse + touch), 3 colors, save to PNG
- [ ] E3 Meditative Blocks: pieces drop, rotate, lock; lines clear with affirmation words; no game-over
- [ ] E4 Meditative Serpent: snake moves, wraps edges, self-collision trims tail; food produces affirmations
- [ ] E5 Rhythmic Breaker: ball bounces off paddle/walls/bricks; ball resets on miss; bricks regenerate
- [ ] E6 Mindful Garden: plants sprout/grow, tap to bloom, radiating petals; tap-based canvas interaction
- [ ] F1 Check-In: emoji scale, score 1-2 shows referral card
- [ ] F2 Population Mirror: number animates counting up

## Technical — Core Systems
- [ ] Session cookie sets and persists across reloads (90-day, no PII)
- [ ] Visit counter increments correctly (once per day)
- [ ] Long Arc Protocol routes correctly for visits 1-7
- [ ] Visit 8+ selects by engagement score, no back-to-back same tier
- [ ] Late-night (after 10pm): visit 1 routes to A3, somatic weighted
- [ ] Visit 4: F1 pre-layer fires before main intervention
- [ ] Engagement history persists in localStorage
- [ ] Suite navigator shows all 22 interventions grouped by tier
- [ ] Users land directly on suite view (no landing page)
- [ ] Can switch freely between any intervention via suite navigator
- [ ] Dismiss (x) button works at any point, returns to suite view
- [ ] No orphan timers/animations after dismiss or intervention switch
- [ ] About page loads correctly, back link works
- [ ] Measurement events log to console and sessionStorage

## Technical — Delivery Mechanisms
- [ ] Popup: exit-intent overlay with iframe, dismiss works and resets
- [ ] Embedded: iframe injects inline, scrolls into view
- [ ] Pop-Under: opens new window (may be blocked — expected)
- [ ] Email Opt-In: banner slides up, consent saves to localStorage
- [ ] embed.html: can toggle freely between all four mechanisms
- [ ] A/B cookie assignment persists

## Mobile (test at 375px, 390px, 414px)
- [ ] All interventions render without horizontal scroll
- [ ] Text inputs: virtual keyboard doesn't break layout
- [ ] Touch targets: minimum 44px for all interactive elements
- [ ] Suite navigator scrolls horizontally on narrow screens
- [ ] Drawing canvas works with touch
- [ ] Emoji buttons are thumb-friendly

## Clinical & Ethical
- [ ] F1 fires on visit >= 4 (not before)
- [ ] Score 1-2 shows referral card — NOT instead of intervention
- [ ] Crisis Text Line: Text HOME to 741741
- [ ] 988 Suicide & Crisis Lifeline: Call or text 988
- [ ] SAMHSA Helpline: 1-800-662-4357
- [ ] D1 text is NEVER in any network request (verify Network tab)
- [ ] All text inputs have privacy notice visible
- [ ] No text content stored server-side (there IS no server)
- [ ] Late-night routing works (after 10pm)
- [ ] Language: "supportive" not "therapeutic"
- [ ] Language: "evidence-grounded" not "clinically proven"
- [ ] Language: "check-in" not "assessment"
- [ ] About page: "This is not therapy" disclaimer present
- [ ] About page: crisis resources listed

## Performance
- [ ] Page loads in < 2 seconds on 3G
- [ ] No console errors during full suite walkthrough
- [ ] Fonts load (Cormorant Garamond, Inter, JetBrains Mono)
- [ ] Noise overlay renders
- [ ] prefers-reduced-motion: animations skipped

## Deployment
- [ ] Cloudflare Pages: build output = `public/`, no build command
- [ ] Production branch set correctly
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enforced
- [ ] Security headers deployed (_headers file)
