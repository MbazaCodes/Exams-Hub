import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingAuth   from "./pages/Phase1-Landing-Auth";
import Dashboard     from "./pages/Phase2-Dashboard";
import PapersBrowser from "./pages/Phase3-PapersBrowser";
import ExamEngine    from "./pages/Phase4-ExamEngine";
import Results       from "./pages/Phase5-Results";
import Analytics     from "./pages/Phase6-Analytics";
import Gamification  from "./pages/Phase7-Gamification";
import AdminPortals  from "./pages/Phase8-AdminPortals";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<LandingAuth />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/papers"      element={<PapersBrowser />} />
        <Route path="/exam"        element={<ExamEngine />} />
        <Route path="/results"     element={<Results />} />
        <Route path="/analytics"   element={<Analytics />} />
        <Route path="/activities"  element={<Gamification />} />
        <Route path="/admin"       element={<AdminPortals />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
