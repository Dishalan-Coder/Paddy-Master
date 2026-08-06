import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatDistrict,
  formatVariety,
} from '../../utils/formatters';
import { PADDY_VARIETIES } from '../../utils/constants';

const varietyKey = (variety) =>
  variety
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const preferredVarieties = PADDY_VARIETIES.map(varietyKey);

const priceValue = (offer, key) => {
  const value = offer?.prices?.[key];
  return Number.isFinite(Number(value)) ? Number(value) : null;
};

const getVarietyKeys = (buyerPrices, latest) => {
  const keys = new Set();
  buyerPrices?.forEach((offer) => {
    Object.keys(offer.prices || {}).forEach((key) => keys.add(key));
  });
  Object.keys(latest?.prices || {}).forEach((key) => keys.add(key));
  const ordered = preferredVarieties.filter((key) => keys.has(key));
  const remaining = Array.from(keys).filter(
    (key) => !preferredVarieties.includes(key),
  );
  return [...ordered, ...remaining];
};

export default function MarketPriceList({
  latest,
  regional,
  buyerPrices,
  canContact = false,
  currentUserId,
  onContactBuyer,
}) {
  const { t } = useTranslation();
  const priceUnitKg = latest?.price_unit_kg || 72;
  const offers = buyerPrices || [];
  const varietyKeys = getVarietyKeys(offers, latest);

  if (offers.length > 0) {
    const bestByVariety = Object.fromEntries(
      varietyKeys.map((key) => {
        const values = offers
          .map((offer) => priceValue(offer, key))
          .filter((value) => value !== null);
        return [key, values.length ? Math.max(...values) : null];
      }),
    );

    return (
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">{t('prices.buyer_offers')}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {t('prices.buyer_offers_copy')}
            </p>
          </div>
          <span className="rounded-full bg-paddy-50 px-3 py-1 text-xs font-black text-paddy-700">
            {t('prices.per_unit', { unit: priceUnitKg })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 pr-4 text-left font-semibold">
                  {t('common.buyer')}
                </th>
                <th className="pb-3 pr-4 text-left font-semibold">
                  {t('region')}
                </th>
                {varietyKeys.map((key) => (
                  <th key={key} className="pb-3 pr-4 text-right font-semibold">
                    {formatVariety(key)}
                  </th>
                ))}
                <th className="pb-3 pr-4 text-right font-semibold">
                  {t('prices.best_offer')}
                </th>
                <th className="pb-3 text-right font-semibold">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {offers.map((offer) => {
                const isOwnOffer = offer.buyer_id === currentUserId;
                return (
                  <tr key={offer._id || offer.buyer_id}>
                    <td className="py-3 pr-4 align-top">
                      <p className="font-black text-slate-800">
                        {offer.buyer_name || t('prices.wholesale_buyer')}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {t('prices.updated_on', {
                          date: formatDate(offer.date),
                        })}
                      </p>
                    </td>
                    <td className="py-3 pr-4 align-top text-slate-600">
                      {formatDistrict(
                        offer.region || offer.buyer_district || '',
                      )}
                    </td>
                    {varietyKeys.map((key) => {
                      const value = priceValue(offer, key);
                      const isBest =
                        value !== null && value === bestByVariety[key];
                      return (
                        <td
                          key={key}
                          className={`py-3 pr-4 text-right align-top font-semibold ${isBest ? 'text-emerald-700' : 'text-slate-700'}`}
                        >
                          {value !== null ? formatCurrency(value) : '-'}
                        </td>
                      );
                    })}
                    <td className="py-3 pr-4 text-right align-top font-black text-slate-900">
                      {formatCurrency(offer.best_offer || 0)}
                    </td>
                    <td className="py-3 text-right align-top">
                      {canContact && !isOwnOffer ? (
                        <button
                          type="button"
                          onClick={() => onContactBuyer?.(offer.buyer_id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-800"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {t('common.sell_to_buyer')}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          {isOwnOffer ? t('common.my_offer') : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!latest?.prices)
    return (
      <p className="text-gray-400 text-sm py-8 text-center">
        {t('common.no_data')}
      </p>
    );
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{t('prices.today')}</h3>
          <span className="rounded-full bg-paddy-50 px-3 py-1 text-xs font-black text-paddy-700">
            {t('prices.per_unit', { unit: priceUnitKg })}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(latest.prices).map(([v, p]) => (
            <div key={v} className="text-center p-4 rounded-lg bg-paddy-50">
              <p className="text-sm text-paddy-700 font-medium capitalize">
                {formatVariety(v)}
              </p>
              <p className="text-2xl font-bold text-paddy-900 mt-1">
                {formatCurrency(p)}
              </p>
              <p className="text-xs text-gray-500">
                {t('prices.per_unit', { unit: priceUnitKg })}
              </p>
            </div>
          ))}
        </div>
      </div>
      {regional?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">{t('prices.regional')}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3">{t('region')}</th>
                {Object.keys(latest.prices).map((v) => (
                  <th key={v} className="text-right pb-3 capitalize">
                    {formatVariety(v)}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {t('prices.unit_kg', { unit: priceUnitKg })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {regional.map((r) => (
                <tr key={r._id}>
                  <td className="py-3 capitalize">{formatDistrict(r.region)}</td>
                  {Object.keys(latest.prices).map((v) => (
                    <td key={v} className="py-3 text-right font-semibold">
                      {formatCurrency(r.prices?.[v] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
