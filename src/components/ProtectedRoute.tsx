import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: 'admin' | 'user'; // if specified, must match
}

// Simple client-side guard; assumes higher-value data protected server-side too.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
