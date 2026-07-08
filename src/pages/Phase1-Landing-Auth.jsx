import { useState, useEffect, useRef } from "react";

<<<<<<< HEAD
const C = {
  navy:"#0A1628", navyMid:"#0F1F3D", navyCard:"#111E35",
  indigo:"#4F46E5", indigoL:"#6366F1",
  gold:"#F59E0B", goldL:"#FCD34D",
  white:"#F0F4FF", muted:"#94A3B8",
  success:"#10B981", error:"#EF4444",
  border:"rgba(99,102,241,0.18)",
};

const COMBOS  = ["PCM","PCB","CBG","EGM","HGL","HKL","HGK","ECA","CBA","Others"];
const REGIONS = ["Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya","Morogoro","Tanga","Kilimanjaro","Kagera","Mara","Shinyanga","Tabora","Singida","Iringa","Ruvuma","Lindi","Mtwara","Pwani","Rukwa","Kigoma","Katavi","Geita","Simiyu","Njombe","Songwe","Kaskazini Unguja","Kusini Unguja","Mjini Magharibi","Kaskazini Pemba","Kusini Pemba"];
const LEVELS  = ["Standard 4","Standard 7","Form 2","Form 4","Form 6"];

/* ── tiny helpers ───────────────────────────────────────────── */
const Glass = ({ children, style = {} }) => (
  <div style={{
    background:"rgba(30,58,138,0.18)",
    border:`1px solid ${C.border}`,
    borderRadius:14,
    backdropFilter:"blur(12px)",
=======
// ── Design tokens ──────────────────────────────────────────────
const C = {
  navy: "#0A1628",
  navyMid: "#0F1F3D",
  surface: "#1E3A8A22",
  surfaceSolid: "#132040",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  white: "#F0F4FF",
  muted: "#94A3B8",
  success: "#10B981",
  error: "#EF4444",
  border: "#1E3A8A55",
};

const styles = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: C.navy,
    color: C.white,
    minHeight: "100vh",
    overflowX: "hidden",
  },
};

// ── Utility components ─────────────────────────────────────────
const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(30,58,138,0.18)",
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
    ...style,
  }}>{children}</div>
);

<<<<<<< HEAD
const Btn = ({ children, onClick, v = "primary", style = {}, disabled = false }) => {
  const vs = {
    primary:{ background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`, color:"#fff", boxShadow:`0 4px 16px ${C.indigo}55` },
    gold:   { background:`linear-gradient(135deg,${C.gold},${C.goldL})`,     color:C.navy, boxShadow:`0 4px 16px ${C.gold}55` },
    ghost:  { background:"transparent", color:C.white, border:`1px solid ${C.border}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
        padding:"10px 20px", borderRadius:9, fontWeight:600, fontSize:14,
        cursor:disabled ? "not-allowed" : "pointer",
        border:"none", transition:"all 0.2s", opacity:disabled ? 0.6 : 1,
        ...vs[v], ...style,
      }}
    >{children}</button>
  );
};

/* compact field — reduced padding + font */
const Field = ({ label, type = "text", value, onChange, placeholder, required, options, error }) => {
  const fs = {
    width:"100%", padding:"9px 13px", borderRadius:9,
    background:"rgba(15,31,61,0.85)", border:`1px solid ${error ? C.error : C.border}`,
    color:C.white, fontSize:13, outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  };
  return (
    <div style={{ marginBottom:11 }}>
      {label && (
        <label style={{ display:"block", marginBottom:4, fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          {label}{required && <span style={{ color:C.gold }}> *</span>}
        </label>
      )}
      {type === "select" ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...fs, cursor:"pointer",
            appearance:"none",
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:32,
          }}
        >
          <option value="">{placeholder || "Select…"}</option>
=======
const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "12px 24px", borderRadius: 10, fontWeight: 600,
    fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", transition: "all 0.2s", opacity: disabled ? 0.6 : 1,
    ...style,
  };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoLight})`, color: "#fff", boxShadow: `0 4px 20px ${C.indigo}55` },
    gold: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.navy, boxShadow: `0 4px 20px ${C.gold}55` },
    ghost: { background: "transparent", color: C.white, border: `1px solid ${C.border}` },
    danger: { background: C.error, color: "#fff" },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Input = ({ label, type = "text", value, onChange, placeholder, required, options, error }) => {
  const fieldStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "rgba(15,31,61,0.8)", border: `1px solid ${error ? C.error : C.border}`,
    color: C.white, fontSize: 15, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: C.muted, fontWeight: 500 }}>
        {label}{required && <span style={{ color: C.gold }}>*</span>}
      </label>}
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
          <option value="">{placeholder || "Select..."}</option>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
          {options?.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
<<<<<<< HEAD
          placeholder={placeholder} style={fs}
          onFocus={e => e.target.style.borderColor = C.indigo}
          onBlur={e  => e.target.style.borderColor = error ? C.error : C.border}
        />
      )}
      {error && <p style={{ color:C.error, fontSize:11, marginTop:3 }}>{error}</p>}
=======
          placeholder={placeholder} style={fieldStyle}
          onFocus={e => e.target.style.borderColor = C.indigo}
          onBlur={e => e.target.style.borderColor = error ? C.error : C.border}
        />
      )}
      {error && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{error}</p>}
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
    </div>
  );
};

<<<<<<< HEAD
const Counter = ({ target, duration = 1600, suffix = "%" }) => {
  const [v, setV] = useState(0);
  const s = useRef(false);
  useEffect(() => {
    if (s.current) return;
    s.current = true;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);
  return <span>{v}{suffix}</span>;
};

/* ── Navbar ─────────────────────────────────────────────────── */
const Navbar = ({ onLogin, onRegister }) => {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const h = () => setSc(window.scrollY > 30);
=======
// ── Animated counter ────────────────────────────────────────────
const Counter = ({ target, duration = 1800, suffix = "%" }) => {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span>{val}{suffix}</span>;
};

// ── NAVBAR ──────────────────────────────────────────────────────
const Navbar = ({ onLogin, onRegister }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
<<<<<<< HEAD
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 24px", height:60,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: sc ? "rgba(10,22,40,0.95)" : "transparent",
      backdropFilter: sc ? "blur(16px)" : "none",
      borderBottom: sc ? `1px solid ${C.border}` : "none",
      transition:"all 0.3s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:34, height:34, borderRadius:9,
          background:`linear-gradient(135deg,${C.indigo},${C.gold})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:17, fontWeight:900, color:"#fff",
        }}>E</div>
        <span style={{ fontWeight:800, fontSize:17, color:C.white }}>
          ExamHub <span style={{ color:C.gold }}>Tanzania</span>
        </span>
      </div>
      <div style={{ display:"flex", gap:28 }}>
        {["Features","Subjects","Pricing"].map(l => (
          <span key={l} style={{ color:C.muted, fontSize:13, cursor:"pointer" }}>{l}</span>
        ))}
      </div>
      <div style={{ display:"flex", gap:9 }}>
        <Btn v="ghost" onClick={onLogin} style={{ padding:"8px 16px", fontSize:13 }}>Log in</Btn>
        <Btn v="gold"  onClick={onRegister} style={{ padding:"8px 16px", fontSize:13 }}>Start Free</Btn>
