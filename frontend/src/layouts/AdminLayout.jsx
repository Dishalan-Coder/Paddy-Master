import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
export default function AdminLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
