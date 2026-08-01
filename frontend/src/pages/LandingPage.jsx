import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Languages,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import Footer from '../components/common/Footer';
import LanguageToggle from '../components/common/LanguageToggle';

const capabilities = [
  {
    icon: ClipboardList,
    titleKey: 'landing.capabilities.records_title',
    textKey: 'landing.capabilities.records_text',
  },
  {
    icon: CloudSun,
    titleKey: 'landing.capabilities.weather_title',
    textKey: 'landing.capabilities.weather_text',
  },
  {
    icon: ShoppingBag,
    titleKey: 'landing.capabilities.marketplace_title',
    textKey: 'landing.capabilities.marketplace_text',
  },
  {
    icon: PackageCheck,
    titleKey: 'landing.capabilities.orders_title',
    textKey: 'landing.capabilities.orders_text',
  },
  {
    icon: TrendingUp,
    titleKey: 'landing.capabilities.prices_title',
    textKey: 'landing.capabilities.prices_text',
  },
  {
    icon: Languages,
    titleKey: 'landing.capabilities.bilingual_title',
    textKey: 'landing.capabilities.bilingual_text',
  },
];

const heroMetrics = [
  ['3', 'landing.metrics.role_portals'],
  ['50', 'landing.metrics.api_operations'],
  ['25', 'landing.metrics.district_ready'],
  ['S3', 'landing.metrics.private_media'],
];

const signalCards = [
  {
    labelKey: 'landing.signals.market_rate',
    value: 'Rs. 118/kg',
    detailKey: 'landing.signals.market_detail',
    icon: TrendingUp,
    className: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100',
  },
  {
    labelKey: 'landing.signals.field_alert',
    valueKey: 'landing.signals.field_value',
    detailKey: 'landing.signals.field_detail',
    icon: BellRing,
    className: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
  },
  {
    labelKey: 'landing.signals.open_order',
    value: '2,400 kg',
    detailKey: 'landing.signals.open_order_detail',
    icon: PackageCheck,
    className: 'border-sky-300/20 bg-sky-400/10 text-sky-100',
  },
];

const roleCards = [
  {
    icon: Sprout,
    titleKey: 'landing.role_cards.farmers_title',
    textKey: 'landing.role_cards.farmers_text',
  },
  {
    icon: ShoppingBag,
    titleKey: 'landing.role_cards.buyers_title',
    textKey: 'landing.role_cards.buyers_text',
  },
  {
    icon: Users,
    titleKey: 'landing.role_cards.admins_title',
    textKey: 'landing.role_cards.admins_text',
  },
];

const workflowSteps = [
  [
    '01',
    'landing.workflow_steps.record_title',
    'landing.workflow_steps.record_text',
  ],
  [
    '02',
    'landing.workflow_steps.signals_title',
    'landing.workflow_steps.signals_text',
  ],
  [
    '03',
    'landing.workflow_steps.publish_title',
    'landing.workflow_steps.publish_text',
  ],
  [
    '04',
    'landing.workflow_steps.close_title',
    'landing.workflow_steps.close_text',
  ],
];

const deploymentNotes = [
  'landing.deployment_notes.docker',
  'landing.deployment_notes.proxy',
  'landing.deployment_notes.cors',
  'landing.deployment_notes.s3',
  'landing.deployment_notes.headers',
  'landing.deployment_notes.checklist',
];

