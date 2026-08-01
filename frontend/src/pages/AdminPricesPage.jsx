import { useTranslation } from 'react-i18next';
import MarketPriceManagement from '../components/admin/MarketPriceManagement';
export default function AdminPricesPage() {
  const { t } = useTranslation();

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">
        {t('pages.admin.prices_title')}
      </h1>
      <div className="card">
        <MarketPriceManagement />
      </div>
    </div>
  );
}
