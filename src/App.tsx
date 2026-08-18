import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TermsPage from './pages/TermsPage';
import HospitalDashboardPage from './pages/HospitalDashboardPage';
import HospitalProfilePage from './pages/HospitalProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import BloodStockPage from './pages/BloodStockPage';
import HospitalSearchPage from './pages/HospitalSearchPage';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Hospital Portal Routes */}
          <Route path="/hospital/dashboard" element={<HospitalDashboardPage />} />
          <Route path="/hospital/profile" element={<HospitalProfilePage />} />
          <Route path="/hospital/profile/edit" element={<EditProfilePage />} />
          <Route path="/hospital/blood-stock" element={<BloodStockPage />} />
          <Route path="/hospital/search" element={<HospitalSearchPage />} />
          <Route path="/hospital/blood-request" element={<BloodStockPage />} />

          {/* Fallback Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
