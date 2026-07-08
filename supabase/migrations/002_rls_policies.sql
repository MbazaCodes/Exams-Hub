-- ================================================================
-- ExamHub Tanzania — Migration 002: Row Level Security Policies
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE schools                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE students                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_exams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_exam_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_queries                ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- HELPER: get current user role
-- ================================================================
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION current_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid()
$$;

-- ================================================================
-- SCHOOLS
-- ================================================================
-- Public: anyone can read school names (for registration dropdown)
CREATE POLICY "schools_public_read" ON schools
  FOR SELECT USING (status = 'active');

-- Super admin: full access
CREATE POLICY "schools_super_admin_all" ON schools
  FOR ALL USING (current_user_role() = 'super_admin');

-- School admin: manage own school
CREATE POLICY "schools_admin_update" ON schools
  FOR UPDATE USING (id = current_school_id() AND current_user_role() = 'school_admin');

-- ================================================================
-- PROFILES
-- ================================================================
-- Users can read their own profile
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- School admin can read profiles in their school
CREATE POLICY "profiles_school_admin_read" ON profiles
  FOR SELECT USING (
    current_user_role() IN ('school_admin','super_admin')
    AND school_id = current_school_id()
  );

-- Super admin: full access
CREATE POLICY "profiles_super_admin_all" ON profiles
  FOR ALL USING (current_user_role() = 'super_admin');

-- Teachers can read student profiles in same school
CREATE POLICY "profiles_teacher_read" ON profiles
  FOR SELECT USING (
    current_user_role() = 'teacher'
    AND school_id = current_school_id()
  );

-- ================================================================
-- STUDENTS
-- ================================================================
CREATE POLICY "students_own_read" ON students
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "students_own_update" ON students
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "students_teacher_read" ON students
  FOR SELECT USING (
    current_user_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = students.id AND p.school_id = current_school_id()
    )
  );

CREATE POLICY "students_school_admin_read" ON students
  FOR SELECT USING (
    current_user_role() = 'school_admin'
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = students.id AND p.school_id = current_school_id()
    )
  );

CREATE POLICY "students_super_admin_all" ON students
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- TEACHERS
-- ================================================================
CREATE POLICY "teachers_own_read" ON teachers
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "teachers_own_update" ON teachers
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "teachers_school_admin_read" ON teachers
  FOR SELECT USING (
    current_user_role() IN ('school_admin','super_admin')
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = teachers.id AND p.school_id = current_school_id()
    )
  );

CREATE POLICY "teachers_super_admin_all" ON teachers
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- SUBJECTS & TOPICS (public read)
-- ================================================================
CREATE POLICY "subjects_public_read" ON subjects
  FOR SELECT USING (is_active = true);

CREATE POLICY "subjects_super_admin_all" ON subjects
  FOR ALL USING (current_user_role() = 'super_admin');

CREATE POLICY "topics_public_read" ON topics
  FOR SELECT USING (true);

CREATE POLICY "topics_super_admin_all" ON topics
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- EXAMS (past papers)
-- ================================================================
-- Public exams (school_id is NULL) are readable by all authenticated users
CREATE POLICY "exams_public_read" ON exams
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND status = 'active'
    AND (school_id IS NULL OR school_id = current_school_id())
  );

-- Teachers can create/update exams for their school
CREATE POLICY "exams_teacher_insert" ON exams
  FOR INSERT WITH CHECK (
    current_user_role() = 'teacher'
    AND school_id = current_school_id()
  );

CREATE POLICY "exams_teacher_update" ON exams
  FOR UPDATE USING (
    current_user_role() = 'teacher'
    AND created_by = auth.uid()
  );

-- Super admin: full access
CREATE POLICY "exams_super_admin_all" ON exams
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- QUESTIONS
-- ================================================================
CREATE POLICY "questions_read" ON questions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND e.status = 'active'
      AND (e.school_id IS NULL OR e.school_id = current_school_id())
    )
  );

CREATE POLICY "questions_teacher_manage" ON questions
  FOR ALL USING (
    current_user_role() IN ('teacher','school_admin','super_admin')
    AND EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND e.created_by = auth.uid()
    )
  );

