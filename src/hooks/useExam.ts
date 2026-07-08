// ── useExam hook — auto-save + resume ─────────────────────────
import { useEffect, useRef, useCallback } from "react";

const SAVE_KEY = (examId: string) => `examhub_exam_${examId}`;

export interface ExamState {
  answers:    Record<string, unknown>;
  flagged:    number[];
  currentQ:   number;
  timeLeft:   number;
  startedAt:  number;
}

export function useExamAutoSave(examId: string) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((state: ExamState) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(SAVE_KEY(examId), JSON.stringify({ ...state, savedAt: Date.now() }));
      } catch { /* storage full */ }
    }, 500);
  }, [examId]);

  const load = useCallback((): ExamState | null => {
    try {
      const raw = localStorage.getItem(SAVE_KEY(examId));
      if (!raw) return null;
      const saved = JSON.parse(raw);
      // Expire saves older than 4 hours
      if (Date.now() - saved.savedAt > 4 * 60 * 60 * 1000) {
        localStorage.removeItem(SAVE_KEY(examId));
        return null;
      }
      return saved;
    } catch { return null; }
  }, [examId]);

  const clear = useCallback(() => {
    localStorage.removeItem(SAVE_KEY(examId));
  }, [examId]);

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); }, []);

  return { save, load, clear };
}

// Tab-switch detection for anti-cheat
export function useTabSwitchDetection(onSwitch: (count: number) => void) {
  const countRef = useRef(0);

  useEffect(() => {
    const handle = () => {
      if (document.hidden) {
        countRef.current += 1;
        onSwitch(countRef.current);
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [onSwitch]);

  return countRef;
}