=======
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 24px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,22,40,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      transition: "all 0.3s",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${C.indigo}, ${C.gold})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 900, color: "#fff",
        }}>E</div>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
          ExamHub <span style={{ color: C.gold }}>Tanzania</span>
        </span>
      </div>

      {/* Nav links – hidden on mobile */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Features", "Subjects", "Pricing"].map(l => (
          <span key={l} style={{ color: C.muted, fontSize: 14, cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C.white}
            onMouseLeave={e => e.target.style.color = C.muted}>{l}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onLogin} style={{ padding: "9px 18px", fontSize: 14 }}>Log in</Btn>
        <Btn variant="gold" onClick={onRegister} style={{ padding: "9px 18px", fontSize: 14 }}>Start Free</Btn>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      </div>
    </nav>
  );
};

<<<<<<< HEAD
/* ── Hero ────────────────────────────────────────────────────── */
const Hero = ({ onRegister }) => (
  <section style={{
    minHeight:"100vh", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", textAlign:"center",
    padding:"90px 24px 60px",
    background:`radial-gradient(ellipse 80% 60% at 50% 0%,${C.indigo}22 0%,transparent 70%)`,
    position:"relative",
  }}>
    <div style={{ position:"absolute", top:"15%", left:"10%", width:280, height:280, borderRadius:"50%", background:`${C.indigo}14`, filter:"blur(70px)", pointerEvents:"none" }} />
    <div style={{ position:"absolute", bottom:"18%", right:"8%", width:220, height:220, borderRadius:"50%", background:`${C.gold}11`, filter:"blur(70px)", pointerEvents:"none" }} />

    <div style={{
      display:"inline-flex", alignItems:"center", gap:8, marginBottom:22,
      padding:"5px 14px", borderRadius:99,
      background:`${C.indigo}22`, border:`1px solid ${C.indigo}55`,
      fontSize:12, color:C.indigoL, fontWeight:500,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:C.success, display:"inline-block" }} />
      Tanzania's #1 Exam Preparation Platform
    </div>

    <h1 style={{
      fontSize:"clamp(32px,5.5vw,68px)", fontWeight:900, lineHeight:1.06,
      letterSpacing:"-2px", marginBottom:18, maxWidth:780, color:C.white,
    }}>
      Pass Your NECTA Exams{" "}
      <span style={{ background:`linear-gradient(135deg,${C.gold},${C.indigo})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        With Confidence
      </span>
    </h1>

    <p style={{ color:C.muted, fontSize:"clamp(15px,1.8vw,18px)", maxWidth:520, lineHeight:1.75, marginBottom:36 }}>
      Practice real past papers from Standard 4 to Form 6. Get marked instantly, understand every mistake, and track your progress.
    </p>

    <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:56 }}>
      <Btn v="gold" onClick={onRegister} style={{ fontSize:15, padding:"13px 30px" }}>Start Practising Free →</Btn>
      <Btn v="ghost" style={{ fontSize:15, padding:"13px 30px" }}>Watch how it works</Btn>
    </div>

    {/* Score ticker cards */}
    <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
      {[
        { subject:"Mathematics", year:"NECTA 2024 Paper 1", score:87, grade:"A", color:C.indigo },
        { subject:"Biology",     year:"NECTA 2023 Paper 2", score:94, grade:"A", color:C.success },
        { subject:"Chemistry",   year:"NECTA 2024 Paper 1", score:76, grade:"B", color:C.gold },
      ].map((item, i) => (
        <Glass key={i} style={{ padding:"18px 22px", textAlign:"left", minWidth:190 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>{item.year}</div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:C.white }}>{item.subject}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <span style={{ fontSize:34, fontWeight:900, color:item.color }}>
              <Counter target={item.score} duration={1300 + i * 300} />
            </span>
            <span style={{ background:item.color, color:item.color === C.gold ? C.navy : "#fff", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700 }}>
              Grade {item.grade}
            </span>
          </div>
          <div style={{ marginTop:7, fontSize:11, color:C.success }}>✓ Marked instantly</div>
        </Glass>
=======
// ── HERO SECTION ────────────────────────────────────────────────
const Hero = ({ onRegister }) => (
  <section style={{
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    padding: "100px 24px 60px",
    background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.indigo}22 0%, transparent 70%)`,
    position: "relative",
  }}>
    {/* Glow orbs */}
    <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: `${C.indigo}15`, filter: "blur(80px)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "20%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: `${C.gold}12`, filter: "blur(80px)", pointerEvents: "none" }} />

    {/* Badge */}
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
      padding: "6px 16px", borderRadius: 100,
      background: `${C.indigo}22`, border: `1px solid ${C.indigo}55`,
      fontSize: 13, color: C.indigoLight, fontWeight: 500,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, display: "inline-block" }} />
      Tanzania's #1 Exam Preparation Platform
    </div>

    {/* Headline */}
    <h1 style={{
      fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05,
      letterSpacing: "-2px", marginBottom: 20, maxWidth: 800,
    }}>
      Pass Your NECTA Exams{" "}
      <span style={{
        background: `linear-gradient(135deg, ${C.gold}, ${C.indigo})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>With Confidence</span>
    </h1>

    <p style={{ color: C.muted, fontSize: "clamp(16px, 2vw, 19px)", maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
      Practice real past papers from Standard 4 to Form 6. Get marked instantly, understand every mistake, and track your progress to exam day.
    </p>

    {/* CTA */}
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
      <Btn variant="gold" onClick={onRegister} style={{ fontSize: 16, padding: "14px 32px" }}>
        Start Practising Free →
      </Btn>
      <Btn variant="ghost" style={{ fontSize: 16, padding: "14px 32px" }}>
        Watch how it works
      </Btn>
    </div>

    {/* SIGNATURE: Live score ticker cards */}
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      {[
        { subject: "Mathematics", year: "NECTA 2024 Paper 1", score: 87, grade: "A", color: C.indigo },
        { subject: "Biology", year: "NECTA 2023 Paper 2", score: 94, grade: "A", color: C.success },
        { subject: "Chemistry", year: "NECTA 2024 Paper 1", score: 76, grade: "B", color: C.gold },
      ].map((item, i) => (
        <GlassCard key={i} style={{ padding: "20px 24px", textAlign: "left", minWidth: 200 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{item.year}</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{item.subject}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 38, fontWeight: 900, color: item.color }}>
              <Counter target={item.score} duration={1400 + i * 300} />
            </span>
            <span style={{
              background: item.color, color: item.color === C.gold ? C.navy : "#fff",
              padding: "2px 8px", borderRadius: 6, fontSize: 13, fontWeight: 700,
            }}>Grade {item.grade}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.success }}>✓ Marked instantly</div>
        </GlassCard>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      ))}
    </div>
  </section>
);

<<<<<<< HEAD
const StatsBar = () => (
  <div style={{
    padding:"28px 24px",
    borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`,
    display:"flex", justifyContent:"center", gap:"clamp(20px,6vw,72px)", flexWrap:"wrap",
    background:"rgba(15,31,61,0.5)",
  }}>
    {[{value:"50,000+",label:"Students"},{value:"2,400+",label:"Past Papers"},{value:"98%",label:"Pass Rate"},{value:"Form 1-6",label:"All Levels"}].map(s => (
      <div key={s.label} style={{ textAlign:"center" }}>
        <div style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:C.gold }}>{s.value}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{s.label}</div>
=======
// ── STATS BAR ───────────────────────────────────────────────────
const StatsBar = () => (
  <div style={{
    padding: "32px 24px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 80px)", flexWrap: "wrap",
    background: "rgba(15,31,61,0.5)",
  }}>
    {[
      { value: "50,000+", label: "Students" },
      { value: "2,400+", label: "Past Papers" },
      { value: "98%", label: "Pass Rate" },
      { value: "Form 1–6", label: "All Levels" },
    ].map(s => (
      <div key={s.label} style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: C.gold }}>{s.value}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{s.label}</div>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      </div>
    ))}
  </div>
);

