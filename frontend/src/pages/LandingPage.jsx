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

const capabilities = [
  {
    icon: ClipboardList,
    title: 'Operational farm records',
    text: 'Maintain farms, crop cycles, growth stages, harvest dates, expenses, and field activity from one role-aware workspace.',
  },
  {
    icon: CloudSun,
    title: 'Weather and advisory signals',
    text: 'Give farmers practical visibility into weather, risk alerts, and crop-care recommendations tied to their operating data.',
  },
  {
    icon: ShoppingBag,
    title: 'Verified paddy marketplace',
    text: 'Let farmers publish harvest listings while buyers compare products, quantities, regional pricing, and seller profiles.',
  },
  {
    icon: PackageCheck,
    title: 'Order fulfilment workflow',
    text: 'Track buyer orders, farmer updates, delivery status, payment state, reviews, and notifications through the same platform.',
  },
  {
    icon: TrendingUp,
    title: 'Market price intelligence',
    text: 'Publish daily and regional paddy rates so buyers and farmers can make clearer pricing and timing decisions.',
  },
  {
    icon: Languages,
    title: 'Tamil and English interface',
    text: 'Support local usage with bilingual navigation and operating screens for farmers, buyers, and administrators.',
  },
];

const heroMetrics = [
  ['3', 'Role portals'],
  ['50', 'API operations'],
  ['25', 'District-ready data'],
  ['S3', 'Private media option'],
];

const signalCards = [
  {
    label: 'Market rate',
    value: 'Rs. 118/kg',
    detail: 'Ampara Samba trend',
    icon: TrendingUp,
    className: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100',
  },
  {
    label: 'Field alert',
    value: 'Irrigation due',
    detail: 'North block before 5:30 PM',
    icon: BellRing,
    className: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
  },
  {
    label: 'Open order',
    value: '2,400 kg',
    detail: 'Buyer pickup scheduled',
    icon: PackageCheck,
    className: 'border-sky-300/20 bg-sky-400/10 text-sky-100',
  },
];

const roleCards = [
  {
    icon: Sprout,
    title: 'Paddy farmers',
    text: 'Run crop planning, expense tracking, recommendations, listings, incoming orders, and profile updates.',
  },
  {
    icon: ShoppingBag,
    title: 'Buyers',
    text: 'Find verified harvests, compare price and quality signals, place orders, pay, and leave reviews.',
  },
  {
    icon: Users,
    title: 'Administrators',
    text: 'Verify users, moderate products, monitor orders, manage market prices, and review platform analytics.',
  },
];

const workflowSteps = [
  [
    '01',
    'Prepare the field record',
    'Create farms, add crop details, track growth stages, and keep expenses tied to each season.',
  ],
  [
    '02',
    'Respond to field signals',
    'Use weather, price, recommendation, and notification data to decide when to irrigate, treat, harvest, or list.',
  ],
  [
    '03',
    'Publish the harvest',
    'Create a marketplace listing with quantity, district, price, media, and availability for buyers to evaluate.',
  ],
  [
    '04',
    'Close the order',
    'Move orders through payment, fulfilment, delivery, review, and administrative visibility.',
  ],
];

const deploymentNotes = [
  'Dockerized React, Nginx, FastAPI, and MongoDB services',
  'Same-origin API proxy for production frontend deployments',
  'Restricted CORS configuration through environment variables',
  'Private S3 media storage path with local fallback for development',
  'Health checks, static asset caching, and security headers',
  'Clear production checklist for secrets, payments, monitoring, and backups',
];

