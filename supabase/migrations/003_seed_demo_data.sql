-- Demo mode seed data
-- PREREQUISITE: Create these users in Supabase Dashboard > Authentication > Users:
--   - demo-parent@familyalarms.app  / Demo123456
--   - demo-child@familyalarms.app   / Demo123456
-- Or run: node scripts/setup-demo-supabase.js

DO $$
DECLARE
  parent_id UUID;
  child_id UUID;
BEGIN
  SELECT id INTO parent_id FROM auth.users WHERE email = 'demo-parent@familyalarms.app' LIMIT 1;
  SELECT id INTO child_id FROM auth.users WHERE email = 'demo-child@familyalarms.app' LIMIT 1;

  IF parent_id IS NULL OR child_id IS NULL THEN
    RAISE NOTICE 'Demo users not found. Run: node scripts/setup-demo-supabase.js';
    RETURN;
  END IF;

  -- Update profiles
  UPDATE public.profiles SET role = 'parent', name = 'Demo Parent', onboarding_completed = true WHERE id = parent_id;
  UPDATE public.profiles SET role = 'child', name = 'Demo Child', onboarding_completed = true WHERE id = child_id;

  -- Link parent and child
  INSERT INTO public.parent_child (parent_id, child_id)
  VALUES (parent_id, child_id)
  ON CONFLICT (parent_id, child_id) DO NOTHING;

  -- Clear existing demo alarms (re-run safe)
  DELETE FROM public.alarms WHERE parent_id = parent_id AND child_id = child_id;
  DELETE FROM public.notifications WHERE user_id IN (parent_id, child_id);

  -- Create alarms (mix of statuses)
  INSERT INTO public.alarms (parent_id, child_id, alarm_time, label, is_mandatory, status, sound, vibration)
  VALUES
    (parent_id, child_id, (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '7 hours'), 'Wake up', false, 'pending', 'default', 'default'),
    (parent_id, child_id, (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '8 hours'), 'School starts', true, 'approved', 'gentle', 'default'),
    (parent_id, child_id, (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '7 hours'), 'Morning routine', false, 'approved', 'upbeat', 'default'),
    (parent_id, child_id, (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '6 hours 30 minutes'), 'Math class', true, 'triggered', 'default', 'default'),
    (parent_id, child_id, (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '9 hours'), 'Piano practice', false, 'declined', 'nature', 'default');

  -- Create notifications for child
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES
    (child_id, 'New alarm request', 'Demo Parent wants to set a wake up alarm for tomorrow at 7:00 AM.', 'alarm_request'),
    (child_id, 'Alarm approved', 'Your morning routine alarm for the day after tomorrow is set.', 'alarm_status'),
    (child_id, 'Alarm triggered', 'It''s time for Math class!', 'alarm_triggered');

  -- Create notifications for parent
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES
    (parent_id, 'Alarm approved', 'Demo Child approved the School starts alarm.', 'alarm_status'),
    (parent_id, 'Alarm declined', 'Demo Child declined the Piano practice alarm.', 'alarm_status');

  RAISE NOTICE 'Demo data seeded successfully.';
END $$;
