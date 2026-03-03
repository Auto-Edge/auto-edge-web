/**
 * File Validation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  hasValidExtension,
  isWithinSizeLimit,
  validateFile,
  formatFileSize,
} from '../utils/fileValidation';

describe('fileValidation', () => {
  describe('hasValidExtension', () => {
    it('returns true for .pt files', () => {
      const file = { name: 'model.pt' } as File;
      expect(hasValidExtension(file)).toBe(true);
    });

    it('returns true for .pth files', () => {
      const file = { name: 'model.pth' } as File;
      expect(hasValidExtension(file)).toBe(true);
    });

    it('returns false for invalid extensions', () => {
      const file = { name: 'model.txt' } as File;
      expect(hasValidExtension(file)).toBe(false);
    });

    it('returns false for null file', () => {
      expect(hasValidExtension(null)).toBe(false);
    });
  });

  describe('isWithinSizeLimit', () => {
    it('returns true for files under limit', () => {
      const file = { size: 100 * 1024 * 1024 } as File; // 100 MB
      expect(isWithinSizeLimit(file)).toBe(true);
    });

    it('returns false for files over limit', () => {
      const file = { size: 600 * 1024 * 1024 } as File; // 600 MB
      expect(isWithinSizeLimit(file)).toBe(false);
    });

    it('returns false for null file', () => {
      expect(isWithinSizeLimit(null)).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('returns valid for good file', () => {
      const file = { name: 'model.pt', size: 50 * 1024 * 1024 } as File;
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('returns error for no file', () => {
      const result = validateFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file selected');
    });

    it('returns error for invalid extension', () => {
      const file = { name: 'model.txt', size: 50 * 1024 * 1024 } as File;
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500.00 B');
    });

    it('formats KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
    });

    it('formats MB correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    });

    it('formats GB correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('handles zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });
});
