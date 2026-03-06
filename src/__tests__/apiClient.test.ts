/**
 * API Client Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from '../api/client';
import type { ErrorResponse } from '../types';

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('ApiError', () => {
    it('creates an error with correct properties', () => {
      const error = new ApiError('Test message', 404, 'NOT_FOUND', { id: 123 });

      expect(error.message).toBe('Test message');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.details).toEqual({ id: 123 });
      expect(error.name).toBe('ApiError');
    });

    it('creates from response correctly', () => {
      const response = { status: 400 } as Response;
      const data: ErrorResponse = {
        error: {
          message: 'Bad request',
          code: 'VALIDATION_ERROR',
          details: { field: 'name' },
        },
      };

      const error = ApiError.fromResponse(response, data);

      expect(error.message).toBe('Bad request');
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'name' });
    });

    it('handles missing error data in response', () => {
      const response = { status: 500 } as Response;
      const data = null;

      const error = ApiError.fromResponse(response, data);

      expect(error.message).toBe('Request failed with status 500');
      expect(error.status).toBe(500);
      expect(error.code).toBe('API_ERROR');
    });
  });

  describe('request methods', () => {
    it('get method makes GET request', async () => {
      const mockResponse = { data: 'test' };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.get<{ data: string }>('/test');

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('post method makes POST request with JSON body', async () => {
      const mockResponse = { success: true };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.post<{ success: boolean }>('/test', { key: 'value' });

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' }),
        })
      );
    });

    it('throws ApiError on non-ok response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          error: { message: 'Bad request', code: 'BAD_REQUEST', details: {} },
        }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });

    it('throws ApiError on network error', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });
  });
});
