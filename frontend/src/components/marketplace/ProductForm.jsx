import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import {
  DISTRICTS,
  MARKET_PRICE_UNITS,
  PADDY_VARIETIES,
} from '../../utils/constants';
import { fieldClass, hasErrors, toPositiveNumber } from '../../utils/forms';
import { formatDistrict, formatVariety } from '../../utils/formatters';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const INITIAL_FORM = {
  variety: '',
  quantity_kg: '',
  price_per_kg: '',
  price_unit_kg: MARKET_PRICE_UNITS[0],
  region: '',
  district: '',
  harvest_date: '',
  description: '',
  is_organic: false,
};

export default function ProductForm({
  onSubmit,
  loading,
  serverError,
  onDismissServerError,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const clearErrors = (fieldName) => {
    setErrors((current) => ({ ...current, [fieldName]: '' }));
    setError('');
    onDismissServerError?.();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    clearErrors(name);
  };

  const handleImages = (event) => {
    const files = [...event.target.files];
    clearErrors('images');

    if (files.length > MAX_IMAGES) {
      setErrors((current) => ({
        ...current,
        images: t('validation.image_max', { count: MAX_IMAGES }),
      }));
      event.target.value = '';
      return;
    }

    const unsupported = files.find(
      (file) => !ALLOWED_IMAGE_TYPES.includes(file.type),
    );
    if (unsupported) {
      setErrors((current) => ({
        ...current,
        images: t('validation.image_type', { name: unsupported.name }),
      }));
      event.target.value = '';
      return;
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE);
    if (tooLarge) {
      setErrors((current) => ({
        ...current,
        images: t('validation.image_size', { name: tooLarge.name }),
      }));
      event.target.value = '';
      return;
    }

    setImages(files);
  };

  const validate = () => {
    const next = {};
    const quantity = toPositiveNumber(form.quantity_kg);
    const price = toPositiveNumber(form.price_per_kg);
    const description = form.description.trim();
    const region = form.region.trim();

    if (!form.variety)
      next.variety = t('validation.required', { field: t('variety') });
    if (!form.district)
      next.district = t('validation.required', { field: t('district') });
    if (region.length > 100)
      next.region = t('validation.max_chars', {
        field: t('forms.town_region'),
        count: 100,
      });
    if (!form.quantity_kg)
      next.quantity_kg = t('validation.required', {
        field: t('common.quantity'),
      });
    else if (!quantity)
      next.quantity_kg = t('validation.positive', {
        field: t('common.quantity'),
      });
    if (!form.price_per_kg)
      next.price_per_kg = t('validation.required', {
        field: t('forms.price_unit_price_rs'),
      });
    else if (!price)
      next.price_per_kg = t('validation.positive', {
        field: t('forms.price_unit_price_rs'),
      });
    if (description.length > 1000)
      next.description = t('validation.max_chars', {
        field: t('description'),
        count: 1000,
      });

    return next;
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    const formData = new FormData();
    const payload = {
      variety: form.variety,
      quantity_kg: toPositiveNumber(form.quantity_kg),
      price_per_kg: toPositiveNumber(form.price_per_kg),
      price_unit_kg: form.price_unit_kg,
      region: form.region.trim() || form.district,
      district: form.district,
      harvest_date: form.harvest_date || undefined,
      description: form.description.trim() || undefined,
      is_organic: form.is_organic,
    };

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    images.forEach((image) => formData.append('images', image));
    onSubmit(formData);
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

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5" noValidate>
      <ErrorAlert
        message={error || serverError}
        onDismiss={() => {
          setError('');
          onDismissServerError?.();
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="product_variety" className="label">
            {t('variety')}
          </label>
          <select
            id="product_variety"
            name="variety"
            value={form.variety}
            onChange={handleChange}
            className={fieldClass(errors, 'variety')}
            aria-invalid={Boolean(errors.variety)}
            aria-describedby={errors.variety ? 'variety-error' : undefined}
          >
            <option value="">{t('forms.select_variety')}</option>
            {PADDY_VARIETIES.map((variety) => (
              <option key={variety} value={variety}>
                {formatVariety(variety)}
              </option>
            ))}
          </select>
          {fieldError('variety')}
        </div>
        <div>
          <label htmlFor="product_district" className="label">
            {t('district')}
          </label>
          <select
            id="product_district"
            name="district"
            value={form.district}
            onChange={handleChange}
            className={fieldClass(errors, 'district')}
            aria-invalid={Boolean(errors.district)}
            aria-describedby={errors.district ? 'district-error' : undefined}
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
      </div>
      <div>
        <label htmlFor="product_region" className="label">
          {t('forms.town_region')}
        </label>
        <input
          id="product_region"
          name="region"
          value={form.region}
          onChange={handleChange}
          className={fieldClass(errors, 'region')}
          maxLength={100}
          placeholder={t('forms.region_placeholder')}
          aria-invalid={Boolean(errors.region)}
          aria-describedby={errors.region ? 'region-error' : undefined}
        />
        {fieldError('region')}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="product_quantity" className="label">
            {t('quantity_kg')}
          </label>
          <input
            id="product_quantity"
            name="quantity_kg"
            type="number"
            min="0.1"
            step="0.1"
            value={form.quantity_kg}
            onChange={handleChange}
            className={fieldClass(errors, 'quantity_kg')}
            inputMode="decimal"
            aria-invalid={Boolean(errors.quantity_kg)}
            aria-describedby={
              errors.quantity_kg ? 'quantity_kg-error' : undefined
            }
          />
          {fieldError('quantity_kg')}
        </div>
        <div>
          <label htmlFor="product_price_unit" className="label">
            {t('pages.admin.price_unit')}
          </label>
          <select
            id="product_price_unit"
            name="price_unit_kg"
            value={form.price_unit_kg}
            onChange={handleChange}
            className="input-field"
          >
            {MARKET_PRICE_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t('prices.unit_kg', { unit })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="product_price" className="label">
            {t('forms.price_unit_price_rs')}
          </label>
          <input
            id="product_price"
            name="price_per_kg"
            type="number"
            min="0.01"
            step="0.5"
            value={form.price_per_kg}
            onChange={handleChange}
            className={fieldClass(errors, 'price_per_kg')}
            inputMode="decimal"
            placeholder={t('prices.price_for_unit', {
              unit: form.price_unit_kg,
            })}
            aria-invalid={Boolean(errors.price_per_kg)}
            aria-describedby={
              errors.price_per_kg ? 'price_per_kg-error' : undefined
            }
          />
          {fieldError('price_per_kg')}
        </div>
      </div>
      <div>
        <label htmlFor="product_harvest_date" className="label">
          {t('harvest_date')}
        </label>
        <input
          id="product_harvest_date"
          name="harvest_date"
          type="date"
          value={form.harvest_date}
          onChange={handleChange}
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="product_description" className="label">
          {t('description')}
        </label>
        <textarea
          id="product_description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className={fieldClass(errors, 'description')}
          maxLength={1000}
          placeholder={t('forms.product_description_placeholder')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description
              ? 'description-error product_description_count'
              : 'product_description_count'
          }
        />
        <div className="mt-1 flex items-center justify-between gap-2">
          {fieldError('description') || <span />}
          <span
            id="product_description_count"
            className="text-xs font-semibold text-slate-400"
          >
            {form.description.length}/1000
          </span>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-50 p-3">
        <input
          type="checkbox"
          name="is_organic"
          checked={form.is_organic}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <span className="text-sm font-semibold text-slate-600">
          {t('forms.organic_harvest')}
        </span>
      </label>
      <div>
        <label htmlFor="product_images" className="label">
          {t('common.images')}
        </label>
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center">
          <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-500">
            {t('forms.image_help')}
          </p>
          <input
            id="product_images"
            type="file"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleImages}
            className="mt-3 text-sm"
            aria-describedby={errors.images ? 'images-error' : 'images-help'}
          />
          <p id="images-help" className="mt-2 text-xs text-slate-400">
            {images.length
              ? t('common.selected_count', { count: images.length })
              : t('forms.image_types')}
          </p>
        </div>
        {fieldError('images')}
      </div>
      <Button type="submit" loading={loading}>
        {t('add_product')}
      </Button>
    </form>
  );
}
