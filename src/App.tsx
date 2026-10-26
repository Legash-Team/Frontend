import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';

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
import HospitalBloodCenterRequestsPage from './pages/hospital/HospitalBloodCenterRequestsPage';
import HospitalFaqPage from './pages/hospital/HospitalFaqPage';

// --- 4. ADMIN DASHBOARD PAGES (Ensure these paths are correct) ---
import DashboardPage from './pages/admin/DashboardPage';
import EventPostingPage from './pages/admin/EventPostingPage';
import AdminCreationPage from './pages/admin/AdminCreationPage';
import FeedbackPage from './pages/admin/FeedbackPage';
import MyPostsPage from './pages/admin/MyPostsPage';
import HospitalStockPage from './pages/admin/HospitalStockPage';
import HospitalAnalyticsPage from './pages/admin/HospitalAnalyticsPage';
import BloodCenterDashboardPage from './pages/admin/BloodCenterDashboardPage';
import BloodCenterHospitalsPage from './pages/admin/BloodCenterHospitalsPage';
import BloodCenterIncomingRequestsPage from './pages/admin/BloodCenterIncomingRequestsPage';
import BloodCenterProfilePage from './pages/admin/BloodCenterProfilePage';

const AdminSetupRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  return <Navigate to={token ? `/invite/${token}` : '/invite'} replace />;
};

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
                <ProtectedRoute requiredRole="hospital">
                  <DonationRecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/blood-center-requests"
              element={
                <ProtectedRoute requiredRole="hospital">
                  <HospitalBloodCenterRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/faq"
              element={
                <ProtectedRoute requiredRole="hospital">
                  <HospitalFaqPage />
                </ProtectedRoute>
              }
            />

            {/* --- ADMIN DASHBOARD ROUTES --- */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']} requireCanApproveHospitals>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute requiredRole="superadmin" requireCanPostEvents>
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
                <ProtectedRoute allowedRoles={['superadmin', 'admin']} requireCanApproveHospitals>
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hospital-stock"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <HospitalStockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hospital-analytics"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <HospitalAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/my-posts"
              element={
                <ProtectedRoute requiredRole="superadmin" requireCanPostEvents>
                  <MyPostsPage />
                </ProtectedRoute>
              }
            />

            {/* --- BLOOD CENTER ROUTES (admin role) --- */}
            <Route
              path="/blood-center/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']}>
                  <BloodCenterDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/requests"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']}>
                  <BloodCenterIncomingRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/events"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']} requireCanPostEvents>
                  <EventPostingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/my-posts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']} requireCanPostEvents>
                  <MyPostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/profile"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']}>
                  <BloodCenterProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']}>
                  <BloodCenterProfilePage isEditMode={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/hospitals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']} requireCanApproveHospitals>
                  <BloodCenterHospitalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blood-center/feedbacks"
              element={
                <ProtectedRoute allowedRoles={['admin', 'bloodcenter', 'superadmin']} requireCanApproveHospitals>
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/setup" element={<AdminSetupRedirect />} />
            
            {/* --- FALLBACK REDIRECT --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DialogProvider>
    </AuthProvider>
  );
};

export default App;
