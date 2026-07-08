import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  navy:"#0A1628", navyMid:"#0F1F3D", navyCard:"#111E35",
  indigo:"#4F46E5", indigoL:"#6366F1", gold:"#F59E0B", goldL:"#FCD34D",
  teal:"#14B8A6", green:"#10B981", purple:"#8B5CF6",
  white:"#F0F4FF", muted:"#94A3B8", border:"rgba(99,102,241,0.18)",
  error:"#EF4444",
};

/* ── Role → route map ──────────────────────────────────────── */
const ROLE_ROUTES = {
  student:      "/dashboard",
  teacher:      "/teacher",
  school_admin: "/school",
  super_admin:  "/superadmin",
  parent:       "/dashboard",
};

/* ── Static data ───────────────────────────────────────────── */
const REGIONS = [
  "Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya","Morogoro","Tanga",
  "Kilimanjaro","Kagera","Mara","Shinyanga","Tabora","Singida","Iringa",
  "Ruvuma","Lindi","Mtwara","Pwani","Rukwa","Kigoma","Katavi","Geita",
  "Simiyu","Njombe","Songwe","Kaskazini Unguja","Kusini Unguja",
  "Mjini Magharibi","Kaskazini Pemba","Kusini Pemba",
];
const LEVELS   = ["Standard 4","Standard 7","Form 2","Form 4","Form 6"];
const COMBOS   = ["PCM","PCB","CBG","EGM","HGL","HKL","HGK","ECA","CBA","Others"];
const SUBJECTS = [
  "Mathematics","English","Kiswahili","Biology","Chemistry","Physics",
  "Geography","History","Civics","Commerce","Book Keeping","Agriculture","ICT",
  "General Studies",
];
const QUAL = [
  "Certificate","Diploma","Bachelor's Degree","Postgraduate Diploma",
  "Master's Degree","PhD",
];

/* ── Roles users can self-register as ─────────────────────── */
const ROLE_OPTIONS = [
  { value:"student",      label:"Student",       icon:"👨‍🎓", desc:"Practice NECTA past papers and track your progress" },
  { value:"parent",       label:"Parent",        icon:"👨‍👩‍👧", desc:"Monitor your child's exam preparation progress" },
  { value:"teacher",      label:"Teacher",       icon:"👨‍🏫", desc:"Create exams and track your students' performance" },
  { value:"school_admin", label:"School Admin",  icon:"🏫", desc:"Manage your school's students, teachers and results" },
];

/* ── Tiny helpers ──────────────────────────────────────────── */
const inp = {
  width:"100%", padding:"9px 13px", borderRadius:9,
  background:"rgba(15,31,61,0.85)", border:`1px solid ${C.border}`,
  color:C.white, fontSize:13, outline:"none", boxSizing:"border-box",
  fontFamily:"inherit", transition:"border-color 0.2s",
};
const focus   = e => { e.target.style.borderColor = C.indigo; };
const blur    = (e, err) => { e.target.style.borderColor = err ? C.error : C.border; };
const lbl = (text, required) => (
  <label style={{ display:"block", fontSize:11, color:C.muted, fontWeight:600,
    textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:5 }}>
    {text}{required && <span style={{ color:C.gold }}> *</span>}
  </label>
);

const Field = ({ label, type="text", value, onChange, placeholder, required, error, disabled }) => (
  <div style={{ marginBottom:12 }}>
    {lbl(label, required)}
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={{ ...inp, borderColor: error ? C.error : C.border, opacity: disabled ? 0.5 : 1 }}
      onFocus={focus} onBlur={e => blur(e, error)} />
    {error && <p style={{ color:C.error, fontSize:11, marginTop:3 }}>⚠ {error}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder, required, error }) => (
  <div style={{ marginBottom:12 }}>
    {lbl(label, required)}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...inp, cursor:"pointer", borderColor: error ? C.error : C.border,
        appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:32,
      }}
      onFocus={focus} onBlur={e => blur(e, error)}>
      <option value="">{placeholder || "Select…"}</option>
      {options.map(o => (
        <option key={o.value||o} value={o.value||o}>{o.label||o}</option>
      ))}
    </select>
    {error && <p style={{ color:C.error, fontSize:11, marginTop:3 }}>⚠ {error}</p>}
  </div>
);

