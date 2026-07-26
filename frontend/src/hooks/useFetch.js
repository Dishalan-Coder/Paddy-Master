import { useState, useEffect, useCallback } from 'react';
import { getApiErrorMessage } from '../utils/forms';

export default function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
  const execute = useCallback(async () => { setLoading(true); setError(null); try { setData(await fetchFn()); } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); } }, deps);
  useEffect(() => { execute(); }, [execute]);
  return { data, loading, error, refetch: execute, setData };
}
