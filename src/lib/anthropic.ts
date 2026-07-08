export interface AIExplainRequest {
  question: string;
  correctAnswer: string;
  studentAnswer: string | number | boolean | null;
  subject: string;
  topic: string;
  level: string;
}

export async function explainQuestion(req: AIExplainRequest): Promise<{ explanation: string; error?: string }> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) return { explanation: "", error: "Add VITE_ANTHROPIC_KEY to your .env file." };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `You are an expert ${req.subject} teacher in Tanzania for ${req.level} students.\nQuestion: ${req.question}\nCorrect explanation: ${req.correctAnswer}\nStudent answer: ${JSON.stringify(req.studentAnswer)}\nTopic: ${req.topic}\n\nGive a clear, encouraging explanation with: 1) Why correct answer is right 2) Common mistakes 3) A memory tip. Keep it concise and appropriate for a ${req.level} student.`,
        }],
      }),
    });
    const data = await res.json();
    if (!res.ok) return { explanation: "", error: `API error: ${data.error?.message}` };
    return { explanation: data.content?.[0]?.text || "No explanation returned." };
  } catch {
    return { explanation: "", error: "Network error. Check your connection." };
  }
}
