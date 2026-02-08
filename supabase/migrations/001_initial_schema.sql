-- Parent-Child Alarm App - Initial Schema (idempotent)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum (idempotent)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('parent', 'child');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alarm status enum (idempotent)
DO $$ BEGIN
  CREATE TYPE alarm_status AS ENUM ('pending', 'approved', 'declined', 'triggered', 'missed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  onboarding_completed BOOLEAN DEFAULT false,
  birth_year INTEGER,
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent-child linking (many-to-many)
CREATE TABLE IF NOT EXISTS parent_child (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id),
  CHECK (parent_id != child_id)
);

-- Family invite codes (for linking)
CREATE TABLE IF NOT EXISTS family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inviter_role user_role NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alarms table
CREATE TABLE IF NOT EXISTS alarms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alarm_time TIMESTAMPTZ NOT NULL,
  repeat_pattern TEXT,
  label TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  status alarm_status NOT NULL DEFAULT 'pending',
  sound TEXT DEFAULT 'default',
  vibration TEXT DEFAULT 'default',
  request_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications log (in-app inbox)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL,
  alarm_id UUID REFERENCES alarms(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON parent_child(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_child ON parent_child(child_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_code ON family_invites(code);
CREATE INDEX IF NOT EXISTS idx_alarms_child ON alarms(child_id);
CREATE INDEX IF NOT EXISTS idx_alarms_parent ON alarms(parent_id);
CREATE INDEX IF NOT EXISTS idx_alarms_status ON alarms(status);
CREATE INDEX IF NOT EXISTS idx_alarms_time ON alarms(alarm_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Parents can view linked children" ON profiles;
DROP POLICY IF EXISTS "Parents can view their links" ON parent_child;
DROP POLICY IF EXISTS "Parents can create links" ON parent_child;
DROP POLICY IF EXISTS "Users can delete their links" ON parent_child;
DROP POLICY IF EXISTS "Users can create invites" ON family_invites;
DROP POLICY IF EXISTS "Users can view own invites" ON family_invites;
DROP POLICY IF EXISTS "Anyone can read invite by code" ON family_invites;
DROP POLICY IF EXISTS "Parents can view their alarms" ON alarms;
DROP POLICY IF EXISTS "Parents can create alarms" ON alarms;
DROP POLICY IF EXISTS "Children can update alarm status (approve/decline)" ON alarms;
DROP POLICY IF EXISTS "Parents can update their alarms" ON alarms;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications (mark read)" ON notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON notifications;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Parents can view linked children" ON profiles FOR SELECT USING (
  id IN (SELECT child_id FROM parent_child WHERE parent_id = auth.uid())
);

-- Parent_child policies
CREATE POLICY "Parents can view their links" ON parent_child FOR SELECT USING (
  parent_id = auth.uid() OR child_id = auth.uid()
);
CREATE POLICY "Parents can create links" ON parent_child FOR INSERT WITH CHECK (
  parent_id = auth.uid() OR child_id = auth.uid()
);
CREATE POLICY "Users can delete their links" ON parent_child FOR DELETE USING (
  parent_id = auth.uid() OR child_id = auth.uid()
);

-- Family invites policies
CREATE POLICY "Users can create invites" ON family_invites FOR INSERT WITH CHECK (inviter_id = auth.uid());
CREATE POLICY "Users can view own invites" ON family_invites FOR SELECT USING (inviter_id = auth.uid());
CREATE POLICY "Anyone can read invite by code" ON family_invites FOR SELECT USING (true);

-- Alarms policies
CREATE POLICY "Parents can view their alarms" ON alarms FOR SELECT USING (
  parent_id = auth.uid() OR child_id = auth.uid()
);
CREATE POLICY "Parents can create alarms" ON alarms FOR INSERT WITH CHECK (
  parent_id = auth.uid() AND child_id IN (SELECT child_id FROM parent_child WHERE parent_id = auth.uid())
);
CREATE POLICY "Children can update alarm status (approve/decline)" ON alarms FOR UPDATE USING (
  child_id = auth.uid()
);
CREATE POLICY "Parents can update their alarms" ON alarms FOR UPDATE USING (parent_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications (mark read)" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Function to create profile on signup (handles NULL email/metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );
  IF user_name = '' THEN
    user_name := 'User';
  END IF;
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, user_name, 'child'::user_role);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
