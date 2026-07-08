-- ================================================================
-- ExamHub Tanzania — Migration 009: TSID Integration
-- Links ExamHub students with Tanzania Student ID System (TSID)
-- TSID project: zleyuyalkygjmjuymzjb
-- ================================================================

-- ── Add TSID fields to students table ─────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS tsid            TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tsid_verified   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tsid_linked_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_url       TEXT,    -- synced from TSID
  ADD COLUMN IF NOT EXISTS first_name      TEXT,    -- synced from TSID
  ADD COLUMN IF NOT EXISTS last_name       TEXT;    -- synced from TSID

CREATE INDEX IF NOT EXISTS idx_students_tsid ON students(tsid);

-- ── Allow login by TSID number ─────────────────────────────────
-- We store the TSID number in profiles.metadata for fast lookup
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tsid TEXT;              -- denormalised for fast auth lookup

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_tsid ON profiles(tsid)
  WHERE tsid IS NOT NULL;

-- ── RPC: Login with TSID + password ────────────────────────────
CREATE OR REPLACE FUNCTION login_with_tsid(
  p_tsid     TEXT,
  p_password TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile  profiles%ROWTYPE;
  v_email    TEXT;
BEGIN
  -- Find profile by TSID
  SELECT * INTO v_profile
  FROM profiles
  WHERE tsid = UPPER(TRIM(p_tsid))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'TSID not found. Register first or check the number.');
  END IF;

  IF NOT v_profile.is_active THEN
    RETURN jsonb_build_object('error', 'Account deactivated. Contact support.');
  END IF;

  -- Return the email so the frontend can call signInWithPassword
  SELECT email INTO v_email FROM auth.users WHERE id = v_profile.id;

  RETURN jsonb_build_object(
    'success',    true,
    'user_id',    v_profile.id,
    'email',      v_email,
    'role',       v_profile.role,
    'full_name',  v_profile.full_name
  );
END;
$$;

-- ── RPC: Link TSID to existing ExamHub account ─────────────────
CREATE OR REPLACE FUNCTION link_tsid_to_account(
  p_user_id     UUID,
  p_tsid        TEXT,
  p_tsid_name   TEXT,    -- name from TSID system for verification
  p_tsid_dob    DATE     -- DOB from TSID for verification
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_existing UUID;
BEGIN
  -- Check TSID not already linked to another account
  SELECT id INTO v_existing FROM profiles WHERE tsid = UPPER(TRIM(p_tsid));
  IF v_existing IS NOT NULL AND v_existing != p_user_id THEN
    RETURN jsonb_build_object('error', 'This TSID is already linked to another account.');
  END IF;

  -- Update profiles
  UPDATE profiles SET
    tsid       = UPPER(TRIM(p_tsid)),
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Update students
  UPDATE students SET
    tsid           = UPPER(TRIM(p_tsid)),
    tsid_verified  = true,
    tsid_linked_at = NOW(),
    first_name     = split_part(p_tsid_name, ' ', 1),
    last_name      = split_part(p_tsid_name, ' ', 2)
  WHERE id = p_user_id;

  -- Badge for linking TSID
  INSERT INTO notifications (user_id, type, title, body)
  VALUES (
    p_user_id, 'system',
    '🪪 TSID Linked Successfully!',
    'Your Tanzania Student ID has been verified and linked to your ExamHub account.'
  ) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'tsid', UPPER(TRIM(p_tsid)));
END;
$$;

-- ── RPC: Sync profile data from TSID ───────────────────────────
CREATE OR REPLACE FUNCTION sync_from_tsid(
  p_user_id  UUID,
  p_tsid     TEXT,
  p_name     TEXT,
  p_photo    TEXT,
  p_school   TEXT,
  p_dob      DATE
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE students SET
    first_name  = split_part(p_name, ' ', 1),
    last_name   = split_part(p_name, ' ', 2),
    photo_url   = p_photo,
    updated_at  = NOW()
  WHERE id = p_user_id;

  UPDATE profiles SET
    full_name      = p_name,
    date_of_birth  = p_dob,
    updated_at     = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'synced_at', NOW());
END;
$$;

GRANT EXECUTE ON FUNCTION login_with_tsid(TEXT, TEXT)                        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION link_tsid_to_account(UUID, TEXT, TEXT, DATE)       TO authenticated;
GRANT EXECUTE ON FUNCTION sync_from_tsid(UUID, TEXT, TEXT, TEXT, TEXT, DATE) TO authenticated;

