// ── Edge Function: submit-exam ─────────────────────────────────
// POST /functions/v1/submit-exam
// Body: { type: "online"|"past_paper", participant_id?, exam_id?, student_id?, answers, time_secs }
import { supabaseAdmin, corsHeaders, respond, error } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { type, participant_id, exam_id, student_id, answers, time_secs } = body;

    if (!answers) return error("answers is required");

    let result;

    if (type === "online") {
      if (!participant_id) return error("participant_id is required for online exams");
      const { data, error: rpcErr } = await supabaseAdmin.rpc("submit_online_exam", {
        p_participant_id: participant_id,
        p_answers:        answers,
        p_time_secs:      time_secs || 0,
      });
      if (rpcErr) return error(rpcErr.message);
      if (data?.error) return error(data.error);
      result = data;

      // Broadcast to leaderboard channel
      const { data: part } = await supabaseAdmin
        .from("online_exam_participants")
        .select("exam_session_id, guest_name, guest_school, percentage, rank")
        .eq("id", participant_id).single();

      if (part) {
        await supabaseAdmin.channel(`leaderboard-${part.exam_session_id}`).send({
          type: "broadcast", event: "score_updated",
          payload: { name: part.guest_name, percentage: part.percentage, rank: part.rank },
        });
      }
    } else {
      // Past paper submission
      if (!exam_id || !student_id) return error("exam_id and student_id required for past papers");
      const { data, error: rpcErr } = await supabaseAdmin.rpc("submit_exam_session", {
        p_student_id: student_id, p_exam_id: exam_id,
        p_answers: answers, p_time_secs: time_secs || 0,
      });
      if (rpcErr) return error(rpcErr.message);
      result = data;
    }

    // Check and award badges
    if (student_id) {
      await checkAndAwardBadges(student_id, result);
    }

    return respond({ success: true, result });
  } catch (e) {
    return error(e.message, 500);
  }
});

async function checkAndAwardBadges(studentId: string, result: Record<string, unknown>) {
  const { data: student } = await supabaseAdmin.from("students").select("*").eq("id", studentId).single();
  if (!student) return;

  const badges: string[] = [];

  if (student.total_exams === 1)   badges.push("first_exam");
  if (student.streak >= 7)         badges.push("streak_7");
  if (student.streak >= 30)        badges.push("streak_30");
  if ((result.percentage as number) === 100) badges.push("perfect_score");
  if ((result.grade as string) === "A")      badges.push("grade_a");
  if (student.total_exams >= 10)   badges.push("papers_10");
  if (student.total_exams >= 50)   badges.push("papers_50");
  if ((result.division as string) === "Division I") badges.push("division_1");

  for (const code of badges) {
    const { data: badge } = await supabaseAdmin.from("badges").select("id,name,xp_reward").eq("code", code).single();
    if (!badge) continue;

    const { error: insertErr } = await supabaseAdmin.from("student_badges")
      .insert({ student_id: studentId, badge_id: badge.id })
      .select().single();

    if (!insertErr) {
      // Award XP
      await supabaseAdmin.from("students").update({ xp: student.xp + badge.xp_reward }).eq("id", studentId);
      // Notify
      await supabaseAdmin.from("notifications").insert({
        user_id: studentId, type: "badge_earned",
        title: `🏆 Badge Earned: ${badge.name}!`,
        body: `You earned the ${badge.name} badge and ${badge.xp_reward} XP. Keep it up!`,
      });
    }
  }
}
