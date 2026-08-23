import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. SHARED & AUTH INFRASTRUCTURE ---
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './features/auth/context/AuthContext';
import { DialogProvider } from './context/DialogContext';

// --- 2. PUBLIC / AUTH PAGES (Moved to src/pages/public/) ---
import LandingPage from './pages/public/LandingPage';
import RegisterPage from './pages/public/RegisterPage';
import LoginPage from './pages/public/LoginPage';
import TermsPage from './pages/public/TermsPage';
import VerifyEmailPage from './pages/public/VerifyOTPPage';
import AppealPage from './pages/public/AppealPage';

// --- 3. HOSPITAL PORTAL PAGES (Moved to src/pages/hospital/) ---
import HospitalDashboardPage from './pages/hospital/HospitalDashboardPage';
import HospitalProfilePage from './pages/hospital/HospitalProfilePage';
import EditProfilePage from './pages/hospital/EditProfilePage';
import BloodStockPage from './pages/hospital/BloodStockPage';
import BloodRequestPage from './pages/hospital/BloodRequestPage';
import AllRequestsPage from './pages/hospital/AllRequestsPage';
import HospitalSearchPage from './pages/hospital/HospitalSearchPage';

// --- 4. ADMIN DASHBOARD PAGES (Ensure these paths are correct) ---
import DashboardPage from './pages/admin/DashboardPage';
import EventPostingPage from './pages/admin/EventPostingPage';
import AdminCreationPage from './pages/admin/AdminCreationPage';
import FeedbackPage from './pages/admin/FeedbackPage';
import AdminSetupPage from './pages/admin/AdminSetupPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
            {/* --- PUBLIC / AUTH ROUTES --- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/appeal" element={<AppealPage />} />

            {/* --- PROTECTED HOSPITAL PORTAL ROUTES --- */}
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute>
                  <HospitalDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/profile"
              element={
                <ProtectedRoute>
                  <HospitalProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/blood-stock"
              element={
                <ProtectedRoute>
                  <BloodStockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/blood-request"
              element={
                <ProtectedRoute>
                  <BloodRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/all-requests"
              element={
                <ProtectedRoute>
                  <AllRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/search"
              element={
                <ProtectedRoute>
                  <HospitalSearchPage />
                </ProtectedRoute>
              }
            />

            {/* --- ADMIN DASHBOARD ROUTES --- */}
          
            {/* --- PROTECTED ADMIN/SUPERADMIN ROUTES --- */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <EventPostingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-admin"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <AdminCreationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedbacks"
              element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            
            {/* Setup doesn't need to be protected (uses token in URL) */}
            <Route path="/admin/setup" element={<AdminSetupPage />} />
            
            {/* --- FALLBACK REDIRECT --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DialogProvider>
    </AuthProvider>
  );
};

export default App;
