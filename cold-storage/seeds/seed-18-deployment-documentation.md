# SEED 18 — Deployment & Documentation
# BMHI Build Sequence · Session 18 of 18
# Ship It

---

## WHAT EXISTS

Sessions 01–17 built: The complete BMHI suite — all 16 interventions, Long Arc Protocol, delivery mechanisms, Cloudflare Worker, polished demo mode.

---

## WHAT YOU ARE BUILDING

### 1. Cloudflare Pages Deployment

**Configuration file:** `wrangler.jsonc` (or Pages-specific config)

```jsonc
{
  "name": "bmhi",
  "pages_build_output_dir": "./public"
}
```

**Deployment steps** (document in README):

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Authenticate
wrangler login

# 3. Deploy Pages (static site)
wrangler pages deploy ./public --project-name bmhi

# 4. Deploy Worker (measurement backend)
cd worker && wrangler deploy

# 5. Configure custom domain (optional)
# In Cloudflare dashboard: Pages → bmhi → Custom domains → Add
```

**Environment configuration:**
- Production worker URL → set in `index.html` or via Cloudflare Pages environment variable
- D1 database → created during worker deployment
- KV namespace → created during worker deployment

### 2. README.md

Create `/README.md` with:

```markdown
# BMHI — Brief Mental Health Intervention Suite

Evidence-based micro-interventions for job seekers at the moment
a search session ends without a click.

## What This Is

A population-level behavioral health touchpoint, grounded in 30+ years
of peer-reviewed evidence, designed for the 4.54 million people per week
who search for a job and find nothing.

Principal Investigator: J.E. Thomas, PhD
Clinical Framework: T.R. Insel, MD (SBIRT / Detection-First / Measurement-Based Care)

## The Suite

### Tier A — Somatic Reset
- **A1**: Visual Breath Pacer (T1 evidence)
- **A2**: Body Scan (T2)
- **A3**: Two-Minute Reset (T2)

### Tier B — Cognitive Reframe
- **B1**: The Data Reframe (T3)
- **B2**: Defusion Exercise (T2, ACT-derived)
- **B3**: Cognitive Reappraisal (T2)
- **B4**: Progress Mapping (T3)

### Tier C — Behavioral Activation
- **C1**: The One Small Thing (T1)
- **C2**: The Momentum Builder (T2)
- **C3**: The Network Nudge (T3)

### Tier D — Emotional Processing
- **D1**: 3-Sentence Release (T1, Pennebaker-derived)
- **D2**: Self-Compassion Mirror (T2, Neff-derived)
- **D3**: Gratitude Micro-Exercise (T2)
- **D4**: The Strength Anchor (T3)

### Tier E — Flow State
- **E1**: Pattern Match Micro-Game (T1)
- **E2**: Open Canvas (T3)

### Tier F — Screening & Referral
- **F1**: Check-In Screen (T1, SBIRT model)
- **F2**: Population Mirror (T3)

### Tier G — Returning User Protocol
- **G1**: Long Arc Protocol (progressive deepening sequence)

## Architecture

```
public/                    ← Static site (Cloudflare Pages)
  index.html               ← App shell + CSS
  app.js                   ← Core engine
  delivery.js              ← Delivery mechanisms
  embed.html               ← Embed test harness
  interventions/            ← One file per intervention
    a1-breath-pacer.js
    a2-body-scan.js
    ...

worker/                    ← Cloudflare Worker
  src/index.js             ← API endpoints
  wrangler.toml            ← Worker config
```

## Deployment

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Static Site
```bash
wrangler pages deploy ./public --project-name bmhi
```

### Worker Backend
```bash
cd worker
wrangler d1 create bmhi-events
wrangler kv namespace create KV
# Update wrangler.toml with returned IDs
wrangler deploy
```

