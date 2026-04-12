import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/super-admin': 'Super Admin Dashboard',
  '/users': 'Users Management',
  '/analytics': 'Analytics',
  '/campaign': 'Campaign',
  '/ecommerce': 'eCommerce',
  '/settings': 'Settings',
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = useMemo(() => routeLabels[location.pathname] ?? 'Dashboard', [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-slate-100">
      <Sidebar collapsed={collapsed} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setCollapsed((prev) => !prev)} />

      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-[260px]'}`}>
        <Navbar title={title} onMenu={() => setSidebarOpen(true)} />

        <main className="main-content flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
