import { config } from '../config/env';
import { ApiError } from './client';
import type { StartConversionResponse } from '../types';

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * Upload a file using XMLHttpRequest for progress tracking.
 * Falls back to structured ApiError on failure.
 */
export function uploadWithProgress({
  file,
  onProgress,
  signal,
}: UploadOptions): Promise<StartConversionResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${config.apiUrl}/upload`;

    xhr.open('POST', url);

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as StartConversionResponse);
        } else {
          reject(
            new ApiError(
              data?.error?.message || `Upload failed with status ${xhr.status}`,
              xhr.status,
              data?.error?.code || 'UPLOAD_ERROR',
              data?.error?.details || {}
            )
          );
        }
      } catch {
        reject(new ApiError('Failed to parse upload response', xhr.status, 'PARSE_ERROR'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError('Network error during upload', 0, 'NETWORK_ERROR'));
    });

    xhr.addEventListener('abort', () => {
      reject(new ApiError('Upload cancelled', 0, 'UPLOAD_CANCELLED'));
    });

    // Wire up AbortSignal
    if (signal) {
      signal.addEventListener('abort', () => xhr.abort());
    }

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}
