-- ================================================================
-- ExamHub Tanzania — Promote user to super_admin
-- Run this in Supabase SQL Editor (runs as postgres, bypasses RLS)
-- Dashboard → SQL Editor → New query → paste → Run
-- ================================================================

-- Step 1: Verify the user exists
SELECT 
  id, 
  full_name, 
  role, 
  is_active,
  created_at
FROM profiles 
WHERE id = 'ad030d0a-be4f-4dc1-bcf8-d5af3be4fe48';

-- Step 2: Promote to super_admin
-- (Run this AFTER confirming Step 1 shows the correct user)
UPDATE profiles
SET 
  role      = 'super_admin',
  is_active = true,
  updated_at = NOW()
WHERE id = 'ad030d0a-be4f-4dc1-bcf8-d5af3be4fe48';

-- Step 3: Verify the change
SELECT 
  id, 
  full_name, 
  role, 
  is_active
FROM profiles 
WHERE id = 'ad030d0a-be4f-4dc1-bcf8-d5af3be4fe48';

-- Expected: role = 'super_admin', is_active = true
