import { PackageCheck } from 'lucide-react';
import BuyerOrders from '../components/orders/BuyerOrders';
import FarmerOrders from '../components/orders/FarmerOrders';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import useFetch from '../hooks/useFetch';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const { data: orders, loading, error, refetch } = useFetch(isFarmer ? () => orderService.getFarmerOrders() : () => orderService.getBuyerOrders(), [isFarmer]);
  const active = (orders || []).filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="page-kicker">Marketplace fulfilment</p><h1 className="page-title">{isFarmer ? 'Sales orders' : 'Purchase orders'}</h1><p className="page-copy">Follow confirmation, pickup, transport, delivery, payment, and review activity.</p></div><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"><PackageCheck className="h-5 w-5 text-emerald-700" /><div><p className="text-xs text-slate-400">Active orders</p><p className="text-lg font-black">{active}</p></div></div></div>
      <ErrorAlert message={error} />
      {loading ? <Loader /> : isFarmer ? <FarmerOrders orders={orders} onStatusChange={refetch} /> : <BuyerOrders orders={orders} onStatusChange={refetch} />}
    </div>
  );
}
