import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { registryApi } from '../api/services/registryApi';
import { analyticsApi } from '../api/services/analyticsApi';
import VersionList from '../components/registry/VersionList';
import type { Model, ModelMetrics } from '../types';

const ModelDetailPage: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();

  const [model, setModel] = useState<Model | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!modelId) return;

    try {
      setLoading(true);
      setError(null);

      const [modelData, metricsData] = await Promise.all([
        registryApi.getModel(modelId),
        analyticsApi.getModelMetrics(modelId).catch(() => null),
      ]);

      setModel(modelData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePublish = async (version: string, publish: boolean) => {
    if (!modelId) return;

    try {
      await registryApi.publishVersion(modelId, version, publish);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update version');
    }
  };

  const handleDelete = async () => {
    if (!modelId || !confirm('Are you sure you want to delete this model?')) return;

    try {
      await registryApi.deleteModel(modelId);
      navigate('/models');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Model not found'}</p>
        <button
          onClick={() => navigate('/models')}
          className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
        >
          Back to Models
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate('/models')}
          className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Models
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{model.name}</h1>
            {model.description && (
              <p className="text-slate-400 text-sm mb-4">{model.description}</p>
            )}
            <p className="text-xs text-slate-500">
              Created: {new Date(model.created_at).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-400 border border-red-800 rounded-lg hover:bg-red-900/20 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Downloads</p>
            <p className="text-2xl font-bold text-white">{metrics.total_downloads}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Inferences</p>
            <p className="text-2xl font-bold text-white">{metrics.inference_stats.total_inferences}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Avg Latency</p>
            <p className="text-2xl font-bold text-white">
              {metrics.inference_stats.avg_latency_ms
                ? `${metrics.inference_stats.avg_latency_ms.toFixed(1)}ms`
                : '-'}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Active Devices</p>
            <p className="text-2xl font-bold text-white">{metrics.active_devices}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Versions</h2>
        <VersionList
          versions={model.versions}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
};

export default ModelDetailPage;
