import { useState } from 'react';
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Eye,
  Globe,
  Home,
  Menu,
  Settings,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
  Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { designSystem } from '../../designSystem';

interface SidebarItem {
  icon: any;
  label: string;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'General' },
  { icon: BarChart3, label: 'Classic', active: true },
  { icon: TrendingUp, label: 'Analytical' },
  { icon: Zap, label: 'Campaign' },
  { icon: Eye, label: 'Modern' },
  { icon: ShoppingCart, label: 'eCommerce' },
  { icon: Globe, label: 'Front Pages' }
];

const summaryCards = [
  {
    icon: DollarSign,
    value: '$3249',
    label: 'Total Revenue',
    gradient: 'from-blue-400 to-cyan-400'
  },
  {
    icon: TrendingUp,
    value: '$2376',
    label: 'Online Revenue',
    gradient: 'from-purple-400 to-pink-400'
  },
  {
    icon: Download,
    value: '$1795',
    label: 'Offline Revenue',
    gradient: 'from-green-400 to-teal-400'
  },
  {
    icon: ShoppingCart,
    value: '$687',
    label: 'Ads Expense',
    gradient: 'from-orange-400 to-red-400'
  }
];

export function MaterialDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-card shadow-lg transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="font-semibold text-text">Markarn Doe</p>
                  <p className="text-sm text-text-secondary">Administrator</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4">
            <div className="mb-6">
              {!sidebarCollapsed && (
                <p className="text-xs uppercase tracking-wider text-text-secondary mb-4">PERSONAL</p>
              )}
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-text'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Toggle Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        {/* Top Navbar */}
        <header className="bg-card shadow-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-xl hover:bg-gray-50">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-text">MaterialPro</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl hover:bg-gray-50">
                <Globe className="w-5 h-5 text-text-secondary" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-50 relative">
                <Bell className="w-5 h-5 text-text-secondary" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-50">
                <Settings className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card) => (
              <Card key={card.label} className="hover:shadow-hover transition-shadow duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text">{card.value}</p>
                    <p className="text-sm text-text-secondary">{card.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Bandwidth Usage */}
            <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bandwidth usage</h3>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-2">50 GB</div>
              <div className="h-16 bg-white/20 rounded-lg flex items-end justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <path
                    d="M0 30 Q25 10 50 25 T100 20"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Card>

            {/* Download Count */}
            <Card className="bg-gradient-to-r from-green-400 to-teal-400 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Download Count</h3>
                <Download className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold mb-2">35487</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-2 bg-white/30 rounded"></div>
                  <span className="text-sm">Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-white/50 rounded"></div>
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-2 bg-white/70 rounded"></div>
                  <span className="text-sm">Tablet</span>
                </div>
              </div>
            </Card>

            {/* Visitors */}
            <Card>
              <h3 className="text-lg font-semibold text-text mb-4">Visitors</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#4facfe"
                      strokeWidth="3"
                      strokeDasharray="60, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#667eea"
                      strokeWidth="3"
                      strokeDasharray="25, 100"
                      strokeDashoffset="-60"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#43cea2"
                      strokeWidth="3"
                      strokeDasharray="15, 100"
                      strokeDashoffset="-85"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-text">75%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-text-secondary">Mobile (60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-sm text-text-secondary">Desktop (25%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm text-text-secondary">Tablet (15%)</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Current Visits */}
          <Card>
            <h3 className="text-lg font-semibold text-text mb-4">Current Visits</h3>
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <div className="text-center">
                <Globe className="w-16 h-16 mx-auto text-blue-400 mb-2" />
                <p className="text-text-secondary">World Map Visualization</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-400 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold text-text">USA</p>
                <p className="text-sm text-text-secondary">45% visits</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-purple-400 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold text-text">India</p>
                <p className="text-sm text-text-secondary">30% visits</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold text-text">Afghanistan</p>
                <p className="text-sm text-text-secondary">25% visits</p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}