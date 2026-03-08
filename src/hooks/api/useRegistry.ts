import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registryApi } from '../../api/services/registryApi';
import { queryKeys } from './queryKeys';
import { showSuccess, showError } from '../../utils/toast';
import type { CreateModelRequest, CreateVersionRequest } from '../../types';

/**
 * Fetch all models from the registry.
 */
export function useModels(activeOnly = true) {
  return useQuery({
    queryKey: queryKeys.models.all,
    queryFn: () => registryApi.listModels(activeOnly),
  });
}

/**
 * Fetch a single model by ID (includes versions).
 */
export function useModel(modelId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.models.detail(modelId!),
    queryFn: () => registryApi.getModel(modelId!),
    enabled: !!modelId,
  });
}

/**
 * Create a new model in the registry.
 */
export function useCreateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModelRequest) => registryApi.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.all });
      showSuccess('Model created');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create model');
    },
  });
}

/**
 * Delete a model from the registry.
 */
export function useDeleteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelId: string) => registryApi.deleteModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.all });
      showSuccess('Model deleted');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to delete model');
    },
  });
}

/**
 * Create a new version for a model.
 */
export function useCreateVersion(modelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersionRequest) => registryApi.createVersion(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.detail(modelId) });
      showSuccess('Version created');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create version');
    },
  });
}

/**
 * Publish or unpublish a model version.
 */
export function usePublishVersion(modelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ version, isPublished }: { version: string; isPublished: boolean }) =>
      registryApi.publishVersion(modelId, version, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.detail(modelId) });
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update version');
    },
  });
}
