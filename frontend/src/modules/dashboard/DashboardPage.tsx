import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Bell, Download, DollarSign, ShoppingCart, TrendingUp, User, Users } from 'lucide-react';
import { dashboardService } from '../../services/dashboard';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalUsers: number;
  totalBooks: number;
  expenses: number;
  notifications: number;
  enrollmentTrend: Array<{ year: number; month: number; students: number; teachers: number }>;
}

const defaultChartData = [
  { name: 'Jan', students: 0, teachers: 0 },
  { name: 'Feb', students: 0, teachers: 0 },
  { name: 'Mar', students: 0, teachers: 0 },
  { name: 'Apr', students: 0, teachers: 0 },
  { name: 'May', students: 0, teachers: 0 },
  { name: 'Jun', students: 0, teachers: 0 }
];

const getSummaryCardDefinitions = (role?: string) => [
  { icon: Users, label: 'Students', key: 'totalStudents', gradient: 'from-primary via-secondary to-accent' },
  { icon: User, label: 'Teachers', key: 'totalTeachers', gradient: 'from-secondary via-accent to-primary' },
  { icon: ShoppingCart, label: 'Classes', key: 'totalClasses', gradient: 'from-accent via-primary to-secondary' },
  { icon: DollarSign, label: 'Subjects', key: 'totalSubjects', gradient: 'from-warning via-danger to-secondary' },
  ...(role === 'admin' || role === 'super_admin' ? [{ icon: Users, label: 'Users', key: 'totalUsers', gradient: 'from-sky-500 via-cyan-500 to-teal-500' }] : [])
];

const breakdownCards = [
  { label: 'Books', key: 'totalBooks' },
  { label: 'Expenses', key: 'expenses', prefix: '$' },
  { label: 'Notifications', key: 'notifications' }
];

function formatChartMonth(month: number) {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1] ?? 'N/A';
}

function SummaryCards({ summary, role }: { summary: Record<string, number>; role?: string }) {
  const cards = getSummaryCardDefinitions(role);
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={`border-white/10 bg-gradient-to-br ${card.gradient} p-6 text-white`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-white shadow-[0_20px_60px_rgba(79,70,229,0.18)]">
                <card.icon className="h-6 w-6" />
              </div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">Summary</span>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-semibold tracking-tight">{summary[card.key]?.toLocaleString() ?? 0}</p>
              <p className="mt-1 text-sm text-slate-300">{card.label}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}

function getRoleIntro(role?: string) {
  switch (role) {
    case 'teacher':
      return {
        title: 'Teacher dashboard',
        description: 'Track your class performance, assignments, and student results in one place.'
      };
    case 'student':
      return {
        title: 'Student dashboard',
        description: 'Review your latest results, notifications, and academic progress.'
      };
    case 'family_student':
      return {
        title: 'Family dashboard',
        description: 'View your student family details, exam results, and notifications.'
      };
    case 'accountant':
      return {
        title: 'Accountant dashboard',
        description: 'Monitor finance summaries, expense reports, and budget insights.'
      };
    case 'librarian':
      return {
        title: 'Librarian dashboard',
        description: 'Manage library inventory, book availability, and borrowing statistics.'
      };
    case 'admin':
      return {
        title: 'Admin dashboard',
        description: 'Access academy operations, user management, and key performance indicators.'
      };
    case 'super_admin':
      return {
        title: 'Super admin dashboard',
        description: 'View the full system overview with administrative controls and metrics.'
      };
    default:
      return {
        title: 'Academy overview',
        description: 'Live numbers from your academy backend, including students, teachers, classes, and recent trends.'
      };
  }
}

function AnalyticsSection({
  chartData,
  summary
}: {
  chartData: Array<{ name: string; students: number; teachers: number }>;
  summary: Record<string, number>;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Enrollment Trends</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Students & Teachers</h2>
          </div>
          <button className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition duration-300 hover:bg-white/15">
            Last 6 months
          </button>
        </div>
        <div className="h-[320px] rounded-[32px] bg-white/5 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradientTeachers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.96)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', color: '#fff', boxShadow: '0 20px 80px rgba(0,0,0,0.25)' }} />
              <Area type="monotone" dataKey="students" stroke="#38bdf8" strokeWidth={3} fill="url(#gradientStudents)" activeDot={{ r: 8, fill: '#38bdf8' }} />
              <Area type="monotone" dataKey="teachers" stroke="#a855f7" strokeWidth={3} fill="url(#gradientTeachers)" activeDot={{ r: 8, fill: '#a855f7' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6">
        {breakdownCards.map((card) => (
          <Card key={card.key} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">
                  {card.prefix ?? ''}{summary[card.key]?.toLocaleString() ?? 0}
                </h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { data: summary, isLoading, isError } = useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.summary
  });

  const { data: usersCount } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => api.get('/users/count')
  });

  const chartData = useMemo(
    () =>
      summary?.enrollmentTrend?.map((item: any) => ({
        name: formatChartMonth(item.month),
        students: item.students || 0,
        teachers: item.teachers || 0
      })) ?? defaultChartData,
    [summary]
  );

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const summaryValues = useMemo(
    () => ({
      totalStudents: summary?.totalStudents ?? 0,
      totalTeachers: summary?.totalTeachers ?? 0,
      totalClasses: summary?.totalClasses ?? 0,
      totalSubjects: summary?.totalSubjects ?? 0,
      totalUsers: usersCount?.data?.count ?? summary?.totalUsers ?? 0,
      totalBooks: summary?.totalBooks ?? 0,
      expenses: summary?.expenses ?? 0,
      notifications: summary?.notifications ?? 0
    }),
    [summary, usersCount]
  );

  const roleIntro = useMemo(() => getRoleIntro(user?.role), [user?.role]);

  return (
    <div className="grid gap-6">
      {isError && (
        <Card className="border border-rose-500/40 bg-rose-500/5 p-6 text-rose-200">
          <p>Unable to load dashboard data. Please verify your backend is running and that you are authenticated.</p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{roleIntro.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">{roleIntro.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100">
              <Users className="h-4 w-4 text-primary" /> Real-time sync
            </div>
            {user?.role === 'super_admin' && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/manage-users')}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary/90"
              >
                Manage Users
              </button>
            )}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-40 animate-pulse bg-slate-900/70">
                <div className="h-full" />
              </Card>
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <Card className="h-[360px] animate-pulse bg-slate-900/70">
              <div className="h-full" />
            </Card>
            <Card className="h-[360px] animate-pulse bg-slate-900/70">
              <div className="h-full" />
            </Card>
          </div>
        </div>
      ) : (
        <>
          <SummaryCards summary={summaryValues} role={user?.role} />
          <AnalyticsSection chartData={chartData} summary={summaryValues} />
          <Card className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Top regions</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Regional breakdown</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100">
                <User className="h-4 w-4 text-primary" /> Live updates
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {['North America', 'Europe', 'Asia'].map((region, index) => (
                <div key={region} className="rounded-[28px] bg-white/5 p-5 transition duration-300 hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{region}</p>
                    <span className="text-sm text-slate-400">{['42%', '31%', '27%'][index]}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-accent'}`} style={{ width: ['42%', '31%', '27%'][index] }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