const Btn = ({ children, onClick, variant="primary", style={}, disabled=false, type="button" }) => {
  const vs = {
    primary: { background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`, color:"#fff", border:"none" },
    gold:    { background:`linear-gradient(135deg,${C.gold},${C.goldL})`,   color:C.navy,  border:"none" },
    ghost:   { background:"transparent", color:C.white, border:`1px solid ${C.border}` },
    green:   { background:`linear-gradient(135deg,${C.green},#34D399)`,     color:"#fff",  border:"none" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
        padding:"11px 20px", borderRadius:10, fontWeight:700, fontSize:14,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
        fontFamily:"inherit", transition:"all 0.2s", ...vs[variant], ...style }}>
      {children}
    </button>
  );
};

/* ──────────────────────────────────────────────────────────────
   LOGIN MODAL
────────────────────────────────────────────────────────────── */
const LoginModal = ({ onClose, onSwitch }) => {
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [showPw,     setShowPw]     = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const isPhone = /^[\d+]/.test(identifier) && !identifier.includes("@");
      const creds   = isPhone ? { phone: identifier, password } : { email: identifier, password };
      const { data, error: authErr } = await supabase.auth.signInWithPassword(creds);
      if (authErr) { setError(authErr.message); setLoading(false); return; }

      const { data: profile } = await supabase.from("profiles")
        .select("role,full_name,is_active").eq("id", data.user.id).single();

      if (!profile?.is_active) {
        setError("Your account has been deactivated. Contact support.");
        await supabase.auth.signOut();
        setLoading(false); return;
      }

      // Check approval status for teacher / school_admin
      if (profile.role === "teacher" || profile.role === "school_admin") {
        const table = profile.role === "teacher" ? "teachers" : "profiles";
        const col   = profile.role === "teacher" ? "is_verified" : "metadata->>'approval_status'";
        const { data: extra } = await supabase.from("profiles")
          .select("metadata").eq("id", data.user.id).single();
        const status = extra?.metadata?.approval_status;
        if (status === "pending") {
          setError("Your account is pending admin approval. You'll be notified by email once approved.");
          await supabase.auth.signOut();
          setLoading(false); return;
        }
        if (status === "rejected") {
          setError("Your account application was not approved. Please contact your school admin.");
          await supabase.auth.signOut();
          setLoading(false); return;
        }
      }

      window.location.href = ROLE_ROUTES[profile.role] ?? "/dashboard";
    } catch {
      setError("Network error. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(10,22,40,0.9)", backdropFilter:"blur(10px)", padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:16,
        width:"100%", maxWidth:400, padding:"28px 26px", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:14,
          background:"none", border:"none", color:C.muted, fontSize:18, cursor:"pointer" }}>✕</button>

        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:28, marginBottom:7 }}>👋</div>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.white, marginBottom:3 }}>Welcome back</h2>
          <p style={{ color:C.muted, fontSize:13 }}>Log in to continue</p>
        </div>

        {error && (
          <div style={{ background:`${C.error}18`, border:`1px solid ${C.error}44`,
            borderRadius:9, padding:"10px 14px", marginBottom:14, fontSize:13, color:C.error }}>
            ⚠️ {error}
          </div>
        )}

        <Field label="Email or Phone" value={identifier} onChange={setIdentifier}
          placeholder="you@email.com or 0712 345 678" required />
        <div style={{ position:"relative", marginBottom:14 }}>
          {lbl("Password", true)}
          <input type={showPw ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={inp} onFocus={focus} onBlur={blur}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <button onClick={() => setShowPw(s => !s)} style={{ position:"absolute", right:12,
            top:"calc(50% + 8px)", transform:"translateY(-50%)", background:"none",
            border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
        <div style={{ textAlign:"right", marginBottom:16 }}>
          <span style={{ color:C.indigoL, fontSize:12, cursor:"pointer" }}>Forgot password?</span>
        </div>
        <Btn variant="primary" onClick={handleLogin} disabled={loading}
          style={{ width:"100%", justifyContent:"center" }}>
          {loading ? "Logging in…" : "Log in →"}
        </Btn>
        <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:C.muted }}>
          No account?{" "}
          <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={onSwitch}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   REGISTER MODAL — dynamic per role
────────────────────────────────────────────────────────────── */
const RegisterModal = ({ onClose, onSwitch }) => {
  const [step,    setStep]    = useState(0); // 0=pick role, 1=fill form, 2=done
  const [role,    setRole]    = useState("");
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [schools, setSchools] = useState([]);

  /* universal fields */
  const [f, setF] = useState({
    fullName:"", phone:"", email:"", password:"", confirmPw:"", gender:"", dob:"", region:"",
    /* student */
    level:"", combination:"", className:"", admNo:"",
    /* teacher */
    subjects:[], qualification:"", employeeId:"", teacherSchoolId:"",
    /* school admin */
    schoolName:"", schoolReg:"", schoolType:"", schoolRegion:"", district:"",
    /* parent */
    childName:"", childSchool:"", childClass:"", childAdmNo:"",
  });
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  /* load schools for teacher dropdown */
  useEffect(() => {
    if (role === "teacher") {
      supabase.from("schools").select("id,name,region")
        .eq("status","active").order("name")
        .then(({ data }) => setSchools(data ?? []));
    }
  }, [role]);

  const toggleSubject = s => setF(p => ({
    ...p,
    subjects: p.subjects.includes(s) ? p.subjects.filter(x => x !== s) : [...p.subjects, s],
  }));

  /* ── Validation per role ─────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!f.fullName)    e.fullName    = "Required";
    if (!f.phone && !f.email) e.phone = "Phone or email required";
    if (!f.password)    e.password    = "Required";
    else if (f.password.length < 6) e.password = "Min 6 characters";
    if (f.password !== f.confirmPw) e.confirmPw = "Passwords don't match";
    if (!f.region)      e.region      = "Required";

    if (role === "student") {
      if (!f.level) e.level = "Required";
      if (f.level === "Form 6" && !f.combination) e.combination = "Required";
    }
    if (role === "teacher") {
      if (!f.teacherSchoolId) e.teacherSchoolId = "Required";
      if (!f.qualification)   e.qualification   = "Required";
      if (f.subjects.length === 0) e.subjects   = "Select at least one subject";
    }
    if (role === "school_admin") {
      if (!f.schoolName) e.schoolName = "Required";
      if (!f.schoolType) e.schoolType = "Required";
      if (!f.schoolRegion) e.schoolRegion = "Required";
    }
    if (role === "parent") {
      if (!f.childName) e.childName = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ──────────────────────────────────────────── */
  const submit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      let result;

      if (role === "student" || role === "parent") {
        /* Auto-approved — call Edge Function */
        const { data, error: fnErr } = await supabase.functions.invoke("create-student", {
          body: {
            full_name:  f.fullName,
            phone:      f.phone   || null,
            email:      f.email   || null,
            password:   f.password,
            gender:     f.gender  || null,
            dob:        f.dob     || null,
            region:     f.region  || null,
            level:      role === "student"
                          ? f.level.toLowerCase().replace(" ","_")
                          : null,
            combination: f.combination || null,
            class_name:  f.className   || null,
            admission_number: f.admNo  || null,
            /* parent extras stored in metadata */
            metadata: role === "parent" ? {
              role: "parent",
              child_name:  f.childName,
              child_school: f.childSchool,
              child_class: f.childClass,
              child_adm_no: f.childAdmNo,
            } : { role: "student" },
          },
        });
        if (fnErr || data?.error) throw new Error(fnErr?.message || data?.error);
        result = { autoApproved: true };

      } else if (role === "teacher") {
        /* Pending approval — register via Supabase Auth directly */
        const email = f.email || `${f.phone}@examhub.tz`;
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email, password: f.password,
          options: {
            data: {
              full_name: f.fullName,
              role:      "teacher",
              metadata:  {
                role: "teacher",
                approval_status: "pending",
                qualification:   f.qualification,
                subjects:        f.subjects,
                employee_id:     f.employeeId,
                school_id:       f.teacherSchoolId,
                phone:           f.phone,
                region:          f.region,
                gender:          f.gender,
              },
            },
          },
        });
        if (authErr) throw new Error(authErr.message);

        /* Update profile with pending status */
        await supabase.from("profiles").update({
          full_name: f.fullName,
          phone:     f.phone || null,
          gender:    f.gender || null,
          region:    f.region,
          school_id: f.teacherSchoolId,
          metadata:  { approval_status: "pending", role: "teacher",
            qualification: f.qualification, subjects: f.subjects },
        }).eq("id", authData.user.id);

        /* Insert teacher row with unverified status */
        await supabase.from("teachers").insert({
          id:            authData.user.id,
          subjects:      f.subjects,
          qualification: f.qualification,
          employee_id:   f.employeeId || null,
        });

        /* Notify school_admin of this school */
        const { data: admins } = await supabase.from("profiles")
          .select("id").eq("school_id", f.teacherSchoolId).eq("role","school_admin");
        if (admins?.length) {
          await supabase.from("notifications").insert(
            admins.map(a => ({
              user_id: a.id, type:"system",
              title:   `New Teacher Registration — ${f.fullName}`,
              body:    `${f.fullName} has applied to join your school as a teacher. Review and approve in your portal.`,
              data:    { teacher_id: authData.user.id, action: "approve_teacher" },
            }))
          );
        }
        result = { autoApproved: false };

      } else if (role === "school_admin") {
        /* School admin — create school + pending approval */
        const email = f.email || `${f.phone}@examhub.tz`;
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email, password: f.password,
          options: {
            data: {
              full_name: f.fullName,
              role:      "school_admin",
              metadata:  { approval_status: "pending", role: "school_admin" },
            },
          },
        });
        if (authErr) throw new Error(authErr.message);

        /* Insert school with pending status */
        const { data: school } = await supabase.from("schools").insert({
          name:      f.schoolName,
          reg_number: f.schoolReg || null,
          region:    f.schoolRegion,
          district:  f.district || null,
          type:      f.schoolType,
          plan:      "free",
          status:    "pending",
        }).select().single();

        /* Update profile */
        await supabase.from("profiles").update({
          full_name: f.fullName,
          phone:     f.phone || null,
          gender:    f.gender || null,
          region:    f.region,
          role:      "school_admin",
          school_id: school?.id || null,
          metadata:  { approval_status: "pending", role:"school_admin",
            school_name: f.schoolName },
        }).eq("id", authData.user.id);

        /* Notify all super_admins */
        const { data: superAdmins } = await supabase.from("profiles")
          .select("id").eq("role","super_admin");
        if (superAdmins?.length) {
          await supabase.from("notifications").insert(
            superAdmins.map(a => ({
              user_id: a.id, type:"system",
              title:   `New School Registration — ${f.schoolName}`,
              body:    `${f.fullName} has registered ${f.schoolName} (${f.schoolRegion}). Review and approve in the Super Admin portal.`,
              data:    { school_id: school?.id, admin_id: authData.user.id, action:"approve_school" },
            }))
          );
        }
        result = { autoApproved: false };
      }

      setLoading(false);
      setStep(2);
      window._regResult = result;

    } catch (e) {
      setErrors({ submit: e.message || "Registration failed. Please try again." });
      setLoading(false);
    }
  };

  const approved  = window._regResult?.autoApproved;
  const roleLabel = ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;

  /* ── STEP 0: Pick role ─────────────────────────────── */
  if (step === 0) return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(10,22,40,0.9)", backdropFilter:"blur(10px)", padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:16,
        width:"100%", maxWidth:480, padding:"28px 26px", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:14,
          background:"none", border:"none", color:C.muted, fontSize:18, cursor:"pointer" }}>✕</button>

        <div style={{ textAlign:"center", marginBottom:22 }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.white, marginBottom:4 }}>Create your account</h2>
          <p style={{ color:C.muted, fontSize:13 }}>Choose your role to get started</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {ROLE_OPTIONS.map(r => (
            <div key={r.value} onClick={() => { setRole(r.value); setStep(1); }}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                borderRadius:12, cursor:"pointer", transition:"all 0.15s",
                border:`1px solid ${role===r.value ? C.indigo : C.border}`,
                background: role===r.value ? `${C.indigo}18` : C.navyMid,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.indigo}
              onMouseLeave={e => e.currentTarget.style.borderColor = role===r.value ? C.indigo : C.border}>
              <div style={{ width:44, height:44, borderRadius:11, flexShrink:0,
                background:`${C.indigo}22`, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:22 }}>{r.icon}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:C.white }}>{r.label}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{r.desc}</div>
              </div>
              <div style={{ marginLeft:"auto", color:C.muted, fontSize:18 }}>›</div>
            </div>
          ))}
        </div>

        {/* approval warning for teacher / school_admin */}
        <div style={{ marginTop:14, padding:"10px 14px", borderRadius:9,
          background:`${C.gold}12`, border:`1px solid ${C.gold}30`,
          fontSize:12, color:C.gold }}>
          ℹ️ <strong>Students & Parents</strong> are approved instantly.{" "}
          <strong>Teachers & School Admins</strong> require admin verification.
        </div>

        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.muted }}>
          Already have an account?{" "}
          <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={onSwitch}>Log in</span>
        </p>
      </div>
    </div>
  );

  /* ── STEP 1: Fill form ─────────────────────────────── */
  if (step === 1) return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(10,22,40,0.9)", backdropFilter:"blur(10px)", padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:16,
        width:"100%", maxWidth:500, maxHeight:"calc(100vh - 40px)",
        display:"flex", flexDirection:"column", position:"relative" }}>

        {/* Sticky header */}
        <div style={{ padding:"16px 22px 14px", borderBottom:`1px solid ${C.border}`,
          background:C.navyCard, borderRadius:"16px 16px 0 0", flexShrink:0,
          position:"sticky", top:0, zIndex:10 }}>
          <button onClick={onClose} style={{ position:"absolute", top:12, right:14,
            background:"none", border:"none", color:C.muted, fontSize:17, cursor:"pointer" }}>✕</button>
          <button onClick={() => setStep(0)} style={{ background:"none", border:"none",
            color:C.muted, fontSize:12, cursor:"pointer", marginBottom:4 }}>← Change role</button>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:24 }}>{ROLE_OPTIONS.find(r => r.value===role)?.icon}</div>
            <div>
              <h2 style={{ fontSize:17, fontWeight:800, color:C.white, lineHeight:1.2 }}>
                Register as {ROLE_OPTIONS.find(r => r.value===role)?.label}
              </h2>
              {(role==="teacher"||role==="school_admin") && (
                <div style={{ fontSize:11, color:C.gold, marginTop:2 }}>
                  ⏳ Requires admin approval before you can log in
                </div>
              )}
              {(role==="student"||role==="parent") && (
                <div style={{ fontSize:11, color:C.green, marginTop:2 }}>
                  ✅ Instant approval — you can log in right away
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY:"auto", padding:"16px 22px 22px", flex:1 }}>

          {/* ── Common fields ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <Field label="Full Name" value={f.fullName} onChange={set("fullName")}
                placeholder="Amina Hassan" required error={errors.fullName} />
            </div>
            <Field label="Phone Number" value={f.phone} onChange={set("phone")}
              placeholder="0712 345 678" error={errors.phone} />
            <Field label="Email (optional)" type="email" value={f.email} onChange={set("email")}
              placeholder="amina@email.com" />
            <SelectField label="Gender" value={f.gender} onChange={set("gender")}
              options={[{value:"male",label:"Male"},{value:"female",label:"Female"}]}
              placeholder="Select…" />
            <Field label="Date of Birth" type="date" value={f.dob} onChange={set("dob")} />
            <div style={{ gridColumn:"1/-1" }}>
              <SelectField label="Region" value={f.region} onChange={set("region")}
                options={REGIONS.map(r => ({value:r,label:r}))} required
                placeholder="Select region…" error={errors.region} />
            </div>
          </div>

          <div style={{ height:1, background:C.border, margin:"8px 0 14px" }} />

          {/* ── STUDENT-specific fields ── */}
          {role === "student" && (
            <>
              <p style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase",
                letterSpacing:"0.6px", marginBottom:10 }}>Education Details</p>
              <div style={{ marginBottom:12 }}>
                {lbl("Education Level", true)}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {LEVELS.map(lv => (
                    <div key={lv} onClick={() => set("level")(lv)}
                      style={{ padding:"9px 13px", borderRadius:9, cursor:"pointer",
                        border:`1px solid ${f.level===lv ? C.indigo : C.border}`,
                        background: f.level===lv ? `${C.indigo}22` : "transparent",
                        color: f.level===lv ? C.indigoL : C.white,
                        fontWeight: f.level===lv ? 700 : 400, fontSize:13 }}>
                      {lv}
                    </div>
                  ))}
                </div>
                {errors.level && <p style={{ color:C.error, fontSize:11, marginTop:4 }}>⚠ {errors.level}</p>}
              </div>
              {f.level === "Form 6" && (
                <div style={{ marginBottom:12 }}>
                  {lbl("Combination", true)}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {COMBOS.map(c => (
                      <div key={c} onClick={() => set("combination")(c)}
                        style={{ padding:"5px 13px", borderRadius:99, cursor:"pointer", fontSize:12,
                          border:`1px solid ${f.combination===c ? C.gold : C.border}`,
                          background: f.combination===c ? `${C.gold}22` : "transparent",
                          color: f.combination===c ? C.gold : C.muted, fontWeight:600 }}>
                        {c}
                      </div>
                    ))}
                  </div>
                  {errors.combination && <p style={{ color:C.error, fontSize:11, marginTop:4 }}>⚠ {errors.combination}</p>}
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
                <Field label="Class (optional)" value={f.className} onChange={set("className")}
                  placeholder="e.g. Form 4A" />
                <Field label="Admission No. (optional)" value={f.admNo} onChange={set("admNo")}
                  placeholder="e.g. 2024/001" />
              </div>
            </>
          )}

          {/* ── PARENT-specific fields ── */}
          {role === "parent" && (
            <>
              <p style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase",
                letterSpacing:"0.6px", marginBottom:10 }}>Child's Details</p>
              <Field label="Child's Full Name" value={f.childName} onChange={set("childName")}
                placeholder="e.g. John Hassan" required error={errors.childName} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
                <Field label="Child's School (optional)" value={f.childSchool} onChange={set("childSchool")}
                  placeholder="School name" />
                <Field label="Child's Class (optional)" value={f.childClass} onChange={set("childClass")}
                  placeholder="e.g. Form 4A" />
              </div>
              <Field label="Child's Admission No. (optional)" value={f.childAdmNo} onChange={set("childAdmNo")}
                placeholder="e.g. 2024/001" />
            </>
          )}

          {/* ── TEACHER-specific fields ── */}
          {role === "teacher" && (
            <>
              <p style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase",
                letterSpacing:"0.6px", marginBottom:10 }}>Professional Details</p>
              <SelectField label="School" value={f.teacherSchoolId} onChange={set("teacherSchoolId")}
                options={schools.map(s => ({value:s.id, label:`${s.name} (${s.region})`}))}
                required placeholder="Select your school…" error={errors.teacherSchoolId} />
              <SelectField label="Qualification" value={f.qualification} onChange={set("qualification")}
                options={QUAL.map(q => ({value:q,label:q}))} required
                placeholder="Select qualification…" error={errors.qualification} />
              <Field label="Employee ID (optional)" value={f.employeeId} onChange={set("employeeId")}
                placeholder="e.g. TSC/2024/001" />
              <div style={{ marginBottom:12 }}>
                {lbl("Subjects You Teach", true)}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {SUBJECTS.map(s => (
                    <div key={s} onClick={() => toggleSubject(s)}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
                        borderRadius:8, cursor:"pointer", fontSize:12,
                        border:`1px solid ${f.subjects.includes(s) ? C.teal : C.border}`,
                        background: f.subjects.includes(s) ? `${C.teal}18` : "transparent",
                        color: f.subjects.includes(s) ? C.teal : C.muted }}>
                      <span style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${f.subjects.includes(s)?C.teal:C.muted}`,
                        background:f.subjects.includes(s)?C.teal:"transparent", display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", flexShrink:0 }}>
                        {f.subjects.includes(s) ? "✓" : ""}
                      </span>
                      {s}
                    </div>
                  ))}
                </div>
                {errors.subjects && <p style={{ color:C.error, fontSize:11, marginTop:4 }}>⚠ {errors.subjects}</p>}
              </div>
              <div style={{ padding:"10px 14px", borderRadius:9, background:`${C.gold}12`,
                border:`1px solid ${C.gold}30`, fontSize:12, color:C.gold, marginBottom:12 }}>
                ⏳ Your application will be reviewed by your school admin. You'll be notified by notification once approved.
              </div>
            </>
          )}

          {/* ── SCHOOL ADMIN-specific fields ── */}
          {role === "school_admin" && (
            <>
              <p style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase",
                letterSpacing:"0.6px", marginBottom:10 }}>School Details</p>
              <Field label="School Name" value={f.schoolName} onChange={set("schoolName")}
                placeholder="Mwl. Nyerere Secondary School" required error={errors.schoolName} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
                <Field label="Registration Number (optional)" value={f.schoolReg} onChange={set("schoolReg")}
                  placeholder="e.g. S.1234/2001" />
                <SelectField label="School Type" value={f.schoolType} onChange={set("schoolType")}
                  options={[{value:"government",label:"Government"},{value:"private",label:"Private"}]}
                  required placeholder="Select…" error={errors.schoolType} />
                <SelectField label="School Region" value={f.schoolRegion} onChange={set("schoolRegion")}
                  options={REGIONS.map(r => ({value:r,label:r}))} required
                  placeholder="Select region…" error={errors.schoolRegion} />
                <Field label="District (optional)" value={f.district} onChange={set("district")}
                  placeholder="e.g. Kinondoni" />
              </div>
              <div style={{ padding:"10px 14px", borderRadius:9, background:`${C.gold}12`,
                border:`1px solid ${C.gold}30`, fontSize:12, color:C.gold, marginBottom:12 }}>
                ⏳ Your school registration will be reviewed by ExamHub Super Admin. You'll be notified once approved.
              </div>
            </>
          )}

          {/* ── Password ── */}
          <div style={{ height:1, background:C.border, margin:"4px 0 14px" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
            <Field label="Password" type="password" value={f.password} onChange={set("password")}
              placeholder="Min 6 characters" required error={errors.password} />
            <Field label="Confirm Password" type="password" value={f.confirmPw} onChange={set("confirmPw")}
              placeholder="Repeat password" required error={errors.confirmPw} />
          </div>

          {errors.submit && (
            <div style={{ background:`${C.error}18`, border:`1px solid ${C.error}44`,
              borderRadius:9, padding:"10px 14px", marginBottom:12, fontSize:13, color:C.error }}>
              ⚠️ {errors.submit}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <Btn variant="ghost" onClick={() => setStep(0)} style={{ flex:1, justifyContent:"center" }}>← Back</Btn>
            <Btn variant={role==="student"||role==="parent" ? "gold" : "primary"}
              onClick={submit} disabled={loading}
              style={{ flex:2, justifyContent:"center", color: (role==="student"||role==="parent") ? C.navy : "#fff" }}>
              {loading ? "Please wait…" :
               role==="student"||role==="parent" ? "Create Account 🎉" : "Submit Application →"}
            </Btn>
          </div>

          <p style={{ textAlign:"center", marginTop:12, fontSize:12, color:C.muted }}>
            Already have an account?{" "}
            <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={onSwitch}>Log in</span>
          </p>
        </div>
      </div>
    </div>
  );

  /* ── STEP 2: Done ──────────────────────────────────── */
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(10,22,40,0.9)", backdropFilter:"blur(10px)", padding:20 }}>
      <div style={{ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:16,
        width:"100%", maxWidth:420, padding:"32px 28px", textAlign:"center" }}>

        <div style={{ fontSize:56, marginBottom:14 }}>
          {approved ? "🎉" : "⏳"}
        </div>

        <h2 style={{ fontSize:22, fontWeight:900, color:C.white, marginBottom:10 }}>
          {approved ? `Welcome, ${f.fullName.split(" ")[0]}!` : "Application Submitted!"}
        </h2>

        <p style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:20 }}>
          {approved
            ? "Your account is ready. Start practising past papers now!"
            : role === "teacher"
              ? `Your teacher application has been sent to your school admin for review. You'll receive a notification once approved.`
              : `Your school registration has been submitted to ExamHub Super Admin. We'll review and activate your account within 24 hours.`
          }
        </p>

        {/* Summary box */}
        <div style={{ background:`${C.indigo}12`, border:`1px solid ${C.indigo}33`,
          borderRadius:10, padding:"13px 16px", marginBottom:20, textAlign:"left" }}>
          <div style={{ fontWeight:700, fontSize:13, color:C.white }}>{f.fullName}</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
            {ROLE_OPTIONS.find(r => r.value===role)?.label}
            {role==="student" && f.level && ` · ${f.level}${f.combination ? ` (${f.combination})` : ""}`}
            {role==="teacher" && f.subjects.length > 0 && ` · ${f.subjects.slice(0,2).join(", ")}${f.subjects.length>2?` +${f.subjects.length-2}`:""}`}
            {role==="school_admin" && f.schoolName && ` · ${f.schoolName}`}
          </div>
        </div>

        {approved ? (
          <Btn variant="gold" onClick={() => { window.location.href = "/dashboard"; }}
            style={{ width:"100%", justifyContent:"center", color:C.navy, fontSize:15 }}>
            Go to Dashboard →
          </Btn>
        ) : (
          <Btn variant="ghost" onClick={onClose}
            style={{ width:"100%", justifyContent:"center" }}>
            Close
          </Btn>
        )}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   HERO  /  LANDING PAGE
