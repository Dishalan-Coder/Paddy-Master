import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import ErrorAlert from '../components/common/ErrorAlert';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';
import { formatDate } from '../utils/formatters';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

const PLANS = {
  farmer: {
    value: 'farmer_pro',
    name: 'Farmer Pro',
    price: 'Stripe monthly plan',
    summary: 'Advanced tools for field operations and marketplace selling.',
    highlights: [
      'Crop planning and advisory workspace',
      'Marketplace listing and order tools',
      'Revenue and expense visibility',
    ],
  },
  buyer: {
    value: 'buyer_pro',
    name: 'Buyer Pro',
    price: 'Stripe monthly plan',
    summary: 'Procurement tools for sourcing verified paddy supply.',
    highlights: [
      'Marketplace sourcing and order tracking',
      'Regional price and weather intelligence',
      'Supplier communication workflow',
    ],
  },
};

const getRequestErrorMessage = (requestError, fallback) => {
  const detail = requestError?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  return fallback;
};

const formatStatus = (status = 'inactive') =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function BillingPage() {
  const { user, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');

  const plan = PLANS[user?.role] || PLANS.farmer;
  const checkoutState = searchParams.get('checkout');
  const isActive = ACTIVE_STATUSES.has(subscription?.status);

  const notice = useMemo(() => {
    if (checkoutState === 'success') {
      return 'Checkout completed. Subscription status updates after Stripe confirms the payment.';
    }
    if (checkoutState === 'cancelled') {
      return 'Checkout was cancelled. No subscription changes were made.';
    }
    return '';
  }, [checkoutState]);

  const loadSubscription = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getSubscription();
      setSubscription(data);
      await refreshProfile();
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          'Could not load subscription details.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const startCheckout = async () => {
    setAction('checkout');
    setError('');
    try {
      const session = await paymentService.createSubscriptionCheckout({
        plan: plan.value,
      });
      window.location.assign(session.url);
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          'Could not start Stripe Checkout.',
        ),
      );
      setAction('');
    }
  };

  const openPortal = async () => {
    setAction('portal');
    setError('');
    try {
      const session = await paymentService.createBillingPortal();
      window.location.assign(session.url);
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          'Could not open Stripe billing management.',
        ),
      );
      setAction('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">Billing</p>
          <h1 className="page-title">Subscription</h1>
          <p className="page-copy">
            Manage your Paddy Master plan and Stripe billing access.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={loadSubscription}
          loading={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                {plan.name}
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-950">
                {plan.price}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {plan.summary}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
            >
              {isActive ? (
                <BadgeCheck className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {formatStatus(subscription?.status || 'inactive')}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {plan.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600"
              >
                {highlight}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={startCheckout}
              loading={action === 'checkout'}
              disabled={isActive || loading}
            >
              <CreditCard className="h-4 w-4" />
              {isActive ? 'Subscribed' : 'Start with Stripe'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={openPortal}
              loading={action === 'portal'}
              disabled={!subscription?.stripe_customer_id || loading}
            >
              <ExternalLink className="h-4 w-4" />
              Manage billing
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Current subscription
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Plan</p>
              <p className="mt-1 text-lg font-black text-slate-950">
                {subscription?.plan ? formatStatus(subscription.plan) : 'No plan'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Status</p>
              <p className="mt-1 text-lg font-black text-slate-950">
                {formatStatus(subscription?.status || 'inactive')}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <CalendarClock className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Current period ends
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {formatDate(subscription?.current_period_end)}
                </p>
              </div>
            </div>
            {subscription?.cancel_at_period_end && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-700">
                This subscription is set to cancel at the end of the billing
                period.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
