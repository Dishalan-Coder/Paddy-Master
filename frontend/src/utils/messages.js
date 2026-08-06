import i18n from '../i18n';

const stripServerPrefix = (message = '') =>
  String(message).replace(/^Value error,\s*/i, '').trim();

const titleize = (value = '') =>
  String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const fieldLabel = (value = '') => {
  const key = String(value).trim().toLowerCase().replace(/\s+/g, '_');
  const map = {
    email: 'email',
    phone: 'phone',
    full_name: 'full_name',
    name: 'common.name',
  };
  return i18n.t(map[key] || value, { defaultValue: titleize(value) });
};

const statusLabel = (value = '') =>
  i18n.t(`statuses.${value}`, { defaultValue: titleize(value) });

const API_MESSAGE_KEYS = {
  'All market prices must be greater than zero': 'api_errors.market_prices_positive',
  'An active subscription already exists': 'api_errors.subscription_exists',
  'Authentication required': 'api_errors.authentication_required',
  'Bank transfer is not awaiting confirmation': 'api_errors.bank_not_awaiting_confirmation',
  'Bank transfer reference is required': 'api_errors.bank_reference_required',
  'Cancelled orders cannot be confirmed': 'api_errors.cancelled_order_confirm',
  'Cancelled orders cannot be paid': 'api_errors.cancelled_order_pay',
  'Crop not found': 'api_errors.crop_not_found',
  'Crop not found or not owned by you': 'api_errors.crop_not_owned',
  'Database unavailable': 'api_errors.database_unavailable',
  "Delete the farm's crops first": 'api_errors.delete_farm_crops_first',
  'Each image must be 5 MB or smaller': 'api_errors.each_image_size',
  'Email or phone already in use': 'api_errors.email_phone_in_use',
  'Email or phone already registered': 'api_errors.email_phone_registered',
  'Expected harvest date must be after planting date': 'validation.harvest_after_planting',
  'Farm not found': 'api_errors.farm_not_found',
  'Farm not found or not owned by you': 'api_errors.farm_not_owned',
  'Farmer subscription required for Marketplace, Smart Advisory, and Orders':
    'api_errors.farmer_premium_required',
  'Image must be 5 MB or smaller': 'validation.image_size_simple',
  'Image storage is currently unavailable': 'api_errors.image_storage_unavailable',
  'Internal server error': 'api_errors.internal_server_error',
  'Invalid credentials': 'api_errors.invalid_credentials',
  'Invalid identifier': 'api_errors.invalid_identifier',
  'Invalid order identifier': 'api_errors.invalid_order_identifier',
  'Invalid order status': 'api_errors.invalid_order_status',
  'Invalid product identifier': 'api_errors.invalid_product_identifier',
  'Invalid product or order identifier': 'api_errors.invalid_product_order_identifier',
  'Invalid Stripe webhook payload': 'api_errors.invalid_stripe_payload',
  'Invalid Stripe webhook signature': 'api_errors.invalid_stripe_signature',
  'Invalid token': 'api_errors.invalid_token',
  'Invalid token subject': 'api_errors.invalid_token_subject',
  'Invalid or expired token': 'api_errors.invalid_expired_token',
  'Message cannot be empty': 'api_errors.message_empty',
  'Minimum price cannot exceed maximum price': 'api_errors.min_price_exceeds_max',
  'No valid fields to update': 'api_errors.no_valid_fields',
  'Notification not found': 'api_errors.notification_not_found',
  'Only bank transfers require administrator confirmation': 'api_errors.only_bank_confirm',
  'Only delivered purchases can be reviewed': 'api_errors.only_delivered_review',
  'Order is already paid': 'api_errors.order_already_paid',
  'Order not found': 'api_errors.order_not_found',
  'Order status changed; refresh and try again': 'api_errors.order_status_changed',
  'Payment is already confirmed': 'api_errors.payment_already_confirmed',
  'Payment must be confirmed before delivery': 'api_errors.payment_before_delivery',
  'Payment state changed; refresh and try again': 'api_errors.payment_state_changed',
  'Phone number is required': 'validation.phone_required',
  'Phone number must be exactly 10 digits': 'validation.phone_exact_digits',
  'Phone number must start with 07': 'validation.phone_starts_07',
  'Product not found': 'api_errors.product_not_found',
  'Product not found or not available': 'api_errors.product_not_available',
  'PUBLIC_SITE_URL is not configured.': 'api_errors.public_site_url_missing',
  'Receiver not found': 'api_errors.receiver_not_found',
  'Select a valid district': 'validation.district_invalid',
  'Select a valid market price unit': 'api_errors.market_price_unit_invalid',
  'Start a subscription before opening billing management': 'api_errors.start_subscription_first',
  'Status field required': 'api_errors.status_required',
  'Stripe secret key is not configured.': 'api_errors.stripe_secret_missing',
  'Stripe webhook secret is not configured.': 'api_errors.stripe_webhook_missing',
  'Stripe signature header is missing': 'api_errors.stripe_signature_missing',
  'Subscriptions are available for farmers and buyers only': 'api_errors.subscription_role_only',
  'This order has already been reviewed': 'api_errors.order_already_reviewed',
  'This subscription plan is not available for your role': 'api_errors.subscription_plan_role',
  'Upload a maximum of 5 images': 'validation.image_max',
  'Use a JPG, PNG, or WebP image': 'api_errors.profile_image_type',
  'User not found': 'api_errors.user_not_found',
  'You cannot delete your own admin account': 'api_errors.delete_own_admin',
  'You cannot message yourself': 'api_errors.message_self',
  'You cannot order your own product': 'api_errors.order_own_product',
  'Only numbers can be entered': 'validation.only_numbers',
  'Your 21-day free access has ended. Start the LKR 150 farmer subscription to continue.':
    'api_errors.farmer_trial_expired',
};

