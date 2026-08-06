import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import { useAuth } from '../../context/AuthContext';
import {
  getPasswordValidationError,
  validateLoginId,
} from '../../utils/validators';
import { getApiErrorMessage } from '../../utils/forms';
import PasswordField from './PasswordField';

// Procedurally laid-out crop blades: x position, height, tilt, color, timing.
// Front-row blades are taller/brighter, back-row shorter/muted, so the strip has depth.
const CROP_BLADES = [
  { x: 8, h: 46, tilt: -6, sway: 9, dur: 3.4, delay: 0.0, color: '#34d399', row: 'front' },
  { x: 26, h: 34, tilt: 4, sway: 7, dur: 3.0, delay: 0.15, color: '#6ee7b7', row: 'back' },
  { x: 44, h: 52, tilt: -3, sway: 10, dur: 3.6, delay: 0.3, color: '#10b981', row: 'front' },
  { x: 62, h: 30, tilt: 6, sway: 6, dur: 2.8, delay: 0.45, color: '#a7f3d0', row: 'back' },
  { x: 80, h: 48, tilt: -5, sway: 9, dur: 3.3, delay: 0.6, color: '#34d399', row: 'front' },
  { x: 98, h: 36, tilt: 3, sway: 7, dur: 3.1, delay: 0.75, color: '#6ee7b7', row: 'back' },
  { x: 116, h: 50, tilt: -4, sway: 10, dur: 3.5, delay: 0.9, color: '#059669', row: 'front' },
  { x: 134, h: 32, tilt: 5, sway: 6, dur: 2.9, delay: 1.05, color: '#a7f3d0', row: 'back' },
  { x: 152, h: 44, tilt: -6, sway: 9, dur: 3.2, delay: 1.2, color: '#34d399', row: 'front' },
  { x: 170, h: 38, tilt: 4, sway: 7, dur: 3.0, delay: 1.35, color: '#6ee7b7', row: 'back' },
  { x: 188, h: 54, tilt: -3, sway: 10, dur: 3.6, delay: 1.5, color: '#10b981', row: 'front' },
  { x: 206, h: 30, tilt: 6, sway: 6, dur: 2.8, delay: 1.65, color: '#a7f3d0', row: 'back' },
  { x: 224, h: 48, tilt: -5, sway: 9, dur: 3.4, delay: 1.8, color: '#34d399', row: 'front' },
  { x: 242, h: 34, tilt: 3, sway: 7, dur: 3.1, delay: 1.95, color: '#6ee7b7', row: 'back' },
  { x: 260, h: 52, tilt: -4, sway: 10, dur: 3.5, delay: 2.1, color: '#059669', row: 'front' },
  { x: 278, h: 32, tilt: 5, sway: 6, dur: 2.9, delay: 2.25, color: '#a7f3d0', row: 'back' },
  { x: 296, h: 46, tilt: -6, sway: 9, dur: 3.3, delay: 2.4, color: '#34d399', row: 'front' },
  { x: 314, h: 36, tilt: 4, sway: 7, dur: 3.0, delay: 2.55, color: '#6ee7b7', row: 'back' },
  { x: 332, h: 50, tilt: -3, sway: 10, dur: 3.6, delay: 2.7, color: '#10b981', row: 'front' },
  { x: 350, h: 30, tilt: 6, sway: 6, dur: 2.8, delay: 2.85, color: '#a7f3d0', row: 'back' },
  { x: 368, h: 44, tilt: -5, sway: 9, dur: 3.2, delay: 3.0, color: '#34d399', row: 'front' },
  { x: 386, h: 38, tilt: 3, sway: 7, dur: 3.0, delay: 3.15, color: '#6ee7b7', row: 'back' },
];

