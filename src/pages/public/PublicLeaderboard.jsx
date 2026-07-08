import { useState, useEffect } from "react";

const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",goldL:"#FCD34D",teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const px=v=>`${v}px`;
const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(14),...e});

const TOP_STUDENTS=[
  {rank:1,name:"Amina Hassan",    school:"Mwl. Nyerere SS",    region:"Dar es Salaam",subject:"Biology",score:94,grade:"A",exams:45,streak:28,badge:"🥇",xp:12400},
  {rank:2,name:"Grace Nyamu",     school:"Kilimanjaro Girls HS",region:"Kilimanjaro",  subject:"Biology",score:91,grade:"A",exams:42,streak:22,badge:"🥈",xp:11200},
  {rank:3,name:"David Kimani",    school:"Arusha International",region:"Arusha",       subject:"Physics",score:89,grade:"A",exams:38,streak:19,badge:"🥉",xp:10500},
  {rank:4,name:"Fatuma Ally",     school:"Zanzibar Academy",   region:"Zanzibar",      subject:"Mathematics",score:87,grade:"A",exams:40,streak:16,badge:"",xp:9800},
  {rank:5,name:"Joseph Mwenda",   school:"Dodoma National SS",  region:"Dodoma",       subject:"History",score:86,grade:"A",exams:36,streak:14,badge:"",xp:9200},
  {rank:6,name:"Rehema Juma",     school:"Mbeya Girls HS",      region:"Mbeya",        subject:"Chemistry",score:84,grade:"A",exams:34,streak:12,badge:"",xp:8700},
  {rank:7,name:"Peter Masanja",   school:"Tabora Secondary SS", region:"Tabora",       subject:"English",score:83,grade:"A",exams:32,streak:11,badge:"",xp:8300},
  {rank:8,name:"Hassan Omar",     school:"Mwanza Academy",      region:"Mwanza",       subject:"Biology",score:81,grade:"A",exams:30,streak:10,badge:"",xp:7900},
  {rank:9,name:"Neema Baraka",    school:"Tanga HS",            region:"Tanga",        subject:"Mathematics",score:80,grade:"A",exams:28,streak:9,badge:"",xp:7500},
  {rank:10,name:"Omar Salim",     school:"Lindi Coastal HS",    region:"Lindi",        subject:"Kiswahili",score:79,grade:"B",exams:26,streak:8,badge:"",xp:7100},
];

const TOP_SCHOOLS=[
  {rank:1,name:"Kilimanjaro Girls HS",region:"Kilimanjaro",avgScore:84,students:340,passRate:97,badge:"🥇"},
  {rank:2,name:"Arusha International",region:"Arusha",avgScore:82,students:410,passRate:96,badge:"🥈"},
  {rank:3,name:"Mwl. Nyerere SS",     region:"Dar es Salaam",avgScore:80,students:520,passRate:94,badge:"🥉"},
  {rank:4,name:"Zanzibar Academy",    region:"Zanzibar",avgScore:78,students:195,passRate:92,badge:""},
  {rank:5,name:"Dodoma National SS",  region:"Dodoma",avgScore:76,students:480,passRate:90,badge:""},
];

const HIGHLIGHTS=[
  {icon:"🔥",title:"Longest Streak",value:"28 Days",name:"Amina Hassan",school:"Mwl. Nyerere SS",color:C.gold},
  {icon:"⚡",title:"Most Exams Done",value:"45 Papers",name:"Amina Hassan",school:"Mwl. Nyerere SS",color:C.indigo},
  {icon:"🎯",title:"Highest Score",value:"94%",name:"Amina Hassan",school:"Mwl. Nyerere SS",color:C.green},
  {icon:"🚀",title:"Most Improved",value:"+22pts",name:"Joseph Mwenda",school:"Dodoma National SS",color:C.teal},
  {icon:"🏆",title:"Top School",value:"84% Avg",name:"Kilimanjaro Girls HS",school:"Kilimanjaro",color:C.purple},
  {icon:"📚",title:"Most Active Region",value:"Dar es Salaam",name:"1,240 students",school:"This week",color:C.pink},
];

