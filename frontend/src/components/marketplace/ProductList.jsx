import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

export default function ProductList({ products, loading }) {
  if (loading) return <Loader />;
  if (!products?.length) return <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white py-16 text-center"><SearchX className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-400">No paddy listings match these filters.</p></div>;
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>;
}
