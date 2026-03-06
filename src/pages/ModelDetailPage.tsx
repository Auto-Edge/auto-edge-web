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
      <div className="loading-center">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="empty-state">
        <p className="text-red-400 mb-4">{error || 'Model not found'}</p>
        <button
          onClick={() => navigate('/models')}
          className="btn btn-secondary"
        >
          Back to Models
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => navigate('/models')}
          className="back-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Models
        </button>

        <div className="model-detail-header">
          <div>
            <h1 className="page-title">{model.name}</h1>
            {model.description && (
              <p className="page-description mb-4">{model.description}</p>
            )}
            <p className="model-detail-meta">
              Created: {new Date(model.created_at).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleDelete}
            className="btn btn-danger-outline"
          >
            Delete
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 grid-md-cols-4 gap-4 mb-8">
          <div className="card card-sm">
            <p className="metrics-card-header">Downloads</p>
            <p className="metrics-card-value">{metrics.total_downloads}</p>
          </div>
          <div className="card card-sm">
            <p className="metrics-card-header">Inferences</p>
            <p className="metrics-card-value">{metrics.inference_stats.total_inferences}</p>
          </div>
          <div className="card card-sm">
            <p className="metrics-card-header">Avg Latency</p>
            <p className="metrics-card-value">
              {metrics.inference_stats.avg_latency_ms
                ? `${metrics.inference_stats.avg_latency_ms.toFixed(1)}ms`
                : '-'}
            </p>
          </div>
          <div className="card card-sm">
            <p className="metrics-card-header">Active Devices</p>
            <p className="metrics-card-value">{metrics.active_devices}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Versions</h2>
        <VersionList
          versions={model.versions}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
};

export default ModelDetailPage;
