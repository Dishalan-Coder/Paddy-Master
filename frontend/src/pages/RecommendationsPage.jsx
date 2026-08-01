import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import recommendationService from '../services/recommendationService';
import AdvisoryChat from '../components/recommendations/AdvisoryChat';
import RecommendationList from '../components/recommendations/RecommendationList';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const { data, loading, error } = useFetch(
    () => recommendationService.getAll(),
    [],
  );
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="page-kicker">{t('pages.recommendations.kicker')}</p>
          <h1 className="page-title">{t('pages.recommendations.title')}</h1>
          <p className="page-copy">
            {t('pages.recommendations.copy')}
          </p>
        </div>
      </div>
      <ErrorAlert message={error} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 space-y-3">
          <h2 className="text-lg font-black text-slate-900">
            {t('pages.recommendations.cards_title')}
          </h2>
          {loading ? (
            <Loader />
          ) : (
            <RecommendationList recommendations={data?.recommendations || []} />
          )}
        </section>
        <AdvisoryChat />
      </div>
    </div>
  );
}
