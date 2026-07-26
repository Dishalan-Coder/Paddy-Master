import useFetch from '../hooks/useFetch';
import notificationService from '../services/notificationService';
import NotificationPanel from '../components/notifications/NotificationPanel';
import ErrorAlert from '../components/common/ErrorAlert';

export default function NotificationsPage() {
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
        <p className="page-kicker">Updates and reminders</p>
        <h1 className="page-title">Notifications</h1>
        <p className="page-copy">
          Order activity, payment updates, weather warnings, and farm reminders.
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
