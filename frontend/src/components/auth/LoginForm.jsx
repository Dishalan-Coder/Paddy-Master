import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Mail, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import { useAuth } from '../../context/AuthContext';
import { getPasswordValidationError, validateLoginId } from '../../utils/validators';
import PasswordField from './PasswordField';

export default function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {};

    if (!form.login_id.trim()) {
      next.login_id = 'Phone number or email is required.';
    } else if (!validateLoginId(form.login_id)) {
      next.login_id = 'Enter a valid email address or 10-digit phone number starting with 07.';
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
      const user = await login({ login_id: form.login_id.trim(), password: form.password });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) => (
    errors[name] ? <p id={`${name}-error`} className="mt-1 text-xs font-semibold text-red-500">{errors[name]}</p> : null
  );

  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Secure account access
        </div>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-slate-950">{t('login')}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Open your farmer, buyer, or administrator workspace.</p>
      </div>
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/40 sm:p-8">
        <ErrorAlert message={error} onDismiss={() => setError('')} />
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login_id" className="label">{t('phone_or_email')}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="login_id"
                name="login_id"
                value={form.login_id}
                onChange={change}
                className={clsx(
                  'input-field pl-11',
                  errors.login_id && 'border-red-300 focus:border-red-500 focus:ring-red-100',
                )}
                placeholder="farmer@example.com"
                autoComplete="username"
                aria-invalid={Boolean(errors.login_id)}
                aria-describedby={errors.login_id ? 'login_id-error' : undefined}
              />
            </div>
            {fieldError('login_id')}
          </div>
          <PasswordField
            id="login_password"
            name="password"
            label={t('password')}
            value={form.password}
            onChange={change}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="w-full">{t('login')}</Button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        {t('no_account')} <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-800">{t('register')}</Link>
      </p>
    </div>
  );
}
