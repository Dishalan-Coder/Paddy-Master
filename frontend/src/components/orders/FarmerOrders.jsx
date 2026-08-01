import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, PackageCheck, Phone, Truck } from 'lucide-react';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
  formatVariety,
} from '../../utils/formatters';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import orderService from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/forms';

const statusClass = {
  pending: 'badge-amber',
  confirmed: 'badge-blue',
  pickup_scheduled: 'badge-blue',
  in_transit: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};
const next = {
  pending: 'confirmed',
  confirmed: 'pickup_scheduled',
  pickup_scheduled: 'in_transit',
  in_transit: 'delivered',
};

export default function FarmerOrders({ orders, onStatusChange }) {
  const { t } = useTranslation();
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');
  const advance = async (id, status) => {
    const target = next[status];
    if (!target) return;
    setUpdating(id);
    setError('');
    try {
      await orderService.updateStatus(id, target);
      onStatusChange?.();
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, t('order.update_failed')),
      );
    } finally {
      setUpdating(null);
    }
  };
  if (!orders?.length)
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white py-16 text-center">
        <PackageCheck className="mx-auto h-9 w-9 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-400">
          {t('pages.orders.farmer_none')}
        </p>
      </div>
    );
  return (
    <div className="space-y-4">
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      {orders.map((order) => (
        <article
          key={order._id}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black">
                  {order.product_variety
                    ? formatVariety(order.product_variety)
                    : t('order.paddy_order')}
                </h3>
                <span className={statusClass[order.status] || 'badge-blue'}>
                  {formatOrderStatus(order.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {order.quantity_kg} {t('common.kg')} ·{' '}
                <span className="font-black text-emerald-700">
                  {formatCurrency(order.total_price)}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-400">
                #{order._id.slice(-6).toUpperCase()} ·{' '}
                {formatDateTime(order.created_at)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t('common.payment')}
              </p>
              <p
                className={`text-sm font-black ${order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}
              >
                {formatOrderStatus(order.payment_status || 'pending')}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-700" />
              {order.buyer_name || t('common.buyer')}{' '}
              {order.buyer_phone ? `· ${order.buyer_phone}` : ''}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-700" />
              {order.delivery_address}
            </p>
          </div>
          {next[order.status] && (
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                icon={Truck}
                loading={updating === order._id}
                onClick={() => advance(order._id, order.status)}
              >
                {t('order.mark_status', {
                  status: formatOrderStatus(next[order.status]),
                })}
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
