// ── TSID Login Component ───────────────────────────────────────
import { useState } from "react";
import { loginWithTSID } from "@/lib/tsid";

const C = {
  navy:"#0A1628", navyMid:"#0F1F3D", navyCard:"#111E35",
  indigo:"#4F46E5", indigoL:"#6366F1", gold:"#F59E0B",
  white:"#F0F4FF", muted:"#94A3B8", border:"rgba(99,102,241,0.18)",
  error:"#EF4444", green:"#10B981",
};

const ROLE_ROUTES: Record<string, string> = {
  student:      "/dashboard",
  teacher:      "/teacher",
  school_admin: "/school",
  super_admin:  "/superadmin",
  parent:       "/dashboard",
};

interface TSIDLoginProps {
  onBack:    () => void;
  onSuccess: () => void;
}

export function TSIDLogin({ onBack, onSuccess }: TSIDLoginProps) {
  const [tsid,     setTsid]     = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPw,   setShowPw]   = useState(false);

  // Auto-format as user types: TSID00000001
  const handleTsid = (val: string) => {
    const clean = val.toUpperCase().replace(/[^TSID0-9]/g, "");
    if (!clean.startsWith("TSID") && clean.length > 0) {
      setTsid("TSID" + clean.replace(/TSID/g, ""));
    } else {
      setTsid(clean);
    }
  };

  const handleLogin = async () => {
    const t = tsid.trim();
    if (!t || !password) { setError("Enter your TSID number and password."); return; }
    if (!/^TSID\d{8}$/i.test(t)) { setError("TSID format should be TSID00000001 (TSID + 8 digits)"); return; }
    setLoading(true); setError("");

    const { error: loginErr } = await loginWithTSID(t, password);
    if (loginErr) { setError(loginErr); setLoading(false); return; }

    // Get role from Supabase session
    const { supabase } = await import("@/lib/supabase");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      window.location.href = ROLE_ROUTES[profile?.role ?? "student"];
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "rgba(15,31,61,0.9)", border: `1px solid ${C.border}`,
    color: C.white, fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div>
      {/* TSID badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 10, marginBottom: 20,
        background: `${C.gold}12`, border: `1px solid ${C.gold}33`,
      }}>
        <span style={{ fontSize: 22 }}>🪪</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.gold }}>Login with TSID</div>
          <div style={{ fontSize: 11, color: C.muted }}>Use your Tanzania Student ID number</div>
        </div>
      </div>

      {error && (
        <div style={{
          background: `${C.error}18`, border: `1px solid ${C.error}44`,
          borderRadius: 9, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: C.error,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* TSID input */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, color: C.muted, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
          TSID Number <span style={{ color: C.gold }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 16, pointerEvents: "none" }}>🪪</span>
          <input
            value={tsid}
            onChange={e => handleTsid(e.target.value)}
            placeholder="TSID00000001"
            maxLength={12}
            style={{
              ...inp, paddingLeft: 42,
              fontFamily: "'Courier New', monospace",
              fontWeight: 700, fontSize: 16, letterSpacing: 2,
            }}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e  => e.target.style.borderColor = C.border}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
          Format: TSID followed by 8 digits (e.g. TSID00010234)
        </p>
      </div>

      {/* Password input */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 11, color: C.muted, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
          Password <span style={{ color: C.gold }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inp}
            onFocus={e => e.target.style.borderColor = C.indigo}
            onBlur={e  => e.target.style.borderColor = C.border}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          <button onClick={() => setShowPw(s => !s)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16,
          }}>{showPw ? "🙈" : "👁"}</button>
        </div>
      </div>

      <button onClick={handleLogin} disabled={loading} style={{
        width: "100%", padding: "13px 0", borderRadius: 10,
        background: loading ? `${C.gold}80` : `linear-gradient(135deg,${C.gold},#FCD34D)`,
        border: "none", color: C.navy, fontWeight: 700, fontSize: 15,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {loading && (
          <span style={{ width: 16, height: 16, border: `2.5px solid ${C.navy}44`,
            borderTopColor: C.navy, borderRadius: "50%", animation: "spin .7s linear infinite",
            display: "inline-block" }}/>
        )}
        {loading ? "Logging in…" : "🪪 Login with TSID"}
      </button>

      <button onClick={onBack} style={{
        width: "100%", marginTop: 10, padding: "11px 0", borderRadius: 10,
        background: "transparent", border: `1px solid ${C.border}`,
        color: C.muted, fontWeight: 500, fontSize: 13, cursor: "pointer",
      }}>
        ← Use email / phone instead
      </button>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