<<<<<<< HEAD
const Features = () => (
  <section style={{ padding:"70px 24px", maxWidth:1080, margin:"0 auto" }}>
    <div style={{ textAlign:"center", marginBottom:48 }}>
      <p style={{ color:C.indigoL, fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Everything you need</p>
      <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:900, letterSpacing:"-1px", color:C.white }}>Built for Tanzanian students</h2>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
      {[
        {icon:"📝",title:"Real Past Papers",desc:"NECTA, Mock, Regional and School exams from 2010-2024."},
        {icon:"⚡",title:"Instant Marking",desc:"Score, grade and division within seconds of submission."},
        {icon:"🤖",title:"AI Tutor",desc:"Every wrong answer gets a Claude-powered explanation."},
        {icon:"📊",title:"Smart Analytics",desc:"Track weak topics and get a predicted NECTA score."},
        {icon:"🏆",title:"Gamification",desc:"XP, badges and leaderboards make learning a game."},
        {icon:"📱",title:"Works Offline",desc:"Download papers, practice offline, sync when back."},
      ].map((f, i) => (
        <Glass key={i} style={{ padding:"24px 22px" }}>
          <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:7, color:C.white }}>{f.title}</div>
          <div style={{ color:C.muted, fontSize:13, lineHeight:1.65 }}>{f.desc}</div>
        </Glass>
      ))}
    </div>
  </section>
);

