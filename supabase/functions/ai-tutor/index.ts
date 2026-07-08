// ── Edge Function: ai-tutor ────────────────────────────────────
// POST /functions/v1/ai-tutor
// Anthropic API key stays server-side — never exposed to browser
import { corsHeaders, respond, error } from "../_shared/supabase.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!ANTHROPIC_KEY) return error("AI Tutor not configured", 503);

  try {
    const {
      question, correctAnswer, studentAnswer,
      subject, topic, level, examType,
    } = await req.json();

    if (!question) return error("question is required");

    const isCorrect = studentAnswer !== null && studentAnswer !== undefined &&
      String(studentAnswer) === String(correctAnswer);

    const prompt = `You are an expert ${subject} teacher in Tanzania helping a ${level} student prepare for ${examType || "NECTA"} exams.

Question: ${question}
Topic: ${topic}
Correct Answer: ${correctAnswer}
Student's Answer: ${studentAnswer ?? "Did not answer"}
Student got it: ${isCorrect ? "CORRECT ✓" : "WRONG ✗"}

Provide a concise, encouraging explanation with exactly these sections:
1. **Why the correct answer is right** (2-3 sentences, simple language)
2. **Common mistake** (1-2 sentences on why students pick the wrong answer)
3. **Memory tip** (1 sentence — a simple trick to remember this)
4. **Related topics** (comma-separated list of 2-3 related topics to revise)

Keep it under 200 words. Use simple English appropriate for a Tanzanian secondary school student.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "x-api-key":     ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 600,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return error(`Anthropic error: ${err.error?.message ?? res.statusText}`, 502);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";

    // Parse sections
    const explanation    = text.match(/1\.\s*\*\*[^*]*\*\*\s*([\s\S]*?)(?=2\.|$)/)?.[1]?.trim() ?? text;
    const commonMistakes = text.match(/2\.\s*\*\*[^*]*\*\*\s*([\s\S]*?)(?=3\.|$)/)?.[1]?.trim() ?? "";
    const memoryTip      = text.match(/3\.\s*\*\*[^*]*\*\*\s*([\s\S]*?)(?=4\.|$)/)?.[1]?.trim() ?? "";
    const relatedRaw     = text.match(/4\.\s*\*\*[^*]*\*\*\s*([\s\S]*?)$/)?.[1]?.trim() ?? "";
    const relatedTopics  = relatedRaw.split(/,\s*/).filter(Boolean);

    return respond({ explanation, commonMistakes, memoryTip, relatedTopics });
  } catch (e) {
    return error(e.message, 500);
  }
});
