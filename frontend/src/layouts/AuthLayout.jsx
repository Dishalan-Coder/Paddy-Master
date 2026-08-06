import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CloudSun,
  ShoppingBag,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import Footer from '../components/common/Footer';
import LanguageToggle from '../components/common/LanguageToggle';

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
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
        <Link
          to="/"
          className="relative inline-flex items-center hover:opacity-90"
        >
          <BrandLogo size="md" />
        </Link>
        <div className="relative max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
            {t('auth_layout.kicker')}
          </p>
          <h1 className="mt-4 font-display text-5xl font-black leading-tight tracking-tight">
            {t('auth_layout.title')}
          </h1>
          <p className="mt-5 text-base leading-7 text-emerald-100">
            {t('auth_layout.subtitle')}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {authFeatures.map(([Icon, key]) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <Icon className="h-5 w-5 text-lime-300" />
                <span className="text-sm font-bold">{t(key)}</span>
              </div>
            ))}
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
        <div className="flex w-full flex-1 items-center justify-center py-10">
          {children}
        </div>
        <Footer variant="auth" />
      </section>
    </div>
  );
}
