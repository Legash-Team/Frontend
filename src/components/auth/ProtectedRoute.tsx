import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { TEMP_OPEN_ACCESS } from '@/lib/temporaryAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'admin' | 'hospital' | 'bloodcenter';
  requireCanApproveHospitals?: boolean;
  requireCanPostEvents?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireCanApproveHospitals,
  requireCanPostEvents,
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // TEMPORARY: register/login don't work until the backend auth flow is done,
  // so while TEMP_OPEN_ACCESS is on every protected URL opens directly by
  // changing the address. Set the flag to false to restore the checks below.
  if (TEMP_OPEN_ACCESS) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If they don't have the right role, bounce them to their default dashboard
    const redirectPath = user?.role === 'bloodcenter'
      ? '/blood-center/dashboard'
      : user?.role === 'superadmin' || user?.role === 'admin'
        ? '/admin/dashboard'
        : '/hospital/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  if (requireCanApproveHospitals) {
    const isSuperAdmin = user?.role === 'superadmin';
    // Blood centers only get approval powers when the Super Admin granted them
    const canApprove = isSuperAdmin || Boolean(user?.permissions?.canApproveHospitals);
    if (!canApprove) {
      const redirectPath = user?.role === 'bloodcenter'
        ? '/blood-center/dashboard'
        : user?.role === 'superadmin' || user?.role === 'admin'
          ? '/admin/dashboard'
          : '/hospital/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  if (requireCanPostEvents) {
    const isSuperAdmin = user?.role === 'superadmin';
    const isBloodCenter = user?.role === 'bloodcenter';
    const canPost = isSuperAdmin || isBloodCenter || Boolean(user?.permissions?.canPostEvents);
    if (!canPost) {
      const redirectPath = user?.role === 'bloodcenter'
        ? '/blood-center/dashboard'
        : user?.role === 'superadmin' || user?.role === 'admin'
          ? '/admin/dashboard'
          : '/hospital/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
