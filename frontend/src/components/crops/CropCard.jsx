import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { formatGrowthStage, daysUntil } from '../../utils/formatters';
export default function CropCard({ crop, onEdit, onDelete }) {
  const { t } = useTranslation();
  const days = daysUntil(crop.expected_harvest_date);
  return (
    <div className="card hover:shadow-md transition-shadow animate-fadeIn">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{crop.variety}</h3>
          <p className="text-xs text-gray-400">
            {crop.area_acres} {t('common.acres')}
          </p>
        </div>
        <span className="badge-green">
          {formatGrowthStage(crop.growth_stage)}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>
            {t('pages.crops.harvest_in')}{' '}
            <strong>
              {days > 0
                ? `${days} ${t('days')}`
                : t('common.overdue')}
            </strong>
          </span>
        </div>
      </div>
      {onEdit && onDelete && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(crop)}
            className="text-sm text-paddy-700 font-medium"
          >
            {t('edit')}
          </button>
          <button
            onClick={() => onDelete(crop._id)}
            className="text-sm text-red-500 font-medium"
          >
            {t('delete')}
          </button>
        </div>
      )}
    </div>
  );
}
