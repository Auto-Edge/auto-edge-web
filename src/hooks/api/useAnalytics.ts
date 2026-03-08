import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/services/analyticsApi';
import { queryKeys } from './queryKeys';

/**
 * Fetch the analytics dashboard summary.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: () => analyticsApi.getDashboardSummary(),
  });
}

/**
 * Fetch metrics for a specific model.
 */
export function useModelMetrics(modelId: string | undefined, since?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.model(modelId!),
    queryFn: () => analyticsApi.getModelMetrics(modelId!, since),
    enabled: !!modelId,
  });
}
