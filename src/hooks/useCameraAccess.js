import { useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';

const INITIAL_STATUS = { state: 'loading', message: null };

export default function useCameraAccess() {
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [requestSettled, setRequestSettled] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const attemptRef = useRef(-1);

  useEffect(() => {
    if (!permission || attemptRef.current === retryKey) return;

    if (permission.granted || permission.canAskAgain === false) {
      attemptRef.current = retryKey;
      setRequestSettled(true);
      return;
    }

    attemptRef.current = retryKey;
    requestPermission()
      .catch((error) => {
        setStatus({ state: 'error', message: error.message || 'permiso' });
      })
      .finally(() => setRequestSettled(true));
  }, [permission, requestPermission, retryKey]);

  const handleReady = useCallback(() => {
    setStatus({ state: 'ready', message: null });
  }, []);

  const handleError = useCallback((event) => {
    setStatus({ state: 'error', message: event.message });
  }, []);

  const retry = useCallback(() => {
    setStatus(INITIAL_STATUS);
    setRequestSettled(false);
    attemptRef.current = -1;
    setRetryKey((current) => current + 1);
  }, []);

  return {
    permission,
    status,
    requestSettled,
    retryKey,
    handleReady,
    handleError,
    retry,
  };
}
