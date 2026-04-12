import { Card } from '../../components/ui/Card';
import { BarChart3, ShoppingCart, DollarSign, Package, Tag } from 'lucide-react';

export function EcommercePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Revenue</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">$58.7k</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Orders</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">2,371</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Products</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">531</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Discounts</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">12%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-red-400 text-white">
              <Tag className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Top selling</p>
              <h2 className="text-2xl font-semibold text-text">Product performance</h2>
            </div>
            <ShoppingCart className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="space-y-4">
            {['Smart Watch', 'Wireless Headphones', 'Running Shoes'].map((product) => (
              <div key={product} className="flex items-center justify-between rounded-3xl border border-border bg-background px-4 py-4">
                <span className="font-medium text-text">{product}</span>
                <span className="text-sm text-text-secondary">+{Math.floor(Math.random() * 12) + 5}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-sm hover:shadow-hover transition-shadow duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-text-secondary">Sales funnel</p>
              <h2 className="text-2xl font-semibold text-text">Marketing funnel</h2>
            </div>
            <BarChart3 className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="h-72 rounded-3xl bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
            <div className="h-full rounded-3xl bg-white/80" />
          </div>
        </Card>
      </section>
    </div>
  );
}
