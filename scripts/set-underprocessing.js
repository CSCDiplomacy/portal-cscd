#!/usr/bin/env node
// set-underprocessing.js — move submitted applicants into the "results being
// reviewed" state. Sets delegates.status = 'underprocessing' for every row that
// has interview_status = 'submitted' and is not already an enrolled delegate.
//
// Confirmed delegates (status='enrolled') and applicants who never submitted an
// interview are left untouched. Requires SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY in .env.
//
// Usage:
//   node scripts/set-underprocessing.js [--dry-run]
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Target: submitted interviews that aren't confirmed delegates yet.
  const { data: targets, error: selErr } = await admin
    .from('delegates')
    .select('id, email, status, interview_status')
    .eq('interview_status', 'submitted')
    .neq('status', 'enrolled');
  if (selErr) {
    console.error('Lookup failed —', selErr.message);
    process.exit(1);
  }

  console.log(`Found ${targets.length} submitted applicant(s) to move to 'underprocessing'.`);
  targets.forEach((t) => console.log(`  • ${t.email} (${t.status} → underprocessing)`));

  if (dryRun) {
    console.log('\n--dry-run: no changes written.');
    return;
  }
  if (targets.length === 0) return;

  const { data: updated, error: updErr } = await admin
    .from('delegates')
    .update({ status: 'underprocessing' })
    .eq('interview_status', 'submitted')
    .neq('status', 'enrolled')
    .select('id');
  if (updErr) {
    console.error('Update failed —', updErr.message);
    process.exit(1);
  }
  console.log(`\nDone. Updated ${updated.length} row(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
