import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const SUBJ_META={Mathematics:{icon:"📐",color:"#4F46E5"},English:{icon:"📖",color:"#14B8A6"},Kiswahili:{icon:"🗣️",color:"#10B981"},Biology:{icon:"🧬",color:"#10B981"},Chemistry:{icon:"⚗️",color:"#EF4444"},Physics:{icon:"⚡",color:"#F59E0B"},Geography:{icon:"🗺️",color:"#14B8A6"},History:{icon:"📜",color:"#8B5CF6"},Civics:{icon:"🏛️",color:"#EC4899"},Commerce:{icon:"💼",color:"#F59E0B"},"Book Keeping":{icon:"📒",color:"#6366F1"},Agriculture:{icon:"🌾",color:"#10B981"},ICT:{icon:"💻",color:"#4F46E5"},"General Studies":{icon:"🎓",color:"#8B5CF6"},Science:{icon:"🔬",color:"#8B5CF6"},"Social Studies":{icon:"🌍",color:"#F59E0B"}};
const LEVELS=["All","Standard 4","Standard 7","Form 2","Form 4","Form 6"];
const TYPES=["All","NECTA","Mock Exam","Pre-National","Regional","District","School Exam"];
const DIFFICULTIES=["All","Easy","Medium","Hard"];

export default function PapersBrowser(){
  const [exams,    setExams]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [level,    setLevel]    = useState("All");
  const [type,     setType]     = useState("All");
  const [diff,     setDiff]     = useState("All");
  const [subject,  setSubject]  = useState("All");
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(()=>{
    const {data:{subscription}}=supabase.auth.onAuthStateChange((e,s)=>{
      if(!s)window.location.href="/";
    });
    loadExams();
    return()=>subscription.unsubscribe();
  },[]);

  const loadExams=async()=>{
    setLoading(true);
    let q=supabase.from("exams").select("*").eq("status","active").order("year",{ascending:false}).limit(200);
    const {data,error}=await q;
    if(!error&&data){
      setExams(data);
      const subjs=[...new Set(data.map(e=>e.subject_name))].sort();
      setSubjects(subjs);
    }
    setLoading(false);
  };

  const filtered=exams.filter(e=>{
    const lv=e.level?.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
    if(level!=="All"&&lv!==level)return false;
    if(type!=="All"&&e.type?.toLowerCase()!==type.toLowerCase().replace(" ","_"))return false;
    if(diff!=="All"&&e.difficulty?.toLowerCase()!==diff.toLowerCase())return false;
    if(subject!=="All"&&e.subject_name!==subject)return false;
    if(search&&!e.title?.toLowerCase().includes(search.toLowerCase())&&!e.subject_name?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const startExam=async(exam)=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/";return;}
    // Store exam context in sessionStorage and navigate
    sessionStorage.setItem("current_exam",JSON.stringify({id:exam.id,title:exam.title,subject:exam.subject_name,level:exam.level,year:exam.year,duration:exam.duration_mins,totalMarks:exam.total_marks}));
    window.location.href="/exam";
  };

  const meta=s=>SUBJ_META[s]||{icon:"📚",color:C.indigo};
  const diffColor=d=>({easy:C.green,medium:C.gold,hard:C.error}[d]||C.muted);

  const sel={...card({padding:"24px 26px",marginBottom:20,borderColor:C.indigoL+"44"})};
  const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:14,...e});

  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      {/* Simple sidebar */}
      <div style={{width:220,minHeight:"100vh",background:C.navyMid,borderRight:`1px solid ${C.border}`,padding:"20px 0",flexShrink:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"0 16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff"}}>E</div>
          <div><div style={{fontWeight:800,fontSize:13,color:C.white}}>ExamHub</div><div style={{fontSize:10,color:C.gold,fontWeight:600}}>Tanzania</div></div>
        </div>
        <nav style={{padding:"10px 9px",flex:1}}>
          {[["🏠","Dashboard","/dashboard"],["📝","Past Papers","/papers"],["📊","Analytics","/analytics"],["🎮","Activities","/activities"],["🌐","Online Exam","/online-exam"],["🏆","Leaderboard","/leaderboard"]].map(([i,l,h])=>(
            <a key={l} href={h} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:9,marginBottom:2,background:h==="/papers"?`${C.indigo}22`:"transparent",border:h==="/papers"?`1px solid ${C.indigo}44`:"1px solid transparent",color:h==="/papers"?C.indigoL:C.muted,textDecoration:"none",fontSize:12,fontWeight:h==="/papers"?700:400}}>{i} {l}</a>
          ))}
        </nav>
      </div>

      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`,background:C.navy,position:"sticky",top:0,zIndex:10}}>
          <div style={{fontSize:20,fontWeight:800,color:C.white}}>Past Papers Library</div>
          <div style={{fontSize:13,color:C.muted,marginTop:2}}>{loading?"Loading…":`${filtered.length} papers found`}</div>
        </div>

        <main style={{flex:1,padding:20,overflowY:"auto"}}>
          {/* Filters */}
          <div style={{...card({padding:"16px 18px"}),marginBottom:18,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative",flex:1,minWidth:200}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subject, title, year…"
                style={{width:"100%",padding:"9px 14px 9px 36px",borderRadius:9,background:"rgba(15,31,61,0.9)",border:`1px solid ${C.border}`,color:C.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
            {[[level,setLevel,LEVELS,"Level"],[type,setType,TYPES,"Type"],[diff,setDiff,DIFFICULTIES,"Difficulty"]].map(([val,set,opts,ph],i)=>(
              <select key={i} value={val} onChange={e=>set(e.target.value)}
                style={{padding:"9px 28px 9px 12px",borderRadius:9,background:"rgba(15,31,61,0.9)",border:`1px solid ${C.border}`,color:val==="All"?C.muted:C.white,fontSize:12,outline:"none",cursor:"pointer",appearance:"none"}}>
                {opts.map(o=><option key={o} value={o}>{o==="All"?`All ${ph}s`:o}</option>)}
              </select>
            ))}
            <select value={subject} onChange={e=>setSubject(e.target.value)}
              style={{padding:"9px 28px 9px 12px",borderRadius:9,background:"rgba(15,31,61,0.9)",border:`1px solid ${C.border}`,color:subject==="All"?C.muted:C.white,fontSize:12,outline:"none",cursor:"pointer",appearance:"none"}}>
              <option value="All">All Subjects</option>
              {subjects.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          {loading?(
            <div style={{display:"flex",justifyContent:"center",padding:60}}>
              <div style={{width:28,height:28,border:`3px solid ${C.border}`,borderTopColor:C.indigo,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
              <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </div>
          ):filtered.length===0?(
            <div style={{textAlign:"center",padding:"60px 24px",color:C.muted}}>
              <div style={{fontSize:48,marginBottom:14}}>📭</div>
              <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:6}}>No papers found</div>
              <div style={{fontSize:13}}>Try different filters or search terms</div>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {filtered.map(ex=>{
                const m=meta(ex.subject_name);
                const dc=diffColor(ex.difficulty);
                return(
                  <div key={ex.id} style={{...card({padding:"18px 18px"}),cursor:"pointer",transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.indigo}66`;e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                      <div style={{width:42,height:42,borderRadius:11,background:m.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{m.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:2}}>{ex.subject_name}</div>
                        <div style={{fontSize:11,color:C.muted}}>{ex.year} · {ex.paper_number>1?`Paper ${ex.paper_number}`:"Paper 1"}</div>
                      </div>
                      <span style={{padding:"3px 9px",borderRadius:99,fontSize:10,fontWeight:600,background:dc+"22",color:dc,flexShrink:0}}>{ex.difficulty||"Medium"}</span>
                    </div>
                    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                      {[ex.type?.replace("_"," ").toUpperCase(),ex.level?.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase()),`${ex.duration_mins||120} mins`,`${ex.total_questions||40} Qs`].filter(Boolean).map((tag,i)=>(
                        <span key={i} style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,background:C.border,color:C.muted}}>{tag}</span>
                      ))}
                    </div>
                    {ex.attempts>0&&(
                      <div style={{fontSize:11,color:C.muted,marginBottom:12}}>
                        {ex.attempts} attempts · Avg {Math.round(ex.avg_score||0)}%
                      </div>
                    )}
                    <button onClick={()=>startExam(ex)} style={{width:"100%",padding:"9px 0",borderRadius:9,background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`,border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      Start Exam →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
