import { Link } from 'react-router-dom';
import { ArrowLeft, CloudSun, Leaf, ShoppingBag, Sprout, TrendingUp } from 'lucide-react';
import Footer from '../components/common/Footer';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f7f1] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 text-emerald-950"><Leaf className="h-5 w-5" /></span><div><p className="font-display text-xl font-black">Paddy Master</p><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Farm to Market</p></div></Link>
        <div className="relative max-w-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">Smart agriculture workspace</p><h1 className="mt-4 font-display text-5xl font-black leading-tight tracking-tight">Every paddy decision, connected.</h1><p className="mt-5 text-base leading-7 text-emerald-100">Manage crops and expenses, act on weather alerts, compare market prices, and complete direct farmer-to-buyer orders.</p><div className="mt-8 grid grid-cols-2 gap-3">{[[Sprout, 'Crop management'], [CloudSun, 'Weather alerts'], [TrendingUp, 'Price insights'], [ShoppingBag, 'Direct marketplace']].map(([Icon, text]) => <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><Icon className="h-5 w-5 text-lime-300" /><span className="text-sm font-bold">{text}</span></div>)}</div></div>
        <p className="relative text-xs text-emerald-200/60">React · FastAPI · MongoDB · S3-ready image storage</p>
      </section>
      <section className="relative flex min-h-screen flex-col items-center justify-between px-4 py-8 sm:px-8">
        <Link to="/" className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-white lg:hidden"><ArrowLeft className="h-4 w-4" /> Home</Link>
        <div className="flex w-full flex-1 items-center justify-center py-10">{children}</div>
        <Footer variant="auth" />
      </section>
    </div>
  );
}
