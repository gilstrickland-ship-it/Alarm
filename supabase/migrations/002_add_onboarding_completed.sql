-- Add onboarding_completed to profiles (for existing installs that ran 001 before this column existed)
-- Run in Supabase SQL Editor if 001 already applied

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
-- Mark existing profiles as onboarded so current users aren't forced to re-onboard
UPDATE profiles SET onboarding_completed = true;
