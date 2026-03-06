import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProcessingStateProps {
  status: string | null;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ status }) => {
  return (
    <div className="processing-state">
      <LoadingSpinner className="spinner-center" />
      <p className="processing-text">{status || 'Processing'}...</p>
    </div>
  );
};

export default ProcessingState;
