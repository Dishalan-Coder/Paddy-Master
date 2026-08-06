import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RouteLoadingFallback from '../components/common/RouteLoadingFallback';
import ErrorPage from '../pages/ErrorPage';
import LoadingPage from '../pages/LoadingPage';
import NetworkSlowPage from '../pages/NetworkSlowPage';
import { lazyWithRetry } from '../utils/dynamicImport';
import ProtectedRoute from './ProtectedRoute';

const AuthLayout = lazyWithRetry(() => import('../layouts/AuthLayout'));
const MainLayout = lazyWithRetry(() => import('../layouts/MainLayout'));
const AdminLayout = lazyWithRetry(() => import('../layouts/AdminLayout'));
const LandingPage = lazyWithRetry(() => import('../pages/LandingPage'));
const LoginPage = lazyWithRetry(() => import('../pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('../pages/RegisterPage'));
const DashboardPage = lazyWithRetry(() => import('../pages/DashboardPage'));
const FarmsPage = lazyWithRetry(() => import('../pages/FarmsPage'));
const AddFarmPage = lazyWithRetry(() => import('../pages/AddFarmPage'));
const AddCropPage = lazyWithRetry(() => import('../pages/AddCropPage'));
const CropsPage = lazyWithRetry(() => import('../pages/CropsPage'));
const ExpensesPage = lazyWithRetry(() => import('../pages/ExpensesPage'));
const RecommendationsPage = lazyWithRetry(() =>
  import('../pages/RecommendationsPage'),
);
const WeatherPricesPage = lazyWithRetry(() =>
  import('../pages/WeatherPricesPage'),
);
const MarketplacePage = lazyWithRetry(() => import('../pages/MarketplacePage'));
const ProductDetailsPage = lazyWithRetry(() =>
  import('../pages/ProductDetailsPage'),
);
const AddProductPage = lazyWithRetry(() => import('../pages/AddProductPage'));
const OrdersPage = lazyWithRetry(() => import('../pages/OrdersPage'));
const BillingPage = lazyWithRetry(() => import('../pages/BillingPage'));
const ProfilePage = lazyWithRetry(() => import('../pages/ProfilePage'));
const NotificationsPage = lazyWithRetry(() =>
  import('../pages/NotificationsPage'),
);
const AdminDashboardPage = lazyWithRetry(() =>
  import('../pages/AdminDashboardPage'),
);
const AdminUsersPage = lazyWithRetry(() => import('../pages/AdminUsersPage'));
const AdminProductsPage = lazyWithRetry(() =>
  import('../pages/AdminProductsPage'),
);
const AdminOrdersPage = lazyWithRetry(() => import('../pages/AdminOrdersPage'));
const AdminPricesPage = lazyWithRetry(() => import('../pages/AdminPricesPage'));
const NotFoundPage = lazyWithRetry(() => import('../pages/NotFoundPage'));

const farmerOnly = (element, farmerAccess) => (
  <ProtectedRoute roles={['farmer']} farmerAccess={farmerAccess}>
    {element}
  </ProtectedRoute>
);

const farmerGate = (element, farmerAccess) => (
  <ProtectedRoute roles={['farmer', 'buyer']} farmerAccess={farmerAccess}>
    {element}
  </ProtectedRoute>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/network-slow" element={<NetworkSlowPage />} />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        <Route
          element={
            <ProtectedRoute roles={['farmer', 'buyer']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={farmerGate(<DashboardPage />, 'trial')}
          />
          <Route path="/farms" element={farmerOnly(<FarmsPage />, 'trial')} />
          <Route
            path="/farms/new"
            element={farmerOnly(<AddFarmPage />, 'trial')}
          />
          <Route
            path="/crops/new"
            element={farmerOnly(<AddCropPage />, 'trial')}
          />
          <Route path="/crops" element={farmerOnly(<CropsPage />, 'trial')} />
          <Route
            path="/expenses"
            element={farmerOnly(<ExpensesPage />, 'trial')}
          />
          <Route
            path="/recommendations"
            element={farmerOnly(<RecommendationsPage />, 'premium')}
          />
          <Route
            path="/prices-weather"
            element={farmerGate(<WeatherPricesPage />, 'trial')}
          />
          <Route
            path="/marketplace"
            element={farmerGate(<MarketplacePage />, 'premium')}
          />
          <Route
            path="/products/new"
            element={farmerOnly(<AddProductPage />, 'premium')}
          />
          <Route
            path="/products/:id"
            element={farmerGate(<ProductDetailsPage />, 'premium')}
          />
          <Route
            path="/orders"
            element={farmerGate(<OrdersPage />, 'premium')}
          />
          <Route path="/billing" element={<BillingPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/prices" element={<AdminPricesPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['farmer', 'buyer', 'admin']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
