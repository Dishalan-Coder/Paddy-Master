import { useTranslation } from 'react-i18next';
import { Sprout, Store } from 'lucide-react';
import clsx from 'clsx';

export default function RoleSelector({ value, onChange }) {
  const { t } = useTranslation();
  const roles = [
    {
      value: 'farmer',
      label: t('im_farmer'),
      description: t('auth.farmer_description'),
      icon: Sprout,
    },
    {
      value: 'buyer',
      label: t('im_buyer'),
      description: t('auth.buyer_description'),
      icon: Store,
    },
  ];
  return (
    <div>
      <label className="label">{t('auth.account_type')}</label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={clsx(
              'rounded-2xl border p-4 text-left transition',
              value === role.value
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                : 'border-slate-200 bg-white hover:border-emerald-200',
            )}
          >
            <role.icon
              className={clsx(
                'h-6 w-6',
                value === role.value ? 'text-emerald-700' : 'text-slate-400',
              )}
            />
            <p className="mt-3 text-sm font-black text-slate-800">
              {role.label}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              {role.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
