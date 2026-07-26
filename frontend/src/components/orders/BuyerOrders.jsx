import { useState } from 'react';
import { CreditCard, MapPin, MessageSquareText, PackageCheck, Star } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import PaymentModal from '../payments/PaymentModal';
import ReviewModal from '../reviews/ReviewModal';
import orderService from '../../services/orderService';
import { formatCurrency, formatDateTime, formatOrderStatus } from '../../utils/formatters';

const statusClass = { pending: 'badge-amber', confirmed: 'badge-blue', pickup_scheduled: 'badge-blue', in_transit: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red', disputed: 'badge-red' };

export default function BuyerOrders({ orders, onStatusChange }) {
  const [updating, setUpdating] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [error, setError] = useState('');

  const cancel = async (orderId) => {
    if (!window.confirm('Cancel this order? The reserved stock will return to the listing.')) return;
    setUpdating(orderId); setError('');
    try { await orderService.updateStatus(orderId, 'cancelled'); onStatusChange?.(); }
    catch (requestError) { setError(requestError.response?.data?.detail || 'Could not cancel the order.'); }
    finally { setUpdating(null); }
  };

  if (!orders?.length) return <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white py-16 text-center"><PackageCheck className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-400">No orders yet. Browse the marketplace to purchase paddy.</p></div>;
  return <div className="space-y-4">
    <ErrorAlert message={error} onDismiss={() => setError('')} />
    {orders.map((order) => <article key={order._id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="flex gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-emerald-50">{order.product_image_url ? <img src={order.product_image_url} alt="" className="h-full w-full object-cover" /> : <PackageCheck className="h-6 w-6 text-emerald-700" />}</div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">{order.product_variety || 'Paddy order'}</h3><span className={statusClass[order.status] || 'badge-blue'}>{formatOrderStatus(order.status)}</span></div><p className="mt-1 text-sm text-slate-500">{order.quantity_kg} kg · {formatCurrency(order.total_price)}</p><p className="mt-2 text-xs text-slate-400">Order #{order._id.slice(-6).toUpperCase()} · {formatDateTime(order.created_at)}</p></div></div>
        <div className="text-left lg:text-right"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</p><p className={`mt-1 text-sm font-black ${order.payment_status === 'paid' ? 'text-emerald-700' : order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-700'}`}>{formatOrderStatus(order.payment_status || 'pending')}</p><p className="text-xs text-slate-400">{formatOrderStatus(order.payment_method || 'cash_on_delivery')}</p></div>
      </div>
      <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:grid-cols-[1fr_auto]"><div className="space-y-1 text-xs text-slate-500"><p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{order.delivery_address}</p><p className="flex items-center gap-1.5"><MessageSquareText className="h-3.5 w-3.5" />Farmer: {order.farmer_name || '—'} {order.farmer_phone ? `· ${order.farmer_phone}` : ''}</p></div><div className="flex flex-wrap gap-2 sm:justify-end">{order.status !== 'cancelled' && order.payment_status !== 'paid' && <Button size="sm" variant="secondary" icon={CreditCard} onClick={() => setPaymentOrder(order)}>Payment</Button>}{order.status === 'delivered' && <Button size="sm" variant="secondary" icon={Star} onClick={() => setReviewOrder(order)}>Write review</Button>}{['pending', 'confirmed'].includes(order.status) && <Button size="sm" variant="danger" loading={updating === order._id} onClick={() => cancel(order._id)}>Cancel</Button>}</div></div>
    </article>)}
    {paymentOrder && <PaymentModal order={paymentOrder} onClose={() => setPaymentOrder(null)} onSuccess={onStatusChange} />}
    {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSuccess={onStatusChange} />}
  </div>;
}
