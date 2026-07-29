import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RouteLoadingFallback from '../components/common/RouteLoadingFallback';
import ErrorPage from '../pages/ErrorPage';
import LoadingPage from '../pages/LoadingPage';
import NetworkSlowPage from '../pages/NetworkSlowPage';
import ProtectedRoute from './ProtectedRoute';

const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const FarmsPage = lazy(() => import('../pages/FarmsPage'));
const AddFarmPage = lazy(() => import('../pages/AddFarmPage'));
const AddCropPage = lazy(() => import('../pages/AddCropPage'));
const CropsPage = lazy(() => import('../pages/CropsPage'));
const ExpensesPage = lazy(() => import('../pages/ExpensesPage'));
const RecommendationsPage = lazy(() => import('../pages/RecommendationsPage'));
const WeatherPricesPage = lazy(() => import('../pages/WeatherPricesPage'));
const MarketplacePage = lazy(() => import('../pages/MarketplacePage'));
const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage'));
const AddProductPage = lazy(() => import('../pages/AddProductPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const BillingPage = lazy(() => import('../pages/BillingPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('../pages/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('../pages/AdminOrdersPage'));
const AdminPricesPage = lazy(() => import('../pages/AdminPricesPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const farmerOnly = (element) => (
  <ProtectedRoute roles={['farmer']}>{element}</ProtectedRoute>
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/farms" element={farmerOnly(<FarmsPage />)} />
          <Route path="/farms/new" element={farmerOnly(<AddFarmPage />)} />
          <Route path="/crops/new" element={farmerOnly(<AddCropPage />)} />
          <Route path="/crops" element={farmerOnly(<CropsPage />)} />
          <Route path="/expenses" element={farmerOnly(<ExpensesPage />)} />
          <Route
            path="/recommendations"
            element={farmerOnly(<RecommendationsPage />)}
          />
          <Route path="/prices-weather" element={<WeatherPricesPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route
            path="/products/new"
            element={farmerOnly(<AddProductPage />)}
          />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
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
