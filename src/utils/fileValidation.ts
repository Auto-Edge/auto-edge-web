/**
 * File Validation Utilities
 */

import { config } from '../config/env';
import type { FileValidationResult } from '../types';

/**
 * Check if a file has an allowed extension
 */
export function hasValidExtension(file: File | null): boolean {
  if (!file?.name) return false;

  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return config.allowedExtensions.includes(extension);
}

/**
 * Check if a file is within the size limit
 */
export function isWithinSizeLimit(file: File | null): boolean {
  if (!file?.size) return false;

  const sizeMb = file.size / (1024 * 1024);
  return sizeMb <= config.maxFileSizeMb;
}

/**
 * Validate a file for upload
 */
export function validateFile(file: File | null): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!hasValidExtension(file)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a ${config.allowedExtensions.join(' or ')} file`,
    };
  }

  if (!isWithinSizeLimit(file)) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${config.maxFileSizeMb}MB`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export default {
  hasValidExtension,
  isWithinSizeLimit,
  validateFile,
  formatFileSize,
};
