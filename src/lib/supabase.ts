import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase env vars missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 20 },
  },
});

// ── Realtime helpers ───────────────────────────────────────────────────────

/** Subscribe to live changes on a table */
export function subscribeToTable(
  table: string,
  filter: string | null,
  callback: (payload: Record<string, unknown>) => void
) {
  const channel = supabase
    .channel(`table-${table}-${Date.now()}`)
    .on(
      "postgres_changes" as any,
      { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
      callback
    )
    .subscribe();
  return channel;
}

/** Subscribe to a specific online exam session */
export function subscribeToExamSession(
  examSessionId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`exam-session-${examSessionId}`)
    .on("postgres_changes" as any, {
      event: "*", schema: "public",
      table: "online_exam_participants",
      filter: `exam_session_id=eq.${examSessionId}`,
    }, callback)
    .subscribe();
}

/** Subscribe to live leaderboard updates */
export function subscribeToLeaderboard(
  examSessionId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`leaderboard-${examSessionId}`)
    .on("postgres_changes" as any, {
      event: "UPDATE", schema: "public",
      table: "online_exam_participants",
      filter: `exam_session_id=eq.${examSessionId}`,
    }, callback)
    .subscribe();
}

// ── Type definitions ────────────────────────────────────────────────────────
export type OnlineExamStatus = "scheduled" | "live" | "ended";
export type ParticipantStatus = "joined" | "in_progress" | "submitted" | "disconnected";

export interface OnlineExam {
  id: string;
  title: string;
  subject: string;
  level: string;
  duration_minutes: number;
  max_participants: number | null;
  join_code: string;
  status: OnlineExamStatus;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  created_by: string;
  questions: OnlineQuestion[];
  created_at: string;
}

export interface OnlineQuestion {
  id: number;
  type: "mcq" | "truefalse" | "short";
  text: string;
  options?: string[];
  correct: number | boolean | string;
  marks: number;
  topic: string;
}

export interface OnlineParticipant {
  id: string;
  exam_session_id: string;
  student_id: string;
  student_name: string;
  school: string;
  region: string;
  status: ParticipantStatus;
  score: number | null;
  percentage: number | null;
  rank: number | null;
  answers: Record<string, unknown>;
  joined_at: string;
  submitted_at: string | null;
  time_taken: number | null;
}
