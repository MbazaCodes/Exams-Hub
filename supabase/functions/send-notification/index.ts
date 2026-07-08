// ── Edge Function: send-notification ──────────────────────────
// POST /functions/v1/send-notification
// Body: { target: "all"|"school"|"student", school_id?, student_id?,
//         type, title, body, data? }
import { supabaseAdmin, corsHeaders, respond, error } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return error("Unauthorized", 401);

    const { data: caller } = await supabaseAdmin.from("profiles").select("role,school_id").eq("id", user.id).single();
    if (!["teacher","school_admin","super_admin"].includes(caller?.role)) return error("Forbidden", 403);

    const { target, school_id, student_id, type, title, body: msgBody, data: extra } = await req.json();
    if (!type || !title || !msgBody) return error("type, title and body are required");

    const rows: Record<string, unknown>[] = [];

    if (target === "student" && student_id) {
      rows.push({ user_id: student_id, type, title, body: msgBody, data: extra || {} });

    } else if (target === "school") {
      const sid = school_id || caller.school_id;
      const { data: profiles } = await supabaseAdmin.from("profiles").select("id").eq("school_id", sid);
      profiles?.forEach(p => rows.push({ user_id: p.id, type, title, body: msgBody, data: extra || {} }));

    } else if (target === "all" && caller.role === "super_admin") {
      // Batch insert to all active users — paginated
      let page = 0;
      const pageSize = 500;
      while (true) {
        const { data: profiles } = await supabaseAdmin.from("profiles").select("id").eq("is_active", true).range(page * pageSize, (page + 1) * pageSize - 1);
        if (!profiles?.length) break;
        const batch = profiles.map(p => ({ user_id: p.id, type, title, body: msgBody, data: extra || {} }));
        await supabaseAdmin.from("notifications").insert(batch);
        if (profiles.length < pageSize) break;
        page++;
      }
      return respond({ success: true, message: "Broadcast sent to all users" });
    }

    if (rows.length > 0) {
      await supabaseAdmin.from("notifications").insert(rows);
    }

    return respond({ success: true, sent: rows.length });
  } catch (e) {
    return error(e.message, 500);
  }
});
