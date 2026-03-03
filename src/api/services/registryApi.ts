import { apiClient } from '../client';
import type {
  Model,
  ModelListResponse,
  ModelVersion,
  CreateModelRequest,
  CreateVersionRequest,
} from '../../types';

const BASE_PATH = '/api/v1/registry';

export async function listModels(activeOnly = true): Promise<ModelListResponse> {
  return apiClient.get<ModelListResponse>(
    `${BASE_PATH}/models?active_only=${activeOnly}`
  );
}

export async function getModel(modelId: string): Promise<Model> {
  return apiClient.get<Model>(`${BASE_PATH}/models/${modelId}`);
}

export async function createModel(data: CreateModelRequest): Promise<Model> {
  return apiClient.post<Model>(`${BASE_PATH}/models`, data);
}

export async function updateModel(
  modelId: string,
  data: Partial<CreateModelRequest>
): Promise<Model> {
  return apiClient.request<Model>(`${BASE_PATH}/models/${modelId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteModel(modelId: string): Promise<void> {
  return apiClient.delete(`${BASE_PATH}/models/${modelId}`);
}

export async function createVersion(
  modelId: string,
  data: CreateVersionRequest
): Promise<ModelVersion> {
  return apiClient.post<ModelVersion>(
    `${BASE_PATH}/models/${modelId}/versions`,
    data
  );
}

export async function publishVersion(
  modelId: string,
  version: string,
  isPublished: boolean
): Promise<ModelVersion> {
  return apiClient.request<ModelVersion>(
    `${BASE_PATH}/models/${modelId}/versions/${version}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: isPublished }),
    }
  );
}

export async function listVersions(
  modelId: string,
  publishedOnly = false
): Promise<ModelVersion[]> {
  return apiClient.get<ModelVersion[]>(
    `${BASE_PATH}/models/${modelId}/versions?published_only=${publishedOnly}`
  );
}

export const registryApi = {
  listModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  createVersion,
  publishVersion,
  listVersions,
};
