import { createClient } from "@supabase/supabase-js";

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
}
