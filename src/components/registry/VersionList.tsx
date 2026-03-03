import React from 'react';
import type { ModelVersion } from '../../types';
import PublishButton from './PublishButton';

interface VersionListProps {
  versions: ModelVersion[];
  onPublish: (version: string, publish: boolean) => void;
}

const formatBytes = (bytes: number | null): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const VersionList: React.FC<VersionListProps> = ({ versions, onPublish }) => {
  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-10 h-10 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p className="text-slate-400 text-sm">No versions yet.</p>
        <p className="text-slate-500 text-xs mt-1">
          Convert a model and add it as a version.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase">
            <th className="pb-3 font-medium">Version</th>
            <th className="pb-3 font-medium">Precision</th>
            <th className="pb-3 font-medium">Size</th>
            <th className="pb-3 font-medium">Downloads</th>
            <th className="pb-3 font-medium">Created</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {versions.map((version) => (
            <tr key={version.id} className="border-t border-slate-800">
              <td className="py-3">
                <span className="font-medium text-white">{version.version}</span>
              </td>
              <td className="py-3 text-slate-400">{version.precision}</td>
              <td className="py-3 text-slate-400">{formatBytes(version.file_size_bytes)}</td>
              <td className="py-3 text-slate-400">{version.download_count}</td>
              <td className="py-3 text-slate-400">
                {new Date(version.created_at).toLocaleDateString()}
              </td>
              <td className="py-3">
                <PublishButton
                  isPublished={version.is_published}
                  onClick={() => onPublish(version.version, !version.is_published)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VersionList;
