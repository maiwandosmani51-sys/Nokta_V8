import { Card } from '../../components/ui/Card';
import { Settings, ShieldCheck, Bell, SlidersHorizontal } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Profile</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">Update now</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
              <Settings className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Notifications</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">Enabled</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Security</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">High</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Preferences</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">Custom</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 text-white">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </section>

      <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-wider text-text-secondary">System settings</p>
            <h2 className="mt-3 text-2xl font-semibold text-text">Global controls</h2>
            <p className="mt-4 text-sm text-text-secondary">Update global preferences, notification rules, and administrative settings from one clean panel.</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Email alerts', value: 'Enabled' },
              { label: 'Two-factor auth', value: 'Required' },
              { label: 'Auto backups', value: 'Daily' }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-border bg-background px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-text">{item.label}</p>
                  <span className="text-sm text-text-secondary">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
