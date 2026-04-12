import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, UserPlus, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { PageHeader, SearchFilterBar, DataTable, FormModal } from '../../components/shared/Common';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { userService } from '../../services/user';
import { useAuthStore } from '../../store/authStore';

interface PermissionModule {
  key: string;
  label: string;
  actions: string[];
}

interface PermissionTemplateResponse {
  modules: PermissionModule[];
  roleTemplates: Record<string, Record<string, string[]>>;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions?: Record<string, string[]>;
}

interface ApiResponse<T> {
  data: T;
}

const roles = ['super_admin', 'admin', 'teacher', 'student', 'family_student', 'accountant', 'librarian'] as const;

export function ManageUsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'teacher' });
  const [permissionState, setPermissionState] = useState<Record<string, string[]>>({});
  const [copySourceId, setCopySourceId] = useState('');
  const user = useAuthStore((state) => state.user);

  const templateQuery = useQuery<ApiResponse<PermissionTemplateResponse>>({
    queryKey: ['permissionsTemplate'],
    queryFn: userService.getPermissionTemplate
  });

  const usersQuery = useQuery<ApiResponse<UserRecord[]>>({
    queryKey: ['users', page, search],
    queryFn: () => userService.list({ page, limit: 20, search })
  });

  const createUserMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'teacher' });
    }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: Record<string, string[]> }) =>
      userService.updatePermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsPermissionsOpen(false);
      setSelectedUser(null);
    }
  });

  const users = usersQuery.data?.data ?? [];
  const template = templateQuery.data?.data;

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'active', label: 'Active', render: (item: UserRecord) => (item.active ? 'Yes' : 'No') }
    ],
    []
  );

  const handleOpenPermissions = (userRecord: UserRecord) => {
    setSelectedUser(userRecord);
    setPermissionState(userRecord.permissions ?? {});
    setCopySourceId('');
    setIsPermissionsOpen(true);
  };

  const handlePermissionToggle = (moduleKey: string, action: string) => {
    setPermissionState((current) => {
      const existing = current[moduleKey] ?? [];
      const next = existing.includes(action)
        ? existing.filter((value) => value !== action)
        : [...existing, action];
      return { ...current, [moduleKey]: next };
    });
  };

  const handleModuleToggle = (moduleKey: string, actions: string[]) => {
    setPermissionState((current) => {
      const existing = current[moduleKey] ?? [];
      const allSelected = actions.every((action) => existing.includes(action));
      return { ...current, [moduleKey]: allSelected ? [] : actions };
    });
  };

  const handleFullAccessToggle = () => {
    if (!template) return;
    const allSelected = template.modules.every((module) => {
      const assigned = permissionState[module.key] ?? [];
      return assigned.length === module.actions.length;
    });
    if (allSelected) {
      setPermissionState({});
      return;
    }
    const allPermissions = template.modules.reduce((acc, module) => {
      acc[module.key] = [...module.actions];
      return acc;
    }, {} as Record<string, string[]>);
    setPermissionState(allPermissions);
  };

  const handleCopyFromUser = (sourceId: string) => {
    setCopySourceId(sourceId);
    const sourceUser = users.find((item) => item._id === sourceId);
    if (sourceUser) {
      setPermissionState(sourceUser.permissions ?? {});
    }
  };

  const handleApplyRoleTemplate = (role: string) => {
    if (!template) return;
    const roleTemplate = template.roleTemplates[role] ?? {};
    const next = template.modules.reduce((acc, module) => {
      acc[module.key] = roleTemplate[module.key] ?? [];
      return acc;
    }, {} as Record<string, string[]>);
    setPermissionState(next);
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createUserMutation.mutateAsync(newUser);
  };

  const handlePermissionsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;
    await updatePermissionsMutation.mutateAsync({ id: selectedUser._id, permissions: permissionState });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users & Permissions"
        description="Create users, assign roles, and control access to modules and actions. This area is strictly super_admin only."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create User
          </Button>
        }
      />

      <Card className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder="Search users by name or email"
            createVisible={false}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Signed in as</span>
            <span className="rounded-full bg-slate-800 px-3 py-2 text-sm text-white">{user?.role}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          items={users}
          actions={[
            {
              label: 'Permissions',
              onClick: handleOpenPermissions,
              variant: 'solid'
            }
          ]}
        />
      </Card>

      <FormModal
        open={isCreateOpen}
        title="Create New User"
        submitLabel="Create"
        loading={createUserMutation.status === 'pending'}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      >
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200">Full name</label>
            <Input
              value={newUser.name}
              onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200">Email</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              placeholder="jane@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200">Password</label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
              placeholder="Enter a secure password"
              required
            />
          </div>
          <label className="block text-sm font-semibold text-slate-200">Role</label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-400"
            value={newUser.role}
            onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
          >
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption} className="bg-slate-950 text-slate-100">
                {roleOption}
              </option>
            ))}
          </select>
        </div>
      </FormModal>

      <FormModal
        open={isPermissionsOpen}
        title={`Edit Permissions for ${selectedUser?.name ?? 'User'}`}
        submitLabel="Save Permissions"
        loading={updatePermissionsMutation.status === 'pending'}
        onClose={() => setIsPermissionsOpen(false)}
        onSubmit={handlePermissionsSubmit}
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Button type="button" variant="outline" onClick={handleFullAccessToggle}>
              <CheckCircle2 className="h-4 w-4" /> Toggle Full Access
            </Button>
            <div className="sm:col-span-2 grid gap-2">
              <label className="text-sm font-semibold text-slate-200">Copy from another user</label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-400"
                value={copySourceId}
                onChange={(event) => handleCopyFromUser(event.target.value)}
              >
                <option value="">Select a user to copy</option>
                {users
                  .filter((option) => option._id !== selectedUser?._id)
                  .map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name} ({option.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-200">Role template</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-400"
                value={selectedUser?.role ?? ''}
                onChange={(event) => handleApplyRoleTemplate(event.target.value)}
              >
                <option value="">Choose role template</option>
                {Object.keys(template?.roleTemplates ?? {}).map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {template?.modules.map((module) => {
            const current = permissionState[module.key] ?? [];
            const allSelected = module.actions.every((action) => current.includes(action));
            return (
              <Card key={module.key} className="rounded-3xl border border-slate-800/80 bg-slate-950 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{module.label}</h3>
                    <p className="text-sm text-slate-400">Select allowed actions for this module.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => handleModuleToggle(module.key, module.actions)}>
                    {allSelected ? 'Clear module' : 'Select all'}
                  </Button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  {module.actions.map((action) => (
                    <label key={action} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={current.includes(action)}
                        onChange={() => handlePermissionToggle(module.key, action)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-400 focus:ring-sky-400"
                      />
                      {action}
                    </label>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </FormModal>
    </div>
  );
}
