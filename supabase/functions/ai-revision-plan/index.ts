// ExamHub Tanzania — Edge Function: ai-revision-plan
// Generates personalised NECTA revision schedule using Claude.

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function fail(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY") ?? "";
  if (!ANTHROPIC_KEY) {
    return fail("AI not configured. Run: supabase secrets set ANTHROPIC_KEY=sk-ant-xxx", 503);
  }

  try {
    const body = await req.json();
    const { weakTopics, level, daysUntilExam, subjects } = body;

    if (!level) return fail("level is required");

    const topicList   = Array.isArray(weakTopics) ? weakTopics.join(", ") : "not specified";
    const subjectList = Array.isArray(subjects)   ? subjects.join(", ")   : "all core subjects";
    const days        = Number(daysUntilExam) || 90;

    const prompt = [
      `You are an expert exam coach for Tanzanian ${level} students preparing for NECTA.`,
      "",
      `The student has ${days} days until their exam.`,
      `Subjects: ${subjectList}.`,
      `Weakest topics: ${topicList}.`,
      "",
      "Create a realistic daily revision plan that:",
      "1. Prioritises the weakest topics first",
      "2. Allocates 2-3 study hours per day",
      "3. Rotates subjects to avoid burnout",
      "4. Includes brief weekend reviews",
      "5. Ends the final week with full mock exams",
      "",
      "Format as Week 1, Week 2, etc. Name specific topics for each day.",
      "Keep it under 350 words. End with one motivational sentence.",
    ].join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 700,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return fail(`Anthropic API error ${res.status}: ${errBody}`, 502);
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const plan  = data.content?.find((b) => b.type === "text")?.text ?? "";

    return ok({ plan });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return fail(`Server error: ${msg}`, 500);
  }
});
