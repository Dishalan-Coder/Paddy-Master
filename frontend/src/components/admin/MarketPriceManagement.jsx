import { useMemo, useState } from 'react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import priceService from '../../services/priceService';
import { PADDY_VARIETIES } from '../../utils/constants';

const priceKey = (variety) => variety.toLowerCase().replaceAll(' ', '_');

export default function MarketPriceManagement() {
  const initialPrices = useMemo(
    () =>
      Object.fromEntries(
        PADDY_VARIETIES.map((variety) => [priceKey(variety), '']),
      ),
    [],
  );
  const [prices, setPrices] = useState(initialPrices);
  const [region, setRegion] = useState('national');
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
      setError('Enter at least one market price.');
      return;
    }
    if (
      Object.values(cleanPrices).some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      setError('Every entered price must be greater than zero.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await priceService.updatePrices({ region, prices: cleanPrices });
      setSuccess(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Failed to update market prices.',
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
          Market prices updated successfully.
        </div>
      )}

      <div>
        <label className="label" htmlFor="market-region">
          Region
        </label>
        <select
          id="market-region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="input-field"
        >
          <option value="national">National</option>
          <option value="anuradhapura">Anuradhapura</option>
        </select>
      </div>

      <div className="space-y-3">
        {Object.entries(prices).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 items-center gap-3">
            <label
              className="text-sm font-medium capitalize"
              htmlFor={`price-${key}`}
            >
              {key.replaceAll('_', ' ')}
            </label>
            <input
              id={`price-${key}`}
              type="number"
              min="0.01"
              step="0.01"
              value={value}
              onChange={(event) => handlePriceChange(key, event.target.value)}
              className="input-field"
              placeholder="Rs/kg"
            />
          </div>
        ))}
      </div>

      <Button type="submit" loading={loading}>
        Update Prices
      </Button>
    </form>
  );
}
