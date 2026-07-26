import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
export default function AdminCharts({ analytics }) {
  if (!analytics) return null;
  const d = (analytics.order_trend || []).map((t) => ({
    date: t._id?.slice(5) || '',
    orders: t.count,
    volume: t.volume,
  }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold mb-4">Order Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#16a34a"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#d97706"
                strokeWidth={2}
                name="Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card space-y-4">
        <h3 className="font-semibold">Stats</h3>
        <div className="p-3 bg-paddy-50 rounded-lg flex justify-between">
          <span className="text-sm text-paddy-700">GMV</span>
          <span className="font-bold text-paddy-900">
            {formatCurrency(analytics.monthly_gmv)}
          </span>
        </div>
        <div className="p-3 bg-red-50 rounded-lg flex justify-between">
          <span className="text-sm text-red-700">Disputes</span>
          <span className="font-bold text-red-900">
            {analytics.open_disputes}
          </span>
        </div>
      </div>
    </div>
  );
}
