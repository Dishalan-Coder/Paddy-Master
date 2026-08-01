import i18n from '../i18n';

const language = () =>
  (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];

const locale = () => (language() === 'ta' ? 'ta-LK' : 'en-LK');

const titleize = (value = '') =>
  String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const keyify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const WEATHER_ALERT_MESSAGE_KEYS = {
  'Light rain is expected. Review irrigation and avoid unnecessary pesticide spraying.':
    'weather.alert_messages.light_rain',
  'Warm, humid conditions may increase fungal and pest pressure. Inspect field edges.':
    'weather.alert_messages.warm_humid_pest',
  'Little rain and high temperatures are expected. Review irrigation.':
    'weather.alert_messages.low_rain_heat',
  'High humidity may increase pest and fungal disease risk.':
    'weather.alert_messages.high_humidity_pest',
};

const RECOMMENDATION_MESSAGE_KEYS = {
  'Keep the field moist and inspect seedling establishment daily.':
    'recommendation_messages.planted',
  'Maintain shallow water and remove early weeds.':
    'recommendation_messages.germination',
  'Review the first top-dressing schedule and monitor leaf colour.':
    'recommendation_messages.tillering',
  'Check nitrogen and potassium needs before panicle initiation.':
    'recommendation_messages.stem_elongation',
  'Inspect for leaf folder, stem borer, and fungal symptoms.':
    'recommendation_messages.booting',
  'Avoid water stress while panicles are emerging.':
    'recommendation_messages.heading',
  'Avoid pesticide spraying during peak flowering hours.':
    'recommendation_messages.flowering',
  'Maintain adequate moisture, then reduce water gradually.':
    'recommendation_messages.grain_filling',
  'Drain the field and prepare labour, bags, and transport.':
    'recommendation_messages.maturity',
  'Inspect the crop and record the current growth stage.':
    'recommendation_messages.crop_care',
  'Review local weather conditions.':
    'recommendation_messages.weather_fallback',
};

const NOTIFICATION_TITLE_KEYS = {
  'Bank transfer confirmed': 'notification_titles.bank_transfer_confirmed',
  'Buyer payment confirmed': 'notification_titles.buyer_payment_confirmed',
  'Crop check reminder': 'notification_titles.crop_check_reminder',
  'Crop protection': 'notification_titles.crop_protection',
  'Demo environment ready': 'notification_titles.demo_environment_ready',
  'Fertilizer reminder': 'notification_titles.fertilizer_reminder',
  'Harvest reminder': 'notification_titles.harvest_reminder',
  'Harvest scheduling reminder': 'notification_titles.harvest_scheduling_reminder',
  'Irrigation reminder': 'notification_titles.irrigation_reminder',
  'New marketplace order': 'notification_titles.new_marketplace_order',
  'Order confirmed': 'notification_titles.order_confirmed',
  'Order placed': 'notification_titles.order_placed',
  'Payment updated': 'notification_titles.payment_updated',
  'Pest inspection': 'notification_titles.pest_inspection',
  'Welcome to Paddy Master': 'notification_titles.welcome',
};

const NOTIFICATION_MESSAGE_KEYS = {
  'Your account is ready. Complete your profile and start using your role-based workspace.':
    'notification_messages.welcome',
  'Keep the newly planted field evenly moist and check water depth.':
    'notification_messages.planted',
  'Maintain shallow water and inspect seedling establishment.':
    'notification_messages.germination',
  'Review the top-dressing schedule and monitor paddy leaf colour.':
    'notification_messages.tillering',
  'Check nitrogen and potassium needs before panicle initiation.':
    'notification_messages.stem_elongation',
  'Inspect the crop for stem borer, leaf folder, and fungal symptoms.':
    'notification_messages.booting',
  'Avoid water stress while panicles are emerging.':
    'notification_messages.heading',
  'Inspect pest pressure and avoid spraying during peak flowering.':
    'notification_messages.flowering',
  'Maintain adequate moisture, then reduce water gradually.':
    'notification_messages.grain_filling',
  'Drain the field and confirm labour, bags, transport, and buyer plans.':
    'notification_messages.maturity',
  'Inspect the field and update the crop growth stage.':
    'notification_messages.crop_check',
  'Review water level in the Nadu field before evening.':
    'notification_messages.demo_irrigation',
  'Your Samba order has been confirmed by the farmer.':
    'notification_messages.demo_order_confirmed',
  'Farmer, buyer, product, price, and order sample data is available.':
    'notification_messages.demo_environment',
};

