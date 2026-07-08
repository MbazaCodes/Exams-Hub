import { useState } from "react";
import { BarChart,Bar,AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell } from "recharts";
import { downloadPDF } from "../../utils/exportPDF";
import { exportToCSV } from "../../utils/exportExcel";
import { FileUploader } from "../../components/upload/FileUploader";

const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const px=v=>`${v}px`;
const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(14),...e});

const PLATFORM={students:52847,schools:1243,teachers:8920,papers:2847,revenue:48200000,activeToday:8320,aiQueries:14200,premiumSchools:380};
const SCHOOLS=[
  {id:1,name:"Kilimanjaro SS",     region:"Kilimanjaro",students:340,plan:"Premium",status:"Active",revenue:240000,joined:"2023-01-15"},
  {id:2,name:"Zanzibar Academy",   region:"Zanzibar",   students:195,plan:"Free",   status:"Active",revenue:0,    joined:"2023-04-20"},
  {id:3,name:"Mbeya Girls HS",     region:"Mbeya",      students:280,plan:"Premium",status:"Pending",revenue:240000,joined:"2024-10-01"},
  {id:4,name:"Arusha International",region:"Arusha",    students:410,plan:"Premium",status:"Active",revenue:360000,joined:"2022-08-10"},
  {id:5,name:"Dodoma National SS", region:"Dodoma",     students:520,plan:"Premium",status:"Active",revenue:480000,joined:"2022-01-01"},
  {id:6,name:"Lindi Coastal HS",   region:"Lindi",      students:160,plan:"Free",   status:"Active",revenue:0,    joined:"2024-02-14"},
];
const REVENUE_MONTHLY=[
  {month:"Aug",revenue:3.2},{month:"Sep",revenue:3.8},{month:"Oct",revenue:4.1},
  {month:"Nov",revenue:4.6},{month:"Dec",revenue:5.0},{month:"Jan",revenue:5.4},
];
const PLAN_PIE=[{name:"Premium",value:380,color:C.gold},{name:"Free",value:863,color:C.border}];
const PENDING_CONTENT=[
  {id:1,title:"2024 NECTA Biology Paper 1",school:"Kilimanjaro SS",teacher:"Mr. Kamau",type:"NECTA",submitted:"2024-11-10",questions:50},
  {id:2,title:"Form 4 Chemistry Mock 2024",school:"Mbeya Girls HS",teacher:"Ms. Ally",type:"Mock Exam",submitted:"2024-11-09",questions:40},
  {id:3,title:"Standard 7 Mathematics 2023",school:"Dodoma National SS",teacher:"Mr. Omar",type:"NECTA",submitted:"2024-11-08",questions:30},
];

const NAV=[
  {icon:"📊",label:"Platform Overview"},
  {icon:"🏫",label:"Schools"},
  {icon:"👨‍🎓",label:"Students"},
  {icon:"👨‍🏫",label:"Teachers"},
  {icon:"📝",label:"Content Approval"},
  {icon:"⬆️",label:"Upload Papers"},
  {icon:"💰",label:"Payments"},
  {icon:"🤖",label:"AI Settings"},
  {icon:"📣",label:"Notifications"},
  {icon:"⚙️",label:"System Settings"},
];

const Sidebar=({active,setTab})=>(
  <div style={{width:230,minHeight:"100vh",background:C.navyMid,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"20px 0",flexShrink:0}}>
    <div style={{padding:"0 16px 18px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff"}}>E</div>
        <div><div style={{fontWeight:800,fontSize:13,color:C.white}}>ExamHub</div><div style={{fontSize:10,color:C.error,fontWeight:700}}>SUPER ADMIN</div></div>
      </div>
    </div>
    <nav style={{padding:"10px 9px",flex:1}}>
      {NAV.map(n=>(
        <div key={n.label} onClick={()=>setTab(n.label)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:9,marginBottom:2,background:active===n.label?`${C.indigo}22`:"transparent",border:active===n.label?`1px solid ${C.indigo}44`:"1px solid transparent",cursor:"pointer",color:active===n.label?C.indigoL:C.muted,fontSize:12,fontWeight:active===n.label?700:400}}>
          <span style={{fontSize:15}}>{n.icon}</span>{n.label}
        </div>
      ))}
    </nav>
  </div>
);

