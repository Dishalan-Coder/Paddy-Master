import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import RoleSelector from './RoleSelector';
import { useAuth } from '../../context/AuthContext';
import { DISTRICTS } from '../../utils/constants';
import { formatDistrict } from '../../utils/formatters';
import {
  getNameValidationError,
  getPasswordValidationError,
  getPhoneValidationError,
  validateEmail,
} from '../../utils/validators';
import { getApiErrorMessage } from '../../utils/forms';
import PasswordField from './PasswordField';

// Same crop-blade config as LoginForm, kept local so this component has no cross-file
// dependency. If you'd rather share one source of truth, lift CROP_BLADES + CropField
// into a common file (e.g. components/common/CropField.jsx) and import it in both.
const CROP_BLADES = [
  { x: 8, h: 40, tilt: -6, sway: 9, dur: 3.4, delay: 0.0, color: '#34d399', row: 'front' },
  { x: 26, h: 30, tilt: 4, sway: 7, dur: 3.0, delay: 0.15, color: '#6ee7b7', row: 'back' },
  { x: 44, h: 46, tilt: -3, sway: 10, dur: 3.6, delay: 0.3, color: '#10b981', row: 'front' },
  { x: 62, h: 26, tilt: 6, sway: 6, dur: 2.8, delay: 0.45, color: '#a7f3d0', row: 'back' },
  { x: 80, h: 42, tilt: -5, sway: 9, dur: 3.3, delay: 0.6, color: '#34d399', row: 'front' },
  { x: 98, h: 32, tilt: 3, sway: 7, dur: 3.1, delay: 0.75, color: '#6ee7b7', row: 'back' },
  { x: 116, h: 44, tilt: -4, sway: 10, dur: 3.5, delay: 0.9, color: '#059669', row: 'front' },
  { x: 134, h: 28, tilt: 5, sway: 6, dur: 2.9, delay: 1.05, color: '#a7f3d0', row: 'back' },
  { x: 152, h: 38, tilt: -6, sway: 9, dur: 3.2, delay: 1.2, color: '#34d399', row: 'front' },
  { x: 170, h: 33, tilt: 4, sway: 7, dur: 3.0, delay: 1.35, color: '#6ee7b7', row: 'back' },
  { x: 188, h: 48, tilt: -3, sway: 10, dur: 3.6, delay: 1.5, color: '#10b981', row: 'front' },
  { x: 206, h: 26, tilt: 6, sway: 6, dur: 2.8, delay: 1.65, color: '#a7f3d0', row: 'back' },
  { x: 224, h: 42, tilt: -5, sway: 9, dur: 3.4, delay: 1.8, color: '#34d399', row: 'front' },
  { x: 242, h: 30, tilt: 3, sway: 7, dur: 3.1, delay: 1.95, color: '#6ee7b7', row: 'back' },
  { x: 260, h: 46, tilt: -4, sway: 10, dur: 3.5, delay: 2.1, color: '#059669', row: 'front' },
  { x: 278, h: 28, tilt: 5, sway: 6, dur: 2.9, delay: 2.25, color: '#a7f3d0', row: 'back' },
  { x: 296, h: 40, tilt: -6, sway: 9, dur: 3.3, delay: 2.4, color: '#34d399', row: 'front' },
  { x: 314, h: 32, tilt: 4, sway: 7, dur: 3.0, delay: 2.55, color: '#6ee7b7', row: 'back' },
  { x: 332, h: 44, tilt: -3, sway: 10, dur: 3.6, delay: 2.7, color: '#10b981', row: 'front' },
  { x: 350, h: 26, tilt: 6, sway: 6, dur: 2.8, delay: 2.85, color: '#a7f3d0', row: 'back' },
  { x: 368, h: 38, tilt: -5, sway: 9, dur: 3.2, delay: 3.0, color: '#34d399', row: 'front' },
  { x: 386, h: 33, tilt: 3, sway: 7, dur: 3.0, delay: 3.15, color: '#6ee7b7', row: 'back' },
];

