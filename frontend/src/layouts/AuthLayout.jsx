import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, CloudSun, ShoppingBag, Sprout, TrendingUp } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import Footer from '../components/common/Footer';
import LanguageToggle from '../components/common/LanguageToggle';
import PaddyFieldHero from '../components/common/PaddyFieldHero';

const authFeatures = [
  [Sprout, 'auth_layout.features.crop_management'],
  [CloudSun, 'auth_layout.features.weather_alerts'],
  [TrendingUp, 'auth_layout.features.price_insights'],
  [ShoppingBag, 'auth_layout.features.direct_marketplace'],
];

export default function AuthLayout({ children }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f4f7f1] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <style>{`
        @keyframes auth-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-feature-card { opacity: 0; animation: auth-fade-up 0.5s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .auth-feature-card { opacity: 1; animation: none; }
        }
      `}</style>

      <section className="relative hidden overflow-hidden bg-gradient-to-b from-[#0d3b2e] to-slate-950 text-white lg:flex lg:flex-col">
        <PaddyFieldHero className="h-56 w-full xl:h-64" />

        <Link
          to="/"
          className="absolute left-8 top-6 z-10 inline-flex w-fit items-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-90"
        >
          <BrandLogo size="md" />
        </Link>

        <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-12 pt-8">
          <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-lime-300/10 blur-[100px]" />
          <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-[100px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          <div className="relative max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300" />
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
                {t('auth_layout.kicker')}
              </p>
            </div>

            <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white">
              {t('auth_layout.title')}
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-emerald-100/90">
              {t('auth_layout.subtitle')}
            </p>

            <div className="mt-9 grid grid-cols-2 gap-3">
              {authFeatures.map(([Icon, key], i) => (
                <div
                  key={key}
                  className="auth-feature-card group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-300/30 hover:bg-white/[0.1]"
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-300/15 transition-colors group-hover:bg-lime-300/25">
                    <Icon className="h-4.5 w-4.5 text-lime-300" />
                  </span>
                  <span className="text-sm font-bold text-white/90">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-emerald-100/60">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-7 w-7 rounded-full border-2 border-emerald-900 bg-gradient-to-br from-lime-300 to-emerald-500" />
              ))}
            </div>
            <span className="font-semibold">
              {t('auth_layout.social_proof', 'Trusted by farmers across the region')}
            </span>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col items-center justify-between px-4 py-8 sm:px-8">
        <LanguageToggle className="absolute right-5 top-5" compact />
        <Link
          to="/"
          className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-white lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> {t('auth_layout.back_home')}
        </Link>
        <div className="flex w-full flex-1 items-center justify-center py-10">{children}</div>
        <Footer variant="auth" />
      </section>
    </div>
  );
}