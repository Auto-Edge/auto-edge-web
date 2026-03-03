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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-white mb-4">Register to Model Registry</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Model Name
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g., MobileNetV2"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g., 1.0.0"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="A brief description of the model..."
              rows={2}
            />
          </div>

          <div className="mb-6 p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">File</p>
            <p className="text-sm text-white font-mono truncate">{result.output_file}</p>
            <div className="flex gap-4 mt-2 text-xs text-slate-400">
              <span>Size: {result.optimized_size}</span>
              <span>Precision: {result.precision || 'FLOAT16'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!modelName.trim() || !version.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
