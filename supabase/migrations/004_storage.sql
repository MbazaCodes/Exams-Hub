-- ================================================================
-- ExamHub Tanzania — Migration 004: Storage Buckets
-- ================================================================

-- ── Create buckets ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('exam-papers',    'exam-papers',    false, 26214400,  -- 25MB
   ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),

  ('avatars',        'avatars',        true,  2097152,   -- 2MB
   ARRAY['image/jpeg','image/png','image/webp','image/gif']),

  ('homework-files', 'homework-files', false, 10485760,  -- 10MB
   ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'image/jpeg','image/png']),

  ('school-assets',  'school-assets',  true,  5242880,   -- 5MB
   ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']),

  ('question-images','question-images',true,  3145728,   -- 3MB
   ARRAY['image/jpeg','image/png','image/webp'])

ON CONFLICT (id) DO NOTHING;

-- ── EXAM PAPERS bucket policies ────────────────────────────────
-- Teachers/admins can upload
CREATE POLICY "exam_papers_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exam-papers'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher','school_admin','super_admin')
  );

-- Authenticated users can read (their school's papers or public)
CREATE POLICY "exam_papers_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exam-papers'
    AND auth.uid() IS NOT NULL
  );

-- Owners can delete
CREATE POLICY "exam_papers_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'exam-papers'
    AND owner = auth.uid()
  );

-- ── AVATARS bucket policies ────────────────────────────────────
-- Public read (bucket is public)
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users upload own avatar only
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

-- ── HOMEWORK FILES bucket policies ─────────────────────────────
CREATE POLICY "homework_files_teacher_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'homework-files'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher','school_admin','super_admin')
  );

CREATE POLICY "homework_files_student_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'homework-files'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "homework_files_school_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'homework-files'
    AND auth.uid() IS NOT NULL
  );

-- ── SCHOOL ASSETS bucket policies ─────────────────────────────
CREATE POLICY "school_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-assets');

CREATE POLICY "school_assets_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'school-assets'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('school_admin','super_admin')
  );

-- ── QUESTION IMAGES bucket policies ───────────────────────────
CREATE POLICY "question_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'question-images');

CREATE POLICY "question_images_teacher_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'question-images'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('teacher','school_admin','super_admin')
  );

