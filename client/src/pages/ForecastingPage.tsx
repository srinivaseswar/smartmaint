import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { PageHeader } from '@/components/ui/Toolbar';
import { KPICard } from '@/components/ui/KPICard';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { ForecastData } from '@/types';

export function ForecastingPage() {
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [selected, setSelected] = useState<ForecastData | null>(null);

  useEffect(() => { api.getForecastData().then(setForecasts); }, []);

  if (forecasts.length === 0) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" /></div>;
  }

  const fastMoving = forecasts.filter((f) => f.movement_class === 'fast').length;
  const highRisk = forecasts.filter((f) => f.stock_out_risk > 50).length;
  const excessItems = forecasts.filter((f) => f.excess_inventory).length;
  const totalReorder = forecasts.reduce((s, f) => s + f.recommended_reorder_qty, 0);

  const selectedChart = selected ? {
    labels: [...Array(12).keys()].map((i) => `M${i + 1}`),
    historical: selected.historical_consumption,
    forecast: [...selected.historical_consumption.slice(-3), ...selected.forecasted_consumption],
  } : null;

  const chartData = selectedChart
    ? selectedChart.labels.map((label, i) => ({
        month: label,
        historical: selectedChart.historical[i] || 0,
        forecast: i >= 9 ? selectedChart.forecast[i - 9] || 0 : null,
      }))
    : [];

  return (
    <div>
      <PageHeader title="Intelligent Spare-Part Forecasting" subtitle="Demand prediction, reorder recommendations, and stock-out risk analysis" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Fast-Moving Parts" value={fastMoving} icon={<TrendingUp className="h-5 w-5" />} tone="primary" />
        <KPICard label="High Stock-Out Risk" value={highRisk} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <KPICard label="Excess Inventory" value={excessItems} icon={<Package className="h-5 w-5" />} tone="warning" />
        <KPICard label="Reorder Recommendations" value={totalReorder} icon={<ShoppingCart className="h-5 w-5" />} tone="info" subtitle="units to order" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Forecast list */}
        <div className="lg:col-span-1 card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Parts Forecast</h3>
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {forecasts.map((f) => (
              <button
                key={f.part_id}
                onClick={() => setSelected(f)}
                className={`block w-full rounded-lg border p-3 text-left transition-colors ${selected?.part_id === f.part_id ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-600/10' : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{f.part_name}</p>
                  <Badge tone={f.movement_class === 'fast' ? 'danger' : f.movement_class === 'medium' ? 'warning' : 'neutral'}>{f.movement_class}</Badge>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400">{f.part_number}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Stock: {f.current_stock}</span>
                  <span className={`text-[10px] font-semibold ${f.stock_out_risk > 50 ? 'text-danger-600 dark:text-danger-400' : f.stock_out_risk > 25 ? 'text-warning-600 dark:text-warning-400' : 'text-accent-600 dark:text-accent-400'}`}>
                    {f.stock_out_risk}% risk
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart + details */}
        <div className="lg:col-span-2 space-y-6">
          {selected && (
            <>
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{selected.part_name}</h3>
                    <p className="font-mono text-xs text-slate-400">{selected.part_number}</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-800" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="historical" stroke="#3479ff" strokeWidth={2} dot={{ r: 3 }} name="Historical" />
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Forecast" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="card p-4">
                  <p className="text-xs text-slate-400">Current Stock</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selected.current_stock}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-slate-400">Safety Stock</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selected.safety_stock}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-slate-400">Reorder Qty</p>
                  <p className="mt-1 text-xl font-bold text-primary-600 dark:text-primary-400">{selected.recommended_reorder_qty}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-slate-400">Stock-Out Risk</p>
                  <p className={`mt-1 text-xl font-bold ${selected.stock_out_risk > 50 ? 'text-danger-600 dark:text-danger-400' : selected.stock_out_risk > 25 ? 'text-warning-600 dark:text-warning-400' : 'text-accent-600 dark:text-accent-400'}`}>{selected.stock_out_risk}%</p>
                </div>
              </div>

              {selected.excess_inventory && (
                <div className="card p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Excess Inventory Detected</p>
                      <p className="text-xs text-slate-400">This part has more stock than needed. Consider reducing future orders.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