export const formatCurrency = (a) =>
  `${i18n.t('rs', { defaultValue: 'Rs.' })} ${Number(a).toLocaleString(locale(), { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(locale(), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';
export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleDateString(locale(), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
export const daysUntil = (d) =>
  Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
export const formatGrowthStage = (s) =>
  i18n.t(`growth_stages.${s}`, { defaultValue: titleize(s) });
export const formatOrderStatus = (s) =>
  i18n.t(`statuses.${s}`, {
    defaultValue: i18n.t(`statuses.${keyify(s)}`, {
      defaultValue: titleize(s),
    }),
  });
export const formatPaymentMethod = (s) =>
  i18n.t(`payment_methods.${s}`, { defaultValue: titleize(s) });
export const formatRole = (s) =>
  i18n.t(`roles.${s}`, { defaultValue: titleize(s) });
export const formatDistrict = (s) =>
  i18n.t(`districts.${s}`, {
    defaultValue: i18n.t(`districts.${titleize(s)}`, {
      defaultValue: s || '',
    }),
  });
export const formatVariety = (s) =>
  i18n.t(`paddy_varieties.${s}`, { defaultValue: s || '' });
export const formatSoilType = (s) =>
  i18n.t(`soil_types.${s}`, { defaultValue: s || '' });
export const formatExpenseCategory = (s) =>
  i18n.t(`expense_categories.${s}`, { defaultValue: titleize(s) });
export const formatWeatherAlertType = (s) =>
  i18n.t(`weather_alerts.${s}`, {
    defaultValue: i18n.t(`weather_alerts.${keyify(s)}`, {
      defaultValue: titleize(s),
    }),
  });
export const formatPriority = (s) =>
  i18n.t(`priorities.${s}`, { defaultValue: titleize(s) });

export const formatWeatherDescription = (description) =>
  i18n.t(`weather.descriptions.${keyify(description)}`, {
    defaultValue: description || '',
  });

export const formatWeatherAlertMessage = (message) => {
  const key = WEATHER_ALERT_MESSAGE_KEYS[message];
  if (key) return i18n.t(key, { defaultValue: message });

  const heavyRain = String(message || '').match(
    /^Heavy rain expected \(([\d.]+)mm\/3h\)\. Check field drainage\.$/i,
  );
  if (heavyRain) {
    return i18n.t('weather.alert_messages.heavy_rain', {
      amount: heavyRain[1],
      defaultValue: message,
    });
  }

  const rain = String(message || '').match(
    /^Rain expected \(([\d.]+)mm\/3h\)\. Delay pesticide application\.$/i,
  );
  if (rain) {
    return i18n.t('weather.alert_messages.rain_delay_spray', {
      amount: rain[1],
      defaultValue: message,
    });
  }

  return message || '';
};

export const formatWeatherAlertTime = (time) =>
  i18n.t(`weather.alert_times.${keyify(time)}`, { defaultValue: time || '' });

export const formatRecommendationCategory = (category) =>
  i18n.t(`recommendation_categories.${keyify(category)}`, {
    defaultValue: category || '',
  });

export const formatRecommendationTitle = (item = {}) => {
  if (item.category === 'Weather alert') {
    return formatWeatherAlertType(item.title || item.type || item.category);
  }

  const category = formatRecommendationCategory(item.category);
  const titleMatch = String(item.title || '').match(/^(.+) for (.+)$/i);
  const variety = formatVariety(item.crop_variety || titleMatch?.[2]);

  if (category && variety) {
    return i18n.t('recommendation_titles.for_crop', {
      category,
      variety,
      defaultValue: item.title || `${category} for ${variety}`,
    });
  }

  return item.title || category;
};

export const formatRecommendationMessage = (message) => {
  const key = RECOMMENDATION_MESSAGE_KEYS[message];
  if (key) return i18n.t(key, { defaultValue: message });
  return formatWeatherAlertMessage(message);
};

export const formatNotificationTitle = (title) => {
  const orderStatus = String(title || '').match(/^Order (.+)$/i);
  if (orderStatus) {
    return i18n.t('notification_titles.order_status', {
      status: formatOrderStatus(orderStatus[1]),
      defaultValue: title,
    });
  }

  const key = NOTIFICATION_TITLE_KEYS[title];
  if (key) return i18n.t(key, { defaultValue: title });
  return title || '';
};

export const formatNotificationMessage = (message) => {
  const text = String(message || '');
  const key = NOTIFICATION_MESSAGE_KEYS[text];
  if (key) return i18n.t(key, { defaultValue: text });

  const paymentStatus = text.match(
    /^Payment for order #?([A-Za-z0-9]+) is (.+)\.$/i,
  );
  if (paymentStatus) {
    return i18n.t('notification_messages.payment_status', {
      code: paymentStatus[1].toUpperCase(),
      status: formatOrderStatus(paymentStatus[2]),
      defaultValue: text,
    });
  }

  const paymentConfirmed = text.match(
    /^Payment for order #([A-Za-z0-9]+) has been confirmed\.$/i,
  );
  if (paymentConfirmed) {
    return i18n.t('notification_messages.payment_confirmed', {
      code: paymentConfirmed[1].toUpperCase(),
      defaultValue: text,
    });
  }

  const bankConfirmed = text.match(
    /^Bank transfer for order #([A-Za-z0-9]+) has been confirmed\.$/i,
  );
  if (bankConfirmed) {
    return i18n.t('notification_messages.bank_confirmed', {
      code: bankConfirmed[1].toUpperCase(),
      defaultValue: text,
    });
  }

  const orderPlaced = text.match(
    /^Your (.+) order #([A-Za-z0-9]+) has been sent to the farmer\.$/i,
  );
  if (orderPlaced) {
    return i18n.t('notification_messages.order_placed', {
      variety: formatVariety(orderPlaced[1]),
      code: orderPlaced[2].toUpperCase(),
      defaultValue: text,
    });
  }

  const newOrder = text.match(/^A buyer ordered ([\d.]+) kg of (.+)\.$/i);
  if (newOrder) {
    return i18n.t('notification_messages.new_order', {
      quantity: newOrder[1],
      variety: formatVariety(newOrder[2]),
      defaultValue: text,
    });
  }

  const buyerStatus = text.match(
    /^Your order #([A-Za-z0-9]+) is now (.+)\.$/i,
  );
  if (buyerStatus) {
    return i18n.t('notification_messages.buyer_order_status', {
      code: buyerStatus[1].toUpperCase(),
      status: formatOrderStatus(buyerStatus[2]),
      defaultValue: text,
    });
  }

  const farmerStatus = text.match(/^Order #([A-Za-z0-9]+) is now (.+)\.$/i);
  if (farmerStatus) {
    return i18n.t('notification_messages.farmer_order_status', {
      code: farmerStatus[1].toUpperCase(),
      status: formatOrderStatus(farmerStatus[2]),
      defaultValue: text,
    });
  }

  const harvestDue = text.match(
    /^(.+) is due for harvest in about (\d+) days\. Confirm labour, bags, transport, and buyer arrangements\.$/i,
  );
  if (harvestDue) {
    return i18n.t('notification_messages.harvest_due', {
      variety: formatVariety(harvestDue[1]),
      count: Number(harvestDue[2]),
      defaultValue: text,
    });
  }

  return text;
};
