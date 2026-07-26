import { useEffect, useMemo, useState } from 'react';
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

const formatConnectionType = (effectiveType) =>
  effectiveType ? effectiveType.toUpperCase() : 'Not reported';

const formatDownlink = (downlink) =>
  typeof downlink === 'number' ? `${downlink.toFixed(1)} Mbps` : 'Not reported';

export default function NetworkSlowPage({ actions = true }) {
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
      { label: 'Connection', value: network.online ? 'Online' : 'Offline' },
      {
        label: 'Network type',
        value: formatConnectionType(network.effectiveType),
      },
      { label: 'Speed estimate', value: formatDownlink(network.downlink) },
    ],
    [network],
  );

  return (
    <StatusPage
      actions={actions}
      description={
        network.online
          ? 'Your connection is responding slowly. Keep this page open, retry once the signal improves, or return home and continue with lighter pages.'
          : 'Your device appears to be offline. Reconnect to the internet, then retry the page.'
      }
      details={details}
      eyebrow={network.online ? 'Slow network' : 'Offline'}
      icon={WifiOff}
      onRetry={() => window.location.reload()}
      primaryLabel="Retry connection"
      secondaryHref="/"
      tone="amber"
      title={
        network.online ? 'The network is taking longer' : 'No connection found'
      }
    />
  );
}
