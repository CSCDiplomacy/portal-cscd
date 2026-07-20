#!/usr/bin/env node
// reconcile-interviews.js — reconcile the AidaForm response export against the
// delegates table and record who actually gave their interview.
//
// The webhook (routes/interview.js) didn't fire for every submission, so
// interview_status alone can't be trusted. This walks the exported responses
// and matches each one to a delegate row by, in order of confidence:
//   1. email (lowercased)          — the reliable key, ~97% of rows
//   2. applicant_id (uppercased)   — inconsistent in the export, fallback only
//   3. normalised full name        — only when it resolves to exactly one row
//
// Matched delegates  → interview_status = 'submitted', result_status = 'evaluated'
// Every other non-enrolled delegate → result_status = 'not_evaluated'
// Enrolled delegates are never touched.
//
// Responses that match nothing are written to reponses/unmatched.csv for manual
// review — they are not guessed at.
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env, and the
// result_status column from scripts/migrations/2026-07-20-add-result-status.sql.
//
// Usage:
//   node scripts/reconcile-interviews.js [--dry-run] [--csv path/to/export.csv]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const csvFlag = process.argv.indexOf('--csv');
const CSV_PATH = path.resolve(
  __dirname,
  '..',
  csvFlag > -1 ? process.argv[csvFlag + 1] : 'reponses/responses_merged.csv',
);
const UNMATCHED_PATH = path.join(path.dirname(CSV_PATH), 'unmatched.csv');

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- CSV ---------------------------------------------------------------------
// Quote-aware and newline-aware: AidaForm's free-text answers contain both, so
// the line-oriented parser in seed-delegates.js isn't enough here.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }

  const header = (rows.shift() || []).map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => c.trim().length > 0))
    .map((r) => {
      const o = {};
      header.forEach((h, i) => (o[h] = (r[i] || '').trim()));
      return o;
    });
}

