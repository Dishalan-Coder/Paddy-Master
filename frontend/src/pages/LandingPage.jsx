import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
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

const regionalDemand = [
  ['districts.Anuradhapura', 'landing.demand.high', '92%', 'bg-emerald-300'],
  ['districts.Polonnaruwa', 'landing.demand.stable', '67%', 'bg-sky-300'],
  ['districts.Batticaloa', 'landing.demand.rising', '75%', 'bg-amber-300'],
];

const orderPipeline = [
  ['landing.analytics.placed', '92%', 'bg-sky-500'],
  ['landing.analytics.confirmed', '75%', 'bg-emerald-600'],
  ['landing.analytics.delivered', '58%', 'bg-amber-500'],
];

// Crop-blade config for the signature waving-field divider between the dark hero and the
// white content below. Kept local so this page has no cross-file dependency; if the same
// motif is reused elsewhere (e.g. LoginForm/RegisterForm), consider lifting it into a
// shared components/common/CropField.jsx.
const CROP_BLADES = [
  { x: 2, h: 34, tilt: -6, sway: 8, dur: 3.4, delay: 0.0, color: '#34d399', row: 'front' },
  { x: 5.5, h: 24, tilt: 4, sway: 6, dur: 3.0, delay: 0.15, color: '#6ee7b7', row: 'back' },
  { x: 9, h: 38, tilt: -3, sway: 9, dur: 3.6, delay: 0.3, color: '#10b981', row: 'front' },
  { x: 12.5, h: 22, tilt: 6, sway: 5, dur: 2.8, delay: 0.45, color: '#a7f3d0', row: 'back' },
  { x: 16, h: 36, tilt: -5, sway: 8, dur: 3.3, delay: 0.6, color: '#34d399', row: 'front' },
  { x: 19.5, h: 26, tilt: 3, sway: 6, dur: 3.1, delay: 0.75, color: '#6ee7b7', row: 'back' },
  { x: 23, h: 40, tilt: -4, sway: 9, dur: 3.5, delay: 0.9, color: '#059669', row: 'front' },
  { x: 26.5, h: 23, tilt: 5, sway: 5, dur: 2.9, delay: 1.05, color: '#a7f3d0', row: 'back' },
  { x: 30, h: 33, tilt: -6, sway: 8, dur: 3.2, delay: 1.2, color: '#34d399', row: 'front' },
  { x: 33.5, h: 27, tilt: 4, sway: 6, dur: 3.0, delay: 1.35, color: '#6ee7b7', row: 'back' },
  { x: 37, h: 41, tilt: -3, sway: 9, dur: 3.6, delay: 1.5, color: '#10b981', row: 'front' },
  { x: 40.5, h: 22, tilt: 6, sway: 5, dur: 2.8, delay: 1.65, color: '#a7f3d0', row: 'back' },
  { x: 44, h: 35, tilt: -5, sway: 8, dur: 3.4, delay: 1.8, color: '#34d399', row: 'front' },
  { x: 47.5, h: 25, tilt: 3, sway: 6, dur: 3.1, delay: 1.95, color: '#6ee7b7', row: 'back' },
  { x: 51, h: 39, tilt: -4, sway: 9, dur: 3.5, delay: 2.1, color: '#059669', row: 'front' },
  { x: 54.5, h: 23, tilt: 5, sway: 5, dur: 2.9, delay: 2.25, color: '#a7f3d0', row: 'back' },
  { x: 58, h: 34, tilt: -6, sway: 8, dur: 3.3, delay: 2.4, color: '#34d399', row: 'front' },
  { x: 61.5, h: 27, tilt: 4, sway: 6, dur: 3.0, delay: 2.55, color: '#6ee7b7', row: 'back' },
  { x: 65, h: 40, tilt: -3, sway: 9, dur: 3.6, delay: 2.7, color: '#10b981', row: 'front' },
  { x: 68.5, h: 22, tilt: 6, sway: 5, dur: 2.8, delay: 2.85, color: '#a7f3d0', row: 'back' },
  { x: 72, h: 35, tilt: -5, sway: 8, dur: 3.2, delay: 3.0, color: '#34d399', row: 'front' },
  { x: 75.5, h: 26, tilt: 3, sway: 6, dur: 3.0, delay: 3.15, color: '#6ee7b7', row: 'back' },
  { x: 79, h: 40, tilt: -4, sway: 9, dur: 3.5, delay: 3.3, color: '#059669', row: 'front' },
  { x: 82.5, h: 23, tilt: 5, sway: 5, dur: 2.9, delay: 3.45, color: '#a7f3d0', row: 'back' },
  { x: 86, h: 34, tilt: -6, sway: 8, dur: 3.4, delay: 3.6, color: '#34d399', row: 'front' },
  { x: 89.5, h: 27, tilt: 4, sway: 6, dur: 3.0, delay: 3.75, color: '#6ee7b7', row: 'back' },
  { x: 93, h: 39, tilt: -3, sway: 9, dur: 3.6, delay: 3.9, color: '#10b981', row: 'front' },
  { x: 96.5, h: 22, tilt: 6, sway: 5, dur: 2.8, delay: 4.05, color: '#a7f3d0', row: 'back' },
];

