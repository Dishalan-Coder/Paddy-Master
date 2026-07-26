import { useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';

export default function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  error,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const Icon = visible ? EyeOff : Eye;
  const action = visible ? 'Hide' : 'Show';

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={clsx(
            'input-field pl-11 pr-12',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
          )}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-4 focus:ring-emerald-100"
          aria-label={`${action} ${label.toLowerCase()}`}
          title={`${action} ${label.toLowerCase()}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
      {error ? <p id={errorId} className="mt-1 text-xs font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}
