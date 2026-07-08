// ExamHub Tanzania — Edge Function: submit-exam
// Scores answers, awards badges, triggers leaderboard re-rank.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
}
function fail(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

const BADGE_CHECKS: Array<{ code: string; check: (s: Record<string, unknown>, r: Record<string, unknown>) => boolean }> = [
  { code: "first_exam",    check: (s) => Number(s["total_exams"]) === 1 },
  { code: "streak_7",      check: (s) => Number(s["streak"])      >= 7  },
  { code: "streak_30",     check: (s) => Number(s["streak"])      >= 30 },
  { code: "papers_10",     check: (s) => Number(s["total_exams"]) >= 10 },
  { code: "papers_50",     check: (s) => Number(s["total_exams"]) >= 50 },
  { code: "perfect_score", check: (_s, r) => Number(r["percentage"]) === 100 },
  { code: "grade_a",       check: (_s, r) => r["grade"]    === "A" },
  { code: "division_1",    check: (_s, r) => r["division"] === "Division I" },
];

async function awardBadges(
  admin: ReturnType<typeof createClient>,
  studentId: string,
  result: Record<string, unknown>,
): Promise<void> {
  const { data: student } = await admin.from("students").select("*").eq("id", studentId).single();
  if (!student) return;

  for (const { code, check } of BADGE_CHECKS) {
    if (!check(student as Record<string, unknown>, result)) continue;

    const { data: badge } = await admin
      .from("badges").select("id,name,xp_reward").eq("code", code).single();
    if (!badge) continue;

    const { error: insertErr } = await admin
      .from("student_badges")
      .insert({ student_id: studentId, badge_id: badge.id });

    if (!insertErr) {
      await admin.from("students")
        .update({ xp: Number(student["xp"]) + Number(badge["xp_reward"]) })
        .eq("id", studentId);
      await admin.from("notifications").insert({
        user_id: studentId,
        type:    "badge_earned",
        title:   `🏆 Badge Earned: ${badge["name"]}!`,
        body:    `You earned the ${badge["name"]} badge and ${badge["xp_reward"]} XP!`,
      });
    }
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseService) return fail("Supabase env vars not set", 503);

  const admin = createClient(supabaseUrl, supabaseService, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await req.json();
    const { type, participant_id, exam_id, student_id, answers, time_secs } = body;

    if (!answers) return fail("answers is required");

    let result: Record<string, unknown>;

    if (type === "online") {
      if (!participant_id) return fail("participant_id is required for online exams");

      const { data, error: rpcErr } = await admin.rpc("submit_online_exam", {
        p_participant_id: participant_id,
        p_answers:        answers,
        p_time_secs:      Number(time_secs) || 0,
      });
      if (rpcErr)      return fail(rpcErr.message);
      if (data?.error) return fail(data.error);
      result = data as Record<string, unknown>;

    } else {
      // Past paper
      if (!exam_id || !student_id) {
        return fail("exam_id and student_id are required for past papers");
      }

      const { data, error: rpcErr } = await admin.rpc("submit_exam_session", {
        p_student_id: student_id,
        p_exam_id:    exam_id,
        p_answers:    answers,
        p_time_secs:  Number(time_secs) || 0,
      });
      if (rpcErr) return fail(rpcErr.message);
      result = data as Record<string, unknown>;

      await awardBadges(admin, student_id, result);
    }

    return ok({ success: true, result });
  } catch (e: unknown) {
    return fail(`Server error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
