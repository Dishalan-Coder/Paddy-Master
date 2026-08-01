import { useTranslation } from 'react-i18next';
import ProductModeration from '../components/admin/ProductModeration';
export default function AdminProductsPage() {
  const { t } = useTranslation();

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">
        {t('pages.admin.products_title')}
      </h1>
      <div className="card">
        <ProductModeration />
      </div>
    </div>
  );
}
