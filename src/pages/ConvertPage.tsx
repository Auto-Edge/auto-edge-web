import React, { useState, useCallback, useEffect } from 'react';

import ErrorBoundary from '../components/common/ErrorBoundary';
import { JobCard } from '../components/job/JobCard';
import { PersistedJobCard } from '../components/job/PersistedJobCard';
import JobGrid from '../components/features/JobGrid';
import AddJobButton from '../components/features/AddJobButton';
import { conversionApi } from '../api/services/conversionApi';
import type { Job, Conversion } from '../types';

const generateId = (): string =>
  `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const ConvertPage: React.FC = () => {
  // Ephemeral jobs (before conversion starts)
  const [newJobs, setNewJobs] = useState<Job[]>([]);

  // Persisted conversions (fetched from backend)
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch persisted conversions on mount
  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await conversionApi.listConversions(20);
      setConversions(response.conversions);
    } catch (err) {
      console.error('Failed to fetch conversions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addJob = useCallback(() => {
    setNewJobs((prev) => [...prev, { id: generateId() }]);
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setNewJobs((prev) => prev.filter((job) => job.id !== jobId));
  }, []);

  // Called when a new job starts conversion (becomes persisted)
  const onJobStarted = useCallback((_conversionId: string) => {
    // Refresh the conversions list to include the new one
    fetchConversions();
  }, [fetchConversions]);

  const removeConversion = useCallback(async (conversionId: string) => {
    try {
      await conversionApi.deleteConversion(conversionId);
      
      // Fix: Ensure both IDs are compared as strings to avoid type mismatches
      setConversions((prev) => 
        prev.filter((c) => String(c.id) !== String(conversionId))
      );
    } catch (err) {
      console.error('Failed to delete conversion:', err);
    }
  }, []);

  const refreshConversion = useCallback(async (conversionId: string) => {
    try {
      const updated = await conversionApi.getConversion(conversionId);
      setConversions((prev) =>
        prev.map((c) => (c.id === conversionId ? updated : c))
      );
    } catch (err) {
      console.error('Failed to refresh conversion:', err);
    }
  }, []);

  // Show add button if no jobs exist
  // Future: const showAddButton = newJobs.length === 0 && conversions.length === 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Convert Models</h1>
        <p className="page-description">
          Convert PyTorch models to CoreML with FP16 quantization.
        </p>
      </div>

      <ErrorBoundary>
        {loading ? (
          <div className="loading-center-sm">
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <JobGrid>
            {/* Persisted conversions */}
            {conversions.map((conversion) => (
              <PersistedJobCard
                key={conversion.id}
                conversion={conversion}
                onRemove={() => removeConversion(conversion.id)}
                onRefresh={() => refreshConversion(conversion.id)}
              />
            ))}

            {/* New jobs (not yet started) */}
            {newJobs.map((job) => (
              <JobCard
                key={job.id}
                jobId={job.id}
                onRemove={removeJob}
                onStarted={onJobStarted}
              />
            ))}

            {/* Add button */}
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
