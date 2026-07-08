import { useState, useRef, useCallback } from "react";

const C = {
  navy:"#0A1628", navyMid:"#0F1F3D", navyCard:"#111E35",
  indigo:"#4F46E5", indigoL:"#6366F1", gold:"#F59E0B",
  green:"#10B981", white:"#F0F4FF", muted:"#94A3B8",
  border:"rgba(99,102,241,0.18)", error:"#EF4444", purple:"#8B5CF6",
};

const FILE_ICONS = {
  pdf:  { icon:"📄", color:"#EF4444", label:"PDF" },
  xlsx: { icon:"📊", color:"#10B981", label:"Excel" },
  xls:  { icon:"📊", color:"#10B981", label:"Excel" },
  csv:  { icon:"📋", color:"#14B8A6", label:"CSV" },
  docx: { icon:"📝", color:"#4F46E5", label:"Word" },
  doc:  { icon:"📝", color:"#4F46E5", label:"Word" },
  png:  { icon:"🖼️", color:"#8B5CF6", label:"Image" },
  jpg:  { icon:"🖼️", color:"#8B5CF6", label:"Image" },
  jpeg: { icon:"🖼️", color:"#8B5CF6", label:"Image" },
};

function getExt(name) { return name.split(".").pop()?.toLowerCase() || "file"; }
function getFileMeta(name) { return FILE_ICONS[getExt(name)] || { icon:"📁", color:C.muted, label:"File" }; }
function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(2)} MB`;
}

export function FileUploader({
  accept = ".pdf,.xlsx,.xls,.csv,.docx,.doc,.png,.jpg,.jpeg",
  multiple = false,
  maxSizeMB = 10,
  label = "Upload File",
  hint,
  onFiles,
  onProcess,
  showPreview = true,
  processingLabel = "Processing with AI...",
}) {
  const [files, setFiles]         = useState([]);
  const [dragging, setDragging]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");
  const inputRef = useRef(null);

  const validate = (fileList) => {
    const valid = [];
    const maxBytes = maxSizeMB * 1024 * 1024;
    for (const f of fileList) {
      if (f.size > maxBytes) { setError(`"${f.name}" exceeds ${maxSizeMB}MB limit`); continue; }
      valid.push(f);
    }
    return valid;
  };

  const handleFiles = useCallback((fileList) => {
    setError(""); setDone(false);
    const valid = validate(Array.from(fileList));
    if (!valid.length) return;
    const enriched = valid.map(f => ({ file: f, id: Math.random().toString(36).slice(2), preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null }));
    setFiles(multiple ? prev => [...prev, ...enriched] : enriched);
    onFiles?.(valid);
  }, [multiple, maxSizeMB]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleProcess = async () => {
    if (!files.length) return;
    setProcessing(true); setProgress(0); setDone(false);
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);
    try {
      await onProcess?.(files.map(f => f.file));
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setDone(true); setProcessing(false); }, 400);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "Upload failed");
      setProcessing(false); setProgress(0);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border:`2px dashed ${dragging ? C.indigo : C.border}`,
          borderRadius:14, padding:"36px 24px", textAlign:"center",
          cursor:"pointer", transition:"all 0.2s",
          background: dragging ? `${C.indigo}10` : C.navyCard,
        }}
      >
        <input
          ref={inputRef} type="file" hidden
          accept={accept} multiple={multiple}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ fontSize:40, marginBottom:12 }}>
          {dragging ? "📂" : "☁️"}
        </div>
        <div style={{ fontWeight:700, fontSize:15, color:C.white, marginBottom:6 }}>{label}</div>
        <div style={{ fontSize:13, color:C.muted, marginBottom:16 }}>
          {hint || `Drag & drop or click to browse · Max ${maxSizeMB}MB`}
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {["PDF","Excel","CSV","Word","Images"].map(t => (
            <span key={t} style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:C.border, color:C.muted }}>{t}</span>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background:"#EF444415", border:"1px solid #EF444440", borderRadius:10, padding:"10px 14px", fontSize:13, color:C.error }}>
          ⚠️ {error}
        </div>
      )}

      {/* File list */}
      {showPreview && files.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {files.map(({ file, id, preview }) => {
            const meta = getFileMeta(file.name);
            return (
              <div key={id} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"12px 14px", borderRadius:10,
                background:C.navyMid, border:`1px solid ${C.border}`,
              }}>
                {preview
                  ? <img src={preview} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
                  : <div style={{ width:40, height:40, borderRadius:8, background:meta.color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{meta.icon}</div>
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:C.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{meta.label} · {fmtSize(file.size)}</div>
                </div>
                <button onClick={() => removeFile(id)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:4 }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      {processing && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, marginBottom:6 }}>
            <span>{processingLabel}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ height:6, background:C.border, borderRadius:99 }}>
            <div style={{ width:`${progress}%`, height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.indigo},${C.gold})`, transition:"width 0.3s" }} />
          </div>
        </div>
      )}

      {done && (
        <div style={{ background:`${C.green}18`, border:`1px solid ${C.green}40`, borderRadius:10, padding:"12px 16px", fontSize:13, color:C.green, display:"flex", alignItems:"center", gap:8 }}>
          ✅ Upload complete! File processed successfully.
        </div>
      )}

      {files.length > 0 && !processing && !done && onProcess && (
        <button
          onClick={handleProcess}
          style={{ padding:"12px 0", borderRadius:10, background:`linear-gradient(135deg,${C.indigo},${C.indigoL})`, border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}
        >
          {processingLabel.replace("...", "")} →
        </button>
      )}
    </div>
  );
}
