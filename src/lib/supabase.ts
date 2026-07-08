import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase env vars. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:       true,
    autoRefreshToken:     true,
    detectSessionInUrl:   true,
    storageKey:           "examhub-auth",
  },
  realtime: {
    params: { eventsPerSecond: 20 },
  },
  global: {
    headers: { "x-app-name": "examhub-tanzania" },
  },
});

// ── Auth helpers ───────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function getStudentProfile(userId: string) {
  const { data } = await supabase
    .from("students")
    .select(`
      *,
      profiles!inner(full_name, phone, avatar_url, region, school_id,
        schools(name, short_name, region))
    `)
    .eq("id", userId)
    .single();
  return data;
}

// ── Realtime helpers ───────────────────────────────────────────
export function subscribeToExamSession(
  examSessionId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`exam-session-${examSessionId}`)
    .on("postgres_changes" as any, {
      event: "*", schema: "public",
      table:  "online_exam_participants",
      filter: `exam_session_id=eq.${examSessionId}`,
    }, callback)
    .subscribe();
}

export function subscribeToLeaderboard(
  examSessionId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`leaderboard-${examSessionId}`)
    .on("postgres_changes" as any, {
      event: "UPDATE", schema: "public",
      table:  "online_exam_participants",
      filter: `exam_session_id=eq.${examSessionId}`,
    }, callback)
    .subscribe();
}

export function subscribeToNotifications(
  userId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`notifications-${userId}`)
    .on("postgres_changes" as any, {
      event: "INSERT", schema: "public",
      table:  "notifications",
      filter: `user_id=eq.${userId}`,
    }, callback)
    .subscribe();
}

// ── Types ──────────────────────────────────────────────────────
export type OnlineExamStatus   = "scheduled" | "lobby" | "live" | "marking" | "ended";
export type ParticipantStatus  = "registered" | "joined" | "in_progress" | "submitted" | "disconnected";

export interface OnlineExam {
  id:               string;
  title:            string;
  subject_name:     string;
  level:            string;
  join_code:        string;
  duration_minutes: number;
  max_participants: number | null;
  status:           OnlineExamStatus;
  scheduled_at:     string;
  started_at:       string | null;
  questions:        OnlineQuestion[];
  settings:         Record<string, unknown>;
}

export interface OnlineQuestion {
  id:       number;
  type:     "mcq" | "truefalse" | "short";
  text:     string;
  options?: string[];
  correct:  number | boolean | string;
  marks:    number;
  topic:    string;
}

export interface OnlineParticipant {
  id:               string;
  exam_session_id:  string;
  student_id:       string | null;
  guest_name:       string | null;
  guest_school:     string | null;
  guest_region:     string | null;
  status:           ParticipantStatus;
  score:            number | null;
  percentage:       number | null;
  rank:             number | null;
  time_taken_secs:  number | null;
  joined_at:        string;
  submitted_at:     string | null;
}
