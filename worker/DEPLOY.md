# BMHI Worker — Deployment Guide

## Prerequisites

```bash
npm install -g wrangler
wrangler login
```

## Step 1: Create D1 Database

```bash
cd worker
wrangler d1 create bmhi-events
```

Copy the returned `database_id` into `wrangler.toml`.

## Step 2: Create KV Namespace

```bash
wrangler kv namespace create KV
```

Copy the returned `id` into `wrangler.toml`.

## Step 3: Deploy

```bash
wrangler deploy
```

Note the returned worker URL (e.g., `https://bmhi-worker.your-subdomain.workers.dev`).

## Step 4: Initialize Schema

```bash
curl -X POST https://bmhi-worker.your-subdomain.workers.dev/api/schema
```

## Step 5: Connect Frontend

Add this line to your `public/index.html` before the other scripts:

```html
<script>window.__BMHI_WORKER__ = 'https://bmhi-worker.your-subdomain.workers.dev';</script>
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/events` | Ingest measurement events (MHIL_TRIGGER, START, ENGAGE, CLOSE, RETURN) |
| GET | `/api/population-count` | Daily zero-click session count for F2 Population Mirror |
| POST | `/api/email-trigger` | Email opt-in from delivery mechanism (rate limited) |
| POST | `/api/schema` | Initialize D1 tables (run once) |
| GET | `/api/stats` | Basic event counts for dashboard |

## Testing Locally

```bash
cd worker
wrangler dev
# Worker runs at http://localhost:8787
# Set window.__BMHI_WORKER__ = 'http://localhost:8787' for local testing
```

## Notes

- All client-side calls are fire-and-forget — worker failure never blocks interventions
- CORS is set to `*` — restrict to your domains in production
- Email sending is stubbed (logged only) — wire up Resend/Mailgun/Cloudflare Email Workers
- KV counters expire after 48 hours
- Rate limit: 1 email per session per day
