import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/layout/AppShell';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './modules/auth/LoginPage';
import { HomePage } from './modules/HomePage';
import { NotFoundPage } from './modules/NotFoundPage';
import { ProfilePage } from './modules/ProfilePage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { SuperAdminDashboard } from './modules/dashboard/SuperAdminDashboard';
import { ForbiddenPage } from './modules/ForbiddenPage';
import { ManageUsersPage } from './modules/dashboard/ManageUsersPage';
import { UsersPage } from './modules/dashboard/UsersPage';
import { AnalyticsPage } from './modules/dashboard/AnalyticsPage';
import { CampaignPage } from './modules/dashboard/CampaignPage';
import { EcommercePage } from './modules/dashboard/EcommercePage';
import { SettingsPage } from './modules/dashboard/SettingsPage';
import { modulesConfig, allModuleConfigs } from './config/modules';
import { useAuthStore } from './store/authStore';
import { authService } from './services/auth';
const CrudPage = lazy(() => import('./modules/CrudPage').then((module) => ({ default: module.CrudPage })));

function App() {
  const authLoading = useAuthStore((state) => state.authLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    authService.profile()
      .then((result) => setUser(result.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout, setLoading, setUser]);

  const { t } = useTranslation();

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-200">{t('checking_credentials')}</div>;
  }

  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-200">{t('loading')}</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian', 'user']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/super-admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manage-users"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/family"
            element={
              <ProtectedRoute allowedRoles={['family_student']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/accountant"
            element={
              <ProtectedRoute allowedRoles={['accountant']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/librarian"
            element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaign"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CampaignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ecommerce"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <EcommercePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'user']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AppShell />}>
          {allModuleConfigs.map((config) => (
            <Route
              key={config.path}
              path={config.path}
              element={
                <ProtectedRoute allowedRoles={config.permissions.view}>
                  <CrudPage config={config} />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