/* ── LOGIN MODAL ─────────────────────────────────────────────── */
const LoginModal = ({ onClose, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [pw,    setPw]    = useState("");
  const [loading, setLoading] = useState(false);
  const [err,   setErr]   = useState("");

  const handle = () => {
    if (!email || !pw) { setErr("Please fill in all fields."); return; }
    setLoading(true); setErr("");
    setTimeout(() => { setLoading(false); alert("Logged in! Connect Supabase Auth for real login."); onClose(); }, 1200);
  };

  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(10,22,40,0.88)", backdropFilter:"blur(10px)", padding:20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background:C.navyCard, border:`1px solid ${C.border}`,
        borderRadius:16, width:"100%", maxWidth:400,
        padding:"28px 26px", position:"relative",
      }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:14, background:"none", border:"none", color:C.muted, fontSize:18, cursor:"pointer" }}>✕</button>

        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:28, marginBottom:7 }}>👋</div>
          <h2 style={{ fontSize:20, fontWeight:800, marginBottom:3, color:C.white }}>Welcome back</h2>
          <p style={{ color:C.muted, fontSize:13 }}>Log in to continue practising</p>
        </div>

        {err && <div style={{ background:"#EF444422", border:"1px solid #EF444455", borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:12, color:C.error }}>{err}</div>}

        <Field label="Email or Phone" value={email} onChange={setEmail} placeholder="you@email.com" required />
        <Field label="Password" type="password" value={pw} onChange={setPw} placeholder="••••••••" required />

        <div style={{ textAlign:"right", marginBottom:16 }}>
          <span style={{ color:C.indigoL, fontSize:12, cursor:"pointer" }}>Forgot password?</span>
        </div>

        <Btn v="primary" onClick={handle} disabled={loading} style={{ width:"100%", justifyContent:"center" }}>
          {loading ? "Logging in…" : "Log in"}
        </Btn>

        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.muted }}>
          No account?{" "}
          <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={onSwitch}>Sign up free</span>
        </p>
      </div>
