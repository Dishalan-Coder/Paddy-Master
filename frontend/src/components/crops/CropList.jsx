import CropCard from './CropCard';
import Loader from '../common/Loader';

export default function CropList({ crops, loading, onEdit, onDelete }) {
  if (loading) return <Loader />;
  if (!crops?.length)
    return (
      <p className="py-12 text-center text-sm text-slate-400">No crops yet.</p>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {crops.map((crop) => (
        <CropCard
          key={crop._id}
          crop={crop}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