CREATE POLICY "questions_super_admin_all" ON questions
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- EXAM SESSIONS
-- ================================================================
CREATE POLICY "exam_sessions_own" ON exam_sessions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "exam_sessions_teacher_read" ON exam_sessions
  FOR SELECT USING (
    current_user_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM exams e
      JOIN profiles p ON p.id = exam_sessions.student_id
      WHERE e.id = exam_sessions.exam_id AND p.school_id = current_school_id()
    )
  );

CREATE POLICY "exam_sessions_school_admin_read" ON exam_sessions
  FOR SELECT USING (
    current_user_role() = 'school_admin'
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = exam_sessions.student_id AND p.school_id = current_school_id()
    )
  );

CREATE POLICY "exam_sessions_super_admin_all" ON exam_sessions
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- ONLINE EXAMS
-- ================================================================
-- Public: anyone can read active/upcoming online exams (to join)
CREATE POLICY "online_exams_public_read" ON online_exams
  FOR SELECT USING (status IN ('scheduled','lobby','live'));

-- After exam: authenticated users can read ended exams
CREATE POLICY "online_exams_auth_read_ended" ON online_exams
  FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'ended');

-- Teachers: create/manage their exams
CREATE POLICY "online_exams_teacher_manage" ON online_exams
  FOR ALL USING (
    current_user_role() IN ('teacher','school_admin')
    AND created_by = auth.uid()
  );

CREATE POLICY "online_exams_teacher_insert" ON online_exams
  FOR INSERT WITH CHECK (current_user_role() IN ('teacher','school_admin','super_admin'));

CREATE POLICY "online_exams_super_admin_all" ON online_exams
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- ONLINE EXAM PARTICIPANTS
-- ================================================================
-- Anyone (including guests) can read participants for live exam (leaderboard)
CREATE POLICY "oep_public_read" ON online_exam_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM online_exams oe WHERE oe.id = online_exam_participants.exam_session_id
      AND oe.status IN ('lobby','live','ended')
    )
  );

-- Students can insert themselves
CREATE POLICY "oep_student_insert" ON online_exam_participants
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    OR student_id IS NULL -- guest
  );

-- Students can update their own record
CREATE POLICY "oep_own_update" ON online_exam_participants
  FOR UPDATE USING (student_id = auth.uid() OR student_id IS NULL);

-- Teacher/admin: full access to their exam participants
CREATE POLICY "oep_teacher_read" ON online_exam_participants
  FOR SELECT USING (
    current_user_role() IN ('teacher','school_admin','super_admin')
    AND EXISTS (
      SELECT 1 FROM online_exams oe WHERE oe.id = online_exam_participants.exam_session_id
      AND oe.created_by = auth.uid()
    )
  );

CREATE POLICY "oep_super_admin_all" ON online_exam_participants
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- BADGES
-- ================================================================
CREATE POLICY "badges_public_read" ON badges FOR SELECT USING (is_active = true);
CREATE POLICY "badges_super_admin_all" ON badges FOR ALL USING (current_user_role() = 'super_admin');

CREATE POLICY "student_badges_own_read" ON student_badges FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "student_badges_super_admin_all" ON student_badges FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- HOMEWORK
-- ================================================================
CREATE POLICY "homework_student_read" ON homework
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
      AND p.school_id = homework.school_id
    )
  );

CREATE POLICY "homework_teacher_manage" ON homework
  FOR ALL USING (teacher_id = auth.uid() OR current_user_role() = 'super_admin');

CREATE POLICY "homework_submissions_own" ON homework_submissions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "homework_submissions_teacher_read" ON homework_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM homework h WHERE h.id = homework_submissions.homework_id AND h.teacher_id = auth.uid())
    OR current_user_role() = 'super_admin'
  );

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "notifications_super_admin_all" ON notifications
  FOR ALL USING (current_user_role() = 'super_admin');

-- ================================================================
-- AI QUERIES
-- ================================================================
CREATE POLICY "ai_queries_own" ON ai_queries
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "ai_queries_super_admin_all" ON ai_queries
  FOR ALL USING (current_user_role() = 'super_admin');

