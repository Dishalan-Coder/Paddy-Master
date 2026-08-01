import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Clock,
  DollarSign,
  ShoppingBag,
  Users,
} from 'lucide-react';
import AdminCharts from '../components/admin/AdminCharts';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import StatsCard from '../components/dashboard/StatsCard';
import useFetch from '../hooks/useFetch';
import adminService from '../services/adminService';
import { formatCurrency } from '../utils/formatters';

const emptyAnalytics = {
  active_farmers: 0,
  active_buyers: 0,
  monthly_gmv: 0,
  open_disputes: 0,
  pending_verifications: 0,
  pending_products: 0,
  order_trend: [],
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useFetch(
    () => adminService.getAnalytics(),
    [],
  );

  if (loading) return <Loader />;

  const analytics = { ...emptyAnalytics, ...(data || {}) };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('pages.admin.overview')}</h1>
        {error && (
          <button
            type="button"
            className="text-sm font-medium text-green-700 underline"
            onClick={refetch}
          >
            {t('common.retry')}
          </button>
        )}
      </div>
      <ErrorAlert message={error} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title={t('pages.admin.farmers')}
          value={analytics.active_farmers.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          title={t('pages.admin.buyers')}
          value={analytics.active_buyers.toLocaleString()}
          icon={ShoppingBag}
          color="blue"
        />
        <StatsCard
          title={t('monthly_gmv')}
          value={formatCurrency(analytics.monthly_gmv)}
          icon={DollarSign}
          color="paddy"
        />
        <StatsCard
          title={t('pages.admin.disputes')}
          value={analytics.open_disputes}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">{t('pending_approvals')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              {t('pages.admin.accounts_count', {
                count: analytics.pending_verifications,
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              {t('pages.admin.listings_count', {
                count: analytics.pending_products,
              })}
            </p>
          </div>
        </div>
      </div>

      <AdminCharts analytics={analytics} />
    </div>
  );
}
