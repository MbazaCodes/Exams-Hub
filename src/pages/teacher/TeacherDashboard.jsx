import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileUploader } from "../../components/upload/FileUploader";
import { downloadPDF } from "../../utils/exportPDF";
import { exportToCSV } from "../../utils/exportExcel";

const C = {
  navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",
  indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",goldL:"#FCD34D",
  teal:"#14B8A6",green:"#10B981",pink:"#EC4899",purple:"#8B5CF6",
  white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444",
};
const px = v => `${v}px`;
const card = (e={}) => ({ background:C.navyCard, border:`1px solid ${C.border}`, borderRadius:px(14), ...e });

// ── Mock Data ────────────────────────────────────────────────────────────
const TEACHER = { name:"Mr. Kamau Joseph", subject:"Biology & Chemistry", school:"Mwl. Nyerere Secondary", classes:["Form 4A","Form 4B","Form 6 PCB"], students:94 };

const STUDENTS = [
  {id:1,name:"Amina Hassan",    class:"Form 4A",avg:88,grade:"A",exams:12,trend:"↑",phone:"0712111111"},
  {id:2,name:"Joseph Mwenda",   class:"Form 4A",avg:65,grade:"C",exams:10,trend:"↑",phone:"0712222222"},
  {id:3,name:"Grace Nyamu",     class:"Form 4B",avg:91,grade:"A",exams:14,trend:"↑",phone:"0712333333"},
  {id:4,name:"Hassan Omar",     class:"Form 4B",avg:52,grade:"D",exams:8, trend:"↓",phone:"0712444444"},
  {id:5,name:"Neema Baraka",    class:"Form 6 PCB",avg:79,grade:"B",exams:11,trend:"↑",phone:"0712555555"},
  {id:6,name:"David Kimani",    class:"Form 6 PCB",avg:84,grade:"A",exams:13,trend:"↑",phone:"0712666666"},
  {id:7,name:"Fatuma Ally",     class:"Form 4A",avg:71,grade:"B",exams:9, trend:"↑",phone:"0712777777"},
  {id:8,name:"Peter Masanja",   class:"Form 4B",avg:58,grade:"C",exams:7, trend:"↓",phone:"0712888888"},
  {id:9,name:"Rehema Juma",     class:"Form 4A",avg:93,grade:"A",exams:15,trend:"↑",phone:"0712999999"},
  {id:10,name:"Omar Salim",     class:"Form 6 PCB",avg:46,grade:"D",exams:6,trend:"↓",phone:"0713000000"},
];

const CLASS_PERFORMANCE = [
  {class:"Form 4A",avg:78,students:32,top:"Rehema Juma",topScore:93},
  {class:"Form 4B",avg:68,students:31,top:"Grace Nyamu",topScore:91},
  {class:"Form 6 PCB",avg:72,students:31,top:"David Kimani",topScore:84},
];

const MONTHLY_TREND = [
  {month:"Aug",avg:64},{month:"Sep",avg:68},{month:"Oct",avg:72},
  {month:"Nov",avg:70},{month:"Dec",avg:74},{month:"Jan",avg:78},
];

const EXAMS = [
  {id:1,title:"Biology Mid-Term 2024",class:"Form 4A,4B",questions:40,status:"Active",  submitted:28,avg:74,created:"2024-11-01"},
  {id:2,title:"Chemistry Quiz 3",     class:"Form 4B",   questions:20,status:"Draft",   submitted:0, avg:0, created:"2024-11-10"},
  {id:3,title:"Biology End-Term",     class:"Form 4A,4B",questions:50,status:"Completed",submitted:63,avg:71,created:"2024-10-01"},
  {id:4,title:"PCB Paper 1 Mock",     class:"Form 6 PCB",questions:60,status:"Completed",submitted:31,avg:68,created:"2024-09-15"},
  {id:5,title:"Cell Biology Quiz",    class:"Form 4A",   questions:15,status:"Scheduled",submitted:0,avg:0, created:"2024-11-20"},
];

