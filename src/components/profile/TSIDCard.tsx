// ── TSID Card — shown in student dashboard ─────────────────────
import { useState } from "react";
import { linkTSID, syncFromTSID, fetchTSIDProfile, formatTSID, isValidTSID } from "@/lib/tsid";

const C = { navy:"#0A1628",navyCard:"#111E35",indigo:"#4F46E5",indigoL:"#6366F1",gold:"#F59E0B",teal:"#14B8A6",green:"#10B981",purple:"#8B5CF6",white:"#F0F4FF",muted:"#94A3B8",border:"rgba(99,102,241,0.18)",error:"#EF4444" };

interface TSIDCardProps { userId:string; tsid?:string; tsidVerified:boolean; onLinked:(tsid:string)=>void; onSynced:()=>void; }

export function TSIDCard({ userId, tsid, tsidVerified, onLinked, onSynced }: TSIDCardProps) {
  const [input,   setInput]   = useState("");
  const [mode,    setMode]    = useState<"view"|"link"|"preview">("view");
  const [preview, setPreview] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleLookup = async () => {
    if (!isValidTSID(input)) { setError("Format: TSID00000001"); return; }
    setLoading(true); setError("");
    const { data, error: e } = await fetchTSIDProfile(input.toUpperCase().trim());
    if (e || !data) { setError(e ?? "Not found"); setLoading(false); return; }
    setPreview(data as Record<string,unknown>); setMode("preview"); setLoading(false);
  };

  const handleLink = async () => {
    setLoading(true); setError("");
    const { error: e } = await linkTSID(userId, input.toUpperCase().trim());
    if (e) { setError(e); setLoading(false); return; }
    setSuccess("TSID linked!"); setMode("view"); onLinked(input.toUpperCase().trim()); setLoading(false);
  };

  const handleSync = async () => {
    if (!tsid) return;
    setSyncing(true); setError(""); setSuccess("");
    const { error: e } = await syncFromTSID(userId, tsid);
    if (e) { setError(e); setSyncing(false); return; }
    setSuccess("Profile synced ✓"); onSynced(); setSyncing(false);
  };

  if (tsid && mode === "view") return (
    <div style={{background:`${tsidVerified?C.green:C.gold}10`,border:`1px solid ${tsidVerified?C.green:C.gold}44`,borderRadius:14,padding:"18px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:28}}>🪪</span>
          <div>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:2}}>Tanzania Student ID</div>
            <div style={{fontSize:18,fontWeight:900,color:C.white,fontFamily:"'Courier New',monospace",letterSpacing:2}}>{formatTSID(tsid)}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:tsidVerified?C.green:C.gold,display:"inline-block"}}/>
              <span style={{fontSize:11,color:tsidVerified?C.green:C.gold,fontWeight:600}}>{tsidVerified?"Verified":"Pending verification"}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleSync} disabled={syncing} style={{padding:"7px 14px",borderRadius:9,background:`${C.teal}22`,border:`1px solid ${C.teal}44`,color:C.teal,fontWeight:600,fontSize:12,cursor:"pointer",opacity:syncing?0.6:1}}>
            {syncing?"Syncing…":"↻ Sync Profile"}
          </button>
          <a href={`https://github.com/MbazaCodes/Student-Tanzania`} target="_blank" rel="noopener noreferrer"
            style={{padding:"7px 14px",borderRadius:9,background:`${C.purple}22`,border:`1px solid ${C.purple}44`,color:C.purple,fontWeight:600,fontSize:12,textDecoration:"none"}}>
            TSID Portal ↗
          </a>
        </div>
      </div>
      {success && <div style={{marginTop:10,fontSize:12,color:C.green}}>✅ {success}</div>}
      {error   && <div style={{marginTop:10,fontSize:12,color:C.error}}>⚠️ {error}</div>}
    </div>
  );

  if (mode === "preview" && preview) {
    const p = preview; const school = p.schools as Record<string,string>|null;
    return (
      <div style={{background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px"}}>
        <div style={{fontWeight:700,fontSize:14,color:C.white,marginBottom:14}}>🔍 TSID Found — Confirm this is you</div>
        <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
          {p.photo_url && (<img src={p.photo_url as string} alt="TSID" style={{width:60,height:72,borderRadius:8,objectFit:"cover",flexShrink:0,border:`2px solid ${C.gold}`}}/>)}
          <div>
            <div style={{fontWeight:800,fontSize:16,color:C.white,marginBottom:4}}>{[p.first_name,p.middle_name,p.last_name].filter(Boolean).join(" ")}</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
              <div>🪪 {formatTSID(p.tsid as string)}</div>
              {p.gender && <div>⚥ {String(p.gender)}</div>}
              {p.date_of_birth && <div>📅 {new Date(p.date_of_birth as string).toLocaleDateString("en-TZ")}</div>}
              {school && <div>🏫 {school.school_name} · {school.region}</div>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>{setMode("link");setPreview(null);}} style={{flex:1,padding:"10px 0",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>← Back</button>
          <button onClick={handleLink} disabled={loading} style={{flex:2,padding:"10px 0",borderRadius:10,background:C.green,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:loading?0.6:1}}>{loading?"Linking…":"✓ Yes, link this TSID"}</button>
        </div>
        {error && <div style={{marginTop:10,fontSize:12,color:C.error}}>⚠️ {error}</div>}
      </div>
    );
  }

  return (
    <div style={{background:C.navyCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:24}}>🪪</span>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:C.white}}>Link your Tanzania Student ID</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>Sync your official profile photo and details from TSID</div>
        </div>
      </div>
      <div style={{display:"flex",gap:9,marginBottom:10}}>
        <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} placeholder="TSID00000001" maxLength={12}
          style={{flex:1,padding:"10px 14px",borderRadius:9,background:"rgba(15,31,61,0.9)",border:`1px solid ${C.border}`,color:C.white,fontSize:14,outline:"none",fontFamily:"'Courier New',monospace",fontWeight:700,letterSpacing:2}}
          onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}
          onKeyDown={e=>e.key==="Enter"&&handleLookup()}/>
        <button onClick={handleLookup} disabled={loading} style={{padding:"10px 18px",borderRadius:9,background:C.gold,border:"none",color:C.navy,fontWeight:700,fontSize:13,cursor:"pointer",opacity:loading?0.6:1,flexShrink:0}}>
          {loading?"Looking up…":"Look up →"}
        </button>
      </div>
      {error && <div style={{fontSize:12,color:C.error}}>⚠️ {error}</div>}
      <div style={{fontSize:11,color:C.muted,marginTop:6}}>Your TSID is on your ID card — format TSID followed by 8 digits.</div>
    </div>
  );
}
