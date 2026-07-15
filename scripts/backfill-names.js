#!/usr/bin/env node
// backfill-names.js — populate the `name` column for delegates that were
// seeded without one. Matches existing rows by email (never creates accounts)
// and updates delegates.name from the CSV's FullName column.
//
// Usage:
//   node scripts/backfill-names.js candidatedata.csv [--force]
//
// By default only fills rows where name IS NULL (safe backfill). Pass --force
// to overwrite existing names too. Requires SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY in .env.
require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const inputPath = process.argv[2];
const force = process.argv.includes('--force');
if (!inputPath) {
  console.error('Usage: node scripts/backfill-names.js <candidatedata.csv> [--force]');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      out.push(cur); cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((h, i) => (row[h] = (cells[i] || '').trim()));
    return row;
  });
}

async function main() {
  const rows = parseCsv(fs.readFileSync(inputPath, 'utf8'));
  let updated = 0;
  let skippedNoMatch = 0;
  let skippedHasName = 0;
  let failed = 0;

  for (const row of rows) {
    const email = (row.Email || row.email || '').trim().toLowerCase();
    const name =
      (row.FullName || row['Full Name'] || '').trim() ||
      [row.Name_First, row.Name_Last].filter(Boolean).join(' ').trim();
    if (!email || !name) continue;

    // Find the existing delegate by email (case-insensitive).
    const { data: existing, error: selErr } = await admin
      .from('delegates')
      .select('id, name, email')
      .ilike('email', email)
      .maybeSingle();
    if (selErr) {
      console.error(`✗ ${email}: lookup failed — ${selErr.message}`);
      failed++;
      continue;
    }
    if (!existing) {
      skippedNoMatch++;
      continue;
    }
    if (existing.name && !force) {
      skippedHasName++;
      continue;
    }

    const { error: updErr } = await admin
      .from('delegates')
      .update({ name })
      .eq('id', existing.id);
    if (updErr) {
      console.error(`✗ ${email}: update failed — ${updErr.message}`);
      failed++;
      continue;
    }
    updated++;
    console.log(`✓ ${email} → ${name}`);
  }

  console.log(
    `\nDone. Updated ${updated}, no DB match ${skippedNoMatch}, ` +
      `already named ${skippedHasName}, failed ${failed}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
