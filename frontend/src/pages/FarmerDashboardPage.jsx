import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Sprout,
  Wallet,
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import CropCard from '../components/crops/CropCard';
import WeatherCard from '../components/weather/WeatherCard';
import RecommendationList from '../components/recommendations/RecommendationList';
import Loader from '../components/common/Loader';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  formatGrowthStage,
  formatWeatherAlertType,
} from '../utils/formatters';
import dashboardService from '../services/dashboardService';
import cropService from '../services/cropService';
import weatherService from '../services/weatherService';
import recommendationService from '../services/recommendationService';

export default function FarmerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: dashboard, loading: dashboardLoading } = useFetch(
    () => dashboardService.getFarmerData(),
    [],
  );
  const { data: crops, loading: cropsLoading } = useFetch(
    () => cropService.getAll(),
    [],
  );
  const { data: weather } = useFetch(
    () =>
      weatherService.getWeather(
        user?.district?.toLowerCase() || 'anuradhapura',
      ),
    [user?.district],
  );
  const { data: advisory } = useFetch(() => recommendationService.getAll(), []);

  if (dashboardLoading) return <Loader />;
  const firstAlert = weather?.alerts?.[0];
  return (
    <div className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-7 text-white shadow-xl shadow-emerald-950/15 sm:p-9">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-lime-300/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
              {t('dashboard_pages.farmer_kicker')}
            </p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              {t('dashboard_pages.farmer_greeting', {
                name: user?.full_name?.split(' ')[0] || '',
              })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100">
              {t('dashboard_pages.farmer_copy')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/crops/new"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-emerald-900"
            >
              {t('add_crop')}
            </Link>
            <Link
              to="/products/new"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white"
            >
              {t('dashboard_pages.list_harvest')}
            </Link>
          </div>
        </div>
        {firstAlert && (
          <div className="relative mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-black">
                {t('dashboard_pages.alert_label', {
                  type: formatWeatherAlertType(firstAlert.type).toUpperCase(),
                })}
              </p>
              <p className="mt-1 text-sm text-amber-50">{firstAlert.message}</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard_pages.active_crops')}
          value={dashboard?.active_crops || 0}
          icon={Sprout}
        />
        <StatsCard
          title={t('dashboard_pages.live_listings')}
          value={dashboard?.active_products || 0}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title={t('dashboard_pages.pending_orders')}
          value={dashboard?.pending_orders || 0}
          icon={ShoppingCart}
          color="amber"
        />
        <StatsCard
          title={t('wallet_balance')}
          value={formatCurrency(dashboard?.wallet_balance || 0)}
          icon={Wallet}
          color="paddy"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="page-kicker">{t('dashboard_pages.current_season')}</p>
                <h2 className="text-xl font-black">
                  {t('dashboard_pages.crop_progress')}
                </h2>
              </div>
              <Link
                to="/crops"
                className="inline-flex items-center gap-1 text-sm font-black text-emerald-700"
              >
                {t('common.view_all')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {cropsLoading ? (
              <Loader />
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {(crops || []).slice(0, 4).map((crop) => (
                  <CropCard key={crop._id} crop={crop} />
                ))}
                {!crops?.length && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                    {t('pages.crops.none_records')}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <CircleDollarSign className="h-5 w-5 text-emerald-700" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('dashboard_pages.total_revenue')}
              </p>
              <p className="mt-1 text-2xl font-black">
                {formatCurrency(dashboard?.total_revenue || 0)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <Wallet className="h-5 w-5 text-amber-600" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('dashboard_pages.recorded_expenses')}
              </p>
              <p className="mt-1 text-2xl font-black">
                {formatCurrency(dashboard?.total_expenses || 0)}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <Sprout className="h-5 w-5 text-lime-300" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('dashboard_pages.net_position')}
              </p>
              <p
                className={`mt-1 text-2xl font-black ${(dashboard?.net_profit || 0) >= 0 ? 'text-lime-300' : 'text-red-300'}`}
              >
                {formatCurrency(dashboard?.net_profit || 0)}
              </p>
            </div>
          </section>

          {!!dashboard?.upcoming_harvests?.length && (
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-700" />
                <h2 className="font-black">
                  {t('dashboard_pages.upcoming_harvests')}
                </h2>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {dashboard.upcoming_harvests.map((crop) => (
                  <div
                    key={crop._id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-bold">{crop.variety}</p>
                      <p className="text-xs text-slate-400 capitalize">
                        {formatGrowthStage(crop.growth_stage)}
                      </p>
                    </div>
                    <p className="text-sm font-black text-emerald-700">
                      {formatDate(crop.expected_harvest_date)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {weather && <WeatherCard data={weather} />}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black">{t('recommendations')}</h2>
              <Link
                to="/recommendations"
                className="text-xs font-black text-emerald-700"
              >
                {t('common.view_all')}
              </Link>
            </div>
            <RecommendationList
              compact
              recommendations={(advisory?.recommendations || []).slice(0, 3)}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
