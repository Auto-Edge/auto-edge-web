import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProcessingStateProps {
  status: string | null;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ status }) => {
  return (
    <div className="py-8 text-center">
      <LoadingSpinner className="mx-auto mb-3" />
      <p className="text-slate-400 text-sm">{status || 'Processing'}...</p>
    </div>
  );
};

export default ProcessingState;
