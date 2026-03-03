import { apiClient } from '../client';
import type { ModelMetrics, DashboardSummary } from '../../types';

const BASE_PATH = '/api/v1/analytics';

export async function getModelMetrics(
  modelId: string,
  since?: string
): Promise<ModelMetrics> {
  const params = since ? `?since=${encodeURIComponent(since)}` : '';
  return apiClient.get<ModelMetrics>(`${BASE_PATH}/models/${modelId}/metrics${params}`);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>(`${BASE_PATH}/dashboard`);
}

export const analyticsApi = {
  getModelMetrics,
  getDashboardSummary,
};
