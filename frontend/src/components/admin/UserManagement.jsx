import { useState, useEffect } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import Loader from '../common/Loader';
import adminService from '../../services/adminService';
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = async () => {
    setLoading(true);
    try {
      const d = await adminService.getUsers({ skip: 0, limit: 50 });
      setUsers(d.users);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);
  if (loading) return <Loader />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 font-semibold">Name</th>
            <th className="pb-3 font-semibold">Email</th>
            <th className="pb-3 font-semibold">Role</th>
            <th className="pb-3 font-semibold">Verified</th>
            <th className="pb-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50">
              <td className="py-3 font-medium">{u.full_name}</td>
              <td className="py-3 text-gray-500">{u.email}</td>
              <td className="py-3">
                <span className="badge-blue capitalize">{u.role}</span>
              </td>
              <td className="py-3">
                {u.is_verified ? (
                  <span className="badge-green">Verified</span>
                ) : (
                  <button
                    onClick={async () => {
                      await adminService.verifyUser(u._id);
                      fetch();
                    }}
                    className="text-paddy-700 text-xs font-medium flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verify
                  </button>
                )}
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={async () => {
                    if (!confirm('Delete?')) return;
                    await adminService.deleteUser(u._id);
                    fetch();
                  }}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
