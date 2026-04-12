import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Layers, BookOpen, CalendarCheck, FileText,
  DollarSign, CreditCard, Bell, ClipboardList, ShieldCheck, Activity,
  Archive, Settings
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

interface DashboardData {
  students: number;
  teachers: number;
  classes: number;
  subjects: number;
  books: number;
  expenses: number;
  finance: number;
  notifications: number;
  exams: number;
  results: number;
  families: number;
  auditLogs: number;
  users: number;
  enrollmentTrend: Array<{
    year: number;
    month: number;
    students: number;
    teachers: number;
  }>;
}

const moduleCards = [
  { key: 'students', label: 'Students', icon: Users, path: '/students', color: 'text-blue-400' },
  { key: 'teachers', label: 'Teachers', icon: UserCheck, path: '/teachers', color: 'text-green-400' },
  { key: 'classes', label: 'Classes', icon: Layers, path: '/classes', color: 'text-purple-400' },
  { key: 'subjects', label: 'Subjects', icon: BookOpen, path: '/subjects', color: 'text-orange-400' },
  { key: 'exams', label: 'Exams', icon: CalendarCheck, path: '/exams', color: 'text-red-400' },
  { key: 'results', label: 'Results', icon: FileText, path: '/results', color: 'text-indigo-400' },
  { key: 'finance', label: 'Finance', icon: DollarSign, path: '/finance', color: 'text-yellow-400' },
  { key: 'expenses', label: 'Expenses', icon: CreditCard, path: '/expenses', color: 'text-yellow-400' },
  { key: 'families', label: 'Families', icon: Archive, path: '/families', color: 'text-pink-400' },
  { key: 'books', label: 'Books', icon: BookOpen, path: '/books', color: 'text-cyan-400' },
  { key: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', color: 'text-gray-400' },
  { key: 'auditLogs', label: 'Audit Logs', icon: ClipboardList, path: '/audit', color: 'text-teal-400' },
  { key: 'users', label: 'Users', icon: Users, path: '/users', color: 'text-emerald-400' },
];

export function SuperAdminDashboard() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard-full'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data?.data as DashboardData;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Unable to load dashboard data. Please verify your backend is running.</p>
      </div>
    );
  }

  const chartData = data?.enrollmentTrend?.map((item) => ({
    month: `${item.year}-${item.month.toString().padStart(2, '0')}`,
    students: item.students,
    teachers: item.teachers
  })) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Super Admin Dashboard</h1>
        <p className="text-slate-400">Complete system overview and management</p>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {moduleCards.map((card) => {
          const Icon = card.icon;
          const count = data[card.key as keyof DashboardData] as number;
          const isFinance = card.key === 'finance';
          const displayValue = isFinance ? `$${count?.toLocaleString() ?? 0}` : (count?.toLocaleString() ?? 0);

          return (
            <Link key={card.key} to={card.path}>
              <Card className="p-6 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-8 w-8 ${card.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Module</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{card.label}</h3>
                <p className="text-3xl font-bold text-slate-200">{displayValue}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-100 mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Students"
              />
              <Line
                type="monotone"
                dataKey="teachers"
                stroke="#10B981"
                strokeWidth={2}
                name="Teachers"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* System Overview */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-100 mb-4">System Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Users', value: data.users },
              { name: 'Students', value: data.students },
              { name: 'Teachers', value: data.teachers },
              { name: 'Classes', value: data.classes },
              { name: 'Subjects', value: data.subjects }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Access Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-100 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/students">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
              Manage Students
            </button>
          </Link>
          <Link to="/teachers">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors">
              Manage Teachers
            </button>
          </Link>
          <Link to="/classes">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors">
              Manage Classes
            </button>
          </Link>
          <Link to="/users">
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors">
              Manage Users
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}