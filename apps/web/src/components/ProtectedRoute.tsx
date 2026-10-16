import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore.js';
import type { UserRole } from '@repo/shared';

interface Props {
  roleRequired?: UserRole;
}

const isSuperAdminOrAdmin = (role?: string) => role === 'superadmin' || role === 'admin';

export function ProtectedRoute({ roleRequired }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    (roleRequired === 'superadmin' || roleRequired === 'admin') &&
    !isSuperAdminOrAdmin(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  if (roleRequired === 'customer' && isSuperAdminOrAdmin(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={isSuperAdminOrAdmin(user.role) ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
