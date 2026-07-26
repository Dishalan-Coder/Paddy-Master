import { AlertTriangle } from 'lucide-react';
import StatusPage from '../components/common/StatusPage';

const getErrorMessage = (error) => {
  if (!error) return 'The page could not be loaded safely.';
  if (typeof error === 'string') return error;
  return error.message || 'The page could not be loaded safely.';
};

export default function ErrorPage({ error, resetError }) {
  const retry = () => {
    if (resetError) {
      resetError();
      return;
    }
    window.location.reload();
  };

  return (
    <StatusPage
      description="Something interrupted this screen. You can retry the request or return to the home page while the issue settles."
      details={[
        { label: 'Status', value: 'Action needed' },
        { label: 'Impact', value: 'Current page only' },
        { label: 'Message', value: getErrorMessage(error) },
      ]}
      eyebrow="Error"
      icon={AlertTriangle}
      onRetry={retry}
      primaryLabel="Retry"
      secondaryHref="/"
      tone="red"
      title="Something went wrong"
    />
  );
}