=======
// ── FEATURES ────────────────────────────────────────────────────
const Features = () => {
  const features = [
    { icon: "📝", title: "Real Past Papers", desc: "NECTA, Mock, Regional, and School exams from 2010–2024. Every subject, every level." },
    { icon: "⚡", title: "Instant Marking", desc: "Submit your exam and see your score, grade, and division within seconds. No waiting." },
    { icon: "🤖", title: "AI Tutor", desc: "Every wrong answer comes with an AI explanation. Understand why, not just what." },
    { icon: "📊", title: "Smart Analytics", desc: "Track your weak topics, improvement over time, and get a predicted NECTA score." },
    { icon: "🏆", title: "Gamification", desc: "Earn XP, badges, and climb leaderboards. Learning feels like a game." },
    { icon: "📱", title: "Works Offline", desc: "Download papers and practice without internet. Sync when you're back online." },
  ];
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p style={{ color: C.indigoLight, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Everything you need</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-1px" }}>
          Built for Tanzanian students
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {features.map((f, i) => (
          <GlassCard key={i} style={{ padding: "28px 24px", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${C.indigo}33`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</div>
            <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>{f.desc}</div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

// ── SUBJECTS PREVIEW ─────────────────────────────────────────────
const SubjectsPreview = () => {
  const levels = [
    { level: "Standard 7", subjects: ["Mathematics", "English", "Kiswahili", "Science", "Social Studies"], color: C.success },
    { level: "Form 4 (CSEE)", subjects: ["Mathematics", "Biology", "Chemistry", "Physics", "History", "Geography", "English", "Kiswahili"], color: C.indigo },
    { level: "Form 6 (ACSEE)", subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "History", "Geography", "General Studies"], color: C.gold },
  ];
  return (
    <section style={{ padding: "80px 24px", background: "rgba(15,31,61,0.4)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 48 }}>
          All levels. All subjects.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {levels.map((l, i) => (
            <GlassCard key={i} style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{l.level}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {l.subjects.map(s => (
                  <span key={s} style={{
                    padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                    background: `${l.color}18`, color: l.color, border: `1px solid ${l.color}33`,
                  }}>{s}</span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── LOGIN MODAL ─────────────────────────────────────────────────
const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    setTimeout(() => { setLoading(false); alert("✓ Logged in! (Demo mode — connect Supabase Auth to enable real login)"); onClose(); }, 1200);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(10,22,40,0.85)", backdropFilter: "blur(8px)",
      padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <GlassCard style={{ width: "100%", maxWidth: 420, padding: "36px 32px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: C.muted, fontSize: 14 }}>Log in to continue practising</p>
        </div>

        {error && <div style={{ background: `${C.error}22`, border: `1px solid ${C.error}55`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.error }}>{error}</div>}

        <Input label="Email or Phone" value={email} onChange={setEmail} placeholder="you@email.com" required />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <span style={{ color: C.indigoLight, fontSize: 13, cursor: "pointer" }}>Forgot password?</span>
        </div>

        <Btn variant="primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Logging in..." : "Log in"}
        </Btn>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.muted }}>
          Don't have an account?{" "}
          <span style={{ color: C.gold, cursor: "pointer", fontWeight: 600 }} onClick={onSwitchToRegister}>Sign up free</span>
        </p>
      </GlassCard>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
    </div>
  );
};

<<<<<<< HEAD
/* ── REGISTER MODAL — scrollable + compact ───────────────────── */
const STEP_META = [
  { title:"Personal Info",    icon:"👤" },
  { title:"School Info",      icon:"🏫" },
  { title:"Education Level",  icon:"📚" },
];

const RegisterModal = ({ onClose, onSwitch }) => {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [form,    setForm]    = useState({
    fullName:"", gender:"", dob:"", phone:"", email:"", password:"", confirmPassword:"",
    schoolName:"", region:"", district:"", schoolType:"",
    level:"", combination:"",
  });

  const set = k => v => setForm(p => ({ ...p, [k]: v }));
=======
// ── REGISTRATION WIZARD ─────────────────────────────────────────
const COMBINATIONS = ["PCM", "PCB", "CBG", "EGM", "HGL", "HKL", "HGK", "ECA", "CBA", "Others"];
const REGIONS = ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Kilimanjaro", "Kagera", "Mara", "Shinyanga", "Tabora", "Singida", "Iringa", "Ruvuma", "Lindi", "Mtwara", "Pwani", "Rukwa", "Kigoma", "Katavi", "Geita", "Simiyu", "Njombe", "Songwe", "Kaskazini Unguja", "Kusini Unguja", "Mjini Magharibi", "Kaskazini Pemba", "Kusini Pemba"];
const LEVELS = ["Standard 4", "Standard 7", "Form 2", "Form 4", "Form 6"];

const steps = [
  { id: "personal", title: "Personal Info", icon: "👤" },
  { id: "school", title: "School Info", icon: "🏫" },
  { id: "level", title: "Education Level", icon: "📚" },
  { id: "done", title: "All Set!", icon: "🎉" },
];

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "", gender: "", dob: "", phone: "", email: "", password: "", confirmPassword: "",
    schoolName: "", region: "", district: "", schoolType: "",
    level: "", combination: "",
  });

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18

  const validate = () => {
    const e = {};
    if (step === 0) {
<<<<<<< HEAD
      if (!form.fullName)  e.fullName = "Required";
      if (!form.gender)    e.gender   = "Required";
      if (!form.dob)       e.dob      = "Required";
      if (!form.phone)     e.phone    = "Required";
      if (!form.password)  e.password = "Required";
      else if (form.password.length < 6) e.password = "Min 6 chars";
=======
      if (!form.fullName) e.fullName = "Required";
      if (!form.gender) e.gender = "Required";
      if (!form.dob) e.dob = "Required";
      if (!form.phone) e.phone = "Required";
      if (!form.password) e.password = "Required";
      else if (form.password.length < 6) e.password = "Min 6 characters";
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    if (step === 1) {
      if (!form.schoolName) e.schoolName = "Required";
<<<<<<< HEAD
      if (!form.region)     e.region     = "Required";
=======
      if (!form.region) e.region = "Required";
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      if (!form.schoolType) e.schoolType = "Required";
    }
    if (step === 2) {
      if (!form.level) e.level = "Required";
      if (form.level === "Form 6" && !form.combination) e.combination = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

<<<<<<< HEAD
  const next   = () => { if (validate()) setStep(s => s + 1); };
  const prev   = () => setStep(s => s - 1);
=======
  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
  const submit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1400);
  };

<<<<<<< HEAD
  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(10,22,40,0.9)", backdropFilter:"blur(10px)",
        padding:"16px",                       /* ← padding around modal */
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* ── Modal panel: max-height + scroll ── */}
      <div style={{
        background:C.navyCard,
        border:`1px solid ${C.border}`,
        borderRadius:16,
        width:"100%",
        maxWidth:440,
        maxHeight:"calc(100vh - 40px)",       /* ← never taller than viewport */
        overflowY:"auto",                     /* ← scrollable */
        position:"relative",
        display:"flex",
        flexDirection:"column",
      }}>
        {/* sticky header */}
        <div style={{
          padding:"18px 22px 14px",
          borderBottom: step < 3 ? `1px solid ${C.border}` : "none",
          position:"sticky", top:0, zIndex:10,
          background:C.navyCard,
          borderRadius:"16px 16px 0 0",
          flexShrink:0,
        }}>
          <button onClick={onClose} style={{ position:"absolute", top:12, right:14, background:"none", border:"none", color:C.muted, fontSize:17, cursor:"pointer" }}>✕</button>

          {step < 3 && (
            <>
              {/* Progress bar */}
              <div style={{ display:"flex", gap:5, marginBottom:12 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= step ? C.indigo : C.border }} />
                ))}
              </div>
              <p style={{ fontSize:11, color:C.muted, marginBottom:2, fontWeight:500 }}>Step {step + 1} of 3</p>
              <h2 style={{ fontSize:18, fontWeight:800, color:C.white }}>
                {STEP_META[step].icon} {STEP_META[step].title}
              </h2>
            </>
          )}
        </div>

        {/* scrollable body */}
        <div style={{ padding:"16px 22px 22px", flex:1, overflowY:"auto" }}>

          {/* ── Step 0: Personal Info ── */}
          {step === 0 && (
            <>
              <Field label="Full Name"        value={form.fullName}        onChange={set("fullName")}        placeholder="Amina Hassan"    required error={errors.fullName} />
              <Field label="Gender"           type="select" value={form.gender} onChange={set("gender")}     required error={errors.gender}
                options={[{value:"male",label:"Male"},{value:"female",label:"Female"}]} />
              <Field label="Date of Birth"    type="date"  value={form.dob}      onChange={set("dob")}       required error={errors.dob} />
              <Field label="Phone Number"     value={form.phone}           onChange={set("phone")}           placeholder="0712 345 678"    required error={errors.phone} />
              <Field label="Email (optional)" type="email" value={form.email}    onChange={set("email")}     placeholder="amina@example.com" />
              <Field label="Password"         type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" required error={errors.password} />
              <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required error={errors.confirmPassword} />
              <Btn v="primary" onClick={next} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Continue →</Btn>
            </>
          )}

          {/* ── Step 1: School Info ── */}
          {step === 1 && (
            <>
              <Field label="School Name"  value={form.schoolName}  onChange={set("schoolName")}  placeholder="Mwl. Nyerere Secondary School" required error={errors.schoolName} />
              <Field label="Region"       type="select" value={form.region} onChange={set("region")} required error={errors.region}
                options={REGIONS.map(r => ({ value:r, label:r }))} />
              <Field label="District"     value={form.district}    onChange={set("district")}    placeholder="e.g. Kinondoni" />
              <Field label="School Type"  type="select" value={form.schoolType} onChange={set("schoolType")} required error={errors.schoolType}
                options={[{value:"government",label:"Government"},{value:"private",label:"Private"}]} />
              <div style={{ display:"flex", gap:9, marginTop:4 }}>
                <Btn v="ghost"   onClick={prev}  style={{ flex:1, justifyContent:"center" }}>← Back</Btn>
                <Btn v="primary" onClick={next}  style={{ flex:2, justifyContent:"center" }}>Continue →</Btn>
              </div>
            </>
          )}

          {/* ── Step 2: Education Level ── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", marginBottom:8, fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  Education Level <span style={{ color:C.gold }}>*</span>
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {LEVELS.map(l => (
                    <div
                      key={l}
                      onClick={() => set("level")(l)}
                      style={{
                        padding:"11px 14px", borderRadius:9, cursor:"pointer", fontSize:13,
                        border:`1px solid ${form.level === l ? C.indigo : C.border}`,
                        background: form.level === l ? `${C.indigo}22` : "transparent",
                        fontWeight: form.level === l ? 700 : 400,
                        color: form.level === l ? C.indigoL : C.white,
                        transition:"all 0.15s",
                      }}
                    >{l}</div>
                  ))}
                </div>
                {errors.level && <p style={{ color:C.error, fontSize:11, marginTop:5 }}>{errors.level}</p>}
              </div>

              {form.level === "Form 6" && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:"block", marginBottom:8, fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                    Combination <span style={{ color:C.gold }}>*</span>
                  </label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {COMBOS.map(c => (
                      <div
                        key={c}
                        onClick={() => set("combination")(c)}
                        style={{
                          padding:"6px 14px", borderRadius:99, cursor:"pointer", fontSize:12, fontWeight:600,
                          border:`1px solid ${form.combination === c ? C.gold : C.border}`,
                          background: form.combination === c ? `${C.gold}22` : "transparent",
                          color: form.combination === c ? C.gold : C.muted,
                          transition:"all 0.15s",
                        }}
                      >{c}</div>
                    ))}
                  </div>
                  {errors.combination && <p style={{ color:C.error, fontSize:11, marginTop:5 }}>{errors.combination}</p>}
                </div>
              )}

              <div style={{ display:"flex", gap:9, marginTop:4 }}>
                <Btn v="ghost" onClick={prev} style={{ flex:1, justifyContent:"center" }}>← Back</Btn>
                <Btn v="gold"  onClick={submit} disabled={loading} style={{ flex:2, justifyContent:"center", color:C.navy }}>
                  {loading ? "Creating…" : "Create Account 🎉"}
                </Btn>
              </div>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div style={{ textAlign:"center", padding:"12px 0 8px" }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
              <h2 style={{ fontSize:22, fontWeight:900, marginBottom:7, color:C.white }}>
                You're in, {form.fullName.split(" ")[0]}!
              </h2>
              <p style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:20 }}>
                Your account is ready. Start your first past paper and see how ready you are for NECTA.
              </p>
              <div style={{
                background:`${C.indigo}18`, border:`1px solid ${C.indigo}44`,
                borderRadius:10, padding:"13px 16px", marginBottom:20, textAlign:"left",
              }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>Account Summary</div>
                <div style={{ fontWeight:700, fontSize:15, color:C.white }}>{form.fullName}</div>
                <div style={{ color:C.muted, fontSize:12 }}>{form.level}{form.combination ? ` · ${form.combination}` : ""}</div>
                <div style={{ color:C.muted, fontSize:12 }}>{form.schoolName}{form.region ? `, ${form.region}` : ""}</div>
              </div>
              <Btn v="gold" onClick={onClose} style={{ width:"100%", justifyContent:"center", color:C.navy, fontSize:15 }}>
                Go to Dashboard →
              </Btn>
            </div>
          )}

          {step < 3 && (
            <p style={{ textAlign:"center", marginTop:14, fontSize:12, color:C.muted }}>
              Already have an account?{" "}
              <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={onSwitch}>Log in</span>
            </p>
          )}
        </div>
      </div>
=======
  const progressPct = (step / (steps.length - 1)) * 100;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(10,22,40,0.9)", backdropFilter: "blur(8px)",
      padding: 24, overflowY: "auto",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <GlassCard style={{ width: "100%", maxWidth: 500, padding: "32px 28px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>

        {/* Steps header */}
        {step < 3 && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {steps.slice(0, 3).map((s, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? C.indigo : `${C.border}` }} />
              ))}
            </div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Step {step + 1} of 3</p>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{steps[step].icon} {steps[step].title}</h2>
            </div>
          </>
        )}

        {/* Step 0 – Personal */}
        {step === 0 && (
          <>
            <Input label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Amina Hassan" required error={errors.fullName} />
            <Input label="Gender" type="select" value={form.gender} onChange={set("gender")} required error={errors.gender}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
            <Input label="Date of Birth" type="date" value={form.dob} onChange={set("dob")} required error={errors.dob} />
            <Input label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="0712 345 678" required error={errors.phone} />
            <Input label="Email (optional)" type="email" value={form.email} onChange={set("email")} placeholder="amina@example.com" />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" required error={errors.password} />
            <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required error={errors.confirmPassword} />
            <Btn variant="primary" onClick={next} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Continue →</Btn>
          </>
        )}

        {/* Step 1 – School */}
        {step === 1 && (
          <>
            <Input label="School Name" value={form.schoolName} onChange={set("schoolName")} placeholder="Mwl. Nyerere Secondary School" required error={errors.schoolName} />
            <Input label="Region" type="select" value={form.region} onChange={set("region")} required error={errors.region}
              options={REGIONS.map(r => ({ value: r, label: r }))} />
            <Input label="District" value={form.district} onChange={set("district")} placeholder="e.g. Kinondoni" />
            <Input label="School Type" type="select" value={form.schoolType} onChange={set("schoolType")} required error={errors.schoolType}
              options={[{ value: "government", label: "Government" }, { value: "private", label: "Private" }]} />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Btn variant="ghost" onClick={prev} style={{ flex: 1, justifyContent: "center" }}>← Back</Btn>
              <Btn variant="primary" onClick={next} style={{ flex: 2, justifyContent: "center" }}>Continue →</Btn>
            </div>
          </>
        )}

        {/* Step 2 – Level */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 10, fontSize: 13, color: C.muted, fontWeight: 500 }}>
                Education Level<span style={{ color: C.gold }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {LEVELS.map(l => (
                  <div key={l} onClick={() => set("level")(l)} style={{
                    padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${form.level === l ? C.indigo : C.border}`,
                    background: form.level === l ? `${C.indigo}22` : "transparent",
                    fontWeight: form.level === l ? 700 : 400, fontSize: 14,
                    transition: "all 0.15s",
                  }}>{l}</div>
                ))}
              </div>
              {errors.level && <p style={{ color: C.error, fontSize: 12, marginTop: 6 }}>{errors.level}</p>}
            </div>

            {form.level === "Form 6" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 10, fontSize: 13, color: C.muted, fontWeight: 500 }}>
                  Combination<span style={{ color: C.gold }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {COMBINATIONS.map(c => (
                    <div key={c} onClick={() => set("combination")(c)} style={{
                      padding: "8px 16px", borderRadius: 100, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      border: `1px solid ${form.combination === c ? C.gold : C.border}`,
                      background: form.combination === c ? `${C.gold}22` : "transparent",
                      color: form.combination === c ? C.gold : C.muted,
                      transition: "all 0.15s",
                    }}>{c}</div>
                  ))}
                </div>
                {errors.combination && <p style={{ color: C.error, fontSize: 12, marginTop: 6 }}>{errors.combination}</p>}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Btn variant="ghost" onClick={prev} style={{ flex: 1, justifyContent: "center" }}>← Back</Btn>
              <Btn variant="gold" onClick={submit} disabled={loading} style={{ flex: 2, justifyContent: "center", color: C.navy }}>
                {loading ? "Creating account..." : "Create Account 🎉"}
              </Btn>
            </div>
          </>
        )}

        {/* Step 3 – Success */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>You're in, {form.fullName.split(" ")[0]}!</h2>
            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Your account has been created. Start with your first past paper and see how ready you are for NECTA.
            </p>
            <div style={{ background: `${C.indigo}18`, border: `1px solid ${C.indigo}44`, borderRadius: 12, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Account Summary</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{form.fullName}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{form.level}{form.combination ? ` · ${form.combination}` : ""}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{form.schoolName}{form.region ? `, ${form.region}` : ""}</div>
            </div>
            <Btn variant="gold" onClick={onClose} style={{ width: "100%", justifyContent: "center", color: C.navy, fontSize: 16 }}>
              Go to Dashboard →
            </Btn>
          </div>
        )}

        {step < 3 && (
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.muted }}>
            Already have an account?{" "}
            <span style={{ color: C.gold, cursor: "pointer", fontWeight: 600 }} onClick={onSwitchToLogin}>Log in</span>
          </p>
        )}
      </GlassCard>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
    </div>
  );
};

