import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CloudSun,
  DollarSign,
  Landmark,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
  Sparkles,
  Sprout,
  Store,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const farmerLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/farms', icon: Landmark, label: 'farms' },
  { to: '/crops', icon: Sprout, label: 'crops' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
  { to: '/recommendations', icon: Sparkles, label: 'recommendations' },
  { to: '/marketplace', icon: Store, label: 'marketplace' },
  { to: '/orders', icon: ShoppingCart, label: 'orders' },
  { to: '/prices-weather', icon: CloudSun, label: 'prices_weather' },
  { to: '/notifications', icon: Bell, label: 'notifications' },
  { to: '/profile', icon: UserRound, label: 'profile' },
];
const buyerLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/marketplace', icon: Store, label: 'marketplace' },
  { to: '/orders', icon: ShoppingCart, label: 'orders' },
  { to: '/prices-weather', icon: CloudSun, label: 'prices_weather' },
  { to: '/notifications', icon: Bell, label: 'notifications' },
  { to: '/profile', icon: UserRound, label: 'profile' },
];
const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'admin' },
  { to: '/admin/users', icon: Users, label: 'users' },
  { to: '/admin/products', icon: Package, label: 'products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'orders' },
  { to: '/admin/prices', icon: DollarSign, label: 'market_prices' },
  { to: '/notifications', icon: Bell, label: 'notifications' },
  { to: '/profile', icon: UserRound, label: 'profile' },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'buyer'
        ? buyerLinks
        : farmerLinks;
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-[#10291f] shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:static lg:z-auto lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <BrandLogo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400/70">
            Workspace
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <link.icon className="h-5 w-5 shrink-0" />
              <span>
                {t(link.label, { defaultValue: link.label.replace('_', ' ') })}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-emerald-600 text-sm font-black text-white">
              {user?.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {user?.full_name}
              </p>
              <p className="text-xs capitalize text-emerald-200/60">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
