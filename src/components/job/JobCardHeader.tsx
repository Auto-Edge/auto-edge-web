import React from 'react';
import StatusBadge from '../common/StatusBadge';

interface JobCardHeaderProps {
  status: string | null;
  onRemove: () => void;
}

export const JobCardHeader: React.FC<JobCardHeaderProps> = ({ status, onRemove }) => {
  return (
    <div className="job-card-header">
      <StatusBadge status={status} />
      <button
        onClick={onRemove}
        className="btn-icon"
        title="Remove"
      >
        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default JobCardHeader;