function CropField() {
  return (
    <div className="rf-field relative -mt-3 h-[60px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/0 via-emerald-50/50 to-emerald-100/60" />
      <svg
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {CROP_BLADES.map((b, i) => (
          <g
            key={i}
            className="rf-blade"
            style={{
              transformOrigin: `${b.x}px 60px`,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              '--sway': `${b.sway}deg`,
              opacity: b.row === 'back' ? 0.5 : 0.9,
            }}
          >
            <path
              d={`M ${b.x} 60 Q ${b.x + b.tilt} ${60 - b.h * 0.55} ${b.x + b.tilt * 1.6} ${60 - b.h}`}
              stroke={b.color}
              strokeWidth={b.row === 'front' ? 2.6 : 2}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${b.x} ${60 - b.h * 0.4} Q ${b.x - 5} ${60 - b.h * 0.55} ${b.x - 9} ${60 - b.h * 0.42}`}
              stroke={b.color}
              strokeWidth={b.row === 'front' ? 2 : 1.6}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function RegisterForm() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'farmer',
    district: '',
    agree_terms: false,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((current) => {
      let nextError = '';
      if (name === 'phone' && /[^\d]/.test(value.trim()))
        nextError = t('validation.only_numbers');
      if (name === 'full_name')
        nextError = getNameValidationError(value, t('full_name'));

      const next = {
        ...current,
        [name]: nextError,
      };
      if (name === 'password' || name === 'confirm_password')
        next.confirm_password = '';
      return next;
    });
    setError('');
  };

  const validate = () => {
    const next = {};

    if (!form.full_name.trim()) {
      next.full_name = t('validation.required', { field: t('full_name') });
    } else {
      const nameError = getNameValidationError(form.full_name, t('full_name'));
      if (nameError) {
        next.full_name = nameError;
      } else if (form.full_name.trim().length < 2) {
        next.full_name = t('validation.min_chars', {
          field: t('full_name'),
          count: 2,
        });
      }
    }

    if (!form.phone.trim()) {
      next.phone = t('validation.phone_required');
    } else {
      const phoneError = getPhoneValidationError(form.phone);
      if (phoneError) next.phone = phoneError;
    }

    if (!form.email.trim()) {
      next.email = t('validation.required', { field: t('email') });
    } else if (!validateEmail(form.email)) {
      next.email = t('validation.email_invalid');
    }

    if (!form.district)
      next.district = t('validation.required', {
        field: t('profile_fields.district'),
      });

    const passwordError = getPasswordValidationError(form.password);
    if (passwordError) next.password = passwordError;

    if (!form.confirm_password) {
      next.confirm_password = t('validation.confirm_password');
    } else if (form.password !== form.confirm_password) {
      next.confirm_password = t('validation.passwords_match');
    }

    if (!form.agree_terms) next.agree_terms = t('validation.agree_terms');

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
      const { confirm_password, agree_terms, ...values } = form;
      const payload = {
        ...values,
        full_name: values.full_name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
      };
      const user = await register(payload);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          t('auth.registration_failed', { defaultValue: 'Registration failed' }),
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
        className="mt-1 text-xs font-semibold text-red-500 animate-[rfShake_0.4s_ease-in-out]"
      >
        {errors[name]}
      </p>
    ) : null;

  const fieldClass = (name) =>
    clsx(
      'input-field transition-all duration-300 focus:shadow-lg focus:shadow-emerald-100',
      errors[name] && 'border-red-300 focus:border-red-500 focus:ring-red-100',
    );

  const focusHandlers = (name) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(''),
  });

  return (
    <div className="relative w-full max-w-lg">
      {/* Quiet ambient glow, matching the login screen */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible" aria-hidden="true">
        <div className="rf-blob rf-blob-a absolute -left-16 -top-20 h-52 w-52 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="rf-blob rf-blob-b absolute -right-14 top-24 h-44 w-44 rounded-full bg-lime-200/30 blur-3xl" />
      </div>

      <div className="rf-enter rf-enter-1 mb-6">
        <div className="relative inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping [animation-duration:2.4s]" />
          <ShieldCheck className="relative h-4 w-4" />
          <span className="relative">{t('auth.register_badge')}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-slate-950">
          {t('create_account')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('auth.register_subtitle')}
        </p>
      </div>

      <div className="rf-enter rf-enter-2 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-emerald-200/40">
        <div className="p-6 sm:p-8">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="rf-enter rf-enter-3">
              <RoleSelector
                value={form.role}
                onChange={(role) => {
                  setForm((current) => ({ ...current, role }));
                  setError('');
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rf-enter rf-enter-4 sm:col-span-2">
                <label htmlFor="full_name" className="label">
                  {t('full_name')}
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  value={form.full_name}
                  onChange={change}
                  {...focusHandlers('full_name')}
                  className={clsx(
                    fieldClass('full_name'),
                    focused === 'full_name' && 'ring-2 ring-emerald-100',
                  )}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.full_name)}
                  aria-describedby={
                    errors.full_name ? 'full_name-error' : undefined
                  }
                />
                {fieldError('full_name')}
              </div>

              <div className="rf-enter rf-enter-4">
                <label htmlFor="phone" className="label">
                  {t('phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  {...focusHandlers('phone')}
                  className={clsx(
                    fieldClass('phone'),
                    focused === 'phone' && 'ring-2 ring-emerald-100',
                  )}
                  maxLength={10}
                  pattern="07[0-9]{8}"
                  placeholder="0771234567"
                  autoComplete="tel"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {fieldError('phone')}
              </div>

              <div className="rf-enter rf-enter-4">
                <label htmlFor="email" className="label">
                  {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  {...focusHandlers('email')}
                  className={clsx(
                    fieldClass('email'),
                    focused === 'email' && 'ring-2 ring-emerald-100',
                  )}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {fieldError('email')}
              </div>

              <div className="rf-enter rf-enter-5 sm:col-span-2">
                <label htmlFor="district" className="label">
                  {t('district')}
                </label>
                <select
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={change}
                  {...focusHandlers('district')}
                  className={clsx(
                    fieldClass('district'),
                    focused === 'district' && 'ring-2 ring-emerald-100',
                  )}
                  aria-invalid={Boolean(errors.district)}
                  aria-describedby={
                    errors.district ? 'district-error' : undefined
                  }
                >
                  <option value="">{t('forms.select_district')}</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {formatDistrict(district)}
                    </option>
                  ))}
                </select>
                {fieldError('district')}
              </div>

              <div className="rf-enter rf-enter-5">
                <PasswordField
                  id="register_password"
                  name="password"
                  label={t('password')}
                  value={form.password}
                  onChange={change}
                  error={errors.password}
                  autoComplete="new-password"
                  {...focusHandlers('password')}
                />
              </div>
              <div className="rf-enter rf-enter-5">
                <PasswordField
                  id="confirm_password"
                  name="confirm_password"
                  label={t('confirm_password')}
                  value={form.confirm_password}
                  onChange={change}
                  error={errors.confirm_password}
                  autoComplete="new-password"
                  {...focusHandlers('confirm_password')}
                />
              </div>
            </div>

            <label className="rf-enter rf-enter-6 group flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3 transition-colors duration-200 hover:bg-emerald-50">
              <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  name="agree_terms"
                  checked={form.agree_terms}
                  onChange={change}
                  className="peer sr-only"
                  aria-invalid={Boolean(errors.agree_terms)}
                  aria-describedby={
                    errors.agree_terms ? 'agree_terms-error' : undefined
                  }
                />
                <span
                  className={clsx(
                    'h-5 w-5 rounded-md border-2 transition-all duration-200',
                    form.agree_terms
                      ? 'scale-100 border-emerald-600 bg-emerald-600'
                      : 'scale-100 border-slate-300 bg-white group-hover:border-emerald-400',
                  )}
                />
                <Check
                  className={clsx(
                    'pointer-events-none absolute h-3.5 w-3.5 text-white transition-all duration-200',
                    form.agree_terms
                      ? 'scale-100 opacity-100'
                      : 'scale-50 opacity-0',
                  )}
                />
              </span>
              <span className="text-sm leading-5 text-slate-600">
                {t('agree_terms')} {t('auth.terms_suffix')}
              </span>
            </label>
            {fieldError('agree_terms')}

            <div className="rf-enter rf-enter-7">
              <Button
                type="submit"
                loading={loading}
                className="group w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200/60 active:translate-y-0 active:scale-[0.98]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {t('register')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </form>
        </div>

        {/* Same signature crop strip as the login screen, for continuity between the two flows */}
        <CropField />
      </div>

      <p className="rf-enter rf-enter-8 mt-5 text-center text-sm text-slate-500">
        {t('have_account')}{' '}
        <Link
          to="/login"
          className="relative font-black text-emerald-700 transition-colors hover:text-emerald-800 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-700 after:transition-all after:duration-300 hover:after:w-full"
        >
          {t('login')}
        </Link>
      </p>

      <style>{`
        @keyframes rfFadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rfFloatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, 14px) scale(1.08); }
        }
        @keyframes rfFloatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, -10px) scale(1.05); }
        }
        @keyframes rfShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes rfSway {
          0%, 100% { transform: rotate(calc(var(--sway) * -1)); }
          50% { transform: rotate(var(--sway)); }
        }
        .rf-enter {
          opacity: 0;
          animation: rfFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .rf-enter-1 { animation-delay: 0.02s; }
        .rf-enter-2 { animation-delay: 0.08s; }
        .rf-enter-3 { animation-delay: 0.14s; }
        .rf-enter-4 { animation-delay: 0.20s; }
        .rf-enter-5 { animation-delay: 0.26s; }
        .rf-enter-6 { animation-delay: 0.32s; }
        .rf-enter-7 { animation-delay: 0.38s; }
        .rf-enter-8 { animation-delay: 0.44s; }
        .rf-blob { animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .rf-blob-a { animation-name: rfFloatA; animation-duration: 9s; }
        .rf-blob-b { animation-name: rfFloatB; animation-duration: 11s; }
        .rf-blade {
          animation-name: rfSway;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .rf-enter, .rf-blob, .rf-blade, [class*="animate-"] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}