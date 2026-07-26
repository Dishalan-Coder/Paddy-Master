import { Sparkles } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import recommendationService from '../services/recommendationService';
import RecommendationList from '../components/recommendations/RecommendationList';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';

export default function RecommendationsPage() {
  const { data, loading, error } = useFetch(
    () => recommendationService.getAll(),
    [],
  );
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="page-kicker">Rule-based farm guidance</p>
          <h1 className="page-title">Smart advisory</h1>
          <p className="page-copy">
            Recommendations use crop growth stages, harvest dates, district, and
            available weather alerts. Confirm chemical and dosage decisions with
            a qualified local agriculture officer.
          </p>
        </div>
      </div>
      <ErrorAlert message={error} />
      {loading ? (
        <Loader />
      ) : (
        <RecommendationList recommendations={data?.recommendations || []} />
      )}
    </div>
  );
}