function SignalCard({ signal }) {
  const Icon = signal.icon;

  return (
    <div className={`rounded-lg border p-4 ${signal.className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-normal opacity-75">
          {signal.label}
        </p>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <p className="mt-3 text-2xl font-black leading-tight">{signal.value}</p>
      <p className="mt-1 text-xs opacity-70">{signal.detail}</p>
    </div>
  );
}

function HeroDashboardPreview({ className = '' }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-emerald-200">
            Operations command
          </p>
          <p className="mt-1 text-lg font-black text-white">
            Today across the network
          </p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-300 text-slate-950">
          <Sprout className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {signalCards.map((signal) => (
          <SignalCard key={signal.label} signal={signal} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white">Regional demand</p>
            <MapPin className="h-4 w-4 text-sky-200" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              ['Anuradhapura', 'High', 'w-11/12', 'bg-emerald-300'],
              ['Polonnaruwa', 'Stable', 'w-8/12', 'bg-sky-300'],
              ['Batticaloa', 'Rising', 'w-9/12', 'bg-amber-300'],
            ].map(([region, status, width, color]) => (
              <div key={region}>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{region}</span>
                  <span>{status}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${color} ${width}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-black text-white">Crop portfolio</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ['06', 'Active'],
              ['12d', 'Harvest'],
              ['94%', 'Verified'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-md border border-white/10 bg-slate-950/40 px-3 py-4 text-center"
              >
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-white p-3 text-slate-900">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="text-sm font-black">Verified trade profile</p>
                <p className="text-xs text-slate-500">
                  Orders, reviews, and fulfilment history
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
  return (
    <div className="min-h-screen bg-[#f7f9f5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center hover:opacity-90">
            <BrandLogo size="sm" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#platform" className="hover:text-emerald-700">
              Platform
            </a>
            <a href="#roles" className="hover:text-emerald-700">
              Roles
            </a>
            <a href="#workflow" className="hover:text-emerald-700">
              Workflow
            </a>
            <a href="#deployment" className="hover:text-emerald-700">
              Deployment
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              Get started <ArrowRight className="h-4 w-4" />
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
          <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
            <HeroDashboardPreview className="absolute right-[max(2rem,calc((100vw-80rem)/2))] top-20 w-[min(38rem,46vw)]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-73px)] max-w-7xl flex-col justify-center px-5 py-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-normal text-emerald-100">
                <BadgeCheck className="h-4 w-4" />
                Production-ready farm and market operations
              </div>
              <h1 className="font-display text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
                Paddy Master
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                A professional web platform for paddy farmers, buyers, and
                administrators to manage crop records, market pricing, harvest
                listings, orders, notifications, and operational visibility.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-950/30 hover:bg-emerald-400"
                >
                  Create account <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-white/15 bg-white/10 px-6 py-3.5 font-bold text-white hover:bg-white/15"
                >
                  Open dashboard
                </Link>
              </div>

              <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {heroMetrics.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/10 bg-white/[0.07] p-4"
                  >
                    <p className="text-2xl font-black text-emerald-200">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <HeroDashboardPreview className="mt-10 lg:hidden" />
          </div>
        </section>

        <section id="platform" className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="section-kicker">Platform</p>
                <h2 className="section-title">
                  Built for the full paddy operating cycle
                </h2>
              </div>
              <p className="section-copy max-w-3xl lg:justify-self-end">
                Paddy Master brings field data, buyer demand, market prices, and
                administrative control into one deployable product surface.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eef4f6] py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
            <div>
              <p className="section-kicker">Product Surface</p>
              <h2 className="section-title">
                A dashboard experience ready for daily operation
              </h2>
              <p className="section-copy">
                The application is organized around repeatable workflows:
                records, decisions, trade, fulfilment, and oversight.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  'Role-protected navigation for farmers, buyers, and administrators',
                  'Production build served by Nginx with same-origin API routes',
                  'Shared notifications, profiles, orders, reviews, and market data',
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-300/30">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-emerald-200">
                    Admin analytics
                  </p>
                  <p className="mt-1 font-black">Platform overview</p>
                </div>
                <BarChart3 className="h-5 w-5 text-amber-300" />
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {[
                  ['Verified users', '1,248', 'Farmers and buyers'],
                  ['Active listings', '316', 'Harvests available'],
                  ['Open orders', '84', 'Across marketplace'],
                  ['Daily alerts', '27', 'Weather and fulfilment'],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 border-t border-slate-200 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-black">Order pipeline</p>
                    <WalletCards className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Placed', 'w-11/12', 'bg-sky-500'],
                      ['Confirmed', 'w-9/12', 'bg-emerald-600'],
                      ['Delivered', 'w-7/12', 'bg-amber-500'],
                    ].map(([label, width, color]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>{label}</span>
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
                  <p className="text-sm text-emerald-100">Partly cloudy</p>
                  <p className="mt-4 text-xs leading-5 text-emerald-50">
                    Weather and market signals stay visible beside marketplace
                    operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="bg-slate-950 py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="section-kicker text-emerald-200">Roles</p>
              <h2 className="section-title text-white">
                Clear permissions for every participant
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {roleCards.map(({ icon: Icon, title, text }, index) => (
                <article
                  key={title}
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
                  <h3 className="mt-6 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-white py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
            <div>
              <p className="section-kicker">Workflow</p>
              <h2 className="section-title">
                From field record to fulfilled order
              </h2>
              <p className="section-copy">
                Every module supports the next operational decision, so the
                system works as one product instead of disconnected screens.
              </p>
            </div>
            <div className="grid gap-4">
              {workflowSteps.map(([n, title, text]) => (
                <div
                  key={n}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[auto_1fr]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-700 text-sm font-black text-white">
                    {n}
                  </span>
                  <div>
                    <p className="font-black">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {text}
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
                <p className="section-kicker">Deployment</p>
                <h2 className="section-title">
                  Production foundations are included
                </h2>
              </div>
              <p className="section-copy max-w-3xl lg:justify-self-end">
                The repository now includes a deploy-focused path for the web
                surface, API proxying, environment separation, and operational
                hardening. Stripe subscriptions are available for account
                billing, while order card payments remain a local demo flow.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {deploymentNotes.map((note) => (
                <div
                  key={note}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {note}
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
              Launch a more transparent paddy marketplace
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Create a farmer or buyer account, or sign in as an administrator
              after configuring your production environment.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 font-black text-slate-950 hover:bg-emerald-50"
            >
              Create your account <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
