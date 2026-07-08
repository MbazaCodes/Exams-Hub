// Anthropic AI helper  used by Phase 5 AI Tutor
// The API key is handled server-side via Supabase Edge Functions in production.
// In dev/demo mode it calls the API directly from the browser.

export interface AIExplainRequest {
  question: string;
  correctAnswer: string;
  studentAnswer: string | number | boolean | null;
  subject: string;
  topic: string;
  level: string;
}

export interface AIExplainResponse {
  explanation: string;
  error?: string;
}

export async function explainQuestion(
  req: AIExplainRequest
): Promise<AIExplainResponse> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;

  if (!apiKey) {
    return {
      explanation: "",
      error: "No API key found. Add VITE_ANTHROPIC_KEY to your .env file.",
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `You are an expert ${req.subject} teacher in Tanzania teaching ${req.level} students.
A student got a question ${req.studentAnswer === req.correctAnswer ? "correct" : "wrong"}.

Question: ${req.question}
Correct explanation: ${req.correctAnswer}
Student answer: ${JSON.stringify(req.studentAnswer)}
Topic: ${req.topic}

Provide a clear, encouraging explanation in simple English. Include:
1. Why the correct answer is right
2. Common mistakes students make on this topic  
3. One memory tip to remember this concept

Be concise, use bullet points where helpful, and keep it appropriate for a ${req.level} student.`,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { explanation: "", error: `API error: ${data.error?.message || res.statusText}` };
    }

    return { explanation: data.content?.[0]?.text || "No explanation returned." };
  } catch (err) {
    return { explanation: "", error: "Network error. Please check your connection." };
  }
}
