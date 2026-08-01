import { useTranslation } from 'react-i18next';
import UserManagement from '../components/admin/UserManagement';
export default function AdminUsersPage() {
  const { t } = useTranslation();

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">
        {t('pages.admin.users_title')}
      </h1>
      <div className="card">
        <UserManagement />
      </div>
    </div>
  );
}
