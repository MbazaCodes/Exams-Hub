// ExamHub Tanzania — Edge Function: ai-tutor
// Calls Anthropic server-side. Key stored in Supabase Vault.
// Deploy: supabase secrets set ANTHROPIC_KEY=sk-ant-xxx



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
    return fail("AI Tutor not configured. Run: supabase secrets set ANTHROPIC_KEY=sk-ant-xxx", 503);
  }

  try {
    const body = await req.json();
    const { question, correctAnswer, studentAnswer, subject, topic, level, examType } = body;

    if (!question) return fail("question is required");
    if (!subject)  return fail("subject is required");
    if (!level)    return fail("level is required");

    const isCorrect =
      studentAnswer !== null &&
      studentAnswer !== undefined &&
      String(studentAnswer) === String(correctAnswer);

    const prompt = [
      `You are an expert ${subject} teacher in Tanzania helping a ${level} student prepare for ${examType ?? "NECTA"} exams.`,
      "",
      `Question: ${question}`,
      `Topic: ${topic ?? "General"}`,
      `Correct Answer: ${correctAnswer}`,
      `Student Answer: ${studentAnswer ?? "Did not answer"}`,
      `Result: ${isCorrect ? "CORRECT ✓" : "WRONG ✗"}`,
      "",
      "Write exactly four sections with these headings:",
      "",
      "**Why the correct answer is right**",
      "(2-3 sentences, simple English for a Tanzanian secondary school student)",
      "",
      "**Common mistake**",
      "(1-2 sentences on why students get this wrong)",
      "",
      "**Memory tip**",
      "(1 sentence — a simple trick to remember this)",
      "",
      "**Related topics to revise**",
      "(comma-separated list of 2-3 topics)",
      "",
      "Keep total under 200 words. Be encouraging.",
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
        max_tokens: 600,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return fail(`Anthropic API error ${res.status}: ${errBody}`, 502);
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const text = data.content?.find((b) => b.type === "text")?.text ?? "";

    const section = (heading: string): string => {
      const re = new RegExp(
        `\\*\\*${heading}\\*\\*[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`,
        "i",
      );
      return text.match(re)?.[1]?.trim() ?? "";
    };

    return ok({
      explanation:    section("Why the correct answer is right"),
      commonMistakes: section("Common mistake"),
      memoryTip:      section("Memory tip"),
      relatedTopics:  section("Related topics to revise")
        .split(/[,\n]/)
        .map((s: string) => s.trim())
        .filter(Boolean),
      raw: text,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return fail(`Server error: ${msg}`, 500);
  }
});
