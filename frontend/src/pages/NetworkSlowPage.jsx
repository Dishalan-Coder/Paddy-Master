import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import StatusPage from '../components/common/StatusPage';

const getConnection = () =>
  navigator.connection || navigator.mozConnection || navigator.webkitConnection;

const getNetworkSnapshot = () => {
  const connection = getConnection();
  return {
    downlink: connection?.downlink,
    effectiveType: connection?.effectiveType,
    online: navigator.onLine,
    rtt: connection?.rtt,
  };
};

const formatConnectionType = (effectiveType, fallback) =>
  effectiveType ? effectiveType.toUpperCase() : fallback;

const formatDownlink = (downlink, fallback) =>
  typeof downlink === 'number' ? `${downlink.toFixed(1)} Mbps` : fallback;

export default function NetworkSlowPage({ actions = true }) {
  const { t } = useTranslation();
  const [network, setNetwork] = useState(getNetworkSnapshot);

  useEffect(() => {
    const connection = getConnection();
    const update = () => setNetwork(getNetworkSnapshot());

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    connection?.addEventListener?.('change', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);

  const details = useMemo(
    () => [
      {
        label: t('status_pages.connection'),
        value: network.online
          ? t('status_pages.online')
          : t('status_pages.offline'),
      },
      {
        label: t('status_pages.network_type'),
        value: formatConnectionType(
          network.effectiveType,
          t('common.not_reported'),
        ),
      },
      {
        label: t('status_pages.speed_estimate'),
        value: formatDownlink(network.downlink, t('common.not_reported')),
      },
    ],
    [network, t],
  );

  return (
    <StatusPage
      actions={actions}
      description={
        network.online
          ? t('status_pages.slow_description')
          : t('status_pages.offline_description')
      }
      details={details}
      eyebrow={
        network.online
          ? t('status_pages.slow_eyebrow')
          : t('status_pages.offline_eyebrow')
      }
      icon={WifiOff}
      onRetry={() => window.location.reload()}
      primaryLabel={t('common.retry_connection')}
      secondaryHref="/"
      tone="amber"
      title={
        network.online
          ? t('status_pages.slow_title')
          : t('status_pages.offline_title')
      }
    />
  );
}
