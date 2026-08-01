import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CalendarClock,
  Droplets,
  FlaskConical,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  formatPriority,
  formatRecommendationMessage,
  formatRecommendationTitle,
} from '../../utils/formatters';

const iconMap = {
  Fertilizer: FlaskConical,
  Irrigation: Droplets,
  Water: Droplets,
  Harvest: CalendarClock,
  'Pest watch': ShieldAlert,
  'Weather alert': AlertTriangle,
};

export default function RecommendationList({
  recommendations = [],
  compact = false,
}) {
  const { t } = useTranslation();
  if (!recommendations.length)
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
        {t('pages.recommendations.empty')}
      </p>
    );
  return (
    <div className="space-y-3">
      {recommendations.map((item, index) => {
        const Icon = iconMap[item.category] || Sparkles;
        return (
          <article
            key={`${item.title}-${index}`}
            className={`rounded-2xl border bg-white ${item.priority === 'high' ? 'border-amber-200' : 'border-slate-200'} ${compact ? 'p-4' : 'p-5'}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-800">
                    {formatRecommendationTitle(item)}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {formatPriority(item.priority)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {formatRecommendationMessage(item.message)}
                </p>
                {item.days_to_harvest != null && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    {item.days_to_harvest > 0
                      ? t('pages.recommendations.days_to_harvest', {
                          count: item.days_to_harvest,
                        })
                      : t('pages.recommendations.harvest_reached')}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
