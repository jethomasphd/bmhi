# Before you go.

You searched today. That counts.

**BMHI** is a brief mental health intervention suite for job seekers. It delivers evidence-based micro-exercises at the moment someone needs them most — after a job search that didn't go the way they hoped.

No accounts. No tracking. No cookies. No data stored. Just a quiet pause, then back to a fresh search.

---

### What it does

Nineteen exercises across six categories, each grounded in peer-reviewed research:

| | Category | What it helps with |
|---|---|---|
| **Calm my body** | Breathing, body scan, quiet reset | Settling the nervous system |
| **Quiet my mind** | Reality check, step back, fresh eyes | Interrupting negative thought spirals |
| **Do something small** | One small step, reach out | Restoring a sense of agency |
| **Feel what I feel** | Let it out, self-kindness, gratitude | Processing difficult emotions safely |
| **Reset before the next search** | Match, draw, blocks, serpent, breaker, garden | Flow states that crowd out rumination |
| **Get help** | Check in, you're not alone | Screening and crisis resources |

Every exercise ends. Every click leads somewhere. Every session loops the user back to a fresh job search with a prominent `Show me better matches →` CTA.

---

### Repository layout

```
bmhi/
  CLAUDE.md             Integration guide for the tech team's coding agent
  README.md             You are here
  docs/
    LAUNCH-CHECKLIST.md QA passes for each of the 19 interventions
    PILOT.md            Phase 1 pilot parameters
  public/               The live, shippable unit
    index.html            App shell (welcome → intervention → post)
    app.js                State machine, random selection, post-CTA
    ads.js                Single-slot clinical partner ad unit
    delivery.js           Four host-page delivery mechanisms
    about.html            The science, in plain language
    embed.html            DEMO — mock job board showing all four triggers
    interventions/        19 self-contained intervention modules
    _headers              Security / framing headers
  cold-storage/         Archival: seeds, position papers, older prototypes
```

**For anyone integrating this into a real job board:** read `CLAUDE.md`. It tells you what to ship, what not to ship, and how to configure.

---

### How it runs

One static site. No build step. No dependencies. Serve `public/` and it works.

```bash
cd public && python3 -m http.server 8000
# Then open http://localhost:8000/             — the intervention suite
#              http://localhost:8000/embed.html — the demo
```

---

### The four delivery mechanisms

A host job board fires one of these when it detects a search-failure signal (exit intent, long dwell, zero results, pagination without clicks):

- **Popup** — modal iframe over the current page
- **Pop-Under** — new window behind the current one
- **Embedded** — inline iframe in the result list
- **Email CTA** — bottom banner with email capture

Each mechanism loads the same `index.html` and runs the full sequence: welcome → intervention → post. The post stage always offers `Show me better matches →`, which breaks out of the iframe and sends the user to a fresh job search query.

See `public/embed.html` for a working demo. See `CLAUDE.md` for integration.

---

### Sponsored partner slot

A single, dismissible clinical-partner card renders inside the post-intervention stage. Inventory is placeholder today (Talkspace, BetterHelp); real URLs are wired at deploy time via `BMHI_ADS.configure([...])`. One card at a time, design-system native, no pixels, no tracking. Details in `CLAUDE.md`.

---

### The science

Every exercise traces to published research. Primary sources:

- **Breathing** — Balban et al. 2023 (Stanford RCT): cyclic physiological sighing
- **Expressive writing** — Pennebaker & Smyth 2016: 30+ years, 200+ replications
- **Cognitive defusion** — Hayes et al. 2006: Acceptance and Commitment Therapy
- **Flow-state resets** — Holmes et al. 2009 (Tetris reduces intrusive memories); Russoniello et al. 2009 (casual games + HRV)
- **Self-compassion** — Neff & Germer 2013: Mindful Self-Compassion RCT
- **Implementation intentions** — Gollwitzer & Sheeran 2006: 200+ replications
- **Nature restoration** — Kaplan 1995; Ulrich et al. 1991
- **SBIRT screening** — Babor et al. 2007, adapted for digital contexts

Full citations and lay explanations: [about the science](public/about.html)

---

### Privacy

**Nothing is stored. Nothing is tracked. Nothing leaves the browser.**

This is not just a policy — it is a clinical requirement. Pennebaker's research shows that if people believe their writing will be read, they self-censor, and the cortisol-reduction mechanism fails. Privacy is the mechanism.

---

### Who

**PI:** Jacob E. Thomas, PhD — Health Behavior, UT Austin; Clinical Psychology, Columbia

**Clinical framework:** Thomas R. Insel, MD — former Director, National Institute of Mental Health (2002–2015)

*"They searched today. They found nothing. Give them something — then send them back with a fresh query."*

---

### This is not therapy

This is a collection of evidence-grounded wellness exercises. It is not a medical device, does not diagnose any condition, and is not a substitute for professional care.

If you are in crisis: **988** (call or text) · **741741** (text HOME) · **1-800-662-4357** (SAMHSA)

---

<details>
<summary>Cold storage</summary>

The `cold-storage/` directory contains archival materials from the development process:

- `seeds/` — build-sequence specification files
- `seed.md` — master clinical specification
- `from_beyond/` — COMPANION protocol design sessions
- `RecursiveMarketing-main/` — original prototype
- `removed-interventions/` — interventions deprecated during clinical review

The live application is entirely within `public/`.
</details>
