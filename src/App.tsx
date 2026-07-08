import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard, RoleRedirect } from "@/components/auth";

// ── Lazy-load all pages (code splitting) ─────────────────────
import { lazy, Suspense } from "react";

const LandingAuth        = lazy(() => import("./pages/Phase1-Landing-Auth"));
const Dashboard          = lazy(() => import("./pages/Phase2-Dashboard"));
const PapersBrowser      = lazy(() => import("./pages/Phase3-PapersBrowser"));
const ExamEngine         = lazy(() => import("./pages/Phase4-ExamEngine"));
const Results            = lazy(() => import("./pages/Phase5-Results"));
const Analytics          = lazy(() => import("./pages/Phase6-Analytics"));
const Gamification       = lazy(() => import("./pages/Phase7-Gamification"));
const AdminPortals       = lazy(() => import("./pages/Phase8-AdminPortals"));
const TeacherDashboard   = lazy(() => import("./pages/teacher/TeacherDashboard"));
const SchoolAdmin        = lazy(() => import("./pages/school-admin/SchoolAdminDashboard"));
const SuperAdmin         = lazy(() => import("./pages/super-admin/SuperAdminDashboard"));
const OnlineExamHub      = lazy(() => import("./pages/online-exam/OnlineExamHub"));
const PublicLeaderboard  = lazy(() => import("./pages/public/PublicLeaderboard"));

const C = { navy:"#0A1628", indigo:"#4F46E5", gold:"#F59E0B" };

function PageLoader() {
  return (
    <div style={{ minHeight:"100vh", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${C.indigo},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"#fff" }}>E</div>
      <div style={{ width:28, height:28, border:`3px solid rgba(99,102,241,0.3)`, borderTopColor:C.indigo, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes (no auth required) ─── */}
          <Route path="/"            element={<LandingAuth />} />
          <Route path="/leaderboard" element={<PublicLeaderboard />} />
          <Route path="/online-exam" element={<OnlineExamHub />} />
          <Route path="/join"        element={<OnlineExamHub />} />

          {/* ── After login: redirect based on role ─── */}
          <Route path="/home"        element={<RoleRedirect />} />

          {/* ── Student routes (auth required) ─── */}
          <Route path="/dashboard"   element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/papers"      element={<AuthGuard><PapersBrowser /></AuthGuard>} />
          <Route path="/exam"        element={<AuthGuard><ExamEngine /></AuthGuard>} />
          <Route path="/results"     element={<AuthGuard><Results /></AuthGuard>} />
          <Route path="/analytics"   element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/activities"  element={<AuthGuard><Gamification /></AuthGuard>} />

          {/* ── Teacher routes ─── */}
          <Route path="/teacher" element={
            <AuthGuard requiredRole="teacher"><TeacherDashboard /></AuthGuard>
          }/>

          {/* ── School Admin routes ─── */}
          <Route path="/school" element={
            <AuthGuard requiredRole="school_admin"><SchoolAdmin /></AuthGuard>
          }/>

          {/* ── Super Admin routes ─── */}
          <Route path="/superadmin" element={
            <AuthGuard requiredRole="super_admin"><SuperAdmin /></AuthGuard>
          }/>

          {/* ── Legacy / catch-all ─── */}
          <Route path="/admin"  element={<AuthGuard requiredRole="teacher"><AdminPortals /></AuthGuard>} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
