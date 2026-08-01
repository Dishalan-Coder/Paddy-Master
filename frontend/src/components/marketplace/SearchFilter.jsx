import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { DISTRICTS } from '../../utils/constants';
import { formatDistrict } from '../../utils/formatters';

export default function SearchFilter({
  filters,
  onChange,
  onReset,
  totalResults,
}) {
  const { t } = useTranslation();
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const setSort = (value) => {
    if (value === 'price_asc')
      onChange({ ...filters, sort_by: 'price_per_kg', sort_order: 1 });
    else if (value === 'price_desc')
      onChange({ ...filters, sort_by: 'price_per_kg', sort_order: -1 });
    else onChange({ ...filters, sort_by: 'created_at', sort_order: -1 });
  };
  const sortValue =
    filters.sort_by === 'price_per_kg'
      ? filters.sort_order === 1
        ? 'price_asc'
        : 'price_desc'
      : 'newest';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-white rounded-lg border px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            value={filters.variety || ''}
            onChange={(event) => set('variety', event.target.value)}
            placeholder={t('common.search_variety_placeholder')}
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {filters.variety && (
            <button
              type="button"
              onClick={() => set('variety', '')}
              aria-label={t('common.clear_search')}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {totalResults} {t('common.listings')}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.region || ''}
          onChange={(event) => set('region', event.target.value)}
          className="input-field py-2 text-sm w-auto"
        >
          <option value="">{t('common.all_regions')}</option>
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {formatDistrict(district)}
            </option>
          ))}
        </select>
        <select
          value={sortValue}
          onChange={(event) => setSort(event.target.value)}
          className="input-field py-2 text-sm w-auto"
        >
          <option value="newest">{t('common.newest')}</option>
          <option value="price_asc">{t('common.price_low_high')}</option>
          <option value="price_desc">{t('common.price_high_low')}</option>
        </select>
        <label className="flex items-center gap-2 text-sm bg-white border rounded-lg px-3">
          <input
            type="checkbox"
            checked={filters.is_organic === true}
            onChange={(event) =>
              set('is_organic', event.target.checked ? true : undefined)
            }
          />
          {t('pages.marketplace.organic_only')}
        </label>
        {(filters.variety || filters.region || filters.is_organic) && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-red-500 font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> {t('common.clear')}
          </button>
        )}
      </div>
    </div>
  );
}
