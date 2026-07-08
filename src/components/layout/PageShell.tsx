import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface PageShellProps {
  children: ReactNode;
  activePath?: string;
  title: string;
  subtitle?: string;
  topBarActions?: ReactNode;
  student?: { name: string; level: string; xp: number; level_num: number; streak: number };
}

export function PageShell({
  children,
  activePath,
  title,
  subtitle,
  topBarActions,
  student,
}: PageShellProps) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--navy)",
      color: "var(--white)",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Sidebar activePath={activePath} student={student} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          title={title}
          subtitle={subtitle}
          student={student}
          actions={topBarActions}
        />
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
