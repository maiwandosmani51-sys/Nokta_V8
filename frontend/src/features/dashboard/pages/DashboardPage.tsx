import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, BookOpen, CalendarDays, DollarSign, ExternalLink, GraduationCap, MessageCircle, Receipt, School, Send, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { chartTheme } from '@/constants/chartTheme';
import { dashboardService, type DashboardSummary } from '@/features/dashboard/services/dashboardService';
import { useAuthStore } from '@/store/authStore';
import DashboardAnalytics from '@/features/dashboard/components/DashboardAnalytics';
import { api } from '@/services/apiClient';
import { offlineStudentTeacher, offlineTimetable } from '@/services/offlineData';

function formatChartMonth(month: number, language: string) {
  return new Date(2026, month - 1, 1).toLocaleString(language, { month: 'short' });
}

function getRoleIntro(role?: string) {
  switch (role) {
    case 'branch_manager':
      return { titleKey: 'dashboard.branch_manager_dashboard', descriptionKey: 'common.live_school_metrics' };
    case 'owner':
      return { titleKey: 'dashboard.owner_dashboard', descriptionKey: 'common.view_financial_reports' };
    case 'parent':
      return { titleKey: 'dashboard.parent_dashboard', descriptionKey: 'common.view_results' };
    case 'teacher':
      return { titleKey: 'dashboard.teacher_dashboard', descriptionKey: 'common.live_school_metrics' };
    case 'student':
      return { titleKey: 'dashboard.student_dashboard', descriptionKey: 'common.use_menu' };
    case 'admin':
      return { titleKey: 'dashboard.admin_dashboard', descriptionKey: 'common.live_school_metrics' };
    case 'super_admin':
      return { titleKey: 'dashboard.super_admin_dashboard', descriptionKey: 'common.live_school_metrics' };
    default:
      return { titleKey: 'common.dashboard', descriptionKey: 'common.live_school_metrics' };
  }
}

function getSummaryCardDefinitions(role?: string) {
  const baseCards = [
    { icon: GraduationCap, labelKey: 'dashboard.total_students', valueKey: 'totalStudents', gradient: 'from-primary via-secondary to-accent' },
    { icon: Users, labelKey: 'dashboard.total_teachers', valueKey: 'totalTeachers', gradient: 'from-secondary via-accent to-primary' },
    { icon: School, labelKey: 'dashboard.total_classes', valueKey: 'totalClasses', gradient: 'from-accent via-primary to-secondary' },
    { icon: BookOpen, labelKey: 'dashboard.total_subjects', valueKey: 'totalSubjects', gradient: 'from-warning via-danger to-secondary' }
  ];

  if (role === 'student' || role === 'parent') {
    return [
      { icon: GraduationCap, labelKey: 'dashboard.total_students', valueKey: 'totalStudents', gradient: 'from-primary via-secondary to-accent' },
      { icon: Users, labelKey: 'dashboard.total_teachers', valueKey: 'totalTeachers', gradient: 'from-secondary via-accent to-primary' },
      { icon: Bell, labelKey: 'dashboard.notifications', valueKey: 'totalNotifications', gradient: 'from-accent via-primary to-secondary' },
      { icon: Receipt, labelKey: 'common.reports', valueKey: 'outstandingBalance', gradient: 'from-warning via-danger to-secondary', currency: true }
    ];
  }

  if (role === 'owner' || role === 'branch_manager') {
    return [
      { icon: DollarSign, labelKey: 'dashboard.total_income', valueKey: 'incomeTotal', gradient: 'from-primary via-secondary to-accent', currency: true },
      { icon: Receipt, labelKey: 'finance.total_expenses', valueKey: 'expenseTotal', gradient: 'from-secondary via-accent to-primary', currency: true },
      { icon: Bell, labelKey: 'dashboard.notifications', valueKey: 'totalNotifications', gradient: 'from-accent via-primary to-secondary' },
      { icon: Users, labelKey: 'common.students', valueKey: 'totalStudents', gradient: 'from-warning via-danger to-secondary' }
    ];
  }

  return baseCards;
}

