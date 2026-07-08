-- ================================================================
-- ExamHub Tanzania — Migration 001: Core Schema
-- Run in Supabase SQL Editor or via: supabase db push
-- ================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search

-- ================================================================
-- ENUMS
-- ================================================================
CREATE TYPE user_role AS ENUM ('student','teacher','school_admin','super_admin','parent');
CREATE TYPE school_type AS ENUM ('government','private');
CREATE TYPE school_plan AS ENUM ('free','premium','enterprise');
CREATE TYPE school_status AS ENUM ('active','pending','suspended','blocked');
CREATE TYPE education_level AS ENUM ('standard_4','standard_7','form_2','form_4','form_6');
CREATE TYPE exam_type AS ENUM ('necta','mock','pre_national','regional','district','school','online_global');
CREATE TYPE difficulty AS ENUM ('easy','medium','hard');
CREATE TYPE question_type AS ENUM ('mcq','truefalse','short','essay','fill_blank');
CREATE TYPE exam_status AS ENUM ('draft','scheduled','active','completed','archived');
CREATE TYPE online_exam_status AS ENUM ('scheduled','lobby','live','marking','ended');
CREATE TYPE participant_status AS ENUM ('registered','joined','in_progress','submitted','disconnected','disqualified');
CREATE TYPE submission_status AS ENUM ('pending','marked','reviewed');
CREATE TYPE gender AS ENUM ('male','female','other');
CREATE TYPE notification_type AS ENUM ('exam_start','exam_result','badge_earned','streak_reminder','system','announcement');

