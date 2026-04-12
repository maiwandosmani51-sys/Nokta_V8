import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getMenuForRole, getRouteLabel } from '../../config/modules';
import { LogOut, Menu, UserCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { designSystem } from '../../designSystem';

const sidebarIconClasses: Record<string, string> = {
  '/dashboard': 'text-primary',
  '/students': 'text-accent',
  '/teachers': 'text-secondary',
  '/classes': 'text-warning',
  '/subjects': 'text-indigo-400',
  '/exams': 'text-yellow-400',
  '/results': 'text-blue-400',
  '/finance': 'text-accent',
  '/expenses': 'text-danger',
  '/books': 'text-indigo-400',
  '/families': 'text-secondary',
  '/audit': 'text-slate-300',
  '/notifications': 'text-blue-400',
  '/profile': 'text-slate-300',
  '/roles': 'text-slate-400',
};

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = useMemo(
    () =>
      getMenuForRole(user?.role ?? null).map((item) => ({
        ...item,
        label: t(item.label.toLowerCase().replace(/\s+/g, '_')),
      })),
    [user?.role, t]
  );

  const activeLabel = useMemo(
    () => t(getRouteLabel(user?.role ?? null, location.pathname).toLowerCase().replace(/\s+/g, '_')),
    [location.pathname, t, user?.role]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-background text-slate-100">
      <div className="relative lg:flex">
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 80 : 260 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl shadow-glow lg:flex"
        >
          <div className="flex h-20 items-center justify-between gap-3 border-b border-white/10 px-4">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-[0_15px_40px_rgba(34,197,94,0.24)]">
                N
              </div>
              {!collapsed && (
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Nokta Academy</p>
                  <p className="text-sm font-semibold text-white">Enterprise Control</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-slate-100 transition duration-300 hover:bg-white/15"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="space-y-2">
              {menu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-[24px] px-3 py-3 text-sm ${designSystem.transitions} ${
                      isActive
                        ? 'bg-gradient-to-r from-primary/80 via-secondary/30 to-accent/30 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] ring-1 ring-white/15'
                        : 'text-slate-300 hover:scale-[1.03] hover:bg-white/10 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} className={`${sidebarIconClasses[item.path] ?? 'text-slate-300'}`} />
                  <span className={`${collapsed ? 'hidden' : 'block truncate'}`}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className={`border-t border-white/10 p-4 ${collapsed ? 'hidden' : 'block'}`}>
            <div className="glass-panel p-4 text-slate-300">
              <p className="text-xs uppercase tracking-wider text-slate-500">{t('signed_in_as')}</p>
              <p className="mt-2 font-semibold text-white">{user?.name ?? t('guest')}</p>
              <p className="text-xs text-slate-400">{user?.role ? t(user.role) : t('no_role')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.01]"
            >
              <LogOut size={16} /> {t('logout')}
            </button>
          </div>
        </motion.aside>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div className="fixed inset-0 z-50 lg:hidden">
              <motion.button
                type="button"
                className="absolute inset-0 bg-black/60"
                onClick={() => setSidebarOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Nokta Academy</p>
                    <h1 className="text-xl font-semibold text-white">Enterprise Control</h1>
                  </div>
                  <button type="button" className="text-slate-200" onClick={() => setSidebarOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {menu.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-[24px] px-3 py-3 text-sm ${designSystem.transitions} ${
                          isActive
                            ? 'bg-gradient-to-r from-primary/80 via-secondary/30 to-accent/30 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] ring-1 ring-white/15'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={18} className={`${sidebarIconClasses[item.path] ?? 'text-slate-300'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-6 glass-panel p-4 text-slate-300">
                  <p className="text-xs uppercase tracking-wider text-slate-500">{t('signed_in_as')}</p>
                  <p className="mt-2 font-semibold text-white">{user?.name ?? t('guest')}</p>
                  <p className="text-xs text-slate-400">{user?.role ? t(user.role) : t('no_role')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-[1.01]"
                >
                  <LogOut size={16} /> {t('logout')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-h-screen" style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.3s ease-in-out' }}>
          <header className="sticky top-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4 shadow-glow lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-slate-100 transition duration-300 hover:bg-white/15 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{activeLabel}</p>
                  <h1 className="text-2xl font-semibold text-white">{activeLabel}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LanguageSwitcher />
                <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                  <UserCircle size={18} />
                  <div>
                    <div className="font-semibold text-white">{user?.name ?? t('guest')}</div>
                    <div className="text-xs text-slate-400">{user?.role ? t(user.role) : t('no_role')}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center rounded-[28px] border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 transition duration-300 hover:bg-white/15"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
