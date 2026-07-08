export default function Phase3() {
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
          <div style={{fontSize:20,fontWeight:800,color:C.white}}>Past Papers Browser</div>
          <div style={{fontSize:13,color:C.muted,marginTop:2}}>Phase 3 — Run ExamHub-Complete-Setup.ps1 to load full component</div>
        </div>
        <main style={{flex:1,padding:"40px 24px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{textAlign:"center",maxWidth:480}}>
            <div style={{fontSize:64,marginBottom:16}}>📋</div>
            <h2 style={{fontSize:22,fontWeight:800,color:C.white,marginBottom:10}}>Past Papers Browser</h2>
            <p style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:28}}>
              The full Phase 3 component is in <strong style={{color:C.indigoL}}>ExamHub-Complete-Setup.ps1</strong>. Run it on your Windows machine and the full UI will appear here.
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
