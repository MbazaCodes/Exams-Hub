-- ================================================================
-- ExamHub Tanzania — Migration 008: Approval Workflow
-- ================================================================

-- ── Add approval_status to profiles.metadata check ─────────────
-- approval_status values: 'pending' | 'approved' | 'rejected'
-- Stored in profiles.metadata JSONB column (already exists)

-- ── RPC: approve or reject a teacher ───────────────────────────
CREATE OR REPLACE FUNCTION approve_teacher(
  p_teacher_id UUID,
  p_approver_id UUID,
  p_action TEXT  -- 'approve' or 'reject'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_approver_role TEXT;
  v_teacher_name  TEXT;
BEGIN
  -- Only school_admin or super_admin can approve
  SELECT role INTO v_approver_role FROM profiles WHERE id = p_approver_id;
  IF v_approver_role NOT IN ('school_admin','super_admin') THEN
    RETURN jsonb_build_object('error','Forbidden');
  END IF;

  SELECT full_name INTO v_teacher_name FROM profiles WHERE id = p_teacher_id;

  IF p_action = 'approve' THEN
    -- Update profile metadata
    UPDATE profiles SET
      metadata   = metadata || '{"approval_status":"approved"}'::jsonb,
      is_active  = true,
      updated_at = NOW()
    WHERE id = p_teacher_id;

    -- Mark teacher as verified
    UPDATE teachers SET is_verified = true WHERE id = p_teacher_id;

    -- Notify the teacher
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      p_teacher_id, 'system',
      '✅ Application Approved!',
      'Your teacher account has been approved. You can now log in to ExamHub.',
      jsonb_build_object('action','login', 'approver_id', p_approver_id)
    );

    RETURN jsonb_build_object('success', true, 'action', 'approved', 'name', v_teacher_name);

  ELSIF p_action = 'reject' THEN
    UPDATE profiles SET
      metadata   = metadata || '{"approval_status":"rejected"}'::jsonb,
      is_active  = false,
      updated_at = NOW()
    WHERE id = p_teacher_id;

    INSERT INTO notifications (user_id, type, title, body)
    VALUES (
      p_teacher_id, 'system',
      '❌ Application Not Approved',
      'Unfortunately your teacher application was not approved. Please contact your school admin for more information.'
    );

    RETURN jsonb_build_object('success', true, 'action', 'rejected', 'name', v_teacher_name);
  END IF;

  RETURN jsonb_build_object('error','Invalid action — use approve or reject');
END;
$$;

-- ── RPC: approve or reject a school ────────────────────────────
CREATE OR REPLACE FUNCTION approve_school(
  p_school_id   UUID,
  p_admin_id    UUID,
  p_approver_id UUID,
  p_action      TEXT  -- 'approve' or 'reject'
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_approver_role TEXT;
  v_school_name   TEXT;
BEGIN
  SELECT role INTO v_approver_role FROM profiles WHERE id = p_approver_id;
  IF v_approver_role != 'super_admin' THEN
    RETURN jsonb_build_object('error','Only super_admin can approve schools');
  END IF;

  SELECT name INTO v_school_name FROM schools WHERE id = p_school_id;

  IF p_action = 'approve' THEN
    -- Activate school
    UPDATE schools SET status = 'active', updated_at = NOW() WHERE id = p_school_id;

    -- Activate school admin profile
    UPDATE profiles SET
      metadata   = metadata || '{"approval_status":"approved"}'::jsonb,
      is_active  = true,
      role       = 'school_admin',
      updated_at = NOW()
    WHERE id = p_admin_id;

    INSERT INTO notifications (user_id, type, title, body)
    VALUES (
      p_admin_id, 'system',
      '✅ School Registration Approved!',
      'Your school ' || v_school_name || ' has been approved. You can now log in to manage your school on ExamHub.'
    );

    RETURN jsonb_build_object('success', true, 'action', 'approved', 'school', v_school_name);

  ELSIF p_action = 'reject' THEN
    UPDATE schools SET status = 'suspended', updated_at = NOW() WHERE id = p_school_id;

    UPDATE profiles SET
      metadata   = metadata || '{"approval_status":"rejected"}'::jsonb,
      is_active  = false,
      updated_at = NOW()
    WHERE id = p_admin_id;

    INSERT INTO notifications (user_id, type, title, body)
    VALUES (
      p_admin_id, 'system',
      '❌ School Registration Not Approved',
      'Unfortunately your registration for ' || v_school_name || ' was not approved. Please contact ExamHub support for more details.'
    );

    RETURN jsonb_build_object('success', true, 'action', 'rejected', 'school', v_school_name);
  END IF;

  RETURN jsonb_build_object('error','Invalid action');
END;
$$;

-- ── RPC: get pending approvals ──────────────────────────────────
CREATE OR REPLACE FUNCTION get_pending_approvals(p_school_id UUID DEFAULT NULL)
RETURNS TABLE (
  type        TEXT,
  id          UUID,
  name        TEXT,
  extra       TEXT,
  region      TEXT,
  submitted   TIMESTAMPTZ,
  metadata    JSONB
) LANGUAGE sql SECURITY DEFINER AS $$
  -- Pending teachers
  SELECT
    'teacher'::TEXT       AS type,
    p.id,
    p.full_name           AS name,
    array_to_string(t.subjects,'   ·  ') AS extra,
    p.region,
    p.created_at          AS submitted,
    p.metadata
  FROM profiles p
  JOIN teachers t ON t.id = p.id
  WHERE p.role = 'teacher'
    AND (p.metadata->>'approval_status') = 'pending'
    AND (p_school_id IS NULL OR p.school_id = p_school_id)

  UNION ALL

  -- Pending school admins (super_admin sees all)
  SELECT
    'school_admin'::TEXT  AS type,
    p.id,
    p.full_name           AS name,
    s.name                AS extra,
    s.region,
    p.created_at          AS submitted,
    p.metadata
  FROM profiles p
  JOIN schools s ON s.id = p.school_id
  WHERE p.role = 'school_admin'
    AND (p.metadata->>'approval_status') = 'pending'
    AND p_school_id IS NULL  -- only super_admin sees school approvals

  ORDER BY submitted ASC;
$$;

GRANT EXECUTE ON FUNCTION approve_teacher(UUID,UUID,TEXT)       TO authenticated;
GRANT EXECUTE ON FUNCTION approve_school(UUID,UUID,UUID,TEXT)   TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_approvals(UUID)           TO authenticated;

