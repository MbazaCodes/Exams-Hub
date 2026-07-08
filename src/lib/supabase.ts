<<<<<<< HEAD
﻿import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl  || "https://placeholder.supabase.co",
  supabaseKey  || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type Database = {
  public: {
    Tables: {
      students:  { Row: StudentRow };
      exams:     { Row: ExamRow };
      papers:    { Row: PaperRow };
      answers:   { Row: AnswerRow };
      results:   { Row: ResultRow };
      schools:   { Row: SchoolRow };
    };
  };
};

export interface StudentRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  gender: "male" | "female";
  dob: string;
  school_name: string;
  region: string;
  district: string | null;
  school_type: "government" | "private";
  level: "Standard 4" | "Standard 7" | "Form 2" | "Form 4" | "Form 6";
  combination: string | null;
  xp: number;
  coins: number;
  streak: number;
  level_num: number;
  created_at: string;
  updated_at: string;
}

export interface ExamRow {
  id: string;
  subject: string;
  level: string;
  year: number;
  paper: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number;
  total_questions: number;
  total_marks: number;
  created_at: string;
}

export interface PaperRow {
  id: string;
  exam_id: string;
  question_number: number;
  type: "mcq" | "truefalse" | "short" | "essay";
  text: string;
  options: string[] | null;
  correct_answer: string | number | boolean;
  marks: number;
  topic: string;
  explanation: string;
}

export interface AnswerRow {
  id: string;
  student_id: string;
  exam_id: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export interface ResultRow {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  percentage: number;
  grade: string;
  division: string;
  time_taken: number;
  completed_at: string;
}

export interface SchoolRow {
  id: string;
  name: string;
  region: string;
  district: string | null;
  type: "government" | "private";
  plan: "free" | "premium";
  status: "active" | "pending" | "blocked";
  created_at: string;
=======
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
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
}
