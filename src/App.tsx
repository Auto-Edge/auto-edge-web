import React, { useState, useCallback } from 'react';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import { JobCard } from './components/job/JobCard';
import JobGrid from './components/features/JobGrid';
import AddJobButton from './components/features/AddJobButton';
import type { Job } from './types';

const generateId = (): string =>
  `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([{ id: generateId() }]);

  const addJob = useCallback(() => {
    setJobs((prev) => [...prev, { id: generateId() }]);
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setJobs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((job) => job.id !== jobId);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-slate-400 text-sm">
            Convert PyTorch models to CoreML with FP16 quantization.
          </p>
        </div>

        <ErrorBoundary>
          <JobGrid>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                jobId={job.id}
                onRemove={removeJob}
              />
            ))}
            <AddJobButton onClick={addJob} />
          </JobGrid>
        </ErrorBoundary>

        <p className="text-slate-600 text-xs mt-8">
          Scale workers: <code className="text-slate-500">docker-compose up --scale worker=3</code>
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default App;
