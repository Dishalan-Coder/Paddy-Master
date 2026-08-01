import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { fieldClass, hasErrors, toPositiveNumber } from '../../utils/forms';
import { formatExpenseCategory } from '../../utils/formatters';

const INITIAL_FORM = {
  crop_id: '',
  category: '',
  amount: '',
  description: '',
  expense_date: '',
};

export default function ExpenseForm({
  cropOptions,
  onSubmit,
  loading,
  serverError,
  onDismissServerError,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
    onDismissServerError?.();
  };

  const validate = () => {
    const next = {};
    const amount = toPositiveNumber(form.amount);
    const description = form.description.trim();

    if (!form.category)
      next.category = t('validation.required', { field: t('common.category') });
    if (!form.amount)
      next.amount = t('validation.required', { field: t('common.amount') });
    else if (!amount)
      next.amount = t('validation.positive', { field: t('common.amount') });
    if (!description)
      next.description = t('validation.required', {
        field: t('description'),
      });
    else if (description.length > 200)
      next.description = t('validation.max_chars', {
        field: t('description'),
        count: 200,
      });
    if (!form.expense_date)
      next.expense_date = t('validation.required', { field: t('common.date') });

    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      crop_id: form.crop_id || undefined,
      category: form.category,
      amount: toPositiveNumber(form.amount),
      description: form.description.trim(),
      expense_date: form.expense_date,
    });
    setForm(INITIAL_FORM);
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
    <form onSubmit={submit} className="space-y-4" noValidate>
      <ErrorAlert
        message={error || serverError}
        onDismiss={() => {
          setError('');
          onDismissServerError?.();
        }}
      />
      {cropOptions?.length > 0 && (
        <div>
          <label htmlFor="expense_crop" className="label">
            {t('farm')}
          </label>
          <select
            id="expense_crop"
            name="crop_id"
            value={form.crop_id}
            onChange={change}
            className="input-field"
          >
            <option value="">{t('forms.general_farm_expense')}</option>
            {cropOptions.map((crop) => (
              <option key={crop._id} value={crop._id}>
                {crop.variety}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="expense_category" className="label">
            {t('common.category')}
          </label>
          <select
            id="expense_category"
            name="category"
            value={form.category}
            onChange={change}
            className={fieldClass(errors, 'category')}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'category-error' : undefined}
          >
            <option value="">{t('forms.select_category')}</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatExpenseCategory(category)}
              </option>
            ))}
          </select>
          {fieldError('category')}
        </div>
        <div>
          <label htmlFor="expense_amount" className="label">
            {t('common.amount_rs')}
          </label>
          <input
            id="expense_amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={change}
            className={fieldClass(errors, 'amount')}
            inputMode="decimal"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
          {fieldError('amount')}
        </div>
      </div>
      <div>
        <label htmlFor="expense_description" className="label">
          {t('description')}
        </label>
        <input
          id="expense_description"
          name="description"
          value={form.description}
          onChange={change}
          className={fieldClass(errors, 'description')}
          maxLength={200}
          placeholder={t('forms.expense_placeholder')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
        />
        {fieldError('description')}
      </div>
      <div>
        <label htmlFor="expense_date" className="label">
          {t('common.date')}
        </label>
        <input
          id="expense_date"
          name="expense_date"
          type="date"
          value={form.expense_date}
          onChange={change}
          className={fieldClass(errors, 'expense_date')}
          aria-invalid={Boolean(errors.expense_date)}
          aria-describedby={
            errors.expense_date ? 'expense_date-error' : undefined
          }
        />
        {fieldError('expense_date')}
      </div>
      <Button type="submit" loading={loading}>
        {t('pages.expenses.add_expense')}
      </Button>
    </form>
  );
}