<<<<<<< HEAD
/* ── APP ─────────────────────────────────────────────────────── */
export default function LandingAuth() {
  const [modal, setModal] = useState(null);
  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:C.navy, color:C.white, minHeight:"100vh", overflowX:"hidden" }}>
=======
// ── FOOTER ──────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 24px", textAlign: "center" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: `linear-gradient(135deg, ${C.indigo}, ${C.gold})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff",
      }}>E</div>
      <span style={{ fontWeight: 800, fontSize: 16 }}>ExamHub <span style={{ color: C.gold }}>Tanzania</span></span>
    </div>
    <p style={{ color: C.muted, fontSize: 13 }}>© 2025 ExamHub Tanzania · Designed for Tanzanian students</p>
    <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16 }}>
      {["Privacy Policy", "Terms", "Contact Us", "Help"].map(l => (
        <span key={l} style={{ color: C.muted, fontSize: 12, cursor: "pointer" }}>{l}</span>
      ))}
    </div>
  </footer>
);

// ── APP ROOT ────────────────────────────────────────────────────
export default function App() {
  const [modal, setModal] = useState(null); // null | "login" | "register"

  return (
    <div style={styles.root}>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
      <Navbar onLogin={() => setModal("login")} onRegister={() => setModal("register")} />
      <Hero onRegister={() => setModal("register")} />
      <StatsBar />
      <Features />
<<<<<<< HEAD

      <section style={{ padding:"70px 24px", textAlign:"center", background:`linear-gradient(135deg,${C.indigo}33,${C.navy})` }}>
        <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:900, marginBottom:14, letterSpacing:"-1px", color:C.white }}>
          Ready to ace your exams?
        </h2>
        <p style={{ color:C.muted, fontSize:15, marginBottom:28, maxWidth:460, margin:"0 auto 28px" }}>
          Join 50,000+ Tanzanian students preparing smarter with ExamHub.
        </p>
        <Btn v="gold" onClick={() => setModal("register")} style={{ fontSize:16, padding:"14px 36px", color:C.navy }}>
