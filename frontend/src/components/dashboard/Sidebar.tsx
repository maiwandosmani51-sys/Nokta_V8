import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Home, Users, BarChart3, Megaphone, ShoppingCart, Settings, ChevronLeft, ChevronRight, Layers, BookOpen, CalendarCheck, FileText, DollarSign, CreditCard, Bell, ClipboardList, ShieldCheck, Activity, Archive, UserCheck, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { designSystem } from '../../designSystem';
import type { Role } from '../../config/modules';
import { useMemo } from 'react';

type MenuItem = {
  title: string;
  icon: LucideIcon;
  path: string;
  roles: Role[];
};

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Home, path: '/dashboard', roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'] },
  { title: 'Super Admin', icon: ShieldCheck, path: '/dashboard/super-admin', roles: ['super_admin'] },
  { title: 'Manage Users', icon: UserPlus, path: '/dashboard/manage-users', roles: ['super_admin'] },
  { title: 'Admin Dashboard', icon: ShieldCheck, path: '/dashboard/admin', roles: ['admin'] },
  { title: 'Teacher Dashboard', icon: ShieldCheck, path: '/dashboard/teacher', roles: ['teacher'] },
  { title: 'Student Dashboard', icon: ShieldCheck, path: '/dashboard/student', roles: ['student'] },
  { title: 'Family Dashboard', icon: ShieldCheck, path: '/dashboard/family', roles: ['family_student'] },
  { title: 'Accountant Dashboard', icon: ShieldCheck, path: '/dashboard/accountant', roles: ['accountant'] },
  { title: 'Librarian Dashboard', icon: ShieldCheck, path: '/dashboard/librarian', roles: ['librarian'] },
  { title: 'Users', icon: Users, path: '/users', roles: ['super_admin', 'admin'] },
  { title: 'Students', icon: UserCheck, path: '/students', roles: ['super_admin', 'admin', 'teacher'] },
  { title: 'Teachers', icon: Users, path: '/teachers', roles: ['super_admin', 'admin'] },
  { title: 'Classes', icon: Layers, path: '/classes', roles: ['super_admin', 'admin', 'teacher'] },
  { title: 'Subjects', icon: BookOpen, path: '/subjects', roles: ['super_admin', 'admin', 'teacher'] },
  { title: 'Exams', icon: CalendarCheck, path: '/exams', roles: ['super_admin', 'admin', 'teacher'] },
  { title: 'Results', icon: FileText, path: '/results', roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student'] },
  { title: 'Finance', icon: DollarSign, path: '/finance', roles: ['super_admin', 'admin', 'accountant'] },
  { title: 'Expenses', icon: CreditCard, path: '/expenses', roles: ['super_admin', 'admin', 'accountant'] },
  { title: 'Reports', icon: Activity, path: '/reports', roles: ['super_admin', 'admin', 'accountant'] },
  { title: 'Families', icon: Archive, path: '/families', roles: ['super_admin', 'admin', 'teacher', 'family_student'] },
  { title: 'Books', icon: BookOpen, path: '/books', roles: ['super_admin', 'admin', 'librarian'] },
  { title: 'Notifications', icon: Bell, path: '/notifications', roles: ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'] },
  { title: 'Audit Logs', icon: ClipboardList, path: '/audit', roles: ['super_admin', 'admin'] },
  { title: 'Roles', icon: ShieldCheck, path: '/roles', roles: ['super_admin'] },
  { title: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['super_admin', 'admin'] },
  { title: 'Campaign', icon: Megaphone, path: '/campaign', roles: ['admin'] },
  { title: 'eCommerce', icon: ShoppingCart, path: '/ecommerce', roles: ['super_admin', 'admin'] },
  { title: 'Settings', icon: Settings, path: '/settings', roles: ['super_admin', 'admin', 'user'] },
];

export function Sidebar({ collapsed, open, onClose, onToggle }: { collapsed: boolean; open: boolean; onClose: () => void; onToggle: () => void; }) {
  const user = useAuthStore((state) => state.user);

  const visibleMenu = useMemo(
    () => menuItems.filter((item) => item.roles.includes(user?.role ?? 'user')),
    [user?.role]
  );

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl shadow-glow lg:flex ${collapsed ? 'w-20' : 'w-[260px]'} transition-all duration-300`}>
        <div className="flex h-20 items-center justify-between gap-3 border-b border-white/10 px-4">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-[0_15px_40px_rgba(34,197,94,0.24)]">
              N
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Nokta Academy</p>
                <p className="text-sm font-semibold text-white">Premium Control</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex h-11 w-11 items-center justify-center ${designSystem.borderRadius} border border-white/10 bg-white/10 text-slate-100 transition duration-300 hover:bg-white/15`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="space-y-2">
            {visibleMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/80 via-secondary/40 to-accent/40 text-white shadow-[0_0_30px_rgba(79,70,229,0.28)] ring-1 ring-white/20'
                      : 'text-slate-300 hover:scale-[1.03] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className={`border-t border-white/10 p-4 ${collapsed ? 'hidden' : 'block'}`}>
          <div className="glass-panel p-4 text-slate-300">
            <p className="text-xs uppercase tracking-wider text-slate-500">Signed in as</p>
            <p className="mt-2 font-semibold text-white">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-slate-400">{user?.role ?? 'No role'}</p>
          </div>
        </div>
      </aside>

      <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'} lg:hidden`}>
        <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
        <aside className="absolute inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-cyan-300">Nokta Admin</p>
              <h1 className="text-xl font-semibold text-white">Control Center</h1>
            </div>
            <button type="button" onClick={onClose} className="text-slate-300 hover:text-white">
              <ChevronLeft size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {visibleMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/80 via-secondary/40 to-accent/40 text-white shadow-[0_0_30px_rgba(79,70,229,0.28)] ring-1 ring-white/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
                onClick={onClose}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
