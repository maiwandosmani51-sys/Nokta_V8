import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import type { Role } from '../../config/modules';

export function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: Role[] }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-200">{t('checking_session')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
