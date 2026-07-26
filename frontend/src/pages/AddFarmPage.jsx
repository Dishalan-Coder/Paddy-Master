import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmForm from '../components/farms/FarmForm';
import ErrorAlert from '../components/common/ErrorAlert';
import farmService from '../services/farmService';
import { getApiErrorMessage } from '../utils/forms';

export default function AddFarmPage() {
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
      setError(getApiErrorMessage(requestError, 'Could not create the farm.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">Field setup</p>
        <h1 className="page-title">Add farm</h1>
        <p className="page-copy">Create a land record so crops, expenses, and recommendations stay connected.</p>
      </div>
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <div className="card"><FarmForm onSubmit={submit} loading={loading} /></div>
    </div>
  );
}
