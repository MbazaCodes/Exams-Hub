import { Avatar } from "@/components/ui";

interface TopBarProps {
  title: string;
  subtitle?: string;
  student?: { name: string; streak: number; level: string };
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, student, actions }: TopBarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{
      padding: "14px 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--navy)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
      gap: 16,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: "var(--white)", lineHeight: 1.2 }}>
          {student ? `${greeting}, ${student.name.split(" ")[0]} ` : title}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
          {subtitle || (student ? `${student.level}` : "")}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {actions}
        {student && (
          <>
            <div style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              fontSize: 13, fontWeight: 600, color: "var(--gold)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
               {student.streak} days
            </div>
            <Avatar name={student.name} size="sm" />
          </>
        )}
      </div>
    </div>
  );
}
