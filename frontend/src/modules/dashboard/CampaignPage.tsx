import { Card } from '../../components/ui/Card';
import { Megaphone, Activity, Users, PieChart } from 'lucide-react';

export function CampaignPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Campaigns</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">18</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Active Leads</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">5,840</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Engagement</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">73%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">ROI</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">+28%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 text-white">
              <PieChart className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Campaign performance</p>
              <h2 className="text-2xl font-semibold text-text">Weekly overview</h2>
            </div>
            <Megaphone className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="h-72 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <div className="h-full rounded-3xl bg-white/80" />
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Audience mix</p>
              <h2 className="text-2xl font-semibold text-text">Channel share</h2>
            </div>
            <Users className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="space-y-3">
            {['Email', 'Social', 'Ads'].map((label, index) => (
              <div key={label} className="flex items-center justify-between rounded-3xl border border-border bg-background px-4 py-4">
                <span className="font-medium text-text">{label}</span>
                <span className="text-sm text-text-secondary">{[28, 44, 28][index]}%</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
