import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BarChart3, CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ChartCard, EmptyStateCard } from '../../components/ui/DashboardWidgets';

const COLORS = ['#38bdf8', '#22c55e', '#f97316', '#a855f7', '#fb7185', '#0ea5e9'];

interface FinancialSummary {
  monthlyFinances?: Array<{ year: number; month: number; income: number; expenses: number }>;
  expenseCategoryBreakdown?: Array<{ category: string; total: number }>;
  enrollmentTrend?: Array<{ year: number; month: number; students: number; teachers: number }>;
}

interface DashboardAnalyticsProps {
  summary: FinancialSummary;
  loading?: boolean;
}

function monthLabel(year: number, month: number, locale: string) {
  return new Date(year, month - 1, 1).toLocaleString(locale, { month: 'short', year: 'numeric' });
}

export default function DashboardAnalytics({ summary, loading }: DashboardAnalyticsProps) {
  const { i18n, t } = useTranslation();

  const monthlyFinances = summary.monthlyFinances ?? [];
  const enrollmentTrend = summary.enrollmentTrend ?? [];
  const expenseCategoryBreakdown = summary.expenseCategoryBreakdown ?? [];

  const formattedMonthlyFinances = useMemo(
    () =>
      monthlyFinances.map((item) => ({
        ...item,
        monthLabel: monthLabel(item.year, item.month, i18n.language)
      })),
    [monthlyFinances, i18n.language]
  );

  const formattedEnrollmentTrend = useMemo(
    () =>
      enrollmentTrend.map((item) => ({
        ...item,
        month: monthLabel(item.year, item.month, i18n.language)
      })),
    [enrollmentTrend, i18n.language]
  );

  const totalIncome = useMemo(() => monthlyFinances.reduce((sum, item) => sum + item.income, 0), [monthlyFinances]);
  const totalExpenses = useMemo(() => monthlyFinances.reduce((sum, item) => sum + item.expenses, 0), [monthlyFinances]);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-80 rounded-3xl bg-slate-800/70" />
        ))}
      </div>
    );
  }

  if (!monthlyFinances.length && !enrollmentTrend.length && !expenseCategoryBreakdown.length) {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        <EmptyStateCard
          title="No analytics available"
          description="No academy financial or enrollment data is available yet. Add records to see charts here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Monthly Cash Flow" subtitle="Income vs expenses over the last 6 months." action={<DollarSign className="h-5 w-5 text-green-400" />}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedMonthlyFinances} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="monthLabel" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} name={t('monthly_income')} />
              <Line type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={3} name={t('monthly_expenses')} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Enrollment Trends" subtitle="New students and teachers per month." action={<Users className="h-5 w-5 text-sky-500" />}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedEnrollmentTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Bar dataKey="students" fill="#38bdf8" name={t('students')} />
              <Bar dataKey="teachers" fill="#a855f7" name={t('teachers')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense Categories" subtitle="Top spending buckets." action={<BarChart3 className="h-5 w-5 text-orange-400" />}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ color: '#cbd5e1' }} />
              <Pie
                data={expenseCategoryBreakdown}
                dataKey="total"
                nameKey="category"
                innerRadius={54}
                outerRadius={104}
                paddingAngle={4}
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${Math.round(percent * 100)}%`}
              >
                {expenseCategoryBreakdown.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500">Cash Flow</p>
              <h3 className="mt-3 text-3xl font-semibold text-gray-900">${totalIncome - totalExpenses}</h3>
              <p className="mt-2 text-gray-500">Net cash position over the last 6 months.</p>
            </div>
            <TrendingUp className="h-8 w-8 rounded-lg bg-blue-50 p-2 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500">Total Income</p>
              <h3 className="mt-3 text-3xl font-semibold text-gray-900">${totalIncome}</h3>
              <p className="mt-2 text-gray-500">Revenue generated from fees and services.</p>
            </div>
            <DollarSign className="h-8 w-8 rounded-lg bg-green-50 p-2 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500">Total Expenses</p>
              <h3 className="mt-3 text-3xl font-semibold text-gray-900">${totalExpenses}</h3>
              <p className="mt-2 text-gray-500">All school spending recorded in the period.</p>
            </div>
            <CreditCard className="h-8 w-8 rounded-lg bg-rose-50 p-2 text-rose-500" />
          </div>
        </Card>
      </div>
    </div>
  );
}
