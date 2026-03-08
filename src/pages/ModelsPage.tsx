import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ModelCard from '../components/registry/ModelCard';
import { useModels, useCreateModel } from '../hooks/api/useRegistry';

const ModelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useModels();
  const models = data?.models ?? [];
  const createModel = useCreateModel();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    createModel.mutate(
      {
        name: newModelName.trim(),
        description: newModelDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewModelName('');
          setNewModelDescription('');
        },
      }
    );
  };

  const handleModelClick = (modelId: string) => {
    navigate(`/models/${modelId}`);
  };

  return (
    <div>
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">Model Registry</h1>
          <p className="page-description">
            Manage your ML models and versions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Model
        </button>
      </div>

      {error && (
        <div className="error-box">
          <p>{error instanceof Error ? error.message : 'Failed to load models'}</p>
        </div>
      )}

      {isLoading ? (
        <div className="loading-center">
          <div className="spinner spinner-lg" />
        </div>
      ) : models.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="empty-state-text">No models yet. Create your first model to get started.</p>
        </div>
      ) : (
        <div className="job-grid">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onClick={() => handleModelClick(model.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Create New Model</h2>

            <form onSubmit={handleCreateModel}>
              <div className="form-group">
                <label className="form-label">
                  Model Name
                </label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., MobileNetV2"
                  autoFocus
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label">
                  Description (optional)
                </label>
                <textarea
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  className="form-input form-textarea"
                  placeholder="A brief description of the model..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary btn-flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newModelName.trim() || createModel.isPending}
                  className="btn btn-primary btn-flex-1"
                >
                  {createModel.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelsPage;
