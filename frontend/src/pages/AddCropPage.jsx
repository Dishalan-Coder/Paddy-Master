import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CropForm from '../components/crops/CropForm';
import ErrorAlert from '../components/common/ErrorAlert';
import cropService from '../services/cropService';
import { getApiErrorMessage } from '../utils/forms';

export default function AddCropPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await cropService.create(data);
      navigate('/crops');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create the crop.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">Crop tracking</p>
        <h1 className="page-title">Add crop</h1>
        <p className="page-copy">Track planting, acreage, growth stage, and expected harvest timing for recommendations.</p>
      </div>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <div className="card"><CropForm onSubmit={submit} loading={loading} /></div>
    </div>
  );
}
