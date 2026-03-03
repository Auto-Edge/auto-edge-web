/**
 * Environment Configuration
 *
 * Centralized configuration loaded from environment variables.
 */

import type { AppConfig } from '../types';

export const config: AppConfig = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  // Polling Configuration
  pollingInterval: parseInt(import.meta.env.VITE_POLLING_INTERVAL || '1500', 10),

  // File Upload Configuration
  allowedExtensions: ['.pt', '.pth'],
  maxFileSizeMb: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '500', 10),
};

export default config;
