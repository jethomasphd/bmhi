// ═══════════════════════════════════════════════════════════════
// BMHI Worker — Measurement, Email, Population Counter
//
// "If you don't measure it, you didn't do it." — T.R. Insel
//
// All endpoints are fire-and-forget from the client side.
// Worker failure NEVER blocks an intervention.
// ═══════════════════════════════════════════════════════════════

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─── D1 Schema (run once via wrangler d1 execute) ──────────
const SCHEMA = `
CREATE TABLE IF NOT EXISTS events (
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
  referral_shown INTEGER DEFAULT 0,
  referral_clicked INTEGER DEFAULT 0,
  checkin_score INTEGER,
  time_of_day TEXT,
  is_pre_layer INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_intervention ON events(intervention_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(created_at);

CREATE TABLE IF NOT EXISTS email_consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  session_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/events' && request.method === 'POST') {
        return await handleEvent(request, env);
      }
      if (path === '/api/population-count' && request.method === 'GET') {
        return await handlePopulationCount(env);
      }
      if (path === '/api/email-trigger' && request.method === 'POST') {
        return await handleEmailTrigger(request, env);
      }
      if (path === '/api/schema' && request.method === 'POST') {
        return await initSchema(env);
      }
      if (path === '/api/stats' && request.method === 'GET') {
        return await handleStats(env);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal error' }, 500);
    }
  }
};

// ═══════════════════════════════════════════════════════════
// EVENT COLLECTION — POST /api/events
// ═══════════════════════════════════════════════════════════

async function handleEvent(request, env) {
  const body = await request.json();
  const event = body.event;
  const data = body.data || {};

  if (!event) {
    return jsonResponse({ error: 'Missing event type' }, 400);
  }

  // Store in D1
  try {
    await env.DB.prepare(`
      INSERT INTO events (
        event_type, session_id, domain, visit_number, trigger_type,
        intervention_id, mechanism_tier, interaction_type, depth_score,
        text_input_chars, time_in_seconds, completion_status,
        referral_shown, referral_clicked, checkin_score,
        time_of_day, is_pre_layer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event,
      data.session_id || null,
      data.domain || null,
      data.visit_number || null,
      data.trigger_type || null,
      data.intervention_id || null,
      data.mechanism_tier || null,
      data.interaction_type || null,
      data.depth_score || null,
      data.text_input_chars || null,
      data.time_in_seconds || null,
      data.completion_status || null,
      data.referral_shown ? 1 : 0,
      data.referral_clicked ? 1 : 0,
      data.checkin_score || null,
      data.time_of_day || null,
      data.is_pre_layer ? 1 : 0
    ).run();
  } catch (err) {
    console.error('D1 insert error:', err);
    // Don't fail — log and continue
  }

  // Increment population counter on TRIGGER events
  if (event === 'MHIL_TRIGGER') {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = 'counter:' + today;
      const current = parseInt(await env.KV.get(key) || '0');
      await env.KV.put(key, String(current + 1), { expirationTtl: 172800 }); // 48h TTL
    } catch (err) {
      console.error('KV counter error:', err);
    }
  }

  return jsonResponse({ ok: true });
}

// ═══════════════════════════════════════════════════════════
// POPULATION COUNT — GET /api/population-count
// ═══════════════════════════════════════════════════════════

async function handlePopulationCount(env) {
  const today = new Date().toISOString().split('T')[0];
  const key = 'counter:' + today;
  let count = 0;

  try {
    count = parseInt(await env.KV.get(key) || '0');
  } catch (err) {
    console.error('KV read error:', err);
  }

  // Add base daily average (4.54M / 7 ≈ 648K)
  const BASE_DAILY = 648138;
  const total = count + BASE_DAILY;

  return jsonResponse({ count: total, date: today });
}

// ═══════════════════════════════════════════════════════════
// EMAIL TRIGGER — POST /api/email-trigger
// ═══════════════════════════════════════════════════════════

async function handleEmailTrigger(request, env) {
  const body = await request.json();
  const email = (body.email || '').trim();
  const sessionId = body.session_id || 'unknown';

  // Validate
  if (!email || !email.includes('@') || email.length > 254) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  // Rate limit: 1 per session per day
  const today = new Date().toISOString().split('T')[0];
  const rateKey = 'email:' + sessionId + ':' + today;
  const existing = await env.KV.get(rateKey);
  if (existing) {
    return jsonResponse({ error: 'Already sent today' }, 429);
  }

  // Store consent
  try {
    await env.DB.prepare(
      'INSERT INTO email_consents (email, session_id) VALUES (?, ?)'
    ).bind(email, sessionId).run();
  } catch (err) {
    console.error('D1 email consent error:', err);
  }

  // Mark rate limit
  await env.KV.put(rateKey, '1', { expirationTtl: 86400 });

  // TODO: Wire up actual email sending via Resend, Mailgun, or
  // Cloudflare Email Workers. For now, log and acknowledge.
  console.log('[bmhi] Email trigger:', email, sessionId);

  return jsonResponse({ ok: true, message: 'Email queued' });
}

// ═══════════════════════════════════════════════════════════
// SCHEMA INIT — POST /api/schema
// ═══════════════════════════════════════════════════════════

async function initSchema(env) {
  const statements = SCHEMA.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const sql of statements) {
    await env.DB.prepare(sql).run();
  }

  return jsonResponse({ ok: true, message: 'Schema initialized' });
}

// ═══════════════════════════════════════════════════════════
// STATS — GET /api/stats (basic dashboard data)
// ═══════════════════════════════════════════════════════════

async function handleStats(env) {
  try {
    const total = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM events'
    ).first();

    const byType = await env.DB.prepare(
      'SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type ORDER BY count DESC'
    ).all();

    const byIntervention = await env.DB.prepare(
      'SELECT intervention_id, COUNT(*) as count FROM events WHERE intervention_id IS NOT NULL GROUP BY intervention_id ORDER BY count DESC'
    ).all();

    const today = new Date().toISOString().split('T')[0];
    const todayCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM events WHERE created_at >= ?"
    ).bind(today).first();

    return jsonResponse({
      total_events: total?.count || 0,
      today_events: todayCount?.count || 0,
      by_type: byType?.results || [],
      by_intervention: byIntervention?.results || []
    });
  } catch (err) {
    return jsonResponse({ error: 'Stats unavailable', detail: err.message }, 500);
  }
}

// ─── Helpers ─────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  });
}