const TOPICS_WEAK = [
  {topic:"Organic Chemistry",class:"Form 4B",avgScore:48,students:12},
  {topic:"Genetics",         class:"Form 6 PCB",avgScore:52,students:8},
  {topic:"Osmosis & Diffusion",class:"Form 4A",avgScore:55,students:9},
  {topic:"Photosynthesis",   class:"Form 4A,4B",avgScore:58,students:14},
];

const TABS = ["Dashboard","My Classes","Exam Management","Upload Exam","Student Reports","Homework","Notifications"];

// ── Sub-components ───────────────────────────────────────────────────────
const Sidebar = ({active,setTab}) => (
  <div style={{width:220,minHeight:"100vh",background:C.navyMid,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"20px 0",flexShrink:0}}>
    <div style={{padding:"0 18px 20px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.indigo},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff"}}>E</div>
        <div><div style={{fontWeight:800,fontSize:14,color:C.white}}>ExamHub</div><div style={{fontSize:10,color:C.gold,fontWeight:600}}>Teacher Portal</div></div>
      </div>
    </div>
    <div style={{padding:"16px 14px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},${C.indigo})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>KJ</div>
        <div style={{minWidth:0}}>
          <div style={{fontWeight:700,fontSize:12,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TEACHER.name}</div>
          <div style={{fontSize:10,color:C.muted}}>{TEACHER.subject}</div>
        </div>
      </div>
    </div>
    <nav style={{padding:"10px 10px",flex:1}}>
      {[
        {icon:"📊",label:"Dashboard"},
        {icon:"👥",label:"My Classes"},
        {icon:"📝",label:"Exam Management"},
        {icon:"⬆️",label:"Upload Exam"},
        {icon:"📈",label:"Student Reports"},
        {icon:"📚",label:"Homework"},
        {icon:"🔔",label:"Notifications"},
      ].map(n=>(
        <div key={n.label} onClick={()=>setTab(n.label)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:10,marginBottom:2,background:active===n.label?`${C.indigo}22`:"transparent",border:active===n.label?`1px solid ${C.indigo}44`:"1px solid transparent",cursor:"pointer",color:active===n.label?C.indigoL:C.muted,fontSize:13,fontWeight:active===n.label?700:400}}>
          <span style={{fontSize:16}}>{n.icon}</span>{n.label}
        </div>
      ))}
    </nav>
    <div style={{padding:"10px 14px"}}>
      <a href="/" style={{display:"flex",alignItems:"center",gap:8,padding:"9px 11px",borderRadius:10,color:C.muted,fontSize:12,textDecoration:"none",border:`1px solid ${C.border}`}}>
        ← Back to Student View
      </a>
    </div>
  </div>
);

// ── DASHBOARD TAB ────────────────────────────────────────────────────────
const DashboardTab = () => (
  <div>
    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
      {[
        {icon:"👨‍🎓",label:"Total Students",value:TEACHER.students,color:C.indigo},
        {icon:"📋",label:"Active Exams",value:2,color:C.gold},
        {icon:"📊",label:"Avg Class Score",value:"72%",color:C.green},
        {icon:"⚠️",label:"At Risk Students",value:3,color:C.error},
        {icon:"✅",label:"Exams Completed",value:2,color:C.teal},
        {icon:"📝",label:"Homework Pending",value:5,color:C.purple},
      ].map(s=>(
        <div key={s.label} style={{...card({padding:16}),textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
          <div style={{fontSize:24,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* Trend chart + Class perf */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginBottom:20}}>
      <div style={{...card({padding:22})}}>
        <div style={{fontWeight:700,fontSize:15,color:C.white,marginBottom:4}}>Class Average Trend</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16}}>All classes combined — last 6 months</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={MONTHLY_TREND} margin={{top:4,right:4,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis domain={[55,85]} tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}}/>
            <Line type="monotone" dataKey="avg" stroke={C.indigo} strokeWidth={2.5} dot={{fill:C.indigo,r:4,strokeWidth:0}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{...card({padding:22})}}>
        <div style={{fontWeight:700,fontSize:15,color:C.white,marginBottom:16}}>Class Performance</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {CLASS_PERFORMANCE.map(c=>(
            <div key={c.class} style={{padding:"12px 14px",background:C.navyMid,borderRadius:10,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:13,color:C.white}}>{c.class}</span>
                <span style={{fontWeight:700,fontSize:15,color:c.avg>=75?C.green:c.avg>=60?C.gold:C.error}}>{c.avg}%</span>
              </div>
              <div style={{height:5,background:C.border,borderRadius:99,marginBottom:6}}>
                <div style={{width:`${c.avg}%`,height:"100%",borderRadius:99,background:c.avg>=75?C.green:c.avg>=60?C.gold:C.error}}/>
              </div>
              <div style={{fontSize:11,color:C.muted}}>Top: {c.top} ({c.topScore}%) · {c.students} students</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Weak topics alert */}
    <div style={{...card({padding:22})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,color:C.white}}>⚠️ Weak Topics — Need Attention</div>
        <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:`${C.error}22`,color:C.error,border:`1px solid ${C.error}33`}}>{TOPICS_WEAK.length} topics</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
        {TOPICS_WEAK.map(t=>(
          <div key={t.topic} style={{padding:"14px 16px",background:C.navyMid,borderRadius:10,border:`1px solid ${C.error}33`}}>
            <div style={{fontWeight:600,fontSize:13,color:C.white,marginBottom:3}}>{t.topic}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{t.class} · {t.students} students struggling</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,height:4,background:C.border,borderRadius:99}}>
                <div style={{width:`${t.avgScore}%`,height:"100%",borderRadius:99,background:C.error}}/>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:C.error}}>{t.avgScore}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── MY CLASSES TAB ───────────────────────────────────────────────────────
const ClassesTab = () => {
  const [activeClass, setActiveClass] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = STUDENTS.filter(s =>
    (activeClass === "All" || s.class === activeClass) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportStudentsPDF = () => downloadPDF({
    title: "Student Performance Report",
    subtitle: `${activeClass === "All" ? "All Classes" : activeClass} — ${TEACHER.name}`,
    filename: "student-report",
    columns: [
      {header:"#",key:"id"},{header:"Student Name",key:"name"},{header:"Class",key:"class"},
      {header:"Average",key:"avg"},{header:"Grade",key:"grade"},{header:"Exams Done",key:"exams"},
    ],
    rows: filtered.map(s=>({...s,avg:`${s.avg}%`})),
    footer: `Total: ${filtered.length} students · ExamHub Tanzania`,
  });

  const exportStudentsCSV = () => exportToCSV({
    filename: "student-performance",
    title: "ExamHub Tanzania — Student Performance Report",
    columns: [
      {header:"ID",key:"id"},{header:"Student Name",key:"name"},{header:"Class",key:"class"},
      {header:"Average Score",key:"avg",format:"percent"},{header:"Grade",key:"grade"},
      {header:"Exams Done",key:"exams"},{header:"Trend",key:"trend"},{header:"Phone",key:"phone"},
    ],
    rows: filtered,
  });

  return (
    <div>
      {/* Class filter */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {["All",...TEACHER.classes].map(c=>(
          <button key={c} onClick={()=>setActiveClass(c)} style={{padding:"7px 16px",borderRadius:99,border:`1px solid ${activeClass===c?C.indigo:C.border}`,background:activeClass===c?`${C.indigo}22`:"transparent",color:activeClass===c?C.indigoL:C.muted,fontWeight:activeClass===c?700:400,fontSize:13,cursor:"pointer"}}>
            {c}
          </button>
        ))}
      </div>

      {/* Search + export actions */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students..."
            style={{width:"100%",padding:"10px 14px 10px 38px",borderRadius:10,background:C.navyCard,border:`1px solid ${C.border}`,color:C.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>
        <button onClick={exportStudentsPDF} style={{padding:"10px 16px",borderRadius:10,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
          📄 Export PDF
        </button>
        <button onClick={exportStudentsCSV} style={{padding:"10px 16px",borderRadius:10,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
          📊 Export Excel
        </button>
        <button style={{padding:"10px 16px",borderRadius:10,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontWeight:600,fontSize:13,cursor:"pointer"}}>
          + Add Student
        </button>
      </div>

      {/* Students table */}
      <div style={{...card({padding:0}),overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr>
                {["#","Student Name","Class","Avg Score","Grade","Exams Done","Trend","Actions"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"11px 14px",color:C.muted,fontWeight:600,fontSize:11,letterSpacing:"0.7px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,background:C.navyMid,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={s.id} style={{borderBottom:`1px solid rgba(99,102,241,0.07)`}}>
                  <td style={{padding:"11px 14px",color:C.muted}}>{i+1}</td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.indigo},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>
                        {s.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <span style={{fontWeight:600,color:C.white}}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"11px 14px",color:C.muted}}>{s.class}</td>
                  <td style={{padding:"11px 14px"}}>
                    <span style={{fontWeight:700,color:s.avg>=80?C.green:s.avg>=65?C.gold:C.error}}>{s.avg}%</span>
                  </td>
                  <td style={{padding:"11px 14px"}}>
                    <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:s.grade==="A"?`${C.green}22`:s.grade==="B"?`${C.gold}22`:`${C.error}22`,color:s.grade==="A"?C.green:s.grade==="B"?C.gold:C.error}}>Grade {s.grade}</span>
                  </td>
                  <td style={{padding:"11px 14px",color:C.muted}}>{s.exams}</td>
                  <td style={{padding:"11px 14px",color:s.trend==="↑"?C.green:C.error,fontWeight:700,fontSize:16}}>{s.trend}</td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{padding:"5px 11px",borderRadius:7,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontSize:11,fontWeight:600,cursor:"pointer"}}>Profile</button>
                      <button style={{padding:"5px 11px",borderRadius:7,background:`${C.gold}22`,border:`1px solid ${C.gold}44`,color:C.gold,fontSize:11,fontWeight:600,cursor:"pointer"}}>Message</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,fontSize:12,color:C.muted}}>
          Showing {filtered.length} of {STUDENTS.length} students
        </div>
      </div>
    </div>
  );
};

// ── EXAM MANAGEMENT TAB ──────────────────────────────────────────────────
const ExamsTab = ({setTab}) => {
  const [filter, setFilter] = useState("All");
  const statuses = ["All","Active","Draft","Scheduled","Completed"];
  const filtered = EXAMS.filter(e => filter === "All" || e.status === filter);
  const statusColor = s => ({Active:C.green,Draft:C.gold,Scheduled:C.teal,Completed:C.muted}[s]||C.muted);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {statuses.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"7px 15px",borderRadius:99,border:`1px solid ${filter===s?C.indigo:C.border}`,background:filter===s?`${C.indigo}22`:"transparent",color:filter===s?C.indigoL:C.muted,fontWeight:filter===s?700:400,fontSize:13,cursor:"pointer"}}>{s}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setTab("Upload Exam")} style={{padding:"10px 18px",borderRadius:10,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontWeight:600,fontSize:13,cursor:"pointer"}}>
            ⬆️ Upload PDF Exam
          </button>
          <button style={{padding:"10px 18px",borderRadius:10,background:C.gold,border:"none",color:C.navy,fontWeight:700,fontSize:13,cursor:"pointer"}}>
            + Create New Exam
          </button>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map(e=>(
          <div key={e.id} style={{...card({padding:"18px 20px"}),display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{width:44,height:44,borderRadius:11,background:statusColor(e.status)+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📝</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:3}}>{e.title}</div>
              <div style={{fontSize:12,color:C.muted}}>{e.class} · {e.questions} questions · Created {e.created}</div>
            </div>
            {e.submitted > 0 && (
              <div style={{textAlign:"center",padding:"8px 14px",background:C.navyMid,borderRadius:9}}>
                <div style={{fontWeight:700,fontSize:15,color:C.white}}>{e.avg}%</div>
                <div style={{fontSize:10,color:C.muted}}>Avg Score</div>
              </div>
            )}
            {e.submitted > 0 && (
              <div style={{textAlign:"center",padding:"8px 14px",background:C.navyMid,borderRadius:9}}>
                <div style={{fontWeight:700,fontSize:15,color:C.white}}>{e.submitted}</div>
                <div style={{fontSize:10,color:C.muted}}>Submitted</div>
              </div>
            )}
            <span style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:statusColor(e.status)+"20",color:statusColor(e.status),flexShrink:0}}>{e.status}</span>
            <div style={{display:"flex",gap:7,flexShrink:0}}>
              <button style={{padding:"8px 14px",borderRadius:9,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontSize:12,fontWeight:600,cursor:"pointer"}}>Edit</button>
              <button style={{padding:"8px 14px",borderRadius:9,background:`${C.teal}22`,border:`1px solid ${C.teal}44`,color:C.teal,fontSize:12,fontWeight:600,cursor:"pointer"}}>Results</button>
              <button onClick={()=>downloadPDF({title:e.title,subtitle:e.class,filename:`exam-${e.id}`,columns:[{header:"Question",key:"q"},{header:"Marks",key:"m"}],rows:[{q:"Sample Q1",m:2}]})}
                style={{padding:"8px 14px",borderRadius:9,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                📄 PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── UPLOAD EXAM TAB ──────────────────────────────────────────────────────
const UploadTab = () => {
  const [form, setForm] = useState({ subject:"", year:"", type:"NECTA", paper:"Paper 1", class:"Form 4A", duration:"120" });
  const [step, setStep] = useState(1); // 1=upload, 2=details, 3=done
  const set = k => v => setForm(p=>({...p,[k]:v}));
  const inputStyle = {width:"100%",padding:"10px 13px",borderRadius:9,background:"rgba(15,31,61,0.85)",border:`1px solid ${C.border}`,color:C.white,fontSize:13,outline:"none",boxSizing:"border-box"};

  return (
    <div style={{maxWidth:680}}>
      {/* Stepper */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28}}>
        {["Upload PDF","Add Details","Review & Publish"].map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:step>i+1?C.green:step===i+1?C.indigo:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>
                {step>i+1?"✓":i+1}
              </div>
              <span style={{fontSize:11,color:step===i+1?C.white:C.muted,fontWeight:step===i+1?600:400,whiteSpace:"nowrap"}}>{s}</span>
            </div>
            {i<2&&<div style={{flex:1,height:1,background:step>i+1?C.green:C.border,margin:"0 12px",marginBottom:22}}/>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{...card({padding:24})}}>
          <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:4}}>Upload Past Paper PDF</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:20}}>AI will automatically extract questions and convert to digital exam format.</div>
          <FileUploader
            accept=".pdf,.doc,.docx"
            label="Drop your exam PDF here"
            hint="Supports PDF, Word (.docx) · Max 20MB"
            maxSizeMB={20}
            processingLabel="AI is extracting questions"
            onProcess={async (files) => {
              await new Promise(r=>setTimeout(r,2500));
              console.log("Files:", files);
            }}
          />
          <div style={{marginTop:20,padding:"14px 16px",background:`${C.purple}15`,border:`1px solid ${C.purple}33`,borderRadius:10}}>
            <div style={{fontWeight:600,fontSize:13,color:C.purple,marginBottom:4}}>🤖 AI Processing includes:</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {["Extract all questions and options automatically","Detect question type (MCQ, True/False, Short Answer)","OCR for scanned/image-based PDFs","Generate marking scheme from answer keys","Map questions to topics and difficulty"].map(f=>(
                <div key={f} style={{fontSize:12,color:C.muted,display:"flex",gap:7}}>
                  <span style={{color:C.purple}}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setStep(2)} style={{marginTop:16,width:"100%",padding:"12px 0",borderRadius:10,background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            Next: Add Details →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{...card({padding:24})}}>
          <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:20}}>Exam Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {label:"Subject",key:"subject",placeholder:"e.g. Biology"},
              {label:"Year",key:"year",placeholder:"e.g. 2024"},
              {label:"Paper",key:"paper",placeholder:"e.g. Paper 1"},
              {label:"Duration (mins)",key:"duration",placeholder:"e.g. 120"},
            ].map(f=>(
              <div key={f.key}>
                <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>{f.label}</label>
                <input value={form[f.key]} onChange={e=>set(f.key)(e.target.value)} placeholder={f.placeholder} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor=C.indigo} onBlur={e=>e.target.style.borderColor=C.border}/>
              </div>
            ))}
            <div>
              <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Exam Type</label>
              <select value={form.type} onChange={e=>set("type")(e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                {["NECTA","Mock Exam","Pre-National","Regional","District","School Exam"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Assign to Class</label>
              <select value={form.class} onChange={e=>set("class")(e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                {["All Classes",...TEACHER.classes].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Also upload marking scheme */}
          <div style={{marginTop:20}}>
            <div style={{fontWeight:600,fontSize:13,color:C.white,marginBottom:10}}>Upload Marking Scheme (optional)</div>
            <FileUploader accept=".pdf,.docx" label="Attach marking scheme" hint="PDF or Word · Max 10MB" maxSizeMB={10}/>
          </div>

          <div style={{display:"flex",gap:10,marginTop:20}}>
            <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px 0",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontWeight:600,fontSize:14,cursor:"pointer"}}>← Back</button>
            <button onClick={()=>setStep(3)} style={{flex:2,padding:"12px 0",borderRadius:10,background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Review →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{...card({padding:24})}}>
          <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:20}}>Review & Publish</div>
          <div style={{background:C.navyMid,borderRadius:10,padding:"16px 18px",marginBottom:16,border:`1px solid ${C.border}`}}>
            {[
              ["Subject",  form.subject || "Not set"],
              ["Year",     form.year    || "Not set"],
              ["Exam Type",form.type],
              ["Paper",    form.paper],
              ["Class",    form.class],
              ["Duration", `${form.duration} minutes`],
              ["Questions","40 extracted by AI"],
              ["Status",   "Ready to publish"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                <span style={{color:C.muted}}>{k}</span>
                <span style={{color:C.white,fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{background:`${C.gold}12`,border:`1px solid ${C.gold}33`,borderRadius:10,padding:"12px 14px",marginBottom:20,fontSize:13,color:C.gold}}>
            ⚡ Once published, students in {form.class} will be notified immediately.
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(2)} style={{flex:1,padding:"12px 0",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontWeight:600,fontSize:14,cursor:"pointer"}}>← Edit</button>
            <button onClick={()=>setStep(1)} style={{flex:1,padding:"12px 0",borderRadius:10,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:14,cursor:"pointer"}}>
              💾 Save Draft
            </button>
            <button style={{flex:2,padding:"12px 0",borderRadius:10,background:C.green,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              🚀 Publish Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── REPORTS TAB ──────────────────────────────────────────────────────────
const ReportsTab = () => {
  const [period, setPeriod] = useState("This Term");

  const exportFullReport = () => {
    downloadPDF({
      title: "Comprehensive Student Performance Report",
      subtitle: `${TEACHER.name} · ${period} · ${TEACHER.school}`,
      filename: "full-student-report",
      columns: [
        {header:"Student",key:"name"},{header:"Class",key:"class"},
        {header:"Average",key:"avg"},{header:"Grade",key:"grade"},
        {header:"Exams",key:"exams"},{header:"Trend",key:"trend"},
      ],
      rows: STUDENTS.map(s=>({...s,avg:`${s.avg}%`})),
      footer:`Report by ExamHub Tanzania · ${new Date().toLocaleDateString("en-TZ")}`,
    });
  };

  const exportExcelReport = () => {
    exportToCSV({
      filename: "full-student-performance",
      title: `Student Performance Report — ${period}`,
      columns: [
        {header:"Student Name",key:"name"},{header:"Class",key:"class"},
        {header:"Average Score (%)",key:"avg",format:"number"},
        {header:"Grade",key:"grade"},{header:"Exams Completed",key:"exams"},
        {header:"Performance Trend",key:"trend"},{header:"Contact",key:"phone"},
      ],
      rows: STUDENTS,
    });
  };

  return (
    <div>
      {/* Controls */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:8}}>
          {["This Week","This Month","This Term","Full Year"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:"7px 15px",borderRadius:99,border:`1px solid ${period===p?C.indigo:C.border}`,background:period===p?`${C.indigo}22`:"transparent",color:period===p?C.indigoL:C.muted,fontWeight:period===p?700:400,fontSize:12,cursor:"pointer"}}>{p}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={exportFullReport} style={{padding:"10px 16px",borderRadius:10,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            📄 Download PDF Report
          </button>
          <button onClick={exportExcelReport} style={{padding:"10px 16px",borderRadius:10,background:`${C.green}22`,border:`1px solid ${C.green}44`,color:C.green,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            📊 Download Excel Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:20}}>
        {[
          {label:"Overall Pass Rate",value:"84%",sub:"≥50% average",color:C.green},
          {label:"Division I Students",value:"12",sub:"Score ≥75%",color:C.indigo},
          {label:"At Risk Students",value:"3",sub:"Score <50%",color:C.error},
          {label:"Most Improved",value:"Joseph M.",sub:"+13pts this term",color:C.gold},
        ].map(s=>(
          <div key={s.label} style={{...card({padding:18})}}>
            <div style={{fontSize:26,fontWeight:900,color:s.color,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:13,color:C.white,fontWeight:600,marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:11,color:C.muted}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Detailed chart */}
      <div style={{...card({padding:22}),marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,color:C.white,marginBottom:16}}>Score Distribution — All Classes</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={STUDENTS.map(s=>({name:s.name.split(" ")[0],score:s.avg}))} margin={{top:4,right:4,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,100]} tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.navyMid,border:`1px solid ${C.border}`,borderRadius:10,color:C.white,fontSize:12}}/>
            <Bar dataKey="score" radius={[5,5,0,0]} maxBarSize={28}
              fill={C.indigo}
              label={{position:"top",fontSize:10,fill:C.muted,formatter:v=>`${v}%`}}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── HOMEWORK TAB ─────────────────────────────────────────────────────────
const HomeworkTab = () => {
  const [showCreate, setShowCreate] = useState(false);
  const hw = [
    {id:1,title:"Chapter 5 — Cell Division Questions",class:"Form 4A,4B",due:"2024-11-25",submitted:18,total:63,status:"Active"},
    {id:2,title:"Genetics Problem Set",class:"Form 6 PCB",due:"2024-11-20",submitted:31,total:31,status:"Completed"},
    {id:3,title:"Photosynthesis Essay",class:"Form 4A",due:"2024-12-02",submitted:5,total:32,status:"Active"},
  ];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
        <button onClick={()=>setShowCreate(s=>!s)} style={{padding:"10px 20px",borderRadius:10,background:C.gold,border:"none",color:C.navy,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          + Create Homework
        </button>
      </div>

      {showCreate && (
        <div style={{...card({padding:22,borderColor:C.gold+"44"}),marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:15,color:C.white,marginBottom:16}}>New Homework Assignment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[["Title","e.g. Chapter 5 Exercise"],["Due Date",""],["Subject","e.g. Biology"],["Max Marks","e.g. 20"]].map(([l,p],i)=>(
              <div key={l}>
                <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>{l}</label>
                <input type={l==="Due Date"?"date":"text"} placeholder={p}
                  style={{width:"100%",padding:"10px 13px",borderRadius:9,background:"rgba(15,31,61,0.85)",border:`1px solid ${C.border}`,color:C.white,fontSize:13,outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>Instructions</label>
            <textarea placeholder="Write assignment instructions here..." rows={3}
              style={{width:"100%",padding:"10px 13px",borderRadius:9,background:"rgba(15,31,61,0.85)",border:`1px solid ${C.border}`,color:C.white,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:C.muted,fontWeight:600,marginBottom:8}}>ATTACH FILES (optional)</div>
            <FileUploader accept=".pdf,.docx,.xlsx" label="Attach homework file" hint="PDF, Word, or Excel · Max 10MB" maxSizeMB={10}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowCreate(false)} style={{flex:1,padding:"11px 0",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancel</button>
            <button style={{flex:2,padding:"11px 0",borderRadius:10,background:C.gold,border:"none",color:C.navy,fontWeight:700,fontSize:13,cursor:"pointer"}}>📤 Assign to Students</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {hw.map(h=>(
          <div key={h.id} style={{...card({padding:"16px 20px"}),display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{width:42,height:42,borderRadius:10,background:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📚</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:3}}>{h.title}</div>
              <div style={{fontSize:12,color:C.muted}}>{h.class} · Due: {h.due}</div>
            </div>
            <div style={{textAlign:"center",padding:"8px 14px",background:C.navyMid,borderRadius:9}}>
              <div style={{fontWeight:700,fontSize:15,color:C.white}}>{h.submitted}/{h.total}</div>
              <div style={{fontSize:10,color:C.muted}}>Submitted</div>
            </div>
            <div style={{height:36,width:36,position:"relative"}}>
              <svg viewBox="0 0 36 36" style={{transform:"rotate(-90deg)"}}>
                <circle cx="18" cy="18" r="15" fill="none" stroke={C.border} strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke={h.submitted===h.total?C.green:C.gold} strokeWidth="3"
                  strokeDasharray={2*Math.PI*15}
                  strokeDashoffset={2*Math.PI*15*(1-h.submitted/h.total)}
                  strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.white}}>
                {Math.round(h.submitted/h.total*100)}%
              </div>
            </div>
            <span style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,background:h.status==="Active"?`${C.green}22`:`${C.muted}22`,color:h.status==="Active"?C.green:C.muted}}>{h.status}</span>
            <div style={{display:"flex",gap:6}}>
              <button style={{padding:"7px 12px",borderRadius:8,background:`${C.indigo}22`,border:`1px solid ${C.indigo}44`,color:C.indigoL,fontSize:11,fontWeight:600,cursor:"pointer"}}>View</button>
              <button onClick={()=>downloadPDF({title:h.title,subtitle:h.class,filename:`hw-${h.id}`,columns:[{header:"Student",key:"s"},{header:"Submitted",key:"t"}],rows:[]})}
                style={{padding:"7px 12px",borderRadius:8,background:`${C.error}22`,border:`1px solid ${C.error}44`,color:C.error,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                📄 PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const tabContent = {
    "Dashboard":       <DashboardTab/>,
    "My Classes":      <ClassesTab/>,
    "Exam Management": <ExamsTab setTab={setActiveTab}/>,
    "Upload Exam":     <UploadTab/>,
    "Student Reports": <ReportsTab/>,
    "Homework":        <HomeworkTab/>,
    "Notifications":   (
      <div style={{textAlign:"center",padding:"60px 24px"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔔</div>
        <div style={{fontWeight:700,fontSize:18,color:C.white,marginBottom:8}}>Notifications</div>
        <div style={{color:C.muted,fontSize:14}}>3 new notifications — connect Supabase to enable real-time alerts.</div>
      </div>
    ),
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.navy,color:C.white,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <Sidebar active={activeTab} setTab={setActiveTab}/>
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`,background:C.navy,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:C.white}}>{activeTab}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:1}}>{TEACHER.school} · {TEACHER.subject}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{padding:"7px 14px",borderRadius:10,background:`${C.teal}18`,border:`1px solid ${C.teal}33`,fontSize:12,fontWeight:600,color:C.teal}}>
              👨‍🏫 {TEACHER.students} Students
            </div>
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},${C.indigo})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer"}}>KJ</div>
          </div>
        </div>
        <main style={{flex:1,padding:24,overflowY:"auto"}}>
          {tabContent[activeTab]}
        </main>
      </div>
    </div>
  );
}
