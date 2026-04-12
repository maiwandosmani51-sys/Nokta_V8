import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Role } from '../../config/modules';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sky-400 uppercase tracking-[0.3em] text-xs">{title}</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        {description && <p className="mt-3 text-slate-400 max-w-2xl">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">{actions}</div>
    </div>
  );
}

export function SearchFilterBar({ value, onChange, placeholder, createLabel, onCreate, createVisible }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  createLabel?: string;
  onCreate?: () => void;
  createVisible?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {createVisible && onCreate && (
        <Button onClick={onCreate} className="w-full sm:w-auto">
          {createLabel ?? t('add')}
        </Button>
      )}
    </div>
  );
}

export interface TableColumn<T> {
  key: string;
  label: string;
  width?: string;
  render?: (item: T) => ReactNode;
}

export interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'solid' | 'outline' | 'destructive';
  disabled?: boolean;
}

export function DataTable<T>({
  columns,
  items,
  actions
}: {
  columns: TableColumn<T>[];
  items: T[];
  actions?: TableAction<T>[];
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-slate-900/70">
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`border-b border-slate-800/80 px-4 py-3 text-sm uppercase tracking-[0.2em] text-slate-400 ${column.width ?? 'w-auto'}`}>
                {column.label}
              </th>
            ))}
            {actions && <th className="border-b border-slate-800/80 px-4 py-3 text-sm uppercase tracking-[0.2em] text-slate-400">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={(item as any)._id ?? (item as any).id ?? index} className="odd:bg-slate-950 even:bg-slate-900/80 last:border-b-0">
              {columns.map((column) => (
                <td key={column.key} className="border-b border-slate-800/80 px-4 py-3 align-top text-sm text-slate-200">
                  {column.render ? column.render(item) : String((item as any)[column.key] ?? '—')}
                </td>
              ))}
              {actions && (
                <td className="border-b border-slate-800/80 px-4 py-3 align-top text-sm text-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <Button key={action.label} variant={action.variant ?? 'outline'} size="sm" onClick={() => action.onClick(item)} disabled={action.disabled}>
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormModal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel,
  loading
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  loading?: boolean;
}) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <form id="modal-form" onSubmit={onSubmit} className="space-y-4">
            {children}
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="modal-form" disabled={loading}>
            {submitLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function PermissionWrapper({
  allowedRoles,
  children,
  fallback = null
}: {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  if (!allowedRoles.includes(user.role as Role)) return <>{fallback}</>;
  return <>{children}</>;
}
