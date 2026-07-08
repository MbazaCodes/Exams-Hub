// ── NOTE: This file is NO LONGER imported by Edge Functions ───
// Each function is self-contained (inlined helpers) to avoid
// Deno bundle path resolution errors during deployment.
//
// This file is kept only as a reference / documentation.
// Supabase Edge Functions are bundled in isolation from a temp
// directory, which breaks relative ../_ shared imports.
//
// Each function imports directly from esm.sh:
//   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
//
// ── Shared constants (copy into functions as needed) ──────────

export const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
