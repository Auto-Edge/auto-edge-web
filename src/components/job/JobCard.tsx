import React, { useState, useCallback } from 'react';
import { useJobPolling } from '../../hooks/useJobPolling';
import { useFileUpload } from '../../hooks/useFileUpload';
import { conversionApi } from '../../api/services/conversionApi';

import JobCardHeader from './JobCardHeader';
import FileDropZone from './FileDropZone';
import ProcessingState from './ProcessingState';
import ResultsDisplay from './ResultsDisplay';
import ActionButtons from './ActionButtons';
import RegisterModelModal from './RegisterModelModal';
import ErrorMessage from '../common/ErrorMessage';

interface JobCardProps {
  jobId: string;
  onRemove: (jobId: string) => void;
  onStarted?: (conversionId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ jobId, onRemove, onStarted }) => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { file, isUploading, error: uploadError, selectFile, setError } = useFileUpload();
  const { status, result, error: pollingError, isPolling } = useJobPolling(taskId);

  const error = uploadError || pollingError;
  const isComplete = result?.status === 'success';
  const isFailed = status === 'Failed' || !!error;
  const isProcessing = isPolling && !isComplete && !isFailed;

  const displayStatus = isComplete ? 'Complete' : isFailed ? 'Failed' : status;

  const handleUpload = useCallback(async () => {
    if (!file) return;

    try {
      const data = await conversionApi.uploadModel(file);
      setTaskId(data.task_id);
      selectFile(null);
      // Notify parent that conversion started (now persisted)
      if (onStarted) {
        onStarted(data.conversion_id);
        onRemove(jobId); // Remove this ephemeral job card
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Upload failed');
    }
  }, [file, selectFile, setError, onStarted, onRemove, jobId]);

  const handleDemo = useCallback(async () => {
    try {
      const data = await conversionApi.startDemoConversion();
      setTaskId(data.task_id);
      // Notify parent that conversion started (now persisted)
      if (onStarted) {
        onStarted(data.conversion_id);
        onRemove(jobId); // Remove this ephemeral job card
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Demo request failed');
    }
  }, [setError, onStarted, onRemove, jobId]);

  const handleDownload = useCallback(() => {
    if (result?.output_file) {
      conversionApi.downloadModel(result.output_file);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    selectFile(null);
    setTaskId(null);
    setError(null);
  }, [selectFile, setError]);

  return (
    <div className="job-card">
      <JobCardHeader
        status={displayStatus}
        onRemove={() => onRemove(jobId)}
      />

      <ErrorMessage message={error} />

      {!taskId && !isComplete && (
        <>
          <FileDropZone
            file={file}
            onFileSelect={selectFile}
            onError={setError}
          />
          <ActionButtons
            file={file}
            isUploading={isUploading}
            onUpload={handleUpload}
            onDemo={handleDemo}
          />
        </>
      )}

      {isProcessing && <ProcessingState status={status} />}

      {isComplete && result && (
        <>
          <ResultsDisplay result={result} />
          <ActionButtons
            isComplete={true}
            onDownload={handleDownload}
            onReset={handleReset}
            onRegister={() => setShowRegisterModal(true)}
          />
        </>
      )}

      {showRegisterModal && result && (
        <RegisterModelModal
          result={result}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
};

export default JobCard;
