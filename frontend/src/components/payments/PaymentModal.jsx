import { useState } from 'react';
import { Banknote, Building2, CreditCard, ShieldCheck, X } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import paymentService from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';

const methods = [
  {
    value: 'cash_on_delivery',
    label: 'Cash on delivery',
    icon: Banknote,
    description: 'Payment is marked paid when delivery is completed.',
  },
  {
    value: 'bank_transfer',
    label: 'Bank transfer',
    icon: Building2,
    description: 'Enter your bank reference for processing.',
  },
  {
    value: 'card_demo',
    label: 'Demo card',
    icon: CreditCard,
    description: 'Local test flow only. No real money is charged.',
  },
];

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [method, setMethod] = useState(
    order.payment_method || 'cash_on_delivery',
  );
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { method };
      if (method === 'bank_transfer') payload.reference = reference;
      if (method === 'card_demo') payload.demo_token = 'demo-success';
      await paymentService.payOrder(order._id, payload);
      onSuccess?.();
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail || 'Payment could not be updated.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              Basic payment
            </p>
            <h3 className="mt-1 text-xl font-black">
              Pay {formatCurrency(order.total_price)}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
          {methods.map(({ value, label, icon: Icon, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${method === value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
            >
              <input
                type="radio"
                className="mt-1"
                checked={method === value}
                onChange={() => setMethod(value)}
              />
              <Icon
                className={`mt-0.5 h-5 w-5 ${method === value ? 'text-emerald-700' : 'text-slate-400'}`}
              />
              <div>
                <p className="text-sm font-black">{label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            </label>
          ))}
          {method === 'bank_transfer' && (
            <div>
              <label className="label">Transfer reference *</label>
              <input
                className="input-field"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Example: BOC-384921"
              />
            </div>
          )}
          {method === 'card_demo' && (
            <div className="flex gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p>
                This demonstrates the application workflow only. Integrate a
                licensed payment provider before production.
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Confirm payment
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
