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
      <div className="empty-state">
        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p className="empty-state-text">No versions yet.</p>
        <p className="empty-state-subtext">
          Convert a model and add it as a version.
        </p>
      </div>
    );
  }

  return (
    <div className="version-list">
      <table className="version-table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Precision</th>
            <th>Size</th>
            <th>Downloads</th>
            <th>Created</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((version) => (
            <tr key={version.id}>
              <td>
                <span className="version-name">{version.version}</span>
              </td>
              <td className="version-text">{version.precision}</td>
              <td className="version-text">{formatBytes(version.file_size_bytes)}</td>
              <td className="version-text">{version.download_count}</td>
              <td className="version-text">
                {new Date(version.created_at).toLocaleDateString()}
              </td>
              <td>
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
