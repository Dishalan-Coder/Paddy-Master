import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import StatusPage from '../components/common/StatusPage';

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error.message || fallback;
};

export default function ErrorPage({ error, resetError }) {
  const { t } = useTranslation();
  const retry = () => {
    if (resetError) {
      resetError();
      return;
    }
    window.location.reload();
  };

  return (
    <StatusPage
      description={t('status_pages.error_description')}
      details={[
        { label: t('common.status'), value: t('status_pages.action_needed') },
        { label: t('status_pages.impact'), value: t('status_pages.current_page_only') },
        {
          label: t('status_pages.message'),
          value: getErrorMessage(error, t('status_pages.safe_load_failed')),
        },
      ]}
      eyebrow={t('status_pages.error_eyebrow')}
      icon={AlertTriangle}
      onRetry={retry}
      primaryLabel={t('common.retry')}
      secondaryHref="/"
      tone="red"
      title={t('status_pages.error_title')}
    />
  );
}
