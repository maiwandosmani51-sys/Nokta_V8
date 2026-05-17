import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { hasExplicitAccessProfile, normalizeRole, userCanOpenPath, type Role } from '@/features/resources/config/modules';

export function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: Role[] }) {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-200">{t('common.checking_session')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = normalizeRole(user.role as Role) ?? user.role;

  if (allowedRoles) {
    const roleAllowed = allowedRoles.includes(normalizedRole as Role);
    const permissionAllowed = userCanOpenPath(user, location.pathname);
    const strictPermissions = hasExplicitAccessProfile(user);
    if ((strictPermissions && !permissionAllowed) || (!strictPermissions && !roleAllowed && !permissionAllowed)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  if (!allowedRoles && hasExplicitAccessProfile(user) && !userCanOpenPath(user, location.pathname)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
