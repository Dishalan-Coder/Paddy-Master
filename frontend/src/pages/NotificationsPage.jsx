import { useTranslation } from 'react-i18next';
import useFetch from '../hooks/useFetch';
import notificationService from '../services/notificationService';
import NotificationPanel from '../components/notifications/NotificationPanel';
import ErrorAlert from '../components/common/ErrorAlert';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useFetch(
    () => notificationService.getAll({ limit: 100 }),
    [],
  );
  const markRead = async (id) => {
    await notificationService.markRead(id);
    refetch();
  };
  const markAll = async () => {
    await notificationService.markAllRead();
    refetch();
  };
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fadeIn">
      <div>
        <p className="page-kicker">{t('pages.notifications.kicker')}</p>
        <h1 className="page-title">{t('pages.notifications.title')}</h1>
        <p className="page-copy">
          {t('pages.notifications.copy')}
        </p>
      </div>
      <ErrorAlert message={error} />
      <NotificationPanel
        data={data}
        loading={loading}
        onMarkRead={markRead}
        onMarkAll={markAll}
      />
    </div>
  );
}
