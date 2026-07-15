#!/usr/bin/env node

/**
 * Verify that all required environment variables are set
 * Run: node scripts/verify-env.js
 */

require('dotenv').config();

const REQUIRED = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'AIDAFORM_BASE_URL',
  'AIDAFORM_WEBHOOK_SECRET',
];

const OPTIONAL = [
  'NODE_ENV',
  'PORT',
  'APP_URL',
  'EVENT_NAME',
  'REMINDER_LEAD_MINUTES',
  'AIDAFORM_TOKEN_FIELD',
  'AIDAFORM_APPLICANT_FIELD',
];

console.log('\n🔍 Environment Variables Check\n');

let allGood = true;

console.log('📋 Required Variables:');
REQUIRED.forEach((key) => {
  const value = process.env[key];
  if (value) {
    const masked = value.slice(0, 10) + '...' + value.slice(-5);
    console.log(`  ✅ ${key}: ${masked}`);
  } else {
    console.log(`  ❌ ${key}: NOT SET (required)`);
    allGood = false;
  }
});

console.log('\n📋 Optional Variables:');
OPTIONAL.forEach((key) => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✅ ${key}: ${value}`);
  } else {
    console.log(`  ℹ️  ${key}: not set (using default)`);
  }
});

console.log('\n');
if (allGood) {
  console.log('✨ All required environment variables are set!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some required variables are missing. Please update your .env file.\n');
  process.exit(1);
}
