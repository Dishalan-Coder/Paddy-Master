import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import {
  hasFarmerGeneralAccess,
  hasFarmerPremiumAccess,
} from '../utils/subscriptionAccess';

export default function ProtectedRoute({ children, roles, farmerAccess }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return (
      <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
    );
  if (user.role === 'farmer' && farmerAccess) {
    const allowed =
      farmerAccess === 'premium'
        ? hasFarmerPremiumAccess(user)
        : hasFarmerGeneralAccess(user);
    if (!allowed) {
      return (
        <Navigate
          to={`/billing?required=${farmerAccess}`}
          replace
          state={{ from: location.pathname }}
        />
      );
    }
  }
  return children;
}
