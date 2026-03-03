/**
 * useFileUpload Hook
 *
 * Handles file upload logic and state management.
 */

import { useState, useCallback } from 'react';
import { conversionApi } from '../api/services/conversionApi';

interface UseFileUploadResult {
  file: File | null;
  isUploading: boolean;
  error: string | null;
  selectFile: (file: File | null) => void;
  clearFile: () => void;
  upload: () => Promise<string | null>;
  startDemo: () => Promise<string | null>;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for file upload functionality
 */
export function useFileUpload(): UseFileUploadResult {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const upload = useCallback(async (): Promise<string | null> => {
    if (!file) {
      setError('No file selected');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const data = await conversionApi.uploadModel(file);
      setFile(null);
      return data.task_id;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  const startDemo = useCallback(async (): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setFile(null);

    try {
      const data = await conversionApi.startDemoConversion();
      return data.task_id;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Demo request failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const setUploadError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    file,
    isUploading,
    error,
    selectFile,
    clearFile,
    upload,
    startDemo,
    setError: setUploadError,
  };
}

export default useFileUpload;
