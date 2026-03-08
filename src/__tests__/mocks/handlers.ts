import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000';
const REGISTRY_URL = `${API_URL}/api/v1/registry`;
const ANALYTICS_URL = `${API_URL}/api/v1/analytics`;

// ---- Fixtures ----

export const fixtures = {
  conversion: {
    id: 'conv-1',
    task_id: 'task-1',
    status: 'completed' as const,
    input_filename: 'mobilenet_v2.pt',
    is_demo: false,
    output_file: 'mobilenet_v2.mlpackage',
    model_name: 'mobilenet_v2',
    original_size: '14.2 MB',
    optimized_size: '3.8 MB',
    reduction: '73%',
    precision: 'FLOAT16',
    error_message: null,
    created_at: '2024-01-01T00:00:00Z',
    completed_at: '2024-01-01T00:01:00Z',
    registered_model_id: null,
  },

  model: {
    id: 'model-1',
    name: 'MobileNetV2',
    description: 'Lightweight classification model',
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
    versions: [
      {
        id: 'ver-1',
        model_id: 'model-1',
        version: '1.0.0',
        file_path: 'mobilenet_v2.mlpackage',
        file_size_bytes: 3800000,
        file_hash: 'abc123',
        precision: 'FLOAT16',
        created_at: '2024-01-01T00:00:00Z',
        is_published: true,
        download_count: 42,
      },
    ],
  },

  dashboardSummary: {
    total_models: 5,
    total_versions: 12,
    total_devices: 100,
    active_devices_24h: 37,
    total_inferences: 10500,
    total_downloads: 230,
    event_counts_by_type: { inference: 8000, download: 230, heartbeat: 2270 },
    device_type_distribution: { iPhone: 60, iPad: 30, Mac: 10 },
  },

  modelMetrics: {
    model_id: 'model-1',
    inference_stats: {
      total_inferences: 500,
      avg_latency_ms: 12.5,
      min_latency_ms: 8.0,
      max_latency_ms: 25.0,
      avg_memory_bytes: 1048576,
    },
    total_downloads: 42,
    active_devices: 15,
    versions_published: 1,
  },
};

// ---- Handlers ----

export const handlers = [
  // Conversions
  http.get(`${API_URL}/conversions`, () => {
    return HttpResponse.json({
      conversions: [fixtures.conversion],
      total: 1,
    });
  }),

  http.get(`${API_URL}/conversions/:id`, ({ params }) => {
    return HttpResponse.json({ ...fixtures.conversion, id: params.id });
  }),

  http.delete(`${API_URL}/conversions/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/upload`, () => {
    return HttpResponse.json({
      conversion_id: 'conv-new',
      task_id: 'task-new',
      message: 'Conversion started',
    });
  }),

  http.post(`${API_URL}/demo`, () => {
    return HttpResponse.json({
      conversion_id: 'conv-demo',
      task_id: 'task-demo',
      message: 'Demo conversion started',
    });
  }),

  http.get(`${API_URL}/status/:taskId`, () => {
    return HttpResponse.json({
      task_id: 'task-1',
      status: 'Completed',
      result: {
        status: 'success',
        model_name: 'mobilenet_v2',
        original_size: '14.2 MB',
        optimized_size: '3.8 MB',
        reduction: '73%',
        output_file: 'mobilenet_v2.mlpackage',
        precision: 'FLOAT16',
      },
    });
  }),

  // Registry
  http.get(`${REGISTRY_URL}/models`, () => {
    return HttpResponse.json({
      models: [fixtures.model],
      total: 1,
    });
  }),

  http.get(`${REGISTRY_URL}/models/:id`, ({ params }) => {
    return HttpResponse.json({ ...fixtures.model, id: params.id });
  }),

  http.post(`${REGISTRY_URL}/models`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...fixtures.model,
      id: 'model-new',
      name: body.name,
      description: body.description || null,
    });
  }),

  http.delete(`${REGISTRY_URL}/models/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${REGISTRY_URL}/models/:modelId/versions`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'ver-new',
      model_id: params.modelId,
      version: body.version,
      file_path: body.file_path,
      file_size_bytes: null,
      file_hash: null,
      precision: body.precision || 'FLOAT16',
      created_at: new Date().toISOString(),
      is_published: false,
      download_count: 0,
    });
  }),

  http.patch(`${REGISTRY_URL}/models/:modelId/versions/:version`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...fixtures.model.versions[0],
      model_id: params.modelId,
      version: params.version,
      is_published: body.is_published,
    });
  }),

  // Analytics
  http.get(`${ANALYTICS_URL}/dashboard`, () => {
    return HttpResponse.json(fixtures.dashboardSummary);
  }),

  http.get(`${ANALYTICS_URL}/models/:id/metrics`, () => {
    return HttpResponse.json(fixtures.modelMetrics);
  }),
];
