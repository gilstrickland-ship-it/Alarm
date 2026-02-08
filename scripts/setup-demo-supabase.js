#!/usr/bin/env node
/**
 * Creates demo users and seeds demo data in Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL in .env
 *
 * Run: node scripts/setup-demo-supabase.js
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL || process.env.EXPO_PUBLIC_DATABASE_URL;

const DEMO_PARENT_EMAIL = "demo-parent@familyalarms.app";
const DEMO_CHILD_EMAIL = "demo-child@familyalarms.app";
const DEMO_PASSWORD = "Demo123456";

async function createDemoUsers(supabase) {
  for (const { email, name } of [
    { email: DEMO_PARENT_EMAIL, name: "Demo Parent" },
    { email: DEMO_CHILD_EMAIL, name: "Demo Child" },
  ]) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const userExists = existing?.users?.some((u) => u.email === email);

    if (userExists) {
      console.log(`  ✓ ${email} already exists`);
    } else {
      const { error } = await supabase.auth.admin.createUser({
        email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name },
      });
      if (error) {
        console.error(`  ✗ Failed to create ${email}:`, error.message);
        process.exit(1);
      }
      console.log(`  ✓ Created ${email}`);
    }
  }
}

async function seedDemoDataViaApi(supabase) {
  const { data: users } = await supabase.auth.admin.listUsers();
  const parent = users?.users?.find((u) => u.email === DEMO_PARENT_EMAIL);
  const child = users?.users?.find((u) => u.email === DEMO_CHILD_EMAIL);

  if (!parent || !child) {
    console.error("  ✗ Demo users not found. Run step 1 first.");
    process.exit(1);
  }

  const parentId = parent.id;
  const childId = child.id;

  await supabase.from("profiles").update({ role: "parent", name: "Demo Parent", onboarding_completed: true }).eq("id", parentId);
  await supabase.from("profiles").update({ role: "child", name: "Demo Child", onboarding_completed: true }).eq("id", childId);

  await supabase.from("parent_child").upsert({ parent_id: parentId, child_id: childId }, { onConflict: "parent_id,child_id" });

  await supabase.from("alarms").delete().eq("parent_id", parentId).eq("child_id", childId);
  await supabase.from("notifications").delete().in("user_id", [parentId, childId]);

  const now = new Date();
  const alarms = [
    { parent_id: parentId, child_id: childId, alarm_time: new Date(now.getTime() + 86400000 + 7 * 3600000).toISOString(), label: "Wake up", is_mandatory: false, status: "pending", sound: "default", vibration: "default" },
    { parent_id: parentId, child_id: childId, alarm_time: new Date(now.getTime() + 86400000 + 8 * 3600000).toISOString(), label: "School starts", is_mandatory: true, status: "approved", sound: "gentle", vibration: "default" },
    { parent_id: parentId, child_id: childId, alarm_time: new Date(now.getTime() + 2 * 86400000 + 7 * 3600000).toISOString(), label: "Morning routine", is_mandatory: false, status: "approved", sound: "upbeat", vibration: "default" },
    { parent_id: parentId, child_id: childId, alarm_time: new Date(now.getTime() - 86400000 + 6.5 * 3600000).toISOString(), label: "Math class", is_mandatory: true, status: "triggered", sound: "default", vibration: "default" },
    { parent_id: parentId, child_id: childId, alarm_time: new Date(now.getTime() + 3 * 86400000 + 9 * 3600000).toISOString(), label: "Piano practice", is_mandatory: false, status: "declined", sound: "nature", vibration: "default" },
  ];
  await supabase.from("alarms").insert(alarms);

  const notifications = [
    { user_id: childId, title: "New alarm request", body: "Demo Parent wants to set a wake up alarm for tomorrow at 7:00 AM.", type: "alarm_request" },
    { user_id: childId, title: "Alarm approved", body: "Your morning routine alarm for the day after tomorrow is set.", type: "alarm_status" },
    { user_id: childId, title: "Alarm triggered", body: "It's time for Math class!", type: "alarm_triggered" },
    { user_id: parentId, title: "Alarm approved", body: "Demo Child approved the School starts alarm.", type: "alarm_status" },
    { user_id: parentId, title: "Alarm declined", body: "Demo Child declined the Piano practice alarm.", type: "alarm_status" },
  ];
  await supabase.from("notifications").insert(notifications);

  console.log("  ✓ Demo data seeded");
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(`
❌ SUPABASE_SERVICE_ROLE_KEY not found in .env

Add to .env:
  EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`);
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  console.log("\nSetting up demo users and data in Supabase...\n");

  console.log("1. Creating demo auth users...");
  await createDemoUsers(supabase);

  console.log("\n2. Seeding demo data (via API)...");
  await seedDemoDataViaApi(supabase);

  console.log("\n✅ Demo setup complete.\n");
  console.log("  Users: demo-parent@familyalarms.app / demo-child@familyalarms.app");
  console.log("  Password: Demo123456\n");
  console.log("  Set EXPO_PUBLIC_DEMO_MODE=true in .env and sign in with Apple/Google.\n");
}

main();
