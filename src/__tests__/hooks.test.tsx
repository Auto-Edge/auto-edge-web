import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { server } from './mocks/server';
import { fixtures } from './mocks/handlers';
import { useConversions, useConversionStatus } from '../hooks/api/useConversions';
import { useModels, useModel } from '../hooks/api/useRegistry';
import { useDashboardSummary, useModelMetrics } from '../hooks/api/useAnalytics';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useConversions', () => {
  it('fetches conversion list', async () => {
    const { result } = renderHook(() => useConversions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.conversions).toHaveLength(1);
    expect(result.current.data?.conversions[0].id).toBe(fixtures.conversion.id);
  });
});

describe('useConversionStatus', () => {
  it('returns null-safe defaults when taskId is null', () => {
    const { result } = renderHook(() => useConversionStatus(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(false);
  });

  it('fetches status when taskId provided', async () => {
    const { result } = renderHook(() => useConversionStatus('task-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.isComplete).toBe(true);
    expect(result.current.data?.result?.model_name).toBe('mobilenet_v2');
  });
});

describe('useModels', () => {
  it('fetches model list', async () => {
    const { result } = renderHook(() => useModels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.models).toHaveLength(1);
    expect(result.current.data?.models[0].name).toBe('MobileNetV2');
  });
});

describe('useModel', () => {
  it('fetches model detail', async () => {
    const { result } = renderHook(() => useModel('model-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('MobileNetV2');
    expect(result.current.data?.versions).toHaveLength(1);
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useModel(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useDashboardSummary', () => {
  it('fetches dashboard data', async () => {
    const { result } = renderHook(() => useDashboardSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total_models).toBe(5);
    expect(result.current.data?.total_inferences).toBe(10500);
  });
});

describe('useModelMetrics', () => {
  it('fetches model metrics', async () => {
    const { result } = renderHook(() => useModelMetrics('model-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total_downloads).toBe(42);
    expect(result.current.data?.inference_stats.avg_latency_ms).toBe(12.5);
  });
});
