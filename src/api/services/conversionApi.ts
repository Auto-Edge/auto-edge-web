/**
 * Conversion API Service
 *
 * API methods for model conversion operations.
 */

import { apiClient } from '../client';
import { config } from '../../config/env';
import type {
  TaskResponse,
  DemoResponse,
  StatusResponse,
  ModelsListResponse,
  Conversion,
  ConversionListResponse,
  StartConversionResponse,
} from '../../types';

/**
 * Upload a model file and start conversion
 */
export async function uploadModel(file: File): Promise<StartConversionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<StartConversionResponse>('/upload', formData);
}

/**
 * Start a demo conversion with MobileNetV2
 */
export async function startDemoConversion(): Promise<StartConversionResponse> {
  return apiClient.post<StartConversionResponse>('/demo', {});
}

/**
 * List recent conversions (persisted)
 */
export async function listConversions(limit = 20): Promise<ConversionListResponse> {
  return apiClient.get<ConversionListResponse>(`/conversions?limit=${limit}`);
}

/**
 * List active (in-progress) conversions
 */
export async function listActiveConversions(): Promise<ConversionListResponse> {
  return apiClient.get<ConversionListResponse>('/conversions/active');
}

/**
 * Get a specific conversion
 */
export async function getConversion(conversionId: string): Promise<Conversion> {
  return apiClient.get<Conversion>(`/conversions/${conversionId}`);
}

/**
 * Delete a conversion
 */
export async function deleteConversion(conversionId: string): Promise<void> {
  return apiClient.delete(`/conversions/${conversionId}`);
}

/**
 * Link a conversion to a registered model
 */
export async function linkConversionToModel(
  conversionId: string,
  modelId: string
): Promise<Conversion> {
  return apiClient.post<Conversion>(`/conversions/${conversionId}/link/${modelId}`, {});
}

/**
 * Get the status of a conversion task
 */
export async function getTaskStatus(taskId: string): Promise<StatusResponse> {
  return apiClient.get<StatusResponse>(`/status/${taskId}`);
}

/**
 * List all available converted models
 */
export async function listModels(): Promise<ModelsListResponse> {
  return apiClient.get<ModelsListResponse>('/models');
}

/**
 * Get the download URL for a converted model
 */
export function getDownloadUrl(filename: string): string {
  return `${config.apiUrl}/download/${filename}`;
}

/**
 * Download a converted model (opens in new tab)
 */
export function downloadModel(filename: string): void {
  window.open(getDownloadUrl(filename), '_blank');
}

export const conversionApi = {
  uploadModel,
  startDemoConversion,
  getTaskStatus,
  listModels,
  getDownloadUrl,
  downloadModel,
  listConversions,
  listActiveConversions,
  getConversion,
  deleteConversion,
  linkConversionToModel,
};

export default conversionApi;
