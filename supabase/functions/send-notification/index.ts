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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify caller
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return err("Unauthorized", 401);

    const { data: caller } = await supabase.from("profiles").select("role,school_id").eq("id", user.id).single();
    if (!["teacher","school_admin","super_admin"].includes(caller?.role ?? ""))
      return err("Forbidden", 403);

    const { target, school_id, student_id, type, title, body: msgBody, data: extra } = await req.json();
    if (!type || !title || !msgBody) return err("type, title and body are required");

    const rows: Record<string,unknown>[] = [];

    if (target === "student" && student_id) {
      rows.push({ user_id: student_id, type, title, body: msgBody, data: extra ?? {} });

    } else if (target === "school") {
      const sid = school_id || caller.school_id;
      const { data: profiles } = await supabase.from("profiles").select("id").eq("school_id", sid);
      (profiles ?? []).forEach(p => rows.push({ user_id: p.id, type, title, body: msgBody, data: extra ?? {} }));

    } else if (target === "all" && caller.role === "super_admin") {
      // Paginated broadcast
      let page = 0;
      const size = 500;
      let total = 0;
      while (true) {
        const { data: profiles } = await supabase
          .from("profiles").select("id").eq("is_active", true)
          .range(page * size, (page + 1) * size - 1);
        if (!profiles?.length) break;
        await supabase.from("notifications").insert(
          profiles.map(p => ({ user_id: p.id, type, title, body: msgBody, data: extra ?? {} }))
        );
        total += profiles.length;
        if (profiles.length < size) break;
        page++;
      }
      return ok({ success: true, sent: total });
    }

    if (rows.length > 0) await supabase.from("notifications").insert(rows);

    return ok({ success: true, sent: rows.length });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});
