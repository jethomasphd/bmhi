# Before you go.

You searched today. That counts.

**BMHI** is a brief mental health intervention suite for job seekers. It delivers evidence-based micro-exercises at the moment someone needs them most — after a job search that didn't go the way they hoped.

No accounts. No tracking. No cookies. No data stored. Just a quiet pause.

---

### What it does

Nineteen exercises across six categories, each grounded in peer-reviewed research:

| | Category | What it helps with |
|---|---|---|
| **Calm my body** | Breathing, body scan, quiet reset | Settling the nervous system |
| **Quiet my mind** | Reality check, step back, fresh eyes | Interrupting negative thought spirals |
| **Do something small** | One small step, reach out | Restoring a sense of agency |
| **Feel what I feel** | Let it out, self-kindness, gratitude | Processing difficult emotions safely |
| **Get out of my head** | Match, draw, blocks, serpent, breaker, garden | Flow states that crowd out rumination |
| **Get help** | Check in, you're not alone | Screening and crisis resources |

Every exercise ends. Every click leads somewhere. You can leave anytime.

---

### How it works

One HTML file. No build step. No server. No dependencies. No framework.

```
public/
  index.html          The entire app (shell + styles)
  app.js              State machine + random selection
  about.html          The science, in plain language
  embed.html          Demo: embedded on a job board
  interventions/      19 self-contained intervention files
```

**Deploy anywhere:**

```bash
# Any static host — just serve public/
```

**Embed on any site:**

```html
<iframe src="https://your-host.com/"
  style="width:100%;max-width:560px;height:600px;border:none;border-radius:12px;">
</iframe>
```

---

### The science

Every exercise traces to published research. The primary sources:

- **Breathing** — Balban et al. 2023 (Stanford RCT): cyclic physiological sighing
- **Expressive writing** — Pennebaker & Smyth 2016: 30+ years, 200+ replications
- **Cognitive defusion** — Hayes et al. 2006: Acceptance and Commitment Therapy
- **Flow state games** — Holmes et al. 2009: Tetris reduces intrusive memories; Russoniello et al. 2009: casual games + HRV
- **Self-compassion** — Neff & Germer 2013: Mindful Self-Compassion RCT
- **Implementation intentions** — Gollwitzer & Sheeran 2006: 200+ replications
- **Nature restoration** — Kaplan 1995; Ulrich et al. 1991
- **SBIRT screening** — Babor et al. 2007, adapted for digital contexts

Full citations and lay explanations: [about the science](public/about.html)

---

### Privacy

**Nothing is stored. Nothing is tracked. Nothing leaves the browser.**

This is not just a policy — it is a clinical requirement. Pennebaker's research shows that if people believe their writing will be read, they self-censor, and the cortisol reduction mechanism fails. Privacy is the mechanism.

---

### Who

**PI:** Jacob E. Thomas, PhD — Health Behavior, UT Austin; Clinical Psychology, Columbia

**Clinical framework:** Thomas R. Insel, MD — former Director, National Institute of Mental Health (2002–2015)

*"They searched today. They found nothing. Give them something."*

---

### This is not therapy

This is a collection of evidence-grounded wellness exercises. It is not a medical device, does not diagnose any condition, and is not a substitute for professional care.

If you are in crisis: **988** (call or text) · **741741** (text HOME) · **1-800-662-4357** (SAMHSA)

---

<details>
<summary>Cold storage (build history, reference materials, position papers)</summary>

The `cold-storage/` directory contains:
- `seeds/` — 22 build-sequence specification files
- `seed.md` — Master clinical specification
- `from_beyond/` — COMPANION protocol design sessions
- `RecursiveMarketing-main/` — Original prototype (The Gate)
- Position papers and strategic briefs

These are archival materials from the development process. The live application is entirely within `public/`.
</details>
