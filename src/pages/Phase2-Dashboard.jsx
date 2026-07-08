import { useState, useEffect } from "react";
import { AreaChart,Area,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer } from "recharts";
import { supabase } from "../lib/supabase";
import { TSIDCard } from "../components/profile/TSIDCard";

const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const px=v=>`${v}px`;
const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(16),...e});
const Tag=({children,color=C.indigo})=>(<span style={{display:"inline-block",padding:"3px 10px",borderRadius:px(100),fontSize:px(11),fontWeight:600,background:color+"22",color,border:`1px solid ${color}44`}}>{children}</span>);
const Pill=({icon,label,value,color=C.indigo})=>(<div style={{display:"flex",alignItems:"center",gap:px(8),padding:"8px 14px",borderRadius:px(10),background:color+"15",border:`1px solid ${color}30`}}><span style={{fontSize:px(18)}}>{icon}</span><div><div style={{fontSize:px(11),color:C.muted,lineHeight:1}}>{label}</div><div style={{fontSize:px(14),fontWeight:700,color}}>{value}</div></div></div>);
const Spinner=()=>(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:C.navy,flexDirection:"column",gap:16}}><div style={{width:48,height:48,borderRadius:12,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#fff"}}>E</div><div style={{width:28,height:28,border:`3px solid rgba(99,102,241,0.3)`,borderTopColor:C.indigo,borderRadius:"50%",animation:"spin .7s linear infinite"}}/><style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style></div>);

const NAV=[{icon:"🏠",label:"Dashboard",path:"/dashboard"},{icon:"📝",label:"Past Papers",path:"/papers"},{icon:"📊",label:"Analytics",path:"/analytics"},{icon:"🏆",label:"Leaderboard",path:"/activities"},{icon:"🤖",label:"AI Tutor",path:"/activities"},{icon:"🎮",label:"Activities",path:"/activities"},{icon:"🔔",label:"Notifications",path:"/dashboard"},{icon:"⚙️",label:"Settings",path:"/dashboard"}];

const Sidebar=({student,active="/dashboard"})=>(
  <div style={{width:220,minHeight:"100vh",background:C.navyMid,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"20px 0",flexShrink:0}}>
    <div style={{padding:"0 18px 20px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff"}}>E</div>
        <div><div style={{fontWeight:800,fontSize:14,color:C.white}}>ExamHub</div><div style={{fontSize:10,color:C.gold,fontWeight:600}}>Tanzania</div></div>
      </div>
    </div>
    {student&&(
      <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          {student.photo_url
            ? <img src={student.photo_url} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${C.indigo}`}}/>
            : <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{(student.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
          }
          <div style={{minWidth:0}}><div style={{fontWeight:700,fontSize:12,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{student.name}</div><div style={{fontSize:10,color:C.muted}}>{student.level_label}</div></div>
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
          <span>Level {student.level_num}</span><span>{student.xp?.toLocaleString()} XP</span>
        </div>
        <div style={{height:4,background:C.border,borderRadius:99}}>
          <div style={{width:`${Math.min(((student.xp||0)%5000)/50,100)}%`,height:"100%",background:`linear-gradient(90deg,${C.indigo},${C.gold})`,borderRadius:99}}/>
        </div>
      </div>
    )}
    <nav style={{padding:"10px 10px",flex:1}}>
      {NAV.map(n=>(<a key={n.label} href={n.path} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:10,marginBottom:2,background:active===n.path?`${C.indigo}22`:"transparent",border:active===n.path?`1px solid ${C.indigo}44`:"1px solid transparent",cursor:"pointer",color:active===n.path?C.indigoL:C.muted,textDecoration:"none",fontSize:13,fontWeight:active===n.path?700:400}}><span style={{fontSize:16}}>{n.icon}</span>{n.label}</a>))}
    </nav>
    {student&&(
      <div style={{padding:"10px 14px"}}>
        <div style={{background:`${C.gold}18`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🔥</span>
          <div><div style={{fontSize:13,fontWeight:700,color:C.gold}}>{student.streak} Day Streak</div><div style={{fontSize:10,color:C.muted}}>Keep it up!</div></div>
        </div>
      </div>
    )}
  </div>
);

export default function Dashboard(){
  const [student,setStudent]=useState(null);
  const [sessions,setSessions]=useState([]);
  const [badges,setBadges]=useState([]);
  const [notifs,setNotifs]=useState(0);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    let mounted=true;
    const load=async()=>{
      // Get current auth user
      const {data:{user},error:authErr}=await supabase.auth.getUser();
      if(authErr||!user){window.location.href="/";return;}

      // Fetch student + profile + school in one join
      const {data:stu,error:stuErr}=await supabase
        .from("students")
        .select(`
          id,level,combination,class_name,xp,coins,level_num,streak,
          longest_streak,total_exams,avg_score,best_score,tsid,tsid_verified,photo_url,
          profiles!inner(full_name,phone,avatar_url,region,school_id,
            schools(name,short_name,region))
        `)
        .eq("id",user.id)
        .single();

      if(stuErr){
        // User is authenticated but no student record — they might be a teacher/admin
        const {data:prof}=await supabase.from("profiles").select("role").eq("id",user.id).single();
        if(prof?.role==="teacher")    {window.location.href="/teacher";return;}
        if(prof?.role==="school_admin"){window.location.href="/school";return;}
        if(prof?.role==="super_admin") {window.location.href="/superadmin";return;}
        if(mounted)setError("Could not load your profile. Contact support.");
        setLoading(false);return;
      }

      if(!mounted)return;

      const profile=stu.profiles;
      const school=profile?.schools;
      const LEVEL_LABELS={standard_4:"Standard 4",standard_7:"Standard 7",form_2:"Form 2",form_4:"Form 4",form_6:"Form 6"};

      setStudent({
        id:         user.id,
        name:       profile?.full_name||"Student",
        level:      stu.level,
        level_label: LEVEL_LABELS[stu.level]||stu.level,
        school:     school?.name||"Your School",
        region:     profile?.region||"",
        streak:     stu.streak||0,
        xp:         stu.xp||0,
        coins:      stu.coins||0,
        level_num:  stu.level_num||1,
        total_exams:stu.total_exams||0,
        avg_score:  stu.avg_score||0,
        best_score: stu.best_score||0,
        tsid:       stu.tsid||null,
        tsid_verified: stu.tsid_verified||false,
        photo_url:  stu.photo_url||profile?.avatar_url||null,
      });

      // Fetch recent exam sessions
      const {data:sess}=await supabase
        .from("exam_sessions")
        .select(`id,score,percentage,grade,division,submitted_at,
          exams(subject_name,level,year,paper_number,type)`)
        .eq("student_id",user.id)
        .order("submitted_at",{ascending:false})
        .limit(5);
      if(mounted)setSessions(sess||[]);

      // Fetch badges
      const {data:bdg}=await supabase
        .from("student_badges")
        .select("badges(code,name,icon,color)")
        .eq("student_id",user.id)
        .limit(10);
      if(mounted)setBadges((bdg||[]).map(b=>b.badges).filter(Boolean));

      // Unread notifications count
      const {count}=await supabase
        .from("notifications")
        .select("id",{count:"exact",head:true})
        .eq("user_id",user.id)
        .eq("is_read",false);
      if(mounted)setNotifs(count||0);

      if(mounted)setLoading(false);
    };
    load();
    return()=>{mounted=false;};
  },[]);

  if(loading)return<Spinner/>;
  if(error)return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:C.white}}>
        <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
        <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>{error}</div>
        <button onClick={()=>{supabase.auth.signOut();window.location.href="/";}} style={{padding:"10px 22px",borderRadius:10,background:C.indigo,border:"none",color:"#fff",fontWeight:600,cursor:"pointer"}}>Sign Out</button>
      </div>
    </div>
  );

  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const scoreColor=s=>s>=75?C.green:s>=50?C.gold:C.error;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <Sidebar student={student}/>
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:C.white}}>{greeting}, {(student?.name||"").split(" ")[0]} 👋</div>
            <div style={{fontSize:13,color:C.muted,marginTop:2}}>{student?.level_label} · {student?.school}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>window.location.href="/dashboard"}>
              <span style={{fontSize:20}}>🔔</span>
              {notifs>0&&(<span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:C.error,fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{notifs}</span>)}
            </div>
            <div style={{padding:"7px 14px",borderRadius:10,background:`${C.gold}18`,border:`1px solid ${C.gold}33`,fontSize:13,fontWeight:600,color:C.gold}}>🔥 {student?.streak} days</div>
            {student?.photo_url
              ? <img src={student.photo_url} alt="" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:`2px solid ${C.indigo}`,cursor:"pointer"}}/>
              : <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer"}}>{(student?.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
            }
          </div>
        </div>

        <main style={{flex:1,padding:24,overflowY:"auto"}}>
          {/* Gamification strip */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <Pill icon="🔥" label="Streak"    value={`${student?.streak||0} days`} color={C.gold}/>
            <Pill icon="⚡" label="XP Points" value={(student?.xp||0).toLocaleString()} color={C.indigo}/>
            <Pill icon="🪙" label="Coins"     value={student?.coins||0} color={C.teal}/>
            <Pill icon="🏅" label="Level"     value={`Level ${student?.level_num||1}`} color={C.purple}/>
          </div>

          {/* KPI Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:22}}>
            {[
              {icon:"📊",label:"Overall Average",value:`${Math.round(student?.avg_score||0)}%`,sub:student?.avg_score>=75?"↑ On track":"↑ Keep going",color:C.indigo},
              {icon:"📝",label:"Total Exams Done",value:student?.total_exams||0,sub:`${student?.total_exams||0} papers`,color:C.teal},
              {icon:"🌟",label:"Best Score",value:`${Math.round(student?.best_score||0)}%`,sub:student?.best_score>=75?"Grade A":"Keep practising",color:C.green},
              {icon:"📅",label:"Study Streak",value:`${student?.streak||0} days`,sub:"Days in a row",color:C.gold},
            ].map(s=>(
              <div key={s.label} style={{...card({padding:18}),display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{width:40,height:40,borderRadius:11,background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{s.icon}</div>
                  <Tag color={s.color}>{s.sub}</Tag>
                </div>
                <div style={{fontSize:26,fontWeight:900,color:C.white,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12,color:C.muted}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TSID Card */}
          <div style={{marginBottom:20}}>
            <TSIDCard
              userId={student?.id||""}
              tsid={student?.tsid||undefined}
              tsidVerified={student?.tsid_verified||false}
              onLinked={()=>window.location.reload()}
              onSynced={()=>window.location.reload()}
            />
          </div>

          {/* Recent Sessions */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16,marginBottom:20}}>
            <div style={{...card({padding:22})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:16,color:C.white}}>Recent Exams</div>
                <a href="/papers" style={{fontSize:12,color:C.indigoL,fontWeight:600,textDecoration:"none"}}>View all →</a>
              </div>
              {sessions.length===0?(
                <div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>
                  <div style={{fontSize:36,marginBottom:10}}>📝</div>
                  <div style={{fontSize:13}}>No exams yet — <a href="/papers" style={{color:C.indigoL}}>start practising</a></div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {sessions.map((s,i)=>{
                    const ex=s.exams;
                    const pct=Math.round(s.percentage||0);
                    const col=scoreColor(pct);
                    return(
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 13px",background:col+"10",borderRadius:10,border:`1px solid ${col}22`}}>
                        <div style={{width:36,height:36,borderRadius:9,background:col+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:col,flexShrink:0}}>{s.grade||"—"}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.subject_name||"Exam"} {ex?.year||""}</div>
                          <div style={{fontSize:11,color:C.muted}}>{ex?.type||""} · {s.submitted_at?new Date(s.submitted_at).toLocaleDateString("en-TZ"):""}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontWeight:700,fontSize:15,color:col}}>{pct}%</div>
                          <div style={{fontSize:10,color:C.muted}}>{s.division||""}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Badges */}
            <div style={{...card({padding:22})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:16,color:C.white}}>Badges Earned</div>
                <Tag color={C.gold}>{badges.length} earned</Tag>
              </div>
              {badges.length===0?(
                <div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>
                  <div style={{fontSize:36,marginBottom:10}}>🏅</div>
                  <div style={{fontSize:13}}>Complete exams to earn badges!</div>
                </div>
              ):(
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {badges.map((b,i)=>(
                    <div key={i} title={b.name} style={{padding:"7px 14px",borderRadius:99,background:(b.color||C.gold)+"18",border:`1px solid ${b.color||C.gold}44`,fontSize:12,fontWeight:600,color:b.color||C.gold,cursor:"default"}}>
                      {b.icon} {b.name}
                    </div>
                  ))}
                  <div style={{padding:"7px 14px",borderRadius:99,background:C.border,fontSize:12,color:C.muted,cursor:"pointer"}} onClick={()=>window.location.href="/activities"}>
                    + Earn more →
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{...card({padding:22})}}>
            <div style={{fontWeight:700,fontSize:15,color:C.white,marginBottom:14}}>Quick Actions</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
              {[
                {icon:"📝",label:"Practice Past Papers",href:"/papers",color:C.indigo},
                {icon:"🌐",label:"Join Online Exam",href:"/online-exam",color:C.green},
                {icon:"📊",label:"View Analytics",href:"/analytics",color:C.teal},
                {icon:"🏆",label:"Leaderboard",href:"/leaderboard",color:C.gold},
              ].map(a=>(
                <a key={a.label} href={a.href} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:11,textDecoration:"none",background:a.color+"12",border:`1px solid ${a.color}30`,transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=a.color+"22"}
                  onMouseLeave={e=>e.currentTarget.style.background=a.color+"12"}>
                  <span style={{fontSize:22}}>{a.icon}</span>
                  <span style={{fontWeight:600,fontSize:13,color:C.white}}>{a.label}</span>
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
