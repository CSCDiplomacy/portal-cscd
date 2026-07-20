// Internal analytics summary — powers analytics-dashboard.html's "Refresh" button.
// Not part of the public API surface: local-dev/admin tool only, so it's
// locked to loopback requests unless ANALYTICS_TOKEN is set in the env, in
// which case a matching ?token=/X-Analytics-Token header is required instead
// (e.g. if this is ever hit through a tunnel while developing remotely).
const express = require('express');
const { serviceClient } = require('../lib/supabase');

const router = express.Router();

function isLoopback(req) {
  const ip = req.ip || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

function guard(req, res, next) {
  const token = process.env.ANALYTICS_TOKEN;
  if (token) {
    const supplied = req.query.token || req.headers['x-analytics-token'];
    if (supplied === token) return next();
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (isLoopback(req)) return next();
  return res.status(403).json({ error: 'Forbidden (local access only — set ANALYTICS_TOKEN to allow remote access)' });
}

async function countBy(table, column) {
  const { data, error } = await serviceClient.from(table).select(column);
  if (error) return { error: error.message, total: 0, counts: {} };
  const counts = {};
  for (const row of data) {
    const key = row[column] ?? 'null';
    counts[key] = (counts[key] || 0) + 1;
  }
  return { total: data.length, counts };
}

async function recentRows(table, orderCol, limit) {
  const { data, error } = await serviceClient
    .from(table)
    .select('*')
    .order(orderCol, { ascending: false })
    .limit(limit);
  if (error) return { error: error.message };
  return data;
}

// Paginates past Supabase's default 1000-row cap to return every row.
async function fetchAllRows(table, orderCol) {
  const pageSize = 1000;
  let all = [];
  let from = 0;
  for (;;) {
    const { data, error } = await serviceClient
      .from(table)
      .select('*')
      .order(orderCol, { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) return { error: error.message };
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

router.get('/analytics/summary', guard, async (req, res) => {
  if (!serviceClient) return res.status(503).json({ error: 'Database not configured' });

  const [delegates, interview, favourites, feedback, usage_events] = await Promise.all([
    countBy('delegates', 'status'),
    countBy('delegates', 'interview_status'),
    countBy('favourites', 'session_id'),
    recentRows('feedback', 'created_at', 100),
    fetchAllRows('usage_events', 'created_at'),
  ]);

  const allUsageEvents = Array.isArray(usage_events) ? usage_events : [];
  const usage_by_type = {};
  for (const row of allUsageEvents) {
    const t = row.event_type || 'unknown';
    usage_by_type[t] = (usage_by_type[t] || 0) + 1;
  }

  res.json({
    generatedAt: new Date().toISOString(),
    delegates,
    interview,
    favourites,
    feedback: Array.isArray(feedback) ? feedback : [],
    // usage_by_type is computed over every row; the raw list sent to the
    // client is capped so the payload stays small (table only shows 30 anyway).
    usage_events: allUsageEvents.slice(0, 500),
    usage_events_total: allUsageEvents.length,
    usage_by_type,
  });
});

module.exports = router;
