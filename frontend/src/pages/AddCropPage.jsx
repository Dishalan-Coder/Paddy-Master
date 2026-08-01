import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CropForm from '../components/crops/CropForm';
import ErrorAlert from '../components/common/ErrorAlert';
import cropService from '../services/cropService';
import { getApiErrorMessage } from '../utils/forms';

export default function AddCropPage() {
  const { t } = useTranslation();
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
      setError(
        getApiErrorMessage(requestError, t('forms.create_crop_failed')),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">{t('pages.add_crop.kicker')}</p>
        <h1 className="page-title">{t('pages.add_crop.title')}</h1>
        <p className="page-copy">
          {t('pages.add_crop.copy')}
        </p>
      </div>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <div className="card">
        <CropForm onSubmit={submit} loading={loading} />
      </div>
    </div>
  );
}
