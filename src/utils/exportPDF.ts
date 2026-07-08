// ── PDF Export Utility ─────────────────────────────────────────────────────
// Uses browser's built-in print API (no external lib needed for basic PDF)
// For advanced PDF, install: npm install jspdf jspdf-autotable

export interface PDFColumn { header: string; key: string; width?: number; }
export interface PDFOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: PDFColumn[];
  rows: Record<string, unknown>[];
  footer?: string;
}

/** Print-to-PDF via browser — works on all platforms */
export function printToPDF(elementId: string, filename: string) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${filename}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      table { width:100%; border-collapse:collapse; margin-top:16px; font-size:12px; }
      th { background:#1a1a2e; color:#fff; padding:8px 12px; text-align:left; }
      td { padding:8px 12px; border-bottom:1px solid #eee; }
      tr:nth-child(even) td { background:#f9f9f9; }
      h1 { font-size:20px; margin-bottom:4px; }
      p  { color:#666; font-size:12px; margin-bottom:16px; }
      .badge { display:inline-block; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600; }
      .green { background:#d1fae5; color:#065f46; }
      .red   { background:#fee2e2; color:#991b1b; }
      .gold  { background:#fef3c7; color:#92400e; }
      @media print { button { display:none; } }
    </style>
    </head><body>
    ${el.innerHTML}
    <script>window.onload=()=>{window.print();window.close();}<\/script>
    </body></html>
  `);
  win.document.close();
}

/** Generate HTML table string for PDF/print */
export function buildTableHTML(options: PDFOptions): string {
  const rows = options.rows
    .map(r =>
      `<tr>${options.columns.map(c => `<td>${r[c.key] ?? ""}</td>`).join("")}</tr>`
    )
    .join("");
  return `
    <h1>${options.title}</h1>
    ${options.subtitle ? `<p>${options.subtitle} — Exported: ${new Date().toLocaleDateString("en-TZ")}</p>` : ""}
    <table>
      <thead><tr>${options.columns.map(c => `<th>${c.header}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${options.footer ? `<p style="margin-top:16px;color:#999;font-size:11px;">${options.footer}</p>` : ""}
  `;
}

/** Download as PDF via browser print dialog */
export function downloadPDF(options: PDFOptions) {
  const win = window.open("", "_blank", "width=1000,height=700");
  if (!win) { alert("Allow popups to download PDF"); return; }
  win.document.write(`
    <!DOCTYPE html><html><head><title>${options.filename}</title>
    <style>
      body { font-family:Arial,sans-serif; padding:32px; color:#111; margin:0; }
      h1   { font-size:22px; color:#1a1a2e; margin-bottom:4px; }
      p    { color:#666; font-size:12px; margin:4px 0 20px; }
      table{ width:100%; border-collapse:collapse; font-size:12px; }
      th   { background:#0A1628; color:#fff; padding:9px 12px; text-align:left; font-size:11px; letter-spacing:.5px; }
      td   { padding:9px 12px; border-bottom:1px solid #e5e7eb; vertical-align:middle; }
      tr:nth-child(even) td { background:#f8fafc; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:2px solid #4F46E5; padding-bottom:16px; }
      .logo   { font-size:28px; font-weight:900; color:#4F46E5; }
      .meta   { font-size:11px; color:#6b7280; text-align:right; }
      footer  { margin-top:24px; font-size:10px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:8px; }
      @media print { body{padding:16px} }
    </style></head><body>
    <div class="header">
      <div>
        <div class="logo">E ExamHub Tanzania</div>
        <div style="font-size:13px;color:#374151;margin-top:4px;">${options.title}</div>
        ${options.subtitle ? `<div style="font-size:11px;color:#6b7280;">${options.subtitle}</div>` : ""}
      </div>
      <div class="meta">
        Generated: ${new Date().toLocaleString("en-TZ")}<br/>
        ExamHub Tanzania Platform
      </div>
    </div>
    ${buildTableHTML(options)}
    <footer>${options.footer || "Confidential — ExamHub Tanzania © 2025"}</footer>
    <script>window.onload=()=>{setTimeout(()=>{window.print();},400);}<\/script>
    </body></html>
  `);
  win.document.close();
}
