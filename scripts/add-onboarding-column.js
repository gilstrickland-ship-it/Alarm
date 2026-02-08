#!/usr/bin/env node
/**
 * Adds onboarding_completed column to profiles if missing.
 * Run: node scripts/add-onboarding-column.js
 * Requires DATABASE_URL in .env, or run the SQL manually in Supabase SQL Editor.
 */
require("dotenv").config();
const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL || process.env.EXPO_PUBLIC_DATABASE_URL;

async function run() {
  if (!DATABASE_URL || DATABASE_URL.includes("[YOUR-PASSWORD]")) {
    console.log(`
The onboarding_completed column is missing from your profiles table.

Run this SQL in Supabase SQL Editor:
https://supabase.com/dashboard/project/xkiiytisidmtpmghnakz/sql/new

  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
  UPDATE profiles SET onboarding_completed = true;
`);
    process.exit(1);
  }

  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false");
    await client.query("UPDATE profiles SET onboarding_completed = true");
    console.log("✅ onboarding_completed column added/updated");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    if (err.message.includes("password authentication")) {
      console.log("\nFix DATABASE_URL in .env with your database password.");
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
