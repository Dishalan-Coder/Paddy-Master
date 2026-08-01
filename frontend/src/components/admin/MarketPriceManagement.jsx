import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import priceService from '../../services/priceService';
import { MARKET_PRICE_UNITS, PADDY_VARIETIES } from '../../utils/constants';
import { formatVariety } from '../../utils/formatters';
import { getApiErrorMessage } from '../../utils/forms';

const priceKey = (variety) => variety.toLowerCase().replaceAll(' ', '_');

export default function MarketPriceManagement() {
  const { t } = useTranslation();
  const initialPrices = useMemo(
    () =>
      Object.fromEntries(
        PADDY_VARIETIES.map((variety) => [priceKey(variety), '']),
      ),
    [],
  );
  const [prices, setPrices] = useState(initialPrices);
  const [region, setRegion] = useState('national');
  const [priceUnitKg, setPriceUnitKg] = useState(MARKET_PRICE_UNITS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setError(t('pages.admin.enter_price'));
      return;
    }
    if (
      Object.values(cleanPrices).some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      setError(t('pages.admin.positive_price'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await priceService.updatePrices({
        region,
        prices: cleanPrices,
        price_unit_kg: priceUnitKg,
      });
      setSuccess(true);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, t('pages.admin.price_failed')),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-5">
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {t('pages.admin.price_updated')}
        </div>
      )}

      <div>
        <label className="label" htmlFor="market-region">
          {t('region')}
        </label>
        <select
          id="market-region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="input-field"
        >
          <option value="national">{t('pages.admin.national')}</option>
          <option value="anuradhapura">
            {t('districts.Anuradhapura')}
          </option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="market-price-unit">
          {t('pages.admin.price_unit')}
        </label>
        <select
          id="market-price-unit"
          value={priceUnitKg}
          onChange={(event) => {
            setPriceUnitKg(Number(event.target.value));
            setSuccess(false);
            setError('');
          }}
          className="input-field"
        >
          {MARKET_PRICE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t('prices.unit_kg', { unit })}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {Object.entries(prices).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 items-center gap-3">
            <label
              className="text-sm font-medium capitalize"
              htmlFor={`price-${key}`}
            >
              {formatVariety(key)}
            </label>
            <input
              id={`price-${key}`}
              type="number"
              min="0.01"
              step="0.01"
              value={value}
              onChange={(event) => handlePriceChange(key, event.target.value)}
              className="input-field"
              placeholder={t('prices.price_for_unit', { unit: priceUnitKg })}
            />
          </div>
        ))}
      </div>

      <Button type="submit" loading={loading}>
        {t('common.update_prices')}
      </Button>
    </form>
  );
}