// Scroll-reveal wrapper: fades + slides an element up the first time it enters the
// viewport, then leaves it alone. Self-contained (own IntersectionObserver) so it can
// wrap anything without lifting state.
function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={clsx('lp-reveal', visible && 'lp-reveal-visible', className)}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// A percentage bar that grows from 0 to its target width the first time it scrolls
// into view, instead of rendering at full width immediately.
function ProgressBar({ width, color, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={clsx('h-2 rounded-full transition-[width] duration-[1100ms] ease-out', color)}
        style={{ width: visible ? width : '0%', transitionDelay: `${delay}ms` }}
      />
    </div>
  );
}

function CropDivider() {
  return (
    <div className="lp-field relative h-24 w-full overflow-hidden bg-slate-950 sm:h-28" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/40 to-[#f7f9f5]" />
      <svg
        viewBox="0 0 100 44"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-full w-full"
      >
        {CROP_BLADES.map((b, i) => (
          <g
            key={i}
            className="lp-blade"
            style={{
              transformOrigin: `${b.x}px 44px`,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              '--sway': `${b.sway}deg`,
              opacity: b.row === 'back' ? 0.45 : 0.85,
            }}
          >
            <path
              d={`M ${b.x} 44 Q ${b.x + b.tilt * 0.3} ${44 - b.h * 0.55} ${b.x + b.tilt * 0.5} ${44 - b.h}`}
              stroke={b.color}
              strokeWidth={b.row === 'front' ? 0.9 : 0.65}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function SignalCard({ signal, t, delay }) {
  const Icon = signal.icon;

  return (
    <Reveal delay={delay} className={`min-w-0 rounded-lg border p-4 ${signal.className}`}>
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
    </Reveal>
  );
}

function HeroDashboardPreview({ className = '', t }) {
  return (
    <div
      className={`lp-enter lp-enter-preview w-full max-w-[calc(100vw-2.5rem)] rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:max-w-full ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 break-words text-xs font-bold uppercase tracking-normal text-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75 [animation-duration:2s]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
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
        {signalCards.map((signal, i) => (
          <SignalCard key={signal.labelKey} signal={signal} t={t} delay={i * 90} />
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
            {regionalDemand.map(([regionKey, statusKey, width, color], i) => (
              <div key={regionKey}>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                  <span className="min-w-0 break-words">{t(regionKey)}</span>
                  <span className="shrink-0">{t(statusKey)}</span>
                </div>
                <ProgressBar width={width} color={color} delay={i * 120} />
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
            ].map(([value, labelKey], i) => (
              <Reveal
                key={labelKey}
                delay={i * 90}
                className="rounded-md border border-white/10 bg-slate-950/40 px-3 py-4 text-center"
              >
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 break-words text-[11px] font-semibold leading-4 text-slate-400">
                  {t(labelKey)}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-white p-3 text-slate-900 transition-transform duration-300 hover:-translate-y-0.5">
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
            <a href="#platform" className="relative transition-colors hover:text-emerald-700 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-700 after:transition-all after:duration-300 hover:after:w-full">
              {t('landing.nav_platform')}
            </a>
            <a href="#roles" className="relative transition-colors hover:text-emerald-700 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-700 after:transition-all after:duration-300 hover:after:w-full">
              {t('landing.nav_roles')}
            </a>
            <a href="#workflow" className="relative transition-colors hover:text-emerald-700 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-700 after:transition-all after:duration-300 hover:after:w-full">
              {t('landing.nav_workflow')}
            </a>
            <a href="#deployment" className="relative transition-colors hover:text-emerald-700 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-700 after:transition-all after:duration-300 hover:after:w-full">
              {t('landing.nav_deployment')}
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle compact />
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 sm:inline-flex"
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md sm:px-4"
            >
              {t('landing.get_started')}{' '}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
          {/* Quiet drifting glow behind the hero content */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="lp-blob lp-blob-a absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="lp-blob lp-blob-b absolute right-10 top-1/3 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-73px)] w-full max-w-7xl items-center gap-10 px-5 py-16 lg:px-8 lg:py-20 xl:grid-cols-[minmax(0,1fr)_minmax(34rem,1fr)] xl:gap-14 xl:py-24">
            <div className="min-w-0 max-w-[calc(100vw-2.5rem)] sm:max-w-2xl xl:max-w-none">
              <div className="lp-enter lp-enter-1 mb-6 inline-flex max-w-full items-start gap-2 rounded-lg border border-emerald-300/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-normal text-emerald-100">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">
                  {t('landing.hero_badge')}
                </span>
              </div>
              <h1 className="lp-enter lp-enter-2 break-words font-display text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
                Paddy Master
              </h1>
              <p className="lp-enter lp-enter-3 mt-6 max-w-2xl break-words text-lg leading-8 text-slate-200">
                {t('landing.hero_copy')}
              </p>
              <div className="lp-enter lp-enter-4 mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="group inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:translate-y-0 sm:px-6"
                >
                  {t('landing.create_account')}{' '}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-w-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-5 py-3.5 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 sm:px-6"
                >
                  {t('landing.open_dashboard')}
                </Link>
              </div>

              <div className="lp-enter lp-enter-5 mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {heroMetrics.map(([value, label]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-lg border border-white/10 bg-white/[0.07] p-4 transition-colors duration-300 hover:bg-white/[0.1]"
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

        {/* Signature waving-field divider: bridges the dark hero into the light content below */}
        <CropDivider />

        <section id="platform" className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <Reveal>
                <p className="section-kicker">{t('landing.nav_platform')}</p>
                <h2 className="section-title">
                  {t('landing.platform_title')}
                </h2>
              </Reveal>
              <Reveal delay={100} className="section-copy max-w-3xl lg:justify-self-end">
                {t('landing.platform_copy')}
              </Reveal>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, titleKey, textKey }, i) => (
                <Reveal
                  key={titleKey}
                  delay={i * 80}
                  as="article"
                  className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t(textKey)}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eef4f6] py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
            <Reveal>
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
                ].map((item, i) => (
                  <Reveal
                    key={item}
                    delay={150 + i * 80}
                    className="flex gap-3 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <span>{t(item)}</span>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            <Reveal
              delay={120}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-300/30 transition-transform duration-500 hover:-translate-y-1"
            >
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
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 hover:bg-emerald-50/60"
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
                    {orderPipeline.map(([labelKey, width, color], i) => (
                      <div key={labelKey}>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>{t(labelKey)}</span>
                          <span>{width}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                          <ProgressBar width={width} color={color} delay={i * 120} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-700 p-4 text-white transition-transform duration-300 hover:-translate-y-0.5">
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
            </Reveal>
          </div>
        </section>

        <section id="roles" className="bg-slate-950 py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-2xl">
              <p className="section-kicker text-emerald-200">
                {t('landing.nav_roles')}
              </p>
              <h2 className="section-title text-white">
                {t('landing.roles_title')}
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {roleCards.map(({ icon: Icon, titleKey, textKey }, index) => (
                <Reveal
                  key={titleKey}
                  delay={index * 100}
                  as="article"
                  className="group rounded-lg border border-white/10 bg-white/[0.06] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-white/[0.09]"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-slate-950 transition-transform duration-300 group-hover:scale-110">
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-white py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
            <Reveal>
              <p className="section-kicker">{t('landing.nav_workflow')}</p>
              <h2 className="section-title">
                {t('landing.workflow_title')}
              </h2>
              <p className="section-copy">
                {t('landing.workflow_copy')}
              </p>
            </Reveal>
            <div className="grid gap-4">
              {workflowSteps.map(([n, titleKey, textKey], i) => (
                <Reveal
                  key={n}
                  delay={i * 90}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:grid-cols-[auto_1fr]"
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="deployment" className="bg-[#f7f9f5] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <Reveal>
                <p className="section-kicker">{t('landing.nav_deployment')}</p>
                <h2 className="section-title">
                  {t('landing.deployment_title')}
                </h2>
              </Reveal>
              <Reveal delay={100} className="section-copy max-w-3xl lg:justify-self-end">
                {t('landing.deployment_copy')}
              </Reveal>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {deploymentNotes.map((noteKey, i) => (
                <Reveal
                  key={noteKey}
                  delay={i * 60}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {t(noteKey)}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-5 py-16 text-center text-white lg:px-8">
          <Reveal className="mx-auto max-w-3xl">
            <div className="lp-cta-icon mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-300/10">
              <BarChart3 className="h-8 w-8 text-emerald-300" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-black sm:text-4xl">
              {t('landing.cta_title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              {t('landing.cta_copy')}
            </p>
            <Link
              to="/register"
              className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-lg"
            >
              {t('landing.create_your_account')}{' '}
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />

      <style>{`
        @keyframes lpFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lpFadeInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes lpFloatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(16px, 20px) scale(1.08); }
        }
        @keyframes lpFloatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-18px, -14px) scale(1.06); }
        }
        @keyframes lpSway {
          0%, 100% { transform: rotate(calc(var(--sway) * -1)); }
          50% { transform: rotate(var(--sway)); }
        }
        @keyframes lpPulseSoft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }

        .lp-enter {
          opacity: 0;
          animation: lpFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .lp-enter-1 { animation-delay: 0.02s; }
        .lp-enter-2 { animation-delay: 0.10s; }
        .lp-enter-3 { animation-delay: 0.18s; }
        .lp-enter-4 { animation-delay: 0.26s; }
        .lp-enter-5 { animation-delay: 0.34s; }
        .lp-enter-preview {
          animation: lpFadeInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }

        .lp-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .lp-blob { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .lp-blob-a { animation-name: lpFloatA; animation-duration: 12s; }
        .lp-blob-b { animation-name: lpFloatB; animation-duration: 14s; }

        .lp-blade {
          animation-name: lpSway;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .lp-cta-icon {
          animation: lpPulseSoft 3.2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-enter, .lp-reveal, .lp-blob, .lp-blade, .lp-cta-icon, [class*="animate-"] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}