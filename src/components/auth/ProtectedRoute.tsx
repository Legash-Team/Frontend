import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { TEMP_OPEN_ACCESS } from '@/lib/temporaryAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'admin' | 'hospital' | 'bloodcenter';
  allowedRoles?: ('superadmin' | 'admin' | 'hospital' | 'bloodcenter')[];
  requireCanApproveHospitals?: boolean;
  requireCanPostEvents?: boolean;
}

const getDefaultRedirect = (user?: any): string => {
  const role = typeof user === 'string' ? user : user?.role;
  const centerName = typeof user === 'object' ? user?.centerName : undefined;
  if (role === 'superadmin') {
    return '/admin/dashboard';
  }
  if (role === 'admin') {
    if (centerName) {
      return '/blood-center/dashboard';
    }
    return '/admin/dashboard';
  }
  if (role === 'bloodcenter') {
    return '/blood-center/dashboard';
  }
  return '/hospital/dashboard';
};

const matchesRole = (userRole?: string, targetRole?: string): boolean => {
  if (!userRole || !targetRole) return false;
  if (targetRole === 'admin' || targetRole === 'bloodcenter') {
    return userRole === 'admin' || userRole === 'bloodcenter';
  }
  return userRole === targetRole;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  requireCanApproveHospitals,
  requireCanPostEvents,
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (TEMP_OPEN_ACCESS) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => matchesRole(user?.role, role));
    if (!hasAllowedRole) {
      return <Navigate to={getDefaultRedirect(user)} replace />;
    }
  } else if (requiredRole && !matchesRole(user?.role, requiredRole)) {
    return <Navigate to={getDefaultRedirect(user)} replace />;
  }

  if (requireCanApproveHospitals) {
    const isSuperAdmin = user?.role === 'superadmin';
    const canApprove = isSuperAdmin || Boolean(user?.permissions?.canApproveHospitals);
    if (!canApprove) {
      return <Navigate to={getDefaultRedirect(user)} replace />;
    }
  }

  if (requireCanPostEvents) {
    const isSuperAdmin = user?.role === 'superadmin';
    const isBloodCenter = user?.role === 'admin' || user?.role === 'bloodcenter';
    const canPost = isSuperAdmin || isBloodCenter || Boolean(user?.permissions?.canPostEvents);
    if (!canPost) {
      return <Navigate to={getDefaultRedirect(user)} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
