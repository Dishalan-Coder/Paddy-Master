import clsx from 'clsx';
export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'paddy',
}) {
  const c = {
    paddy: 'bg-paddy-50 text-paddy-700 border-paddy-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  const i = {
    paddy: 'bg-paddy-100 text-paddy-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className={clsx('card border', c[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              i[color],
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
