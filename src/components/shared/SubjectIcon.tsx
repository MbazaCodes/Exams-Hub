const META: Record<string, { icon: string; color: string }> = {
  Mathematics:       { icon: "", color: "#4F46E5" },
  English:           { icon: "", color: "#14B8A6" },
  Kiswahili:         { icon: "",  color: "#10B981" },
  Science:           { icon: "", color: "#8B5CF6" },
  "Social Studies":  { icon: "", color: "#F59E0B" },
  "Vocational Skills":{ icon: "", color: "#EC4899" },
  Biology:           { icon: "", color: "#10B981" },
  Chemistry:         { icon: "",  color: "#EF4444" },
  Physics:           { icon: "", color: "#F59E0B" },
  Geography:         { icon: "",  color: "#14B8A6" },
  History:           { icon: "", color: "#8B5CF6" },
  Civics:            { icon: "",  color: "#EC4899" },
  "Book Keeping":    { icon: "", color: "#6366F1" },
  Commerce:          { icon: "", color: "#F59E0B" },
  Agriculture:       { icon: "", color: "#10B981" },
  ICT:               { icon: "", color: "#4F46E5" },
  Language:          { icon: "", color: "#14B8A6" },
  "General Studies": { icon: "", color: "#8B5CF6" },
};

export function getSubjectMeta(subject: string) {
  return META[subject] || { icon: "", color: "#4F46E5" };
}

interface SubjectIconProps {
  subject: string;
  size?: number;
  borderRadius?: number;
}

export function SubjectIcon({ subject, size = 44, borderRadius = 12 }: SubjectIconProps) {
  const meta = getSubjectMeta(subject);
  return (
    <div style={{
      width: size, height: size,
      borderRadius,
      background: meta.color + "20",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
    }}>
      {meta.icon}
    </div>
  );
}
