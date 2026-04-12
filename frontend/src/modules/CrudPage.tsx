import { useMemo, useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import type { ModuleConfig, ModuleField } from '../config/modules';
import { useAuthStore } from '../store/authStore';
import { PageHeader, SearchFilterBar, DataTable, FormModal } from '../components/shared/Common';

interface CrudPageProps {
  config: ModuleConfig;
}

export const CrudPage = ({ config }: CrudPageProps) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const debouncedSearch = useDebounce(search, 300);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const translate = (text: string | undefined) => (text ? t(text.toLowerCase().replace(/\s+/g, '_')) : '');
  const pageTitle = translate(config.title);
  const pageDescription = config.description ? t(config.description, { defaultValue: config.description }) : undefined;
  const entityLabel = translate(config.entity);

  const canView = !!role && config.permissions.view.includes(role as any);
  const canCreate = !!role && config.permissions.create?.includes(role as any) && role !== 'student';
  const canEdit = !!role && config.permissions.edit?.includes(role as any) && role !== 'student';
  const canDelete = !!role && config.permissions.delete?.includes(role as any) && role !== 'student';

  const queryKey = [config.path, debouncedSearch];

  const cleanPayload = (payload: Record<string, any>) => {
    return Object.entries(payload).reduce((acc, [key, value]) => {
      if (value === '' || value === null || value === undefined) return acc;
      if (Array.isArray(value) && value.length === 0) return acc;
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  };

  const formatErrorMessage = (error: any, fallback: string) => {
    const serverMessage = error?.response?.data?.message;
    if (typeof serverMessage === 'string') {
      if (/class code already exists/i.test(serverMessage)) {
        return 'Class code already exists. Please try again.';
      }
      return serverMessage;
    }
    return error?.message || fallback;
  };

  const fetchData = async () => {
    const response = await api.get(config.endpoint, { params: { search: debouncedSearch, limit: 100 } });
    return response.data.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: fetchData,
    enabled: canView
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post(config.createEndpoint ?? config.endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsModalOpen(false);
      setFormData({});
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(formatErrorMessage(error, 'Create failed'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      await api.patch(`${config.endpoint}/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({});
      setFormError('');
    },
    onError: (error: any) => {
      setFormError(formatErrorMessage(error, 'Update failed'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${config.endpoint}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const [fieldOptions, setFieldOptions] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const dynamicFields = config.fields.filter((field) => field.type === 'select' && field.optionsEndpoint);
    if (!dynamicFields.length) return;

    const loadOptions = async () => {
      const allOptions: Record<string, Array<{ value: string; label: string }>> = {};
      await Promise.all(dynamicFields.map(async (field) => {
        try {
          const response = await api.get(field.optionsEndpoint!, { params: { limit: 100 } });
          const items = response.data?.data ?? [];
          const options = Array.isArray(items)
            ? items.map((item: any) => {
                const value = String(field.optionValueKey ? item[field.optionValueKey] : item.id ?? item._id ?? '');
                const labelKey = field.optionLabelKey ?? 'name';
                const label = String(labelKey.split('.').reduce((acc: any, pathPart) => acc?.[pathPart], item) ?? value);
                return { value, label };
              })
            : [];
          allOptions[field.name] = options;
        } catch {
          allOptions[field.name] = [];
        }
      }));
      setFieldOptions(allOptions);
    };

    loadOptions();
  }, [config.fields]);

  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const summaryData = useMemo(() => (!Array.isArray(data) && data ? data : {}), [data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = cleanPayload(formData);
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id || editingItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({});
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setFormError('');
    setIsModalOpen(true);
  };

  const translateField = (text: string | undefined) => (text ? t(text.toLowerCase().replace(/\s+/g, '_')) : '');

  const renderField = (field: ModuleField) => {
    const value = formData[field.name] ?? (field.multiple ? [] : '');
    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
          placeholder={translate(field.label)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
          rows={4}
        />
      );
    }

    if (field.type === 'select') {
      const options = field.options ?? fieldOptions[field.name] ?? [];
      const isMultiple = field.multiple === true;
      return (
        <select
          value={value}
          multiple={isMultiple}
          onChange={(event) => {
            if (isMultiple) {
              const values = Array.from(event.target.selectedOptions).map((option) => option.value);
              setFormData({ ...formData, [field.name]: values });
            } else {
              setFormData({ ...formData, [field.name]: event.target.value });
            }
          }}
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
        >
          {!isMultiple && <option value="">{t('select_field', { field: translateField(field.label) })}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {field.options ? translateField(option.label) : option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <Input
        type={field.type}
        value={value}
        onChange={(event) => setFormData({ ...formData, [field.name]: event.target.value })}
        placeholder={translate(field.label)}
      />
    );
  };

  const columns = config.listFields.map((field) => ({
    key: field.key,
    label: translateField(field.label),
    width: field.width,
    render: (item: any) => String(item[field.key] ?? '—')
  }));

  const rowActions = [] as Array<{ label: string; onClick: (item: any) => void; variant?: 'outline' | 'destructive' }>;

  if (canEdit && !config.disableEdit && config.fields.length > 0) {
    rowActions.push({ label: t('edit'), onClick: openEditModal, variant: 'outline' });
  }
  if (canDelete && !config.disableDelete) {
    rowActions.push({ label: t('delete'), onClick: (item) => deleteMutation.mutate(item._id || item.id), variant: 'destructive' });
  }

  if (!canView) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle size={40} className="mx-auto mb-4 text-rose-400" />
        <p className="text-xl font-semibold text-slate-100">{t('access_denied')}</p>
        <p className="mt-2 text-slate-400">{t('permission_view', { entity: pageTitle })}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder={t('search_placeholder', { entity: pageTitle })}
            createLabel={t('add_entity', { entity: entityLabel })}
            onCreate={canCreate ? openCreateModal : undefined}
            createVisible={canCreate && config.fields.length > 0}
          />
        }
      />

      {isError && (
        <Card className="border border-rose-500/40 bg-rose-500/5 text-rose-200">
          <p>{(error as any)?.message ?? t('unable_load_records')}</p>
        </Card>
      )}

      {config.type === 'summary' ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {config.summaryCards?.map((card) => (
            <Card key={card.key} className="p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
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
          ) : list.length ? (
            <DataTable columns={columns} items={list} actions={rowActions} />
          ) : (
            <div className="py-12 text-center text-slate-400">{t('no_records_found')}</div>
          )}
        </Card>
      )}

      {isModalOpen && (
        <FormModal
          open={isModalOpen}
          title={editingItem ? t('edit_entity', { entity: entityLabel }) : t('add_entity', { entity: entityLabel })}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          submitLabel={editingItem ? t('update') : t('create')}
          loading={createMutation.status === 'pending' || updateMutation.status === 'pending'}
        >
          {formError && (
            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
              {formError}
            </div>
          )}
          {config.fields
            .filter((field) => !(editingItem && field.hiddenOnEdit))
            .map((field) => (
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
