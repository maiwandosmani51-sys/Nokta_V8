import { Card } from '../../components/ui/Card';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Traffic Growth</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">24.7%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Conversion Rate</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">7.2%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
              <PieChart className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Sessions</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">13.4k</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Revenue chart</p>
              <h2 className="text-2xl font-semibold text-text">Revenue performance</h2>
            </div>
            <BarChart3 className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="h-72 rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
            <div className="h-full rounded-3xl bg-white/80" />
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Campaign breakdown</p>
              <h2 className="text-2xl font-semibold text-text">Channel performance</h2>
            </div>
            <PieChart className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-72 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-4"></div>
            <div className="space-y-3">
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm text-text-secondary">Email marketing</p>
                <p className="mt-2 text-xl font-semibold text-text">28%</p>
              </div>
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm text-text-secondary">Social media</p>
                <p className="mt-2 text-xl font-semibold text-text">44%</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
