import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { BadgeCheck, Camera, MapPin, ShieldCheck, Star, UserRound } from 'lucide-react';
import Button from '../components/common/Button';
import ErrorAlert from '../components/common/ErrorAlert';
import profileService, { buildProfileUpdatePayload, PROFILE_FIELDS } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { DISTRICTS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { getNameValidationError, getPhoneValidationError, validateEmail } from '../utils/validators';

const INITIAL_FORM = {
  full_name: '',
  phone: '',
  email: '',
  district: '',
  address: '',
  bio: '',
};
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PROFILE_FIELD_LABELS = {
  full_name: 'Full name',
  phone: 'Phone number',
  email: 'Email address',
  district: 'District',
  address: 'Address',
  bio: 'Profile description',
};

export const getProfileFormValues = (profile = {}) => ({
  full_name: profile.full_name || '',
  phone: profile.phone || '',
  email: profile.email || '',
  district: profile.district || '',
  address: profile.address || '',
  bio: profile.bio || '',
});

const getRequestErrorMessage = (requestError, fallback) => {
  const detail = requestError?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(' ');
    return message || fallback;
  }
  return fallback;
};

const normalizeServerMessage = (message, field) => (
  (message || `${PROFILE_FIELD_LABELS[field] || 'This field'} is invalid.`)
    .replace(/^Value error,\s*/i, '')
);

const getServerFieldErrors = (requestError) => {
  const detail = requestError?.response?.data?.detail;
  if (!Array.isArray(detail)) return {};

  return detail.reduce((fieldErrors, item) => {
    const field = [...(item?.loc || [])].reverse().find((part) => PROFILE_FIELDS.includes(part));
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = normalizeServerMessage(item?.msg || item?.message, field);
    }
    return fieldErrors;
  }, {});
};

export const validateProfileForm = (values = {}) => {
  const next = {};
  const sanitized = buildProfileUpdatePayload(values);
  const fullName = sanitized.full_name || '';
  const phone = sanitized.phone || '';
  const email = sanitized.email || '';
  const district = sanitized.district || '';
  const address = sanitized.address || '';
  const bio = sanitized.bio || '';

  if (!fullName) {
    next.full_name = 'Full name is required.';
  } else {
    const nameError = getNameValidationError(fullName, 'Full name');
    if (nameError) {
      next.full_name = nameError;
    } else if (fullName.length < 2) {
      next.full_name = 'Full name must be at least 2 characters.';
    }
  }

  if (!next.full_name && fullName.length > 100) {
    next.full_name = 'Full name must be 100 characters or less.';
  }

  if (!phone) {
    next.phone = 'Phone number is required.';
  } else {
    const phoneError = getPhoneValidationError(phone);
    if (phoneError) next.phone = phoneError;
  }

  if (!email) {
    next.email = 'Email is required.';
  } else if (!validateEmail(email)) {
    next.email = 'Enter a valid email address.';
  } else if (email.length > 100) {
    next.email = 'Email address must be 100 characters or less.';
  }

  if (!district) {
    next.district = 'District is required.';
  } else if (!DISTRICTS.includes(district)) {
    next.district = 'Select a valid district.';
  }

  if (address.length > 300) next.address = 'Address must be 300 characters or less.';
  if (bio.length > 500) next.bio = 'Profile description must be 500 characters or less.';

  return next;
};

export const getChangedProfilePayload = (currentProfile = {}, nextValues = {}) => {
  const currentValues = buildProfileUpdatePayload(getProfileFormValues(currentProfile));
  const nextPayload = buildProfileUpdatePayload(nextValues);

  return PROFILE_FIELDS.reduce((changes, field) => {
    if (nextPayload[field] !== currentValues[field]) {
      changes[field] = nextPayload[field] || '';
    }
    return changes;
  }, {});
};

