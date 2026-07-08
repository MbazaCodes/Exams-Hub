// ── ExamHub Tanzania — Helpers ────────────────────────────────

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

export const fmtNumber = (n: number): string => n.toLocaleString("en-TZ");

export const fmtDate = (d: string | Date): string =>
  new Date(d).toLocaleDateString("en-TZ", { day: "numeric", month: "short", year: "numeric" });

export const fmtRelative = (d: string | Date): string => {
  const diff = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return "Just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return fmtDate(d);
};

export const calcXPLevel = (xp: number): { level: number; current: number; max: number; pct: number } => {
  const thresholds = [0,500,1200,2200,3500,5000,7000,9500,12500,16000,20000];
  let level = 0;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i]) level = i + 1;
  }
  level = Math.min(level, thresholds.length - 1);
  const current = xp - thresholds[level - 1];
  const max     = thresholds[level] - thresholds[level - 1];
  return { level, current, max, pct: Math.round((current / max) * 100) };
};

export const sanitize = (str: string): string =>
  str.replace(/[<>&"']/g, (c) => ({ "<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&#39;" }[c] ?? c));
