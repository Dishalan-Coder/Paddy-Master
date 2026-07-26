import { useEffect, useState } from 'react';
import LoadingPage from '../../pages/LoadingPage';
import NetworkSlowPage from '../../pages/NetworkSlowPage';

export default function RouteLoadingFallback() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSlow(true), 4500);
    return () => window.clearTimeout(timeout);
  }, []);

  return slow ? (
    <NetworkSlowPage actions={false} />
  ) : (
    <LoadingPage actions={false} />
  );
}
