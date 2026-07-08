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
    const { join_code, student_id, guest_name, guest_school, guest_region } = await req.json();

    if (!join_code)                      return err("join_code is required");
    if (!student_id && !guest_name)      return err("Either student_id or guest_name is required");

    const { data, error: rpcErr } = await supabase.rpc("join_online_exam", {
      p_join_code:    (join_code as string).toUpperCase(),
      p_student_id:   student_id   || null,
      p_guest_name:   guest_name   || null,
      p_guest_school: guest_school || null,
      p_guest_region: guest_region || null,
    });

    if (rpcErr)    return err(rpcErr.message);
    if (data?.error) return err(data.error);

    return ok(data);
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});
