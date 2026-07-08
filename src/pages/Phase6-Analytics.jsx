<<<<<<< HEAD
﻿import { useState } from "react";
import { AreaChart,Area,BarChart,Bar,RadarChart,Radar,PolarGrid,PolarAngleAxis,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer } from "recharts";
const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const px=v=>`${v}px`;const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(14),...e});
const MONTHLY=[{month:"Aug",score:62,exams:3},{month:"Sep",score:67,exams:4},{month:"Oct",score:71,exams:5},{month:"Nov",score:69,exams:4},{month:"Dec",score:75,exams:6},{month:"Jan",score:78,exams:7}];
const SUBJECTS=[{name:"Biology",score:88},{name:"English",score:81},{name:"Kiswahili",score:85},{name:"History",score:83},{name:"Mathematics",score:72},{name:"Physics",score:79},{name:"Geography",score:76},{name:"Chemistry",score:61}];
const TOPICS=[{topic:"Cell Biology",subject:"Biology",score:92,status:"strong"},{topic:"Organic Chemistry",subject:"Chemistry",score:48,status:"weak"},{topic:"Calculus",subject:"Mathematics",score:55,status:"weak"},{topic:"Human Physiology",subject:"Biology",score:88,status:"strong"},{topic:"Probability",subject:"Mathematics",score:62,status:"average"},{topic:"Evolution",subject:"Biology",score:85,status:"strong"},{topic:"Electromagnetism",subject:"Physics",score:58,status:"weak"},{topic:"World War II",subject:"History",score:90,status:"strong"},{topic:"Climate Change",subject:"Geography",score:78,status:"average"},{topic:"Acids & Bases",subject:"Chemistry",score:72,status:"average"}];
const RADAR=[{subject:"Math",A:72},{subject:"Biology",A:88},{subject:"Chemistry",A:61},{subject:"Physics",A:79},{subject:"History",A:83},{subject:"Geography",A:76},{subject:"English",A:81},{subject:"Kiswahili",A:85}];
const PIE=[{name:"Correct",value:68,color:C.green},{name:"Wrong",value:22,color:C.error},{name:"Skipped",value:10,color:C.muted}];
const NAV=[{icon:"",label:"Dashboard"},{icon:"",label:"Past Papers"},{icon:"",label:"Analytics",active:true},{icon:"",label:"Leaderboard"},{icon:"",label:"AI Tutor"},{icon:"",label:"Activities"},{icon:"",label:"Settings"}];
const Sidebar=()=>(<div style={{width:px(200),minHeight:"100vh",background:C.navyMid,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"20px 0",flexShrink:0}}><div style={{padding:"0 16px 20px",borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",alignItems:"center",gap:px(8)}}><div style={{width:px(32),height:px(32),borderRadius:px(8),background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:px(14),color:"#fff"}}>E</div><div><div style={{fontWeight:800,fontSize:px(13),color:C.white}}>ExamHub</div><div style={{fontSize:px(10),color:C.gold}}>Tanzania</div></div></div></div><nav style={{padding:"12px 8px",flex:1}}>{NAV.map(n=>(<div key={n.label} style={{display:"flex",alignItems:"center",gap:px(8),padding:"9px 10px",borderRadius:px(8),marginBottom:px(2),background:n.active?`${C.indigo}22`:"transparent",border:n.active?`1px solid ${C.indigo}44`:"1px solid transparent",cursor:"pointer",color:n.active?C.indigoL:C.muted}}><span style={{fontSize:px(15)}}>{n.icon}</span><span style={{fontSize:px(12),fontWeight:n.active?700:400}}>{n.label}</span></div>))}</nav></div>);
export default function Analytics(){const[period,setPeriod]=useState("6M");return(<div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}><Sidebar/><div style={{flex:1,minWidth:0}}><div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}><div><div style={{fontWeight:800,fontSize:px(20)}}>Analytics </div><div style={{fontSize:px(13),color:C.muted}}>Your learning insights</div></div><div style={{display:"flex",background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(8),overflow:"hidden"}}>{["1M","3M","6M","1Y"].map(p=>(<button key={p} onClick={()=>setPeriod(p)} style={{padding:"7px 14px",border:"none",background:period===p?C.indigo:"transparent",color:period===p?"#fff":C.muted,fontSize:px(12),fontWeight:600,cursor:"pointer"}}>{p}</button>))}</div></div>
<main style={{padding:"24px",overflowY:"auto"}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:px(12),marginBottom:px(24)}}>{[{icon:"",label:"Avg Score",value:"78%",delta:"+16%",color:C.indigo},{icon:"",label:"Exams Done",value:"34",delta:"+7 this month",color:C.teal},{icon:"",label:"Study Time",value:"42h",delta:"this month",color:C.gold},{icon:"",label:"Accuracy",value:"79%",delta:"+8%",color:C.green},{icon:"",label:"Streak",value:"12 days",delta:"personal best",color:C.pink}].map(s=>(<div key={s.label} style={{...card({padding:"18px"})}}><div style={{fontSize:px(22),marginBottom:px(8)}}>{s.icon}</div><div style={{fontSize:px(24),fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div><div style={{fontSize:px(12),color:C.muted,marginTop:px(4)}}>{s.label}</div><div style={{fontSize:px(11),color:C.green,marginTop:px(4)}}> {s.delta}</div></div>))}</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:px(16),marginBottom:px(20)}}>
<div style={{...card({padding:"24px"})}}><div style={{fontWeight:700,fontSize:px(15),color:C.white,marginBottom:px(4)}}>Score Trend</div><div style={{fontSize:px(12),color:C.muted,marginBottom:px(16)}}>Monthly average over 6 months</div><ResponsiveContainer width="100%" height={200}><AreaChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.indigo} stopOpacity={0.3}/><stop offset="95%" stopColor={C.indigo} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis domain={[50,100]} tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}}/><Area type="monotone" dataKey="score" stroke={C.indigo} strokeWidth={2.5} fill="url(#ag)" dot={{fill:C.indigo,r:4,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div>
<div style={{...card({padding:"24px"})}}><div style={{fontWeight:700,fontSize:px(15),color:C.white,marginBottom:px(4)}}>Subject Radar</div><div style={{fontSize:px(12),color:C.muted,marginBottom:px(16)}}>All subjects at a glance</div><ResponsiveContainer width="100%" height={200}><RadarChart data={RADAR}><PolarGrid stroke={C.border}/><PolarAngleAxis dataKey="subject" tick={{fill:C.muted,fontSize:10}}/><Radar dataKey="A" stroke={C.indigo} fill={C.indigo} fillOpacity={0.25} strokeWidth={2}/></RadarChart></ResponsiveContainer></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:px(16),marginBottom:px(20)}}>
<div style={{...card({padding:"24px"})}}><div style={{fontWeight:700,fontSize:px(15),color:C.white,marginBottom:px(16)}}>Subject Breakdown</div><div style={{display:"flex",flexDirection:"column",gap:px(10)}}>{SUBJECTS.sort((a,b)=>b.score-a.score).map(s=>(<div key={s.name}><div style={{display:"flex",justifyContent:"space-between",fontSize:px(13),marginBottom:px(5)}}><span style={{color:C.white,fontWeight:500}}>{s.name}</span><span style={{fontWeight:700,color:s.score>=80?C.green:s.score>=65?C.gold:C.error}}>{s.score}%</span></div><div style={{height:px(5),background:C.border,borderRadius:px(3)}}><div style={{width:`${s.score}%`,height:"100%",borderRadius:px(3),background:s.score>=80?C.green:s.score>=65?C.gold:C.error}}/></div></div>))}</div></div>
<div style={{...card({padding:"24px"})}}><div style={{fontWeight:700,fontSize:px(15),color:C.white,marginBottom:px(4)}}>Answer Breakdown</div><div style={{fontSize:px(12),color:C.muted,marginBottom:px(16)}}>Across all exams taken</div><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{PIE.map((e,i)=>(<Cell key={i} fill={e.color}/>))}</Pie><Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}}/></PieChart></ResponsiveContainer><div style={{display:"flex",justifyContent:"center",gap:px(16),marginTop:px(8)}}>{PIE.map(p=>(<div key={p.name} style={{display:"flex",alignItems:"center",gap:px(6),fontSize:px(12)}}><div style={{width:px(10),height:px(10),borderRadius:px(2),background:p.color}}/><span style={{color:C.muted}}>{p.name} {p.value}%</span></div>))}</div></div>
</div>
<div style={{...card({padding:"24px"})}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:px(16)}}><div style={{fontWeight:700,fontSize:px(15),color:C.white}}>Topic Performance</div><div style={{display:"flex",gap:px(8)}}>{[{label:"Weak",color:C.error},{label:"Average",color:C.gold},{label:"Strong",color:C.green}].map(l=>(<span key={l.label} style={{fontSize:px(11),padding:"3px 10px",borderRadius:px(100),background:l.color+"18",color:l.color}}>{l.label}</span>))}</div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:px(10)}}>{TOPICS.map(t=>(<div key={t.topic} style={{background:C.navyMid,borderRadius:px(10),padding:"14px 16px",border:`1px solid ${t.status==="weak"?C.error:t.status==="strong"?C.green:C.gold}33`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:px(6)}}><div><div style={{fontWeight:600,fontSize:px(13),color:C.white}}>{t.topic}</div><div style={{fontSize:px(11),color:C.muted}}>{t.subject}</div></div><span style={{fontSize:px(16),fontWeight:800,color:t.status==="weak"?C.error:t.status==="strong"?C.green:C.gold}}>{t.score}%</span></div><div style={{height:px(4),background:C.border,borderRadius:px(2)}}><div style={{width:`${t.score}%`,height:"100%",borderRadius:px(2),background:t.status==="weak"?C.error:t.status==="strong"?C.green:C.gold}}/></div></div>))}</div></div>
</main></div></div>);}
=======
export default function Phase6() {
  const C = {
    navy:"#0A1628", navyMid:"#0F1F3D", navyCard:"#111E35",
    indigo:"#4F46E5", indigoL:"#6366F1", gold:"#F59E0B",
    white:"#F0F4FF", muted:"#94A3B8", border:"rgba(99,102,241,0.18)",
  };
  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{width:220,minHeight:"100vh",background:C.navyMid,borderRight:"1px solid "+C.border,display:"flex",flexDirection:"column",padding:"24px 0",flexShrink:0}}>
        <div style={{padding:"0 20px 24px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,"+C.indigo+","+C.gold+")",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff"}}>E</div>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:C.white}}>ExamHub</div>
            <div style={{fontSize:11,color:C.gold,fontWeight:600}}>Tanzania</div>
          </div>
        </div>
        <nav style={{padding:"12px 10px",flex:1}}>
          {[["Home","/"],["Dashboard","/dashboard"],["Past Papers","/papers"],["Analytics","/analytics"],["Activities","/activities"],["Admin","/admin"]].map(([label,path])=>(
            <a key={label} href={path} style={{display:"flex",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:2,color:C.muted,textDecoration:"none",fontSize:13,border:"1px solid transparent"}}>{label}</a>
          ))}
        </nav>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 24px",borderBottom:"1px solid "+C.border,background:C.navy,position:"sticky",top:0,zIndex:10}}>
          <div style={{fontSize:20,fontWeight:800,color:C.white}}>Analytics Dashboard</div>
          <div style={{fontSize:13,color:C.muted,marginTop:2}}>Phase 6 — Run ExamHub-Complete-Setup.ps1 to load full component</div>
        </div>
        <main style={{flex:1,padding:"40px 24px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{textAlign:"center",maxWidth:480}}>
            <div style={{fontSize:64,marginBottom:16}}>📋</div>
            <h2 style={{fontSize:22,fontWeight:800,color:C.white,marginBottom:10}}>Analytics Dashboard</h2>
            <p style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:28}}>
              The full Phase 6 component is in <strong style={{color:C.indigoL}}>ExamHub-Complete-Setup.ps1</strong>. Run it on your Windows machine and the full UI will appear here.
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <a href="/" style={{padding:"11px 22px",borderRadius:10,background:C.indigo,color:"#fff",fontWeight:600,fontSize:14,textDecoration:"none"}}>Home</a>
              <a href="/dashboard" style={{padding:"11px 22px",borderRadius:10,background:"transparent",border:"1px solid "+C.border,color:C.muted,fontWeight:600,fontSize:14,textDecoration:"none"}}>Dashboard</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
>>>>>>> 0b3c81e9470c74fd27c37a680978282ae4c33e18
