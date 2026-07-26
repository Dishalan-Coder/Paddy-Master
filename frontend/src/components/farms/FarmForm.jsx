import { useEffect, useState } from 'react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import { DISTRICTS, SOIL_TYPES } from '../../utils/constants';
import { fieldClass, hasErrors, toPositiveNumber } from '../../utils/forms';

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
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm(getFormValues(initialData));
  }, [initialData]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {};
    const area = toPositiveNumber(form.area_acres);

    if (!form.name.trim()) {
      next.name = 'Farm name is required.';
    } else if (form.name.trim().length < 2) {
      next.name = 'Farm name must be at least 2 characters.';
    } else if (form.name.trim().length > 100) {
      next.name = 'Farm name must be 100 characters or less.';
    }

    if (!form.location.trim()) {
      next.location = 'Location is required.';
    } else if (form.location.trim().length < 2) {
      next.location = 'Location must be at least 2 characters.';
    } else if (form.location.trim().length > 200) {
      next.location = 'Location must be 200 characters or less.';
    }

    if (!form.area_acres) {
      next.area_acres = 'Area is required.';
    } else if (!area) {
      next.area_acres = 'Area must be greater than zero.';
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

  const fieldError = (name) => (
    errors[name] ? <p id={`${name}-error`} className="mt-1 text-xs font-semibold text-red-500">{errors[name]}</p> : null
  );

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <div>
        <label htmlFor="farm_name" className="label">Farm name</label>
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
        <label htmlFor="farm_location" className="label">Location</label>
        <input
          id="farm_location"
          name="location"
          value={form.location}
          onChange={change}
          className={fieldClass(errors, 'location')}
          maxLength={200}
          placeholder="Village, town, or landmark"
          aria-invalid={Boolean(errors.location)}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {fieldError('location')}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="farm_area" className="label">Area (acres)</label>
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
            aria-describedby={errors.area_acres ? 'area_acres-error' : undefined}
          />
          {fieldError('area_acres')}
        </div>
        <div>
          <label htmlFor="farm_soil" className="label">Soil type</label>
          <select id="farm_soil" name="soil_type" value={form.soil_type} onChange={change} className="input-field">
            <option value="">Select soil type</option>
            {SOIL_TYPES.map((soilType) => <option key={soilType}>{soilType}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="farm_district" className="label">District</label>
        <select id="farm_district" name="district" value={form.district} onChange={change} className="input-field">
          <option value="">Select district</option>
          {DISTRICTS.map((district) => <option key={district}>{district}</option>)}
        </select>
      </div>
      <Button type="submit" loading={loading}>Save farm</Button>
    </form>
  );
}
