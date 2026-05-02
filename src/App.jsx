import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedEmployerRoute from './components/ProtectedEmployerRoute'
import ProtectedSeekerRoute from './components/ProtectedSeekerRoute'
import JobSeekerDashboard from './pages/seeker/JobSeekerDashboard'
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import ApplyPage from './pages/ApplyPage'
import WorkshopsPage from './pages/WorkshopsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmployerLoginPage from './pages/employer/EmployerLoginPage'
import EmployerRegisterPage from './pages/employer/EmployerRegisterPage'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import PostJobPage from './pages/employer/PostJobPage'
import EmployersLandingPage from './pages/employer/EmployersLandingPage'
import AboutPage from './pages/AboutPage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-slate-500">Coming soon.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/:id/apply" element={<ApplyPage />} />
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Legacy redirect */}
            <Route path="/post-job" element={<Navigate to="/employers/post-job" replace />} />

            {/* Employer public */}
            <Route path="/employers" element={<EmployersLandingPage />} />
            <Route path="/employers/login" element={<EmployerLoginPage />} />
            <Route path="/employers/register" element={<EmployerRegisterPage />} />

            {/* Employer protected */}
            <Route path="/employers/dashboard" element={
              <ProtectedEmployerRoute><EmployerDashboard /></ProtectedEmployerRoute>
            } />
            <Route path="/employers/post-job" element={
              <ProtectedEmployerRoute><PostJobPage /></ProtectedEmployerRoute>
            } />

            {/* Seeker protected */}
            <Route path="/dashboard/jobseeker" element={
              <ProtectedSeekerRoute><JobSeekerDashboard /></ProtectedSeekerRoute>
            } />
            <Route path="/dashboard" element={<Navigate to="/dashboard/jobseeker" replace />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/alerts" element={<Navigate to="/dashboard/jobseeker?tab=alerts" replace />} />

            {/* Placeholders */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
            <Route path="/pricing" element={<Navigate to="/employers" replace />} />
            <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
            <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
            <Route path="/forgot-password" element={<PlaceholderPage title="Reset Password" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
