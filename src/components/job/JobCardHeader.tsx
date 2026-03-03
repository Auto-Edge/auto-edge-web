import React from 'react';
import StatusBadge from '../common/StatusBadge';

interface JobCardHeaderProps {
  status: string | null;
  onRemove: () => void;
}

export const JobCardHeader: React.FC<JobCardHeaderProps> = ({ status, onRemove }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <StatusBadge status={status} />
      <button
        onClick={onRemove}
        className="text-slate-600 hover:text-slate-400 transition-colors"
        title="Remove"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default JobCardHeader;
