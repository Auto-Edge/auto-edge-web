export const queryKeys = {
  conversions: {
    all: ['conversions'] as const,
    detail: (id: string) => ['conversions', id] as const,
    status: (taskId: string) => ['conversions', 'status', taskId] as const,
  },
  models: {
    all: ['models'] as const,
    detail: (id: string) => ['models', id] as const,
    versions: (modelId: string) => ['models', modelId, 'versions'] as const,
  },
  analytics: {
    dashboard: ['analytics', 'dashboard'] as const,
    model: (id: string) => ['analytics', 'models', id] as const,
  },
};
