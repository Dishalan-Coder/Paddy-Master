import { useState } from 'react';
import { CloudSun, TrendingUp } from 'lucide-react';
import WeatherCard from '../components/weather/WeatherCard';
import MarketPriceList from '../components/prices/MarketPriceList';
import PriceTrendChart from '../components/prices/PriceTrendChart';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';
import useFetch from '../hooks/useFetch';
import weatherService from '../services/weatherService';
import priceService from '../services/priceService';
import { useAuth } from '../context/AuthContext';
import { DISTRICTS } from '../utils/constants';

export default function WeatherPricesPage() {
  const { user } = useAuth();
  const [district, setDistrict] = useState(user?.district || 'Anuradhapura');
  const { data: weather, loading: weatherLoading, error: weatherError } = useFetch(() => weatherService.getWeather(district.toLowerCase()), [district]);
  const { data: prices, loading: pricesLoading, error: pricesError } = useFetch(() => priceService.getPrices(), []);
  if (weatherLoading || pricesLoading) return <Loader />;
  return <div className="space-y-7 animate-fadeIn">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="page-kicker">Decision intelligence</p><h1 className="page-title">Weather and market prices</h1><p className="page-copy">Use field conditions, agricultural warnings, regional comparison, and price movement before acting.</p></div><select className="input-field w-auto min-w-52" value={district} onChange={(event) => setDistrict(event.target.value)}>{DISTRICTS.map((item) => <option key={item}>{item}</option>)}</select></div>
    <ErrorAlert message={weatherError || pricesError} />
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]"><div><div className="mb-3 flex items-center gap-2"><CloudSun className="h-5 w-5 text-emerald-700" /><h2 className="text-lg font-black">Field conditions</h2></div><WeatherCard data={weather} /></div><div className="space-y-6"><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-700" /><h2 className="text-lg font-black">Price intelligence</h2></div><MarketPriceList latest={prices?.latest} regional={prices?.regional} /><PriceTrendChart trend={prices?.trend} /></div></div>
  </div>;
}
