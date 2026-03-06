import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registryApi } from '../../api/services/registryApi';
import type { ConversionResult } from '../../types';

interface RegisterModelModalProps {
  result: ConversionResult;
  onClose: () => void;
}

const RegisterModelModal: React.FC<RegisterModelModalProps> = ({ result, onClose }) => {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState(result.model_name || '');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim() || !result.output_file) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Create the model
      const model = await registryApi.createModel({
        name: modelName.trim(),
        description: description.trim() || undefined,
      });

      // Add the version with the converted file
      await registryApi.createVersion(model.id, {
        version: version.trim(),
        file_path: result.output_file,
        precision: result.precision || 'FLOAT16',
      });

      // Navigate to the model detail page
      navigate(`/models/${model.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register model');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Register to Model Registry</h2>

        {error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Model Name
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="form-input"
              placeholder="e.g., MobileNetV2"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="form-input"
              placeholder="e.g., 1.0.0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input form-textarea"
              placeholder="A brief description of the model..."
              rows={2}
            />
          </div>

          <div className="form-info-box">
            <p className="form-info-label">File</p>
            <p className="form-info-value">{result.output_file}</p>
            <div className="form-info-meta">
              <span>Size: {result.optimized_size}</span>
              <span>Precision: {result.precision || 'FLOAT16'}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!modelName.trim() || !version.trim() || isSubmitting}
              className="btn btn-primary btn-flex-1"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModelModal;
