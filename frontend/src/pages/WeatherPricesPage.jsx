import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudSun, TrendingUp } from 'lucide-react';
import WeatherCard from '../components/weather/WeatherCard';
import MarketPriceList from '../components/prices/MarketPriceList';
import PriceTrendChart from '../components/prices/PriceTrendChart';
import BuyerPriceForm from '../components/prices/BuyerPriceForm';
import ChatBox from '../components/chat/ChatBox';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';
import useFetch from '../hooks/useFetch';
import weatherService from '../services/weatherService';
import priceService from '../services/priceService';
import { useAuth } from '../context/AuthContext';
import { DISTRICTS, MARKET_PRICE_UNITS } from '../utils/constants';
import { formatDistrict } from '../utils/formatters';

export default function WeatherPricesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [district, setDistrict] = useState(user?.district || 'Anuradhapura');
  const [priceUnitKg, setPriceUnitKg] = useState(MARKET_PRICE_UNITS[0]);
  const [chatReceiverId, setChatReceiverId] = useState('');
  const {
    data: weather,
    loading: weatherLoading,
    error: weatherError,
  } = useFetch(
    () => weatherService.getWeather(district.toLowerCase()),
    [district],
  );
  const {
    data: prices,
    loading: pricesLoading,
    error: pricesError,
    refetch: refetchPrices,
  } = useFetch(
    () => priceService.getPrices({ price_unit_kg: priceUnitKg }),
    [priceUnitKg],
  );
  if (weatherLoading || pricesLoading) return <Loader />;
  const chatConversationId = chatReceiverId
    ? [user?.id, chatReceiverId].filter(Boolean).sort().join('-')
    : '';
  return (
    <div className="space-y-7 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">{t('pages.weather_prices.kicker')}</p>
          <h1 className="page-title">{t('pages.weather_prices.title')}</h1>
          <p className="page-copy">
            {t('pages.weather_prices.copy')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field w-auto min-w-52"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          >
            {DISTRICTS.map((item) => (
              <option key={item} value={item}>
                {formatDistrict(item)}
              </option>
            ))}
          </select>
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
      </div>
      <ErrorAlert message={weatherError || pricesError} />
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CloudSun className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-black">
              {t('pages.weather_prices.field_conditions')}
            </h2>
          </div>
          <WeatherCard data={weather} />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-black">
              {t('pages.weather_prices.price_intelligence')}
            </h2>
          </div>
          {user?.role === 'buyer' && (
            <BuyerPriceForm
              priceUnitKg={prices?.selected_unit_kg || priceUnitKg}
              currentOffer={prices?.current_buyer_offer}
              onSaved={refetchPrices}
            />
          )}
          <MarketPriceList
            latest={prices?.latest}
            regional={prices?.regional}
            buyerPrices={prices?.buyer_prices}
            canContact={user?.role === 'farmer'}
            currentUserId={user?.id}
            onContactBuyer={setChatReceiverId}
          />
          <PriceTrendChart
            trend={prices?.trend}
            priceUnitKg={prices?.selected_unit_kg || priceUnitKg}
          />
        </div>
      </div>
      {chatReceiverId && (
        <ChatBox
          receiverId={chatReceiverId}
          conversationId={chatConversationId}
          onClose={() => setChatReceiverId('')}
        />
      )}
    </div>
  );
}
