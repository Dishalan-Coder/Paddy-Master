import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
export default function MainLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
