import { useAuth } from '../context/AuthContext';
import BuyerDashboardPage from './BuyerDashboardPage';
import FarmerDashboardPage from './FarmerDashboardPage';

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'buyer' ? (
    <BuyerDashboardPage />
  ) : (
    <FarmerDashboardPage />
  );
}
