import { useTranslation } from 'react-i18next';
import StatusPage from '../components/common/StatusPage';

export default function LoadingPage({
  actions = true,
  message,
}) {
  const { t } = useTranslation();
  const steps = [
    t('status_pages.checking_session'),
    t('status_pages.loading_records'),
    t('status_pages.preparing_views'),
  ];

  return (
    <StatusPage
      actions={actions}
      description={message || t('status_pages.loading_description')}
      eyebrow={t('status_pages.loading_eyebrow')}
      primaryHref="/dashboard"
      primaryLabel={t('common.open_dashboard')}
      secondaryHref="/"
      showSpinner
      title={t('status_pages.loading_title')}
    >
      <ol className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex items-center gap-3 text-sm font-black text-emerald-950"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </StatusPage>
  );
}