=======
      <SubjectsPreview />

      {/* CTA Banner */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: `linear-gradient(135deg, ${C.indigo}33, ${C.navy})`,
      }}>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, marginBottom: 16, letterSpacing: "-1px" }}>
          Ready to ace your exams?
        </h2>
        <p style={{ color: C.muted, fontSize: 16, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
          Join 50,000+ Tanzanian students already preparing smarter with ExamHub.
        </p>
        <Btn variant="gold" onClick={() => setModal("register")} style={{ fontSize: 17, padding: "16px 40px", color: C.navy }}>
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
          Create Free Account →
        </Btn>
      </section>

<<<<<<< HEAD
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"32px 24px", textAlign:"center" }}>
        <p style={{ color:C.muted, fontSize:12 }}>© 2025 ExamHub Tanzania — Built for Tanzanian Students</p>
      </footer>

      {modal === "login"    && <LoginModal    onClose={() => setModal(null)} onSwitch={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onSwitch={() => setModal("login")} />}
    </div>
  );
}
=======
      <Footer />

      {modal === "login" && (
        <LoginModal onClose={() => setModal(null)} onSwitchToRegister={() => setModal("register")} />
      )}
      {modal === "register" && (
        <RegisterModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal("login")} />
      )}
    </div>
  );
}
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
