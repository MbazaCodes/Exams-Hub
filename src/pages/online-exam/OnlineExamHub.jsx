import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, subscribeToTable, subscribeToExamSession, subscribeToLeaderboard } from "../../lib/supabase";

const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",goldL:"#FCD34D",teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const px=v=>`${v}px`;
const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(14),...e});
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

// ── MOCK DATA (replace with real Supabase queries) ──────────────────────
const MOCK_EXAM = {
  id:"exam-001",title:"National Biology Challenge 2024",subject:"Biology",level:"Form 4",
  duration_minutes:60,join_code:"BIO2024",status:"live",max_participants:500,
  scheduled_at:"2024-11-25T10:00:00Z",started_at:"2024-11-25T10:00:00Z",
  questions:[
    {id:1,type:"mcq",marks:2,text:"Which organelle produces ATP in eukaryotic cells?",options:["Ribosome","Mitochondria","Golgi apparatus","Endoplasmic reticulum"],correct:1,topic:"Cell Biology"},
    {id:2,type:"mcq",marks:2,text:"The primary function of the lymphatic system is:",options:["Blood filtration","Hormone secretion","Return excess fluid to blood","Oxygen transport"],correct:2,topic:"Physiology"},
    {id:3,type:"truefalse",marks:1,text:"Osmosis moves solute from high to low concentration.",correct:false,topic:"Cell Transport"},
    {id:4,type:"mcq",marks:2,text:"Which is NOT a function of the liver?",options:["Detoxification","Bile production","Insulin secretion","Glycogen storage"],correct:2,topic:"Physiology"},
    {id:5,type:"mcq",marks:2,text:"HIV/AIDS destroys which white blood cells?",options:["Neutrophils","B-lymphocytes","T-helper cells (CD4+)","Eosinophils"],correct:2,topic:"Immunity"},
    {id:6,type:"truefalse",marks:1,text:"Photosynthesis occurs in the mitochondria of plant cells.",correct:false,topic:"Photosynthesis"},
    {id:7,type:"mcq",marks:2,text:"During meiosis II, chromosome number:",options:["Doubles","Remains the same","Halves","Quadruples"],correct:1,topic:"Cell Division"},
    {id:8,type:"mcq",marks:2,text:"Homeostasis refers to:",options:["Metabolism","Stable internal environment","Respiration","Excretion"],correct:1,topic:"Homeostasis"},
    {id:9,type:"mcq",marks:2,text:"Photosynthesis occurs in the:",options:["Nucleus","Mitochondria","Chloroplast","Ribosome"],correct:2,topic:"Photosynthesis"},
    {id:10,type:"mcq",marks:2,text:"The process of natural selection was proposed by:",options:["Mendel","Darwin","Lamarck","Watson"],correct:1,topic:"Evolution"},
  ],
};

const MOCK_PARTICIPANTS = [
  {id:"p1",student_name:"Amina Hassan",    school:"Mwl. Nyerere SS",    region:"Dar es Salaam",status:"submitted",score:17,percentage:85,rank:1,joined_at:"10:02",submitted_at:"10:41"},
  {id:"p2",student_name:"Grace Nyamu",     school:"Kilimanjaro Girls HS",region:"Kilimanjaro",  status:"submitted",score:16,percentage:80,rank:2,joined_at:"10:01",submitted_at:"10:45"},
  {id:"p3",student_name:"David Kimani",    school:"Arusha International",region:"Arusha",       status:"submitted",score:15,percentage:75,rank:3,joined_at:"10:03",submitted_at:"10:55"},
  {id:"p4",student_name:"Fatuma Ally",     school:"Zanzibar Academy",    region:"Zanzibar",     status:"in_progress",score:null,percentage:null,rank:null,joined_at:"10:04",submitted_at:null},
  {id:"p5",student_name:"Joseph Mwenda",   school:"Dodoma National SS",  region:"Dodoma",       status:"in_progress",score:null,percentage:null,rank:null,joined_at:"10:05",submitted_at:null},
  {id:"p6",student_name:"Rehema Juma",     school:"Mbeya Girls HS",      region:"Mbeya",        status:"in_progress",score:null,percentage:null,rank:null,joined_at:"10:06",submitted_at:null},
  {id:"p7",student_name:"Peter Masanja",   school:"Tabora SS",           region:"Tabora",       status:"joined",score:null,percentage:null,rank:null,joined_at:"10:07",submitted_at:null},
  {id:"p8",student_name:"Hassan Omar",     school:"Mwanza Academy",      region:"Mwanza",       status:"joined",score:null,percentage:null,rank:null,joined_at:"10:08",submitted_at:null},
];

