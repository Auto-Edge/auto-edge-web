import React, { useState, useCallback } from 'react';
import { useUploadModel, useStartDemo, useConversionStatus } from '../../hooks/api/useConversions';
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
  const { file, error: fileError, selectFile, setError } = useFileUpload();

  const upload = useUploadModel();
  const startDemo = useStartDemo();
  const statusQuery = useConversionStatus(taskId);

  const status = statusQuery.data?.status ?? null;
  const result = statusQuery.data?.result ?? null;
  const isComplete = statusQuery.data?.isComplete ?? false;
  const isFailed = statusQuery.data?.isFailed ?? false;
  const isPolling = statusQuery.data?.isPolling ?? false;

  const error = fileError || (upload.error?.message ?? null) || (startDemo.error?.message ?? null);
  const isProcessing = isPolling && !isComplete && !isFailed;

  const displayStatus = isComplete ? 'Complete' : isFailed ? 'Failed' : status;

  const handleUpload = useCallback(() => {
    if (!file) return;

    upload.mutate(file, {
      onSuccess: (data) => {
        setTaskId(data.task_id);
        selectFile(null);
        if (onStarted) {
          onStarted(data.conversion_id);
          onRemove(jobId);
        }
      },
    });
  }, [file, upload, selectFile, onStarted, onRemove, jobId]);

  const handleDemo = useCallback(() => {
    startDemo.mutate(undefined, {
      onSuccess: (data) => {
        setTaskId(data.task_id);
        if (onStarted) {
          onStarted(data.conversion_id);
          onRemove(jobId);
        }
      },
    });
  }, [startDemo, onStarted, onRemove, jobId]);

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
            isUploading={upload.isPending}
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
