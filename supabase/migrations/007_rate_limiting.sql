-- ================================================================
-- ExamHub Tanzania — Migration 007: Rate Limiting & Audit Logs
-- ================================================================

-- ── Rate limiting table ───────────────────────────────────────
CREATE TABLE rate_limits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier  TEXT NOT NULL,        -- user_id or ip_address
  action      TEXT NOT NULL,        -- 'ai_query', 'exam_join', 'submit', 'login'
  count       INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', NOW()),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, action, window_start)
);

CREATE INDEX idx_rate_limits ON rate_limits(identifier, action, window_start);

-- ── Audit log ─────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user   ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_table  ON audit_logs(table_name, record_id);

-- ── Rate limit check function ─────────────────────────────────
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_action     TEXT,
  p_limit      INTEGER DEFAULT 100
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
  v_window TIMESTAMPTZ := date_trunc('hour', NOW());
BEGIN
  INSERT INTO rate_limits (identifier, action, count, window_start)
  VALUES (p_identifier, p_action, 1, v_window)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;

-- Limits per hour:
-- AI queries: 30 per student per hour
-- Exam joins: 10 per IP per hour
-- Submissions: 20 per user per hour

-- ── Anti-cheat: tab switch log ────────────────────────────────
CREATE TABLE exam_integrity_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
  participant_id  UUID REFERENCES online_exam_participants(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL, -- 'tab_switch', 'copy_attempt', 'fullscreen_exit', 'idle'
  event_count     INTEGER DEFAULT 1,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integrity ON exam_integrity_events(exam_session_id, event_type);

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT,TEXT,INTEGER) TO authenticated, anon;