export default function ProfilePage() {
  const { user, refreshProfile, setUser } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm(getProfileFormValues(user));
      setErrors({});
    }
  }, [user]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      let nextError = '';
      if (name === 'phone' && /[^\d]/.test(value.trim())) nextError = 'Only numbers can be entered.';
      if (name === 'full_name') nextError = getNameValidationError(value, 'Full name');
      return { ...current, [name]: nextError };
    });
    setError('');
    setSuccess('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const sanitizedForm = buildProfileUpdatePayload(form);
    const nextErrors = validateProfileForm(sanitizedForm);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setSuccess('');
      return;
    }

    const updatePayload = getChangedProfilePayload(user, sanitizedForm);
    if (!Object.keys(updatePayload).length) {
      setErrors({});
      setError('');
      setSuccess('No profile changes to save.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await profileService.update(updatePayload);
      setUser(updatedProfile);
      setForm(getProfileFormValues(updatedProfile));
      setSuccess('Profile updated successfully.');
    } catch (requestError) {
      const serverErrors = getServerFieldErrors(requestError);
      setErrors(serverErrors);
      setError(getRequestErrorMessage(requestError, 'Could not update profile.'));
    } finally {
      setLoading(false);
    }
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setError('Use a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setPhotoLoading(true);
    try {
      const photo = await profileService.uploadPhoto(file);
      if (photo?.profile_image_url && user) {
        setUser({ ...user, profile_image_url: photo.profile_image_url });
      } else {
        await refreshProfile();
      }
      setSuccess('Profile photo updated.');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Could not upload photo.'));
    } finally {
      setPhotoLoading(false);
      event.target.value = '';
    }
  };

  const fieldError = (name) => (
    errors[name] ? <p id={`${name}-error`} className="mt-1 text-xs font-semibold text-red-500">{errors[name]}</p> : null
  );

  const fieldClass = (name) => clsx(
    'input-field',
    errors[name] && 'border-red-300 focus:border-red-500 focus:ring-red-100',
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn">
      <div><p className="page-kicker">Account and trust</p><h1 className="page-title">My profile</h1><p className="page-copy">Keep contact, location, and marketplace identity details current.</p></div>
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900" />
            <div className="px-6 pb-6 text-center">
              <div className="relative mx-auto -mt-12 h-24 w-24">
                {user?.profile_image_url ? <img src={user.profile_image_url} alt="Profile" className="h-full w-full rounded-[1.5rem] border-4 border-white object-cover shadow-lg" /> : <div className="grid h-full w-full place-items-center rounded-[1.5rem] border-4 border-white bg-emerald-100 text-emerald-800 shadow-lg"><UserRound className="h-9 w-9" /></div>}
                <label className={clsx('absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg', photoLoading ? 'cursor-wait opacity-75' : 'cursor-pointer hover:bg-emerald-800')} title="Upload profile photo"><Camera className="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} disabled={photoLoading} /></label>
              </div>
              <h2 className="mt-4 text-xl font-black">{user?.full_name}</h2>
              <p className="mt-1 text-sm capitalize text-slate-500">{user?.role}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${user?.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{user?.is_verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}{user?.is_verified ? 'Verified' : 'Verification pending'}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700"><Star className="h-3.5 w-3.5 fill-amber-400" />{Number(user?.rating || 0).toFixed(1)}</span>
              </div>
              {user?.district && <p className="mt-4 flex items-center justify-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" />{user.district}</p>}
            </div>
          </div>
          {user?.role === 'farmer' && <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">Farmer wallet</p><p className="mt-2 text-3xl font-black">{formatCurrency(user.wallet_balance)}</p><p className="mt-2 text-xs leading-5 text-slate-400">Delivered order revenue recorded by the platform.</p></div>}
        </aside>

        <form onSubmit={submit} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8" noValidate>
          <div className="mb-6"><h2 className="text-xl font-black">Personal information</h2><p className="mt-1 text-sm text-slate-500">Used for verification, order communication, and local recommendations.</p></div>
          <ErrorAlert message={error} onDismiss={() => setError('')} />
          {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="profile_full_name" className="label">Full name</label>
              <input id="profile_full_name" name="full_name" className={fieldClass('full_name')} value={form.full_name} onChange={change} maxLength={100} autoComplete="name" aria-invalid={Boolean(errors.full_name)} aria-describedby={errors.full_name ? 'full_name-error' : undefined} />
              {fieldError('full_name')}
            </div>
            <div>
              <label htmlFor="profile_phone" className="label">Phone number</label>
              <input id="profile_phone" name="phone" className={fieldClass('phone')} value={form.phone} onChange={change} maxLength={10} pattern="07[0-9]{8}" autoComplete="tel" inputMode="numeric" placeholder="0771234567" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />
              {fieldError('phone')}
            </div>
            <div>
              <label htmlFor="profile_email" className="label">Email address</label>
              <input id="profile_email" name="email" type="email" className={fieldClass('email')} value={form.email} onChange={change} maxLength={100} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
              {fieldError('email')}
            </div>
            <div>
              <label htmlFor="profile_district" className="label">District</label>
              <select id="profile_district" name="district" className={fieldClass('district')} value={form.district} onChange={change} aria-invalid={Boolean(errors.district)} aria-describedby={errors.district ? 'district-error' : undefined}><option value="">Select district</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select>
              {fieldError('district')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="profile_address" className="label">Address</label>
              <textarea id="profile_address" name="address" rows={2} maxLength={300} className={fieldClass('address')} value={form.address} onChange={change} autoComplete="street-address" aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'address-error' : undefined} />
              {fieldError('address')}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="profile_bio" className="label">Short profile description</label>
              <textarea id="profile_bio" name="bio" rows={4} maxLength={500} className={fieldClass('bio')} value={form.bio} onChange={change} placeholder="Tell buyers or farmers about your business, capacity, and experience." aria-invalid={Boolean(errors.bio)} aria-describedby={errors.bio ? 'bio-error profile_bio_count' : 'profile_bio_count'} />
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                {fieldError('bio') || <span />}
                <span id="profile_bio_count" className="text-xs font-semibold text-slate-400">{form.bio.length}/500</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end"><Button type="submit" loading={loading}>Save profile</Button></div>
        </form>
      </div>
    </div>
  );
}
