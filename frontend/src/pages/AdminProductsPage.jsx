import ProductModeration from '../components/admin/ProductModeration';
export default function AdminProductsPage() {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">Product Moderation</h1>
      <div className="card">
        <ProductModeration />
      </div>
    </div>
  );
}
