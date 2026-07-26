import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sprout } from 'lucide-react';
import CropList from '../components/crops/CropList';
import ErrorAlert from '../components/common/ErrorAlert';
import useFetch from '../hooks/useFetch';
import cropService from '../services/cropService';
import { getApiErrorMessage } from '../utils/forms';

export default function CropsPage() {
  const { data: crops, loading, error, refetch } = useFetch(() => cropService.getAll(), []);
  const [actionError, setActionError] = useState('');

  const remove = async (crop) => {
    const cropName = typeof crop === 'string' ? 'this crop' : `${crop.variety} crop`;
    const cropId = typeof crop === 'string' ? crop : crop._id;
    if (!window.confirm(`Delete ${cropName}? This cannot be undone.`)) return;

    setActionError('');
    try {
      await cropService.delete(cropId);
      refetch();
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Could not delete the crop.'));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker">Crop calendar</p>
          <h1 className="page-title">{crops?.length || 0} crops</h1>
          <p className="page-copy">Monitor growth stages, acreage, planting dates, and expected harvest windows.</p>
        </div>
        <Link to="/crops/new" className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add crop</Link>
      </div>
      <ErrorAlert message={error || actionError} onDismiss={() => setActionError('')} />
      {!loading && !crops?.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white py-16 text-center">
          <Sprout className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-black">Add your first crop</h2>
          <p className="mt-1 text-sm text-slate-400">Crop records unlock expense tracking and recommendations.</p>
          <Link to="/crops/new" className="btn-primary mt-5 inline-flex">Create crop</Link>
        </div>
      ) : (
        <CropList crops={crops} loading={loading} onDelete={remove} />
      )}
    </div>
  );
}
