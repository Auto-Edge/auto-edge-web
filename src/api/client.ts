/**
 * API Client
 *
 * Centralized fetch wrapper with error handling and configuration.
 */

import { config } from '../config/env';
import type { ErrorResponse } from '../types';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code: string = 'API_ERROR',
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromResponse(response: Response, data: ErrorResponse | null): ApiError {
    const error = data?.error;
    return new ApiError(
      error?.message || `Request failed with status ${response.status}`,
      response.status,
      error?.code || 'API_ERROR',
      error?.details || {}
    );
  }
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Parse API response
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as T;
}

/**
 * Make an API request
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${config.apiUrl}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);
    if (response.status === 204) {
      return {} as T;
    }
    const data = await parseResponse<T | ErrorResponse>(response);

    if (!response.ok) {
      throw ApiError.fromResponse(response, data as ErrorResponse);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other error
    const err = error as Error;
    throw new ApiError(
      err.message || 'Network error occurred',
      0,
      'NETWORK_ERROR',
      { originalError: err.message }
    );
  }
}

/**
 * API client methods
 */
export const apiClient = {
  get: <T>(endpoint: string, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options: RequestOptions = {}): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
