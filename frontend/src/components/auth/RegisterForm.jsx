import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';
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
        className="mt-1 text-xs font-semibold text-red-500"
      >
        {errors[name]}
      </p>
    ) : null;

  const fieldClass = (name) =>
    clsx(
      'input-field',
      errors[name] && 'border-red-300 focus:border-red-500 focus:ring-red-100',
    );

  return (
    <div className="w-full max-w-lg animate-fadeIn">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> {t('auth.register_badge')}
        </div>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-slate-950">
          {t('create_account')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('auth.register_subtitle')}
        </p>
      </div>
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
        <ErrorAlert message={error} onDismiss={() => setError('')} />
        <form onSubmit={submit} className="space-y-5" noValidate>
          <RoleSelector
            value={form.role}
            onChange={(role) => {
              setForm((current) => ({ ...current, role }));
              setError('');
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="full_name" className="label">
                {t('full_name')}
              </label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={change}
                className={fieldClass('full_name')}
                autoComplete="name"
                aria-invalid={Boolean(errors.full_name)}
                aria-describedby={
                  errors.full_name ? 'full_name-error' : undefined
                }
              />
              {fieldError('full_name')}
            </div>
            <div>
              <label htmlFor="phone" className="label">
                {t('phone')}
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={change}
                className={fieldClass('phone')}
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
            <div>
              <label htmlFor="email" className="label">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={change}
                className={fieldClass('email')}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {fieldError('email')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="district" className="label">
                {t('district')}
              </label>
              <select
                id="district"
                name="district"
                value={form.district}
                onChange={change}
                className={fieldClass('district')}
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
            <PasswordField
              id="register_password"
              name="password"
              label={t('password')}
              value={form.password}
              onChange={change}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirm_password"
              name="confirm_password"
              label={t('confirm_password')}
              value={form.confirm_password}
              onChange={change}
              error={errors.confirm_password}
              autoComplete="new-password"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-slate-50 p-3">
            <input
              type="checkbox"
              name="agree_terms"
              checked={form.agree_terms}
              onChange={change}
              className="mt-1 h-4 w-4"
              aria-invalid={Boolean(errors.agree_terms)}
              aria-describedby={
                errors.agree_terms ? 'agree_terms-error' : undefined
              }
            />
            <span className="text-sm leading-5 text-slate-600">
              {t('agree_terms')} {t('auth.terms_suffix')}
            </span>
          </label>
          {fieldError('agree_terms')}
          <Button type="submit" loading={loading} className="w-full">
            {t('register')}
          </Button>
        </form>
      </div>
      <p className="mt-5 text-center text-sm text-slate-500">
        {t('have_account')}{' '}
        <Link to="/login" className="font-black text-emerald-700">
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
