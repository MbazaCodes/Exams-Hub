// ── Edge Function: ai-tutor ────────────────────────────────────
// Anthropic key lives here in Supabase Vault — NEVER in the browser
// Deploy key: supabase secrets set ANTHROPIC_KEY=sk-ant-xxx

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
  if (!ANTHROPIC_KEY) return err("AI Tutor not configured — set ANTHROPIC_KEY secret", 503);

  try {
    const {
      question, correctAnswer, studentAnswer,
      subject, topic, level, examType,
    } = await req.json();

    if (!question || !subject || !level) return err("question, subject and level are required");

    const isCorrect = studentAnswer !== null && studentAnswer !== undefined &&
      String(studentAnswer) === String(correctAnswer);

    const prompt = `You are an expert ${subject} teacher in Tanzania helping a ${level} student prepare for ${examType ?? "NECTA"} exams.

Question: ${question}
Topic: ${topic ?? "General"}
Correct Answer: ${correctAnswer}
Student's Answer: ${studentAnswer ?? "Did not answer"}
Student got it: ${isCorrect ? "CORRECT ✓" : "WRONG ✗"}

Reply with exactly these four sections (use these exact headings):

**Why the correct answer is right**
(2-3 sentences in simple English for a Tanzanian secondary school student)

**Common mistake**
(1-2 sentences on why students pick the wrong option)

**Memory tip**
(1 sentence — a simple trick or acronym to remember this)

**Related topics to revise**
(comma-separated list of 2-3 related topics)

Keep the total under 200 words. Be encouraging and clear.`;

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

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return err(`Anthropic error: ${(body as Record<string,unknown>)?.["error"] ?? res.statusText}`, 502);
    }

    const data = await res.json() as { content: Array<{ text: string }> };
    const text = data.content?.[0]?.text ?? "";

    // Parse sections by heading
    const section = (heading: string) => {
      const re = new RegExp(`\\*\\*${heading}\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`, "i");
      return text.match(re)?.[1]?.trim() ?? "";
    };

    const explanation    = section("Why the correct answer is right");
    const commonMistakes = section("Common mistake");
    const memoryTip      = section("Memory tip");
    const relatedRaw     = section("Related topics to revise");
    const relatedTopics  = relatedRaw.split(/[,\n]/).map(s => s.trim()).filter(Boolean);

    return ok({ explanation, commonMistakes, memoryTip, relatedTopics });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : "Unexpected error", 500);
  }
});
