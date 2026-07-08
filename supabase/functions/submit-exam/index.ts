import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok  = (data: unknown)        => new Response(JSON.stringify(data),           { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const err = (msg: string, s = 400) => new Response(JSON.stringify({ error: msg }), { status: s,   headers: { ...corsHeaders, "Content-Type": "application/json" } });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Badge codes to check after submission
const BADGE_CHECKS = [
  { code: "first_exam",    check: (s: Record<string,unknown>) => (s.total_exams as number) === 1 },
  { code: "streak_7",      check: (s: Record<string,unknown>) => (s.streak as number) >= 7 },
  { code: "streak_30",     check: (s: Record<string,unknown>) => (s.streak as number) >= 30 },
  { code: "papers_10",     check: (s: Record<string,unknown>) => (s.total_exams as number) >= 10 },
  { code: "papers_50",     check: (s: Record<string,unknown>) => (s.total_exams as number) >= 50 },
];

async function awardBadges(studentId: string, result: Record<string,unknown>) {
  const { data: student } = await supabase.from("students").select("*").eq("id", studentId).single();
  if (!student) return;

  const checks = [
    ...BADGE_CHECKS,
    { code: "perfect_score", check: () => (result.percentage as number) === 100 },
    { code: "grade_a",       check: () => result.grade === "A" },
    { code: "division_1",    check: () => result.division === "Division I" },
  ];

  for (const { code, check } of checks) {
    if (!check(student)) continue;
    const { data: badge } = await supabase.from("badges").select("id,name,xp_reward").eq("code", code).single();
    if (!badge) continue;
    const { error: ie } = await supabase.from("student_badges")
      .insert({ student_id: studentId, badge_id: badge.id });
    if (!ie) {
      await supabase.from("students").update({ xp: (student.xp as number) + (badge.xp_reward as number) }).eq("id", studentId);
      await supabase.from("notifications").insert({
        user_id: studentId, type: "badge_earned",
        title: `🏆 Badge Earned: ${badge.name}!`,
        body:  `You earned the ${badge.name} badge and ${badge.xp_reward} XP!`,
      });
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { type, participant_id, exam_id, student_id, answers, time_secs } = await req.json();
    if (!answers) return err("answers is required");

    let result: Record<string,unknown>;

    if (type === "online") {
      if (!participant_id) return err("participant_id is required for online exams");
      const { data, error: rpcErr } = await supabase.rpc("submit_online_exam", {
        p_participant_id: participant_id,
        p_answers:        answers,
        p_time_secs:      time_secs || 0,
      });
      if (rpcErr) return err(rpcErr.message);
      if (data?.error) return err(data.error);
      result = data as Record<string,unknown>;
    } else {
      if (!exam_id || !student_id) return err("exam_id and student_id required for past papers");
      const { data, error: rpcErr } = await supabase.rpc("submit_exam_session", {
        p_student_id: student_id,
        p_exam_id:    exam_id,
        p_answers:    answers,
        p_time_secs:  time_secs || 0,
      });
      if (rpcErr) return err(rpcErr.message);
      result = data as Record<string,unknown>;
      if (student_id) await awardBadges(student_id, result);
    }

    return ok({ success: true, result });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});