function csvEscape(v) {
  const s = (v ?? '').toString();
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Column lookup that tolerates AidaForm's numbered headers ("2. Your Email").
function pick(row, needle) {
  const key = Object.keys(row).find((k) => k.toLowerCase().includes(needle));
  return key ? row[key] : '';
}

const normEmail = (v) => (v || '').trim().toLowerCase();
const normId = (v) => (v || '').trim().toUpperCase();
const normName = (v) => (v || '').toLowerCase().replace(/[^a-z]/g, '');
// Word-set key: the export and the roster disagree on name order
// ("Sanzhar Karybayev" vs "Karybayev Sanzhar"), so compare sorted tokens.
const nameKey = (v) =>
  (v || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .sort()
    .join('');

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Response export not found: ${CSV_PATH}`);
    process.exit(1);
  }

  // Dedupe responses by email, keeping the earliest submission.
  const raw = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const byEmail = new Map();
  for (const r of raw) {
    const resp = {
      name: pick(r, 'your name'),
      email: normEmail(pick(r, 'email')),
      applicantId: normId(pick(r, 'applicant id')),
      created: pick(r, 'created'),
    };
    const key = resp.email || `${normName(resp.name)}|${resp.applicantId}`;
    const prev = byEmail.get(key);
    if (!prev || (resp.created && resp.created < prev.created)) byEmail.set(key, resp);
  }
  const responses = [...byEmail.values()];
  console.log(`Read ${raw.length} response row(s) → ${responses.length} unique submission(s).`);

  const { data: delegates, error: selErr } = await admin
    .from('delegates')
    .select('id, name, email, applicant_id, status, interview_status, result_status');
  if (selErr) {
    console.error('Delegate lookup failed —', selErr.message);
    process.exit(1);
  }
  console.log(`Loaded ${delegates.length} delegate row(s).`);

  // Indexes. Name index only keeps unambiguous entries — a name shared by two
  // delegates is dropped rather than guessed at.
  const byEmailIdx = new Map();
  const byIdIdx = new Map();
  const nameCounts = new Map();
  for (const d of delegates) {
    if (d.email) byEmailIdx.set(normEmail(d.email), d);
    if (d.applicant_id) byIdIdx.set(normId(d.applicant_id), d);
    const n = nameKey(d.name);
    if (n) nameCounts.set(n, (nameCounts.get(n) || 0) + 1);
  }
  const byNameIdx = new Map();
  for (const d of delegates) {
    const n = nameKey(d.name);
    if (n && nameCounts.get(n) === 1) byNameIdx.set(n, d);
  }

  const matched = new Map(); // delegate id -> { delegate, via, resp }
  const unmatched = [];
  for (const resp of responses) {
    let d = byEmailIdx.get(resp.email);
    let via = 'email';
    if (!d && resp.applicantId) { d = byIdIdx.get(resp.applicantId); via = 'applicant_id'; }
    if (!d) { d = byNameIdx.get(nameKey(resp.name)); via = 'name'; }
    if (d) {
      if (!matched.has(d.id)) matched.set(d.id, { delegate: d, via, resp });
    } else {
      unmatched.push(resp);
    }
  }

  const viaCounts = { email: 0, applicant_id: 0, name: 0 };
  for (const m of matched.values()) viaCounts[m.via]++;
  console.log(
    `\nMatched ${matched.size}: ${viaCounts.email} by email, ` +
      `${viaCounts.applicant_id} by applicant_id, ${viaCounts.name} by name.`,
  );

  const nameMatches = [...matched.values()].filter((m) => m.via === 'name');
  if (nameMatches.length) {
    console.log('\nName-matched (verify these are the right people):');
    nameMatches.forEach((m) =>
      console.log(`  • "${m.resp.name}" <${m.resp.email}> → ${m.delegate.email}`),
    );
  }

  if (unmatched.length) {
    console.log(`\nUnmatched (${unmatched.length}) — written to ${UNMATCHED_PATH}:`);
    unmatched.forEach((r) => console.log(`  • ${r.name} | ${r.email} | ${r.applicantId}`));
    const lines = ['name,email,applicant_id,created'].concat(
      unmatched.map((r) =>
        [r.name, r.email, r.applicantId, r.created].map(csvEscape).join(','),
      ),
    );
    if (!dryRun) fs.writeFileSync(UNMATCHED_PATH, lines.join('\n') + '\n');
  }

  // The CSV export can be partial. A delegate already carrying
  // interview_status='submitted' was flipped by the webhook, which verifies the
  // per-row interview_token server-side — that's stronger evidence than the
  // export, so trust it even when no response row matched.
  const webhookOnly = delegates.filter(
    (d) => d.status !== 'enrolled' && !matched.has(d.id) && d.interview_status === 'submitted',
  );
  if (webhookOnly.length) {
    console.log(
      `\n${webhookOnly.length} delegate(s) missing from the export but flagged submitted by ` +
        'the webhook — counting as evaluated:',
    );
    webhookOnly.forEach((d) => console.log(`  • ${d.name} <${d.email}>`));
  }

  // Enrolled delegates keep whatever they have — they're past the results stage.
  const evaluatedIds = [...matched.keys()]
    .filter((id) => matched.get(id).delegate.status !== 'enrolled')
    .concat(webhookOnly.map((d) => d.id));
  const webhookIds = new Set(webhookOnly.map((d) => d.id));
  const notEvaluated = delegates.filter(
    (d) => d.status !== 'enrolled' && !matched.has(d.id) && !webhookIds.has(d.id),
  );

  console.log(
    `\nPlan: ${evaluatedIds.length} → evaluated, ${notEvaluated.length} → not_evaluated, ` +
      `${delegates.filter((d) => d.status === 'enrolled').length} enrolled left untouched.`,
  );

  if (dryRun) {
    console.log('\n--dry-run: no changes written.');
    return;
  }

  if (evaluatedIds.length) {
    const { error } = await admin
      .from('delegates')
      .update({ result_status: 'evaluated', interview_status: 'submitted' })
      .in('id', evaluatedIds);
    if (error) {
      console.error('Evaluated update failed —', error.message);
      process.exit(1);
    }
  }

  if (notEvaluated.length) {
    const { error } = await admin
      .from('delegates')
      .update({ result_status: 'not_evaluated' })
      .in('id', notEvaluated.map((d) => d.id));
    if (error) {
      console.error('Not-evaluated update failed —', error.message);
      process.exit(1);
    }
  }

  console.log(
    `\nDone. ${evaluatedIds.length} evaluated, ${notEvaluated.length} not_evaluated.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
