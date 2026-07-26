import {
  Bell,
  CheckCheck,
  CloudRain,
  CreditCard,
  PackageCheck,
  Sprout,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatters';

const icons = {
  order: PackageCheck,
  payment: CreditCard,
  weather: CloudRain,
  crop: Sprout,
  reminder: Bell,
};

export default function NotificationPanel({
  data,
  loading,
  onMarkRead,
  onMarkAll,
}) {
  const items = data?.notifications || [];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="font-black text-slate-900">Notifications</p>
          <p className="text-xs text-slate-500">
            {data?.unread_count || 0} unread
          </p>
        </div>
        {!!data?.unread_count && (
          <button
            type="button"
            onClick={onMarkAll}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700"
          >
            <CheckCheck className="h-4 w-4" /> Read all
          </button>
        )}
      </div>
      <div className="max-h-[28rem] overflow-y-auto">
        {loading && (
          <p className="p-6 text-center text-sm text-slate-400">
            Loading notifications…
          </p>
        )}
        {!loading && !items.length && (
          <p className="p-8 text-center text-sm text-slate-400">
            No notifications yet.
          </p>
        )}
        {items.map((item) => {
          const Icon = icons[item.type] || Bell;
          const body = (
            <div
              className={`flex gap-3 border-b border-slate-100 p-4 transition hover:bg-slate-50 ${item.is_read ? '' : 'bg-emerald-50/60'}`}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.is_read ? 'bg-slate-100 text-slate-500' : 'bg-emerald-700 text-white'}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-black text-slate-800">
                    {item.title}
                  </p>
                  {!item.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.message}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </div>
          );
          if (item.action_url)
            return (
              <Link
                key={item._id}
                to={item.action_url}
                onClick={() => !item.is_read && onMarkRead?.(item._id)}
              >
                {body}
              </Link>
            );
          return (
            <button
              type="button"
              className="block w-full text-left"
              key={item._id}
              onClick={() => !item.is_read && onMarkRead?.(item._id)}
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
  );
}
