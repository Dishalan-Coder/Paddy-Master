export const FARMER_FREE_TRIAL_DAYS = 21;
export const FARMER_MONTHLY_PRICE_LKR = 150;

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const hasActiveSubscription = (source = {}) =>
  Boolean(source?.access?.subscription_active) ||
  Boolean(source?.active) ||
  ACTIVE_STATUSES.has(source?.subscription_status || source?.status);

export const getFreeTrialEndsAt = (user = {}) => {
  if (user?.access?.free_trial_ends_at) {
    return parseDate(user.access.free_trial_ends_at);
  }
  const createdAt = parseDate(user?.created_at) || new Date();
  return new Date(
    createdAt.getTime() + FARMER_FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000,
  );
};

export const isFarmerFreeTrialActive = (user = {}) => {
  if (user?.role !== 'farmer') return false;
  if (typeof user?.access?.free_trial_active === 'boolean') {
    return user.access.free_trial_active;
  }
  return new Date() <= getFreeTrialEndsAt(user);
};

export const hasFarmerPremiumAccess = (user = {}) =>
  user?.role !== 'farmer' ||
  Boolean(user?.access?.premium_features_active) ||
  hasActiveSubscription(user);

export const hasFarmerGeneralAccess = (user = {}) =>
  user?.role !== 'farmer' ||
  Boolean(user?.access?.general_features_active) ||
  hasActiveSubscription(user) ||
  isFarmerFreeTrialActive(user);

export const getFarmerAccessNoticeType = (user = {}) => {
  if (user?.role !== 'farmer') return '';
  if (!hasFarmerPremiumAccess(user)) return 'premium';
  if (!hasFarmerGeneralAccess(user)) return 'trial';
  return '';
};
