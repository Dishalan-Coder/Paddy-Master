import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import priceService from '../../services/priceService';
import { useAuth } from '../../context/AuthContext';
import { DISTRICTS, PADDY_VARIETIES } from '../../utils/constants';
import { formatDistrict, formatVariety } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/forms';

const priceKey = (variety) =>
  variety
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const emptyPrices = () =>
  Object.fromEntries(PADDY_VARIETIES.map((variety) => [priceKey(variety), '']));

export default function BuyerPriceForm({
  priceUnitKg,
  currentOffer,
  onSaved,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const initialPrices = useMemo(() => emptyPrices(), []);
  const [prices, setPrices] = useState(initialPrices);
  const [region, setRegion] = useState(user?.district || DISTRICTS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const regionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [currentOffer?.region, user?.district, ...DISTRICTS].filter(Boolean),
        ),
      ),
    [currentOffer?.region, user?.district],
  );

  useEffect(() => {
    const nextPrices = Object.fromEntries(
      PADDY_VARIETIES.map((variety) => {
        const key = priceKey(variety);
        const value = currentOffer?.prices?.[key];
        return [key, value ? String(value) : ''];
      }),
    );
    setPrices(nextPrices);
    setRegion(currentOffer?.region || user?.district || DISTRICTS[0]);
    setError('');
    setSuccess(false);
  }, [currentOffer?._id, currentOffer?.date, priceUnitKg, user?.district]);

  const handlePriceChange = (key, value) => {
    setPrices((current) => ({ ...current, [key]: value }));
    setError('');
    setSuccess(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    const cleanPrices = Object.fromEntries(
      Object.entries(prices)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => [key, Number(value)]),
    );

    if (!Object.keys(cleanPrices).length) {
      setError(t('prices.enter_offer'));
      return;
    }
    if (
      Object.values(cleanPrices).some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      setError(t('prices.positive_offer'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const saved = await priceService.updatePrices({
        region,
        prices: cleanPrices,
        price_unit_kg: priceUnitKg,
      });
      setSuccess(true);
      onSaved?.(saved);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, t('prices.offer_failed')),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{t('prices.my_buyer_prices')}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('prices.my_buyer_prices_copy')}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {t('prices.per_unit', { unit: priceUnitKg })}
        </span>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {t('prices.offer_updated')}
        </div>
      )}

      <div>
        <label className="label" htmlFor="buyer-price-region">
          {t('region')}
        </label>
        <select
          id="buyer-price-region"
          value={region}
          onChange={(event) => {
            setRegion(event.target.value);
            setSuccess(false);
            setError('');
          }}
          className="input-field"
        >
          {regionOptions.map((item) => (
            <option key={item} value={item}>
              {formatDistrict(item)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PADDY_VARIETIES.map((variety) => {
          const key = priceKey(variety);
          return (
            <div key={key}>
              <label
                className="label"
                htmlFor={`buyer-price-${key}`}
              >
                {formatVariety(variety)}
              </label>
              <input
                id={`buyer-price-${key}`}
                type="number"
                min="0.01"
                step="0.01"
                value={prices[key]}
                onChange={(event) =>
                  handlePriceChange(key, event.target.value)
                }
                className="input-field"
                placeholder={t('prices.price_for_unit', {
                  unit: priceUnitKg,
                })}
              />
            </div>
          );
        })}
      </div>

      <Button type="submit" loading={loading} icon={Save}>
        {t('prices.save_offer')}
      </Button>
    </form>
  );
}