const PlatformOverview=()=>(
  <div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
      {[
        {icon:"👨‍🎓",label:"Total Students",value:PLATFORM.students.toLocaleString(),color:C.indigo},
        {icon:"🏫",label:"Schools",value:PLATFORM.schools.toLocaleString(),color:C.teal},
        {icon:"👨‍🏫",label:"Teachers",value:PLATFORM.teachers.toLocaleString(),color:C.purple},
        {icon:"📝",label:"Papers",value:PLATFORM.papers.toLocaleString(),color:C.gold},
        {icon:"🔥",label:"Active Today",value:PLATFORM.activeToday.toLocaleString(),color:C.pink},
        {icon:"🤖",label:"AI Queries",value:PLATFORM.aiQueries.toLocaleString(),color:C.green},
        {icon:"💎",label:"Premium Schools",value:PLATFORM.premiumSchools,color:C.gold},
        {icon:"💰",label:"Revenue (TZS)",value:`${(PLATFORM.revenue/1000000).toFixed(1)}M`,color:C.green},
      ].map(s=>(
        <div key={s.label} style={{...card({padding:16}),textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:7}}>{s.icon}</div>
          <div style={{fontSize:20,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:4}}>{s.label}</div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:16}}>
      <div style={{...card({padding:22})}}>
        <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:16}}>Monthly Revenue (Million TZS)</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={REVENUE_MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}>
            <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={0.3}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}} formatter={v=>[`${v}M TZS`,"Revenue"]}/>
            <Area type="monotone" dataKey="revenue" stroke={C.gold} strokeWidth={2.5} fill="url(#rg)" dot={{fill:C.gold,r:4,strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{...card({padding:22})}}>
        <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:16}}>School Plans Distribution</div>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart><Pie data={PLAN_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
            {PLAN_PIE.map((e,i)=>(<Cell key={i} fill={e.color}/>))}
          </Pie><Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}}/></PieChart>
        </ResponsiveContainer>
        <div style={{display:"flex",justifyContent:"center",gap:16}}>
          {PLAN_PIE.map(p=>(<div key={p.name} style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}><div style={{width:10,height:10,borderRadius:2,background:p.color}}/><span style={{color:C.muted}}>{p.name}: {p.value}</span></div>))}
        </div>
      </div>
    </div>
  </div>
);

