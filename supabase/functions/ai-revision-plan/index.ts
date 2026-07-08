// ── Edge Function: ai-revision-plan ───────────────────────────
import { supabaseAdmin, corsHeaders, respond, error } from "../_shared/supabase.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!ANTHROPIC_KEY) return error("AI not configured", 503);

  try {
    const { studentId, weakTopics, level, daysUntilExam } = await req.json();

    const prompt = `You are an expert exam coach for Tanzanian ${level} students.

The student has ${daysUntilExam} days until their NECTA exam.
Their weak topics are: ${weakTopics.join(", ")}.

Create a realistic daily revision plan that:
1. Prioritizes the weakest topics
2. Allocates 2-3 hours of study per day
3. Includes short breaks and review days
4. Ends with a full mock exam week

Format as a clear week-by-week plan. Be specific and motivating. Keep it under 300 words.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
    });

    const data = await res.json();
    return respond({ plan: data.content?.[0]?.text ?? "" });
  } catch (e) {
    return error(e.message, 500);
  }
});
