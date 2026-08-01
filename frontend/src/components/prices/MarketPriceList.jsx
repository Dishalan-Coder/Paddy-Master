import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDistrict, formatVariety } from '../../utils/formatters';
export default function MarketPriceList({ latest, regional }) {
  const { t } = useTranslation();
  const priceUnitKg = latest?.price_unit_kg || 72;
  if (!latest?.prices)
    return (
      <p className="text-gray-400 text-sm py-8 text-center">
        {t('common.no_data')}
      </p>
    );
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{t('prices.today')}</h3>
          <span className="rounded-full bg-paddy-50 px-3 py-1 text-xs font-black text-paddy-700">
            {t('prices.per_unit', { unit: priceUnitKg })}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(latest.prices).map(([v, p]) => (
            <div key={v} className="text-center p-4 rounded-lg bg-paddy-50">
              <p className="text-sm text-paddy-700 font-medium capitalize">
                {formatVariety(v)}
              </p>
              <p className="text-2xl font-bold text-paddy-900 mt-1">
                {formatCurrency(p)}
              </p>
              <p className="text-xs text-gray-500">
                {t('prices.per_unit', { unit: priceUnitKg })}
              </p>
            </div>
          ))}
        </div>
      </div>
      {regional?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">{t('prices.regional')}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3">{t('region')}</th>
                {Object.keys(latest.prices).map((v) => (
                  <th key={v} className="text-right pb-3 capitalize">
                    {formatVariety(v)}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {t('prices.unit_kg', { unit: priceUnitKg })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {regional.map((r) => (
                <tr key={r._id}>
                  <td className="py-3 capitalize">{formatDistrict(r.region)}</td>
                  {Object.keys(latest.prices).map((v) => (
                    <td key={v} className="py-3 text-right font-semibold">
                      {formatCurrency(r.prices?.[v] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
