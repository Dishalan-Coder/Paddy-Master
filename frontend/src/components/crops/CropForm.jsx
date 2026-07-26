import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import Loader from '../common/Loader';
import farmService from '../../services/farmService';
import { GROWTH_STAGES, PADDY_VARIETIES } from '../../utils/constants';
import {
  fieldClass,
  hasErrors,
  isAfterDate,
  toDateInputValue,
  toPositiveNumber,
} from '../../utils/forms';
import { formatGrowthStage } from '../../utils/formatters';

const INITIAL_FORM = {
  farm_id: '',
  variety: '',
  planting_date: '',
  expected_harvest_date: '',
  area_acres: '',
  growth_stage: 'planted',
  notes: '',
};

const getFormValues = (crop = {}) => ({
  farm_id: crop.farm_id || '',
  variety: crop.variety || '',
  planting_date: toDateInputValue(crop.planting_date),
  expected_harvest_date: toDateInputValue(crop.expected_harvest_date),
  area_acres: crop.area_acres ? String(crop.area_acres) : '',
  growth_stage: crop.growth_stage || 'planted',
  notes: crop.notes || '',
});

export default function CropForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [farms, setFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm(getFormValues(initialData));
  }, [initialData]);

  useEffect(() => {
    let mounted = true;
    setFarmsLoading(true);
    farmService
      .getAll()
      .then((data) => {
        if (mounted) setFarms(data);
      })
      .catch(() => {
        if (mounted)
          setError('Could not load farms. Create a farm before adding crops.');
      })
      .finally(() => {
        if (mounted) setFarmsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {};
    const area = toPositiveNumber(form.area_acres);
    const notes = form.notes.trim();

    if (!form.farm_id) next.farm_id = 'Select the farm for this crop.';
    if (!form.variety) next.variety = 'Paddy variety is required.';
    if (!form.planting_date) next.planting_date = 'Planting date is required.';
    if (!form.expected_harvest_date)
      next.expected_harvest_date = 'Expected harvest date is required.';
    if (!form.area_acres) next.area_acres = 'Area is required.';
    else if (!area) next.area_acres = 'Area must be greater than zero.';
    if (isAfterDate(form.planting_date, form.expected_harvest_date)) {
      next.expected_harvest_date =
        'Harvest date must be after the planting date.';
    }
    if (notes.length > 500)
      next.notes = 'Notes must be 500 characters or less.';

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
      farm_id: form.farm_id,
      variety: form.variety,
      planting_date: form.planting_date,
      expected_harvest_date: form.expected_harvest_date,
      area_acres: toPositiveNumber(form.area_acres),
      growth_stage: form.growth_stage,
      notes: form.notes.trim() || undefined,
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

  if (farmsLoading) return <Loader />;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      {!farms.length && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Add a farm before creating crop records.{' '}
          <Link to="/farms/new" className="font-black underline">
            Create farm
          </Link>
        </div>
      )}
      <div>
        <label htmlFor="crop_farm" className="label">
          Farm
        </label>
        <select
          id="crop_farm"
          name="farm_id"
          value={form.farm_id}
          onChange={change}
          className={fieldClass(errors, 'farm_id')}
          aria-invalid={Boolean(errors.farm_id)}
          aria-describedby={errors.farm_id ? 'farm_id-error' : undefined}
        >
          <option value="">Select farm</option>
          {farms.map((farm) => (
            <option key={farm._id} value={farm._id}>
              {farm.name}
            </option>
          ))}
        </select>
        {fieldError('farm_id')}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="crop_variety" className="label">
            Variety
          </label>
          <select
            id="crop_variety"
            name="variety"
            value={form.variety}
            onChange={change}
            className={fieldClass(errors, 'variety')}
            aria-invalid={Boolean(errors.variety)}
            aria-describedby={errors.variety ? 'variety-error' : undefined}
          >
            <option value="">Select variety</option>
            {PADDY_VARIETIES.map((variety) => (
              <option key={variety}>{variety}</option>
            ))}
          </select>
          {fieldError('variety')}
        </div>
        <div>
          <label htmlFor="crop_area" className="label">
            Area (acres)
          </label>
          <input
            id="crop_area"
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="crop_planting_date" className="label">
            Planting date
          </label>
          <input
            id="crop_planting_date"
            name="planting_date"
            type="date"
            value={form.planting_date}
            onChange={change}
            className={fieldClass(errors, 'planting_date')}
            aria-invalid={Boolean(errors.planting_date)}
            aria-describedby={
              errors.planting_date ? 'planting_date-error' : undefined
            }
          />
          {fieldError('planting_date')}
        </div>
        <div>
          <label htmlFor="crop_harvest_date" className="label">
            Expected harvest date
          </label>
          <input
            id="crop_harvest_date"
            name="expected_harvest_date"
            type="date"
            value={form.expected_harvest_date}
            onChange={change}
            className={fieldClass(errors, 'expected_harvest_date')}
            aria-invalid={Boolean(errors.expected_harvest_date)}
            aria-describedby={
              errors.expected_harvest_date
                ? 'expected_harvest_date-error'
                : undefined
            }
          />
          {fieldError('expected_harvest_date')}
        </div>
      </div>
      <div>
        <label htmlFor="crop_growth_stage" className="label">
          Growth stage
        </label>
        <select
          id="crop_growth_stage"
          name="growth_stage"
          value={form.growth_stage}
          onChange={change}
          className="input-field"
        >
          {GROWTH_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {formatGrowthStage(stage)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="crop_notes" className="label">
          Notes
        </label>
        <textarea
          id="crop_notes"
          name="notes"
          value={form.notes}
          onChange={change}
          rows={3}
          maxLength={500}
          className={fieldClass(errors, 'notes')}
          placeholder="Pest pressure, fertilizer plan, irrigation notes..."
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={
            errors.notes ? 'notes-error crop_notes_count' : 'crop_notes_count'
          }
        />
        <div className="mt-1 flex items-center justify-between gap-2">
          {fieldError('notes') || <span />}
          <span
            id="crop_notes_count"
            className="text-xs font-semibold text-slate-400"
          >
            {form.notes.length}/500
          </span>
        </div>
      </div>
      <Button type="submit" loading={loading} disabled={!farms.length}>
        Save crop
      </Button>
    </form>
  );
}
