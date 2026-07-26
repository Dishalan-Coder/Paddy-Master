import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Plus, ShieldCheck, Store } from 'lucide-react';
import SearchFilter from '../components/marketplace/SearchFilter';
import ProductList from '../components/marketplace/ProductList';
import ErrorAlert from '../components/common/ErrorAlert';
import useFetch from '../hooks/useFetch';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';

const initialFilters = { variety: '', region: '', is_organic: undefined, sort_by: 'created_at', sort_order: -1 };

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({ ...initialFilters, variety: searchParams.get('search') || '' }));
  const fetchProducts = useCallback(() => productService.getAll(filters), [filters]);
  const { data, loading, error } = useFetch(fetchProducts, [fetchProducts]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    setFilters((current) => (current.variety === search ? current : { ...current, variety: search }));
  }, [searchParams]);

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilters.variety?.trim()) nextParams.set('search', nextFilters.variety.trim());
    else nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-800 to-slate-950 p-7 text-white sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-emerald-200"><Store className="h-4 w-4" /> Direct paddy marketplace</div><h1 className="mt-4 font-display text-3xl font-black sm:text-4xl">Buy and sell with transparent information</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100">Compare varieties, quantities, regions, prices, verified farmer status, ratings, and payment options.</p></div>{user?.role === 'farmer' && <Link to="/products/new" className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-black text-emerald-950"><Plus className="h-4 w-4" /> List paddy</Link>}</div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-emerald-100"><span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"><BadgeCheck className="h-3.5 w-3.5 text-lime-300" /> Verified profiles</span><span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-lime-300" /> Order tracking</span></div>
      </section>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><SearchFilter filters={filters} onChange={updateFilters} onReset={resetFilters} totalResults={data?.total || 0} /></div>
      <ErrorAlert message={error} />
      <ProductList products={data?.products} loading={loading} />
    </div>
  );
}