function SignalCard({ signal, t }) {
  const Icon = signal.icon;

  return (
    <div className={`min-w-0 rounded-lg border p-4 ${signal.className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 break-words text-xs font-bold uppercase tracking-normal opacity-75">
          {t(signal.labelKey)}
        </p>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <p className="mt-3 break-words text-xl font-black leading-tight sm:text-2xl">
        {signal.valueKey ? t(signal.valueKey) : signal.value}
      </p>
      <p className="mt-1 break-words text-xs leading-5 opacity-70">
        {t(signal.detailKey)}
      </p>
    </div>
  );
}

function HeroDashboardPreview({ className = '', t }) {
  return (
    <div className={`w-full max-w-[calc(100vw-2.5rem)] rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:max-w-full ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <p className="break-words text-xs font-bold uppercase tracking-normal text-emerald-200">
            {t('landing.operations_command')}
          </p>
          <p className="mt-1 break-words text-lg font-black text-white">
            {t('landing.today_network')}
          </p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-300 text-slate-950">
          <Sprout className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {signalCards.map((signal) => (
          <SignalCard key={signal.labelKey} signal={signal} t={t} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white">
              {t('landing.regional_demand')}
            </p>
            <MapPin className="h-4 w-4 text-sky-200" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              ['districts.Anuradhapura', 'landing.demand.high', 'w-11/12', 'bg-emerald-300'],
              ['districts.Polonnaruwa', 'landing.demand.stable', 'w-8/12', 'bg-sky-300'],
              ['districts.Batticaloa', 'landing.demand.rising', 'w-9/12', 'bg-amber-300'],
            ].map(([regionKey, statusKey, width, color]) => (
              <div key={regionKey}>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                  <span className="min-w-0 break-words">{t(regionKey)}</span>
                  <span className="shrink-0">{t(statusKey)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${color} ${width}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-black text-white">
            {t('landing.crop_portfolio')}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ['06', 'landing.portfolio.active'],
              ['12d', 'landing.portfolio.harvest'],
              ['94%', 'landing.portfolio.verified'],
            ].map(([value, labelKey]) => (
              <div
                key={labelKey}
                className="rounded-md border border-white/10 bg-slate-950/40 px-3 py-4 text-center"
              >
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 break-words text-[11px] font-semibold leading-4 text-slate-400">
                  {t(labelKey)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-white p-3 text-slate-900">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />
              <div className="min-w-0">
                <p className="break-words text-sm font-black">
                  {t('landing.verified_trade_profile')}
                </p>
                <p className="break-words text-xs leading-5 text-slate-500">
                  {t('landing.trade_history')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9f5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-screen max-w-full items-center justify-between gap-3 px-4 py-4 sm:max-w-7xl sm:px-5 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center hover:opacity-90"
          >
            <BrandLogo size="xs" showWordmark={false} className="sm:hidden" />
            <BrandLogo size="sm" className="hidden sm:inline-flex" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#platform" className="hover:text-emerald-700">
              {t('landing.nav_platform')}
            </a>
            <a href="#roles" className="hover:text-emerald-700">
              {t('landing.nav_roles')}
            </a>
            <a href="#workflow" className="hover:text-emerald-700">
              {t('landing.nav_workflow')}
            </a>
            <a href="#deployment" className="hover:text-emerald-700">
              {t('landing.nav_deployment')}
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle compact />
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 sm:px-4"
            >
              {t('landing.get_started')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <img
            src="/paddy-brand-mark.png"
            alt=""
            aria-hidden="true"
            className="absolute right-[-5rem] top-8 h-[28rem] w-[28rem] object-contain opacity-[0.05] lg:right-[max(2rem,calc((100vw-80rem)/2))]"
          />

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-73px)] w-full max-w-7xl items-center gap-10 px-5 py-16 lg:px-8 lg:py-20 xl:grid-cols-[minmax(0,1fr)_minmax(34rem,1fr)] xl:gap-14 xl:py-24">
            <div className="min-w-0 max-w-[calc(100vw-2.5rem)] sm:max-w-2xl xl:max-w-none">
              <div className="mb-6 inline-flex max-w-full items-start gap-2 rounded-lg border border-emerald-300/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-normal text-emerald-100">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">
                  {t('landing.hero_badge')}
                </span>
              </div>
              <h1 className="break-words font-display text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
                Paddy Master
              </h1>
              <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-slate-200">
                {t('landing.hero_copy')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-950/30 hover:bg-emerald-400 sm:px-6"
                >
                  {t('landing.create_account')}{' '}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-w-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-5 py-3.5 font-bold text-white hover:bg-white/15 sm:px-6"
                >
                  {t('landing.open_dashboard')}
                </Link>
              </div>

              <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {heroMetrics.map(([value, label]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-lg border border-white/10 bg-white/[0.07] p-4"
                  >
                    <p className="text-2xl font-black text-emerald-200">
                      {value}
                    </p>
                    <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-300">
                      {t(label)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <HeroDashboardPreview className="min-w-0 xl:justify-self-end" t={t} />
          </div>
        </section>

        <section id="platform" className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="section-kicker">{t('landing.nav_platform')}</p>
                <h2 className="section-title">
                  {t('landing.platform_title')}
                </h2>
              </div>
              <p className="section-copy max-w-3xl lg:justify-self-end">
                {t('landing.platform_copy')}
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, titleKey, textKey }) => (
                <article
                  key={titleKey}
                  className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t(textKey)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eef4f6] py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
            <div>
              <p className="section-kicker">{t('landing.product_surface')}</p>
              <h2 className="section-title">
                {t('landing.surface_title')}
              </h2>
              <p className="section-copy">
                {t('landing.surface_copy')}
              </p>
              <div className="mt-7 space-y-3">
                {[
                  'landing.surface_points.navigation',
                  'landing.surface_points.production',
                  'landing.surface_points.shared',
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <span>{t(item)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-300/30">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-emerald-200">
                    {t('landing.admin_analytics')}
                  </p>
                  <p className="mt-1 font-black">
                    {t('landing.platform_overview')}
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 text-amber-300" />
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {[
                  ['landing.analytics.verified_users', '1,248', 'landing.analytics.farmers_buyers'],
                  ['landing.analytics.active_listings', '316', 'landing.analytics.harvests_available'],
                  ['landing.analytics.open_orders', '84', 'landing.analytics.across_marketplace'],
                  ['landing.analytics.daily_alerts', '27', 'landing.analytics.weather_fulfilment'],
                ].map(([labelKey, value, detailKey]) => (
                  <div
                    key={labelKey}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-500">
                      {t(labelKey)}
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {t(detailKey)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 border-t border-slate-200 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-black">{t('landing.order_pipeline')}</p>
                    <WalletCards className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ['landing.analytics.placed', 'w-11/12', 'bg-sky-500'],
                      ['landing.analytics.confirmed', 'w-9/12', 'bg-emerald-600'],
                      ['landing.analytics.delivered', 'w-7/12', 'bg-amber-500'],
                    ].map(([labelKey, width, color]) => (
                      <div key={labelKey}>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>{t(labelKey)}</span>
                          <span>{width === 'w-11/12' ? '92%' : width === 'w-9/12' ? '75%' : '58%'}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                          <div className={`h-2 rounded-full ${color} ${width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-700 p-4 text-white">
                  <CloudSun className="h-6 w-6 text-amber-200" />
                  <p className="mt-5 text-3xl font-black">30 C</p>
                  <p className="text-sm text-emerald-100">
                    {t('landing.partly_cloudy')}
                  </p>
                  <p className="mt-4 text-xs leading-5 text-emerald-50">
                    {t('landing.weather_market_visible')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="bg-slate-950 py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="section-kicker text-emerald-200">
                {t('landing.nav_roles')}
              </p>
              <h2 className="section-title text-white">
                {t('landing.roles_title')}
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {roleCards.map(({ icon: Icon, titleKey, textKey }, index) => (
                <article
                  key={titleKey}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-black text-white/15">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-black">{t(titleKey)}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {t(textKey)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-white py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
            <div>
              <p className="section-kicker">{t('landing.nav_workflow')}</p>
              <h2 className="section-title">
                {t('landing.workflow_title')}
              </h2>
              <p className="section-copy">
                {t('landing.workflow_copy')}
              </p>
            </div>
            <div className="grid gap-4">
              {workflowSteps.map(([n, titleKey, textKey]) => (
                <div
                  key={n}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[auto_1fr]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-700 text-sm font-black text-white">
                    {n}
                  </span>
                  <div>
                    <p className="font-black">{t(titleKey)}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {t(textKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="deployment" className="bg-[#f7f9f5] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="section-kicker">{t('landing.nav_deployment')}</p>
                <h2 className="section-title">
                  {t('landing.deployment_title')}
                </h2>
              </div>
              <p className="section-copy max-w-3xl lg:justify-self-end">
                {t('landing.deployment_copy')}
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {deploymentNotes.map((noteKey) => (
                <div
                  key={noteKey}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {t(noteKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-5 py-16 text-center text-white lg:px-8">
          <div className="mx-auto max-w-3xl">
            <BarChart3 className="mx-auto h-10 w-10 text-emerald-300" />
            <h2 className="mt-5 font-display text-3xl font-black sm:text-4xl">
              {t('landing.cta_title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              {t('landing.cta_copy')}
            </p>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 font-black text-slate-950 hover:bg-emerald-50"
            >
              {t('landing.create_your_account')}{' '}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
