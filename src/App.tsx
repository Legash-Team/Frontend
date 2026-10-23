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
import AuthCallbackPage from './pages/public/AuthCallbackPage';
import InviteAcceptancePage from './pages/public/InviteAcceptancePage';

// --- 3. HOSPITAL PORTAL PAGES (Moved to src/pages/hospital/) ---
import HospitalDashboardPage from './pages/hospital/HospitalDashboardPage';
import HospitalProfilePage from './pages/hospital/HospitalProfilePage';
import EditProfilePage from './pages/hospital/EditProfilePage';
import BloodStockPage from './pages/hospital/BloodStockPage';
import BloodRequestPage from './pages/hospital/BloodRequestPage';
import AllRequestsPage from './pages/hospital/AllRequestsPage';
import HospitalSearchPage from './pages/hospital/HospitalSearchPage';
import DonationRecordsPage from './pages/hospital/DonationRecordsPage';

// --- 4. ADMIN DASHBOARD PAGES (Ensure these paths are correct) ---
import DashboardPage from './pages/admin/DashboardPage';
import EventPostingPage from './pages/admin/EventPostingPage';
import AdminCreationPage from './pages/admin/AdminCreationPage';
import FeedbackPage from './pages/admin/FeedbackPage';
import AdminSetupPage from './pages/admin/AdminSetupPage';
import MyPostsPage from './pages/admin/MyPostsPage';
import HospitalStockPage from './pages/admin/HospitalStockPage';
import HospitalAnalyticsPage from './pages/admin/HospitalAnalyticsPage';
import BloodCenterDashboardPage from './pages/admin/BloodCenterDashboardPage';
import BloodCenterHospitalsPage from './pages/admin/BloodCenterHospitalsPage';

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
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* --- INVITATION ACCEPTANCE (Super Admin invited blood centers / admins) --- */}
            <Route path="/invite/:token" element={<InviteAcceptancePage />} />
            <Route path="/invite" element={<InviteAcceptancePage />} />

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
            <Route
              path="/hospital/medical-records"
              element={
                <ProtectedRoute>
                  <DonationRecordsPage />
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
                <ProtectedRoute requireCanPostEvents>
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
            <Route
              path="/admin/hospital-stock"
              element={
                <ProtectedRoute requireCanApproveHospitals>
                  <HospitalStockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hospital-analytics"
              element={
                <ProtectedRoute requireCanApproveHospitals>
                  <HospitalAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/my-posts"
              element={
                <ProtectedRoute requireCanPostEvents>
                  <MyPostsPage />
                </ProtectedRoute>
              }
            />
            {/* TEMPORARY: blood-center routes are open (no <ProtectedRoute>) while the
                backend for blood-center auth/permissions is unfinished, so the team can
                reach them by URL for testing. Restore the guards (role + canApproveHospitals)
                once the backend is live — see TEMP_OPEN_ACCESS in src/lib/temporaryAccess.ts. */}
            <Route path="/blood-center/dashboard" element={<BloodCenterDashboardPage />} />
            <Route path="/blood-center/events" element={<EventPostingPage />} />
            <Route path="/blood-center/my-posts" element={<MyPostsPage />} />
            <Route path="/blood-center/hospitals" element={<BloodCenterHospitalsPage />} />
            <Route path="/blood-center/feedbacks" element={<FeedbackPage />} />
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
