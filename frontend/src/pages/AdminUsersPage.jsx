import UserManagement from '../components/admin/UserManagement';
export default function AdminUsersPage() {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="card">
        <UserManagement />
      </div>
    </div>
  );
}