const API_MESSAGE_OPTIONS = {
  'Phone number must be exactly 10 digits': { count: 10 },
  'Upload a maximum of 5 images': { count: 5 },
};

const API_MESSAGE_PATTERNS = [
  {
    pattern: /^(.+) already registered$/i,
    translate: ([, field]) =>
      i18n.t('api_errors.field_already_registered', {
        field: fieldLabel(field),
        defaultValue: `${fieldLabel(field)} already registered`,
      }),
  },
  {
    pattern: /^(.+) cannot contain numbers$/i,
    translate: ([, field]) =>
      i18n.t('validation.no_numbers', {
        field: fieldLabel(field),
        defaultValue: `${fieldLabel(field)} cannot contain numbers.`,
      }),
  },
  {
    pattern: /^Only ([\d.]+)kg available$/i,
    translate: ([, quantity]) =>
      i18n.t('api_errors.only_quantity_available', {
        quantity,
        defaultValue: `Only ${quantity} kg available`,
      }),
  },
  {
    pattern: /^Order is already (.+)$/i,
    translate: ([, status]) =>
      i18n.t('api_errors.order_already_status', {
        status: statusLabel(status),
        defaultValue: `Order is already ${status}`,
      }),
  },
  {
    pattern: /^Cannot change order from (.+) to (.+)$/i,
    translate: ([, from, to]) =>
      i18n.t('api_errors.order_transition_invalid', {
        from: statusLabel(from),
        to: statusLabel(to),
        defaultValue: `Cannot change order from ${from} to ${to}`,
      }),
  },
  {
    pattern: /^Unsupported image type: (.+)$/i,
    translate: ([, type]) =>
      i18n.t('api_errors.unsupported_image_type', {
        type,
        defaultValue: `Unsupported image type: ${type}`,
      }),
  },
  {
    pattern: /^Access denied\. Required role: (.+)$/i,
    translate: ([, role]) =>
      i18n.t('api_errors.access_denied_role', {
        role,
        defaultValue: `Access denied. Required role: ${role}`,
      }),
  },
  {
    pattern: /^Could not create Stripe checkout session: (.+)$/i,
    translate: ([, reason]) =>
      i18n.t('api_errors.stripe_checkout_create_failed', {
        reason,
        defaultValue: `Could not create Stripe checkout session: ${reason}`,
      }),
  },
  {
    pattern: /^Could not create Stripe billing portal session: (.+)$/i,
    translate: ([, reason]) =>
      i18n.t('api_errors.stripe_portal_create_failed', {
        reason,
        defaultValue: `Could not create Stripe billing portal session: ${reason}`,
      }),
  },
];

export const translateApiMessage = (message, fallback = '') => {
  if (typeof message !== 'string' || !message.trim()) return fallback;

  const normalized = stripServerPrefix(message);
  const key =
    API_MESSAGE_KEYS[normalized] ||
    API_MESSAGE_KEYS[normalized.replace(/\.$/, '')];

  if (key) {
    return i18n.t(key, {
      ...(API_MESSAGE_OPTIONS[normalized] || {}),
      defaultValue: normalized,
    });
  }

  for (const { pattern, translate } of API_MESSAGE_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) return translate(match);
  }

  return normalized || fallback;
};
