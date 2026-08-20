import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TermsPage from './pages/TermsPage';
import VerifyEmailPage from './pages/VerifyOTPPage';
import HospitalDashboardPage from './pages/HospitalDashboardPage';
import HospitalProfilePage from './pages/HospitalProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import BloodStockPage from './pages/BloodStockPage';
import BloodRequestPage from './pages/BloodRequestPage';
import AllRequestsPage from './pages/AllRequestsPage';
import HospitalSearchPage from './pages/HospitalSearchPage';
import DashboardPage from './pages/admin/DashboardPage';
import EventPostingPage from './pages/admin/EventPostingPage';
import AdminCreationPage from './pages/admin/AdminCreationPage';
import FeedbackPage from './pages/admin/FeedbackPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Admin Portal Routes */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/events" element={<EventPostingPage />} />
            <Route path="/admin/create-admin" element={<AdminCreationPage />} />
            <Route path="/admin/feedbacks" element={<FeedbackPage />} />

            {/* Protected Hospital Portal Routes */}
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

            {/* Fallback Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
