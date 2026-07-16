#!/usr/bin/env node
// reformat-applicant-ids.js — one-off migration: YPDS-{N} -> YPDS-JKT-F{N}
//
// Dry-run by default: prints the planned changes and writes nothing.
// Pass --apply to actually update Supabase. Always backs up the current
// applicant_id values to scripts/applicant-id-backup-<timestamp>.csv first.
//
// Usage:
//   node scripts/reformat-applicant-ids.js            # preview only
//   node scripts/reformat-applicant-ids.js --apply     # write changes
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APPLY = process.argv.includes('--apply');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OLD_FORMAT = /^YPDS-JKT-(\d+)-F$/;

function csvEscape(v) {
  const s = (v ?? '').toString();
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const { data: rows, error } = await admin
    .from('delegates')
    .select('id, email, applicant_id')
    .order('applicant_id');
  if (error) {
    console.error('Failed to read delegates:', error.message);
    process.exit(1);
  }

  const changes = [];
  const skipped = [];
  for (const row of rows) {
    const m = (row.applicant_id || '').match(OLD_FORMAT);
    if (!m) {
      skipped.push(row);
      continue;
    }
    changes.push({ id: row.id, email: row.email, from: row.applicant_id, to: `YPDS-JKT-F${m[1]}` });
  }

  console.log(`${changes.length} row(s) to update, ${skipped.length} row(s) skipped (already reformatted or non-matching).`);
  if (skipped.length) {
    console.log('\nSkipped (no YPDS-<number> match):');
    skipped.forEach((r) => console.log(`  ${r.email}: ${JSON.stringify(r.applicant_id)}`));
  }
  console.log('\nPlanned changes (first 20 shown):');
  changes.slice(0, 20).forEach((c) => console.log(`  ${c.from}  ->  ${c.to}   (${c.email})`));
  if (changes.length > 20) console.log(`  ...and ${changes.length - 20} more`);

  if (!APPLY) {
    console.log('\nDry run only — no changes written. Re-run with --apply to write them.');
    return;
  }

  // Backup current values before writing anything.
  const backupPath = path.join(__dirname, `applicant-id-backup-${Date.now()}.csv`);
  const backupRows = [['id', 'email', 'applicant_id'], ...rows.map((r) => [r.id, r.email, r.applicant_id])];
  fs.writeFileSync(backupPath, backupRows.map((r) => r.map(csvEscape).join(',')).join('\n'));
  console.log(`\nBackup written to ${backupPath}`);

  let ok = 0;
  let failed = 0;
  for (const c of changes) {
    const { error: updErr } = await admin.from('delegates').update({ applicant_id: c.to }).eq('id', c.id);
    if (updErr) {
      console.error(`✗ ${c.email}: ${updErr.message}`);
      failed++;
    } else {
      ok++;
    }
  }
  console.log(`\nDone. Updated ${ok}, failed ${failed}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