// ── VIEW: JOIN PAGE ─────────────────────────────────────────────────────
const JoinPage=({onJoin})=>{
  const[code,setCode]=useState("");
  const[name,setName]=useState("");
  const[school,setSchool]=useState("");
  const[region,setRegion]=useState("");
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const REGIONS=["Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya","Morogoro","Tanga","Kilimanjaro","Kagera","Mara","Shinyanga","Tabora","Singida","Iringa","Ruvuma","Lindi","Mtwara","Pwani","Rukwa","Kigoma","Zanzibar"];

  const handleJoin=async()=>{
    if(!code||!name||!school||!region){setErr("Please fill in all fields.");return;}
    setLoading(true);setErr("");
    // In production: verify join code against Supabase online_exams table
    // const {data,error} = await supabase.from("online_exams").select("*").eq("join_code",code.toUpperCase()).eq("status","live").single();
    await new Promise(r=>setTimeout(r,1200));
    if(code.toUpperCase()==="BIO2024"){
      onJoin({name,school,region,exam:MOCK_EXAM});
    } else {
      setErr("Invalid or expired join code. Check with your teacher.");
    }
    setLoading(false);
  };

  const inp={width:"100%",padding:"12px 16px",borderRadius:10,background:"rgba(15,31,61,0.9)",border:`1px solid ${C.border}`,color:C.white,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};

  return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:24}}>
      {/* BG glows */}
      <div style={{position:"fixed",top:"10%",left:"5%",width:400,height:400,borderRadius:"50%",background:`${C.indigo}12`,filter:"blur(100px)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"15%",right:"5%",width:300,height:300,borderRadius:"50%",background:`${C.gold}10`,filter:"blur(80px)",pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:440}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:64,height:64,borderRadius:16,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#fff",margin:"0 auto 16px"}}>E</div>
          <h1 style={{fontSize:26,fontWeight:900,color:C.white,marginBottom:6,letterSpacing:"-0.5px"}}>Join Online Exam</h1>
          <p style={{color:C.muted,fontSize:14}}>Enter your code to join a live national exam</p>
        </div>

        <div style={{...card({padding:"28px 26px"})}}>
          {err&&<div style={{background:"#EF444418",border:"1px solid #EF444440",borderRadius:9,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.error}}>⚠️ {err}</div>}

          {/* Join code */}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>Exam Join Code *</label>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g. BIO2024" maxLength={10}
              style={{...inp,fontSize:20,fontWeight:800,letterSpacing:3,textAlign:"center",borderColor:code?C.indigo:C.border}}
              onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=code?C.indigo:C.border}/>
          </div>

          <div style={{height:1,background:C.border,margin:"16px 0"}}/>

          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>Full Name *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Amina Hassan" style={inp}
              onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>School Name *</label>
            <input value={school} onChange={e=>setSchool(e.target.value)} placeholder="Mwl. Nyerere Secondary School" style={inp}
              onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>Region *</label>
            <select value={region} onChange={e=>setRegion(e.target.value)}
              style={{...inp,cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",paddingRight:36}}
              onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}>
              <option value="">Select your region...</option>
              {REGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>

          <button onClick={handleJoin} disabled={loading} style={{width:"100%",padding:"14px 0",borderRadius:11,background:loading?"rgba(79,70,229,0.5)":`linear-gradient(135deg,${C.indigo},${C.indigoL})`,border:"none",color:"#fff",fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/> Joining...</>:"🚀 Join Exam Now"}
          </button>

          <p style={{textAlign:"center",marginTop:14,fontSize:12,color:C.muted}}>
            Don't have a code? Ask your teacher for the exam join code.
          </p>
        </div>

        {/* Demo hint */}
        <div style={{marginTop:16,padding:"12px 16px",borderRadius:10,background:`${C.gold}12`,border:`1px solid ${C.gold}30`,textAlign:"center"}}>
          <span style={{fontSize:12,color:C.gold}}>💡 Demo code: <strong>BIO2024</strong> — National Biology Challenge 2024</span>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ── VIEW: EXAM LOBBY ─────────────────────────────────────────────────────
const LobbyPage=({exam,student,participants,onExamStart})=>{
  const online=participants.length;
  const [countdown,setCountdown]=useState(null);

  useEffect(()=>{
    // Simulate teacher starting the exam in 10s for demo
    let t=10;
    setCountdown(t);
    const iv=setInterval(()=>{
      t--;
      setCountdown(t);
      if(t<=0){clearInterval(iv);onExamStart();}
    },1000);
    return()=>clearInterval(iv);
  },[]);

  return(
    <div style={{minHeight:"100vh",background:C.navy,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,color:C.white}}>
      <div style={{width:"100%",maxWidth:640}}>
        {/* Exam info */}
        <div style={{...card({padding:"24px 26px",marginBottom:20,borderColor:C.green+"44",background:C.green+"08"})}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:C.green,boxShadow:`0 0 0 4px ${C.green}30`,animation:"ping 1.5s ease infinite"}}/>
            <span style={{fontSize:12,color:C.green,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Exam is Live — Waiting to Start</span>
          </div>
          <h1 style={{fontSize:22,fontWeight:900,color:C.white,marginBottom:4}}>{exam.title}</h1>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:C.muted}}>
            <span>📚 {exam.subject}</span>
            <span>🎓 {exam.level}</span>
            <span>⏱️ {exam.duration_minutes} minutes</span>
            <span>🔑 Code: <strong style={{color:C.gold}}>{exam.join_code}</strong></span>
          </div>
        </div>

        {/* Your info */}
        <div style={{...card({padding:"16px 20px",marginBottom:20})}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>Your Details</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13}}>
            <span style={{color:C.white}}>👤 {student.name}</span>
            <span style={{color:C.muted}}>🏫 {student.school}</span>
            <span style={{color:C.muted}}>📍 {student.region}</span>
          </div>
        </div>

        {/* Countdown */}
        {countdown!==null&&(
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Exam starts in</div>
            <div style={{fontSize:72,fontWeight:900,color:countdown<=3?C.error:C.gold,lineHeight:1,textShadow:`0 0 30px ${countdown<=3?C.error:C.gold}66`}}>{countdown}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:8}}>Get ready — do not leave this page</div>
          </div>
        )}

        {/* Live participants */}
        <div style={{...card({padding:"20px 22px"})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:C.white}}>Students Online</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.green,animation:"ping 1.5s ease infinite"}}/>
              <span style={{fontSize:14,fontWeight:700,color:C.green}}>{online} joined</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,maxHeight:200,overflowY:"auto"}}>
            {participants.map((p,i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:p.student_name===student.name?`${C.indigo}22`:C.navyMid,borderRadius:9,border:`1px solid ${p.student_name===student.name?C.indigo:C.border}`}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>
                  {p.student_name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:p.student_name===student.name?C.indigoL:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.student_name.split(" ")[0]}{p.student_name===student.name?" (You)":""}</div>
                  <div style={{fontSize:9,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.region}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
};

// ── VIEW: LIVE EXAM ──────────────────────────────────────────────────────
const LiveExam=({exam,student,onSubmit})=>{
  const[cur,setCur]=useState(0);
  const[answers,setAnswers]=useState({});
  const[flagged,setFlagged]=useState(new Set());
  const[timeLeft,setTimeLeft]=useState(exam.duration_minutes*60);
  const[showConfirm,setShowConfirm]=useState(false);
  const timerRef=useRef(null);
  const qs=exam.questions;
  const q=qs[cur];
  const answered=Object.keys(answers).length;
  const pct=Math.round((answered/qs.length)*100);
  const urgent=timeLeft<300;
  const timeColor=timeLeft<300?C.error:timeLeft<600?C.gold:C.green;

  useEffect(()=>{
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);handleSubmit(true);return 0;}
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[]);

  const setAns=(id,val)=>setAnswers(p=>({...p,[id]:val}));
  const toggleFlag=id=>setFlagged(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});

  const handleSubmit=(auto=false)=>{
    clearInterval(timerRef.current);
    // Calculate score
    let score=0,total=0;
    qs.forEach(q=>{
      total+=q.marks;
      const a=answers[q.id];
      if(a!==undefined){
        if(q.type==="mcq"&&a===q.correct) score+=q.marks;
        else if(q.type==="truefalse"&&a===q.correct) score+=q.marks;
        else if(q.type==="short") score+=Math.round(q.marks*0.7); // assume partial
      }
    });
    onSubmit({answers,score,total,percentage:Math.round((score/total)*100),timeTaken:exam.duration_minutes*60-timeLeft});
  };

  return(
    <div style={{minHeight:"100vh",background:C.navy,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column",color:C.white}}>
      {/* Top bar */}
      <div style={{position:"sticky",top:0,zIndex:50,background:C.navyMid,borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontWeight:700,fontSize:13,color:C.white,flexShrink:0,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exam.title}</div>
        <div style={{flex:1,height:4,background:C.border,borderRadius:99}}>
          <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.indigo},${C.gold})`,borderRadius:99,transition:"width 0.3s"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:urgent?`${C.error}22`:C.navyCard,border:`1px solid ${urgent?C.error:C.border}`,flexShrink:0}}>
          <span style={{fontSize:14}}>⏱️</span>
          <span style={{fontFamily:"'Courier New',monospace",fontWeight:800,fontSize:16,color:timeColor,letterSpacing:2}}>{fmt(timeLeft)}</span>
        </div>
        <span style={{fontSize:12,color:C.muted,flexShrink:0}}>{answered}/{qs.length}</span>
        <button onClick={()=>setShowConfirm(true)} style={{padding:"7px 16px",borderRadius:8,background:C.green,border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0}}>Submit</button>
      </div>

      <div style={{display:"flex",flex:1,minHeight:0}}>
        {/* Question navigator */}
        <div style={{width:180,background:C.navyMid,borderRight:`1px solid ${C.border}`,padding:14,overflowY:"auto",flexShrink:0}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>Questions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
            {qs.map((q,i)=>{
              const ans=answers[q.id]!==undefined;
              const flag=flagged.has(q.id);
              const isCur=cur===i;
              return(
                <div key={i} onClick={()=>setCur(i)} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,border:`1px solid ${isCur?C.indigo:flag?C.gold:ans?C.green:C.border}`,background:isCur?C.indigo:flag?`${C.gold}22`:ans?`${C.green}22`:C.navyCard,color:isCur?"#fff":flag?C.gold:ans?C.green:C.muted,position:"relative"}}>
                  {i+1}
                  {flag&&<span style={{position:"absolute",top:-2,right:-2,fontSize:7}}>🚩</span>}
                </div>
              );
            })}
          </div>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:5,fontSize:10}}>
            {[{c:C.green,l:"Answered"},{c:C.gold,l:"Flagged"},{c:C.border,l:"Skipped"}].map(l=>(
              <div key={l.l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:9,height:9,borderRadius:2,background:l.c}}/><span style={{color:C.muted}}>{l.l}</span></div>
            ))}
          </div>
          {/* Live online count */}
          <div style={{marginTop:20,padding:"10px 12px",background:`${C.green}15`,borderRadius:9,border:`1px solid ${C.green}30`}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"ping 1.5s ease infinite"}}/>
              <span style={{fontSize:11,fontWeight:700,color:C.green}}>8 online</span>
            </div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>Taking exam now</div>
          </div>
        </div>

        {/* Question area */}
        <div style={{flex:1,padding:28,overflowY:"auto",maxWidth:720,margin:"0 auto",width:"100%"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <span style={{background:`${C.indigo}22`,color:C.indigoL,padding:"3px 11px",borderRadius:99,fontSize:11,fontWeight:600}}>Q{cur+1} / {qs.length}</span>
              <span style={{background:`${C.gold}18`,color:C.gold,padding:"3px 11px",borderRadius:99,fontSize:11,fontWeight:600}}>{q.marks} mark{q.marks>1?"s":""}</span>
              <span style={{background:`${C.teal}18`,color:C.teal,padding:"3px 9px",borderRadius:99,fontSize:10}}>{q.topic}</span>
            </div>
            <button onClick={()=>toggleFlag(q.id)} style={{padding:"5px 12px",borderRadius:8,background:flagged.has(q.id)?`${C.gold}22`:"transparent",border:`1px solid ${flagged.has(q.id)?C.gold:C.border}`,color:flagged.has(q.id)?C.gold:C.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>
              {flagged.has(q.id)?"🚩 Flagged":"🏳️ Flag"}
            </button>
          </div>

          {/* Question text */}
          <div style={{...card({padding:"22px 24px",marginBottom:20,background:C.navyMid})}}>
            <p style={{fontSize:16,lineHeight:1.75,color:C.white,fontWeight:500,margin:0}}>{q.text}</p>
          </div>

          {/* MCQ */}
          {q.type==="mcq"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {q.options.map((opt,i)=>{
                const sel=answers[q.id]===i;
                return(
                  <div key={i} onClick={()=>setAns(q.id,i)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:11,cursor:"pointer",border:`1px solid ${sel?C.indigo:C.border}`,background:sel?`${C.indigo}20`:C.navyMid,transition:"all 0.15s"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${sel?C.indigo:C.border}`,background:sel?C.indigo:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:700,color:sel?"#fff":C.muted,transition:"all 0.15s"}}>
                      {String.fromCharCode(65+i)}
                    </div>
                    <span style={{fontSize:15,color:sel?C.white:C.muted,fontWeight:sel?600:400}}>{opt}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* True/False */}
          {q.type==="truefalse"&&(
            <div style={{display:"flex",gap:12}}>
              {[true,false].map(v=>(
                <div key={String(v)} onClick={()=>setAns(q.id,v)} style={{flex:1,padding:"20px 0",borderRadius:12,textAlign:"center",cursor:"pointer",border:`1px solid ${answers[q.id]===v?(v?C.green:C.error):C.border}`,background:answers[q.id]===v?(v?`${C.green}20`:`${C.error}20`):C.navyMid,transition:"all 0.15s"}}>
                  <div style={{fontSize:30,marginBottom:8}}>{v?"✅":"❌"}</div>
                  <div style={{fontWeight:700,fontSize:15,color:answers[q.id]===v?(v?C.green:C.error):C.muted}}>{v?"TRUE":"FALSE"}</div>
                </div>
              ))}
            </div>
          )}

          {/* Short answer */}
          {q.type==="short"&&(
            <textarea value={answers[q.id]||""} onChange={e=>setAns(q.id,e.target.value)} placeholder="Write your answer here..." rows={5}
              style={{width:"100%",padding:"14px 16px",borderRadius:11,background:C.navyMid,border:`1px solid ${C.border}`,color:C.white,fontSize:14,lineHeight:1.7,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
          )}

          {/* Nav buttons */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
            <button onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0} style={{padding:"11px 22px",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:cur===0?C.border:C.white,fontWeight:600,fontSize:14,cursor:cur===0?"not-allowed":"pointer",opacity:cur===0?0.4:1}}>← Previous</button>
            <button onClick={()=>cur<qs.length-1?setCur(c=>c+1):setShowConfirm(true)} style={{padding:"11px 28px",borderRadius:10,background:cur<qs.length-1?C.indigo:C.green,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              {cur<qs.length-1?"Next →":"Submit Exam ✓"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm submit */}
      {showConfirm&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(10,22,40,0.92)",backdropFilter:"blur(10px)",padding:24}}>
          <div style={{...card({padding:"30px 28px",maxWidth:400,width:"100%"}),textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>📤</div>
            <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:8}}>Submit Exam?</h2>
            <p style={{color:C.muted,fontSize:13,marginBottom:8}}>You answered <strong style={{color:C.white}}>{answered}</strong> of <strong style={{color:C.white}}>{qs.length}</strong> questions.</p>
            {qs.length-answered>0&&<div style={{background:`${C.gold}12`,border:`1px solid ${C.gold}33`,borderRadius:9,padding:"9px 13px",marginBottom:16,fontSize:12,color:C.gold}}>⚠️ {qs.length-answered} unanswered questions will score zero.</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowConfirm(false)} style={{flex:1,padding:"11px 0",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontWeight:600,fontSize:14,cursor:"pointer"}}>Go Back</button>
              <button onClick={()=>handleSubmit(false)} style={{flex:2,padding:"11px 0",borderRadius:10,background:C.green,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Submit Now ✓</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
};

// ── VIEW: RESULTS + LIVE LEADERBOARD ─────────────────────────────────────
const ResultsPage=({exam,student,result,allParticipants})=>{
  const[liveBoard,setLiveBoard]=useState([...allParticipants,{id:"me",student_name:student.name,school:student.school,region:student.region,status:"submitted",score:result.score,percentage:result.percentage,rank:null,submitted_at:"Just now"}].sort((a,b)=>(b.percentage||0)-(a.percentage||0)).map((p,i)=>({...p,rank:i+1})));
  const[tab,setTab]=useState("results");

  // Simulate live updates
  useEffect(()=>{
    const iv=setInterval(()=>{
      setLiveBoard(prev=>{
        const updated=[...prev];
        const pending=updated.filter(p=>p.status==="in_progress");
        if(pending.length>0){
          const idx=updated.findIndex(p=>p.id===pending[Math.floor(Math.random()*pending.length)].id);
          if(idx>=0){
            updated[idx]={...updated[idx],status:"submitted",score:Math.floor(Math.random()*8)+10,percentage:Math.floor(Math.random()*30)+55};
            return updated.sort((a,b)=>(b.percentage||0)-(a.percentage||0)).map((p,i)=>({...p,rank:i+1}));
          }
        }
        return prev;
      });
    },3000);
    return()=>clearInterval(iv);
  },[]);

  const myRank=liveBoard.find(p=>p.student_name===student.name)?.rank;
  const grade=result.percentage>=75?"A":result.percentage>=65?"B":result.percentage>=50?"C":result.percentage>=30?"D":"F";
  const div=result.percentage>=75?"Division I":result.percentage>=65?"Division II":result.percentage>=50?"Division III":result.percentage>=30?"Division IV":"Division Zero";
  const divColor=result.percentage>=75?C.green:result.percentage>=65?C.gold:result.percentage>=50?C.teal:C.error;

  return(
    <div style={{minHeight:"100vh",background:C.navy,fontFamily:"'Inter',system-ui,sans-serif",color:C.white}}>
      {/* Header */}
      <div style={{background:C.navyMid,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontWeight:800,fontSize:16,color:C.white}}>{exam.title}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>Your results are in! 🎉</div>
        </div>
        <a href="/leaderboard" style={{padding:"8px 16px",borderRadius:9,background:`${C.gold}22`,border:`1px solid ${C.gold}44`,color:C.gold,fontWeight:600,fontSize:12,textDecoration:"none"}}>🏆 Public Leaderboard</a>
      </div>

      {/* Score hero */}
      <div style={{background:`linear-gradient(135deg,${C.indigo}33,${C.navy})`,padding:"36px 24px",textAlign:"center",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:68,fontWeight:900,lineHeight:1,marginBottom:8}}>{result.percentage}<span style={{fontSize:30}}>%</span></div>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <span style={{padding:"6px 18px",borderRadius:99,background:`${C.gold}22`,color:C.gold,fontWeight:700,fontSize:15,border:`1px solid ${C.gold}44`}}>Grade {grade}</span>
          <span style={{padding:"6px 18px",borderRadius:99,background:divColor+"22",color:divColor,fontWeight:700,fontSize:15,border:`1px solid ${divColor}44`}}>{div}</span>
          {myRank&&<span style={{padding:"6px 18px",borderRadius:99,background:`${C.purple}22`,color:C.purple,fontWeight:700,fontSize:15,border:`1px solid ${C.purple}44`}}>#{myRank} of {liveBoard.length}</span>}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap"}}>
          {[{icon:"⭐",label:"Marks",val:`${result.score}/${result.total}`},{icon:"⏱️",label:"Time",val:`${Math.floor(result.timeTaken/60)}m ${result.timeTaken%60}s`},{icon:"✅",label:"Answered",val:`${Object.keys(result.answers).length}/${exam.questions.length}`}].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}><div style={{fontSize:20}}>{s.icon}</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{s.val}</div><div style={{fontSize:12,color:C.muted}}>{s.label}</div></div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.navyMid,padding:"0 24px"}}>
        {[["results","📊 My Results"],["leaderboard","🏆 Live Leaderboard"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"13px 22px",border:"none",borderBottom:`2px solid ${tab===k?C.indigo:"transparent"}`,background:"transparent",color:tab===k?C.indigoL:C.muted,fontWeight:tab===k?700:400,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>

      <div style={{padding:24,maxWidth:780,margin:"0 auto"}}>
        {tab==="results"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {exam.questions.map((q,i)=>{
              const ua=result.answers[q.id];
              const correct=q.type==="short"?true:(ua===q.correct);
              return(
                <div key={q.id} style={{...card({padding:"18px 20px",borderColor:correct?`${C.green}44`:`${C.error}44`,background:correct?`${C.green}08`:`${C.error}08`})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:14,color:C.white}}>Q{i+1}</span>
                      <span style={{padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:600,background:correct?`${C.green}22`:`${C.error}22`,color:correct?C.green:C.error}}>{correct?"✓ Correct":"✗ Wrong"}</span>
                      <span style={{fontSize:10,color:C.teal,background:`${C.teal}15`,padding:"2px 8px",borderRadius:99}}>{q.topic}</span>
                    </div>
                    <span style={{fontSize:12,color:C.muted}}>{q.marks} mark{q.marks>1?"s":""}</span>
                  </div>
                  <p style={{fontSize:14,color:C.white,lineHeight:1.6,marginBottom:10,fontWeight:500}}>{q.text}</p>
                  {q.type==="mcq"&&q.options.map((opt,oi)=>{
                    const isCo=oi===q.correct;const isUo=oi===ua;
                    return(<div key={oi} style={{padding:"8px 13px",borderRadius:8,border:`1px solid ${isCo?C.green:isUo?C.error:C.border}`,background:isCo?`${C.green}18`:isUo?`${C.error}12`:"transparent",fontSize:13,color:isCo?C.green:isUo?C.error:C.muted,marginBottom:5,display:"flex",justifyContent:"space-between"}}>
                      <span><strong>{String.fromCharCode(65+oi)}.</strong> {opt}</span>
                      {isCo&&<span>✓</span>}{isUo&&!isCo&&<span>← Your answer</span>}
                    </div>);
                  })}
                  {q.type==="truefalse"&&<div style={{fontSize:13,color:C.muted}}>Correct: <strong style={{color:C.green}}>{String(q.correct).toUpperCase()}</strong> · Your answer: <strong style={{color:ua===q.correct?C.green:C.error}}>{ua!==undefined?String(ua).toUpperCase():"Not answered"}</strong></div>}
                </div>
              );
            })}
          </div>
        )}

        {tab==="leaderboard"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:C.green,animation:"ping 1.5s ease infinite"}}/>
              <span style={{fontSize:13,color:C.green,fontWeight:600}}>Live — updating as students submit</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {liveBoard.map((p,i)=>{
                const isMe=p.student_name===student.name;
                const rankColor=i===0?C.gold:i===1?"#94A3B8":i===2?"#B45309":C.muted;
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:11,background:isMe?`${C.indigo}22`:C.navyCard,border:`1px solid ${isMe?C.indigo:C.border}`,transition:"all 0.4s"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:i<3?rankColor+"20":C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<3?16:13,fontWeight:800,color:i<3?rankColor:C.muted,flexShrink:0}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":p.rank}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:isMe?700:600,fontSize:13,color:isMe?C.indigoL:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {p.student_name}{isMe?" (You)":""}
                      </div>
                      <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.school} · {p.region}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {p.status==="submitted"?(
                        <>
                          <div style={{fontWeight:800,fontSize:18,color:p.percentage>=75?C.green:p.percentage>=50?C.gold:C.error}}>{p.percentage}%</div>
                          <div style={{fontSize:10,color:C.muted}}>Score: {p.score}/{exam.questions.reduce((a,q)=>a+q.marks,0)}</div>
                        </>
                      ):(
                        <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:p.status==="in_progress"?`${C.gold}22`:`${C.muted}15`,color:p.status==="in_progress"?C.gold:C.muted}}>
                          {p.status==="in_progress"?"✏️ In progress":"⏳ Waiting"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
};

// ── MAIN CONTROLLER ──────────────────────────────────────────────────────
export default function OnlineExamHub(){
  const[view,setView]=useState("join"); // join | lobby | exam | results
  const[student,setStudent]=useState(null);
  const[exam,setExam]=useState(null);
  const[result,setResult]=useState(null);
  const[participants,setParticipants]=useState(MOCK_PARTICIPANTS);

  // In production: subscribe to Supabase realtime here
  // useEffect(()=>{ const ch=subscribeToExamSession(exam?.id, payload=>{ ... }); return()=>supabase.removeChannel(ch); },[exam]);

  const handleJoin=({name,school,region,exam:e})=>{
    setStudent({name,school,region});
    setExam(e);
    // Add self to participants
    setParticipants(p=>[...p,{id:"me",student_name:name,school,region,status:"joined",score:null,percentage:null,rank:null,joined_at:new Date().toLocaleTimeString("en-TZ",{hour:"2-digit",minute:"2-digit"}),submitted_at:null}]);
    setView("lobby");
    // In production: await supabase.from("online_exam_participants").insert({...})
  };

  const handleSubmit=(res)=>{
    setResult(res);
    setView("results");
    // In production: await supabase.from("online_exam_participants").update({status:"submitted",score:res.score,...}).eq("id",myParticipantId)
  };

  if(view==="join")   return <JoinPage onJoin={handleJoin}/>;
  if(view==="lobby")  return <LobbyPage exam={exam} student={student} participants={participants} onExamStart={()=>setView("exam")}/>;
  if(view==="exam")   return <LiveExam exam={exam} student={student} onSubmit={handleSubmit}/>;
  if(view==="results")return <ResultsPage exam={exam} student={student} result={result} allParticipants={participants}/>;
  return null;
}
