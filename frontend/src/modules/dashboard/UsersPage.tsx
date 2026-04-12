import { Card } from '../../components/ui/Card';
import { BarChart3, Users, UserPlus, ShieldCheck } from 'lucide-react';

export function UsersPage() {
  const users = [
    { name: 'Sara Allen', role: 'Admin', status: 'Active' },
    { name: 'David Carter', role: 'User', status: 'Pending' },
    { name: 'Nadine Fox', role: 'User', status: 'Active' },
    { name: 'Michael Ross', role: 'Admin', status: 'Inactive' }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Total Users</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">1,248</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">New Accounts</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">98</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Security Score</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">92%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </section>

      <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-text-secondary">Active user summary</p>
            <h2 className="text-2xl font-semibold text-text">User roles & status</h2>
          </div>
          <button className="rounded-2xl border border-border px-4 py-2 text-sm text-text-secondary hover:border-blue-300 hover:text-text transition-all duration-300">
            Export
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="grid grid-cols-1 gap-2 bg-background px-4 py-3 text-xs uppercase tracking-[0.3em] text-text-secondary sm:grid-cols-4">
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-border bg-white">
            {users.map((user) => (
              <div key={user.name} className="grid grid-cols-1 gap-2 px-4 py-4 text-sm text-text sm:grid-cols-4 sm:items-center">
                <span className="font-medium">{user.name}</span>
                <span>{user.role}</span>
                <span>{user.status}</span>
                <div className="flex justify-end">
                  <button className="rounded-full border border-border px-3 py-2 text-xs text-text-secondary transition hover:border-blue-300 hover:text-text">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
