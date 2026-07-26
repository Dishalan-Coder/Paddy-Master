import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/marketplace/ProductForm';
import productService from '../services/productService';
import { getApiErrorMessage } from '../utils/forms';

export default function AddProductPage() {
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
      setError(getApiErrorMessage(requestError, 'Could not create the listing.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">Marketplace supply</p>
        <h1 className="page-title">List your paddy</h1>
        <p className="page-copy">Publish clear variety, location, quantity, price, and quality details so buyers can order with confidence.</p>
      </div>
      <div className="card">
        <ProductForm onSubmit={submit} loading={loading} serverError={error} onDismissServerError={() => setError('')} />
      </div>
    </div>
  );
}
