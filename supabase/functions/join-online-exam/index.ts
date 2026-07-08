// ExamHub Tanzania — Edge Function: join-online-exam
// Validates join code and registers participant (guest or student).

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
    const body = await req.json();
    const { join_code, student_id, guest_name, guest_school, guest_region } = body;

    if (!join_code)                 return fail("join_code is required");
    if (!student_id && !guest_name) return fail("Either student_id or guest_name is required");

    const { data, error: rpcErr } = await admin.rpc("join_online_exam", {
      p_join_code:    String(join_code).toUpperCase(),
      p_student_id:   student_id   || null,
      p_guest_name:   guest_name   || null,
      p_guest_school: guest_school || null,
      p_guest_region: guest_region || null,
    });

    if (rpcErr)       return fail(rpcErr.message);
    if (data?.error)  return fail(data.error);

    return ok(data);
  } catch (e: unknown) {
    return fail(`Server error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
