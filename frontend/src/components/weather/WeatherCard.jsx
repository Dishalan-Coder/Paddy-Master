import {
  CloudRain,
  Sun,
  Bug,
  Droplets,
  Wind,
  AlertTriangle,
} from 'lucide-react';
export default function WeatherCard({ data }) {
  if (!data) return null;
  const { current, forecast, alerts } = data;
  const ai = { flood: CloudRain, rain: CloudRain, drought: Sun, pest: Bug };
  const ac = {
    flood: 'bg-red-50 border-red-200 text-red-700',
    rain: 'bg-amber-50 border-amber-200 text-amber-700',
    drought: 'bg-orange-50 border-orange-200 text-orange-700',
    pest: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 capitalize">{data.district}</p>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-bold">
                {Math.round(current.temp)}°C
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {current.description}
              </span>
            </div>
          </div>
          <div className="text-right space-y-1 text-sm text-gray-500">
            <div className="flex items-center gap-1 justify-end">
              <Droplets className="w-3.5 h-3.5" />
              {current.humidity}%
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Wind className="w-3.5 h-3.5" />
              {current.wind_speed}m/s
            </div>
          </div>
        </div>
      </div>
      {alerts?.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const I = ai[a.type] || AlertTriangle;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${ac[a.type] || 'bg-gray-50'} animate-fadeIn`}
              >
                <I className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold capitalize">{a.type}</p>
                  <p className="text-xs mt-0.5 opacity-80">{a.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {forecast?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">5-Day Forecast</h3>
          <div className="flex gap-2 overflow-x-auto">
            {forecast.map((d, i) => (
              <div
                key={i}
                className="flex-shrink-0 text-center px-3 py-2 rounded-lg bg-gray-50 min-w-[80px]"
              >
                <p className="text-xs text-gray-500">
                  {new Date(d.date).toLocaleDateString('en', {
                    weekday: 'short',
                  })}
                </p>
                <p className="text-lg font-bold mt-1">{Math.round(d.temp)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
