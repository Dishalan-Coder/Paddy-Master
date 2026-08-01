import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Leaf,
  MapPin,
  Scale,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-react';
import PlaceOrderButton from '../components/orders/PlaceOrderButton';
import ContactFarmerButton from '../components/chat/ContactFarmerButton';
import ChatBox from '../components/chat/ChatBox';
import ReviewList from '../components/reviews/ReviewList';
import Loader from '../components/common/Loader';
import ErrorAlert from '../components/common/ErrorAlert';
import useFetch from '../hooks/useFetch';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import {
  formatCurrency,
  formatDate,
  formatDistrict,
  formatVariety,
} from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState(null);
  const productLoader = useCallback(() => productService.getById(id), [id]);
  const reviewLoader = useCallback(() => reviewService.getForProduct(id), [id]);
  const {
    data: product,
    loading,
    error,
  } = useFetch(productLoader, [productLoader]);
  const { data: reviews } = useFetch(reviewLoader, [reviewLoader]);

  if (loading) return <Loader />;
  if (error || !product)
    return <ErrorAlert message={error || t('product.not_found')} />;

  const image = product.image_urls?.[0];
  const isOwner = user?.id === product.farmer_id;
  const priceUnitKg = product.price_unit_kg || 72;

  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-fadeIn">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back_to_marketplace')}
      </button>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.03fr_0.97fr]">
          <div className="relative min-h-[22rem] bg-gradient-to-br from-emerald-100 to-amber-50 lg:min-h-[35rem]">
            {image ? (
              <img
                src={image}
                alt={product.variety}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center text-emerald-800">
                  <Leaf className="mx-auto h-16 w-16 opacity-40" />
                  <p className="mt-3 text-sm font-black uppercase tracking-wider">
                    {t('product.paddy_harvest')}
                  </p>
                </div>
              </div>
            )}
            {product.is_organic && (
              <span className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-emerald-700 shadow-lg backdrop-blur">
                <Leaf className="h-3.5 w-3.5" /> {t('organic')}
              </span>
            )}
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                {t('common.active_listing')}
              </span>
              {product.farmer_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  <BadgeCheck className="h-3.5 w-3.5" />{' '}
                  {t('product.verified_farmer')}
                </span>
              )}
            </div>
            <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-slate-950">
              {formatVariety(product.variety)}
            </h1>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-black text-emerald-700">
                {formatCurrency(product.price_per_kg)}
              </span>
              <span className="pb-1 text-sm font-semibold text-slate-400">
                {t('prices.per_unit', { unit: priceUnitKg })}
              </span>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="detail-tile">
                <Scale className="h-5 w-5" />
                <div>
                  <p>{t('product.available_quantity')}</p>
                  <strong>
                    {product.quantity_kg} {t('common.kg')}
                  </strong>
                </div>
              </div>
              <div className="detail-tile">
                <MapPin className="h-5 w-5" />
                <div>
                  <p>{t('common.location')}</p>
                  <strong>{product.region || formatDistrict(product.district)}</strong>
                </div>
              </div>
              <div className="detail-tile">
                <CalendarDays className="h-5 w-5" />
                <div>
                  <p>{t('harvest_date')}</p>
                  <strong>{formatDate(product.harvest_date)}</strong>
                </div>
              </div>
              <div className="detail-tile">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <div>
                  <p>{t('product.listing_rating')}</p>
                  <strong>
                    {Number(product.rating || 0).toFixed(1)} (
                    {product.total_reviews || 0})
                  </strong>
                </div>
              </div>
            </div>
            {product.description && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  {t('product.about_harvest')}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}
            <div className="mt-7 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black">{product.farmer_name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{' '}
                      {Number(product.farmer_rating || 0).toFixed(1)}{' '}
                      {t('product.farmer_rating')} ·{' '}
                      {formatDistrict(product.district)}
                    </p>
                  </div>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {user?.role === 'buyer' && <PlaceOrderButton product={product} />}
              {!isOwner && (
                <ContactFarmerButton
                  farmerId={product.farmer_id}
                  onOpen={(receiverId) => {
                    setChatReceiver(receiverId);
                    setChatOpen(true);
                  }}
                />
              )}
              {isOwner && (
                <span className="self-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                  {t('product.your_listing')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReviewList data={reviews} />
      {chatOpen && chatReceiver && (
        <ChatBox receiverId={chatReceiver} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}
