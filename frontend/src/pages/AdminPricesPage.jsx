import MarketPriceManagement from '../components/admin/MarketPriceManagement';
export default function AdminPricesPage() {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">Market Prices</h1>
      <div className="card">
        <MarketPriceManagement />
      </div>
    </div>
  );
}
