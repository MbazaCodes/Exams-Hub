import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Phase pages
import LandingAuth   from "./pages/Phase1-Landing-Auth";
import Dashboard     from "./pages/Phase2-Dashboard";
import PapersBrowser from "./pages/Phase3-PapersBrowser";
import ExamEngine    from "./pages/Phase4-ExamEngine";
import Results       from "./pages/Phase5-Results";
import Analytics     from "./pages/Phase6-Analytics";
import Gamification  from "./pages/Phase7-Gamification";
import AdminPortals  from "./pages/Phase8-AdminPortals";

// Role pages
import TeacherDashboard    from "./pages/teacher/TeacherDashboard";
import SchoolAdminDashboard from "./pages/school-admin/SchoolAdminDashboard";
import SuperAdminDashboard  from "./pages/super-admin/SuperAdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"           element={<LandingAuth />} />

        {/* Student */}
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/papers"     element={<PapersBrowser />} />
        <Route path="/exam"       element={<ExamEngine />} />
        <Route path="/results"    element={<Results />} />
        <Route path="/analytics"  element={<Analytics />} />
        <Route path="/activities" element={<Gamification />} />

        {/* Role portals */}
        <Route path="/teacher"    element={<TeacherDashboard />} />
        <Route path="/school"     element={<SchoolAdminDashboard />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />

        {/* Legacy */}
        <Route path="/admin"      element={<AdminPortals />} />

        {/* Fallback */}
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
