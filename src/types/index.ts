/**
 * Application Type Definitions
 */

// API Response Types
export interface TaskResponse {
  task_id: string;
  message: string;
}

export interface DemoResponse {
  task_id: string;
  message: string;
}

export interface ConversionResult {
  status: 'success' | 'error';
  model_name?: string;
  original_size?: string;
  optimized_size?: string;
  reduction?: string;
  output_file?: string;
  precision?: string;
  target?: string;
  error?: string;
}

export interface StatusResponse {
  task_id: string;
  status: string;
  result?: ConversionResult | ProgressInfo | null;
}

export interface ProgressInfo {
  stage: string;
  progress: number;
}

export interface ModelsListResponse {
  models: string[];
}

export interface ErrorDetail {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface ErrorResponse {
  error: ErrorDetail;
}

// Job Types
export interface Job {
  id: string;
}

// File Validation
export interface FileValidationResult {
  valid: boolean;
  error: string | null;
}

// Config Types
export interface AppConfig {
  apiUrl: string;
  pollingInterval: number;
  allowedExtensions: string[];
  maxFileSizeMb: number;
}

// Registry Types
export interface Model {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
  versions: ModelVersion[];
}

export interface ModelVersion {
  id: string;
  model_id: string;
  version: string;
  file_path: string;
  file_size_bytes: number | null;
  file_hash: string | null;
  precision: string;
  created_at: string;
  is_published: boolean;
  download_count: number;
}

export interface ModelListResponse {
  models: Model[];
  total: number;
}

export interface CreateModelRequest {
  name: string;
  description?: string;
}

export interface CreateVersionRequest {
  version: string;
  file_path: string;
  precision?: string;
}

// Analytics Types
export interface InferenceStats {
  total_inferences: number;
  avg_latency_ms: number | null;
  min_latency_ms: number | null;
  max_latency_ms: number | null;
  avg_memory_bytes: number | null;
}

export interface ModelMetrics {
  model_id: string;
  inference_stats: InferenceStats;
  total_downloads: number;
  active_devices: number;
  versions_published: number;
}

export interface DashboardSummary {
  total_models: number;
  total_versions: number;
  total_devices: number;
  active_devices_24h: number;
  total_inferences: number;
  total_downloads: number;
  event_counts_by_type: Record<string, number>;
  device_type_distribution: Record<string, number>;
}

// Conversion Types (persisted)
export interface Conversion {
  id: string;
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_filename: string | null;
  is_demo: boolean;
  output_file: string | null;
  model_name: string | null;
  original_size: string | null;
  optimized_size: string | null;
  reduction: string | null;
  precision: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  registered_model_id: string | null;
}

export interface ConversionListResponse {
  conversions: Conversion[];
  total: number;
}

export interface StartConversionResponse {
  conversion_id: string;
  task_id: string;
  message: string;
}
