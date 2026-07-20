#!/usr/bin/env node
// reconcile-tiers.js — apply the video-submission evaluation outcome to the
// delegates table as `result_tier`.
//
// Source: reponses/tiers.csv, exported from the Self/Partial/Full/Alumni sheets
// of "YPDS Video submissions - Evaluation_mapped.xlsx". The workbook's own
// `Evaluation` sheet has a free-text status column with typos and combined
// values ('Sef', 'Full/Partial'), so the four dedicated sheets are the source
// of truth instead.
//
// Matching, in order of confidence:
//   1. email (lowercased)      — the primary key
//   2. alternate email         — many applicants registered under a second address
//   3. applicant_id            — the workbook's ID column is YPDS-JKT-F{ID}
//   4. normalised full name    — only when it resolves to exactly one delegate
//
// Where a row matches by both email and applicant_id, the two must agree; any
// disagreement is reported and the row is left alone rather than guessed at.
//
// Enrolled delegates are never touched (same guard as reconcile-interviews.js).
// Rows that match nothing are written to reponses/unmatched-tiers.csv rather
// than guessed at.
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env, and the
// result_tier column from scripts/migrations/2026-07-20-add-result-tier.sql.
//
// Usage:
//   node scripts/reconcile-tiers.js [--dry-run] [--csv path/to/tiers.csv]
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
  csvFlag > -1 ? process.argv[csvFlag + 1] : 'reponses/tiers.csv',
);
const UNMATCHED_PATH = path.join(path.dirname(CSV_PATH), 'unmatched-tiers.csv');

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- CSV ---------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n') {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else if (c !== '\r') cur += c;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((c) => c && c.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])));
}

// Strip everything but letters so "Goh Chen How Calvin" and "GOH CHEN-HOW CALVIN"
// collapse to the same key. Deliberately not fuzzy — an exact normalised hit or
// nothing, so we never award a scholarship tier to the wrong person.
const normName = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  console.log(`Read ${rows.length} evaluation rows from ${path.relative(process.cwd(), CSV_PATH)}`);

  const { data: delegates, error } = await admin
    .from('delegates')
    .select('id, name, email, applicant_id, status, result_tier');
  if (error) throw error;
  console.log(`Loaded ${delegates.length} delegates\n`);

  const byEmail = new Map();
  const byId = new Map();
  const byName = new Map();
  for (const d of delegates) {
    if (d.email) byEmail.set(d.email.toLowerCase(), d);
    if (d.applicant_id) byId.set(d.applicant_id.trim().toUpperCase(), d);
    const n = normName(d.name);
    if (n) byName.set(n, byName.has(n) ? null : d); // null marks an ambiguous name
  }

  const updates = [];
  const unmatched = [];
  const methods = { email: 0, alt_email: 0, applicant_id: 0, name: 0 };
  const skippedEnrolled = [];
  const conflicts = [];

  for (const r of rows) {
    const rid = (r.applicant_id || '').trim().toUpperCase();
    const byIdHit = rid ? byId.get(rid) || null : null;

    let d = r.email && byEmail.get(r.email);
    let method = 'email';
    if (!d && r.alt_email) {
      d = byEmail.get(r.alt_email);
      method = 'alt_email';
    }
    // The two independent keys disagree — an ID was reused or an email is on the
    // wrong row. Either way we can't tell which is right, so don't write.
    if (d && byIdHit && byIdHit.id !== d.id) {
      conflicts.push(`${r.name} <${r.email}>: email→${d.email}, ${rid}→${byIdHit.email}`);
      continue;
    }
    if (!d && byIdHit) {
      d = byIdHit;
      method = 'applicant_id';
    }
    if (!d) {
      d = byName.get(normName(r.name)) || null;
      method = 'name';
    }
    if (!d) {
      unmatched.push(r);
      continue;
    }
    if (d.status === 'enrolled') {
      skippedEnrolled.push(`${d.name} <${d.email}>`);
      continue;
    }
    methods[method]++;
    if (method === 'name' || method === 'applicant_id')
      console.log(`  ${method}-matched: "${r.name}" → ${d.name || '(no name)'} <${d.email}>`);
    updates.push({ id: d.id, tier: r.tier, who: `${d.name} <${d.email}>` });
  }

  const counts = updates.reduce((a, u) => ({ ...a, [u.tier]: (a[u.tier] || 0) + 1 }), {});
  console.log(`\nMatched ${updates.length}/${rows.length}`);
  console.log('  by method :', methods);
  console.log('  by tier   :', counts);
  if (skippedEnrolled.length) console.log('  skipped (enrolled):', skippedEnrolled.length);
  if (conflicts.length) {
    console.log(`\n${conflicts.length} email/applicant_id CONFLICT(S) — left unwritten:`);
    for (const c of conflicts) console.log(`  ${c}`);
  }

  if (unmatched.length) {
    const header = 'tier,name,email,alt_email\n';
    const body = unmatched
      .map((r) => [r.tier, r.name, r.email, r.alt_email].map((v) => `"${v}"`).join(','))
      .join('\n');
    fs.writeFileSync(UNMATCHED_PATH, header + body + '\n');
    console.log(`\n${unmatched.length} unmatched → ${path.relative(process.cwd(), UNMATCHED_PATH)}`);
    for (const r of unmatched) console.log(`  ${r.tier.padEnd(8)} ${r.name} <${r.email}>`);
  }

  if (dryRun) {
    console.log('\n--dry-run: nothing written.');
    return;
  }

  console.log('\nWriting…');
  let done = 0;
  for (const u of updates) {
    const { error: e } = await admin
      .from('delegates')
      .update({ result_tier: u.tier })
      .eq('id', u.id)
      .neq('status', 'enrolled');
    if (e) console.error(`  FAILED ${u.who}: ${e.message}`);
    else done++;
  }
  console.log(`Updated ${done}/${updates.length} delegates.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
