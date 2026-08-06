import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { formatDate, formatOrderStatus } from '../utils/formatters';
import { getApiErrorMessage } from '../utils/forms';
import {
  getFreeTrialEndsAt,
  isFarmerFreeTrialActive,
} from '../utils/subscriptionAccess';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

const PLANS = {
  farmer: {
    value: 'farmer_pro',
    nameKey: 'pages.billing.farmer_pro',
    priceKey: 'pages.billing.farmer_monthly_price',
    summaryKey: 'pages.billing.farmer_summary',
    highlights: [
      'pages.billing.farmer_highlight_1',
      'pages.billing.farmer_highlight_2',
      'pages.billing.farmer_highlight_3',
    ],
  },
  buyer: {
    value: 'buyer_pro',
    nameKey: 'pages.billing.buyer_pro',
    priceKey: 'pages.billing.buyer_monthly_price',
    summaryKey: 'pages.billing.buyer_summary',
    highlights: [
      'pages.billing.buyer_highlight_1',
      'pages.billing.buyer_highlight_2',
      'pages.billing.buyer_highlight_3',
    ],
  },
};

export default function BillingPage() {
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');

  const plan = PLANS[user?.role] || PLANS.farmer;
  const checkoutState = searchParams.get('checkout');
  const requiredAccess = searchParams.get('required');
  const isActive = ACTIVE_STATUSES.has(subscription?.status);
  const isFarmer = user?.role === 'farmer';
  const trialUser = {
    ...(user || {}),
    access: {
      ...(user?.access || {}),
      free_trial_active:
        subscription?.free_trial_active ?? user?.access?.free_trial_active,
      free_trial_ends_at:
        subscription?.free_trial_ends_at || user?.access?.free_trial_ends_at,
    },
  };
  const freeTrialActive = isFarmerFreeTrialActive(trialUser);
  const freeTrialEndsAt = getFreeTrialEndsAt(trialUser);

  const notice = useMemo(() => {
    if (checkoutState === 'success') {
      return t('pages.billing.checkout_success');
    }
    if (checkoutState === 'cancelled') {
      return t('pages.billing.checkout_cancelled');
    }
    if (requiredAccess === 'premium') {
      return t('pages.billing.premium_required');
    }
    if (requiredAccess === 'trial') {
      return t('pages.billing.trial_expired');
    }
    return '';
  }, [checkoutState, requiredAccess, t]);

  const loadSubscription = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getSubscription();
      setSubscription(data);
      await refreshProfile();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          t('pages.billing.load_failed'),
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
        getApiErrorMessage(
          requestError,
          t('pages.billing.checkout_failed'),
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
        getApiErrorMessage(
          requestError,
          t('pages.billing.portal_failed'),
        ),
      );
      setAction('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">{t('billing')}</p>
          <h1 className="page-title">{t('pages.billing.title')}</h1>
          <p className="page-copy">
            {t('pages.billing.copy')}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={loadSubscription}
          loading={loading}
        >
          <RefreshCw className="h-4 w-4" />
          {t('common.refresh')}
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
                {t(plan.nameKey)}
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-950">
                {t('pages.billing.stripe_plan')}
              </h2>
              <p className="mt-3 text-3xl font-black text-emerald-700">
                {t(plan.priceKey)}
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                {t('pages.billing.monthly_price_note')}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {t(plan.summaryKey)}
              </p>
              {isFarmer && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                  <p className="font-black">
                    {freeTrialActive
                      ? t('pages.billing.free_trial_active')
                      : t('pages.billing.free_trial_ended')}
                  </p>
                  <p className="mt-1 text-emerald-800">
                    {t('pages.billing.free_trial_ends', {
                      date: formatDate(freeTrialEndsAt),
                    })}
                  </p>
                </div>
              )}
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
            >
              {isActive ? (
                <BadgeCheck className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {formatOrderStatus(subscription?.status || 'inactive')}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {plan.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600"
              >
                {t(highlight)}
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
              {isActive
                ? t('pages.billing.subscribed')
                : t('pages.billing.start_stripe')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={openPortal}
              loading={action === 'portal'}
              disabled={!subscription?.stripe_customer_id || loading}
            >
              <ExternalLink className="h-4 w-4" />
              {t('pages.billing.manage_billing')}
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {t('pages.billing.current_subscription')}
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                {t('pages.billing.plan')}
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">
                {subscription?.plan
                  ? formatOrderStatus(subscription.plan)
                  : t('pages.billing.no_plan')}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                {t('common.status')}
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">
                {formatOrderStatus(subscription?.status || 'inactive')}
              </p>
            </div>
            {isFarmer && (
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {t('pages.billing.free_trial')}
                </p>
                <p className="mt-1 text-lg font-black text-slate-950">
                  {freeTrialActive
                    ? t('pages.billing.free_trial_available')
                    : t('pages.billing.free_trial_unavailable')}
                </p>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <CalendarClock className="mt-0.5 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {t('pages.billing.current_period_ends')}
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {formatDate(subscription?.current_period_end)}
                </p>
              </div>
            </div>
            {subscription?.cancel_at_period_end && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-700">
                {t('pages.billing.cancel_notice')}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
