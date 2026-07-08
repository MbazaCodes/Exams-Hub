<<<<<<< HEAD
﻿// Anthropic AI helper  used by Phase 5 AI Tutor
// The API key is handled server-side via Supabase Edge Functions in production.
// In dev/demo mode it calls the API directly from the browser.

=======
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
export interface AIExplainRequest {
  question: string;
  correctAnswer: string;
  studentAnswer: string | number | boolean | null;
  subject: string;
  topic: string;
  level: string;
}

<<<<<<< HEAD
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

=======
export async function explainQuestion(req: AIExplainRequest): Promise<{ explanation: string; error?: string }> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) return { explanation: "", error: "Add VITE_ANTHROPIC_KEY to your .env file." };
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
<<<<<<< HEAD
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
=======
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
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
  }
}
