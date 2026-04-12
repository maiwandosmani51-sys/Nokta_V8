import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useAuthStore } from '../../store/authStore';
import { designSystem } from '../../designSystem';
import { useNavigate } from 'react-router-dom';

export function Navbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`sticky top-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4 shadow-glow lg:px-6 ${designSystem.transitions}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-slate-100 transition duration-300 hover:bg-white/15 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-white/10 text-slate-100 transition duration-300 hover:bg-white/15">
            <span className="absolute -right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse"></span>
            <Bell size={20} />
          </button>
          <LanguageSwitcher />
          <details className="relative">
            <summary className="flex cursor-pointer items-center gap-3 rounded-[28px] border border-white/10 bg-white/10 px-4 py-3 text-slate-100 transition duration-300 hover:bg-white/15">
              <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-[0_15px_40px_rgba(34,197,94,0.24)]">
                {user?.name?.charAt(0) ?? 'G'}
              </div>
              <div className="hidden min-w-[120px] flex-col sm:flex">
                <span className="font-semibold text-white">{user?.name ?? 'Guest'}</span>
                <span className="text-xs text-slate-400">{user?.role ?? 'No role'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </summary>
            <div className="absolute right-0 z-20 mt-3 w-48 rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-glow backdrop-blur-xl">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm text-slate-100 transition duration-300 hover:bg-white/10"
              >
                <span>Sign out</span>
                <LogOut size={16} />
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