function CropField() {
  return (
    <div className="lf-field relative -mt-3 mb-6 h-[72px] w-full overflow-hidden rounded-b-[1.4rem]">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/0 via-emerald-50/60 to-emerald-100/70" />
      <svg
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {CROP_BLADES.map((b, i) => (
          <g
            key={i}
            className="lf-blade"
            style={{
              transformOrigin: `${b.x}px 70px`,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              '--sway': `${b.sway}deg`,
              opacity: b.row === 'back' ? 0.55 : 0.95,
            }}
          >
            <path
              d={`M ${b.x} 70 Q ${b.x + b.tilt} ${70 - b.h * 0.55} ${b.x + b.tilt * 1.6} ${70 - b.h}`}
              stroke={b.color}
              strokeWidth={b.row === 'front' ? 3 : 2.2}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${b.x} ${70 - b.h * 0.4} Q ${b.x - 6} ${70 - b.h * 0.55} ${b.x - 10} ${70 - b.h * 0.42}`}
              stroke={b.color}
              strokeWidth={b.row === 'front' ? 2.4 : 1.8}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${b.x + b.tilt * 0.6} ${70 - b.h * 0.7} Q ${b.x + b.tilt + 7} ${70 - b.h * 0.82} ${b.x + b.tilt + 11} ${70 - b.h * 0.7}`}
              stroke={b.color}
              strokeWidth={b.row === 'front' ? 2.2 : 1.6}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  // Freeze the field layout for the component's lifetime so it doesn't reshuffle on re-render.
  const blades = useMemo(() => CROP_BLADES, []);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {};

    if (!form.login_id.trim()) {
      next.login_id = t('validation.login_id_required');
    } else if (!validateLoginId(form.login_id)) {
      next.login_id = t('validation.login_id_invalid');
    }

    const passwordError = getPasswordValidationError(form.password);
    if (passwordError) next.password = passwordError;

    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login({
        login_id: form.login_id.trim(),
        password: form.password,
      });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          t('auth.login_failed', { defaultValue: 'Login failed' }),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) =>
    errors[name] ? (
      <p
        id={`${name}-error`}
        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-500 animate-[shake_0.4s_ease-in-out]"
      >
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="relative w-full max-w-md">
      {/* Ambient drifting glow, quiet on purpose so the crop field stays the focal motion */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible" aria-hidden="true">
        <div className="lf-blob lf-blob-a absolute -left-16 -top-24 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="lf-blob lf-blob-b absolute -right-10 top-10 h-48 w-48 rounded-full bg-lime-200/30 blur-3xl" />
      </div>

      <div className="lf-enter lf-enter-1 mb-7">
        <div className="relative inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping [animation-duration:2.4s]" />
          <ShieldCheck className="relative h-4 w-4" />
          <span className="relative">{t('auth.login_badge')}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-slate-950">
          {t('login')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t('auth.login_subtitle')}
        </p>
      </div>

      <div className="lf-enter lf-enter-2 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-emerald-200/40">
        <div className="p-7 pb-0 sm:p-8 sm:pb-0">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="lf-enter lf-enter-3">
              <label htmlFor="login_id" className="label">
                {t('phone_or_email')}
              </label>
              <div className="relative">
                <Mail
                  className={clsx(
                    'pointer-events-none absolute left-4 top-3.5 h-4 w-4 transition-all duration-300',
                    focused === 'login_id'
                      ? 'scale-110 text-emerald-600'
                      : 'text-slate-400',
                  )}
                />
                <input
                  id="login_id"
                  name="login_id"
                  value={form.login_id}
                  onChange={change}
                  onFocus={() => setFocused('login_id')}
                  onBlur={() => setFocused('')}
                  className={clsx(
                    'input-field pl-11 transition-all duration-300 focus:shadow-lg focus:shadow-emerald-100',
                    errors.login_id &&
                      'border-red-300 focus:border-red-500 focus:ring-red-100',
                  )}
                  placeholder="farmer@example.com"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.login_id)}
                  aria-describedby={
                    errors.login_id ? 'login_id-error' : undefined
                  }
                />
              </div>
              {fieldError('login_id')}
            </div>

            <div className="lf-enter lf-enter-4">
              <PasswordField
                id="login_password"
                name="password"
                label={t('password')}
                value={form.password}
                onChange={change}
                error={errors.password}
                autoComplete="current-password"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
              />
            </div>

            <div className="lf-enter lf-enter-5">
              <Button
                type="submit"
                loading={loading}
                className="group w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200/60 active:translate-y-0 active:scale-[0.98]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {t('login')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </form>
        </div>

        {/* Signature element: a row of crop blades waving under the form, as if the login is rooted in the field */}
        <CropField />
      </div>

      <p className="lf-enter lf-enter-6 mt-6 text-center text-sm text-slate-500">
        {t('no_account')}{' '}
        <Link
          to="/register"
          className="relative font-black text-emerald-700 transition-colors hover:text-emerald-800 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-700 after:transition-all after:duration-300 hover:after:w-full"
        >
          {t('register')}
        </Link>
      </p>

      <style>{`
        @keyframes lfFadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lfFloatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, 14px) scale(1.08); }
        }
        @keyframes lfFloatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, -10px) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes lfSway {
          0%, 100% { transform: rotate(calc(var(--sway) * -1)); }
          50% { transform: rotate(var(--sway)); }
        }
        .lf-enter {
          opacity: 0;
          animation: lfFadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .lf-enter-1 { animation-delay: 0.02s; }
        .lf-enter-2 { animation-delay: 0.10s; }
        .lf-enter-3 { animation-delay: 0.18s; }
        .lf-enter-4 { animation-delay: 0.24s; }
        .lf-enter-5 { animation-delay: 0.30s; }
        .lf-enter-6 { animation-delay: 0.36s; }
        .lf-blob { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .lf-blob-a { animation-name: lfFloatA; animation-duration: 9s; }
        .lf-blob-b { animation-name: lfFloatB; animation-duration: 11s; }
        .lf-blade {
          animation-name: lfSway;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .lf-enter, .lf-blob, .lf-blade, [class*="animate-"] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}