import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import BrandLogo from './BrandLogo';
import Button from './Button';
import LanguageToggle from './LanguageToggle';

const toneClasses = {
  emerald: {
    panel: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    icon: 'text-emerald-700',
    accent: 'bg-emerald-700',
  },
  amber: {
    panel: 'border-amber-100 bg-amber-50 text-amber-800',
    icon: 'text-amber-700',
    accent: 'bg-amber-500',
  },
  red: {
    panel: 'border-red-100 bg-red-50 text-red-700',
    icon: 'text-red-600',
    accent: 'bg-red-500',
  },
};

export default function StatusPage({
  actions = true,
  children,
  description,
  details = [],
  eyebrow,
  icon: Icon,
  onRetry,
  primaryHref,
  primaryLabel,
  secondaryHref = '/',
  secondaryLabel,
  showSpinner = false,
  tone = 'emerald',
  title,
}) {
  const { t } = useTranslation();
  const palette = toneClasses[tone] || toneClasses.emerald;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f5f7f2] text-slate-900">
      <div className="landing-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-700 via-amber-400 to-lime-600" />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="inline-flex items-center hover:opacity-90">
          <BrandLogo size="sm" />
        </Link>
        <LanguageToggle compact />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10">
        <section className="w-full max-w-3xl rounded-[1.75rem] border border-white/80 bg-white/95 p-6 text-center shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-10">
          <div
            className={clsx(
              'mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border',
              palette.panel,
            )}
          >
            {showSpinner ? (
              <span
                className={clsx(
                  'h-10 w-10 rounded-full border-4 border-current border-t-transparent',
                  palette.icon,
                  'animate-spin',
                )}
                aria-hidden="true"
              />
            ) : Icon ? (
              <Icon className={clsx('h-10 w-10', palette.icon)} />
            ) : null}
          </div>

          {eyebrow ? <p className="page-kicker mt-7">{eyebrow}</p> : null}
          <h1 className="mt-3 break-words font-display text-4xl font-black text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {description}
          </p>

          {details.length ? (
            <dl className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {details.map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-[11px] font-black uppercase text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-black text-slate-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {children}

          {actions ? (
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {onRetry ? (
                <Button type="button" onClick={onRetry} icon={RefreshCcw}>
                  {primaryLabel || t('common.try_again')}
                </Button>
              ) : primaryHref ? (
                <Link to={primaryHref} className="btn-primary">
                  {primaryLabel}
                </Link>
              ) : null}
              {secondaryHref ? (
                <Link
                  to={secondaryHref}
                  className="btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {secondaryLabel || t('common.back_to_home')}
                </Link>
              ) : null}
            </div>
          ) : null}

          <span
            className={clsx(
              'mx-auto mt-8 block h-1 w-24 rounded-full',
              palette.accent,
            )}
          />
        </section>
      </main>
    </div>
  );
}
