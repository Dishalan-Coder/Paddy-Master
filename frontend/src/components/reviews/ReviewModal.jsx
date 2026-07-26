import { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import reviewService from '../../services/reviewService';
import { fieldClass, getApiErrorMessage, hasErrors } from '../../utils/forms';

export default function ReviewModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const next = {};
    const review = comment.trim();

    if (!rating || rating < 1 || rating > 5) next.rating = 'Choose a rating from 1 to 5 stars.';
    if (!review) next.comment = 'Review comment is required.';
    else if (review.length < 3) next.comment = 'Review must be at least 3 characters.';
    else if (review.length > 1000) next.comment = 'Review must be 1000 characters or less.';

    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await reviewService.create(order.product_id, { order_id: order._id, rating, comment: comment.trim(), image_urls: [] });
      onSuccess?.();
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not submit the review.'));
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) => (
    errors[name] ? <p id={`review_${name}-error`} className="mt-1 text-xs font-semibold text-red-500">{errors[name]}</p> : null
  );

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Verified purchase</p><h3 className="mt-1 text-xl font-black">Review {order.product_variety}</h3></div><button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
          <ErrorAlert message={error} onDismiss={() => setError('')} />
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-1" aria-describedby={errors.rating ? 'review_rating-error' : undefined}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => { setRating(star); setErrors((current) => ({ ...current, rating: '' })); }} aria-label={`${star} star${star === 1 ? '' : 's'}`}>
                  <Star className={`h-8 w-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
            {fieldError('rating')}
          </div>
          <div>
            <label htmlFor="review_comment" className="label">Your experience</label>
            <textarea
              id="review_comment"
              className={fieldClass(errors, 'comment')}
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setErrors((current) => ({ ...current, comment: '' }));
                setError('');
              }}
              placeholder="Describe quality, communication, and delivery…"
              aria-invalid={Boolean(errors.comment)}
              aria-describedby={errors.comment ? 'review_comment-error review_comment_count' : 'review_comment_count'}
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              {fieldError('comment') || <span />}
              <span id="review_comment_count" className="text-xs font-semibold text-slate-400">{comment.length}/1000</span>
            </div>
          </div>
          <div className="flex gap-3"><Button type="submit" loading={loading} className="flex-1">Submit review</Button><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button></div>
        </form>
      </div>
    </div>
  );
}
