<<<<<<< HEAD
﻿// ExamHub Tanzania  Shared TypeScript types

export type Level = "Standard 4" | "Standard 7" | "Form 2" | "Form 4" | "Form 6";
export type Gender = "male" | "female";
export type SchoolType = "government" | "private";
export type ExamType = "NECTA" | "Mock Exam" | "Pre-National" | "Regional" | "District" | "School Exam";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "mcq" | "truefalse" | "short" | "essay";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type Division = "Division I" | "Division II" | "Division III" | "Division IV" | "Division Zero";
=======
export type Level      = "Standard 4" | "Standard 7" | "Form 2" | "Form 4" | "Form 6";
export type Gender     = "male" | "female";
export type SchoolType = "government" | "private";
export type ExamType   = "NECTA" | "Mock Exam" | "Pre-National" | "Regional" | "District" | "School Exam";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "mcq" | "truefalse" | "short" | "essay";
export type Grade      = "A" | "B" | "C" | "D" | "F";
export type Division   = "Division I" | "Division II" | "Division III" | "Division IV" | "Division Zero";
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18

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
<<<<<<< HEAD
  duration: number;        // minutes
=======
  duration: number;
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
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
<<<<<<< HEAD
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
=======
  timeTaken: number;
  completedAt: string;
}
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
