// ExamHub Tanzania  Shared utility functions

/** Format seconds  MM:SS */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** Format seconds  "1h 42m" */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

/** Percentage  Grade */
export const getGrade = (pct: number): string => {
  if (pct >= 75) return "A";
  if (pct >= 65) return "B";
  if (pct >= 50) return "C";
  if (pct >= 30) return "D";
  return "F";
};

/** Percentage  NECTA Division */
export const getDivision = (pct: number): string => {
  if (pct >= 75) return "Division I";
  if (pct >= 65) return "Division II";
  if (pct >= 50) return "Division III";
  if (pct >= 30) return "Division IV";
  return "Division Zero";
};

/** Score color based on percentage */
export const getScoreColor = (score: number): string => {
  if (score >= 75) return "#10B981"; // green
  if (score >= 50) return "#F59E0B"; // gold
  return "#EF4444";                   // red
};

/** Format large numbers  "1,234" */
export const formatNumber = (n: number): string =>
  n.toLocaleString("en-TZ");

/** Clamp a value between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

/** Get hour-based greeting */
export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/** Truncate text with ellipsis */
export const truncate = (str: string, maxLen: number): string =>
  str.length > maxLen ? str.slice(0, maxLen - 3) + "..." : str;
