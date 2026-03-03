import React from 'react';
import type { Model } from '../../types';

interface ModelCardProps {
  model: Model;
  onClick: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  const versionCount = model.versions.length;
  const publishedCount = model.versions.filter((v) => v.is_published).length;
  const latestVersion = model.versions[0]?.version;
  const totalDownloads = model.versions.reduce((sum, v) => sum + v.download_count, 0);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white">{model.name}</h3>
        {latestVersion && (
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
            v{latestVersion}
          </span>
        )}
      </div>

      {model.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{model.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {versionCount} version{versionCount !== 1 ? 's' : ''}
        </span>

        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {publishedCount} published
        </span>

        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {totalDownloads}
        </span>
      </div>
    </button>
  );
};

export default ModelCard;
