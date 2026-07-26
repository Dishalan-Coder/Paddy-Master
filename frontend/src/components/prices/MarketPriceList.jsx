import { formatCurrency } from '../../utils/formatters';
export default function MarketPriceList({ latest, regional }) {
  if (!latest?.prices)
    return <p className="text-gray-400 text-sm py-8 text-center">No data.</p>;
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold mb-4">Today's Prices</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(latest.prices).map(([v, p]) => (
            <div key={v} className="text-center p-4 rounded-lg bg-paddy-50">
              <p className="text-sm text-paddy-700 font-medium capitalize">
                {v.replace('_', ' ')}
              </p>
              <p className="text-2xl font-bold text-paddy-900 mt-1">
                {formatCurrency(p)}
              </p>
              <p className="text-xs text-gray-500">per kg</p>
            </div>
          ))}
        </div>
      </div>
      {regional?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Regional</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3">Region</th>
                {Object.keys(latest.prices).map((v) => (
                  <th key={v} className="text-right pb-3 capitalize">
                    {v.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {regional.map((r) => (
                <tr key={r._id}>
                  <td className="py-3 capitalize">{r.region}</td>
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