const RECENT_EXAMS=[
  {title:"National Biology Challenge 2024",date:"Nov 25",participants:847,topScore:94,topStudent:"Amina Hassan",status:"live"},
  {title:"Form 4 Mathematics National Exam",date:"Nov 20",participants:1240,topScore:91,topStudent:"Fatuma Ally",status:"ended"},
  {title:"NECTA Chemistry Mock 2024",date:"Nov 15",participants:632,topScore:88,topStudent:"Rehema Juma",status:"ended"},
  {title:"Form 6 PCB National Trial",date:"Nov 10",participants:284,topScore:92,topStudent:"David Kimani",status:"ended"},
];

const STATS=[
  {label:"Total Students",value:"52,847",icon:"👨‍🎓",color:C.indigo},
  {label:"Papers Completed",value:"284K",icon:"📝",color:C.gold},
  {label:"Schools Active",value:"1,243",icon:"🏫",color:C.teal},
  {label:"National Pass Rate",value:"84%",icon:"✅",color:C.green},
];

export default function PublicLeaderboard(){
  const[tab,setTab]=useState("students");
  const[filter,setFilter]=useState("All");
  const[liveCount,setLiveCount]=useState(847);
  const REGIONS=["All","Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya","Morogoro","Kilimanjaro","Zanzibar"];

  // Simulate live participant count
  useEffect(()=>{
    const iv=setInterval(()=>setLiveCount(c=>c+Math.floor(Math.random()*3)),5000);
    return()=>clearInterval(iv);
  },[]);

  const filtered=TOP_STUDENTS.filter(s=>filter==="All"||s.region===filter);

  return(
    <div style={{minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      {/* Navbar */}
      <nav style={{position:"sticky",top:0,zIndex:100,padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(10,22,40,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff"}}>E</div>
          <span style={{fontWeight:800,fontSize:16,color:C.white}}>ExamHub <span style={{color:C.gold}}>Tanzania</span></span>
        </div>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          {["Home","Rankings","Schools","Exams"].map(l=>(
            <span key={l} style={{color:C.muted,fontSize:13,cursor:"pointer"}}>{l}</span>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <a href="/online-exam" style={{padding:"8px 16px",borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:12,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block",animation:"ping 1.5s ease infinite"}}/>
            Join Live Exam
          </a>
          <a href="/" style={{padding:"8px 16px",borderRadius:9,background:C.indigo,color:"#fff",fontWeight:600,fontSize:12,textDecoration:"none"}}>Student Portal</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{padding:"60px 24px 48px",textAlign:"center",background:`radial-gradient(ellipse 70% 50% at 50% 0%,${C.indigo}20 0%,transparent 70%)`,position:"relative"}}>
        <div style={{position:"absolute",top:"10%",left:"5%",width:300,height:300,borderRadius:"50%",background:`${C.indigo}10`,filter:"blur(80px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"0%",right:"5%",width:250,height:250,borderRadius:"50%",background:`${C.gold}0D`,filter:"blur(70px)",pointerEvents:"none"}}/>

        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:18,padding:"5px 14px",borderRadius:99,background:`${C.green}18`,border:`1px solid ${C.green}30`,fontSize:12,color:C.green,fontWeight:600}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:C.green,display:"inline-block",animation:"ping 1.5s ease infinite"}}/>
          Live Rankings — Updated in real-time
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,56px)",fontWeight:900,letterSpacing:"-1.5px",marginBottom:14,lineHeight:1.05,color:C.white}}>
          Tanzania's Best<br/><span style={{background:`linear-gradient(135deg,${C.gold},${C.indigo})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Exam Performers</span>
        </h1>
        <p style={{color:C.muted,fontSize:15,maxWidth:500,margin:"0 auto 32px",lineHeight:1.7}}>
          Track top students, best schools, and national rankings across all levels — updated live as exams happen.
        </p>

        {/* Live exam banner */}
        <div style={{display:"inline-flex",alignItems:"center",gap:12,padding:"12px 20px",borderRadius:12,background:`${C.green}15`,border:`1px solid ${C.green}30`,marginBottom:40}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:C.green,boxShadow:`0 0 0 4px ${C.green}30`,animation:"ping 1.5s ease infinite",flexShrink:0}}/>
          <div style={{textAlign:"left"}}>
            <div style={{fontWeight:700,fontSize:14,color:C.white}}>🔴 LIVE: National Biology Challenge 2024</div>
            <div style={{fontSize:12,color:C.muted}}>{liveCount.toLocaleString()} students currently taking the exam</div>
          </div>
          <a href="/online-exam" style={{padding:"8px 16px",borderRadius:9,background:C.green,color:"#fff",fontWeight:700,fontSize:12,textDecoration:"none",flexShrink:0}}>Join Now →</a>
        </div>

        {/* Stats row */}
        <div style={{display:"flex",gap:"clamp(16px,4vw,56px)",justifyContent:"center",flexWrap:"wrap"}}>
          {STATS.map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:"clamp(22px,3vw,34px)",fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section style={{padding:"0 24px 40px",maxWidth:1100,margin:"0 auto"}}>
        <h2 style={{fontSize:18,fontWeight:800,color:C.white,marginBottom:16}}>🌟 Highlights</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
          {HIGHLIGHTS.map((h,i)=>(
            <div key={i} style={{...card({padding:"18px 20px",borderColor:h.color+"33",background:h.color+"0A"}),display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:46,height:46,borderRadius:12,background:h.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{h.icon}</div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,color:h.color,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:2}}>{h.title}</div>
                <div style={{fontSize:18,fontWeight:900,color:C.white,lineHeight:1}}>{h.value}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name} · {h.school}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Exams */}
      <section style={{padding:"0 24px 40px",maxWidth:1100,margin:"0 auto"}}>
        <h2 style={{fontSize:18,fontWeight:800,color:C.white,marginBottom:16}}>📝 Recent Online Exams</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {RECENT_EXAMS.map((e,i)=>(
            <div key={i} style={{...card({padding:"18px 20px"})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:e.status==="live"?`${C.green}22`:`${C.muted}15`,color:e.status==="live"?C.green:C.muted}}>
                  {e.status==="live"?"🔴 LIVE":"✓ Ended"}
                </span>
                <span style={{fontSize:11,color:C.muted}}>{e.date}</span>
              </div>
              <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:8,lineHeight:1.35}}>{e.title}</div>
              <div style={{display:"flex",gap:16,fontSize:12,color:C.muted,marginBottom:10}}>
                <span>👥 {e.participants.toLocaleString()} students</span>
                <span>🏆 Top: {e.topScore}%</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:C.navyMid,borderRadius:8}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.indigo})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>🥇</div>
                <div style={{fontSize:12}}><span style={{color:C.white,fontWeight:600}}>{e.topStudent}</span> <span style={{color:C.muted}}>· {e.topScore}%</span></div>
              </div>
              {e.status==="live"&&(
                <a href="/online-exam" style={{display:"block",marginTop:10,padding:"9px 0",borderRadius:9,background:C.green,color:"#fff",fontWeight:700,fontSize:12,textDecoration:"none",textAlign:"center"}}>Join Now →</a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main leaderboard */}
      <section style={{padding:"0 24px 60px",maxWidth:1100,margin:"0 auto"}}>
        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
          {[["students","👨‍🎓 Top Students"],["schools","🏫 Top Schools"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"12px 22px",border:"none",borderBottom:`2px solid ${tab===k?C.indigo:"transparent"}`,background:"transparent",color:tab===k?C.indigoL:C.muted,fontWeight:tab===k?700:400,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>

        {tab==="students"&&(
          <>
            {/* Region filter */}
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
              {REGIONS.map(r=>(
                <button key={r} onClick={()=>setFilter(r)} style={{padding:"6px 14px",borderRadius:99,border:`1px solid ${filter===r?C.indigo:C.border}`,background:filter===r?`${C.indigo}22`:"transparent",color:filter===r?C.indigoL:C.muted,fontWeight:filter===r?700:400,fontSize:12,cursor:"pointer"}}>{r}</button>
              ))}
            </div>

            {/* Podium top 3 */}
            <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:12,marginBottom:28,flexWrap:"wrap"}}>
              {[1,0,2].map(i=>{
                const s=TOP_STUDENTS[i];
                const heights=[110,130,90];
                const colors=[C.gold,"#94A3B8","#B45309"];
                const medals=["🥇","🥈","🥉"];
                return(
                  <div key={i} style={{textAlign:"center",width:180}}>
                    <div style={{marginBottom:10}}>
                      <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff",margin:"0 auto 6px",border:`3px solid ${colors[i]}`}}>
                        {s.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:C.white}}>{s.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>{s.school}</div>
                      <div style={{fontSize:20,fontWeight:900,color:colors[i],marginTop:4}}>{s.score}%</div>
                    </div>
                    <div style={{height:heights[i],background:`linear-gradient(180deg,${colors[i]}33,${colors[i]}15)`,border:`1px solid ${colors[i]}44`,borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                      {medals[i]}
                    </div>
                    <div style={{padding:"6px 0",background:colors[i]+"22",borderRadius:"0 0 8px 8px",fontSize:14,fontWeight:800,color:colors[i]}}># {s.rank}</div>
                  </div>
                );
              })}
            </div>

            {/* Full table */}
            <div style={{...card({padding:0}),overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr>{["Rank","Student","School","Region","Subject","Score","Streak","XP"].map(h=>(<th key={h} style={{textAlign:"left",padding:"11px 14px",color:C.muted,fontWeight:600,fontSize:11,letterSpacing:"0.7px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,background:C.navyMid,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
                <tbody>
                  {filtered.map((s,i)=>(
                    <tr key={s.rank} style={{borderBottom:`1px solid rgba(99,102,241,0.07)`,background:i<3?`${[C.gold,C.muted,"#B45309"][i]}08`:"transparent"}}>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:i<3?[C.gold,"#94A3B8","#B45309"][i]+"20":C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<3?16:12,fontWeight:800,color:i<3?[C.gold,"#94A3B8","#B45309"][i]:C.muted}}>
                          {s.badge||s.rank}
                        </div>
                      </td>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>
                            {s.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <div style={{fontWeight:700,color:C.white,fontSize:13}}>{s.name}</div>
                            <div style={{fontSize:10,color:C.muted}}>{s.exams} exams done</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"12px 14px",color:C.muted,fontSize:12}}>{s.school}</td>
                      <td style={{padding:"12px 14px",color:C.muted,fontSize:12}}>{s.region}</td>
                      <td style={{padding:"12px 14px",color:C.muted,fontSize:12}}>{s.subject}</td>
                      <td style={{padding:"12px 14px"}}><span style={{fontWeight:800,fontSize:15,color:s.score>=80?C.green:s.score>=65?C.gold:C.error}}>{s.score}%</span></td>
                      <td style={{padding:"12px 14px"}}><span style={{color:C.gold,fontWeight:600}}>🔥 {s.streak}d</span></td>
                      <td style={{padding:"12px 14px"}}><span style={{color:C.indigoL,fontWeight:600}}>⚡ {s.xp.toLocaleString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab==="schools"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {TOP_SCHOOLS.map((s,i)=>(
              <div key={i} style={{...card({padding:"18px 22px"}),display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:i<3?[C.gold,"#94A3B8","#B45309"][i]+"22":C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<3?20:14,fontWeight:800,color:i<3?[C.gold,"#94A3B8","#B45309"][i]:C.muted,flexShrink:0}}>
                  {s.badge||s.rank}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,color:C.white,marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{s.region} · {s.students} students</div>
                </div>
                <div style={{textAlign:"center",padding:"10px 16px",background:C.navyMid,borderRadius:10,minWidth:80}}>
                  <div style={{fontWeight:800,fontSize:20,color:s.avgScore>=80?C.green:s.avgScore>=70?C.gold:C.error}}>{s.avgScore}%</div>
                  <div style={{fontSize:10,color:C.muted}}>Avg Score</div>
                </div>
                <div style={{textAlign:"center",padding:"10px 16px",background:C.navyMid,borderRadius:10,minWidth:80}}>
                  <div style={{fontWeight:800,fontSize:20,color:C.green}}>{s.passRate}%</div>
                  <div style={{fontSize:10,color:C.muted}}>Pass Rate</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{borderTop:`1px solid ${C.border}`,padding:"28px 24px",textAlign:"center",background:C.navyMid}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10}}>
          <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#fff"}}>E</div>
          <span style={{fontWeight:800,fontSize:15,color:C.white}}>ExamHub <span style={{color:C.gold}}>Tanzania</span></span>
        </div>
        <p style={{color:C.muted,fontSize:12}}>© 2025 ExamHub Tanzania · Empowering Tanzanian Students · Rankings update in real-time</p>
        <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:12}}>
          {["Join an Exam","Student Portal","Teacher Portal","Contact Us"].map(l=>(
            <span key={l} style={{color:C.muted,fontSize:11,cursor:"pointer"}}>{l}</span>
          ))}
        </div>
      </footer>
      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
