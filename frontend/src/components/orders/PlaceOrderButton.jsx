import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, CheckCircle2, ShoppingCart, X } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import orderService from '../../services/orderService';
import {
  formatCurrency,
  formatPaymentMethod,
  formatVariety,
} from '../../utils/formatters';
import {
  fieldClass,
  getApiErrorMessage,
  hasErrors,
  toPositiveNumber,
} from '../../utils/forms';

const INITIAL_FORM = {
  quantity_kg: '',
  delivery_address: '',
  payment_method: 'cash_on_delivery',
  notes: '',
};

export default function PlaceOrderButton({ product }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const productId = product?._id || product?.id;
  const priceUnitKg = Number(product.price_unit_kg || 72);
  const unitPrice = Number(product.price_per_kg || 0);
  const pricePerKg = priceUnitKg ? unitPrice / priceUnitKg : 0;

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {};
    const quantity = toPositiveNumber(form.quantity_kg);
    const available = Number(product.quantity_kg || 0);
    const address = form.delivery_address.trim();
    const notes = form.notes.trim();

    if (!productId)
      next.quantity_kg =
        t('order.incomplete');
    if (!form.quantity_kg)
      next.quantity_kg = t('validation.required', {
        field: t('common.quantity'),
      });
    else if (!quantity)
      next.quantity_kg = t('validation.positive', {
        field: t('common.quantity'),
      });
    else if (quantity > available)
      next.quantity_kg = t('order.only_available', { quantity: available });
    if (!address)
      next.delivery_address = t('validation.required', {
        field: t('delivery_address'),
      });
    else if (address.length < 5)
      next.delivery_address = t('validation.min_chars', {
        field: t('delivery_address'),
        count: 5,
      });
    else if (address.length > 300)
      next.delivery_address = t('validation.max_chars', {
        field: t('delivery_address'),
        count: 300,
      });
    if (notes.length > 500)
      next.notes = t('validation.max_chars', {
        field: t('order_notes'),
        count: 500,
      });

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
      const result = await orderService.create({
        product_id: productId,
        quantity_kg: toPositiveNumber(form.quantity_kg),
        delivery_address: form.delivery_address.trim(),
        payment_method: form.payment_method,
        notes: form.notes.trim() || undefined,
      });
      setCreatedOrder(result);
      setForm(INITIAL_FORM);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, t('order.place_failed')));
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setShow(false);
    setCreatedOrder(null);
    setError('');
    setErrors({});
  };

  const total = Number(form.quantity_kg || 0) * pricePerKg;
  const fieldError = (name) =>
    errors[name] ? (
      <p
        id={`order_${name}-error`}
        className="mt-1 text-xs font-semibold text-red-500"
      >
        {errors[name]}
      </p>
    ) : null;

  return (
    <>
      <Button onClick={() => setShow(true)} icon={ShoppingCart}>
        {t('place_order')}
      </Button>
      {show && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                  {t('order.checkout')}
                </p>
                <h3 className="mt-1 text-xl font-black">
                  {t('order.title', { variety: formatVariety(product.variety) })}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t('order.price_available', {
                    price: formatCurrency(unitPrice),
                    unit: priceUnitKg,
                    quantity: product.quantity_kg,
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-xl p-2 hover:bg-slate-100"
                aria-label={t('common.close_checkout')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {createdOrder ? (
              <div className="py-9 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-xl font-black">
                  {t('order.placed')}
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  {t('order.sent_to_farmer', {
                    id: createdOrder._id.slice(-6).toUpperCase(),
                  })}
                </p>
                <p className="mt-4 text-2xl font-black text-emerald-700">
                  {formatCurrency(createdOrder.total_price)}
                </p>
                <Button onClick={close} className="mt-6">
                  {t('common.continue')}
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
                <ErrorAlert message={error} onDismiss={() => setError('')} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="order_quantity" className="label">
                      {t('quantity_kg')}
                    </label>
                    <input
                      id="order_quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      max={product.quantity_kg}
                      value={form.quantity_kg}
                      onChange={(event) =>
                        change('quantity_kg', event.target.value)
                      }
                      className={fieldClass(errors, 'quantity_kg')}
                      inputMode="decimal"
                      aria-invalid={Boolean(errors.quantity_kg)}
                      aria-describedby={
                        errors.quantity_kg
                          ? 'order_quantity_kg-error'
                          : undefined
                      }
                    />
                    {fieldError('quantity_kg')}
                  </div>
                  <div>
                    <label className="label">{t('order.estimated_total')}</label>
                    <div className="flex h-[46px] items-center rounded-xl bg-emerald-50 px-4 font-black text-emerald-800">
                      {formatCurrency(total)}
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="order_delivery_address" className="label">
                    {t('delivery_address')}
                  </label>
                  <textarea
                    id="order_delivery_address"
                    value={form.delivery_address}
                    onChange={(event) =>
                      change('delivery_address', event.target.value)
                    }
                    rows={2}
                    maxLength={300}
                    className={fieldClass(errors, 'delivery_address')}
                    placeholder={t('order.address_placeholder')}
                    aria-invalid={Boolean(errors.delivery_address)}
                    aria-describedby={
                      errors.delivery_address
                        ? 'order_delivery_address-error'
                        : undefined
                    }
                  />
                  {fieldError('delivery_address')}
                </div>
                <div>
                  <label htmlFor="order_payment_method" className="label">
                    {t('common.payment')}
                  </label>
                  <select
                    id="order_payment_method"
                    className="input-field"
                    value={form.payment_method}
                    onChange={(event) =>
                      change('payment_method', event.target.value)
                    }
                  >
                    <option value="cash_on_delivery">
                      {formatPaymentMethod('cash_on_delivery')}
                    </option>
                    <option value="bank_transfer">
                      {formatPaymentMethod('bank_transfer')}
                    </option>
                    <option value="card_demo">
                      {formatPaymentMethod('card_demo')}
                    </option>
                  </select>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                    <Banknote className="h-3.5 w-3.5" />
                    {t('order.payment_note')}
                  </p>
                </div>
                <div>
                  <label htmlFor="order_notes" className="label">
                    {t('order_notes')}
                  </label>
                  <textarea
                    id="order_notes"
                    value={form.notes}
                    onChange={(event) => change('notes', event.target.value)}
                    rows={2}
                    maxLength={500}
                    className={fieldClass(errors, 'notes')}
                    placeholder={t('order.notes_placeholder')}
                    aria-invalid={Boolean(errors.notes)}
                    aria-describedby={
                      errors.notes
                        ? 'order_notes-error order_notes_count'
                        : 'order_notes_count'
                    }
                  />
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {fieldError('notes') || <span />}
                    <span
                      id="order_notes_count"
                      className="text-xs font-semibold text-slate-400"
                    >
                      {form.notes.length}/500
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={loading} className="flex-1">
                    {t('order.confirm')}
                  </Button>
                  <Button type="button" variant="secondary" onClick={close}>
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
