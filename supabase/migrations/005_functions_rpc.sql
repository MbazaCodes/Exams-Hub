-- ================================================================
-- ExamHub Tanzania — Migration 005: RPC Functions for Frontend
-- ================================================================

-- ── Get student dashboard stats ───────────────────────────────
CREATE OR REPLACE FUNCTION get_student_dashboard(p_student_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'student',      row_to_json(s.*),
    'profile',      row_to_json(p.*),
    'total_exams',  s.total_exams,
    'avg_score',    ROUND(s.avg_score::NUMERIC, 1),
    'best_score',   s.best_score,
    'streak',       s.streak,
    'xp',           s.xp,
    'coins',        s.coins,
    'level_num',    s.level_num,
    'recent_sessions', (
      SELECT jsonb_agg(row_to_json(es.*) ORDER BY es.submitted_at DESC)
      FROM exam_sessions es WHERE es.student_id = p_student_id LIMIT 5
    ),
    'badges', (
      SELECT jsonb_agg(row_to_json(b.*))
      FROM student_badges sb JOIN badges b ON b.id = sb.badge_id
      WHERE sb.student_id = p_student_id
    ),
    'subject_performance', (
      SELECT jsonb_agg(jsonb_build_object('subject', e.subject_name, 'avg', ROUND(AVG(es.percentage)::NUMERIC,1), 'count', COUNT(*)))
      FROM exam_sessions es JOIN exams e ON e.id = es.exam_id
      WHERE es.student_id = p_student_id AND es.percentage IS NOT NULL
      GROUP BY e.subject_name
    )
  ) INTO v_result
  FROM students s JOIN profiles p ON p.id = s.id
  WHERE s.id = p_student_id;
  RETURN v_result;
END;
$$;

