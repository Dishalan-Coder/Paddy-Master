import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Globe, LogOut, Menu, Search, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import NotificationPanel from '../notifications/NotificationPanel';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({ notifications: [], unread_count: 0 });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [search, setSearch] = useState('');
  const mounted = useRef(true);

  const loadNotifications = async () => {
    setNotificationLoading(true);
    try { const data = await notificationService.getAll({ limit: 12 }); if (mounted.current) setNotificationData(data); }
    catch { /* Notification failure must not block navigation. */ }
    finally { if (mounted.current) setNotificationLoading(false); }
  };
  useEffect(() => { mounted.current = true; loadNotifications(); return () => { mounted.current = false; }; }, []);
  const markRead = async (id) => { await notificationService.markRead(id); loadNotifications(); };
  const markAll = async () => { await notificationService.markAllRead(); loadNotifications(); };
  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/marketplace?search=${encodeURIComponent(query)}` : '/marketplace');
    setSearch('');
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  return <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:px-7">
    <div className="flex items-center gap-3">
      <button type="button" onClick={onToggleSidebar} className="rounded-xl p-2 hover:bg-slate-100 lg:hidden">{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      <form onSubmit={submitSearch} className="hidden w-72 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex">
        <Search className="mr-2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`${t('search')} marketplace...`}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          aria-label="Search marketplace"
        />
      </form>
    </div>
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')} className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 hover:bg-emerald-100"><Globe className="h-4 w-4" />{i18n.language === 'en' ? 'தமிழ்' : 'EN'}</button>
      <div className="relative"><button type="button" onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); if (!notificationsOpen) loadNotifications(); }} className="relative rounded-xl p-2.5 hover:bg-slate-100"><Bell className="h-5 w-5 text-slate-600" />{!!notificationData.unread_count && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{notificationData.unread_count > 9 ? '9+' : notificationData.unread_count}</span>}</button>{notificationsOpen && <><button type="button" aria-label="Close notifications" className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} /><div className="absolute right-0 z-50 mt-2 w-[min(26rem,calc(100vw-2rem))]"><NotificationPanel data={notificationData} loading={notificationLoading} onMarkRead={markRead} onMarkAll={markAll} /></div></>}</div>
      <div className="relative"><button type="button" onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100"><div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-emerald-700 text-sm font-black text-white">{user?.profile_image_url ? <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" /> : user?.full_name?.charAt(0) || 'U'}</div><div className="hidden text-left md:block"><p className="max-w-32 truncate text-sm font-black text-slate-700">{user?.full_name}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{user?.role}</p></div><ChevronDown className="h-4 w-4 text-slate-400" /></button>{profileOpen && <><button type="button" aria-label="Close profile menu" className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} /><div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"><button type="button" onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserRound className="h-4 w-4" />My profile</button><button type="button" onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />{t('logout')}</button></div></>}</div>
    </div>
  </header>;
}
