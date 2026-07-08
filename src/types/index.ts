// ── ExamHub Tanzania — TypeScript Types ──────────────────────

export type Level       = "standard_4" | "standard_7" | "form_2" | "form_4" | "form_6";
export type Gender      = "male" | "female" | "other";
export type SchoolType  = "government" | "private";
export type SchoolPlan  = "free" | "premium" | "enterprise";
export type ExamType    = "necta" | "mock" | "pre_national" | "regional" | "district" | "school" | "online_global";
export type Difficulty  = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "truefalse" | "short" | "essay" | "fill_blank";
export type Grade       = "A" | "B" | "C" | "D" | "F";
export type Division    = "Division I" | "Division II" | "Division III" | "Division IV" | "Division Zero";
export type UserRole    = "student" | "teacher" | "school_admin" | "super_admin" | "parent";
export type OnlineExamStatus = "scheduled" | "lobby" | "live" | "marking" | "ended";
export type ParticipantStatus = "registered" | "joined" | "in_progress" | "submitted" | "disconnected";

export interface Profile {
  id:           string;
  role:         UserRole;
  full_name:    string;
  phone:        string | null;
  avatar_url:   string | null;
  gender:       Gender | null;
  date_of_birth: string | null;
  region:       string | null;
  school_id:    string | null;
  is_active:    boolean;
  created_at:   string;
}

export interface Student {
  id:             string;
  level:          Level;
  combination:    string | null;
  class_name:     string | null;
  xp:             number;
  coins:          number;
  level_num:      number;
  streak:         number;
  longest_streak: number;
  total_exams:    number;
  avg_score:      number | null;
  best_score:     number | null;
}

export interface School {
  id:          string;
  name:        string;
  short_name:  string | null;
  reg_number:  string | null;
  region:      string;
  district:    string | null;
  type:        SchoolType;
  plan:        SchoolPlan;
  status:      string;
  logo_url:    string | null;
}

export interface Question {
  id:           string;
  exam_id:      string;
  topic_name:   string | null;
  question_num: number;
  type:         QuestionType;
  text:         string;
  options:      string[] | null;
  correct_answer: number | boolean | string;
  marks:        number;
  explanation:  string | null;
  difficulty:   Difficulty;
  image_url:    string | null;
}

export interface ExamMeta {
  id:               string;
  title:            string;
  subject_name:     string;
  level:            Level;
  year:             number;
  paper_number:     number;
  type:             ExamType;
  difficulty:       Difficulty;
  duration_mins:    number;
  total_marks:      number;
  total_questions:  number;
  has_ai_tutor:     boolean;
  pdf_url:          string | null;
  attempts:         number;
  avg_score:        number | null;
}

export interface ExamSession {
  id:             string;
  student_id:     string;
  exam_id:        string;
  answers:        Record<string, unknown>;
  score:          number | null;
  percentage:     number | null;
  grade:          Grade | null;
  division:       Division | null;
  time_taken_secs: number | null;
  status:         string;
  submitted_at:   string | null;
}

export interface OnlineExam {
  id:               string;
  title:            string;
  subject_name:     string;
  level:            Level;
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
  type:     QuestionType;
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
  grade:            Grade | null;
  rank:             number | null;
  time_taken_secs:  number | null;
  joined_at:        string;
  submitted_at:     string | null;
}

export interface Badge {
  id:          string;
  code:        string;
  name:        string;
  description: string;
  icon:        string;
  color:       string;
  xp_reward:   number;
}

export interface Notification {
  id:         string;
  user_id:    string;
  type:       string;
  title:      string;
  body:       string;
  data:       Record<string, unknown>;
  is_read:    boolean;
  created_at: string;
}
