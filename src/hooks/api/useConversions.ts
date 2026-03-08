import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { conversionApi } from '../../api/services/conversionApi';
import { uploadWithProgress } from '../../api/uploadWithProgress';
import { queryKeys } from './queryKeys';
import { showSuccess, showError } from '../../utils/toast';
import type { Conversion, ConversionResult, StatusResponse } from '../../types';

/**
 * Fetch paginated list of conversions.
 */
export function useConversions(limit = 20) {
  return useQuery({
    queryKey: queryKeys.conversions.all,
    queryFn: () => conversionApi.listConversions(limit),
  });
}

/**
 * Fetch a single conversion by ID.
 */
export function useConversion(conversionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.conversions.detail(conversionId!),
    queryFn: () => conversionApi.getConversion(conversionId!),
    enabled: !!conversionId,
  });
}

/**
 * Poll conversion task status. Replaces useJobPolling and PersistedJobCard setInterval.
 * Automatically stops polling when status is terminal (Completed / Failed).
 */
export function useConversionStatus(taskId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversions.status(taskId!),
    queryFn: () => conversionApi.getTaskStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const data = query.state.data as StatusResponse | undefined;
      if (!data) return 1500;
      if (data.status === 'Completed' || data.status === 'Failed') return false;
      return 1500;
    },
    select: (data: StatusResponse) => ({
      status: data.status,
      result: data.result as ConversionResult | null,
      isComplete: data.status === 'Completed',
      isFailed: data.status === 'Failed',
      isPolling: data.status !== 'Completed' && data.status !== 'Failed',
    }),
  });
}

/**
 * Upload a model file with progress tracking and start conversion.
 */
export function useUploadModel() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetProgress = useCallback(() => setUploadProgress(0), []);

  const mutation = useMutation({
    mutationFn: (file: File) =>
      uploadWithProgress({
        file,
        onProgress: setUploadProgress,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
      showSuccess('Conversion started');
      resetProgress();
    },
    onError: (error: Error) => {
      showError(error.message || 'Upload failed');
      resetProgress();
    },
  });

  return { ...mutation, uploadProgress, resetProgress };
}

/**
 * Start a demo conversion.
 */
export function useStartDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conversionApi.startDemoConversion(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
      showSuccess('Demo conversion started');
    },
    onError: (error: Error) => {
      showError(error.message || 'Demo request failed');
    },
  });
}

/**
 * Delete a conversion with optimistic cache removal.
 */
export function useDeleteConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversionId: string) => conversionApi.deleteConversion(conversionId),
    onMutate: async (conversionId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversions.all });

      const previous = queryClient.getQueryData(queryKeys.conversions.all);

      queryClient.setQueryData(queryKeys.conversions.all, (old: { conversions: Conversion[]; total: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          conversions: old.conversions.filter((c) => String(c.id) !== String(conversionId)),
          total: old.total - 1,
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.conversions.all, context.previous);
      }
      showError('Failed to delete conversion');
    },
    onSuccess: () => {
      showSuccess('Conversion deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
    },
  });
}

/**
 * Link a conversion to a registered model.
 */
export function useLinkConversionToModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversionId, modelId }: { conversionId: string; modelId: string }) =>
      conversionApi.linkConversionToModel(conversionId, modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversions.all });
      showSuccess('Linked to model');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to link conversion');
    },
  });
}
