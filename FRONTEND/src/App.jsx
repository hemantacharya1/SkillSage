import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NotFound from "./components/sections/NotFound";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PrivateRoute from './components/layouts/PrivateRoute';
import RecruiterLayout from './components/recruiter/RecruiterLayout';
import CandidateLayout from './components/layouts/CandidateLayout';
import RecruiterDashboard from './pages/Recruiter/Dashboard';
import CandidateDashboard from './pages/Candidate/Dashboard';
import InterviewRoom from './pages/Interview/InterviewRoom';
import Questions from './pages/Recruiter/Questions';
import Interviews from './pages/Recruiter/Interviews';
import PastInterviews from './pages/Recruiter/PastInterviews';
import CreateInterview from './pages/Recruiter/CreateInterview';
import EditInterview from './pages/Recruiter/EditInterview';
import ViewSubmission from './pages/Recruiter/ViewSubmission';
import "./styles/globals.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="skillsage-theme">
      <Toaster position="top-right" expand={true} richColors />
      <div className="min-h-screen bg-background text-foreground">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* Protected Recruiter Routes */}
            <Route element={<PrivateRoute allowedRoles={['RECRUITER']} />}>
              <Route element={<RecruiterLayout />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/questions" element={<Questions />} />
                <Route path="/recruiter/interviews" element={<Interviews />} />
                <Route path="/recruiter/past-interviews" element={<PastInterviews />} />
                <Route path="/recruiter/interviews/create" element={<CreateInterview />} />
                <Route path="/recruiter/interviews/:id/edit" element={<EditInterview />} />
                <Route path="/recruiter/interview/:interviewId" element={<InterviewRoom />} />
                <Route path="/recruiter/past-interview/view/:interviewId" element={<ViewSubmission />} />
              </Route>
            </Route>

            {/* Protected Candidate Routes */}
            <Route element={<PrivateRoute allowedRoles={['CANDIDATE']} />}>
              <Route element={<CandidateLayout />}>
                <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/interview/:interviewId" element={<InterviewRoom />} />
              </Route>
            </Route>

            {/* Fallback Routes */}
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<Navigate replace to="/auth/login" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
