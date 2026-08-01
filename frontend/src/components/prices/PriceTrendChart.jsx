import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatVariety } from '../../utils/formatters';
const C = { nadu: '#16a34a', samba: '#d97706', k_samba: '#2563eb' };
export default function PriceTrendChart({ trend, priceUnitKg = 72 }) {
  const { t } = useTranslation();
  if (!trend?.length)
    return (
      <p className="text-gray-400 text-sm py-8 text-center">
        {t('common.no_trend')}
      </p>
    );
  const vars = Object.keys(C);
  const d = trend.map((e) => {
    const p = { date: e.date?.slice(5) || '' };
    vars.forEach((v) => {
      p[v] = e.prices?.[v] || null;
    });
    return p;
  });
  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{t('prices.seven_day')}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {t('prices.per_unit', { unit: priceUnitKg })}
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={d}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) =>
                v ? t('prices.tooltip_price', { price: v, unit: priceUnitKg }) : '—'
              }
            />
            <Legend />
            {vars.map((v) => (
              <Line
                key={v}
                type="monotone"
                dataKey={v}
                stroke={C[v]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                name={formatVariety(v)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