function SummaryCards({ summary, role }: { summary: DashboardSummary; role?: string }) {
  const { t } = useTranslation();
  const cards = getSummaryCardDefinitions(role);

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <motion.div key={card.valueKey} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className={`border-white/10 bg-gradient-to-br ${card.gradient} p-6 text-white`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-white shadow-[0_20px_60px_rgba(79,70,229,0.18)]">
                <card.icon className="h-6 w-6" />
              </div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">{t('dashboard.statistics')}</span>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-semibold tracking-tight">
                {card.currency ? '$' : ''}
                {(summary[card.valueKey as keyof DashboardSummary] as number)?.toLocaleString?.() ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-300">{t(card.labelKey)}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}

function AnalyticsSection({ chartData, summary }: { chartData: Array<{ name: string; students: number; teachers: number }>; summary: DashboardSummary }) {
  const { t } = useTranslation();
  const breakdownCards = [
    { labelKey: 'dashboard.total_books', value: summary.totalBooks },
    { labelKey: 'dashboard.notifications', value: summary.totalNotifications },
    { labelKey: 'finance.total_expenses', value: summary.expenseTotal, prefix: '$' }
  ];

  return (
    <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t('common.analytics_overview')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{t('dashboard.enrollment_trend')}</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white">{t('common.chart_school_growth')}</span>
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
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="name" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTheme.tooltip} />
              <Area type="monotone" dataKey="students" stroke="#38bdf8" strokeWidth={3} fill="url(#gradientStudents)" activeDot={{ r: 8, fill: '#38bdf8' }} />
              <Area type="monotone" dataKey="teachers" stroke="#a855f7" strokeWidth={3} fill="url(#gradientTeachers)" activeDot={{ r: 8, fill: '#a855f7' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6">
        {breakdownCards.map((card) => (
          <Card key={card.labelKey} className="p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t(card.labelKey)}</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              {card.prefix ?? ''}
              {card.value.toLocaleString()}
            </h3>
          </Card>
        ))}
      </div>
    </section>
  );
}

interface TeacherContact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  whatsappLink?: string;
}

interface TimetableItem {
  _id: string;
  className?: string;
  subjectName?: string;
  teacherName?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  deliveryMode?: string;
  onlineLink?: string;
}

function StudentSupportSection() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const { data: teacher } = useQuery<TeacherContact | null>({
    queryKey: ['studentTeacherContact'],
    queryFn: () => api.get('/student-messages/my-teacher').then((res) => res.data.data ?? offlineStudentTeacher).catch(() => offlineStudentTeacher)
  });

  const { data: timetable = offlineTimetable } = useQuery<TimetableItem[]>({
    queryKey: ['studentDashboardTimetable'],
    queryFn: () => api.get('/timetable', { params: { limit: 6 } }).then((res) => {
      const data = res.data.data;
      return Array.isArray(data) && data.length ? data : offlineTimetable;
    }).catch(() => offlineTimetable)
  });

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await api.post('/student-messages', { teacherId: teacher?._id, subject, message });
      setStatus(t('common.message_sent'));
      setSubject('');
      setMessage('');
    } catch {
      const drafts = JSON.parse(localStorage.getItem('nokta-offline-student-message-drafts') || '[]');
      localStorage.setItem('nokta-offline-student-message-drafts', JSON.stringify([...drafts, { subject, message, teacherId: teacher?._id, createdAt: new Date().toISOString() }]));
      setStatus(t('common.message_saved_offline'));
      setSubject('');
      setMessage('');
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('common.student_messages')}</p>
            <h2 className="text-xl font-semibold text-slate-100">{t('common.messages_to_teacher')}</h2>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold text-slate-100">{teacher?.name || t('common.teacher_contact')}</p>
          <p className="mt-1 text-sm text-slate-400">{teacher?.email || teacher?.phone || t('common.offline_teacher_contact')}</p>
          {teacher?.whatsappLink && (
            <a href={teacher.whatsappLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              <ExternalLink className="h-4 w-4" />
              {t('common.open_whatsapp')}
            </a>
          )}
        </div>
        <div className="mt-4 grid gap-3">
          <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder={t('common.message_subject')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-primary" />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('common.message_body')} rows={4} className="resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-primary" />
          <button type="button" onClick={sendMessage} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90">
            <Send className="h-4 w-4" />
            {t('common.send_message')}
          </button>
          {status && <p className="text-sm text-emerald-300">{status}</p>}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('common.class_timetable')}</p>
            <h2 className="text-xl font-semibold text-slate-100">{t('common.class_timetable_description')}</h2>
          </div>
        </div>
        <div className="grid gap-3">
          {timetable.map((item) => (
            <div key={item._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{item.subjectName || item.className || t('common.subject')}</p>
                  <p className="mt-1 text-sm text-slate-400">{t(`common.${item.dayOfWeek || 'saturday'}`)} | {item.startTime} - {item.endTime} | {item.room || t('common.room')}</p>
                </div>
                {item.onlineLink && (
                  <a href={item.onlineLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('common.online_link')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: summary, isLoading, isError } = useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.summary
  });

  const roleIntro = useMemo(() => getRoleIntro(user?.role), [user?.role]);
  const chartData = useMemo(() => {
    if (summary?.enrollmentTrend?.length) {
      return summary.enrollmentTrend.map((item) => ({
        name: formatChartMonth(item.month, i18n.language),
        students: item.students || 0,
        teachers: item.teachers || 0
      }));
    }

    return Array.from({ length: 6 }, (_, index) => ({
      name: formatChartMonth(index + 1, i18n.language),
      students: 0,
      teachers: 0
    }));
  }, [summary, i18n.language]);

  const safeSummary = summary ?? {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalUsers: 0,
    totalFamilies: 0,
    totalBooks: 0,
    totalAuditLogs: 0,
    totalNotifications: 0,
    expenseTotal: 0,
    incomeTotal: 0,
    outstandingBalance: 0,
    enrollmentTrend: [],
    monthlyFinances: [],
    expenseCategoryBreakdown: []
  };

  return (
    <div className="grid gap-6">
      {isError && (
        <Card className="border border-rose-500/40 bg-rose-500/5 p-6 text-rose-200">
          <p>{t('errors.unable_load_records')}</p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t('common.dashboard')}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{t(roleIntro.titleKey)}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">{t(roleIntro.descriptionKey, { name: user?.name ?? t('common.guest') })}</p>
          </div>
          {user?.role === 'super_admin' && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/manage-users')}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary/90"
            >
              {t('dashboard.manage_users')}
            </button>
          )}
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
          {user?.role === 'student' && <StudentSupportSection />}
          <SummaryCards summary={safeSummary} role={user?.role} />
          {user?.role === 'owner' || user?.role === 'branch_manager' ? (
            <DashboardAnalytics summary={safeSummary} />
          ) : (
            <AnalyticsSection chartData={chartData} summary={safeSummary} />
          )}
        </>
      )}
    </div>
  );
}
