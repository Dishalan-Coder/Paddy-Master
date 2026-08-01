import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Sprout, Trash2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import farmService from '../services/farmService';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';
import Button from '../components/common/Button';
import { formatSoilType } from '../utils/formatters';
import { getApiErrorMessage } from '../utils/forms';

export default function FarmsPage() {
  const { t } = useTranslation();
  const {
    data: farms,
    loading,
    error,
    refetch,
  } = useFetch(() => farmService.getAll(), []);
  const [actionError, setActionError] = useState('');
  const remove = async (farm) => {
    if (
      !window.confirm(
        t('pages.farms.delete_confirm', { name: farm.name }),
      )
    )
      return;
    setActionError('');
    try {
      await farmService.delete(farm._id);
      refetch();
    } catch (requestError) {
      setActionError(
        getApiErrorMessage(requestError, t('pages.farms.delete_failed')),
      );
    }
  };
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">{t('pages.farms.kicker')}</p>
          <h1 className="page-title">{t('pages.farms.title')}</h1>
          <p className="page-copy">
            {t('pages.farms.copy')}
          </p>
        </div>
        <Link
          to="/farms/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> {t('add_farm')}
        </Link>
      </div>
      <ErrorAlert
        message={error || actionError}
        onDismiss={() => setActionError('')}
      />
      {loading ? (
        <Loader />
      ) : !farms?.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white py-16 text-center">
          <Sprout className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-black">{t('pages.farms.empty_title')}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t('pages.farms.empty_copy')}
          </p>
          <Link to="/farms/new" className="btn-primary mt-5 inline-flex">
            {t('common.create_farm')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {farms.map((farm) => (
            <article
              key={farm._id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Sprout className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  onClick={() => remove(farm)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-5 text-xl font-black">{farm.name}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-emerald-600" />
                {farm.location}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">{t('common.area')}</p>
                  <p className="mt-1 font-black">
                    {farm.area_acres} {t('common.acres')}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">{t('common.soil')}</p>
                  <p className="mt-1 font-black capitalize">
                    {farm.soil_type
                      ? formatSoilType(farm.soil_type)
                      : t('common.not_set')}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
