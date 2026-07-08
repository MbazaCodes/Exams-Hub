// ExamHub Tanzania  Shared TypeScript types

export type Level = "Standard 4" | "Standard 7" | "Form 2" | "Form 4" | "Form 6";
export type Gender = "male" | "female";
export type SchoolType = "government" | "private";
export type ExamType = "NECTA" | "Mock Exam" | "Pre-National" | "Regional" | "District" | "School Exam";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "mcq" | "truefalse" | "short" | "essay";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type Division = "Division I" | "Division II" | "Division III" | "Division IV" | "Division Zero";

export interface Question {
  id: number;
  type: QuestionType;
  marks: number;
  text: string;
  options?: string[];
  correct: number | boolean | string;
  topic: string;
  explanation: string;
  placeholder?: string;
}

export interface ExamMeta {
  id: string;
  subject: string;
  level: Level;
  year: number;
  type: ExamType;
  paper: string;
  difficulty: Difficulty;
  duration: number;        // minutes
  questions: number;
  attempts: number;
  avgScore: number;
  hasMarkingGuide: boolean;
  hasAI: boolean;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  percentage: number;
  grade: Grade;
  division: Division;
  correct: number;
  wrong: number;
  skipped: number;
  timeTaken: number;      // seconds
  completedAt: string;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface NavItem {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
}
