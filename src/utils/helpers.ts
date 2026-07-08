export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const getGrade = (pct: number): string => {
  if (pct >= 75) return "A";
  if (pct >= 65) return "B";
  if (pct >= 50) return "C";
  if (pct >= 30) return "D";
  return "F";
};

export const getDivision = (pct: number): string => {
  if (pct >= 75) return "Division I";
  if (pct >= 65) return "Division II";
  if (pct >= 50) return "Division III";
  if (pct >= 30) return "Division IV";
  return "Division Zero";
};

export const getScoreColor = (score: number): string => {
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
};

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const truncate = (str: string, max: number): string =>
  str.length > max ? str.slice(0, max - 3) + "..." : str;
