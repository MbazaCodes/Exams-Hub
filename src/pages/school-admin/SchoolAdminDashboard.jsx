import ApprovalQueue from "../roles/ApprovalQueue";
import { useState } from "react";
import { BarChart,Bar,AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer } from "recharts";
import { downloadPDF } from "../../utils/exportPDF";
import { exportToCSV } from "../../utils/exportExcel";
import { FileUploader } from "../../components/upload/FileUploader";

const C={navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444"};
const px=v=>`${v}px`;
const card=(e={})=>({background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:px(14),...e});

const SCHOOL={name:"Mwl. Julius K. Nyerere Secondary School",reg:"S.1234/2001",region:"Dar es Salaam",district:"Kinondoni",type:"Government",students:876,teachers:42,classes:24,established:2001};
const SUBJECTS_PERF=[
  {subject:"Biology",avg:81,pass:94,trend:"↑"},{subject:"English",avg:76,pass:88,trend:"↑"},
  {subject:"Mathematics",avg:61,pass:72,trend:"↓"},{subject:"Chemistry",avg:58,pass:68,trend:"↓"},
  {subject:"Physics",avg:72,pass:85,trend:"↑"},{subject:"History",avg:83,pass:96,trend:"↑"},
  {subject:"Geography",avg:78,pass:90,trend:"↑"},{subject:"Kiswahili",avg:85,pass:97,trend:"↑"},
];
const TEACHERS=[
  {id:1,name:"Mr. Kamau Joseph",  subjects:"Biology,Chemistry",classes:3,students:94,avg:74,status:"Active"},
  {id:2,name:"Ms. Fatuma Ally",   subjects:"Mathematics",classes:4,students:120,avg:65,status:"Active"},
  {id:3,name:"Mr. David Kimani",  subjects:"Physics",classes:3,students:91,avg:71,status:"Active"},
  {id:4,name:"Ms. Grace Nyamu",   subjects:"English",classes:4,students:118,avg:79,status:"Active"},
  {id:5,name:"Mr. Hassan Omar",   subjects:"History,Civics",classes:3,students:90,avg:82,status:"On Leave"},
  {id:6,name:"Ms. Rehema Juma",   subjects:"Geography",classes:3,students:89,avg:77,status:"Active"},
];
const MONTHLY=[
  {month:"Aug",pass:76},{month:"Sep",pass:79},{month:"Oct",pass:81},
  {month:"Nov",pass:80},{month:"Dec",pass:83},{month:"Jan",pass:84},
];
const NAV=[
  {icon:"📊",label:"Overview"},
  {icon:"👨‍🎓",label:"Students"},
  {icon:"👨‍🏫",label:"Teachers"},
  {icon:"📚",label:"Subjects"},
  {icon:"📝",label:"Exams"},
  {icon:"📈",label:"Reports"},
  {icon:"⬆️",label:"Imports"},
  {icon:"⏳",label:"Approvals"},
  {icon:"⚙️",label:"Settings"},
];

const Sidebar=({active,setTab})=>(
  <div style={{width:220,minHeight:"100vh",background:C.navyMid,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"20px 0",flexShrink:0}}>
    <div style={{padding:"0 16px 18px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff"}}>E</div>
        <div><div style={{fontWeight:800,fontSize:13,color:C.white}}>ExamHub</div><div style={{fontSize:10,color:C.teal,fontWeight:600}}>School Admin</div></div>
      </div>
    </div>
    <div style={{padding:"12px 14px 12px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.muted,lineHeight:1.5}}>
      <div style={{fontWeight:700,fontSize:12,color:C.white,marginBottom:2}}>{SCHOOL.name.split(" ").slice(0,4).join(" ")}...</div>
      <div>{SCHOOL.region} · Reg: {SCHOOL.reg}</div>
    </div>
    <nav style={{padding:"10px 9px",flex:1}}>
      {NAV.map(n=>(
        <div key={n.label} onClick={()=>setTab(n.label)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:9,marginBottom:2,background:active===n.label?`${C.indigo}22`:"transparent",border:active===n.label?`1px solid ${C.indigo}44`:"1px solid transparent",cursor:"pointer",color:active===n.label?C.indigoL:C.muted,fontSize:13,fontWeight:active===n.label?700:400}}>
          <span style={{fontSize:15}}>{n.icon}</span>{n.label}
        </div>
      ))}
    </nav>
  </div>
);

const OverviewTab=()=>(
  <div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
      {[
        {icon:"👨‍🎓",label:"Total Students",value:SCHOOL.students,color:C.indigo},
        {icon:"👨‍🏫",label:"Teachers",value:SCHOOL.teachers,color:C.teal},
        {icon:"🏛️",label:"Classes",value:SCHOOL.classes,color:C.purple},
        {icon:"📊",label:"Avg Pass Rate",value:"84%",color:C.green},
        {icon:"📝",label:"Exams This Term",value:18,color:C.gold},
        {icon:"⚠️",label:"At Risk Students",value:23,color:C.error},
      ].map(s=>(
        <div key={s.label} style={{...card({padding:16}),textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:7}}>{s.icon}</div>
          <div style={{fontSize:22,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>{s.label}</div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:16}}>
      <div style={{...card({padding:22})}}>
        <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:16}}>Monthly Pass Rate Trend</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY} margin={{top:4,right:4,left:-20,bottom:0}}>
            <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis domain={[70,100]} tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}} formatter={v=>[`${v}%`,"Pass Rate"]}/>
            <Area type="monotone" dataKey="pass" stroke={C.green} strokeWidth={2.5} fill="url(#pg)" dot={{fill:C.green,r:4,strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{...card({padding:22})}}>
        <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:16}}>Subject Pass Rates</div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {SUBJECTS_PERF.sort((a,b)=>b.pass-a.pass).map(s=>(
            <div key={s.subject}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:C.white,fontWeight:500}}>{s.subject}</span>
                <div style={{display:"flex",gap:8}}>
                  <span style={{color:C.muted}}>Avg {s.avg}%</span>
                  <span style={{fontWeight:700,color:s.pass>=85?C.green:s.pass>=70?C.gold:C.error}}>{s.pass}% pass</span>
                  <span style={{color:s.trend==="↑"?C.green:C.error}}>{s.trend}</span>
                </div>
              </div>
              <div style={{height:4,background:C.border,borderRadius:99}}>
                <div style={{width:`${s.pass}%`,height:"100%",borderRadius:99,background:s.pass>=85?C.green:s.pass>=70?C.gold:C.error}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TeachersTab=()=>{
  const exportTeachers=()=>exportToCSV({filename:"teachers-report",title:"Teachers Performance Report",columns:[{header:"Name",key:"name"},{header:"Subjects",key:"subjects"},{header:"Classes",key:"classes"},{header:"Students",key:"students"},{header:"Avg Score",key:"avg",format:"number"},{header:"Status",key:"status"}],rows:TEACHERS});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontWeight:700,fontSize:16,color:C.white}}>{TEACHERS.length} Teachers</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>downloadPDF({title:"Teacher Performance Report",subtitle:SCHOOL.name,filename:"teachers",columns:[{header:"Name",key:"name"},{header:"Subjects",key:"subjects"},{header:"Students",key:"students"},{header:"Avg",key:"avg"}],rows:TEACHERS.map(t=>({...t,avg:`${t.avg}%`}))})} style={{padding:"9px 15px",borderRadius:9,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontWeight:600,fontSize:12,cursor:"pointer"}}>📄 PDF</button>
          <button onClick={exportTeachers} style={{padding:"9px 15px",borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:12,cursor:"pointer"}}>📊 Excel</button>
          <button style={{padding:"9px 15px",borderRadius:9,background:C.indigo,border:"none",color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer"}}>+ Add Teacher</button>
        </div>
      </div>
      <div style={{...card({padding:0}),overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr>{["Teacher","Subjects","Classes","Students","Class Avg","Status","Actions"].map(h=>(<th key={h} style={{textAlign:"left",padding:"11px 14px",color:C.muted,fontWeight:600,fontSize:11,letterSpacing:"0.7px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,background:C.navyMid,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
          <tbody>
            {TEACHERS.map(t=>(
              <tr key={t.id} style={{borderBottom:`1px solid rgba(99,102,241,0.07)`}}>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{t.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                    <span style={{fontWeight:600,color:C.white}}>{t.name}</span>
                  </div>
                </td>
                <td style={{padding:"11px 14px",color:C.muted,fontSize:12}}>{t.subjects}</td>
                <td style={{padding:"11px 14px",color:C.white}}>{t.classes}</td>
                <td style={{padding:"11px 14px",color:C.white}}>{t.students}</td>
                <td style={{padding:"11px 14px"}}><span style={{fontWeight:700,color:t.avg>=75?C.green:t.avg>=60?C.gold:C.error}}>{t.avg}%</span></td>
                <td style={{padding:"11px 14px"}}><span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:t.status==="Active"?`${C.green}22`:`${C.gold}22`,color:t.status==="Active"?C.green:C.gold}}>{t.status}</span></td>
                <td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:5}}><button style={{padding:"5px 10px",borderRadius:7,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontSize:11,cursor:"pointer"}}>View</button><button style={{padding:"5px 10px",borderRadius:7,background:`${C.gold}22`,border:`1px solid ${C.gold}44`,color:C.gold,fontSize:11,cursor:"pointer"}}>Report</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ImportsTab=()=>(
  <div style={{maxWidth:600}}>
    <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:4}}>Bulk Data Import</div>
    <div style={{fontSize:13,color:C.muted,marginBottom:24}}>Import students, teachers, or exam results in bulk via CSV/Excel files.</div>
    {[
      {title:"Import Students",icon:"👨‍🎓",hint:"Upload student list — CSV or Excel with: Name, Gender, DOB, Class, Stream",color:C.indigo,template:[{header:"Full Name",key:"name"},{header:"Gender",key:"gender"},{header:"Date of Birth",key:"dob"},{header:"Class",key:"class"},{header:"Stream",key:"stream"},{header:"Phone",key:"phone"}]},
      {title:"Import Teachers",icon:"👨‍🏫",hint:"Upload teacher list with: Name, Subjects, Classes, Email, Phone",color:C.teal,template:[]},
      {title:"Import Exam Results",icon:"📊",hint:"Upload exam results — CSV with Student ID, Exam Name, Score",color:C.green,template:[]},
    ].map((item,i)=>(
      <div key={i} style={{...card({padding:22,marginBottom:14,borderColor:item.color+"33"})}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:42,height:42,borderRadius:11,background:item.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{item.icon}</div>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.white}}>{item.title}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{item.hint}</div>
          </div>
          <button onClick={()=>exportToCSV({filename:`template-${item.title.toLowerCase().replace(/ /g,"-")}`,title:`${item.title} Template`,columns:item.template.length?item.template:[{header:"Column A",key:"a"},{header:"Column B",key:"b"}],rows:[]})}
            style={{marginLeft:"auto",padding:"7px 14px",borderRadius:8,background:`${item.color}20`,border:`1px solid ${item.color}44`,color:item.color,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>
            📥 Download Template
          </button>
        </div>
        <FileUploader accept=".csv,.xlsx,.xls" label={`Upload ${item.title.split(" ")[1]} File`} hint="CSV or Excel (.xlsx) · Max 5MB" maxSizeMB={5} processingLabel={`Importing ${item.title.split(" ")[1].toLowerCase()}s`}
          onProcess={async()=>{ await new Promise(r=>setTimeout(r,2000)); }}/>
      </div>
    ))}
  </div>
);

export default function SchoolAdminDashboard(){
  const[tab,setTab]=useState("Overview");
  const tabs={Overview:<OverviewTab/>,Teachers:<TeachersTab/>,Imports:<ImportsTab/>,
    Students:<div style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>👨‍🎓</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>Students Management</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Full student management — connect Supabase to load real data.</div></div>,
    Subjects:<div style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📚</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>Subject Analytics</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Detailed subject breakdown available — connect Supabase.</div></div>,
    Exams:<div style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📝</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>School Exams</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Exam schedule and results — connect Supabase.</div></div>,
    Reports:<div style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📈</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>School Reports</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>Full report generation with PDF/Excel export.</div></div>,
    Settings:<div style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>⚙️</div><div style={{fontWeight:700,fontSize:18,color:C.white}}>School Settings</div><div style={{color:C.muted,fontSize:14,marginTop:8}}>School profile, branding, and configuration.</div></div>,
  };
  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <Sidebar active={tab} setTab={setTab}/>
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:C.white}}>{tab}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:1}}>{SCHOOL.name}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>downloadPDF({title:"School Performance Report",subtitle:SCHOOL.name,filename:"school-report",columns:[{header:"Subject",key:"subject"},{header:"Avg",key:"avg"},{header:"Pass Rate",key:"pass"}],rows:SUBJECTS_PERF.map(s=>({...s,avg:`${s.avg}%`,pass:`${s.pass}%`}))})} style={{padding:"8px 14px",borderRadius:9,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontWeight:600,fontSize:12,cursor:"pointer"}}>📄 PDF Report</button>
            <button onClick={()=>exportToCSV({filename:"school-performance",title:SCHOOL.name+" Performance",columns:[{header:"Subject",key:"subject"},{header:"Average",key:"avg",format:"number"},{header:"Pass Rate",key:"pass",format:"number"},{header:"Trend",key:"trend"}],rows:SUBJECTS_PERF})} style={{padding:"8px 14px",borderRadius:9,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:12,cursor:"pointer"}}>📊 Excel</button>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},${C.indigo})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:"#fff",cursor:"pointer"}}>SA</div>
          </div>
        </div>
        <main style={{flex:1,padding:24,overflowY:"auto"}}>{tabs[tab]}</main>
      </div>
    </div>
  );
}
