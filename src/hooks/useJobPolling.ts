/**
 * useJobPolling Hook
 *
 * Polls job status for a given taskId.
 * Starts polling when taskId is set, stops on completion/failure/unmount.
 */

import { useState, useEffect, useRef } from 'react';
import { conversionApi } from '../api/services/conversionApi';
import { config } from '../config/env';
import type { ConversionResult } from '../types';

interface UseJobPollingResult {
  status: string | null;
  result: ConversionResult | null;
  error: string | null;
  isPolling: boolean;
}

/**
 * Custom hook to poll job status for a given taskId.
 */
export function useJobPolling(taskId: string | null): UseJobPollingResult {
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!taskId) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setStatus('Pending');
    setResult(null);
    setError(null);

    const pollStatus = async (): Promise<void> => {
      try {
        const data = await conversionApi.getTaskStatus(taskId);

        setStatus(data.status);

        if (data.status === 'Completed' && data.result) {
          setResult(data.result as ConversionResult);
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else if (data.status === 'Failed') {
          const resultData = data.result as ConversionResult | undefined;
          setError(resultData?.error || 'Conversion failed');
          setIsPolling(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Failed to poll status:', err);
        // Don't stop polling on transient network errors
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval
    intervalRef.current = setInterval(pollStatus, config.pollingInterval);

    // Cleanup on unmount or taskId change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskId]);

  return { status, result, error, isPolling };
}

export default useJobPolling;