const SchoolsTab=()=>{
  const export_=()=>exportToCSV({filename:"schools-report",title:"ExamHub Tanzania — Schools Report",columns:[{header:"School Name",key:"name"},{header:"Region",key:"region"},{header:"Students",key:"students"},{header:"Plan",key:"plan"},{header:"Status",key:"status"},{header:"Revenue (TZS)",key:"revenue"},{header:"Joined",key:"joined"}],rows:SCHOOLS});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontWeight:700,fontSize:16,color:C.white}}>{SCHOOLS.length} Schools</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>downloadPDF({title:"Registered Schools Report",subtitle:"ExamHub Tanzania Platform",filename:"schools",columns:[{header:"School",key:"name"},{header:"Region",key:"region"},{header:"Students",key:"students"},{header:"Plan",key:"plan"},{header:"Status",key:"status"}],rows:SCHOOLS})} style={{padding:"9px 15px",borderRadius:9,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontWeight:600,fontSize:12,cursor:"pointer"}}>📄 PDF</button>
          <button onClick={export_} style={{padding:"9px 15px",borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:12,cursor:"pointer"}}>📊 Excel</button>
          <button style={{padding:"9px 15px",borderRadius:9,background:C.indigo,border:"none",color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer"}}>+ Register School</button>
        </div>
      </div>
      <div style={{...card({padding:0}),overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr>{["School","Region","Students","Plan","Status","Revenue","Joined","Actions"].map(h=>(<th key={h} style={{textAlign:"left",padding:"11px 14px",color:C.muted,fontWeight:600,fontSize:11,letterSpacing:"0.7px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,background:C.navyMid,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
          <tbody>
            {SCHOOLS.map(s=>(
              <tr key={s.id} style={{borderBottom:`1px solid rgba(99,102,241,0.07)`}}>
                <td style={{padding:"11px 14px",fontWeight:600,color:C.white}}>{s.name}</td>
                <td style={{padding:"11px 14px",color:C.muted}}>{s.region}</td>
                <td style={{padding:"11px 14px",color:C.white}}>{s.students}</td>
                <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:s.plan==="Premium"?`${C.gold}22`:`${C.muted}15`,color:s.plan==="Premium"?C.gold:C.muted}}>{s.plan}</span></td>
                <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:s.status==="Active"?`${C.green}22`:s.status==="Pending"?`${C.gold}22`:`${C.error}22`,color:s.status==="Active"?C.green:s.status==="Pending"?C.gold:C.error}}>{s.status}</span></td>
                <td style={{padding:"11px 14px",color:s.revenue>0?C.green:C.muted}}>{s.revenue>0?`${(s.revenue/1000).toFixed(0)}k`:"Free"}</td>
                <td style={{padding:"11px 14px",color:C.muted,fontSize:12}}>{s.joined}</td>
                <td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:5}}><button style={{padding:"5px 10px",borderRadius:7,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontSize:11,cursor:"pointer"}}>View</button><button style={{padding:"5px 10px",borderRadius:7,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontSize:11,cursor:"pointer"}}>Block</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ContentApprovalTab=()=>{
  const [approved,setApproved]=useState([]);
  const [rejected,setRejected]=useState([]);
  return(
    <div>
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {[{label:"Pending Review",value:PENDING_CONTENT.length,color:C.gold},{label:"Approved This Week",value:14,color:C.green},{label:"Rejected",value:3,color:C.error}].map(s=>(
          <div key={s.label} style={{...card({padding:"14px 18px"}),display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
            <div style={{fontSize:13,color:C.muted}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {PENDING_CONTENT.map(c=>{
          const isApproved=approved.includes(c.id);
          const isRejected=rejected.includes(c.id);
          return(
            <div key={c.id} style={{...card({padding:"18px 20px"}),borderColor:isApproved?C.green+"44":isRejected?C.error+"44":C.border}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:4}}>{c.title}</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{c.school} · {c.teacher} · {c.questions} questions · Submitted {c.submitted}</div>
                  <div style={{display:"flex",gap:8}}>
                    <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:`${C.indigo}22`,color:C.indigoL}}>{c.type}</span>
                    {isApproved&&<span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:`${C.green}22`,color:C.green}}>✓ Approved</span>}
                    {isRejected&&<span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:`${C.error}22`,color:C.error}}>✗ Rejected</span>}
                  </div>
                </div>
                {!isApproved&&!isRejected&&(
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button style={{padding:"8px 16px",borderRadius:9,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontSize:12,fontWeight:600,cursor:"pointer"}}>Preview</button>
                    <button onClick={()=>setApproved(a=>[...a,c.id])} style={{padding:"8px 16px",borderRadius:9,background:C.green,border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Approve</button>
                    <button onClick={()=>setRejected(r=>[...r,c.id])} style={{padding:"8px 16px",borderRadius:9,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontSize:12,fontWeight:600,cursor:"pointer"}}>✗ Reject</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UploadPapersTab=()=>(
  <div style={{maxWidth:640}}>
    <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:4}}>Upload National Past Papers</div>
    <div style={{fontSize:13,color:C.muted,marginBottom:24}}>Upload official NECTA past papers — they will be available to all students on the platform.</div>
    <div style={{...card({padding:22,marginBottom:16})}}>
      <div style={{fontWeight:600,fontSize:14,color:C.white,marginBottom:16}}>📄 Upload Past Paper PDF</div>
      <FileUploader accept=".pdf" label="Drop NECTA Paper PDF here" hint="Official past paper PDF · Max 25MB" maxSizeMB={25} processingLabel="AI extracting questions" onProcess={async()=>{await new Promise(r=>setTimeout(r,3000));}}/>
    </div>
    <div style={{...card({padding:22})}}>
      <div style={{fontWeight:600,fontSize:14,color:C.white,marginBottom:16}}>📊 Bulk Upload via Excel</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Upload questions directly via our Excel template — no PDF conversion needed.</div>
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <button onClick={()=>exportToCSV({filename:"question-template",title:"ExamHub — Question Upload Template",columns:[{header:"Question No",key:"no"},{header:"Question Text",key:"text"},{header:"Option A",key:"a"},{header:"Option B",key:"b"},{header:"Option C",key:"c"},{header:"Option D",key:"d"},{header:"Correct Answer",key:"correct"},{header:"Marks",key:"marks"},{header:"Topic",key:"topic"},{header:"Difficulty",key:"diff"}],rows:[{no:1,text:"Sample question here",a:"Option A",b:"Option B",c:"Option C",d:"Option D",correct:"B",marks:2,topic:"Cell Biology",diff:"Medium"}]})} style={{padding:"10px 16px",borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:12,cursor:"pointer"}}>📥 Download Question Template</button>
      </div>
      <FileUploader accept=".xlsx,.csv" label="Upload Questions Excel/CSV" hint="Use our template above · Max 10MB" maxSizeMB={10} processingLabel="Importing questions" onProcess={async()=>{await new Promise(r=>setTimeout(r,2000));}}/>
    </div>
  </div>
);

const PaymentsTab=()=>{
  const payments=[
    {school:"Kilimanjaro SS",plan:"Premium Annual",amount:240000,date:"2024-01-15",method:"M-Pesa",status:"Paid"},
    {school:"Arusha International",plan:"Premium Annual",amount:360000,date:"2024-01-10",method:"Airtel Money",status:"Paid"},
    {school:"Dodoma National SS",plan:"Premium Annual",amount:480000,date:"2024-01-05",method:"Bank Transfer",status:"Paid"},
    {school:"Mbeya Girls HS",plan:"Premium Annual",amount:240000,date:"2024-11-01",method:"M-Pesa",status:"Pending"},
  ];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,flex:1}}>
          {[{label:"This Month",value:"TZS 5.4M",color:C.green},{label:"Pending",value:"TZS 240K",color:C.gold},{label:"Premium Schools",value:380,color:C.indigo}].map(s=>(
            <div key={s.label} style={{...card({padding:"12px 16px"})}}>
              <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>exportToCSV({filename:"payments-report",title:"ExamHub Payments Report",columns:[{header:"School",key:"school"},{header:"Plan",key:"plan"},{header:"Amount (TZS)",key:"amount"},{header:"Date",key:"date"},{header:"Method",key:"method"},{header:"Status",key:"status"}],rows:payments})} style={{padding:"10px 16px",borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:13,cursor:"pointer"}}>📊 Export Payments</button>
      </div>
      <div style={{...card({padding:0}),overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr>{["School","Plan","Amount (TZS)","Date","Method","Status"].map(h=>(<th key={h} style={{textAlign:"left",padding:"11px 14px",color:C.muted,fontWeight:600,fontSize:11,letterSpacing:"0.7px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,background:C.navyMid,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
          <tbody>
            {payments.map((p,i)=>(
              <tr key={i} style={{borderBottom:`1px solid rgba(99,102,241,0.07)`}}>
                <td style={{padding:"11px 14px",fontWeight:600,color:C.white}}>{p.school}</td>
                <td style={{padding:"11px 14px",color:C.muted,fontSize:12}}>{p.plan}</td>
                <td style={{padding:"11px 14px",fontWeight:700,color:C.green}}>TZS {p.amount.toLocaleString()}</td>
                <td style={{padding:"11px 14px",color:C.muted,fontSize:12}}>{p.date}</td>
                <td style={{padding:"11px 14px",color:C.muted}}>{p.method}</td>
                <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:p.status==="Paid"?`${C.green}22`:`${C.gold}22`,color:p.status==="Paid"?C.green:C.gold}}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function SuperAdminDashboard(){
  const[tab,setTab]=useState("Platform Overview");
  const tabs={
    "Platform Overview":<PlatformOverview/>,
    "Schools":<SchoolsTab/>,
    "Content Approval":<ContentApprovalTab/>,
    "Upload Papers":<UploadPapersTab/>,
    "Payments":<PaymentsTab/>,
    "Students":<div style={{textAlign:"center",padding:"60px"}}><div style={{fontSize:48,marginBottom:16}}>👨‍🎓</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>All Students</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>52,847 students — connect Supabase to manage.</div></div>,
    "Teachers":<div style={{textAlign:"center",padding:"60px"}}><div style={{fontSize:48,marginBottom:16}}>👨‍🏫</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>All Teachers</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>8,920 teachers — connect Supabase to manage.</div></div>,
    "AI Settings":<div style={{textAlign:"center",padding:"60px"}}><div style={{fontSize:48,marginBottom:16}}>🤖</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>AI Configuration</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Configure Claude AI tutor settings, prompt templates, and rate limits.</div></div>,
    "Notifications":<div style={{textAlign:"center",padding:"60px"}}><div style={{fontSize:48,marginBottom:16}}>📣</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>Platform Notifications</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Send push, SMS, and email notifications to all users.</div></div>,
    "System Settings":<div style={{textAlign:"center",padding:"60px"}}><div style={{fontSize:48,marginBottom:16}}>⚙️</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>System Settings</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Platform configuration, feature flags, and maintenance mode.</div></div>,
  };
  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <Sidebar active={tab} setTab={setTab}/>
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:C.white}}>{tab}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:1}}>ExamHub Tanzania — Super Admin Panel</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{padding:"6px 12px",borderRadius:9,background:`${C.error}22`,border:`1px solid ${C.error}44`,fontSize:11,fontWeight:700,color:C.error}}>SUPER ADMIN</div>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.error},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:"#fff",cursor:"pointer"}}>SA</div>
          </div>
        </div>
        <main style={{flex:1,padding:24,overflowY:"auto"}}>{tabs[tab]}</main>
      </div>
    </div>
  );
}
