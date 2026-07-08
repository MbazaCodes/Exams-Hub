// ── AI Tutor ─────────────────────────────────────────────────────────────────
// All Anthropic API calls go through our Supabase Edge Function.
// The VITE_ANTHROPIC_KEY is NEVER used on the client side.
// Browser → supabase.functions.invoke("ai-tutor") → Anthropic API

import { supabase } from "./supabase";

export interface AIExplainRequest {
  question:      string;
  correctAnswer: string | number | boolean;
  studentAnswer: string | number | boolean | null;
  subject:       string;
  topic:         string;
  level:         string;
  examType?:     string;
}

export interface AIExplainResponse {
  explanation: string;
  commonMistakes?: string;
  memoryTip?: string;
  relatedTopics?: string[];
  difficulty?: string;
  error?: string;
}

/**
 * Call the AI Tutor via Supabase Edge Function.
 * The Edge Function holds the Anthropic key server-side.
 */
export async function explainQuestion(req: AIExplainRequest): Promise<AIExplainResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-tutor", {
      body: req,
    });

    if (error) return { explanation: "", error: error.message };
    return data as AIExplainResponse;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { explanation: "", error: msg };
  }
}

/**
 * Generate a personalized revision plan for a student.
 */
export async function generateRevisionPlan(params: {
  studentId: string;
  weakTopics: string[];
  level: string;
  daysUntilExam: number;
}): Promise<{ plan: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-revision-plan", {
      body: params,
    });
    if (error) return { plan: "", error: error.message };
    return data as { plan: string };
  } catch (e: unknown) {
    return { plan: "", error: "Could not generate plan" };
  }
}
