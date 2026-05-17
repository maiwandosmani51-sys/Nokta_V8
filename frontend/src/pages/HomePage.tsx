import { memo, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/app/providers/ThemeProvider';
import { api } from '@/services/apiClient';
import { offlineHomeAnnouncements, offlineHomeCourses } from '@/services/offlineData';

interface HomeNotification {
  _id: string;
  title: string;
  description: string;
  message?: string;
  publishDate?: string;
  classId?: string | null;
  subjectId?: string | null;
  teacherId?: string | null;
  className?: string;
  subjectName?: string;
  teacherName?: string;
}

interface HomeCourse {
  _id: string;
  titleText: string;
  descriptionText?: string;
  duration?: string;
  fee?: number;
  instructorName?: string;
  enrollmentStatus?: string;
  imageUrl?: string;
  academicCategory?: string;
  schedule?: string;
}

function AnimatedHeroTitle({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <h1 className="mx-auto max-w-4xl bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 bg-clip-text text-5xl font-black leading-tight text-transparent drop-shadow-[0_16px_55px_rgba(0,0,0,0.58)] sm:text-6xl lg:text-7xl">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="mx-1 inline-block"
          animate={{ opacity: [0, 1, 1, 0], y: [14, 0, 0, -8] }}
          transition={{
            duration: 3.6,
            times: [0, 0.16, 0.78, 1],
            delay: index * 0.18,
            repeat: Infinity,
            repeatDelay: Math.max(1.2, words.length * 0.18)
          }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

function MotionSection({ id, className, children }: { id: string; className: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      className={className}
      variants={sectionReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.18 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

export const HomePage = memo(function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [activeHeroImage, setActiveHeroImage] = useState(0);

  const heroImages = useMemo(
    () => [
      '/images/home/academic-classroom.jpg',
      '/images/home/lecture-hall.jpg',
      '/images/home/university-library.jpg'
    ],
    []
  );

  const { data: announcements } = useQuery({
    queryKey: ['home-notifications'],
    queryFn: () => api.get('/notifications/public', { params: { limit: 4 } })
      .then((res) => res.data.data as HomeNotification[])
      .catch(() => offlineHomeAnnouncements as HomeNotification[]),
    staleTime: 60_000
  });

  const { data: courses } = useQuery({
    queryKey: ['home-courses', i18n.resolvedLanguage],
    queryFn: () => api.get('/courses/public/home', { params: { limit: 6, lang: i18n.resolvedLanguage || 'en' } })
      .then((res) => res.data.data as HomeCourse[])
      .catch(() => offlineHomeCourses as HomeCourse[]),
    staleTime: 60_000
  });

  const displayedAnnouncements = useMemo(
    () => (announcements?.length ? announcements : offlineHomeAnnouncements as HomeNotification[]),
    [announcements]
  );

  const displayedCourses = useMemo(
    () => (courses?.length ? courses : offlineHomeCourses as HomeCourse[]),
    [courses]
  );

  const locale = useMemo(() => {
    if (i18n.resolvedLanguage === 'fa') return 'fa-AF';
    if (i18n.resolvedLanguage === 'ps') return 'ps-AF';
    return 'en-US';
  }, [i18n.resolvedLanguage]);

  const navItems = useMemo(
    () => [
      { id: 'home', label: t('nav_home') },
      { id: 'about', label: t('nav_about') },
      { id: 'programs', label: t('common.courses') },
      { id: 'services', label: t('nav_services') },
      { id: 'contact', label: t('nav_contact') }
    ],
    [t]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length);
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  const services = useMemo(
    () => [
      t('service_student_management'),
      t('service_teacher_management'),
      t('service_finance_reports'),
      t('service_exams_results'),
      t('service_family_access'),
      t('service_notifications')
    ],
    [t]
  );

  const teacherCards = useMemo(
    () => [
      { title: t('common.teachers'), text: t('about_feature_teachers') },
      { title: t('common.attendance'), text: t('service_student_management') },
      { title: t('common.results'), text: t('service_exams_results') }
    ],
    [t]
  );

  const scrollTo = useCallback((section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactStatus(t('contact_sent'));
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const handleAnnouncementRegister = (announcement: HomeNotification) => {
    const params = new URLSearchParams();
    if (announcement.classId) params.set('classId', announcement.classId);
    if (announcement.subjectId) params.set('subjectId', announcement.subjectId);
    if (announcement.teacherId) params.set('teacherId', announcement.teacherId);
    if (announcement.title) params.set('sourceTitle', announcement.title);
    params.set('sourceType', 'announcement');
    localStorage.setItem('nokta-selected-registration', JSON.stringify({
      sourceType: 'announcement',
      title: announcement.title,
      classId: announcement.classId ?? null,
      subjectId: announcement.subjectId ?? null,
      teacherId: announcement.teacherId ?? null,
      className: announcement.className ?? '',
      subjectName: announcement.subjectName ?? '',
      teacherName: announcement.teacherName ?? ''
    }));
    navigate(`/register?${params.toString()}`);
  };

  const handleCourseRegister = (course: HomeCourse) => {
    localStorage.setItem('nokta-selected-registration', JSON.stringify({
      sourceType: 'course',
      title: course.titleText,
      fee: course.fee ?? 0,
      schedule: course.schedule ?? '',
      teacherName: course.instructorName ?? ''
    }));
    navigate(`/register?sourceType=course&sourceTitle=${encodeURIComponent(course.titleText)}`);
  };

  const pageClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const headerClass = isDark ? 'border-slate-800/70 bg-slate-950/95' : 'border-slate-200/80 bg-white/95';
  const navClass = isDark ? 'text-slate-300 hover:text-slate-100' : 'text-slate-600 hover:text-slate-950';
  const titleClass = isDark ? 'text-white' : 'text-slate-950';
  const textClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const sectionBorderClass = isDark ? 'border-slate-800/80' : 'border-slate-200/80';
  const cardClass = isDark ? 'border-slate-800/80 bg-slate-900/85 shadow-slate-950/20' : 'border-slate-200 bg-white shadow-slate-200/70';
  const insetCardClass = isDark ? 'border-slate-800/80 bg-slate-950/70 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700';
  const serviceSectionClass = isDark ? 'bg-slate-900/80' : 'bg-white';
  const inputClass = isDark
    ? 'border-slate-800/80 bg-slate-900/80 text-slate-100 focus:border-sky-500 focus:ring-sky-500/20'
    : 'border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-sky-500/20';

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <header className={`fixed inset-x-0 top-0 z-50 border-b ${headerClass} backdrop-blur-xl`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg shadow-amber-500/10 ring-1 ring-amber-200/40">
              <img src="/images/1.png" alt="Nokta Academy" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">{t('home_brand')}</p>
              <p className={isDark ? 'text-xs text-slate-500' : 'text-xs text-slate-600'}>{t('home_tagline')}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`text-sm font-medium transition ${navClass}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>
              {t('nav_login')}
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <MotionSection id="home" className="relative min-h-[calc(100vh-6rem)] overflow-hidden px-4 pb-10 pt-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === activeHeroImage ? 'opacity-100' : 'opacity-0'}`}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.55),rgba(15,23,42,0.66)_48%,rgba(2,6,23,0.9))]" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-slate-950 via-slate-950/72 to-transparent" />
          </div>
          <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl flex-col justify-between gap-10">
            <div className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center text-center">
              <div className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.42em] text-amber-200 drop-shadow-[0_2px_18px_rgba(245,158,11,0.45)]">{t('home_intro_label')}</p>
                <AnimatedHeroTitle text={t('hero_title')} />
                <p className="mx-auto max-w-3xl text-lg font-medium leading-8 text-amber-50/95 drop-shadow-[0_8px_30px_rgba(0,0,0,0.62)] sm:text-xl">
                  {t('hero_description')}
                </p>
              </div>

              <div className="mt-8 flex flex-row flex-wrap items-center justify-center gap-4">
                <Button size="md" className="min-w-[150px] border border-amber-200/40 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 py-4 text-slate-950 shadow-[0_18px_60px_rgba(245,158,11,0.32)] hover:scale-[1.02]" onClick={() => navigate('/login')}>
                  {t('hero_cta_login')}
                </Button>
                <Button size="md" className="min-w-[150px] border border-amber-200/40 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 py-4 text-slate-950 shadow-[0_18px_60px_rgba(245,158,11,0.32)] hover:scale-[1.02]" onClick={() => scrollTo('about')}>
                  {t('hero_cta_learn_more')}
                </Button>
                <Button size="md" className="min-w-[150px] border border-amber-200/40 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 py-4 text-slate-950 shadow-[0_18px_60px_rgba(245,158,11,0.32)] hover:scale-[1.02]" onClick={() => scrollTo('contact')}>
                  {t('hero_cta_contact')}
                </Button>
              </div>
            </div>

            <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_1fr_360px]">
              <div className="rounded-[1.75rem] border border-amber-200/15 bg-slate-950/68 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-amber-300/45">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/75">{t('home_summary_title')}</p>
                <p className="mt-4 text-2xl font-semibold text-amber-50">{t('home_summary_students')}</p>
                <p className="mt-2 text-slate-300">{t('home_summary_students_text')}</p>
              </div>
              <div className="rounded-[1.75rem] border border-amber-200/15 bg-slate-950/68 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-amber-300/45">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200/75">{t('home_summary_title')}</p>
                <p className="mt-4 text-2xl font-semibold text-amber-50">{t('home_summary_reports')}</p>
                <p className="mt-2 text-slate-300">{t('home_summary_reports_text')}</p>
              </div>

              <div className="rounded-[1.75rem] border border-amber-200/20 bg-slate-950/72 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{t('home_login_card')}</p>
                  <h2 className="text-2xl font-semibold text-amber-50">{t('home_login_card')}</h2>
                  <p className="text-sm leading-6 text-slate-300">{t('home_login_hint')}</p>
                </div>
                <div className="mt-5">
                  <Button className="w-full border border-amber-200/40 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 py-3 text-slate-950" onClick={() => navigate('/login')}>
                    {t('hero_cta_login')}
                  </Button>
                </div>
                <div className="mt-5 flex justify-center gap-2">
                  {heroImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      aria-label={t('common.select_slide', { defaultValue: 'Select slide' })}
                      onClick={() => setActiveHeroImage(index)}
                      className={`h-2 rounded-full transition-all ${index === activeHeroImage ? 'w-10 bg-amber-300' : 'w-2 bg-slate-500'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="about" className={`border-t ${sectionBorderClass} px-4 py-20 sm:px-6 lg:px-8`}>
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-4">
              <p className="text-sky-400 uppercase tracking-[0.3em] text-xs">{t('about_label')}</p>
              <h2 className={`text-4xl font-semibold ${titleClass}`}>{t('about_title')}</h2>
              <p className={`text-lg leading-8 ${textClass}`}>{t('about_description')}</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {[
                t('about_feature_students'),
                t('about_feature_teachers'),
                t('about_feature_reports')
              ].map((text) => (
                <div key={text} className={`rounded-3xl border ${cardClass} p-6 transition duration-500 hover:-translate-y-1 hover:border-sky-500/50`}>
                  <p className={`text-lg font-semibold ${titleClass}`}>{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {teacherCards.map((card) => (
                <motion.div
                  key={card.title}
                  className={`rounded-3xl border ${cardClass} p-6 transition duration-500 hover:-translate-y-1 hover:border-amber-400/60`}
                  variants={sectionReveal}
                >
                  <p className={`text-lg font-semibold ${titleClass}`}>{card.title}</p>
                  <p className={`mt-3 text-sm leading-7 ${textClass}`}>{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="programs" className={`border-t ${sectionBorderClass} px-4 py-20 sm:px-6 lg:px-8`}>
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-4">
              <p className="text-sky-400 uppercase tracking-[0.3em] text-xs">{t('common.educational_programs')}</p>
              <h2 className={`text-4xl font-semibold ${titleClass}`}>{t('common.educational_programs_title')}</h2>
              <p className={`text-lg leading-8 ${textClass}`}>{t('common.educational_programs_description')}</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayedCourses.map((course) => (
                <motion.article
                  key={course._id}
                  className={`overflow-hidden rounded-3xl border ${cardClass} shadow-2xl transition duration-500 hover:-translate-y-1 hover:border-amber-400/60`}
                  variants={sectionReveal}
                >
                  <div className="aspect-[16/9] bg-slate-800">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.titleText} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-slate-800 via-slate-900 to-sky-950 text-sky-200">
                        <span className="text-sm uppercase tracking-[0.3em]">{t('common.course')}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-300">
                      <span>{course.academicCategory || t('common.general')}</span>
                      <span>{course.enrollmentStatus ? t(`common.${course.enrollmentStatus}`, { defaultValue: course.enrollmentStatus }) : ''}</span>
                    </div>
                    <h3 className={`text-2xl font-semibold ${titleClass}`}>{course.titleText}</h3>
                    <p className={`text-sm leading-7 ${textClass}`}>{course.descriptionText || t('common.not_available')}</p>
                    <div className={`grid gap-3 text-sm sm:grid-cols-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <p>{t('classes.class_name')}: {course.titleText}</p>
                      <p>{t('students.subject')}: {course.academicCategory || t('common.general')}</p>
                      <p>{t('common.duration')}: {course.duration || t('common.not_available')}</p>
                      <p>{t('common.fee')}: {course.fee ?? 0}</p>
                      <p className="sm:col-span-2">{t('common.instructor')}: {course.instructorName || t('common.not_available')}</p>
                      <p className="sm:col-span-2">{t('common.schedule')}: {course.schedule || t('common.not_available')}</p>
                    </div>
                    <Button size="sm" onClick={() => handleCourseRegister(course)}>
                      {t('common.register')}
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>

            {!displayedCourses.length && (
              <div className={`mt-12 rounded-3xl border border-dashed ${sectionBorderClass} p-8 text-center ${textClass}`}>
                {t('common.no_records_found')}
              </div>
            )}
          </div>
        </MotionSection>

        <MotionSection id="services" className={`${serviceSectionClass} px-4 py-20 sm:px-6 lg:px-8`}>
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-4">
              <p className="text-sky-400 uppercase tracking-[0.3em] text-xs">{t('services_label')}</p>
              <h2 className={`text-4xl font-semibold ${titleClass}`}>{t('services_title')}</h2>
              <p className={`text-lg leading-8 ${textClass}`}>{t('services_description')}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <motion.div key={service} className={`group rounded-[2rem] border ${cardClass} p-8 shadow-2xl transition duration-500 hover:-translate-y-1 hover:border-sky-500/50`} variants={sectionReveal}>
                  <div className="mb-6 inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                    {t('service_tag')}
                  </div>
                  <h3 className={`text-2xl font-semibold ${titleClass}`}>{service}</h3>
                  <p className={`mt-4 ${textClass}`}>{t('service_card_description')}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="notifications" className={`border-t ${sectionBorderClass} px-4 py-20 sm:px-6 lg:px-8`}>
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-4">
              <p className="text-sky-400 uppercase tracking-[0.3em] text-xs">{t('notifications.latest_announcements', { defaultValue: 'Latest Announcements' })}</p>
              <h2 className={`text-4xl font-semibold ${titleClass}`}>{t('notifications.latest_announcements', { defaultValue: 'Latest Announcements' })}</h2>
              <p className={`text-lg leading-8 ${textClass}`}>{t('notifications.home_description', { defaultValue: 'Stay updated with the newest academy announcements, notices, and published updates.' })}</p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {displayedAnnouncements.map((announcement) => (
                <motion.article key={announcement._id} className={`overflow-hidden rounded-[2rem] border ${cardClass} shadow-2xl transition duration-500 hover:-translate-y-1 hover:border-sky-500/50`} variants={sectionReveal}>
                  <div className="space-y-4 p-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                      {announcement.publishDate ? new Date(announcement.publishDate).toLocaleDateString(locale) : ''}
                    </p>
                    <h3 className={`text-2xl font-semibold ${titleClass}`}>{announcement.title}</h3>
                    <p className={`text-sm leading-7 ${textClass}`}>{announcement.description || announcement.message || t('common.not_available')}</p>
                    {(announcement.className || announcement.subjectName || announcement.teacherName) && (
                      <div className={`space-y-2 rounded-2xl border p-4 text-sm ${insetCardClass}`}>
                        <p>{t('students.class')}: {announcement.className || t('common.not_available')}</p>
                        <p>{t('students.subject')}: {announcement.subjectName || t('common.not_available')}</p>
                        <p>{t('students.teacher')}: {announcement.teacherName || t('common.not_available')}</p>
                      </div>
                    )}
                    <Button size="sm" onClick={() => handleAnnouncementRegister(announcement)}>
                      {t('common.register', { defaultValue: 'Register' })}
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>

            {!displayedAnnouncements.length && (
              <div className={`mt-12 rounded-[2rem] border border-dashed ${sectionBorderClass} p-8 text-center ${textClass}`}>
                {t('common.no_records_found')}
              </div>
            )}
          </div>
        </MotionSection>

        <MotionSection id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <p className="text-sky-400 uppercase tracking-[0.3em] text-xs">{t('contact_label')}</p>
                <h2 className={`text-4xl font-semibold ${titleClass}`}>{t('contact_title')}</h2>
                <p className={`text-lg leading-8 ${textClass}`}>{t('contact_description')}</p>
                <div className={`space-y-4 rounded-3xl border ${cardClass} p-6`}>
                  <p className={`text-base font-semibold ${titleClass}`}>{t('contact_email')}</p>
                  <p className={textClass}>support@noktaacademy.edu</p>
                  <p className={`text-base font-semibold ${titleClass}`}>{t('contact_phone')}</p>
                  <p className={textClass}>+98 21 1234 5678</p>
                  <p className={`text-base font-semibold ${titleClass}`}>{t('contact_address')}</p>
                  <p className={textClass}>{t('contact_address_text')}</p>
                </div>
              </div>

              <div className={`rounded-[2rem] border ${cardClass} p-8 shadow-2xl`}>
                <h3 className={`text-2xl font-semibold ${titleClass}`}>{t('contact_form_title')}</h3>
                <p className={`mt-3 ${textClass}`}>{t('contact_form_description')}</p>
                <form onSubmit={handleContactSubmit} className="mt-8 space-y-5">
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('contact_form_name')}</label>
                    <Input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder={t('contact_form_name_placeholder')} />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('contact_form_email')}</label>
                    <Input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder={t('contact_form_email_placeholder')} type="email" />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('contact_form_message')}</label>
                    <textarea
                      value={contactMessage}
                      onChange={(event) => setContactMessage(event.target.value)}
                      placeholder={t('contact_form_message_placeholder')}
                      rows={5}
                      className={`w-full rounded-3xl border px-4 py-3 outline-none transition focus:ring-2 ${inputClass}`}
                    />
                  </div>
                  {contactStatus && <p className="text-sm text-emerald-400">{contactStatus}</p>}
                  <Button type="submit" className="w-full py-4">
                    {t('contact_form_submit')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </MotionSection>

        <footer className={`border-t ${sectionBorderClass} ${isDark ? 'bg-slate-950/90' : 'bg-white'} px-4 py-12 sm:px-6 lg:px-8`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">{t('home_brand')}</p>
              <p className={`mt-3 max-w-xl ${textClass}`}>{t('footer_description')}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
              <div className="space-y-2">
                <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{t('footer_quick_links')}</p>
                <div className={`flex flex-wrap gap-3 text-sm ${textClass}`}>
                  {navItems.map((item) => (
                    <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className={`transition ${isDark ? 'hover:text-slate-100' : 'hover:text-slate-950'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <div className={`mt-10 border-t ${sectionBorderClass} pt-6 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {t('footer_copyright')}
          </div>
        </footer>
      </main>
    </div>
  );
});
