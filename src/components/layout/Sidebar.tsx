import { useState } from "react";
import { XPBar } from "@/components/ui";

const NAV_ITEMS = [
  { icon: "", label: "Dashboard",   path: "/dashboard" },
  { icon: "", label: "Past Papers", path: "/papers" },
  { icon: "", label: "Analytics",   path: "/analytics" },
  { icon: "", label: "Leaderboard", path: "/activities" },
  { icon: "", label: "AI Tutor",    path: "/activities" },
  { icon: "", label: "Activities",  path: "/activities" },
  { icon: "", label: "Notifications", path: "/" },
  { icon: "", label: "Settings",   path: "/" },
];

interface SidebarProps {
  activePath?: string;
  student?: {
    name: string;
    level: string;
    xp: number;
    level_num: number;
    streak: number;
  };
}

export function Sidebar({ activePath = "/dashboard", student }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 18px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--indigo), var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: "#fff", flexShrink: 0,
          }}>E</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--white)" }}>ExamHub</div>
            <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>Tanzania</div>
          </div>
        </div>
      </div>

      {/* Student mini-profile */}
      {student && (
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--indigo), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0,
            }}>
              {student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {student.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{student.level}</div>
            </div>
          </div>
          <XPBar current={student.xp} max={5000} level={student.level_num} />
        </div>
      )}

      {/* Navigation */}
      <nav style={{ padding: "10px 10px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = activePath === item.path;
          return (
            <a
              key={item.label}
              href={item.path}
              className={`sidebar-nav-item ${active ? "active" : ""}`}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13 }}>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Streak pill */}
      {student && (
        <div style={{ padding: "10px 18px 20px" }}>
          <div style={{
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }} className="animate-streak">
            <span className="streak-fire" style={{ fontSize: 20 }}></span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>
                {student.streak} Day Streak
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Keep it up!</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
