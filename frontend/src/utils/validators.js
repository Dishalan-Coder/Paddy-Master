import i18n from '../i18n';

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

const t = (key, defaultValue, options = {}) =>
  i18n.t(key, { defaultValue, ...options });

export const validateEmail = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export const getNameValidationError = (name = '', label = 'Name') =>
  /\d/.test(name.trim())
    ? t('validation.no_numbers', `${label} cannot contain numbers.`, {
        field: label,
      })
    : '';

export const validateName = (name = '') => !getNameValidationError(name);

export const getPhoneValidationError = (phone = '') => {
  const value = phone.trim();
  if (!value) return t('validation.phone_required', 'Phone number is required.');
  if (!/^\d+$/.test(value))
    return t('validation.only_numbers', 'Only numbers can be entered.');
  if (!value.startsWith('07'))
    return t('validation.phone_starts_07', 'Phone number must start with 07.');
  if (value.length !== 10)
    return t(
      'validation.phone_exact_digits',
      'Phone number must be exactly 10 digits.',
      { count: 10 },
    );
  return '';
};

export const validatePhone = (phone = '') => !getPhoneValidationError(phone);

export const validateLoginId = (loginId = '') =>
  validateEmail(loginId) || validatePhone(loginId);

export const getPasswordValidationError = (
  password = '',
  requiredMessage,
) => {
  const required =
    requiredMessage || t('validation.password_required', 'Password is required.');
  if (!password) return required;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return t(
      'validation.password_min',
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      { count: PASSWORD_MIN_LENGTH },
    );
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return t(
      'validation.password_max',
      `Password must be ${PASSWORD_MAX_LENGTH} characters or less.`,
      { count: PASSWORD_MAX_LENGTH },
    );
  }
  return '';
};

export const validatePassword = (password = '') =>
  !getPasswordValidationError(password);