### Integration with Job Sites
```html
<!-- On your job search page: -->
<script>
  window.__BMHI_WORKER__ = 'https://bmhi-worker.your-subdomain.workers.dev';
</script>
<script src="https://bmhi.pages.dev/delivery.js"></script>
<script>
  // BMHI triggers automatically on zero-click exit
  // Or trigger manually:
  BMHI_DELIVERY.trigger('popup');
</script>
```

## Measurement

Events emitted per session (§7 of seed.md):
- `MHIL_TRIGGER` — intervention fired
- `MHIL_START` — intervention displayed
- `MHIL_ENGAGE` — user interaction
- `MHIL_CLOSE` — intervention ended
- `MHIL_RETURN` — user returned to site

Primary outcome variable: `return_visit_rate` × `intervention_id` × `visit_number`

## Ethical Framework

1. Do no harm first
2. Never weaponize vulnerability
3. Referral is not optional for acute distress
4. Privacy is the mechanism, not just the policy
5. This is not a medical device

## License

Proprietary — Results Generation, Austin TX
```

### 3. Pilot Configuration Documentation

Create `/docs/PILOT.md` documenting the Phase 1 pilot configuration:

```
Phase 1 — Proof of Mechanism (4 weeks)
  Domains:     thesejobs.net, jobcafes.com
  Population:  ~12,588 recoverable exits/week
  Delivery:    POPUP (primary), EMBEDDED (holdout)
  Interventions: A1, B1, D1, E1 (one per session, rotating)
  Success:     ≥15% completion rate; no decline in return visit rate
```

### 4. Final Verification Checklist

Create `/docs/LAUNCH-CHECKLIST.md`:

```markdown
# Launch Checklist

## Technical
- [ ] All 16 interventions render correctly
- [ ] Landing sequence plays smoothly
- [ ] Session cookie sets/reads correctly
- [ ] Long Arc Protocol routes correctly for visits 1-8+
- [ ] Measurement events POST to worker
- [ ] Worker stores events in D1
- [ ] Population counter returns realistic numbers
- [ ] Delivery mechanisms (popup, embedded) work on target domains
- [ ] Mobile: all interventions work at 375px
- [ ] Performance: < 200KB page weight (excluding fonts)
- [ ] No console errors in production

## Clinical
- [ ] F1 check-in screen fires on visit ≥ 4
- [ ] Score 1-2 shows referral card with correct crisis numbers
- [ ] Crisis Text Line: 741741
- [ ] 988 Lifeline: 988
- [ ] SAMHSA: 1-800-662-4357
- [ ] D1 text is NEVER transmitted (verify in Network tab)
- [ ] All text inputs have privacy notice visible
- [ ] No text content is stored server-side
- [ ] Late-night routing works (after 10pm → somatic priority)

## Legal
- [ ] Privacy policy reviewed
- [ ] No PII collected without consent
- [ ] Cookie consent mechanism (if required by jurisdiction)
- [ ] "Not a medical device" language present
- [ ] "Evidence-grounded" NOT "clinically proven" in all copy

## Analytics
- [ ] D1 database schema deployed
- [ ] KV namespace created
- [ ] Events ingesting correctly
- [ ] Population counter incrementing
- [ ] Can query: return_visit_rate by intervention_id
```

### 5. Environment Setup

Create `/public/_headers` for Cloudflare Pages:

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Create `/public/_redirects` if needed for SPA routing.

---

## TESTING

1. Full deployment to Cloudflare Pages succeeds
2. Worker deployment succeeds
3. Production site loads correctly
4. All interventions work in production
5. Measurement events flow from client → worker → D1
6. README is comprehensive and accurate
7. Launch checklist items all pass
8. Custom domain (if configured) resolves correctly

---

## WHAT HAPPENS NEXT

After all 18 sessions are complete:
- Phase 1 pilot begins on thesejobs.net and jobcafes.com
- Data collection starts on day one
- 4-week proof of mechanism
- If ≥15% completion rate: expand to Phase 2

*"They searched today. They found nothing. Give them something."*
*— T.R. Insel, MD*
