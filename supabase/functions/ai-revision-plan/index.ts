// ── Edge Function: ai-revision-plan ───────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ok  = (data: unknown)        => new Response(JSON.stringify(data),           { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const err = (msg: string, s = 400) => new Response(JSON.stringify({ error: msg }), { status: s,   headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY") ?? "";
  if (!ANTHROPIC_KEY) return err("AI not configured", 503);

  try {
    const { weakTopics, level, daysUntilExam, subjects } = await req.json();

    if (!level) return err("level is required");

    const prompt = `You are an expert exam coach for Tanzanian ${level} students preparing for NECTA.

The student has ${daysUntilExam ?? 90} days until their exam.
Their subjects are: ${(subjects ?? []).join(", ") || "all core subjects"}.
Their weakest topics are: ${(weakTopics ?? []).join(", ") || "not specified yet"}.

Create a realistic daily revision plan that:
1. Prioritises the weakest topics first
2. Allocates 2-3 hours of study per day
3. Rotates subjects to avoid burnout
4. Includes brief weekend reviews
5. Ends the final week with full mock exams

Format as a week-by-week plan. Be specific (name actual topics per day). Keep it under 350 words. End with one motivational sentence.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 600,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return err(`Anthropic error: ${res.statusText}`, 502);

    const data = await res.json() as { content: Array<{ text: string }> };
    return ok({ plan: data.content?.[0]?.text ?? "" });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});
