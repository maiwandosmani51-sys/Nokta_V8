import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BrainCircuit, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

type AiPlan = {
  title: string;
  executiveSummary: string;
  contextSnapshot: Record<string, string>;
  objectives: string[];
  recommendedActions: string[];
  weeklyWorkflow: string[];
  qualityChecklist: string[];
};

export function AIAssistantPage() {
  const { t, i18n } = useTranslation();
  const [task, setTask] = useState('lesson_plan');
  const [prompt, setPrompt] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-assistant-insights'],
    queryFn: () => api.get('/ai-assistant/insights').then((response) => response.data.data)
  });

  const { data: classes } = useQuery({
    queryKey: ['ai-classes'],
    queryFn: () => api.get('/classes', { params: { limit: 100 } }).then((response) => response.data.data ?? [])
  });

  const { data: subjects } = useQuery({
    queryKey: ['ai-subjects'],
    queryFn: () => api.get('/subjects', { params: { limit: 100 } }).then((response) => response.data.data ?? [])
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post('/ai-assistant/generate', { task, prompt, classId, subjectId, lang: i18n.resolvedLanguage || 'en' }).then((response) => response.data.data as AiPlan)
  });

  const classOptions = useMemo(
    () => (Array.isArray(classes) ? classes : []).map((item: any) => ({ value: item._id, label: item.className ?? item.name ?? t('common.class') })),
    [classes, t]
  );

  const subjectOptions = useMemo(
    () => (Array.isArray(subjects) ? subjects : []).map((item: any) => ({ value: item._id, label: item.title ?? t('common.subject') })),
    [subjects, t]
  );

  const taskOptions = useMemo(() => [
    { value: 'lesson_plan', label: t('common.ai_task_lesson_plan', { defaultValue: 'Lesson plan' }) },
    { value: 'assessment', label: t('common.ai_task_assessment', { defaultValue: 'Assessment design' }) },
    { value: 'student_support', label: t('common.ai_task_student_support', { defaultValue: 'Student support' }) },
    { value: 'school_improvement', label: t('common.ai_task_school_improvement', { defaultValue: 'School improvement' }) },
    { value: 'policy', label: t('common.ai_task_policy', { defaultValue: 'Policy and compliance' }) },
    { value: 'custom', label: t('common.ai_task_custom', { defaultValue: 'Custom request' }) }
  ], [t]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    generateMutation.mutate();
  };

  const plan = generateMutation.data;
  const metrics = insights?.metrics ?? {};

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">{t('common.ai_assistant', { defaultValue: 'AI Assistant' })}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{t('common.ai_learning_system', { defaultValue: 'AI Learning System' })}</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              {t('common.ai_learning_description', {
                defaultValue: 'Generate standards-aligned lesson plans, assessments, student support actions and school improvement recommendations from live academy data.'
              })}
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/15 text-sky-200">
            <BrainCircuit className="h-8 w-8" />
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          [t('common.students'), metrics.students],
          [t('common.teachers'), metrics.teachers],
          [t('common.classes'), metrics.classes],
          [t('common.subjects'), metrics.subjects],
          [t('common.curriculum'), metrics.curricula],
          [t('common.average_score', { defaultValue: 'Avg Score' }), metrics.averageScore]
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{insightsLoading ? '...' : value ?? 0}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">{t('common.ai_task', { defaultValue: 'AI task' })}</label>
              <Select value={task} options={taskOptions} onChange={(value) => setTask(String(value))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t('common.class', { defaultValue: 'Class' })}</label>
                <Select value={classId} options={classOptions} placeholder={t('common.select_field', { field: t('common.class') })} onChange={(value) => setClassId(String(value))} />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">{t('common.subject', { defaultValue: 'Subject' })}</label>
                <Select value={subjectId} options={subjectOptions} placeholder={t('common.select_field', { field: t('common.subject') })} onChange={(value) => setSubjectId(String(value))} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">{t('common.prompt', { defaultValue: 'Prompt' })}</label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-40 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                placeholder={t('common.ai_prompt_placeholder', { defaultValue: 'Example: Create a 45-minute lesson plan for fractions with formative assessment and support for weak students.' })}
              />
            </div>
            <Button type="submit" disabled={generateMutation.isPending} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              {generateMutation.isPending ? t('common.loading') : t('common.generate', { defaultValue: 'Generate' })}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white">{t('common.live_insights', { defaultValue: 'Live insights' })}</h2>
            <div className="mt-4 space-y-3">
              {(insights?.insights ?? []).map((item: string) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {plan && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-white">{plan.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{plan.executiveSummary}</p>
              {[
                [t('common.objectives'), plan.objectives],
                [t('common.recommended_actions', { defaultValue: 'Recommended actions' }), plan.recommendedActions],
                [t('common.weekly_workflow', { defaultValue: 'Weekly workflow' }), plan.weeklyWorkflow],
                [t('common.quality_checklist', { defaultValue: 'Quality checklist' }), plan.qualityChecklist]
              ].map(([title, items]) => (
                <div key={String(title)} className="mt-6">
                  <h3 className="text-sm uppercase tracking-[0.25em] text-sky-300">{String(title)}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {(items as string[]).map((item) => <li key={item} className="rounded-2xl bg-white/5 px-4 py-3">{item}</li>)}
                  </ul>
                </div>
              ))}
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
