import LandingPage from '@/pages/LandingPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TermsPage from './pages/TermsPage';
import VerifyEmailPage from './pages/VerifyOTPPage';
import DashboardPage from './pages/admin/DashboardPage';
import EventPostingPage from './pages/admin/EventPostingPage';
import AdminCreationPage from './pages/admin/AdminCreationPage';
import FeedbackPage from './pages/admin/FeedbackPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
        <Route path ="verify-email" element={<VerifyEmailPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/events" element ={<EventPostingPage />} />
        <Route path="/admin/create-admin" element ={<AdminCreationPage />} />
        <Route path="/admin/feedbacks" element ={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;