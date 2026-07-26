import clsx from 'clsx';

export const getApiErrorMessage = (
  error,
  fallback = 'Something went wrong. Please try again.',
) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(' ');
    return message || fallback;
  }
  if (detail && typeof detail === 'object') {
    return detail.message || fallback;
  }

  return error?.message || fallback;
};

export const fieldClass = (errors, name, base = 'input-field') =>
  clsx(
    base,
    errors?.[name] && 'border-red-300 focus:border-red-500 focus:ring-red-100',
  );

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

export const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

export const isAfterDate = (firstDate, secondDate) =>
  Boolean(firstDate && secondDate) &&
  new Date(firstDate) > new Date(secondDate);
