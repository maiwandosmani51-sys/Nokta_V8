import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export function NavLinkItem({ path, label, icon: Icon }: NavItem) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-sky-500/20 text-sky-200' : 'text-slate-300 hover:bg-slate-800/80'}`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}
