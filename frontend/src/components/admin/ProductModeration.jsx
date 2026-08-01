import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import Loader from '../common/Loader';
import adminService from '../../services/adminService';
import { formatCurrency, formatVariety } from '../../utils/formatters';
export default function ProductModeration() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = async () => {
    setLoading(true);
    try {
      const d = await adminService.getProducts({ skip: 0, limit: 50 });
      setProducts(d.products);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);
  if (loading) return <Loader />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 font-semibold">{t('variety')}</th>
            <th className="pb-3 font-semibold">{t('common.quantity')}</th>
            <th className="pb-3 font-semibold">{t('common.price')}</th>
            <th className="pb-3 font-semibold text-right">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="py-3 font-medium">{formatVariety(p.variety)}</td>
              <td className="py-3">{p.quantity_kg}kg</td>
              <td className="py-3 font-semibold">
                {formatCurrency(p.price_per_kg)}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  {t('prices.per_unit', { unit: p.price_unit_kg || 72 })}
                </span>
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={async () => {
                    if (!confirm(t('pages.admin.remove_confirm'))) return;
                    await adminService.deleteProduct(p._id);
                    fetch();
                  }}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
