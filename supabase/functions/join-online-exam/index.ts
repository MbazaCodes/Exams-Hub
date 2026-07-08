// ── Edge Function: join-online-exam ───────────────────────────
// POST /functions/v1/join-online-exam
// Body: { join_code, student_id?, guest_name?, guest_school?, guest_region? }
import { supabaseAdmin, corsHeaders, respond, error } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { join_code, student_id, guest_name, guest_school, guest_region } = await req.json();
    if (!join_code) return error("join_code is required");
    if (!student_id && !guest_name) return error("Either student_id or guest_name is required");

    const { data, error: rpcErr } = await supabaseAdmin.rpc("join_online_exam", {
      p_join_code:    join_code.toUpperCase(),
      p_student_id:   student_id || null,
      p_guest_name:   guest_name || null,
      p_guest_school: guest_school || null,
      p_guest_region: guest_region || null,
    });

    if (rpcErr) return error(rpcErr.message);
    if (data?.error) return error(data.error);

    // Broadcast join event via realtime channel
    await supabaseAdmin.channel(`exam-${data.exam?.id}`).send({
      type: "broadcast", event: "participant_joined",
      payload: { name: guest_name || "Student", school: guest_school, region: guest_region },
    });

    return respond(data);
  } catch (e) {
    return error(e.message, 500);
  }
});
