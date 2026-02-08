#!/usr/bin/env node
/**
 * Run Supabase migrations.
 * Requires DATABASE_URL in .env (from Supabase Dashboard > Settings > Database > Connection string)
 */
require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const DATABASE_URL = process.env.DATABASE_URL || process.env.EXPO_PUBLIC_DATABASE_URL;

async function run() {
  if (!DATABASE_URL) {
    console.error(`
❌ DATABASE_URL not found in .env

To run migrations, add your Supabase database connection string:

1. Go to https://supabase.com/dashboard/project/xkiiytisidmtpmghnakz/settings/database
2. Under "Connection string", select "URI" and copy it
3. Add to .env: DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@..."

Or run the migration manually in the SQL Editor:
https://supabase.com/dashboard/project/xkiiytisidmtpmghnakz/sql/new
`);
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, "../supabase/migrations/001_initial_schema.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Migration completed successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
