// ApprovalQueue — shared for School Admin & Super Admin
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const C = { navy:"#0A1628",navyMid:"#0F1F3D",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444" };
const Bdg = ({label,color}) => (<span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,background:`${color}22`,color,border:`1px solid ${color}44`}}>{label}</span>);

export default function ApprovalQueue({ role, schoolId }) {
  const [items,  setItems]  = useState([]);
  const [loading,setLoading]= useState(true);
  const [acting, setActing] = useState(null);
  const [filter, setFilter] = useState("all");
  const isSA = role === "super_admin";

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_pending_approvals", {
      p_school_id: isSA ? null : (schoolId || null),
    });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (item, action) => {
    setActing(item.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (item.type === "teacher") {
      await supabase.rpc("approve_teacher", {
        p_teacher_id: item.id, p_approver_id: user.id, p_action: action,
      });
    } else {
      await supabase.rpc("approve_school", {
        p_school_id:  item.metadata?.school_id || null,
        p_admin_id:   item.id, p_approver_id: user.id, p_action: action,
      });
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    setActing(null);
  };

  const shown = filter === "all" ? items : items.filter(i => i.type === filter);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60}}>
      <div style={{width:28,height:28,border:`3px solid ${C.border}`,borderTopColor:C.indigo,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontWeight:800,fontSize:17,color:C.white}}>Pending Approvals</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:2}}>{items.length} application{items.length!==1?"s":""} waiting</p>
        </div>
        {isSA && (
          <div style={{display:"flex",gap:7}}>
            {[["all","All"],["teacher","Teachers"],["school_admin","Schools"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:99,fontSize:12,border:`1px solid ${filter===v?C.indigo:C.border}`,background:filter===v?`${C.indigo}22`:"transparent",color:filter===v?C.indigoL:C.muted,fontWeight:filter===v?700:400,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 24px"}}>
          <div style={{fontSize:48,marginBottom:14}}>✅</div>
          <div style={{fontWeight:700,fontSize:16,color:C.white,marginBottom:6}}>All clear!</div>
          <div style={{color:C.muted,fontSize:13}}>No pending approvals right now.</div>
        </div>
      ) : shown.map(item => (
        <div key={item.id} style={{background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
            <div style={{width:46,height:46,borderRadius:12,flexShrink:0,background:item.type==="teacher"?`${C.teal}20`:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
              {item.type==="teacher"?"👨‍🏫":"🏫"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,fontSize:15,color:C.white}}>{item.name}</span>
                <Bdg label={item.type==="teacher"?"Teacher":"School Admin"} color={item.type==="teacher"?C.teal:C.purple}/>
                <Bdg label="Pending" color={C.gold}/>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:4}}>
                {item.type==="teacher" ? `Subjects: ${item.extra||"—"}` : `School: ${item.extra||"—"}`}
                {" · "}{item.region||"—"}
                {" · "}Applied: {new Date(item.submitted).toLocaleDateString("en-TZ",{day:"numeric",month:"short",year:"numeric"})}
              </div>
              {item.metadata?.qualification && (
                <div style={{fontSize:12,color:C.muted}}>Qualification: {item.metadata.qualification}</div>
              )}
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>act(item,"reject")} disabled={acting===item.id}
                style={{padding:"8px 16px",borderRadius:9,background:`${C.error}18`,border:`1px solid ${C.error}44`,color:C.error,fontWeight:600,fontSize:13,cursor:"pointer",opacity:acting===item.id?0.5:1}}>
                ✗ Reject
              </button>
              <button onClick={()=>act(item,"approve")} disabled={acting===item.id}
                style={{padding:"8px 16px",borderRadius:9,background:C.green,border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",opacity:acting===item.id?0.5:1}}>
                {acting===item.id?"Processing…":"✓ Approve"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
