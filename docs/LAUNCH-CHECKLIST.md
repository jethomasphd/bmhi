# Launch Checklist

## Interventions (19 total)

### Calm my body
- [ ] A1 Breath Reset: circle animates, 3 cycles (3-1-4 timing), progress dots, closes cleanly
- [ ] A2 Body Scan: 5-phase text sequence with glow shifts, auto-completes
- [ ] A3 Quiet Reset: countdown works, rain/white noise/silence toggle

### Quiet my mind
- [ ] B1 Reality Check: card displays, auto-completes after 15s
- [ ] B2 Step Back: 3-screen sequence, text input, echo works
- [ ] B3 Fresh Eyes: prompt + input + closing text

### Do something small
- [ ] C1 One Small Step: 3 chips, checkmark animation
- [ ] C3 Reach Out: stat + input, field value NOT stored anywhere

### Feel what I feel
- [ ] D1 Let It Out: textarea, sentence detection, "Let it go", dissolution (blur + fade), auto-complete at 60s
- [ ] D2 Self-Kindness: friend text bubble, user response echoed back
- [ ] D3 Gratitude: single field, closing text

### Get out of my head
- [ ] E1 Match: 4x4 grid, pairs match, NO score/timer/counter
- [ ] E2 Draw: drawing works (mouse + touch), 3 colors, save to PNG
- [ ] E3 Blocks: pieces drop, rotate, lock; lines clear with affirmation words; no game-over
- [ ] E4 Serpent: snake moves, wraps edges, self-collision trims tail; food produces affirmations
- [ ] E5 Breaker: ball bounces off paddle/walls/bricks; ball resets on miss; bricks regenerate
- [ ] E6 Garden: plants sprout/grow, tap to bloom, radiating petals; tap-based canvas interaction

### Get help
- [ ] F1 Check In: emoji scale, score 1-2 shows referral card
- [ ] F2 You're Not Alone: number animates counting up

## Core Systems
- [ ] Welcome screen ("Before you go") shows every visit
- [ ] Button text changes based on randomly selected intervention tier
- [ ] Random selection works — different intervention each reload
- [ ] Late-night (after 10pm): somatic weighting active
- [ ] Suite navigator appears after first intervention completes
- [ ] "There's more here if you want it" + "Why does this work?" shows on first completion
- [ ] Suite nav shows all 19 interventions grouped by felt-experience category
- [ ] Play tier shows SVG icons (not text labels)
- [ ] Can switch freely between any intervention via suite nav
- [ ] Dismiss (x) button works at any point, returns to suite
- [ ] No orphan timers/animations after dismiss or intervention switch
- [ ] Every intervention has a clear ending — no dead ends
- [ ] About page loads correctly, back link works

## Zero Storage
- [ ] No cookies set (verify in DevTools > Application > Cookies)
- [ ] No localStorage entries (verify in DevTools > Application > Local Storage)
- [ ] No sessionStorage entries (verify in DevTools > Application > Session Storage)
- [ ] No network requests to external services
- [ ] No `document.cookie` calls in any loaded script
- [ ] No `localStorage` calls in any loaded script
- [ ] No `sessionStorage` calls in any loaded script

## Embed
- [ ] embed.html loads with iframe inline between job listings
- [ ] Intervention works correctly inside iframe
- [ ] No storage leakage from iframe

## Mobile (test at 375px, 390px, 414px)
- [ ] All interventions render without horizontal scroll
- [ ] Text inputs: virtual keyboard doesn't break layout
- [ ] Touch targets: minimum 44px for all interactive elements
- [ ] Suite navigator scrolls/wraps on narrow screens
- [ ] Drawing canvas works with touch
- [ ] Game controls are thumb-friendly

## Clinical & Ethical
- [ ] Crisis Text Line: Text HOME to 741741
- [ ] 988 Suicide & Crisis Lifeline: Call or text 988
- [ ] SAMHSA Helpline: 1-800-662-4357
- [ ] All text inputs have privacy notice visible
- [ ] No text content stored anywhere (there IS no server, no storage)
- [ ] Language: "supportive" not "therapeutic"
- [ ] Language: "evidence-grounded" not "clinically proven"
- [ ] About page: "This is not therapy" disclaimer present
- [ ] About page: crisis resources listed

## Performance
- [ ] Page loads in < 2 seconds on 3G
- [ ] No console errors during full suite walkthrough
- [ ] Fonts load (Cormorant Garamond, Inter, JetBrains Mono)
- [ ] prefers-reduced-motion: animations skipped

## Deployment
- [ ] Any static host works — just serve `public/`
- [ ] HTTPS enforced
- [ ] Security headers deployed (_headers file)
