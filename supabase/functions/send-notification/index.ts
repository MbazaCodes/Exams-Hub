// ExamHub Tanzania — Edge Function: send-notification
// Sends in-app notifications to student / school / all users.

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

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseService) return fail("Supabase env vars not set", 503);

  const admin = createClient(supabaseUrl, supabaseService, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Verify caller is authenticated and has permission
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    if (!token) return fail("Missing Authorization header", 401);

    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return fail("Invalid or expired token", 401);

    const { data: caller } = await admin
      .from("profiles").select("role, school_id").eq("id", user.id).single();

    const allowedRoles = ["teacher", "school_admin", "super_admin"];
    if (!allowedRoles.includes(caller?.role ?? "")) {
      return fail("Forbidden — teacher or admin required", 403);
    }

    const body = await req.json();
    const { target, school_id, student_id, type, title, body: msgBody, data: extra } = body;

    if (!type || !title || !msgBody) {
      return fail("type, title and body are required");
    }

    type NotifRow = { user_id: string; type: string; title: string; body: string; data: unknown };
    const rows: NotifRow[] = [];

    if (target === "student" && student_id) {
      rows.push({ user_id: student_id, type, title, body: msgBody, data: extra ?? {} });

    } else if (target === "school") {
      const targetSchoolId = school_id || caller?.school_id;
      if (!targetSchoolId) return fail("school_id is required for school target");

      const { data: profiles } = await admin
        .from("profiles").select("id").eq("school_id", targetSchoolId);

      (profiles ?? []).forEach((p: { id: string }) => {
        rows.push({ user_id: p.id, type, title, body: msgBody, data: extra ?? {} });
      });

    } else if (target === "all") {
      if (caller?.role !== "super_admin") {
        return fail("Only super_admin can send to all users", 403);
      }
      // Paginated broadcast — 500 users at a time
      let page  = 0;
      let total = 0;
      const PAGE_SIZE = 500;

      while (true) {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id")
          .eq("is_active", true)
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (!profiles?.length) break;

        await admin.from("notifications").insert(
          profiles.map((p: { id: string }) => ({
            user_id: p.id, type, title, body: msgBody, data: extra ?? {},
          })),
        );
        total += profiles.length;
        if (profiles.length < PAGE_SIZE) break;
        page++;
      }
      return ok({ success: true, sent: total });

    } else {
      return fail("target must be 'student', 'school', or 'all'");
    }

    if (rows.length > 0) {
      await admin.from("notifications").insert(rows);
    }

    return ok({ success: true, sent: rows.length });
  } catch (e: unknown) {
    return fail(`Server error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
