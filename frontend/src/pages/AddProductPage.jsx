import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/marketplace/ProductForm';
import productService from '../services/productService';
import { getApiErrorMessage } from '../utils/forms';

export default function AddProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await productService.create(formData);
      navigate('/marketplace');
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          t('product.create_failed', {
            defaultValue: 'Could not create the listing.',
          }),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">{t('pages.add_product.kicker')}</p>
        <h1 className="page-title">{t('pages.add_product.title')}</h1>
        <p className="page-copy">
          {t('pages.add_product.copy')}
        </p>
      </div>
      <div className="card">
        <ProductForm
          onSubmit={submit}
          loading={loading}
          serverError={error}
          onDismissServerError={() => setError('')}
        />
      </div>
    </div>
  );
}
