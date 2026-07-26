import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

const year = new Date().getFullYear();

export default function Footer({ variant = 'public', className = '' }) {
  if (variant === 'app') {
    return (
      <footer className={clsx('border-t border-slate-200/80 pt-5 text-sm text-slate-500', className)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center hover:opacity-90">
            <BrandLogo size="xs" />
          </Link>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
            <span>Smart farm records</span>
            <span>Marketplace orders</span>
            <span>Weather and prices</span>
          </div>
          <p className="text-xs">&copy; {year} Paddy Master</p>
        </div>
      </footer>
    );
  }

  if (variant === 'auth') {
    return (
      <footer className={clsx('w-full max-w-md pt-8 text-center text-xs font-semibold text-slate-400', className)}>
        <p>&copy; {year} Paddy Master. Smart farm and marketplace system.</p>
      </footer>
    );
  }

  return (
    <footer className={clsx('border-t border-slate-200 bg-white', className)}>
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 text-sm text-slate-500 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <BrandLogo size="sm" />
          </Link>
          <p className="mt-4 max-w-xl leading-6">
            Crop records, weather intelligence, marketplace orders, payments, and admin controls for a more transparent paddy workflow.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-700">Features</a>
            <a href="#roles" className="hover:text-emerald-700">For everyone</a>
            <a href="#workflow" className="hover:text-emerald-700">How it works</a>
            <Link to="/login" className="hover:text-emerald-700">Log in</Link>
          </nav>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            &copy; {year} Paddy Master. React / FastAPI / MongoDB / S3-ready.
          </p>
        </div>
      </div>
    </footer>
  );
}
