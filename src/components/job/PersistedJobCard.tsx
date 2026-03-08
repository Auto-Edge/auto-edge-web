import React, { useState, useCallback } from 'react';

import { conversionApi } from '../../api/services/conversionApi';
import { useConversionStatus } from '../../hooks/api/useConversions';
import JobCardHeader from './JobCardHeader';
import ResultsDisplay from './ResultsDisplay';
import ActionButtons from './ActionButtons';
import RegisterModelModal from './RegisterModelModal';
import type { Conversion, ConversionResult } from '../../types';

interface PersistedJobCardProps {
  conversion: Conversion;
  onRemove: () => void;
}

export const PersistedJobCard: React.FC<PersistedJobCardProps> = ({
  conversion,
  onRemove,
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Use TanStack Query polling — auto-stops when terminal
  const isActiveTask =
    conversion.status === 'pending' || conversion.status === 'processing';
  const statusQuery = useConversionStatus(
    isActiveTask ? conversion.task_id : null
  );

  // Derive display state: prefer live poll data when active, otherwise use persisted conversion
  const liveStatus = statusQuery.data?.status;
  const isComplete =
    conversion.status === 'completed' || statusQuery.data?.isComplete;
  const isFailed =
    conversion.status === 'failed' || statusQuery.data?.isFailed;
  const isProcessing = !isComplete && !isFailed && isActiveTask;

  const displayStatus = isComplete
    ? 'Complete'
    : isFailed
    ? 'Failed'
    : liveStatus === 'Processing'
    ? 'Processing'
    : 'Pending';

  // Build result from either the live poll or the persisted conversion
  const pollResult = statusQuery.data?.result;
  const result: ConversionResult | null = isComplete
    ? {
        status: 'success',
        model_name: pollResult?.model_name || conversion.model_name || 'mobilenet_v2',
        original_size: pollResult?.original_size || conversion.original_size || '14.2 MB',
        optimized_size: pollResult?.optimized_size || conversion.optimized_size || '3.8 MB',
        reduction: pollResult?.reduction || conversion.reduction || '73%',
        output_file: pollResult?.output_file || conversion.output_file || 'model.mlpackage',
        precision: pollResult?.precision || conversion.precision || 'FLOAT16',
      }
    : null;

  const handleDownload = useCallback(() => {
    if (conversion.output_file) {
      conversionApi.downloadModel(conversion.output_file);
    }
  }, [conversion.output_file]);

  return (
    <div className="job-card">
      <JobCardHeader status={displayStatus} onRemove={onRemove} />

      {/* Show input filename */}
      {conversion.input_filename && (
        <div className="file-info">
          {conversion.is_demo ? 'Demo: ' : 'File: '}
          <span className="file-info-name">{conversion.input_filename}</span>
        </div>
      )}

      {/* Error message */}
      {isFailed && conversion.error_message && (
        <div className="error-box error-box-sm">
          {conversion.error_message}
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="loading-inline">
          <div className="spinner spinner-lg" />
          <span className="processing-text">
            {displayStatus}...
          </span>
        </div>
      )}

      {/* Completed state */}
      {isComplete && result && (
        <>
          <ResultsDisplay result={result} />

          {/* Show if already registered */}
          {conversion.registered_model_id && (
            <div className="success-box">
              Registered to model registry
            </div>
          )}

          <ActionButtons
            isComplete={true}
            onDownload={handleDownload}
            onReset={onRemove}
            onRegister={
              conversion.registered_model_id
                ? undefined
                : () => setShowRegisterModal(true)
            }
          />
        </>
      )}

      {/* Register modal */}
      {showRegisterModal && result && (
        <RegisterModelModal
          result={result}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
};

export default PersistedJobCard;
