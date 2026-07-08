-- ================================================================
-- ExamHub Tanzania — FULL DEPLOY SCRIPT
-- Paste into Supabase SQL Editor and run ALL at once
-- Or run migrations individually in order: 001 → 006
-- ================================================================

-- Run this to verify everything is set up:
SELECT
  (SELECT COUNT(*) FROM subjects)          AS subjects,
  (SELECT COUNT(*) FROM topics)            AS topics,
  (SELECT COUNT(*) FROM badges)            AS badges,
  (SELECT COUNT(*) FROM schools)           AS schools,
  (SELECT COUNT(*) FROM online_exams)      AS online_exams,
  (SELECT COUNT(*) FROM profiles)          AS profiles;

-- Verify RLS is enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify functions exist:
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Test join online exam (should return exam data):
-- SELECT join_online_exam('BIO2024', NULL, 'Test Student', 'Test School', 'Dar es Salaam');

-- Test leaderboard (no auth required):
-- SELECT * FROM get_public_leaderboard(10);
-- SELECT * FROM get_online_exam_leaderboard('BIO2024');

