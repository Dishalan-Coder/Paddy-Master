import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MarketPriceList from '../components/prices/MarketPriceList';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import useFetch from '../hooks/useFetch';
import priceService from '../services/priceService';
import { MARKET_PRICE_UNITS } from '../utils/constants';

export default function AdminPricesPage() {
  const { t } = useTranslation();
  const [priceUnitKg, setPriceUnitKg] = useState(MARKET_PRICE_UNITS[0]);
  const { data: prices, loading, error } = useFetch(
    () => priceService.getPrices({ price_unit_kg: priceUnitKg }),
    [priceUnitKg],
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">{t('market_prices')}</p>
          <h1 className="page-title">{t('pages.admin.prices_title')}</h1>
          <p className="page-copy">{t('pages.admin.prices_copy')}</p>
        </div>
        <select
          className="input-field w-auto min-w-32"
          value={priceUnitKg}
          onChange={(event) => setPriceUnitKg(Number(event.target.value))}
          aria-label={t('prices.unit_label')}
        >
          {MARKET_PRICE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t('prices.unit_kg', { unit })}
            </option>
          ))}
        </select>
      </div>
      <ErrorAlert message={error} />
      {loading ? (
        <Loader />
      ) : (
        <MarketPriceList
          latest={prices?.latest}
          regional={prices?.regional}
          buyerPrices={prices?.buyer_prices}
        />
      )}
    </div>
  );
}
