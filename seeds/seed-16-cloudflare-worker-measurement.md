# SEED 16 — Cloudflare Worker: Measurement + Email
# BMHI Build Sequence · Session 16 of 18
# Backend Infrastructure

---

## WHAT EXISTS

Sessions 01–15 built: All interventions, Long Arc Protocol, delivery mechanisms.
Measurement events currently log to console and sessionStorage.

---

## WHAT YOU ARE BUILDING

A Cloudflare Worker that serves as the backend for:
1. **Measurement event collection** (§7)
2. **Email delivery** for the email trigger mechanism
3. **Population counter** for F2 (Population Mirror)

### File Structure

```
worker/
  wrangler.toml       ← Cloudflare configuration
  src/
    index.js           ← Worker entry point
    measurement.js     ← Event ingestion endpoint
    email.js           ← Email trigger endpoint (uses Cloudflare Email Workers or Mailgun)
    counter.js         ← Population counter endpoint
```

### 1. Measurement Event Collection

Endpoint: `POST /api/events`

Accepts the measurement events from §7:

```javascript
// Request body:
{
  event: 'MHIL_TRIGGER' | 'MHIL_START' | 'MHIL_ENGAGE' | 'MHIL_CLOSE' | 'MHIL_RETURN',
  data: {
    session_id: 'anonymous-cookie-id',
    domain: 'thesejobs.net',
    visit_number: 3,
    trigger_type: 'popup',
    time_of_day: 'evening',
    // ... per §7 event schemas
  },
  timestamp: '2026-03-27T22:15:00Z'
}
```

**Storage options (configure in wrangler.toml):**
- **Cloudflare Analytics Engine** (preferred — built for this use case)
- **Cloudflare D1** (SQLite — if relational queries needed)
- **Cloudflare KV** (for simple counters and session data)

For the initial build, use **KV** for the counter and **D1** for events:

```toml
# wrangler.toml
name = "bmhi-worker"
main = "src/index.js"
compatibility_date = "2026-03-01"

[[d1_databases]]
binding = "DB"
database_name = "bmhi-events"
database_id = "placeholder-replace-on-deploy"

[[kv_namespaces]]
binding = "KV"
id = "placeholder-replace-on-deploy"
```

**D1 Schema:**
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  session_id TEXT,
  domain TEXT,
  visit_number INTEGER,
  trigger_type TEXT,
  intervention_id TEXT,
  mechanism_tier TEXT,
  interaction_type TEXT,
  depth_score INTEGER,
  text_input_chars INTEGER,
  time_in_seconds REAL,
  completion_status TEXT,
  referral_shown INTEGER,
  referral_clicked INTEGER,
  time_of_day TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_intervention ON events(intervention_id);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_type ON events(event_type);
```

**CORS headers** — the worker must allow requests from job search domains:
```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Restrict in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### 2. Email Trigger

Endpoint: `POST /api/email-trigger`

```javascript
// Request body:
{
  email: 'user@example.com',
  consent: true,
  session_id: 'anonymous-cookie-id'
}
```

- Validate email format
- Store consent record in D1
- Send email with link to BMHI page
- Use Cloudflare Email Workers, Mailgun, or Resend API
- Email content: brief, warm, links to `/public/index.html`
- Rate limit: max 1 email per session_id per day

### 3. Population Counter

Endpoint: `GET /api/population-count`

- Returns the current day's count of MHIL_TRIGGER events
- Stored in KV with daily key: `counter:2026-03-27`
- Incremented on each MHIL_TRIGGER event
- Returns realistic number (seed with base count if needed)

```javascript
async function getPopulationCount(env) {
  var today = new Date().toISOString().split('T')[0];
  var count = await env.KV.get('counter:' + today);
  return parseInt(count || '0') + 648138; // Base daily average
}
```

### Client-Side Integration

Update `/public/app.js` measurement functions:

```javascript
// Current: console.log only
// New: POST to worker endpoint
function emitEvent(eventType, data) {
  console.log('[bmhi]', eventType, data);

  // Send to worker (fire-and-forget, don't block intervention)
  var endpoint = window.__BMHI_WORKER__ || '';
  if (!endpoint) return;

  fetch(endpoint + '/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventType,
      data: data,
      timestamp: new Date().toISOString()
    })
  }).catch(function() {}); // Silent failure — never block the intervention
}
```

**Critical: measurement NEVER blocks the intervention.** All network calls are fire-and-forget. If the worker is down, the intervention still works perfectly.

---

## DEPLOYMENT NOTES

```bash
# Install wrangler
npm install -g wrangler

# Create D1 database
wrangler d1 create bmhi-events

# Create KV namespace
wrangler kv namespace create KV

# Update wrangler.toml with returned IDs

# Deploy
wrangler deploy

# Set worker URL in BMHI app
# In index.html: <script>window.__BMHI_WORKER__ = 'https://bmhi-worker.your-subdomain.workers.dev';</script>
```

---

## TESTING

1. Worker deploys successfully with `wrangler dev`
2. POST /api/events accepts and stores events
3. GET /api/population-count returns a number
4. POST /api/email-trigger validates and (in dev) logs email
5. CORS headers allow cross-origin requests
6. Client-side: events POST silently without blocking UI
7. Client-side: F2 Population Mirror fetches live count
8. Worker failure does NOT break any intervention

---

## WHAT THE NEXT SESSION BUILDS

Session 17 polishes the suite navigator, demo mode, and overall UX quality.
