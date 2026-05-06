import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

interface Props {
  children: ReactNode;
  requireRole?: Role | Role[];
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    const ok = roles.some((r) => user.roles.includes(r));
    if (!ok) return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
