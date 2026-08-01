import { useTranslation } from 'react-i18next';
import { BadgeCheck, Star } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

function Stars({ value }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewList({ data }) {
  const { t } = useTranslation();
  const reviews = data?.reviews || [];
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
            {t('review.verified_purchases')}
          </p>
          <h2 className="mt-1 text-xl font-black">{t('review.buyer_reviews')}</h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
          <span className="text-2xl font-black text-amber-800">
            {Number(data?.average_rating || 0).toFixed(1)}
          </span>
          <div>
            <Stars value={data?.average_rating || 0} />
            <p className="mt-0.5 text-xs text-amber-700">
              {t('review.count', { count: data?.total || 0 })}
            </p>
          </div>
        </div>
      </div>
      {!reviews.length && (
        <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
          {t('review.empty')}
        </p>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <article
            key={review._id}
            className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-sm font-black text-white">
                  {review.buyer_name?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="flex items-center gap-1 text-sm font-black">
                    {review.buyer_name}
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>
              <Stars value={review.rating} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {review.comment}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
