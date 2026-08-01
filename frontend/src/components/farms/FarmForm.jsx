import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import { DISTRICTS, SOIL_TYPES } from '../../utils/constants';
import { fieldClass, hasErrors, toPositiveNumber } from '../../utils/forms';
import { getNameValidationError } from '../../utils/validators';
import { formatDistrict, formatSoilType } from '../../utils/formatters';

const INITIAL_FORM = {
  name: '',
  location: '',
  area_acres: '',
  soil_type: '',
  district: '',
};

const getFormValues = (farm = {}) => ({
  name: farm.name || '',
  location: farm.location || '',
  area_acres: farm.area_acres ? String(farm.area_acres) : '',
  soil_type: farm.soil_type || '',
  district: farm.district || '',
});

export default function FarmForm({ initialData, onSubmit, loading }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm(getFormValues(initialData));
  }, [initialData]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({
      ...current,
      [name]:
        name === 'name'
          ? getNameValidationError(value, t('forms.farm_name'))
          : '',
    }));
    setError('');
  };

  const validate = () => {
    const next = {};
    const area = toPositiveNumber(form.area_acres);

    if (!form.name.trim()) {
      next.name = t('validation.required', { field: t('forms.farm_name') });
    } else {
      const nameError = getNameValidationError(
        form.name,
        t('forms.farm_name'),
      );
      if (nameError) {
        next.name = nameError;
      } else if (form.name.trim().length < 2) {
        next.name = t('validation.min_chars', {
          field: t('forms.farm_name'),
          count: 2,
        });
      }
    }

    if (!next.name && form.name.trim().length > 100) {
      next.name = t('validation.max_chars', {
        field: t('forms.farm_name'),
        count: 100,
      });
    }

    if (!form.location.trim()) {
      next.location = t('validation.required', {
        field: t('forms.location'),
      });
    } else if (form.location.trim().length < 2) {
      next.location = t('validation.min_chars', {
        field: t('forms.location'),
        count: 2,
      });
    } else if (form.location.trim().length > 200) {
      next.location = t('validation.max_chars', {
        field: t('forms.location'),
        count: 200,
      });
    }

    if (!form.area_acres) {
      next.area_acres = t('validation.required', { field: t('common.area') });
    } else if (!area) {
      next.area_acres = t('validation.positive', {
        field: t('common.area'),
      });
    }

    return next;
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: form.name.trim(),
      location: form.location.trim(),
      area_acres: toPositiveNumber(form.area_acres),
      soil_type: form.soil_type || undefined,
      district: form.district || undefined,
    });
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
    <form onSubmit={submit} className="space-y-5" noValidate>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <div>
        <label htmlFor="farm_name" className="label">
          {t('forms.farm_name')}
        </label>
        <input
          id="farm_name"
          name="name"
          value={form.name}
          onChange={change}
          className={fieldClass(errors, 'name')}
          maxLength={100}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {fieldError('name')}
      </div>
      <div>
        <label htmlFor="farm_location" className="label">
          {t('forms.location')}
        </label>
        <input
          id="farm_location"
          name="location"
          value={form.location}
          onChange={change}
          className={fieldClass(errors, 'location')}
          maxLength={200}
          placeholder={t('forms.village_placeholder')}
          aria-invalid={Boolean(errors.location)}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {fieldError('location')}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="farm_area" className="label">
            {t('area_acres')}
          </label>
          <input
            id="farm_area"
            name="area_acres"
            type="number"
            min="0.01"
            step="0.01"
            value={form.area_acres}
            onChange={change}
            className={fieldClass(errors, 'area_acres')}
            inputMode="decimal"
            aria-invalid={Boolean(errors.area_acres)}
            aria-describedby={
              errors.area_acres ? 'area_acres-error' : undefined
            }
          />
          {fieldError('area_acres')}
        </div>
        <div>
          <label htmlFor="farm_soil" className="label">
            {t('forms.soil_type')}
          </label>
          <select
            id="farm_soil"
            name="soil_type"
            value={form.soil_type}
            onChange={change}
            className="input-field"
          >
            <option value="">{t('forms.select_soil')}</option>
            {SOIL_TYPES.map((soilType) => (
              <option key={soilType} value={soilType}>
                {formatSoilType(soilType)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="farm_district" className="label">
          {t('district')}
        </label>
        <select
          id="farm_district"
          name="district"
          value={form.district}
          onChange={change}
          className="input-field"
        >
          <option value="">{t('forms.select_district')}</option>
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {formatDistrict(district)}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" loading={loading}>
        {t('forms.save_farm')}
      </Button>
    </form>
  );
}
