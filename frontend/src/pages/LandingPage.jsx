import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CloudSun,
  Languages,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import Footer from '../components/common/Footer';

const features = [
  {
    icon: Sprout,
    title: 'Smart crop tracking',
    text: 'Track planting, growth stages, harvest dates, expenses, and field activity in one place.',
  },
  {
    icon: CloudSun,
    title: 'Weather intelligence',
    text: 'See current conditions and practical rain, flood, drought, pest, and disease alerts.',
  },
  {
    icon: ShoppingBag,
    title: 'Direct paddy marketplace',
    text: 'Verified farmers list harvests and buyers order with clear quantities and transparent pricing.',
  },
  {
    icon: TrendingUp,
    title: 'Market price insights',
    text: 'Compare paddy prices by region and use trend data to choose a better selling time.',
  },
  {
    icon: WalletCards,
    title: 'Basic payment workflow',
    text: 'Record cash on delivery, bank transfer, or a local demo card payment for testing.',
  },
  {
    icon: Languages,
    title: 'English and Tamil',
    text: 'Switch the operating interface between English and Tamil from the top navigation.',
  },
];

const metrics = [
  ['3', 'Role-based portals'],
  ['25', 'Sri Lankan districts'],
  ['24/7', 'Farm records access'],
  ['1', 'Connected marketplace'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f8f3] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#f6f8f3]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center hover:opacity-90">
            <BrandLogo size="sm" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="hover:text-emerald-700">
              Features
            </a>
            <a href="#roles" className="hover:text-emerald-700">
              For everyone
            </a>
            <a href="#workflow" className="hover:text-emerald-700">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 hover:bg-emerald-800"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="landing-grid absolute inset-0 opacity-40" />
          <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-lime-200/50 blur-3xl" />
          <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm">
                <BadgeCheck className="h-4 w-4" /> Smart paddy management
                platform
              </div>
              <h1 className="font-display text-5xl font-black leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                Better field decisions.{' '}
                <span className="text-emerald-700">
                  Better market outcomes.
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                One professional system for paddy farmers, buyers, and
                administrators—covering field records, alerts, prices, direct
                sales, orders, payments, and trust.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 font-bold text-white shadow-xl shadow-emerald-900/20 hover:bg-emerald-800"
                >
                  Start using Paddy Master <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm hover:border-emerald-300"
                >
                  Open dashboard
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {metrics.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-2xl font-black text-emerald-800">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl self-center">
              <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-4 shadow-2xl shadow-emerald-950/25">
                <div className="rounded-[1.5rem] bg-[#f8faf6] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                        Farmer overview
                      </p>
                      <p className="mt-1 text-xl font-black">
                        Good morning, Arul
                      </p>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Sprout className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-700 p-4 text-white">
                      <p className="text-xs text-emerald-100">Active crops</p>
                      <p className="mt-2 text-3xl font-black">06</p>
                    </div>
                    <div className="rounded-2xl bg-amber-100 p-4 text-amber-950">
                      <p className="text-xs text-amber-700">Harvest due</p>
                      <p className="mt-2 text-3xl font-black">12d</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">Today’s smart alerts</p>
                      <BellRing className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="rounded-xl bg-blue-50 px-3 py-2">
                        Irrigate the Samba field before 5:30 PM.
                      </p>
                      <p className="rounded-xl bg-amber-50 px-3 py-2">
                        High humidity: inspect for fungal symptoms.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-[1.2fr_0.8fr] gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">Market price</p>
                      <p className="mt-1 text-2xl font-black text-emerald-700">
                        Rs. 118/kg
                      </p>
                      <div className="mt-3 h-10 rounded-lg bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-600" />
                    </div>
                    <div className="rounded-2xl bg-slate-900 p-4 text-white">
                      <CloudSun className="h-5 w-5 text-amber-300" />
                      <p className="mt-5 text-3xl font-black">30°</p>
                      <p className="text-xs text-slate-300">Partly cloudy</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-700" />
                  <div>
                    <p className="text-sm font-black">Verified marketplace</p>
                    <p className="text-xs text-slate-500">
                      Profiles, orders, and reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="section-kicker">Main features</p>
            <h2 className="section-title">The MVP farmers can actually use</h2>
            <p className="section-copy">
              Each module is connected to the same account, database, and
              role-based workflow.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-700 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roles" className="bg-slate-950 py-24 text-white">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="section-kicker text-lime-300">
                Three connected roles
              </p>
              <h2 className="section-title text-white">
                One platform, clear responsibility
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {[
                [
                  Sprout,
                  'Paddy farmer',
                  'Manage farms, crops, expenses, recommendations, listings, sales, and order fulfilment.',
                ],
                [
                  ShoppingBag,
                  'Buyer',
                  'Search verified listings, compare prices, place orders, pay, follow delivery, and review purchases.',
                ],
                [
                  Users,
                  'Administrator',
                  'Verify users, supervise listings and orders, update market prices, and monitor platform analytics.',
                ],
              ].map(([Icon, title, text], index) => (
                <article
                  key={title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-300 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-4xl font-black text-white/10">
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

        <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="section-kicker">Connected workflow</p>
              <h2 className="section-title">
                From planting date to paid order
              </h2>
              <p className="section-copy">
                Farm records feed decisions. Harvest becomes a listing. A buyer
                orders. Both sides receive status updates until delivery.
              </p>
            </div>
            <div className="space-y-4">
              {[
                [
                  '01',
                  'Record the field',
                  'Add farm details, variety, planting date, area, and expected harvest.',
                ],
                [
                  '02',
                  'Act on alerts',
                  'Use weather, reminders, and stage-based recommendations to reduce crop loss.',
                ],
                [
                  '03',
                  'List the harvest',
                  'Upload pictures to S3 or local storage, set quantity, region, and price.',
                ],
                [
                  '04',
                  'Complete the sale',
                  'Buyer places an order, selects payment, and follows delivery status.',
                ],
              ].map(([n, title, text]) => (
                <div
                  key={n}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-700 text-sm font-black text-white">
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

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-br from-emerald-700 to-emerald-950 px-7 py-12 text-center text-white shadow-2xl shadow-emerald-900/20 sm:px-12">
            <BarChart3 className="mx-auto h-10 w-10 text-lime-300" />
            <h2 className="mt-5 font-display text-3xl font-black sm:text-4xl">
              Build a more transparent paddy economy
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
              Create a farmer or buyer account, or use the included admin setup
              command to operate the platform.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-black text-emerald-800 hover:bg-lime-50"
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