────────────────────────────────────────────────────────────── */
const Navbar = ({ onLogin, onRegister }) => {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const h = () => setSc(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between",
      background: sc ? "rgba(10,22,40,0.96)" : "transparent",
      backdropFilter: sc ? "blur(16px)" : "none",
      borderBottom: sc ? `1px solid ${C.border}` : "none", transition:"all 0.3s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:9,
          background:`linear-gradient(135deg,${C.indigo},${C.gold})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, fontSize:17, color:"#fff" }}>E</div>
        <span style={{ fontWeight:800, fontSize:17, color:C.white }}>
          ExamHub <span style={{ color:C.gold }}>Tanzania</span>
        </span>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Btn variant="ghost" onClick={onLogin} style={{ padding:"8px 16px", fontSize:13 }}>Log in</Btn>
        <Btn variant="gold"  onClick={onRegister} style={{ padding:"8px 16px", fontSize:13, color:C.navy }}>Register</Btn>
      </div>
    </nav>
  );
};

const Hero = ({ onRegister }) => (
  <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", textAlign:"center",
    padding:"90px 24px 60px",
    background:`radial-gradient(ellipse 80% 60% at 50% 0%,${C.indigo}22 0%,transparent 70%)` }}>
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:22,
      padding:"5px 14px", borderRadius:99, background:`${C.indigo}22`,
      border:`1px solid ${C.indigo}55`, fontSize:12, color:C.indigoL, fontWeight:500 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, display:"inline-block" }}/>
      Tanzania's #1 Exam Preparation Platform
    </div>
    <h1 style={{ fontSize:"clamp(32px,5.5vw,68px)", fontWeight:900, lineHeight:1.06,
      letterSpacing:"-2px", marginBottom:18, maxWidth:780, color:C.white }}>
      Pass Your NECTA Exams{" "}
      <span style={{ background:`linear-gradient(135deg,${C.gold},${C.indigo})`,
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        With Confidence
      </span>
    </h1>
    <p style={{ color:C.muted, fontSize:"clamp(15px,1.8vw,18px)", maxWidth:520,
      lineHeight:1.75, marginBottom:36 }}>
      Practice real past papers from Standard 4 to Form 6. Get marked instantly,
      understand every mistake, and track your progress.
    </p>
    <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
      <Btn variant="gold" onClick={onRegister} style={{ fontSize:15, padding:"13px 30px", color:C.navy }}>
        Start Free →
      </Btn>
      <Btn variant="ghost" style={{ fontSize:15, padding:"13px 30px" }}>
        View Leaderboard
      </Btn>
    </div>
  </section>
);

const Stats = () => (
  <div style={{ padding:"28px 24px", borderTop:`1px solid ${C.border}`,
    borderBottom:`1px solid ${C.border}`, display:"flex",
    justifyContent:"center", gap:"clamp(20px,6vw,72px)", flexWrap:"wrap",
    background:"rgba(15,31,61,0.5)" }}>
    {[
      {value:"52,000+",label:"Students"},
      {value:"2,400+", label:"Past Papers"},
      {value:"84%",    label:"Pass Rate"},
      {value:"Form 1–6",label:"All Levels"},
    ].map(s => (
      <div key={s.label} style={{ textAlign:"center" }}>
        <div style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:900, color:C.gold }}>{s.value}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{s.label}</div>
      </div>
    ))}
  </div>
);

/* ──────────────────────────────────────────────────────────────
   APP ROOT
────────────────────────────────────────────────────────────── */
export default function LandingAuth() {
  const [modal, setModal] = useState(null);
  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:C.navy,
      color:C.white, minHeight:"100vh" }}>
      <Navbar onLogin={() => setModal("login")} onRegister={() => setModal("register")} />
      <Hero onRegister={() => setModal("register")} />
      <Stats />

      <section style={{ padding:"60px 24px", textAlign:"center",
        background:`linear-gradient(135deg,${C.indigo}33,${C.navy})` }}>
        <h2 style={{ fontSize:"clamp(22px,3.5vw,38px)", fontWeight:900, color:C.white, marginBottom:12 }}>
          Ready to ace your exams?
        </h2>
        <p style={{ color:C.muted, fontSize:14, marginBottom:24, maxWidth:440, margin:"0 auto 24px" }}>
          Join 52,000+ Tanzanian students preparing smarter with ExamHub.
        </p>
        <Btn variant="gold" onClick={() => setModal("register")}
          style={{ fontSize:15, padding:"14px 36px", color:C.navy }}>
          Create Free Account →
        </Btn>
      </section>

      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"28px 24px", textAlign:"center" }}>
        <p style={{ color:C.muted, fontSize:12 }}>
          © 2025 ExamHub Tanzania — Empowering Tanzanian Students
        </p>
      </footer>

      {modal === "login"    && <LoginModal    onClose={() => setModal(null)} onSwitch={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onSwitch={() => setModal("login")} />}
    </div>
  );
}
