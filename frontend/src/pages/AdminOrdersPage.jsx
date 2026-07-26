import { useCallback, useState } from 'react';
import { CheckCircle2, CreditCard, PackageCheck } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import adminService from '../services/adminService';
import paymentService from '../services/paymentService';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../utils/formatters';

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirming, setConfirming] = useState(null);
  const load = useCallback(
    () => adminService.getOrders(status ? { status } : {}),
    [status],
  );
  const { data, loading, error, refetch } = useFetch(load, [load]);
  const orders = data?.orders || [];

  const confirmTransfer = async (orderId) => {
    if (!window.confirm('Confirm that this bank transfer was received?'))
      return;
    setConfirming(orderId);
    setActionError('');
    try {
      await paymentService.confirmBankTransfer(orderId);
      await refetch();
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.detail ||
          'Could not confirm the bank transfer.',
      );
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">Marketplace supervision</p>
          <h1 className="page-title">All orders</h1>
          <p className="page-copy">
            Review order progress, participants, and payment state.
          </p>
        </div>
        <select
          className="input-field w-auto min-w-48"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {[
            'pending',
            'confirmed',
            'pickup_scheduled',
            'in_transit',
            'delivered',
            'cancelled',
            'disputed',
          ].map((item) => (
            <option key={item} value={item}>
              {formatOrderStatus(item)}
            </option>
          ))}
        </select>
      </div>
      <ErrorAlert
        message={error || actionError}
        onDismiss={() => setActionError('')}
      />
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Farmer / buyer</th>
                  <th className="px-5 py-4">Value</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-800">
                        {order.product_variety}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        #{order._id.slice(-6).toUpperCase()} ·{' '}
                        {formatDateTime(order.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{order.farmer_name}</p>
                      <p className="text-xs text-slate-500">
                        Buyer: {order.buyer_name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black">
                        {formatCurrency(order.total_price)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.quantity_kg} kg
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        <CreditCard className="h-3.5 w-3.5" />
                        {formatOrderStatus(order.payment_status || 'pending')}
                      </span>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatOrderStatus(
                          order.payment_method || 'cash_on_delivery',
                        )}
                      </p>
                      {order.payment_method === 'bank_transfer' &&
                        order.payment_status === 'processing' &&
                        order.status !== 'cancelled' && (
                          <Button
                            className="mt-2"
                            size="sm"
                            variant="secondary"
                            icon={CheckCircle2}
                            loading={confirming === order._id}
                            onClick={() => confirmTransfer(order._id)}
                          >
                            Confirm received
                          </Button>
                        )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      <PackageCheck className="mx-auto mb-3 h-8 w-8" />
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
