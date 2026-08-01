import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BadgeCheck,
  CloudSun,
  PackageCheck,
  ShoppingBag,
  WalletCards,
} from 'lucide-react';
import ProductList from '../components/marketplace/ProductList';
import StatsCard from '../components/dashboard/StatsCard';
import useFetch from '../hooks/useFetch';
import productService from '../services/productService';
import dashboardService from '../services/dashboardService';
import priceService from '../services/priceService';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function BuyerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: productData, loading: productsLoading } = useFetch(
    () =>
      productService.getAll({
        limit: 4,
        sort_by: 'created_at',
        sort_order: -1,
      }),
    [],
  );
  const { data: dashboard } = useFetch(
    () => dashboardService.getBuyerData(),
    [],
  );
  const { data: prices } = useFetch(() => priceService.getPrices(), []);
  const bestPrice = prices?.latest?.prices
    ? Math.min(...Object.values(prices.latest.prices))
    : 0;
  const marketPriceUnitKg =
    prices?.selected_unit_kg || prices?.latest?.price_unit_kg || 72;

  return (
    <div className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              {t('dashboard_pages.buyer_kicker')}
            </p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              {t('dashboard_pages.buyer_title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {t('dashboard_pages.buyer_copy', {
                name: user?.full_name?.split(' ')[0] || '',
              })}
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950"
          >
            {t('dashboard_pages.browse_marketplace')}{' '}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard_pages.available_listings')}
          value={dashboard?.available_listings || productData?.total || 0}
          icon={ShoppingBag}
        />
        <StatsCard
          title={t('common.active_orders')}
          value={dashboard?.active_orders || 0}
          icon={PackageCheck}
          color="amber"
        />
        <StatsCard
          title={t('dashboard_pages.completed_orders')}
          value={dashboard?.completed_orders || 0}
          icon={BadgeCheck}
          color="blue"
        />
        <StatsCard
          title={t('dashboard_pages.total_purchases')}
          value={formatCurrency(dashboard?.total_spend || 0)}
          icon={WalletCards}
          color="paddy"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 lg:col-span-2">
          <p className="page-kicker">{t('dashboard_pages.current_market')}</p>
          <h2 className="text-xl font-black">
            {t('dashboard_pages.buying_signal')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t('dashboard_pages.buying_signal_copy', {
              price: formatCurrency(bestPrice),
              unit: marketPriceUnitKg,
            })}
          </p>
        </div>
        <Link
          to="/prices-weather"
          className="group rounded-[1.5rem] bg-emerald-700 p-6 text-white"
        >
          <CloudSun className="h-6 w-6 text-lime-300" />
          <p className="mt-5 text-lg font-black">
            {t('dashboard_pages.prices_weather')}
          </p>
          <p className="mt-2 text-sm text-emerald-100">
            {t('dashboard_pages.prices_weather_copy')}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-black">
            {t('dashboard_pages.open_insights')}{' '}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="page-kicker">{t('dashboard_pages.new_supply')}</p>
            <h2 className="text-xl font-black">
              {t('dashboard_pages.latest_listings')}
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1 text-sm font-black text-emerald-700"
          >
            {t('common.view_all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductList
          products={productData?.products}
          loading={productsLoading}
        />
      </section>
    </div>
  );
}