-- ================================================================
-- SCHOOLS
-- ================================================================
CREATE TABLE schools (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  short_name    TEXT,
  reg_number    TEXT UNIQUE,
  region        TEXT NOT NULL,
  district      TEXT,
  ward          TEXT,
  address       TEXT,
  type          school_type NOT NULL DEFAULT 'government',
  plan          school_plan NOT NULL DEFAULT 'free',
  status        school_status NOT NULL DEFAULT 'pending',
  logo_url      TEXT,
  website       TEXT,
  phone         TEXT,
  email         TEXT,
  established   INTEGER,
  total_students INTEGER DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schools_region  ON schools(region);
CREATE INDEX idx_schools_plan    ON schools(plan);
CREATE INDEX idx_schools_status  ON schools(status);
CREATE INDEX idx_schools_name    ON schools USING GIN(name gin_trgm_ops);

-- ================================================================
-- PROFILES (extends Supabase auth.users)
-- ================================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'student',
  full_name     TEXT NOT NULL,
  phone         TEXT UNIQUE,
  avatar_url    TEXT,
  gender        gender,
  date_of_birth DATE,
  region        TEXT,
  school_id     UUID REFERENCES schools(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role     ON profiles(role);
CREATE INDEX idx_profiles_school   ON profiles(school_id);
CREATE INDEX idx_profiles_phone    ON profiles(phone);

-- ================================================================
-- STUDENTS
-- ================================================================
CREATE TABLE students (
  id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  level           education_level NOT NULL,
  combination     TEXT,                -- Form 6 e.g. PCM, PCB
  class_name      TEXT,                -- e.g. "Form 4A"
  admission_number TEXT,
  -- Gamification
  xp              INTEGER NOT NULL DEFAULT 0,
  coins           INTEGER NOT NULL DEFAULT 0,
  level_num       INTEGER NOT NULL DEFAULT 1,
  streak          INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_active     DATE,
  -- Stats
  total_exams     INTEGER NOT NULL DEFAULT 0,
  total_papers    INTEGER NOT NULL DEFAULT 0,
  avg_score       NUMERIC(5,2),
  best_score      NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_level  ON students(level);
CREATE INDEX idx_students_xp     ON students(xp DESC);
CREATE INDEX idx_students_streak ON students(streak DESC);

-- ================================================================
-- TEACHERS
-- ================================================================
CREATE TABLE teachers (
  id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id     TEXT,
  qualification   TEXT,
  subjects        TEXT[] NOT NULL DEFAULT '{}',
  classes         TEXT[] DEFAULT '{}',
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  joined_date     DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- SUBJECTS & TOPICS
-- ================================================================
CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  code        TEXT UNIQUE,
  icon        TEXT,
  color       TEXT,
  description TEXT,
  levels      education_level[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  level       education_level,
  sort_order  INTEGER DEFAULT 0
);

CREATE INDEX idx_topics_subject ON topics(subject_id);

-- ================================================================
-- EXAMS (past papers library)
-- ================================================================
CREATE TABLE exams (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  subject_id      UUID REFERENCES subjects(id),
  subject_name    TEXT NOT NULL,
  level           education_level NOT NULL,
  year            INTEGER NOT NULL,
  paper_number    INTEGER NOT NULL DEFAULT 1,
  type            exam_type NOT NULL DEFAULT 'necta',
  difficulty      difficulty NOT NULL DEFAULT 'medium',
  duration_mins   INTEGER NOT NULL DEFAULT 120,
  total_marks     INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  combination     TEXT,               -- Form 6 only
  has_marking_guide BOOLEAN DEFAULT false,
  has_ai_tutor    BOOLEAN DEFAULT true,
  pdf_url         TEXT,
  attempts        INTEGER NOT NULL DEFAULT 0,
  avg_score       NUMERIC(5,2),
  created_by      UUID REFERENCES profiles(id),
  school_id       UUID REFERENCES schools(id),-- NULL = national/public
  status          exam_status NOT NULL DEFAULT 'active',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subject_name, level, year, paper_number, type)
);

CREATE INDEX idx_exams_subject   ON exams(subject_name);
CREATE INDEX idx_exams_level     ON exams(level);
CREATE INDEX idx_exams_year      ON exams(year DESC);
CREATE INDEX idx_exams_type      ON exams(type);
CREATE INDEX idx_exams_status    ON exams(status);
CREATE INDEX idx_exams_search    ON exams USING GIN(title gin_trgm_ops);

-- ================================================================
-- QUESTIONS
-- ================================================================
CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id       UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  topic_id      UUID REFERENCES topics(id),
  topic_name    TEXT,
  question_num  INTEGER NOT NULL,
  type          question_type NOT NULL DEFAULT 'mcq',
  text          TEXT NOT NULL,
  options       JSONB,               -- ["A","B","C","D"] for MCQ
  correct_answer JSONB NOT NULL,     -- index for MCQ, bool for T/F, text for short
  marks         INTEGER NOT NULL DEFAULT 1,
  explanation   TEXT,                -- marking guide explanation
  difficulty    difficulty DEFAULT 'medium',
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_exam   ON questions(exam_id);
CREATE INDEX idx_questions_topic  ON questions(topic_id);
CREATE INDEX idx_questions_type   ON questions(type);

-- ================================================================
-- STUDENT EXAM SESSIONS (past paper attempts)
-- ================================================================
CREATE TABLE exam_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL DEFAULT '{}',  -- {question_id: answer}
  score           NUMERIC(5,2),
  percentage      NUMERIC(5,2),
  grade           TEXT,
  division        TEXT,
  time_taken_secs INTEGER,
  status          submission_status NOT NULL DEFAULT 'pending',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ,
  marked_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_sessions_student ON exam_sessions(student_id);
CREATE INDEX idx_exam_sessions_exam    ON exam_sessions(exam_id);
CREATE INDEX idx_exam_sessions_score   ON exam_sessions(score DESC);

-- ================================================================
-- ONLINE GLOBAL EXAMS
-- ================================================================
CREATE TABLE online_exams (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  subject_name      TEXT NOT NULL,
  level             education_level NOT NULL,
  description       TEXT,
  join_code         TEXT NOT NULL UNIQUE,  -- e.g. "BIO2024"
  duration_minutes  INTEGER NOT NULL DEFAULT 60,
  max_participants  INTEGER,               -- NULL = unlimited
  status            online_exam_status NOT NULL DEFAULT 'scheduled',
  scheduled_at      TIMESTAMPTZ NOT NULL,
  lobby_opens_at    TIMESTAMPTZ,           -- join allowed from here
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  questions         JSONB NOT NULL DEFAULT '[]',
  settings          JSONB DEFAULT '{
    "shuffle_questions": false,
    "shuffle_options": false,
    "show_timer": true,
    "allow_flag": true,
    "show_live_leaderboard": true,
    "auto_submit_on_expire": true
  }',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_online_exams_code   ON online_exams(join_code);
CREATE INDEX idx_online_exams_status ON online_exams(status);
CREATE INDEX idx_online_exams_date   ON online_exams(scheduled_at DESC);

-- ================================================================
-- ONLINE EXAM PARTICIPANTS
-- ================================================================
CREATE TABLE online_exam_participants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_session_id   UUID NOT NULL REFERENCES online_exams(id) ON DELETE CASCADE,
  student_id        UUID REFERENCES students(id) ON DELETE SET NULL,
  -- Guest participants (no account needed)
  guest_name        TEXT,
  guest_school      TEXT,
  guest_region      TEXT,
  -- Results
  status            participant_status NOT NULL DEFAULT 'registered',
  answers           JSONB DEFAULT '{}',
  score             NUMERIC(5,2),
  percentage        NUMERIC(5,2),
  grade             TEXT,
  division          TEXT,
  rank              INTEGER,
  time_taken_secs   INTEGER,
  -- Tracking
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at        TIMESTAMPTZ,
  submitted_at      TIMESTAMPTZ,
  last_seen_at      TIMESTAMPTZ,
  ip_address        INET,
  CONSTRAINT check_identity CHECK (student_id IS NOT NULL OR guest_name IS NOT NULL)
);

CREATE INDEX idx_oep_session  ON online_exam_participants(exam_session_id);
CREATE INDEX idx_oep_student  ON online_exam_participants(student_id);
CREATE INDEX idx_oep_status   ON online_exam_participants(status);
CREATE INDEX idx_oep_rank     ON online_exam_participants(rank ASC NULLS LAST);

-- ================================================================
-- BADGES
-- ================================================================
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  color       TEXT DEFAULT '#F59E0B',
  xp_reward   INTEGER DEFAULT 0,
  criteria    JSONB NOT NULL DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true
);

CREATE TABLE student_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_student_badges ON student_badges(student_id);

-- ================================================================
-- HOMEWORK
-- ================================================================
CREATE TABLE homework (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id    UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_id     UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  subject_name  TEXT NOT NULL,
  class_names   TEXT[] NOT NULL DEFAULT '{}',
  due_date      DATE NOT NULL,
  max_marks     INTEGER DEFAULT 100,
  file_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE homework_submissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id   UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url      TEXT,
  notes         TEXT,
  score         INTEGER,
  feedback      TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  marked_at     TIMESTAMPTZ,
  UNIQUE(homework_id, student_id)
);

CREATE INDEX idx_hw_teacher   ON homework(teacher_id);
CREATE INDEX idx_hw_school    ON homework(school_id);
CREATE INDEX idx_hw_sub       ON homework_submissions(homework_id);

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL DEFAULT 'system',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifs_user    ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifs_type    ON notifications(type);

-- ================================================================
-- AI TUTOR QUERIES LOG
-- ================================================================
CREATE TABLE ai_queries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID REFERENCES students(id) ON DELETE SET NULL,
  question_id   UUID REFERENCES questions(id) ON DELETE SET NULL,
  prompt        TEXT NOT NULL,
  response      TEXT,
  tokens_used   INTEGER,
  model         TEXT DEFAULT 'claude-sonnet-4-6',
  latency_ms    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_queries_student ON ai_queries(student_id, created_at DESC);

-- ================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['schools','profiles','students','teachers','exams','online_exams']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END;
$$;

-- ================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- STREAK UPDATE FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_student_streak(p_student_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_last_active DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_active INTO v_last_active FROM students WHERE id = p_student_id;
  IF v_last_active = v_today THEN
    RETURN; -- already updated today
  ELSIF v_last_active = v_today - INTERVAL '1 day' THEN
    UPDATE students SET
      streak = streak + 1,
      longest_streak = GREATEST(longest_streak, streak + 1),
      last_active = v_today,
      xp = xp + 10
    WHERE id = p_student_id;
  ELSE
    UPDATE students SET streak = 1, last_active = v_today, xp = xp + 5 WHERE id = p_student_id;
  END IF;
END;
$$;

-- ================================================================
-- RANK ONLINE EXAM PARTICIPANTS
-- ================================================================
CREATE OR REPLACE FUNCTION rank_online_exam(p_exam_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE online_exam_participants oep
  SET rank = r.rank
  FROM (
    SELECT id,
           RANK() OVER (
             PARTITION BY exam_session_id
             ORDER BY percentage DESC NULLS LAST, time_taken_secs ASC NULLS LAST
           ) AS rank
    FROM online_exam_participants
    WHERE exam_session_id = p_exam_id AND status = 'submitted'
  ) r
  WHERE oep.id = r.id;
END;
$$;

-- ================================================================
-- AUTO-RANK WHEN PARTICIPANT SUBMITS
-- ================================================================
CREATE OR REPLACE FUNCTION trg_rank_on_submit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    PERFORM rank_online_exam(NEW.exam_session_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_participant_submitted
  AFTER UPDATE OF status ON online_exam_participants
  FOR EACH ROW EXECUTE FUNCTION trg_rank_on_submit();

-- ================================================================
-- UPDATE EXAM STATS AFTER SESSION
-- ================================================================
CREATE OR REPLACE FUNCTION update_exam_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending' THEN
    UPDATE exams SET
      attempts   = (SELECT COUNT(*) FROM exam_sessions WHERE exam_id = NEW.exam_id),
      avg_score  = (SELECT AVG(percentage) FROM exam_sessions WHERE exam_id = NEW.exam_id AND percentage IS NOT NULL)
    WHERE id = NEW.exam_id;
    -- Update student stats
    PERFORM update_student_streak(NEW.student_id);
    UPDATE students SET
      total_exams  = (SELECT COUNT(*) FROM exam_sessions WHERE student_id = NEW.student_id),
      avg_score    = (SELECT AVG(percentage) FROM exam_sessions WHERE student_id = NEW.student_id AND percentage IS NOT NULL),
      best_score   = (SELECT MAX(percentage) FROM exam_sessions WHERE student_id = NEW.student_id),
      xp           = xp + GREATEST(0, ROUND(NEW.percentage / 5)::INT)
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_exam_session_completed
  AFTER UPDATE OF status ON exam_sessions
  FOR EACH ROW EXECUTE FUNCTION update_exam_stats();

