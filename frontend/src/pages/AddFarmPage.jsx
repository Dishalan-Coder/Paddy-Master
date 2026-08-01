import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FarmForm from '../components/farms/FarmForm';
import ErrorAlert from '../components/common/ErrorAlert';
import farmService from '../services/farmService';
import { getApiErrorMessage } from '../utils/forms';

export default function AddFarmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await farmService.create(data);
      navigate('/crops/new');
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, t('forms.create_farm_failed')),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">{t('pages.add_farm.kicker')}</p>
        <h1 className="page-title">{t('pages.add_farm.title')}</h1>
        <p className="page-copy">
          {t('pages.add_farm.copy')}
        </p>
      </div>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <div className="card">
        <FarmForm onSubmit={submit} loading={loading} />
      </div>
    </div>
  );
}