-- ── Get live leaderboard for online exam ──────────────────────
CREATE OR REPLACE FUNCTION get_online_exam_leaderboard(p_exam_code TEXT)
RETURNS TABLE (
  rank          INTEGER,
  student_name  TEXT,
  school        TEXT,
  region        TEXT,
  percentage    NUMERIC,
  score         NUMERIC,
  time_taken    INTEGER,
  status        participant_status,
  submitted_at  TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    oep.rank,
    COALESCE(p.full_name, oep.guest_name)  AS student_name,
    COALESCE(sc.short_name, oep.guest_school) AS school,
    COALESCE(p.region, oep.guest_region)   AS region,
    oep.percentage,
    oep.score,
    oep.time_taken_secs,
    oep.status,
    oep.submitted_at
  FROM online_exam_participants oep
  JOIN online_exams oe ON oe.id = oep.exam_session_id
  LEFT JOIN profiles p ON p.id = oep.student_id
  LEFT JOIN schools sc ON sc.id = p.school_id
  WHERE oe.join_code = p_exam_code
  ORDER BY oep.rank ASC NULLS LAST, oep.percentage DESC NULLS LAST
  LIMIT 500;
END;
$$;

-- ── Get exam with questions ────────────────────────────────────
CREATE OR REPLACE FUNCTION get_exam_with_questions(p_exam_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'exam', row_to_json(e.*),
    'questions', (
      SELECT jsonb_agg(row_to_json(q.*) ORDER BY q.question_num)
      FROM questions q WHERE q.exam_id = p_exam_id
    )
  ) INTO v_result
  FROM exams e WHERE e.id = p_exam_id;
  RETURN v_result;
END;
$$;

-- ── Submit exam session ───────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_exam_session(
  p_student_id  UUID,
  p_exam_id     UUID,
  p_answers     JSONB,
  p_time_secs   INTEGER
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session_id  UUID;
  v_score       NUMERIC := 0;
  v_total       NUMERIC := 0;
  v_correct     INTEGER := 0;
  v_wrong       INTEGER := 0;
  v_grade       TEXT;
  v_division    TEXT;
  v_pct         NUMERIC;
  q             RECORD;
  v_ans         JSONB;
BEGIN
  -- Calculate score
  FOR q IN SELECT * FROM questions WHERE exam_id = p_exam_id LOOP
    v_total := v_total + q.marks;
    v_ans := p_answers -> q.id::TEXT;
    IF v_ans IS NOT NULL THEN
      IF (q.type = 'mcq' AND (v_ans)::INTEGER = (q.correct_answer)::INTEGER) OR
         (q.type = 'truefalse' AND v_ans::BOOLEAN = (q.correct_answer)::BOOLEAN) THEN
        v_score   := v_score + q.marks;
        v_correct := v_correct + 1;
      ELSE
        v_wrong := v_wrong + 1;
      END IF;
    END IF;
  END LOOP;

  v_pct := CASE WHEN v_total > 0 THEN ROUND((v_score / v_total) * 100, 2) ELSE 0 END;

  -- Grading
  v_grade := CASE
    WHEN v_pct >= 75 THEN 'A'
    WHEN v_pct >= 65 THEN 'B'
    WHEN v_pct >= 50 THEN 'C'
    WHEN v_pct >= 30 THEN 'D'
    ELSE 'F' END;

  v_division := CASE
    WHEN v_pct >= 75 THEN 'Division I'
    WHEN v_pct >= 65 THEN 'Division II'
    WHEN v_pct >= 50 THEN 'Division III'
    WHEN v_pct >= 30 THEN 'Division IV'
    ELSE 'Division Zero' END;

  -- Upsert session
  INSERT INTO exam_sessions (student_id, exam_id, answers, score, percentage, grade, division, time_taken_secs, status, submitted_at)
  VALUES (p_student_id, p_exam_id, p_answers, v_score, v_pct, v_grade, v_division, p_time_secs, 'pending', NOW())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_session_id;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'score',      v_score,
    'total',      v_total,
    'percentage', v_pct,
    'grade',      v_grade,
    'division',   v_division,
    'correct',    v_correct,
    'wrong',      v_wrong
  );
END;
$$;

-- ── Join online exam ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION join_online_exam(
  p_join_code   TEXT,
  p_student_id  UUID DEFAULT NULL,
  p_guest_name  TEXT DEFAULT NULL,
  p_guest_school TEXT DEFAULT NULL,
  p_guest_region TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_exam    online_exams%ROWTYPE;
  v_part_id UUID;
BEGIN
  SELECT * INTO v_exam FROM online_exams WHERE join_code = UPPER(p_join_code);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid join code');
  END IF;

  IF v_exam.status NOT IN ('scheduled','lobby','live') THEN
    RETURN jsonb_build_object('error', 'This exam is not currently accepting participants');
  END IF;

  IF v_exam.max_participants IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM online_exam_participants WHERE exam_session_id = v_exam.id) >= v_exam.max_participants THEN
      RETURN jsonb_build_object('error', 'Exam is full');
    END IF;
  END IF;

  -- Check for duplicate
  SELECT id INTO v_part_id FROM online_exam_participants
  WHERE exam_session_id = v_exam.id
    AND (student_id = p_student_id OR (guest_name = p_guest_name AND guest_school = p_guest_school))
  LIMIT 1;

  IF v_part_id IS NOT NULL THEN
    RETURN jsonb_build_object('participant_id', v_part_id, 'exam', row_to_json(v_exam.*), 'rejoined', true);
  END IF;

  INSERT INTO online_exam_participants (exam_session_id, student_id, guest_name, guest_school, guest_region, status)
  VALUES (v_exam.id, p_student_id, p_guest_name, p_guest_school, p_guest_region, 'joined')
  RETURNING id INTO v_part_id;

  RETURN jsonb_build_object(
    'participant_id', v_part_id,
    'exam',           row_to_json(v_exam.*),
    'rejoined',       false
  );
END;
$$;

-- ── Submit online exam answer ─────────────────────────────────
CREATE OR REPLACE FUNCTION submit_online_exam(
  p_participant_id UUID,
  p_answers        JSONB,
  p_time_secs      INTEGER
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_part    online_exam_participants%ROWTYPE;
  v_exam    online_exams%ROWTYPE;
  v_score   NUMERIC := 0;
  v_total   NUMERIC := 0;
  v_pct     NUMERIC;
  v_grade   TEXT;
  v_div     TEXT;
  q         JSONB;
  v_ans     JSONB;
BEGIN
  SELECT * INTO v_part FROM online_exam_participants WHERE id = p_participant_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Participant not found'); END IF;
  IF v_part.status = 'submitted' THEN RETURN jsonb_build_object('error','Already submitted'); END IF;

  SELECT * INTO v_exam FROM online_exams WHERE id = v_part.exam_session_id;

  -- Score the answers
  FOR q IN SELECT * FROM jsonb_array_elements(v_exam.questions) LOOP
    v_total := v_total + (q->>'marks')::INTEGER;
    v_ans   := p_answers -> (q->>'id');
    IF v_ans IS NOT NULL THEN
      IF (q->>'type') = 'mcq' AND (v_ans)::INTEGER = (q->>'correct')::INTEGER THEN
        v_score := v_score + (q->>'marks')::INTEGER;
      ELSIF (q->>'type') = 'truefalse' AND v_ans::BOOLEAN = (q->>'correct')::BOOLEAN THEN
        v_score := v_score + (q->>'marks')::INTEGER;
      END IF;
    END IF;
  END LOOP;

  v_pct   := CASE WHEN v_total > 0 THEN ROUND((v_score/v_total)*100,2) ELSE 0 END;
  v_grade := CASE WHEN v_pct>=75 THEN 'A' WHEN v_pct>=65 THEN 'B' WHEN v_pct>=50 THEN 'C' WHEN v_pct>=30 THEN 'D' ELSE 'F' END;
  v_div   := CASE WHEN v_pct>=75 THEN 'Division I' WHEN v_pct>=65 THEN 'Division II' WHEN v_pct>=50 THEN 'Division III' WHEN v_pct>=30 THEN 'Division IV' ELSE 'Division Zero' END;

  UPDATE online_exam_participants SET
    status = 'submitted', answers = p_answers, score = v_score,
    percentage = v_pct, grade = v_grade, division = v_div,
    time_taken_secs = p_time_secs, submitted_at = NOW()
  WHERE id = p_participant_id;

  RETURN jsonb_build_object('score',v_score,'total',v_total,'percentage',v_pct,'grade',v_grade,'division',v_div);
END;
$$;

-- ── Public leaderboard (no auth required) ─────────────────────
CREATE OR REPLACE FUNCTION get_public_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  rank        BIGINT,
  student_name TEXT,
  school      TEXT,
  region      TEXT,
  avg_score   NUMERIC,
  exams_done  BIGINT,
  streak      INTEGER,
  xp          INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.avg_score DESC NULLS LAST, s.xp DESC) AS rank,
    p.full_name,
    COALESCE(sc.short_name, sc.name) AS school,
    p.region,
    ROUND(s.avg_score, 1),
    s.total_exams::BIGINT,
    s.streak,
    s.xp
  FROM students s
  JOIN profiles p ON p.id = s.id
  LEFT JOIN schools sc ON sc.id = p.school_id
  WHERE s.total_exams >= 3
  ORDER BY s.avg_score DESC NULLS LAST, s.xp DESC
  LIMIT p_limit;
$$;

-- ── Top schools ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_school_leaderboard(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  rank        BIGINT,
  school_name TEXT,
  region      TEXT,
  avg_score   NUMERIC,
  pass_rate   NUMERIC,
  students    INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY AVG(s.avg_score) DESC NULLS LAST) AS rank,
    COALESCE(sc.short_name, sc.name),
    sc.region,
    ROUND(AVG(s.avg_score)::NUMERIC, 1),
    ROUND((COUNT(*) FILTER (WHERE s.avg_score >= 50) * 100.0 / NULLIF(COUNT(*),0))::NUMERIC, 1),
    COUNT(*)::INTEGER
  FROM students s
  JOIN profiles p ON p.id = s.id
  JOIN schools sc ON sc.id = p.school_id
  WHERE s.total_exams >= 2
  GROUP BY sc.id, sc.name, sc.short_name, sc.region
  ORDER BY AVG(s.avg_score) DESC NULLS LAST
  LIMIT p_limit;
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_student_dashboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_exam_leaderboard(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_exam_with_questions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_exam_session(UUID,UUID,JSONB,INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION join_online_exam(TEXT,UUID,TEXT,TEXT,TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION submit_online_exam(UUID,JSONB,INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_public_leaderboard(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_school_leaderboard(INTEGER) TO authenticated, anon;

