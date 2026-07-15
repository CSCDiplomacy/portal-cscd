// AidaForm submission webhook.
//
// AidaForm POSTs the submission JSON here after an applicant finishes the
// interview. We do not trust the caller: the only thing that identifies the
// submitter is `interview_token`, a per-applicant UUID that was prefilled into
// a hidden field when the portal handed out the form URL.
//
// The endpoint is protected by a secret path segment (AIDAFORM_WEBHOOK_SECRET)
// because AidaForm cannot send custom auth headers. A matching
// `X-Webhook-Secret` header is also accepted if the sender can set one.
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { serviceClient } = require('../lib/supabase');

const router = express.Router();

// Constant-time secret comparison — avoids leaking the webhook secret via
// response-timing differences on a byte-by-byte `!==` compare.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// AidaForm's payload shape depends on how the form is built, and the hidden
// field may surface under any key or nesting. Rather than guess a path, collect
// every UUID-looking string and let the DB decide which one is a real token.
function collectUuids(value, found = new Set(), depth = 0) {
  if (depth > 8 || found.size > 50) return found;
  if (typeof value === 'string') {
    const s = value.trim();
    if (UUID_RE.test(s)) found.add(s.toLowerCase());
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUuids(v, found, depth + 1));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectUuids(v, found, depth + 1));
  }
  return found;
}

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/webhook/:secret?', webhookLimiter, async (req, res) => {
  const expected = process.env.AIDAFORM_WEBHOOK_SECRET;
  if (!expected) {
    console.error('[interview] AIDAFORM_WEBHOOK_SECRET not set — rejecting webhook');
    return res.status(503).json({ error: 'Webhook not configured' });
  }
  const provided = req.params.secret || req.get('X-Webhook-Secret') || '';
  if (!safeEqual(provided, expected)) {
    console.warn('[interview] webhook rejected: bad secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!serviceClient) return res.status(503).json({ error: 'Database not configured' });

  const candidates = [...collectUuids(req.body)];
  if (!candidates.length) {
    console.warn('[interview] webhook payload carried no token');
    return res.status(400).json({ error: 'No candidate token in payload' });
  }

  const { data: rows, error } = await serviceClient
    .from('delegates')
    .select('id, email, interview_status')
    .in('interview_token', candidates);

  if (error) {
    console.error('[interview] token lookup failed', error.message);
    return res.status(500).json({ error: 'Lookup failed' });
  }
  if (!rows || !rows.length) {
    // Someone submitted the form without a token we issued — worth knowing about.
    console.warn('[interview] webhook token matched no applicant');
    return res.status(404).json({ error: 'Unknown candidate token' });
  }

  const delegate = rows[0];

  // Idempotent: AidaForm may retry, and an applicant may double-submit. The
  // first submission is the one that counts; later ones are acknowledged and
  // ignored so the sender stops retrying.
  if (delegate.interview_status === 'submitted') {
    return res.json({ ok: true, already: true });
  }

  const { error: updErr } = await serviceClient
    .from('delegates')
    .update({ interview_status: 'submitted', interview_submitted_at: new Date().toISOString() })
    .eq('id', delegate.id)
    .eq('interview_status', 'not_started'); // lose the race rather than double-write

  if (updErr) {
    console.error('[interview] status update failed', updErr.message);
    return res.status(500).json({ error: 'Update failed' });
  }

  serviceClient
    .from('usage_events')
    .insert({ user_id: delegate.id, email: delegate.email, event_type: 'interview_submitted' })
    .then(() => {}, () => {}); // analytics must never fail the webhook

  console.log(`[interview] submission recorded for ${delegate.email}`);
  res.json({ ok: true });
});

module.exports = router;
