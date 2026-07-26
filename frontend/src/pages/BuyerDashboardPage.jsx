import { Link } from 'react-router-dom';
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

  return (
    <div className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Buyer marketplace desk
            </p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
              Source quality paddy directly
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Hello {user?.full_name?.split(' ')[0]}. Compare verified farmer
              listings, regional prices, payment state, and delivery progress.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950"
          >
            Browse marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Available listings"
          value={dashboard?.available_listings || productData?.total || 0}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Active orders"
          value={dashboard?.active_orders || 0}
          icon={PackageCheck}
          color="amber"
        />
        <StatsCard
          title="Completed orders"
          value={dashboard?.completed_orders || 0}
          icon={BadgeCheck}
          color="blue"
        />
        <StatsCard
          title="Total purchases"
          value={formatCurrency(dashboard?.total_spend || 0)}
          icon={WalletCards}
          color="paddy"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 lg:col-span-2">
          <p className="page-kicker">Current market</p>
          <h2 className="text-xl font-black">Buying signal</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The lowest national reference price currently available is{' '}
            <strong className="text-emerald-700">
              {formatCurrency(bestPrice)} per kg
            </strong>
            . Compare listing quality, transport, and farmer rating before
            ordering.
          </p>
        </div>
        <Link
          to="/prices-weather"
          className="group rounded-[1.5rem] bg-emerald-700 p-6 text-white"
        >
          <CloudSun className="h-6 w-6 text-lime-300" />
          <p className="mt-5 text-lg font-black">Prices and weather</p>
          <p className="mt-2 text-sm text-emerald-100">
            Use regional price trends and field conditions to plan procurement.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-black">
            Open insights{' '}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="page-kicker">New supply</p>
            <h2 className="text-xl font-black">Latest farmer listings</h2>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1 text-sm font-black text-emerald-700"
          >
            View all <ArrowRight className="h-4 w-4" />
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
