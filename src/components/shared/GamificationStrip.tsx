interface GamificationStripProps {
  streak: number;
  xp: number;
  coins: number;
  level: number;
}

export function GamificationStrip({ streak, xp, coins, level }: GamificationStripProps) {
  const pills = [
    { icon: "", label: "Streak",    value: `${streak} days`, color: "var(--gold)"   },
    { icon: "", label: "XP Points", value: xp.toLocaleString(), color: "var(--indigo)" },
    { icon: "", label: "Coins",     value: coins, color: "var(--teal)"   },
    { icon: "", label: "Level",     value: `Level ${level}`, color: "var(--purple)" },
  ];
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {pills.map((p) => (
        <div key={p.label} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px", borderRadius: 10,
          background: p.color + "15",
          border: `1px solid ${p.color}30`,
        }}>
          <span style={{ fontSize: 18 }}>{p.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1 }}>{p.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
