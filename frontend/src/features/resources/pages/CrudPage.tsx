import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/apiClient';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelectOptions } from '@/hooks/useSelectOptions';
import { useTranslation } from 'react-i18next';
import i18n from '@/locales/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertTriangle, ArrowUpDown, LayoutGrid, Plus, Table2, X } from 'lucide-react';
import { hasExplicitAccessProfile, normalizeRole, userHasModuleAction, type ModuleConfig, type ModuleField } from '@/features/resources/config/modules';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/app/providers/ThemeProvider';
import { PageHeader, SearchFilterBar, DataTable, FormModal } from '@/shared/components/Common';
import { hasSortSupport, matchesSearch, sortCollection, type ListSortDirection, type ListSortField } from '@/utils/listSearchSort';

interface CrudPageProps {
  config: ModuleConfig;
}

export const CrudPage = ({ config }: CrudPageProps) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<ListSortField>('name');
  const [sortDirection, setSortDirection] = useState<ListSortDirection>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreparingEdit, setIsPreparingEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const debouncedSearch = useDebounce(search, 300);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { isDark } = useTheme();
  const role = normalizeRole((user?.role as any) ?? null) ?? user?.role;
  const strictPermissions = hasExplicitAccessProfile(user);
  const entityCardClass = isDark
    ? 'border-slate-800/80 bg-slate-950/90 text-slate-100 shadow-xl'
    : 'border-slate-200 bg-white/95 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';
  const entityPanelClass = isDark ? 'bg-slate-900/80 text-slate-100' : 'bg-slate-50 text-slate-900';
  const entityMutedTextClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const entityBodyTextClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const entityTitleClass = isDark ? 'text-white' : 'text-slate-950';

  const translate = (text: string | undefined) => (text ? t(text, { defaultValue: text }) : '');
  const pageTitle = translate(config.title);
  const pageDescription = config.description ? t(config.description, { defaultValue: config.description }) : undefined;
  const entityLabel = translate(config.entity);
  const entityText = entityLabel || pageTitle || 'Record';
  const notAvailable = t('common.not_available');
  const sortFieldCandidates = useMemo(() => {
    return new Set([
      ...(config.listFields ?? []).map((field) => field.key),
      ...(config.fields ?? []).map((field) => field.name),
      config.searchField ?? ''
    ].filter(Boolean));
  }, [config.fields, config.listFields, config.searchField]);

  const moduleKey = config.endpoint.replace(/^\//, '');
  const roleCanView = !!role && config.permissions.view.includes(role as any);
  const roleCanCreate = !!role && config.permissions.create?.includes(role as any);
  const roleCanEdit = !!role && config.permissions.edit?.includes(role as any);
  const roleCanDelete = !!role && config.permissions.delete?.includes(role as any);
  const canView = strictPermissions ? userHasModuleAction(user, moduleKey, 'read') : roleCanView || userHasModuleAction(user, moduleKey, 'read');
  const canCreate = (strictPermissions ? userHasModuleAction(user, moduleKey, 'create') : roleCanCreate || userHasModuleAction(user, moduleKey, 'create')) && role !== 'student';
  const canEdit = (strictPermissions ? userHasModuleAction(user, moduleKey, 'update') : roleCanEdit || userHasModuleAction(user, moduleKey, 'update')) && role !== 'student';
  const canDelete = (strictPermissions ? userHasModuleAction(user, moduleKey, 'delete') : roleCanDelete || userHasModuleAction(user, moduleKey, 'delete')) && role !== 'student';

  const queryKey = [config.path, debouncedSearch];
  const visibleFields = config.fields.filter((field) => !(editingItem && field.hiddenOnEdit));

  const cleanPayload = (payload: Record<string, any>) => {
    return Object.entries(payload).reduce((acc, [key, value]) => {
      if (value === '' || value === null || value === undefined) return acc;
      if (Array.isArray(value)) {
        const filtered = value.filter((item) => item !== '' && item !== null && item !== undefined);
        if (filtered.length === 0) return acc;
        acc[key] = filtered;
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  };

  const buildRequestData = (payload: Record<string, any>) => {
    return { payload, requestConfig: undefined };
  };

  const formatErrorMessage = (error: any, fallback: string) => {
    const serverMessage = error?.response?.data?.message;
    if (typeof serverMessage === 'string') {
      if (/class code already exists/i.test(serverMessage)) {
        return t('errors.class_code_exists');
      }
      return serverMessage;
    }
    return error?.message || fallback;
  };

  const getSuccessMessage = (serverMessage: unknown, action: 'created' | 'updated' | 'deleted') => {
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }

    return `${entityText} ${action} successfully`;
  };

  const getItemDisplayName = (item: any) => {
    if (!item || typeof item !== 'object') {
      return entityText;
    }

    if (item.name) return String(item.name);
    if (item.title) return String(item.title);
    if (item.className) return String(item.className);
    if (item.firstName || item.lastName) return [item.firstName, item.lastName].filter(Boolean).join(' ').trim();
    if (item.email) return String(item.email);
    return entityText;
  };

  const extractId = (value: any) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return String(value._id ?? value.id ?? '');
    }
    return String(value);
  };

  const buildRegisterSearch = (item: any) => {
    const params = new URLSearchParams();
    const classId = config.path === '/classes' ? extractId(item?._id ?? item?.id) : extractId(item?.classId);
    const subjectId = extractId(item?.subjectId);
    const teacherId = extractId(item?.teacherId);
    const sourceTitle = config.path === '/classes'
      ? String(item?.className ?? item?.name ?? '')
      : String(item?.title ?? item?.className ?? item?.name ?? '');

    if (classId) params.set('classId', classId);
    if (subjectId) params.set('subjectId', subjectId);
    if (teacherId) params.set('teacherId', teacherId);
    if (sourceTitle) params.set('sourceTitle', sourceTitle);
    if (config.path === '/notifications') params.set('sourceType', 'announcement');
    if (config.path === '/classes') params.set('sourceType', 'class');

    return params.toString();
  };

  const navigateToRegister = (item: any) => {
    const searchString = buildRegisterSearch(item);
    navigate(searchString ? `/register?${searchString}` : '/register');
  };

  const fetchData = async () => {
    const response = await api.get(config.endpoint, { params: { search: debouncedSearch, limit: 100, lang: i18n.language } });
    return response.data.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: fetchData,
    enabled: canView,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 0
  });

  const createMutation = useMutation({
    mutationFn: async ({ payload, config: requestConfig }: { payload: any; config?: any }) => {
      return api.post(config.createEndpoint ?? config.endpoint, payload, requestConfig);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });
      setIsModalOpen(false);
      setFormData({});
      setFormError('');
      setFeedbackMessage({ type: 'success', text: getSuccessMessage(response.data?.message, 'created') });
    },
    onError: (error: any) => {
      setFormError(formatErrorMessage(error, t('errors.unable_load_records')));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload, config: requestConfig }: { id: string; payload: any; config?: any }) => {
      return api.put(`${config.endpoint}/${id}`, payload, requestConfig);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({});
      setFormError('');
      setFeedbackMessage({ type: 'success', text: getSuccessMessage(response.data?.message, 'updated') });
    },
    onError: (error: any) => {
      setFormError(formatErrorMessage(error, t('errors.unable_load_records')));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return api.delete(`${config.endpoint}/${id}`);
    },
    onMutate: async ({ id }: { id: string }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (current: any) => {
        if (!Array.isArray(current)) {
          return current;
        }

        return current.filter((item) => (item?._id ?? item?.id) !== id);
      });

      return { previousData };
    },
    onSuccess: (response) => {
      setFeedbackMessage({ type: 'success', text: getSuccessMessage(response.data?.message, 'deleted') });
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      setFeedbackMessage({ type: 'error', text: formatErrorMessage(error, t('errors.unable_load_records')) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const aiRecommendationMutation = useMutation({
    mutationFn: async (item: any) => {
      const id = item?._id ?? item?.id;
      return api.post(`${config.endpoint}/${id}/ai-recommendation`, { lang: i18n.language }).then((response) => response.data.data);
    },
    onSuccess: (payload) => {
      setAiRecommendation(payload);
      setFeedbackMessage({ type: 'success', text: t('common.ai_recommendation_ready', { defaultValue: 'AI recommendation is ready.' }) });
    },
    onError: (error: any) => {
      setFeedbackMessage({ type: 'error', text: formatErrorMessage(error, t('errors.unable_load_records')) });
    }
  });

  const fieldOptions = useSelectOptions(config.fields);

  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const visibleList = useMemo(() => list.filter((item) => matchesSearch(item, debouncedSearch)), [debouncedSearch, list]);
  const summaryData = useMemo(() => (!Array.isArray(data) && data ? data : {}), [data]);
  const sortOptions = useMemo(() => {
    const options: Array<{ value: ListSortField; label: string }> = [];
    if (hasSortSupport(sortFieldCandidates, 'name')) {
      options.push({ value: 'name', label: t('common.sort_name', { defaultValue: 'Sort by Name' }) });
    }
    if (hasSortSupport(sortFieldCandidates, 'date')) {
      options.push({ value: 'date', label: t('common.sort_date', { defaultValue: 'Sort by Date' }) });
    }
    if (hasSortSupport(sortFieldCandidates, 'role')) {
      options.push({ value: 'role', label: t('common.sort_role', { defaultValue: 'Sort by Role' }) });
    }
    return options;
  }, [sortFieldCandidates, t]);
  const sortedList = useMemo(() => {
    if (!sortOptions.length) {
      return visibleList;
    }

    return sortCollection(visibleList, sortField, sortDirection);
  }, [sortDirection, sortField, sortOptions.length, visibleList]);

  useEffect(() => {
    if (sortOptions.length === 0) {
      return;
    }

    if (!sortOptions.some((option) => option.value === sortField)) {
      setSortField(sortOptions[0].value);
    }
  }, [sortField, sortOptions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackMessage(null);

    const payload = cleanPayload(formData);

    const missingField = visibleFields.find((field) => {
      if (!field.required) return false;
      const value = payload[field.name];
      if (value === undefined || value === null || value === '') return true;
      if (Array.isArray(value) && value.length === 0) return true;
      return false;
    });

    if (missingField) {
      setFormError(`${translateField(missingField.label)} ${t('common.required')}`);
      return;
    }

    const { payload: requestPayload, requestConfig } = buildRequestData(payload);

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id || editingItem.id, payload: requestPayload, config: requestConfig });
    } else {
      createMutation.mutate({ payload: requestPayload, config: requestConfig });
    }
  };

  const prepareEditData = (item: any) => {
    const normalized = { ...item };
    ['classId', 'subjectId', 'teacherId', 'student', 'exam', 'gradedBy', 'subject', 'class', 'instructor'].forEach((key) => {
      const value = normalized[key];
      if (value && typeof value === 'object') {
        normalized[key] = value._id ?? value.id ?? '';
      }
    });

    ['assignedTeachers', 'assignedSubjects', 'assignedClasses', 'recipientRoles', 'recipientIds', 'subjects'].forEach((key) => {
      const value = normalized[key];
      if (Array.isArray(value)) {
        normalized[key] = value.map((item: any) => (item && typeof item === 'object' ? item._id ?? item.id ?? item.value ?? item.title ?? item.name ?? '' : item)).filter(Boolean);
      }
    });

    ['attendanceDate', 'publishDate', 'expiresAt', 'date', 'registrationExpiryDate', 'startDate', 'endDate'].forEach((key) => {
      const value = normalized[key];
      if (value) {
        const parsedValue = new Date(value);
        if (!Number.isNaN(parsedValue.getTime())) {
          normalized[key] = parsedValue.toISOString().slice(0, 10);
        }
      }
    });

    if (config.path === '/teachers') {
      normalized.salaryValue = normalized.salaryType === 'percentage'
        ? Number(normalized.percentageRate ?? normalized.customPercentage ?? 0)
        : Number(normalized.fixedSalary ?? 0);
    }

    if (config.path === '/notifications') {
      normalized.description = normalized.description ?? normalized.message ?? '';
      normalized.pinned = String(Boolean(normalized.pinned));
    }

    if (config.path === '/courses') {
      normalized.title = normalized.titleText ?? normalized.title?.[i18n.language] ?? normalized.title?.en ?? '';
      normalized.description = normalized.descriptionText ?? normalized.description?.[i18n.language] ?? normalized.description?.en ?? '';
      normalized.requirements = normalized.requirementsText ?? normalized.requirements?.[i18n.language] ?? normalized.requirements?.en ?? '';
      normalized.learningOutcomes = normalized.learningOutcomesText ?? normalized.learningOutcomes?.[i18n.language] ?? normalized.learningOutcomes?.en ?? '';
      normalized.featured = String(Boolean(normalized.featured));
    }

    return normalized;
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({});
    setFormError('');
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    const loadRecord = async () => {
      setIsPreparingEdit(true);
      setFormError('');
      setFeedbackMessage(null);

      try {
        const id = item?._id ?? item?.id;
        const response = id ? await api.get(`${config.endpoint}/${id}`) : null;
        const nextItem = response?.data?.data ?? item;
        setEditingItem(nextItem);
        setFormData(prepareEditData(nextItem));
        setIsModalOpen(true);
      } catch {
        setEditingItem(item);
        setFormData(prepareEditData(item));
        setIsModalOpen(true);
      } finally {
        setIsPreparingEdit(false);
      }
    };

    void loadRecord();
  };

  const handleDelete = (item: any) => {
    const id = item?._id ?? item?.id;
    if (!id || deleteMutation.isPending) {
      return;
    }

    const itemLabel = getItemDisplayName(item);
    const confirmed = window.confirm(
      t('common.delete_confirmation', {
        entity: itemLabel,
        defaultValue: `Are you sure you want to delete ${itemLabel}?`
      })
    );

    if (!confirmed) {
      return;
    }

    setFeedbackMessage(null);
    deleteMutation.mutate({ id: String(id) });
  };

  const translateField = (text: string | undefined) => (text ? t(text, { defaultValue: text }) : '');

  const getItemImage = (item: any) => {
    const candidates = [
      item?.profileImage,
      item?.profilePhoto,
      item?.avatar,
      item?.photo,
      item?.image,
      item?.imageUrl,
      item?.thumbnail,
      item?.profileUrl
    ];

    return candidates.find((value) => typeof value === 'string' && value.trim()) ?? '';
  };

  const getInitials = (item: any) => {
    const name = getItemDisplayName(item);
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    return initials || 'N';
  };

  const renderAvatar = (item: any, label?: string) => {
    const image = getItemImage(item);

    return (
      <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-sky-500/20 via-cyan-400/10 to-emerald-400/20 text-xl font-semibold text-white shadow-[0_18px_45px_rgba(14,165,233,0.16)]">
        {image ? (
          <img src={image} alt={label ?? getItemDisplayName(item)} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span>{getInitials(item)}</span>
        )}
      </div>
    );
  };

  const renderField = (field: ModuleField) => {
    const value = formData[field.name] ?? (field.multiple ? [] : '');
    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
          placeholder={translate(field.label)}
          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
            isDark
              ? 'border-slate-700 bg-slate-900/80 text-slate-100 focus:border-sky-400'
              : 'border-slate-300 bg-white text-slate-900 focus:border-sky-500'
          }`}
          rows={4}
        />
      );
    }


    if (field.type === 'subjectList') {
      const subjects = Array.isArray(value) ? value : [];
      const updateSubject = (index: number, nextValue: string) => {
        const nextSubjects = [...subjects];
        nextSubjects[index] = nextValue;
        setFormData({ ...formData, [field.name]: nextSubjects });
      };
      const addSubject = () => {
        setFormData({ ...formData, [field.name]: [...subjects, ''] });
      };
      const removeSubject = (index: number) => {
        const nextSubjects = subjects.filter((_: any, idx: number) => idx !== index);
        setFormData({ ...formData, [field.name]: nextSubjects });
      };
      return (
        <div className="space-y-3">
          {subjects.map((subject: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={subject}
                onChange={(event) => updateSubject(index, event.target.value)}
                placeholder={`${translate(field.label)} ${index + 1}`}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeSubject(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSubject}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
          >
            <Plus size={16} /> {t('classes.add_subject')}
          </button>
        </div>
      );
    }

    if (field.type === 'select') {
      const options = (field.options ?? fieldOptions[field.name] ?? []).map((option) => ({
        ...option,
        label: field.options ? translateField(option.label) : option.label
      }));
      const isMultiple = field.multiple === true;
      const placeholder = field.placeholder ?? t('common.select_field', { field: translateField(field.label) });
      return (
        <Select
          value={value}
          options={options}
          multiple={isMultiple}
          placeholder={placeholder}
          onChange={(nextValue) => setFormData({ ...formData, [field.name]: nextValue })}
        />
      );
    }

    return (
      <Input
        type={field.type}
        value={value}
        onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
        placeholder={field.placeholder ?? translate(field.label)}
        minLength={field.type === 'password' ? 4 : undefined}
        maxLength={field.type === 'password' ? 32 : undefined}
      />
    );
  };

  const columns = config.listFields.map((field) => ({
    key: field.key,
    label: translateField(field.label),
    width: field.width,
    render: (item: any) => {
      const rawValue = item[field.key];
      const value = rawValue === null || rawValue === undefined || rawValue === '' ? notAvailable : rawValue;

      if (field.key.toLowerCase().includes('url') && typeof rawValue === 'string' && rawValue.trim()) {
        return (
          <a href={rawValue} target="_blank" rel="noreferrer" className="font-semibold text-sky-300 underline-offset-4 hover:underline">
            {t('common.open_link', { defaultValue: 'Open link' })}
          </a>
        );
      }

      return Array.isArray(value) ? value.join(', ') : String(value);
    }
  }));

  const rowActions = [] as Array<{ label: string; onClick: (item: any) => void; variant?: 'outline' | 'destructive'; disabled?: boolean }>;

  if (canEdit && !config.disableEdit && config.fields.length > 0) {
    rowActions.push({ label: t('common.edit'), onClick: openEditModal, variant: 'outline', disabled: isPreparingEdit });
  }
  if (canDelete && !config.disableDelete) {
    rowActions.push({ label: t('common.delete'), onClick: handleDelete, variant: 'destructive', disabled: deleteMutation.isPending });
  }
  if (config.path === '/results') {
    rowActions.push({
      label: t('common.ai_recommendation', { defaultValue: 'AI Recommendation' }),
      onClick: (item) => aiRecommendationMutation.mutate(item),
      variant: 'outline',
      disabled: aiRecommendationMutation.isPending
    });
  }

  const renderCardActions = (item: any, extraActions?: ReactNode) => (
    <div className="mt-4 flex flex-wrap gap-2">
      {extraActions}
      {rowActions.map((action) => (
        <Button key={action.label} variant={action.variant ?? 'outline'} size="sm" onClick={() => action.onClick(item)} disabled={action.disabled}>
          {action.label}
        </Button>
      ))}
    </div>
  );

  const renderStudentCard = (student: any) => (
    <Card key={student._id || student.id} className={`overflow-hidden rounded-3xl border p-5 ${entityCardClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center">
          {renderAvatar(student, `${student.firstName ?? ''} ${student.lastName ?? ''}`)}
          <div>
            <h3 className={`text-lg font-semibold ${entityTitleClass}`}>{student.firstName} {student.lastName}</h3>
            <p className={`text-sm ${entityMutedTextClass}`}>{t('students.roll_no')}: {student.rollNo || notAvailable}</p>
          </div>
        </div>
        <div className={`space-y-3 text-sm text-slate-400 ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
          <p>{t('students.class')}: {student.className || notAvailable}</p>
          <p>{t('students.subject')}: {student.subjectName || notAvailable}</p>
          <p>{t('students.teacher')}: {student.teacherName || notAvailable}</p>
          <p>{t('students.guardian_phone')}: {student.familyPhone || notAvailable}</p>
        </div>
        {renderCardActions(student)}
      </div>
    </Card>
  );

  const renderClassCard = (klass: any) => (
    <Card key={klass._id || klass.id} className={`overflow-hidden rounded-3xl border p-5 ${entityCardClass}`}>
      <div className={`mb-4 rounded-3xl p-5 text-center ${entityPanelClass}`}>
        {renderAvatar(klass, klass.className || klass.name)}
        <p className={`text-sm uppercase tracking-[0.3em] ${entityMutedTextClass}`}>{t('common.class')}</p>
        <p className="mt-3 text-2xl font-semibold">{klass.className || klass.name || notAvailable}</p>
      </div>
      <div className={`space-y-3 text-sm ${entityBodyTextClass}`}>
        <p>{t('students.students_count')}: {klass.studentCount ?? 0}</p>
        <p>{t('students.subjects_count')}: {klass.assignedSubjectCount ?? 0}</p>
        <p>{t('students.teachers_count')}: {klass.assignedTeacherCount ?? 0}</p>
      </div>
      {renderCardActions(
        klass,
        <Button size="sm" onClick={() => navigateToRegister(klass)}>
          {t('common.register', { defaultValue: 'Register' })}
        </Button>
      )}
    </Card>
  );

  const renderSubjectCard = (subject: any) => (
    <Card key={subject._id || subject.id} className={`overflow-hidden rounded-3xl border p-5 ${entityCardClass}`}>
      <div className={`mb-4 rounded-3xl p-5 text-center ${entityPanelClass}`}>
        {renderAvatar(subject, subject.title)}
        <p className={`text-sm uppercase tracking-[0.3em] ${entityMutedTextClass}`}>{t('common.subject')}</p>
        <p className="mt-3 text-2xl font-semibold">{subject.title || notAvailable}</p>
      </div>
      <div className={`space-y-3 text-sm ${entityBodyTextClass}`}>
        <p>{t('common.class')}: {subject.className || notAvailable}</p>
        <p>{t('subjects.teacher')}: {subject.teacherName || notAvailable}</p>
        <p>{t('subjects.code')}: {subject.code || notAvailable}</p>
      </div>
      {renderCardActions(subject)}
    </Card>
  );

  const renderTeacherCard = (teacher: any) => {
    const subjectText = teacher.displaySubject || teacher.assignedSubjectNames || t('students.not_assigned');
    return (
      <Card key={teacher._id || teacher.id} className={`overflow-hidden rounded-3xl border p-5 ${entityCardClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            {renderAvatar(teacher, teacher.name)}
            <div>
              <h3 className={`text-lg font-semibold ${entityTitleClass}`}>{teacher.name || [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || notAvailable}</h3>
              <p className={`text-sm ${entityMutedTextClass}`}>{t('common.subject')}: {subjectText}</p>
            </div>
          </div>
          <div className={`space-y-3 text-sm ${entityMutedTextClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
            <p>{t('students.phone')}: {teacher.phone || notAvailable}</p>
            <p>{t('students.email')}: {teacher.email || notAvailable}</p>
          </div>
          {renderCardActions(teacher)}
        </div>
      </Card>
    );
  };

  const renderUserCard = (account: any) => (
    <Card key={account._id || account.id} className={`overflow-hidden rounded-3xl border p-5 ${entityCardClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center">
          {renderAvatar(account, account.name)}
          <div>
            <h3 className={`text-lg font-semibold ${entityTitleClass}`}>{account.name || notAvailable}</h3>
            <p className={`text-sm ${entityMutedTextClass}`}>{account.role ? t(`common.${account.role}`, { defaultValue: account.role }) : notAvailable}</p>
          </div>
        </div>
        <div className={`space-y-3 text-sm ${entityMutedTextClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
          <p>{t('common.email')}: {account.email || notAvailable}</p>
          <p>{t('common.phone')}: {account.phone || notAvailable}</p>
          <p>{t('common.status')}: {account.active ? t('common.active') : 'Inactive'}</p>
        </div>
        {renderCardActions(account)}
      </div>
    </Card>
  );

  const renderNotificationCard = (notification: any) => (
      <Card key={notification._id || notification.id} className={`overflow-hidden rounded-3xl border ${entityCardClass}`}>
        <div className="space-y-4 p-5">
          {renderAvatar(notification, notification.title)}
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
            {notification.publishDate ? new Date(notification.publishDate).toLocaleDateString() : notAvailable}
          </p>
          <h3 className={`text-2xl font-semibold ${entityTitleClass}`}>{notification.title || notAvailable}</h3>
          <p className={`text-sm leading-7 ${entityMutedTextClass}`}>{notification.description || notification.message || notAvailable}</p>
          {(notification.className || notification.subjectName || notification.teacherName) && (
            <div className={`space-y-2 text-sm ${entityBodyTextClass}`}>
              <p>{t('students.class')}: {notification.className || notAvailable}</p>
              <p>{t('students.subject')}: {notification.subjectName || notAvailable}</p>
              <p>{t('students.teacher')}: {notification.teacherName || notAvailable}</p>
            </div>
          )}
          {renderCardActions(
            notification,
            <Button size="sm" onClick={() => navigateToRegister(notification)}>
              {t('common.register', { defaultValue: 'Register' })}
            </Button>
          )}
        </div>
      </Card>
  );

  const renderGenericCard = (item: any) => (
    <Card key={item._id || item.id || getItemDisplayName(item)} className={`overflow-hidden rounded-3xl border p-5 ${entityCardClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
      <div className="space-y-5">
        <div className="text-center">
          {renderAvatar(item)}
          <h3 className={`mt-4 text-lg font-semibold ${entityTitleClass}`}>{getItemDisplayName(item)}</h3>
          <p className={`text-sm ${entityMutedTextClass}`}>{entityText}</p>
        </div>
        <div className={`space-y-3 text-sm ${entityMutedTextClass} ${i18n.language === 'en' ? 'text-left' : 'text-right'}`}>
          {config.listFields.slice(0, 5).map((field) => {
            const rawValue = item[field.key];
            const value = rawValue === null || rawValue === undefined || rawValue === '' ? notAvailable : rawValue;
            return (
              <p key={field.key}>
                <span className={entityBodyTextClass}>{translateField(field.label)}:</span>{' '}
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </p>
            );
          })}
        </div>
        {renderCardActions(item)}
      </div>
    </Card>
  );

  const renderEntityCards = () => {
    const renderers: Record<string, (item: any) => JSX.Element> = {
      '/students': renderStudentCard,
      '/classes': renderClassCard,
      '/subjects': renderSubjectCard,
      '/teachers': renderTeacherCard,
      '/users': renderUserCard,
      '/notifications': renderNotificationCard
    };

    const renderCard = renderers[config.path] ?? renderGenericCard;

    return (
        <div className="w-full overflow-x-hidden">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedList.map((item: any) => renderCard(item))}
        </div>
      </div>
    );
  };

  const sortControls = sortOptions.length ? (
    <>
      <div className="w-full sm:w-56">
        <Select
          value={sortField}
          options={sortOptions}
          placeholder={t('common.sort', { defaultValue: 'Sort' })}
          onChange={(value) => setSortField(String(value) as ListSortField)}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
      >
        <ArrowUpDown className="h-4 w-4" />
        {t(sortDirection === 'asc' ? 'common.ascending' : 'common.descending', {
          defaultValue: sortDirection === 'asc' ? 'ASC' : 'DESC'
        })}
      </Button>
    </>
  ) : null;
  const viewControls = (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
      <button
        type="button"
        onClick={() => setViewMode('card')}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${viewMode === 'card' ? 'bg-sky-500/20 text-sky-100' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
      >
        <LayoutGrid className="h-4 w-4" />
        Card
      </button>
      <button
        type="button"
        onClick={() => setViewMode('table')}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${viewMode === 'table' ? 'bg-sky-500/20 text-sky-100' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
      >
        <Table2 className="h-4 w-4" />
        Table
      </button>
    </div>
  );
  const listControls = (
    <>
      {sortControls}
      {viewControls}
    </>
  );

  if (!canView) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle size={40} className="mx-auto mb-4 text-rose-400" />
        <p className="text-xl font-semibold text-slate-100">{t('common.access_denied')}</p>
        <p className="mt-2 text-slate-400">{t('errors.permission_view', { entity: pageTitle })}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={pageDescription}
        actions={config.type === 'summary' ? undefined : (
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder={t('common.search_placeholder', { entity: pageTitle })}
            createLabel={t('common.add_entity', { entity: entityLabel })}
            onCreate={canCreate ? openCreateModal : undefined}
            createVisible={canCreate && config.fields.length > 0}
            extraActions={listControls}
          />
        )}
      />

      {feedbackMessage && (
        <Card className={feedbackMessage.type === 'success' ? 'border border-emerald-500/40 bg-emerald-500/5 text-emerald-200' : 'border border-rose-500/40 bg-rose-500/5 text-rose-200'}>
          <p>{feedbackMessage.text}</p>
        </Card>
      )}

      {isError && (
        <Card className="border border-rose-500/40 bg-rose-500/5 text-rose-200">
          <p>{(error as any)?.message ?? t('errors.unable_load_records')}</p>
        </Card>
      )}

      {config.type === 'summary' ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {config.summaryCards?.map((card) => (
            <Card key={card.key} className="p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t(card.label, { defaultValue: card.label })}</p>
              <p className="mt-4 text-4xl font-semibold text-slate-100">{card.prefix ?? ''}{summaryData[card.key] ?? 0}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
          ) : sortedList.length ? (
            viewMode === 'card' ? (
              renderEntityCards()
            ) : (
              <DataTable columns={columns} items={sortedList} actions={rowActions} />
            )
          ) : (
            <div className="py-12 text-center text-slate-400">{t('common.no_records_found')}</div>
          )}
        </Card>
      )}

      {aiRecommendation && (
        <Card className="border border-sky-400/30 bg-sky-500/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-300">{t('common.ai_recommendation')}</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-strong)]">
                {aiRecommendation.recommendation?.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text)]">
                {aiRecommendation.recommendation?.message}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAiRecommendation(null)}>
              {t('common.close')}
            </Button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-strong)]">{t('common.resources')}</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-text)]">
                {(aiRecommendation.recommendation?.resources ?? []).map((resource: string) => (
                  <li key={resource} className="rounded-2xl bg-[var(--color-surface-strong)] px-4 py-3">{resource}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-strong)]">{t('common.study_plan', { defaultValue: 'Study Plan' })}</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-text)]">
                {(aiRecommendation.recommendation?.studyPlan ?? []).map((step: string) => (
                  <li key={step} className="rounded-2xl bg-[var(--color-surface-strong)] px-4 py-3">{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {isModalOpen && (
        <FormModal
          open={isModalOpen}
          title={editingItem ? t('common.edit_entity', { entity: entityLabel }) : t('common.add_entity', { entity: entityLabel })}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          submitLabel={editingItem ? t('common.update') : t('common.create')}
          loading={createMutation.status === 'pending' || updateMutation.status === 'pending'}
        >
          {formError && (
            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
              {formError}
            </div>
          )}
          {visibleFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-slate-300 mb-1">{translateField(field.label)}</label>
                {renderField(field)}
              </div>
            ))}
        </FormModal>
      )}
    </div>
  );
};
