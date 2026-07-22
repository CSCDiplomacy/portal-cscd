// Cognito Forms registration webhook.
//
// Cognito POSTs the submission (Entry JSON) here after a partial/self-financed
// delegate completes their scholarship registration form. As with the AidaForm
// interview webhook, we do not trust the caller: the only thing that ties a
// submission back to a delegate is the `applicant_id` (YPDS-JKT-F###) that was
// prefilled into a hidden field when the portal handed out the embed.
//
// The endpoint is protected by a secret path segment (COGNITO_WEBHOOK_SECRET)
// because Cognito cannot send custom auth headers on a plain post. A matching
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

// Applicant ids look like YPDS-JKT-F123. We search for them ANYWHERE inside a
// string value (not just an exact whole-field match) because Cognito may deliver
// the id embedded in a larger string — a formatted field value, a label, etc.
// The `F` is treated as optional and normalised back in: people typing the id by
// hand routinely drop it (YPDS-JKT-123), but the canonical DB value has it. The
// `YPDS-JKT-` prefix is still required, so Cognito's bare numeric entry `Id`
// field can never be mistaken for an applicant id.
const APPLICANT_ID_RE = /YPDS-JKT-F?\d+/gi;

function normaliseApplicantId(raw) {
  return raw.toUpperCase().replace(/^(YPDS-JKT-)F?(\d+)$/, '$1F$2');
}

// Cognito's Entry JSON nests fields differently depending on how the form is
// built, and the hidden field may surface under any key. Rather than guess a
// path, collect every applicant-id-looking substring and let the DB decide
// which one is a real delegate.
function collectApplicantIds(value, found = new Set(), depth = 0) {
  if (depth > 8 || found.size > 50) return found;
  if (typeof value === 'string') {
    const matches = value.match(APPLICANT_ID_RE);
    if (matches) matches.forEach((m) => found.add(normaliseApplicantId(m)));
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectApplicantIds(v, found, depth + 1));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectApplicantIds(v, found, depth + 1));
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
  const expected = process.env.COGNITO_WEBHOOK_SECRET;
  if (!expected) {
    console.error('[registration] COGNITO_WEBHOOK_SECRET not set — rejecting webhook');
    return res.status(503).json({ error: 'Webhook not configured' });
  }
  const provided = req.params.secret || req.get('X-Webhook-Secret') || '';
  if (!safeEqual(provided, expected)) {
    console.warn('[registration] webhook rejected: bad secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!serviceClient) return res.status(503).json({ error: 'Database not configured' });

  const candidates = [...collectApplicantIds(req.body)];
  if (!candidates.length) {
    // Log the payload's key structure (not values — these forms carry PII and
    // payment context) so a mis-mapped id field can be diagnosed without a
    // redeploy. Just the top-level keys is enough to see if an id field arrived.
    const keys = req.body && typeof req.body === 'object' ? Object.keys(req.body).join(',') : typeof req.body;
    console.warn('[registration] webhook payload carried no applicant_id; top-level keys=' + keys);
    return res.status(400).json({ error: 'No candidate applicant_id in payload' });
  }

  // applicant_id casing in the DB is canonical (uppercase F prefix); match
  // case-insensitively by comparing against the uppercased candidates.
  const { data: rows, error } = await serviceClient
    .from('delegates')
    .select('id, email, applicant_id, registration_status, result_tier')
    .in('applicant_id', candidates);

  if (error) {
    console.error('[registration] applicant_id lookup failed', error.message);
    return res.status(500).json({ error: 'Lookup failed' });
  }
  if (!rows || !rows.length) {
    // Someone submitted the form with an applicant_id we don't recognise.
    console.warn('[registration] webhook applicant_id matched no delegate:', candidates.join(', '));
    return res.status(404).json({ error: 'Unknown candidate applicant_id' });
  }

  const delegate = rows[0];

  // Idempotent: Cognito may retry, and a delegate may submit twice. The first
  // submission is the one that counts; later ones are acknowledged and ignored
  // so the sender stops retrying.
  if (delegate.registration_status === 'submitted') {
    return res.json({ ok: true, already: true });
  }

  const { error: updErr } = await serviceClient
    .from('delegates')
    .update({ registration_status: 'submitted', registration_submitted_at: new Date().toISOString() })
    .eq('id', delegate.id)
    .eq('registration_status', 'not_started'); // lose the race rather than double-write

  if (updErr) {
    console.error('[registration] status update failed', updErr.message);
    return res.status(500).json({ error: 'Update failed' });
  }

  serviceClient
    .from('usage_events')
    .insert({
      user_id: delegate.id,
      email: delegate.email,
      event_type: 'registration_submitted',
      detail: delegate.result_tier || null,
    })
    .then(() => {}, () => {}); // analytics must never fail the webhook

  console.log(`[registration] submission recorded for ${delegate.email} (${delegate.applicant_id})`);
  res.json({ ok: true });
});

module.exports = router;
