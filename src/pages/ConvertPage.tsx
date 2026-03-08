import React, { useState, useCallback } from 'react';

import ErrorBoundary from '../components/common/ErrorBoundary';
import { JobCard } from '../components/job/JobCard';
import { PersistedJobCard } from '../components/job/PersistedJobCard';
import JobGrid from '../components/features/JobGrid';
import AddJobButton from '../components/features/AddJobButton';
import { useConversions, useDeleteConversion } from '../hooks/api/useConversions';
import type { Job } from '../types';

const generateId = (): string =>
  `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const ConvertPage: React.FC = () => {
  const [newJobs, setNewJobs] = useState<Job[]>([]);

  const { data, isLoading } = useConversions(20);
  const conversions = data?.conversions ?? [];
  const deleteConversion = useDeleteConversion();

  const addJob = useCallback(() => {
    setNewJobs((prev) => [...prev, { id: generateId() }]);
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setNewJobs((prev) => prev.filter((job) => job.id !== jobId));
  }, []);

  // Called when a new job starts conversion (becomes persisted)
  // TanStack Query auto-invalidates via useUploadModel/useStartDemo onSuccess
  const onJobStarted = useCallback((_conversionId: string) => {
    // no-op: query invalidation handles the refresh
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Convert Models</h1>
        <p className="page-description">
          Convert PyTorch models to CoreML with FP16 quantization.
        </p>
      </div>

      <ErrorBoundary>
        {isLoading ? (
          <div className="loading-center-sm">
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <JobGrid>
            {conversions.map((conversion) => (
              <PersistedJobCard
                key={conversion.id}
                conversion={conversion}
                onRemove={() => deleteConversion.mutate(conversion.id)}
              />
            ))}

            {newJobs.map((job) => (
              <JobCard
                key={job.id}
                jobId={job.id}
                onRemove={removeJob}
                onStarted={onJobStarted}
              />
            ))}

            <AddJobButton onClick={addJob} />
          </JobGrid>
        )}
      </ErrorBoundary>

      <p className="helper-text">
        Scale workers: <code>docker-compose up --scale worker=3</code>
      </p>
    </div>
  );
};

export default ConvertPage;
