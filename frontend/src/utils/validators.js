export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export const validateEmail = (email = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export const getNameValidationError = (name = '', label = 'Name') =>
  /\d/.test(name.trim()) ? `${label} cannot contain numbers.` : '';

export const validateName = (name = '') => !getNameValidationError(name);

export const getPhoneValidationError = (phone = '') => {
  const value = phone.trim();
  if (!value) return 'Phone number is required.';
  if (!/^\d+$/.test(value)) return 'Only numbers can be entered.';
  if (!value.startsWith('07')) return 'Phone number must start with 07.';
  if (value.length !== 10) return 'Phone number must be exactly 10 digits.';
  return '';
};

export const validatePhone = (phone = '') => !getPhoneValidationError(phone);

export const validateLoginId = (loginId = '') =>
  validateEmail(loginId) || validatePhone(loginId);

export const getPasswordValidationError = (
  password = '',
  requiredMessage = 'Password is required.',
) => {
  if (!password) return requiredMessage;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or less.`;
  }
  return '';
};

export const validatePassword = (password = '') =>
  !getPasswordValidationError(password);
