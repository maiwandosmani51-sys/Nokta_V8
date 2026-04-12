import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

interface ResourcePageProps {
  title: string;
  endpoint: string;
}

export function ResourcePage({ title, endpoint }: ResourcePageProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [endpoint, debouncedSearch],
    queryFn: async () => {
      const response = await api.get(endpoint, { params: { search: debouncedSearch, limit: 12 } });
      return response.data.data as any[];
    }
  });

  const list = useMemo(() => query.data ?? [], [query.data]);

  const { t } = useTranslation();
  const translate = (text: string) => t(text.toLowerCase().replace(/\s+/g, '_'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-slate-400 uppercase tracking-[0.3em] text-xs">{t('module')}</p>
          <h2 className="text-3xl font-semibold">{translate(title)}</h2>
        </div>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('search_by_name')} />
      </div>
      <Card className="space-y-4">
        {query.isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : list.length ? (
          <div className="grid gap-4">
            {list.map((item) => (
              <div key={item._id || item.id} className="rounded-3xl border border-slate-700/60 p-4 hover:border-slate-500">
                <p className="font-semibold text-slate-100">{item.name || item.title || item.guardianName || item.email}</p>
                <p className="text-sm text-slate-400">{item.role || item.category || item.email || item.description || item.date || item.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">No records found.</div>
        )}
      </Card>
    </div>
  );
}
