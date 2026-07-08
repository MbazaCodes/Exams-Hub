-- ================================================================
-- ExamHub Tanzania — Migration 006: Realtime Publications
-- ================================================================

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE online_exam_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE online_exams;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE exam_sessions;

-- Realtime only broadcasts UPDATE/INSERT on specific columns
-- to avoid leaking sensitive data (answers before submission)
COMMENT ON TABLE online_exam_participants IS
  'realtime:broadcast:UPDATE:id,exam_session_id,status,percentage,score,rank,submitted_at,guest_name,guest_school,guest_region';

COMMENT ON TABLE notifications IS
  'realtime:broadcast:INSERT:id,user_id,type,title,body,created_at';

